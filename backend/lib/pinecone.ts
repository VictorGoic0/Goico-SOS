import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME;

if (!apiKey || !indexName) {
  throw new Error(
    "Missing Pinecone env: set PINECONE_API_KEY and PINECONE_INDEX_NAME (e.g. in .env.local)"
  );
}

const pinecone = new Pinecone({ apiKey });

/**
 * Returns the Pinecone index used for message vectors (RAG pipeline).
 * Index name from env PINECONE_INDEX_NAME; dimensions 1536, metric cosine per TDD.
 */
export function getMessagesIndex() {
  return pinecone.index({ name: indexName });
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
