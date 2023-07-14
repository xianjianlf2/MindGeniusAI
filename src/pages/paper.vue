<script setup lang="ts">
import { NButton, NCollapse, NCollapseItem, NDivider, NLayout, NLayoutContent, NLayoutSider, useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useChatStore, useFileStore } from '@/stores'
import InputBox from '@/components/InputBox.vue'
import { useLocalTimeString } from '@/utils'
import PDFViewer from '@/components/PDFViewer.vue'

const fileStore = useFileStore()
const chatStore = useChatStore()
const message = useMessage()
const {
  newMessage,
  isLoading,
  sendMessage,
  // handleStopGenerate,
  // handleReset,
} = useChat()
const headerRef = ref()
const headerRefHeight = ref(0)

onMounted(() => {
  if (!chatStore.findChatWindow(fileStore.currentChatId))
    chatStore.addChatWindow(fileStore.currentChatId)

  headerRefHeight.value = headerRef.value.offsetHeight
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
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <div
      ref="headerRef"
      class="w-full justify-start items-center p-3 bg-#1E293B font-bold text-shadow-lg"
      :class="fileStore.currentFileName ? '' : 'text-amber'"
    >
      {{ fileStore.currentFileName ?? 'No file selected' }}
    </div>
    <div class="flex-1 flex h-[calc(100%-1100px)]" :style="{ height: `calc(100% - ${headerRefHeight}px)` }">
      <NLayout has-sider sider-placement="right">
        <NLayoutContent content-style="padding: 24px;" :native-scrollbar="false">
          <PDFViewer />
        </NLayoutContent>
        <NLayoutSider
          collapse-mode="transform" :native-scrollbar="false" :collapsed-width="120" width="30%"
          show-trigger="bar" content-style="padding: 24px;height: 100%;" bordered
        >
          <div class="flex flex-col h-full w-full">
            <div class="flex justify-between items-center w-full">
              <NCollapse>
                <NCollapseItem title="Summary" name="1">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                  industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                  scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap
                  into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the
                  release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                  software like Aldus PageMaker including versions of Lorem Ipsum
                  <template #header-extra>
                    <NButton strong secondary type="primary">
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
