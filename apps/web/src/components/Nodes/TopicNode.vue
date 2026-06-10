<script setup lang="ts">
import type { Node } from '@antv/x6'
import type { ComputedRef } from 'vue'
import { computed, h, inject, nextTick, onMounted, ref } from 'vue'
import { NButton, NConfigProvider, NInput, NList, NListItem, NModal, NThing } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useContainer } from './useContainer'
import ExtraButton from './ExtraButton.vue'
import { InputBox } from '@/components/Chat'
import { useGlobalStore, useNodeStore } from '@/stores'
import { useGenerateMarkdown } from '@/hooks/useGenerateMarkdown'
import { useEditing } from '@/hooks/useNodeEdit'
import { messageSuccess } from '@/hooks/message'

const getNode: (() => Node | undefined) | undefined = inject('getNode')
const globalStore = useGlobalStore()
const nodeRef = ref<Node>()
const dataRef = ref()
const { containerRef, updateContainerSize, listenDataChange } = useContainer()
const {
  isCanEditNode,
  inputValue,
  handleDoubleClick,
  handleKeydown,
  handleBlur,
} = useEditing(() => {
  nextTick(() => {
    updateContainerSize(nodeRef.value!)
  })
})

const {
  aiInputBoxContent,
  isShowModal,
  menuItems,
  nodeContent,
  isLoading,
  nodeList,
  sendMessage,
  handleNodeClick,
} = useNodeMenu()

function initData(node: Node) {
  nodeRef.value = node
  const { data } = node?.getData()
  dataRef.value = data
}

function handleDataChange(current: any) {
  const { data } = current
  dataRef.value = data
  nextTick(() => {
    updateContainerSize(nodeRef.value!)
  })
}

onMounted(() => {
  const node = getNode!()
  initData(node!)
  listenDataChange(node!, handleDataChange)
  nextTick(() => {
    updateContainerSize(node!)
  })
})

function useNodeMenu() {
  // store
  const nodeStore = useNodeStore()
  // modal
  const isShowModal = ref(false)
  // message box
  const isLoading = computed(() => nodeStore.isLoading)
  const aiInputBoxContent = ref('')
  const nodeContent = computed(() => useGenerateMarkdown(nodeStore.currentNodeContent))
  const nodeList: ComputedRef<Array<any>> = computed(() => nodeStore.nodeList)
  // menu list
  const renderIcon = (icon: string) => {
    return () => h(Icon, {
      icon,
      width: '20',
    })
  }
  const menuItems = ref([
    {
      key: 'Add child',
      label: 'Add child',
      icon: renderIcon('material-symbols:add'),
      handler: () => {
        handleAddChild()
      },
    },
    {
      key: 'Brain storm',
      label: 'Brain storm',
      icon: renderIcon('carbon:star-review'),
      handler: () => {
        initModal()
        isShowModal.value = true
      },
    },
  ])
  const lastMessage = ref('')

  function sendMessage(message?: string) {
    if (message)
      lastMessage.value = message
    nodeStore.clearMessage()
    nodeStore.clearNodeList()
    nodeStore.getCurrentNodeContent(lastMessage.value)
  }
  function initModal() {
    const { data } = nodeRef.value?.getData()
    aiInputBoxContent.value = data
    nodeStore.clearMessage()
  }
  function handleAddChild() {
    if (!nodeRef.value)
      return
    const {
      addChildNode, render,
    } = nodeRef.value.getData()
    const { id } = nodeRef.value
    const type = nodeRef.value.prop('type')
    if (addChildNode(id, type)) {
      messageSuccess('Add child node success!')
      render()
    }
  }
  function handleNodeClick(data: any) {
    if (!data || !nodeRef.value)
      return
    const node = nodeList.value.find(item => item.id === data.id)
    const {
      addChildNode, render,
    } = nodeRef.value.getData()
    const { id } = nodeRef.value
    const newNode = addChildNode(id, node?.type, data.label)
    if (newNode) {
      render()
      messageSuccess('Add child node success!')
    }
  }

  return {
    aiInputBoxContent,
    isShowModal,
    menuItems,
    nodeContent,
    isLoading,
    nodeList,
    sendMessage,
    handleNodeClick,
  }
}
</script>

<template>
  <div class="flex flex-row items-center" @dblclick.prevent="() => handleDoubleClick(nodeRef!)">
    <div
      ref="containerRef" class="bg-gradient-to-r from-blue-500 to-teal-400
  rounded-lg
  box-border
  p-3
  flex justify-center
  items-center
  h-auto w-auto
  min-h-[50px] min-w-[200px] max-w-[500px]
  overflow-hidden
  relative
  node-text
  "
    >
      <span
        class="text-shadow-md text-lg whitespace-pre-wrap w-full"
        :class="isCanEditNode(nodeRef!) ? 'block-hidden' : 'block-visible'"
      >
        {{ dataRef }}
      </span>
      <div class="w-full flex" :class="isCanEditNode(nodeRef!) ? 'block-visible' : 'block-hidden'">
        <NInput
          v-model:value="inputValue" type="textarea" @press-enter="(e: KeyboardEvent) => handleKeydown(e, nodeRef!)"
          @blur="handleBlur(nodeRef!)"
        />
      </div>
    </div>
    <div class="flex extra-button ml-2">
      <ExtraButton :options="menuItems" />
    </div>
  </div>
  <NConfigProvider :theme="globalStore.theme">
    <NModal
      v-model:show="isShowModal" title="Brain Storm" preset="card" style="width: 600px;" :bordered="false"
      size="huge" :theme="globalStore.theme?.Modal"
    >
      <div
        v-if="!nodeList.length" class="robot-bubble" :class="isLoading ? 'bubble-transition' : ''"
        v-html="nodeContent"
      />
      <div v-else>
        <NList>
          <NListItem v-for="item in nodeList" :key="item.key">
            <template #suffix>
              <NButton @click="handleNodeClick(item)">
                <template #icon>
                  <Icon icon="carbon:data-enrichment-add" />
                </template>
                Append
              </NButton>
            </template>
            <NThing>
              {{ item.label }}
            </NThing>
          </NListItem>
        </NList>
      </div>
      <div v-if="!isLoading" :style="{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px' }">
        <NButton @click="() => sendMessage()">
          <template #icon>
            <Icon icon="carbon:reset" />
          </template>
          Regenerate
        </NButton>
      </div>
      <InputBox v-model:message="aiInputBoxContent" :is-loading="isLoading" @send-message="sendMessage" />
    </NModal>
  </NConfigProvider>
</template>

<style scoped>
.block-hidden {
  display: none;
}

.block-visible {
  display: block;
}

.extra-button {
  visibility: hidden;
}

.x6-node-selected .extra-button {
  visibility: visible;
}

@keyframes highlight {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

.bubble-transition {
  background-image: linear-gradient(to right, #2b5876 0%, #4e4376 100%);
  background-position: 100% 0;
  background-size: 200% 100%;
  animation: highlight 2s linear infinite;
}

.robot-bubble {
  border-radius: 8px;
  padding: 8px;
  background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
}
</style>
