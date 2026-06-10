import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type ProviderName = 'openai' | 'anthropic' | 'deepseek'

export const config = {
  port: Number(process.env.PORT ?? 3000),
  uploadDir: path.resolve(__dirname, '../uploads'),
  defaultProvider: (process.env.LLM_PROVIDER ?? 'openai') as ProviderName,
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_PROXY_URL,
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: process.env.ANTHROPIC_BASE_URL,
      model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL,
      model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
    },
  },
  embedding: {
    model: process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small',
  },
} as const
