import { to } from 'await-to-js'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosProgressEvent } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { getFileListRequest, uploadFileRequest } from '@/api/file'

export const useFileStore = defineStore('fileStore', () => {
  const currentFileName = ref()
  const currentChatId = ref(uuidv4())
  const uploadProgress = ref(0)
  const fileList = ref([])

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
    const [err, res] = await to(getFileListRequest())
    if (err)
      return err

    const { files } = res.data
    fileList.value = files
  }

  return {
    currentFileName,
    currentChatId,
    fileList,
    uploadPdf,
    getFileList,
  }
})
