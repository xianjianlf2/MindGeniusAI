import type { MindMapOp } from '@mindgenius/shared'
import { describe, expect, it } from 'vitest'
import type { MindMapData } from '../src/utils/convertMarkdown'
import { getNodes } from '../src/utils/convertMarkdown'
import { applyOps, canMoveUnder, coalesceEdits, toOutline } from '../src/utils/patch'

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

  it('moves a leaf under another branch and renormalizes its type', () => {
    const root = tree()
    const advancedId = root.children![1].id
    const typesLeaf = root.children![0].children![0] // Basics > types (topic-child)
    expect(applyOps(root, [{ op: 'move', id: typesLeaf.id, parentId: advancedId }])).toBe(1)
    // 已从 Basics 移走、挂到 Advanced 末尾
    expect(root.children![0].children!.map(c => c.label)).toEqual(['interfaces'])
    expect(root.children![1].children!.map(c => c.label)).toEqual(['generics', 'types'])
    expect(typesLeaf.type).toBe('topic-child') // depth 2 → 仍是叶子
  })

  it('promotes a branch to topic-branch when moved under root', () => {
    const root = tree()
    const typesLeaf = root.children![0].children![0]
    applyOps(root, [{ op: 'move', id: typesLeaf.id, parentId: root.id }])
    const moved = root.children!.find(c => c.label === 'types')!
    expect(moved.type).toBe('topic-branch') // depth 1 → 升级为分支
  })

  it('rejects moving a node under itself or its own descendant (no cycle)', () => {
    const root = tree()
    const basics = root.children![0]
    const typesLeaf = basics.children![0]
    const applied = applyOps(root, [
      { op: 'move', id: basics.id, parentId: typesLeaf.id }, // 移到自己的子孙下
      { op: 'move', id: basics.id, parentId: basics.id }, // 移到自己下
      { op: 'move', id: root.id, parentId: basics.id }, // 移动根
    ])
    expect(applied).toBe(0)
    expect(root.children![0].children!.map(c => c.label)).toEqual(['types', 'interfaces'])
  })
})

describe('coalesceEdits', () => {
  it('collapses repeated updates on a node to the last value', () => {
    const ops: MindMapOp[] = [
      { op: 'update', id: 'a', label: 'first' },
      { op: 'update', id: 'a', label: 'second' },
      { op: 'update', id: 'b', label: 'other' },
    ]
    expect(coalesceEdits(ops)).toEqual([
      { op: 'update', id: 'a', label: 'second' },
      { op: 'update', id: 'b', label: 'other' },
    ])
  })

  it('drops update/move on a node that is later removed, but keeps the remove', () => {
    const ops: MindMapOp[] = [
      { op: 'update', id: 'a', label: 'renamed' },
      { op: 'move', id: 'a', parentId: 'p' },
      { op: 'remove', id: 'a' },
    ]
    expect(coalesceEdits(ops)).toEqual([{ op: 'remove', id: 'a' }])
  })

  it('keeps every add untouched (no id to correlate)', () => {
    const ops: MindMapOp[] = [
      { op: 'add', parentId: 'root', label: '' },
      { op: 'add', parentId: 'root', label: 'x' },
    ]
    expect(coalesceEdits(ops)).toEqual(ops)
  })

  it('keeps only the last move per node, preserving first-seen order', () => {
    const ops: MindMapOp[] = [
      { op: 'move', id: 'a', parentId: 'p1' },
      { op: 'update', id: 'b', label: 'b' },
      { op: 'move', id: 'a', parentId: 'p2', index: 1 },
    ]
    expect(coalesceEdits(ops)).toEqual([
      { op: 'move', id: 'a', parentId: 'p2', index: 1 },
      { op: 'update', id: 'b', label: 'b' },
    ])
  })
})

describe('canMoveUnder', () => {
  it('allows moving a leaf under a sibling branch', () => {
    const root = tree()
    expect(canMoveUnder(root, root.children![0].children![0].id, root.children![1].id)).toBe(true)
  })

  it('forbids self, root, descendants, and unknown targets', () => {
    const root = tree()
    const basics = root.children![0]
    expect(canMoveUnder(root, basics.id, basics.id)).toBe(false) // self
    expect(canMoveUnder(root, root.id, basics.id)).toBe(false) // root can't move
    expect(canMoveUnder(root, basics.id, basics.children![0].id)).toBe(false) // descendant
    expect(canMoveUnder(root, basics.id, 'ghost')).toBe(false) // unknown target
  })
})
