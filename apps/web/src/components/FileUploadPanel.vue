<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { UploadFileInfo, UploadInst } from 'naive-ui'
import { NButton, NModal, NP, NText, NUpload, NUploadDragger } from 'naive-ui'
import { useFileStore, useLayoutStore } from '@/stores'
import { messageError, messageSuccess } from '@/hooks/message'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
},
)
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const fileList = ref()
const isUploading = ref(false)
const fileListLengthRef = ref(0)
const uploadRef = ref<UploadInst | null>(null)
const fileStore = useFileStore()

function beforeUpload(data: {
  file: UploadFileInfo
  fileList: UploadFileInfo[]
}) {
  const { file } = data
  const allowedExtensions = /\.(pdf)$/i
  if (!allowedExtensions.test(file.name)) {
    messageError('You can only upload PDF files!')
    return false
  }
  fileList.value = [file.file]
  return true
}

async function handleUpload() {
  if (fileList.value.length === 0)
    return messageError('Please upload a PDF file!')

  isUploading.value = true

  const formData = new FormData()
  formData.append('files', fileList.value[0])
  const res = await fileStore.uploadPdf(formData)
  if (res) {
    messageSuccess('Upload success!')
    show.value = false
    const layoutStore = useLayoutStore()
    layoutStore.setCurrentTab('Paper')
  }
  else {
    messageError('Upload failed!')
  }
}

function handleChange(data: { fileList: UploadFileInfo[] }) {
  fileListLengthRef.value = data.fileList.length
}

function handlePreview() {
  const url = URL.createObjectURL(fileList.value[0])
  window.open(url)
}
</script>

<template>
  <NModal v-model:show="show" preset="card" style="width: 600px;" title="Upload" :bordered="false" size="huge">
    <NUpload
      ref="uploadRef" :default-upload="false" directory-dnd :max="1" @before-upload="beforeUpload"
      @change="handleChange"
    >
      <NUploadDragger>
        <div style="margin-bottom: 12px">
          <Icon icon="material-symbols:upload-file-outline-rounded" width="48" color="white" />
        </div>
        <NText style="font-size: 16px">
          Click or drag a file to this area to upload
        </NText>
        <NP depth="3" style="margin: 8px 0 0 0">
          Strictly prohibit from uploading sensitive information. For example,
          your bank card PIN or your credit card expiry date.
        </NP>
      </NUploadDragger>
    </NUpload>
    <div class="w-full flex items-center justify-center mt-3 gap-5">
      <NButton :disabled="!fileListLengthRef" @click="handlePreview">
        Preview
      </NButton>
      <NButton type="primary" :loading="isUploading" :disabled="!fileListLengthRef" @click="handleUpload">
        Generate
      </NButton>
    </div>
  </NModal>
</template>

<style scoped></style>
