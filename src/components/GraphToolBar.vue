<script setup lang="ts">
import type { Graph } from '@antv/x6'
import type { PropType } from 'vue'
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { HistoryState } from './types'

const props = defineProps({
  graph: {
    type: Object as PropType<Graph> | undefined,
    required: true,
  },
  historyState: {
    type: Object as PropType<HistoryState> | undefined,
    required: true,
  },
})

const buttonList = ref([
  {
    icon: 'ic:baseline-undo',
    text: 'undo',
    tooltip: 'undo',
    enabled: props.historyState.canUndo,
    handler: () => {
      props.graph.undo()
    },
  },
  {
    icon: 'ic:baseline-redo',
    text: 'redo',
    tooltip: 'redo',
    enabled: props.historyState.canRedo,
    handler: () => {
      props.graph.redo()
    },
  },
  {
    icon: 'ic:baseline-zoom-in',
    text: 'zoom in',
    tooltip: 'zoom in',
    handler: () => {
      props.graph.zoom(props.graph.zoom() + 0.1)
    },
  },
  {
    icon: 'ic:baseline-zoom-out',
    text: 'zoom out',
    tooltip: 'zoom out',
    handler: () => {
      props.graph.zoom(-0.1)
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
    icon: 'carbon:star-review',
    text: 'AI generate',
    tooltip: 'AI generate',
  },
])
</script>

<template>
  <div class="w-full flex">
    <a-tooltip v-for="item in buttonList" :key="item.text" placement="bottom">
      <template #title>
        <span>{{ item.tooltip }}</span>
      </template>
      <a-button type="text" style="height: fit-content;" :disabled="item.enabled" @click="item.handler">
        <div class="flex flex-col justify-center items-center">
          <Icon :icon="item.icon" width="24" />
          <span>{{ item.text }}</span>
        </div>
      </a-button>
    </a-tooltip>
  </div>
</template>

<style scoped></style>
