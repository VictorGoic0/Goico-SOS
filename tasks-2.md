# Messaging App - AI Features Implementation Task List

## Overview

This document outlines the implementation of AI-powered features for the Remote Team Professional persona using Vercel AI SDK and OpenAI. These features build upon the core messaging infrastructure from tasks.md.

**Total PRs:** 4
**Timeline:** 3-4 days after core messaging is complete
**Target Persona:** Remote Team Professional

## PR #14: AI Foundation & Basic Features Setup

**Goal**: Set up Vercel AI SDK, OpenAI integration, and implement the first 2 AI features (Thread Summarization & Action Item Extraction)

### Why This Matters

These are the foundational AI features that provide immediate value to remote teams. Thread summarization helps with information overload, while action item extraction prevents missed tasks.

### Subtasks

**Install AI Dependencies:**

- [ ] Install Vercel AI SDK and OpenAI provider:

  ```bash
  npm install ai @ai-sdk/openai zod
  ```

- [ ] Verify installation and check package.json includes:
  ```json
  {
    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.x",
    "zod": "^3.22.0"
  }
  ```

**Environment Setup:**

- [ ] Add OpenAI API key to `.env`:

  ```
  EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
  ```

- [ ] Verify API key is accessible in app (console.log test)
- [ ] Ensure `.env*` is in `.gitignore` (already done)

**Create AI Service Layer:**

- [ ] File: `src/services/aiService.js`
- [ ] Import required modules:

  ```javascript
  import { generateText, generateObject } from "ai";
  import { openai } from "@ai-sdk/openai";
  import { z } from "zod";
  ```

- [ ] Add error handling wrapper:
  ```javascript
  const withErrorHandling = async (fn, fallback) => {
    try {
      return await fn();
    } catch (error) {
      console.error("AI Service Error:", error);
      // Handle rate limits, API errors, timeouts
      throw new Error(
        "AI service temporarily unavailable. Please try again later."
      );
    }
  };
  ```

**Implement Thread Summarization:**

- [ ] File: `src/services/aiService.js`
- [ ] Function: `summarizeThread(conversationId)`

  - Fetch last 50 messages from conversation
  - Create prompt focusing on key topics, decisions, action items
  - Use `generateText` with GPT-4-turbo
  - Return formatted summary
  - Target response time: <2 seconds

- [ ] Prompt template:

  ```javascript
  const prompt = `Summarize this conversation thread in 3-4 bullet points. Focus on key topics, decisions, and action items:
  
  ${messages.map((m) => `${m.senderUsername}: ${m.text}`).join("\n")}
  
  Provide a concise summary with:
  - Main topics discussed
  - Key decisions made
  - Outstanding questions`;
  ```

**Implement Action Item Extraction:**

- [ ] File: `src/services/aiService.js`
- [ ] Define ActionItemSchema with Zod:

  ```javascript
  const ActionItemSchema = z.object({
    items: z.array(
      z.object({
        task: z.string(),
        assignedTo: z.string().nullable(),
        deadline: z.string().nullable(),
        status: z.enum(["pending", "completed"]),
        context: z.string(),
      })
    ),
  });
  ```

- [ ] Function: `extractActionItems(conversationId)`
  - Fetch last 100 messages from conversation
  - Use `generateObject` with ActionItemSchema
  - Extract tasks, assignments, deadlines
  - Return structured action items
  - Target response time: <2 seconds

**Create UI Components:**

- [ ] File: `src/components/ThreadSummaryModal.js`

  - Modal overlay component
  - Display AI-generated summary
  - Loading state while processing
  - Close button
  - Copy summary button (bonus)

- [ ] File: `src/screens/ActionItemsScreen.js`
  - List view of extracted action items
  - Each item shows: task, assigned person, deadline, status
  - Checkbox to mark complete
  - "View in conversation" links
  - Refresh button to re-extract

**Add Navigation:**

- [ ] File: `src/navigation/AppNavigator.js`
- [ ] Add ActionItemsScreen to Main Stack

