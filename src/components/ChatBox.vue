<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const modelValue = defineModel<boolean>()
const inputWrapper = ref<HTMLElement | null>(null)
const messages = ref([
  {
    id: 1,
    name: 'Mark',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    content: 'Hello, how are you?',
  },
  {
    id: 2,
    name: 'GPT',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    content: 'I am doing well, thank you. How about you?',
  },
  {
    id: 3,
    name: 'Mark',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    content: 'I am doing great, thanks for asking!',
  },
])
const newMessage = ref('')

function sendMessage() {
  if (newMessage.value.trim() !== '') {
    messages.value.push({
      id: messages.value.length + 1,
      name: 'Mark',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      content: newMessage.value.trim(),
    })
    newMessage.value = ''
  }
  else {
    shake()
  }
}

function shake() {
  inputWrapper.value!.classList.add('shake')

  inputWrapper.value!.addEventListener(
    'animationend',
    () => {
      inputWrapper.value!.classList.remove('shake')
    },
    { once: true },
  )
}
</script>

<template>
  <div
    v-show="modelValue"
    class="border h-[600px] w-[400px] mt-2 shadow-box glass"
  >
    <div class="flex flex-col h-full p-3">
      <div v-if="messages" class="flex-1 overflow-y-auto">
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex items-start mb-4"
        >
          <div class="flex-shrink-0">
            <img
              :src="message.avatar"
              alt="avatar"
              class="w-8 h-8 rounded-full"
            >
          </div>
          <div class="ml-3">
            <div class="text-sm font-medium text-gray-900">
              {{ message.name }}
            </div>
            <div class="mt-1 text-sm text-gray-700">
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
        <div
          ref="inputWrapper"
          class="flex items-center px-4 py-2 bg-gray-100 rounded-md relative"
        >
          <div class="flex-1 mr-2">
            <a-textarea
              v-model:value="newMessage"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Type your message..."
              auto-size
              :press-enter="sendMessage"
            />
          </div>
          <div>
            <a-button type="primary" @click="sendMessage">
              Send
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shake {
  border: 1px solid red;
  animation: shake 0.5s ease-in-out;
}
@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
