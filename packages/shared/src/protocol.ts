/**
 * 前后端共享的 SSE 协议。
 *
 * 旧协议（legacy envelope）：所有旧端点（/chat /chatMindMap /chatNode /document/query）
 * 推送 `{ status, data }`，保持不变以兼容存量前端。
 *
 * Agent 协议：/agent 端点在 legacy envelope 的 data 字段里携带结构化 AgentEvent，
 * status 复用 pending/done/failed，前端可按 event.type 渐进增强展示。
 */

export enum MessageStatus {
  PENDING = 'pending',
  DONE = 'done',
  FAILED = 'failed',
}

export interface SseEnvelope {
  status: MessageStatus
  data?: string
}

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  time: string
}

/** Hermas Agent 推送的结构化事件，作为 JSON 字符串放进 SseEnvelope.data */
export type AgentEvent =
  | { type: 'text', delta: string }
  | { type: 'tool-call', toolName: string, toolCallId: string, input: unknown }
  | { type: 'tool-result', toolName: string, toolCallId: string, output: unknown }
  | { type: 'step-finish' }
  | { type: 'error', message: string }

export interface AgentRequest {
  messages: Pick<ChatMessage, 'role' | 'content'>[]
  /** 已上传并完成索引的文件名，供 rag_query 工具检索 */
  fileName?: string
}

export const AGENT_EVENT_PREFIX = 'agent:'

export function encodeAgentEvent(event: AgentEvent): string {
  return AGENT_EVENT_PREFIX + JSON.stringify(event)
}

export function decodeAgentEvent(data: string): AgentEvent | null {
  if (!data.startsWith(AGENT_EVENT_PREFIX))
    return null
  try {
    return JSON.parse(data.slice(AGENT_EVENT_PREFIX.length)) as AgentEvent
  }
  catch {
    return null
  }
}
