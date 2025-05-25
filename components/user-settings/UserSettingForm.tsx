"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react"; // セッション情報を取得

export default function UserSettingForm() {
  const { data: session } = useSession(); // ログイン中のユーザー情報を取得

  const [activityType, setActivityType] = useState("");
  const [activityDetail, setActivityDetail] = useState("");
  const [goal, setGoal] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [preferredTone, setPreferredTone] = useState("");

  const [errors, setErrors] = useState({
    activityType: "",
    activityDetail: "",
    goal: "",
    targetAudience: "",
  });

  useEffect(() => {
    const fetchSetting = async () => {
      if (!session?.user?.id) return; // ユーザーIDがない場合、何もしない

      try {
        const res = await fetch(`/api/user-settings?userId=${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setActivityType(data.activityType || "");
          setActivityDetail(data.activityDetail || "");
          setGoal(data.goal || "");
          setTargetAudience(data.targetAudience || "");
          setPreferredTone(data.preferredTone || "");
        } else if (res.status !== 404) {
          toast.error("設定の取得に失敗しました。");
        }
      } catch (err) {
        toast.error("通信エラーが発生しました。");
      }
    };

    fetchSetting();
  }, [session]);

  const validate = () => {
    const newErrors: typeof errors = {
      activityType: "",
      activityDetail: "",
      goal: "",
      targetAudience: "",
    };

    if (!activityType) newErrors.activityType = "この項目は必須です。";
    if (!activityDetail.trim())
      newErrors.activityDetail = "この項目は必須です。";
    if (!goal) newErrors.goal = "この項目は必須です。";
    if (!targetAudience.trim())
      newErrors.targetAudience = "この項目は必須です。";

    setErrors(newErrors);
    return Object.values(newErrors).every((msg) => msg === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!session?.user?.id) return; // ユーザーIDがない場合は処理しない

    try {
      const res = await fetch("/api/user-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id, // ログイン中のユーザーIDを使用
          activityType,
          activityDetail,
          goal,
          targetAudience,
          preferredTone,
        }),
      });

      if (res.ok) {
        toast.success("保存しました！");
      } else {
        toast.error("保存に失敗しました。");
      }
    } catch (err) {
      toast.error(
        "通信エラーが発生しました。ネットワーク接続をご確認ください。",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6 p-6 bg-white rounded"
    >
      <p className="text-lg font-medium">
        効果的なポスト生成のためのマーケティング戦略を設定します。
      </p>

      {/* Q1 */}
      <div>
        <label className="block font-semibold mb-1">
          Q1 今のあなたに一番近いものを選んでください。
          <span className="text-red-500 text-sm ml-2">必須</span>
        </label>
        <select
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">選択してください。</option>
          <option value="SNSインフルエンサー">SNSインフルエンサー</option>
          <option value="フリーランス事業者">フリーランス事業者</option>
          <option value="副業フリーランス">副業フリーランス</option>
          <option value="ビジネスオーナー">ビジネスオーナー</option>
          <option value="企業のマーケター">企業のマーケター</option>
        </select>
        {errors.activityType && (
          <p className="text-red-500 text-sm mt-1">{errors.activityType}</p>
        )}
      </div>

      {/* Q2 */}
      <div>
        <label className="block font-semibold mb-1">
          Q2 あなたの事業・活動を具体的に教えてください。
          <span className="text-red-500 text-sm ml-2">必須</span>
        </label>
        <textarea
          value={activityDetail}
          onChange={(e) => setActivityDetail(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="例）副業フリーランスでYouTubeの動画編集。"
        />
        {errors.activityDetail && (
          <p className="text-red-500 text-sm mt-1">{errors.activityDetail}</p>
        )}
      </div>

      {/* Q3 */}
      <div>
        <label className="block font-semibold mb-1">
          Q3 SNS運用を通じて、どのような成果を得たいですか？
          <span className="text-red-500 text-sm ml-2">必須</span>
        </label>
        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">選択してください。</option>
          <option value="認知を獲得したい">認知を獲得したい</option>
          <option value="フォロワーを増やしたい">フォロワーを増やしたい</option>
          <option value="顧客を獲得したい">顧客を獲得したい</option>
          <option value="フォロワーと信頼を構築したい">信頼を構築したい</option>
        </select>
        {errors.goal && (
          <p className="text-red-500 text-sm mt-1">{errors.goal}</p>
        )}
      </div>

      {/* Q4 */}
      <div>
        <label className="block font-semibold mb-1">
          Q4 どのような相手に向けて発信を届けたいですか？
          <span className="text-red-500 text-sm ml-2">必須</span>
        </label>
        <textarea
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="例）登録人数が1万人程度のYouTube動画投稿者や企業のYouTube運用担当者。"
        />
        {errors.targetAudience && (
          <p className="text-red-500 text-sm mt-1">{errors.targetAudience}</p>
        )}
      </div>

      {/* Q5 */}
      <div>
        <label className="block font-semibold mb-1">
          Q5 どのような発信スタイルやトーンが好みですか？
        </label>
        <select
          value={preferredTone}
          onChange={(e) => setPreferredTone(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">選択してください。</option>
          <option value="カジュアル">カジュアル</option>
          <option value="プロフェッショナル">プロフェッショナル</option>
          <option value="ユーモアあり">ユーモアあり</option>
        </select>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          className="bg-gray-800 text-white px-6 py-2 rounded"
        >
          マーケティング戦略を保存する
        </button>
      </div>
    </form>
  );
}