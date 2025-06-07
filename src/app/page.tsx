'use client'

import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <Container className="min-vh-100 d-flex align-items-center">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="text-center shadow">
            <Card.Body className="p-5">
              <h1 className="display-4 mb-4">🤖</h1>
              <h2 className="mb-4">Welcome to ChatGPT Clone</h2>
              <p className="lead mb-4">
                Experience AI-powered conversations with text generation and image creation capabilities.
              </p>
              <div className="d-grid gap-2">
                <Button
                  onClick={() => router.push('/chat')}
                  size="lg"
                  variant="primary"
                >
                  Get Started
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
