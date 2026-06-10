import type { MessageOptions, MessageReactive } from 'naive-ui'
import { message } from './discreteApi'

type RequiredMessageReactive = Required<MessageReactive>
type ContentType = RequiredMessageReactive['content']

export function messageError(content: ContentType, options?: MessageOptions) {
  return message.error(content, options)
}

export function messageInfo(content: ContentType, options?: MessageOptions) {
  return message.info(content, options)
}

export function messageSuccess(content: ContentType, options?: MessageOptions) {
  return message.success(content, options)
}
