export enum StorageKey {
  OPENAI_KEY = 'MINDGENIUS_OPENAI_KEY',
  OPENAI_PROXY = 'MINDGENIUS_OPENAI_PROXY',
}

export const storageManager = {
  set(key: string, value: any) {
    if (typeof value === 'undefined' || value === '' || value === null)
      return
    window.localStorage.setItem(key, JSON.stringify(value))
  },
  get(key: string) {
    const value = window.localStorage.getItem(key)
    if (value)
      return JSON.parse(value)
  },
  remove(key: string) {
    window.localStorage.removeItem(key)
  },
  clear() {
    window.localStorage.clear()
  },
}
