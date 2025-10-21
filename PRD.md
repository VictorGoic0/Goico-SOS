# Messaging App - Product Requirements Document v2

## Executive Summary

A real-time messaging app built with React Native and Expo, enabling users to chat one-on-one and in groups with AI-powered features. This MVP focuses on building rock-solid messaging infrastructure with user profiles, presence tracking, offline support, message delivery status, and AI features tailored for Remote Team Professionals.

**Project Timeline**: 7-day sprint with checkpoints at Day 2, Day 5, and Day 7

---

## Product Vision

Build a modern messaging platform that combines real-time communication with AI assistance, providing users with seamless chat experiences across online and offline states with reliable message delivery tracking and intelligent features for remote team collaboration.

---

## Tech Stack

### Frontend

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

### AI Integration

- **AI SDK**: Vercel AI SDK
- **AI Provider**: OpenAI (GPT-4)
- **Features**: Thread summarization, action item extraction, smart search, priority detection, decision tracking, multi-step agent

### Push Notifications

- **Expo Notifications**: Native push notification support
- **Firebase Cloud Messaging**: Delivery via Cloud Functions

### Development Tools

- **Package Manager**: npm or yarn
- **Testing**: Manual testing only (no automated tests for MVP)
- **Deployment**: Expo EAS Build (iOS + Android)

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

## Message Status System

### Status Flow

Messages have **4 status states**:

1. **"sending"**: Message in LOCAL store, being written to Firestore
2. **"sent"**: Successfully written to Firestore (✓)
3. **"delivered"**: Recipient's app has received it via onSnapshot (✓✓)
4. **"read"**: Recipient opened conversation and viewed message (✓✓ in blue)

### Implementation

#### One-on-One Chats

```javascript
// Message schema remains simple
{
  status: "sending" | "sent" | "delivered" | "read";
}

// Mark as read when conversation is opened
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
    where("status", "in", ["sent", "delivered"])
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { status: "read" });
  });

  await batch.commit();
};
```

#### Group Chats

For group chats, we need to track which users have read each message:

```javascript
// Updated message schema for groups
{
  status: "sent" | "delivered" | "read", // Still keep for backwards compatibility
  deliveredTo: [userId1, userId2], // Array of users who received
  readBy: [userId1], // Array of users who read
}

// Mark as delivered when user receives (onSnapshot fires)
const markMessageDelivered = async (conversationId, messageId) => {
  const messageRef = doc(db, "conversations", conversationId, "messages", messageId);

  await updateDoc(messageRef, {
    deliveredTo: arrayUnion(currentUserId),
    status: "delivered" // Update status once ANY user receives
  });
};

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
- Delivered: Double checkmark ✓✓
- Read: Double checkmark in blue ✓✓ (blue)

**Group Chat:**

- Show read count: "Read by 2 of 4" or individual names on long-press
- Blue checkmarks when all participants have read
- Gray checkmarks when partially read/delivered

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

### Required AI Features (5)

#### 1. Thread Summarization

**Purpose**: Quickly understand long conversation threads without reading every message

**Implementation**:

```javascript
// Use Vercel AI SDK with OpenAI
import { generateText } from "ai";

const summarizeThread = async (conversationId) => {
  // Fetch last 50 messages
  const messages = await getMessages(conversationId, 50);

  const prompt = `Summarize this conversation thread in 3-4 bullet points. Focus on key topics, decisions, and action items:

${messages.map((m) => `${m.senderUsername}: ${m.text}`).join("\n")}

Provide a concise summary with:
- Main topics discussed
- Key decisions made
- Outstanding questions`;

  const { text } = await generateText({
    model: "gpt-4-turbo",
    prompt,
  });

  return text;
};
```

**UI**: Button in chat header "Summarize Thread" → Modal with AI summary

---

#### 2. Action Item Extraction

**Purpose**: Automatically extract tasks and to-dos from conversation

**Implementation**:

```javascript
import { generateObject } from "ai";
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

const extractActionItems = async (conversationId) => {
  const messages = await getMessages(conversationId, 100);

  const prompt = `Extract all action items from this conversation. Format as a list with:
- Task description
- Assigned to (if mentioned)
- Deadline (if mentioned)
- Status (pending/completed based on context)

Conversation:
${messages.map((m) => `${m.senderUsername}: ${m.text}`).join("\n")}`;

  const { object } = await generateObject({
    model: "gpt-4-turbo",
    schema: ActionItemSchema,
    prompt,
  });

  return object.items;
};
```

**UI**: "Action Items" tab in conversation → List view with checkboxes

---

#### 3. Smart Search

**Purpose**: Semantic search across conversations (not just keyword matching)

**Implementation**:

```javascript
// Use OpenAI embeddings for semantic search
import { embed } from "ai";

const semanticSearch = async (query, conversationId) => {
  // Get query embedding
  const { embedding: queryEmbedding } = await embed({
    model: "text-embedding-3-small",
    value: query,
  });

  // Fetch messages and compute similarity
  const messages = await getMessages(conversationId, 200);

  // Compute embeddings for all messages (cache these in practice)
  const messageEmbeddings = await Promise.all(
    messages.map((m) =>
      embed({ model: "text-embedding-3-small", value: m.text })
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

  return results;
};
```

**UI**: Search bar in chat → Shows semantically similar messages (not just keyword matches)

---

#### 4. Priority Detection

**Purpose**: Flag urgent/important messages automatically

**Implementation**:

```javascript
const PrioritySchema = z.object({
  priority: z.enum(['high', 'normal', 'low']),
  reason: z.string(),
  urgencyScore: z.number().min(0).max(10),
});

const detectPriority = async (messageText) => {
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
    model: 'gpt-4-turbo',
    schema: PrioritySchema,
    prompt,
  });

  return object;
};

