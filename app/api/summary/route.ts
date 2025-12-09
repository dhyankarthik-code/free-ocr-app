import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text concisely. Format your summary with:\n**Main Topic:**\n(brief description)\n\n**Key Points:**\n- Point 1\n- Point 2\n- Point 3"
        },
        { role: "user", content: `Summarize this text:\n\n${text}` }
      ],
      max_tokens: 300,
    });

    const summary = completion.choices[0]?.message?.content || '';
    return NextResponse.json({ summary });

  } catch (error: any) {
    console.error('Summary generation failed:', {
      name: error.name,
      message: error.message,
      code: error.code || 'unknown',
      type: error.type || 'unknown',
      response: error.response?.data || 'no response data'
    });
    return NextResponse.json({ error: error.message || 'Failed to generate summary' }, { status: 500 });
  }
}
