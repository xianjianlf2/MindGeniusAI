export enum StorageKey {
  OPENAI_KEY = 'MINDGENIUS_OPENAI_KEY',
  OPENAI_PROXY = 'MINDGENIUS_OPENAI_PROXY',
  LLM_PROVIDER = 'MINDGENIUS_LLM_PROVIDER',
  LLM_MODEL = 'MINDGENIUS_LLM_MODEL',
}

export const storageManager = {
  set(key: string, value: unknown) {
    if (typeof value === 'undefined' || value === '' || value === null)
      return
    window.localStorage.setItem(key, JSON.stringify(value))
  },
  get(key: string): string | undefined {
    const value = window.localStorage.getItem(key)
    if (value) {
      try {
        return JSON.parse(value)
      }
      catch {
        return value
      }
    }
  },
  remove(key: string) {
    window.localStorage.removeItem(key)
  },
}
