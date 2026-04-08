/**
 * Agent RAG context: semantic hits from Pinecone plus recent Firestore messages.
 *
 * Very new messages may not be embedded yet; we always merge in the last N messages
 * from Firestore (deduped by `messageId` with Pinecone rows) so the model sees the
 * latest thread. See docs/tasks-TDD.md PR #7.
 */

import { getMessagesFromFirebase } from "./firebase-admin";
import type { FirebaseMessage } from "./firebase-admin";
import { ensureConversationBackfilledForRag } from "./index-messages";
import type { MessageVectorMetadata } from "./rag-types";
import { DEFAULT_TOP_K, retrieveMessages } from "./retrieve-messages";

/** How many newest Firestore messages to merge after Pinecone retrieval. */
export const AGENT_RECENT_FIRESTORE_LIMIT = 10;

interface UnifiedLine {
  messageId: string;
  senderUsername: string;
  text: string;
  timestamp: number;
}

function toUnifiedFromPinecone(meta: MessageVectorMetadata): UnifiedLine {
  return {
    messageId: meta.messageId,
    senderUsername: meta.senderUsername,
    text: meta.text,
    timestamp: meta.timestamp,
  };
}

function toUnifiedFromFirestore(fb: FirebaseMessage): UnifiedLine {
  return {
    messageId: fb.messageId,
    senderUsername: fb.senderUsername,
    text: fb.text,
    timestamp: fb.timestamp.toMillis(),
  };
}

/**
 * Pinecone top-k (chronological among hits) merged with recent Firestore messages,
 * deduped by `messageId`, then sorted by time for LLM consumption.
 */
export async function buildAgentRetrievalContext(
  conversationId: string,
  query: string
): Promise<string> {
  await ensureConversationBackfilledForRag(conversationId);
  const [semanticHits, recentFromDb] = await Promise.all([
    retrieveMessages(conversationId, query, DEFAULT_TOP_K),
    getMessagesFromFirebase(conversationId, AGENT_RECENT_FIRESTORE_LIMIT),
  ]);

  const byId = new Map<string, UnifiedLine>();

  for (const meta of semanticHits) {
    byId.set(meta.messageId, toUnifiedFromPinecone(meta));
  }

  for (const fb of recentFromDb) {
    if (!byId.has(fb.messageId)) {
      byId.set(fb.messageId, toUnifiedFromFirestore(fb));
    }
  }

  if (byId.size === 0) {
    return "No messages available for this conversation.";
  }

  const ordered = [...byId.values()].sort(
    (left, right) => left.timestamp - right.timestamp
  );

  return ordered
    .map(
      (row) =>
        `[${new Date(row.timestamp).toISOString()}] ${row.senderUsername}: ${row.text}`
    )
    .join("\n");
}
