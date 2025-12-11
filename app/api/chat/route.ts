import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        const { message, documentText, chatHistory, sessionId } = await request.json()

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            )
        }

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            )
        }

        const { default: prisma } = await import("@/lib/db")

        // Find or create conversation
        let conversation = await prisma.chatConversation.findUnique({
            where: { sessionId }
        })

        if (!conversation) {
            conversation = await prisma.chatConversation.create({
                data: { sessionId }
            })
        }

        // Store user message
        await prisma.chatMessage.create({
            data: {
                conversationId: conversation.id,
                role: 'user',
                content: message
            }
        })

        // Build conversation history for AI
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            {
                role: 'system',
                content: `You are "Infy Galaxy Support", an extremely professional, friendly, and experienced AI customer support assistant.

**YOUR PERSONALITY:**
- Warm, helpful, and patient
- Professional but not robotic
- Empathetic and understanding

**CRITICAL RULES:**
1. **BE HELPFUL**: Answer questions about OCR, the platform, file uploads, pricing (it's FREE!), and general tech support.
2. **NO HALLUCINATIONS**: If you're unsure, say: "I'm not 100% sure about that specific detail, but I've noted your query and will have our support team reach out to you directly!"
3. **ESCALATE GRACEFULLY**: For complex issues you can't handle, say: "This sounds like something our human support team should look into. I'll make sure they reach out to you soon!"
4. **BE CONCISE**: Keep responses short and actionable (2-3 sentences max).

**CONTEXT:** The user may be viewing a document. Document text: "${documentText || '(No document uploaded yet)'}"`
            },
            ...(chatHistory || []),
            {
                role: 'user',
                content: message
            }
        ]

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.5,
            max_tokens: 200,
        })

        const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

        // Store bot response
        await prisma.chatMessage.create({
            data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: reply
            }
        })

        return NextResponse.json({ reply, conversationId: conversation.id })
    } catch (error: any) {
        console.error('Chat API error:', error.message)
        return NextResponse.json(
            { error: 'Failed to process chat message', details: error.message },
            { status: 500 }
        )
    }
}
