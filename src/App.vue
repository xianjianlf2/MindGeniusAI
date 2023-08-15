<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { useGlobalStore } from './stores'
import 'vfonts/Lato.css'

const globalStore = useGlobalStore()
</script>

<template>
  <NConfigProvider :theme="globalStore.theme" :theme-overrides="{ common: { fontWeightStrong: '600' } }">
    <NMessageProvider>
      <RouterView />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped></style>
