import { MINDMAP_LIMITS, unwrapFence } from '@mindgenius/shared'
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
      // 追加而非覆盖：一个标题下若有多段列表 / 列表与子标题并存，都不丢节点
      currentHeading.children.push(...token.items.map((item: { text: string }) => ({
        id: uuidv4(),
        type: 'topic-child' as const,
        label: item.text,
        depth: maxDepth + 1,
        children: [] as TreeNode[],
        ...measureText(item.text),
      })))
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

/**
 * 把任意 markdown 归一化成「恰好一个可渲染根节点」，工程上强保证出图：
 * - 0 个标题：用列表项（或首行文字）兜底成一棵树
 * - 1 个根：直接用
 * - 多个并列根：合成一个虚拟根收纳，避免只渲染第一个、其余丢失
 */
/**
 * 对解析出的树施加硬上限：截断超长 label（并重新测宽）、丢弃超过最大深度/总数的节点。
 * 保证再异常的模型输出也不会撑爆画布或拖垮渲染。
 */
function clampTree(node: MindMapData, depth: number, counter: { n: number }): MindMapData {
  if (node.label.length > MINDMAP_LIMITS.maxLabel) {
    node.label = `${node.label.slice(0, MINDMAP_LIMITS.maxLabel - 1)}…`
    Object.assign(node, measureText(node.label))
  }
  if (depth >= MINDMAP_LIMITS.maxDepth || !node.children?.length) {
    node.children = undefined
    return node
  }
  const kept: MindMapData[] = []
  for (const child of node.children) {
    if (counter.n >= MINDMAP_LIMITS.maxNodes)
      break
    counter.n += 1
    kept.push(clampTree(child, depth + 1, counter))
  }
  node.children = kept.length ? kept : undefined
  return node
}

export function buildMindMap(input: string): MindMapData | null {
  const markdown = unwrapFence(input)
  let root: MindMapData | null = null

  // 有标题：正常构树，归一化成单根
  if (/^#{1,6}\s/m.test(markdown)) {
    const roots = getNodes(markdown)
    if (roots.length === 1) {
      root = roots[0]
    }
    else if (roots.length > 1) {
      const [first, ...rest] = roots
      // 把后续根降级为第一棵的分支，整体仍是单根，不丢分支
      const demote = (node: MindMapData): MindMapData => ({ ...node, type: 'topic-branch' })
      root = { ...first, children: [...(first.children ?? []), ...rest.map(demote)] }
    }
  }

  // 没有任何标题：用首行非空文本（非列表项）作根，列表项作叶子兜底
  if (!root) {
    const firstLine = markdown.split('\n').map(line => line.trim()).find(line => line && !/^[-*]\s/.test(line))
    const items = extractListItems(markdown)
    const rootLabel = (firstLine ?? '思维导图').replace(/^#{1,6}\s*/, '').slice(0, 80)
    if (!rootLabel && items.length === 0)
      return null
    root = {
      id: uuidv4(),
      type: 'topic',
      label: rootLabel || '思维导图',
      ...measureText(rootLabel || '思维导图'),
      children: items.map(text => ({ id: uuidv4(), type: 'topic-child' as const, label: text, ...measureText(text) })),
    }
  }

  return clampTree(root, 0, { n: 1 })
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
