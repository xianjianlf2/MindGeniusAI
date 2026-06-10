import { defineStore } from 'pinia'
import type { GlobalTheme } from 'naive-ui'
import { ref } from 'vue'
import { darkTheme } from 'naive-ui'

export const useGlobalStore = defineStore ('globalStore', () => {
  const theme = ref<GlobalTheme | null>(darkTheme)

  return {
    theme,
  }
})
