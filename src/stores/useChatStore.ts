import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export interface Message {
  id: string
  name: string
  avatar: string
  content: string
}
export const useChatStore = defineStore('chatStore', () => {
  const messages = ref([
    {
      id: '1',
      name: 'Mark',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      content: 'Hello! How can I assist you today?',
    },
    {
      id: '2',
      name: 'GPT',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      content: 'I am doing well, thank you. How about you?',
    },
    {
      id: '3',
      name: 'Mark',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      content: 'I am doing great, thanks for asking!',
    },
  ])

  function addMessage(message: Omit<Message, 'id'>) {
    messages.value.push({
      id: uuidv4(),
      ...message,
    })
  }

  function removeMessage(id: string) {
    messages.value = messages.value.filter((message: Message) => message.id !== id)
  }

  return {
    messages,
    addMessage,
    removeMessage,
  }
},
)
