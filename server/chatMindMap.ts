import { ChatOpenAI } from 'langchain/chat_models/openai'

import { AIChatMessage, HumanChatMessage } from 'langchain/schema'
import { useOpenAIProxy } from './utils/useOpenAIProxy.ts'

export async function chatMindMap(topic: string) {
  const prompt = `Please create a mind map about ${topic}?`
  const fewShot = [
    new HumanChatMessage(
            `create a front end tech road map
                requirement:
                1.only out put code without codeblock
                2.Nodes of the same level align in the same vertical
                3.refine it to the third level and transform to:
        [
            { id: '1', label: 'Front-End Tech Road Map',level:1},
            { id: '2', label: 'HTML/CSS',level:2},
            { id: '3', label: 'Semantic HTML',level:3},
            { id: '4', label: 'CSS Preprocessors',level:3},
            // Edges
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e2-4', source: '2', target: '4' },
        ]`),
  ]
  const chat = new ChatOpenAI({
    maxTokens: 1024,
    streaming: true,
    temperature: 0.9,
  },
  useOpenAIProxy())

  const res = await chat.call([...fewShot, new AIChatMessage(prompt)])
  return res
}
