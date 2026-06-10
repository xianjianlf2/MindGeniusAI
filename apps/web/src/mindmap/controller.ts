import Hierarchy from '@antv/hierarchy'
import type { Cell, Graph } from '@antv/x6'
import type { MindMapData, MindMapNodeType } from '@/utils/convertMarkdown'
import { measureText } from '@/utils/measureText'

interface HierarchyResult {
  id: string
  x: number
  y: number
  data: MindMapData
  children?: HierarchyResult[]
}

export interface NodeComponentData {
  label: string
  type: MindMapNodeType
  controller: MindMapController
  /** 所属一级分支的序号（根的直接子节点按序编号，整条子树继承），用于彩色分层模式 */
  branchIndex?: number
}

/**
 * 持有导图数据树并负责布局渲染（移植自 Vue 版 useNodeOperate，逻辑不变）。
 * 节点组件通过 node.getData().controller 调用增删改。
 */
export class MindMapController {
  data: MindMapData | null = null

  constructor(public graph: Graph) {}

  setData(data: MindMapData) {
    this.data = structuredClone(data)
    this.render()
    this.graph.zoomToFit({ padding: 20, minScale: 0.5, maxScale: 1 })
  }

  render() {
    if (!this.data)
      return
    const result: HierarchyResult = Hierarchy.mindmap(this.data, {
      direction: 'H',
      getHeight: (d: MindMapData) => d.height ?? 40,
      getWidth: (d: MindMapData) => (d.width ? d.width * 2 : 100),
      getHGap: (d: MindMapData) => d.height ?? 40,
      getVGap: () => 40,
      getSide: () => 'right',
    })

    const cells: Cell[] = []
    const traverse = (item: HierarchyResult, branchIndex?: number) => {
      const { data, children } = item
      const node = this.graph.createNode({
        id: data.id,
        shape: data.type === 'topic-child' ? 'topic-child' : 'topic',
        x: item.x,
        y: item.y,
        width: data.width,
        height: data.height,
      })
      node.setData({ label: data.label, type: data.type, controller: this, branchIndex } satisfies NodeComponentData)
      cells.push(node)

      children?.forEach((child, index) => {
        cells.push(this.graph.createEdge({
          shape: 'mindmap-edge',
          source: {
            cell: item.id,
            anchor: child.data.type === 'topic-child'
              ? { name: 'right', args: { dx: -16 } }
              : { name: 'center', args: { dx: '25%' } },
          },
          target: { cell: child.id, anchor: { name: 'left' } },
        }))
        traverse(child, branchIndex ?? index)
      })
    }
    traverse(result)
    this.graph.resetCells(cells)
    this.graph.centerContent()
  }

  private findItem(
    node: MindMapData,
    id: string,
    parent: MindMapData | null = null,
  ): { parent: MindMapData | null; node: MindMapData } | null {
    if (node.id === id)
      return { parent, node }
    for (const child of node.children ?? []) {
      const result = this.findItem(child, id, node)
      if (result)
        return result
    }
    return null
  }

  addChild(id: string, label?: string): boolean {
    if (!this.data)
      return false
    const found = this.findItem(this.data, id)
    if (!found)
      return false
    const { node } = found
    if (node.type === 'topic-child')
      return false

    const childType: MindMapNodeType = node.type === 'topic' ? 'topic-branch' : 'topic-child'
    const length = node.children?.length ?? 0
    const text = label ?? `${childType}-${length + 1}`
    const child: MindMapData = {
      id: `${id}-${length + 1}-${Date.now()}`,
      type: childType,
      label: text,
      ...measureText(text),
    }
    node.children = [...(node.children ?? []), child]
    this.render()
    return true
  }

  removeNode(id: string): boolean {
    if (!this.data)
      return false
    const found = this.findItem(this.data, id)
    if (!found?.parent?.children)
      return false
    found.parent.children = found.parent.children.filter(item => item.id !== id)
    this.render()
    return true
  }

  updateLabel(id: string, label: string) {
    if (!this.data)
      return
    const found = this.findItem(this.data, id)
    if (!found)
      return
    Object.assign(found.node, { label, ...measureText(label) })
    this.render()
  }
}
