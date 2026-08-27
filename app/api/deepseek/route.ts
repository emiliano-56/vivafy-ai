import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    
    const apiKey = "sk-b6ab7779c93441f8ae28dfbf0a9895d3";

if (!apiKey) {
  return NextResponse.json(
    { error: "API key is missing" },
    { status: 500 }
  );
}

    const systemPrompt = `You are a helpful AI assistant. 
Always respond in English (en).
Format your responses with proper structure:
- Use numbered lists (1., 2., 3., etc.) when providing multiple points or steps
- Use bullet points for items in a list
- Use clear headers and sections when appropriate
IMPORTANT: Do NOT use any markdown syntax like **, ##, ###, -, *, \`, etc.
Write your responses in plain text with line breaks for clarity.
Keep your responses clear, organized, and easy to read.`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[v0] DeepSeek API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from DeepSeek API' },
        { status: response.status }
      );
    }

    // Return the streaming response
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[v0] API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
