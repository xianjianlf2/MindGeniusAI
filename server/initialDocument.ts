import path from 'node:path'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { Chroma } from 'langchain/vectorstores/chroma'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

export async function initialDocument(fileName: string) {
  const documentPath = path.join(__dirname, 'uploads', fileName)

  const loader = new PDFLoader(documentPath)

  const docs = await loader.load()
  // Create vector store and index the docs
  const vectorStore = await Chroma.fromDocuments(docs, new OpenAIEmbeddings(), {
    collectionName: 'a-test-collection',
  })
  // Search for the most similar document
  const response = await vectorStore.similaritySearch('hello', 1)

  console.log(response)
}
