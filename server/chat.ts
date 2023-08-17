/* eslint-disable n/prefer-global/process */
import { PineconeClient } from '@pinecone-database/pinecone'
import dotenv from 'dotenv'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { OpenAI } from 'langchain/llms/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { useOpenAIProxy } from './utils/useOpenAIProxy.ts'

dotenv.config()

const model = new OpenAI({
  temperature: 0,
},
useOpenAIProxy())

const pinecone = new PineconeClient()
await pinecone.init({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_ENVIRONMENT!,
})

const pineconeIndex = await pinecone.Index(process.env.PINECONE_INDEX!)
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings(undefined, useOpenAIProxy()),
  {
    pineconeIndex,
    textKey: 'text',
    namespace: 'teach-vue3-document',
  },
)

const chains = ConversationalRetrievalQAChain.fromLLM(
  model,
  vectorStore.asRetriever(),
  {
    returnSourceDocuments: true,
  },
)

export async function chat(ctx: any) {
  const { message, history } = ctx.request.body
  const res = await chains.call({
    question: message,
    chat_history: history || [],
  })

  return res
}
