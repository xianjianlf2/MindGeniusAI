import type { AxiosProgressEvent } from 'axios'
import axios from 'axios'

export function uploadFile(formData: FormData, handleUploadProgress: (progressEvent: AxiosProgressEvent) => void) {
  return axios.post('/api/uploadFile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: handleUploadProgress,
  })
}
