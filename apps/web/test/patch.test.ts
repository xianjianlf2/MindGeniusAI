import { describe, expect, it } from 'vitest'
import type { MindMapData } from '../src/utils/convertMarkdown'
import { getNodes } from '../src/utils/convertMarkdown'
import { applyOps, toOutline } from '../src/utils/patch'

const MARKDOWN = `# Roadmap
## Basics
- types
- interfaces
## Advanced
- generics
`

function tree(): MindMapData {
  return getNodes(MARKDOWN)[0]
}

describe('toOutline', () => {
  it('keeps id/label/children and drops layout fields', () => {
    const outline = toOutline(tree())
    expect(outline.label).toBe('Roadmap')
    expect(outline).not.toHaveProperty('width')
    expect(outline.children!.map(c => c.label)).toEqual(['Basics', 'Advanced'])
    const basics = outline.children![0]
    expect(basics.children!.map(c => c.label)).toEqual(['types', 'interfaces'])
  })

  it('omits children when a node has none', () => {
    expect(toOutline(tree()).children![0].children![0].children).toBeUndefined()
  })
})

describe('applyOps', () => {
  it('adds a child under an existing branch', () => {
    const root = tree()
    const basicsId = root.children![0].id
    expect(applyOps(root, [{ op: 'add', parentId: basicsId, label: 'enums' }])).toBe(1)
    expect(root.children![0].children!.map(c => c.label)).toContain('enums')
  })

  it('inherits the right node type from its parent', () => {
    const root = tree()
    expect(applyOps(root, [{ op: 'add', parentId: root.id, label: 'Tooling' }])).toBe(1)
    const added = root.children!.find(c => c.label === 'Tooling')!
    expect(added.type).toBe('topic-branch') // child of root(topic)
  })

  it('renames a node', () => {
    const root = tree()
    const advancedId = root.children![1].id
    expect(applyOps(root, [{ op: 'update', id: advancedId, label: 'Expert' }])).toBe(1)
    expect(root.children![1].label).toBe('Expert')
  })

  it('removes a node by id', () => {
    const root = tree()
    const advancedId = root.children![1].id
    expect(applyOps(root, [{ op: 'remove', id: advancedId }])).toBe(1)
    expect(root.children!.map(c => c.label)).toEqual(['Basics'])
  })

  it('skips unknown ids, leaf children, and root removal without throwing', () => {
    const root = tree()
    const leafId = root.children![0].children![0].id // a topic-child leaf
    const applied = applyOps(root, [
      { op: 'update', id: 'nope', label: 'x' },
      { op: 'remove', id: 'nope' },
      { op: 'add', parentId: leafId, label: 'too deep' },
      { op: 'remove', id: root.id }, // can't remove root
    ])
    expect(applied).toBe(0)
    expect(root.children).toHaveLength(2)
  })

  it('applies a batch in order and counts successes', () => {
    const root = tree()
    const n = applyOps(root, [
      { op: 'add', parentId: root.id, label: 'New' },
      { op: 'remove', id: 'ghost' },
      { op: 'update', id: root.id, label: 'Roadmap v2' },
    ])
    expect(n).toBe(2)
    expect(root.label).toBe('Roadmap v2')
  })
})
