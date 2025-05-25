// /app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId'); // クエリパラメータからuserIdを取得

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const posts = await prisma.post.findMany({
      where: { userId }, // 取得したuserIdを使用してフィルタリング
      orderBy: { createdAt: 'desc' },
      include: {
        fact: true, // 元ネタのテキスト・タグを取得
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('❌ 投稿取得エラー:', error);
    return NextResponse.json({ error: '投稿取得に失敗しました' }, { status: 500 });
  }
}