import type { Context } from 'hono'
import type { LLMRequestConfig } from '../llm/provider'
import { resolveRequestConfig } from '../llm/provider'

/**
 * 从请求头解析本次调用的 LLM 配置。
 * 兼容旧前端：`Authorization: Bearer sk-...`（用户自带 Key）、`OpenAI-proxy`（自定义网关）。
 * 新增：`X-LLM-Provider: openai|anthropic|deepseek|moonshot` 切换供应商；`X-LLM-Model` 指定模型名。
 */
export function llmConfigFrom(c: Context): LLMRequestConfig {
  return resolveRequestConfig({
    authorization: c.req.header('authorization'),
    openaiProxy: c.req.header('openai-proxy'),
    provider: c.req.header('x-llm-provider'),
    model: c.req.header('x-llm-model'),
  })
}
