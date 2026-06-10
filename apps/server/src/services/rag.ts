import fs from 'node:fs'
import path from 'node:path'
import { cosineSimilarity, embed, embedMany } from 'ai'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { config } from '../config'
import { logger } from '../lib/logger'
import type { LLMRequestConfig } from '../llm/provider'
import { embeddingModel } from '../llm/provider'

interface IndexedChunk {
  text: string
  embedding: number[]
}

/** fileName -> 已向量化的分块。与旧实现一致：进程内存级缓存，重启后需重新 init */
const documentIndex = new Map<string, IndexedChunk[]>()

export function isIndexed(fileName: string) {
  return documentIndex.has(fileName)
}

/** 递归字符分块：优先按段落，再按句子，控制每块大小并保留重叠 */
export function splitText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const cleaned = text.replace(/\r\n/g, '\n').trim()
  if (!cleaned)
    return []
  if (cleaned.length <= chunkSize)
    return [cleaned]

  const chunks: string[] = []
  let start = 0
  while (start < cleaned.length) {
    let end = Math.min(start + chunkSize, cleaned.length)
    if (end < cleaned.length) {
      // 在窗口内找最近的自然断点（段落 > 换行 > 句号）
      const window = cleaned.slice(start, end)
      const breakPoint = Math.max(
        window.lastIndexOf('\n\n'),
        window.lastIndexOf('\n'),
        window.lastIndexOf('。'),
        window.lastIndexOf('. '),
      )
      if (breakPoint > chunkSize / 2)
        end = start + breakPoint + 1
    }
    chunks.push(cleaned.slice(start, end).trim())
    if (end >= cleaned.length)
      break
    start = end - overlap
  }
  return chunks.filter(Boolean)
}

export async function indexDocument(fileName: string, cfg: LLMRequestConfig) {
  if (documentIndex.has(fileName))
    return true

  const filePath = path.join(config.uploadDir, path.basename(fileName))
  if (!fs.existsSync(filePath))
    return false

  const buffer = await fs.promises.readFile(filePath)
  const { text } = await pdfParse(buffer)
  const chunks = splitText(text)
  if (chunks.length === 0)
    return false

  const { embeddings } = await embedMany({
    model: embeddingModel(cfg),
    values: chunks,
  })
  documentIndex.set(
    fileName,
    chunks.map((chunk, i) => ({ text: chunk, embedding: embeddings[i] })),
  )
  logger.info({ fileName, chunks: chunks.length }, 'document indexed')
  return true
}

export async function retrieveChunks(fileName: string, question: string, cfg: LLMRequestConfig, topK = 4): Promise<string[]> {
  const index = documentIndex.get(fileName)
  if (!index)
    return []

  const { embedding } = await embed({
    model: embeddingModel(cfg),
    value: question,
  })

  return index
    .map(chunk => ({ chunk, score: cosineSimilarity(embedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => chunk.text)
}
