<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Graph, Path } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import Hierarchy from '@antv/hierarchy'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'
import { cloneDeep } from 'lodash'
import { register } from '@antv/x6-vue-shape'
import { History } from '@antv/x6-plugin-history'
import { Export } from '@antv/x6-plugin-export'
import type { MindMapData } from '../stores'
import { useNodeStore } from '../stores'
import CustomerNode from './CustomerNode.vue'
import GraphToolbar from './GraphToolBar.vue'

interface HierarchyResult {
  id: string
  x: number
  y: number
  data: MindMapData
  children?: HierarchyResult[]
}

const data = ref<MindMapData>()
const graphRef = ref<Graph>()
const containerRef = ref()
const nodeStore = useNodeStore()
const historyStateRef = ref()
watch(
  () => nodeStore.nodes,
  (nodes) => {
    data.value = cloneDeep(nodes)
    if (nodes) {
      useBindingKeyBoard(
        graphRef.value!,
        render,
      )
      render(graphRef.value!)
      graphRef.value!.addNode({
        shape: 'note-node',
        position: { x: 0, y: 0 },
      })

      graphRef.value?.zoomToFit({
        padding: 20,
        minScale: 0.5,
        maxScale: 1,
      })
    }
  },
)
function useRegister() {
  // topic
  Graph.registerNode(
    'topic',
    {
      inherit: 'rect',
      markup: [
        {
          tagName: 'rect',
          selector: 'body',
        },
        {
          tagName: 'image',
          selector: 'img',
        },
        {
          tagName: 'text',
          selector: 'label',
        },
      ],
      attrs: {
        body: {
          rx: 6,
          ry: 6,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
          strokeWidth: 1,
        },
        img: {
          'ref': 'body',
          'refX': '100%',
          'refY': '50%',
          'refY2': -8,
          'width': 16,
          'height': 16,
          'xlink:href':
            'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*SYCuQ6HHs5cAAAAAAAAAAAAAARQnAQ',
          'event': 'add:topic',
          'class': 'topic-image',
        },
        label: {
          fontSize: 14,
          fill: '#262626',
        },
      },
    },
    true,
  )

  // child topic
  Graph.registerNode(
    'topic-child',
    {
      inherit: 'rect',
      markup: [
        {
          tagName: 'rect',
          selector: 'body',
        },
        {
          tagName: 'text',
          selector: 'label',
        },
        {
          tagName: 'path',
          selector: 'line',
        },
      ],
      attrs: {
        body: {
          fill: '#fff',
          rx: 6,
          ry: 6,
        },
        label: {
          fontSize: 16,
          fill: '#262626',
          textVerticalAnchor: 'bottom',
        },
      },
    },
    true,
  )

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
    component: CustomerNode,
  })
}

function render(graph: Graph) {
  const result: HierarchyResult = Hierarchy.mindmap(data.value, {
    direction: 'H',
    getHeight(d: MindMapData) {
      return d.height
    },
    getWidth(d: MindMapData) {
      return d.width
    },
    getHGap() {
      return 40
    },
    getVGap() {
      return 20
    },
    getSide: () => {
      return 'right'
    },
  })
  const cells: any[] = []
  const traverse = (hierarchyItem: HierarchyResult) => {
    if (hierarchyItem) {
      const { data, children } = hierarchyItem
      cells.push(
        graph.createNode({
          id: data.id,
          shape: data.type === 'topic-child' ? 'topic-child' : 'topic',
          x: hierarchyItem.x,
          y: hierarchyItem.y,
          width: data.width,
          height: data.height,
          label: data.label,
          type: data.type,
          tools: ['node-editor'],
        }),
      )
      if (children) {
        children.forEach((item: HierarchyResult) => {
          const { id, data } = item
          cells.push(
            graph.createEdge({
              shape: 'mindmap-edge',
              source: {
                cell: hierarchyItem.id,
                anchor:
                  data.type === 'topic-child'
                    ? {
                        name: 'right',
                        args: {
                          dx: -16,
                        },
                      }
                    : {
                        name: 'center',
                        args: {
                          dx: '25%',
                        },
                      },
              },
              target: {
                cell: id,
                anchor: {
                  name: 'left',
                },
              },
            }),
          )
          traverse(item)
        })
      }
    }
  }
  traverse(result)
  graph.resetCells(cells)
  graph.centerContent()
}

function findItem(
  obj: MindMapData,
  id: string,
): {
    parent: MindMapData | null
    node: MindMapData | null
  } | null {
  if (obj.id === id) {
    return {
      parent: null,
      node: obj,
    }
  }
  const { children } = obj
  if (children) {
    for (let i = 0, len = children.length; i < len; i++) {
      const res = findItem(children[i], id)
      if (res) {
        return {
          parent: res.parent || obj,
          node: res.node,
        }
      }
    }
  }
  return null
}
function addChildNode(id: string, type: any) {
  const res = findItem(data.value!, id)
  const dataItem = res?.node
  if (dataItem) {
    let item: MindMapData | null = null
    const length = dataItem.children ? dataItem.children.length : 0
    if (type === 'topic') {
      item = {
        id: `${id}-${length + 1}`,
        type: 'topic-branch',
        label: `topic-branch-${length + 1}`,
        width: 100,
        height: 40,
      }
    }
    else if (type === 'topic-branch') {
      item = {
        id: `${id}-${length + 1}`,
        type: 'topic-child',
        label: `topic-child-${length + 1}`,
        width: 60,
        height: 30,
      }
    }
    if (item) {
      if (dataItem.children)
        dataItem.children.push(item)
      else dataItem.children = [item]

      return item
    }
  }
  return null
}

function removeNode(id: string) {
  const res = findItem(data.value!, id)
  const dataItem = res?.parent
  if (dataItem && dataItem.children) {
    const { children } = dataItem
    const index = children.findIndex(item => item.id === id)
    return children.splice(index, 1)
  }
  return null
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

function handleAddTopic(graph: Graph, render: any) {
  graph.on('add:topic', ({ node }: { node: any }) => {
    const { id } = node
    const type = node.prop('type')
    if (addChildNode(id, type))
      render(graph)
  })
}

function handleHistoryChange(graph: Graph) {
  graph.on('history:change', () => {
    historyStateRef.value = {
      canRedo: graph.canRedo(),
      canUndo: graph.canUndo(),
    }
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

function useBindingKeyBoard(graph: Graph, render: any) {
  handleAddTopic(graph, render)
  handleHistoryChange(graph)
  handleDeleteKey(graph, render)
  handleTabKey(graph, render)
}

onMounted(() => {
  const { graph } = useInitMindMap()
  useRegister()
  graphRef.value = graph
})
</script>

<template>
  <div class="h-full w-full flex flex-col">
    <div class="flex  items-center bg-#1e293b">
      <GraphToolbar v-if="graphRef" :graph="graphRef!" :history-state="historyStateRef" />
    </div>
    <div ref="containerRef" />
  </div>
</template>

<style scoped></style>
