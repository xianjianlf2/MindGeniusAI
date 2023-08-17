/* eslint-disable n/prefer-global/process */
import { PineconeClient } from '@pinecone-database/pinecone'
import dotenv from 'dotenv'
import { UnstructuredLoader } from 'langchain/document_loaders/fs/unstructured'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { useOpenAIProxy } from './utils/useOpenAIProxy.ts'

// Load environment variables
dotenv.config()

const unstructuredLoader = new UnstructuredLoader('./vue3-document.md')

const rawDocs = await unstructuredLoader.load()

// console.log(rawDocs)

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
})

const docs = await splitter.splitDocuments(rawDocs)

const pineconeClient = new PineconeClient()
await pineconeClient.init({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_ENVIRONMENT!,
})

const pineconeIndex = await pineconeClient.Index(process.env.PINECONE_INDEX!)

try {
  PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(undefined, useOpenAIProxy()), {
    pineconeIndex,
    textKey: 'text',
    namespace: 'teach-vue3-document',
  })
}
catch (error) {

  // console.log(error)
}
