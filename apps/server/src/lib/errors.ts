export class MissingApiKeyError extends Error {
  constructor(provider: string) {
    super(`No API key configured for provider "${provider}"`)
    this.name = 'MissingApiKeyError'
  }
}

/** 把底层错误归类成对用户友好的提示，不向客户端泄漏堆栈 */
export function toUserMessage(error: unknown): string {
  if (error instanceof MissingApiKeyError)
    return 'Please check your key'

  const message = error instanceof Error ? error.message : String(error)
  const status = (error as { statusCode?: number; status?: number })?.statusCode
    ?? (error as { status?: number })?.status

  if (status === 401 || /api key|unauthorized|authentication/i.test(message))
    return 'Please check your key'
  if (status === 429 || /rate limit/i.test(message))
    return 'Rate limit exceeded, please try again later'
  if (/timeout|timed out|aborted/i.test(message))
    return 'Request timed out, please try again'
  return 'Something went wrong, please try again'
}
