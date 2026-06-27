import type { MindMapOutline } from '@mindgenius/shared'
import { encodeAgentEvent } from '@mindgenius/shared'
import { Hono } from 'hono'
import { z } from 'zod'
import { runHermas } from '../agent/hermas'
import { legacySSE } from '../lib/sse'
import { llmConfigFrom } from './middleware'

export const agentRoutes = new Hono()

/** 入参严格校验：脏请求在边界处直接拒掉，保证进入 agent 的数据格式正确 */
const outlineSchema: z.ZodType<MindMapOutline> = z.lazy(() => z.object({
  id: z.string(),
  label: z.string(),
  children: z.array(outlineSchema).optional(),
}))

const opSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('add'), parentId: z.string(), label: z.string() }),
  z.object({ op: z.literal('update'), id: z.string(), label: z.string() }),
  z.object({ op: z.literal('remove'), id: z.string() }),
  z.object({ op: z.literal('move'), id: z.string(), parentId: z.string(), index: z.number().optional() }),
])

const agentRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).min(1),
  fileName: z.string().optional(), // 旧客户端兼容
  fileNames: z.array(z.string()).optional(),
  mindMap: outlineSchema.optional(),
  recentEdits: z.array(opSchema).optional(), // 用户手动改动，喂给 Hermas 作协作上下文
})

/**
 * Hermas Agent 端点。
 * SSE envelope 与旧协议一致（pending/done/failed），data 内是 encodeAgentEvent
 * 编码后的结构化事件（text / tool-call / tool-result / step-finish / error），
 * 前端据此渲染 Agent 的每一步动作。
 */
agentRoutes.post('/agent', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = agentRequestSchema.safeParse(body)
  if (!parsed.success)
    return c.json({ success: false, message: `Invalid request: ${parsed.error.issues[0]?.message ?? 'bad payload'}` }, 400)
  const request = parsed.data

  return legacySSE(c, async (emit) => {
    const cfg = llmConfigFrom(c)
    await runHermas(request, cfg, event => emit.send(encodeAgentEvent(event)))
    await emit.done()
  })
})
