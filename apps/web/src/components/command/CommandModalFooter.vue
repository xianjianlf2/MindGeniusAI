<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

const commandList = ref([
  {
    icons: [
      {
        icon: 'ant-design:enter-outlined',
        color: 'text-blue-500',
      },
    ],
    text: 'to select',
  },
  {
    icons: [
      {
        icon: 'ant-design:arrow-up-outlined',
        color: 'text-blue-500',
      },
      {
        icon: 'ant-design:arrow-down-outlined',
        color: 'text-blue-500',
      },
    ],
    text: 'to navigate',
  },
  {
    label: 'esc',
    text: 'to close',
  },
])
</script>

<template>
  <div class="flex items-center w-full h-full gap-2 pt-2">
    <template v-for="item in commandList" :key="item.text">
      <div class=" h-6 w-10 bg-gray-600 rounded-md border flex justify-center items-center">
        <template v-for="icon in item.icons" :key="icon">
          <Icon :icon="icon.icon" :color="icon.color" />
        </template>
        <span>{{ item.label }}</span>
      </div>
      <span>{{ item.text }}</span>
    </template>
  </div>
</template>

<style scoped>

</style>
