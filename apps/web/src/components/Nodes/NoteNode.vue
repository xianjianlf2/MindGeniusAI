<!-- eslint-disable no-console -->
<script setup lang="ts">
import type { Node } from '@antv/x6'
import { computed, inject, onMounted } from 'vue'
import { useContainer } from './useContainer'
import { useNodeStore } from '@/stores'
import { useGenerateMarkdown } from '@/hooks/useGenerateMarkdown'

const getNode: (() => Node | undefined) | undefined = inject('getNode')
const { containerRef, updateContainerSize } = useContainer()
const nodeStore = useNodeStore()
const content = computed(() => useGenerateMarkdown(nodeStore.noteContent ?? ''))

onMounted(() => {
  const node = getNode!()
  updateContainerSize(node!)
})
</script>

<template>
  <div ref="containerRef" class="sticky-note">
    <div class="sticky-note-content" v-html="content" />
    <div class="sticky-note-corner" />
  </div>
</template>

<style scoped>
.sticky-note {
  position: relative;
  display: inline-block;
  width: auto;
  height: auto;
  min-width: 500px;
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
</style>
