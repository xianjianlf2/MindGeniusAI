import type { EventSourceMessage } from '@microsoft/fetch-event-source'
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import type { SseEnvelope } from '@mindgenius/shared'
import { MessageStatus } from '@mindgenius/shared'
import { StorageKey, storageManager } from '@/utils/storage'

class FatalError extends Error {}

export interface StreamOptions {
  url: string
  data: unknown
  onOpen?: () => void
  onMessage: (data: string) => void
  onDone: () => void
  onError?: (message: string) => void
}

/** POST + SSE 流式请求，envelope 协议见 @mindgenius/shared */
export function fetchStream(options: StreamOptions): AbortController {
  const controller = new AbortController()

  fetchEventSource(options.url, {
    method: 'POST',
    body: JSON.stringify(options.data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${storageManager.get(StorageKey.OPENAI_KEY) ?? ''}`,
      'OpenAI-proxy': storageManager.get(StorageKey.OPENAI_PROXY) ?? '',
      'X-LLM-Provider': storageManager.get(StorageKey.LLM_PROVIDER) ?? '',
      'X-LLM-Model': storageManager.get(StorageKey.LLM_MODEL) ?? '',
    },
    signal: controller.signal,
    openWhenHidden: true,
    async onopen(response) {
      if (response.ok && response.headers.get('content-type')?.includes(EventStreamContentType)) {
        options.onOpen?.()
        return
      }
      const body = await response.text().catch(() => '')
      throw new FatalError(body || `Request failed with status ${response.status}`)
    },
    onmessage(event: EventSourceMessage) {
      const envelope = JSON.parse(event.data) as SseEnvelope
      if (envelope.status === MessageStatus.PENDING && envelope.data !== undefined) {
        options.onMessage(envelope.data)
      }
      else if (envelope.status === MessageStatus.DONE) {
        controller.abort()
        options.onDone()
      }
      else if (envelope.status === MessageStatus.FAILED) {
        controller.abort()
        options.onError?.(envelope.data ?? 'Request failed')
        options.onDone()
      }
    },
    onclose() {
      options.onDone()
    },
    onerror(error) {
      options.onError?.(error instanceof Error ? error.message : String(error))
      throw error // 终止 fetchEventSource 内部重试
    },
  })

  return controller
}
