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

const PROVIDERS: ProviderName[] = ['openai', 'anthropic', 'deepseek']

/**
 * 解析单次请求使用的 LLM 配置，优先级：
 * 请求头（用户自带 Key / 代理 / 指定 provider）> 环境变量。
 * 兼容旧前端的 `Authorization: Bearer sk-...` 与 `OpenAI-proxy` 头。
 */
export function resolveRequestConfig(headers: {
  authorization?: string
  openaiProxy?: string
  provider?: string
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
    model: providerConfig.model,
  }
}

export function chatModel(cfg: LLMRequestConfig): LanguageModel {
  switch (cfg.provider) {
    case 'anthropic':
      return createAnthropic({ apiKey: cfg.apiKey, baseURL: cfg.baseURL })(cfg.model)
    case 'deepseek':
      return createDeepSeek({ apiKey: cfg.apiKey, baseURL: cfg.baseURL })(cfg.model)
    default:
      return createOpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL })(cfg.model)
  }
}

/** 向量化目前固定走 OpenAI 协议（DeepSeek/代理服务同样兼容该协议） */
export function embeddingModel(cfg: LLMRequestConfig): EmbeddingModel<string> {
  return createOpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL })
    .textEmbeddingModel(config.embedding.model)
}
