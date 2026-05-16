This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## RAG / Pinecone

The RAG pipeline stores message embeddings in Pinecone for semantic search and agent context.

- **Index name:** `messages` (configurable via `PINECONE_INDEX_NAME`)
- **Dimensions:** 512 (matches OpenAI `text-embedding-3-small` with dimensions=512)
- **Metric:** Cosine similarity
- **Required env vars:** `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`

See [docs/TDD_RAG_Pipeline.md](../docs/TDD_RAG_Pipeline.md) for full design.

Embeddings use OpenAI `text-embedding-3-small` with 512 dimensions via `backend/lib/embeddings.ts` (`embedText`, `embedTexts`).

**Message fetch & enrichment (RAG indexing):**

- `backend/lib/firestore-messages.ts` — `getMessagesForConversation(conversationId, { limit?, orderBy?: 'asc' | 'desc' })` loads the messages subcollection (default order **asc**, oldest first, for enrichment “previous message”). `getMessagesFromFirebase` is used by summarize and other routes (**not** `/api/search`, which uses Pinecone only).
- `backend/lib/message-enrichment.ts` — messages with fewer than 10 words get the previous message’s text prepended for embedding input only (original `text` in metadata stays unchanged). See `docs/tasks-TDD.md` PR #3–#4.

**Indexing (embed + Pinecone upsert):**

- `backend/lib/index-messages.ts` — `indexConversationMessages(conversationId)` full backfill: loads messages (asc), enriched texts, batch embed/upsert. `indexSingleConversationMessage(conversationId, messageId)` incremental upsert (short-message enrichment uses `getPreviousMessageForEnrichment` in `firestore-messages.ts`). `conversationHasIndexedVectors` / `ensureConversationBackfilledForRag`: if Pinecone has **no** vectors for that `conversationId`, search and agent retrieval run a full backfill first (legacy chats). `processIndexMessageAfterSend` powers **`POST /api/index-message`**: same rule — no vectors → full index; else single-message upsert. Vector id = Firestore message doc id.

Run unit tests: `npm run test` (Vitest; enrichment tests in `lib/message-enrichment.test.ts`). Manual verification: send a message (mobile triggers index-message), or call `indexConversationMessages`, then check Pinecone stats.

**Retrieval (semantic query):**

- `backend/lib/retrieve-messages.ts` — `retrieveMessages(conversationId, queryText, topK?)` embeds the query, runs `index.query` with `filter: { conversationId: { $eq: conversationId } }`, `includeMetadata: true`, maps matches to `MessageVectorMetadata`, sorts by `timestamp` ascending (for agent/chronological context). Default **`DEFAULT_TOP_K = 5`**. `retrieveSearchHits(conversationId, queryText, topK?)` keeps **relevance order** (best match first) and adds **`similarity`** (0–1) — used by **`POST /api/search`**. Helpers: `retrieve-messages-utils.ts` (Vitest: `retrieve-messages-utils.test.ts`).

### `POST /api/search` (RAG)

- **Auth:** `Authorization: Bearer <Firebase ID token>` (same as other AI routes).
- **Body:** `{ "conversationId": string, "query": string }` — `query` must be non-empty after trim.
- **Response:** `{ results, query, conversationId }` where `results` is an array of up to **5** hits: `messageId`, `conversationId`, `senderId`, `senderUsername`, `text`, `timestamp`, `similarity` (0–1). `results` may be empty if nothing matches after backfill.
- **Implementation:** `ensureConversationBackfilledForRag` then `retrieveSearchHits` (no Firestore scan for ranking). Optional `messageCount` in the client body is ignored.

### `POST /api/index-message`

- **Auth:** Bearer token required.
- **Body:** `{ "conversationId": string, "messageId": string }` — Firestore message doc id from `addDoc`.
- **Response:** `{ conversationId, messageId, mode: "full" | "incremental", indexed: number, failed?: string[] }`. If the conversation had **no** Pinecone vectors, `mode` is `full` (entire thread indexed). Otherwise `incremental` (single upsert).
- **Mobile:** `requestIndexMessageForRag` in `mobile-app/src/services/aiService.js` is called fire-and-forget from `sendMessage` after a successful write.

### `POST /api/agent`

- **Tools:** Includes `retrieveRelevantMessages` — `buildAgentRetrievalContext` runs `ensureConversationBackfilledForRag`, then `retrieveMessages` (Pinecone, default top **5**, chronological among hits) and merges **deduped** recent Firestore messages (`AGENT_RECENT_FIRESTORE_LIMIT`, default 10). Other tools unchanged. Max tool steps per request: **10** (`stepCountIs(10)`).
