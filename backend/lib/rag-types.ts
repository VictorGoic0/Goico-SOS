/**
 * RAG pipeline types. Pinecone index: dimensions = 512, metric = cosine.
 * See docs/TDD_RAG_Pipeline.md.
 */

/** Metadata stored with each message vector in Pinecone. */
export interface MessageVectorMetadata {
  /** Firestore message document ID */
  messageId: string;
  /** Primary filter at query time */
  conversationId: string;
  /** Firebase Auth UID of sender */
  senderId: string;
  /** Denormalized for display */
  senderUsername: string;
  /** Original message text */
  text: string;
  /** Unix timestamp in milliseconds (for sorting after retrieval) */
  timestamp: number;
}
