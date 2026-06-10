import { generateText, tool } from 'ai'
import { z } from 'zod'
import type { LLMRequestConfig } from '../llm/provider'
import { chatModel } from '../llm/provider'
import { mindMapPrompt, nodeExpandPrompt } from '../prompts'
import { retrieveChunks } from '../services/rag'

export interface HermasContext {
  cfg: LLMRequestConfig
  /** 已上传并完成索引的文档名，rag_query 的检索目标 */
  fileName?: string
}

export function createHermasTools(ctx: HermasContext) {
  return {
    mindmap_generate: tool({
      description: 'Generate a complete mind map (markdown, ~3 levels) for a topic. Returns the markdown.',
      inputSchema: z.object({
        topic: z.string().describe('The topic of the mind map, in the user\'s language'),
        extraContext: z.string().optional().describe('Optional facts/requirements the mind map must incorporate, e.g. retrieved document content'),
      }),
      execute: async ({ topic, extraContext }) => {
        const prompt = extraContext
          ? `${mindMapPrompt(topic)}\n\nIncorporate the following context:\n${extraContext}`
          : mindMapPrompt(topic)
        const { text } = await generateText({
          model: chatModel(ctx.cfg),
          prompt,
          temperature: 0.9,
        })
        return text
      },
    }),

    node_expand: tool({
      description: 'Brainstorm: expand one mind-map node/branch into three concise sub-points (markdown list).',
      inputSchema: z.object({
        content: z.string().describe('The node content to expand'),
      }),
      execute: async ({ content }) => {
        const { text } = await generateText({
          model: chatModel(ctx.cfg),
          prompt: nodeExpandPrompt(content),
          temperature: 0.9,
        })
        return text
      },
    }),

    rag_query: tool({
      description: 'Search the user\'s uploaded PDF document for passages relevant to a question. Use before answering anything about the document.',
      inputSchema: z.object({
        question: z.string().describe('What to look up in the document'),
      }),
      execute: async ({ question }) => {
        if (!ctx.fileName)
          return 'No document has been uploaded/indexed in this session.'
        const chunks = await retrieveChunks(ctx.fileName, question, ctx.cfg)
        if (chunks.length === 0)
          return 'The document index is empty or not initialized. Ask the user to initialize the document first.'
        return chunks.map((chunk, i) => `[${i + 1}] ${chunk}`).join('\n\n')
      },
    }),
  }
}
