/* eslint-disable n/prefer-global/process */
import dotenv from 'dotenv'
import type Router from 'koa-router'
import type Koa from 'koa'
import type { OpenAIProxyConfig } from '../types.ts'

dotenv.config()

const defaultBasePath = 'https://api.openai.com/v1'

export function useOpenAIProxy() {
  return {
    basePath: process.env.OPENAI_PROXY_URL ?? defaultBasePath,
    apiKey: process.env.OPENAI_API_KEY,
  }
}
export function configureProxyEnvironment(ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, object>, any>): OpenAIProxyConfig {
  const openAIKey = ctx.request.headers.authorization?.replace('Bearer ', '')
  const openAIProxy = ctx.request.headers['Openai-Proxy'] as string
  const { basePath, apiKey } = useOpenAIProxy()

  const config: OpenAIProxyConfig = {
    basePath: openAIProxy ?? basePath,
    apiKey: (openAIKey && openAIKey.startsWith('sk-')) ? openAIKey : apiKey!,
  }

  return config
}

export function isEmptyKey(ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, object>, any>) {
  const openAIKey = ctx.request.headers.authorization?.replace('Bearer ', '')
  const { apiKey } = useOpenAIProxy()
  return !(openAIKey && openAIKey?.startsWith('sk-')) || !apiKey
}
