import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanChatMessage } from 'langchain/schema'
import { Language, validateWord } from './utils/useValidateLanguage.ts'
import { useOpenAIProxy } from './utils/useOpenAIProxy.ts'

export async function compressContent(content: string) {
  let chatPrompt
  if (validateWord(content) === Language.Chinese) {
    chatPrompt = new HumanChatMessage(
      `将以下内容精简为简洁的摘要,要求:
        使用 markdown 格式
        内容如下:
        [${content}]
        `,
    )
  }
  else {
    chatPrompt = new HumanChatMessage(
      `Compress the following content into a concise summary, requirements:
        use Markdown format
        content:
       [${content}]
        `,
    )
  }

  const chain = new ChatOpenAI(
    {
      maxTokens: 1024,
      temperature: 0.1,
    },
    useOpenAIProxy(),
  )

  return await chain.call([chatPrompt]).catch((e) => {
    if (!e.response)
      return 'Please check your key'
    else return e.response.data
  })
}
