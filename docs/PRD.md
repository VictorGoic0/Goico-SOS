# Messaging App - Product Requirements Document v3 (Vercel Backend)

## Executive Summary

A real-time messaging app built with React Native and Expo, enabling users to chat one-on-one and in groups with AI-powered features. This MVP focuses on building rock-solid messaging infrastructure with user profiles, presence tracking, offline support, message delivery status, and AI features powered by **Vercel serverless functions** tailored for Remote Team Professionals.

**Project Timeline**: 7-day sprint with checkpoints at Day 2, Day 5, and Day 7

**Architecture**: React Native frontend + Firebase real-time data + Vercel serverless backend for AI

---

## Product Vision

Build a modern messaging platform that combines real-time communication with AI assistance, providing users with seamless chat experiences across online and offline states with reliable message delivery tracking and intelligent features for remote team collaboration.

---

## Tech Stack

### Frontend (Mobile App)

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: Zustand (3-store architecture)
- **Styling**: React Native StyleSheet or NativeWind (Tailwind for RN)

### Backend & Real-Time

- **Platform**: Firebase
  - **Firebase Auth**: User authentication (email/password + OAuth)
  - **Firestore**: Messages, profiles, conversations (source of truth)
  - **Realtime Database**: User presence (isOnline, lastSeen) + typing indicators
  - **Firebase Storage**: Image/photo uploads
  - **Cloud Functions**: Push notifications
- **Real-time Sync**: Firestore listeners (onSnapshot) + Realtime Database listeners
- **Offline Support**: Firestore offline persistence (built-in)

### AI Backend (Vercel Serverless Functions)

- **Platform**: Vercel (Node.js serverless functions)
- **AI SDK**: Vercel AI SDK
- **AI Provider**: OpenAI (GPT-4 Turbo)
- **Deployment**: Vercel CLI
- **Features**: Thread summarization, action item extraction, smart search, priority detection, decision tracking, multi-step agent
- **Why Serverless**: 60s timeout (vs 30s Edge), full Node.js support, simpler debugging, good enough speed

### Push Notifications

- **Expo Notifications**: Native push notification support
- **Firebase Cloud Messaging**: Delivery via Cloud Functions

### Development Tools

- **Package Manager**: npm or yarn
- **Testing**: Manual testing only (no automated tests for MVP)
- **Deployment**:
  - Mobile: Expo EAS Build (iOS + Android)
  - Backend: Vercel CLI

---

## Project Structure

### New Folder Organization

```
Week 2 - Mobile Messaging App/
├── mobile-app/                    # React Native/Expo app
│   ├── src/
│   │   ├── screens/              # Screen components
│   │   ├── components/           # Reusable components
│   │   ├── stores/              # Zustand stores
│   │   ├── config/              # Firebase config
│   │   ├── utils/               # Utility functions
│   │   ├── navigation/          # Navigation setup
│   │   └── styles/             # Design tokens
│   ├── .env                     # Mobile app environment variables
│   ├── app.json                # Expo configuration
│   ├── package.json
│   └── README.md
│
├── backend/                      # Vercel serverless functions
│   ├── app/                     # Next.js App Router structure
│   │   └── api/                # API routes (serverless functions)
│   │       ├── test/
│   │       │   └── route.ts    # Test function (hello world)
│   │       ├── agent/
│   │       │   └── route.ts    # Multi-step AI agent
│   │       ├── summarize/
│   │       │   └── route.ts    # Thread summarization
│   │       ├── extract-actions/
│   │       │   └── route.ts    # Action item extraction
│   │       ├── search/
│   │       │   └── route.ts    # Semantic search
│   │       ├── priority/
│   │       │   └── route.ts    # Priority detection
│   │       └── decisions/
│   │           └── route.ts    # Decision tracking
│   ├── .env.local              # Backend environment variables
│   ├── package.json
│   ├── tsconfig.json           # TypeScript config (recommended)
│   ├── next.config.js          # Next.js config for Vercel
│   ├── vercel.json             # Vercel deployment config
│   └── README.md              # Deployment instructions
│
├── memory-bank/                 # Project documentation
├── PRD.md                      # This file
├── tasks.md                    # Implementation tasks
└── README.md                   # Root readme
```

---

## What is Expo?

**Expo** is a framework built on top of React Native that dramatically simplifies mobile development:

**Benefits:**

- ✅ Develop on any OS (Windows, Mac, Linux) - no Xcode/Android Studio needed
- ✅ Test on real device instantly with Expo Go app
- ✅ Pre-configured libraries (camera, notifications, storage)
- ✅ Easy deployment with EAS Build
- ✅ Over-the-air updates (push updates without app store)
- ✅ Access to native APIs without ejecting

**Why Expo for this project:**

- **7-day timeline**: Can't waste time configuring native builds
- **Push notifications**: Built-in with expo-notifications
- **Fast iteration**: See changes instantly on device
- **Cross-platform**: Test iOS + Android simultaneously

**Recommended approach:** Use Expo managed workflow for MVP

---

## Why Vercel Serverless Functions for AI?

### Architecture Decision: Serverless over Edge

**Chosen**: Vercel Serverless Functions (Node.js in US East 1)

**Why not Edge Functions:**

- ✅ **60s timeout** (vs 30s Edge) - AI features might take 30+ seconds with large conversations
- ✅ **Full Node.js support** - Any npm package works
- ✅ **Simpler debugging** - Fewer gotchas, standard Node.js
- ✅ **Good enough speed** - 200-500ms cold start is negligible compared to 2-3s AI processing
- ✅ **Larger bundle size** (50MB vs 1MB) - Room for complex AI logic

**Latency Math:**

```
User in Chicago → Serverless (US East 1)
  Network: 50ms
  Cold Start: 300ms (first request only, then warm)
  AI Processing: 2500ms (GPT-4 Turbo)
  Response: 50ms
Total: 2.9s (first request), 2.6s (subsequent)

vs. Edge Functions: 2.5s (saves ~100-400ms)

Verdict: Not worth the 30s timeout risk
```

### Benefits of Backend Separation

1. **Security**: OpenAI API key never exposed to mobile app
2. **Rate Limiting**: Server-side control of AI usage
3. **Scalability**: Independent scaling of mobile and backend
4. **Testing**: Easier to test AI features independently
5. **Cost Control**: Monitor and limit OpenAI API usage
6. **Flexibility**: Switch AI providers without mobile app update

### API Communication

**Mobile App → Vercel Backend:**

```javascript
// mobile-app/src/services/aiService.js
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL; // https://your-app.vercel.app

export const summarizeThread = async (conversationId) => {
  const response = await fetch(`${API_URL}/api/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId }),
  });

  return await response.json();
};
```

**Vercel Serverless Function:**

```typescript
// backend/app/api/summarize/route.ts
export async function POST(req: Request) {
  const { conversationId } = await req.json();

  // Fetch messages from Firebase (server-side)
  const messages = await getMessagesFromFirebase(conversationId);

  // Use Vercel AI SDK
  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    prompt: `Summarize: ${messages.map((m) => m.text).join("\n")}`,
  });

  return Response.json({ summary: text });
}
```

---

## Message Status System

### Status Flow

Messages have **3 status states**:

1. **"sending"**: Message has pending writes (local, not yet confirmed by Firebase server)
2. **"sent"**: Successfully written to Firestore and confirmed by server (✓)
3. **"read"**: Recipient opened the ChatScreen and viewed the message (✓✓ blue)

**Why Not "Delivered"?**

Firebase Firestore doesn't expose when a specific user's device has synced/received a document update. The `onSnapshot` listeners fire in the background even when the app is closed, and messages sync to the device's local cache automatically. There's no reliable way to detect true "delivered to device" status without implementing socket infrastructure like WhatsApp. Therefore, we use a simpler and more honest 3-state system: sending → sent → read.

### Implementation

#### One-on-One Chats

```javascript
// Message schema remains simple
{
  status: "sending" | "sent" | "read";
}

// Detect "sending" vs "sent" using Firebase metadata
const messageStatus = message.hasPendingWrites ? "sending" : "sent";

