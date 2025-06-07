'use client'

import { useState } from 'react'
import { Form, Button, InputGroup, Dropdown } from 'react-bootstrap'

interface InputAreaProps {
  onSendText: (message: string) => void
  onSendImage: (prompt: string) => void
  isLoading?: boolean
}

export function InputArea({ onSendText, onSendImage, isLoading }: InputAreaProps) {
  const [message, setMessage] = useState('')
  const [inputType, setInputType] = useState<'text' | 'image'>('text')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    if (inputType === 'text') {
      onSendText(message)
    } else {
      onSendImage(message)
    }
    
    setMessage('')
  }

  return (
    <div className="input-container bg-white border-top">
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Dropdown>
            <Dropdown.Toggle 
              variant="outline-secondary" 
              size="sm"
              className="border-end-0"
            >
              {inputType === 'text' ? '💬' : '🎨'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setInputType('text')}>
                💬 Text Message
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setInputType('image')}>
                🎨 Generate Image
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Form.Control
            type="text"
            placeholder={inputType === 'text' ? 'Type a message...' : 'Describe the image you want to generate...'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
            className="chat-input border-start-0"
          />
          
          <Button
            type="submit"
            variant="primary"
            disabled={!message.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? '⏳' : '➤'}
          </Button>
        </InputGroup>
      </Form>
    </div>
  )
}
