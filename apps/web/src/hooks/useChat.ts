import { computed, ref } from 'vue'
import { messageSuccess } from './message'
import { useChatStore } from '@/stores'
import { useLocalTimeString } from '@/utils'

export type ChatType = 'mindmap' | 'document'

export function useChat(id: string, chatType: ChatType) {
  const chatStore = useChatStore()
  const newMessage = ref('')
  const isLoading = computed(() => chatStore.chatWindows[id].isLoading)

  function sendMessage(message: string, history?: string[], fileName?: string) {
    const role = 'user'
    const content = message
    const time = useLocalTimeString()
    chatStore.addMessage(id, { role, content, time })

    switch (chatType) {
      case 'mindmap':
        chatStore.chatWithMindMap(id, message)
        break
      case 'document':
        chatStore.chatWithDocument(id, history ?? [message], fileName ?? '')
        break
    }
  }

  function handleStopGenerate() {
    chatStore.stopGenerate(id)
  }

  function handleReset() {
    chatStore.clearAllMessage(id)
    messageSuccess('Chat box reset!')
  }

  return {
    newMessage,
    isLoading,
    sendMessage,
    handleStopGenerate,
    handleReset,
  }
}
