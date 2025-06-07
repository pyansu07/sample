import { z } from 'zod'
import { router, publicProcedure } from '../init'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage
const chats: Record<string, { id: string; title: string; created_at: string; updated_at: string }> = {}
const messages: Record<string, { id: string; chat_id: string; content: string; role: 'user' | 'assistant'; message_type: 'text' | 'image'; image_url?: string; created_at: string }[]> = {}

export const chatRouter = router({
    // Get all chats
    getChats: publicProcedure
        .input(z.undefined().optional())
        .query(async () => {
            try {
                return Object.values(chats).sort((a, b) =>
                    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                )
            } catch (error) {
                console.error('Error getting chats:', error)
                throw new Error('Failed to get chats')
            }
        }),

    // Create new chat
    createChat: publicProcedure
        .input(z.object({ title: z.string().optional() }).optional())
        .mutation(async ({ input }) => {
            try {
                const now = new Date().toISOString()
                const chatId = uuidv4()
                const chat = {
                    id: chatId,
                    title: input?.title || 'New Chat',
                    created_at: now,
                    updated_at: now
                }
                chats[chatId] = chat
                messages[chatId] = []
                return chat
            } catch (error) {
                console.error('Error creating chat:', error)
                throw new Error('Failed to create chat')
            }
        }),

    // Get messages for a chat
    getMessages: publicProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ input }) => {
            try {
                if (!messages[input.chatId]) {
                    messages[input.chatId] = []
                }
                return messages[input.chatId].sort((a, b) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                )
            } catch (error) {
                console.error('Error getting messages:', error)
                throw new Error('Failed to get messages')
            }
        }),

    // Add message to chat
    addMessage: publicProcedure
        .input(z.object({
            chatId: z.string(),
            content: z.string(),
            role: z.enum(['user', 'assistant']),
            message_type: z.enum(['text', 'image']).default('text'),
            image_url: z.string().optional()
        }))
        .mutation(async ({ input }) => {
            try {
                if (!messages[input.chatId]) {
                    messages[input.chatId] = []
                }

                const message = {
                    id: uuidv4(),
                    chat_id: input.chatId,
                    content: input.content,
                    role: input.role,
                    message_type: input.message_type,
                    image_url: input.image_url,
                    created_at: new Date().toISOString()
                }

                messages[input.chatId].push(message)

                if (chats[input.chatId]) {
                    chats[input.chatId].updated_at = message.created_at
                }

                return message
            } catch (error) {
                console.error('Error adding message:', error)
                throw new Error('Failed to add message')
            }
        }),

    // Delete chat
    deleteChat: publicProcedure
        .input(z.object({ chatId: z.string() }))
        .mutation(async ({ input }) => {
            try {
                delete chats[input.chatId]
                delete messages[input.chatId]
                return { success: true }
            } catch (error) {
                console.error('Error deleting chat:', error)
                throw new Error('Failed to delete chat')
            }
        })
})
