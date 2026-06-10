import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useLocalTimeString } from '../utils'
import { chatWithMindMapRequest } from '@/api/chatMindmap'
import { chatWithDocumentRequest } from '@/api/file'
import { compressContentRequest } from '@/api'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  time: string
}

export interface ChatWindow {
  messages: Message[]
  isContinuousDialog: boolean
  isLoading: boolean
  controller: AbortController | null
}

export const useChatStore = defineStore('chatStore', () => {
  const chatWindows = ref<{ [id: string]: ChatWindow }>({})

  function findChatWindow(id: string) {
    return !!chatWindows.value[id]
  }

  function initMessage(defaultMessage?: string): Message[] {
    return [
      {
        id: uuidv4(),
        role: 'assistant',
        content: defaultMessage ?? 'Hello! Please write your topic you want to generate a mindmap',
        time: useLocalTimeString(),
      },
    ]
  }

  function addChatWindow(id: string, defaultMessage = true) {
    chatWindows.value[id] = {
      messages: defaultMessage ? initMessage() : [],
      isContinuousDialog: true,
      isLoading: false,
      controller: null,
    }
  }

  function removeChatWindow(id: string) {
    delete chatWindows.value[id]
  }

  function toggleLoading(id: string, val: boolean) {
    chatWindows.value[id].isLoading = val
  }

  function setAbortController(id: string, val: AbortController) {
    chatWindows.value[id].controller = val
  }

  function addMessage(id: string, message: Omit<Message, 'id'>) {
    chatWindows.value[id].messages.push({
      id: uuidv4(),
      ...message,
    })
  }

  function stopGenerate(id: string) {
    chatWindows.value[id].controller?.abort()
    toggleLoading(id, false)
  }

  function chatWithMindMap(id: string, topic: string) {
    chatWindows.value[id].controller = chatWithMindMapRequest(id, topic)
  }

  function chatWithDocument(id: string, query: string[], fileName: string) {
    chatWindows.value[id].controller = chatWithDocumentRequest(id, query, fileName)
  }

  function appendMessage(id: string, message: string) {
    const length = chatWindows.value[id].messages.length - 1
    if (chatWindows.value[id].messages[length].role !== 'assistant') {
      chatWindows.value[id].messages.push({
        id: uuidv4(),
        role: 'assistant',
        content: message,
        time: useLocalTimeString(),
      })
    }
    else {
      chatWindows.value[id].messages[length].content = chatWindows.value[id].messages[length].content + message
    }
  }

  function removeMessage(id: string, messageId: string) {
    chatWindows.value[id].messages = chatWindows.value[id].messages.filter((item: Message) => item.id !== messageId)
  }

  function clearAllMessage(id: string) {
    chatWindows.value[id].messages = initMessage()
  }

  function toggleContinuousDialog(id: string) {
    chatWindows.value[id].isContinuousDialog = !chatWindows.value[id].isContinuousDialog
  }

  async function compressContent(content: string) {
    const res = await compressContentRequest(content)
    const { success, result } = res.data
    if (success)
      return result
  }

  return {
    chatWindows,
    addChatWindow,
    removeChatWindow,
    toggleLoading,
    addMessage,
    removeMessage,
    appendMessage,
    chatWithMindMap,
    stopGenerate,
    setAbortController,
    clearAllMessage,
    toggleContinuousDialog,
    findChatWindow,
    chatWithDocument,
    compressContent,
  }
})