// Add priority field to messages
{
  text: "...",
  priority: "high" | "normal" | "low",
  priorityReason: "Contains urgent deadline"
}
```

**UI**:

- High priority messages have red border/badge
- Filter view: "Show High Priority Only"
- Notification: "🔴 High Priority Message from John"

---

#### 5. Decision Tracking

**Purpose**: Surface agreed-upon decisions from conversations

**Implementation**:

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

const extractDecisions = async (conversationId) => {
  const messages = await getMessages(conversationId, 100);

  const prompt = `Identify all decisions made in this conversation.
A decision is a conclusion reached by the group, not just a suggestion.

Look for phrases like: "let's do...", "we agreed...", "decided to...", "going with..."

Conversation:
${messages.map((m) => `${m.senderUsername}: ${m.text}`).join("\n")}

Return JSON array with decision, participants, timestamp, context, and confidence level.`;

  const { object } = await generateObject({
    model: "gpt-4-turbo",
    schema: DecisionSchema,
    prompt,
  });

  return object.decisions.filter((d) => d.confidence !== "low");
};
```

**UI**: "Decisions" tab in conversation → Timeline view of key decisions

---

### Advanced AI Capability: Multi-Step Agent

**Purpose**: Execute complex workflows autonomously with multiple steps

**Example Use Case**: "Find all action items from last week, categorize by person, and create a summary report"

**Implementation with Vercel AI SDK**:

```javascript
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
const executeAgent = async (userQuery, conversationId, onStepUpdate) => {
  const result = await streamText({
    model: openai("gpt-4-turbo"),
    tools: agentTools,
    maxSteps: 10, // Allow up to 10 reasoning steps
    system: `You are a helpful assistant for a remote team. You can search messages, extract action items, categorize data, and generate reports. 
    
Break down complex requests into steps and use available tools to complete the task.`,
    prompt: `Conversation ID: ${conversationId}\n\nUser request: ${userQuery}`,
    onStepFinish: async (step) => {
      if (onStepUpdate) {
        onStepUpdate({
          stepNumber: step.stepNumber,
          description: step.toolCalls?.[0]?.toolName || "Processing...",
        });
      }
    },
  });

  // Collect response
  let fullResponse = "";
  for await (const chunk of result.textStream) {
    fullResponse += chunk;
  }

  return fullResponse;
};
```

**UI Flow**:

1. User types command in chat or dedicated "Ask AI Agent" interface
2. Show "Agent is thinking..." with step-by-step progress
   - Step 1: Searching messages from last week...
   - Step 2: Extracting action items...
   - Step 3: Categorizing by person...
   - Step 4: Generating report...
3. Display final result (formatted report)

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

#### AI Response Times

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
- **Message status tracking**: sending → sent → delivered → read

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
- Message status shows correctly (sending/sent/delivered/read)
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

### Day 4-5: AI Features

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
1. LOCAL STORE (optimistic, status: "sending")
    ↓
2. WRITE TO FIRESTORE (status: "sent")
    ↓
3. REMOVE FROM LOCAL STORE
    ↓
4. FIREBASE STORE UPDATES (onSnapshot, status: "sent")
    ↓
5. RECIPIENT RECEIVES (status: "delivered")
    ↓
6. RECIPIENT READS (status: "read")
```

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
  - status: string ("sending" | "sent" | "delivered" | "read")
  - imageURL: string | null (for image messages - bonus feature)

  // NEW: Group chat read receipts
  - deliveredTo: array<string> | null (for groups only)
  - readBy: array<string> | null (for groups only)

  // NEW: Priority detection
  - priority: "high" | "normal" | "low" | null
  - priorityReason: string | null
  - urgencyScore: number | null (0-10)

  // NEW: Semantic search (optional, for caching)
  - embedding: array<number> | null (1536-dim vector for text-embedding-3-small)
```

**Message Status Flow:**

1. **"sending"**: Optimistic local state (in LOCAL store, not written to Firestore yet)
2. **"sent"**: Successfully written to Firestore
3. **"delivered"**: Recipient's app has received it (onSnapshot fired on their device)
4. **"read"**: Recipient opened conversation and viewed message

**Indexes Needed:**

- `timestamp` (for ordering messages chronologically)
- `status` (optional, for querying unread messages)

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
- I see message status change to "sent" then "delivered" then "read"
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
- Message status updates to "sent" and "delivered"
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
4. **App adds to LOCAL store** (status: "sending", optimistic update)
5. **UI shows message immediately** with "sending" indicator
6. **App writes to Firestore** (status: "sent")
7. **Once Firestore confirms**, remove from LOCAL store
8. **onSnapshot updates FIREBASE store** (status: "sent")
9. **Recipient's onSnapshot fires** → add to their FIREBASE store
10. **Recipient's app writes back** (status: "delivered")
11. **Sender sees status update** to "delivered"
12. When recipient views conversation, mark as "read"
13. **Sender sees blue checkmarks** (read status)

### Offline Message Flow

1. User loses internet connection
2. Connection status indicator shows "Offline"
3. User types and sends message
4. App adds to LOCAL store (status: "sending")
5. Firestore write queued locally (automatic)
6. UI shows "sending..." indicator
7. User reconnects
8. Connection status shows "Connecting..." then "Online"
9. Firestore syncs queued writes automatically (status: "sent")
10. LOCAL store clears, FIREBASE store updates
11. Messages appear with correct timestamps

### AI Agent Workflow

1. User opens AI Agent interface from chat header
2. Types complex query: "Find all action items from last week and categorize by person"
3. Agent starts processing, shows step-by-step progress:
   - Step 1: Searching messages from last week...
   - Step 2: Extracting action items...
   - Step 3: Categorizing by person...
   - Step 4: Generating report...
