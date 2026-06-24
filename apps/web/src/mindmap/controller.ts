import Hierarchy from '@antv/hierarchy'
import type { Cell, Graph } from '@antv/x6'
import type { MindMapOp, MindMapOutline } from '@mindgenius/shared'
import type { MindMapData, MindMapNodeType } from '@/utils/convertMarkdown'
import { applyOps, toOutline } from '@/utils/patch'

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

  /** 清空画布（新建对话时调用，避免把旧导图当作上下文发给 Agent） */
  clear() {
    this.data = null
    this.graph.clearCells()
  }

  /** 当前导图的精简轮廓，随请求发给 Hermas 以便精准增量编辑 */
  toOutline(): MindMapOutline | null {
    return this.data ? toOutline(this.data) : null
  }

  render() {
    if (!this.data)
      return
    // 标准 AntV mindmap 配置：布局尺寸 = 节点真实 width/height，间距用常量。
    // （旧版用 width*2 / getHGap=height 是对旧测宽方式的 hack，测宽改准后会导致错位+堆叠）
    const result: HierarchyResult = Hierarchy.mindmap(this.data, {
      direction: 'H',
      getHeight: (d: MindMapData) => d.height ?? 40,
      getWidth: (d: MindMapData) => d.width ?? 100,
      getHGap: () => 48,
      getVGap: () => 18,
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

  /** 批量应用增量指令（Agent 编辑），仅在有变更时重渲染一次，返回成功条数 */
  applyPatch(ops: MindMapOp[]): number {
    if (!this.data)
      return 0
    const applied = applyOps(this.data, ops)
    if (applied)
      this.render()
    return applied
  }

  addChild(id: string, label?: string): boolean {
    return this.applyPatch([{ op: 'add', parentId: id, label: label ?? '' }]) > 0
  }

  removeNode(id: string): boolean {
    return this.applyPatch([{ op: 'remove', id }]) > 0
  }

  updateLabel(id: string, label: string) {
    this.applyPatch([{ op: 'update', id, label }])
  }
}
