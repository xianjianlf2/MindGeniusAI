import axios from 'axios'

export function fetchChat(message: string, messageHistory: string[]) {
  return axios.post('/api/chat', { message, messageHistory })
}
