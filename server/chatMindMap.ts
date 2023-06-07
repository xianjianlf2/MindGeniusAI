import { ChatOpenAI } from 'langchain/chat_models/openai'

import { HumanChatMessage } from 'langchain/schema'
import { CallbackManager } from 'langchain/callbacks'
import { useOpenAIProxy } from './utils/useOpenAIProxy.ts'

export async function chatMindMap(topic: string, messageSend: Function, messageDone: Function) {
  let result = ''
  const prompt = new HumanChatMessage(
            `create a road map / guide line for the topic ${topic}
              requirement:
              1.use markdown
              2.when guide line is started, please use '[START]' to mark the start point
              3.short language is preferred
              4.usually, there are 3 levels
            `)
  const chat = new ChatOpenAI({
    maxTokens: 1024,
    streaming: true,
    temperature: 0.9,
    callbackManager: CallbackManager.fromHandlers({
      async handleLLMNewToken(token: string) {
        result += token
        messageSend(token)
      },
      async handleLLMEnd(output) {
        // eslint-disable-next-line no-console
        console.log('End of stream.', result)
        messageDone()
      },
    }),
  },
  useOpenAIProxy())

  return chat.call([prompt])
}
