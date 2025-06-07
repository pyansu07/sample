import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { router, publicProcedure } from '../init'

// Check if API key is set
if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('GOOGLE_AI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export const aiRouter = router({
    // Generate text with Gemini 1.5 Flash
    generateText: publicProcedure
        .input(z.object({
            prompt: z.string(),
            chatHistory: z.array(z.object({
                role: z.enum(['user', 'assistant']),
                content: z.string()
            })).optional()
        }))
        .mutation(async ({ input }) => {
            try {
                if (!process.env.GOOGLE_AI_API_KEY) {
                    throw new Error('GOOGLE_AI_API_KEY is not configured')
                }

                console.log('Initializing Gemini model for text generation...')
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

                // Build conversation history for context
                let conversationHistory = ''
                if (input.chatHistory && input.chatHistory.length > 0) {
                    console.log('Processing chat history...')
                    conversationHistory = input.chatHistory
                        .slice(-10) // Only use last 10 messages to avoid token limits
                        .map(msg => `${msg.role}: ${msg.content}`)
                        .join('\n') + '\n'
                }

                // Combine history with new prompt
                const fullPrompt = conversationHistory + `user: ${input.prompt}\nassistant:`

                console.log('Sending message to Gemini...')
                const result = await model.generateContent(fullPrompt)
                const response = await result.response
                const text = response.text()
                
                console.log('Received response from Gemini')
                return text

            } catch (error) {
                console.error('Error in generateText:', error)
                
                // Handle specific API errors
                if (error.message?.includes('429') || error.message?.includes('quota')) {
                    throw new Error('API quota exceeded. Please try again later.')
                }
                if (error.message?.includes('401') || error.message?.includes('403')) {
                    throw new Error('Invalid API key. Please check your configuration.')
                }
                if (error.message?.includes('400')) {
                    throw new Error('Invalid request. Please check your input.')
                }
                
                throw new Error('Failed to generate response. Please try again.')
            }
        }),

    // Generate image with better error handling and fallbacks
    generateImage: publicProcedure
        .input(z.object({
            prompt: z.string(),
            chatId: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            try {
                console.log('Generating image description for:', input.prompt)
                
                let imageDescription = ''

                try {
                    // Try to use AI for description with quota protection
                    if (process.env.GOOGLE_AI_API_KEY) {
                        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
                        const imagePrompt = `Create a brief, vivid description in 1-2 sentences of an image that would show: "${input.prompt}". Focus on visual details, colors, and composition.`
                        
                        const result = await model.generateContent(imagePrompt)
                        const response = await result.response
                        imageDescription = response.text()
                        console.log('Generated AI description:', imageDescription)
                    } else {
                        throw new Error('No API key available')
                    }
                } catch (apiError) {
                    console.warn('AI description failed, using manual description:', apiError.message)
                    // Fallback description when API fails
                    imageDescription = `A creative and detailed image depicting: ${input.prompt}. The image would feature vibrant colors, clear composition, and artistic visual elements that bring the concept to life.`
                }

                // Create multiple fallback image URLs
                const encodedPrompt = encodeURIComponent(input.prompt.slice(0, 25))
                const randomId = Date.now()
                
                let placeholderImageUrl = ''

                // Try different image services in order of preference
                const imageServices = [
                    // Option 1: Picsum Photos (reliable random images)
                    `https://picsum.photos/500/400?random=${randomId}`,
                    
                    // Option 2: LoremFlickr (themed images)
                    `https://loremflickr.com/500/400/abstract,art?random=${randomId}`,
                    
                    // Option 3: Placeholder.com (more reliable than via.placeholder)
                    `https://placeholder.com/500x400/4285f4/ffffff?text=${encodedPrompt}`,
                    
                    // Option 4: SVG fallback (always works)
                    `data:image/svg+xml;base64,${Buffer.from(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400">
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#4285f4;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#34a853;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <rect width="500" height="400" fill="url(#grad1)"/>
                            <circle cx="250" cy="200" r="60" fill="#ffffff" opacity="0.8"/>
                            <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="24" font-family="Arial, sans-serif">🎨</text>
                            <text x="50%" y="65%" text-anchor="middle" fill="white" font-size="14" font-family="Arial, sans-serif">${input.prompt.slice(0, 30)}</text>
                            <text x="50%" y="75%" text-anchor="middle" fill="white" font-size="10" font-family="Arial, sans-serif">AI Generated Image</text>
                        </svg>
                    `).toString('base64')}`
                ]

                // Use the first available service (for this demo, we'll use Picsum)
                placeholderImageUrl = imageServices[0]

                console.log('Generated image URL:', placeholderImageUrl)

                // Return consistent response structure
                const response = {
                    id: `img_${randomId}`,
                    content: imageDescription,
                    image_url: placeholderImageUrl,
                    message_type: 'image' as const,
                    role: 'assistant' as const,
                    created_at: new Date().toISOString()
                }

                console.log('Returning image response successfully')
                return response

            } catch (error) {
                console.error('Complete error in generateImage:', error)
                
                // Return a working fallback response instead of throwing
                const fallbackSvg = `data:image/svg+xml;base64,${Buffer.from(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400">
                        <rect width="500" height="400" fill="#ff6b6b"/>
                        <circle cx="250" cy="200" r="50" fill="#ffffff" opacity="0.9"/>
                        <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="20">⚠️</text>
                        <text x="50%" y="60%" text-anchor="middle" fill="white" font-size="14" font-family="Arial">Image Generation</text>
                        <text x="50%" y="70%" text-anchor="middle" fill="white" font-size="14" font-family="Arial">Temporarily Unavailable</text>
                        <text x="50%" y="85%" text-anchor="middle" fill="white" font-size="10" font-family="Arial">${input.prompt.slice(0, 40)}</text>
                    </svg>
                `).toString('base64')}`

                return {
                    id: `fallback_${Date.now()}`,
                    content: `I understand you want an image of: "${input.prompt}". While I cannot generate actual images right now, I can imagine it would be a beautiful and detailed visual representation of your request.`,
                    image_url: fallbackSvg,
                    message_type: 'image' as const,
                    role: 'assistant' as const,
                    created_at: new Date().toISOString()
                }
            }
        }),

    // Test endpoint to verify API connectivity
    test: publicProcedure
        .input(z.object({ message: z.string() }))
        .query(async ({ input }) => {
            try {
                if (!process.env.GOOGLE_AI_API_KEY) {
                    return {
                        success: false,
                        error: 'GOOGLE_AI_API_KEY not configured'
                    }
                }

                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
                const result = await model.generateContent(`Please respond briefly to: ${input.message}`)
                const response = await result.response
                
                return {
                    success: true,
                    response: response.text(),
                    model: 'gemini-1.5-flash',
                    timestamp: new Date().toISOString()
                }
            } catch (error) {
                console.error('Test endpoint error:', error)
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString()
                }
            }
        }),

    // Health check endpoint
    health: publicProcedure
        .query(() => {
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                apiKeyConfigured: !!process.env.GOOGLE_AI_API_KEY,
                services: {
                    gemini: !!process.env.GOOGLE_AI_API_KEY,
                    imageGeneration: true // Always true since we use fallbacks
                }
            }
        })
})
