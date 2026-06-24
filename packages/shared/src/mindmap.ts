/**
 * 思维导图格式的工程约束 —— 前后端共用，保证 LLM 产物落到画布前格式可控。
 */

/** 结构硬上限：异常/恶意输出也不会撑爆画布或拖垮渲染 */
export const MINDMAP_LIMITS = {
  maxDepth: 5,
  maxNodes: 300,
  maxLabel: 200,
} as const

/**
 * 剥掉模型常给整段内容包的 ```markdown 代码块（闭合或未闭合都处理）。
 * 不剥的话 markdown 解析器会把整段当成代码块、解析不出任何标题。
 */
export function unwrapFence(text: string): string {
  const trimmed = text.trim()
  const closed = trimmed.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n?```$/i)
  if (closed)
    return closed[1].trim()
  return trimmed
    .replace(/^```(?:markdown|md)?[^\n]*\n?/i, '') // 起始 fence 行
    .replace(/\n?```\s*$/i, '') // 可能的结尾 fence
    .trim()
}
