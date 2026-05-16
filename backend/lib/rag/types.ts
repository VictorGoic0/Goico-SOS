import type { MessageVectorMetadata } from "../rag-types";

export interface IndexConversationResult {
  indexed: number;
  failed?: string[];
}

export type IndexMessageMode = "full" | "incremental";

export interface SearchHit extends MessageVectorMetadata {
  similarity: number;
}

export interface ScoredMetadataRow {
  metadata: MessageVectorMetadata;
  score: number;
}

export interface UnifiedLine {
  messageId: string;
  senderUsername: string;
  text: string;
  timestamp: number;
}
