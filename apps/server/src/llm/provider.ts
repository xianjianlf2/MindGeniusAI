import { createAnthropic } from '@ai-sdk/anthropic'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createOpenAI } from '@ai-sdk/openai'
import type { EmbeddingModel, LanguageModel } from 'ai'
import type { ProviderName } from '../config'
import { config } from '../config'
import { MissingApiKeyError } from '../lib/errors'

export interface LLMRequestConfig {
  provider: ProviderName
  apiKey: string
  baseURL?: string
  model: string
}

const PROVIDERS: ProviderName[] = ['openai', 'anthropic', 'deepseek', 'moonshot']

/**
 * 解析单次请求使用的 LLM 配置，优先级：
 * 请求头（用户自带 Key / 代理 / 指定 provider / 指定 model）> 环境变量。
 * 兼容旧前端的 `Authorization: Bearer sk-...` 与 `OpenAI-proxy` 头；
 * 新增 `X-LLM-Model` 让客户端为自定义网关（如 Kimi）指定模型名。
 */
export function resolveRequestConfig(headers: {
  authorization?: string
  openaiProxy?: string
  provider?: string
  model?: string
}): LLMRequestConfig {
  const provider = PROVIDERS.includes(headers.provider as ProviderName)
    ? headers.provider as ProviderName
    : config.defaultProvider

  const providerConfig = config.providers[provider]
  const headerKey = headers.authorization?.replace('Bearer ', '').trim()
  const apiKey = (headerKey && headerKey.startsWith('sk-')) ? headerKey : providerConfig.apiKey

  if (!apiKey)
    throw new MissingApiKeyError(provider)

  return {
    provider,
    apiKey,
    baseURL: headers.openaiProxy || providerConfig.baseURL || undefined,
    model: headers.model?.trim() || providerConfig.model,
  }
}

export function chatModel(cfg: LLMRequestConfig): LanguageModel {
  switch (cfg.provider) {
    case 'anthropic':
      return createAnthropic({ apiKey: cfg.apiKey, baseURL: cfg.baseURL })(cfg.model)
    case 'deepseek':
      return createDeepSeek({ apiKey: cfg.apiKey, baseURL: cfg.baseURL })(cfg.model)
    // Kimi/Moonshot 与自定义网关都走 OpenAI 协议。
    // 关键：用 .chat() 强制走 /v1/chat/completions —— 默认的 /v1/responses 在多数
    // 代理网关 / Kimi / DeepSeek 兼容端点上不被支持，会直接 APICallError 导致出不了图。
    default:
      return createOpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL }).chat(cfg.model)
  }
}

/**
 * 解析 RAG 向量化模型，**返回 null 表示当前配置不支持 embeddings**（如 chat 走 Kimi/DeepSeek
 * 且未单独配置 embeddings 端点），调用方据此优雅降级而非报错。
 * 优先级：独立 EMBEDDING_API_KEY 端点 > chat 走 OpenAI 时复用其 key/网关。
 */
export function embeddingModelFor(cfg: LLMRequestConfig): EmbeddingModel<string> | null {
  if (config.embedding.apiKey) {
    return createOpenAI({ apiKey: config.embedding.apiKey, baseURL: config.embedding.baseURL })
      .textEmbeddingModel(config.embedding.model)
  }
  if (cfg.provider === 'openai') {
    return createOpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL })
      .textEmbeddingModel(config.embedding.model)
  }
  return null
}
