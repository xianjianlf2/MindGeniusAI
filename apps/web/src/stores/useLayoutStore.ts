import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore ('layoutStore', () => {
  const currentTab = ref('MindMap')

  function setCurrentTab(tab: string) {
    currentTab.value = tab
  }
  return {
    currentTab,
    setCurrentTab,
  }
})
