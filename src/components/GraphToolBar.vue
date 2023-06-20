<script setup lang="ts">
import type { Graph } from '@antv/x6'
import type { PropType } from 'vue'
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { message } from 'ant-design-vue'
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
    required: true,
  },
})

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
  {
    icon: 'carbon:star-review',
    text: 'AI generate',
    tooltip: 'AI generate',
    handler: () => {
      message.info('coming soon')
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
  { immediate: true, deep: true },
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
          <Icon :icon="item.icon" width="24" />
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
