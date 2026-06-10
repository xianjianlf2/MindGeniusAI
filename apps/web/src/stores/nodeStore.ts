import { create } from 'zustand'
import type { MindMapData } from '@/utils/convertMarkdown'
import { getNodes } from '@/utils/convertMarkdown'

interface NodeState {
  /** 当前思维导图树（根节点） */
  nodes: MindMapData | null
  /** 导图对应的 markdown 原文 */
  markdown: string
  generateFromMarkdown: (markdown: string) => { ok: boolean; error?: string }
}

export const useNodeStore = create<NodeState>(set => ({
  nodes: null,
  markdown: '',
  generateFromMarkdown(markdown: string) {
    if (!markdown)
      return { ok: false, error: 'There is no content' }
    const result = getNodes(markdown)
    if (result.length === 0)
      return { ok: false, error: 'There is no mind map generated.' }
    set({ nodes: result[0], markdown })
    return { ok: true }
  },
}))
