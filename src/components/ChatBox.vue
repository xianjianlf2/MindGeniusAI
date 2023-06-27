<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useChatStore } from '../stores'
import { useLocalTimeString } from '../utils'
import RobotMessage from './RobotMessage.vue'
import InputBox from './InputBox.vue'

// message control
const newMessage = ref('')
const chatStore = useChatStore()
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
</script>

<template>
  <div class="border h-[500px] mt-2 shadow-box glass relative">
    <div class="flex flex-col h-full p-3">
      <div v-if="chatStore.messages" class="flex-1 overflow-y-auto">
        <div v-for="(message, index) in chatStore.messages" :key="message.id" class="flex items-start mb-4">
          <RobotMessage :message="message" :is-loading="isLoading && index === chatStore.messages.length - 1" />
        </div>
      </div>
      <div v-else class="flex justify-center items-center h-full">
        <div class="flex flex-col items-center">
          <Icon icon="teenyicons:box-outline" width="40" />
          <span class="text-gray-400 mt-2">Chat Box</span>
        </div>
      </div>
      <div class="flex-none">
        <InputBox :message="newMessage" :is-loading="isLoading" @send-message="sendMessage" />
      </div>
      <div v-show="isLoading" class="absolute bottom-18 w-full items-center justify-center flex">
        <a-button type="primary" style="display:flex;justify-content: center;align-items: center;" @click="handleStopGenerate">
          <template #icon>
            <Icon icon="mdi:stop" width="24" />
          </template>
          Stop generating
        </a-button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
