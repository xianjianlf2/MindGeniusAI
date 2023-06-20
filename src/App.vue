<script setup lang="ts">
import { RouterView } from 'vue-router'
import { theme } from 'ant-design-vue'
</script>

<template>
  <a-config-provider
    :theme="{
      algorithm: theme.darkAlgorithm,
    }"
  >
    <RouterView />
  </a-config-provider>
</template>

<style scoped></style>
