// app/(marketing)/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero セクション */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6 bg-gray-50">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          SNS発信、何を投稿すればいいか分からない？
        </h1>
        <p className="text-lg sm:text-xl max-w-xl mb-8 text-gray-600">
          副業・個人開発者のための、“ネタ切れ”しない発信支援ツール。<br />
          行動ログからAIが投稿を提案します。
        </p>
        <Button asChild size="lg" className="text-lg px-8 py-6">
          <Link href="/signup">無料で始めてみる</Link>
        </Button>
        <p className="mt-4 text-sm text-gray-600">
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" className="text-blue-600 underline hover:text-blue-800">
            ログインはこちら
          </Link>
        </p>
      </section>

      {/* Problem セクション */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">こんな悩み、ありませんか？</h2>
          <ul className="space-y-4 text-lg text-gray-700">
            <li>✔️ 何を投稿すればいいか分からない</li>
            <li>✔️ 発信を習慣化できない</li>
            <li>✔️ 成果に繋がる投稿がどれか分からない</li>
          </ul>
        </div>
      </section>

      {/* Solution セクション */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">PostMirror ができること</h2>
          <div className="space-y-4 text-lg text-gray-700">
            <p>📝 行動ログやアイデアから「投稿ネタ」を抽出</p>
            <p>🤖 AIが複数パターンの投稿案を自動生成</p>
            <p>✅ 採用・非採用で徐々に精度が向上</p>
          </div>
        </div>
      </section>

      {/* How it works セクション */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">使い方はかんたん 3 ステップ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-gray-700 text-left">
            <div>
              <h3 className="text-xl font-semibold mb-2">① ネタを選ぶ</h3>
              <p>行動ログやインプット一覧から、投稿ネタを選びます。</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">② 投稿を生成</h3>
              <p>AIが複数の投稿案を自動生成します。</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">③ 採用・投稿</h3>
              <p>気に入った投稿をそのまま採用＆投稿へ。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-20 px-6 bg-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-6">今すぐ試してみませんか？</h2>
        <p className="text-lg text-gray-700 mb-8">まずは無料で使って、投稿の質と習慣を変えてみましょう。</p>
        <Button asChild size="lg" className="text-lg px-8 py-6">
          <Link href="/signup">無料で始めてみる</Link>
        </Button>
        <p className="mt-4 text-sm text-gray-600">
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" className="text-blue-600 underline hover:text-blue-800">
            ログインはこちら
          </Link>
        </p>
      </section>
    </main>
  );
}