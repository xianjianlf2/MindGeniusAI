/* eslint-disable no-console */
import Koa from 'koa'
import { koaBody } from 'koa-body'
import Router from 'koa-router'
import multer from '@koa/multer'
import { validateFileFormat } from './utils/validateFileFormat.ts'
import { chatStream } from './chatStream.ts'

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

router.post('/chat', async (ctx) => {
  ctx.header['content-type'] = 'text/event-stream'
  ctx.header['cache-control'] = 'no-cache'
  ctx.header.connection = 'keep-alive'
  ctx.status = 200
  function messageSend(token: string) {
    ctx.body = {
      status: 'pending',
      message: token,
    }
  }
  function messageDone() {
    ctx.body = {
      statue: 'done',
      message: '',
    }
  }
  const res = await chatStream(ctx, messageSend, messageDone)
  // ctx.body = res
})

router.post('/upload', upload.single('file'), async (ctx) => {
  const file = ctx.file
  if (!file)
    ctx.throw(400, 'No file uploaded')

  if (!validateFileFormat(file))
    ctx.throw(400, 'Invalid file format')

  ctx.body = { message: 'Upload success!' }
})
