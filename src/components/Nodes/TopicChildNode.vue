<script setup lang="ts">
import type { Node } from '@antv/x6'
import { inject, nextTick, onMounted, ref } from 'vue'
import { useContainer } from './useContainer'

const getNode: (() => Node | undefined) | undefined = inject('getNode')
const nodeRef = ref<Node>()
const dataRef = ref()
const { containerRef, updateContainerSize, listenDataChange } = useContainer()

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
    ref="containerRef"
    class="rounded-lg p-3 flex justify-center items-center bg-gradient-to-tl from-green-300 via-blue-500 to-purple-600 text-white h-auto w-auto min-h-[50px] min-w-[100px]"
  >
    <span class="text-shadow-md text-lg">
      {{ dataRef }}
    </span>
  </div>
</template>

<style scoped></style>
