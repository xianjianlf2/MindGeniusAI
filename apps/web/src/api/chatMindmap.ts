import { createChatWindowOptions, fetchChat } from '.'

export function chatWithMindMapRequest(chatWindowId: string, topic: string) {
  return fetchChat(createChatWindowOptions('/api/chatMindMap', chatWindowId, { topic }))
}
