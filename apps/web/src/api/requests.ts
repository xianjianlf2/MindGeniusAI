import { http } from './http'

interface ApiResult<T = unknown> {
  success: boolean
  message?: string
  data?: T
  fileName?: string
}

export function uploadFileRequest(formData: FormData, onProgress?: (percent: number) => void) {
  return http.post<never, ApiResult>('/uploadFile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total)
        onProgress?.(Math.round((event.loaded / event.total) * 100))
    },
  })
}

export function getFileListRequest() {
  return http.get<never, ApiResult<{ files: string[] }>>('/document/fileList')
}

export function initDocumentRequest(fileName: string) {
  return http.post<never, ApiResult>('/document/init', { fileName })
}

export function compressContentRequest(content: string) {
  return http.post<never, ApiResult<{ result: string }>>('/compressContent', { content })
}
