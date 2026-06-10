import axios from 'axios'
import { StorageKey, storageManager } from '@/utils/storage'

export const http = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

http.interceptors.request.use((config) => {
  const key = storageManager.get(StorageKey.OPENAI_KEY)
  if (key)
    config.headers.Authorization = `Bearer ${key}`
  const proxy = storageManager.get(StorageKey.OPENAI_PROXY)
  if (proxy)
    config.headers['OpenAI-proxy'] = proxy
  return config
})

http.interceptors.response.use((response) => {
  return response.data
})
