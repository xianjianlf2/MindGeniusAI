<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import ChatBox from './ChatBox.vue'
import ShareCard from './ShareCard.vue'

const showChatBox = ref(false)
const showShareCard = ref(false)

const GITHUB_URL = 'https://github.com/xianjianlf2/MindGeniusAI'
function handleOpenGitHub() {
  window.open(GITHUB_URL, '_blank')
}
</script>

<template>
  <div class="bg-#1e293b flex justify-between items-center p-3">
    <div class="button" @click="showChatBox = true">
      <span class="bg-via-gray-900 ">
        Get Start
      </span>
    </div>
    <div class="items-center flex justify-center gap-2 bg-gradient-to-r ">
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
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.button {
  --border-width: 2px;
  --border-radius: 0.35rem;
  --background-spread: 200px;
  font-weight: bold;
  font-size: 16px;
  letter-spacing: -0.02rem;
  position: relative;
  color: #fff;
  border: 0;
  z-index: 0;
  border-radius: var(--border-radius);
  background-color: transparent;
  overflow: hidden;
  padding: var(--border-width);
  cursor: pointer;
  user-select: none;
}

.button::after {
  content: '';
  position: absolute;
  background: conic-gradient(from 180deg at 50% 50%, rgba(0, 209, 255, 0) 0deg, rgba(0, 209, 255, 0) 153.75deg, #00D1FF 345deg, rgba(0, 209, 255, 0) 360deg);
  top: calc(var(--background-spread) * -1);
  right: calc(var(--background-spread) * -1);
  bottom: calc(var(--background-spread) * -1);
  left: calc(var(--background-spread) * -1);
  z-index: -1;
  animation: 3s rotate linear infinite;
}

.button span {
  display: block;
  background-color: #000;
  padding: 10px 20px;
  border-radius: calc(var(--border-radius) - var(--border-width) / 2);
}
</style>
