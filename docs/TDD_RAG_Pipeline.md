# Technical Design Document: RAG Pipeline for Semantic Search & Agent Context

## Overview

This document outlines the technical design for adding a Retrieval Augmented Generation (RAG) pipeline to the messaging app backend. The pipeline will power two features: semantic search across conversation messages, and context-aware retrieval for the AI agent. Both features share the same underlying vector infrastructure.

---

## Problem Statement

The current backend has two limitations:

**Search**: The existing search endpoint relies on keyword matching, which only finds exact or near-exact text. A user searching "budget concerns" will not find messages containing "we're overspending" or "financial constraints." This limits the usefulness of search for the Remote Team Professional persona, who needs to surface information across long conversation histories.

**Agent**: The AI agent currently fetches a fixed window of recent messages as context regardless of what the user is asking. As conversations grow longer, the most relevant messages may fall outside this window entirely. The agent cannot reason over a conversation's full history — only its tail.

---

## Goals

- Enable semantic search so users can find messages by meaning, not just keywords
- Enable the agent to retrieve only the most relevant messages for a given query rather than a fixed recent window
- Keep the solution within free tier infrastructure limits for MVP
- Introduce no new deployment infrastructure — the solution must work within the existing Vercel backend

---

## Non-Goals

- Real-time embedding of messages as they are sent (embeddings are generated on-demand or in batch)
- Re-ranking, HyDE, query decomposition, or other advanced RAG techniques
- Cross-user or cross-conversation search
- Caching layer (may be added post-MVP)

---

## Tech Stack Additions

| Component | Technology | Reason |
|---|---|---|
| Vector Database | Pinecone (free tier) | Fully managed, purpose-built for vector search, generous free tier (100k vectors), minimal latency from Vercel US East |
| Embedding Model | OpenAI `text-embedding-3-small` | Already using OpenAI, small model is fast and cheap, 1536-dimensional output |

No new deployment platform is required. Pinecone is accessed via HTTP SDK from existing Vercel serverless functions.

---

## Key Decisions

### 1. Basic RAG — No Advanced Reasoning Layers

**Decision**: Implement straightforward retrieval — embed the query, query Pinecone, return top K results to the LLM. No re-ranking, no HyDE, no query decomposition.

**Rationale**: Advanced RAG techniques deliver diminishing returns at this scale. The conversation corpus is relatively small and domain-specific (team messaging). Basic RAG with good metadata filtering captures the vast majority of the benefit. Complexity can be added later if retrieval quality proves insufficient.

---

### 2. One Message = One Chunk

**Decision**: Each individual message is embedded as its own vector. There is no grouping, splitting, or windowing of messages into larger chunks.

**Rationale**: Messages in a chat app are already natural semantic units — they are discrete, human-authored expressions of a single thought, sent at a specific moment by a specific person. Unlike long-form documents, there are no arbitrary text boundaries to work around. One-to-one mapping between messages and vectors also makes metadata management simple and cache invalidation straightforward.

---

### 3. Short Message Enrichment (< 10 Words)

**Decision**: If a message contains fewer than 10 words, the text of the immediately preceding message is prepended to it before embedding.

**Rationale**: Very short messages ("ok", "sounds good", "agreed", "lol") produce low-quality embeddings because they carry almost no semantic signal on their own. In conversational context, these messages derive their meaning entirely from what preceded them. Prepending the prior message's text before embedding captures that context without complicating the chunking strategy.

---

### 4. Top K = 10

**Decision**: Retrieve the 10 most semantically similar messages for any given query.

**Rationale**: 10 results provides enough context for the LLM to reason meaningfully without inflating token usage. For search, 10 results is a natural UI limit. For agent context, 10 focused messages outperforms 50 loosely related messages both in response quality and cost. This value should be revisited if retrieval quality testing reveals meaningful misses.

---

### 5. Filter by Conversation ID via Pinecone Metadata

**Decision**: All vectors are stored in a single Pinecone index. Conversation-scoped retrieval is enforced by filtering on `conversationId` metadata at query time, not by using separate indexes or namespaces per conversation.

**Rationale**: Pinecone's free tier allows only one index. However, one index is sufficient — Pinecone metadata filtering is efficient and does not require index-level separation. Storing all messages in one index with metadata also enables future cross-conversation search without any infrastructure changes.

---

## Metadata Schema

Each vector stored in Pinecone carries the following metadata:

| Field | Type | Description |
|---|---|---|
| `messageId` | string | Firestore message document ID |
| `conversationId` | string | Firestore conversation document ID — used as the primary filter at query time |
| `senderId` | string | Firebase Auth UID of the message sender |
| `senderUsername` | string | Denormalized username for display without additional Firestore lookups |
| `text` | string | Original message text (stored for display in results without a Firestore roundtrip) |
| `timestamp` | number | Unix timestamp in milliseconds — used for sorting results chronologically after retrieval |

---

## Architecture

### Embedding Flow

When a query comes in (either from the search endpoint or the agent), the backend:

1. Embeds the query text using `text-embedding-3-small`
2. Queries Pinecone with the resulting vector, filtered by `conversationId`
3. Returns the top 10 most similar messages by cosine similarity
4. Passes those messages to the LLM as context

When messages need to be indexed (on first use of a conversation, or incrementally as messages are sent), the backend:

1. Fetches unindexed messages from Firestore
2. Applies the short message enrichment rule (< 10 words → prepend prior message)
3. Embeds each message
4. Upserts vectors to Pinecone with full metadata

### Index Structure

One Pinecone index named `messages`. All conversations share this index. Queries always include a `conversationId` filter to scope retrieval to the relevant conversation.

---

## Affected Endpoints

### Search Endpoint

Currently performs keyword matching against Firestore. With RAG, the endpoint embeds the user's search query and retrieves semantically similar messages from Pinecone instead. The result set is ranked by similarity score, then returned to the client with message text and metadata included.

### Agent Endpoint

Currently fetches the N most recent messages from Firestore as context. With RAG, the agent has access to a retrieval tool that embeds the user's query (or a sub-query the agent decides to form) and fetches the 10 most relevant messages from Pinecone. The agent can call this tool multiple times with different queries within a single turn, enabling multi-step retrieval for complex requests.

---

## Pinecone Index Configuration

| Setting | Value |
|---|---|
| Index name | `messages` |
| Dimensions | 1536 (matches `text-embedding-3-small` output) |
| Metric | Cosine similarity |
| Tier | Free (100k vector limit) |
| Cloud / Region | AWS us-east-1 (co-located with Vercel US East) |

---

## Constraints & Limitations

**100k vector limit**: The free Pinecone tier supports 100,000 vectors. At one vector per message, this supports 100,000 total indexed messages across all conversations — more than sufficient for an MVP.

**Embedding cost**: `text-embedding-3-small` costs $0.02 per 1 million tokens. Embedding 10,000 messages of average 20 words each costs roughly $0.01. This is negligible.

**No real-time indexing**: For MVP, messages are indexed on first retrieval need rather than as they are sent. This means very recent messages may not yet be in Pinecone. A simple fallback (appending the most recent N messages from Firestore to the retrieved context) mitigates this.

**Short message enrichment is approximate**: Prepending the prior message captures immediate conversational context but not thread-level context. This is an acceptable tradeoff for MVP.
