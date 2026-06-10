import { MessageStatus } from '@mindgenius/shared'
import type { Context } from 'hono'
import { streamSSE } from 'hono/streaming'
import { toUserMessage } from './errors'
import { logger } from './logger'

export interface SseEmitter {
  /** 推送一个增量 token（status: pending），兼容旧前端协议 */
  send: (data: string) => Promise<void>
  /** 结束流（status: done） */
  done: () => Promise<void>
  /** 推送失败信息（status: failed）并结束流 */
  fail: (message: string) => Promise<void>
}

/**
 * 旧协议 SSE 响应：data 为 `{ status: 'pending'|'done'|'failed', data? }` 的 JSON。
 * handler 内任何异常都会被归类为用户可读的 failed 消息。
 */
export function legacySSE(c: Context, handler: (emit: SseEmitter) => Promise<void>) {
  return streamSSE(c, async (stream) => {
    let closed = false
    const write = async (envelope: { status: MessageStatus; data?: string }) => {
      if (closed)
        return
      await stream.writeSSE({ data: JSON.stringify(envelope) })
    }
    const emit: SseEmitter = {
      send: data => write({ status: MessageStatus.PENDING, data }),
      done: async () => {
        await write({ status: MessageStatus.DONE })
        closed = true
      },
      fail: async (message) => {
        await write({ status: MessageStatus.FAILED, data: message })
        closed = true
      },
    }
    try {
      await handler(emit)
    }
    catch (error) {
      logger.error({ err: error }, 'SSE handler failed')
      await emit.fail(toUserMessage(error))
    }
  })
}
