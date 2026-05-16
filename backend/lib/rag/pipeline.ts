/**
 * RAG pipeline encapsulation. All embedding, indexing, and retrieval operations
 * go through this class. No caller touches Pinecone, OpenAI embeddings, or the
 * enrichment/utils helpers directly.
 */

import { embed, embedMany } from "ai";
import type { FirebaseMessage } from "../firebase-admin";
import { firebaseAdmin } from "../firebase-admin";
import type { ConversationMessageRecord } from "../firestore-messages";
import {
  getConversationMessageRecordById,
  getMessagesForConversation,
  getPreviousMessageForEnrichment,
} from "../firestore-messages";
import { buildEnrichedTextsForIndex, enrichMessageText } from "../message-enrichment";
import { openai } from "../openai-provider";
import {
  normalizeSimilarityScore,
  parsePineconeMetadataToVectorMetadata,
  sortVectorMetadataByTimestampAsc,
} from "../retrieve-messages-utils";
import { pineconeClient } from "../pinecone/pinecone";
import type { PineconeClient } from "../pinecone/pinecone";
import {
  AGENT_RECENT_FIRESTORE_LIMIT,
  DEFAULT_TOP_K,
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  INDEX_BATCH_SIZE,
  MAX_TOP_K,
} from "./consts";
import type {
  IndexConversationResult,
  IndexMessageMode,
  MessageVectorMetadata,
  ScoredMetadataRow,
  SearchHit,
  UnifiedLine,
} from "./types";

export type { IndexConversationResult, IndexMessageMode, SearchHit, MessageVectorMetadata };

class RagPipeline {
  private pinecone: PineconeClient;

  constructor(pinecone: PineconeClient) {
    this.pinecone = pinecone;
  }

  async buildAgentRetrievalContext(conversationId: string, query: string): Promise<string> {
    await this.ensureBackfilled(conversationId);
    const [semanticHits, recentFromDb] = await Promise.all([
      this.retrieveMessages(conversationId, query, DEFAULT_TOP_K),
      firebaseAdmin.getMessagesFromFirebase(conversationId, AGENT_RECENT_FIRESTORE_LIMIT),
    ]);

    const byId = new Map<string, UnifiedLine>();
    for (const meta of semanticHits) byId.set(meta.messageId, this.toUnifiedFromPinecone(meta));
    for (const fb of recentFromDb) {
      if (!byId.has(fb.messageId)) byId.set(fb.messageId, this.toUnifiedFromFirestore(fb));
    }

    if (byId.size === 0) return "No messages available for this conversation.";

    return [...byId.values()]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((r) => `[${new Date(r.timestamp).toISOString()}] ${r.senderUsername}: ${r.text}`)
      .join("\n");
  }

  async processAfterSend(
    conversationId: string,
    messageId: string
  ): Promise<IndexConversationResult & { mode: IndexMessageMode }> {
    const hasVectors = await this.conversationIsIndexed(conversationId);
    if (!hasVectors) {
      const result = await this.indexConversation(conversationId);
      return { ...result, mode: "full" };
    }
    const result = await this.indexSingleMessage(conversationId, messageId);
    return { ...result, mode: "incremental" };
  }

  async ensureBackfilled(conversationId: string): Promise<void> {
    const hasVectors = await this.conversationIsIndexed(conversationId);
    if (!hasVectors) {
      await this.indexConversation(conversationId);
    }
  }

  private async conversationIsIndexed(conversationId: string): Promise<boolean> {
    const vector = await this.embedText(".");
    const response = await this.pinecone.query({
      vector,
      topK: 1,
      includeMetadata: false,
      filter: { conversationId: { $eq: conversationId } },
    });
    return (response.matches?.length ?? 0) > 0;
  }

  private async indexConversation(conversationId: string): Promise<IndexConversationResult> {
    const messages = await getMessagesForConversation(conversationId);
    if (messages.length === 0) return { indexed: 0 };

    const enrichedTexts = buildEnrichedTextsForIndex(messages);
    const failed: string[] = [];
    let indexed = 0;

    for (let start = 0; start < messages.length; start += INDEX_BATCH_SIZE) {
      const batch = messages.slice(start, start + INDEX_BATCH_SIZE);
      const texts = enrichedTexts.slice(start, start + INDEX_BATCH_SIZE);

      let vectors: number[][];
      try {
        vectors = await this.embedTexts(texts);
      } catch {
        failed.push(...batch.map((m) => m.messageId));
        continue;
      }

      if (vectors.length !== batch.length) {
        failed.push(...batch.map((m) => m.messageId));
        continue;
      }

      try {
        await this.pinecone.upsert(
          batch.map((m, i) => ({ id: m.messageId, values: vectors[i], metadata: this.toMetadataRecord(m) }))
        );
        indexed += batch.length;
      } catch {
        failed.push(...batch.map((m) => m.messageId));
      }
    }

    return failed.length > 0 ? { indexed, failed } : { indexed };
  }

