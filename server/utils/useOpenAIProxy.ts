import dotenv from 'dotenv'

dotenv.config()

export function useOpenAIProxy() {
  return {
    basePath: process.env.OPENAI_PROXY_URL,
    apiKey: process.env.OPENAI_API_KEY,
  }
}
