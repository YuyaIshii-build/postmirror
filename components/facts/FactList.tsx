"use client";
import { useState } from "react";
import { availableTags } from "@/components/constants/tags"; // availableTags をインポート

type Fact = {
  id: string;
  text: string;
  tags: string;
  createdAt: string;
};

type FactListProps = {
  facts: Fact[]; // 親コンポーネントから渡されるネタ一覧
  loading: boolean; // ローディング状態
  onFactsUpdate: (facts: Fact[]) => void; // 親コンポーネントにデータ更新を通知する関数
};

export default function FactList({ facts, loading, onFactsUpdate }: FactListProps) {
  const [editingId, setEditingId] = useState<string | null>(null); // 編集中のネタID
  const [editText, setEditText] = useState<string>(''); // 編集中のテキスト
  const [editTags, setEditTags] = useState<string[]>([]); // 編集中のタグ
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null); // メニューが開いているネタのID

  // 編集ボタンをクリックしたときの処理
  const handleEditStart = (fact: Fact) => {
    setEditText(fact.text);
    setEditTags(fact.tags.split(',').map((t) => t.trim()));
    setEditingId(fact.id); // 編集モードにする
    setMenuOpenId(null); // メニューを閉じる
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
    setEditTags([]);
  };

  const handleEditSave = async (id: string) => {
    try {
      const res = await fetch(`/api/facts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText, tags: editTags.join(',') }),
      });

      if (res.ok) {
        const updated = await res.json();
        onFactsUpdate(
          facts.map((fact) => (fact.id === id ? updated : fact))
        );
        setEditingId(null); // 編集モードを終了
      } else {
        console.error("❌ 更新に失敗しました");
      }
    } catch (err) {
      console.error("❌ 更新エラー:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const res = await fetch(`/api/facts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onFactsUpdate(facts.filter((fact) => fact.id !== id));
        console.log("✅ 削除成功");
      } else {
        console.error("❌ 削除に失敗しました");
      }
    } catch (err) {
      console.error("❌ 削除エラー:", err);
    }
  };

  if (loading) return <p>読み込み中...</p>;

  if (!Array.isArray(facts) || facts.length === 0) return <p>まだネタがありません。</p>;

  return (
    <ul>
      {facts.map((fact) => (
        <li key={fact.id} className="p-4 border rounded mb-2 relative">
          {/* 3点メニュー */}
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setMenuOpenId(menuOpenId === fact.id ? null : fact.id)} // メニュー開閉
              className="text-lg"
            >
              ⋮
            </button>
            {menuOpenId === fact.id && (
              <div className="absolute right-0 mt-2 w-24 bg-white border rounded shadow text-sm z-10">
                <button
                  onClick={() => handleEditStart(fact)} // 編集を開始
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(fact.id)} // 削除
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500"
                >
                  削除
                </button>
              </div>
            )}
          </div>

          {/* 編集フォーム */}
          {editingId === fact.id ? (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">投稿ネタ</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
                <div className="flex flex-wrap gap-2">
                  {/* タグ選択 */}
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`px-3 py-1 rounded-full border ${
                        editTags.includes(tag) ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() =>
                        setEditTags((prev) =>
                          prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag]
                        )
                      }
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSave(fact.id)} // 編集を保存
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={handleEditCancel} // 編集をキャンセル
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold">{fact.text}</p>
              <p className="text-sm text-gray-500">タグ: {fact.tags}</p>
              <p className="text-xs text-gray-400">投稿日: {new Date(fact.createdAt).toLocaleString()}</p>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}