**Connect to Chat Screen:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] Add "📝 Summary" button to header
- [ ] Add "📋 Action Items" button to header
- [ ] On tap: Navigate to respective screens
- [ ] Pass conversationId via navigation params

**Add Loading States:**

- [ ] Show loading indicator while AI processing
- [ ] Disable buttons during processing
- [ ] Handle errors gracefully with user-friendly messages

**Test Basic AI Features:**

- [ ] Create conversation with 50+ messages covering various topics
- [ ] Test thread summarization:

  - Tap "📝 Summary" button
  - Verify summary captures main topics
  - Response time <2 seconds
  - Summary is 3-5 concise bullet points

- [ ] Test action item extraction:
  - Send messages with commitments: "I'll finish the report by Friday"
  - Send messages with assignments: "Can you review the PR?"
  - Tap "📋 Action Items" button
  - Verify all action items extracted correctly
  - Check assignedTo and deadline fields populated
  - Response time <2 seconds

**Files Created:**

- `src/services/aiService.js`
- `src/components/ThreadSummaryModal.js`
- `src/screens/ActionItemsScreen.js`

**Files Modified:**

- `src/screens/ChatScreen.js` (add AI buttons)
- `src/navigation/AppNavigator.js` (add ActionItemsScreen)
- `.env` (add OpenAI key)

**Test Before Merge:**

- [ ] AI dependencies installed successfully
- [ ] OpenAI API key accessible
- [ ] Thread summarization works with sample conversation
- [ ] Action item extraction identifies tasks correctly
- [ ] UI components display results properly
- [ ] Navigation between screens works
- [ ] Error handling works (test with invalid API key)
- [ ] Response times meet targets (<2 seconds)

---

## PR #15: Smart Search & Priority Detection

**Goal**: Implement semantic search using OpenAI embeddings and automatic priority detection for messages

### Subtasks

**Implement Semantic Search:**

- [ ] File: `src/services/aiService.js`
- [ ] Import embedding function:

  ```javascript
  import { embed } from "ai";
  ```

- [ ] Function: `semanticSearch(query, conversationId)`

  - Get query embedding using text-embedding-3-small
  - Fetch messages from conversation (last 200)
  - Compute embeddings for all messages
  - Calculate cosine similarity
  - Filter results above threshold (0.7)
  - Sort by similarity score
  - Return top 10 results

- [ ] Helper function: `cosineSimilarity(vecA, vecB)`
  - Calculate cosine similarity between two vectors
  - Return similarity score (0-1)

**Implement Priority Detection:**

- [ ] File: `src/services/aiService.js`
- [ ] Define PrioritySchema with Zod:

  ```javascript
  const PrioritySchema = z.object({
    priority: z.enum(["high", "normal", "low"]),
    reason: z.string(),
    urgencyScore: z.number().min(0).max(10),
  });
  ```

- [ ] Function: `detectPriority(messageText)`
  - Analyze message for urgency indicators
  - Consider: deadlines, immediate action requests, escalations, blockers
  - Use `generateObject` with PrioritySchema
  - Return priority level, reason, and urgency score
  - Target response time: <8 seconds

**Create Search Components:**

- [ ] File: `src/components/SemanticSearchBar.js`

  - Search input field
  - Search mode toggle (semantic vs keyword)
  - Loading indicator during search
  - Results display with similarity scores
  - "View in conversation" links

- [ ] File: `src/screens/SearchResultsScreen.js`
  - Display search results
  - Show message context
  - Highlight matching text
  - Navigate to specific message in conversation

**Update Message Schema:**

- [ ] File: `src/utils/conversation.js`
- [ ] Add priority fields to message creation:
  ```javascript
  {
    text: "...",
    priority: "high" | "normal" | "low" | null,
    priorityReason: "Contains urgent deadline" | null,
    urgencyScore: 0-10 | null
  }
  ```

**Implement Auto-Priority Detection:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] On new message received (not from current user):
  - Call `detectPriority(messageText)`
  - Update message with priority data
  - Show priority badge in UI

**Update MessageBubble Component:**

