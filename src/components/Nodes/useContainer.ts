import { ref } from 'vue'
import type { Node } from '@antv/x6'

export function useContainer() {
  const containerRef = ref<HTMLElement | null>(null)

  function updateContainerSize(node: Node) {
    const { clientWidth, clientHeight } = containerRef.value!
    node.resize(clientWidth, clientHeight)
  }
  function listenDataChange(node: Node, handleDataChange: (current: any) => void) {
    if (node === undefined)
      return
    node.on('change:data', ({ current }) => {
      handleDataChange(current)
    })
  }
  return {
    containerRef,
    updateContainerSize,
    listenDataChange,
  }
}
