import { streamText, tool, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { searchMessages, groupBy, formatReport, getConversationMessages } from '@/lib/agent-tools';

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
    const { userQuery, conversationId } = await req.json();

    if (!userQuery || !conversationId) {
      return new Response(
        JSON.stringify({ error: 'userQuery and conversationId are required' }),
        { status: 400 }
      );
    }

    const systemPrompt = `You are an AI assistant helping remote teams analyze their conversations. You have access to tools that let you fetch messages, search, extract insights, and generate reports.

RESPONSE FRAMEWORK:
1. Understand the request - Identify what information the user needs
2. Gather necessary context - Use appropriate tools to fetch relevant data
3. Process and analyze - Extract insights from the data
4. Provide clear response - Deliver natural, conversational answers (not raw tool output)

GUIDELINES:
- Always call getConversationMessages first for summarization, analysis, or general queries
- Use searchMessages only when the user specifies a date range or keyword
- For vague requests, start broad with getConversationMessages rather than making assumptions
- Chain tools together - use output from one tool as input to another
- When no relevant data is found, acknowledge it and suggest alternative approaches
- Keep responses concise and actionable
- If the conversation has fewer than 50 messages, you'll get all of them
- Interpret tool results in context of the user's original question
- After calling tools, ALWAYS generate a final text response - never leave the response empty

FEW-SHOT EXAMPLES:

Example 1 - Simple Query:
User: "Summarize this conversation"
Approach:
1. Call getConversationMessages(conversationId, 50)
2. Read through messages and identify key themes
3. Respond with natural summary highlighting main topics and outcomes

Example 2 - Complex Multi-Step Query:
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
      stopWhen: [stepCountIs(5)],
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

