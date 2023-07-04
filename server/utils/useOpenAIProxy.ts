import dotenv from 'dotenv'
import type Router from 'koa-router'
import type Koa from 'Koa'
import type { OpenAIProxyConfig } from '../chatMindMap.ts'

dotenv.config()

const defaultBasePath = 'https://api.openai.com/v1'

export function useOpenAIProxy() {
  return {
    basePath: process.env.OPENAI_PROXY_URL ?? defaultBasePath,
    apiKey: process.env.OPENAI_API_KEY,
  }
}
export function configureProxyEnvironment(ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>): OpenAIProxyConfig {
  const openAIKey = ctx.request.headers.authorization?.replace('Bearer ', '')
  const openAIProxy = ctx.request.headers['Openai-Proxy'] as string
  const { basePath, apiKey } = useOpenAIProxy()
  const config = {
    basePath: openAIProxy ?? basePath,
    apiKey: openAIKey ?? apiKey!,
  }
  return config
}

export function isEmptyKey(ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>) {
  const openAIKey = ctx.request.headers.authorization?.replace('Bearer ', '')
  const { apiKey } = useOpenAIProxy()
  return !openAIKey && !apiKey
}
