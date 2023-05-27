/* eslint-disable no-console */
import dotenv from 'dotenv'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanChatMessage } from 'langchain/schema'
import { CallbackManager } from 'langchain/callbacks'

dotenv.config()

function chat(messageSend: Function, messageDone: Function) {
  return new ChatOpenAI({
    maxTokens: 25,
    streaming: true,
    temperature: 0.9,
    callbackManager: CallbackManager.fromHandlers({
      async handleLLMNewToken(token: string) {
        console.log({ token })
        messageSend(token)
      },
      async handleLLMEnd(output) {
        console.log('End of stream.', output)
        messageDone()
      },
    }),
  },
  {
    basePath: process.env.OPENAI_PROXY_URL,
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function chatStream(ctx: any, messageSend: Function, messageDone: Function) {
  const { message, history } = ctx.request.body
  const res = await chat(messageSend, messageDone).call([new HumanChatMessage(message)])
  return res
}
