import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useLocalTimeString } from '../utils'
import { chatWithMindMapRequest } from '@/api/chatMindmap'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  time: string
}
export const useChatStore = defineStore('chatStore', () => {
  const messages = ref<Message[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: 'Hello! Please write your topic you want to generate a mindmap',
      time: useLocalTimeString(),
    },
  ])
  const isContinuousDialog = ref(true)
  const isLoading = ref(false)
  const controller = ref<AbortController | null>(null)

  function initMessage(): Message[] {
    return [
      {
        id: uuidv4(),
        role: 'assistant',
        content: 'Hello! Please write your topic you want to generate a mindmap',
        time: useLocalTimeString(),
      },
    ]
  }

  function toggleLoading(val: boolean) {
    isLoading.value = val
  }
  function setAbortController(val: AbortController) {
    controller.value = val
  }

  function addMessage(message: Omit<Message, 'id'>) {
    messages.value.push({
      id: uuidv4(),
      ...message,
    })
  }

  function stopGenerate() {
    controller.value?.abort()
    toggleLoading(false)
  }

  function chatWithMindMap(topic: string) {
    return chatWithMindMapRequest(topic)
  }

  function appendMessage(message: string) {
    const length = messages.value.length - 1
    if (messages.value[length].role !== 'assistant') {
      messages.value.push({
        id: uuidv4(),
        role: 'assistant',
        content: message,
        time: useLocalTimeString(),
      })
    }
    else {
      messages.value[length].content = messages.value[length].content + message
    }
  }

  function removeMessage(id: string) {
    messages.value = messages.value.filter((item: Message) => item.id !== id)
  }

  function clearAllMessage() {
    messages.value = initMessage()
  }

  function toggleContinuousDialog() {
    isContinuousDialog.value = !isContinuousDialog.value
  }

  return {
    messages,
    isLoading,
    isContinuousDialog,
    toggleLoading,
    addMessage,
    removeMessage,
    appendMessage,
    chatWithMindMap,
    stopGenerate,
    setAbortController,
    clearAllMessage,
    toggleContinuousDialog,
  }
},
)
