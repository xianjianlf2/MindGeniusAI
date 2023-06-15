<!-- eslint-disable no-console -->
<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'

const getNode: any = inject('getNode')

const isEdit = ref(false)
const value = ref('here is a node')

onMounted(() => {
  const node = getNode()
  console.log(node)
})

function handleChange(e: any) {
  console.log(e.target.value)
}
</script>

<template>
  <div v-if="!isEdit" class="border border-dashed p-2 rounded-lg" @dblclick="isEdit = true">
    {{ value }}
  </div>
  <a-textarea v-else v-model:value="value" :rows="4" placeholder="maxlength is 6" :maxlength="6" @change="handleChange" />
</template>

<style scoped></style>
