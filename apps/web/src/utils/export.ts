import type { MindMapData } from './convertMarkdown'

/** 树 → markdown：# 根 / ## 分支 / - 叶子（与 buildMindMap 可往返） */
export function treeToMarkdown(root: MindMapData): string {
  const lines: string[] = []
  const walk = (node: MindMapData, depth: number) => {
    if (node.type === 'topic-child')
      lines.push(`${'  '.repeat(Math.max(0, depth - 1))}- ${node.label}`)
    else
      lines.push(`${'#'.repeat(Math.min(depth + 1, 6))} ${node.label}`)
    node.children?.forEach(child => walk(child, depth + 1))
  }
  walk(root, 0)
  return lines.join('\n')
}

/**
 * 树 → Mermaid `mindmap`：缩进表层级，根用圆形 root，其余用带引号方形 + 显式 id。
 * 标签统一塞进 "…" 以容纳括号等特殊字符（裸文本会被 Mermaid 当成 shape 语法误解析）。
 * 产物可直接贴进 GitHub / mermaid.live 渲染。
 */
export function treeToMermaid(root: MindMapData): string {
  const lines = ['mindmap']
  let counter = 0
  const esc = (text: string) => text.replace(/\s+/g, ' ').replace(/"/g, '\'').trim() || ' '
  const walk = (node: MindMapData, depth: number) => {
    const indent = '  '.repeat(depth + 1)
    const label = esc(node.label)
    lines.push(`${indent}${depth === 0 ? `root(("${label}"))` : `n${++counter}["${label}"]`}`)
    node.children?.forEach(child => walk(child, depth + 1))
  }
  walk(root, 0)
  return lines.join('\n')
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 树 → OPML 2.0（思维导图/大纲工具通用导入格式） */
export function treeToOPML(root: MindMapData): string {
  const outline = (node: MindMapData, indent: string): string => {
    const text = escapeXml(node.label)
    const children = node.children ?? []
    if (children.length === 0)
      return `${indent}<outline text="${text}"/>`
    const inner = children.map(child => outline(child, `${indent}  `)).join('\n')
    return `${indent}<outline text="${text}">\n${inner}\n${indent}</outline>`
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>${escapeXml(root.label)}</title></head>
  <body>
${outline(root, '    ')}
  </body>
</opml>`
}

/** 触发浏览器下载一段文本内容 */
export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
