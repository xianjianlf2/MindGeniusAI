import type { AgentEvent, MindMapOp } from '@mindgenius/shared'
import { decodeAgentEvent } from '@mindgenius/shared'
import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
  /** 该条用户消息附带的文档上下文（展示用） */
  pdf?: string
}

interface ChatState {
  messages: UiMessage[]
  isLoading: boolean
  controller: AbortController | null
  send: (options: {
    url: string
    data: unknown
    userText: string
    userPdf?: string
    agentMode?: boolean
    onDone?: (finalContent: string) => void
    /** Agent 推送的画布增量编辑指令（mindmap_edit） */
    onPatch?: (ops: MindMapOp[]) => void
    /** Agent 确定送达的整张导图 markdown（mindmap_generate），出图强保证 */
    onSetMap?: (markdown: string) => void
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
  return create<ChatState>()(persist((set, get) => {
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

    const handleAgentEvent = (
      event: AgentEvent,
      onPatch?: (ops: MindMapOp[]) => void,
      onSetMap?: (markdown: string) => void,
    ) => {
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
        case 'mindmap-patch':
          onPatch?.(event.ops)
          break
        case 'mindmap-set':
          onSetMap?.(event.markdown)
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

      send({ url, data, userText, userPdf, agentMode, onDone, onPatch, onSetMap }) {
        if (get().isLoading)
          return
        set(state => ({
          messages: [...state.messages, { ...newMessage('user', userText), pdf: userPdf }, newMessage('assistant', '')],
          isLoading: true,
        }))

        const controller = fetchStream({
          url,
          data,
          onMessage(raw) {
            if (agentMode) {
              const event = decodeAgentEvent(raw)
              if (event)
                handleAgentEvent(event, onPatch, onSetMap)
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
  }, {
    name: 'mindgenius-chat', // localStorage：刷新不丢对话（仅存 messages，运行态不持久化）
    partialize: state => ({ messages: state.messages }),
  }))
}
