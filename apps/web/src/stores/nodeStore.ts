import { create } from 'zustand'
import type { MindMapData } from '@/utils/convertMarkdown'
import { buildMindMap } from '@/utils/convertMarkdown'

interface NodeState {
  /** 当前思维导图树（根节点） */
  nodes: MindMapData | null
  /** 导图对应的 markdown 原文 */
  markdown: string
  generateFromMarkdown: (markdown: string) => { ok: boolean; error?: string }
  reset: () => void
}

export const useNodeStore = create<NodeState>(set => ({
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
}))
