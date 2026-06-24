import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { generateText, streamText } from 'ai'
import { Hono } from 'hono'
import { config } from '../config'
import { toUserMessage } from '../lib/errors'
import { legacySSE } from '../lib/sse'
import { chatModel } from '../llm/provider'
import { ragAnswerPrompt } from '../prompts'
import { indexDocument, isIndexed, retrieveChunks } from '../services/rag'
import { llmConfigFrom } from './middleware'

export const documentRoutes = new Hono()

documentRoutes.post('/uploadFile', async (c) => {
  if (config.upload.disabled)
    return c.json({ success: false, message: '该部署已关闭文档上传' }, 403)
  const body = await c.req.parseBody()
  const file = body.files
  if (!(file instanceof File))
    return c.json({ success: false, message: 'No file' }, 400)
  if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf'))
    return c.json({ success: false, message: 'Only PDF is supported' }, 400)
  if (file.size > config.upload.maxBytes)
    return c.json({ success: false, message: `文件超过上限 ${Math.round(config.upload.maxBytes / 1024 / 1024)}MB` }, 413)

  const fileName = `${crypto.randomUUID()}.pdf`
  await fs.promises.writeFile(
    path.join(config.uploadDir, fileName),
    Buffer.from(await file.arrayBuffer()),
  )
  return c.json({ success: true, fileName })
})

documentRoutes.get('/document/fileList', async (c) => {
  try {
    const files = await fs.promises.readdir(config.uploadDir)
    return c.json({ success: true, data: { files } })
  }
  catch (error) {
    return c.json({ success: false, error: (error as Error).message })
  }
})

documentRoutes.post('/document/init', async (c) => {
  const { fileName } = await c.req.json<{ fileName: string }>()
  if (!fileName)
    return c.json({ success: false, message: 'No fileName' }, 400)
  try {
    const success = await indexDocument(fileName, llmConfigFrom(c))
    return c.json({ success })
  }
  catch (error) {
    return c.json({ success: false, message: toUserMessage(error) }, 400)
  }
})

documentRoutes.post('/document/query', async (c) => {
  const { query, fileName, isStream } = await c.req.json<{
    query: string[] | string
    fileName: string
    isStream?: boolean
  }>()
  if (!fileName || !isIndexed(fileName))
    return c.json({ success: false, message: 'Please create index first' }, 400)

  const question = Array.isArray(query) ? query[0] : query
  if (!question)
    return c.json({ success: false, message: 'No query' }, 400)

  const cfg = llmConfigFrom(c)
  const buildPrompt = async () =>
    ragAnswerPrompt(question, await retrieveChunks(fileName, question, cfg))

  if (isStream) {
    return legacySSE(c, async (emit) => {
      const result = streamText({
        model: chatModel(cfg),
        prompt: await buildPrompt(),
        temperature: 0,
        maxOutputTokens: 1024,
      })
      for await (const delta of result.textStream)
        await emit.send(delta)
      await emit.done()
    })
  }

  const { text } = await generateText({
    model: chatModel(cfg),
    prompt: await buildPrompt(),
    temperature: 0,
    maxOutputTokens: 1024,
  })
  return c.json({ success: true, data: { result: { text } } })
})

/** 与旧版 koa-static 行为一致：上传的 PDF 可按文件名直接访问 */
documentRoutes.get('/:fileName{[\\w.-]+\\.pdf}', async (c) => {
  const fileName = path.basename(c.req.param('fileName'))
  const filePath = path.join(config.uploadDir, fileName)
  if (!fs.existsSync(filePath))
    return c.notFound()
  const buffer = await fs.promises.readFile(filePath)
  return c.body(new Uint8Array(buffer), 200, { 'Content-Type': 'application/pdf' })
})
