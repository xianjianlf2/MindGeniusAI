<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import TopNav from '@/components/TopNav.vue'
import Help from '@/components/Help.vue'

const showGuideLine = ref(false)
</script>

<template>
  <a-layout class="h-screen w-full relative">
    <TopNav />
    <a-layout-content>
      <RouterView />
    </a-layout-content>
    <div class="absolute right-8 bottom-8">
      <a-button size="large" @click="showGuideLine = true">
        <template #icon>
          <span class="button-icon">
            <Icon icon="material-symbols:question-mark-rounded" width="20" color="white" />
          </span>
        </template>
      </a-button>
    </div>
  </a-layout>
  <Help v-model="showGuideLine" />
</template>
