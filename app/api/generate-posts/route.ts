//app/api/generate-posts/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildPrompt } from '@/lib/promptBuilder';
import { buildRegeneratePrompt } from '@/lib/regeneratePrompt';
import { validatePostContent } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { factId, postCount = 1, userId } = body;

    if (!factId || !userId) {
      return NextResponse.json({ error: 'factId と userId が必要です' }, { status: 400 });
    }

    const fact = await prisma.fact.findUnique({
      where: { id: factId },
      include: { user: { include: { settings: true } } },
    });

    if (!fact || !fact.user || fact.user.id !== userId || !fact.user.settings) {
      return NextResponse.json({ error: '該当するユーザー設定が見つかりません' }, { status: 404 });
    }

    const setting = fact.user.settings;

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
    console.log('📤 投稿生成プロンプト:', prompt);

    let generatedText = '';
    let response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
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
    console.log('📤 最初の生成された投稿:', generatedText);

    let regenerateCount = 0;
    let errors = [];
    let suggestions = [];

    // ✅ 初回評価
    ({ errors, suggestions } = validatePostContent(generatedText, "strict"));
    console.log('📤 投稿評価エラー:', errors);
    console.log('📤 投稿評価サジェッション:', suggestions);

    let finalGeneratedText = generatedText;

    while (errors.length > 0 && regenerateCount < 2) {
      const regeneratePrompt = buildRegeneratePrompt(finalGeneratedText, suggestions);
      console.log('📤 再生成プロンプト:', regeneratePrompt);

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: regeneratePrompt }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ 再生成APIエラー:', error);
        return NextResponse.json({ error }, { status: 500 });
      }

      const regenerateData = await response.json();
      finalGeneratedText = regenerateData.choices?.[0]?.message?.content ?? '';
      console.log('📤 再生成された投稿:', finalGeneratedText);

      // ✅ 再評価
      ({ errors, suggestions } = validatePostContent(finalGeneratedText, "strict"));
      console.log('📤 再生成後の投稿評価エラー:', errors);
      console.log('📤 再生成後の投稿評価サジェッション:', suggestions);

      regenerateCount++;
    }

    console.log('📤 最終的に生成された投稿:', finalGeneratedText);
    return NextResponse.json({ posts: finalGeneratedText });
    
  } catch (error) {
    console.error('❌ 投稿生成エラー:', error);
    return NextResponse.json({ error: '投稿生成に失敗しました' }, { status: 500 });
  }
}