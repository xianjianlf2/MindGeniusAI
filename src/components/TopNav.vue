<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import ChatBox from './ChatBox.vue'

const showChatBox = ref(false)
</script>

<template>
  <div class="flex justify-between items-center bg-gradient-to-r from-gray-700 via-gray-900 to-black p-3 ">
    <div class="flex items-center justify-center gap-2 text-white cursor-pointer border border-1 border-dashed py-2 px-5 rounded-2xl" @click="showChatBox = true">
      <Icon icon="ic:baseline-search" width="24" />
      <span>Create a mindMap</span>
    </div>

    <!-- <div class="flex gap-2 justify-center items-center">
      <a-button type="text">
        <template #icon>
          <span class="button-icon">
            <Icon icon="bx:save" width="24" color="white" />
          </span>
        </template>
      </a-button>
      <a-button type="text">
        <template #icon>
          <span class="button-icon">
            <Icon icon="mdi:cog" width="24" />
          </span>
        </template>
      </a-button>
    </div> -->
  </div>
  <a-modal v-model:open="showChatBox" title="Talking with gpt" :footer="null" :mask-closable="false">
    <ChatBox />
  </a-modal>
</template>

<style scoped></style>
