<script setup lang="ts">
import { computed, ref } from 'vue'
import { NDivider, NModal } from 'naive-ui'

const props = defineProps({
  modelValue: {
    type: Boolean,
  },
})
const emit = defineEmits(['update:modelValue'])
const show = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

const data = ref([
  {
    operateName: 'Generate mind map',
    operations: [
      {
        text: 'Get start',
        type: 'keycap',
      },
    ],
  },
  {
    operateName: 'zoom in / zoom out',
    operations: [
      {
        text: 'Mouse scrolling',
        type: 'keycap',
      }],
  },
  {
    operateName: 'Delete',
    operations: [
      {
        text: 'Delete',
        type: 'keycap',
      },
      {
        text: 'or',
      },
      {
        text: 'Backspace',
        type: 'keycap',
      },
    ],
  },
  {
    operateName: 'Select elements',
    operations: [
      {
        text: 'Alt',
        type: 'keycap',
      },
    ],
  },
])
</script>

<template>
  <NModal
    v-model:show="show" style="width: 600px"
    preset="card"
    title="Help"
    :bordered="false"
    size="huge"
  >
    <span class="py-3 font-semibold text-lg my-2 block">Keyboard shortcuts</span>
    <div class="border rounded-lg p-3 border-solid">
      <div v-for="(item, index) in data" :key="item.operateName">
        <div class="flex w-full justify-between items-center">
          <div>{{ item.operateName }}</div>
          <div class="flex justify-end items-center">
            <div
              v-for="shortcut in item.operations" :key="shortcut.text"
              :class="shortcut.type ? 'rounded-lg px-2 py-1  bg-green-600' : ''" class="mx-1 "
            >
              {{ shortcut.text }}
            </div>
          </div>
        </div>
        <NDivider v-if="index !== data.length - 1" />
      </div>
    </div>
  </NModal>
</template>
