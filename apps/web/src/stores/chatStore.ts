import type { AgentEvent } from '@mindgenius/shared'
import { decodeAgentEvent } from '@mindgenius/shared'
import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'
import { fetchStream } from '@/api/sse'

export interface AgentStep {
  toolCallId: string
  toolName: string
  input?: unknown
  output?: unknown
  done: boolean
}

export interface UiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
  steps?: AgentStep[]
  error?: string
}

interface ChatState {
  messages: UiMessage[]
  isLoading: boolean
  controller: AbortController | null
  send: (options: {
    url: string
    data: unknown
    userText: string
    agentMode?: boolean
    onDone?: (finalContent: string) => void
  }) => void
  stop: () => void
  clear: () => void
}

function now() {
  return new Date().toLocaleString()
}

function newMessage(role: UiMessage['role'], content: string): UiMessage {
  return { id: uuidv4(), role, content, time: now(), steps: [] }
}

/** 每个聊天面板一个独立 store（导图聊天 / 文档问答各自隔离） */
export function createChatStore(welcome?: string) {
  return create<ChatState>((set, get) => {
    const updateLastAssistant = (updater: (message: UiMessage) => UiMessage) => {
      set((state) => {
        const messages = [...state.messages]
        const last = messages[messages.length - 1]
        if (last?.role === 'assistant')
          messages[messages.length - 1] = updater(last)
        else
          messages.push(updater(newMessage('assistant', '')))
        return { messages }
      })
    }

    const handleAgentEvent = (event: AgentEvent) => {
      switch (event.type) {
        case 'text':
          updateLastAssistant(message => ({ ...message, content: message.content + event.delta }))
          break
        case 'tool-call':
          updateLastAssistant(message => ({
            ...message,
            steps: [...(message.steps ?? []), {
              toolCallId: event.toolCallId,
              toolName: event.toolName,
              input: event.input,
              done: false,
            }],
          }))
          break
        case 'tool-result':
          updateLastAssistant(message => ({
            ...message,
            steps: (message.steps ?? []).map(step =>
              step.toolCallId === event.toolCallId
                ? { ...step, output: event.output, done: true }
                : step),
          }))
          break
        case 'error':
          updateLastAssistant(message => ({ ...message, error: event.message }))
          break
      }
    }

    return {
      messages: welcome ? [newMessage('assistant', welcome)] : [],
      isLoading: false,
      controller: null,

      send({ url, data, userText, agentMode, onDone }) {
        if (get().isLoading)
          return
        set(state => ({
          messages: [...state.messages, newMessage('user', userText), newMessage('assistant', '')],
          isLoading: true,
        }))

        const controller = fetchStream({
          url,
          data,
          onMessage(raw) {
            if (agentMode) {
              const event = decodeAgentEvent(raw)
              if (event)
                handleAgentEvent(event)
              return
            }
            updateLastAssistant(message => ({ ...message, content: message.content + raw }))
          },
          onDone() {
            const { messages, isLoading } = get()
            if (!isLoading)
              return
            set({ isLoading: false, controller: null })
            const last = messages[messages.length - 1]
            if (last?.role === 'assistant' && last.content)
              onDone?.(last.content)
          },
          onError(message) {
            updateLastAssistant(item => ({ ...item, error: message }))
          },
        })
        set({ controller })
      },

      stop() {
        get().controller?.abort()
        set({ isLoading: false, controller: null })
      },

      clear() {
        get().controller?.abort()
        set({
          messages: welcome ? [newMessage('assistant', welcome)] : [],
          isLoading: false,
          controller: null,
        })
      },
    }
  })
}
