import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAI } from 'langchain/llms/openai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { useOpenAIProxy } from './utils/useOpenAIProxy.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const documentStore: Record<string, MemoryVectorStore> = {}

export async function initialDocument(fileName: string) {
  if (documentStore[fileName])
    return documentStore[fileName]

  const documentPath = path.join(__dirname, 'uploads', fileName)
  if (!fs.existsSync(documentPath))
    return

  const loader = new PDFLoader(documentPath)

  const docs = await loader.load()
  const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings(undefined, useOpenAIProxy()),
  )

  documentStore[fileName] = vectorStore
  return vectorStore
}

export async function queryDocument(query: string, fileName: string) {
  if (!documentStore[fileName])
    return
  const model = new OpenAI({
    temperature: 0.5,
  },
  useOpenAIProxy())
  const chains = ConversationalRetrievalQAChain.fromLLM(
    model,
    documentStore[fileName].asRetriever(),
    {
      returnSourceDocuments: true,
    },
  )
  const result = await chains.call({
    question: query,
    chat_history: [],
  })
  // const result = await documentStore[fileName].similaritySearch(query, 3)
  return result
}
