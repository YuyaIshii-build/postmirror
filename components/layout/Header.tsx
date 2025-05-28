'use client';

import { LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react'; // useSessionを追加

export default function Header() {
  const { data: session } = useSession(); // セッション情報を取得

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-white">
      {/* ロゴエリア */}
      <div className="text-xl font-bold">PostMirror</div>

      {/* ユーザー情報とログアウト */}
      <div className="flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">ようこそ、{session.user?.name}さん</span>
            <button
              onClick={() => signOut({ callbackUrl: 'https://postmirror-production.up.railway.app/login' })}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-black"
            >
              <LogOut className="w-5 h-5" />
              ログアウト
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
            className="text-sm text-gray-700 hover:text-black"
          >
            ログイン
          </button>
        )}
      </div>
    </header>
  );
}