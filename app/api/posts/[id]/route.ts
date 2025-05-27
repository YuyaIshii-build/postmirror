// /app/api/posts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: '投稿IDが見つかりません' }, { status: 400 });
  }

  try {
    const { isPosted } = await req.json();

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { isPosted },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('❌ 投稿更新エラー:', error);
    return NextResponse.json({ error: '投稿更新に失敗しました' }, { status: 500 });
  }
}