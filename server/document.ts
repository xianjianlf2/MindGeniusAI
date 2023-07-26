import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { CallbackManager } from 'langchain/callbacks'
import { OpenAI } from 'langchain/llms/openai'
import { BufferMemory } from 'langchain/memory'
import { useOpenAIProxy } from './utils/useOpenAIProxy.ts'
import type { MessageHandler, OpenAIProxyConfig } from './types.ts'

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
  const embeddings = new OpenAIEmbeddings(undefined, useOpenAIProxy())
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings)

  documentStore[fileName] = vectorStore
  return vectorStore
}

export function queryDocumentStream(
  question: string,
  fileName: string,
  messageHandler: MessageHandler,
  proxyConfig: OpenAIProxyConfig,
) {
  if (!documentStore[fileName]) {
    messageHandler.messageError('Please select a file first')
    return
  }

  const chat = new ChatOpenAI(
    {
      maxTokens: 1024,
      streaming: true,
      temperature: 0,
      callbackManager: CallbackManager.fromHandlers({
        async handleLLMNewToken(token: any) {
          messageHandler.messageSend(token)
        },
        async handleLLMEnd(_output) {
          messageHandler.messageDone()
        },
      }),
    },
    proxyConfig,
  )

  const chains = ConversationalRetrievalQAChain.fromLLM(
    chat,
    documentStore[fileName].asRetriever(),
    {
      returnSourceDocuments: true,
      memory: new BufferMemory({
        memoryKey: 'chat_history',
        inputKey: 'question',
        outputKey: 'text',
        returnMessages: true,
      }),
    },
  )

  chains
    .call({
      question,
      chat_history: [],
    })
    .catch((e) => {
      messageHandler.messageError(e.response.data)
    })
}

export async function queryDocument(question: string, fileName: string) {
  if (!documentStore[fileName])
    return

  const model = new OpenAI(
    {
      temperature: 0.7,
    },
    useOpenAIProxy(),
  )

  const chains = ConversationalRetrievalQAChain.fromLLM(
    model,
    documentStore[fileName].asRetriever(),
  )

  const result = await chains.call({
    question,
    chat_history: [],
  })

  return result
}
