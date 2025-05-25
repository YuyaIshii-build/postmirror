export type PromptInput = {
  activityType: string;
  activityDetail: string;
  goal: string;
  targetAudience: string;
  preferredTone: string;
  postIdea: string;
  tags?: string[];
  postCount?: number;
};

export function buildPrompt(input: PromptInput): string {
  const {
    activityType,
    activityDetail,
    goal,
    targetAudience,
    preferredTone,
    postIdea,
    tags = [],
    postCount = 1,
  } = input;

  return `
あなたは日本語X向け投稿を専門とするSNSライターです。SNSマーケティングで効果的な投稿を作成するのが責務です。

以下の情報をもとに、${postCount}件のSNSマーケティングを考慮した戦略的で効果的な投稿を作成してください。
この投稿は「${activityDetail}」に取り組む「${activityType}」が得た経験・気づき「${postIdea}」をもとにしています。
ターゲットとなる読者は「${targetAudience}」です。

【投稿文作成の絶対条件（厳守）】
- 投稿1件で得られる情報密度が高くなるよう、**必ず全角120~140文字の投稿を作成すること**
- 投稿本文に「以下の分類タグ」は**絶対に含めない**：${tags.join(', ') || 'なし'}
- 本文のみを出力すること（タイトルは不要）
- 書き出しは**毎回変えること**
- 抽象的な内容や、テンプレ的な構成、低密度な文章、ハッシュタグは禁止
- 投稿者の立場や想定読者の説明は不要

【評価基準（Output Check）】
- 上記条件のうち**1つでも違反していれば出力は不合格**。

【トーン指定：${preferredTone}】
- カジュアル → フランクすぎる表現、絵文字の多用しない
- プロ → 誠実・簡潔な説明
- ユーモア → 軽快・くすっと笑える、ただし情報の核心は含めること

`.trim();
}