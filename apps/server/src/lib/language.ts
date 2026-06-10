export enum Language {
  Chinese = 'zh',
  English = 'en',
}

export function detectLanguage(text: string): Language {
  return /[一-龥]/.test(text) ? Language.Chinese : Language.English
}
