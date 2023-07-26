<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { useGlobalStore } from './stores'

const globalStore = useGlobalStore()
</script>

<template>
  <NConfigProvider :theme="globalStore.theme">
    <NMessageProvider>
      <RouterView />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped></style>
