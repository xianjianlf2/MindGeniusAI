import { describe, expect, it } from 'vitest'
import { buildMindMap } from '../src/utils/convertMarkdown'
import { layoutMindMap } from '../src/mindmap/layout'

const MARKDOWN = `# Roadmap
## Market
- students
- pros
## Pricing
- free tier
- team plan
## Growth
- referrals`

function countNodes(node: { children?: unknown[] }): number {
  const children = (node.children ?? []) as { children?: unknown[] }[]
  return 1 + children.reduce((sum, c) => sum + countNodes(c), 0)
}

function overlaps(a: { x: number; y: number; width: number; height: number }, b: typeof a): boolean {
  // 允许刚好相切；严格相交才算重叠
  return a.x < b.x + b.width && a.x + a.width > b.x
    && a.y < b.y + b.height && a.y + a.height > b.y
}

describe('layoutMindMap', () => {
  const tree = buildMindMap(MARKDOWN)!
  const { nodes, edges } = layoutMindMap(tree)

  it('lays out exactly one node per tree node', () => {
    expect(nodes).toHaveLength(countNodes(tree))
  })

  it('gives every node finite, positive dimensions (no zero-size / NaN regressions)', () => {
    for (const n of nodes) {
      expect(Number.isFinite(n.x)).toBe(true)
      expect(Number.isFinite(n.y)).toBe(true)
      expect(n.width).toBeGreaterThan(0)
      expect(n.height).toBeGreaterThan(0)
    }
  })

  it('produces a connected tree of edges (count = nodes - 1, all ids valid, parent→child)', () => {
    expect(edges).toHaveLength(nodes.length - 1)
    const ids = new Set(nodes.map(n => n.id))
    for (const e of edges) {
      expect(ids.has(e.source)).toBe(true)
      expect(ids.has(e.target)).toBe(true)
      expect(e.source).not.toBe(e.target)
    }
    // 每个非根节点恰好有一条入边
    const incoming = new Map<string, number>()
    for (const e of edges) incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1)
    expect([...incoming.values()].every(c => c === 1)).toBe(true)
    expect(incoming.has(tree.id)).toBe(false) // 根无入边
  })

  it('never overlaps two node boxes (the bug that piled nodes together)', () => {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++)
        expect(overlaps(nodes[i], nodes[j])).toBe(false)
    }
  })

  it('assigns a stable branchIndex per top-level branch', () => {
    const branches = nodes.filter(n => n.type === 'topic-branch')
    expect(branches.every(b => typeof b.branchIndex === 'number')).toBe(true)
  })
})
