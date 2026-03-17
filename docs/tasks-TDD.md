# RAG Pipeline — Implementation Task List (TDD)

Based on [TDD_RAG_Pipeline.md](./TDD_RAG_Pipeline.md). Each PR is a complete, testable slice. Implement in order; search and agent endpoints depend on the shared vector infrastructure.

**Total PRs:** 8  
**Scope:** Backend only (Vercel serverless). No new deployment; Pinecone is HTTP from existing functions.

---

## PR #1: Pinecone Setup & Index Configuration

**Goal**: Create Pinecone account, configure the `messages` index, and add backend connectivity.

### Why This Matters

The RAG pipeline stores message embeddings in Pinecone. One index holds all conversation vectors; filtering by `conversationId` at query time keeps retrieval scoped. Getting the index and env right first avoids rework in later PRs.

### Subtasks

**Pinecone Account & Index:**

- [x] Sign up at [pinecone.io](https://www.pinecone.io/) and create a project (free tier)
- [x] Create an index with:
  - **Name:** `messages`
  - **Dimensions:** 512 (matches `text-embedding-3-small` with dimensions=512)
  - **Metric:** Cosine similarity
  - **Cloud / Region:** AWS us-east-1 (co-located with Vercel US East)
  - **Tier:** Free (100k vector limit)
- [x] Copy API key from Pinecone console

**Backend Environment:**

- [x] Add to backend `.env` (and Vercel env vars):
  ```
  PINECONE_API_KEY=...
  PINECONE_INDEX_NAME=messages
  ```
- [x] Ensure `.env` and `.env.local` remain in `.gitignore`

**Pinecone Client Library:**

- [x] Install Pinecone SDK in backend:
  ```bash
  cd backend
  npm install @pinecone-database/pinecone
  ```
- [x] File: `backend/lib/pinecone.ts`
  - Initialize Pinecone client with `PINECONE_API_KEY`
  - Export helper: `getMessagesIndex()` that returns the index object for `PINECONE_INDEX_NAME`
  - Throw clear error if env vars are missing

**Documentation:**

- [x] In `backend/README.md`, add section "RAG / Pinecone":
  - Index name and dimensions
  - Required env vars
  - Link to TDD_RAG_Pipeline.md for full design

**Test Before Merge:**

- [x] Backend can import `getMessagesIndex()` without error when env is set
- [x] Calling `getMessagesIndex().describeIndexStats()` (or equivalent) returns index stats (e.g. vector count) — use `logIndexStatsForVerification()` and console.log output to verify
- [x] Deploy to Vercel and verify env vars are set; no runtime errors on cold start

---

## PR #2: Embedding Service & Metadata Schema

**Goal**: Add OpenAI embedding calls and define the metadata schema used for every vector in Pinecone.

### Why This Matters

Every message and every query is embedded with the same model (`text-embedding-3-small`, 512 dimensions). Centralizing this in one place keeps the pipeline consistent. The metadata schema is fixed by the TDD and must match what retrieval and the agent expect.

### Subtasks

**Embedding Model:**

- [x] File: `backend/lib/embeddings.ts`
- [x] Function: `embedText(text: string): Promise<number[]>`
  - Call OpenAI API: `text-embedding-3-small`
  - Return the embedding vector (length 512)
  - Use existing OpenAI client/config from the project
- [x] Function: `embedTexts(texts: string[]): Promise<number[][]>` (batch for indexing many messages)
  - Call OpenAI with array of inputs where supported to reduce round-trips
  - Return array of vectors in same order as input

**Metadata Schema (TypeScript types):**

- [x] File: `backend/lib/rag-types.ts` (or equivalent)
- [x] Define type for vector metadata stored in Pinecone:
  ```typescript
  export interface MessageVectorMetadata {
    messageId: string;        // Firestore message document ID
    conversationId: string;   // Primary filter at query time
    senderId: string;        // Firebase Auth UID
    senderUsername: string;  // Denormalized for display
    text: string;           // Original message text
    timestamp: number;       // Unix ms
  }
  ```
- [x] Document in code that Pinecone index dimensions = 512 and metric = cosine

**Verification:**

- [x] Call `embedText("hello world")` and assert result is array of length 512
- [x] Optionally: small script or test that embeds 2 strings and checks cosine similarity is higher for similar text

**Files Created:**

- `backend/lib/embeddings.ts`
- `backend/lib/rag-types.ts`

**Files Modified:**

- `backend/README.md` (if you add embedding notes)

**Test Before Merge:**

- [x] `embedText` returns 512-dimensional vector
- [x] `embedTexts` returns same number of vectors as inputs
- [x] Metadata type is exported and used in next PRs for type safety

---

## PR #3: Short Message Enrichment & Fetch Unindexed Messages

**Goal**: Implement the rule “if a message has fewer than 10 words, prepend the previous message’s text before embedding” and add logic to fetch messages that are not yet in Pinecone.

### Why This Matters

Short messages (“ok”, “sounds good”) have weak semantic signal on their own. Prepending the prior message gives the embedding meaningful context without changing the one-message-one-vector model. This PR does not call Pinecone yet; it only prepares the data and enrichment logic.

### Subtasks

**Enrichment Logic:**

- [ ] File: `backend/lib/message-enrichment.ts`
- [ ] Constant: `SHORT_MESSAGE_WORD_THRESHOLD = 10`
- [ ] Function: `wordCount(text: string): number`
  - Split on whitespace, filter empty, return length
- [ ] Function: `enrichMessageText(message: { text: string }, previousMessage: { text: string } | null): string`
  - If `wordCount(message.text) >= 10`, return `message.text`
  - Else if `previousMessage` exists, return `${previousMessage.text} ${message.text}` (or agreed format)
  - Else return `message.text`
- [ ] Unit tests (or manual test script) for:
  - Long message unchanged
  - Short message with previous: previous text prepended
  - Short message with no previous: unchanged

**Fetch Messages from Firestore:**

- [ ] File: `backend/lib/firestore-messages.ts` (or extend existing Firestore helpers)
- [ ] Function: `getMessagesForConversation(conversationId: string, options?: { limit?: number; orderBy?: 'asc' | 'desc' }): Promise<Message[]>`
  - Query Firestore: `conversations/{conversationId}/messages`
  - Order by timestamp (asc for indexing order so “previous” is well-defined)
  - Return array of messages with: messageId, conversationId, senderId, senderUsername (or lookup), text, timestamp
- [ ] Ensure message shape matches `MessageVectorMetadata` (or a Firestore-facing type that maps to it)

**Identify Unindexed Messages (optional for this PR):**

- [ ] Decide strategy: either “index all messages for conversation on first use” (no per-message “indexed” flag) or add a field `indexedAt` / `vectorized` on the message document
- [ ] If no flag: “unindexed” = all messages in the conversation when we first run indexing for that conversation
- [ ] Document the decision in code or README

**Files Created:**

- `backend/lib/message-enrichment.ts`
- `backend/lib/firestore-messages.ts` (if new)

**Test Before Merge:**

- [ ] Enrichment unit tests pass (long, short with previous, short without previous)
- [ ] `getMessagesForConversation` returns messages in ascending timestamp order with required fields
- [ ] Enriched text is never empty when original message has text (or document edge case)

---

## PR #4: Index Messages — Embed & Upsert to Pinecone

**Goal**: For a given conversation, fetch messages (from Firestore), apply short-message enrichment, embed, and upsert vectors to Pinecone with full metadata.

### Why This Matters

This is the “write path” of the RAG pipeline. Once this works, the index can be populated for any conversation. Search and agent will only read; this PR is the only place that writes vectors (aside from future “incremental index new message” if added later).

### Subtasks

**Orchestration:**

- [ ] File: `backend/lib/index-messages.ts`
- [ ] Function: `indexConversationMessages(conversationId: string): Promise<{ indexed: number; failed?: string[] }>`
  - Call `getMessagesForConversation(conversationId)` (from PR #3)
  - For each message (in order), compute enriched text via `enrichMessageText(current, previous)`
  - Batch embed with `embedTexts(enrichedTexts)`
  - Build Pinecone upsert payload: id = messageId (or composite), values = vector, metadata = MessageVectorMetadata
  - Upsert in batches (e.g. 100 per request if Pinecone limits apply)
  - Return count of indexed messages and optionally any failed IDs
- [ ] Use `getMessagesIndex()` from `backend/lib/pinecone.ts`

**Metadata:**

- [ ] Each vector’s metadata must include: `messageId`, `conversationId`, `senderId`, `senderUsername`, `text` (original message text for display), `timestamp`
- [ ] Ensure Pinecone metadata types are respected (e.g. string, number) per SDK

**Error Handling:**

- [ ] If embedding or upsert fails for a batch, log and optionally record failed IDs; do not throw away partial success if acceptable
- [ ] Document behavior when conversation has 0 messages (no-op, return 0)

**Files Created:**

- `backend/lib/index-messages.ts`

**Files Modified:**

- `backend/lib/rag-types.ts` (if you add helper types for upsert)

**Test Before Merge:**

- [ ] Run `indexConversationMessages` for a test conversation that has messages in Firestore
- [ ] Verify in Pinecone console (or via describeIndexStats) that vector count increased
- [ ] Query index by metadata filter `conversationId` and confirm stored metadata matches Firestore
- [ ] Short messages in test data show enriched text in embedding input (optional: check one vector’s metadata or logs)

---

## PR #5: Retrieval — Query Pinecone by Conversation

**Goal**: Implement the read path: embed a query, query Pinecone filtered by `conversationId`, return top K (10) messages with metadata.

### Why This Matters

Both the search endpoint and the agent will use this single retrieval function. Centralizing it here avoids duplication and keeps the “top K = 10” and filter logic in one place.

### Subtasks

**Retrieval Function:**

- [ ] File: `backend/lib/retrieve-messages.ts`
- [ ] Constant: `DEFAULT_TOP_K = 10`
- [ ] Function: `retrieveMessages(conversationId: string, queryText: string, topK: number = DEFAULT_TOP_K): Promise<MessageVectorMetadata[]>`
  - Call `embedText(queryText)` to get query vector
  - Query Pinecone index with:
    - vector = query vector
    - filter = `{ conversationId: { $eq: conversationId } }` (or equivalent SDK syntax)
    - topK = 10
  - Map results to `MessageVectorMetadata[]` (include score if needed for debugging; TDD uses cosine similarity)
  - Sort by `timestamp` ascending so context order is chronological (optional but recommended for agent)
  - Return array (max length 10)

**Pinecone Query API:**

- [ ] Use Pinecone’s query/query endpoint (not fetch by ID); ensure filter by metadata is supported in your SDK version
- [ ] Handle empty result (e.g. no vectors for that conversation): return []

**Files Created:**

- `backend/lib/retrieve-messages.ts`

**Test Before Merge:**

- [ ] For a conversation that was indexed in PR #4, call `retrieveMessages(conversationId, "some query")` and get up to 10 results with correct metadata
- [ ] Query with nonsense/conversation with no vectors returns []
- [ ] Results are ordered by timestamp (if you added sort)
- [ ] Metadata includes `text`, `senderUsername`, `messageId`, `timestamp` for display/agent use

---

## PR #6: Search Endpoint — Switch to RAG

**Goal**: Replace keyword-based search with semantic search: embed the user’s query and return the top 10 semantically similar messages from Pinecone for the given conversation.

### Why This Matters

Users can find messages by meaning (e.g. “budget concerns” matching “we’re overspending”). The search endpoint becomes the main user-facing RAG feature and validates the pipeline end-to-end.

### Subtasks

**Endpoint Contract:**

- [ ] Identify current search route (e.g. `backend/app/api/search/route.ts` or similar)
- [ ] Request: require `conversationId` and search `query` (body or query params)
- [ ] Response: array of hits, each with message text and metadata (messageId, senderId, senderUsername, timestamp, and optionally score)
- [ ] Document request/response in backend README

**Implementation:**

- [ ] In the search route:
  - Parse `conversationId` and `query`
  - Call `retrieveMessages(conversationId, query, 10)`
  - Map to the response shape the mobile app expects (or update mobile to accept this shape)
  - Return 200 with results; empty array if no matches
- [ ] Do not call Firestore for keyword search; RAG replaces it for this endpoint
- [ ] Optional: ensure conversation exists and user has access (auth) if not already done elsewhere

**Indexing on First Search (optional for this PR):**

- [ ] If the conversation has never been indexed, call `indexConversationMessages(conversationId)` before `retrieveMessages`, then run retrieval (so first search may be slower but returns results)
- [ ] Alternatively: do “index on first use” in a separate PR; here only call `retrieveMessages` and document that indexing must have run

**Error Handling:**

- [ ] Invalid or missing `conversationId` / `query` → 400
- [ ] Embedding or Pinecone errors → 500 with safe message

**Files Modified:**

- `backend/app/api/search/route.ts` (or equivalent)
- `backend/README.md` (search endpoint docs)

**Test Before Merge:**

- [ ] Search with a query that matches some message by meaning returns that message in top 10
- [ ] Search in a conversation with no indexed messages returns [] (or triggers indexing then returns results if you implemented that)
- [ ] Response shape matches what the client expects (manual or integration test)

---

## PR #7: Agent Endpoint — Retrieval Tool

**Goal**: Give the agent a retrieval tool: embed the user’s (or agent’s) query and fetch the top 10 relevant messages from Pinecone for the conversation, then pass them as context to the LLM.

### Why This Matters

The agent can reason over the most relevant parts of the conversation instead of a fixed recent window. Multi-step retrieval (multiple tool calls with different queries in one turn) is possible and can improve answer quality for complex questions.

### Subtasks

**Tool Definition:**

- [ ] Add a “retrieval” or “search_conversation” tool to the agent’s tool list
- [ ] Parameters: `conversationId` (required), `query` (required)
- [ ] Tool implementation: call `retrieveMessages(conversationId, query, 10)` and return the messages (e.g. as a formatted string or array) for the LLM context

**Agent Flow:**

- [ ] When the agent calls this tool, run retrieval and inject the result into the context (e.g. as assistant/tool message or system/user block)
- [ ] Allow multiple tool calls per turn so the agent can ask several “queries” (e.g. one for “decisions”, one for “action items”) if needed
- [ ] Ensure `conversationId` is available in the agent request (from body or auth/session)

**Fallback for Recent Messages:**

- [ ] Per TDD: “very recent messages may not yet be in Pinecone”
- [ ] After getting top 10 from Pinecone, fetch the most recent N messages (e.g. 5–10) from Firestore for that conversation
- [ ] Append them to the context passed to the LLM (or merge and dedupe by messageId) so the agent always sees the latest messages even if not yet indexed
- [ ] Document the fallback in code

**Files Modified:**

- Agent route/handler (e.g. `backend/app/api/agent/route.ts`)
- Any shared types for tool definitions

**Test Before Merge:**

- [ ] Agent request that triggers retrieval tool returns an answer that uses retrieved message content
- [ ] Multiple retrieval tool calls in one turn work (if your agent framework supports it)
- [ ] Fallback: in a conversation with no or few vectors, agent still receives recent Firestore messages and can answer about them
- [ ] No regression on agent behavior when retrieval is not used

---

## PR #8: Indexing Triggers & Documentation

**Goal**: Clarify when indexing runs (e.g. on first search or first agent use for a conversation), implement any missing trigger, and document limitations and operations.

### Why This Matters

Without a clear trigger, some conversations may never be indexed and search/agent would return empty or weak results. Documenting “no real-time indexing for MVP” sets expectations and guides future work (e.g. index-on-send).

### Subtasks

**Index-on-First-Use (if not done in PR #6):**

- [ ] For search: before calling `retrieveMessages`, check if the conversation has any vectors (e.g. query with a dummy vector and topK=1, or use index stats if per-namespace stats exist)
- [ ] If none, call `indexConversationMessages(conversationId)` then `retrieveMessages`
- [ ] Same for agent: on first retrieval tool use for a conversation, ensure indexing has run (same check + index if empty)
- [ ] Optional: cache “already indexed” in memory or short-lived store to avoid repeated checks in the same deployment

**Incremental Indexing (optional for MVP):**

- [ ] TDD allows “incrementally as messages are sent”
- [ ] If implementing: on message send (or via a small background job), embed and upsert the new message only; ensure short-message enrichment uses the previous message from Firestore
- [ ] If deferred: document “MVP: index on first retrieval only; incremental indexing in a future PR”

**Documentation:**

- [ ] In `backend/README.md` (or TDD_RAG_Pipeline.md):
  - When indexing runs (first use vs incremental)
  - Fallback: “most recent N messages from Firestore” appended for agent when messages might not be in Pinecone yet
  - Limitation: 100k vectors (Pinecone free tier); one vector per message
  - Short-message enrichment rule (< 10 words → prepend previous)
- [ ] List required env vars again: `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, plus OpenAI for embeddings

**Files Modified:**

- Search route and/or agent route (index-on-first-use)
- `backend/README.md`
- Optionally: new file for “index on new message” if you add it

**Test Before Merge:**

- [ ] New conversation: first search (or first agent retrieval) triggers indexing; subsequent calls use existing vectors (no duplicate indexing if you added a guard)
- [ ] Documentation is accurate and linked from main README or TDD
- [ ] No breaking changes to search or agent API contracts

---

## Summary

| PR | Focus |
|----|--------|
| **#1** | Pinecone setup, index config, backend client |
| **#2** | Embedding service + metadata schema |
| **#3** | Short-message enrichment + fetch messages from Firestore |
| **#4** | Index messages: embed + upsert to Pinecone |
| **#5** | Retrieval: query Pinecone by conversationId, top 10 |
| **#6** | Search endpoint uses RAG instead of keyword |
| **#7** | Agent endpoint has retrieval tool + recent-message fallback |
| **#8** | Indexing triggers (first use) + docs and optional incremental |

**Dependencies:** 1 → 2 → 3 → 4 → 5; then 6 and 7 depend on 5; 8 ties up triggers and docs.

**Reference:** [TDD_RAG_Pipeline.md](./TDD_RAG_Pipeline.md) — problem statement, goals, tech stack (Pinecone, text-embedding-3-small), key decisions (one message = one chunk, top K = 10, metadata filter by conversationId), and architecture.
