import { firebaseAdmin } from "./firebase-admin";

export async function searchMessages(
  conversationId: string,
  filters: {
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }
) {
  return firebaseAdmin.searchMessages(conversationId, filters)
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
  return firebaseAdmin.getMessagesFromFirebase(conversationId, limit);
}

