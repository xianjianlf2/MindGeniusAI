<script setup lang="ts">
import { NLayout } from 'naive-ui'
import MindMap from '@/components/MindMap'
import MindMapSide from '@/components/MindMapSide'
</script>

<template>
  <NLayout style="height: 100%;" has-sider>
    <div class="w-full h-full relative flex">
      <MindMapSide />
      <MindMap />
    </div>
  </NLayout>
</template>

<style scoped></style>
