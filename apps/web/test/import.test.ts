import { describe, expect, it } from 'vitest'
import { buildMindMap } from '../src/utils/convertMarkdown'
import { treeToOPML } from '../src/utils/export'
import { importToMarkdown, opmlToMarkdown } from '../src/utils/import'

const MD = `# Roadmap
## Market
- students
- pros
## Pricing
- free tier`

describe('opmlToMarkdown', () => {
  it('round-trips OPML exported by treeToOPML back into the same tree', () => {
    const tree = buildMindMap(MD)!
    const opml = treeToOPML(tree)
    const tree2 = buildMindMap(opmlToMarkdown(opml))!
    expect(tree2.label).toBe('Roadmap')
    expect(tree2.children!.map(c => c.label)).toEqual(['Market', 'Pricing'])
    expect(tree2.children![0].children!.map(c => c.label)).toEqual(['students', 'pros'])
    expect(tree2.children![1].children!.map(c => c.label)).toEqual(['free tier'])
  })

  it('decodes XML entities in node labels', () => {
    const opml = `<?xml version="1.0"?><opml version="2.0"><body>
      <outline text="R&amp;D &lt;ops&gt;"><outline text="&quot;quoted&quot;"/></outline>
    </body></opml>`
    const md = opmlToMarkdown(opml)
    expect(md).toContain('# R&D <ops>')
    expect(md).toContain('- "quoted"')
  })

  it('handles self-closing and nested outlines', () => {
    const opml = `<opml><body>
      <outline text="root"><outline text="a"/><outline text="b"><outline text="b1"/></outline></outline>
    </body></opml>`
    const tree = buildMindMap(opmlToMarkdown(opml))!
    expect(tree.label).toBe('root')
    expect(tree.children!.map(c => c.label)).toEqual(['a', 'b'])
    expect(tree.children![1].children!.map(c => c.label)).toEqual(['b1'])
  })

  it('throws on OPML with no outline nodes', () => {
    expect(() => opmlToMarkdown('<opml><body></body></opml>')).toThrow()
  })
})

describe('importToMarkdown', () => {
  it('passes markdown/txt through untouched', () => {
    expect(importToMarkdown('notes.md', MD)).toBe(MD)
    expect(importToMarkdown('plain.txt', '# Hi\n- a')).toBe('# Hi\n- a')
  })

  it('routes .opml/.xml through the OPML parser', () => {
    const opml = treeToOPML(buildMindMap(MD)!)
    expect(importToMarkdown('map.opml', opml)).toMatch(/^# Roadmap/)
    expect(importToMarkdown('map.xml', opml)).toContain('## Market')
  })
})
