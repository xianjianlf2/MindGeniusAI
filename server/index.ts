/* eslint-disable no-console */
import { PassThrough } from 'node:stream'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fs from 'node:fs'
import Koa from 'koa'
import { koaBody } from 'koa-body'
import Router from 'koa-router'
import { HumanChatMessage } from 'langchain/schema'
import type formidable from 'formidable'
import Server from 'koa-static'
import { chatStream } from './chatStream.ts'
import { chatMindMap } from './chatMindMap.ts'
import { configureProxyEnvironment, isEmptyKey } from './utils/useOpenAIProxy.ts'
import { initialDocument, queryDocument } from './initialDocument.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
enum MessageStatus {
  PENDING = 'pending',
  DONE = 'done',
  FAILED = 'failed',
}
const app = new Koa()
const router = new Router()
const PORT = 3000

app.use(koaBody({
  encoding: 'utf-8',
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/uploads/'),
    keepExtensions: true,
  },
}))
app.use(Server(path.join(__dirname, '/uploads/')))

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT, () => {
  console.log(`open server http://localhost:${PORT}`)
})

router.get('/', (ctx) => {
  ctx.body = 'hello server'
})

function useChatSteam(ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, object>, any>) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  }
  ctx.set(headers)
  const sseStream = new PassThrough()
  ctx.body = sseStream
  const sendData = (data: string) => {
    sseStream.write(`id: ${Date.now()}\n`)
    sseStream.write('type: message\n')
    sseStream.write(`data: ${data}\n\n`)
  }
  function messageSend(token: string) {
    const message = {
      status: MessageStatus.PENDING,
      data: token,
    }
    sendData(JSON.stringify(message))
  }
  function messageDone() {
    const message = {
      status: MessageStatus.DONE,
    }
    sendData(JSON.stringify(message))
    sseStream.end()
  }
  function messageError(e: string) {
    ctx.status = 400
    sseStream.write(e)
    sseStream.end()
  }

  return {
    messageSend,
    messageDone,
    messageError,
  }
}

router.post('/chat', async (ctx) => {
  let { messages } = ctx.request.body
  if (!messages)
    ctx.throw(400, 'No message')

  if (!Array.isArray(messages) && typeof messages === 'string')
    messages = [messages]

  const { messageSend, messageDone } = useChatSteam(ctx)
  chatStream(messages, messageSend, messageDone)
})

router.post('/chatWithFile', async (ctx) => {
  let { messages } = ctx.request.body
  if (!messages)
    ctx.throw(400, 'No message')

  if (!Array.isArray(messages) && typeof messages === 'string')
    messages = [messages]

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  }
  ctx.set(headers)
  const sseStream = new PassThrough()
  ctx.body = sseStream
})

router.post('/chatMindMap', async (ctx) => {
  const { topic } = ctx.request.body
  if (!topic)
    ctx.throw(400, 'No topic')
  if (isEmptyKey(ctx))
    ctx.throw(400, 'Please set openai key')

  function generatePrompt(topic: string) {
    let prompt: HumanChatMessage
    const pattern = /[\u4E00-\u9FA5]+/
    if (pattern.test(topic)) {
      prompt = new HumanChatMessage(
      `为主题${topic}创建一个思维导图/指南
        要求：
        1.使用markdown
        2.语言简洁
        3.通常有3个级别
      `)
    }
    else {
      prompt = new HumanChatMessage(
      `create a road map / guide line for the topic ${topic}
        requirement:
        1.use markdown
        2.short language is preferred
        3.usually, there are 3 levels
      `)
    }
    return prompt
  }

  chatMindMap(generatePrompt(topic), useChatSteam(ctx),
    configureProxyEnvironment(ctx))
})

router.post('/chatNode', async (ctx) => {
  const { content } = ctx.request.body
  if (!content)
    ctx.throw(400, 'No content')
  if (isEmptyKey(ctx))
    ctx.throw(400, 'Please set openai key')
  function generatePrompt(content: string) {
    let prompt: HumanChatMessage
    const pattern = /[\u4E00-\u9FA5]+/
    if (pattern.test(content)) {
      prompt = new HumanChatMessage(
      `为${content}创建三点
        要求：
        1.使用markdown
        2.语言简洁
      `)
    }
    else {
      prompt = new HumanChatMessage(
      `create three points for ${content}
        requirement:
        1.use markdown
        2.short language is preferred
      `)
    }
    return prompt
  }
  chatMindMap(generatePrompt(content), useChatSteam(ctx), configureProxyEnvironment(ctx))
})

router.post('/uploadFile', async (ctx) => {
  const file = ctx.request.files
  if (!file || Object.keys(file).length === 0) {
    ctx.status = 400
    ctx.body = {
      success: false,
      message: 'No file',
    }
  }
  const fileName = ((ctx.request.files!).files as formidable.File).newFilename

  ctx.body = {
    success: true,
    fileName,
  }
},
)

router.get('/document/fileList', async (ctx) => {
  const directoryPath = path.join(__dirname, 'uploads')
  try {
    const files = await fs.promises.readdir(directoryPath)
    ctx.body = {
      success: true,
      files,
    }
  }
  catch (err: any) {
    console.log(`Unable to scan directory: ${err}`)
    ctx.body = {
      success: false,
      error: err.message,
    }
  }
})

router.post('/document/init', async (ctx) => {
  const { fileName } = ctx.request.body
  const vectorStore = await initialDocument(fileName)
  ctx.body = {
    success: !!vectorStore,
  }
})

router.post('/document/query', async (ctx) => {
  const { query, fileName } = ctx.request.body
  const result = await queryDocument(query[0], fileName)
  if (!result) {
    ctx.body = {
      success: false,
      message: 'Please create index first',
    }
    return
  }
  ctx.body = {
    success: true,
    result,
  }
})
