import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { config } from './config'
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

  // 所有 API 统一挂在 /api 下，与前端 baseURL 一致，无需代理剥前缀
  app.get('/api/health', c => c.json({ ok: true }))
  app.route('/api', chatRoutes)
  app.route('/api', documentRoutes)
  app.route('/api', agentRoutes)

  // 设置 WEB_DIR 时单进程一体化：API 之后兜底托管已构建的 web 产物
  if (config.webDir) {
    const root = config.webDir
    app.use('*', serveStatic({ root }))
    // SPA 回退：非 API 路由一律回 index.html（API 404 仍返回 JSON）
    app.get('*', async (c, next) => {
      if (c.req.path.startsWith('/api/'))
        return next()
      return serveStatic({ root, rewriteRequestPath: () => '/index.html' })(c, next)
    })
  }

  app.onError((error, c) => {
    logger.error({ err: error, path: c.req.path }, 'unhandled error')
    return c.json({ success: false, message: 'Internal server error' }, 500)
  })

  return app
}
