import type { EventSourceMessage } from '@microsoft/fetch-event-source'
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import { http } from './http'
import { StorageKey, storageManager } from '@/utils'

export function compressContentRequest(content: string) {
  return http.post('/compressContent', { content })
}

enum MessageStatus {
  PENDING = 'pending',
  DONE = 'done',
  FAILED = 'failed',
}
class RetriableError extends Error { }
class FatalError extends Error { }

export interface ChatOptions {
  url: string
  data: any
  openHandler?: (response: Response) => void
  messageSendHandler?: (data: any) => void
  messageDoneHandler?: () => void
  messageCloseHandler?: () => void
  errorHandler?: (err: Error) => void
}
export function fetchChat(config: ChatOptions) {
  const controller = new AbortController()

  const handleOpen = async (response: Response) => {
    if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
      config.openHandler && config.openHandler(response)
    }

    else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      const reader = await response.body?.getReader().read()
      if (reader?.value) {
        const errorMessage = new TextDecoder().decode(reader.value)
        throw new FatalError(errorMessage)
      }
      throw new FatalError()
    }

    else {
      throw new FatalError()
    }
  }

  const handleMessage = (ev: EventSourceMessage) => {
    const { status, data } = JSON.parse(ev.data)
    if (status === MessageStatus.PENDING) {
      config.messageSendHandler && config.messageSendHandler(data)
      // store.appendMessage(`${data}`)
    }
    else if (status === MessageStatus.DONE) {
      controller.abort()
      config.messageDoneHandler && config.messageDoneHandler()
      // store.toggleLoading(false)
    }
  }

  const handleClose = () => {
    config.messageCloseHandler && config.messageCloseHandler()
    // chatStore.toggleLoading(false)
    throw new RetriableError()
  }

  const handleError = (err: Error) => {
    config.errorHandler && config.errorHandler(err)
    // chatStore.toggleLoading(false)
    if (err instanceof FatalError)
      throw err
  }

  fetchEventSource(config.url, {
    method: 'POST',
    body: JSON.stringify(config.data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${storageManager.get(StorageKey.OPENAI_KEY)}` || '',
      'OpenAI-proxy': `${storageManager.get(StorageKey.OPENAI_PROXY)}` || '',
    },
    signal: controller.signal,
    onopen: handleOpen,
    onmessage: handleMessage,
    onclose: handleClose,
    onerror: handleError,
  })
  return controller
}
