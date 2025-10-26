import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMessagesFromFirebase } from '@/lib/firebase-admin';

const DecisionSchema = z.object({
  decisions: z.array(
    z.object({
      decision: z.string(),
      participants: z.array(z.string()),
      timestamp: z.string().nullable(),
      context: z.string(),
      confidence: z.enum(['high', 'medium', 'low']),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const { conversationId, messageCount = 100 } = await req.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const messages = await getMessagesFromFirebase(conversationId, messageCount);

    if (messages.length === 0) {
      return NextResponse.json({ decisions: [] });
    }

    const conversationText = messages
      .reverse()
      .map(message => `${message.senderUsername}: ${message.text}`)
      .join('\n');

    const prompt = `Identify all decisions made in this conversation.
A decision is a conclusion reached by the group, not just a suggestion.

Look for phrases like: "let's do...", "we agreed...", "decided to...", "going with..."

Conversation:
${conversationText}

Return JSON array with decision, participants, timestamp, context, and confidence level.`;

    const { object } = await generateObject({
      model: openai('gpt-4-turbo'),
      schema: DecisionSchema,
      prompt,
    });

    // Filter out low-confidence decisions
    const filteredDecisions = object.decisions.filter(
      decision => decision.confidence !== 'low'
    );

    return NextResponse.json({
      decisions: filteredDecisions,
      conversationId
    });

  } catch (error) {
    console.error('Decision extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract decisions' },
      { status: 500 }
    );
  }
}

