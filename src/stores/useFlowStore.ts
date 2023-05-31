import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFlowStore = defineStore('flowStore', () => {
  const elements = ref([])

  function generateFlowElement(mindMap: string) {
    const graph = new Graph()
    const nodes = mindMap.match(/\[[^\]]+\]/g).map(node => node.slice(1, -1))
    nodes.forEach(node => graph.setNode(node))
  }

  return {
    elements,
  }
})
