<script setup lang="ts">
import { NButton, NCard, NCollapseTransition, NEllipsis, NInput, NPopselect, NSpin } from 'naive-ui'
import type { PropType } from 'vue'
import { nextTick, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { CardType } from './type'
import { useChatStore, useNodeStore, useNoteStore } from '@/stores'
import { useGenerateMarkdown } from '@/hooks'
import { messageInfo, messageSuccess } from '@/hooks/message'

const props = defineProps({
  data: { type: Object as PropType<CardType>, required: true },
})

const chatStore = useChatStore()
const editBuffer = ref('')
const inputElement = ref<HTMLInputElement>()
const nodeStore = useNodeStore()
const noteStore = useNoteStore()
const {
  extraButtonOptions,
  handleSelect,
} = useExtraButton()

watch(() => noteStore.currentEditId, (val) => {
  if (props.data.id === val) {
    editBuffer.value = props.data.content
    nextTick(() => {
      inputElement.value?.focus()
    })
  }
}, {
  immediate: true,
})

function handleClose(id: number) {
  noteStore.removeNote(id)
}

function isEditing(id: number) {
  return noteStore.isEditing(id)
}

function resetInputStatus() {
  noteStore.setCurrentEditId(undefined)
  editBuffer.value = ''
}

function toggleEdit(item: CardType, isCancel = false) {
  const { id, content } = item
  if (isEditing(id)) {
    if (!isCancel)
      noteStore.updateNote({ id, content: editBuffer.value })

    resetInputStatus()
    return
  }
  noteStore.setCurrentEditId(id)
  editBuffer.value = content
}

function isLoading(id: number) {
  return noteStore.isLoading(id)
}

function useExtraButton() {
  const extraButtonOptions = ref([
    {
      label: 'Generate MindMap',
      value: 'mindmap',
      handler: handleGenerate,
    },
    {
      label: 'Compress content',
      value: 'compress',
      handler: handleCompress,
    },
  ])

  function handleGenerate(item: CardType) {
    const { content } = item
    nodeStore.generateNode(content)
  }

  async function handleCompress(item: CardType) {
    if (item.content.trim() === '')
      return messageInfo('Content is empty!')

    const { id, content } = item
    if (isEditing(id))
      return

    noteStore.setCurrentLoadingId(id)
    const res = await chatStore.compressContent(content)
    const { content: data } = res.data
    noteStore.updateNote({
      id,
      content: data,
    })
    messageSuccess('Compress success!')
    noteStore.setCurrentLoadingId(undefined)
  }

  function handleSelect(value: string, item: CardType) {
    const handler = extraButtonOptions.value.find(item => item.value === value)
    handler && handler.handler(item)
  }
  return {
    extraButtonOptions,
    handleSelect,
  }
}
</script>

<template>
  <NCard closable @close="handleClose(data.id)">
    <template #header>
      <span>{{ `Notes ${data.id}` }}</span>
    </template>
    <div class="w-full flex justify-between items-center my-2">
      <div class="gap-2 flex">
        <NButton ghost type="primary" @click="toggleEdit(data)">
          <template #icon>
            <Icon :icon="isEditing(data.id) ? 'material-symbols:save-rounded' : 'material-symbols:edit'" />
          </template>
          {{ isEditing(data.id) ? 'Save' : 'Edit' }}
        </NButton>
        <NButton v-if="isEditing(data.id)" type="error" ghost @click="toggleEdit(data, true)">
          <template #icon>
            <Icon icon="material-symbols:cancel-presentation-outline" />
          </template>
          Cancel
        </NButton>
      </div>
      <NPopselect :options="extraButtonOptions" @update:value="(val) => handleSelect(val, data)">
        <NButton quaternary>
          <template #icon>
            <Icon icon="mdi:format-list-bulleted" />
          </template>
        </NButton>
      </NPopselect>
    </div>
    <NCollapseTransition :show="isEditing(data.id)">
      <NInput ref="inputElement" v-model:value="editBuffer" type="textarea" show-count autosize />
    </NCollapseTransition>
    <NCollapseTransition :show="!isEditing(data.id)">
      <NSpin :show="isLoading(data.id)">
        <NEllipsis :line-clamp="5" :tooltip="false" expand-trigger="click">
          <div v-html="useGenerateMarkdown(data.content)" />
        </NEllipsis>
      </NSpin>
    </NCollapseTransition>
  </NCard>
</template>

<style scoped>

</style>
