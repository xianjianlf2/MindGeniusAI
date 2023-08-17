<script setup lang="ts">
import type { PropType } from 'vue'
import { Icon } from '@iconify/vue'
import { NButton, NDropdown } from 'naive-ui'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import { useGlobalStore } from '@/stores'

export interface MenuItem {
  key: string
  label: string
  icon: string
  handler: () => void
}
const props = defineProps({
  options: {
    type: Array as PropType<OptionType[]>,
    required: true,
  },
})
const globalStore = useGlobalStore()
type OptionType = DropdownMixedOption & { handler: any }
function handleSelect(key: string) {
  const item = props.options.find(item => item.key === key)
  if (item)
    item.handler()
}
</script>

<template>
  <NDropdown trigger="click" :options="options.filter(item => item.handler)" :theme="globalStore.theme?.Dropdown" @select="handleSelect">
    <NButton type="primary" strong circle class="hover:scale-110 hover:font-bold">
      <template #icon>
        <Icon icon="material-symbols:add" width="24" color="white" />
      </template>
    </NButton>
  </NDropdown>
</template>

<style scoped></style>
