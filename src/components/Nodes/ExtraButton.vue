<script setup lang="ts">
import type { PropType } from 'vue'
import { Icon } from '@iconify/vue'

export interface MenuItem {
  key: string
  label: string
  icon: string
  handler: () => void
}

defineProps({
  menuItems: {
    type: Array as PropType<MenuItem[]>,
    required: true,
  },
})
</script>

<template>
  <a-dropdown :trigger="['click']">
    <a-button type="primary" shape="circle" class="hover:scale-110 hover:font-bold">
      <template #icon>
        <span class="button-icon">
          <Icon icon="material-symbols:add" width="24" color="white" />
        </span>
      </template>
    </a-button>
    <template #overlay>
      <a-menu>
        <a-menu-item v-for="item in menuItems" :key="item.key">
          <a-button type="text" size="small" @click.prevent="item.handler">
            <template #icon>
              <span class="button-icon">
                <Icon :icon="item.icon" width="18" color="white" />
              </span>
            </template>
            {{ item.label }}
          </a-button>>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<style scoped>

</style>
