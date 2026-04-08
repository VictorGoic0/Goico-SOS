/**
 * Write path for RAG: load a conversation’s messages from Firestore, apply
 * short-message enrichment, embed, and upsert into Pinecone.
 *
 * **Empty conversation:** returns `{ indexed: 0 }` (no network calls to OpenAI/Pinecone).
 * **Partial failure:** if a batch’s embedding or upsert fails, that batch’s message IDs
 * are appended to `failed` and earlier successful batches remain indexed (no rollback).
 */

import type { PineconeRecord, RecordMetadata } from "@pinecone-database/pinecone";
import { embedText, embedTexts } from "./embeddings";
import type { ConversationMessageRecord } from "./firestore-messages";
import {
  getConversationMessageRecordById,
  getMessagesForConversation,
  getPreviousMessageForEnrichment,
} from "./firestore-messages";
import { buildEnrichedTextsForIndex, enrichMessageText } from "./message-enrichment";
import { getMessagesIndex } from "./pinecone";

/** Max vectors per `embedTexts` + `upsert` batch (under OpenAI/Pinecone limits). */
export const INDEX_BATCH_SIZE = 100;

export interface IndexConversationResult {
  indexed: number;
  failed?: string[];
}

/** Pinecone metadata: aligns with `MessageVectorMetadata` in `rag-types.ts`. */
function recordToMetadata(message: ConversationMessageRecord): RecordMetadata {
  return {
    messageId: message.messageId,
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderUsername: message.senderUsername,
    text: message.text,
    timestamp: message.timestamp,
  };
}

export async function indexConversationMessages(
  conversationId: string
): Promise<IndexConversationResult> {
  const messages = await getMessagesForConversation(conversationId);
  if (messages.length === 0) {
    return { indexed: 0 };
  }

  const failed: string[] = [];
  let indexed = 0;
  const index = getMessagesIndex();
  const enrichedTextsAll = buildEnrichedTextsForIndex(messages);

  for (let start = 0; start < messages.length; start += INDEX_BATCH_SIZE) {
    const batch = messages.slice(start, start + INDEX_BATCH_SIZE);
    const enrichedTexts = enrichedTextsAll.slice(start, start + INDEX_BATCH_SIZE);

    let vectors: number[][];
    try {
      vectors = await embedTexts(enrichedTexts);
    } catch (error) {
      console.error("indexConversationMessages: embedTexts failed for batch", error);
      failed.push(...batch.map((message) => message.messageId));
      continue;
    }

    if (vectors.length !== batch.length) {
      console.error(
        "indexConversationMessages: embedding count does not match batch size"
      );
      failed.push(...batch.map((message) => message.messageId));
      continue;
    }

    const records: PineconeRecord[] = batch.map((message, row) => ({
      id: message.messageId,
      values: vectors[row],
      metadata: recordToMetadata(message),
    }));

    try {
      await index.upsert({ records });
      indexed += batch.length;
    } catch (error) {
      console.error("indexConversationMessages: Pinecone upsert failed for batch", error);
      failed.push(...batch.map((message) => message.messageId));
    }
  }

  const result: IndexConversationResult = { indexed };
  if (failed.length > 0) {
    result.failed = failed;
  }
  return result;
}

/** True if Pinecone has at least one vector for this conversation (metadata filter). */
export async function conversationHasIndexedVectors(
  conversationId: string
): Promise<boolean> {
  const index = getMessagesIndex();
  const vector = await embedText(".");
  const response = await index.query({
    vector,
    topK: 1,
    includeMetadata: false,
    filter: { conversationId: { $eq: conversationId } },
  });
  return (response.matches?.length ?? 0) > 0;
}

/**
 * Before RAG read: if nothing is indexed for this thread (legacy / pre-RAG chat),
 * embed and upsert all Firestore messages once.
 */
export async function ensureConversationBackfilledForRag(
  conversationId: string
): Promise<void> {
  const has = await conversationHasIndexedVectors(conversationId);
  if (!has) {
    await indexConversationMessages(conversationId);
  }
}

/** Upsert one message by id (incremental path). Skips empty text. */
export async function indexSingleConversationMessage(
  conversationId: string,
  messageId: string
): Promise<IndexConversationResult> {
  const message = await getConversationMessageRecordById(
    conversationId,
    messageId
  );
  if (message === null) {
    return { indexed: 0 };
  }

  if (message.text.trim().length === 0) {
    return { indexed: 0 };
  }

  const previous = await getPreviousMessageForEnrichment(
    conversationId,
    message
  );
  const enriched = enrichMessageText(
    { text: message.text },
    previous !== null ? { text: previous.text } : null
  );
  const toEmbed = enriched.trim() === "" ? " " : enriched;

  let vectors: number[][];
  try {
    vectors = await embedTexts([toEmbed]);
  } catch (error) {
    console.error("indexSingleConversationMessage: embedTexts failed", error);
    return { indexed: 0, failed: [messageId] };
  }

  if (vectors.length !== 1) {
    return { indexed: 0, failed: [messageId] };
  }

  const index = getMessagesIndex();
  const records: PineconeRecord[] = [
    {
      id: message.messageId,
      values: vectors[0],
      metadata: recordToMetadata(message),
    },
  ];

  try {
    await index.upsert({ records });
    return { indexed: 1 };
  } catch (error) {
    console.error("indexSingleConversationMessage: upsert failed", error);
    return { indexed: 0, failed: [messageId] };
  }
}

export type IndexMessageMode = "full" | "incremental";

/**
 * Post-send hook: full backfill if the conversation has no vectors yet; otherwise
 * incremental upsert for `messageId`.
 */
export async function processIndexMessageAfterSend(
  conversationId: string,
  messageId: string
): Promise<IndexConversationResult & { mode: IndexMessageMode }> {
  const has = await conversationHasIndexedVectors(conversationId);
  if (!has) {
    const result = await indexConversationMessages(conversationId);
    return { ...result, mode: "full" };
  }
  const result = await indexSingleConversationMessage(conversationId, messageId);
  return { ...result, mode: "incremental" };
}
