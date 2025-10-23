import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMessagesFromFirebase } from '@/lib/firebase-admin';

// Define Zod schema for action items
const ActionItemSchema = z.object({
  items: z.array(
    z.object({
      task: z.string(),
      assignedTo: z.string().nullable(),
      deadline: z.string().nullable(),
      status: z.enum(['pending', 'completed']),
      context: z.string(),
    })
  ),
});

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
    const { conversationId, messageCount = 100 } = await req.json();

    // Validate input
    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Fetch messages from Firebase
    const messages = await getMessagesFromFirebase(conversationId, messageCount) as Message[];

    if (messages.length === 0) {
      return NextResponse.json({ actionItems: [] });
    }

    // Format conversation text
    const conversationText = messages
      .reverse()
      .map(m => `${m.senderUsername}: ${m.text}`)
      .join('\n');

    const prompt = `Extract all action items from this conversation. Format as a list with:
- Task description
- Assigned to (if mentioned)
- Deadline (if mentioned)
- Status (pending/completed based on context)

Conversation:
${conversationText}`;

    // Use generateObject for structured output
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: ActionItemSchema,
      prompt,
    });

    return NextResponse.json({
      actionItems: object.items,
      conversationId
    });

  } catch (error) {
    console.error('Action extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract action items' },
      { status: 500 }
    );
  }
}

