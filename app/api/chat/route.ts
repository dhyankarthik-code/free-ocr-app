import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

export async function POST(req: NextRequest) {
    try {
        const { message, sessionId, documentText, chatHistory } = await req.json();

        // 1. Get or Create Session
        const currentSessionId = sessionId || `anon_${Date.now()}`;

        let conversationId = null;

        // Try to store in DB if possible (Lazy Import)
        try {
            const { default: prisma } = await import("@/lib/db");

            // Upsert conversation
            const conversation = await prisma.chatConversation.upsert({
                where: { sessionId: currentSessionId },
                create: {
                    sessionId: currentSessionId,
                    messages: {
                        create: {
                            role: 'user',
                            content: message
                        }
                    }
                },
                update: {
                    messages: {
                        create: {
                            role: 'user',
                            content: message
                        }
                    }
                }
            });
            conversationId = conversation.id;
        } catch (e) {
            console.error("DB Error (Chat):", e);
        }

        const mistralKey = process.env.MISTRAL_API_KEY;
        if (!mistralKey) {
            return NextResponse.json({ error: 'Mistral API key not found' }, { status: 500 });
        }

        const client = new Mistral({ apiKey: mistralKey });

        // Build messages array
        const systemPrompt = `You are 'Infy', the intelligent AI document specialist for Infy Galaxy. 
Your primary goal is to help users analyze, summarize, and understand the documents they upload.

CONTEXT ABOUT THE CURRENT DOCUMENT:
"${documentText || "No document has been uploaded yet."}"

GUIDELINES:
1. Be professional, helpful, and concise.
2. If the user asks about the document, use the context provided above.
3. If they ask general questions about OCR or Infy Galaxy, be informative.
4. Keep your responses formatted in clean markdown.
5. If the document text looks like gibberish or poor OCR, politely mention that the quality might be low.`;

        const messagesForAI: any[] = [
            { role: "system", content: systemPrompt }
        ];

        // Add history if present
        if (chatHistory && Array.isArray(chatHistory)) {
            chatHistory.forEach((msg: any) => {
                messagesForAI.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });
        }

        // Add current message
        messagesForAI.push({ role: "user", content: message });

        // Generate response
        const completion = await client.chat.complete({
            model: "mistral-large-latest",
            messages: messagesForAI,
            temperature: 0.7,
        });

        const reply = completion.choices?.[0]?.message?.content || "I'm having trouble thinking right now. Please try again.";

        // Store Assistant Reply in DB
        if (conversationId) {
            try {
                const { default: prisma } = await import("@/lib/db");
                await prisma.chatMessage.create({
                    data: {
                        conversationId: conversationId,
                        role: 'assistant',
                        content: reply
                    }
                })
            } catch (e) {
                console.error("DB Error (Save Reply):", e);
            }
        }

        return NextResponse.json({
            reply,
            sessionId: currentSessionId
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
    }
}
