/**
 * 把外部脑图/大纲文件归一化成 markdown，再走 buildMindMap 同一条管线
 * （clamp 上限 / 测宽 / 单根归一化全复用），与 export.ts 的导出格式互为往返。
 *
 * OPML 解析刻意不依赖 DOMParser：保持零浏览器耦合，可在 node 测试环境直接跑。
 */

/** 支持导入的文件后缀（含点号），用于 <input accept> 与派发 */
export const IMPORT_ACCEPT = '.md,.markdown,.txt,.opml,.xml'

interface OutlineNode {
  text: string
  children: OutlineNode[]
}

const ENTITIES: [RegExp, string][] = [
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&quot;/g, '"'],
  [/&apos;|&#0*39;/g, '\''],
  [/&amp;/g, '&'], // 必须最后解码，避免把 &amp;lt; 误还原成 <
]

function decodeEntities(text: string): string {
  return ENTITIES.reduce((acc, [re, ch]) => acc.replace(re, ch), text)
}

/** 从一段属性串里取 text（OPML 标准）或退而取 title，单双引号都接 */
function readLabel(attrs: string): string {
  const match
    = attrs.match(/\btext\s*=\s*"([^"]*)"|\btext\s*=\s*'([^']*)'/i)
      ?? attrs.match(/\btitle\s*=\s*"([^"]*)"|\btitle\s*=\s*'([^']*)'/i)
  if (!match)
    return ''
  return decodeEntities(match[1] ?? match[2] ?? '').trim()
}

/** 解析 OPML 的 <outline> 嵌套结构成树（仅取 <body> 内，无 body 则全文兜底） */
function parseOutlines(xml: string): OutlineNode[] {
  const body = xml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const region = body ? body[1] : xml
  const tagRe = /<outline\b([^>]*?)(\/?)>|<\/outline\s*>/gi

  const roots: OutlineNode[] = []
  const stack: OutlineNode[] = []
  let match: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((match = tagRe.exec(region))) {
    if (match[0][1] === '/') { // 闭合标签 </outline>
      stack.pop()
      continue
    }
    const node: OutlineNode = { text: readLabel(match[1] ?? ''), children: [] }
    const parent = stack[stack.length - 1]
    if (parent)
      parent.children.push(node)
    else
      roots.push(node)
    if (match[2] !== '/') // 非自闭合，后续节点是它的孩子
      stack.push(node)
  }
  return roots
}

/**
 * OPML 2.0 -> markdown：有子节点的 outline 记为标题（# 按层级递增），
 * 叶子记为列表项 —— 正好对应 buildTree（标题=分支、列表项=叶子）。
 */
export function opmlToMarkdown(xml: string): string {
  const roots = parseOutlines(xml)
  if (roots.length === 0)
    throw new Error('Invalid OPML: no <outline> nodes found')

  const lines: string[] = []
  const walk = (node: OutlineNode, depth: number) => {
    if (node.children.length) {
      lines.push(`${'#'.repeat(Math.min(depth + 1, 6))} ${node.text}`)
      node.children.forEach(child => walk(child, depth + 1))
    }
    else {
      lines.push(`- ${node.text}`)
    }
  }
  roots.forEach(root => walk(root, 0))
  return lines.join('\n')
}

/** 按文件名后缀派发：OPML/XML 走解析器，其余（md/markdown/txt）原样作为 markdown */
export function importToMarkdown(filename: string, content: string): string {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase()
  if (ext === '.opml' || ext === '.xml')
    return opmlToMarkdown(content)
  return content
}
