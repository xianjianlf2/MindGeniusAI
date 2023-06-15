<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import ChatBox from './ChatBox.vue'

const showChatBox = ref(false)

function handleOpenGitHub() {
  window.open('https://github.com/xianjianlf2/MindGeniusAI', '_blank')
}
</script>

<template>
  <div class="flex justify-between items-center header" @click="showChatBox = true">
    <div class="card">
      <span>create a mind map</span>
    </div>

    <div class="flex gap-2 justify-center items-center">
      <!-- <a-button type="text">
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
      </a-button> -->
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
</template>

<style scoped>
.card {
  background: linear-gradient(-90deg, #5EFCE8 10%, #736EFE 100%);
  border-radius: 8px;
  box-shadow: 0px 10px 20px 20px rgba(0, 0, 0, 0.17);
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card:hover span {
  color: #fff;
}

.card:hover {
  animation-play-state: paused;
  cursor: pointer;
  ;
}

.card span {
  font-family: 'Amatic SC';
  color: #fff;
  letter-spacing: 2px;
  text-align: center;
  font-weight: bold;
}

.header {
  padding: 8px;
  background-image: linear-gradient(135deg, #5EFCE8 10%, #736EFE 100%);
}
</style>
