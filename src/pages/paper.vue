<script setup lang="ts">
import { NButton, NCollapse, NCollapseItem, NDivider, NEmpty, NLayout, NLayoutContent, NLayoutSider, useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useChatStore, useFileStore } from '@/stores'
import InputBox from '@/components/InputBox.vue'
import { useLocalTimeString } from '@/utils'
import PDFViewer from '@/components/PDFViewer.vue'

const fileStore = useFileStore()
const chatStore = useChatStore()
const message = useMessage()
const currentFileName = ref('')
const {
  newMessage,
  isLoading,
  sendMessage,
  // handleStopGenerate,
  // handleReset,
} = useChat()
const headerRefHeight = ref(0)

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
              <NCollapse default-expanded-names="FileList">
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
                    <NButton>Create Index</NButton>
                  </div>
                </NCollapseItem>
                <NCollapseItem title="Summary" name="Summary">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                  industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                  scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap
                  into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the
                  release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                  software like Aldus PageMaker including versions of Lorem Ipsum
                  <template #header-extra>
                    <NButton strong secondary type="primary" @click.stop="">
                      Generate Mind map
                    </NButton>
                  </template>
                </NCollapseItem>
              </NCollapse>
            </div>
            <NDivider />
            <div class="flex-1 flex flex-col">
              <div class="flex flex-col flex-1">
                chat with document
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
