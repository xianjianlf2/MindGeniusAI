import type { ChatMessage } from '@mindgenius/shared'
import { generateText, streamText } from 'ai'
import type { Context } from 'hono'
import { Hono } from 'hono'
import { toUserMessage } from '../lib/errors'
import { legacySSE } from '../lib/sse'
import type { LLMRequestConfig } from '../llm/provider'
import { chatModel } from '../llm/provider'
import { compressPrompt, mindMapPrompt, nodeExpandPrompt } from '../prompts'
import { llmConfigFrom } from './middleware'

export const chatRoutes = new Hono()

/** 把 streamText 的增量输出按旧协议推给前端 */
function pipeTextStream(c: Context, run: (cfg: LLMRequestConfig) => ReturnType<typeof streamText>) {
  return legacySSE(c, async (emit) => {
    const result = run(llmConfigFrom(c))
    for await (const delta of result.textStream)
      await emit.send(delta)
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
    const { text } = await generateText({
      model: chatModel(llmConfigFrom(c)),
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
