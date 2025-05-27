"use client";
import { useState } from "react";
import { availableTags } from "@/components/constants/tags";

type FactFormProps = {
  userId: string; // 追加されたプロパティ
  onSubmitSuccess: () => void;
};

export default function FactForm({ userId, onSubmitSuccess }: FactFormProps) {
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      console.error("❌ ユーザーIDがありません");
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
      setText("");
      setSelectedTags([]);
      console.log("✅ 投稿成功");
      onSubmitSuccess();
    } else {
      console.error("❌ 投稿失敗");
    }
  };

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