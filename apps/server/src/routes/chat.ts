import type { ChatMessage } from '@mindgenius/shared'
import { generateText, streamText } from 'ai'
import type { Context } from 'hono'
import { Hono } from 'hono'
import { toUserMessage } from '../lib/errors'
import { legacySSE } from '../lib/sse'
import type { LLMRequestConfig } from '../llm/provider'
import { chatModel } from '../llm/provider'
import { compressPrompt, mindMapPrompt, nodeExpandPrompt } from '../prompts'
import { enforceDemoQuota, llmConfigFrom } from './middleware'

export const chatRoutes = new Hono()

/**
 * 把 streamText 的增量输出按旧协议推给前端。
 * 走 fullStream 而非 textStream：AI SDK 的 textStream 会**静默吞掉**流内错误
 * （如服务端 Key 无效），导致空内容却以 done 收尾。fullStream 能拿到 error part，
 * 抛出后由 legacySSE 归类成 failed 提示，避免「啥也没生成还不报错」。
 */
function pipeTextStream(c: Context, run: (cfg: LLMRequestConfig) => ReturnType<typeof streamText>) {
  return legacySSE(c, async (emit) => {
    const cfg = llmConfigFrom(c)
    enforceDemoQuota(c, cfg)
    const result = run(cfg)
    for await (const part of result.fullStream) {
      if (part.type === 'text-delta')
        await emit.send(part.text)
      else if (part.type === 'error')
        throw part.error
    }
    await emit.done()
  })
}

chatRoutes.post('/chat', async (c) => {
  const { messages } = await c.req.json<{ messages: ChatMessage[] }>()
  if (!messages || !Array.isArray(messages) || messages.length === 0)
    return c.json({ success: false, message: 'No message' }, 400)

  return pipeTextStream(c, cfg => streamText({
    model: chatModel(cfg),
    messages: messages.map(({ role, content }) => ({ role, content })),
    temperature: 0.9,
    maxOutputTokens: 1024,
  }))
})

chatRoutes.post('/chatMindMap', async (c) => {
  const { topic } = await c.req.json<{ topic: string }>()
  if (!topic)
    return c.json({ success: false, message: 'Please set topic' }, 400)

  return pipeTextStream(c, cfg => streamText({
    model: chatModel(cfg),
    prompt: mindMapPrompt(topic),
    temperature: 0.9,
    maxOutputTokens: 1024,
  }))
})

chatRoutes.post('/chatNode', async (c) => {
  const { content } = await c.req.json<{ content: string }>()
  if (!content)
    return c.json({ success: false, message: 'No content' }, 400)

  return pipeTextStream(c, cfg => streamText({
    model: chatModel(cfg),
    prompt: nodeExpandPrompt(content),
    temperature: 0.9,
    maxOutputTokens: 1024,
  }))
})

chatRoutes.post('/compressContent', async (c) => {
  const { content } = await c.req.json<{ content: string }>()
  if (!content)
    return c.json({ success: false, message: 'No content' }, 400)

  try {
    const cfg = llmConfigFrom(c)
    enforceDemoQuota(c, cfg)
    const { text } = await generateText({
      model: chatModel(cfg),
      prompt: compressPrompt(content),
      temperature: 0.1,
      maxOutputTokens: 1024,
    })
    return c.json({ success: true, data: { result: text }, result: text })
  }
  catch (error) {
    return c.json({ success: false, message: toUserMessage(error) }, 400)
  }
})
