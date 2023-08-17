<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, ref } from 'vue'
import { NButton, NPopconfirm } from 'naive-ui'
import { Icon } from '@iconify/vue'
import type { Message } from '@/stores'
import { useChatStore, useNodeStore, useNoteStore } from '@/stores'
import { useCopyText } from '@/utils'
import { useGenerateMarkdown } from '@/hooks/useGenerateMarkdown'
import { messageSuccess } from '@/hooks/message'

const props = defineProps({
  message: {
    type: Object as PropType<Message>,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  messageId: {
    type: String,
    required: true,
  },
})

const showButtonGroup = ref(false)
const nodeStore = useNodeStore()
const chatStore = useChatStore()
const isAssistant = computed(() => props.message.role === 'assistant')
const noteStore = useNoteStore()

function confirm(id: Message['id']) {
  chatStore.removeMessage(id, props.messageId)
}

const robotContent = computed(() => useGenerateMarkdown(props.message.content))

function handleBubbleStyle() {
  if (props.message.role === 'user')
    return 'user-bubble'

  else if (props.isLoading)
    return 'robot-bubble bubble-transition'
  else
    return 'robot-bubble'
}

function handleAddToNote(content: string) {
  messageSuccess('Add to note success!')
  noteStore.addNote(content)
}

function handleGenerateNode(content: string) {
  nodeStore.generateNode(content)
}
</script>

<template>
  <div
    class="w-full" :class="handleBubbleStyle()" @mouseenter="showButtonGroup = true"
    @mouseleave="showButtonGroup = false"
  >
    <div class="w-full flex items-center justify-between p-2 ">
      <div class="text-base font-semibold text-sm h-[28px]">
        {{ props.message.role.toUpperCase() }}
      </div>
      <div v-show="showButtonGroup" class="flex justify-end items-center gap-2">
        <NButton
          v-if="isAssistant" strong secondary type="primary" size="small"
          @click="handleAddToNote(props.message.content)"
        >
          <template #icon>
            <Icon icon="material-symbols:note-alt-outline" />
          </template>
          Note
        </NButton>
        <NButton
          v-if="isAssistant" strong secondary type="primary" size="small"
          @click="handleGenerateNode(props.message.content)"
        >
          <template #icon>
            <Icon icon="material-symbols:map-outline-rounded" />
          </template>
          MindMap
        </NButton>
        <NButton strong secondary type="primary" size="small" @click="useCopyText(props.message.content)">
          <template #icon>
            <Icon icon="material-symbols:content-copy-outline-rounded" />
          </template>
        </NButton>
        <NPopconfirm
          @positive-click="confirm(props.message.id)"
        >
          <template #trigger>
            <NButton size="small" strong secondary type="error">
              <template #icon>
                <Icon icon="material-symbols:delete-forever" />
              </template>
            </NButton>
          </template>
          Are you sure delete this message?
        </NPopconfirm>
      </div>
    </div>
    <div class="mt-1 text-sm inline-block break-words pl-2" v-html="robotContent" />
  </div>
</template>

<style scoped>
@keyframes highlight {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

.bubble-transition {
  background-image: linear-gradient(to right, #2b5876 0%, #4e4376 100%);
  background-position: 100% 0;
  background-size: 200% 100%;
  animation: highlight 2s linear infinite;
}

.robot-bubble {
  border-radius: 8px;
  padding: 8px;
  background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
}

.user-bubble {
  border-radius: 8px;
  padding: 8px;
  background-image: linear-gradient(to right, #243949 0%, #517fa4 100%);
}
</style>
