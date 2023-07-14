import { to } from 'await-to-js'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosProgressEvent } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { uploadFile } from '@/api/uploadFile'

export const useFileStore = defineStore('fileStore', () => {
  const currentFileName = ref()
  const currentChatId = ref(uuidv4())
  const uploadProgress = ref(0)

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

    const [err, res] = await to(uploadFile(formData, handleProgress))
    if (err)
      return false
    const { success, fileName } = res.data
    if (!success)
      return false

    currentFileName.value = fileName
    currentChatId.value = uuidv4()
    return true
  }

  return {
    currentFileName,
    currentChatId,
    uploadPdf,
  }
})
