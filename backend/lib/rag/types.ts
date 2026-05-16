export interface ScoredMetadataRow {
  metadata: MessageVectorMetadata;
  score: number;
}

export interface MessageVectorMetadata {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  text: string;
  /** Unix timestamp in milliseconds (for sorting after retrieval) */
  timestamp: number;
}

export interface SearchHit extends MessageVectorMetadata {
  similarity: number;
}

export interface IndexConversationResult {
  indexed: number;
  failed?: string[];
}

export type IndexMessageMode = "full" | "incremental";

export interface UnifiedLine {
  messageId: string;
  senderUsername: string;
  text: string;
  timestamp: number;
}
