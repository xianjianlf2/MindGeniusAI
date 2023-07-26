<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NInput, NInputGroup, NSkeleton } from 'naive-ui'
import { PdfViewer } from '@xianjianlf2/vue-pdf-viewer'
import '@xianjianlf2/vue-pdf-viewer/dist/style.css'

type PdfViewerType = InstanceType<typeof PdfViewer>

const props = defineProps({
  fileName: {
    type: String,
    default: '',
  },
})

const pdfRef = ref<PdfViewerType>()
const pdfUrl = ref(props.fileName)
const pageCount = ref(0)
const page = ref('1')
const loading = ref(true)
const showAllPage = ref(true)
const containerRef = ref()
const inputRef = ref()

watch(() => props.fileName, (newVal) => {
  if (newVal) {
    pdfUrl.value = `api/${newVal}`
    pageCount.value = 0
    page.value = '1'
    loading.value = true
  }
})

function handleRendered() {
  if (loading.value) {
    loading.value = false
  }
  else {
    if (pageCount.value === 0)
      pageCount.value = pdfRef.value?.getTotalPageNum() || 0
    page.value = pdfRef.value?.getCurrenPageNum().toString() || '1'
  }
}
function handleJumpPage() {
  const { uncontrolledValue: num } = inputRef.value
  pdfRef.value?.jumpToPage(Number(num))
}
</script>

<template>
  <div v-show="loading">
    <NSkeleton text :repeat="5" />
    <NSkeleton text style="width: 60%" />
  </div>
  <div v-if="pdfUrl" class="h-full flex flex-col overflow-hidden">
    <div class="flex items-center justify-between w-full">
      <div>
        {{ `${page} / ${pageCount}` }}
      </div>
      <div>
        <NInputGroup>
          <NInput ref="inputRef" placeholder="Jump page" />
          <NButton type="primary" ghost @click="handleJumpPage">
            Jump
          </NButton>
        </NInputGroup>
      </div>
    </div>
    <div ref="containerRef">
      <PdfViewer
        ref="pdfRef" v-model:showAllPage="showAllPage" :src="pdfUrl" :show-toolbar="false"
        @rendered="handleRendered"
      />
    </div>
  </div>
</template>

<style scoped></style>