- [ ] File: `src/components/MessageBubble.js`
- [ ] Add priority display:
  - High priority: Red border/badge
  - Normal priority: No special styling
  - Low priority: Subtle indicator (optional)
- [ ] Show priority reason on long-press (optional)

**Add Search to Chat Screen:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] Add search bar below header
- [ ] Toggle between semantic and keyword search
- [ ] Display search results in overlay
- [ ] Navigate to specific message on tap

**Update Push Notifications:**

- [ ] File: `functions/index.js` (Cloud Function)
- [ ] Customize notification for high-priority messages:
  ```javascript
  const title =
    message.priority === "high"
      ? `🔴 ${message.senderUsername}`
      : message.senderUsername;
  ```

**Add Navigation:**

- [ ] File: `src/navigation/AppNavigator.js`
- [ ] Add SearchResultsScreen to Main Stack

**Performance Optimization:**

- [ ] Cache message embeddings in Firestore (optional)
- [ ] Implement search debouncing (500ms)
- [ ] Limit search to recent messages for performance

**Test Smart Search:**

- [ ] Create messages with varied topics
- [ ] Test semantic search:

  - Search for "meeting schedule" (semantic query)
  - Verify results include messages about "calendar", "availability", "time to meet"
  - Compare with keyword search (should find different results)
  - Response time <2 seconds

- [ ] Test keyword search:
  - Search for exact phrases
  - Verify results match keywords
  - Performance is fast (<500ms)

**Test Priority Detection:**

- [ ] Send urgent message: "Production is down! Need help ASAP!"
- [ ] Verify message flagged as high priority with red border
- [ ] Check priority reason is accurate
- [ ] Send normal message: "Let me know when you're free"
- [ ] Verify marked as normal priority
- [ ] Test with various message types
- [ ] Response time <8 seconds

**Files Created:**

- `src/components/SemanticSearchBar.js`
- `src/screens/SearchResultsScreen.js`

**Files Modified:**

- `src/services/aiService.js` (add search and priority functions)
- `src/components/MessageBubble.js` (add priority display)
- `src/screens/ChatScreen.js` (add search and auto-priority)
- `src/utils/conversation.js` (update message schema)
- `functions/index.js` (update notifications)
- `src/navigation/AppNavigator.js` (add SearchResultsScreen)

**Test Before Merge:**

- [ ] Semantic search finds contextually relevant messages
- [ ] Keyword search works for exact matches
- [ ] Priority detection flags urgent messages correctly
- [ ] High-priority messages show red border/badge
- [ ] Push notifications show priority indicators
- [ ] Search performance meets targets
- [ ] Auto-priority detection works on new messages
- [ ] Search results navigate to correct messages

---

## PR #16: Decision Tracking & Multi-Step Agent

**Goal**: Implement decision extraction and the advanced multi-step AI agent for complex workflows

### Subtasks

**Implement Decision Tracking:**

- [ ] File: `src/services/aiService.js`
- [ ] Define DecisionSchema with Zod:

  ```javascript
  const DecisionSchema = z.object({
    decisions: z.array(
      z.object({
        decision: z.string(),
        participants: z.array(z.string()),
        timestamp: z.string().nullable(),
        context: z.string(),
        confidence: z.enum(["high", "medium", "low"]),
      })
    ),
  });
  ```

- [ ] Function: `extractDecisions(conversationId)`
  - Fetch last 100 messages from conversation
  - Look for decision phrases: "let's do...", "we agreed...", "decided to...", "going with..."
  - Use `generateObject` with DecisionSchema
  - Filter out low-confidence decisions
  - Return structured decisions with participants and context
  - Target response time: <2 seconds

**Create Decision Tracking UI:**

- [ ] File: `src/screens/DecisionsScreen.js`
  - Timeline view of identified decisions
  - Each decision shows:
    - What was decided
    - Participants involved
    - Timestamp
    - Context
    - Confidence level
    - "View in conversation" link
  - Filter by date range (All, This Week, This Month)
  - Refresh button to re-extract

