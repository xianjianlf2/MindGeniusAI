import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MindMapData } from '@/utils/convertMarkdown'

export interface SavedMap {
  /** 与导图根节点 id 一致：同一张图反复编辑只更新一条快照，不重复入库 */
  id: string
  title: string
  tree: MindMapData
  nodeCount: number
  updatedAt: number
}

/** 画廊容量上限，超出淘汰最旧（按 updatedAt） */
const MAX_SAVED = 30

function countNodes(node: MindMapData): number {
  return 1 + (node.children?.reduce((sum, child) => sum + countNodes(child), 0) ?? 0)
}

interface SavedMapsState {
  maps: SavedMap[]
  /** 用当前导图树 upsert 一条快照（按根 id 去重），title 取根标签 */
  upsert: (tree: MindMapData, now: number) => void
  remove: (id: string) => void
}

export const useSavedMapsStore = create<SavedMapsState>()(persist(set => ({
  maps: [],
  upsert(tree, now) {
    set((state) => {
      const entry: SavedMap = {
        id: tree.id,
        title: tree.label?.trim() || 'Untitled',
        tree,
        nodeCount: countNodes(tree),
        updatedAt: now,
      }
      const rest = state.maps.filter(map => map.id !== tree.id)
      return { maps: [entry, ...rest].slice(0, MAX_SAVED) }
    })
  },
  remove(id) {
    set(state => ({ maps: state.maps.filter(map => map.id !== id) }))
  },
}), {
  name: 'mindgenius-saved-maps',
}))
