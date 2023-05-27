<script setup lang="ts">
import { Icon } from '@iconify/vue'

const modelValue = defineModel<boolean>()
</script>

<template>
  <div v-show="modelValue" class="border  rounded-lg min-h-[200px] w-[200px] shadow-box glass mt-2 gap-2">
    <div class="flex h-full flex-col">
      <a-button ghost>
        <template #icon>
          <span class="button-icon">
            <Icon icon="material-symbols:folder-open-outline-rounded" width="18" />
          </span>
        </template>
        <span class="font-semibold">
          导入文件
        </span>
      </a-button>
      <a-button ghost>
        <template #icon>
          <span class="button-icon">
            <Icon icon="material-symbols:output-rounded" width="18" />
          </span>
        </template>
        <span class="font-semibold">
          导出文件
        </span>
      </a-button>
    </div>
  </div>
</template>
