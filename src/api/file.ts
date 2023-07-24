import type { AxiosProgressEvent } from 'axios'
import axios from 'axios'

export function uploadFileRequest(formData: FormData, handleUploadProgress: (progressEvent: AxiosProgressEvent) => void) {
  return axios.post('/api/uploadFile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: handleUploadProgress,
  })
}
export function getFileListRequest() {
  return axios.get('/api/document/fileList')
}

export function initDocumentRequest(fileName: string) {
  return axios.post('/api/document/init',
    {
      fileName,
    })
}

export function queryDocumentRequest(query: string[], fileName: string) {
  return axios.post('/api/document/query', {
    fileName,
    query,
  })
}
