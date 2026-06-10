import { computed, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useSearchNotes } from './searchNotes'

const search = ref('')
const isLoading = ref(false)
const isSearching = ref(false)
const selectedIndex = ref<number>(0)
let isInitialized = false

const { searchNotes, resetSearchNotes } = useSearchNotes()

export function useSearch() {
  function init() {
    if (isInitialized)
      return
    isInitialized = true
    watchDebounced(() => search.value, (v) => {
      if (v) {
        isLoading.value = true
        setTimeout(() => {
          searchNotes(v)
          isSearching.value = true
          selectedIndex.value = 0
          isLoading.value = false
        }, 500)
      }
    }, {
      debounce: 500,
    })
    watch(() => search.value, (v) => {
      if (v === '') {
        resetSearch()
        resetSearchNotes()
      }
    })
  }

  init()

  const isSearchCommand = computed(() => {
    return search.value.startsWith('>')
  })

  function resetSearch() {
    search.value = ''
    isLoading.value = false
    selectedIndex.value = 0
  }

  function setSelectedIndex(index: number) {
    selectedIndex.value = index
  }

  return {
    search,
    isLoading,
    isSearchCommand,
    isSearching,
    selectedIndex,
    resetSearch,
    setSelectedIndex,
  }
}
