import { defineStore } from 'pinia'
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { getNodes } from '../utils/useConvertMarkdown'

export interface MindMapData {
  id: string
  type: 'topic' | 'topic-branch' | 'topic-child' | 'rect-xml'
  label: string
  width?: number
  height?: number
  children?: MindMapData[]
  tools?: any[]
}

export const useNodeStore = defineStore('nodeStore', () => {
  const nodes = ref<MindMapData>()

  function generateNode(markdown: string) {
    if (!markdown) {
      message.info('There is no content')
      return
    }
    const result = getNodes(markdown)
    if (result === undefined || result.length === 0) {
      message.info('There is no mindmap generated.')
      return
    }
    if (Array.isArray(result) && result.length > 0) {
      message.success('Mindmap generated.')
      nodes.value = result[0]
    }
  }

  return {
    nodes,
    generateNode,
  }
})
