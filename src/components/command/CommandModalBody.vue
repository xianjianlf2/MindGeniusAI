<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { NEmpty, NInput } from 'naive-ui'
import { useSearch } from './search'
import CommandSearchNote from './CommandSearchNote.vue'
import { useSearchNotes } from './searchNotes'
import { useCommandModal } from './commandModal'
import { useNoteStore } from '@/stores'

const { isLoading, search, isSearching, selectedIndex, setSelectedIndex } = useSearch()
const { closeCommandModal } = useCommandModal()
const { filteredNotes } = useSearchNotes()
const noteStore = useNoteStore()

function selectPrevious() {
  if (selectedIndex.value - 1 < 0)
    setSelectedIndex(filteredNotes.value.length - 1)
  else
    setSelectedIndex(selectedIndex.value - 1)
}

function selectNext() {
  if (selectedIndex.value + 1 >= filteredNotes.value.length)
    setSelectedIndex(0)
  else
    setSelectedIndex(selectedIndex.value + 1)
}

function handleKeydown(e: KeyboardEvent) {
  if (!isSearching.value)
    return
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectPrevious()
  }
  else if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectNext()
  }
  else if (e.key === 'Enter') {
    e.preventDefault()
    if (filteredNotes.value.length > 0) {
      const note = filteredNotes.value[selectedIndex.value]
      closeCommandModal()
      noteStore.setCurrentEditId(note.id)
    }
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Icon :icon="isLoading ? 'eos-icons:loading' : 'material-symbols:search'" width="25" />
    <NInput
      v-model:value="search" class="flex-1"
      placeholder="Search by keyword, or add '>' prefix to enable command mode" clearable @keydown="handleKeydown"
    />
  </div>
  <NEmpty v-if="!isSearching" description="No content" class="mt-5" />
  <div v-else>
    <CommandSearchNote />
  </div>
</template>

<style scoped></style>