  private async indexSingleMessage(
    conversationId: string,
    messageId: string
  ): Promise<IndexConversationResult> {
    const message = await getConversationMessageRecordById(conversationId, messageId);
    if (message === null || message.text.trim().length === 0) return { indexed: 0 };

    const previous = await getPreviousMessageForEnrichment(conversationId, message);
    const enriched = enrichMessageText(
      { text: message.text },
      previous !== null ? { text: previous.text } : null
    );
    const toEmbed = enriched.trim() === "" ? " " : enriched;

    let vectors: number[][];
    try {
      vectors = await this.embedTexts([toEmbed]);
    } catch {
      return { indexed: 0, failed: [messageId] };
    }

    if (vectors.length !== 1) return { indexed: 0, failed: [messageId] };

    try {
      await this.pinecone.upsert([
        { id: message.messageId, values: vectors[0], metadata: this.toMetadataRecord(message) },
      ]);
      return { indexed: 1 };
    } catch {
      return { indexed: 0, failed: [messageId] };
    }
  }

  private toMetadataRecord(message: ConversationMessageRecord): Record<string, unknown> {
    return {
      messageId: message.messageId,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderUsername: message.senderUsername,
      text: message.text,
      timestamp: message.timestamp,
    };
  }

  async retrieveMessages(
    conversationId: string,
    queryText: string,
    topK: number = DEFAULT_TOP_K
  ): Promise<MessageVectorMetadata[]> {
    const rows = await this.queryVectors(conversationId, queryText, topK);
    if (rows.length === 0) return [];
    return sortVectorMetadataByTimestampAsc(rows.map((r) => r.metadata));
  }

  async retrieveSearchHits(
    conversationId: string,
    queryText: string,
    topK: number = DEFAULT_TOP_K
  ): Promise<SearchHit[]> {
    const rows = await this.queryVectors(conversationId, queryText, topK);
    return rows.map((r) => ({ ...r.metadata, similarity: normalizeSimilarityScore(r.score) }));
  }

  private async queryVectors(
    conversationId: string,
    queryText: string,
    topK: number
  ): Promise<ScoredMetadataRow[]> {
    const vector = await this.embedText(queryText);
    const limit = this.clampTopK(topK);

    const response = await this.pinecone.query({
      vector,
      topK: limit,
      includeMetadata: true,
      filter: { conversationId: { $eq: conversationId } },
    });

    const rows: ScoredMetadataRow[] = [];
    for (const match of response.matches ?? []) {
      const recordId = typeof match.id === "string" ? match.id : "";
      const metadata = parsePineconeMetadataToVectorMetadata(
        match.metadata,
        recordId,
        conversationId
      );
      if (metadata === null) continue;
      rows.push({ metadata, score: typeof match.score === "number" ? match.score : 0 });
    }
    return rows;
  }

  private clampTopK(topK: number): number {
    if (!Number.isFinite(topK) || topK < 1) return DEFAULT_TOP_K;
    return Math.min(Math.floor(topK), MAX_TOP_K);
  }

  private toUnifiedFromPinecone(meta: MessageVectorMetadata): UnifiedLine {
    return {
      messageId: meta.messageId,
      senderUsername: meta.senderUsername,
      text: meta.text,
      timestamp: meta.timestamp,
    };
  }

  private toUnifiedFromFirestore(fb: FirebaseMessage): UnifiedLine {
    return {
      messageId: fb.messageId,
      senderUsername: fb.senderUsername,
      text: fb.text,
      timestamp: fb.timestamp.toMillis(),
    };
  }

  private async embedTexts(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const { embeddings } = await embedMany({
      model: this.embeddingModel(),
      values: texts,
      providerOptions: { openai: { dimensions: EMBEDDING_DIMENSIONS } },
    });
    return embeddings as number[][];
  }

  private async embedText(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: this.embeddingModel(),
      value: text,
      providerOptions: { openai: { dimensions: EMBEDDING_DIMENSIONS } },
    });
    return embedding as number[];
  }

  private embeddingModel() {
    return openai.embedding(EMBEDDING_MODEL);
  }
}

export const ragPipeline = new RagPipeline(pineconeClient);