// Mark as read when conversation is opened (ChatScreen mount)
const markMessagesAsRead = async (conversationId) => {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages"
  );

  const q = query(
    messagesRef,
    where("senderId", "!=", currentUserId),
    where("status", "==", "sent") // Only mark "sent" messages as read
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { status: "read", readAt: serverTimestamp() });
  });

  await batch.commit();
};
```

#### Group Chats

For group chats, we need to track which users have read each message:

```javascript
// Updated message schema for groups
{
  status: "sending" | "sent" | "read", // Overall status
  readBy: [userId1, userId2], // Array of users who have read
}

// Mark as read when user views conversation
const markGroupMessagesAsRead = async (conversationId) => {
  const messagesRef = collection(db, "conversations", conversationId, "messages");

  const q = query(
    messagesRef,
    where("senderId", "!=", currentUserId)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const readBy = data.readBy || [];

    // Only update if current user hasn't read it yet
    if (!readBy.includes(currentUserId)) {
      batch.update(doc.ref, {
        readBy: arrayUnion(currentUserId),
        status: "read" // Update to read once ANY user reads
      });
    }
  });

  await batch.commit();
};
```

#### UI Display Logic

**One-on-One:**

- Sending: Single gray checkmark (⏳ or ✓ gray)
- Sent: Single checkmark ✓
- Read: Single checkmark ✓ + "Read X ago" text below timestamp

**Group Chat:**

- Show read count: "Read by 2 of 4" text below timestamp
- Show individual names on long-press (optional)
- Single checkmark (✓) for all sent messages
- Text indicator changes based on read status:
  - No text: Sent but nobody has read
  - "Read by 1 of 3": Some participants have read
  - "Read by 3 of 3": All participants have read

---

## User Presence & Status

### Status Colors & Indicators

Users can set their availability status, which displays with different colors:

```javascript
// User status options
const USER_STATUSES = {
  AVAILABLE: { label: "Available", color: "#00D856" }, // Green
  BUSY: { label: "Busy", color: "#FF3B30" },           // Red
  AWAY: { label: "Away", color: "#FFCC00" }            // Yellow
};

// Firestore user document
{
  status: "Available" | "Busy" | "Away",
  isOnline: boolean, // Derived from Realtime Database presence
  lastSeen: timestamp
}
```

### UI Display Logic

**Online Users:**

- Show colored dot next to name (green/red/yellow based on status)
- Display status text: "Available" | "Busy" | "Away"
- In chat header: "{Status} • Online"

**Offline Users:**

- Show gray dot
- Display "Last seen X mins/hours ago"
- Status still visible but grayed out

### Presence Tracking Implementation

```javascript
import { ref, set, onDisconnect, serverTimestamp } from "firebase/database";

const setupPresence = (userId) => {
  const presenceRef = ref(realtimeDb, `presence/${userId}`);

  // Set online when app opens
  set(presenceRef, {
    isOnline: true,
    lastSeen: serverTimestamp(),
  });

  // Auto-disconnect handling
  onDisconnect(presenceRef).set({
    isOnline: false,
    lastSeen: serverTimestamp(),
  });

  // Update lastSeen every minute while active
  const intervalId = setInterval(() => {
    set(presenceRef, {
      isOnline: true,
      lastSeen: serverTimestamp(),
    });
  }, 60000);

  // Cleanup
  return () => {
    clearInterval(intervalId);
    set(presenceRef, {
      isOnline: false,
      lastSeen: serverTimestamp(),
    });
  };
};

// Listen to presence changes
const listenToPresence = () => {
  const presenceRef = ref(realtimeDb, "presence");

  onValue(presenceRef, (snapshot) => {
    const presenceData = snapshot.val() || {};
    usePresenceStore.getState().setAllPresence(presenceData);
  });
};
```

### Typing Indicators

```javascript
// Add typing state to Realtime Database
/typing/{conversationId}/{userId}: {
  isTyping: boolean,
  timestamp: serverTimestamp()
}

// Debounced update (max 1 per second)
const handleTyping = debounce(() => {
  const typingRef = ref(realtimeDb, `typing/${conversationId}/${currentUserId}`);

  set(typingRef, {
    isTyping: true,
    timestamp: serverTimestamp()
  });

  // Auto-clear after 3 seconds
  setTimeout(() => {
    set(typingRef, { isTyping: false });
  }, 3000);
}, 1000);

