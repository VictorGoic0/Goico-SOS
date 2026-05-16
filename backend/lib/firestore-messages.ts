/**
 * Firestore reads for `conversations/{conversationId}/messages` (server-side only).
 *
 * **RAG indexing:** Legacy threads get a full upsert from `indexConversationMessages`
 * when Pinecone has no vectors for that `conversationId`. After that, new messages
 * are upserted incrementally via `indexSingleConversationMessage` + `POST /api/index-message`.
 * We do not store `indexedAt` on message documents.
 */

import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import type { FirebaseMessage } from "./firebase-admin";
import { db } from "./firebase-admin";

/** Message row for RAG indexing and metadata (timestamps as Unix ms). */
export interface ConversationMessageRecord {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  text: string;
  /** Unix ms (for Pinecone metadata and sorting). */
  timestamp: number;
}

export interface GetMessagesOptions {
  limit?: number;
  orderBy?: "asc" | "desc";
}

const DEFAULT_FETCH_LIMIT = 1000;

interface RawMessageDoc {
  senderId?: string;
  senderUsername?: string;
  text?: string;
  timestamp?: Timestamp | Date | { toMillis: () => number } | number;
  status?: string;
  readAt?: Timestamp | null;
  readBy?: string[] | null;
  imageURL?: string | null;
}

/** Normalize Firestore timestamp fields to Unix ms. */
export function timestampFieldToUnixMs(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function rawTimestampToFirestoreTimestamp(value: unknown): Timestamp {
  if (value === null || value === undefined) {
    return Timestamp.now();
  }
  if (value instanceof Timestamp) {
    return value;
  }
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }
  if (typeof value === "number") {
    return Timestamp.fromMillis(value);
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return Timestamp.fromMillis((value as { toMillis: () => number }).toMillis());
  }
  return Timestamp.now();
}

export function mapDocToConversationMessage(
  doc: QueryDocumentSnapshot,
  conversationId: string
): ConversationMessageRecord {
  const data = doc.data() as RawMessageDoc;
  return {
    messageId: doc.id,
    conversationId,
    senderId: data.senderId ?? "",
    senderUsername: data.senderUsername ?? "",
    text: data.text ?? "",
    timestamp: timestampFieldToUnixMs(data.timestamp),
  };
}

export function mapDocToFirebaseMessage(
  doc: QueryDocumentSnapshot
): FirebaseMessage {
  const data = doc.data() as RawMessageDoc;
  return {
    messageId: doc.id,
    senderId: data.senderId ?? "",
    senderUsername: data.senderUsername ?? "",
    text: data.text ?? "",
    timestamp: rawTimestampToFirestoreTimestamp(data.timestamp),
    status: data.status ?? "sent",
    readAt: data.readAt ?? undefined,
    readBy: data.readBy ?? undefined,
    imageURL: data.imageURL ?? undefined,
  };
}

/**
 * Load messages for a conversation. Default order is **asc** (oldest first) so
 * “previous message” for enrichment is well-defined for RAG indexing.
 */
/** Single message doc for incremental RAG upsert; returns null if missing. */
export async function getConversationMessageRecordById(
  conversationId: string,
  messageId: string
): Promise<ConversationMessageRecord | null> {
  const snap = await db
    .collection("conversations")
    .doc(conversationId)
    .collection("messages")
    .doc(messageId)
    .get();

  if (!snap.exists) {
    return null;
  }

  return mapDocToConversationMessage(
    snap as QueryDocumentSnapshot,
    conversationId
  );
}

/**
 * Message immediately before `target` in chronological order (for short-message enrichment).
 * If `target.timestamp` is unset (0), falls back to scanning ascending messages up to the default limit.
 */
export async function getPreviousMessageForEnrichment(
  conversationId: string,
  target: ConversationMessageRecord
): Promise<ConversationMessageRecord | null> {
  if (target.timestamp > 0) {
    const snap = await db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .where("timestamp", "<", Timestamp.fromMillis(target.timestamp))
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (snap.empty) {
      return null;
    }

    return mapDocToConversationMessage(snap.docs[0], conversationId);
  }

  const ordered = await getMessagesForConversation(conversationId, {
    limit: DEFAULT_FETCH_LIMIT,
    orderBy: "asc",
  });
  const idx = ordered.findIndex((row) => row.messageId === target.messageId);
  if (idx <= 0) {
    return null;
  }
  return ordered[idx - 1];
}

export async function getMessagesForConversation(
  conversationId: string,
  options?: GetMessagesOptions
): Promise<ConversationMessageRecord[]> {
  const limit = options?.limit ?? DEFAULT_FETCH_LIMIT;
  const direction = options?.orderBy ?? "asc";

  try {
    const snapshot = await db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .orderBy("timestamp", direction)
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) =>
      mapDocToConversationMessage(doc, conversationId)
    );
  } catch (error) {
    console.error("Error fetching messages for conversation:", error);
    throw new Error("Failed to fetch messages from database");
  }
}

/**
 * Latest N messages (newest first in query), same shape as before refactor.
 * Used by summarize, search, extract-actions, etc.
 */
export async function getMessagesFromFirebase(
  conversationId: string,
  limit: number = 50
): Promise<FirebaseMessage[]> {
  try {
    const snapshot = await db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => mapDocToFirebaseMessage(doc));
  } catch (error) {
    console.error("Error fetching messages from Firebase:", error);
    throw new Error("Failed to fetch messages from database");
  }
}
