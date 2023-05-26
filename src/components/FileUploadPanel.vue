<!-- eslint-disable no-console -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { UploadChangeParam } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { ref } from 'vue'

const modelValue = defineModel<boolean>()

const fileList = ref([])

function handleChange(info: UploadChangeParam) {
  const status = info.file.status
  if (status !== 'uploading')
    console.log(info.file, info.fileList)

  if (status === 'done')
    message.success(`${info.file.name} file uploaded successfully.`)
  else if (status === 'error')
    message.error(`${info.file.name} file upload failed.`)
}

function handleDrop(e: DragEvent) {
  console.log('Dropped files', e.dataTransfer?.files)
}
</script>

<template>
  <div v-show="modelValue " class="border  rounded-lg h-[600px] w-[400px] shadow-box glass mt-2">
    <div class="flex justify-center items-center h-full">
      <a-upload-dragger v-model:fileList="fileList" name="file" @change="handleChange" @drop="handleDrop">
        <div class="h-full w-ful flex flex-col items-center justify-center">
          <Icon icon="iconamoon:file" width="40" />
          <p class="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p class="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibit from uploading company data or other
            band files
          </p>
        </div>
      </a-upload-dragger>
    </div>
  </div>
</template>

<style scoped>
::v-deep(.ant-upload-wrapper) {
  height: 100%;
}
</style>
