<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { NButton } from 'naive-ui'
import { v4 as uuidv4 } from 'uuid'
import FileUploadPanel from './FileUploadPanel.vue'
import Setting from '@/components/Setting'
import ShareCard from '@/components/ShareCard.vue'
import CardModal from '@/components/CardModal.vue'
import { ChatBox } from '@/components/Chat'
import { useChatStore } from '@/stores'
import { useIsMac } from '@/utils'
import CommandModal from '@/components/command/CommandModal.vue'
import { useCommandModal } from '@/components/command/commandModal'

const showChatBox = ref(false)
const showShareCard = ref(false)
const showSetting = ref(false)
const showFileUploadPanel = ref(false)
const isMac = useIsMac()

const buttonList = useButton()

const { openCommandModal } = useCommandModal()

function useButton() {
  const GITHUB_URL = 'https://github.com/xianjianlf2/MindGeniusAI'
  function handleOpenGitHub(url: string) {
    window.open(url, '_blank')
  }

  const buttonList = ref([
    {
      icon: 'uil:setting',
      handler: () => showSetting.value = true,
    },
    {
      icon: 'material-symbols:share',
      handler: () => showShareCard.value = true,
    },
    {
      icon: 'mdi:github',
      handler: () => handleOpenGitHub(GITHUB_URL),
    },
  ])

  return buttonList
}

function openChatBox() {
  showChatBox.value = true
}

// function openFileUploadPanel() {
//   showFileUploadPanel.value = true
// }

const chatStore = useChatStore()
const chatWindowId = ref(uuidv4())

onMounted(() => {
  chatStore.addChatWindow(chatWindowId.value)
})
</script>

<template>
  <div class="bg-#1e293b flex justify-between items-center p-3">
    <div class="flex items-center gap-3">
      <div class="button" @click="openChatBox">
        <span class="bg-via-gray-900 ">
          Get Start
        </span>
      </div>
      <!-- <div class="button" @click="openFileUploadPanel">
        <span class="bg-via-gray-900 ">
          Get Start With PDF
        </span>
      </div> -->
    </div>

    <div class="items-center flex justify-center gap-2 bg-gradient-to-r ">
      <NButton @click="openCommandModal()">
        <template #icon>
          <Icon icon="material-symbols:keyboard-alt-outline" color="white" />
        </template>
        {{ isMac ? 'Command + k' : 'Ctrl + k' }}
      </NButton>
      <NButton v-for="item in buttonList" :key="item.icon" quaternary circle @click="item.handler">
        <template #icon>
          <Icon :icon="item.icon" width="36" color="white" />
        </template>
      </NButton>
    </div>
  </div>

  <CardModal v-model="showChatBox" modal-title="ChatBox">
    <ChatBox :id="chatWindowId" />
  </CardModal>

  <CardModal v-model="showShareCard" modal-title="Share">
    <ShareCard />
  </CardModal>

  <CardModal v-model="showSetting" modal-title="Setting">
    <Setting />
  </CardModal>

  <FileUploadPanel v-model="showFileUploadPanel" />

  <CommandModal />
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
  font-size: 14px;
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
  padding: 8px 16px;
  border-radius: calc(var(--border-radius) - var(--border-width) / 2);
}
</style>
