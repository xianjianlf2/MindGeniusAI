import type { Graph } from '@antv/x6'
import Hierarchy from '@antv/hierarchy'
import { ref } from 'vue'
import type { MindMapData } from '@/stores'
import { measureText } from '@/utils'

export interface HierarchyResult {
  id: string
  x: number
  y: number
  data: MindMapData
  children?: HierarchyResult[]
}
export function useNodeOperate() {
  const graphRef = ref<Graph>()
  const dataRef = ref<MindMapData>()
  function render() {
    const result: HierarchyResult = Hierarchy.mindmap(dataRef.value, {
      direction: 'H',
      getHeight(d: MindMapData) {
        return d.height
      },
      getWidth(d: MindMapData) {
        return d.width ? d.width * 2 : 100
      },
      getHGap(d: MindMapData) {
        return d.height
      },
      getVGap() {
        return 40
      },
      getSide: () => {
        return 'right'
      },
    })
    const cells: any[] = []
    const traverse = (hierarchyItem: HierarchyResult) => {
      if (hierarchyItem) {
        const { data, children } = hierarchyItem
        const node = graphRef.value!.createNode({
          id: data.id,
          shape: data.type === 'topic-child' ? 'topic-child' : 'topic',
          x: hierarchyItem.x,
          y: hierarchyItem.y,
          width: data.width,
          height: data.height,
          type: data.type,
        })
        node.setData({
          data: data.label,
          addChildNode,
          removeNode,
          render,
        })
        cells.push(
          node,
        )
        if (children) {
          children.forEach((item: HierarchyResult) => {
            const { id, data } = item
            cells.push(
              graphRef.value!.createEdge({
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
    graphRef.value!.resetCells(cells)
    graphRef.value!.centerContent()
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
  function addChildNode(id: string, type: any, customerLabel?: string) {
    const res = findItem(dataRef.value!, id)
    const dataItem = res?.node
    if (dataItem) {
      const length = dataItem.children ? dataItem.children.length : 0
      let item: MindMapData | null = null
      if (type === 'topic') {
        const label = customerLabel ?? `topic-${length + 1}`
        item = {
          id: `${id}-${length + 1}`,
          type: 'topic-branch',
          label,
          ...measureText(label),
        }
      }
      else if (type === 'topic-branch') {
        const label = customerLabel ?? `topic-branch-${length + 1}`
        item = {
          id: `${id}-${length + 1}`,
          type: 'topic-child',
          label,
          ...measureText(label),
        }
      }
      if (item) {
        if (dataItem.children)
          dataItem.children.push(item)

        else
          dataItem.children = [item]

        return item
      }
    }
    return null
  }

  function removeNode(id: string) {
    const res = findItem(dataRef.value!, id)
    const dataItem = res?.parent
    if (dataItem && dataItem.children) {
      const { children } = dataItem
      const index = children.findIndex(item => item.id === id)
      return children.splice(index, 1)
    }
    return null
  }

  return {
    graphRef,
    dataRef,
    render,
    findItem,
    addChildNode,
    removeNode,
  }
}