**Add Decision Navigation:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] Add "✓ Decisions" button to header
- [ ] Navigate to DecisionsScreen with conversationId

**Implement Multi-Step Agent:**

- [ ] File: `src/services/aiService.js`
- [ ] Import streaming functions:

  ```javascript
  import { streamText, tool } from "ai";
  ```

- [ ] Define agent tools:

  ```javascript
  const agentTools = {
    searchMessages: tool({
      description: "Search messages in a conversation by date range or keyword",
      parameters: z.object({
        conversationId: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        keyword: z.string().optional(),
      }),
      execute: async ({ conversationId, startDate, endDate, keyword }) => {
        // Search logic here
        return await searchMessages(conversationId, {
          startDate,
          endDate,
          keyword,
        });
      },
    }),

    extractActionItems: tool({
      description: "Extract action items from a set of messages",
      parameters: z.object({
        messages: z.array(
          z.object({
            text: z.string(),
            sender: z.string(),
          })
        ),
      }),
      execute: async ({ messages }) => {
        return await extractActionItems(messages);
      },
    }),

    categorizeByPerson: tool({
      description: "Group action items by assigned person",
      parameters: z.object({
        actionItems: z.array(z.any()),
      }),
      execute: async ({ actionItems }) => {
        return groupBy(actionItems, "assignedTo");
      },
    }),

    generateReport: tool({
      description: "Generate a formatted summary report",
      parameters: z.object({
        data: z.any(),
        title: z.string(),
      }),
      execute: async ({ data, title }) => {
        return formatReport(data, title);
      },
    }),
  };
  ```

- [ ] Function: `executeAgent(userQuery, conversationId, onStepUpdate)`
  - Use `streamText` with tools and maxSteps: 10
  - System prompt for remote team assistant
  - Handle step-by-step progress updates
  - Return final formatted result
  - Target response time: <15 seconds

**Create Agent Chat Interface:**

- [ ] File: `src/screens/AgentChatScreen.js`
  - Chat interface with AI agent
  - User can type complex queries
  - Shows step-by-step progress:
    - Step 1: Searching messages from last week...
    - Step 2: Extracting action items...
    - Step 3: Categorizing by person...
    - Step 4: Generating report...
  - Displays final formatted results
  - Example queries shown for guidance
  - Message history in conversation format

**Add Agent Navigation:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] Add "🤖 Agent" button to header
- [ ] Navigate to AgentChatScreen with conversationId

**Implement Helper Functions:**

- [ ] File: `src/utils/aiHelpers.js`
- [ ] Function: `searchMessages(conversationId, filters)`

  - Search messages by date range or keyword
  - Return filtered message list

- [ ] Function: `groupBy(array, key)`

  - Group array items by specified key
  - Return grouped object

- [ ] Function: `formatReport(data, title)`
  - Format data into readable report
  - Return formatted string

**Add Navigation:**

- [ ] File: `src/navigation/AppNavigator.js`
- [ ] Add DecisionsScreen to Main Stack
- [ ] Add AgentChatScreen to Main Stack

**Error Handling & Fallbacks:**

- [ ] Handle agent tool failures gracefully
- [ ] Provide fallback responses for complex queries
- [ ] Show clear error messages to users
- [ ] Implement retry logic for failed steps

**Test Decision Tracking:**

- [ ] Create conversation with clear decisions:
  - "Let's go with option B for the architecture"
  - "We agreed to extend the deadline to Q2"
  - "Decided to use microservices approach"
- [ ] Test decision extraction:
  - Tap "✓ Decisions" button
  - Verify decisions extracted correctly
  - Check participants list is accurate
  - Verify timestamp and context are correct
  - Test filter by date range
  - Response time <2 seconds

**Test Multi-Step Agent:**

- [ ] Test complex workflow:

  - Query: "Find all action items from last week, categorize by person, and create a summary report"
  - Verify step-by-step progress shown:
    - Step 1: Searching messages from last week...
    - Step 2: Extracting action items...
    - Step 3: Categorizing by person...
    - Step 4: Generating report...
  - Check final report is well-formatted and accurate
  - Total response time <15 seconds

