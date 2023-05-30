/* eslint-disable no-console */
import * as fs from 'node:fs'
import dotenv from 'dotenv'

// import { OpenAI } from 'langchain/llms/openai'
// import { ConversationalRetrievalQAChain } from 'langchain/chains'
// import { HNSWLib } from 'langchain/vectorstores/hnswlib'
// import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
// import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import type { Message } from './chatStream.ts'

dotenv.config()

export async function chatWithFile(fileName: string, messages: Message[]) {
  const directoryPath = './uploads'

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.log(`Unable to scan directory: ${err}`)
      return
    }

    const file = files.find(file => file === fileName)

    if (!file) {
      console.log(`File ${fileName} not found`)
      return
    }
    fs.readFile(`${directoryPath}/${file}`, 'utf8', (err, data) => {
      if (err) {
        console.log(`Unable to load file: ${err}`)
        return
      }

      console.log(`File ${fileName} loaded successfully`)
      console.log(data)
    })
  })

  //   const model = new OpenAI({}, {
  //     basePath: process.env.OPENAI_PROXY_URL,
  //     apiKey: process.env.OPENAI_API_KEY,
  //   })

  //   const text = fs.readFileSync('state_of_the_union.txt', 'utf8')

//   const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 })
//   const docs = await textSplitter.createDocuments([text])
//   const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings(undefined, {
//     basePath: process.env.OPENAI_PROXY_URL,
//     apiKey: process.env.OPENAI_API_KEY,
//   }))
//   /* Create the chain */
//   const chain = ConversationalRetrievalQAChain.fromLLM(
//     model,
//     vectorStore.asRetriever(),
//   )
//   /* Ask it a question */
//   const question = 'What did the president say about Justice Breyer?'
//   const res = await chain.call({ question, chat_history: [] })
//   console.log(res)
//   /* Ask it a follow up question */
//   const chatHistory = question + res.text
//   const followUpRes = await chain.call({
//     question: 'Was that nice?',
//     chat_history: chatHistory,
//   })
//   console.log(followUpRes)
}
