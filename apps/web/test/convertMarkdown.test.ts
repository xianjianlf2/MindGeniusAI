import { describe, expect, it } from 'vitest'
import { extractListItems, extractMarkdownBlock, getNodes } from '../src/utils/convertMarkdown'

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
