import type { MindMapOutline } from '@mindgenius/shared'
import { describe, expect, it } from 'vitest'
import { Language, detectLanguage } from '../src/lib/language'
import { compressPrompt, hermasSystemPrompt, mindMapPrompt, nodeExpandPrompt } from '../src/prompts'

describe('detectLanguage', () => {
  it('detects chinese including mixed text', () => {
    expect(detectLanguage('机器学习')).toBe(Language.Chinese)
    expect(detectLanguage('学习 React')).toBe(Language.Chinese)
  })

  it('detects english', () => {
    expect(detectLanguage('machine learning')).toBe(Language.English)
  })
})

describe('prompts pick template by language', () => {
  it('mind map prompt', () => {
    expect(mindMapPrompt('机器学习')).toContain('思维导图')
    expect(mindMapPrompt('machine learning')).toContain('road map')
  })

  it('node expand prompt', () => {
    expect(nodeExpandPrompt('数据库')).toContain('三点')
    expect(nodeExpandPrompt('database')).toContain('three points')
  })

  it('compress prompt embeds the content', () => {
    expect(compressPrompt('some content')).toContain('some content')
  })
})

describe('hermasSystemPrompt feeds back user edits', () => {
  const outline: MindMapOutline = {
    id: 'root',
    label: 'Plan',
    children: [{ id: 'n1', label: 'GTM strategy' }],
  }

  it('omits the edit section when there are no recent edits', () => {
    expect(hermasSystemPrompt(outline)).not.toContain('MANUALLY edited')
  })

  it('renders edits with ids resolved to human-readable labels', () => {
    const prompt = hermasSystemPrompt(outline, [
      { op: 'update', id: 'n1', label: 'GTM strategy' },
      { op: 'add', parentId: 'root', label: 'Pricing' },
    ])
    expect(prompt).toContain('MANUALLY edited')
    expect(prompt).toContain('renamed "GTM strategy"')
    expect(prompt).toContain('added "Pricing" under "Plan"') // parentId 'root' → label 'Plan'
  })
})
