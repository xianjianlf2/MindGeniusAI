<script setup lang="ts">
import type { Graph } from '@antv/x6'
import { DataUri } from '@antv/x6'
import type { PropType } from 'vue'
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { NButton, NTooltip } from 'naive-ui'
import type { HistoryState } from './types'

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
    icon: 'ic:baseline-fit-screen',
    text: 'fit screen',
    tooltip: 'fit screen',
    handler: () => {
      props.graph.zoomToFit({ padding: 20 })
    },
  },
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
])

function watchHistoryState() {
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
}

watchHistoryState()
</script>

<template>
  <div class="flex gap-2 bg-[#1e293b] rounded-lg border p-2">
    <NTooltip v-for="item in buttonList" :key="item.text" trigger="hover" placement="bottom">
      <template #trigger>
        <NButton :disabled="item.enabled" quaternary circle type="success" @click="item.handler">
          <Icon :icon="item.icon" width="24" :rotate="item.rotate" />
        </NButton>
      </template>
      {{ item.tooltip }}
    </NTooltip>
  </div>
</template>

<style scoped></style>
