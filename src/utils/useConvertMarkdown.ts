import { marked } from 'marked'
import { v4 as uuidv4 } from 'uuid'
import { measureText } from './useCalculateText'

export function buildTree(markdown: string) {
  const tokens = marked.lexer(markdown)
  const root: any = {
    id: uuidv4(),
    label: '',
    children: [],
    type: '',
    depth: 0,
  }
  const headingStack = [root]
  let maxDepth = 0

  for (const token of tokens) {
    if (token.type === 'heading') {
      const depth = token.depth
      const heading = {
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
      parentHeading.children.push(heading)
      headingStack.push(heading)

      if (depth > maxDepth)
        maxDepth = depth
    }
    else if (token.type === 'list') {
      const currentHeading = headingStack[headingStack.length - 1]
      currentHeading.children = token.items.map((item: { text: string }) => ({
        id: uuidv4(),
        type: 'topic-child',
        label: item.text,
        depth: maxDepth + 1,
        ...measureText(item.text),
      }))
    }
  }

  return root.children
}
function removeDepth(nodes: any[]): any {
  return nodes.map((node: any) => {
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
  return removeDepth(buildTree(markdown))
}

export function getSingleNode(markdown: string) {
  return marked.lexer(markdown)
}
