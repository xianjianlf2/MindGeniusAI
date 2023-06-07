import fs from 'node:fs'
import { marked } from 'marked'
import { v4 as uuidv4 } from 'uuid'

const markdown = fs.readFileSync('./test.md', 'utf8')
const tokens = marked.lexer(markdown)

export function measureText(text, font = '12px Arial') {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.font = font
  const width = context.measureText(text).width
  const height = parseInt(font, 10)
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

export function buildTree(tokens) {
  const root = {
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
      currentHeading.children = token.items.map(item => ({
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
// remove node depth
function removeDepth(nodes) {
  return nodes.map((node) => {
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

export function getNodes() {
  return removeDepth(buildTree(tokens))
}
