'use client'

import { Card } from 'react-bootstrap'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  message_type: 'text' | 'image'
  image_url?: string
  created_at: string
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'} mb-3`}>
      <Card
        className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'}`}
        style={{ maxWidth: '85%' }}
      >
        <Card.Body className="p-3">
          {message.message_type === 'image' && message.image_url && (
            <div className="mb-2 position-relative" style={{ width: '100%', height: '300px' }}>
              <Image
                src={message.image_url}
                alt="Generated content"
                fill
                className="rounded"
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          <div>{message.content}</div>
          <small className="text-muted d-block mt-1">
            {new Date(message.created_at).toLocaleTimeString()}
          </small>
        </Card.Body>
      </Card>
    </div>
  )
}
