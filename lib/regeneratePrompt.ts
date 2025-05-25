export function buildRegeneratePrompt(
  finalGeneratedText: string, 
  suggestions: string[], 
): string {
  return `
  ${finalGeneratedText}

  ${suggestions.join(', ')}

  【条件】
  文章の内容とトーンは踏襲すること
  本文のみを生成して、余計な文章は付け加えないこと
  例：
  - 文字数の説明
  - 修正の説明
  - タイトル
  `;
}