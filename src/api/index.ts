// import axios from 'axios'
import { fetchEventSource } from '@microsoft/fetch-event-source'

// export function fetchChat(message: string, messageHistory: string[]) {
//   return axios.post('/api/chat', { message, messageHistory })
// }
export function fetchChatStream(message: string, messageHistory: string[]) {
  const ctrl = new AbortController()
  fetchEventSource('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
    }),
    signal: ctrl.signal,
    onmessage: (e) => {
      // eslint-disable-next-line no-console
      console.log(e.data)
    },
  })
  return ctrl
}
