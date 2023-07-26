export interface OpenAIProxyConfig {
  basePath: string
  apiKey: string
}
export interface MessageHandler {
  messageSend: (arg0: string) => void
  messageDone: any
  messageError: (arg0: any) => void
}
