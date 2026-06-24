import { unwrapFence } from '@mindgenius/shared'
import { generateObject, generateText, tool } from 'ai'
import { z } from 'zod'
import { logger } from '../lib/logger'
import type { LLMRequestConfig } from '../llm/provider'
import { chatModel } from '../llm/provider'
import { brainstormPrompt, mindMapDirectPrompt, mindMapPrompt, nodeExpandPrompt, structurePrompt } from '../prompts'
import { retrieveChunks } from '../services/rag'

/** 固定三级结构（root → 分支 → 要点），generateObject 据此强校验输出格式 */
const mindMapStructure = z.object({
  root: z.string().describe('The central topic, concise'),
  branches: z.array(z.object({
    title: z.string().describe('A concise main-branch label'),
    points: z.array(z.string()).max(8).describe('3-6 concise leaf points'),
  })).min(2).max(8).describe('Main branches of the mind map'),
})

/** 把校验过的结构序列化成规范 markdown（# 根 / ## 分支 / - 要点），下游解析零歧义 */
function structureToMarkdown(s: z.infer<typeof mindMapStructure>): string {
  const lines = [`# ${s.root.trim()}`]
  for (const branch of s.branches) {
    lines.push(`## ${branch.title.trim()}`)
    for (const point of branch.points)
      lines.push(`- ${point.trim()}`)
  }
  return lines.join('\n')
}

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
        thorough: z.boolean().optional().describe('Set true ONLY for broad/complex topics that benefit from a wider exploration pass; default (false) is faster.'),
      }),
      // 默认单次结构化调用（快）；thorough=true 时才走「发散→结构」两段式（慢、更广）。
      // generateObject 对固定 schema 强校验保证格式；结构化失败回退单次 markdown，兼容弱 provider。
      execute: async ({ topic, extraContext, thorough }) => {
        try {
          const prompt = thorough
            ? structurePrompt(topic, (await generateText({
              model: chatModel(ctx.cfg),
              prompt: brainstormPrompt(topic, extraContext),
              temperature: 0.9,
            })).text)
            : mindMapDirectPrompt(topic, extraContext)
          const { object } = await generateObject({
            model: chatModel(ctx.cfg),
            schema: mindMapStructure,
            prompt,
            temperature: thorough ? 0.3 : 0.7,
          })
          return structureToMarkdown(object)
        }
        catch (error) {
          // 某些 provider 对结构化输出支持不稳，回退到单次自由生成 + 源头剥壳
          logger.warn({ err: error }, 'mindmap_generate: structured pass failed, falling back to single-pass')
          const prompt = extraContext
            ? `${mindMapPrompt(topic)}\n\nIncorporate the following context:\n${extraContext}`
            : mindMapPrompt(topic)
          const { text } = await generateText({ model: chatModel(ctx.cfg), prompt, temperature: 0.9 })
          return unwrapFence(text)
        }
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

    mindmap_edit: tool({
      description: 'Edit the EXISTING mind map on the canvas with precise operations, instead of regenerating it. Use when a map already exists and the user wants to add, rename, or remove specific nodes. Reference nodes by the ids shown in the current outline; new nodes get ids automatically.',
      inputSchema: z.object({
        ops: z.array(z.discriminatedUnion('op', [
          z.object({ op: z.literal('add'), parentId: z.string().describe('id of the parent node from the outline'), label: z.string().describe('text of the new child node') }),
          z.object({ op: z.literal('update'), id: z.string().describe('id of the node to rename'), label: z.string().describe('new text') }),
          z.object({ op: z.literal('remove'), id: z.string().describe('id of the node to delete (cannot be the root)') }),
        ])).min(1).describe('Ordered list of edit operations applied to the canvas'),
      }),
      // 实际增量应用在前端（持有画布状态）；这里只回执，patch 通过 AgentEvent 推送。
      execute: async ({ ops }) => `Applied ${ops.length} edit operation(s) to the canvas.`,
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
