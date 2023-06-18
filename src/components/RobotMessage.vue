<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, ref } from 'vue'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { mangle } from 'marked-mangle'
import type { Message } from '../stores/useChatStore'
import { useChatStore } from '../stores/useChatStore'
import { useNodeStore } from '../stores'
import { useCopyText } from '@/utils'

const props = defineProps({
  message: {
    type: Object as PropType<Message>,
    required: true,
  },
})

const showButtonGroup = ref(false)

const nodeStore = useNodeStore()
const chatStore = useChatStore()

marked.use(mangle())

function confirm(id: Message['id']) {
  chatStore.removeMessage(id)
}

const robotContent = computed(() => {
  const markdownString = DOMPurify.sanitize(props.message.content)
  return marked.parse(markdownString)
})
</script>

<template>
  <div
    class="w-full" :class="props.message.role === 'user' ? 'user-bubble' : 'robot-bubble'"
    @mouseenter="showButtonGroup = true" @mouseleave="showButtonGroup = false"
  >
    <div class="w-full flex items-center justify-between p-2 ">
      <div class="text-base font-semibold text-sm h-[28px]">
        {{ props.message.role.toUpperCase() }}
      </div>
      <div v-show="showButtonGroup" class="flex justify-end items-center gap-2">
        <a-button
          v-if="props.message.role === 'assistant'" type="primary" size="small"
          @click="nodeStore.generateNode(props.message.content)"
        >
          generate
        </a-button>
        <a-button type="primary" size="small" @click="useCopyText(props.message.content)">
          copy
        </a-button>
        <a-popconfirm
          title="Are you sure delete this message?" ok-text="Yes" cancel-text="No"
          @confirm="confirm(props.message.id)"
        >
          <a href="#">
            <a-button danger size="small" type="primary">
              delete
            </a-button></a>
        </a-popconfirm>
      </div>
    </div>
    <div class="mt-1 text-sm inline-block break-words pl-2" v-html="robotContent" />
  </div>
</template>

<style scoped>
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
