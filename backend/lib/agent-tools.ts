import type { Query } from "firebase-admin/firestore";
import { db, type FirebaseMessage } from "./firebase-admin";

export async function searchMessages(
  conversationId: string,
  filters: {
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }
) {
  let queryRef: Query = db
    .collection("conversations")
    .doc(conversationId)
    .collection("messages");

  if (filters.startDate) {
    queryRef = queryRef.where("timestamp", ">=", new Date(filters.startDate));
  }

  if (filters.endDate) {
    queryRef = queryRef.where("timestamp", "<=", new Date(filters.endDate));
  }

  const snapshot = await queryRef.get();
  let messages: FirebaseMessage[] = snapshot.docs.map((doc) => ({
    messageId: doc.id,
    ...(doc.data() as Omit<FirebaseMessage, "messageId">),
  }));

  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    messages = messages.filter((message) =>
      message.text.toLowerCase().includes(keyword)
    );
  }

  return messages;
}

export function groupBy<T extends Record<string, unknown>>(
  array: T[],
  key: string
): Record<string, T[]> {
  return array.reduce<Record<string, T[]>>((grouped, item) => {
    const normalized = (item[key] as unknown) || "Unassigned";
    const groupKey =
      typeof normalized === "object" && normalized !== null
        ? JSON.stringify(normalized)
        : typeof normalized === "bigint"
          ? normalized.toString()
          : String(normalized as string | number | boolean);
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(item);
    return grouped;
  }, {});
}

export function formatReport(data: Record<string, unknown>, title: string) {
  let report = `# ${title}\n\n`;

  for (const [key, items] of Object.entries(data)) {
    report += `## ${key}\n`;
    if (Array.isArray(items)) {
      items.forEach((item: unknown, i: number) => {
        const line =
          item &&
          typeof item === "object" &&
          item !== null &&
          "task" in item &&
          (item as { task?: unknown }).task != null
            ? String((item as { task: unknown }).task)
            : JSON.stringify(item);
        report += `${i + 1}. ${line}\n`;
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
  const snapshot = await db
    .collection("conversations")
    .doc(conversationId)
    .collection("messages")
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();

  const messages = snapshot.docs
    .map((doc) => ({
      messageId: doc.id,
      ...(doc.data() as Omit<FirebaseMessage, "messageId">),
    }))
    .reverse();

  return messages;
}

