import { marked } from 'marked'
import { v4 as uuidv4 } from 'uuid'
import { measureText } from './measureText'

export type MindMapNodeType = 'topic' | 'topic-branch' | 'topic-child'

export interface MindMapData {
  id: string
  type: MindMapNodeType
  label: string
  width?: number
  height?: number
  children?: MindMapData[]
}

interface TreeNode extends MindMapData {
  depth: number
  children: TreeNode[]
}

/** markdown -> 思维导图树：heading 为分支节点，list item 为叶子 */
export function buildTree(markdown: string): TreeNode[] {
  const tokens = marked.lexer(markdown)
  const root: TreeNode = { id: uuidv4(), label: '', children: [], type: 'topic', depth: 0 }
  const headingStack: TreeNode[] = [root]
  let maxDepth = 0

  for (const token of tokens) {
    if (token.type === 'heading') {
      const depth = token.depth
      const heading: TreeNode = {
        id: uuidv4(),
        label: token.text,
        children: [],
        type: depth === 1 ? 'topic' : 'topic-branch',
        depth,
        ...measureText(token.text),
      }
      while (headingStack.length > depth)
        headingStack.pop()
      headingStack[headingStack.length - 1].children.push(heading)
      headingStack.push(heading)
      maxDepth = Math.max(maxDepth, depth)
    }
    else if (token.type === 'list') {
      const currentHeading = headingStack[headingStack.length - 1]
      currentHeading.children = token.items.map((item: { text: string }) => ({
        id: uuidv4(),
        type: 'topic-child' as const,
        label: item.text,
        depth: maxDepth + 1,
        children: [],
        ...measureText(item.text),
      }))
    }
  }
  return root.children
}

function stripDepth(nodes: TreeNode[]): MindMapData[] {
  return nodes.map(({ depth: _depth, children, ...rest }) => ({
    ...rest,
    children: children?.length ? stripDepth(children) : undefined,
  }))
}

export function getNodes(markdown: string): MindMapData[] {
  return stripDepth(buildTree(markdown))
}

/** 从一段 markdown 中提取 list item 文本（AI 扩展节点时用） */
export function extractListItems(markdown: string): string[] {
  const tokens = marked.lexer(markdown)
  const items: string[] = []
  for (const token of tokens) {
    if (token.type === 'list')
      items.push(...token.items.map((item: { text: string }) => item.text))
  }
  return items
}

/** 从 Agent 回复中提取 ```markdown 代码块（无则返回原文） */
export function extractMarkdownBlock(text: string): string {
  const match = text.match(/```(?:markdown|md)\n([\s\S]*?)```/)
  return match ? match[1].trim() : text
}
