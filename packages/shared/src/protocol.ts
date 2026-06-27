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

/**
 * 当前画布思维导图的精简轮廓（仅 id + label + children），
 * 随 AgentRequest 发给 Hermas，使其能用稳定 id 精准定位节点做增量编辑。
 */
export interface MindMapOutline {
  id: string
  label: string
  children?: MindMapOutline[]
}

/** Hermas 对画布的一条增量编辑指令，id 来自 MindMapOutline */
export type MindMapOp =
  | { op: 'add'; parentId: string; label: string }
  | { op: 'update'; id: string; label: string }
  | { op: 'remove'; id: string }
  | { op: 'move'; id: string; parentId: string; index?: number }

/** Hermas Agent 推送的结构化事件，作为 JSON 字符串放进 SseEnvelope.data */
export type AgentEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool-call'; toolName: string; toolCallId: string; input: unknown }
  | { type: 'tool-result'; toolName: string; toolCallId: string; output: unknown }
  | { type: 'mindmap-patch'; ops: MindMapOp[] }
  // mindmap_generate 的产物（markdown）经此事件确定地送达画布，
  // 不再依赖模型把它回显进聊天文本 + 前端正则抠取，从工程上强保证出图。
  | { type: 'mindmap-set'; markdown: string }
  | { type: 'step-finish' }
  | { type: 'error'; message: string }

export interface AgentRequest {
  messages: Pick<ChatMessage, 'role' | 'content'>[]
  /** @deprecated 单文档检索目标，由 fileNames 取代；仍接收以兼容旧客户端 */
  fileName?: string
  /** 已上传并完成索引的文件名集合，rag_query 跨这些文档统一检索 */
  fileNames?: string[]
  /** 画布上已存在的思维导图轮廓，供 mindmap_edit 增量编辑（不存在则全新生成） */
  mindMap?: MindMapOutline
  /**
   * 上一轮 agent 之后用户在画布上手动做的增量改动（按发生顺序）。
   * 让 Hermas 知道「用户刚动了哪里」，而非仅看到改后的最新快照，从而像协作者一样顺势回应。
   */
  recentEdits?: MindMapOp[]
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
