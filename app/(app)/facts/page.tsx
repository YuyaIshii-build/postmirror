
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FactForm from "@/components/facts/FactForm";
import GeneratePostPanel from "@/components/facts/GeneratePostPanel";
import FactList from "@/components/facts/FactList";

export type Fact = {
  id: string;
  text: string;
  tags: string;
  createdAt: string;
};

export default function FactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [status, router]);

  const fetchFacts = async () => {
    if (status === "authenticated" && session?.user?.id) {
      try {
        const res = await fetch(`/api/facts?userId=${session.user.id}`);
        const data = await res.json();
        setFacts(data);
      } catch (err) {
        console.error("❌ 取得失敗:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchFacts();
    }
  }, [status, session]);

  const handleSubmitSuccess = () => {
    fetchFacts();
  };

  const handleFactUpdated = (updatedFact: Fact) => {
    setFacts((prevFacts) =>
      prevFacts.map((fact) => (fact.id === updatedFact.id ? updatedFact : fact))
    );
  };

  const handleFactDeleted = (deletedId: string) => {
    setFacts((prevFacts) => prevFacts.filter((fact) => fact.id !== deletedId));
  };

  if (status === "loading" || loading) {
    return <p>読み込み中...</p>;
  }

  // ✅ userIdが存在しない場合は早期return（型エラー防止）
  const userId = session?.user?.id;
  if (!userId) {
    return <p>ログインしてください</p>;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">投稿ネタの登録</h1>
      <FactForm userId={userId} onSubmitSuccess={handleSubmitSuccess} />
      <hr className="my-8" />
      <h1 className="text-2xl font-bold mb-6">登録済みの投稿ネタ</h1>
      <div className="space-y-6 mt-8">
        {facts.map((fact) => (
          <GeneratePostPanel
            key={fact.id}
            fact={fact}
            userId={userId}
            onFactUpdated={handleFactUpdated}
            onFactDeleted={handleFactDeleted}
          />
        ))}
      </div>
    </div>
  );
}