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
  <div class="w-full" :class="props.message.role === 'user' ? 'user-bubble' : 'robot-bubble'" @mouseenter="showButtonGroup = true" @mouseleave="showButtonGroup = false">
    <div class="w-full flex items-center justify-between p-2 ">
      <div class="text-base font-semibold text-sm h-[28px]">
        {{ props.message.role.toUpperCase() }}
      </div>
      <div v-show="showButtonGroup" class="flex justify-end items-center gap-2">
        <a-button v-if="props.message.role === 'assistant'" type="primary" ghost size="small" @click="nodeStore.generateNode(props.message.content)">
          generate
        </a-button>
        <a-button type="primary" ghost size="small" @click="useCopyText(props.message.content)">
          copy
        </a-button>
        <a-popconfirm
          title="Are you sure delete this message?" ok-text="Yes" cancel-text="No"
          @confirm="confirm(props.message.id)"
        >
          <a href="#">
            <a-button danger ghost size="small">
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
  background: radial-gradient(61.04% 89.69% at 100% 100%, rgba(200, 250, 255, .08) 0%, rgba(28, 210, 229, .08) 40.63%, rgba(28, 210, 229, 0) 100%), radial-gradient(43.78% 64.34% at 60.31% 100%, rgba(23, 74, 228, .08) 0%, rgba(23, 74, 228, 0) 100%), linear-gradient(180deg, rgba(23, 74, 228, 0) 29.44%, rgba(23, 74, 228, .06) 100%), linear-gradient(90deg, #f3f3f7 0%, #ebf0f9 100%)
}
.user-bubble {
  border-radius: 8px;
  padding: 8px;
  background-image: linear-gradient(135deg, #93a5cf 0%, #e4efe9 60%);
}
</style>
