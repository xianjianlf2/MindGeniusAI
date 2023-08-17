<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PdfViewerSearchInstance } from '@xianjianlf2/vue-pdf-viewer'
import { PdfViewerSearch } from '@xianjianlf2/vue-pdf-viewer'
import '@xianjianlf2/vue-pdf-viewer/dist/style.css'

const props = defineProps({
  fileName: {
    type: String,
    default: '',
  },
})

const pdfRef = ref<PdfViewerSearchInstance>()
const pdfUrl = ref(props.fileName)
const pageCount = ref(0)
const page = ref('1')
const showAllPage = ref(true)
const containerRef = ref()

watch(() => props.fileName, (newVal) => {
  if (newVal) {
    pdfUrl.value = `api/${newVal}`
    pageCount.value = 0
    page.value = '1'
  }
})
</script>

<template>
  <div v-if="pdfUrl" class="h-full flex flex-col overflow-hidden">
    <div ref="containerRef" class="flex-1">
      <PdfViewerSearch
        ref="pdfRef" v-model:showAllPage="showAllPage" :src="pdfUrl" :show-toolbar="false"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
