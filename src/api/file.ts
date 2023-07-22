import type { AxiosProgressEvent } from 'axios'
import axios from 'axios'

export function uploadFileRequest(formData: FormData, handleUploadProgress: (progressEvent: AxiosProgressEvent) => void) {
  return axios.post('/api/uploadFile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: handleUploadProgress,
  })
}
export function getFileListRequest() {
  return axios.get('/api/getFileList')
}
