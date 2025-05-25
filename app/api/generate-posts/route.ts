import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildPrompt } from '@/lib/promptBuilder';  // プロンプト作成
import { buildRegeneratePrompt } from '@/lib/regeneratePrompt'; // 再生成プロンプト作成
import { validatePostContent } from '@/lib/validation'; // 投稿内容のロジック評価

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { factId, postCount = 1, userId } = body;  // ユーザーIDもリクエストで受け取る

    if (!factId || !userId) {
      return NextResponse.json({ error: 'factId と userId が必要です' }, { status: 400 });
    }

    // ユーザーIDに基づいてユーザー設定を取得
    const fact = await prisma.fact.findUnique({
      where: { id: factId },
      include: { user: { include: { settings: true } } },
    });

    // ユーザー設定が見つからない場合のエラーハンドリング
    if (!fact || !fact.user || fact.user.id !== userId || !fact.user.settings) {
      return NextResponse.json({ error: '該当するユーザー設定が見つかりません' }, { status: 404 });
    }

    const setting = fact.user.settings;

    // 投稿生成プロンプトの作成
    const promptInput = {
      activityType: setting.activityType,
      activityDetail: setting.activityDetail,
      goal: setting.goal,
      targetAudience: setting.targetAudience,
      preferredTone: setting.preferredTone,
      postIdea: fact.text,
      tags: fact.tags ? fact.tags.split(',').map((tag) => tag.trim()) : [],
      postCount,
    };
    const prompt = buildPrompt(promptInput);
    console.log('📤 投稿生成プロンプト:', prompt); // 生成された投稿プロンプトをコンソールに表示

    // 初回生成の投稿作成
    let generatedText = '';
    let response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ OpenAI応答エラー:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    const data = await response.json();
    generatedText = data.choices?.[0]?.message?.content ?? '';
    console.log('📤 最初の生成された投稿:', generatedText); // 生成された投稿をコンソールに表示

    let regenerateCount = 0; // 再生成回数を追跡
    let errors = [];
    let suggestions = [];

    // 初回生成を評価
    ({ errors, suggestions } = validatePostContent(generatedText));
    console.log('📤 投稿評価エラー:', errors); // エラー内容を表示
    console.log('📤 投稿評価サジェッション:', suggestions); // サジェッションを表示

    // 再生成のループ
    let finalGeneratedText = generatedText; // 最後に生成された投稿
    while (errors.length > 0 && regenerateCount < 2) {
      const regeneratePrompt = buildRegeneratePrompt(
        finalGeneratedText,  // 再生成の投稿を渡す
        suggestions,         
      );
      console.log('📤 再生成プロンプト:', regeneratePrompt); // 再生成プロンプトをコンソールに表示

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'user', content: regeneratePrompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ 再生成APIエラー:', error);
        return NextResponse.json({ error }, { status: 500 });
      }

      console.log('📤 再生成前の finalGeneratedText:', finalGeneratedText);
      const regenerateData = await response.json();
      finalGeneratedText = regenerateData.choices?.[0]?.message?.content ?? '';
      console.log('📤 再生成された投稿:', finalGeneratedText); // 再生成された投稿をコンソールに表示

      // 再評価
      ({ errors, suggestions } = validatePostContent(finalGeneratedText));
      console.log('📤 再生成後の投稿評価エラー:', errors);
      console.log('📤 再生成後の投稿評価サジェッション:', suggestions);

      regenerateCount++;
    }

    console.log('📤 最終的に生成された投稿:', finalGeneratedText);
    // 最終的に生成された投稿をフロントに返す（評価OKまたは再生成された投稿）
    return NextResponse.json({ posts: finalGeneratedText }); // 最後に生成された投稿を文字列として返す
    
  } catch (error) {
    console.error('❌ 投稿生成エラー:', error);
    return NextResponse.json({ error: '投稿生成に失敗しました' }, { status: 500 });
  }
}