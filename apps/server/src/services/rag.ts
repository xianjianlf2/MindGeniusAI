import fs from 'node:fs'
import path from 'node:path'
import { cosineSimilarity, embed, embedMany } from 'ai'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { config } from '../config'
import { logger } from '../lib/logger'
import type { LLMRequestConfig } from '../llm/provider'
import { embeddingModelFor } from '../llm/provider'

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

  const model = embeddingModelFor(cfg)
  if (!model)
    throw new Error('当前模型不支持文档向量化（RAG）。请改用 OpenAI，或在服务端配置 EMBEDDING_API_KEY 指向一个 OpenAI 兼容的 embeddings 端点。')

  const buffer = await fs.promises.readFile(filePath)
  const { text } = await pdfParse(buffer)
  // 限制每篇分块数，挡住超大文档的内存/embedding 调用爆量
  const chunks = splitText(text).slice(0, config.rag.maxChunksPerDoc)
  if (chunks.length === 0)
    return false

  // 索引文档数达上限时淘汰最旧的（Map 按插入序），防进程内存无限增长
  while (documentIndex.size >= config.rag.maxIndexedDocs) {
    const oldest = documentIndex.keys().next().value
    if (oldest === undefined)
      break
    documentIndex.delete(oldest)
  }

  const { embeddings } = await embedMany({
    model,
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

  const model = embeddingModelFor(cfg)
  if (!model)
    return []

  const { embedding } = await embed({
    model,
    value: question,
  })

  return index
    .map(chunk => ({ chunk, score: cosineSimilarity(embedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => chunk.text)
}
