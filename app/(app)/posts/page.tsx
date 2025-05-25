// app/posts/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function ApprovedPostsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!session?.user?.id) {
        toast.error('ログインしていません');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/posts?userId=${session.user.id}`);
        if (!res.ok) throw new Error('取得失敗');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        toast.error('採用済みポストの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [session]);

  const togglePosted = async (postId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPosted: !current }),
      });

      if (!res.ok) throw new Error('更新失敗');

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, isPosted: !current } : post
        )
      );
      toast.success('ステータスを更新しました');
    } catch (err) {
      toast.error('ステータスの更新に失敗しました');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">採用済みのポスト一覧</h1>
      <p className="text-sm text-gray-600 mb-4">採用したポストの一覧を確認できます。</p>

      {loading ? (
        <p>読み込み中...</p>
      ) : posts.length === 0 ? (
        <p>まだ採用されたポストはありません。</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="border rounded p-4 bg-white shadow">
            <div className="text-sm text-gray-500 mb-2">
              作成日：{format(new Date(post.createdAt), 'yyyy年M月d日')}
              <span className="ml-4">元ネタ：{post.fact.text.slice(0, 20)}文字</span>
              <span className="ml-4">タグ：{post.fact.tags}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm">{post.content}</p>

            <div className="flex justify-between items-center mt-2">
              <label className="flex items-center text-sm gap-2">
                投稿済み：
                <input
                  type="checkbox"
                  checked={post.isPosted}
                  onChange={() => togglePosted(post.id, post.isPosted)}
                  className="accent-blue-600 w-4 h-4"
                />
              </label>
              <button
                className="px-4 py-1 text-sm text-white bg-gray-700 rounded hover:bg-gray-800"
                onClick={() => {
                  navigator.clipboard.writeText(post.content);
                  toast.success('コピーしました');
                }}
              >
                コピーする
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}