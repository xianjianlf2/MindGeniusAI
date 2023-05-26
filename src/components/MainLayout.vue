<script setup lang="ts">
import TopNav from '@/components/TopNav.vue'
</script>

<template>
  <a-layout class="h-screen w-full">
    <TopNav />
    <a-layout-content>
      <RouterView />
    </a-layout-content>
  </a-layout>
</template>
