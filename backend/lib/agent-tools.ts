import { db } from "./firebase-admin";

export async function searchMessages(
  conversationId: string,
  filters: {
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }
) {
  console.log('[agent-tools.searchMessages] Searching messages:', { conversationId, filters });
  
  let query: any = db
    .collection("conversations")
    .doc(conversationId)
    .collection("messages");

  if (filters.startDate) {
    query = query.where("timestamp", ">=", new Date(filters.startDate));
  }

  if (filters.endDate) {
    query = query.where("timestamp", "<=", new Date(filters.endDate));
  }

  const snapshot = await query.get();
  console.log('[agent-tools.searchMessages] Snapshot size:', snapshot.size);
  
  let messages = snapshot.docs.map((doc: any) => ({
    messageId: doc.id,
    ...doc.data(),
  }));

  if (filters.keyword) {
    const beforeFilter = messages.length;
    messages = messages.filter((message: any) =>
      message.text.toLowerCase().includes(filters.keyword!.toLowerCase())
    );
    console.log('[agent-tools.searchMessages] Keyword filter:', beforeFilter, '→', messages.length);
  }

  console.log('[agent-tools.searchMessages] Returning', messages.length, 'messages');
  return messages;
}

export function groupBy(array: any[], key: string) {
  return array.reduce((grouped, item) => {
    const groupKey = item[key] || "Unassigned";
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(item);
    return grouped;
  }, {});
}

export function formatReport(data: any, title: string) {
  let report = `# ${title}\n\n`;

  for (const [key, items] of Object.entries(data)) {
    report += `## ${key}\n`;
    if (Array.isArray(items)) {
      items.forEach((item: any, i: number) => {
        report += `${i + 1}. ${item.task || JSON.stringify(item)}\n`;
      });
    }
    report += "\n";
  }

  return report;
}

export async function getConversationMessages(
  conversationId: string,
  limit: number = 50
) {
  console.log('[agent-tools.getConversationMessages] Fetching messages:', { conversationId, limit });
  
  const snapshot = await db
    .collection("conversations")
    .doc(conversationId)
    .collection("messages")
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();

  console.log('[agent-tools.getConversationMessages] Snapshot size:', snapshot.size);

  const messages = snapshot.docs
    .map((doc: any) => ({
      messageId: doc.id,
      ...doc.data(),
    }))
    .reverse(); // Reverse to get chronological order (oldest to newest)

  console.log('[agent-tools.getConversationMessages] Returning', messages.length, 'messages');
  if (messages.length > 0) {
    console.log('[agent-tools.getConversationMessages] First message:', messages[0]);
    console.log('[agent-tools.getConversationMessages] Last message:', messages[messages.length - 1]);
  }

  return messages;
}

