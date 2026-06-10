<script setup lang="ts">
import type { Node } from '@antv/x6'
import { inject, nextTick, onMounted, ref } from 'vue'
import { NInput } from 'naive-ui'
import { useContainer } from './useContainer'
import { useEditing } from '@/hooks/useNodeEdit'

const getNode: (() => Node | undefined) | undefined = inject('getNode')
const nodeRef = ref<Node>()
const dataRef = ref()
const { containerRef, updateContainerSize, listenDataChange } = useContainer()
const {
  isCanEditNode,
  inputValue,
  handleDoubleClick,
  handleKeydown,
  handleBlur,
} = useEditing(() => {
  nextTick(() => {
    updateContainerSize(nodeRef.value!)
  })
})

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
    ref="containerRef" class="bg-gradient-to-br from-indigo-400 to-blue-300
rounded-lg p-3 box-border flex justify-center items-center
h-auto w-auto
min-h-[50px] min-w-[200px] max-w-[500px]
overflow-hidden
relative  node-text" @dblclick.prevent="() => handleDoubleClick(nodeRef!)"
  >
    <span class="text-shadow-md text-lg whitespace-pre-wrap w-full" :class="isCanEditNode(nodeRef!) ? 'block-hidden' : 'block-visible'">
      {{ dataRef }}
    </span>
    <div class="w-full flex" :class="isCanEditNode(nodeRef!) ? 'block-visible' : 'block-hidden'">
      <NInput
        v-model:value="inputValue"
        type="textarea"
        @press-enter="(e: KeyboardEvent) => handleKeydown(e, nodeRef!)" @blur="handleBlur(nodeRef!)"
      />
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
