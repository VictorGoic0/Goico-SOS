import type { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { config } from "../config";

export class PineconeClient {
  private index: Index;

  constructor(index: Index) {
    this.index = index;
  }

  async query(params: {
    vector: number[];
    topK: number;
    includeMetadata: boolean;
    filter: Record<string, unknown>;
  }) {
    return this.index.query(params);
  }

  async upsert(records: { id: string; values: number[]; metadata: Record<string, unknown> }[]) {
    return this.index.upsert({ records: records as { id: string; values: number[]; metadata: RecordMetadata }[] });
  }

  async describeIndexStats() {
    return this.index.describeIndexStats();
  }
}

const pinecone = new Pinecone({ apiKey: config.PINECONE_API_KEY });
const messagesIndex = pinecone.index({ name: config.PINECONE_INDEX_NAME });

export const pineconeClient = new PineconeClient(messagesIndex);
