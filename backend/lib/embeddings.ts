import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const EMBEDDING_DIMENSIONS = 512;
const MODEL_ID = "text-embedding-3-small";

const embeddingModel = () => openai.embedding(MODEL_ID);

/**
 * Embed a single text. Returns a 512-dimensional vector (matches Pinecone index).
 */
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel(),
    value: text,
    providerOptions: { openai: { dimensions: EMBEDDING_DIMENSIONS } },
  });
  return embedding as number[];
}

/**
 * Embed multiple texts in one batch. Returns vectors in the same order as inputs.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const { embeddings } = await embedMany({
    model: embeddingModel(),
    values: texts,
    providerOptions: { openai: { dimensions: EMBEDDING_DIMENSIONS } },
  });
  return embeddings as number[][];
}
