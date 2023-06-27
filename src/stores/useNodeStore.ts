import { defineStore } from 'pinia'
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { v4 as uuidv4 } from 'uuid'
import type { marked } from 'marked'
import { getNodes, getSingleNode } from '../utils/useConvertMarkdown'
import { fetchChatNode } from '@/api/chatNode'
import { measureText } from '@/utils'

export interface MindMapData {
  id: string
  type: 'topic' | 'topic-branch' | 'topic-child'
  label: string
  width?: number
  height?: number
  children?: MindMapData[]
  tools?: any[]
}

export const useNodeStore = defineStore('nodeStore', () => {
  const nodes = ref<MindMapData>()
  const noteContent = ref<string>()
  const nodeList = ref<any>([])
  const currentNodeContent = ref('')
  const isLoading = ref(false)

  function resetSingleNode() {
    currentNodeContent.value = ''
    nodeList.value = []
  }
  function generateNode(markdown: string) {
    resetSingleNode()
    if (!markdown) {
      message.info('There is no content')
      return
    }
    const result = getNodes(markdown)
    if (result === undefined || result.length === 0) {
      message.info('There is no mind map generated.')
      return
    }
    if (Array.isArray(result) && result.length > 0) {
      message.success('Mind map generated.')
      nodes.value = result[0]
      noteContent.value = markdown
    }
  }

  function toggleLoading(val: boolean) {
    isLoading.value = val
  }

  function appendMessage(message: string) {
    currentNodeContent.value += message
  }

  function clearMessage() {
    currentNodeContent.value = ''
  }

  function getCurrentNodeContent(content: string) {
    return fetchChatNode(content)
  }

  function splitTextToNodes() {
    const content = currentNodeContent.value
    if (!content)
      return
    const tokens = getSingleNode(content)
    const nodes = tokens.reduce((acc: any, token: marked.Token) => {
      if (token.type === 'list') {
        const items = token.items.map(item => ({
          id: uuidv4(),
          type: 'topic-branch',
          label: item.text,
          ...measureText(item.text),
        }))
        return [...acc, ...items]
      }
      return acc
    }, [])
    nodeList.value = nodes
  }

  return {
    nodes,
    noteContent,
    nodeList,
    currentNodeContent,
    isLoading,
    generateNode,
    toggleLoading,
    appendMessage,
    clearMessage,
    getCurrentNodeContent,
    splitTextToNodes,
  }
})
