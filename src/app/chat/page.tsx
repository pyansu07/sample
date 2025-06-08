'use client'

import { useState } from 'react'
import { Container, Row, Col, Button, Alert } from 'react-bootstrap'
import { trpc } from '@/trpc/client'
import { ChatInterface } from '@/components/ui/ChatInterface'

interface Chat {
  id: string
}

export default function ChatPage() {
  const [error, setError] = useState<string | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  const { isLoading: isLoadingChats, error: chatsError } = trpc.chat.getChats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    onError: (error: Error) => {
      console.error('Error loading chats:', error)
      setError('Failed to load chats')
    }
  })

  const createChatMutation = trpc.chat.createChat.useMutation({
    onSuccess: (newChat: Chat) => {
      setSelectedChatId(newChat.id)
      setError(null)
    },
    onError: (error: Error) => {
      console.error('Error creating chat:', error)
      setError('Failed to create new chat')
    }
  })

  const handleNewChat = async () => {
    try {
      setError(null)
      await createChatMutation.mutateAsync({})
    } catch (error) {
      console.error('Error in handleNewChat:', error)
      setError('Failed to create new chat')
    }
  }

  if (isLoadingChats) {
    return (
      <Container className="py-5">
        <div className="text-center">Loading...</div>
      </Container>
    )
  }

  if (chatsError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Error loading chats: {chatsError.message}
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <Button
            variant="primary"
            onClick={handleNewChat}
            disabled={createChatMutation.isLoading}
          >
            {createChatMutation.isLoading ? 'Creating...' : 'Start Chatting'}
          </Button>
        </Col>
      </Row>

      {selectedChatId && (
        <ChatInterface
          chatId={selectedChatId}
          onError={(error) => setError(error)}
        />
      )}
    </Container>
  )
}
