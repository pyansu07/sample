'use client'

import { Navbar, Nav, Button, Offcanvas, ListGroup } from 'react-bootstrap'
import { useState } from 'react'
import { trpc } from '@/trpc/client'

interface MobileNavbarProps {
  currentChatId?: string
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
}

export function MobileNavbar({ currentChatId, onChatSelect, onNewChat }: MobileNavbarProps) {
  const [show, setShow] = useState(false)
  const { data: chats } = trpc.chat.getChats.useQuery()

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  return (
    <>
      <Navbar bg="primary" variant="dark" className="px-3">
        <Button
          variant="outline-light"
          onClick={handleShow}
          className="me-3"
        >
          ☰
        </Button>
        <Navbar.Brand>ChatGPT Clone</Navbar.Brand>
      </Navbar>

      <Offcanvas show={show} onHide={handleClose} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Chats</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Button
            variant="primary"
            className="w-100 mb-3"
            onClick={() => {
              onNewChat()
              handleClose()
            }}
          >
            New Chat
          </Button>
          <ListGroup>
            {chats?.map((chat) => (
              <ListGroup.Item
                key={chat.id}
                action
                active={chat.id === currentChatId}
                onClick={() => {
                  onChatSelect(chat.id)
                  handleClose()
                }}
              >
                {chat.title}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}