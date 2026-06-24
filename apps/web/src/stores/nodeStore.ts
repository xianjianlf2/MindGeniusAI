import type { MindMapOp, MindMapOutline } from '@mindgenius/shared'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MindMapData } from '@/utils/convertMarkdown'
import { buildMindMap } from '@/utils/convertMarkdown'
import { applyOps, toOutline } from '@/utils/patch'

interface NodeState {
  /** 思维导图树（根节点）——全应用唯一数据源 */
  nodes: MindMapData | null
  /** 最近一次生成的 markdown 原文 */
  markdown: string
  /** 从 markdown 重建整棵树（生成 / mindmap-set） */
  generateFromMarkdown: (markdown: string) => { ok: boolean; error?: string }
  /** 批量增量编辑（agent mindmap_edit / 手动操作统一入口），返回成功条数 */
  patch: (ops: MindMapOp[]) => number
  addChild: (id: string, label?: string) => void
  removeNode: (id: string) => void
  updateLabel: (id: string, label: string) => void
  /** 当前树的精简轮廓，随请求发给 Hermas 做增量编辑定位 */
  outline: () => MindMapOutline | null
  reset: () => void
}

export const useNodeStore = create<NodeState>()(persist((set, get) => ({
  nodes: null,
  markdown: '',
  reset: () => set({ nodes: null, markdown: '' }),

  generateFromMarkdown(markdown: string) {
    if (!markdown)
      return { ok: false, error: 'There is no content' }
    const root = buildMindMap(markdown)
    if (!root)
      return { ok: false, error: 'There is no mind map generated.' }
    set({ nodes: root, markdown })
    return { ok: true }
  },

  patch(ops: MindMapOp[]) {
    const tree = get().nodes
    if (!tree)
      return 0
    const next = structuredClone(tree)
    const applied = applyOps(next, ops)
    if (applied)
      set({ nodes: next }) // 新引用 → 触发画布重渲染（单一数据源，无 controller.data 旁路）
    return applied
  },

  addChild(id, label) {
    get().patch([{ op: 'add', parentId: id, label: label ?? '' }])
  },
  removeNode(id) {
    get().patch([{ op: 'remove', id }])
  },
  updateLabel(id, label) {
    get().patch([{ op: 'update', id, label }])
  },

  outline() {
    const tree = get().nodes
    return tree ? toOutline(tree) : null
  },
}), {
  name: 'mindgenius-map', // localStorage：刷新/重开不丢图
  partialize: state => ({ nodes: state.nodes, markdown: state.markdown }),
}))
