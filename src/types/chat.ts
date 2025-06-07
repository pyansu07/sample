export interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  content: string
  role: 'user' | 'assistant'
  message_type: 'text' | 'image'
  image_url?: string
  created_at: string
}
