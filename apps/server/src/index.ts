import fs from 'node:fs'
import { serve } from '@hono/node-server'
import { createApp } from './app'
import { config } from './config'
import { logger } from './lib/logger'

fs.mkdirSync(config.uploadDir, { recursive: true })

const app = createApp()

serve({ fetch: app.fetch, port: config.port }, (info) => {
  logger.info(`open server http://localhost:${info.port}`)
})
