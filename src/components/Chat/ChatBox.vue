<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { throttle } from 'lodash'
import { NButton, useMessage } from 'naive-ui'
import RobotMessage from './RobotMessage.vue'
import { InputBox } from '@/components/Chat'
import { useChatStore } from '@/stores'
import type { ChatType } from '@/hooks'
import { useChat } from '@/hooks'

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
const message = useMessage()
// message control
const chatStore = useChatStore()
const {
  newMessage,
  isLoading,
  sendMessage,
  handleStopGenerate,
  handleReset,
} = useChat(props.id, props.chatType)
const { chatBoxRef } = useScrollChatBox()
const { isContinuous, handleContinuous } = useContinuousDialog()

function useContinuousDialog() {
  const isContinuous = computed(() => chatStore.chatWindows[props.id].isContinuousDialog)
  watch(() => chatStore.chatWindows[props.id].isContinuousDialog, () => {
    if (chatStore.chatWindows[props.id].isContinuousDialog)
      message.info('Continuous dialogue open!')
    else
      message.info('Continuous dialogue close!')
  })
  function handleContinuous() {
    chatStore.toggleContinuousDialog(props.id)
  }
  return { isContinuous, handleContinuous }
}

function useScrollChatBox() {
  const chatBoxRef = ref<HTMLDivElement>()
  watch(
    () => chatStore.chatWindows[props.id].messages,
    () => {
      throttle(scrollToBottom, 300)()
    },
    { immediate: true, deep: true },
  )

  function scrollToBottom() {
    nextTick(() => {
      chatBoxRef.value?.scrollTo({
        top: chatBoxRef.value?.scrollHeight,
        behavior: 'smooth',
      })
    })
  }
  return { chatBoxRef }
}
function switchSend(msg: string) {
  if (props.chatType === 'document') {
    if (!fileNameRef.value)
      return message.error('Please select a file first!')
    sendMessage(msg, undefined, fileNameRef.value)
  }

  else { sendMessage(msg) }
}
</script>

<template>
  <div class=" h-[500px] mt-2  glass relative" :class="border ? 'shadow-box border' : ''">
    <div class="flex flex-col h-full p-3 box-border">
      <div
        v-if="chatStore.chatWindows[id].messages" ref="chatBoxRef"
        class="overflow-y-scroll overflow-x-hidden pr-2 flex-1"
      >
        <div
          v-for="(_message, index) in chatStore.chatWindows[id].messages" :key="_message.id"
          class="flex items-start mb-4"
        >
          <RobotMessage
            :message="_message"
            :is-loading="isLoading && index === chatStore.chatWindows[id].messages.length - 1" :message-id="id"
          />
        </div>
      </div>
      <div v-else class="flex justify-center items-center h-full">
        <div class="flex flex-col items-center">
          <Icon icon="teenyicons:box-outline" width="40" />
          <span class="text-gray-400 mt-2">Chat Box</span>
        </div>
      </div>
      <div class="flex-none">
        <div class="flex items-center">
          <div class="flex-[30%] gap-2 flex">
            <NButton size="small" @click="handleReset">
              <template #icon>
                <span class="button-icon">
                  <Icon icon="carbon:reset" width="18" color="white" />
                </span>
              </template>
            </NButton>
            <NButton size="small" :type="isContinuous ? 'primary' : 'default'" @click="handleContinuous">
              <template #icon>
                <Icon icon="mdi:head-snowflake-outline" width="18" color="white" />
              </template>
            </NButton>
          </div>
          <div class="flex-[60%]">
            <NButton v-show="isLoading" size="small" type="primary" @click="handleStopGenerate">
              <template #icon>
                <Icon icon="mdi:stop" width="18" color="white" />
              </template>
              Stop generating
            </NButton>
          </div>
        </div>

        <InputBox :message="newMessage" :is-loading="isLoading" @send-message="switchSend" />
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  border-radius: 8px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
