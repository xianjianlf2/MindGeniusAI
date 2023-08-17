<script setup lang="ts">
import { computed } from 'vue'
import { NModal } from 'naive-ui'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  modalTitle: { type: String, required: true },
},
)

const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})
</script>

<template>
  <NModal
    v-model:show="show" class="custom-card" preset="card" style="width: 600px;" :title="modalTitle" :bordered="false"
    size="huge"
  >
    <slot />
  </NModal>
</template>

<style scoped></style>
