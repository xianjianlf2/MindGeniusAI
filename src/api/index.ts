import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import { useChatStore } from '../stores'
import type { Message } from '../stores/useChatStore'

// export function fetchChat(message: string, messageHistory: string[]) {
//   return axios.post('/api/chat', { message, messageHistory })
// }

enum MessageStatus {
  PENDING = 'pending',
  DONE = 'done',
  FAILED = 'failed',
}
class RetriableError extends Error { }
class FatalError extends Error { }

function fetchChat(url: string, data: any) {
  const chatStore = useChatStore()
  const controller = new AbortController()
  fetchEventSource(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
    async onopen(response) {
      if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
        // everything's good
        chatStore.toggleLoading(true)
      }
      else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        // client-side errors are usually non-retriable:
        throw new FatalError()
      }
      else {
        throw new RetriableError()
      }
    },
    onmessage(msg) {
      const { status, data } = JSON.parse(msg.data)
      if (status === MessageStatus.PENDING) {
        chatStore.appendMessage(`${data}`)
      }

      else if (status === MessageStatus.DONE) {
        controller.abort()
        chatStore.toggleLoading(false)
      }
    },
    onclose() {
      // if the server closes the connection unexpectedly, retry:
      chatStore.toggleLoading(false)
      throw new RetriableError()
    },
    onerror(err) {
      chatStore.toggleLoading(false)
      if (err instanceof FatalError) {
        throw err // rethrow to stop the operation
      }
      else {
        // do nothing to automatically retry. You can also
        // return a specific retry interval here.
      }
    },
  })
  return controller
}
export function fetchChatStream(messages: Message[]) {
  const controller = fetchChat ('/api/chat', { messages })
  return controller
}

export function chatWithMindMapRequest(topic: string) {
  const controller = fetchChat ('/api/chatMindMap', { topic })
  return controller
}
