import { describe, expect, it } from 'vitest'
import { rankChunks, splitText } from '../src/services/rag'

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

describe('rankChunks (multi-doc retrieval core)', () => {
  // 2D 向量便于手算余弦：query=[1,0] 与各 chunk 的夹角决定排序
  const docA = [
    { text: 'A-aligned', embedding: [1, 0] }, // 余弦 1
    { text: 'A-ortho', embedding: [0, 1] }, // 余弦 0
  ]
  const docB = [
    { text: 'B-near', embedding: [0.9, 0.1] }, // 余弦 ~0.99
    { text: 'B-far', embedding: [-1, 0] }, // 余弦 -1
  ]

  it('merges chunks across docs and ranks by similarity', () => {
    const ranked = rankChunks([1, 0], [...docA, ...docB], 3)
    expect(ranked).toEqual(['A-aligned', 'B-near', 'A-ortho'])
  })

  it('caps at global topK regardless of how many docs are merged', () => {
    // 成本保证：合并 4 块也只返回 topK=2，上下文不随文档数膨胀
    const ranked = rankChunks([1, 0], [...docA, ...docB], 2)
    expect(ranked).toHaveLength(2)
    expect(ranked).toEqual(['A-aligned', 'B-near'])
  })

  it('returns empty for an empty pool', () => {
    expect(rankChunks([1, 0], [], 5)).toEqual([])
  })
})
