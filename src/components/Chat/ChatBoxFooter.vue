<script setup lang="ts">
import { NButton } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { toRefs } from 'vue'

const props = defineProps({
  isLoading: Boolean,
  isContinuous: Boolean,
})

const emit = defineEmits(['reset', 'continuous', 'stopGenerate'])

const { isLoading, isContinuous } = toRefs(props)

function handleReset() {
  emit('reset')
}

function handleContinuous() {
  emit('continuous')
}

function handleStopGenerate() {
  emit('stopGenerate')
}
</script>

<template>
  <div class="flex items-center">
    <div class="flex-[30%] gap-2 flex">
      <NButton size="small" @click="handleReset">
        <template #icon>
          <span class="button-icon">
            <Icon icon="carbon:reset" width="18" color="white" />
          </span>
        </template>
      </NButton>
      <NButton size="small" :type="isContinuous ? 'primary' : 'default'" @click="handleContinuous">
        <template #icon>
          <Icon icon="mdi:head-snowflake-outline" width="18" color="white" />
        </template>
      </NButton>
    </div>
    <div class="flex-[60%]">
      <NButton v-show="isLoading" size="small" type="primary" @click="handleStopGenerate">
        <template #icon>
          <Icon icon="mdi:stop" width="18" color="white" />
        </template>
        Stop generating
      </NButton>
    </div>
  </div>
</template>

<style scoped>

</style>
