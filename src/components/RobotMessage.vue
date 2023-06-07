<script setup lang="ts">
import type { PropType } from 'vue'
import { ref } from 'vue'
import type { Message } from '../stores/useChatStore'
import { useNodeStore } from '../stores'

defineProps({
  message: {
    type: Object as PropType<Message>,
    required: true,
  },
})

const showButtonGroup = ref(false)

const nodeStore = useNodeStore()
</script>

<template>
  <div class="w-full" @mouseenter="showButtonGroup = true" @mouseleave="showButtonGroup = false">
    <div class="w-full flex items-center justify-between p-2">
      <span class="text-base font-semibold ">{{ message.role }}</span>
      <div v-show="showButtonGroup" class="flex justify-end items-center gap-2">
        <a-button type="primary" ghost size="small" @click="nodeStore.generateNode(message.content)">
          generate
        </a-button>
        <a-button type="primary" ghost size="small">
          copy
        </a-button>
        <a-button danger ghost size="small">
          delete
        </a-button>
      </div>
    </div>
    <div class="mt-1 text-sm inline-block break-words" v-html="message.content" />
  </div>
</template>

<style scoped>

</style>