4. Agent displays formatted report
5. User can ask follow-up questions or export report

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
    - Delivered: ✓✓
    - Read: ✓✓ (blue)
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

## Technical Implementation Details

### Image Upload Flow (Firebase Storage)

```javascript
// 1. User picks image
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});

// 2. Upload to Firebase Storage
const response = await fetch(result.uri);
const blob = await response.blob();
const storageRef = ref(storage, `profile_photos/${userId}/${Date.now()}.jpg`);
await uploadBytes(storageRef, blob);

// 3. Get download URL
const imageURL = await getDownloadURL(storageRef);

// 4. Save URL to Firestore
await updateDoc(doc(db, "users", userId), { imageURL });

// 5. Update local store
useFirebaseStore.getState().updateUser(userId, { imageURL });
```

---

### Message Send Flow (3-Store Pattern)

```javascript
const sendMessage = async (conversationId, text) => {
  const messageId = generateId();
  const timestamp = Date.now();

  // 1. Optimistic update (LOCAL store)
  useLocalStore.getState().addPendingMessage(conversationId, {
    messageId,
    senderId: currentUserId,
    senderUsername: currentUsername,
    text,
    timestamp,
    status: "sending",
  });

  try {
    // 2. Write to Firestore
    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );

    await addDoc(messagesRef, {
      senderId: currentUserId,
      senderUsername: currentUsername,
      text,
      timestamp: serverTimestamp(),
      status: "sent",
    });

    // 3. Remove from LOCAL store (Firestore is now source of truth)
    useLocalStore.getState().removePendingMessage(conversationId, messageId);

    // 4. Update conversation's lastMessage
    await updateDoc(doc(db, "conversations", conversationId), {
      lastMessage: text,
      lastMessageSenderId: currentUserId,
      lastMessageTimestamp: serverTimestamp(),
      lastEdit: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to send message:", error);
    // Message stays in LOCAL store with "sending" status
    // User can retry
  }
};
```

---

### Message Status Update Flow

```javascript
// Recipient's app listens to new messages
const listenToMessages = (conversationId) => {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages"
  );

  const q = query(messagesRef, orderBy("timestamp", "asc"));

  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        const message = {
          messageId: change.doc.id,
          ...change.doc.data(),
        };

        // Add to FIREBASE store
        useFirebaseStore.getState().addMessage(conversationId, message);

        // Mark as delivered (if not from current user)
        if (message.senderId !== currentUserId && message.status === "sent") {
          await updateDoc(change.doc.ref, { status: "delivered" });
        }
      }

      if (change.type === "modified") {
        const message = {
          messageId: change.doc.id,
          ...change.doc.data(),
        };

        // Update status in FIREBASE store
        useFirebaseStore
          .getState()
          .updateMessageStatus(
            conversationId,
            message.messageId,
            message.status
          );
      }
    });
  });
};

// Mark messages as read when conversation is viewed
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
    where("status", "in", ["sent", "delivered"])
  );

  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { status: "read" });
  });

  await batch.commit();
};
```

---

### Offline Support (Firestore Built-in)

```javascript
// Enable offline persistence (in Firebase initialization)
import {
  initializeFirestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";

const db = initializeFirestore(app, {
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
});

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open
    console.warn("Persistence failed: Multiple tabs open");
  } else if (err.code === "unimplemented") {
    // Browser doesn't support
    console.warn("Persistence not supported");
  }
});

// Firestore automatically:
// - Queues writes when offline
// - Syncs when reconnected
// - Returns cached data from local storage
// - Updates UI when server data arrives
```

---

### Dark Mode Implementation

```javascript
// Create theme context
const lightTheme = {
  background: "#FFFFFF",
  text: "#000000",
  messageBubble: "#F0F0F0",
  userMessageBubble: "#007AFF",
  border: "#E0E0E0",
  statusAvailable: "#00D856",
  statusBusy: "#FF3B30",
  statusAway: "#FFCC00",
};

const darkTheme = {
  background: "#000000",
  text: "#FFFFFF",
  messageBubble: "#1C1C1E",
  userMessageBubble: "#0A84FF",
  border: "#38383A",
  statusAvailable: "#00FF00", // Brighter for dark mode
  statusBusy: "#FF0000",
  statusAway: "#FFD700",
};

// Theme provider
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const currentUser = useFirebaseStore((s) => s.currentUser);
  const [isDark, setIsDark] = useState(currentUser?.darkMode || false);

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);

    // Save to Firestore
    if (currentUser) {
      await updateDoc(doc(db, "users", currentUser.userId), {
        darkMode: newMode,
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Usage in components
const { theme } = useContext(ThemeContext);

<View style={{ backgroundColor: theme.background }}>
  <Text style={{ color: theme.text }}>Hello</Text>
</View>;
```

---

## Error Handling & Rate Limiting

```javascript
// Rate limiting for AI features
const AI_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
};

const requestTimestamps = [];

const checkRateLimit = () => {
  const now = Date.now();
  const recentRequests = requestTimestamps.filter(
    (timestamp) => now - timestamp < AI_RATE_LIMIT.windowMs
  );

  if (recentRequests.length >= AI_RATE_LIMIT.maxRequests) {
    throw new Error("Rate limit exceeded. Please wait a moment and try again.");
  }

  requestTimestamps.push(now);
  requestTimestamps.splice(
    0,
    requestTimestamps.length - AI_RATE_LIMIT.maxRequests
  );
};

// Error handling wrapper
const withErrorHandling = async (fn, fallback) => {
  try {
    checkRateLimit();
    return await fn();
  } catch (error) {
    console.error("AI Service Error:", error);

    if (error.message.includes("Rate limit")) {
      throw error;
    }

    if (error.message.includes("API key")) {
      throw new Error(
        "AI service configuration error. Please contact support."
      );
    }

    if (error.message.includes("timeout")) {
      throw new Error("Request timed out. Please try again.");
    }

    // Use fallback if provided
    if (fallback) {
      console.log("Using fallback method");
      return await fallback();
    }

    throw new Error(
      "AI service temporarily unavailable. Please try again later."
    );
  }
};
```

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

