import type { Cell, Graph } from '@antv/x6'
import { layoutMindMap } from './layout'
import type { MindMapData, MindMapNodeType } from '@/utils/convertMarkdown'

export interface NodeComponentData {
  label: string
  type: MindMapNodeType
  /** 所属一级分支的序号（根的直接子节点按序编号，整条子树继承），用于彩色分层模式 */
  branchIndex?: number
}

/**
 * 纯渲染器：把 nodeStore 持有的树布局并画到 X6 画布上。
 * 本身不持有/不可变更数据——所有增删改由 nodeStore 完成，再触发重渲染（单一数据源）。
 */
export class MindMapController {
  constructor(public graph: Graph) {}

  /** 渲染给定的树；传入 null 则清空画布。布局由纯函数 layoutMindMap 计算，这里只建 X6 cell。 */
  render(tree: MindMapData | null) {
    if (!tree) {
      this.graph.clearCells()
      return
    }

    const { nodes, edges } = layoutMindMap(tree)
    const cells: Cell[] = []

    for (const n of nodes) {
      const node = this.graph.createNode({
        id: n.id,
        shape: n.type === 'topic-child' ? 'topic-child' : 'topic',
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
      })
      node.setData({ label: n.label, type: n.type, branchIndex: n.branchIndex } satisfies NodeComponentData)
      cells.push(node)
    }

    for (const e of edges) {
      cells.push(this.graph.createEdge({
        shape: 'mindmap-edge',
        source: {
          cell: e.source,
          anchor: e.targetType === 'topic-child'
            ? { name: 'right', args: { dx: -16 } }
            : { name: 'center', args: { dx: '25%' } },
        },
        target: { cell: e.target, anchor: { name: 'left' } },
      }))
    }

    this.graph.resetCells(cells)
    this.graph.centerContent()
  }

  /** 缩放到适配视图（生成新图时调用，编辑时保持当前视图） */
  fit() {
    this.graph.zoomToFit({ padding: 20, minScale: 0.5, maxScale: 1 })
  }
}
