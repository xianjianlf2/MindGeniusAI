<script setup lang="ts">
import { NLayout, NLayoutContent } from 'naive-ui'
import { MindMap } from '@/components/MindMap'
import MindMapSide from '@/components/MindMapSide'
</script>

<template>
  <NLayout style="height: 100%;" has-sider>
    <MindMapSide />
    <NLayoutContent>
      <MindMap />
    </NLayoutContent>
  </NLayout>
</template>