// Listen to typing state
const listenToTyping = (conversationId) => {
  const typingRef = ref(realtimeDb, `typing/${conversationId}`);

  onValue(typingRef, (snapshot) => {
    const typingData = snapshot.val() || {};
    const typingUsers = Object.entries(typingData)
      .filter(([userId, data]) => data.isTyping && userId !== currentUserId)
      .map(([userId]) => userId);

    // Update UI to show "John is typing..." or "John, Sarah are typing..."
    setTypingUsers(typingUsers);
  });
};
```

**UI Integration:**

- Display "User is typing..." below chat header
- For groups: Show multiple users "John, Sarah are typing..."
- Auto-clear after 3 seconds of no typing activity

---

## AI Features - Remote Team Professional Persona

### Overview

Target persona: **Remote Team Professional** who needs to manage team communication, track action items, and extract decisions from conversations.

All AI features are implemented as **Vercel serverless functions** and called from the mobile app via HTTP API.

### Required AI Features (5)

#### 1. Thread Summarization

**Purpose**: Quickly understand long conversation threads without reading every message

**Implementation** (Vercel Backend):

```typescript
// backend/app/api/summarize/route.ts
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { conversationId, messageCount = 50 } = await req.json();

  // Fetch messages from Firebase (server-side SDK)
  const messages = await getMessagesFromFirebase(conversationId, messageCount);

  const prompt = `Summarize this conversation thread in 3-4 bullet points. Focus on key topics, decisions, and action items:

${messages.map((m) => `${m.senderUsername}: ${m.text}`).join("\n")}

Provide a concise summary with:
- Main topics discussed
- Key decisions made
- Outstanding questions`;

  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    prompt,
  });

  return Response.json({ summary: text });
}
```

**Mobile App Call:**

```javascript
// mobile-app/src/services/aiService.js
export const summarizeThread = async (conversationId) => {
  const response = await fetch(`${API_URL}/api/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId }),
  });

  const { summary } = await response.json();
  return summary;
};
```

**UI**: Button in chat header "Summarize Thread" → Modal with AI summary

---

#### 2. Action Item Extraction

**Purpose**: Automatically extract tasks and to-dos from conversation

**Implementation** (Vercel Backend):

```typescript
// backend/app/api/extract-actions/route.ts
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

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

export async function POST(req: Request) {
  const { conversationId, messageCount = 100 } = await req.json();

  const messages = await getMessagesFromFirebase(conversationId, messageCount);

  const prompt = `Extract all action items from this conversation. Format as a list with:
- Task description
- Assigned to (if mentioned)
- Deadline (if mentioned)
- Status (pending/completed based on context)

Conversation:
${messages.map((m) => `${m.senderUsername}: ${m.text}`).join("\n")}`;

  const { object } = await generateObject({
    model: openai("gpt-4-turbo"),
    schema: ActionItemSchema,
    prompt,
  });

  return Response.json({ actionItems: object.items });
}
```

**Mobile App Call:**

```javascript
export const extractActionItems = async (conversationId) => {
  const response = await fetch(`${API_URL}/api/extract-actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId }),
  });

  const { actionItems } = await response.json();
  return actionItems;
};
```

**UI**: "Action Items" tab in conversation → List view with checkboxes

---

#### 3. Smart Search

**Purpose**: Semantic search across conversations (not just keyword matching)

**Implementation** (Vercel Backend):

```typescript
// backend/app/api/search/route.ts
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { conversationId, query, messageCount = 200 } = await req.json();

  // Get query embedding
  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });

  // Fetch messages and compute similarity
  const messages = await getMessagesFromFirebase(conversationId, messageCount);

  // Compute embeddings for all messages (cache these in practice)
  const messageEmbeddings = await Promise.all(
    messages.map((m) =>
      embed({
        model: openai.embedding("text-embedding-3-small"),
        value: m.text,
      })
    )
  );

  // Calculate cosine similarity
  const results = messages
    .map((msg, i) => ({
      ...msg,
      similarity: cosineSimilarity(
        queryEmbedding,
        messageEmbeddings[i].embedding
      ),
    }))
    .filter((r) => r.similarity > 0.7) // Threshold
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);

  return Response.json({ results });
}
```

**Mobile App Call:**

```javascript
export const semanticSearch = async (conversationId, query) => {
  const response = await fetch(`${API_URL}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, query }),
  });

  const { results } = await response.json();
  return results;
};
```

**UI**: Search bar in chat → Shows semantically similar messages (not just keyword matches)

---

#### 4. Priority Detection

**Purpose**: Flag urgent/important messages automatically

**Implementation** (Vercel Backend):

```typescript
// backend/app/api/priority/route.ts
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const PrioritySchema = z.object({
  priority: z.enum(["high", "normal", "low"]),
  reason: z.string(),
  urgencyScore: z.number().min(0).max(10),
});

export async function POST(req: Request) {
  const { messageText } = await req.json();

  const prompt = `Analyze this message and determine if it's urgent or high priority.
Consider: deadlines, requests for immediate action, escalations, blockers.

Message: "${messageText}"

Respond with JSON:
{
  "priority": "high" | "normal" | "low",
  "reason": "brief explanation",
  "urgencyScore": 0-10
}`;

  const { object } = await generateObject({
    model: openai("gpt-4-turbo"),
    schema: PrioritySchema,
    prompt,
  });

  return Response.json(object);
}
```

**Mobile App Call:**

```javascript
export const detectPriority = async (messageText) => {
  const response = await fetch(`${API_URL}/api/priority`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageText }),
  });

  return await response.json();
};
```

**UI**:

- High priority messages have red border/badge
- Filter view: "Show High Priority Only"
- Notification: "🔴 High Priority Message from John"

---

#### 5. Decision Tracking

**Purpose**: Surface agreed-upon decisions from conversations

**Implementation** (Vercel Backend):

```typescript
// backend/app/api/decisions/route.ts
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

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

export async function POST(req: Request) {
  const { conversationId, messageCount = 100 } = await req.json();

  const messages = await getMessagesFromFirebase(conversationId, messageCount);

  const prompt = `Identify all decisions made in this conversation.
A decision is a conclusion reached by the group, not just a suggestion.

Look for phrases like: "let's do...", "we agreed...", "decided to...", "going with..."

Conversation:
${messages.map((m) => `${m.senderUsername}: ${m.text}`).join("\n")}

Return JSON array with decision, participants, timestamp, context, and confidence level.`;

  const { object } = await generateObject({
    model: openai("gpt-4-turbo"),
    schema: DecisionSchema,
    prompt,
  });

  return Response.json({
    decisions: object.decisions.filter((d) => d.confidence !== "low"),
  });
}
```

**Mobile App Call:**

```javascript
export const extractDecisions = async (conversationId) => {
  const response = await fetch(`${API_URL}/api/decisions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId }),
  });

  const { decisions } = await response.json();
  return decisions;
};
```

**UI**: "Decisions" tab in conversation → Timeline view of key decisions

---

### AI Agent as a Conversation (PR #16)

**Purpose**: Provide a unified conversational interface for all AI features

**Implementation Approach**:

The AI agent appears as a **pinned conversation** at the top of HomeScreen, always visible and easily accessible. Users interact with it like any other chat:

```javascript
// Static AI Agent Profile
export const AI_AGENT = {
  userId: "ai-agent",
  username: "assistant",
  displayName: "AI Assistant",
  photoURL: null,
  bio: "Your AI team assistant - ask me anything about your conversations",
  status: "Available",
  isAI: true,
};
```

**User Experience**:

- AI agent appears at top of HomeScreen with distinct styling (blue theme)
- Tapping opens regular ChatScreen - no separate UI needed
- Messages stream in real-time like normal chat messages
- Agent can access conversation context when provided

**Benefits**:

- Reuses existing ChatScreen UI (no new screens needed)
- Feels natural - AI is a "team member" not a separate feature
- Scalable - easy to add new AI capabilities
- Familiar chat interface reduces learning curve

**Backend Implementation** (PR #16):

```typescript
// backend/app/api/agent/route.ts
export async function POST(req: Request) {
  const { message, conversationId, context } = await req.json();

  // Get conversation history for context if provided
  let conversationHistory = "";
  if (conversationId && context?.includeHistory) {
    const messages = await getMessagesFromFirebase(conversationId, 20);
    conversationHistory = messages
      .reverse()
      .map((m) => `${m.senderUsername}: ${m.text}`)
      .join("\n");
  }

  const systemPrompt = `You are an AI assistant for a remote team messaging app. You help users with:
- Summarizing conversations
- Extracting action items and decisions
- Finding information in their messages
- Answering questions about their conversations

${
  conversationHistory
    ? `Recent conversation history:\n${conversationHistory}\n`
    : ""
}`;

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    system: systemPrompt,
    prompt: message,
    maxTokens: 500,
  });

  return result.toAIStreamResponse();
}
```

**Evolution Within PR #16**:

This PR includes the full transition:

1. First: Create AI agent as pinned conversation
2. Then: Refactor existing Summary/Action Items buttons to use agent
3. Result: All AI features use unified conversational interface

Example refactor:

- Old: "Summarize" button → Opens modal with summary
- New: "Summarize" button → Opens agent chat with "Please summarize the last 50 messages in this conversation"
- Benefit: Consistent UX, conversation history, ability to ask follow-up questions

---

### Advanced AI Capability: Multi-Step Agent (PR #17)

**Purpose**: Execute complex workflows autonomously with multiple steps

**Example Use Case**: "Find all action items from last week, categorize by person, and create a summary report"

**Implementation with Vercel AI SDK** (Vercel Backend):

```typescript
// backend/app/api/agent/route.ts
import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// Define tools the agent can use
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
      // Your search logic here
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

