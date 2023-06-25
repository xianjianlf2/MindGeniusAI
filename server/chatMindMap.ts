import { ChatOpenAI } from 'langchain/chat_models/openai'

import { CallbackManager } from 'langchain/callbacks'
import type { HumanChatMessage } from 'langchain/schema'
import { useOpenAIProxy } from './utils/useOpenAIProxy.ts'

// function generatePrompt
export async function chatMindMap(prompt: HumanChatMessage, messageSend: Function, messageDone: Function) {
  let result = ''
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
