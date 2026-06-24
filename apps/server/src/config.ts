import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type ProviderName = 'openai' | 'anthropic' | 'deepseek' | 'moonshot'

export const config = {
  port: Number(process.env.PORT ?? 3000),
  uploadDir: path.resolve(__dirname, '../uploads'),
  // 设置后，server 直接托管已构建的 web 产物（单进程一体化部署）。
  // 相对路径，相对于 server 启动时的工作目录（见 serveStatic 约束）。
  webDir: process.env.WEB_DIR,
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
    // Kimi / Moonshot —— OpenAI 协议兼容，走 createOpenAI + baseURL
    moonshot: {
      apiKey: process.env.MOONSHOT_API_KEY,
      baseURL: process.env.MOONSHOT_BASE_URL ?? 'https://api.moonshot.cn/v1',
      model: process.env.MOONSHOT_MODEL ?? 'moonshot-v1-8k',
    },
  },
  // RAG 向量化独立配置：chat 走 Kimi/DeepSeek（无 embeddings 接口）时，
  // 仍可让检索指向一个真正的 OpenAI 兼容 embeddings 端点；缺省回落到 OpenAI 的 key/网关。
  embedding: {
    model: process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small',
    apiKey: process.env.EMBEDDING_API_KEY ?? process.env.OPENAI_API_KEY,
    baseURL: process.env.EMBEDDING_BASE_URL ?? process.env.OPENAI_PROXY_URL,
  },
  // 上传/索引护栏：保护免费托管（内存/磁盘）不被大文件或无限累积拖垮
  upload: {
    disabled: process.env.DISABLE_UPLOAD === 'true',
    maxBytes: Number(process.env.MAX_UPLOAD_MB ?? 10) * 1024 * 1024,
  },
  rag: {
    maxIndexedDocs: Number(process.env.MAX_INDEXED_DOCS ?? 20),
    maxChunksPerDoc: Number(process.env.MAX_CHUNKS_PER_DOC ?? 200),
  },
} as const
