<script setup lang="ts">
import { NButton, NCollapse, NCollapseItem, NDivider, NEmpty, NLayout, NLayoutContent, NLayoutSider, NSpin, NTag, useMessage } from 'naive-ui'
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import type { DocumentResult, SourceDocument } from './types'
import { useChatStore, useFileStore } from '@/stores'
import PDFViewer from '@/components/PDFViewer.vue'
import { useGenerateMarkdown, useRandomColorTag } from '@/hooks'

const router = useRouter()
const fileStore = useFileStore()
const message = useMessage()
const currentFileName = ref('')
const sourceDocument = ref<{ text: string; sourceList: any[] }>()
const chatWindowId = uuidv4()
const headerRefHeight = ref(0)
const chatStore = useChatStore()

const indexButtonLoading = ref(false)
const summaryLoading = ref(false)

function handleRefreshList() {
  fileStore.getFileList()
}

function handleClickFile(fileName: string) {
  currentFileName.value = fileName
}

onMounted(() => {
  fileStore.getFileList()
})

async function handleIndexClick(fileName: string) {
  indexButtonLoading.value = true
  const res = await fileStore.initDocumentIndex(fileName)

  if (res) {
    message.success('Index created!')
    summaryDocument()
    indexButtonLoading.value = false
  }

  else { message.error('Index creation failed!') }
}

async function summaryDocument() {
  summaryLoading.value = true
  const query = [
    `
    Please summarize this document in one paragraph, keeping the language as concise as possible.
    Required: 1. Markdown format  2.Keep the language short and to the point. 3. limit of 200 words 
    `,
  ]
  const res = await fileStore.queryDocument(query, currentFileName.value)
  summaryLoading.value = false
  if (typeof res === 'string') {
    message.error(res)
  }
  else {
    message.success('Summary generated!')
    const { sourceDocuments: docs } = res as DocumentResult
    const sourceList = docs?.map((doc: SourceDocument) => {
      const { metadata: { loc: { pageNumber } } } = doc
      return pageNumber
    }) ?? []
    sourceDocument.value = {
      text: useGenerateMarkdown(res.text),
      sourceList,
    }
  }
}

const ChatBoxAsync = defineAsyncComponent(() => {
  if (!chatStore.findChatWindow(chatWindowId))
    chatStore.addChatWindow(chatWindowId, false)

  return import('@/components/ChatBox.vue')
})

function handleGenerateMap() {
  router.push('/home')
}
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <div class="flex-1 flex h-[calc(100%-1100px)]" :style="{ height: `calc(100% - ${headerRefHeight}px)` }">
      <NLayout has-sider sider-placement="right">
        <NLayoutContent content-style="padding: 24px;" :native-scrollbar="false">
          <PDFViewer :file-name="currentFileName" />
        </NLayoutContent>
        <NLayoutSider
          collapse-mode="transform" :native-scrollbar="false" :collapsed-width="120" width="30%"
          show-trigger="bar" content-style="padding: 24px;height: 100%;" bordered
        >
          <div class="flex flex-col h-full w-full">
            <div class="flex justify-between items-center w-full">
              <NCollapse :default-expanded-names="['FileList', 'Summary']">
                <NCollapseItem title="FileList" name="FileList">
                  <template #header-extra>
                    <NButton strong secondary type="primary" @click.stop="handleRefreshList">
                      <template #icon>
                        <Icon icon="material-symbols:refresh" />
                      </template>
                      Refresh
                    </NButton>
                  </template>
                  <NEmpty v-if="!fileStore.fileList.length" description="Please upload file first" />
                  <div
                    v-for="file in fileStore.fileList" :key="file" class="p-2 m-2 hover:bg-#1E293B rounded-md cursor-pointer select-none flex items-center justify-between" :class="currentFileName === file ? 'bg-#1E293B' : ''"
                    @click="handleClickFile(file)"
                  >
                    <span>{{ file }}</span>
                    <NButton :loading="indexButtonLoading && currentFileName === file" @click.prevent="handleIndexClick(file)">
                      Create Index
                    </NButton>
                  </div>
                </NCollapseItem>
                <NCollapseItem title="Summary" name="Summary">
                  <NSpin v-if="summaryLoading" size="medium" />
                  <template v-else>
                    <div class="font-semibold  text-shadow-md" v-html="sourceDocument?.text" />
                    <div v-for="(item, index) in sourceDocument?.sourceList" :key="index">
                      <div class="gap-2 items-center justify-start flex mt-4">
                        <div class="font-semibold text-shadow-md">
                          source:
                        </div>
                        <NTag :type="useRandomColorTag(index)">
                          pageNumber: {{ item }}
                        </NTag>
                      </div>
                    </div>
                  </template>
                </NCollapseItem>
              </NCollapse>
            </div>
            <NDivider />
            <div class="flex-1 flex flex-col">
              <div class="flex flex-col flex-1">
                <div class="flex items-center justify-between">
                  <span>Ask a question about the document</span>
                  <NButton strong secondary type="primary" @click.stop="handleGenerateMap">
                    Generate Mind map
                  </NButton>
                </div>
              </div>
              <ChatBoxAsync :id="chatWindowId" :file-name="currentFileName" chat-type="document" :border="false" />
            </div>
          </div>
        </NLayoutSider>
      </NLayout>
    </div>
  </div>
</template>

<style scoped></style>
