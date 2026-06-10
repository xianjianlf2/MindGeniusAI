import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { getToken } from '@/utils/token'
import { messageError } from '@/hooks/message'

export const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
})

function requestHandler(config: InternalAxiosRequestConfig<any>) {
  if (getToken())
    config.headers.Authorization = `Bearer ${getToken()}`
  return config
}

http.interceptors.request.use(requestHandler)

http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { success, data, message } = response.data
    if (success) {
      return data
    }
    else {
      messageError(message)
      return Promise.reject(new Error(message))
    }
  })
