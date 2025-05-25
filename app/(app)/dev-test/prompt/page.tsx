// app/dev-test/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { prisma } from "@/lib/prisma";
import { buildPrompt } from "@/lib/promptBuilder";

export default function DevPromptPage() {
  const { data: session } = useSession(); // ログインユーザーのセッション情報を取得
  const [prompt, setPrompt] = useState<string | null>(null); // 生成されたプロンプト
  const [loading, setLoading] = useState<boolean>(true); // ローディング状態の管理

  useEffect(() => {
    if (!session?.user?.id) return; // ユーザーIDがない場合は何もしない

    const fetchData = async () => {
      try {
        const userId = session.user.id; // ログイン中のユーザーID
        // 固定ではなく、ログインしているユーザーの設定とネタを取得
        const [setting, fact] = await Promise.all([
          prisma.userSetting.findUnique({ where: { userId } }),
          prisma.fact.findFirst({ where: { userId } }), // 最初のネタを取得（ユーザーに対応するもの）
        ]);

        if (!setting || !fact) {
          setPrompt('❌ 設定またはネタが見つかりませんでした。');
          return;
        }

        // プロンプトを生成
        const generatedPrompt = buildPrompt({
          activityType: setting.activityType,
          activityDetail: setting.activityDetail,
          goal: setting.goal,
          targetAudience: setting.targetAudience,
          preferredTone: setting.preferredTone,
          postIdea: fact.text,
          tags: fact.tags.split(",").map((tag) => tag.trim()),
          postCount: 1,
        });

        setPrompt(generatedPrompt); // 生成されたプロンプトを設定
      } catch (error) {
        setPrompt('❌ プロンプト生成中にエラーが発生しました。');
      } finally {
        setLoading(false); // ローディング完了
      }
    };

    fetchData();
  }, [session]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">生成されたプロンプト</h1>
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">{prompt}</pre>
      )}
    </div>
  );
}