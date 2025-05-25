// app/api/save-post/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, factId, content, version } = body;

    if (!userId || !factId || !content || version === undefined) {
      return NextResponse.json({ error: '必要なフィールドが不足しています' }, { status: 400 });
    }

    const saved = await prisma.post.create({
      data: {
        userId,
        factId,
        content,
        version,
        edited: false,
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('❌ ポスト保存エラー:', error);
    return NextResponse.json({ error: 'ポスト保存に失敗しました' }, { status: 500 });
  }
}