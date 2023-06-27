<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps({
  item: {
    type: Object,
    required: true,
  },
  tip: { type: String, required: true },
})
const emit = defineEmits(['click'])

function handleClick(data: any) {
  emit('click', { ...data })
}
</script>

<template>
  <a-tooltip>
    <template #title>
      {{ tip }}
    </template>
    <div class="flex justify-between items-center p-3 m-2 rounded-lg bg-#1e293b cursor-pointer font-semibold text-shadow-lg" @click="handleClick(item)">
      <span>{{ item.label }}</span>
      <Icon icon="material-symbols:chevron-right-rounded" width="20%" color="white" />
    </div>
  </a-tooltip>
</template>

<style scoped>

</style>
