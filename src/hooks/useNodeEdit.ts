import { computed, nextTick, ref } from 'vue'
import type { Node } from '@antv/x6'
import { useNodeStore } from '@/stores'

export function useEditing(statusCallback?: () => void) {
  const nodeStore = useNodeStore()
  const isEditing = ref(false)
  const inputValue = ref('')

  const currentEdit = computed(() => nodeStore.currentEditNode)
  function handleKeydown(e: any, node: Node<Node.Properties>) {
    if (e.key === 'Enter' && e.altKey) {
      inputValue.value = `${inputValue.value}\n`
    }

    else if (e.key === 'Enter' && !e.altKey) {
      isEditing.value = false
      nextTick(() => {
        node.setData({ data: inputValue.value.trim() })
      })
    }
  }
  function handleDoubleClick(node: Node<Node.Properties>) {
    isEditing.value = true
    nodeStore.setCurrentEditingNode(node.id)
    const { data } = node.getData()
    inputValue.value = data
    statusCallback && statusCallback()
  }
  function handleBlur(node: Node<Node.Properties>) {
    isEditing.value = false
    nodeStore.setCurrentEditingNode('')
    nextTick(() => {
      node.setData({ data: inputValue.value.trim() })
    })
    statusCallback && statusCallback()
  }

  function isCanEditNode(node: Node<Node.Properties>) {
    return isEditing.value && currentEdit.value === node.id
  }

  return {
    isEditing,
    inputValue,
    handleDoubleClick,
    handleBlur,
    handleKeydown,
    isCanEditNode,
  }
}
