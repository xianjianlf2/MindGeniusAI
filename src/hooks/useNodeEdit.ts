import { nextTick, ref } from 'vue'
import type { Node } from '@antv/x6'

export function useEditing() {
  const isEditing = ref(false)
  const inputValue = ref('')
  const inputAreaRef = ref<HTMLTextAreaElement>()
  function handleKeydown(e: any, node: Node<Node.Properties>, data: string) {
    if (e.key === 'Enter' && e.altKey) {
      inputValue.value = `${inputValue.value}\n`
    }

    else if (e.key === 'Enter' && !e.altKey) {
      isEditing.value = false
      nextTick(() => {
        node.setData({ data: inputValue.value.trim() })
      })
    }
    else if (e.key === 'Escape') {
      inputAreaRef.value?.blur()
      isEditing.value = false
      nextTick(() => {
        node.setData({ data })
      })
    }
  }
  function handleDoubleClick(node: Node<Node.Properties>) {
    isEditing.value = true
    const { data } = node.getData()
    inputValue.value = data
  }

  return {
    isEditing,
    inputValue,
    handleDoubleClick,
    handleKeydown,
  }
}
