/* eslint-disable no-console */
import Koa from 'koa'
import Router from 'koa-router'
import multer from '@koa/multer'

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

router.get('/', (ctx) => {
  ctx.body = 'hello server'
})

router.post('/upload', upload.single('file'), async (ctx) => {
  const file = ctx.file
  console.log(file)
  ctx.body = { message: '上传成功!' }
})

// app.use(
//   koaBody({
//     multipart: false,
//   }),
// )
app.use(router.routes())
app.listen(8888, () => {
  console.log('open server http://localhost:8888')
})
