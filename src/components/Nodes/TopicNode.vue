<script setup lang="ts">
import type { Node } from '@antv/x6'
import { computed, inject, nextTick, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import InputBox from '../InputBox.vue'
import { useContainer } from './useContainer'
import { useNodeStore } from '@/stores'
import { useGenerateMarkdown } from '@/hooks/useGenerateMarkdown'

const getNode: (() => Node | undefined) | undefined = inject('getNode')
const nodeRef = ref<Node>()
const dataRef = ref()
const { containerRef, updateContainerSize, listenDataChange } = useContainer()

const message = ref('')
const isShowModal = ref(false)
const modalRef = ref()
const nodeStore = useNodeStore()

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

const menuItems = ref([
  {
    key: 'Add child',
    label: 'Add child',
    icon: 'material-symbols:add',
    handler: () => {
      console.log('Add child')
    },
  },
  {
    key: 'Brain storm',
    label: 'Brain storm',
    icon: 'carbon:star-review',
    handler: () => {
      initModal()
      isShowModal.value = true
    },
  },
])

function initModal() {
  const { data } = nodeRef.value?.getData()
  message.value = data
  nodeStore.clearMessage()
}
function sendMessage(message: string) {
  nodeStore.getCurrentNodeContent(message)
//   isShowModal.value = false
}
const nodeContent = computed(() => useGenerateMarkdown(nodeStore.currentNodeContent))
</script>

<template>
  <div
    class="flex flex-row items-center pr-3"
  >
    <div
      ref="containerRef"
      class="bg-gradient-to-tr from-purple-600 via-blue-500 to-green-300  rounded-lg p-3 flex justify-center items-center text-white h-auto w-auto min-h-[50px] min-w-[200px] max-w-[500px]"
    >
      <span class="text-shadow-md text-lg">
        {{ dataRef }}
      </span>
    </div>
    <div class="ml-2 flex extra-button">
      <a-dropdown :trigger="['click']">
        <a-button type="primary" shape="circle" class="hover:scale-110 hover:font-bold">
          <template #icon>
            <span class="button-icon">
              <Icon icon="material-symbols:add" width="24" color="white" />
            </span>
          </template>
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item v-for="item in menuItems" :key="item.key">
              <a-button type="text" size="small" @click.prevent="item.handler">
                <template #icon>
                  <span class="button-icon">
                    <Icon :icon="item.icon" width="18" color="black" />
                  </span>
                </template>
                {{ item.label }}
              </a-button>>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
  <a-modal
    ref="modalRef"
    v-model:open="isShowModal"
    title="Brain Storm"
    :footer="null"
  >
    <div v-html="nodeContent" />
    <InputBox v-model:message="message" @send-message="sendMessage" />
  </a-modal>
</template>

<style scoped>
.extra-button{
    visibility: hidden;
}
.x6-node-selected .extra-button {
    visibility: visible;
  }
</style>
