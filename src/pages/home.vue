<script setup lang="ts">
import { Panel, PanelPosition, Position, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import ChatBox from '../components/ChatBox.vue'

const isShowChatBox = ref(false)
const elements = ref([
  { id: '1', label: 'Front-End Tech Roadmap', position: { x: 0, y: 50 }, sourcePosition: Position.Right },
  { id: '2', label: 'HTML/CSS', position: { x: 200, y: 50 }, targetPosition: Position.Left, sourcePosition: Position.Right },
  { id: '3', label: 'Semantic HTML', position: { x: 500, y: 50 }, targetPosition: Position.Left },
  { id: '4', label: 'CSS Preprocessors', position: { x: 500, y: 200 }, targetPosition: Position.Left },
  { id: '5', label: 'JavaScript', position: { x: 200, y: 200 }, targetPosition: Position.Left, sourcePosition: Position.Right },
  { id: '6', label: 'ES6+', position: { x: 500, y: 350 }, targetPosition: Position.Left },
  { id: '7', label: 'React', position: { x: 200, y: 350 }, targetPosition: Position.Left, sourcePosition: Position.Right },
  { id: '8', label: 'Redux', position: { x: 500, y: 500 }, targetPosition: Position.Left },
  { id: '9', label: 'TypeScript', position: { x: 200, y: 500 }, targetPosition: Position.Left, sourcePosition: Position.Right },
  { id: '10', label: 'Vue', position: { x: 200, y: 650 }, targetPosition: Position.Left, sourcePosition: Position.Right },
  { id: '11', label: 'Angular', position: { x: 200, y: 800 }, targetPosition: Position.Left, sourcePosition: Position.Right },
  { id: '12', label: 'Webpack', position: { x: 500, y: 650 }, targetPosition: Position.Left },
  { id: '13', label: 'Babel', position: { x: 500, y: 800 }, targetPosition: Position.Left },
  // Edges
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-5', source: '1', target: '5' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e5-6', source: '5', target: '6' },
  { id: 'e5-7', source: '5', target: '7' },
  { id: 'e7-8', source: '7', target: '8' },
  { id: 'e9-5', source: '9', target: '5' },
  { id: 'e10-5', source: '10', target: '5' },
  { id: 'e11-5', source: '11', target: '5' },
  { id: 'e12-5', source: '12', target: '5' },
  { id: 'e13-5', source: '13', target: '5' },
],
)

const { fitView, zoomIn, zoomOut } = useVueFlow()

onMounted(() => {
  isShowChatBox.value = true
})
</script>

<template>
  <VueFlow v-model="elements" :min-zoom="0.2" :max-zoom="2" fit-view-on-init>
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
