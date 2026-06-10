import { ref } from 'vue'

export function useHelpButton() {
  const showGuideLine = ref(false)
  function openGuideLine() {
    showGuideLine.value = true
  }
  return {
    showGuideLine,
    openGuideLine,
  }
}
