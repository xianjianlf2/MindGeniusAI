<script setup lang="ts">
import { Icon } from '@iconify/vue'

const modelValue = defineModel<boolean>()
</script>

<template>
  <div v-show="modelValue" class="border  rounded-lg min-h-[200px] w-[200px] shadow-box glass mt-2 gap-2">
    <div class="flex h-full flex-col">
      <a-button ghost>
        <template #icon>
          <Icon icon="material-symbols:folder-open-outline-rounded" color="white" width="18" />
        </template>
        <span class="font-semibold">
          导入文件
        </span>
      </a-button>
      <a-button ghost>
        <template #icon>
          <Icon icon="material-symbols:output-rounded" color="white" :rotate="3" width="18" />
        </template>
        <span class="font-semibold">
          导出文件
        </span>
      </a-button>
    </div>
  </div>
</template>
