import { describe, expect, it } from 'vitest'
import { buildMindMap, extractListItems, extractMarkdownBlock, getNodes } from '../src/utils/convertMarkdown'

const MARKDOWN = `# Learn TypeScript
## Basics
- types
- interfaces
## Advanced
- generics
`

describe('getNodes', () => {
  it('builds a tree from headings and list items', () => {
    const [root] = getNodes(MARKDOWN)
    expect(root.label).toBe('Learn TypeScript')
    expect(root.type).toBe('topic')
    expect(root.children).toHaveLength(2)

    const basics = root.children![0]
    expect(basics.type).toBe('topic-branch')
    expect(basics.children!.map(child => child.label)).toEqual(['types', 'interfaces'])
    expect(basics.children![0].type).toBe('topic-child')
  })

  it('returns empty array when there is no heading', () => {
    expect(getNodes('just plain text')).toEqual([])
  })
})

describe('buildMindMap (strong-guarantee single root)', () => {
  it('returns the single root unchanged', () => {
    const root = buildMindMap(MARKDOWN)!
    expect(root.type).toBe('topic')
    expect(root.label).toBe('Learn TypeScript')
    expect(root.children).toHaveLength(2)
  })

  it('merges multiple top-level H1s under one root (no branch is lost)', () => {
    const root = buildMindMap('# Alpha\n## a1\n# Beta\n## b1')!
    expect(root.label).toBe('Alpha')
    // Beta demoted into a branch of Alpha, plus Alpha's own a1
    const labels = root.children!.map(c => c.label)
    expect(labels).toContain('a1')
    expect(labels).toContain('Beta')
    expect(root.children!.find(c => c.label === 'Beta')!.type).toBe('topic-branch')
  })

  it('falls back to a root built from bullets when there is no heading', () => {
    const root = buildMindMap('- one\n- two\n- three')!
    expect(root.type).toBe('topic')
    expect(root.children!.map(c => c.label)).toEqual(['one', 'two', 'three'])
  })

  it('unwraps a ```markdown code fence before parsing (model often wraps it)', () => {
    const fenced = '```markdown\n# Plan\n## Market\n- students\n- pros\n## Pricing\n- free tier\n```'
    const root = buildMindMap(fenced)!
    expect(root.label).toBe('Plan')
    expect(root.children!.map(c => c.label)).toEqual(['Market', 'Pricing'])
    expect(root.children![0].children!.map(c => c.label)).toEqual(['students', 'pros'])
  })

  it('handles an unclosed code fence too', () => {
    const root = buildMindMap('```markdown\n# Plan\n## A\n- x')!
    expect(root.label).toBe('Plan')
    expect(root.children!.map(c => c.label)).toEqual(['A'])
  })

  it('always renders something for plain prose', () => {
    const root = buildMindMap('just a plan with no structure')!
    expect(root).not.toBeNull()
    expect(root.label.length).toBeGreaterThan(0)
  })

  it('clamps an over-long label and keeps it renderable', () => {
    const long = 'x'.repeat(500)
    const root = buildMindMap(`# ${long}`)!
    expect(root.label.length).toBeLessThanOrEqual(200)
    expect(root.label.endsWith('…')).toBe(true)
  })

  it('caps depth so a pathological deep map cannot blow up the canvas', () => {
    const deep = Array.from({ length: 8 }, (_, i) => `${'#'.repeat(Math.min(i + 1, 6))} L${i}`).join('\n')
    let node = buildMindMap(deep)
    let depth = 0
    while (node?.children?.length) {
      node = node.children[0]
      depth += 1
    }
    expect(depth).toBeLessThanOrEqual(5)
  })
})

describe('extractListItems', () => {
  it('collects list item texts', () => {
    expect(extractListItems('- a\n- b\n\ntext\n- c')).toEqual(['a', 'b', 'c'])
  })
})

describe('extractMarkdownBlock', () => {
  it('extracts fenced markdown block', () => {
    const text = 'Here you go:\n```markdown\n# Title\n- item\n```\ndone'
    expect(extractMarkdownBlock(text)).toBe('# Title\n- item')
  })

  it('falls back to the raw text', () => {
    expect(extractMarkdownBlock('# Title')).toBe('# Title')
  })
})
