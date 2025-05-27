// /app/api/posts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { RouteHandlerContext } from 'next/dist/server/future/route-modules/app-route/module';

export async function PATCH(req: NextRequest, context: RouteHandlerContext) {
  try {
    const { isPosted } = await req.json();

    const updatedPost = await prisma.post.update({
      where: { id: context.params.id },
      data: { isPosted },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('❌ 投稿更新エラー:', error);
    return NextResponse.json({ error: '投稿更新に失敗しました' }, { status: 500 });
  }
}