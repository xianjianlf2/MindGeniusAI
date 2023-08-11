export enum Language {
  Chinese = 'Chinese',
  English = 'English',
}

export function validateWord(word: string) {
  const chineseRegex = /^[\u4E00-\u9FA5]+$/ // Matches Chinese characters

  if (chineseRegex.test(word))
    return 'Chinese'

  else
    return 'English'
}
