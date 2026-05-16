import { generateObject } from 'ai';
import { openai } from '@/lib/openai-provider';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { firebaseAdmin } from '@/lib/firebase/firebase-admin';
import { auth } from '@/lib/auth/auth';

// Define Zod schema for action items
const ActionItemSchema = z.object({
  items: z.array(
    z.object({
      task: z.string(),
      assignedTo: z.string().nullable(),
      deadline: z.string().nullable(),
      status: z.enum(['pending', 'completed']),
      context: z.string().optional().default(''), // Optional with empty string default
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

export async function POST(request: Request) {
  try {
    try {
      await auth.authenticate(request);
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }

    const { conversationId, messageCount = 100 } = await request.json();

    // Validate input
    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Fetch messages from Firebase
    const messages = (await firebaseAdmin.getMessagesFromConversation(
      conversationId,
      messageCount
    )) as Message[];

    if (messages.length === 0) {
      return NextResponse.json({ actionItems: [] });
    }

    // Format conversation text
    const conversationText = messages
      .reverse()
      .map(message => `${message.senderUsername}: ${message.text}`)
      .join('\n');

    const prompt = `Extract all action items from this conversation. Format as a list with:
- Task description (required)
- Assigned to (if mentioned, otherwise null)
- Deadline (if mentioned, otherwise null)
- Status (pending/completed based on context)
- Context (optional - brief context about where this was mentioned)

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

