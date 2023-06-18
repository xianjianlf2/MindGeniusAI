<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import ChatBox from './ChatBox.vue'
import ShareCard from './ShareCard.vue'

const showChatBox = ref(false)
const showShareCard = ref(false)

function handleOpenGitHub() {
  window.open('https://github.com/xianjianlf2/MindGeniusAI', '_blank')
}
</script>

<template>
  <div class="bg-#1e293b flex justify-between items-center p-3">
    <a-button type="primary" @click="showChatBox = true">
      Get Start
    </a-button>
    <div class="items-center flex justify-center gap-2">
      <a-button type="text" @click="showShareCard = true">
        <template #icon>
          <span class="button-icon">
            <Icon icon="material-symbols:share" width="24" color="white" />
          </span>
        </template>
      </a-button>
      <a-button type="text" @click="handleOpenGitHub">
        <template #icon>
          <span class="button-icon">
            <Icon icon="mdi:github" width="24" color="white" />
          </span>
        </template>
      </a-button>
    </div>
  </div>

  <a-modal v-model:open="showChatBox" title="Talking with AI" :footer="null" :mask-closable="false">
    <ChatBox />
  </a-modal>
  <a-modal v-model:open="showShareCard" :footer="null">
    <ShareCard />
  </a-modal>
</template>

<style scoped>

</style>
