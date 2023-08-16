<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { NButton, NConfigProvider, NInput, NSpin } from 'naive-ui'
import { useGlobalStore } from '@/stores'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['sendMessage', 'update:message'])

const globalStore = useGlobalStore()
const newMessage = ref(props.message)
const inputWrapper = ref<HTMLElement | null>(null)

const isLoadingRef = computed(() => props.isLoading)
const isCanClick = computed(() => newMessage.value.trim() !== '')

watch(() => props.message, (val) => {
  newMessage.value = val
})

watch(() => newMessage.value, (val) => {
  emit('update:message', val)
})

function sendMessage() {
  if (newMessage.value.trim() !== '') {
    emit('sendMessage', newMessage.value.trim())
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
  <div ref="inputWrapper" class="flex items-center px-4 py-2 rounded-md relative">
    <div class="flex-1 mr-2">
      <NSpin :show="isLoadingRef" size="small">
        <NInput
          v-model:value="newMessage"
          type="text"
          placeholder="Type your message..."
          @keydown.enter="handleEnter"
        />
      </NSpin>
    </div>
    <NConfigProvider :theme="globalStore.theme?.Button">
      <NButton type="primary" :disabled="!isCanClick" @click="sendMessage">
        <template #icon>
          <Icon icon="bi:send-fill" width="14" />
        </template>
        Send
      </NButton>
    </NConfigProvider>
  </div>
</template>

<style scoped>

</style>
