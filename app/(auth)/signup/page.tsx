'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !name || !password) {
      toast.error('全ての項目を入力してください');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      if (res.status === 409) {
        const errorData = await res.json();
        toast.error(errorData.error || 'このメールアドレスは既に登録されています');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || '登録に失敗しました');
        return;
      }

      toast.success('登録が完了しました！ログイン中...');

      const loginRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (loginRes?.error) {
        toast.error('ログインに失敗しました');
      } else {
        router.push('/setup');
      }

    } catch (err) {
      toast.error('サーバーエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
        {/* 🔹 テキストロゴ */}
        <div className="text-3xl font-bold text-center text-black">PostMirror</div>

        <h1 className="text-xl font-bold text-center">新規登録</h1>

        <input
          type="text"
          placeholder="ユーザー名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '登録中...' : '登録'}
        </button>

        <p className="text-center text-sm text-gray-600">
          すでにアカウントをお持ちですか？{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            ログインはこちら
          </a>
        </p>
      </div>
    </div>
  );
}