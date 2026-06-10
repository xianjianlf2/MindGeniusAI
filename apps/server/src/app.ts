import { Hono } from 'hono'
import { logger } from './lib/logger'
import { agentRoutes } from './routes/agent'
import { chatRoutes } from './routes/chat'
import { documentRoutes } from './routes/documents'

export function createApp() {
  const app = new Hono()

  app.use('*', async (c, next) => {
    const start = Date.now()
    await next()
    logger.info({ method: c.req.method, path: c.req.path, status: c.res.status, ms: Date.now() - start }, 'request')
  })

  app.get('/', c => c.text('hello server'))
  app.route('/', chatRoutes)
  app.route('/', documentRoutes)
  app.route('/', agentRoutes)

  app.onError((error, c) => {
    logger.error({ err: error, path: c.req.path }, 'unhandled error')
    return c.json({ success: false, message: 'Internal server error' }, 500)
  })

  return app
}
