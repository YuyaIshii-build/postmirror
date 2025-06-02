// lib/validation.ts
export function validatePostContent(generatedText: string | undefined, finalGeneratedText: string | undefined) {
  const errors: string[] = [];
  let suggestions: string[] = [];  

  // generatedTextが渡された場合の評価
  if (generatedText) {
    const length = generatedText.length;
    if (length < 100 || length > 140) {
      errors.push(`文字数が不正です。現在の文字数: ${length}`);
      suggestions.push(`この投稿内容の文字数は${length}です。文字数が必ず全角120~140文字になるよう文章量を調整してください`); 
    }

    const hashtagCount = (generatedText.match(/#/g) || []).length;  // '#'の数をカウント
    if (hashtagCount > 1) {
      errors.push(`タグは最大1つにしてください。現在のタグ数: ${hashtagCount}`);
      suggestions.push("ハッシュタグの数を1つに修正してください");
    }
  }

  // finalGeneratedTextが渡された場合の評価
  if (finalGeneratedText) {
    const length = finalGeneratedText.length;
    if (length < 100 || length > 140) {
      errors.push(`文字数が不正です。現在の文字数: ${length}`);
        suggestions.push(`この投稿内容の文字数は${length}です。文字数が必ず全角120~140文字になるよう文章量を調整してください`); 
    }

    const hashtagCount = (finalGeneratedText.match(/#/g) || []).length;  // '#'の数をカウント
    if (hashtagCount > 1) {
      errors.push(`タグは最大1つにしてください。現在のタグ数: ${hashtagCount}`);
      suggestions.push("ハッシュタグの数を1つに修正してください");
    }
  }

  return { errors, suggestions };
}