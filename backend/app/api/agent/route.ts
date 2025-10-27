import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { searchMessages, groupBy, formatReport } from '@/lib/agent-tools';

// Define tools the agent can use
const agentTools = {
  searchMessages: tool({
    description: 'Search messages in a conversation by date range or keyword',
    parameters: z.object({
      conversationId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      keyword: z.string().optional(),
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
    description: 'Extract action items from a set of messages',
    parameters: z.object({
      messages: z.array(z.any()),
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
    description: 'Group action items by assigned person',
    parameters: z.object({
      actionItems: z.array(z.any()),
    }),
    execute: async ({ actionItems }) => {
      const items: any[] = actionItems;
      return groupBy(items, 'assignedTo');
    },
  } as any),

  generateReport: tool({
    description: 'Generate a formatted summary report',
    parameters: z.object({
      data: z.any(),
      title: z.string(),
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
      system: `You are a helpful assistant for a remote team. You can search messages, extract action items, categorize data, and generate reports.

Break down complex requests into steps and use available tools to complete the task.`,
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