- [ ] Test simpler queries:

  - "Summarize this conversation"
  - "What decisions were made?"
  - "Who has pending tasks?"

- [ ] Test error handling:
  - Query with no results
  - Invalid conversation ID
  - Network errors

**Files Created:**

- `src/screens/DecisionsScreen.js`
- `src/screens/AgentChatScreen.js`
- `src/utils/aiHelpers.js`

**Files Modified:**

- `src/services/aiService.js` (add decision extraction and agent)
- `src/screens/ChatScreen.js` (add Decisions and Agent buttons)
- `src/navigation/AppNavigator.js` (add new screens)

**Test Before Merge:**

- [ ] Decision tracking identifies decisions correctly
- [ ] Decisions screen shows timeline view
- [ ] Multi-step agent executes complex workflows
- [ ] Agent shows step-by-step progress
- [ ] Final reports are well-formatted
- [ ] Error handling works for edge cases
- [ ] Response times meet targets
- [ ] Navigation between screens works
- [ ] Agent maintains context across steps

---

## PR #17: AI Features Polish & Integration

**Goal**: Polish all AI features, implement rate limiting, and ensure production readiness

### Subtasks

**Implement Rate Limiting:**

- [ ] File: `src/services/aiService.js`
- [ ] Add rate limiting configuration:

  ```javascript
  const AI_RATE_LIMIT = {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  };
  ```

- [ ] Function: `checkRateLimit()`

  - Track request timestamps
  - Check if user exceeded limit
  - Throw error if limit exceeded
  - Clean up old timestamps

- [ ] Integrate rate limiting into all AI functions
- [ ] Show user-friendly error messages for rate limits

**Add Dark Mode Support:**

- [ ] File: `src/components/ThreadSummaryModal.js`
- [ ] Update styling to use theme colors
- [ ] Ensure readability in dark mode

- [ ] File: `src/screens/ActionItemsScreen.js`
- [ ] Apply dark theme colors
- [ ] Update list item styling

- [ ] File: `src/screens/DecisionsScreen.js`
- [ ] Apply dark theme colors
- [ ] Update timeline styling

- [ ] File: `src/screens/AgentChatScreen.js`
- [ ] Apply dark theme colors
- [ ] Update chat interface styling

- [ ] File: `src/components/SemanticSearchBar.js`
- [ ] Apply dark theme colors
- [ ] Update search input styling

**Improve AI Feature UX:**

- [ ] Add loading skeletons for all AI screens
- [ ] Implement pull-to-refresh on AI screens
- [ ] Add confirmation dialogs for expensive operations
- [ ] Show progress indicators for long-running operations
- [ ] Add tooltips explaining AI features

**Add AI Feature Settings:**

- [ ] File: `src/screens/ProfileScreen.js`
- [ ] Add AI settings section:

  - "Enable Auto-Priority Detection" toggle
  - "AI Response Speed" slider (fast vs accurate)
  - "Max Messages to Analyze" setting
  - "Enable AI Features" master toggle

- [ ] Save settings to Firestore user document
- [ ] Respect user preferences in AI functions

**Implement Caching:**

- [ ] File: `src/services/aiService.js`
- [ ] Add caching for expensive operations:

  - Cache thread summaries (24 hours)
  - Cache action item extractions (12 hours)
  - Cache decision extractions (12 hours)
  - Cache search results (1 hour)

- [ ] Use Firestore for cache storage
- [ ] Implement cache invalidation

**Add Analytics:**

- [ ] File: `src/services/aiService.js`
- [ ] Track AI feature usage:

  - Which features are used most
  - Response times
  - Error rates
  - User satisfaction (optional)

- [ ] Log to Firestore analytics collection
- [ ] Use for optimization and debugging

**Improve Error Handling:**

- [ ] Add specific error messages for different failure types
- [ ] Implement retry logic with exponential backoff
- [ ] Add fallback responses for AI failures
- [ ] Show helpful suggestions when AI fails

**Add AI Feature Onboarding:**

