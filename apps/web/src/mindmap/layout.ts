import Hierarchy from '@antv/hierarchy'
import type { MindMapData, MindMapNodeType } from '@/utils/convertMarkdown'

/** 一个已完成布局的节点（纯数据，不含 X6 cell） */
export interface LaidOutNode {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  type: MindMapNodeType
  /** 所属一级分支序号，用于彩色分层 */
  branchIndex?: number
}

/** 一条父→子连线（anchor 由渲染层按 targetType 决定） */
export interface LaidOutEdge {
  source: string
  target: string
  targetType: MindMapNodeType
}

export interface MindMapLayout {
  nodes: LaidOutNode[]
  edges: LaidOutEdge[]
}

interface HierarchyResult {
  id: string
  x: number
  y: number
  data: MindMapData
  children?: HierarchyResult[]
}

/**
 * 纯布局：树 → 节点坐标 + 连线。无 X6/DOM 依赖，可独立单测。
 * 标准 AntV mindmap 配置：布局尺寸 = 节点真实 width/height，间距用常量。
 */
export function layoutMindMap(tree: MindMapData): MindMapLayout {
  const result: HierarchyResult = Hierarchy.mindmap(tree, {
    direction: 'H',
    getHeight: (d: MindMapData) => d.height ?? 40,
    getWidth: (d: MindMapData) => d.width ?? 100,
    getHGap: () => 48,
    getVGap: () => 18,
    getSide: () => 'right',
  })

  const nodes: LaidOutNode[] = []
  const edges: LaidOutEdge[] = []

  const traverse = (item: HierarchyResult, branchIndex?: number) => {
    const { data, children } = item
    nodes.push({
      id: data.id,
      x: item.x,
      y: item.y,
      width: data.width ?? 100,
      height: data.height ?? 40,
      label: data.label,
      type: data.type,
      branchIndex,
    })
    children?.forEach((child, index) => {
      edges.push({ source: data.id, target: child.data.id, targetType: child.data.type })
      traverse(child, branchIndex ?? index)
    })
  }
  traverse(result)

  return { nodes, edges }
}
