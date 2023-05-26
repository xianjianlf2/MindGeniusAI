<script setup lang="ts">
import { Panel, PanelPosition, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { ref } from 'vue'
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

const scalingRatio = ref(100)

const { setTransform, onPaneReady } = useVueFlow()

function resetTransform(num?: number) {
  const res = num ? (scalingRatio.value + num) : 100
  if (res > 150 || res < 10)
    return
  scalingRatio.value = res
  setTransform({ x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: scalingRatio.value / 100 })
}

onPaneReady(({ fitView }) => {
  fitView()
})
</script>

<template>
  <VueFlow v-model="elements">
    <Panel :position="PanelPosition.TopLeft">
      <a-button type="primary" size="large" @click="isShowUploadPanel = !isShowUploadPanel">
        <template #icon>
          <div class="flex justify-center items-center">
            <Icon icon="material-symbols:menu" color="white" width="24" />
          </div>
        </template>
      </a-button>

      <FileUploadPanel v-model="isShowUploadPanel" />
      <!-- <Menu v-model="isShowUploadPanel" /> -->
    </Panel>

    <Panel :position="PanelPosition.TopRight">
      <div class="flex justify-end">
        <a-button type="primary" size="large" @click="isShowChatBox = !isShowChatBox">
          <template #icon>
            <div class="flex justify-center items-center">
              <Icon icon="tabler:message" width="24" />
            </div>
          </template>
        </a-button>
      </div>

      <ChatBox v-model="isShowChatBox" />
    </Panel>

    <Panel :position="PanelPosition.BottomLeft">
      <div class="flex items-center justify-center p-3 border rounded-md bg-white">
        <a-input-group compact>
          <a-button ghost @click="resetTransform(-10)">
            <Icon icon="material-symbols:zoom-out-rounded" width="24" />
          </a-button>
          <a-button ghost @click="resetTransform()">
            <span class="text-gray-500 font-semibold">
              {{ scalingRatio }}%
            </span>
          </a-button>
          <a-button ghost @click="resetTransform(10)">
            <Icon icon="material-symbols:zoom-in-rounded" width="24" />
          </a-button>
        </a-input-group>
      </div>
    </Panel>

    <Background />
  </VueFlow>
</template>
