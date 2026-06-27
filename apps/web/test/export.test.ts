import { describe, expect, it } from 'vitest'
import { buildMindMap } from '../src/utils/convertMarkdown'
import { treeToMarkdown, treeToMermaid, treeToOPML } from '../src/utils/export'

const MD = `# Roadmap
## Market
- students
- pros
## Pricing
- free tier`

describe('treeToMarkdown', () => {
  it('round-trips through buildMindMap (structure preserved)', () => {
    const tree = buildMindMap(MD)!
    const out = treeToMarkdown(tree)
    const tree2 = buildMindMap(out)!
    expect(tree2.label).toBe('Roadmap')
    expect(tree2.children!.map(c => c.label)).toEqual(['Market', 'Pricing'])
    expect(tree2.children![0].children!.map(c => c.label)).toEqual(['students', 'pros'])
  })

  it('uses # for root, ## for branches, - for leaves', () => {
    const out = treeToMarkdown(buildMindMap(MD)!)
    expect(out).toMatch(/^# Roadmap/)
    expect(out).toContain('## Market')
    expect(out).toContain('- students')
  })
})

describe('treeToMermaid', () => {
  it('emits a mindmap with circular root and nested indented nodes', () => {
    const out = treeToMermaid(buildMindMap(MD)!)
    const lines = out.split('\n')
    expect(lines[0]).toBe('mindmap')
    expect(out).toContain('  root(("Roadmap"))')
    expect(out).toContain('    n1["Market"]')
    expect(out).toContain('      n2["students"]')
    // 子节点缩进比父分支更深
    const market = lines.find(l => l.includes('"Market"'))!
    const student = lines.find(l => l.includes('"students"'))!
    expect(student.length - student.trimStart().length)
      .toBeGreaterThan(market.length - market.trimStart().length)
  })

  it('wraps special characters in quotes instead of breaking shape syntax', () => {
    const out = treeToMermaid(buildMindMap('# Launch (GTM)\n- a "quoted" b')!)
    expect(out).toContain('root(("Launch (GTM)"))')
    // 内部双引号降级为单引号，不破坏外层 "…"
    expect(out).toContain('["a \'quoted\' b"]')
  })
})

describe('treeToOPML', () => {
  it('produces valid OPML with nested outlines and escaped text', () => {
    const tree = buildMindMap('# A & "B"\n## child <x>')!
    const opml = treeToOPML(tree)
    expect(opml).toContain('<opml version="2.0">')
    expect(opml).toContain('text="A &amp; &quot;B&quot;"')
    expect(opml).toContain('text="child &lt;x&gt;"')
    // 标签成对（粗校验 XML 不破）
    expect((opml.match(/<outline/g) ?? []).length).toBeGreaterThanOrEqual(2)
  })
})
