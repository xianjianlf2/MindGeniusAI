<script setup lang="ts">
import type { Graph } from '@antv/x6'
import { DataUri } from '@antv/x6'
import type { PropType } from 'vue'
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { HistoryState } from './types'
import GuideLine from './GuideLine.vue'
import { useShowCurrentZoomMessage } from '@/hooks/useGraph'

const props = defineProps({
  graph: {
    type: Object as PropType<Graph> | undefined,
    required: true,
  },
  historyState: {
    type: Object as PropType<HistoryState> | undefined,
  },
})
const noteNodeStyle = `
        .sticky-note {
  position: relative;
  display: inline-block;
  width: auto;
  height: auto;
  min-width: 400px;
  min-height: 200px;
  background-color: #f7dc6f;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
  color: #333;
  line-height: 1.5;
  overflow: hidden;
}

.sticky-note-content {
  position: relative;
  font-size: 18px;
  overflow-y: auto;
}

.sticky-note-corner {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 30px 30px 0;
  border-color: transparent #f1c40f transparent transparent;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}
        
        `

const showGuideLine = ref(false)
const buttonList = ref([
  {
    icon: 'ic:baseline-undo',
    text: 'undo',
    tooltip: 'undo',
    enabled: true,
    handler: () => {
      props.graph.undo()
    },
  },
  {
    icon: 'ic:baseline-redo',
    text: 'redo',
    tooltip: 'redo',
    enabled: true,
    handler: () => {
      props.graph.redo()
    },
  },
  {
    icon: 'ic:baseline-zoom-in',
    text: 'zoom in',
    tooltip: 'zoom in',
    handler: () => {
      props.graph.zoom(0.1)
      useShowCurrentZoomMessage(props.graph)
    },
  },
  {
    icon: 'ic:baseline-zoom-out',
    text: 'zoom out',
    tooltip: 'zoom out',
    handler: () => {
      props.graph.zoom(-0.1)
      useShowCurrentZoomMessage(props.graph)
    },
  },
  {
    icon: 'ic:baseline-fit-screen',
    text: 'fit screen',
    tooltip: 'fit screen',
    handler: () => {
      props.graph.zoomToFit({ padding: 20 })
    },
  },
  // {
  //   icon: 'carbon:star-review',
  //   text: 'AI generate',
  //   tooltip: 'AI generate',
  //   handler: () => {
  //     message.info('coming soon')
  //   },
  // },
  {
    icon: 'material-symbols:output-rounded',
    rotate: 3,
    text: 'Export',
    tooltip: 'Export to png',
    handler: () => {
      props.graph.toPNG((dataUri) => {
        DataUri.downloadDataUri(dataUri, 'mind-map.png')
      }, {
        backgroundColor: '#18212F',
        stylesheet: noteNodeStyle,
        padding: 20,
      })
    },
  },
  {
    icon: 'material-symbols:live-help-outline-rounded',
    text: 'guide line',
    tooltip: 'guide line',
    handler: () => {
      showGuideLine.value = true
    },
  },
])
watch(
  () => props.historyState,
  (val) => {
    if (val) {
      buttonList.value[0].enabled = !val.canUndo
      buttonList.value[1].enabled = !val.canRedo
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="w-full flex">
    <a-tooltip v-for="item in buttonList" :key="item.text" placement="bottom">
      <template #title>
        <span>{{ item.tooltip }}</span>
      </template>
      <a-button type="text" style="height: fit-content;" :disabled="item.enabled" @click="item.handler">
        <div class="flex flex-col justify-center items-center">
          <Icon :icon="item.icon" width="24" :rotate="item.rotate" />
          <span>{{ item.text }}</span>
        </div>
      </a-button>
    </a-tooltip>
  </div>
  <a-modal v-model:open="showGuideLine" title="GUIDE LINE" :footer="null" :mask-closable="false">
    <GuideLine />
  </a-modal>
</template>

<style scoped></style>
