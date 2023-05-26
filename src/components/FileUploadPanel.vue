<!-- eslint-disable no-console -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { UploadChangeParam } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { ref } from 'vue'

const modelValue = defineModel<boolean>()

const fileList = ref([])

function handleChange(info: UploadChangeParam) {
  if (info.file.status !== 'uploading')
    console.log(info.file, info.fileList)

  if (info.file.status === 'done')
    message.success(`${info.file.name} file uploaded successfully`)
  else if (info.file.status === 'error')
    message.error(`${info.file.name} file upload failed.`)
}

function handleDrop(e: DragEvent) {
  console.log('Dropped files', e.dataTransfer?.files)
}
</script>

<template>
  <div
    v-show="modelValue"
    class="border rounded-lg h-max shadow-box glass mt-2 p-3"
  >
    <div class="flex justify-center items-start h-full w-full inline-block">
      <a-upload-dragger
        v-model:fileList="fileList"
        name="file"
        action="/api/upload"
        @change="handleChange"
        @drop="handleDrop"
      >
        <div class="flex flex-col items-center justify-center">
          <Icon icon="iconamoon:file" width="40" />
          <p class="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p class="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibit from
            uploading company data or other band files
          </p>
        </div>
      </a-upload-dragger>
    </div>
  </div>
</template>

<style scoped>
/* ::v-deep(.ant-upload-wrapper) {
  height: 100%;
} */
</style>
