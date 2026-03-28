# Context for New Cursor Tab

**Last updated**: RAG TDD PRs **#1–#8** shipped — top **K = 5**, **full backfill when a conversation has zero Pinecone vectors**, **incremental** `POST /api/index-message` after sends. Use this file when opening a new tab to restore context quickly.

---

## Project in One Sentence

React Native (Expo) messaging app with Firebase (Auth, Firestore, Realtime DB, Storage), Vercel backend (Next.js) for AI (summarize, actions, **RAG search**, priority, decisions, **RAG-aware agent**), and a **Pinecone + OpenAI** RAG pipeline (512-dim embeddings, `messages` index).

---

## Recent context (what changed lately)

- **RAG TDD (`docs/tasks-TDD.md`) — PRs #1–#7 are implemented in the backend:** Pinecone client and env, `embedText` / `embedTexts`, `MessageVectorMetadata`, short-message enrichment (`message-enrichment.ts`), Firestore fetch for indexing (`firestore-messages.ts`), **`indexConversationMessages`** (batch upsert), **`retrieveMessages`** / **`retrieveSearchHits`** (Pinecone query + metadata parsing), **`POST /api/search`** uses semantic RAG only (no Firestore message scan for search), agent tool **`retrieveRelevantMessages`** plus **`buildAgentRetrievalContext`** (Pinecone hits + recent Firestore lines, deduped). Vitest covers enrichment and retrieve-utils.
- **PR #8 (done):** If Pinecone has **no** vectors for `conversationId`, treat as a **pre-indexing** thread and run **`indexConversationMessages`** (full backfill) before search or agent retrieval. Otherwise **incremental** only: mobile **`requestIndexMessageForRag`** → **`POST /api/index-message`** after `addDoc` (fire-and-forget). No `ragFullBackfillCompleted` Firestore flag — **empty Pinecone slice for that conversation** is the signal. Retrieval default **topK = 5**.

---

## Current State

- **Mobile** (`mobile-app/`): Auth, profiles, 1:1 and group chats, push notifications, read receipts, dark mode, **message reactions** (long-press → picker; tap reaction to add/remove; one reaction per user per emoji; client `Timestamp.now()` in Firestore).
- **Backend** (`backend/`): All API routes use `authenticate()` (Firebase ID token + Upstash rate limit). AI: summarize, extract-actions, **`/api/search` RAG** (`retrieveSearchHits`), priority, decisions, **agent** (`retrieveRelevantMessages` + `agent-retrieval-context.ts`). **RAG libs:** `lib/index-messages.ts`, `lib/retrieve-messages.ts`, `lib/agent-retrieval-context.ts`, `lib/retrieve-messages-utils.ts`, etc.
- **Tasks**: `docs/tasks-1.md`, `docs/tasks-2.md`, `docs/tasks-3.md` (PR #19 polish), **`docs/tasks-TDD.md`** — **RAG PR #8 complete** (backfill-if-empty + incremental index + docs).

---

## What to Do Next (Pick One)

1. **PR #19** (`tasks-3.md`): Backend error handler, health check endpoint, optional push notification profile photos.

---

## Key Paths

| What | Where |
|------|--------|
| RAG design | `docs/TDD_RAG_Pipeline.md` |
| RAG task list (8 PRs) | `docs/tasks-TDD.md` |
| Polish (PR #19) | `docs/tasks-3.md` |
| Pinecone client | `backend/lib/pinecone.ts` |
| Embeddings (512 dims) | `backend/lib/embeddings.ts` |
| RAG metadata type | `backend/lib/rag-types.ts` |
| Message reactions | `mobile-app/src/utils/reactions.js`, `MessageReactions.js`, `ReactionPicker.js` |
| Short-message enrichment | `backend/lib/message-enrichment.ts` (`buildEnrichedTextsForIndex`, `enrichMessageText`) |
| Firestore messages for RAG | `backend/lib/firestore-messages.ts` (`getMessagesForConversation`, `getMessagesFromFirebase`) |
| Index → Pinecone | `backend/lib/index-messages.ts` (`indexConversationMessages`, `indexSingleConversationMessage`, `processIndexMessageAfterSend`) |
| RAG backfill guard | `ensureConversationBackfilledForRag` in `index-messages.ts` (used by search + agent context) |
| Incremental index API | `POST /api/index-message` `{ conversationId, messageId }` |
| Query Pinecone | `backend/lib/retrieve-messages.ts` (`retrieveMessages`, `retrieveSearchHits`), `retrieve-messages-utils.ts` |
| Agent RAG context | `backend/lib/agent-retrieval-context.ts` (`buildAgentRetrievalContext`) |
| Memory bank | `memory-bank/activeContext.md`, `memory-bank/progress.md` |

---

## Conventions

- Backend: TypeScript, `@/lib/` imports, env in `.env.local` (not committed).
- RAG: Index dimensions **512** (not 1536); `text-embedding-3-small` with `providerOptions: { openai: { dimensions: 512 } }`.
- Reactions: Firestore `reactions` array of `{ userId, emoji, timestamp }`; use **Timestamp.now()** (client) — `serverTimestamp()` not allowed inside `arrayUnion()`.
