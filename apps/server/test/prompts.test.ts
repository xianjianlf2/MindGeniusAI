import { describe, expect, it } from 'vitest'
import { Language, detectLanguage } from '../src/lib/language'
import { compressPrompt, mindMapPrompt, nodeExpandPrompt } from '../src/prompts'

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
