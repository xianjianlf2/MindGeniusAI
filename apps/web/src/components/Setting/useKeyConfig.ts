import { ref } from 'vue'
import { StorageKey, storageManager } from '@/utils'

const keyConfig = ref({
  openAIKey: '',
  openAIProxy: '',
})

export function useKeyConfig() {
  function setConfig() {
    const { openAIKey, openAIProxy } = keyConfig.value
    storageManager.set(StorageKey.OPENAI_KEY, openAIKey.trim())
    storageManager.set(StorageKey.OPENAI_PROXY, openAIProxy.trim())
  }
  function initConfig() {
    keyConfig.value = {
      openAIKey: storageManager.get(StorageKey.OPENAI_KEY) || '',
      openAIProxy: storageManager.get(StorageKey.OPENAI_PROXY) || '',
    }
  }

  function resetConfig() {
    keyConfig.value = {
      openAIKey: '',
      openAIProxy: '',
    }
    storageManager.remove(StorageKey.OPENAI_KEY)
    storageManager.remove(StorageKey.OPENAI_PROXY)
  }

  return {
    keyConfig,
    setConfig,
    initConfig,
    resetConfig,
  }
}
