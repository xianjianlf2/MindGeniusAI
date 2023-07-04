<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { message } from 'ant-design-vue'
import { throttle } from 'lodash'
import { useChatStore } from '../stores'
import { useLocalTimeString } from '../utils'
import RobotMessage from './RobotMessage.vue'
import InputBox from './InputBox.vue'

// message control
const chatStore = useChatStore()
const {
  newMessage,
  isLoading,
  sendMessage,
  handleStopGenerate,
  handleReset,
} = useChat()
const { chatBoxRef } = useScrollChatBox()
const { isContinuous, handleContinuous } = useContinuousDialog()

function useChat() {
  const newMessage = ref('')
  const isLoading = computed(() => chatStore.isLoading)
  function sendMessage(message: string) {
    chatStore.addMessage({
      role: 'user',
      content: message,
      time: useLocalTimeString(),
    })
    chatStore.chatWithMindMap(message)
  }
  function handleStopGenerate() {
    chatStore.stopGenerate()
  }
  function handleReset() {
    chatStore.clearAllMessage()
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

function useContinuousDialog() {
  const isContinuous = computed(() => chatStore.isContinuousDialog)
  watch(() => chatStore.isContinuousDialog, () => {
    if (chatStore.isContinuousDialog)
      message.info('Continuous dialogue open!')
    else
      message.info('Continuous dialogue close!')
  })
  function handleContinuous() {
    chatStore.toggleContinuousDialog()
  }
  return { isContinuous, handleContinuous }
}

function useScrollChatBox() {
  const chatBoxRef = ref<HTMLDivElement>()
  watch(
    () => chatStore.messages,
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
</script>

<template>
  <div class="border h-[500px] mt-2 shadow-box glass relative">
    <div class="flex flex-col h-full p-3">
      <div v-if="chatStore.messages" ref="chatBoxRef" class="flex-1 overflow-y-auto">
        <div v-for="(_message, index) in chatStore.messages" :key="_message.id" class="flex items-start mb-4">
          <RobotMessage :message="_message" :is-loading="isLoading && index === chatStore.messages.length - 1" />
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
            <a-button size="small" @click="handleReset">
              <template #icon>
                <span class="button-icon">
                  <Icon icon="carbon:reset" width="18" color="white" />
                </span>
              </template>
            </a-button>
            <a-button size="small" :type="isContinuous ? 'primary' : ''" @click="handleContinuous">
              <template #icon>
                <span class="button-icon">
                  <Icon icon="mdi:head-snowflake-outline" width="18" color="white" />
                </span>
              </template>
            </a-button>
          </div>
          <div class="flex-[60%]">
            <a-button v-show="isLoading" size="small" type="primary" @click="handleStopGenerate">
              <template #icon>
                <span class="button-icon">
                  <Icon icon="mdi:stop" width="18" color="white" />
                </span>
              </template>
              Stop generating
            </a-button>
          </div>
        </div>

        <InputBox :message="newMessage" :is-loading="isLoading" @send-message="sendMessage" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
