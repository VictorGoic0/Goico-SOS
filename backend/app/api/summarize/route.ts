import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';
import { getMessagesFromFirebase } from '@/lib/firebase-admin';

// Type for message data from Firestore
interface Message {
  messageId: string;
  senderId: string;
  senderUsername: string;
  text: string;
  timestamp: unknown;
  status?: string;
  imageURL?: string;
}

export async function POST(req: Request) {
  try {
    const { conversationId, messageCount = 50 } = await req.json();

    // Validate input
    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Fetch messages from Firebase (server-side)
    const messages = await getMessagesFromFirebase(conversationId, messageCount) as Message[];

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages found in conversation' },
        { status: 404 }
      );
    }

    // Create prompt
    const conversationText = messages
      .reverse() // Chronological order
      .map(m => `${m.senderUsername}: ${m.text}`)
      .join('\n');

    const prompt = `Summarize this conversation thread in 3-4 bullet points. Focus on key topics, decisions, and action items:

${conversationText}

Provide a concise summary with:
- Main topics discussed
- Key decisions made
- Outstanding questions`;

    // Generate summary with OpenAI
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
    });

    return NextResponse.json({
      summary: text,
      messageCount: messages.length,
      conversationId
    });

  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

