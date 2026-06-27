import type { AgentEvent, AgentRequest, MindMapOp } from '@mindgenius/shared'
import { stepCountIs, streamText } from 'ai'
import { toUserMessage } from '../lib/errors'
import { logger } from '../lib/logger'
import type { LLMRequestConfig } from '../llm/provider'
import { chatModel } from '../llm/provider'
import { hermasSystemPrompt } from '../prompts'
import { createHermasTools } from './tools'

const MAX_STEPS = 8

/**
 * Hermas orchestrator：规划 → 调工具 → 观察 → 修订。
 * AI SDK 负责 tool-calling loop（stopWhen 限制步数防失控），
 * 这里把 fullStream 翻译成对前端友好的 AgentEvent 序列。
 */
export async function runHermas(
  request: AgentRequest,
  cfg: LLMRequestConfig,
  onEvent: (event: AgentEvent) => Promise<void>,
) {
  // 兼容旧客户端的单 fileName，统一成 fileNames 数组
  const fileNames = request.fileNames ?? (request.fileName ? [request.fileName] : [])
  logger.info(
    { provider: cfg.provider, model: cfg.model, baseURL: cfg.baseURL ?? null, docCount: fileNames.length },
    'hermas run',
  )
  const result = streamText({
    model: chatModel(cfg),
    system: hermasSystemPrompt(request.mindMap, request.recentEdits),
    messages: request.messages.map(message => ({
      role: message.role,
      content: message.content,
    })),
    tools: createHermasTools({ cfg, fileNames }),
    stopWhen: stepCountIs(MAX_STEPS),
  })

  for await (const part of result.fullStream) {
    switch (part.type) {
      case 'text-delta':
        await onEvent({ type: 'text', delta: part.text })
        break
      case 'tool-call':
        logger.info({ tool: part.toolName }, 'hermas tool call')
        await onEvent({
          type: 'tool-call',
          toolName: part.toolName,
          toolCallId: part.toolCallId,
          input: part.input,
        })
        // mindmap_edit 的增量指令直接推给前端应用到画布
        if (part.toolName === 'mindmap_edit') {
          const ops = (part.input as { ops?: MindMapOp[] }).ops ?? []
          if (ops.length)
            await onEvent({ type: 'mindmap-patch', ops })
        }
        break
      case 'tool-result':
        await onEvent({
          type: 'tool-result',
          toolName: part.toolName,
          toolCallId: part.toolCallId,
          output: part.output,
        })
        // 生成工具的 markdown 直接确定地推给画布，绕开「模型回显 + 前端正则」的脆链路
        if (part.toolName === 'mindmap_generate' && typeof part.output === 'string' && part.output.trim())
          await onEvent({ type: 'mindmap-set', markdown: part.output })
        break
      case 'finish-step':
        await onEvent({ type: 'step-finish' })
        break
      case 'error':
        logger.error({ err: part.error }, 'hermas stream error')
        await onEvent({ type: 'error', message: toUserMessage(part.error) })
        break
    }
  }
}
