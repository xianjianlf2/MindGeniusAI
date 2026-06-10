import Fuse from 'fuse.js'
import { ref } from 'vue'
import type { CardType } from '../MindMapSide/type'
import { useNoteStore } from '@/stores'

const fuse = new Fuse([] as CardType[], {
  keys: ['title', 'content'],
})

const filteredNotes = ref<CardType[]>([])
export function useSearchNotes() {
  function searchNotes(input: string) {
    if (!input) {
      resetSearchNotes()
      return
    }
    const noteStore = useNoteStore()
    const notes = noteStore.notesList
    fuse.setCollection(notes)
    filteredNotes.value = fuse.search(input).map(i => i.item)
  }

  function resetSearchNotes() {
    filteredNotes.value = []
  }

  return {
    filteredNotes,
    searchNotes,
    resetSearchNotes,
  }
}
