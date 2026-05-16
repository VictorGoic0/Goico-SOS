/**
 * RAG read path: embed the user query, query Pinecone with metadata filter on
 * `conversationId`. {@link retrieveMessages} sorts by message `timestamp` for
 * agent/chronological context; {@link retrieveSearchHits} keeps Pinecone
 * relevance order and exposes `similarity` scores for search UI.
 */

import { embedText } from "./embeddings";
import { getMessagesIndex } from "./pinecone";
import type { MessageVectorMetadata } from "./rag-types";
import {
  normalizeSimilarityScore,
  parsePineconeMetadataToVectorMetadata,
  sortVectorMetadataByTimestampAsc,
} from "./retrieve-messages-utils";

export const DEFAULT_TOP_K = 5;

const MAX_TOP_K = 100;

function clampTopK(topK: number): number {
  if (!Number.isFinite(topK) || topK < 1) {
    return DEFAULT_TOP_K;
  }
  return Math.min(Math.floor(topK), MAX_TOP_K);
}

/** One search result for the mobile client (`similarity` 0–1 for “% match”). */
export interface SearchHit extends MessageVectorMetadata {
  similarity: number;
}

interface ScoredMetadataRow {
  metadata: MessageVectorMetadata;
  score: number;
}

async function queryConversationVectors(
  conversationId: string,
  queryText: string,
  topK: number
): Promise<ScoredMetadataRow[]> {
  const index = getMessagesIndex();
  const vector = await embedText(queryText);
  const limit = clampTopK(topK);

  const response = await index.query({
    vector,
    topK: limit,
    includeMetadata: true,
    filter: { conversationId: { $eq: conversationId } },
  });

  const matches = response.matches ?? [];
  const rows: ScoredMetadataRow[] = [];

  for (const match of matches) {
    const recordId = typeof match.id === "string" ? match.id : "";
    const metadata = parsePineconeMetadataToVectorMetadata(
      match.metadata,
      recordId,
      conversationId
    );
    if (metadata === null) {
      continue;
    }
    const score = typeof match.score === "number" ? match.score : 0;
    rows.push({ metadata, score });
  }

  return rows;
}

export async function retrieveMessages(
  conversationId: string,
  queryText: string,
  topK: number = DEFAULT_TOP_K
): Promise<MessageVectorMetadata[]> {
  const rows = await queryConversationVectors(
    conversationId,
    queryText,
    topK
  );
  if (rows.length === 0) {
    return [];
  }
  const metas = rows.map((row) => row.metadata);
  return sortVectorMetadataByTimestampAsc(metas);
}

/**
 * Top-k semantically similar messages for search UI (best match first).
 * Does not call Firestore; requires vectors to exist in Pinecone (e.g. after indexing).
 */
export async function retrieveSearchHits(
  conversationId: string,
  queryText: string,
  topK: number = DEFAULT_TOP_K
): Promise<SearchHit[]> {
  const rows = await queryConversationVectors(
    conversationId,
    queryText,
    topK
  );
  return rows.map((row) => ({
    ...row.metadata,
    similarity: normalizeSimilarityScore(row.score),
  }));
}
