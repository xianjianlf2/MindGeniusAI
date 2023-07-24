<script setup lang="ts">
import { NButton, NCollapse, NCollapseItem, NDivider, NEmpty, NLayout, NLayoutContent, NLayoutSider, NSpin, useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { DocumentResult, SourceDocument } from './types'
import { useChatStore, useFileStore } from '@/stores'
import InputBox from '@/components/InputBox.vue'
import { useLocalTimeString } from '@/utils'
import PDFViewer from '@/components/PDFViewer.vue'
import { useGenerateMarkdown } from '@/hooks/useGenerateMarkdown'

const fileStore = useFileStore()
const chatStore = useChatStore()
const message = useMessage()
const currentFileName = ref('')
const sourceDocument = ref<{ text: string; sourceList: any[] }>()
const {
  newMessage,
  isLoading,
  sendMessage,
  // handleStopGenerate,
  // handleReset,
} = useChat()
const headerRefHeight = ref(0)

const indexButtonLoading = ref(false)
const summaryLoading = ref(false)

onMounted(() => {
  if (!chatStore.findChatWindow(fileStore.currentChatId))
    chatStore.addChatWindow(fileStore.currentChatId)
})

function useChat() {
  const newMessage = ref('')
  const isLoading = computed(() => {
    if (chatStore.chatWindows[fileStore.currentChatId])
      return chatStore.chatWindows[fileStore.currentChatId].isLoading
    else
      return false
  },
  )
  function sendMessage(message: string) {
    chatStore.addMessage(fileStore.currentChatId, {
      role: 'user',
      content: message,
      time: useLocalTimeString(),
    })
    chatStore.chatWithMindMap(fileStore.currentChatId, message)
  }
  function handleStopGenerate() {
    chatStore.stopGenerate(fileStore.currentChatId)
  }
  function handleReset() {
    chatStore.clearAllMessage(fileStore.currentChatId)
    message.success('Chat box reset!')
  }
  return {
    newMessage,
    isLoading,
    sendMessage,
    handleStopGenerate,
    handleReset,
  }
}

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
    'Please summarize this document in one paragraph, keeping the language as concise as possible.Required: use markdown format',
  ]
  const res = await fileStore.queryDocument(query, currentFileName.value)
  summaryLoading.value = false
  if (typeof res === 'string') {
    message.error(res)
  }
  else {
    message.success('Summary generated!')
    const { sourceDocuments: docs } = res as DocumentResult
    const sourceList = docs.map((doc: SourceDocument) => {
      const { metadata: { loc: { pageNumber } } } = doc
      return pageNumber
    })
    sourceDocument.value = {
      text: useGenerateMarkdown(res.text),
      sourceList,
    }
  }
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
                        <NButton class="border rounded-md p-2">
                          pageNumber: {{ item }}
                        </NButton>
                      </div>
                    </div>
                  </template>
                  <template #header-extra>
                    <NButton strong secondary type="primary" @click.stop="summaryDocument">
                      Generate Mind map
                    </NButton>
                  </template>
                </NCollapseItem>
              </NCollapse>
            </div>
            <NDivider />
            <div class="flex-1 flex flex-col">
              <div class="flex flex-col flex-1">
                <span class="border-b border-dashed p-2">Ask a question about the document</span>
                <div class="flex-1 flex flex-col" />
              </div>
              <InputBox :message="newMessage" :is-loading="isLoading" @send-message="sendMessage" />
            </div>
          </div>
        </NLayoutSider>
      </NLayout>
    </div>
  </div>
</template>

<style scoped></style>
