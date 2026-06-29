import type { Context } from 'hono'
import { config } from '../config'
import { DemoQuotaError } from '../lib/errors'
import { takeDemoSlot } from '../lib/rateLimit'
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

/** 取客户端 IP：优先反代透传头（Render / HF Space 均经反代）。 */
function clientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')
  if (forwarded)
    return forwarded.split(',')[0]!.trim()
  return c.req.header('x-real-ip') ?? 'unknown'
}

/**
 * 免 Key 体验护栏：仅当本次用的是服务端共享 Key 时，按 IP 计每日额度，
 * 超额抛 DemoQuotaError（经 SSE/HTTP 归类成「填你自己的 Key」提示）。
 * 用户自带 Key 直接放行。
 */
export function enforceDemoQuota(c: Context, cfg: LLMRequestConfig): void {
  if (cfg.usingServerKey && !takeDemoSlot(clientIp(c), config.demo.dailyLimit))
    throw new DemoQuotaError()
}
