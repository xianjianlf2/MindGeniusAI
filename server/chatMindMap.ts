import { ChatOpenAI } from 'langchain/chat_models/openai'

import { HumanChatMessage } from 'langchain/schema'
import { CallbackManager } from 'langchain/callbacks'
import { useOpenAIProxy } from './utils/useOpenAIProxy.ts'

export async function chatMindMap(topic: string, messageSend: Function, messageDone: Function) {
  let result = ''
  let prompt: HumanChatMessage
  const pattern = /[\u4E00-\u9FA5]+/
  if (pattern.test(topic)) {
    prompt = new HumanChatMessage(
      `为主题${topic}创建一个思维导图/指南
        要求：
        1.使用markdown
        2.语言简洁
        3.通常有3个级别
      `)
  }
  else {
    prompt = new HumanChatMessage(
      `create a road map / guide line for the topic ${topic}
        requirement:
        1.use markdown
        2.short language is preferred
        3.usually, there are 3 levels
      `)
  }

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
