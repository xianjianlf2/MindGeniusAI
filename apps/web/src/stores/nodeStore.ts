import type { MindMapOp, MindMapOutline } from '@mindgenius/shared'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MindMapData } from '@/utils/convertMarkdown'
import { buildMindMap } from '@/utils/convertMarkdown'
import { applyOps, coalesceEdits, find, toOutline } from '@/utils/patch'
import { treeToMarkdown } from '@/utils/export'

interface NodeState {
  /** 思维导图树（根节点）——全应用唯一数据源 */
  nodes: MindMapData | null
  /** 最近一次生成的 markdown 原文 */
  markdown: string
  /** 从 markdown 重建整棵树（生成 / mindmap-set） */
  generateFromMarkdown: (markdown: string) => { ok: boolean; error?: string }
  /** 直接载入一棵已存在的树（从画廊打开），同步重算 markdown */
  loadTree: (tree: MindMapData) => void
  /**
   * 批量增量编辑（agent mindmap_edit / 手动操作统一入口），返回成功条数。
   * origin='user'（默认）的成功改动会进缓冲，下次发消息时随请求带给 Hermas。
   */
  patch: (ops: MindMapOp[], origin?: 'user' | 'agent') => number
  /** 取出并清空「上一轮 agent 后用户手动改动」的缓冲，随请求发给 Hermas */
  drainUserEdits: () => MindMapOp[]
  /** 加子节点，返回新节点 id（供画布选中并进入编辑），失败返回 null */
  addChild: (id: string, label?: string) => string | null
  /** 加兄弟节点（在父节点下追加）；根节点无兄弟则退化为加子节点，返回新节点 id */
  addSibling: (id: string, label?: string) => string | null
  removeNode: (id: string) => void
  /** 批量删除（框选多个时一次删完） */
  removeNodes: (ids: string[]) => void
  /** 拖拽改父：把节点重挂到新父节点下（index 省略则追加），返回是否成功 */
  moveNode: (id: string, parentId: string, index?: number) => boolean
  updateLabel: (id: string, label: string) => void
  /** 当前树的精简轮廓，随请求发给 Hermas 做增量编辑定位 */
  outline: () => MindMapOutline | null
  reset: () => void
}

/** 用户手动改动缓冲：非持久化的运行态，刷新即弃（agent 上下文届时也已重置） */
let pendingUserEdits: MindMapOp[] = []

export const useNodeStore = create<NodeState>()(persist((set, get) => ({
  nodes: null,
  markdown: '',
  reset: () => {
    pendingUserEdits = []
    set({ nodes: null, markdown: '' })
  },

  generateFromMarkdown(markdown: string) {
    if (!markdown)
      return { ok: false, error: 'There is no content' }
    const root = buildMindMap(markdown)
    if (!root)
      return { ok: false, error: 'There is no mind map generated.' }
    pendingUserEdits = [] // 全量重画后，旧的逐条改动已无意义
    set({ nodes: root, markdown })
    return { ok: true }
  },

  loadTree(tree) {
    pendingUserEdits = [] // 换了一张图，缓冲清零
    set({ nodes: structuredClone(tree), markdown: treeToMarkdown(tree) })
  },

  patch(ops: MindMapOp[], origin: 'user' | 'agent' = 'user') {
    const tree = get().nodes
    if (!tree)
      return 0
    const next = structuredClone(tree)
    const applied = applyOps(next, ops)
    if (applied) {
      set({ nodes: next }) // 新引用 → 触发画布重渲染（单一数据源，无 controller.data 旁路）
      if (origin === 'user')
        pendingUserEdits.push(...ops) // 记进缓冲，下次发消息时告诉 Hermas 用户改了哪
    }
    return applied
  },

  drainUserEdits() {
    const edits = coalesceEdits(pendingUserEdits)
    pendingUserEdits = []
    return edits
  },

  addChild(id, label) {
    const applied = get().patch([{ op: 'add', parentId: id, label: label ?? '' }])
    if (!applied)
      return null
    // 新节点是父节点最后一个孩子（applyOps 追加在末尾）
    const parent = get().nodes && find(get().nodes!, id)?.node
    return parent?.children?.at(-1)?.id ?? null
  },
  addSibling(id, label) {
    const tree = get().nodes
    if (!tree)
      return null
    const parent = find(tree, id)?.parent
    // 根节点无兄弟：退化为给根加分支，符合「Enter 继续画」的直觉
    return get().addChild(parent?.id ?? id, label)
  },
  removeNode(id) {
    get().patch([{ op: 'remove', id }])
  },
  removeNodes(ids) {
    get().patch(ids.map(id => ({ op: 'remove', id })))
  },
  moveNode(id, parentId, index) {
    return get().patch([{ op: 'move', id, parentId, index }]) > 0
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
