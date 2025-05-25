"use client";
import { useState } from "react";
import { availableTags } from "@/components/constants/tags";
import { useSession } from "next-auth/react";

type FactFormProps = {
  onSubmitSuccess: () => void; // 投稿成功時に親コンポーネントへ通知するコールバック
};

export default function FactForm({ onSubmitSuccess }: FactFormProps) {
  const { data: session } = useSession(); // セッション情報を取得
  const [text, setText] = useState(""); // 投稿するテキスト
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // 選択したタグ

  const userId = session?.user?.id; // ユーザーID

  // タグをトグルする関数
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // フォームの送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ログインしていない場合はエラーを出力
    if (!userId) {
      console.error("❌ ログインしていません");
      return;
    }

    const res = await fetch("/api/facts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        text,
        tags: selectedTags.join(","),
      }),
    });

    if (res.ok) {
      // 投稿成功したらフォームをリセットし、親コンポーネントに通知
      setText(""); // テキスト入力欄をリセット
      setSelectedTags([]); // タグ選択をリセット
      console.log("✅ 投稿成功");
      onSubmitSuccess(); // 親コンポーネントに通知
    } else {
      console.error("❌ 投稿失敗");
    }
  };

  // ユーザーがログインしていない場合はメッセージを表示
  if (!userId) {
    return <p>ログインしてください</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
      <textarea
        className="w-full p-2 border rounded"
        placeholder="例：朝のタスク整理で「緊急じゃないが重要な仕事」に気づいた"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <div>
        <p className="mb-2 text-sm text-gray-600">ネタにタグを付与する（複数選択可）</p>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`px-3 py-1 rounded border ${
                selectedTags.includes(tag)
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        type="submit"
      >
        登録
      </button>
    </form>
  );
}