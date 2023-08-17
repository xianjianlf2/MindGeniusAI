<script setup lang="ts">
import { NScrollbar } from 'naive-ui'
import { useSearchNotes } from './searchNotes'
import CommandSearchNoteItem from './CommandSearchNoteItem.vue'
import { useSearch } from './search'

const { selectedIndex } = useSearch()
const { filteredNotes } = useSearchNotes()
</script>

<template>
  <NScrollbar style="max-height: 400px" trigger="none">
    <CommandSearchNoteItem v-for="(item, index) in filteredNotes" :key="item.id" :item="item" :is-active="index === selectedIndex" :index="index" />
  </NScrollbar>
</template>

<style scoped>

</style>
