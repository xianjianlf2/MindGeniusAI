import type { AxiosProgressEvent } from 'axios'
import { http } from './http'
import type { ChatOptions } from '.'
import { fetchChat } from '.'
import { useChatStore } from '@/stores'

export function uploadFileRequest(formData: FormData, handleUploadProgress: (progressEvent: AxiosProgressEvent) => void) {
  return http.post('/uploadFile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: handleUploadProgress,
  })
}
export function getFileListRequest() {
  return http.get('/document/fileList')
}

export function initDocumentRequest(fileName: string) {
  return http.post('/document/init',
    {
      fileName,
    })
}

export function queryDocumentRequest(query: string[], fileName: string) {
  return http.post('/document/query', {
    fileName,
    query,
  })
}
function useChatStoreConfig(chatWindowId: string, data: any) {
  const chatStore = useChatStore()
  const config: ChatOptions = {
    url: '/api/document/query',
    data,
    openHandler: () => {
      chatStore.toggleLoading(chatWindowId, true)
    },
    messageSendHandler: (data) => {
      chatStore.appendMessage(chatWindowId, `${data}`)
    },
    messageDoneHandler: () => {
      chatStore.toggleLoading(chatWindowId, false)
    },
    messageCloseHandler: () => {
      chatStore.toggleLoading(chatWindowId, false)
    },
    errorHandler: () => {
      chatStore.toggleLoading(chatWindowId, false)
    },
  }
  return config
}

export function chatWithDocumentRequest(chatWindowId: string, query: string[], fileName: string) {
  const config = useChatStoreConfig(chatWindowId, { query, fileName, isStream: true })
  return fetchChat(config)
}
