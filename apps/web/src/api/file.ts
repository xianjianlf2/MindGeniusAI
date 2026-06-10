import type { AxiosProgressEvent } from 'axios'
import { http } from './http'
import { createChatWindowOptions, fetchChat } from '.'

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
export function chatWithDocumentRequest(chatWindowId: string, query: string[], fileName: string) {
  return fetchChat(createChatWindowOptions('/api/document/query', chatWindowId, { query, fileName, isStream: true }))
}
