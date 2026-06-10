import type { AgentRequest } from '@mindgenius/shared'
import { encodeAgentEvent } from '@mindgenius/shared'
import { Hono } from 'hono'
import { runHermas } from '../agent/hermas'
import { legacySSE } from '../lib/sse'
import { llmConfigFrom } from './middleware'

export const agentRoutes = new Hono()

/**
 * Hermas Agent 端点。
 * SSE envelope 与旧协议一致（pending/done/failed），data 内是 encodeAgentEvent
 * 编码后的结构化事件（text / tool-call / tool-result / step-finish / error），
 * 前端据此渲染 Agent 的每一步动作。
 */
agentRoutes.post('/agent', async (c) => {
  const request = await c.req.json<AgentRequest>()
  if (!request.messages?.length)
    return c.json({ success: false, message: 'No message' }, 400)

  return legacySSE(c, async (emit) => {
    const cfg = llmConfigFrom(c)
    await runHermas(request, cfg, event => emit.send(encodeAgentEvent(event)))
    await emit.done()
  })
})
