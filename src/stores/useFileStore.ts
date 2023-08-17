import { to } from 'await-to-js'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosProgressEvent } from 'axios'
import { getFileListRequest, initDocumentRequest, queryDocumentRequest, uploadFileRequest } from '@/api/file'
import { messageError } from '@/hooks/message'

export const useFileStore = defineStore('fileStore', () => {
  const uploadProgress = ref(0)
  const fileList = ref<string[]>([])

  function handleProgress(event: AxiosProgressEvent) {
    if (!event.total)
      return
    uploadProgress.value = Math.round((event.loaded * 100) / event.total)
  }
  function resetUploadProgress() {
    uploadProgress.value = 0
  }

  async function uploadPdf(formData: FormData) {
    resetUploadProgress()

    const [err, res] = await to(uploadFileRequest(formData, handleProgress))
    if (err)
      return false
    const { success } = res.data
    if (!success)
      return false

    return true
  }

  async function getFileList() {
    const res = await getFileListRequest()
    const { files } = res as any
    fileList.value = files
  }
  async function initDocumentIndex(fileName: string) {
    const [err, res] = await to(initDocumentRequest(fileName))
    if (err)
      return err

    const { success } = res.data
    return success
  }
  async function queryDocument(query: string[], fileName: string) {
    const res = await queryDocumentRequest(query, fileName)
    if (!res) {
      messageError('something went wrong')
      return false
    }
    const { result } = res as any
    return result
  }

  return {
    fileList,
    uploadPdf,
    getFileList,
    initDocumentIndex,
    queryDocument,
  }
})
