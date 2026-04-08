import { streamText, tool, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { buildAgentRetrievalContext } from '@/lib/agent-retrieval-context';
import { searchMessages, groupBy, formatReport, getConversationMessages } from '@/lib/agent-tools';
import { authenticate } from '@/lib/auth';

// Define tools the agent can use
const agentTools = {
  getConversationMessages: tool({
    description: 'Fetch recent messages from a conversation. This is the PRIMARY tool for getting conversation context. Use this FIRST for summarization, decision extraction, or general analysis tasks. Returns up to 50 most recent messages in chronological order.',
    inputSchema: z.object({
      conversationId: z.string().describe('The conversation ID to fetch messages from'),
      limit: z.number().optional().describe('Number of messages to fetch (max 50, defaults to 50 if not provided)'),
    }),
    execute: async ({ conversationId, limit }) => {
      return await getConversationMessages(conversationId, Math.min(limit ?? 50, 50));
    },
  }),

  retrieveRelevantMessages: tool({
    description:
      'Semantic retrieval: finds up to 5 messages most relevant to a natural-language query (vector search over indexed messages), plus merges in the most recent messages from the database that may not be indexed yet. Use when the user asks about specific topics, themes, people, or decisions that may appear anywhere in the thread—not only in the last few dozen messages. Pass the same conversationId as in the prompt. You can call this multiple times with different queries in one turn.',
    inputSchema: z.object({
      conversationId: z.string().describe('The conversation ID (must match the active chat)'),
      query: z.string().describe('What to search for in meaning (e.g. "budget and deadlines", "what Sarah agreed to")'),
    }),
    execute: async ({ conversationId, query }) => {
      return await buildAgentRetrievalContext(conversationId, query);
    },
  }),

  searchMessages: tool({
    description: 'Search for specific messages using date ranges or keywords. Use this when the user asks for messages from a specific time period or containing specific terms. For general conversation access, use getConversationMessages instead.',
    inputSchema: z.object({
      conversationId: z.string().describe('The conversation ID to search within'),
      startDate: z.string().optional().describe('Start date in ISO format (e.g., 2024-01-01)'),
      endDate: z.string().optional().describe('End date in ISO format (e.g., 2024-01-31)'),
      keyword: z.string().optional().describe('Keyword to search for in message text'),
    }),
    execute: async ({ conversationId, startDate, endDate, keyword }) => {
      return await searchMessages(conversationId, {
        startDate,
        endDate,
        keyword,
      });
    },
  }),

  extractActionItems: tool({
    description: 'Extract action items and tasks from a list of messages. Identifies messages containing commitments, todos, and assignments. Use this AFTER getting messages with getConversationMessages or searchMessages.',
    inputSchema: z.object({
      messages: z.array(z.record(z.unknown())).describe('Array of message objects to analyze'),
    }),
    execute: async ({ messages }) => {
      return messages
        .filter((message: any) =>
          message.text.includes('will') ||
          message.text.includes('todo') ||
          message.text.includes('task')
        )
        .map((message: any) => ({
          task: message.text,
          assignedTo: message.senderUsername,
          status: 'pending',
        }));
    },
  }),

  categorizeByPerson: tool({
    description: 'Group a list of action items by the person assigned to them. Use this to organize action items after extraction.',
    inputSchema: z.object({
      actionItems: z.array(z.record(z.unknown())).describe('Array of action items to group by assignedTo field'),
    }),
    execute: async ({ actionItems }) => {
      return groupBy(actionItems, 'assignedTo');
    },
  }),

  generateReport: tool({
    description: 'Format data into a clean, readable markdown report with sections and bullet points. Use this as a final step to present organized information to the user.',
    inputSchema: z.object({
      data: z.record(z.unknown()).describe('Data to format (typically an object with categories as keys and arrays as values)'),
      title: z.string().describe('Title for the report'),
    }),
    execute: async ({ data, title }) => {
      return formatReport(data, title);
    },
  }),
};

export async function POST(req: Request) {
  try {
    try {
      await authenticate(req);
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }

    const { userQuery, conversationId } = await req.json();

    if (!userQuery || !conversationId) {
      return new Response(
        JSON.stringify({ error: 'userQuery and conversationId are required' }),
        { status: 400 }
      );
    }

    const systemPrompt = `You are an AI assistant helping remote teams analyze their conversations. You have access to tools that let you fetch messages, run semantic retrieval (vector search), search by date/keyword, extract insights, and generate reports.

RESPONSE FRAMEWORK:
1. Understand the request - Identify what information the user needs
2. Gather necessary context - Use appropriate tools to fetch relevant data
3. Process and analyze - Extract insights from the data
4. Provide clear response - Deliver natural, conversational answers (not raw tool output)

GUIDELINES:
- For broad summaries or "what happened recently", call getConversationMessages first (up to 50 messages in chronological order)
- For questions about specific topics, themes, people, or decisions that might appear anywhere in the thread, use retrieveRelevantMessages with a clear natural-language query. You may call it multiple times with different queries in one turn
- retrieveRelevantMessages merges semantic hits with the latest messages from the database so very new messages are not missed even if not yet in the vector index
- Use searchMessages only when the user specifies a date range or keyword filter (not for general semantic meaning)
- Chain tools together - use output from one tool as input to another
- When no relevant data is found, acknowledge it and suggest alternative approaches
- Keep responses concise and actionable
- If the conversation has fewer than 50 messages, you'll get all of them from getConversationMessages
- Interpret tool results in context of the user's original question
- After calling tools, ALWAYS generate a final text response - never leave the response empty

FEW-SHOT EXAMPLES:

Example 1 - Simple Query:
User: "Summarize this conversation"
Approach:
1. Call getConversationMessages(conversationId, 50)
2. Read through messages and identify key themes
3. Respond with natural summary highlighting main topics and outcomes

Example 2 - Topic-specific:
User: "What did we decide about the launch date?"
Approach:
1. Call retrieveRelevantMessages(conversationId, "launch date decisions and agreements")
2. Optionally call getConversationMessages if you need more surrounding context
3. Answer from the retrieved lines

Example 3 - Complex Multi-Step Query:
User: "Show me action items grouped by person"
Approach:
1. Call getConversationMessages(conversationId, 50)
2. Call extractActionItems(messages)
3. Call categorizeByPerson(actionItems)
4. Call generateReport(categorizedData, "Action Items by Person")
5. Return the formatted report with context`;

    const result = streamText({
      model: openai('gpt-4o-mini'),
      tools: agentTools,
      system: systemPrompt,
      prompt: `Conversation ID: ${conversationId}\n\nUser request: ${userQuery}`,
      stopWhen: [stepCountIs(10)],
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('[AGENT ROUTE] Error occurred:', error);
    console.error('[AGENT ROUTE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ error: 'Agent failed to process request' }),
      { status: 500 }
    );
  }
}

