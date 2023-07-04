import { ChatOpenAI } from 'langchain/chat_models/openai'
import { CallbackManager } from 'langchain/callbacks'
import type { HumanChatMessage } from 'langchain/schema'

// function generatePrompt
export interface OpenAIProxyConfig {
  basePath: string
  apiKey: string
}
export interface MessageHandler {
  messageSend: Function
  messageDone: Function
  messageError: Function
}
export async function chatMindMap(prompt: HumanChatMessage, messageHandler: MessageHandler, proxyConfig: OpenAIProxyConfig) {
  let result = ''
  const chat = new ChatOpenAI({
    maxTokens: 1024,
    streaming: true,
    temperature: 0.9,
    callbackManager: CallbackManager.fromHandlers({
      async handleLLMNewToken(token: string) {
        result += token
        messageHandler.messageSend(token)
      },
      async handleLLMEnd(output) {
        // eslint-disable-next-line no-console
        console.log('End of stream.\n', result)
        messageHandler.messageDone()
      },
    }),
  },
  proxyConfig)

  chat.call([prompt]).catch((e) => {
    messageHandler.messageError(e.response.data)
  })
}
