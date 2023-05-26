<script setup lang="ts">
import { Panel, PanelPosition, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import ChatBox from '../components/ChatBox.vue'
import FileUploadPanel from '../components/FileUploadPanel.vue'

const isShowUploadPanel = ref(false)
const isShowChatBox = ref(false)
const elements = ref([
  // Nodes
  // An input node, specified by using `type: 'input'`
  { id: '1', type: 'input', label: 'Node 1', position: { x: 250, y: 5 } },

  // Default nodes, you can omit `type: 'default'`
  { id: '2', label: 'Node 2', position: { x: 100, y: 100 } },
  { id: '3', label: 'Node 3', position: { x: 400, y: 100 } },

  // An output node, specified by using `type: 'output'`
  { id: '4', type: 'output', label: 'Node 4', position: { x: 400, y: 200 } },

  // Edges
  // Most basic edge, only consists of an id, source-id and target-id
  { id: 'e1-3', source: '1', target: '3' },

  // An animated edge
  { id: 'e1-2', source: '1', target: '2', animated: true },
])

const { onPaneReady, fitView, zoomIn, zoomOut } = useVueFlow()

onPaneReady(({ fitView }) => {
  fitView()
})

onMounted(() => {
  const timer = setTimeout(() => {
    isShowUploadPanel.value = true
    clearTimeout(timer)
  }, 1000)
})
</script>

<template>
  <VueFlow v-model="elements" :min-zoom="0.2" :max-zoom="2">
    <Panel :position="PanelPosition.TopLeft">
      <a-button
        type="primary"
        size="large"
        @click="isShowUploadPanel = !isShowUploadPanel"
      >
        <template #icon>
          <div class="flex justify-center items-center">
            <Icon icon="material-symbols:menu" color="white" width="24" />
          </div>
        </template>
      </a-button>

      <FileUploadPanel
        v-model="isShowUploadPanel"
        v-motion-slide-visible-left
      />
      <!-- <Menu v-model="isShowUploadPanel" /> -->
    </Panel>

    <Panel :position="PanelPosition.TopRight">
      <div class="flex justify-end">
        <a-button
          type="primary"
          size="large"
          @click="isShowChatBox = !isShowChatBox"
        >
          <template #icon>
            <div class="flex justify-center items-center">
              <Icon icon="tabler:message" width="24" />
            </div>
          </template>
        </a-button>
      </div>

      <ChatBox v-model="isShowChatBox" v-motion-slide-visible-right />
    </Panel>

    <Panel :position="PanelPosition.TopCenter">
      <div
        class="flex items-center justify-center py-3 px-5 border rounded-md bg-white"
      >
        <a-radio-group>
          <a-radio-button @click="zoomOut">
            <div class="flex justify-center items-center h-full">
              <Icon icon="material-symbols:zoom-out-rounded" width="24" />
            </div>
          </a-radio-button>
          <a-radio-button @click="fitView">
            <div class="flex justify-center items-center h-full">
              <Icon
                icon="material-symbols:autorenew-outline-rounded"
                width="24"
              />
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