## Dependencies List

### Core Dependencies

```json
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
    "expo-notifications": "~0.27.6",

    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.x",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  }
}
```

### Installation Commands

```bash
# Create Expo project
npx create-expo-app messaging-app
cd messaging-app

# Install core dependencies
npm install firebase zustand

# Install navigation
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# Install Expo modules
npx expo install expo-image-picker expo-notifications

# Install AI SDK
npm install ai @ai-sdk/openai zod
```

---

## Environment Variables

### `.env` file

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url

EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
```

**Note**: In Expo, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

---

## Firebase Configuration

### Firestore Rules (Security)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all user profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Conversations: only participants can read/write
    match /conversations/{conversationId} {
      allow read: if request.auth != null &&
                     request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                       request.auth.uid in resource.data.participants;
      allow delete: if request.auth != null &&
                       request.auth.uid in resource.data.participants;

      // Messages in conversation
      match /messages/{messageId} {
        allow read: if request.auth != null &&
                       request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow create: if request.auth != null &&
                         request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow update: if request.auth != null &&
                         request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow delete: if request.auth != null &&
                         request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }
  }
}
```

### Realtime Database Rules (Security)

```json
{
  "rules": {
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "$userId === auth.uid"
      }
    },
    "typing": {
      "$conversationId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "$userId === auth.uid"
        }
      }
    }
  }
}
```

