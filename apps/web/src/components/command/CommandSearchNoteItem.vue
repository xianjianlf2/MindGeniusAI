<script setup lang="ts">
import type { PropType } from 'vue'
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { CardType } from '../MindMapSide/type'
import { useSearch } from './search'
import { useCommandModal } from './commandModal'
import { useSearchNotes } from './searchNotes'
import { useGenerateMarkdown } from '@/hooks'
import { useNoteStore } from '@/stores'

const props = defineProps({
  item: {
    type: Object as PropType<CardType>,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    required: true,
  },
})
const { setSelectedIndex, selectedIndex } = useSearch()
const { closeCommandModal } = useCommandModal()
const { filteredNotes } = useSearchNotes()
const noteStore = useNoteStore()

function handleMouseEnter() {
  setSelectedIndex(props.index)
}

const isActiveRef = computed(() => props.isActive)

function handleClick() {
  if (filteredNotes.value.length > 0) {
    const note = filteredNotes.value[selectedIndex.value]
    closeCommandModal()
    noteStore.setCurrentEditId(note.id)
  }
}
</script>

<template>
  <div
    class="rounded-lg border  p-2 my-2 max-h-30 overflow-hidden cursor-pointer"
    :class="isActiveRef ? 'bg-#1E293B' : 'bg-#424247'"
    @mouseenter="handleMouseEnter"
    @click="handleClick"
  >
    <div class="font-semibold text-lg border-b-dashed w-full border-1">
      {{ `Notes ${item.id}` }}
    </div>
    <div class="flex justify-between items-center">
      <div class="flex-1">
        <div v-html="useGenerateMarkdown(item.content)" />
      </div>
      <Icon v-if="isActiveRef" icon="ant-design:enter-outlined" color="white" width="28" />
    </div>
  </div>
</template>

<style scoped>

</style>
