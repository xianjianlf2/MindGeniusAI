<script setup lang="ts">
import { NButton, NLayoutSider, NScrollbar } from 'naive-ui'
import { Icon } from '@iconify/vue'
import NoteCard from './NoteCard.vue'
import { useCommandModal } from '@/components/command/commandModal'
import { useNoteStore } from '@/stores'

const notesStore = useNoteStore()
const { openCommandModal } = useCommandModal()

function handleNewClick() {
  const item = notesStore.addNote('')
  notesStore.setCurrentEditId(item.id)
}
</script>

<template>
  <NLayoutSider collapse-mode="width" :collapsed-width="0" :width="360" show-trigger="bar" bordered>
    <div class="h-full w-full bg-[#0F1729] overflow-hidden">
      <div class="p-2 flex items-center justify-between">
        <NButton type="primary" @click="handleNewClick">
          <template #icon>
            <Icon icon="material-symbols:add" />
          </template>
          New
        </NButton>
        <NButton type="primary" ghost @click="openCommandModal()">
          <template #icon>
            <Icon icon="material-symbols:search" />
          </template>
        </NButton>
      </div>
      <NScrollbar style="max-height: calc(100% - 25px);">
        <div class="p-2 flex flex-col gap-2">
          <NoteCard v-for="note in notesStore.reverseNoteList" :key="note.id" :data="note" />
        </div>
      </NScrollbar>
    </div>
  </NLayoutSider>
</template>

<style scoped></style>
