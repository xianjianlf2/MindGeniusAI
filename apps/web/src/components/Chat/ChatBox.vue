<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { throttle } from 'lodash'
import { NEmpty, NScrollbar } from 'naive-ui'
import RobotMessage from './RobotMessage.vue'
import ChatBoxFooter from './ChatBoxFooter.vue'
import { InputBox } from '@/components/Chat'
import { useChatStore } from '@/stores'
import type { ChatType } from '@/hooks'
import { useChat } from '@/hooks'
import { messageError, messageInfo } from '@/hooks/message'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
  },
  chatType: {
    type: String as PropType<ChatType>,
    default: 'mindmap',
  },
  border: {
    type: Boolean,
    default: true,
  },
})

const fileNameRef = computed(() => props.fileName)

// message control
const chatStore = useChatStore()
const {
  newMessage,
  isLoading,
  sendMessage,
  handleStopGenerate,
  handleReset,
} = useChat(props.id, props.chatType)
const chatBoxRef = useScrollChatBox()
const { isContinuous, handleContinuous } = useContinuousDialog()

function useContinuousDialog() {
  const isContinuous = computed(() => chatStore.chatWindows[props.id].isContinuousDialog)
  watch(() => chatStore.chatWindows[props.id].isContinuousDialog, () => {
    if (chatStore.chatWindows[props.id].isContinuousDialog)
      messageInfo('Continuous dialogue open!')
    else
      messageInfo('Continuous dialogue close!')
  })
  function handleContinuous() {
    chatStore.toggleContinuousDialog(props.id)
  }
  return { isContinuous, handleContinuous }
}

function useScrollChatBox() {
  const chatBoxRef = ref()
  watch(
    () => chatStore.chatWindows[props.id].messages,
    () => {
      throttle(scrollToBottom, 500)()
    },
    { immediate: true, deep: true },
  )

  function scrollToBottom() {
    nextTick(() => {
      chatBoxRef.value?.scrollTo({
        position: 'bottom',
        behavior: 'smooth',
      })
    })
  }
  return chatBoxRef
}
function switchSend(msg: string) {
  if (props.chatType === 'document') {
    if (!fileNameRef.value)
      return messageError('Please select a file first!')
    sendMessage(msg, undefined, fileNameRef.value)
  }

  else { sendMessage(msg) }
}
</script>

<template>
  <div class=" h-[500px] mt-2  glass relative" :class="border ? 'shadow-box border' : ''">
    <div class="flex flex-col h-full p-3 box-border">
      <NScrollbar v-if="chatStore.chatWindows[id].messages" ref="chatBoxRef">
        <div
          v-for="(_message, index) in chatStore.chatWindows[id].messages" :key="_message.id"
          class="flex items-start mb-4"
        >
          <RobotMessage
            :message="_message"
            :is-loading="isLoading && index === chatStore.chatWindows[id].messages.length - 1" :message-id="id"
          />
        </div>
      </NScrollbar>

      <div v-else class="flex justify-center items-center h-full">
        <NEmpty description="Chat Box">
          <template #icon>
            <Icon icon="teenyicons:box-outline" width="40" />
          </template>
        </NEmpty>
      </div>
      <div class="flex-none">
        <ChatBoxFooter :is-continuous="isContinuous" :is-loading="isLoading" @continuous="handleContinuous" @reset="handleReset" @stop-generate="handleStopGenerate" />

        <InputBox :message="newMessage" :is-loading="isLoading" @send-message="switchSend" />
      </div>
    </div>
  </div>
</template>