// Multi-step agent execution
export async function POST(req: Request) {
  const { userQuery, conversationId } = await req.json();

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    tools: agentTools,
    maxSteps: 10, // Allow up to 10 reasoning steps
    system: `You are a helpful assistant for a remote team. You can search messages, extract action items, categorize data, and generate reports. 
    
Break down complex requests into steps and use available tools to complete the task.`,
    prompt: `Conversation ID: ${conversationId}\n\nUser request: ${userQuery}`,
  });

  // Stream the response back to the mobile app
  return result.toAIStreamResponse();
}
```

**Mobile App Call (with streaming):**

```javascript
// mobile-app/src/services/aiService.js
export const executeAgent = async (userQuery, conversationId, onChunk) => {
  const response = await fetch(`${API_URL}/api/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userQuery, conversationId }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    onChunk(chunk); // Update UI as chunks arrive
  }
};
```

**UI Flow**:

1. User navigates to AI Agent conversation (pinned at top of HomeScreen)
2. User types command: "Find all action items from last week and categorize by person"
3. Agent shows streaming response with step-by-step progress:
   - Step 1: Searching messages from last week...
   - Step 2: Extracting action items...
   - Step 3: Categorizing by person...
   - Step 4: Generating report...
4. Final formatted report appears in chat as complete message

**Success Criteria**:

- ✅ Executes 5+ step workflows
- ✅ Maintains context across steps
- ✅ Handles edge cases (no results, errors)
- ✅ Response time <15s
- ✅ Clear progress indicators

---

## Performance Requirements

### Performance Targets

#### Real-Time Messaging

- ✅ **Message delivery latency**: <200ms on good network (3G or better)
- ✅ **Optimistic UI update**: Instant (0ms) - message appears immediately
- ✅ **Typing indicator latency**: <100ms
- ✅ **Presence update latency**: <100ms (online/offline status)

#### Offline & Sync

- ✅ **Offline sync time**: <1 second after reconnection
- ✅ **Message queue**: Unlimited (Firestore handles)
- ✅ **Reconnection time**: <2 seconds after network restored
- ✅ **Data persistence**: 100% - zero message loss

#### App Performance

- ✅ **App launch to chat screen**: <2 seconds (cold start)
- ✅ **Scrolling performance**: 60 FPS with 1000+ messages
- ✅ **Image loading**: Progressive (blur → full image in <3s)
- ✅ **Search latency**: <500ms for keyword search, <2s for semantic search

#### AI Response Times (via Vercel Backend)

- ✅ **Simple commands** (summarization, extraction): <2 seconds
- ✅ **Complex commands** (smart replies, priority detection): <8 seconds
- ✅ **Multi-step agents**: <15 seconds total workflow
- ✅ **Streaming responses**: First token in <500ms

#### Group Chat Performance

- ✅ **Group message delivery**: <300ms for 5 participants
- ✅ **Read receipt updates**: <200ms per user
- ✅ **Typing indicators (groups)**: <150ms

---

## MVP Requirements (Day 1-2 Checkpoint)

### Core Functionality

✅ **Authentication**

- Email/password signup (email + password only)
- First-time profile completion (username, displayName, optional photo/bio)
- Login flow
- Sign out functionality

✅ **User Profiles**

- Username (unique, for adding users)
- Display name (shown in UI)
- Email (from auth)
- Profile photo via imageURL (optional, via Firebase Storage)
- Bio (optional)
- Status message with colors (Available=green, Busy=red, Away=yellow)

✅ **User Presence** (Realtime Database)

- Show online/offline status for all users
- Update presence on app state changes
- Display last seen timestamp for offline users
- Auto-disconnect handling

✅ **User List**

- Display all registered users
- Show online/offline status (from Realtime Database)
- Show status with appropriate colors
- Tap user to start conversation

✅ **One-on-One Messaging**

- Send text messages in real-time
- View message history
- Messages sync instantly across devices
- Timestamps for each message
- **Message status tracking**: sending → sent → read

✅ **Offline Support**

- Queue messages sent while offline
- Auto-send when connection restored
- Firestore handles this automatically
- Show "sending" status for queued messages

✅ **Typing Indicators**

- Show "User is typing..." in real-time
- Auto-clear after 3 seconds
- Works for 1-on-1 and groups

✅ **Connection Status Indicators**

- Show "Offline", "Connecting...", "Online" banner
- Clear visual feedback for network state

### MVP Success Criteria

- Two users can sign up and chat in real-time
- Messages appear instantly (<200ms)
- Message status shows correctly (sending → sent → read)
- Offline messages send successfully when reconnected
- User presence updates accurately
- Profile photos upload and display correctly
- Typing indicators responsive (<100ms)

---

## Post-MVP Requirements

### Day 3: Group Chats, Read Receipts, Push Notifications

✅ **Group Chats**

- Create group conversations (3+ users)
- Add/remove participants
- Group name and photo (optional)
- Same message structure as 1-on-1 chats
- Show sender names in messages

✅ **Read Receipts (Groups)**

- Track `readBy` array for each message
- Show "Read by 2 of 4" in UI
- Individual names on long-press
- Blue checkmarks when all read

✅ **Push Notifications**

- Request notification permission
- Send notification when message received (user not in app)
- Tap notification → open conversation
- Firebase Cloud Function triggers on new message

### Day 4-5: AI Features (via Vercel Backend)

✅ **All 5 Required AI Features**

- Thread summarization
- Action item extraction
- Smart semantic search
- Priority detection
- Decision tracking

✅ **Advanced AI: Multi-Step Agent**

- Complex workflow execution
- Step-by-step progress display
- Tool integration (search, extract, categorize, report)

✅ **Vercel Backend Setup**

- Deploy test function first
- Deploy all AI feature endpoints
- Mobile app integration
- Error handling and rate limiting

### Day 6: Polish & Dark Mode

✅ **Dark Mode**

- Light/dark theme toggle in Profile settings
- Apply to all screens
- Save preference to Firestore
- Status colors adjusted for dark mode visibility

✅ **Polish & UX**

- Smooth animations
- Better loading states
- Error handling
- UI refinements

### Day 7: Deliverables

✅ **Demo Video**

- Record with two physical devices
- Show all features
- 5-7 minutes

✅ **Documentation**

- Persona Brainlift
- README
- Social post

### Bonus Features (If Time Permits)

- **Message Reactions** (Bonus: +2 points)

  - Add emoji reactions to messages (👍 ❤️ 😂 🎉)
  - Real-time reaction updates
  - Show reaction counts and who reacted

- **Rich Media Previews** (Bonus: +2 points)

  - Link unfurling (show preview card for URLs)
  - Use link preview API

- **Voice Messages** (Bonus: +2 points)

  - Record audio messages
  - Playback controls with waveform
  - Optional: AI transcription

- **Voice Message Transcription** (Bonus: +3 points for innovation)

  - Automatically transcribe voice messages
  - Use OpenAI Whisper API

- **Larger Chat Header**
  - Increase header height to better show profile photo
  - Add online status dot directly on profile photo

---

## Post-MVP / Future Features

### Medium Priority

1. **Image Sharing in Messages**

   - Upload images to Firebase Storage
   - Display in chat with thumbnails
   - Full-screen preview on tap

2. **Message Threading**

   - Reply to specific messages
   - Show thread context
   - Collapsible thread view

3. **Advanced Search Filters**
   - Filter by sender, date range, media type
   - Save search queries
   - Recent searches

### Low Priority

4. **User Blocking/Reporting**

   - Block users from messaging
   - Report inappropriate content
   - Admin moderation tools

5. **Message Forwarding**
   - Forward messages to other conversations
   - Preserve original sender
   - Add "Forwarded" label

### Very Low Priority

6. **Friends System** (Very last - significant architecture change)
   - Add/remove friends
   - Only see friends in user list (not all users)
   - Friend requests and approvals
   - May affect who can message you

---

## State Management Architecture (Zustand - 3 Stores)

Based on proven CollabCanvas pattern:

### **Store 1: Local Store** (Optimistic Updates)

**Purpose**: Temporary local state, optimistic updates before Firestore confirms

```javascript
// stores/localStore.js
- pendingMessages: { conversationId: [messages with status: "sending"] }
- drafts: { conversationId: "draft text..." }
- addPendingMessage()
- removePendingMessage()
- setDraft()
```

**Use cases:**

- Message shows immediately when user taps send (status: "sending")
- Removed once Firestore confirms write
- Store draft messages being typed

---

### **Store 2: Presence Store** (Realtime Database)

**Purpose**: Real-time presence data (online/offline, lastSeen, typing)

```javascript
// stores/presenceStore.js
- presenceData: { userId: { isOnline: boolean, lastSeen: timestamp } }
- typingData: { conversationId: { userId: boolean } }
- updatePresence()
- setAllPresence()
- isUserOnline()
- setTypingUsers()
```

**Use cases:**

- Show green dot for online users
- Show "Last seen 5 mins ago" for offline users
- Display "User is typing..." indicators
- Updates from Realtime Database onValue() listener

---

### **Store 3: Firebase Store** (Source of Truth)

**Purpose**: All data from Firestore (users, conversations, messages)

```javascript
// stores/firebaseStore.js
- users: []
- usersMap: { userId: user }
- conversations: []
- conversationsMap: { conversationId: conversation }
- messages: { conversationId: [messages] }
- currentUser: user
- setUsers()
- setConversations()
- setMessages()
- addMessage()
- updateMessageStatus()
```

**Use cases:**

- All Firestore onSnapshot updates write here
- Components read confirmed data from here
- Merge with localStore for complete UI state

---

### **Data Flow Pattern**

```
USER SENDS MESSAGE
    ↓
1. WRITE TO FIRESTORE (initial status: "sent", but hasPendingWrites: true)
    ↓
2. SENDER'S onSnapshot FIRES (hasPendingWrites: true → display as "sending")
    ↓
3. FIREBASE CONFIRMS WRITE (hasPendingWrites: false → display as "sent")
    ↓
4. RECIPIENT'S onSnapshot FIRES (they now have the message)
    ↓
5. RECIPIENT OPENS ChatScreen (markMessagesAsRead runs)
    ↓
6. STATUS UPDATED TO "read" (readAt timestamp set)
    ↓
7. SENDER SEES "read" STATUS (✓✓ blue)
```

**Note**: We removed the separate LOCAL store for pending messages. Firebase's `hasPendingWrites` metadata provides the same optimistic update capability natively.

**Component renders:**

```javascript
const allMessages = [
  ...useLocalStore((s) => s.pendingMessages[conversationId] || []),
  ...useFirebaseStore((s) => s.messages[conversationId] || []),
];
```

---

## Firebase Data Schema

### Collection: `users` (Firestore)

```
/users/{userId}
  - userId: string (Firebase Auth UID)
  - username: string (unique, lowercase, for search/adding - e.g., "john_doe")
  - displayName: string (shown in UI - e.g., "John Doe")
  - email: string (from Firebase Auth)
  - imageURL: string | null (Firebase Storage download URL)
  - bio: string | null (optional user bio)
  - status: string (e.g., "Available", "Busy", "Away")
  - pushToken: string | null (Expo push notification token)
  - createdAt: timestamp
  - lastEdit: timestamp
```

**Indexes Needed:**

- `username` (for username search)

---

### Realtime Database: `presence` (Real-time presence only)

```
/presence/{userId}
  - isOnline: boolean
  - lastSeen: timestamp (server timestamp)

/typing/{conversationId}/{userId}
  - isTyping: boolean
  - timestamp: timestamp
```

**Why Realtime Database for presence:**

- Built-in `.onDisconnect()` is more reliable than Firestore
- Automatically sets `isOnline: false` when user disconnects
- Faster updates (<50ms)
- Cheaper (ephemeral data, not persistent)

---

### Collection: `conversations` (Firestore)

```
/conversations/{conversationId}
  - conversationId: string (auto-generated or deterministic for 1-on-1)
  - participants: array<string> (array of user IDs)
  - participantUsernames: array<string> (for easy display)
  - isGroup: boolean (false for 1-on-1, true for groups)
  - groupName: string | null (only for groups)
  - groupImageURL: string | null (only for groups)
  - lastMessage: string (preview of last message)
  - lastMessageSenderId: string (who sent the last message)
  - lastMessageTimestamp: timestamp
  - createdAt: timestamp
  - lastEdit: timestamp
```

**Notes:**

- For 1-on-1 chats: `conversationId` can be deterministic (e.g., `${userId1}_${userId2}` sorted)
- For groups: Use auto-generated Firestore ID

**Indexes Needed:**

- `participants` (array-contains for querying user's conversations)
- `lastMessageTimestamp` (for sorting conversations)

---

### Subcollection: `conversations/{conversationId}/messages` (Firestore)

```
/conversations/{conversationId}/messages/{messageId}
  - messageId: string (auto-generated)
  - senderId: string (user ID who sent the message)
  - senderUsername: string (for display, denormalized)
  - text: string (message content)
  - timestamp: timestamp (Firestore server timestamp)
  - status: string ("sending" | "sent" | "read")
  - readAt: timestamp | null (when message was marked as read)
  - imageURL: string | null (for image messages - bonus feature)

  // NEW: Group chat read receipts
  - readBy: array<string> | null (for groups only - array of user IDs who have read)

  // NEW: Priority detection
  - priority: "high" | "normal" | "low" | null
  - priorityReason: string | null
  - urgencyScore: number | null (0-10)

  // NEW: Semantic search (optional, for caching)
  - embedding: array<number> | null (1536-dim vector for text-embedding-3-small)
```

**Message Status Flow:**

1. **"sending"**: Message has `hasPendingWrites: true` (local write not yet confirmed by Firebase server)
2. **"sent"**: Message has `hasPendingWrites: false` (successfully written to Firestore and confirmed)
3. **"read"**: Recipient opened ChatScreen and viewed message (status field updated to "read", readAt timestamp set)

**Note**: We don't track "delivered" because Firebase Firestore doesn't expose when a specific device has synced a document. The 3-state system (sending → sent → read) is simpler, more honest, and matches what we can reliably detect.

**Indexes Needed:**

- `timestamp` (for ordering messages chronologically)
- `status` (optional, for querying unread messages)

---

## Vercel Backend Setup

### Project Initialization

```bash
# In the root directory (Week 2 - Mobile Messaging App/)
mkdir backend
cd backend

# Initialize Next.js project (for Vercel)
npx create-next-app@latest . --typescript --app --no-tailwind --no-src-dir --import-alias "@/*"

# Install Vercel AI SDK
npm install ai @ai-sdk/openai zod

# Install Firebase Admin SDK (for server-side Firebase access)
npm install firebase-admin
```

### Environment Variables

```bash
# backend/.env.local
OPENAI_API_KEY=your_openai_key

# Firebase Admin SDK (service account)
FIREBASE_SERVICE_ACCOUNT_KEY='{...service account JSON...}'

# Or individual Firebase config
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

### Vercel Configuration

```json
// backend/vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Deployment Process

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from backend/ directory)
vercel

# First deployment will ask for project name and settings
# Subsequent deployments: just run `vercel`

# Production deployment
vercel --prod
```

**Mobile App Environment Variable:**

```bash
# mobile-app/.env
EXPO_PUBLIC_BACKEND_URL=https://your-app.vercel.app
```

---

## Cost Summary

| Item               | Free Tier         | Expected Usage | Cost      |
| ------------------ | ----------------- | -------------- | --------- |
| Vercel Serverless  | 100k requests/day | ~1000 requests | **$0**    |
| OpenAI GPT-4 Turbo | None              | ~200 requests  | **$5-10** |
| Firebase           | 50k reads/day     | ~5000 reads    | **$0**    |
| **Total**          |                   |                | **$5-10** |

**Compared to your last project:** Same cost (OpenAI is your cost driver, not hosting)

---

## Dependencies List

### Mobile App Dependencies

```json
// mobile-app/package.json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0",

    "firebase": "^10.7.1",

    "zustand": "^4.4.7",

    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "react-native-screens": "~3.29.0",
    "react-native-safe-area-context": "4.8.2",

    "expo-image-picker": "~14.7.1",
    "expo-notifications": "~0.27.6"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  }
}
```

### Backend Dependencies

```json
// backend/package.json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",

    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.x",
    "zod": "^3.22.0",

    "firebase-admin": "^12.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0"
  }
}
```

---

## User Stories

### As a New User

- I can sign up with email and password
- I complete my profile (username, display name) after signup
- I can optionally upload a profile photo and bio
- I can set my status (Available, Busy, Away) with color coding
- I can see all other users and their online/offline status

### As a Messaging User

- I can tap any user to start a conversation
- I can send messages that appear instantly with "sending" status
- I see message status change to "sent" then "read" (when recipient views it)
- I can see message timestamps
- I can view my conversation history
- I can see when the other person is online or their last seen time
- I can see when someone is typing in real-time
- **I can see the user's profile photo and online status in the chat header**
- **I can delete a conversation:**
  - From the chat screen (if messages exist)
  - From the home screen via long-press (if conversation exists)
  - I must confirm deletion before it's permanent
  - I can message them again to start a new conversation

### As an Offline User

- I can write messages while offline
- My messages show "sending" status and queue locally
- When I reconnect, all queued messages send automatically
- Message status updates to "sent" (and eventually "read" when recipient views)
- I can view previously loaded conversations offline
- I see a clear "Offline" indicator

### As a Group Chat User

- I can create a group chat with multiple users
- I can name the group and add a group photo
- I can see who sent each message in the group
- I can add or remove participants
- I can see who has read each message ("Read by 2 of 4")
- Message status shows blue checkmarks when all participants have read

### As a Notified User

- I receive push notifications when I get a message (and app is closed/background)
- I can tap the notification to open the conversation
- Notifications show sender name and message preview
- High-priority messages show special notification style

### As an AI-Assisted User (Remote Team Professional)

- I can get thread summaries of long conversations
- I can extract all action items from a conversation
- I can use semantic search to find messages by meaning, not just keywords
- I can see automatically flagged high-priority messages
- I can view all decisions made in a conversation
- I can ask the AI agent complex questions like "Find all action items from last week and categorize by person"

---

## User Flows

### Signup Flow

1. User opens app (not authenticated)
2. Lands on Signup screen
3. Enters: email, password
4. Taps "Sign Up"
5. Firebase Auth creates account
6. **Navigate to Profile Setup screen** (first-time only)
7. User enters: username, displayName
8. (Optional) Upload profile photo
9. (Optional) Enter bio
10. (Optional) Set status (default: "Available")
11. App creates Firestore `/users/{uid}` document
12. App creates Realtime Database `/presence/{uid}` entry
13. User lands on Home screen (user list)

### Login Flow

1. User opens app (not authenticated)
2. Taps "Already have an account? Log in"
3. Enters email + password
4. Firebase Auth signs in
5. App fetches user profile from Firestore
6. App updates presence in Realtime Database
7. User lands on Home screen

### Start Conversation Flow (1-on-1)

1. User on Home screen (sees list of all users)
2. Taps on a user
3. App checks if conversation exists:
   - If yes: Open existing conversation
   - If no: Create new conversation document in Firestore
4. User lands on Chat screen
5. Can send messages immediately

### Send Message Flow (with Status Tracking)

1. User types message in input field
2. User starts typing → typing indicator sent to Realtime Database
3. Taps send button
4. **App writes to Firestore** (with status: "sent")
5. **Sender's onSnapshot fires immediately** with `hasPendingWrites: true`
6. **UI shows message immediately** with "sending" indicator (⏳ or gray ✓)
7. **Firebase confirms write** → `hasPendingWrites: false`
8. **UI updates to "sent"** indicator (single ✓)
9. **Recipient's onSnapshot fires** → they receive the message
10. **Recipient opens ChatScreen** → markMessagesAsRead() runs
11. **Status updated to "read"** in Firestore (with readAt timestamp)
12. **Sender's onSnapshot fires** with updated status
13. **Sender sees blue checkmarks** (✓✓ blue)

### Offline Message Flow

1. User loses internet connection
2. Connection status indicator shows "Offline"
3. User types and sends message
4. **App writes to Firestore** (write queued locally by Firebase)
5. **onSnapshot fires with `hasPendingWrites: true`**
6. UI shows "sending..." indicator (⏳ or gray ✓)
7. User reconnects
8. Connection status shows "Connecting..." then "Online"
9. **Firebase syncs queued writes automatically**
10. **`hasPendingWrites` changes to `false`** → UI updates to "sent" (✓)
11. Messages appear with correct server timestamps

### AI Agent Workflow (via Vercel Backend)

1. User opens AI Agent interface from chat header
2. Types complex query: "Find all action items from last week and categorize by person"
3. Mobile app sends request to Vercel backend `/api/agent`
4. Agent starts processing, shows step-by-step progress (streamed from backend):
   - Step 1: Searching messages from last week...
   - Step 2: Extracting action items...
   - Step 3: Categorizing by person...
   - Step 4: Generating report...
5. Agent displays formatted report
6. User can ask follow-up questions or export report

---

## Screen Specifications

### 1. Auth Screens

**Signup Screen:**

- Email input
- Password input (with hide/show toggle)
- Sign up button
- "Already have an account?" → Login
- Error messages display below form

**Profile Setup Screen (First-Time Only):**

- Username input (unique check, no spaces, lowercase)
- Display name input (can have spaces and capitals)
- Profile photo upload (optional, "Skip" button)
- Bio input (optional, multiline)
- Status dropdown (Available, Busy, Away)
- Continue button

**Login Screen:**

- Email input
- Password input (with hide/show toggle)
- Login button
- "Don't have an account?" → Signup
- Error messages display below form

---

### 2. Home Screen (User List)

**Layout:**

- Header: App name/logo + current user profile icon (tap to view profile) + sign out icon
- Connection status banner (if offline or connecting)
- Search bar (bonus feature)
- List of all users:
  - Profile photo (circular)
  - Display name
  - Status indicator with color (green/red/yellow dot)
  - Status text (Available/Busy/Away)
  - Online/offline indicator or "Last seen: X mins ago"
  - Latest message preview (if conversation exists)
  - Tap row → Navigate to Chat screen

**Functionality:**

- Real-time presence updates from Realtime Database
- Users sorted: Online first, then by last seen
- Pull to refresh
- Tap user → Navigate to Chat screen
- **Long-press user (with existing conversation):**
  - Show context menu with "Delete Conversation" option
  - On tap → show confirmation modal
  - On confirm → delete all messages and conversation document

---

### 3. Chat Screen (Conversation)

**Layout:**

- Header:
  - Back button
  - **User profile preview (1-on-1 chats):**
    - Circular profile photo (or placeholder with initials)
    - Display name
    - Status (Available/Busy/Away) with colored dot
    - Online status ("Online" or "Last seen X mins ago")
  - (For groups: Group name + participant count)
  - AI features buttons (📋 Action Items, ✓ Decisions, 🤖 Agent, 📝 Summary)
  - Delete conversation button (trash icon, enabled when messages exist)
  - Info icon (tap for user profile or group info)
- **Typing indicator area** (below header)
  - "User is typing..." or "John, Sarah are typing..."
- Message list (FlatList, inverted for bottom scroll):
  - Messages from other users (left-aligned, gray bubble)
  - Messages from current user (right-aligned, blue bubble)
  - High-priority messages (red border/badge)
  - Timestamps (below message or grouped by time)
  - **Message status indicators** (for sent messages):
    - Sending: ⏳ or gray ✓
    - Sent: ✓
    - Read: ✓ + "Read 2m ago" text (below timestamp)
  - Sender name (for groups)
  - Read receipts for groups ("Read by 2 of 4")
- Input bar (bottom):
  - Text input field (multiline)
  - Send button (icon)
  - (Bonus: Attach photo, emoji picker)

**Functionality:**

- Real-time message updates (onSnapshot)
- Auto-scroll to bottom on new messages
- Load message history on mount
- Merge LOCAL store (pending) + FIREBASE store (confirmed) messages
- Offline indicator if no connection
- KeyboardAvoidingView for input field
- Typing indicator triggers on text input
- **Delete conversation:**
  - Delete button in header (enabled when 1+ messages exist)
  - Tap delete → show confirmation modal
  - On confirm → delete all messages and conversation document
  - Navigate back to Home screen after deletion

---

### 4. Profile Screen (Current User)

**Layout:**

- Profile photo (large, tap to change)
- Display name (editable)
- Username (not editable, gray text)
- Email (from auth, not editable)
- Bio (editable, multiline)
- Status (editable with presets: Available, Busy, Away)
- **Dark Mode Toggle** (switch)
- Save button
- Sign out button (bottom)

**Functionality:**

- Update profile fields → save to Firestore
- Upload new profile photo → Firebase Storage → update imageURL
- Update display name → also update Firebase Auth profile
- Toggle dark mode → save preference to Firestore → update theme immediately
- Sign out → clear auth state, navigate to login

---

### 5. Other User Profile Screen

**Layout:**

- Profile photo (large)
- Display name
- Username
- Bio
- Status
- "Send Message" button
- Online status / Last seen

**Functionality:**

- Tap "Send Message" → Navigate to Chat screen
- If conversation exists, open it; if not, create new

---

### 6. Group Chat Screens

**Create Group Screen:**

- Group name input
- Group photo upload (optional)
- Select participants (multi-select checklist from user list)
- Create button

**Group Info Screen:**

- Group photo and name (editable by creator)
- Participant list (with photos and names)
- Add participants button
- Remove participant (swipe or tap)
- Leave group button (bottom, red)

---

### 7. AI Feature Screens

**Action Items Screen:**

- List of extracted action items
- Each item shows:
  - Task description
  - Assigned person (if mentioned)
  - Deadline (if mentioned)
  - Status (pending/completed)
  - Context
  - Link to view in conversation
- Checkbox to mark complete
- Refresh button

**Decisions Screen:**

- Timeline view of identified decisions
- Each decision shows:
  - What was decided
  - Participants involved
  - Timestamp
  - Context
  - Confidence level
  - Link to view in conversation
- Filter by date range (All, This Week, This Month)
- Refresh button

**AI Agent Chat Screen:**

- Chat interface with AI agent
- User can type complex queries
- Shows step-by-step progress
- Displays final formatted results
- Example queries shown for guidance
- Message history in conversation format

**Thread Summary Modal:**

- Overlay modal
- Shows AI-generated summary
- Metadata (based on X messages)
- Close button
- Copy summary button (bonus)

---

## React Navigation Setup

### Navigation Structure

```
AuthStack:
  - SignupScreen
  - LoginScreen
  - ProfileSetupScreen (first-time only)

