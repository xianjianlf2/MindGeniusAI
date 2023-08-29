import { ChatOpenAI } from 'langchain/chat_models/openai'
import { CallbackManager } from 'langchain/callbacks'
import type { HumanMessage } from 'langchain/schema'
import type { MessageHandler, OpenAIProxyConfig } from './types.ts'

// function generatePrompt
export async function chatMindMap(prompt: HumanMessage, messageHandler: MessageHandler, proxyConfig: OpenAIProxyConfig) {
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
    if (!e.response)
      messageHandler.messageError('Please check your key')
    else
      messageHandler.messageError(e.response.data)
  })
}
