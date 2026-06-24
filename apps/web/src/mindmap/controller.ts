import Hierarchy from '@antv/hierarchy'
import type { Cell, Graph } from '@antv/x6'
import type { MindMapData, MindMapNodeType } from '@/utils/convertMarkdown'

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
  /** 所属一级分支的序号（根的直接子节点按序编号，整条子树继承），用于彩色分层模式 */
  branchIndex?: number
}

/**
 * 纯渲染器：把 nodeStore 持有的树布局并画到 X6 画布上。
 * 本身不持有/不可变更数据——所有增删改由 nodeStore 完成，再触发重渲染（单一数据源）。
 */
export class MindMapController {
  constructor(public graph: Graph) {}

  /** 渲染给定的树；传入 null 则清空画布 */
  render(tree: MindMapData | null) {
    if (!tree) {
      this.graph.clearCells()
      return
    }

    // 标准 AntV mindmap 配置：布局尺寸 = 节点真实 width/height，间距用常量。
    const result: HierarchyResult = Hierarchy.mindmap(tree, {
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
      node.setData({ label: data.label, type: data.type, branchIndex } satisfies NodeComponentData)
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

  /** 缩放到适配视图（生成新图时调用，编辑时保持当前视图） */
  fit() {
    this.graph.zoomToFit({ padding: 20, minScale: 0.5, maxScale: 1 })
  }
}
