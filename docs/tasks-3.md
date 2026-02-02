# Tasks for RAG + Vector Database + Redis Caching Implementation

## Overview

This document outlines the implementation of Retrieval Augmented Generation (RAG) with vector databases and Redis caching to optimize AI features, reduce costs, and improve response times.

**Goal**: Demonstrate production-level optimization techniques learned in class while significantly improving the app's AI capabilities.

**Key Benefits**:

- 80% reduction in token usage for agent queries
- 70% reduction in API calls via caching
- Semantic search by meaning, not just keywords
- Cross-conversation insights
- Sub-second cached responses

---

## Cost & Performance Impact

| Metric                        | Before RAG + Redis                    | After RAG + Redis                    |
| ----------------------------- | ------------------------------------- | ------------------------------------ |
| **Avg Response Time**         | 2-3s                                  | 50ms (cached) / 1.5s (uncached)      |
| **Token Usage (Agent)**       | 50 messages × 200 tokens = 10k tokens | 10 messages × 200 tokens = 2k tokens |
| **Cost per Agent Query**      | ~$0.01                                | ~$0.002 (cached: $0)                 |
| **API Calls**                 | 100% of requests                      | 30% cached (70% reduction)           |
| **Search Quality**            | Keyword + semantic (limited)          | Semantic similarity (contextual)     |
| **Cross-Conversation Search** | Impossible                            | Native support                       |

**Additional Costs**:

- Pinecone: Free tier (100k vectors, sufficient for demo)
- Upstash Redis: Free tier (10k requests/day, sufficient for demo)
- OpenAI Embeddings: $0.02 per 1M tokens (~$0.50 for 1000 messages)

**Total Additional Cost**: ~$0.50 (one-time for initial embeddings)

---

## PR #18: Semantic Message Search with Pinecone

**Goal**: Implement semantic search that finds messages by meaning, not just keywords.

**What to Show Professors**:

- Side-by-side demo: Keyword vs Semantic search
- "Watch how 'budget issues' finds 'money problems' and 'cost concerns'"

### Backend Tasks

**Task 1: Set up Pinecone Vector Database**

- [ ] Create Pinecone account and get API key
- [ ] Create index named "message-embeddings" with 1536 dimensions (for `text-embedding-3-small`)
- [ ] Add `@pinecone-database/pinecone` to backend dependencies
- [ ] Add `PINECONE_API_KEY` and `PINECONE_ENVIRONMENT` to `.env.local`
- [ ] Create `backend/lib/pinecone.ts` with Pinecone client initialization

**Task 2: Create embedding utilities**

- [ ] Create `backend/lib/embeddings.ts`
- [ ] Implement `generateEmbedding(text: string): Promise<number[]>` using OpenAI `text-embedding-3-small`
- [ ] Implement `cosineSimilarity(vecA: number[], vecB: number[]): number` helper
- [ ] Add error handling for embedding API failures

**Task 3: Update existing messages with embeddings**

- [ ] Create `backend/app/api/embeddings/backfill/route.ts`
- [ ] Implement batch processing to generate embeddings for all existing messages
- [ ] Store embeddings in Pinecone with metadata: `{ messageId, conversationId, senderId, timestamp, text }`
- [ ] Add progress logging for backfill process
- [ ] Test with 100+ messages to verify performance

**Task 4: Implement semantic search endpoint**

- [ ] Create `backend/app/api/search-semantic/route.ts`
- [ ] Accept parameters: `{ conversationId?, query, limit?, threshold? }`
- [ ] Generate embedding for query
- [ ] Query Pinecone for similar vectors (filter by conversationId if provided)
- [ ] Fetch full message data from Firebase for top results
- [ ] Return ranked results with similarity scores
- [ ] Add request validation with Zod

**Task 5: Update message creation to include embeddings**

- [ ] Modify message creation flow to generate embeddings automatically
- [ ] Store embedding in Pinecone when new message is sent
- [ ] Update Firestore message document with `embeddingId` reference (optional)
- [ ] Handle embedding failures gracefully (message still sends, embedding retried later)

