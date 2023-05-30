import dotenv from 'dotenv'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { AIChatMessage, HumanChatMessage, SystemChatMessage } from 'langchain/schema'
import { CallbackManager } from 'langchain/callbacks'

dotenv.config()

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  time: string
}
function chat(messageSend: Function, messageDone: Function) {
  let result = ''
  return new ChatOpenAI({
    maxTokens: 1024,
    streaming: true,
    temperature: 0.9,
    callbackManager: CallbackManager.fromHandlers({
      async handleLLMNewToken(token: string) {
        // console.log({ token })
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
  {
    basePath: process.env.OPENAI_PROXY_URL,
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function chatStream(messages: Message[], messageSend: Function, messageDone: Function) {
  const messageList = messages.map((message) => {
    switch (message.role) {
      case 'system': {
        return new SystemChatMessage(message.content)
      }
      case 'user': {
        return new HumanChatMessage(message.content)
      }
      case 'assistant': {
        return new AIChatMessage(message.content)
      }
      default: {
        return new HumanChatMessage(message.content)
      }
    }
  })

  return chat(messageSend, messageDone).call(messageList)
}
