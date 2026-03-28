# Context for New Cursor Tab

**Last updated**: After Message Reactions + RAG PR #1–#2. Use this file when opening a new tab to restore context quickly.

---

## Project in One Sentence

React Native (Expo) messaging app with Firebase (Auth, Firestore, Realtime DB, Storage), Vercel backend (Next.js) for AI (summarize, actions, search, priority, decisions, agent), and RAG pipeline in progress (Pinecone + OpenAI embeddings).

---

## Current State

- **Mobile** (`mobile-app/`): Auth, profiles, 1:1 and group chats, push notifications, read receipts, dark mode, **message reactions** (long-press → picker; tap reaction to add/remove; one reaction per user per emoji; client `Timestamp.now()` in Firestore).
- **Backend** (`backend/`): All API routes use `authenticate()` (Firebase ID token + Upstash rate limit). AI: summarize, extract-actions, search (hybrid semantic+keyword), priority, decisions, agent. **RAG**: Pinecone index `messages` (512 dims, cosine); `lib/pinecone.ts` (`getMessagesIndex()`); `lib/embeddings.ts` (`embedText`, `embedTexts`, 512 dims); `lib/rag-types.ts` (`MessageVectorMetadata`).
- **Tasks**: `docs/tasks-1.md`, `docs/tasks-2.md`, `docs/tasks-3.md` (PR #19 only: error handler, health check, push profile photos), **`docs/tasks-TDD.md`** (RAG: PR #1–#2 done, **PR #3 next** — enrichment + fetch Firestore messages).

---

## What to Do Next (Pick One)

1. **RAG PR #3** (tasks-TDD.md): Short-message enrichment (< 10 words → prepend previous message) + `getMessagesForConversation()` from Firestore. Files: `backend/lib/message-enrichment.ts`, `backend/lib/firestore-messages.ts` (or extend existing).
2. **PR #19** (tasks-3.md): Backend error handler, health check endpoint, optional push notification profile photos.

---

## Key Paths

| What | Where |
|------|--------|
| RAG design | `docs/TDD_RAG_Pipeline.md` |
| RAG task list (7 PRs) | `docs/tasks-TDD.md` |
| Polish (PR #19) | `docs/tasks-3.md` |
| Pinecone client | `backend/lib/pinecone.ts` |
| Embeddings (512 dims) | `backend/lib/embeddings.ts` |
| RAG metadata type | `backend/lib/rag-types.ts` |
| Message reactions | `mobile-app/src/utils/reactions.js`, `MessageReactions.js`, `ReactionPicker.js` |
| Memory bank | `memory-bank/activeContext.md`, `memory-bank/progress.md` |

---

## Conventions

- Backend: TypeScript, `@/lib/` imports, env in `.env.local` (not committed).
- RAG: Index dimensions **512** (not 1536); `text-embedding-3-small` with `providerOptions: { openai: { dimensions: 512 } }`.
- Reactions: Firestore `reactions` array of `{ userId, emoji, timestamp }`; use **Timestamp.now()** (client) — `serverTimestamp()` not allowed inside `arrayUnion()`.
