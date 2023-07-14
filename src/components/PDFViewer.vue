<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { NInput, NSkeleton } from 'naive-ui'

const pdfRef = ref()
const pdfViewer = ref()
const pdfViewerWidth = ref(0)
const source = ref()
const pageCount = ref(0)
const page = ref('1')
const loading = ref(true)

function handleDocumentRendered() {
  pageCount.value = pdfRef.value.pageCount
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
    source.value = 'api/e72bdf6d063e0bf1c86763600.pdf'
    nextTick(() => {
      pdfViewerWidth.value = pdfViewer.value.offsetWidth
    })
  }, 1000)
})
</script>

<template>
  <template v-if="loading">
    <NSkeleton text :repeat="2" />
    <NSkeleton text style="width: 60%" />
  </template>
  <template v-else>
    <div class="flex justify-between items-center  flex-col">
      <div class="w-full px-3 py-5 flex items-center justify-end">
        <NInput v-model:value="page" type="text" style="width: 30px;" size="small" />
        <span class="ml-2">{{ `/ ${pageCount}` }}</span>
      </div>
      <div ref="pdfViewer" class="flex flex-1 w-full h-full">
        <VuePdfEmbed
          ref="pdfRef" :source="source" :page="Number(page)" :width="pdfViewerWidth"
          :disable-text-layer="false"
          @rendered="handleDocumentRendered"
        />
      </div>
    </div>
  </template>
</template>

<style scoped></style>
