import { streamText, tool } from 'ai';
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
      console.log('[TOOL: getConversationMessages] Called with:', { conversationId, limit });
      const result = await getConversationMessages(conversationId, Math.min(limit ?? 50, 50));
      console.log('[TOOL: getConversationMessages] Returned', result.length, 'messages');
      return result;
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
      console.log('[TOOL: searchMessages] Called with:', { conversationId, startDate, endDate, keyword });
      const result = await searchMessages(conversationId, {
        startDate,
        endDate,
        keyword,
      });
      console.log('[TOOL: searchMessages] Returned', result.length, 'messages');
      return result;
    },
  }),

  extractActionItems: tool({
    description: 'Extract action items and tasks from a list of messages. Identifies messages containing commitments, todos, and assignments. Use this AFTER getting messages with getConversationMessages or searchMessages.',
    inputSchema: z.object({
      messages: z.array(z.record(z.unknown())).describe('Array of message objects to analyze'),
    }),
    execute: async ({ messages }) => {
      console.log('[TOOL: extractActionItems] Called with', messages.length, 'messages');
      // Simplified extraction logic
      const result = messages
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
      console.log('[TOOL: extractActionItems] Extracted', result.length, 'action items');
      return result;
    },
  }),

  categorizeByPerson: tool({
    description: 'Group a list of action items by the person assigned to them. Use this to organize action items after extraction.',
    inputSchema: z.object({
      actionItems: z.array(z.record(z.unknown())).describe('Array of action items to group by assignedTo field'),
    }),
    execute: async ({ actionItems }) => {
      console.log('[TOOL: categorizeByPerson] Called with', actionItems.length, 'items');
      const result = groupBy(actionItems, 'assignedTo');
      console.log('[TOOL: categorizeByPerson] Grouped into', Object.keys(result).length, 'categories');
      return result;
    },
  }),

  generateReport: tool({
    description: 'Format data into a clean, readable markdown report with sections and bullet points. Use this as a final step to present organized information to the user.',
    inputSchema: z.object({
      data: z.record(z.unknown()).describe('Data to format (typically an object with categories as keys and arrays as values)'),
      title: z.string().describe('Title for the report'),
    }),
    execute: async ({ data, title }) => {
      console.log('[TOOL: generateReport] Called with title:', title);
      const result = formatReport(data, title);
      console.log('[TOOL: generateReport] Generated report with', result.length, 'characters');
      return result;
    },
  }),
};

export async function POST(req: Request) {
  try {
    const { userQuery, conversationId } = await req.json();
    
    console.log('[AGENT ROUTE] Request received:', {
      userQuery,
      conversationId,
      timestamp: new Date().toISOString()
    });

    if (!userQuery || !conversationId) {
      console.log('[AGENT ROUTE] Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'userQuery and conversationId are required' }),
        { status: 400 }
      );
    }

    console.log('[AGENT ROUTE] Starting streamText with GPT-4...');

    const result = streamText({
      model: openai('gpt-4-turbo'),
      tools: agentTools,
      system: `You are an AI assistant helping remote teams analyze their conversations. You have access to tools that let you fetch messages, search, extract insights, and generate reports.

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
5. Return the formatted report with context`,
      prompt: `Conversation ID: ${conversationId}\n\nUser request: ${userQuery}`,
    });

    // Stream the response back to the mobile app
    console.log('[AGENT ROUTE] Returning stream response...');
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