### Firebase Storage Rules (Security)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile photos
    match /profile_photos/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // Max 5MB
                   && request.resource.contentType.matches('image/.*');
    }

    // Group photos
    match /group_photos/{conversationId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## Push Notifications (Cloud Function)

### Cloud Function: `sendMessageNotification`

```javascript
const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.sendMessageNotification = functions.firestore
  .document("conversations/{conversationId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const { conversationId } = context.params;

    // Get conversation to find recipients
    const convSnap = await admin
      .firestore()
      .doc(`conversations/${conversationId}`)
      .get();
    const conversation = convSnap.data();

    // Get recipients (exclude sender)
    const recipients = conversation.participants.filter(
      (uid) => uid !== message.senderId
    );

    // Get push tokens for recipients
    const userDocs = await Promise.all(
      recipients.map((uid) => admin.firestore().doc(`users/${uid}`).get())
    );

    const pushTokens = userDocs
      .map((doc) => doc.data()?.pushToken)
      .filter((token) => token != null);

    if (pushTokens.length === 0) return;

    // Customize notification for high-priority messages
    const title =
      message.priority === "high"
        ? `🔴 ${message.senderUsername}`
        : message.senderUsername;

    // Send push notification
    const payload = {
      notification: {
        title,
        body: message.text,
        sound: "default",
      },
      data: {
        conversationId,
        type: "new_message",
        priority: message.priority || "normal",
      },
    };

    await admin.messaging().sendToDevice(pushTokens, payload);
  });
```

---

## Updated Implementation Priorities

### Phase 1: Foundation (Day 1 - Hours 0-8) ✅ COMPLETED

**Goal**: Get authentication and basic navigation working

- [x] Set up React Native project with Expo
- [x] Install dependencies: Zustand, Firebase, React Navigation
- [x] Set up Firebase project (Auth + Firestore + Realtime Database + Storage)
- [x] Create 3 Zustand stores (localStore, presenceStore, firebaseStore)
- [x] Implement signup flow (email + password only)
- [x] Implement profile setup screen (username, displayName, optional photo/bio)
- [x] Implement login flow
- [x] Create user profile document on signup (Firestore)
- [x] Create presence entry on login (Realtime Database)
- [x] Basic navigation (Auth screens ↔ Home screen)

**Checkpoint**: Users can sign up, complete profile, log in, and see Home screen

---

### Phase 2: User Profiles & Presence (Day 1 - Hours 8-16) ✅ COMPLETED

**Goal**: Complete user profiles and presence tracking

- [x] Build Profile screen (view/edit current user)
- [x] Implement profile photo upload (Firebase Storage)
- [x] Save imageURL to Firestore user document
- [x] Build User List (Home screen)
- [x] Fetch all users from Firestore → FIREBASE store
- [x] Listen to Realtime Database `/presence` → PRESENCE store
- [x] Display users with online/offline indicators
- [x] Implement status colors (Available=green, Busy=red, Away=yellow)
- [x] Update presence on app foreground/background
- [x] Implement `.onDisconnect()` for auto-offline
- [x] Test presence with 2 devices

**Checkpoint**: Can create profile, upload photo, see all users with accurate presence and status colors

---

### Phase 3: Messaging Core (Day 2 - Hours 0-12) ✅ COMPLETED

**Goal**: Get 1-on-1 messaging working with status tracking

- [x] Create or find conversation when users tap each other
- [x] Build Chat screen UI
- [x] Implement send message with 3-store flow:
  - Add to LOCAL store (status: "sending")
  - Write to Firestore (status: "sent")
  - Remove from LOCAL store
  - onSnapshot updates FIREBASE store
- [x] Implement real-time message listening (onSnapshot)
- [x] Merge LOCAL + FIREBASE messages in UI
- [x] Display message status indicators (✓ sent, ✓✓ delivered)
- [x] Update status to "delivered" when recipient receives
- [x] Handle offline persistence (Firestore auto-queues)
- [x] Test message flow with 2 devices

**Checkpoint**: Two users can chat in real-time with accurate status indicators

---

### Phase 4: MVP Polish (Day 2 - Hours 12-24) ✅ COMPLETED

**Goal**: Complete MVP requirements

- [x] Test offline message queuing (airplane mode)
- [x] Verify message status flow end-to-end
- [x] Add loading states (sending messages, loading conversations)
- [x] Improve UI/UX (styling, message bubbles, timestamps)
- [x] Add error handling (failed sends, no internet)
- [x] Optimize FlatList performance (message list)
- [x] Bug fixes
- [x] Test with 3+ users
- [x] Deploy test build (Expo Go or EAS Build)

**Checkpoint**: MVP complete - ready for demo

---

### Phase 5: Group Chats, Read Receipts, Push Notifications (Day 3)

**Goal**: Extend conversations to support groups, add read receipts, and enable push notifications

**Read Receipts (Morning - 2 hours)**

- [ ] Update message schema to add "read" status
- [ ] Implement `markMessagesAsRead()` for 1-on-1 chats
- [ ] Add `readBy` array field for group messages
- [ ] Update `markGroupMessagesAsRead()` function
- [ ] Add UI indicators:
  - ✓ single gray (sent)
  - ✓✓ double gray (delivered)
  - ✓✓ double blue (read)
- [ ] For groups: Show "Read by X of Y" or individual names
- [ ] Test read receipts with 2 devices (1-on-1)
- [ ] Test read receipts with 3+ devices (group)

**Typing Indicators (Mid-morning - 1 hour)**

- [ ] Add typing state to Realtime Database
- [ ] Update typing state on text input change (debounced)
- [ ] Listen to typing state in chat screen
- [ ] Display "John is typing..." below chat header
- [ ] For groups: Show multiple users "John, Sarah are typing..."
- [ ] Test typing indicators with 2 devices
- [ ] Verify auto-clear after 3 seconds

**Group Chats (Afternoon - 3 hours)**

- [ ] Create Group screen (select users, name group, optional photo)
- [ ] Extend conversation schema (isGroup, groupName, groupImageURL)
- [ ] Update conversation creation logic for groups
- [ ] Update Chat screen for group messages:
  - Show sender names above messages
  - Update header (group name, participant count)
- [ ] Build Group Info screen (participants, add/remove, leave)
- [ ] Update message status for groups (delivered when all receive)
- [ ] Test group messaging with 3+ users

**Push Notifications (Evening - 2 hours)**

- [ ] Install expo-notifications
- [ ] Request notification permission on app start
- [ ] Get push token and save to Firestore user document (pushToken field)
- [ ] Set up Firebase Cloud Functions project
- [ ] Deploy `sendMessageNotification` Cloud Function
- [ ] Test notification delivery (app in background)
- [ ] Handle notification tap → open conversation
- [ ] Test with multiple devices

**Checkpoint**: Groups working with 3+ users, read receipts showing correctly, push notifications delivering

---

### Phase 6: AI Features - Part 1 (Day 4)

**Goal**: Implement first 3 AI features for Remote Team Professional

**Thread Summarization (Morning - 2 hours)**

- [ ] Install Vercel AI SDK and OpenAI dependencies
- [ ] Set up OpenAI API key in environment variables
- [ ] Implement `summarizeThread()` function
- [ ] Create ThreadSummaryModal component
- [ ] Add "📝 Summary" button to chat header
- [ ] Test with conversation of 50+ messages
- [ ] Verify response time <2 seconds

**Action Item Extraction (Mid-day - 3 hours)**

- [ ] Define ActionItemSchema with Zod
- [ ] Implement `extractActionItems()` function
- [ ] Build ActionItemsScreen component
- [ ] Add "📋 Action Items" button to chat header
- [ ] Create action item list UI with checkboxes
- [ ] Add "View in conversation" links
- [ ] Test extraction accuracy with sample conversations
- [ ] Verify response time <2 seconds

**Smart Semantic Search (Afternoon - 3 hours)**

- [ ] Implement cosine similarity calculation
- [ ] Create `semanticSearch()` function using OpenAI embeddings
- [ ] Build SemanticSearchBar component
- [ ] Add search mode toggle (semantic vs keyword)
- [ ] Test semantic search vs keyword search
- [ ] Optimize for performance (consider caching embeddings)
- [ ] Verify response time <2 seconds

**Checkpoint**: First 3 AI features working and tested

---

### Phase 7: AI Features - Part 2 (Day 5)

**Goal**: Complete remaining AI features and multi-step agent

**Priority Detection (Morning - 2 hours)**

- [ ] Define PrioritySchema with Zod
- [ ] Implement `detectPriority()` function
- [ ] Add priority detection on new messages (optional auto-detect)
- [ ] Update message UI to show priority badges
- [ ] Add high-priority notification styling
- [ ] Create fallback keyword-based detection
- [ ] Test with various message types
- [ ] Verify response time <8 seconds

**Decision Tracking (Mid-day - 2 hours)**

- [ ] Define DecisionSchema with Zod
- [ ] Implement `extractDecisions()` function
- [ ] Build DecisionsScreen component
- [ ] Add "✓ Decisions" button to chat header
- [ ] Create decision timeline UI
- [ ] Add confidence level indicators
- [ ] Add filter by date range
- [ ] Test decision extraction accuracy

**Multi-Step Agent (Afternoon - 4 hours)**

- [ ] Set up Vercel AI SDK `streamText` with tools
- [ ] Implement agent tools:
  - `searchMessages`
  - `extractActionItems`
  - `categorizeByPerson`
  - `generateReport`
  - `summarizeText`
- [ ] Build AgentChatInterface component
- [ ] Add "🤖 Agent" button to chat header
- [ ] Implement step-by-step progress display
- [ ] Test complex workflows (e.g., "Find action items from last week, categorize by person")
- [ ] Verify response time <15 seconds
- [ ] Add error handling and retry logic

**Checkpoint**: All 5 AI features + multi-step agent working excellently

---

### Phase 8: Dark Mode & Polish (Day 6)

**Goal**: Implement dark mode and polish the app

**Dark Mode (Morning - 3 hours)**

- [ ] Create theme context with light/dark color palettes
- [ ] Add theme toggle to Profile screen (Settings section)
- [ ] Save theme preference to Firestore user document
- [ ] Load theme preference on app start
- [ ] Apply theme to all screens:
  - Auth screens
  - Home screen
  - Chat screen
  - Profile screen
  - Group screens
  - AI feature screens
- [ ] Update status colors for dark mode visibility:
  - Available: Brighter green (#00FF00)
  - Busy: Brighter red (#FF0000)
  - Away: Brighter yellow (#FFD700)
- [ ] Test theme switching (should update instantly)
- [ ] Ensure text contrast meets accessibility standards (WCAG AA)

**Polish & UX (Afternoon - 5 hours)**

- [ ] Add smooth animations and transitions
- [ ] Implement better loading states
- [ ] Add skeleton screens where appropriate
- [ ] Improve error handling and error messages
- [ ] Add confirmation dialogs for destructive actions
- [ ] Optimize image loading (progressive loading)
- [ ] Add pull-to-refresh on conversation list
- [ ] Implement swipe gestures where appropriate
- [ ] Test app on both iOS and Android
- [ ] Fix any platform-specific issues
- [ ] Performance optimization:
  - Ensure 60 FPS scrolling with 1000+ messages
  - Optimize re-renders
  - Lazy load images
- [ ] Final bug fixes

**Checkpoint**: Dark mode fully implemented, app polished and performant

---

### Phase 9: Deliverables (Day 7)

**Goal**: Complete all submission requirements

**Demo Video (Morning - 3 hours)**

- [ ] Set up two physical devices for recording
- [ ] Plan demo script covering:
  - Real-time messaging between two devices
  - Group chat with 3+ participants
  - Offline scenario (airplane mode)
  - App lifecycle (background, foreground, force quit)
  - All 5 AI features with clear examples
  - Multi-step agent with complex workflow
  - Brief technical architecture explanation
- [ ] Record demo (may need multiple takes)
- [ ] Edit video (remove dead time, add text overlays)
- [ ] Ensure 5-7 minute length
- [ ] Verify audio and video quality (1080p minimum)
- [ ] Upload to YouTube/Loom/Vimeo

**Documentation (Mid-day - 2 hours)**

- [ ] Write comprehensive README with:
  - Project overview
  - Setup instructions
  - Firebase configuration guide
  - Environment variables template
  - Architecture overview
- [ ] Write Persona Brainlift (1-page document):
  - Chosen persona and justification
  - Specific pain points addressed
  - How each AI feature solves a problem
  - Key technical decisions made
- [ ] Document Zustand store architecture
- [ ] Add code comments where needed

**Social Post (Afternoon - 30 minutes)**

- [ ] Write 2-3 sentence description
- [ ] Mention Remote Team Professional persona
- [ ] List 2-3 key features
- [ ] Attach demo video or screenshots
- [ ] Include GitHub repo link
- [ ] Tag @GauntletAI
- [ ] Post on X (Twitter) or LinkedIn

**Deployment & Final Testing (Afternoon - 2.5 hours)**

- [ ] Deploy app using Expo EAS Build or Expo Go
- [ ] Test deployed version on iOS
- [ ] Test deployed version on Android
- [ ] Verify all features work in deployed build
- [ ] Test push notifications in production
- [ ] Final walkthrough of entire app
- [ ] Complete rubric self-assessment

**Final Submission (End of Day)**

- [ ] Verify GitHub repo is up-to-date
- [ ] Ensure README is complete
- [ ] Double-check all deliverables:
  - ✅ GitHub Repository
  - ✅ Demo Video
  - ✅ Persona Brainlift
  - ✅ Social Post
  - ✅ Deployed Application
- [ ] Submit!

**Checkpoint**: All deliverables complete and submitted

---

## Testing Strategy (Manual)

### Test Scenarios

**Authentication:**

1. Sign up with email/password → Complete profile → Lands on Home
2. Sign up with invalid email → Error shown
3. Login with correct credentials → Lands on Home
4. Login with wrong password → Error shown
5. Sign out → Returns to Login

**User Profiles:**

1. Upload profile photo → imageURL saved to Firestore
2. Edit display name → Updates in Firestore and UI
3. Edit bio → Updates in Firestore
4. Change status (Available/Busy/Away) → Color updates correctly
5. View other user's profile → Shows their info

**Presence:**

1. User A opens app → Shows online for User B with correct status color
2. User A closes app → Shows offline for User B (within 1 min)
3. User A in background → Still shows online
4. Check lastSeen timestamp updates every minute
5. User A changes status to Busy → User B sees red dot

**Typing Indicators:**

1. User A starts typing → User B sees "User A is typing..."
2. User A stops typing → Indicator disappears after 3 seconds
3. In group: User A and B typing → Shows "User A, User B are typing..."
4. Verify <100ms latency

**Messaging:**

1. Send message → Shows "sending" → Changes to "sent ✓"
2. Recipient receives → Changes to "delivered ✓✓"
3. Recipient views conversation → Changes to "read ✓✓ (blue)"
4. Send message while offline → Shows "sending" → Syncs when online
5. Send 50+ messages → No lag, smooth scrolling at 60 FPS

**Offline Mode:**

1. Turn on airplane mode → "Offline" indicator appears
2. Send 3 messages → All show "sending"
3. Turn off airplane mode → "Connecting..." then "Online"
4. All 3 messages sync with correct timestamps
5. Recipient receives all 3 messages in order
6. Offline sync completes in <1 second

**Group Chats:**

1. Create group with 3 users → All can see group
2. Send message in group → All receive
3. Each message shows sender name
4. Add new participant → They see message history
5. Leave group → Can't send messages
6. Read receipts show "Read by 2 of 3"

**Push Notifications:**

1. Close app
2. Send message from other device
3. Notification appears on lock screen
4. Tap notification → Opens conversation
5. Multiple messages → Multiple notifications (or grouped)
6. High-priority message → Special notification style

**AI Features:**

**Thread Summarization:**

1. Create conversation with 50+ messages
2. Tap "📝 Summary" button
3. Verify summary captures main topics, decisions, and action items
4. Response time <2 seconds
5. Summary is 3-5 concise bullet points

**Action Item Extraction:**

1. Send messages containing commitments: "I'll finish the report by Friday"
2. Send messages with assignments: "Can you review the PR?"
3. Tap "📋 Action Items" view
4. Verify all action items extracted correctly
5. Check assignedTo and deadline fields are populated
6. Tap "View in conversation" links to verify correct messages
7. Response time <2 seconds

**Smart Search:**

1. Create messages with varied topics
2. Search for "meeting schedule" (semantic query)
3. Verify results include messages about "calendar", "availability", "time to meet"
4. Compare with keyword search (should find different results)
5. Response time <2 seconds

**Priority Detection:**

1. Send urgent message: "Production is down! Need help ASAP!"
2. Verify message flagged as high priority with red border
3. Check priority reason is accurate
4. Send normal message: "Let me know when you're free"
5. Verify marked as normal priority
6. Response time <8 seconds

**Decision Tracking:**

1. Have conversation with clear decision: "Let's go with option B for the architecture"
2. Open "✓ Decisions" view
3. Verify decision extracted correctly
4. Check participants list is accurate
5. Verify timestamp and context are correct
6. Test filter by date range (this week, this month)
7. Response time <2 seconds

**Multi-Step Agent:**

1. Send complex query: "Find all action items from last week, categorize by person, and create a summary report"
2. Verify step-by-step progress shown:
   - Step 1: Searching messages from last week...
   - Step 2: Extracting action items...
   - Step 3: Categorizing by person...
   - Step 4: Generating report...
3. Check final report is well-formatted and accurate
4. Total response time <15 seconds
5. Verify error handling if no results found

**Dark Mode:**

1. Toggle dark mode in Profile settings
2. Verify theme updates immediately across all screens
3. Check status colors are brighter in dark mode
4. Verify text contrast is readable
5. Test theme persistence (close app, reopen)

**Performance:**

1. App launch to chat screen <2 seconds
2. Scroll through 1000+ messages at 60 FPS
3. Message delivery <200ms on good network
4. Typing indicator <100ms latency
5. Presence update <100ms latency

---

## Deliverables

### 1. GitHub Repository

**Required**:

- Clean, documented code
- README with setup instructions
- Firebase configuration guide
- Zustand store architecture documentation
- Environment variables template (`.env.example`)

**Code Quality**:

- Well-organized file structure
- Meaningful variable/function names
- Comments for complex logic
- No exposed API keys (use `.env`)

---

### 2. Demo Video (5-7 minutes)

**Critical Requirements** (points deducted if missing):

✅ **Show two physical devices** (not emulator/simulator)

- Film both phone screens simultaneously OR
- Screen record both devices and edit together
- Must clearly show real-time sync

✅ **Demonstrate Core Features**:

1. **Real-time messaging** (send message on Device A, appears on Device B instantly)
2. **Group chat with 3+ participants** (show all participants can message)
3. **Offline scenario**:
   - Put Device A in airplane mode
   - Send messages from Device B
   - Take Device A out of airplane mode
   - Messages sync automatically
4. **App lifecycle**:
   - Background the app
   - Send message from other device
   - Foreground app → message appears
   - Force quit and reopen → messages persist

✅ **Demonstrate All 5 AI Features**:

- Thread summarization (show actual summary)
- Action item extraction (show extracted items)
- Smart search (show semantic search results)
- Priority detection (show flagged urgent message)
- Decision tracking (show identified decisions)

✅ **Show Advanced AI Capability**:

- Multi-step agent: Show complex workflow (e.g., "find action items from last week and categorize")
- Display step-by-step progress
- Show final formatted result

✅ **Technical Architecture Explanation** (1-2 minutes):

- Brief overview of tech stack
- 3-store Zustand architecture diagram
- Firebase services used (Firestore, Realtime DB, Storage)
- How offline sync works

**Video Quality**:

- Clear audio (use external mic if possible)
- 1080p video minimum
- Smooth transitions between demos
- Professional editing (remove dead time, add text overlays for clarity)

**Where to Host**: YouTube (unlisted or public), Loom, or Vimeo

---

### 3. Persona Brainlift (1-page document)

**Required Sections**:

#### Chosen Persona

- **Who**: Remote Team Professional
- **Why**: Managing team communication, tracking decisions, and extracting action items are critical pain points for distributed teams

#### Specific Pain Points Addressed

1. **Information Overload**: Too many messages to read through
   - **Solution**: Thread summarization condenses long conversations
2. **Lost Action Items**: Tasks mentioned in chat get forgotten
   - **Solution**: Automatic action item extraction
3. **Can't Find Important Info**: Keyword search misses context
   - **Solution**: Semantic smart search understands intent
4. **Missing Urgent Messages**: Critical messages buried in chat
   - **Solution**: AI-powered priority detection flags urgency
5. **Unclear Decisions**: Hard to track what team agreed on
   - **Solution**: Decision tracking surfaces consensus

#### How Each AI Feature Solves a Real Problem

**Feature 1: Thread Summarization**

- **Problem**: Team lead has 200 unread messages in project channel
- **Solution**: AI generates "Key topics: budget approval, timeline extended to Q2, Sarah volunteered for design"
- **Impact**: Saves 15 minutes of reading, gets context instantly

**Feature 2: Action Item Extraction**

- **Problem**: Developer said "I'll fix that bug by Friday" 3 days ago, now forgotten
- **Solution**: AI extracts "Fix login bug - Assigned to: Mike - Deadline: Friday"
- **Impact**: Prevents missed deadlines, improves accountability

**Feature 3: Smart Search**

- **Problem**: User searches "vacation policy" but message said "PTO guidelines"
- **Solution**: Semantic search finds the message despite different keywords
- **Impact**: Finds information 3x faster than keyword search

**Feature 4: Priority Detection**

- **Problem**: "Production is down, need help ASAP" buried under casual chat
- **Solution**: AI flags message as high priority, sends prominent notification
- **Impact**: Critical issues get immediate attention

**Feature 5: Decision Tracking**

- **Problem**: Team discussed project approach, unclear what was decided
- **Solution**: AI identifies "Decided to use microservices architecture" from conversation
- **Impact**: Clear record of decisions, reduces confusion

#### Key Technical Decisions Made

1. **Vercel AI SDK over LangChain**

   - Simpler API, better integration with React Native
   - Built-in streaming and tool calling
   - Faster development time

2. **Multi-Step Agent Framework**

   - Enables complex workflows (search → extract → categorize → report)
   - Better UX than chaining individual AI calls
   - More impressive for demo

3. **Firebase Realtime Database for Presence**

   - `.onDisconnect()` is more reliable than Firestore for online/offline
   - Sub-100ms latency for status updates
   - Lower cost for ephemeral data

4. **3-Store Zustand Architecture**

   - Clean separation: Local (optimistic) / Presence (real-time) / Firebase (source of truth)
   - Easier debugging and testing
   - Proven pattern from previous projects

5. **Read Receipts with Arrays (Groups)**
   - `readBy: [userId1, userId2]` allows granular tracking
   - Can show "Read by 2 of 5" in UI
   - Scales to large groups

**Format**: PDF or Markdown, ~500-800 words, include diagrams if helpful

---

### 4. Social Post (Required)

**Platform**: X (Twitter) or LinkedIn

**Required Elements**:

- ✅ Brief description (2-3 sentences) of the app
- ✅ Mention chosen persona: "Built for remote teams..."
- ✅ List 2-3 key features: "AI-powered action item extraction, smart search, decision tracking"
- ✅ Demo video or screenshots (attach or link)
- ✅ Link to GitHub repo
- ✅ Tag **@GauntletAI**

**Example Post**:

```
Just built MessageAI - a real-time chat app for remote teams 🚀

Built for remote professionals who struggle with information overload.
Key features:
✅ AI thread summarization
✅ Auto action item extraction
✅ Smart semantic search
✅ Priority detection

Multi-step AI agent handles complex workflows like "find all action items from last week and categorize by person"

Built with React Native + Firebase + Vercel AI SDK

Demo: [link]
GitHub: [link]

@GauntletAI #AI #ReactNative #Firebase
```

**Penalty**: -5 points if not posted

---

### 5. Deployed Application

**Option A: Expo Go** (Easiest)

- Publish to Expo: `expo publish`
- Share QR code or link
- Works on iOS + Android with Expo Go app

**Option B: EAS Build** (Production-ready)

- `eas build --platform all`
- Generate APK for Android
- TestFlight for iOS
- Share download links

**Option C: Run Locally** (Fallback)

- Clear setup instructions in README
- Works on emulator/simulator
- Provide video of it working

**Requirement**: App must be accessible for testing

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

### Technical Implementation (10 points)

- ✅ Clean code organization
- ✅ API keys secured (never exposed)
- ✅ Firebase Auth working
- ✅ Local database (Firestore) working
- ✅ Function calling/tools implemented correctly
- ✅ Rate limiting implemented

### Documentation (5 points)

- ✅ Comprehensive README
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

### Risk 1: AI features take longer than expected

**Mitigation**: Start with simplest implementations first. Have fallback keyword-based versions. Focus on making 3-4 features excellent rather than all 5 mediocre.

### Risk 2: Multi-step agent too complex

**Mitigation**: Vercel AI SDK makes this easier than expected. Start with 2-3 simple tools, add more if time permits. Can fall back to Context-Aware Smart Replies if needed.

### Risk 3: Performance issues with 1000+ messages

**Mitigation**: Use FlatList with proper optimization (getItemLayout, removeClippedSubviews). Test early with large datasets. Implement pagination if needed.

### Risk 4: Push notifications don't work in production

**Mitigation**: Test on physical devices early. Use Expo's managed workflow (handles certificates). Debug with Expo notification tool.

### Risk 5: Dark mode breaks UI

**Mitigation**: Test theme switching frequently. Use theme context from the start. Ensure all colors come from theme object.

### Risk 6: Time management - 7 days is tight

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

**Risk Mitigation:**

- If agent is too complex, have fallback implementations ready
- If semantic search is slow, use simple keyword search as fallback
- If time runs out, cut bonus features (reactions, voice) - not core requirements
- Have fallback implementations for all AI features (keyword-based vs. AI-based)

**Current Progress**: 8/12 MVP tasks done! You're in great shape. Focus on wrapping up Day 3 tasks (groups, read receipts, push notifications), then dive into AI features. The multi-step agent will be the star of your demo.

**Good luck! 🚀**
