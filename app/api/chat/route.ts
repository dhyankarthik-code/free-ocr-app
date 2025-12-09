import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        const { message, documentText, chatHistory } = await request.json()

        if (!message || !documentText) {
            return NextResponse.json(
                { error: 'Message and document text are required' },
                { status: 400 }
            )
        }

        // Build conversation history
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            {
                role: 'system',
                content: `You are "Infy Galaxy Support", an extremely professional and friendly AI assistant.
Your goal is to help users with OCR issues, tool usage, or general inquiries about the platform.

**CRITICAL RULES:**
1. **BE FRIENDLY & PROFESSIONAL**: Use a warm, helpful tone.
2. **NO HALLUCINATIONS**: Strictly do NOT invent features or answers. If you are 100% sure, answer. If you are unsure, say: "I'm not completely sure about that, but I have noted this query and will notify our support team to help you directly."
3. **CONTEXT**: The user is viewing a document with the following extracted text:
"${documentText || '(No text extracted yet)'}"

Use this text to answer questions if asked about the document. Otherwise, help with general support.`
            },
            ...(chatHistory || []),
            {
                role: 'user',
                content: message
            }
        ]

        // Log to Google Sheet (Fire and forget, don't await blocking response)
        const sheetUrl = process.env.GOOGLE_SHEET_CHAT_URL;
        if (sheetUrl) {
            fetch(sheetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    userMessage: message,
                    documentContext: documentText ? 'Present' : 'Empty',
                    role: 'User Query'
                })
            }).catch(err => console.error('Failed to log to sheet:', err));
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.5, // Lower temperature for more deterministic/professional answers
            max_tokens: 300,
        })

        const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

        return NextResponse.json({ reply })
    } catch (error: any) {
        console.error('Chat API error:', {
            name: error.name,
            message: error.message,
            code: error.code || 'unknown',
            type: error.type || 'unknown',
            response: error.response?.data || 'no response data'
        });
        return NextResponse.json(
            { error: 'Failed to process chat message', details: error.message },
            { status: 500 }
        )
    }
}