MainStack:
  - HomeScreen (User List)
  - ChatScreen
  - ProfileScreen (current user)
  - OtherUserProfileScreen
  - CreateGroupScreen
  - GroupInfoScreen
  - ActionItemsScreen (NEW)
  - DecisionsScreen (NEW)
  - AgentChatScreen (NEW)
```

### Example Navigation

```javascript
// App.js
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

function App() {
  const currentUser = useFirebaseStore((s) => s.currentUser);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!currentUser ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        ) : (
          // Main app screens
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="OtherUserProfile"
              component={OtherUserProfileScreen}
            />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
            <Stack.Screen name="ActionItems" component={ActionItemsScreen} />
            <Stack.Screen name="Decisions" component={DecisionsScreen} />
            <Stack.Screen name="AgentChat" component={AgentChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## Success Checklist

Before submission, verify:

### Core Messaging (35 points)

- ✅ Real-time delivery <200ms
- ✅ Offline queuing works perfectly
- ✅ Messages persist after force quit
- ✅ Group chat with 3+ users works
- ✅ Typing indicators responsive (<100ms)
- ✅ Read receipts show correctly (1-on-1 and groups)
- ✅ Connection status indicators visible

### Mobile App Quality (20 points)

- ✅ App launch <2 seconds
- ✅ Smooth 60 FPS scrolling (1000+ messages)
- ✅ Optimistic UI updates instant
- ✅ Keyboard handling perfect
- ✅ Push notifications work when app closed
- ✅ Backgrounding/foregrounding smooth

### AI Features (30 points)

- ✅ All 5 Remote Team Professional features working:
  - Thread summarization
  - Action item extraction
  - Smart search
  - Priority detection
  - Decision tracking
- ✅ AI response times meet targets (<2s simple, <15s agent)
- ✅ Multi-step agent executes complex workflows
- ✅ Agent shows step-by-step progress
- ✅ Features genuinely useful for persona
- ✅ Natural language commands work 90%+ of time
- ✅ Vercel backend deployed and accessible

### Technical Implementation (10 points)

- ✅ Clean code organization
- ✅ API keys secured (never exposed in mobile app)
- ✅ Firebase Auth working
- ✅ Local database (Firestore) working
- ✅ Vercel serverless functions working
- ✅ Function calling/tools implemented correctly
- ✅ Rate limiting implemented

### Documentation (5 points)

- ✅ Comprehensive README (mobile + backend)
- ✅ Setup instructions clear
- ✅ Architecture documented
- ✅ Environment variables template provided
- ✅ App deployed and accessible

### Required Deliverables (Pass/Fail)

- ✅ Demo video (5-7 min, two devices, all features shown)
- ✅ Persona Brainlift (1 page, addresses pain points)
- ✅ Social post (@GauntletAI tagged)

### Bonus Points (Target: +6 to +10)

- ✅ Dark mode (+3)
- ✅ Message reactions (+2)
- ✅ Rich media previews (+2)
- [ ] Voice message transcription (+3) - if time
- [ ] Innovation bonus (+3) - unique features

---

## Out of Scope for MVP

- ❌ Voice/video calls
- ❌ Message editing
- ❌ File sharing beyond images
- ❌ End-to-end encryption
- ❌ User blocking/reporting
- ❌ Multiple device support (web + mobile)
- ❌ Automated testing
- ❌ Message forwarding
- ❌ Location sharing
- ❌ Stickers/GIFs
- ❌ Video messages

---

## Known Risks & Mitigation

### Risk 1: Vercel backend setup takes longer than expected

**Mitigation**: Start with test function deployment first (PR #11.5). Verify deployment works before building AI features. Use TypeScript with Vercel AI SDK for better DX.

### Risk 2: AI features take longer than expected

**Mitigation**: Start with simplest implementations first. Have fallback keyword-based versions. Focus on making 3-4 features excellent rather than all 5 mediocre.

### Risk 3: Multi-step agent too complex

**Mitigation**: Vercel AI SDK makes this easier than expected. Start with 2-3 simple tools, add more if time permits. Can fall back to Context-Aware Smart Replies if needed.

### Risk 4: Performance issues with 1000+ messages

**Mitigation**: Use FlatList with proper optimization (getItemLayout, removeClippedSubviews). Test early with large datasets. Implement pagination if needed.

### Risk 5: Push notifications don't work in production

**Mitigation**: Test on physical devices early. Use Expo's managed workflow (handles certificates). Debug with Expo notification tool.

### Risk 6: Dark mode breaks UI

**Mitigation**: Test theme switching frequently. Use theme context from the start. Ensure all colors come from theme object.

### Risk 7: Time management - 7 days is tight

**Mitigation**: Stick to the phased timeline. Don't get perfectionist about non-essential features. MVP first, polish later. Skip bonus features if running behind.

---

## Final Notes

**Priorities for Maximum Points:**

1. **Core messaging must be rock-solid** (35 points) - This is non-negotiable
2. **All 5 AI features working well** (15 points) - Choose simpler implementations if needed
3. **Multi-step agent impressive** (10 points) - This will wow the graders
4. **Demo video professional** (15 point penalty if bad) - Practice before recording
5. **Dark mode for polish bonus** (+3 points) - Easy win

**Time-Saving Tips:**

- Use existing Firebase offline support (don't reinvent)
- Copy-paste proven Zustand patterns from CollabCanvas
- Use simple UI for AI features (function over form)
- Test on real devices from Day 1 (catch issues early)
- Don't over-engineer - ship working features over perfect code
- **Deploy test Vercel function first** - Verify setup works before building AI

**Risk Mitigation:**

- If agent is too complex, have fallback implementations ready
- If semantic search is slow, use simple keyword search as fallback
- If time runs out, cut bonus features (reactions, voice) - not core requirements
- Have fallback implementations for all AI features (keyword-based vs. AI-based)

**Good luck! 🚀**

---

## Post-Mission: RAG + Vector Databases + Redis Caching

**Status**: Post-mission enhancement for demonstration of advanced concepts learned in class

**See**: `tasks-3.md` for detailed implementation tasks

### Overview

This section outlines a production-level optimization strategy using **Retrieval Augmented Generation (RAG)**, **vector databases**, and **Redis caching** to significantly improve AI feature performance, reduce costs, and demonstrate advanced AI engineering concepts.

**Key Motivation**: Course material on RAG and vector databases provides an opportunity to showcase production-level optimization techniques while solving real problems in the messaging app.

### Business Case

**Problems Solved**:

1. Current keyword search misses contextually similar messages
2. Agent fetches all 50 messages regardless of relevance (wasted tokens/cost)
3. Repeated identical queries cost money every time
4. No cross-conversation search capability

**Solution Benefits**:

- 80% reduction in token usage for agent queries
- 70% reduction in API calls via intelligent caching
- Sub-second responses for cached queries
- Semantic search finds messages by meaning, not just keywords
- Cross-conversation insights now possible

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER QUERY                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    REDIS CACHE LAYER                        │
│  Check: hash(query + conversationId + lastMessageTimestamp) │
└────────────┬───────────────────────────────┬────────────────┘
             │                               │
        CACHE HIT                       CACHE MISS
             │                               │
             ▼                               ▼
   ┌─────────────────┐          ┌──────────────────────────┐
   │ Return cached   │          │  VECTOR DATABASE         │
   │ response (50ms) │          │  (Pinecone)              │
   └─────────────────┘          │                          │
                                │  1. Embed query          │
                                │  2. Find similar vectors │
                                │  3. Return top 10        │
                                └────────┬─────────────────┘
                                         │
                                         ▼
                                ┌──────────────────────────┐
                                │  FIREBASE FIRESTORE      │
                                │  Fetch full message data │
                                └────────┬─────────────────┘
                                         │
                                         ▼
                                ┌──────────────────────────┐
                                │  LLM (OpenAI GPT-4)      │
                                │  Process with 10 msgs    │
                                │  (not 50)                │
                                └────────┬─────────────────┘
                                         │
                                         ▼
                                ┌──────────────────────────┐
                                │  Cache response in Redis │
                                │  TTL: 1 hour             │
                                └────────┬─────────────────┘
                                         │
                                         ▼
                                   Return to user
```

### Three Use Cases for RAG

#### 1. Semantic Message Search (Highest Impact)

**Current Problem**: Keyword search only finds exact text matches

**With RAG**:

```
User searches: "budget issues"
Semantic search finds:
- "We're over budget on the design phase"
- "Cost concerns for Q4"
- "Financial constraints on hiring"
- "Money problems with vendor"
```

**Implementation**:

- Embed all messages using OpenAI `text-embedding-3-small`
- Store embeddings in Pinecone vector database
- Query by semantic similarity, not keywords
- Return ranked results with similarity scores

**Demo Value**: Side-by-side comparison shows clear improvement over keyword search

---

#### 2. Smart Agent Context Retrieval (Cost Optimization)

**Current Problem**: Agent fetches all 50 messages regardless of query relevance

**With RAG**:

```
User asks: "What did we decide about authentication?"
Instead of sending 50 messages:
1. Embed the user query
2. Retrieve only the 10 most relevant messages
3. Send those to the agent

Result: 80% reduction in tokens, better focused responses
```

**Implementation**:

- Replace `getConversationMessages(conversationId, limit=50)` with `getRelevantMessages(conversationId, query, limit=10)`
- Use semantic similarity to fetch only pertinent context
- Hybrid approach: 5 recent + 10 most relevant (deduped)

**Demo Value**: Show cost metrics before/after, explain token savings

---

#### 3. Cross-Conversation Insights

**Current Problem**: Can't search or analyze across multiple conversations

**With RAG**:

```
Query: "Show me all decisions about authentication across ALL my conversations"
RAG searches entire vector database, groups by conversation

Query: "Find action items related to design in any conversation"
Returns results from multiple conversations, ranked by relevance
```

**Implementation**:

- Omit `conversationId` filter in Pinecone query
- Search across all user's messages
- Group results by conversation
- Display with conversation context

**Demo Value**: Shows scalability and power of vector databases

---

### Redis Caching Strategy

#### What to Cache

**1. Message Embeddings (Never Expire)**

```javascript
Key: `embedding:${messageId}`
Value: [1536-dimensional vector]
TTL: Never (embeddings don't change)
```

**2. LLM Responses (1 hour TTL)**

```javascript
Key: `summary:${conversationId}:${lastMessageTimestamp}`
Value: { summary: "...", timestamp: 1234567890 }
TTL: 1 hour or until new message

Key: `actions:${conversationId}:${lastMessageTimestamp}`
Value: { actionItems: [...] }
TTL: 1 hour or until new message
```

**3. Search Results (15 minutes TTL)**

```javascript
Key: `search:${conversationId}:${hash(query)}`
Value: { results: [...], similarity: [...] }
TTL: 15 minutes
```

#### Cache Invalidation Rules

**Trigger**: New message sent to conversation

**Invalidate**:

- ✅ Summary cache for that conversation
- ✅ Action items cache for that conversation
- ✅ Decisions cache for that conversation
- ✅ Search cache for that conversation
- ❌ Embedding cache (keep - embeddings never change)

#### Performance Metrics

| Metric               | Before Caching | After Caching    |
| -------------------- | -------------- | ---------------- |
| **First Request**    | 2-3s           | 2-3s             |
| **Repeated Request** | 2-3s           | 50ms             |
| **API Calls**        | 100%           | 30% (70% cached) |
| **Cost per Day**     | $1.00          | $0.30            |

---

### Technology Stack

| Component                  | Technology                             | Cost                |
| -------------------------- | -------------------------------------- | ------------------- |
| **Vector Database**        | Pinecone (free tier: 100k vectors)     | $0                  |
| **Cache Layer**            | Upstash Redis (free tier: 10k req/day) | $0                  |
| **Embeddings**             | OpenAI `text-embedding-3-small`        | $0.02 per 1M tokens |
| **Cost for 1000 messages** | Embed 1000 messages once               | ~$0.50 (one-time)   |
| **Ongoing Cost**           | New messages only                      | ~$0.01/day          |

**Total Additional Cost**: ~$0.50 one-time, negligible ongoing

**Alternative Options**:

- Vector DB: Supabase pgvector (free, but slower)
- Cache: Vercel KV (free tier, simpler but less features)
- Embeddings: Voyage AI (cheaper but less accurate)

---

### Implementation Phases

**See `tasks-3.md` for detailed tasks**

#### PR #18: Semantic Search with Pinecone (3-4 hours)

- Set up Pinecone vector database
- Generate embeddings for all messages
- Implement semantic search endpoint
- Create search UI with keyword vs semantic toggle
- Add cross-conversation search capability

#### PR #19: Redis Caching Layer (1-2 hours)

- Set up Upstash Redis
- Cache embeddings (never expire)
- Cache LLM responses (1 hour TTL)
- Cache search results (15 min TTL)
- Implement cache invalidation on new messages
- Add performance metrics dashboard

#### PR #20: RAG for Agent Context (2-3 hours)

- Create RAG context retrieval function
- Replace agent's "fetch all messages" with RAG-based retrieval
- Implement hybrid strategy (recent + relevant)
- Add context quality scoring
- Test token usage reduction (should be 80%)

**Total Time Estimate**: 6-9 hours

**Recommended Timeline**: Implement post-mission over 1-2 days

---

### What to Tell Professors

> "I implemented RAG using vector embeddings and Pinecone to enable semantic search across conversations. This allows users to search by meaning, not just keywords. I also added Redis caching to optimize costs and performance, achieving 70% reduction in API calls. The agent now uses RAG to retrieve only relevant messages, reducing token usage by 80%. Here's a demo showing keyword search vs semantic search, and here are the performance metrics."

**Key Points to Emphasize**:

1. ✅ Clear understanding of RAG concept (retrieval before generation)
2. ✅ Production-level optimization (caching, cost reduction)
3. ✅ Measurable improvements (80% token reduction, 70% fewer API calls)
4. ✅ Real-world application (semantic search actually works better)
5. ✅ Scalability (cross-conversation search, vector database)

### Demo Script (30 seconds)

**Show Side-by-Side Comparison**:

1. **Keyword Search**: Search "budget" → finds only "budget"
2. **Semantic Search**: Search "budget" → finds "budget", "cost", "financial", "money problems"
3. **Performance**: Show first request (2s) vs cached request (50ms)
4. **Cost Savings**: Display metrics dashboard (70% API reduction)

**Explain Concept** (15 seconds):

> "Instead of sending all messages to the AI, I use embeddings to find only the most relevant ones. This makes responses faster, cheaper, and more accurate. The Redis cache stores frequently requested results, making repeat queries instant."

---

### Success Criteria

**Technical**:

- ✅ Semantic search finds contextually similar messages
- ✅ Cache hit rate >70% for repeated queries
- ✅ Agent token usage reduced by 80%
- ✅ All features stay within free tier limits
- ✅ Performance improvements measurable and reproducible

**Demo**:

- ✅ Side-by-side comparison prepared and rehearsed
- ✅ Metrics dashboard showing improvements
- ✅ Can explain RAG in 30 seconds
- ✅ Clear before/after cost comparison
- ✅ Professors understand production-level thinking

**Grade Impact**:

- ✅ Demonstrates advanced AI concepts from class
- ✅ Shows production-level optimization skills
- ✅ Measurable, reproducible results
- ✅ Clear business value (cost savings, better UX)
- ✅ Likely to boost grade for rest of program

---

### Why This Matters for Your Grade

**Connection to Course Material**:

- Direct application of RAG concepts taught in class
- Demonstrates understanding of vector databases and embeddings
- Shows production-level thinking (cost optimization, caching)
- Measurable improvements (not just theoretical)

**Differentiation**:

- Most students won't implement RAG (it's post-mission)
- Shows initiative and advanced understanding
- Production-level optimization (not just features)
- Clear business case (cost savings, performance)

**Grade Boost Potential**: +5-10% for rest of program

- Professors remember students who go beyond requirements
- Demonstrates mastery of advanced concepts
- Shows ability to apply classroom learning to real projects
- Production-level thinking separates good from great

**Recommended**: Implement this after mission submission for maximum learning value and minimal risk to core requirements.
