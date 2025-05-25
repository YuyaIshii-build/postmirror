// app/middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; // next-authのJWTトークンを取得
import type { NextRequest } from 'next/server'; // NextRequest をインポート

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ログインしていない場合、/loginにリダイレクト
  if (!token && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // ログイン済みの場合、リクエストをそのまま通す
  return NextResponse.next();
}

// このmiddlewareを適用するパスを指定
export const config = {
  matcher: ['/facts', '/generate', '/posts', '/setup'], // 認証が必要なパス
};