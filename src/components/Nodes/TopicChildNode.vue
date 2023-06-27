<script setup lang="ts">
import type { Node } from '@antv/x6'
import { inject, nextTick, onMounted, ref } from 'vue'
import { useContainer } from './useContainer'
import { useEditing } from '@/hooks/useNodeEdit'

const getNode: (() => Node | undefined) | undefined = inject('getNode')
const nodeRef = ref<Node>()
const dataRef = ref()
const { containerRef, updateContainerSize, listenDataChange } = useContainer()
const {
  isEditing,
  inputValue,
  handleDoubleClick,
  handleKeydown,
} = useEditing()

function initData(node: Node) {
  nodeRef.value = node
  const { data } = node?.getData()
  dataRef.value = data
}

function handleDataChange(current: any) {
  const { data } = current
  dataRef.value = data
  nextTick(() => {
    updateContainerSize(nodeRef.value!)
  })
}

onMounted(() => {
  const node = getNode!()
  initData(node!)
  listenDataChange(node!, handleDataChange)
  nextTick(() => {
    updateContainerSize(node!)
  })
})
</script>

<template>
  <div
    ref="containerRef" class="rounded-lg p-3 box-border flex justify-center items-center bg-gradient-to-tl from-green-300 via-blue-500 to-purple-600
  p-3 text-white
  h-auto w-auto
  min-h-[50px] min-w-[200px] max-w-[500px]
  overflow-hidden
  relative" @dblclick.prevent="() => handleDoubleClick(nodeRef!)"
  >
    <span class="text-shadow-md text-lg whitespace-pre-wrap w-full" :class="isEditing ? 'block-hidden' : 'block-visible'">
      {{ dataRef }}
    </span>
    <div class="w-full flex" :class="isEditing ? 'block-visible' : 'block-hidden'">
      <textarea v-model="inputValue" class="bg-black" :rows="4" @keydown="(e: KeyboardEvent) => handleKeydown(e, nodeRef!, dataRef)" />
    </div>
  </div>
</template>

<style scoped>
.block-hidden {
  display: none;
}

.block-visible {
  display: block;
}
</style>