- [ ] File: `src/components/AIOnboardingModal.js`
- [ ] Show on first AI feature use
- [ ] Explain each AI feature briefly
- [ ] Show example queries for agent
- [ ] Allow users to skip onboarding

**Performance Optimization:**

- [ ] Implement lazy loading for AI screens
- [ ] Optimize re-renders in AI components
- [ ] Add memoization where appropriate
- [ ] Implement virtual scrolling for large result sets

**Add AI Feature Indicators:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] Show AI feature availability indicators
- [ ] Display when AI analysis is in progress
- [ ] Show AI feature usage statistics

**Test All AI Features:**

- [ ] Test thread summarization with various conversation types
- [ ] Test action item extraction with different task formats
- [ ] Test semantic search with complex queries
- [ ] Test priority detection with various urgency levels
- [ ] Test decision tracking with different decision types
- [ ] Test multi-step agent with complex workflows

**Test Dark Mode:**

- [ ] Toggle dark mode in Profile settings
- [ ] Verify all AI screens adapt to dark theme
- [ ] Check text contrast and readability
- [ ] Test theme persistence

**Test Rate Limiting:**

- [ ] Send 20+ AI requests quickly
- [ ] Verify rate limit error appears
- [ ] Wait 1 minute and verify requests work again
- [ ] Test rate limit reset

**Test Performance:**

- [ ] Test AI features with large conversations (500+ messages)
- [ ] Verify response times meet targets
- [ ] Test offline behavior
- [ ] Test with slow network connection

**Files Created:**

- `src/components/AIOnboardingModal.js`

**Files Modified:**

- `src/services/aiService.js` (add rate limiting, caching, analytics)
- `src/screens/ProfileScreen.js` (add AI settings)
- All AI screen components (dark mode support)
- `src/screens/ChatScreen.js` (add AI indicators)

**Test Before Merge:**

- [ ] All AI features work in dark mode
- [ ] Rate limiting prevents abuse
- [ ] Caching improves performance
- [ ] Error handling is user-friendly
- [ ] AI settings are respected
- [ ] Performance meets targets
- [ ] Onboarding helps new users
- [ ] Analytics track usage correctly
- [ ] All features work offline (with cached data)

---

## Summary

**AI Features Implementation Timeline:**

- **PR #12**: AI Foundation & Basic Features (Day 1)

  - Thread Summarization ✅
  - Action Item Extraction ✅

- **PR #13**: Smart Search & Priority Detection (Day 2)

  - Semantic Search ✅
  - Priority Detection ✅

- **PR #14**: Decision Tracking & Multi-Step Agent (Day 3)

  - Decision Tracking ✅
  - Multi-Step Agent ✅

- **PR #15**: Typing Indicators & Connection Status (Day 4)

  - Real-time Typing Indicators ✅
  - Connection Status Indicators ✅

- **PR #16**: Dark Mode & Message Reactions (Day 5)

  - Dark Mode Theme System ✅
  - Message Reactions ✅

- **PR #17**: AI Features Polish & Integration (Day 6)
  - Rate Limiting ✅
  - Performance Optimization ✅
  - Production Readiness ✅

**Total AI Features:** 5 Core + 1 Advanced

- Thread Summarization
- Action Item Extraction
- Smart Semantic Search
- Priority Detection
- Decision Tracking
- Multi-Step Agent (Advanced)

**Additional MVP Features:** 3 Core + 2 Bonus

- Typing Indicators (MVP)
- Connection Status (MVP)
- Dark Mode (MVP)
- Message Reactions (Bonus +2 points)
- Rich Media Previews (Bonus +2 points)

---

## Key Reminders

- **Test each AI feature thoroughly before moving to next**
- **Use real conversations for testing (not dummy data)**
- **Monitor OpenAI API usage and costs**
- **Implement proper error handling and fallbacks**
- **Ensure all features work offline (with cached data)**
- **Test with various conversation lengths and types**
- **Verify response times meet performance targets**
- **After PR #17, transition to final polish and deployment**

Good luck implementing the AI features! 🤖✨
