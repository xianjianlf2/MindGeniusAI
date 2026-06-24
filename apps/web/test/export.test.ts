import { describe, expect, it } from 'vitest'
import { buildMindMap } from '../src/utils/convertMarkdown'
import { treeToMarkdown, treeToOPML } from '../src/utils/export'

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
