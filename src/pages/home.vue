<script setup lang="ts">
import { Panel, PanelPosition, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import ChatBox from '../components/ChatBox.vue'

const isShowChatBox = ref(false)
const elements = ref([
  { id: '1', label: '纳瓦尔宝典', position: { x: 250, y: 5 } },
  { id: '2', label: '简介', position: { x: 100, y: 100 } },
  { id: '3', label: '历史背景', position: { x: 400, y: 100 } },
  { id: '4', label: '内容概述', position: { x: 250, y: 200 } },
  { id: '5', label: '主要章节', position: { x: 100, y: 300 } },
  { id: '6', label: '结论', position: { x: 400, y: 300 } },

  // 将其关联
  // Edges
  // Most basic edge, only consists of an id, source-id and target-id
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e1-4', source: '1', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e4-6', source: '4', target: '6' },
])

const { onPaneReady, fitView, zoomIn, zoomOut } = useVueFlow()

onPaneReady(({ fitView }) => {
  fitView()
})

onMounted(() => {
  isShowChatBox.value = true
})
</script>

<template>
  <VueFlow v-model="elements" :min-zoom="0.2" :max-zoom="2">
    <Panel :position="PanelPosition.TopLeft">
      <a-button type="primary" size="large" @click="isShowChatBox = !isShowChatBox">
        <template #icon>
          <div class="flex justify-center items-center">
            <Icon icon="tabler:message" width="24" />
          </div>
        </template>
      </a-button>

      <ChatBox v-model="isShowChatBox" v-motion-slide-visible-left />
      <!-- <Menu v-model="isShowUploadPanel" /> -->
    </Panel>

    <Panel :position="PanelPosition.TopCenter">
      <div class="flex items-center justify-center py-3 px-5 border rounded-md ">
        <a-radio-group size="small">
          <a-radio-button @click="zoomOut">
            <div class="flex justify-center items-center h-full">
              <Icon icon="material-symbols:zoom-out-rounded" width="24" />
            </div>
          </a-radio-button>
          <a-radio-button @click="fitView">
            <div class="flex justify-center items-center h-full">
              <Icon icon="material-symbols:autorenew-outline-rounded" width="24" />
            </div>
          </a-radio-button>
          <a-radio-button @click="zoomIn">
            <div class="flex justify-center items-center h-full">
              <Icon icon="material-symbols:zoom-in-rounded" width="24" />
            </div>
          </a-radio-button>
        </a-radio-group>
      </div>
    </Panel>

    <Background />
  </VueFlow>
</template>
