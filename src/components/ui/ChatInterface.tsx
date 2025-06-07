'use client'

import { useState, useRef, useEffect } from 'react'
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap'
import { trpc } from '@/trpc/client'
import { Message } from '@/types/chat'
import { InputArea } from './InputArea'

interface ChatInterfaceProps {
  chatId: string
  onError: (error: string) => void
}

export function ChatInterface({ chatId, onError }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: chatMessages, isLoading: isLoadingMessages, refetch } = trpc.chat.getMessages.useQuery(
    { chatId },
    {
      onError: (error) => {
        console.error('Error loading messages:', error)
        onError('Failed to load messages')
      }
    }
  )

  const addMessageMutation = trpc.chat.addMessage.useMutation({
    onSuccess: () => {
      // Refetch messages after adding
      refetch()
    },
    onError: (error) => {
      console.error('Error adding message:', error)
      onError('Failed to send message')
      setIsLoading(false)
    }
  })

  const generateResponseMutation = trpc.ai.generateText.useMutation({
    onError: (error) => {
      console.error('Error generating response:', error)
      onError('Failed to generate response')
      setIsLoading(false)
    }
  })

  const generateImageMutation = trpc.ai.generateImage.useMutation({
    onError: (error) => {
      console.error('Error generating image:', error)
      onError('Failed to generate image')
      setIsLoading(false)
    }
  })

  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages)
    }
  }, [chatMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendText = async (message: string) => {
    if (!message.trim() || isLoading) return

    try {
      setIsLoading(true)
      
      // Add user message
      await addMessageMutation.mutateAsync({
        chatId,
        content: message,
        role: 'user',
        message_type: 'text'
      })

      // Prepare chat history for the AI
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Generate AI response
      const response = await generateResponseMutation.mutateAsync({
        prompt: message,
        chatHistory
      })

      // Add AI response
      await addMessageMutation.mutateAsync({
        chatId,
        content: response,
        role: 'assistant',
        message_type: 'text'
      })

    } catch (error) {
      console.error('Error in handleSendText:', error)
      onError('Failed to process message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendImage = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return

    try {
      setIsLoading(true)
      
      // Add user message
      await addMessageMutation.mutateAsync({
        chatId,
        content: prompt,
        role: 'user',
        message_type: 'text'
      })

      // Generate image description
      const result = await generateImageMutation.mutateAsync({
        prompt,
        chatId
      })

      // Add AI response with image
      await addMessageMutation.mutateAsync({
        chatId,
        content: result.content || 'Generated image description',
        role: 'assistant',
        message_type: 'image',
        image_url: result.image_url
      })

    } catch (error) {
      console.error('Error in handleSendImage:', error)
      onError('Failed to generate image')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingMessages) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading messages...</span>
        </Spinner>
      </Container>
    )
  }

  return (
    <Container>
      <div className="messages-container" style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: '1rem' }}>
        {messages.length === 0 && (
          <div className="text-center text-muted mt-5">
            <h5>Start a conversation!</h5>
            <p>Send a message or generate an image to begin</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            style={{
              padding: '1rem',
              margin: '0.5rem 0',
              borderRadius: '0.5rem',
              backgroundColor: message.role === 'user' ? '#007bff' : '#f8f9fa',
              color: message.role === 'user' ? 'white' : '#333',
              maxWidth: '80%',
              marginLeft: message.role === 'user' ? 'auto' : '0',
            }}
          >
            {/* Debug info - remove after testing */}
            {message.message_type === 'image' && (
              <div className="mb-2" style={{ fontSize: '0.8em', opacity: 0.7 }}>
                <strong>Debug:</strong> Type: {message.message_type}, URL: {message.image_url || 'No URL'}
              </div>
            )}
            
            {/* Image display */}
            {message.message_type === 'image' && message.image_url && (
              <div className="mb-2">
                <img
                  src={message.image_url}
                  alt="Generated content"
                  className="img-fluid rounded"
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    minHeight: '150px',
                    backgroundColor: '#e9ecef',
                    border: '1px solid #dee2e6'
                  }}
                  onLoad={() => console.log('Image loaded successfully:', message.image_url)}
                  onError={(e) => {
                    console.error('Image failed to load:', message.image_url)
                    // Show placeholder if image fails
                    e.currentTarget.src = `https://via.placeholder.com/400x300/6c757d/ffffff?text=${encodeURIComponent('Image Not Available')}`
                  }}
                />
              </div>
            )}
            
            {/* Text content */}
            <div>{message.content}</div>
            
            {/* Timestamp */}
            <div style={{ fontSize: '0.75em', opacity: 0.6, marginTop: '0.5rem' }}>
              {new Date(message.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="message assistant-message" style={{
            padding: '1rem',
            margin: '0.5rem 0',
            borderRadius: '0.5rem',
            backgroundColor: '#f8f9fa',
            maxWidth: '80%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Spinner animation="border" size="sm" />
            <span>AI is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <InputArea
        onSendText={handleSendText}
        onSendImage={handleSendImage}
        isLoading={isLoading}
      />
    </Container>
  )
}
