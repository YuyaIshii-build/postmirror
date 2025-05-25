import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt'; // next-authのJWTトークンを取得

// GET: ユーザー設定の取得
export async function GET(req: NextRequest) {
  try {
    // JWTトークンを取得
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: '認証されていないユーザーです' }, { status: 401 });
    }

    const userId = token.sub; // ユーザーIDはJWTトークンのsubに含まれている

    const setting = await prisma.userSetting.findUnique({
      where: { userId },
    });

    if (!setting) {
      return NextResponse.json({ message: '設定が見つかりません' }, { status: 404 });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('❌ 設定取得エラー:', error);
    return NextResponse.json({ error: '設定取得に失敗しました' }, { status: 500 });
  }
}

// POST: ユーザー設定の作成・更新（upsert）
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      activityType,
      activityDetail,
      goal,
      targetAudience,
      preferredTone,
    } = body;

    // JWTトークンを取得
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: '認証されていないユーザーです' }, { status: 401 });
    }

    const userId = token.sub; // ユーザーIDはJWTトークンのsubに含まれている

    // 必須項目チェック（必要に応じて）
    if (!activityType || !goal) {
      return NextResponse.json({ error: '必須フィールドが不足しています' }, { status: 400 });
    }

    const saved = await prisma.userSetting.upsert({
      where: { userId },
      update: {
        activityType,
        activityDetail,
        goal,
        targetAudience,
        preferredTone,
      },
      create: {
        userId,
        activityType,
        activityDetail,
        goal,
        targetAudience,
        preferredTone,
      },
    });

    return NextResponse.json(saved, { status: 200 });
  } catch (error) {
    console.error('❌ 設定保存エラー:', error);
    return NextResponse.json({ error: '設定保存に失敗しました' }, { status: 500 });
  }
}