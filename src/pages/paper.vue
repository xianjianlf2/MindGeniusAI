<script setup lang="ts">
import { NLayout, NLayoutContent, NLayoutSider } from 'naive-ui'
import { ref } from 'vue'
import { PDFViewer, PdfSider } from '@/components/PDF'

const currentFileName = ref('')
const headerRefHeight = ref(0)

function handleChangeFileName(fileName: string) {
  currentFileName.value = fileName
}
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <div class="flex-1 flex h-[calc(100%-1100px)]" :style="{ height: `calc(100% - ${headerRefHeight}px)` }">
      <NLayout has-sider sider-placement="right">
        <NLayoutContent content-style="padding: 16px;height:100%" :native-scrollbar="false">
          <PDFViewer :file-name="currentFileName" />
        </NLayoutContent>
        <NLayoutSider
          collapse-mode="transform" :native-scrollbar="false" :collapsed-width="120" width="30%"
          show-trigger="bar" content-style="padding: 24px;height: 100%;" bordered
        >
          <PdfSider @change-file="handleChangeFileName" />
        </NLayoutSider>
      </NLayout>
    </div>
  </div>
</template>

<style scoped>
</style>
