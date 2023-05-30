<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useChatStore } from '../stores'
import { useLocalTimeString } from '../utils'

// show chat box
const modelValue = defineModel<boolean>()
const inputWrapper = ref<HTMLElement | null>(null)

// message control
const newMessage = ref('')
const isCanClick = computed(() => newMessage.value.trim() !== '')

const chatStore = useChatStore()

function sendMessage() {
  if (newMessage.value.trim() !== '') {
    chatStore.addMessage({
      role: 'user',
      content: newMessage.value.trim(),
      time: useLocalTimeString(),
    })
    chatStore.fetchMessage()
    newMessage.value = ''
  }
}

function handleEnter(e: any) {
  if (e.key === 'Enter' && e.altKey) {
    newMessage.value = `${newMessage.value}\n`
  }
  else if (e.key === 'Enter' && !e.altKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div v-show="modelValue" class="border h-[600px] sm:w-full mt-2 shadow-box glass max-w-[400px]">
    <div class="flex flex-col h-full p-3">
      <div v-if="chatStore.messages" class="flex-1 overflow-y-auto">
        <div
          v-for="message in chatStore.messages" :key="message.id" class="flex items-start mb-4"
        >
          <div class="flex-shrink-0">
            <!-- <img :src="message.avatar" alt="avatar" class="w-8 h-8 rounded-full"> -->
          </div>
          <div class="ml-3">
            <div class="text-base font-semibold">
              {{ message.role }}
            </div>
            <div class="mt-1 text-sm  inline-block break-words">
              {{ message.content }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex justify-center items-center h-full">
        <div class="flex flex-col items-center">
          <Icon icon="teenyicons:box-outline" width="40" />
          <span class="text-gray-400 mt-2">Chat Box</span>
        </div>
      </div>
      <div class="flex-none">
        <div ref="inputWrapper" class="flex items-center px-4 py-2 bg-gray-100 rounded-md relative">
          <div class="flex-1 mr-2">
            <a-textarea
              v-model:value="newMessage" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Type your message..." auto-size @keydown="handleEnter"
            />
          </div>
          <a-button type="primary" :disabled="!isCanClick" @click="sendMessage">
            <template #icon>
              <span class="button-icon mr-1">
                <Icon icon="bi:send-fill" width="14" />
              </span>
            </template>
            Send
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>
