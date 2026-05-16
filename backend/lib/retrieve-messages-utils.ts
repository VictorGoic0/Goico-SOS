import type { RecordMetadata } from "@pinecone-database/pinecone";
import type { MessageVectorMetadata } from "./rag-types";

/**
 * Map Pinecone query match metadata to {@link MessageVectorMetadata}.
 * Falls back to `recordId` when `messageId` is missing; uses `fallbackConversationId`
 * when metadata omits `conversationId`.
 */
export function parsePineconeMetadataToVectorMetadata(
  metadata: RecordMetadata | undefined,
  recordId: string,
  fallbackConversationId: string
): MessageVectorMetadata | null {
  if (metadata === undefined) {
    return null;
  }
  const meta = metadata as Record<string, unknown>;
  const messageId =
    typeof meta.messageId === "string" && meta.messageId.length > 0
      ? meta.messageId
      : recordId;
  const conversationId =
    typeof meta.conversationId === "string" && meta.conversationId.length > 0
      ? meta.conversationId
      : fallbackConversationId;
  const senderId = typeof meta.senderId === "string" ? meta.senderId : "";
  const senderUsername =
    typeof meta.senderUsername === "string" ? meta.senderUsername : "";
  const text = typeof meta.text === "string" ? meta.text : "";
  let timestamp = 0;
  if (typeof meta.timestamp === "number") {
    timestamp = meta.timestamp;
  } else if (typeof meta.timestamp === "string") {
    timestamp = Number.parseFloat(meta.timestamp) || 0;
  }
  return {
    messageId,
    conversationId,
    senderId,
    senderUsername,
    text,
    timestamp,
  };
}

export function sortVectorMetadataByTimestampAsc(
  items: MessageVectorMetadata[]
): MessageVectorMetadata[] {
  return [...items].sort((left, right) => left.timestamp - right.timestamp);
}

/** Pinecone cosine scores are typically in [0, 1]; clamp for UI percentage. */
export function normalizeSimilarityScore(score: number | undefined): number {
  if (score === undefined || Number.isNaN(score)) {
    return 0;
  }
  return Math.min(1, Math.max(0, score));
}