### Mobile App Tasks

**Task 6: Create semantic search UI**

- [ ] Add search icon to ChatScreen header
- [ ] Create `SemanticSearchModal` component with:
  - Search input field
  - Toggle: "Keyword" vs "Semantic" search
  - Results list with similarity scores
  - Tap result to scroll to message in chat
- [ ] Add loading state and error handling

**Task 7: Integrate semantic search API**

- [ ] Add `semanticSearch(conversationId, query)` to `aiService.js`
- [ ] Handle response streaming if needed
- [ ] Display results in modal with similarity percentage
- [ ] Highlight matched text in search results

**Task 8: Add cross-conversation search**

- [ ] Create new screen: `GlobalSearchScreen`
- [ ] Add to navigation stack
- [ ] Allow search across all user's conversations
- [ ] Group results by conversation
- [ ] Navigate to conversation + message on tap

### Testing & Polish

**Task 9: Test semantic search quality**

- [ ] Test with synonyms: "budget" → finds "money", "cost", "financial"
- [ ] Test with concepts: "deadline" → finds "due date", "timeline", "urgency"
- [ ] Test with questions: "Who is responsible?" → finds assignments
- [ ] Compare side-by-side with keyword search
- [ ] Document example queries that work well

**Task 10: Performance optimization**

- [ ] Benchmark embedding generation time (target: <500ms)
- [ ] Benchmark Pinecone query time (target: <200ms)
- [ ] Add caching for frequently searched queries (prepare for PR #19)
- [ ] Test with 1000+ messages in a conversation

---

## PR #19: Redis Caching Layer with Upstash

**Goal**: Implement intelligent caching to reduce API calls by 70% and achieve sub-second responses.

**What to Show Professors**:

- Performance metrics: "First request: 2s, cached request: 50ms"
- Cost savings: "Reduced API calls by 70%"

### Backend Tasks

**Task 1: Set up Upstash Redis**

- [ ] Create Upstash account and get Redis URL
- [ ] Add `@upstash/redis` to backend dependencies
- [ ] Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local`
- [ ] Create `backend/lib/cache.ts` with Redis client initialization

**Task 2: Implement cache utilities**

- [ ] Create `backend/lib/cache-helpers.ts`
- [ ] Implement `getCached<T>(key: string): Promise<T | null>`
- [ ] Implement `setCached<T>(key: string, value: T, ttl?: number): Promise<void>`
- [ ] Implement `invalidateCache(pattern: string): Promise<void>`
- [ ] Implement `generateCacheKey(prefix: string, params: object): string` with consistent hashing

**Task 3: Cache message embeddings**

- [ ] Modify `generateEmbedding()` to check Redis first
- [ ] Cache key format: `embedding:${messageId}`
- [ ] Set TTL to never expire (embeddings don't change)
- [ ] Add cache hit/miss logging for metrics

**Task 4: Cache LLM responses**

- [ ] Update `/api/summarize` to cache results
- [ ] Cache key format: `summary:${conversationId}:${lastMessageTimestamp}`
- [ ] Set TTL to 1 hour
- [ ] Invalidate on new message
- [ ] Update `/api/extract-actions` with same pattern
- [ ] Update `/api/decisions` with same pattern

**Task 5: Cache semantic search results**

- [ ] Update `/api/search-semantic` to cache results
- [ ] Cache key format: `search:${conversationId}:${hashQuery(query)}`
- [ ] Set TTL to 15 minutes
- [ ] Invalidate when new message is sent to conversation
- [ ] Return cache metadata in response: `{ cached: boolean, timestamp: number }`

**Task 6: Implement cache invalidation strategy**

- [ ] Create `backend/lib/cache-invalidation.ts`
- [ ] Implement `invalidateConversationCache(conversationId: string)`
- [ ] Hook into message creation to invalidate:
  - Summary cache for that conversation
  - Search cache for that conversation
  - Agent cache for that conversation
- [ ] Keep embedding cache (never invalidate)
- [ ] Add logging for invalidation events

### Analytics & Monitoring

**Task 7: Add cache performance tracking**

- [ ] Create `backend/lib/metrics.ts`
- [ ] Track cache hit/miss rates
- [ ] Track response times (cached vs uncached)
- [ ] Track API cost savings (estimated)
- [ ] Create simple dashboard endpoint: `/api/metrics`

**Task 8: Add cache headers to responses**

- [ ] Add `X-Cache: HIT` or `X-Cache: MISS` header
- [ ] Add `X-Cache-Age: <seconds>` header
- [ ] Add `X-Response-Time: <ms>` header
- [ ] Log performance metrics server-side

### Mobile App Tasks

**Task 9: Display cache indicators (optional)**

- [ ] Show cache indicator in UI for debug mode
- [ ] Display response time in dev tools
- [ ] Add "Clear Cache" option in settings

### Testing & Validation

**Task 10: Test cache behavior**

- [ ] Test cache hit for identical queries
- [ ] Test cache invalidation on new message
- [ ] Test TTL expiration (wait 1 hour for summary cache)
- [ ] Test cache miss handling (cache unavailable)
- [ ] Measure performance improvements (before/after metrics)

**Task 11: Load testing**

- [ ] Simulate 100 requests to same endpoint
- [ ] Verify first request is slow, subsequent requests are fast
- [ ] Verify cache hit rate >90% for repeated queries
- [ ] Test with 10k requests/day to stay within free tier

---

## PR #20: RAG for Agent Context Retrieval

**Goal**: Use RAG to send only relevant messages to the agent, reducing token usage by 80%.

**What to Show Professors**:

- "Agent now uses 2k tokens instead of 10k tokens per query"
- "Smarter context selection = better responses"

### Backend Tasks

**Task 1: Create RAG context retrieval tool**

- [ ] Create `backend/lib/rag-context.ts`
- [ ] Implement `getRelevantMessages(conversationId: string, userQuery: string, limit: number = 10)`
- [ ] Generate embedding for user query
- [ ] Query Pinecone for most similar messages in conversation
- [ ] Return top N most relevant messages
- [ ] Add fallback to recent messages if semantic search fails

**Task 2: Update agent tools to use RAG**

- [ ] Modify `getConversationMessages` tool in `backend/app/api/agent/route.ts`
- [ ] Replace "fetch all 50 messages" with RAG-based retrieval
- [ ] Use `getRelevantMessages(conversationId, userQuery, 10)`
- [ ] Update tool description to explain RAG behavior
- [ ] Keep `limit` parameter for backwards compatibility

**Task 3: Add hybrid retrieval strategy**

- [ ] Implement `getHybridContext(conversationId: string, userQuery: string)`
- [ ] Combine:
  - 5 most recent messages (for recency)
  - 10 most semantically relevant messages (for context)
  - Deduplicate if overlap
- [ ] Return combined list sorted by timestamp
- [ ] Add to agent as new tool: `getRelevantContext`

**Task 4: Optimize agent system prompt**

- [ ] Update system prompt to explain RAG context
- [ ] Add guidance: "You're seeing the most relevant messages, not all messages"
- [ ] Add instruction: "If context is insufficient, ask user to be more specific"
- [ ] Update few-shot examples to reflect RAG usage

**Task 5: Add context quality scoring**

- [ ] Implement `scoreContextQuality(messages: Message[], userQuery: string): number`
- [ ] Calculate average similarity score
- [ ] If score < 0.7, add warning to agent response
- [ ] Agent can request more context or different query

### Testing & Optimization

**Task 6: Test RAG vs. non-RAG agent**

- [ ] Create test suite with 10 example queries
- [ ] Compare responses:
  - RAG (10 relevant messages)
  - Non-RAG (50 recent messages)
- [ ] Measure response quality (manual evaluation)
- [ ] Measure token usage (should be 80% reduction)
- [ ] Measure response time (should be faster with less tokens)

**Task 7: Test edge cases**

- [ ] Test with empty conversation (no messages)
- [ ] Test with very long messages (truncation needed)
- [ ] Test with very short query ("summarize")
- [ ] Test with specific references ("What did John say about X?")
- [ ] Test fallback behavior when Pinecone is unavailable

**Task 8: Benchmark performance improvements**

- [ ] Measure before/after:
  - Average token usage per agent query
  - Average response time
  - Cost per query
  - Response quality (manual scoring)
- [ ] Document metrics for professor demo

### Mobile App Tasks

**Task 9: Update agent UI to show context quality**

- [ ] Add indicator: "Using X relevant messages from Y total"
- [ ] Show similarity score if context quality is low
- [ ] Suggest rephrasing query if context insufficient

**Task 10: Add context debugging view (dev mode)**

- [ ] Show which messages were retrieved by RAG
- [ ] Display similarity scores
- [ ] Allow manual selection of messages for agent context

---

## Documentation & Demo Preparation

**Task 1: Update README files**

- [ ] Add RAG + Vector DB setup instructions to `backend/README.md`
- [ ] Document Pinecone setup steps
- [ ] Document Upstash Redis setup steps
- [ ] Add environment variable requirements
- [ ] Add architecture diagrams

**Task 2: Create demo script**

- [ ] Prepare side-by-side comparison: Keyword vs Semantic search
- [ ] Prepare performance metrics screenshots
- [ ] Prepare cost savings calculations
- [ ] Practice explaining RAG concept (30 seconds)
- [ ] Practice showing cache indicators

**Task 3: Add to demo video**

- [ ] Show semantic search finding related concepts
- [ ] Show cache performance (first request vs cached)
- [ ] Show agent using less context but getting better results
- [ ] Display metrics dashboard (cache hit rate, cost savings)

**Task 4: Update memory bank**

- [ ] Add RAG implementation details to `systemPatterns.md`
- [ ] Add performance metrics to `progress.md`
- [ ] Update `techContext.md` with Pinecone and Upstash

---

## Success Criteria

### Semantic Search (PR #18)

- ✅ Finds messages by meaning, not just keywords
- ✅ "budget" finds "money", "cost", "financial"
- ✅ Cross-conversation search works
- ✅ Response time <2s for search
- ✅ Side-by-side demo prepared

### Redis Caching (PR #19)

- ✅ Cache hit rate >70% for repeated queries
- ✅ Cached responses <100ms
- ✅ Uncached responses <2s
- ✅ Automatic cache invalidation on new messages
- ✅ Performance metrics dashboard working

### RAG Agent (PR #20)

- ✅ Agent uses 10 messages instead of 50
- ✅ Token usage reduced by 80%
- ✅ Response quality maintained or improved
- ✅ Context quality scoring working
- ✅ Fallback behavior tested

### Overall

- ✅ Free tier limits sufficient for demo
- ✅ All features work together seamlessly
- ✅ Performance improvements measurable and significant
- ✅ Demo video includes RAG explanation
- ✅ Professors understand production-level optimization

---

## Implementation Priority

**If time is limited, implement in this order:**

1. **PR #19 (Redis Caching)** - Easiest, biggest immediate impact, clear metrics
2. **PR #18 (Semantic Search)** - Most impressive demo, shows RAG understanding
3. **PR #20 (RAG Agent)** - Most complex, but shows advanced optimization

**Why this order?**

- Caching is quick to implement and shows immediate ROI
- Semantic search is the "wow" factor for professors
- RAG agent optimization is icing on the cake

---

## Timeline Estimate

| PR                      | Estimated Time | Complexity |
| ----------------------- | -------------- | ---------- |
| PR #18: Semantic Search | 3-4 hours      | Medium     |
| PR #19: Redis Caching   | 1-2 hours      | Easy       |
| PR #20: RAG Agent       | 2-3 hours      | Medium     |
| **Total**               | **6-9 hours**  | -          |

**Recommended schedule**: Implement over 1-2 days post-mission submission.
