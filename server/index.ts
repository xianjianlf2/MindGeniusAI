/* eslint-disable no-console */
import { PassThrough } from 'node:stream'
import Koa from 'koa'
import { koaBody } from 'koa-body'
import Router from 'koa-router'
import multer from '@koa/multer'
import { HumanChatMessage } from 'langchain/schema'
import { validateFileFormat } from './utils/validateFileFormat.ts'
import { chatStream } from './chatStream.ts'
import { chatMindMap } from './chatMindMap.ts'

enum MessageStatus {
  PENDING = 'pending',
  DONE = 'done',
  FAILED = 'failed',
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`)
  },
})

const app = new Koa()
const router = new Router()
const upload = multer({ storage })
const PORT = 3000

app.use(koaBody())
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT, () => {
  console.log(`open server http://localhost:${PORT}`)
})

router.get('/', (ctx) => {
  ctx.body = 'hello server'
})

function useChatSteam(ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>) {
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

  return {
    messageSend,
    messageDone,
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
  const { messageSend, messageDone } = useChatSteam(ctx)
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
  chatMindMap(generatePrompt(topic), messageSend, messageDone)
})

router.post('/chatNode', async (ctx) => {
  const { content } = ctx.request.body
  if (!content)
    ctx.throw(400, 'No content')
  const { messageSend, messageDone } = useChatSteam(ctx)
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
  chatMindMap(generatePrompt(content), messageSend, messageDone)
})

router.post('/upload', upload.single('file'), async (ctx) => {
  const file = ctx.file
  if (!file)
    ctx.throw(400, 'No file uploaded')

  if (!validateFileFormat(file))
    ctx.throw(400, 'Invalid file format')

  ctx.body = { message: 'Upload success!' }
})
