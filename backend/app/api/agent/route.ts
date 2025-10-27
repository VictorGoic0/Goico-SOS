import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { searchMessages, groupBy, formatReport, getConversationMessages } from '@/lib/agent-tools';

// Define tools the agent can use
const agentTools = {
  getConversationMessages: tool({
    description: 'Fetch recent messages from a conversation. This is the PRIMARY tool for getting conversation context. Use this FIRST for summarization, decision extraction, or general analysis tasks. Returns up to 50 most recent messages in chronological order.',
    parameters: z.object({
      conversationId: z.string(),
      limit: z.number().optional().default(50).describe('Number of messages to fetch (max 50)'),
    }),
    execute: async ({ conversationId, limit }) => {
      const conversationIdStr: string = conversationId;
      const limitNum: number = Math.min(limit || 50, 50);
      return await getConversationMessages(conversationIdStr, limitNum);
    },
  } as any),

  searchMessages: tool({
    description: 'Search for specific messages using date ranges or keywords. Use this when the user asks for messages from a specific time period or containing specific terms. For general conversation access, use getConversationMessages instead.',
    parameters: z.object({
      conversationId: z.string(),
      startDate: z.string().optional().describe('Start date in ISO format (e.g., 2024-01-01)'),
      endDate: z.string().optional().describe('End date in ISO format (e.g., 2024-01-31)'),
      keyword: z.string().optional().describe('Keyword to search for in message text'),
    }),
    execute: async ({ conversationId, startDate, endDate, keyword }) => {
      const conversationIdStr: string = conversationId;
      const startDateStr: string | undefined = startDate;
      const endDateStr: string | undefined = endDate;
      const keywordStr: string | undefined = keyword;
      
      return await searchMessages(conversationIdStr, {
        startDate: startDateStr,
        endDate: endDateStr,
        keyword: keywordStr,
      });
    },
  } as any),

  extractActionItems: tool({
    description: 'Extract action items and tasks from a list of messages. Identifies messages containing commitments, todos, and assignments. Use this AFTER getting messages with getConversationMessages or searchMessages.',
    parameters: z.object({
      messages: z.array(z.any()).describe('Array of message objects to analyze'),
    }),
    execute: async ({ messages }) => {
      const messagesList: any[] = messages;
      // Simplified extraction logic
      return messagesList
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
  } as any),

  categorizeByPerson: tool({
    description: 'Group a list of action items by the person assigned to them. Use this to organize action items after extraction.',
    parameters: z.object({
      actionItems: z.array(z.any()).describe('Array of action items to group by assignedTo field'),
    }),
    execute: async ({ actionItems }) => {
      const items: any[] = actionItems;
      return groupBy(items, 'assignedTo');
    },
  } as any),

  generateReport: tool({
    description: 'Format data into a clean, readable markdown report with sections and bullet points. Use this as a final step to present organized information to the user.',
    parameters: z.object({
      data: z.any().describe('Data to format (typically an object with categories as keys and arrays as values)'),
      title: z.string().describe('Title for the report'),
    }),
    execute: async ({ data, title }) => {
      const reportData: any = data;
      const reportTitle: string = title;
      return formatReport(reportData, reportTitle);
    },
  } as any),
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
    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Agent error:', error);
    return new Response(
      JSON.stringify({ error: 'Agent failed to process request' }),
      { status: 500 }
    );
  }
}

