import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 登録済みネタの一覧取得
// GET: 登録済みネタの一覧取得
export async function GET(req: NextRequest) {
  try {
    // リクエストの userId を取得
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId'); // クエリパラメータからuserIdを取得
    console.log("📦 受信した userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // userId に基づいてデータを取得
    const facts = await prisma.fact.findMany({
      where: {
        userId: userId, // フロントから送られてきた userId を使用
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        text: true,
        tags: true,
        createdAt: true,
      },
    });

    // 受け取ったネタをコンソールに表示
    facts.forEach((fact) => {
      console.log(`📄 Neat Text: ${fact.text}, Tags: ${fact.tags}`);
    });

    // 結果を返却
    return NextResponse.json(facts);
  } catch (error) {
    console.error("❌ 一覧取得エラー:", error);
    return NextResponse.json({ error: 'Error fetching facts' }, { status: 500 });
  }
}

// POST: 新規作成
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📦 受信したリクエストボディ:", body);

    // リクエストの userId を取得
    const { userId, text, tags } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!text || !tags) {
      console.warn("⚠️ フィールド不足:", { text, tags });
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // DBに新しいデータを挿入
    const newFact = await prisma.fact.create({
      data: {
        userId, // フロントから送られてきた userId を使用
        text,
        tags,
      },
    });

    console.log("✅ 新規登録成功:", newFact);
    return NextResponse.json(newFact, { status: 201 });
  } catch (error) {
    console.error("❌ 投稿エラー:", error);
    return NextResponse.json({ error: 'Error creating fact' }, { status: 500 });
  }
}