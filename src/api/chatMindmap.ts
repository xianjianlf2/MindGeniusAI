import type { ChatOptions } from '.'
import { fetchChat } from '.'
import { useChatStore } from '@/stores'

function useChatStoreConfig(data: any) {
  const chatStore = useChatStore()
  const config: ChatOptions = {
    url: '/api/chatMindMap',
    data,
    openHandler: () => {
      chatStore.toggleLoading(true)
    },
    messageSendHandler: (data) => {
      chatStore.appendMessage(`${data}`)
    },
    messageDoneHandler: () => {
      chatStore.toggleLoading(false)
    },
    messageCloseHandler: () => {
      chatStore.toggleLoading(false)
    },
    errorHandler: () => {
      chatStore.toggleLoading(false)
    },
  }
  return config
}

// export function fetchChatStream(messages: Message[]) {
//   const config = useChatStoreConfig({ messages })
//   fetchChat (config)
// }

export function chatWithMindMapRequest(topic: string) {
  const config = useChatStoreConfig({ topic })
  fetchChat (config)
}
