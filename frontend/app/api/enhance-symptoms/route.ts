import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { currentDescription, symptoms, userPrompt } = await request.json();

    const prompt = `Based on the following symptoms: ${symptoms.join(', ')}
Current description: "${currentDescription}"

User request: "${userPrompt}"

Please enhance and improve this symptom description based on the user's request. Keep it concise (maximum 150 words) and focus only on the symptoms mentioned. Return only the enhanced description text, no additional formatting or explanations.`;

    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a medical assistant helping to improve symptom descriptions. Return only the enhanced description text, no additional formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
      stream: true
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance symptom description' },
      { status: 500 }
    );
  }
}