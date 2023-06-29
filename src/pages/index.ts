import { v4 as uuidv4 } from 'uuid'
import { marked } from 'marked'
import type { MindMapData } from '@/stores'

export function measureText(text: string, font = '12px Arial') {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  context.font = font
  const width = context.measureText(text).width
  const height = Number.parseInt(font, 10)
  if (width > 120) {
    const words = text.split(' ')
    let line = ''
    const lines = []
    for (let i = 0; i < words.length; i++) {
      const testLine = `${line + words[i]} `
      const testWidth = context.measureText(testLine).width
      if (testWidth > 120) {
        lines.push(line)
        line = `${words[i]} `
      }
      else {
        line = testLine
      }
    }
    lines.push(line)
    return { width: 120, height: lines.length * height }
  }
  return { width, height }
}
type Node = MindMapData & { depth: number } & { children: Node[] }

export function buildTree(tokens: marked.Token[]): Node[] {
  const root: Node = {
    id: uuidv4(),
    label: '',
    children: [],
    type: 'topic',
    depth: 0,
  }
  const headingStack = [root]
  let maxDepth = 0

  for (const token of tokens) {
    if (token.type === 'heading') {
      const depth = token.depth
      const heading: Node = {
        id: uuidv4(),
        label: token.text,
        children: [],
        type: depth === 1 ? 'topic' : 'topic-branch',
        depth,
        ...measureText(token.text),
      }
      while (headingStack.length > depth)
        headingStack.pop()

      const parentHeading = headingStack[headingStack.length - 1]
      ;(parentHeading.children as any).push(heading)
      headingStack.push(heading)

      if (depth > maxDepth)
        maxDepth = depth
    }
    else if (token.type === 'list') {
      const currentHeading = headingStack[headingStack.length - 1]
      currentHeading.children = token.items.map(item => ({
        id: uuidv4(),
        type: 'topic-child',
        label: item.text,
        depth: maxDepth + 1,
        ...measureText(item.text),
      })) as any
    }
  }
  return root.children
}
// remove node depth
function removeDepth(nodes: Node[]): MindMapData[] {
  return nodes.map((node: Node) => {
    const { depth, ...rest } = node
    if (node.children) {
      return {
        ...rest,
        children: removeDepth(node.children),
      }
    }
    return rest
  })
}

export function getNodes(markdown: string) {
  const tokens = marked.lexer(markdown)
  return removeDepth(buildTree(tokens))
}
