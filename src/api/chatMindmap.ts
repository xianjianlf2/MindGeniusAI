import type { ChatOptions } from '.'
import { fetchChat } from '.'
import { useChatStore } from '@/stores'

function useChatStoreConfig(chatWindowId: string, data: any) {
  const chatStore = useChatStore()
  const config: ChatOptions = {
    url: '/api/chatMindMap',
    data,
    openHandler: () => {
      chatStore.toggleLoading(chatWindowId, true)
    },
    messageSendHandler: (data) => {
      chatStore.appendMessage(chatWindowId, `${data}`)
    },
    messageDoneHandler: () => {
      chatStore.toggleLoading(chatWindowId, false)
    },
    messageCloseHandler: () => {
      chatStore.toggleLoading(chatWindowId, false)
    },
    errorHandler: () => {
      chatStore.toggleLoading(chatWindowId, false)
    },
  }
  return config
}

// export function fetchChatStream(messages: Message[]) {
//   const config = useChatStoreConfig({ messages })
//   fetchChat (config)
// }

export function chatWithMindMapRequest(chatWindowId: string, topic: string) {
  const config = useChatStoreConfig(chatWindowId, { topic })
  return fetchChat (config)
}
