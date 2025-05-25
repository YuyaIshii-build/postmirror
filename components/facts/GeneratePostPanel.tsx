import { useState } from 'react';
import { toast } from 'sonner';
import { availableTags } from '@/components/constants/tags';

export type Fact = {
  id: string;
  text: string;
  tags: string;
  createdAt: string;
};

export type GeneratedPost = {
  content: string;
  saved: boolean;
};

export default function GeneratePostPanel({ fact, userId, onFactUpdated, onFactDeleted }: {
  fact: Fact;
  userId: string;
  onFactUpdated?: (updatedFact: Fact) => void;
  onFactDeleted?: (deletedFactId: string) => void;
}) {
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(fact.text);
  const [editTags, setEditTags] = useState(fact.tags.split(',').map(t => t.trim()));

  const generatePost = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factId: fact.id, postCount: 1, userId }),
      });
      if (!res.ok) throw new Error('投稿生成APIエラー');
      const data = await res.json();
      setPost({ content: data.posts, saved: false });
      toast.success('ポストを生成しました！');
    } catch (err) {
      toast.error('投稿の生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const savePost = async () => {
    if (!post || post.saved) return;
    try {
      const res = await fetch('/api/save-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, factId: fact.id, content: post.content, version: 1 }),
      });
      if (!res.ok) throw new Error('保存に失敗');
      setPost({ ...post, saved: true });
      toast.success('ポストを保存しました');
    } catch (err) {
      toast.error('保存に失敗しました');
    }
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(`/api/facts/${fact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText, tags: editTags.join(',') }),
      });
      if (res.ok) {
        const updated = await res.json();
        onFactUpdated?.(updated);
        setEditing(false);
      } else {
        toast.error('更新に失敗しました');
      }
    } catch {
      toast.error('更新エラー');
    }
  };

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      const res = await fetch(`/api/facts/${fact.id}`, { method: 'DELETE' });
      if (res.ok) {
        onFactDeleted?.(fact.id);
        toast.success('削除しました');
      } else {
        toast.error('削除に失敗しました');
      }
    } catch {
      toast.error('削除エラー');
    }
  };

  const charCount = post?.content.length || 0;
  const overLimit = charCount > 140 ? charCount - 140 : 0;

  return (
    <div className="border p-4 rounded bg-white shadow relative">
      {/* 3点メニュー */}
      <div className="absolute top-2 right-2 z-10">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-lg">⋮</button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-24 bg-white border rounded shadow text-sm">
            <button onClick={() => { setEditing(true); setMenuOpen(false); }} className="block w-full px-4 py-2 text-left hover:bg-gray-100">編集</button>
            <button onClick={handleDelete} className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500">削除</button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <input value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full p-2 border rounded" />
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button key={tag} type="button" onClick={() => setEditTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} className={`px-3 py-1 rounded-full border ${editTags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{tag}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleEditSave} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">保存</button>
            <button onClick={() => setEditing(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">キャンセル</button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-2">登録日: {new Date(fact.createdAt).toLocaleDateString('ja-JP')}</div>
          <p className="mb-2 whitespace-pre-wrap">{fact.text}</p>
          <div className="text-xs text-gray-400 mb-4">タグ: {fact.tags}</div>
          <div className="flex justify-end mb-4">
            <button onClick={generatePost} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? '生成中...' : 'このネタで生成'}
            </button>
          </div>
        </>
      )}

      {post && (
        <div className="p-4 border rounded bg-gray-50">
          <textarea
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value, saved: false })}
            className="w-full border rounded p-2 mb-2 text-sm"
            rows={3}
          />
          <div className="flex items-center gap-4">
            <button onClick={generatePost} className="text-sm px-3 py-1 border rounded hover:bg-gray-100">再生成</button>
            <button onClick={savePost} disabled={post.saved} className={`text-sm px-3 py-1 rounded ${post.saved ? 'bg-green-200 text-gray-600 cursor-default' : 'bg-green-600 text-white hover:bg-green-700'}`}>
              {post.saved ? '保存済み' : '採用する'}
            </button>
          </div>
          <div className="text-sm mt-2">
            <span className={overLimit > 0 ? 'text-red-500' : 'text-gray-600'}>
              {overLimit > 0 ? `-${overLimit}` : `${charCount}文字`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
