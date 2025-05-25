'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';  // useSessionをインポート

type Fact = {
  id: string;
  text: string;
  tags: string;
  createdAt: string;
};

type GeneratedPost = {
  content: string;
  saved: boolean;
};

export default function GeneratePostsPage() {
  const { data: session } = useSession(); // セッション情報を取得
  const [facts, setFacts] = useState<Fact[]>([]); // 初期値を空の配列
  const [loading, setLoading] = useState(false);
  const [postCountMap, setPostCountMap] = useState<Record<string, number>>({});
  const [generatedMap, setGeneratedMap] = useState<Record<string, GeneratedPost[]>>({});

  useEffect(() => {
    const fetchFacts = async () => {
      if (!session?.user?.id) {
        toast.error('ユーザーがログインしていません');
        return;
      }
      try {
        // userIdをクエリパラメータとしてリクエストに追加
        const res = await fetch(`/api/facts?userId=${session.user.id}`);
        const data = await res.json();
        console.log('取得したデータ:', data);

        if (Array.isArray(data)) {
          setFacts(data);
        } else {
          setFacts([]);  // もし配列でない場合は空の配列に設定
        }
      } catch (err) {
        toast.error('ネタ一覧の取得に失敗しました');
        setFacts([]); // エラー時に空の配列を設定
      }
    };
    fetchFacts();
  }, [session]);  // sessionが更新されるたびに実行されるように

  const generatePosts = async (factId: string) => {
    const count = postCountMap[factId] || 1;
    const userId = session?.user?.id; // ログインユーザーのIDを取得
    if (!userId) {
      toast.error('ログインしていないため、投稿を生成できません');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/generate-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factId, postCount: count, userId }), // userIdを追加
      });
      if (!res.ok) throw new Error('投稿生成APIエラー');
      const data = await res.json();

      // data.postsが文字列として返ってきているため、そのまま使用
      const posts: GeneratedPost[] = [{
        content: data.posts,  // 直接文字列として格納
        saved: false,
      }];

      // 生成されたポストをセット
      setGeneratedMap((prev) => ({
        ...prev,
        [factId]: posts,
      }));

      toast.success('ポストを生成しました！');
    } catch (err) {
      toast.error('投稿の生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updatePostContent = (factId: string, index: number, newContent: string) => {
    setGeneratedMap((prev) => ({
      ...prev,
      [factId]: prev[factId].map((post, i) =>
        i === index ? { ...post, content: newContent } : post
      ),
    }));
  };

  const savePost = async (factId: string, content: string, index: number) => {
    if (!session?.user?.id) {
      toast.error("ログインしていないため、ポストを保存できません");
      return;
    }

    try {
      const res = await fetch('/api/save-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,  // sessionからuserIdを取得
          factId,
          content,
          version: index + 1,
        }),
      });
      if (!res.ok) throw new Error('保存に失敗');

      setGeneratedMap((prev) => ({
        ...prev,
        [factId]: prev[factId].map((post, i) =>
          i === index ? { ...post, saved: true } : post
        ),
      }));

      toast.success('ポストを保存しました');
    } catch (err) {
      toast.error('保存に失敗しました');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">投稿を生成する</h1>

      {facts.length === 0 ? (
        <p>登録されたネタがありません。</p>
      ) : (
        <div className="space-y-6">
          {facts.map((fact) => (
            <div key={fact.id} className="border p-4 rounded bg-white shadow">
              <div className="text-sm text-gray-500 mb-2">
                登録日: {format(new Date(fact.createdAt), 'yyyy/MM/dd')}
              </div>
              <p className="mb-2 whitespace-pre-wrap">{fact.text}</p>
              <div className="text-xs text-gray-400 mb-4">タグ: {fact.tags}</div>

              <div className="flex items-center gap-4 mb-4 justify-end">
                <button
                  onClick={() => generatePosts(fact.id)}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '生成中...' : 'このネタで生成'}
                </button>
              </div>

              {generatedMap[fact.id] && (
                <ul className="space-y-4">
                  {generatedMap[fact.id].map((post, idx) => {
                    // 文字数を計算
                    const charCount = post.content.length;
                    const overLimit = charCount > 140 ? charCount - 140 : 0;

                    return (
                      <li key={idx} className="p-4 border rounded bg-gray-50">
                        <textarea
                          value={post.content}
                          onChange={(e) => updatePostContent(fact.id, idx, e.target.value)}
                          className="w-full border rounded p-2 mb-2 text-sm"
                          rows={3}
                        />
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => generatePosts(fact.id)}
                            className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
                          >
                            再生成
                          </button>
                          <button
                            onClick={() => savePost(fact.id, post.content, idx)}
                            disabled={post.saved}
                            className={`text-sm px-3 py-1 rounded ${
                              post.saved
                                ? 'bg-green-200 text-gray-600 cursor-default'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {post.saved ? '保存済み' : '採用する'}
                          </button>
                        </div>

                        {/* 文字数表示 */}
                        <div className="text-sm mt-2">
                          <span className={overLimit > 0 ? 'text-red-500' : 'text-gray-600'}>
                            {overLimit > 0 ? `-${overLimit}` : `${charCount}文字`}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}