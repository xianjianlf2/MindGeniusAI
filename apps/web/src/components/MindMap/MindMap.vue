<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Graph, Path } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'
import { cloneDeep } from 'lodash'
import { register } from '@antv/x6-vue-shape'
import { History } from '@antv/x6-plugin-history'
import { Export } from '@antv/x6-plugin-export'
import { Icon } from '@iconify/vue'
import { NButton } from 'naive-ui'
import GraphToolbar from './GraphToolBar.vue'
import { useNodeStore } from '@/stores'
import NoteNode from '@/components/Nodes/NoteNode.vue'
import TopicChildNode from '@/components/Nodes/TopicChildNode.vue'
import TopicNode from '@/components/Nodes/TopicNode.vue'
import { useNodeOperate } from '@/hooks/useNodeOperate'
import Help from '@/components/Help.vue'

const containerRef = ref()
const nodeStore = useNodeStore()
const historyStateRef = ref()
const { render, removeNode, addChildNode, dataRef, graphRef } = useNodeOperate()

const { showGuideLine, openGuideLine } = useHelpButton()

watch(
  () => nodeStore.nodes,
  (nodes) => {
    dataRef.value = cloneDeep(nodes)
    if (nodes && graphRef.value) {
      registerKeyboard(
        graphRef.value,
        render,
      )
      render()
      graphRef.value.addNode({
        shape: 'note-node',
        position: { x: 0, y: 0 },
      })

      graphRef.value.zoomToFit({
        padding: 20,
        minScale: 0.5,
        maxScale: 1,
      })
    }
  },
)
function useRegister() {
  // Connector
  Graph.registerConnector(
    'mindmap',
    (sourcePoint, targetPoint, _routerPoints, options) => {
      const midX = sourcePoint.x + 10
      const midY = sourcePoint.y
      const ctrX = (targetPoint.x - midX) / 5 + midX
      const ctrY = targetPoint.y
      const pathData = `
     M ${sourcePoint.x} ${sourcePoint.y}
     L ${midX} ${midY}
     Q ${ctrX} ${ctrY} ${targetPoint.x} ${targetPoint.y}
    `
      return options.raw ? Path.parse(pathData) : pathData
    },
    true,
  )

  // edge
  Graph.registerEdge(
    'mindmap-edge',
    {
      inherit: 'edge',
      connector: {
        name: 'mindmap',
      },
      attrs: {
        line: {
          targetMarker: '',
          stroke: '#A2B1C3',
          strokeWidth: 2,
        },
      },
      zIndex: 0,
    },
    true,
  )
  // custom node
  register({
    shape: 'note-node',
    width: 100,
    height: 100,
    component: NoteNode,
  })
  register({
    shape: 'topic-child',
    width: 100,
    height: 100,
    component: TopicChildNode,
  })
  register({
    shape: 'topic',
    width: 100,
    height: 100,
    component: TopicNode,
  })
}

function useRegisterPlugins(graph: Graph) {
  graph.use(new Snapline())
  graph.use(new Export())

  graph.use(
    new Selection({
      multiple: true,
      modifiers: ['alt'],
      rubberband: true,
      showNodeSelectionBox: true,
      pointerEvents: 'none',
    }),
  )
  graph.use(new Keyboard())
  graph.use(new History())
}

function useInitMindMap() {
  const graph = new Graph({
    container: containerRef.value,
    mousewheel: {
      enabled: true,
      // modifiers: ['ctrl', 'meta'],
    },
    autoResize: true,
    panning: true,
    background: {
      color: '#0F1729',
    },
  })

  useRegisterPlugins(graph)
  return { graph }
}

function handleHistoryChange(graph: Graph) {
  graph.on('history:change', () => {
    historyStateRef.value = {
      canRedo: graph.canRedo(),
      canUndo: graph.canUndo(),
    }
  })
}

function handleHideNode(graph: Graph) {
  graph.on('blank:click', () => {
    nodeStore.setCurrentEditingNode('')
  })
}

function handleDeleteKey(graph: Graph, render: any) {
  graph.bindKey(['backspace', 'delete'], () => {
    const selectedNodes = graph
      .getSelectedCells()
      .filter(item => item.isNode())
    if (selectedNodes.length) {
      const { id } = selectedNodes[0]
      if (removeNode(id))
        render(graph)
      graph.removeCells(selectedNodes)
    }
  })
}

function handleTabKey(graph: Graph, render: any) {
  graph.bindKey('tab', (e) => {
    e.preventDefault()
    const selectedNodes = graph
      .getSelectedCells()
      .filter(item => item.isNode())
    if (selectedNodes.length) {
      const node = selectedNodes[0]
      const type = node.prop('type')
      if (addChildNode(node.id, type))
        render(graph)
    }
  })
}

function registerKeyboard(graph: Graph, render: any) {
  // handleAddTopic(graph, render)
  handleHideNode(graph)
  handleHistoryChange(graph)
  handleDeleteKey(graph, render)
  handleTabKey(graph, render)
}

onMounted(() => {
  const { graph } = useInitMindMap()
  useRegister()
  graphRef.value = graph
})

function useHelpButton() {
  const showGuideLine = ref(false)
  function openGuideLine() {
    showGuideLine.value = true
  }
  return {
    showGuideLine,
    openGuideLine,
  }
}
</script>

<template>
  <div class="w-full flex flex-col h-full relative bg-[#0F1729] flex-1">
    <div class="flex  items-center  justify-center mt-2">
      <GraphToolbar v-if="graphRef" :graph="graphRef!" :history-state="historyStateRef" />
    </div>
    <div ref="containerRef" />
    <div class="absolute right-8 bottom-8">
      <NButton size="large" @click="openGuideLine">
        <template #icon>
          <Icon icon="material-symbols:question-mark-rounded" width="20" color="white" />
        </template>
      </NButton>
    </div>

    <Help v-model="showGuideLine" />
  </div>
</template>

<style scoped></style>
