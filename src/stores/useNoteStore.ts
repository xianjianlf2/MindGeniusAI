import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CardType } from '@/components/MindMapSide/type'

export const useNoteStore = defineStore('noteStore', () => {
  const notesList = ref<CardType[]>([])
  const currentEditId = ref<number | undefined>()
  const currentLoadingId = ref<number | undefined>()

  const reverseNoteList = computed(() => notesList.value.slice().reverse())

  function addNote(content: string) {
    const id = notesList.value.length + 1
    const item = {
      id,
      content,
    }
    notesList.value.push(item)
    return item
  }

  function removeNote(id: CardType['id']) {
    notesList.value = notesList.value.filter(item => item.id !== id)
  }

  function updateNote(item: CardType) {
    const noteItem = notesList.value.find(note => note.id === item.id)
    if (noteItem)
      noteItem.content = item.content
  }

  function setCurrentEditId(id: CardType['id'] | undefined) {
    currentEditId.value = id
  }

  function isEditing(id: number) {
    return currentEditId.value === id
  }

  function setCurrentLoadingId(id: CardType['id'] | undefined) {
    currentLoadingId.value = id
  }

  function isLoading(id: number) {
    return currentLoadingId.value === id
  }

  return {
    notesList,
    reverseNoteList,
    currentEditId,
    currentLoadingId,
    addNote,
    isEditing,
    isLoading,
    removeNote,
    setCurrentEditId,
    setCurrentLoadingId,
    updateNote,
  }
})
