import { describe, expect, it } from 'vitest'
import { splitText } from '../src/services/rag'

describe('splitText', () => {
  it('returns empty array for blank input', () => {
    expect(splitText('')).toEqual([])
    expect(splitText('   \n  ')).toEqual([])
  })

  it('keeps short text as a single chunk', () => {
    expect(splitText('hello world')).toEqual(['hello world'])
  })

  it('splits long text into overlapping chunks within the size limit', () => {
    const paragraph = `${'word '.repeat(100)}\n\n`
    const text = paragraph.repeat(10)
    const chunks = splitText(text, 500, 100)
    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks)
      expect(chunk.length).toBeLessThanOrEqual(500)
  })

  it('prefers paragraph boundaries when splitting', () => {
    const first = 'a'.repeat(300)
    const second = 'b'.repeat(300)
    const chunks = splitText(`${first}\n\n${second}`, 400, 50)
    expect(chunks[0]).toBe(first)
  })
})
