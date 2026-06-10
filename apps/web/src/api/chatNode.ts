import type { ChatOptions } from '.'
import { fetchChat } from '.'
import { useNodeStore } from '@/stores'

function useNodeStoreConfig(data: any) {
  const nodeStore = useNodeStore()
  const config: ChatOptions = {
    url: '/api/chatNode',
    data,
    openHandler: () => {
      nodeStore.clearMessage()
      nodeStore.toggleLoading(true)
    },
    messageSendHandler: (data) => {
      nodeStore.appendMessage(`${data}`)
    },
    messageDoneHandler: () => {
      nodeStore.toggleLoading(false)
      nodeStore.splitTextToNodes()
    },
    messageCloseHandler: () => {
      nodeStore.toggleLoading(false)
    },
    errorHandler: () => {
      nodeStore.toggleLoading(false)
    },
  }
  return config
}

export function fetchChatNode(content: string) {
  const config = useNodeStoreConfig({ content })
  const controller = fetchChat (config)
  return controller
}
