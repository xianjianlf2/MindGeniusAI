<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="flex justify-between items-center bg-gradient-to-r from-gray-700 via-gray-900 to-black p-3 ">
    <div class="flex items-center justify-center gap-2 text-white cursor-pointer" @click="router.push('/')">
      <Icon icon="material-symbols:lab-profile" width="30" />
      <span class="font-semibold">DOC FILE SEARCH</span>
    </div>

    <div class="flex gap-2 justify-center items-center">
      <a-button type="text">
        <template #icon>
          <span class="button-icon">
            <Icon icon="bx:save" width="24" color="white" />
          </span>
        </template>
      </a-button>
      <a-button type="text">
        <template #icon>
          <span class="button-icon">
            <Icon icon="mdi:cog" width="24" />
          </span>
        </template>
      </a-button>
    </div>
  </div>
</template>

<style scoped></style>
