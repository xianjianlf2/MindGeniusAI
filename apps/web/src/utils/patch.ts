import type { MindMapOp, MindMapOutline } from '@mindgenius/shared'
import { v4 as uuidv4 } from 'uuid'
import type { MindMapData, MindMapNodeType } from './convertMarkdown'
import { measureText } from './measureText'

/** 把导图树压成只含 id/label/children 的轮廓，发给 Agent 做增量编辑定位 */
export function toOutline(node: MindMapData): MindMapOutline {
  return {
    id: node.id,
    label: node.label,
    children: node.children?.length ? node.children.map(toOutline) : undefined,
  }
}

function find(
  node: MindMapData,
  id: string,
  parent: MindMapData | null = null,
): { node: MindMapData; parent: MindMapData | null } | null {
  if (node.id === id)
    return { node, parent }
  for (const child of node.children ?? []) {
    const hit = find(child, id, node)
    if (hit)
      return hit
  }
  return null
}

/**
 * 就地把一组增量指令应用到导图树（共享给手动编辑与 Agent 编辑），返回成功条数。
 * 未知 id / 非法操作（如给叶子加子节点、删根）静默跳过，保证 Agent 乱给 id 也不崩。
 */
export function applyOps(root: MindMapData, ops: MindMapOp[]): number {
  let applied = 0
  for (const op of ops) {
    if (op.op === 'add') {
      const hit = find(root, op.parentId)
      if (!hit || hit.node.type === 'topic-child')
        continue
      const parent = hit.node
      const childType: MindMapNodeType = parent.type === 'topic' ? 'topic-branch' : 'topic-child'
      const count = parent.children?.length ?? 0
      const label = op.label?.trim() || `${childType}-${count + 1}`
      parent.children = [...(parent.children ?? []), {
        id: uuidv4(),
        type: childType,
        label,
        ...measureText(label),
      }]
      applied++
    }
    else if (op.op === 'update') {
      const hit = find(root, op.id)
      const label = op.label?.trim()
      if (!hit || !label)
        continue
      Object.assign(hit.node, { label, ...measureText(label) })
      applied++
    }
    else if (op.op === 'remove') {
      const hit = find(root, op.id)
      if (!hit?.parent?.children) // 找不到或目标是根（无 parent）
        continue
      hit.parent.children = hit.parent.children.filter(child => child.id !== op.id)
      applied++
    }
  }
  return applied
}
