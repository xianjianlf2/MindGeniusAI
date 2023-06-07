import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useLocalTimeString } from '../utils'
import { chatWithMindMapRequest, fetchChatStream } from '../api'

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

  function addMessage(message: Omit<Message, 'id'>) {
    messages.value.push({
      id: uuidv4(),
      ...message,
    })
  }

  function fetchMessage() {
    return fetchChatStream(messages.value.slice(-3))
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

  return {
    messages,
    addMessage,
    removeMessage,
    appendMessage,
    fetchMessage,
    chatWithMindMap,
  }
},
)
