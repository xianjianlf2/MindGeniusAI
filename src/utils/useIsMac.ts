import { computed } from 'vue'

export function useIsMac() {
  return computed(() => /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) || false)
}
