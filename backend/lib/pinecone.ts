import { Pinecone } from "@pinecone-database/pinecone";
import { config } from "./config";

const pinecone = new Pinecone({ apiKey: config.PINECONE_API_KEY });

/**
 * Returns the Pinecone index used for message vectors (RAG pipeline).
 * Index name from env PINECONE_INDEX_NAME; dimensions 512, metric cosine per TDD.
 */
export function getMessagesIndex() {
  return pinecone.index({ name: config.PINECONE_INDEX_NAME });
}

/**
 * Test-before-merge: call describeIndexStats and log the result.
 * Run from a temporary route or: node -e "import('./lib/pinecone').then(m => m.logIndexStatsForVerification())"
 */
export async function logIndexStatsForVerification(): Promise<void> {
  const index = getMessagesIndex();
  const stats = await index.describeIndexStats();
  console.log("Pinecone index stats:", JSON.stringify(stats, null, 2));
}
