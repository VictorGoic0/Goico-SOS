# Messaging App - AI Features Implementation Task List (Vercel Backend)

## Overview

This document outlines the implementation of AI-powered features for the Remote Team Professional persona using **Vercel serverless functions** with Vercel AI SDK and OpenAI. The AI backend is deployed separately from the React Native mobile app.

**Architecture**: React Native frontend → Vercel serverless backend → OpenAI API

**Total PRs:** 4
**Timeline:** 3-4 days after core messaging is complete
**Target Persona:** Remote Team Professional

---

## PR #13: Vercel Backend Setup & Test Function

**Goal**: Initialize Vercel backend project and deploy a "Hello World" test function to verify deployment works

### Why This Matters

Before building AI features, we need to ensure the Vercel backend infrastructure works correctly. This PR establishes the foundation and validates deployment.

### Subtasks

**Initialize Backend Project:**

- [x] 1. Create backend directory in project root:

  ```bash
  mkdir backend
  cd backend
  ```

- [x] 2. Initialize Next.js project for Vercel:

  ```bash
  npx create-next-app@latest . --typescript --app --no-tailwind --no-src-dir --import-alias "@/*"
  ```

  When prompted, choose:

  - TypeScript: Yes
  - ESLint: Yes
  - App Router: Yes
  - Import alias: Yes (@/\*)
  - Other defaults: Yes

**Install Backend Dependencies:**

- [x] 3. Install Vercel AI SDK and OpenAI provider:

  ```bash
  npm install ai @ai-sdk/openai zod
  ```

- [x] 4. Install Firebase Admin SDK (for server-side Firebase access):

  ```bash
  npm install firebase-admin
  ```

- [x] 5. Verify `package.json` includes:
  ```json
  {
    "dependencies": {
      "next": "^14.0.0",
      "ai": "^3.0.0",
      "@ai-sdk/openai": "^0.0.x",
      "zod": "^3.22.0",
      "firebase-admin": "^12.0.0"
    }
  }
  ```

**Create Environment Variables:**

- [x] 6. Create `.env.local` in backend directory:

  ```
  # OpenAI API Key
  OPENAI_API_KEY=your_openai_key_here

  # Firebase Admin SDK (use individual fields or service account JSON)
  FIREBASE_PROJECT_ID=your_project_id
  FIREBASE_CLIENT_EMAIL=your_client_email
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

  # Or use full service account JSON (alternative):
  # FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
  ```

- [x] 7. Add `.env.local` to `.gitignore` (should be automatic with Next.js)
- [x] 8. Document environment variables in `backend/README.md`

**Configure Vercel Settings:**

- [x] 9. Create `backend/vercel.json`:

  ```json
  {
    "functions": {
      "app/api/**/*.ts": {
        "maxDuration": 60
      }
    }
  }
  ```

  This sets 60-second timeout for AI functions (Pro tier required for >10s)

**Create Firebase Admin Initialization:**

- [x] 10. File: `backend/lib/firebase-admin.ts`
- [x] 11. Initialize Firebase Admin SDK:

  ```typescript
  import admin from "firebase-admin";

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }

  export const db = admin.firestore();
  export const auth = admin.auth();
  ```

- [x] 12. Add helper function to fetch messages:

  ```typescript
  export async function getMessagesFromFirebase(
    conversationId: string,
    limit: number = 50
  ) {
    const messagesRef = db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(limit);

    const snapshot = await messagesRef.get();

    return snapshot.docs.map((doc) => ({
      messageId: doc.id,
      ...doc.data(),
    }));
  }
  ```

**Create Test API Route:**

- [x] 13. File: `backend/app/api/test/route.ts`
- [x] 14. Create simple test function:

  ```typescript
  import { NextResponse } from "next/server";

  export async function GET() {
    return NextResponse.json({
      message: "Hello from Vercel serverless function!",
      timestamp: new Date().toISOString(),
    });
  }

  export async function POST(req: Request) {
    const body = await req.json();

    return NextResponse.json({
      message: "Received your data!",
      data: body,
      timestamp: new Date().toISOString(),
    });
  }
  ```

**Deploy to Vercel:**

- [x] 15. Install Vercel CLI globally:

  ```bash
  npm install -g vercel
  ```

- [x] 16. Login to Vercel:

  ```bash
  vercel login
  ```

- [x] 17. Deploy from backend directory:

  ```bash
  cd backend
  vercel
  ```

  - Choose: Create new project
  - Project name: (your choice, e.g., "messaging-app-ai")
  - Directory: ./
  - Settings: Accept defaults

- [x] 18. Add environment variables in Vercel dashboard:

  - OPENAI_API_KEY
  - FIREBASE_PROJECT_ID
  - FIREBASE_CLIENT_EMAIL
  - FIREBASE_PRIVATE_KEY

- [x] 19. Deploy to production:

  ```bash
  vercel --prod
  ```

- [x] 20. Copy production URL (e.g., `https://your-app.vercel.app`)

**Test Deployment:**

- [x] 21. Test GET endpoint in browser:

  - Navigate to: `https://your-app.vercel.app/api/test`
  - Should see JSON response with "Hello from Vercel"

- [x] 22. Test POST endpoint with curl:

  ```bash
  curl -X POST https://your-app.vercel.app/api/test \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}'
  ```

  Should return JSON with your data

**Configure Mobile App:**

- [x] 23. Add backend URL to mobile app `.env`:

  ```
  EXPO_PUBLIC_BACKEND_URL=https://your-app.vercel.app
  ```

- [x] 24. Create AI service file: `mobile-app/src/services/aiService.js`

  ```javascript
  const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  // Test backend connection
  export const testBackend = async () => {
    try {
      const response = await fetch(`${API_URL}/api/test`);
      const data = await response.json();
      console.log("Backend test:", data);
      return data;
    } catch (error) {
      console.error("Backend connection failed:", error);
      throw error;
    }
  };

  // Helper function with error handling
  const callBackend = async (endpoint, body) => {
    try {
      const response = await fetch(`${API_URL}/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
      throw new Error(
        "AI service temporarily unavailable. Please try again later."
      );
    }
  };
  ```

- [x] 25. Test connection from mobile app:

  ```javascript
  // In HomeScreen or a test screen
  import { testBackend } from "../services/aiService";

  // On mount or button press:
  testBackend()
    .then((data) => console.log("Backend connected:", data))
    .catch((err) => console.error("Backend failed:", err));
  ```

**Create Backend Documentation:**

- [x] 26. File: `backend/README.md`
- [x] 27. Document:
  - Project setup instructions
  - Environment variables needed
  - Deployment process
  - API endpoints
  - Testing instructions

**Files Created:**

- `backend/package.json` (Next.js project)
- `backend/.env.local` (environment variables)
- `backend/vercel.json` (Vercel configuration)
- `backend/lib/firebase-admin.ts` (Firebase Admin SDK setup)
- `backend/app/api/test/route.ts` (test endpoint)
- `backend/README.md` (documentation)
- `mobile-app/src/services/aiService.js` (backend communication layer)

**Files Modified:**

- `mobile-app/.env` (add EXPO_PUBLIC_BACKEND_URL)

**Test Before Merge:**

- [x] 28. Vercel project deploys successfully
- [x] 29. Test endpoint returns JSON response
- [x] 30. Environment variables accessible in backend
- [x] 31. Mobile app can call backend successfully
- [x] 32. Firebase Admin SDK initializes without errors
- [x] 33. Backend logs show no errors in Vercel dashboard

---

## PR #14: Thread Summarization & Action Item Extraction

**Goal**: Implement the first 2 AI features using Vercel backend: Thread Summarization and Action Item Extraction

### Why This Matters

These are the foundational AI features that provide immediate value to remote teams. Thread summarization helps with information overload, while action item extraction prevents missed tasks.

### Subtasks

**Create Thread Summarization Backend:**

- [x] 1. File: `backend/app/api/summarize/route.ts`
- [x] 2. Implement summarization endpoint:

  ```typescript
  import { generateText } from 'ai';
  import { openai } from '@ai-sdk/openai';
  import { NextResponse } from 'next/server';
  import { getMessagesFromFirebase } from '@/lib/firebase-admin';

  export async function POST(req: Request) {
    try {
      const { conversationId, messageCount = 50 } = await req.json();

      // Validate input
      if (!conversationId) {
        return NextResponse.json(
          { error: 'conversationId is required' },
          { status: 400 }
        );
      }

      // Fetch messages from Firebase (server-side)
      const messages = await getMessagesFromFirebase(conversationId, messageCount);

      if (messages.length === 0) {
        return NextResponse.json(
          { error: 'No messages found in conversation' },
          { status: 404 }
        );
      }

      // Create prompt
      const conversationText = messages
        .reverse() // Chronological order
        .map(m => `${m.senderUsername}: ${m.text}`)
        .join('\n');

  const prompt = `Summarize this conversation thread in 3-4 bullet points. Focus on key topics, decisions, and action items: ${conversationText}
  ```

Provide a concise summary with:

- Main topics discussed
- Key decisions made
- Outstanding questions`;

```javascript
      // Generate summary with OpenAI
      const { text } = await generateText({
        model: openai('gpt-4-turbo'),
        prompt,
        maxTokens: 300,
      });

      return NextResponse.json({
        summary: text,
        messageCount: messages.length,
        conversationId
      });

  } catch (error) {
  console.error('Summarization error:', error);
  return NextResponse.json(
  { error: 'Failed to generate summary' },
  { status: 500 }
  );
}

```

**Create Action Item Extraction Backend:**

- [x] 3. File: `backend/app/api/extract-actions/route.ts`
- [x] 4. Define Zod schema and implement extraction:

```typescript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getMessagesFromFirebase } from "@/lib/firebase-admin";

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
  try {
    const { conversationId, messageCount = 100 } = await req.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    // Fetch messages from Firebase
    const messages = await getMessagesFromFirebase(
      conversationId,
      messageCount
    );

    if (messages.length === 0) {
      return NextResponse.json({ actionItems: [] });
    }

    const conversationText = messages
      .reverse()
      .map((m) => `${m.senderUsername}: ${m.text}`)
      .join("\n");

    const prompt = `Extract all action items from this conversation. Format as a list with:

- Task description
- Assigned to (if mentioned)
- Deadline (if mentioned)
- Status (pending/completed based on context)

Conversation:
${conversationText}`;

    // Use generateObject for structured output
    const { object } = await generateObject({
      model: openai("gpt-4-turbo"),
      schema: ActionItemSchema,
      prompt,
    });

    return NextResponse.json({
      actionItems: object.items,
      conversationId,
    });
  } catch (error) {
    console.error("Action extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract action items" },
      { status: 500 }
    );
  }
}
```

**Update Mobile AI Service:**

- [x] 5. File: `mobile-app/src/services/aiService.js`
- [x] 6. Add summarization function:

```javascript
export const summarizeThread = async (conversationId, messageCount = 50) => {
  return await callBackend("summarize", {
    conversationId,
    messageCount,
  });
};
```

- [x] 7. Add action item extraction function:

  ```javascript
  export const extractActionItems = async (
    conversationId,
    messageCount = 100
  ) => {
    return await callBackend("extract-actions", {
      conversationId,
      messageCount,
    });
  };
  ```

**Create Thread Summary UI:**

- [x] 8. File: `mobile-app/src/components/ThreadSummaryModal.js`
- [x] 9. Create modal component:

  ```javascript
  import React from "react";
  import {
    Modal,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
  } from "react-native";
  import { tokens } from "../styles/tokens";

  export default function ThreadSummaryModal({
    visible,
    onClose,
    summary,
    loading,
  }) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Thread Summary</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              {loading ? (
                <ActivityIndicator size="large" color={tokens.colors.primary} />
              ) : summary ? (
                <Text style={styles.summaryText}>{summary}</Text>
              ) : (
                <Text style={styles.errorText}>No summary available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  const styles = {
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 20,
      width: "90%",
      maxHeight: "70%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
    },
    closeButton: {
      fontSize: 24,
      color: "#666",
    },
    content: {
      maxHeight: 400,
    },
    summaryText: {
      fontSize: 16,
      lineHeight: 24,
    },
    errorText: {
      fontSize: 16,
      color: "#999",
      textAlign: "center",
    },
  };
  ```

**Create Action Items Screen:**

- [x] 10. File: `mobile-app/src/screens/ActionItemsScreen.js`
- [x] 11. Implement action items list view:

  ```javascript
  import React, { useState, useEffect } from "react";
  import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
  } from "react-native";
  import { extractActionItems } from "../services/aiService";

  export default function ActionItemsScreen({ route }) {
    const { conversationId } = route.params;
    const [actionItems, setActionItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadActionItems();
    }, []);

    const loadActionItems = async () => {
      try {
        setLoading(true);
        const result = await extractActionItems(conversationId);
        setActionItems(result.actionItems || []);
      } catch (error) {
        console.error("Failed to load action items:", error);
      } finally {
        setLoading(false);
      }
    };

    const renderItem = ({ item }) => (
      <View style={styles.item}>
        <Text style={styles.task}>{item.task}</Text>
        {item.assignedTo && (
          <Text style={styles.assigned}>Assigned to: {item.assignedTo}</Text>
        )}
        {item.deadline && (
          <Text style={styles.deadline}>Deadline: {item.deadline}</Text>
        )}
        <Text style={styles.status}>Status: {item.status}</Text>
        <Text style={styles.context}>{item.context}</Text>
      </View>
    );

    if (loading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={actionItems}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <Text style={styles.empty}>No action items found</Text>
          }
        />
        <TouchableOpacity style={styles.refresh} onPress={loadActionItems}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Add styles...
  ```

**Connect to ChatScreen:**

- [x] 12. File: `mobile-app/src/screens/ChatScreen.js`
- [x] 13. Add AI buttons to header:

  ```javascript
  import { summarizeThread } from '../services/aiService';
  import ThreadSummaryModal from '../components/ThreadSummaryModal';

  // In ChatScreen component:
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleSummarize = async () => {
    setShowSummary(true);
    setLoadingSummary(true);
    try {
      const result = await summarizeThread(conversationId);
      setSummary(result.summary);
    } catch (error) {
      console.error('Summarization failed:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // In header:
  <TouchableOpacity onPress={handleSummarize}>
    <Text>📝 Summary</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => navigation.navigate('ActionItems', { conversationId })}>
    <Text>📋 Actions</Text>
  </TouchableOpacity>

  // Add modal:
  <ThreadSummaryModal
    visible={showSummary}
    onClose={() => setShowSummary(false)}
    summary={summary}
    loading={loadingSummary}
  />
  ```

**Add Navigation:**

- [x] 14. File: `mobile-app/src/navigation/AppNavigator.js`
- [x] 15. Add ActionItemsScreen to stack:

  ```javascript
  <Stack.Screen
    name="ActionItems"
    component={ActionItemsScreen}
    options={{ title: "Action Items" }}
  />
  ```

**Deploy Backend Changes:**

- [x] 16. From backend directory, deploy updates:

  ```bash
  cd backend
  vercel --prod
  ```

**Test AI Features:**

- [x] 17. Create test conversation with 50+ messages covering various topics
- [x] 18. Test thread summarization:

  - Tap "📝 Summary" button in ChatScreen
  - Verify loading indicator appears
  - Verify summary appears in modal
  - Check summary captures main topics (3-4 bullet points)
  - Response time should be <3 seconds

- [x] 19. Test action item extraction:
  - Send messages with commitments: "I'll finish the report by Friday"
  - Send assignments: "Can you review the PR, John?"
  - Tap "📋 Actions" button
  - Verify navigation to ActionItemsScreen
  - Verify all action items extracted correctly
  - Check assignedTo and deadline fields populated
  - Response time should be <3 seconds

**Files Created:**

- `backend/app/api/summarize/route.ts` (summarization endpoint)
- `backend/app/api/extract-actions/route.ts` (action extraction endpoint)
- `mobile-app/src/components/ThreadSummaryModal.js` (summary modal UI)
- `mobile-app/src/screens/ActionItemsScreen.js` (action items screen)

**Files Modified:**

- `mobile-app/src/services/aiService.js` (add AI functions)
- `mobile-app/src/screens/ChatScreen.js` (add AI buttons and modal)
- `mobile-app/src/navigation/AppNavigator.js` (add ActionItemsScreen)

**Test Before Merge:**

- [x] 20. Backend endpoints deploy successfully
- [x] 21. Mobile app can call backend endpoints
- [x] 22. Thread summarization works with sample conversation
- [x] 23. Summary is concise and accurate (3-4 bullet points)
- [x] 24. Action item extraction identifies tasks correctly
- [x] 25. UI components display results properly
- [x] 26. Navigation between screens works
- [x] 27. Error handling works (test with invalid conversationId)
- [x] 28. Response times meet targets (<3 seconds)
- [x] 29. Loading states work properly

---

## PR #15: Smart Search & Priority Detection

**Goal**: Implement semantic search using OpenAI embeddings and automatic priority detection for messages

**Implementation Notes**:

- **Hybrid Search Algorithm**: Combines semantic embeddings with keyword matching for optimal results
  - Pure semantic search (cosine similarity) captures contextual meaning
  - Keyword matching with bidirectional stem matching (4-char stems) catches word variations
  - Examples: "meeting" matches "meet", "availability" matches "available"
  - Keyword boost of +0.25 applied when query terms found in message text
- **Threshold Tuning**: Set to 0.4 after testing (balances precision vs recall)
  - Keyword-matched messages typically score 0.5-1.0 (semantic + boost)
  - Pure semantic matches need 0.4+ to be relevant
  - Filters out irrelevant results like "hello" while catching related content
- **Results Limit**: Returns top 5 results (not 10) for cleaner UX
- **Variable Naming Standards**: Enforced via `.cursor/rules/variable-naming.mdc`
  - No single-letter variables except `i` for index and `(a, b)` in sorts

### Subtasks

**Create Semantic Search Backend:**

- [x] 1. File: `backend/app/api/search/route.ts`
- [x] 2. Implement semantic search endpoint:

  ```typescript
  import { embed } from "ai";
  import { openai } from "@ai-sdk/openai";
  import { NextResponse } from "next/server";
  import { getMessagesFromFirebase } from "@/lib/firebase-admin";

  // Helper: Calculate cosine similarity
  function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  export async function POST(req: Request) {
    try {
      const { conversationId, query, messageCount = 200 } = await req.json();

      if (!conversationId || !query) {
        return NextResponse.json(
          { error: "conversationId and query are required" },
          { status: 400 }
        );
      }

      // Fetch messages
      const messages = await getMessagesFromFirebase(
        conversationId,
        messageCount
      );

      if (messages.length === 0) {
        return NextResponse.json({ results: [] });
      }

      // Get query embedding
      const { embedding: queryEmbedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: query,
      });

      // Compute embeddings for all messages
      const messageEmbeddings = await Promise.all(
        messages.map((m) =>
          embed({
            model: openai.embedding("text-embedding-3-small"),
            value: m.text,
          })
        )
      );

      // Calculate similarity and filter
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

      return NextResponse.json({
        results,
        query,
        conversationId,
      });
    } catch (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Failed to search messages" },
        { status: 500 }
      );
    }
  }
  ```

**Create Priority Detection Backend:**

- [x] 3. File: `backend/app/api/priority/route.ts`
- [x] 4. Implement priority detection:

  ```typescript
  import { generateObject } from 'ai';
  import { openai } from '@ai-sdk/openai';
  import { NextResponse } from 'next/server';
  import { z } from 'zod';

  const PrioritySchema = z.object({
    priority: z.enum(['high', 'normal', 'low']),
    reason: z.string(),
    urgencyScore: z.number().min(0).max(10),
  });

  export async function POST(req: Request) {
    try {
      const { messageText } = await req.json();

      if (!messageText) {
        return NextResponse.json(
          { error: 'messageText is required' },
          { status: 400 }
        );
      }

      const prompt = `Analyze this message and determine if it's urgent or high priority.
  Consider: deadlines, requests for immediate action, escalations, blockers.
  ```

Message: "${messageText}"

Respond with:

- priority: "high" | "normal" | "low"
- reason: brief explanation
- urgencyScore: 0-10`;

      const { object } = await generateObject({
        model: openai('gpt-4-turbo'),
        schema: PrioritySchema,
        prompt,
      });

      return NextResponse.json(object);

  } catch (error) {
  console.error('Priority detection error:', error);
  return NextResponse.json(
  { error: 'Failed to detect priority' },
  { status: 500 }
  );
  }
  }

  ```

  ```

**Update Mobile AI Service:**

- [x] 5. File: `mobile-app/src/services/aiService.js`
- [x] 6. Add search and priority functions:

  ```javascript
  export const semanticSearch = async (
    conversationId,
    query,
    messageCount = 200
  ) => {
    return await callBackend("search", {
      conversationId,
      query,
      messageCount,
    });
  };

  export const detectPriority = async (messageText) => {
    return await callBackend("priority", { messageText });
  };
  ```

**Update MessageBubble for Priority Display:**

- [x] 7. File: `mobile-app/src/components/MessageBubble.js`
- [x] 8. Add priority indicator:

  ```javascript
  // Add priority prop
  export default function MessageBubble({ message, isSent, priority }) {
    return (
      <View
        style={[
          styles.bubble,
          isSent ? styles.sent : styles.received,
          priority === "high" && styles.highPriority,
        ]}
      >
        {priority === "high" && (
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>🔴 High Priority</Text>
          </View>
        )}
        <Text style={styles.text}>{message.text}</Text>
        {/* ... rest of component */}
      </View>
    );
  }

  const styles = StyleSheet.create({
    // ... existing styles
    highPriority: {
      borderWidth: 2,
      borderColor: "#FF3B30",
    },
    priorityBadge: {
      backgroundColor: "#FF3B30",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginBottom: 4,
    },
    priorityText: {
      color: "white",
      fontSize: 12,
      fontWeight: "bold",
    },
  });
  ```

**Add Search UI to ChatScreen:**

- [x] 9. File: `mobile-app/src/screens/ChatScreen.js`
- [x] 10. Add search bar below header:

  ```javascript
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const result = await semanticSearch(conversationId, searchQuery);
      setSearchResults(result.results || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  // In render:
  <View style={styles.searchBar}>
    <TextInput
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholder="Search messages..."
      style={styles.searchInput}
    />
    <TouchableOpacity onPress={handleSearch}>
      <Text>🔍</Text>
    </TouchableOpacity>
  </View>;

  {
    searchResults.length > 0 && (
      <ScrollView style={styles.searchResults}>
        {searchResults.map((msg, i) => (
          <TouchableOpacity key={i} style={styles.searchResult}>
            <Text>{msg.text}</Text>
            <Text style={styles.similarity}>
              Match: {(msg.similarity * 100).toFixed(0)}%
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }
  ```

**Implement Auto-Priority Detection:**

- [x] 11. File: `mobile-app/src/screens/ChatScreen.js`
- [x] 12. Add priority detection for incoming messages:

  ```javascript
  // In message listener, after receiving new message
  useEffect(() => {
    // ... existing listener code

    // Detect priority for new messages from others
    const newMessages = snapshot.docs.filter(
      (doc) => doc.data().senderId !== currentUser.uid && !doc.data().priority // Not already analyzed
    );

    newMessages.forEach(async (doc) => {
      try {
        const priority = await detectPriority(doc.data().text);

        // Update message with priority data
        if (priority.priority === "high") {
          await updateDoc(doc.ref, {
            priority: priority.priority,
            priorityReason: priority.reason,
            urgencyScore: priority.urgencyScore,
          });
        }
      } catch (error) {
        console.error("Priority detection failed:", error);
      }
    });
  }, [conversationId]);
  ```

**Deploy Backend Changes:**

- [x] 13. Deploy to Vercel:

  ```bash
  cd backend
  vercel --prod
  ```

**Test Semantic Search:**

- [x] 14. Create messages with varied topics
- [x] 15. Test semantic search:
  - Search for "meeting schedule" (semantic query)
  - Verify results include messages about "calendar", "availability", "time to meet"
  - Check similarity scores are accurate
  - Response time should be <3 seconds

**Test Priority Detection:**

- [x] 16. Send urgent message: "Production is down! Need help ASAP!"
- [x] 17. Verify message flagged as high priority with red border
- [x] 18. Check priority reason is accurate
- [x] 19. Send normal message: "Let me know when you're free"
- [x] 20. Verify marked as normal priority (no special styling)
- [x] 21. Response time should be <8 seconds

**Files Created:**

- `backend/app/api/search/route.ts` (semantic search endpoint)
- `backend/app/api/priority/route.ts` (priority detection endpoint)

**Files Modified:**

- `mobile-app/src/services/aiService.js` (add search and priority functions)
- `mobile-app/src/components/MessageBubble.js` (add priority display)
- `mobile-app/src/screens/ChatScreen.js` (add search UI and auto-priority)

**Test Before Merge:**

- [x] 22. Semantic search finds contextually relevant messages
- [x] 23. Search results show similarity scores
- [x] 24. Priority detection flags urgent messages correctly
- [x] 25. High-priority messages show red border/badge
- [x] 26. Auto-priority detection works on new messages
- [x] 27. Search performance meets targets (<3s)
- [x] 28. Priority detection performance acceptable (<8s)
- [x] 29. Error handling works properly

---

## PR #16: AI Agent as a Conversation

**Goal**: Implement the AI agent as a pinned conversation at the top of HomeScreen. Users interact with the agent through the existing ChatScreen UI, making AI feel like a natural team member rather than a separate feature.

### Why This Approach

The AI agent appears as a regular conversation that's always visible at the top of HomeScreen:

- **Familiar UX**: Users interact with the agent like any other chat
- **Reuses existing UI**: ChatScreen handles all the conversation UI
- **Natural interface**: AI feels like a team member, not a separate feature
- **Scalable**: Easy to add more AI capabilities through conversation
- **Simplifies architecture**: One chat interface instead of multiple modals/screens

This PR completes the full transition: it creates the agent conversation AND refactors existing Summary/Action Items buttons (from PR14) to use pre-filled prompts that navigate to the agent chat. By the end of this PR, all AI features use the unified conversational interface.

### Subtasks

**Create Static AI Agent Profile:**

- [ ] 1. File: `mobile-app/src/utils/aiAgent.js`
- [ ] 2. Create static AI agent object:

  ```javascript
  // Static AI agent profile (not a real Firebase user)
  export const AI_AGENT = {
    userId: "ai-agent",
    username: "assistant",
    displayName: "AI Assistant",
    photoURL: null, // or use a robot icon URL
    bio: "Your AI team assistant - ask me anything about your conversations",
    status: "Available",
    isAI: true, // Flag to identify AI agent
  };

  // Helper to check if a user/conversation is with the AI agent
  export const isAIAgent = (userId) => userId === AI_AGENT.userId;

  // Get agent conversation ID for current user
  export const getAgentConversationId = (currentUserId) => {
    return `${currentUserId}_${AI_AGENT.userId}`;
  };
  ```

**Update HomeScreen to Show AI Agent at Top:**

- [ ] 3. File: `mobile-app/src/screens/HomeScreen.js`
- [ ] 4. Import AI agent and modify user list:

  ```javascript
  import { AI_AGENT, getAgentConversationId } from "../utils/aiAgent";
  import { useFirebaseStore } from "../stores/firebaseStore";

  // In HomeScreen component:
  const currentUser = useFirebaseStore((s) => s.currentUser);
  const users = useFirebaseStore((s) => s.users);

  // Filter out AI agent from regular user list
  const regularUsers = users.filter((u) => u.userId !== AI_AGENT.userId);

  // Render AI agent as first item
  <FlatList
    data={regularUsers}
    renderItem={({ item }) => (
      <UserListItem
        user={item}
        onPress={() => navigation.navigate("Chat", { userId: item.userId })}
      />
    )}
    ListHeaderComponent={() => (
      <TouchableOpacity
        style={styles.aiAgentItem}
        onPress={() =>
          navigation.navigate("Chat", {
            userId: AI_AGENT.userId,
            conversationId: getAgentConversationId(currentUser.userId),
          })
        }
      >
        <View style={styles.aiAgentAvatar}>
          <Text style={styles.aiAgentIcon}>🤖</Text>
        </View>
        <View style={styles.aiAgentInfo}>
          <Text style={styles.aiAgentName}>{AI_AGENT.displayName}</Text>
          <Text style={styles.aiAgentBio}>{AI_AGENT.bio}</Text>
        </View>
        <View style={styles.aiAgentBadge}>
          <Text style={styles.aiAgentBadgeText}>AI</Text>
        </View>
      </TouchableOpacity>
    )}
  />;
  ```

- [ ] 5. Add styling for AI agent list item:

  ```javascript
  const styles = StyleSheet.create({
    aiAgentItem: {
      flexDirection: "row",
      padding: 16,
      backgroundColor: "#F0F9FF", // Light blue background
      borderBottomWidth: 2,
      borderBottomColor: "#3B82F6",
      alignItems: "center",
    },
    aiAgentAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "#3B82F6",
      justifyContent: "center",
      alignItems: "center",
    },
    aiAgentIcon: {
      fontSize: 28,
    },
    aiAgentInfo: {
      flex: 1,
      marginLeft: 12,
    },
    aiAgentName: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#1E40AF",
    },
    aiAgentBio: {
      fontSize: 14,
      color: "#64748B",
      marginTop: 2,
    },
    aiAgentBadge: {
      backgroundColor: "#3B82F6",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    aiAgentBadgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "bold",
    },
  });
  ```

**Create Agent Backend Endpoint:**

- [ ] 6. File: `backend/app/api/agent/route.ts`
- [ ] 7. Implement conversational AI agent with streaming:

  ```typescript
  import { streamText, tool } from 'ai';
  import { openai } from '@ai-sdk/openai';
  import { NextResponse } from 'next/server';
  import { z } from 'zod';
  import { getMessagesFromFirebase } from '@/lib/firebase-admin';

  export async function POST(req: Request) {
    try {
      const { message, conversationId, context } = await req.json();

      if (!message) {
        return NextResponse.json(
          { error: 'message is required' },
          { status: 400 }
        );
      }

      // Get conversation history for context (last 20 messages)
      let conversationHistory = '';
      if (conversationId && context?.includeHistory) {
        try {
          const messages = await getMessagesFromFirebase(conversationId, 20);
          conversationHistory = messages
            .reverse()
            .map(m => `${m.senderUsername}: ${m.text}`)
            .join('\n');
        } catch (error) {
          console.error('Failed to fetch conversation history:', error);
        }
      }

      const systemPrompt = `You are an AI assistant for a remote team messaging app. You help users with:
  ```

- Summarizing conversations
- Extracting action items and decisions
- Finding information in their messages
- Answering questions about their conversations

Be concise, helpful, and professional. When asked to analyze conversations, provide clear, structured responses.

${conversationHistory ? `Recent conversation history:\n${conversationHistory}\n` : ''}`;

      const result = await streamText({
        model: openai('gpt-4-turbo'),
        system: systemPrompt,
        prompt: message,
        maxTokens: 500,
      });

      // Return streaming response
      return result.toAIStreamResponse();

    } catch (error) {
      console.error('Agent error:', error);
      return NextResponse.json(
        { error: 'Failed to process message' },
        { status: 500 }
      );
    }

}

````

**Update AI Service for Agent:**

- [ ] 8. File: `mobile-app/src/services/aiService.js`
- [ ] 9. Add agent chat function:

```javascript
// Send message to AI agent with streaming
export const sendAgentMessage = async (message, conversationId, onChunk) => {
  try {
    const response = await fetch(`${API_URL}/api/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversationId,
        context: {
          includeHistory: true
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Agent error: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;

      // Call onChunk callback for real-time UI updates
      if (onChunk) {
        onChunk(chunk, fullText);
      }
    }

    return fullText;
  } catch (error) {
    console.error('Agent message failed:', error);
    throw error;
  }
};
````

**Update ChatScreen to Handle AI Agent:**

- [ ] 10. File: `mobile-app/src/screens/ChatScreen.js`
- [ ] 11. Detect AI agent and route messages appropriately:

  ```javascript
  import { AI_AGENT, isAIAgent } from "../utils/aiAgent";
  import { sendAgentMessage } from "../services/aiService";

  // In ChatScreen component:
  const { userId, conversationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [agentTyping, setAgentTyping] = useState(false);

  // Check if this is an AI agent conversation
  const isAIConversation = isAIAgent(userId);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText("");

    // Add user message to UI immediately
    const userMessage = {
      messageId: Date.now().toString(),
      text: messageText,
      senderId: currentUser.userId,
      senderUsername: currentUser.username,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);

    if (isAIConversation) {
      // Handle AI agent conversation
      setAgentTyping(true);

      try {
        let agentResponse = "";
        const agentMessageId = (Date.now() + 1).toString();

        // Create placeholder for agent message
        const agentMessage = {
          messageId: agentMessageId,
          text: "",
          senderId: AI_AGENT.userId,
          senderUsername: AI_AGENT.username,
          timestamp: new Date(),
          isUser: false,
          isStreaming: true,
        };

        setMessages((prev) => [...prev, agentMessage]);

        // Stream response from agent
        await sendAgentMessage(
          messageText,
          conversationId,
          (chunk, fullText) => {
            agentResponse = fullText;
            // Update the agent message with streaming text
            setMessages((prev) =>
              prev.map((msg) =>
                msg.messageId === agentMessageId
                  ? { ...msg, text: fullText }
                  : msg
              )
            );
          }
        );

        // Mark streaming complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === agentMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
      } catch (error) {
        console.error("Agent failed:", error);
        // Show error message
        const errorMessage = {
          messageId: Date.now().toString(),
          text: "Sorry, I encountered an error. Please try again.",
          senderId: AI_AGENT.userId,
          senderUsername: AI_AGENT.username,
          timestamp: new Date(),
          isUser: false,
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setAgentTyping(false);
      }
    } else {
      // Handle regular Firebase conversation
      await sendMessage(conversationId, messageText);
    }
  };

  // Modify header to show AI agent info
  const otherUser = isAIConversation ? AI_AGENT : getUserById(userId);
  ```

- [ ] 12. Add typing indicator for agent:

  ```javascript
  // In render, after messages list:
  {
    isAIConversation && agentTyping && (
      <View style={styles.typingIndicator}>
        <Text style={styles.typingText}>AI Assistant is thinking...</Text>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }
  ```

- [ ] 13. Update MessageBubble to handle streaming:

  ```javascript
  // In MessageBubble component:
  export default function MessageBubble({ message, isSent }) {
    const isStreaming = message.isStreaming;

    return (
      <View style={[styles.bubble, isSent ? styles.sent : styles.received]}>
        <Text style={styles.text}>{message.text}</Text>
        {isStreaming && (
          <ActivityIndicator
            size="small"
            color={isSent ? "#fff" : "#666"}
            style={styles.streamingIndicator}
          />
        )}
        {/* ... rest of component */}
      </View>
    );
  }
  ```

**Deploy Backend:**

- [ ] 14. Deploy agent endpoint to Vercel:

  ```bash
  cd backend
  vercel --prod
  ```

**Test AI Agent Conversation:**

- [ ] 15. Test basic conversation flow:

  - Open HomeScreen and verify AI Agent appears at top
  - Tap AI Agent to open chat
  - Send message: "Hello, what can you help me with?"
  - Verify agent responds with capabilities
  - Verify streaming works (text appears gradually)

- [ ] 16. Test with conversation context:

  - Go to a regular conversation with messages
  - Navigate to AI Agent chat
  - Ask: "Summarize my recent conversation"
  - Verify agent can access conversation context

- [ ] 17. Test conversation persistence:

  - Have a conversation with agent
  - Close app
  - Reopen and verify conversation history shows
  - (Note: For MVP, can store in local state. Firebase storage is optional)

- [ ] 18. Test error handling:

  - Turn off internet
  - Try to send message to agent
  - Verify error message appears
  - Reconnect and verify it works again

- [ ] 19. Test UI/UX polish:
  - Verify AI agent has distinct visual style
  - Verify streaming animation is smooth
  - Verify typing indicator appears
  - Verify agent badge shows clearly

**Refactor Existing AI Buttons to Use Agent Chat:**

- [ ] 20. File: `mobile-app/src/screens/ChatScreen.js`
- [ ] 21. Update Summary button to navigate to agent with pre-filled prompt:

  ```javascript
  // Remove old summarization modal state
  // const [showSummary, setShowSummary] = useState(false);
  // const [summary, setSummary] = useState('');

  // Update Summary button handler
  const handleSummarize = () => {
    navigation.navigate("Chat", {
      userId: AI_AGENT.userId,
      conversationId: getAgentConversationId(currentUser.userId),
      initialMessage: `Please summarize the last 50 messages from conversation ${conversationId}`,
    });
  };

  // In header:
  <TouchableOpacity onPress={handleSummarize}>
    <Text>📝 Summary</Text>
  </TouchableOpacity>;
  ```

- [ ] 22. Update Action Items button to navigate to agent:

  ```javascript
  const handleActionItems = () => {
    navigation.navigate("Chat", {
      userId: AI_AGENT.userId,
      conversationId: getAgentConversationId(currentUser.userId),
      initialMessage: `Please extract all action items from conversation ${conversationId}`,
    });
  };

  // In header:
  <TouchableOpacity onPress={handleActionItems}>
    <Text>📋 Actions</Text>
  </TouchableOpacity>;
  ```

- [ ] 23. Update ChatScreen to handle initialMessage prop:

  ```javascript
  // In ChatScreen component:
  const { userId, conversationId, initialMessage } = route.params;

  useEffect(() => {
    if (initialMessage && isAIConversation) {
      // Auto-send the initial message when screen opens
      setInputText(initialMessage);
      // Optionally auto-submit after a brief delay
      setTimeout(() => {
        handleSend();
      }, 300);
    }
  }, [initialMessage]);
  ```

- [ ] 24. Remove old AI UI components (if any were created in PR14):

  - Remove ThreadSummaryModal component (if exists)
  - Remove ActionItemsScreen navigation (if exists)
  - Clean up any modal state management

- [ ] 25. Test refactored buttons:
  - Tap Summary button in a conversation
  - Verify it navigates to AI Agent chat
  - Verify pre-filled prompt appears and auto-sends
  - Verify agent provides summary
  - Repeat for Action Items button
  - Verify UX feels seamless

**Files Created:**

- `mobile-app/src/utils/aiAgent.js` (AI agent profile and helpers)
- `backend/app/api/agent/route.ts` (agent endpoint with streaming)

**Files Modified:**

- `mobile-app/src/screens/HomeScreen.js` (add AI agent at top)
- `mobile-app/src/screens/ChatScreen.js` (detect and handle AI conversations)
- `mobile-app/src/services/aiService.js` (add sendAgentMessage function)
- `mobile-app/src/components/MessageBubble.js` (handle streaming indicator)

**Test Before Merge:**

- [ ] 26. AI agent appears at top of HomeScreen
- [ ] 27. AI agent has distinct visual styling
- [ ] 28. Tapping agent opens ChatScreen correctly
- [ ] 29. Messages to agent stream in real-time
- [ ] 30. Agent responses are helpful and contextual
- [ ] 31. Conversation history persists (at least in session)
- [ ] 32. Error handling works for network failures
- [ ] 33. Typing indicator shows while agent processes
- [ ] 34. Agent can access conversation context when provided
- [ ] 35. Response time is acceptable (<5s for simple queries)
- [ ] 36. UI feels natural and integrated
- [ ] 37. Summary button navigates to agent chat with pre-filled prompt
- [ ] 38. Action Items button navigates to agent chat with pre-filled prompt
- [ ] 39. Pre-filled prompts auto-send correctly
- [ ] 40. All AI features now use unified agent interface

---

## PR #17: Decision Tracking & Multi-Step Agent

**Goal**: Implement decision extraction and the advanced multi-step AI agent for complex workflows

### Subtasks

**Create Decision Tracking Backend:**

- [ ] 1. File: `backend/app/api/decisions/route.ts`
- [ ] 2. Implement decision extraction:

  ```typescript
  import { generateObject } from 'ai';
  import { openai } from '@ai-sdk/openai';
  import { NextResponse } from 'next/server';
  import { z } from 'zod';
  import { getMessagesFromFirebase } from '@/lib/firebase-admin';

  const DecisionSchema = z.object({
    decisions: z.array(
      z.object({
        decision: z.string(),
        participants: z.array(z.string()),
        timestamp: z.string().nullable(),
        context: z.string(),
        confidence: z.enum(['high', 'medium', 'low']),
      })
    ),
  });

  export async function POST(req: Request) {
    try {
      const { conversationId, messageCount = 100 } = await req.json();

      if (!conversationId) {
        return NextResponse.json(
          { error: 'conversationId is required' },
          { status: 400 }
        );
      }

      const messages = await getMessagesFromFirebase(conversationId, messageCount);

      if (messages.length === 0) {
        return NextResponse.json({ decisions: [] });
      }

      const conversationText = messages
        .reverse()
        .map(m => `${m.senderUsername}: ${m.text}`)
        .join('\n');

      const prompt = `Identify all decisions made in this conversation.
  A decision is a conclusion reached by the group, not just a suggestion.
  ```

Look for phrases like: "let's do...", "we agreed...", "decided to...", "going with..."

Conversation:
${conversationText}

Return JSON array with decision, participants, timestamp, context, and confidence level.`;

      const { object } = await generateObject({
        model: openai('gpt-4-turbo'),
        schema: DecisionSchema,
        prompt,
      });

      // Filter out low-confidence decisions
      const filteredDecisions = object.decisions.filter(
        d => d.confidence !== 'low'
      );

      return NextResponse.json({
        decisions: filteredDecisions,
        conversationId
      });

    } catch (error) {
      console.error('Decision extraction error:', error);
      return NextResponse.json(
        { error: 'Failed to extract decisions' },
        { status: 500 }
      );
    }

}

````

**Create Multi-Step Agent Backend:**

- [ ] 3. File: `backend/lib/agent-tools.ts`
- [ ] 4. Create helper functions for agent tools:

```typescript
import { getMessagesFromFirebase, db } from "./firebase-admin";

export async function searchMessages(
  conversationId: string,
  filters: {
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }
) {
  let query = db
    .collection("conversations")
    .doc(conversationId)
    .collection("messages");

  if (filters.startDate) {
    query = query.where("timestamp", ">=", new Date(filters.startDate));
  }

  if (filters.endDate) {
    query = query.where("timestamp", "<=", new Date(filters.endDate));
  }

  const snapshot = await query.get();
  let messages = snapshot.docs.map((doc) => ({
    messageId: doc.id,
    ...doc.data(),
  }));

  if (filters.keyword) {
    messages = messages.filter((m) =>
      m.text.toLowerCase().includes(filters.keyword.toLowerCase())
    );
  }

  return messages;
}

export function groupBy(array: any[], key: string) {
  return array.reduce((grouped, item) => {
    const groupKey = item[key] || "Unassigned";
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(item);
    return grouped;
  }, {});
}

export function formatReport(data: any, title: string) {
  let report = `# ${title}\n\n`;

  for (const [key, items] of Object.entries(data)) {
    report += `## ${key}\n`;
    if (Array.isArray(items)) {
      items.forEach((item: any, i: number) => {
        report += `${i + 1}. ${item.task || JSON.stringify(item)}\n`;
      });
    }
    report += "\n";
  }

  return report;
}
````

- [ ] 5. File: `backend/app/api/agent/route.ts`
- [ ] 6. Implement multi-step agent:

  ```typescript
  import { streamText, tool } from 'ai';
  import { openai } from '@ai-sdk/openai';
  import { z } from 'zod';
  import { searchMessages, groupBy, formatReport } from '@/lib/agent-tools';
  import { getMessagesFromFirebase } from '@/lib/firebase-admin';

  // Define tools the agent can use
  const agentTools = {
    searchMessages: tool({
      description: 'Search messages in a conversation by date range or keyword',
      parameters: z.object({
        conversationId: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        keyword: z.string().optional(),
      }),
      execute: async ({ conversationId, startDate, endDate, keyword }) => {
        return await searchMessages(conversationId, {
          startDate,
          endDate,
          keyword,
        });
      },
    }),

    extractActionItems: tool({
      description: 'Extract action items from a set of messages',
      parameters: z.object({
        messages: z.array(z.any()),
      }),
      execute: async ({ messages }) => {
        // Simplified extraction logic
        return messages
          .filter(m =>
            m.text.includes('will') ||
            m.text.includes('todo') ||
            m.text.includes('task')
          )
          .map(m => ({
            task: m.text,
            assignedTo: m.senderUsername,
            status: 'pending',
          }));
      },
    }),

    categorizeByPerson: tool({
      description: 'Group action items by assigned person',
      parameters: z.object({
        actionItems: z.array(z.any()),
      }),
      execute: async ({ actionItems }) => {
        return groupBy(actionItems, 'assignedTo');
      },
    }),

    generateReport: tool({
      description: 'Generate a formatted summary report',
      parameters: z.object({
        data: z.any(),
        title: z.string(),
      }),
      execute: async ({ data, title }) => {
        return formatReport(data, title);
      },
    }),
  };

  export async function POST(req: Request) {
    try {
      const { userQuery, conversationId } = await req.json();

      if (!userQuery || !conversationId) {
        return new Response(
          JSON.stringify({ error: 'userQuery and conversationId are required' }),
          { status: 400 }
        );
      }

      const result = await streamText({
        model: openai('gpt-4-turbo'),
        tools: agentTools,
        maxSteps: 10, // Allow up to 10 reasoning steps
        system: `You are a helpful assistant for a remote team. You can search messages, extract action items, categorize data, and generate reports.
  ```

Break down complex requests into steps and use available tools to complete the task.`,
        prompt: `Conversation ID: ${conversationId}\n\nUser request: ${userQuery}`,
});

      // Stream the response back to the mobile app
      return result.toAIStreamResponse();

    } catch (error) {
      console.error('Agent error:', error);
      return new Response(
        JSON.stringify({ error: 'Agent failed to process request' }),
        { status: 500 }
      );
    }

}

````

**Update Mobile AI Service for Streaming:**

- [ ] 7. File: `mobile-app/src/services/aiService.js`
- [ ] 8. Add decision extraction function:

```javascript
  export const extractDecisions = async (conversationId, messageCount = 100) => {
  return await callBackend('decisions', {
  conversationId,
  messageCount
  });
  };
````

- [ ] 9. Add agent function with streaming support:

  ```javascript
  export const executeAgent = async (userQuery, conversationId, onChunk) => {
    try {
      const response = await fetch(`${API_URL}/api/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery, conversationId }),
      });

      if (!response.ok) {
        throw new Error(`Agent error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullText += chunk;

        // Call onChunk callback for UI updates
        if (onChunk) {
          onChunk(chunk, fullText);
        }
      }

      return fullText;
    } catch (error) {
      console.error("Agent execution failed:", error);
      throw error;
    }
  };
  ```

**Create Decisions Screen:**

- [ ] 10. File: `mobile-app/src/screens/DecisionsScreen.js`
- [ ] 11. Implement decisions timeline view:

  ```javascript
  import React, { useState, useEffect } from "react";
  import { View, Text, FlatList, ActivityIndicator } from "react-native";
  import { extractDecisions } from "../services/aiService";

  export default function DecisionsScreen({ route }) {
    const { conversationId } = route.params;
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadDecisions();
    }, []);

    const loadDecisions = async () => {
      try {
        setLoading(true);
        const result = await extractDecisions(conversationId);
        setDecisions(result.decisions || []);
      } catch (error) {
        console.error("Failed to load decisions:", error);
      } finally {
        setLoading(false);
      }
    };

    const renderItem = ({ item }) => (
      <View style={styles.item}>
        <Text style={styles.decision}>{item.decision}</Text>
        <Text style={styles.participants}>
          Participants: {item.participants.join(", ")}
        </Text>
        {item.timestamp && (
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        )}
        <Text style={styles.context}>{item.context}</Text>
        <Text style={styles.confidence}>Confidence: {item.confidence}</Text>
      </View>
    );

    if (loading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <FlatList
        data={decisions}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.empty}>No decisions found</Text>
        }
      />
    );
  }

  // Add styles...
  ```

**Create Agent Chat Screen:**

- [ ] 12. File: `mobile-app/src/screens/AgentChatScreen.js`
- [ ] 13. Implement agent chat interface with streaming:

  ```javascript
  import React, { useState } from "react";
  import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
  } from "react-native";
  import { executeAgent } from "../services/aiService";

  export default function AgentChatScreen({ route }) {
    const { conversationId } = route.params;
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async () => {
      if (!query.trim() || processing) return;

      const userQuery = query.trim();
      setQuery("");
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userQuery,
        },
      ]);

      setProcessing(true);
      let agentResponse = "";

      try {
        await executeAgent(userQuery, conversationId, (chunk, fullText) => {
          agentResponse = fullText;
          // Update UI with streaming chunks
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];

            if (lastMsg?.role === "agent") {
              lastMsg.content = fullText;
            } else {
              updated.push({ role: "agent", content: fullText });
            }

            return updated;
          });
        });
      } catch (error) {
        console.error("Agent failed:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setProcessing(false);
      }
    };

    return (
      <View style={styles.container}>
        <ScrollView style={styles.messages}>
          {messages.map((msg, i) => (
            <View
              key={i}
              style={[
                styles.message,
                msg.role === "user" ? styles.userMessage : styles.agentMessage,
              ]}
            >
              <Text style={styles.messageText}>{msg.content}</Text>
            </View>
          ))}
          {processing && (
            <Text style={styles.processing}>Agent is thinking...</Text>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ask the agent anything..."
            style={styles.input}
            multiline
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={processing}
            style={styles.sendButton}
          >
            <Text>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Add styles...
  ```

**Update Navigation:**

- [ ] 14. File: `mobile-app/src/navigation/AppNavigator.js`
- [ ] 15. Add new screens:

  ```javascript
  <Stack.Screen
    name="Decisions"
    component={DecisionsScreen}
    options={{ title: 'Decisions' }}
  />
  <Stack.Screen
    name="AgentChat"
    component={AgentChatScreen}
    options={{ title: 'AI Agent' }}
  />
  ```

**Update ChatScreen with New Buttons:**

- [ ] 16. File: `mobile-app/src/screens/ChatScreen.js`
- [ ] 17. Add Decisions and Agent buttons to header:

  ```javascript
  <TouchableOpacity onPress={() => navigation.navigate('Decisions', { conversationId })}>
    <Text>✓ Decisions</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => navigation.navigate('AgentChat', { conversationId })}>
    <Text>🤖 Agent</Text>
  </TouchableOpacity>
  ```

**Deploy Backend:**

- [ ] 18. Deploy all changes to Vercel:

  ```bash
  cd backend
  vercel --prod
  ```

**Test Decision Tracking:**

- [ ] 19. Create conversation with clear decisions:
  - "Let's go with option B for the architecture"
  - "We agreed to extend the deadline to Q2"
  - "Decided to use microservices approach"
- [ ] 20. Test extraction:
  - Tap "✓ Decisions" button
  - Verify decisions extracted correctly
  - Check participants list is accurate
  - Verify context and confidence levels
  - Response time should be <3 seconds

**Test Multi-Step Agent:**

- [ ] 21. Test complex workflow:

  - Query: "Find all action items from last week, categorize by person, and create a summary report"
  - Verify streaming response updates UI
  - Check final report is well-formatted and accurate
  - Total response time should be <15 seconds

- [ ] 22. Test simpler queries:

  - "Summarize this conversation"
  - "What decisions were made?"
  - "Who has pending tasks?"

- [ ] 23. Test error handling:
  - Invalid conversation ID
  - Network errors
  - No results scenarios

**Files Created:**

- `backend/app/api/decisions/route.ts` (decision extraction endpoint)
- `backend/app/api/agent/route.ts` (multi-step agent endpoint)
- `backend/lib/agent-tools.ts` (helper functions for agent)
- `mobile-app/src/screens/DecisionsScreen.js` (decisions UI)
- `mobile-app/src/screens/AgentChatScreen.js` (agent chat UI)

**Files Modified:**

- `mobile-app/src/services/aiService.js` (add decision and agent functions)
- `mobile-app/src/screens/ChatScreen.js` (add Decisions and Agent buttons)
- `mobile-app/src/navigation/AppNavigator.js` (add new screens)

**Test Before Merge:**

- [ ] 24. Backend endpoints deploy successfully
- [ ] 25. Decision tracking identifies decisions correctly
- [ ] 26. Decisions screen shows timeline view
- [ ] 27. Multi-step agent executes complex workflows
- [ ] 28. Agent streaming works and updates UI in real-time
- [ ] 29. Final reports are well-formatted
- [ ] 30. Error handling works for edge cases
- [ ] 31. Response times meet targets (<15s for agent)
- [ ] 32. Navigation between screens works
- [ ] 33. All AI features work end-to-end

---

## PR #18: AI Features Polish & Integration

**Goal**: Polish all AI features, implement rate limiting, caching, and ensure production readiness

### Subtasks

**Implement Rate Limiting in Backend:**

- [ ] 1. File: `backend/lib/rate-limiter.ts`
- [ ] 2. Create rate limiting utility:

  ```typescript
  interface RateLimitStore {
    [key: string]: { count: number; resetAt: number };
  }

  const store: RateLimitStore = {};

  export function checkRateLimit(
    userId: string,
    maxRequests: number = 20,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const key = userId;

    // Initialize or reset if window expired
    if (!store[key] || now > store[key].resetAt) {
      store[key] = {
        count: 0,
        resetAt: now + windowMs,
      };
    }

    const record = store[key];
    const allowed = record.count < maxRequests;

    if (allowed) {
      record.count++;
    }

    return {
      allowed,
      remaining: Math.max(0, maxRequests - record.count),
      resetAt: record.resetAt,
    };
  }
  ```

- [ ] 3. Update all API routes to use rate limiting:

  ```typescript
  // In each route.ts file:
  import { checkRateLimit } from "@/lib/rate-limiter";

  export async function POST(req: Request) {
    // Extract user ID from request (you'll need auth)
    const userId = req.headers.get("x-user-id") || "anonymous";

    const rateLimit = checkRateLimit(userId);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          resetAt: rateLimit.resetAt,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.resetAt.toString(),
          },
        }
      );
    }

    // ... rest of endpoint logic
  }
  ```

**Implement Response Caching:**

- [ ] 4. File: `backend/lib/cache.ts`
- [ ] 5. Create simple in-memory cache:

  ```typescript
  interface CacheEntry {
    data: any;
    expiresAt: number;
  }

  const cache: Map<string, CacheEntry> = new Map();

  export function getCached(key: string): any | null {
    const entry = cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  }

  export function setCache(key: string, data: any, ttlMs: number = 3600000) {
    cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  export function clearCache(pattern?: string) {
    if (!pattern) {
      cache.clear();
    } else {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      }
    }
  }
  ```

- [ ] 6. Update summarization endpoint with caching:

  ```typescript
  import { getCached, setCache } from "@/lib/cache";

  export async function POST(req: Request) {
    const { conversationId, messageCount } = await req.json();

    // Check cache
    const cacheKey = `summary:${conversationId}:${messageCount}`;
    const cached = getCached(cacheKey);

    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    // ... generate summary

    // Cache result for 24 hours
    setCache(cacheKey, { summary: text, conversationId }, 24 * 60 * 60 * 1000);

    return NextResponse.json({ summary: text, conversationId, cached: false });
  }
  ```

**Add Error Handling Improvements:**

- [ ] 7. File: `backend/lib/error-handler.ts`
- [ ] 8. Create centralized error handler:

  ```typescript
  export class AIServiceError extends Error {
    constructor(
      message: string,
      public statusCode: number = 500,
      public code?: string
    ) {
      super(message);
      this.name = "AIServiceError";
    }
  }

  export function handleAPIError(error: unknown) {
    console.error("API Error:", error);

    if (error instanceof AIServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    // OpenAI specific errors
    if (error.message?.includes("rate_limit")) {
      return NextResponse.json(
        { error: "AI service rate limit reached. Please try again later." },
        { status: 429 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
  ```

**Add Dark Mode Support to AI Screens:**

- [ ] 9. Update all AI screens to use theme colors:

  - ThreadSummaryModal.js
  - ActionItemsScreen.js
  - DecisionsScreen.js
  - AgentChatScreen.js

- [ ] 10. Use theme context or tokens:

  ```javascript
  // In each screen:
  import { useColorScheme } from 'react-native';
  import { tokens } from '../styles/tokens';

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? tokens.colors.dark : tokens.colors.light;

  // Use colors in styles:
  backgroundColor: colors.background,
  color: colors.text,
  ```

**Add Analytics Tracking:**

- [ ] 11. File: `backend/lib/analytics.ts`
- [ ] 12. Create analytics logger:

  ```typescript
  interface AnalyticsEvent {
    userId: string;
    event: string;
    feature: string;
    duration?: number;
    success: boolean;
    error?: string;
    timestamp: Date;
  }

  export function logAnalytics(event: AnalyticsEvent) {
    // In production, send to analytics service
    // For now, just log
    console.log("[Analytics]", JSON.stringify(event));

    // TODO: Send to Firebase Analytics or other service
  }
  ```

- [ ] 13. Add analytics to all endpoints:

  ```typescript
  const startTime = Date.now();
  try {
    // ... endpoint logic

    logAnalytics({
      userId,
      event: "ai_request",
      feature: "summarization",
      duration: Date.now() - startTime,
      success: true,
    });
  } catch (error) {
    logAnalytics({
      userId,
      event: "ai_request",
      feature: "summarization",
      duration: Date.now() - startTime,
      success: false,
      error: error.message,
    });
  }
  ```

**Improve Mobile Error Handling:**

- [ ] 14. File: `mobile-app/src/services/aiService.js`
- [ ] 15. Enhance error messages:

  ```javascript
  const callBackend = async (endpoint, body) => {
    try {
      const response = await fetch(`${API_URL}/api/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": getCurrentUserId(), // Add user ID for rate limiting
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          const resetAt = new Date(data.resetAt);
          throw new Error(
            `Rate limit exceeded. Try again at ${resetAt.toLocaleTimeString()}`
          );
        }

        if (response.status === 404) {
          throw new Error("No messages found in this conversation");
        }

        throw new Error(`Server error (${response.status}). Please try again.`);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes("Network request failed")) {
        throw new Error(
          "Connection failed. Check your internet and try again."
        );
      }
      throw error;
    }
  };
  ```

**Add Loading Skeletons:**

- [ ] 16. Create skeleton components for AI screens:

  ```javascript
  // In each AI screen, show skeleton while loading:
  {
    loading && (
      <View style={styles.skeleton}>
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLine} />
      </View>
    );
  }
  ```

**Create Backend Health Check:**

- [ ] 17. File: `backend/app/api/health/route.ts`
- [ ] 18. Implement health check endpoint:

  ```typescript
  import { NextResponse } from "next/server";
  import { db } from "@/lib/firebase-admin";

  export async function GET() {
    try {
      // Test Firebase connection
      await db.collection("_health").doc("check").get();

      // Test OpenAI (optional, costs tokens)
      // await openai('gpt-4-turbo').ping();

      return NextResponse.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          firebase: "ok",
          openai: "ok",
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          status: "unhealthy",
          error: error.message,
        },
        { status: 503 }
      );
    }
  }
  ```

**Update Backend README:**

- [ ] 19. File: `backend/README.md`
- [ ] 20. Document:
  - All API endpoints
  - Request/response formats
  - Rate limits
  - Caching behavior
  - Error codes
  - Environment variables
  - Testing instructions

**Deploy Final Backend:**

- [ ] 21. Deploy to Vercel:

  ```bash
  cd backend
  vercel --prod
  ```

**Add Read Receipt Settings:**

- [ ] 22. In `src/screens/ProfileScreen.js`:

  - Add toggle: "Send Read Receipts" (default: enabled)
  - Save preference to Firestore user document
  - Respect user's privacy choice

- [ ] 23. Update read receipt logic:
  - Only send read receipts if user has enabled them
  - Still show received read receipts regardless of setting

**Implement expo-image for Production-Quality Image Caching:**

**Note:** Using `expo-image` instead of `react-native-fast-image` because FastImage requires native code and doesn't work with Expo Go. expo-image provides similar benefits (disk caching, smooth scrolling, memory efficiency) while maintaining fast development workflow.

- [ ] 24. Install expo-image:

  ```bash
  cd mobile-app
  npx expo install expo-image
  ```

- [x] 25. Update `MessageBubble.js` to use expo-image:

  ```javascript
  // Change import from:
  import { Image } from "react-native";
  // To:
  import { Image } from "expo-image";

  // Replace sender avatar Image (around line 56)
  {sender?.imageURL ? (
    <Image
      source={{ uri: sender.imageURL }}
      style={styles.senderAvatar}
      contentFit="cover"
      priority="normal"
      cachePolicy="memory-disk"
    />
  ) : (
    // ... existing placeholder code
  )}

  // Replace mini avatars Image (around line 156)
  <Image
    key={userId}
    source={{ uri: user.imageURL }}
    style={[
      styles.miniAvatar,
      index > 0 && styles.miniAvatarOverlap,
    ]}
    contentFit="cover"
    priority="normal"
    cachePolicy="memory-disk"
  />
  ```

- [x] 26. Update `UserListItem.js` to use expo-image:

  ```javascript
  // Change import from:
  import { Image } from "react-native";
  // To:
  import { Image } from "expo-image";

  // Replace user avatar Image (around line 85)
  {user.imageURL ? (
    <Image
      source={{ uri: user.imageURL }}
      style={styles.avatar}
      contentFit="cover"
      priority="high"  // High priority for user list
      cachePolicy="memory-disk"
    />
  ) : (
    // ... existing placeholder code
  )}
  ```

- [x] 27. Update `ChatScreen.js` header to use expo-image:

  ```javascript
  // Change import from:
  import { Image } from "react-native";
  // To:
  import { Image } from "expo-image";

  // Replace header avatars (around line 330 and 348)

  // Group avatar:
  {conversation?.groupImageURL ? (
    <Image
      source={{ uri: conversation.groupImageURL }}
      style={styles.headerAvatar}
      contentFit="cover"
      priority="high"
      cachePolicy="memory-disk"
    />
  ) : (
    // ... existing placeholder code
  )}

  // 1-on-1 avatar:
  {otherUser?.imageURL ? (
    <Image
      source={{ uri: otherUser.imageURL }}
      style={styles.headerAvatar}
      contentFit="cover"
      priority="high"
      cachePolicy="memory-disk"
    />
  ) : (
    // ... existing placeholder code
  )}
  ```

- [x] 28. Update any other Image components for profile pictures:

  - ✅ `GroupInfoScreen.js` - Updated participant avatars and group photo (2 Image components)
  - ✅ `ProfileScreen.js` - Updated profile photo (1 Image component)
  - ✅ `CreateGroupScreen.js` - Updated participant avatars and group photo preview (2 Image components)
  - ✅ `HomeScreen.js` - Updated header profile photo and group conversation avatars (2 Image components)
  - ✅ All profile image `Image` components now use expo-image with proper caching props

  **Note**: expo-image automatically handles pre-loading efficiently. Manual Image.prefetch() is optional and not needed for this app.

**Why This Matters for Production:**

- **Persistent Disk Caching**: Images cached between app sessions (not just in memory)
- **60fps Scrolling**: Background decoding keeps UI smooth
- **Memory Efficient**: Auto-downsampling to display size (reduces RAM usage significantly)
- **Request Deduplication**: Same image URL = single network request
- **Instant Loading**: Cached images appear in <100ms vs 500-2000ms
- **Reduced Data Usage**: Critical for users on limited data plans
- **Expo-managed**: Works with Expo Go, no native build required
- **Modern API**: Clean interface with contentFit, priority, cachePolicy props

**Push Notification Profile Photos (Nice-to-Have):**

Note: Currently, profile photos are included in notification data but don't display in the notification banner. These are optional enhancements to show profile photos in notifications:

- [ ] 30. **Option 1: iOS Notification Service Extension**

  - Requires native Swift/Objective-C code
  - Intercepts notification before display
  - Downloads image from URL and attaches to notification
  - Requires EAS Build or ejecting from Expo
  - Most control, but highest complexity

- [ ] 31. **Option 2: Android Native Configuration**

  - Configure large icon support via Expo config plugins
  - Easier than iOS implementation
  - Still requires EAS Build (not Expo Go)
  - Better Android notification appearance

- [ ] 32. **Option 3: EAS Build + Config Plugin (Recommended)**

  - Use Expo's build service instead of Expo Go
  - Add notification config plugin to `app.json`
  - Maintains most of Expo's managed workflow
  - Balanced complexity and functionality
  - Example config:
    ```json
    {
      "expo": {
        "plugins": [
          [
            "expo-notifications",
            {
              "icon": "./assets/icon.png",
              "sounds": ["./assets/notification-sound.wav"]
            }
          ]
        ]
      }
    }
    ```

- [ ] 33. **Option 4: Eject to Bare React Native**
  - Full native control over notifications
  - Implement custom notification service extensions
  - Lose Expo's managed workflow benefits
  - Maximum flexibility, maximum complexity

**Fix Push Notifications on PC (Windows/Mac Desktop):**

- [x] 34. Investigate why push notifications don't work on PC:

  - ✅ Expo notifications require different setup for web (VAPID keys)
  - ✅ Web push uses Web Push Protocol (different from mobile APNs/FCM)
  - ✅ This is expected behavior - web and mobile use different push systems
  - ✅ Findings documented below

- [x] 35. ~~If desktop push notifications are supported~~ (Skipped - web push requires VAPID)

  - N/A - Web push requires VAPID configuration and service workers
  - Not needed for MVP - mobile push is the priority
  - Can be added later if web push becomes a requirement

- [x] 36. Desktop push notifications are NOT supported (documented):
  - ✅ Added platform check to gracefully skip web platform
  - ✅ Web users can still use app fully (Firebase real-time listeners work)
  - ✅ Console message explains why push notifications are skipped
  - ✅ No error thrown - graceful degradation implemented
  - 📝 **Result**: Web app works perfectly, just no push notifications banner
  - 📝 **Alternative**: Users on web still get real-time message updates via Firebase
  - 📝 **Future Enhancement**: Could add VAPID setup for web push if needed

**Fix Android Deployed Build Issues:**

- [x] 37. Investigate Android deployment breaking:

  - ✅ **Root Cause #1**: Missing `android.package` in `app.json`
  - ✅ **Root Cause #2**: `newArchEnabled: true` was forcing custom dev builds
  - ✅ **Root Cause #3**: `expo-dev-client` package was installed (requires custom builds)
  - ✅ **Root Cause #4**: Notification registration blocking Android emulator
  - ✅ **Solution**: Removed blockers and added platform-aware checks

- [x] 38. Applied Android build fixes:

  - ✅ Added `android.package: "com.victormgoico.messagingapp"` to `app.json`
  - ✅ Removed `newArchEnabled: true` from `app.json` (not needed for Expo Go)
  - ✅ Removed `expo-dev-client` package from `package.json`
  - ✅ Updated notification registration to be platform-aware:
    - iOS simulator: blocked (no APNs support)
    - Android emulator: allowed (works with Expo Go)
    - Web: blocked (requires VAPID keys)

- [x] 39. Test Android deployment:

  - ✅ App opens on Android emulator via `npx expo start` + press `a`
  - ✅ Push notifications work on Android emulator
  - ✅ All features work correctly (messaging, profiles, groups)
  - ✅ Cache clearing: Must clear from emulator settings (terminal cache clear doesn't work)
  - 📝 **Note**: Using Expo Go (no custom build needed)

- [x] 40. Document Android deployment process:
  - ✅ Updated README with Android emulator setup steps
  - ✅ Documented cache clearing process for emulator
  - ✅ Added platform check explanations
  - ✅ Noted that Expo Go works for all features with platform-aware checks

**Test All AI Features:**

- [ ] 41. Thread summarization with various conversation types
- [ ] 42. Action item extraction with different task formats
- [ ] 43. Semantic search with complex queries
- [ ] 44. Priority detection with various urgency levels
- [ ] 45. Decision tracking with different decision types
- [ ] 46. Multi-step agent with complex workflows
- [ ] 47. Rate limiting (make 20+ requests quickly)
- [ ] 48. Error handling (invalid inputs, network errors)
- [ ] 49. Caching (verify cached responses are fast)
- [ ] 50. Dark mode (all AI screens)
- [ ] 51. Performance (response times meet targets)
- [ ] 52. Image loading performance with FastImage (smooth scrolling, instant cached images)

**Files Created:**

- `backend/lib/rate-limiter.ts` (rate limiting)
- `backend/lib/cache.ts` (response caching)
- `backend/lib/error-handler.ts` (error handling)
- `backend/lib/analytics.ts` (usage tracking)
- `backend/app/api/health/route.ts` (health check)

**Files Modified:**

- All backend API routes (add rate limiting, caching, analytics)
- All mobile AI screens (dark mode support)
- `mobile-app/src/services/aiService.js` (improved error handling)
- `backend/README.md` (complete documentation)
- `mobile-app/src/components/MessageBubble.js` (FastImage for avatars)
- `mobile-app/src/components/UserListItem.js` (FastImage for user list)
- `mobile-app/src/screens/ChatScreen.js` (FastImage + pre-loading)
- `mobile-app/src/screens/GroupInfoScreen.js` (FastImage for group photos)
- `mobile-app/src/screens/ProfileScreen.js` (FastImage + read receipt settings)
- `mobile-app/src/screens/CreateGroupScreen.js` (FastImage for participant selection)

**Test Before Merge:**

- [ ] 53. All AI features work in dark mode
- [ ] 54. Rate limiting prevents abuse (20 requests/minute)
- [ ] 55. Caching improves performance (cached responses <100ms)
- [ ] 56. Error handling is user-friendly
- [ ] 57. Analytics track usage correctly
- [ ] 58. Health check endpoint works
- [ ] 59. All features work offline (with cached data)
- [ ] 60. Performance meets targets
- [ ] 61. Documentation is complete and accurate
- [ ] 62. Backend is production-ready
- [ ] 63. Read receipt settings toggle works in ProfileScreen
- [ ] 64. Read receipts respect user privacy settings
- [ ] 65. FastImage installed and working across all profile images
- [ ] 66. Message bubbles load profile pictures instantly on repeated views
- [ ] 67. Group chat avatars load smoothly without staggered appearance
- [ ] 68. Scrolling remains smooth (60fps) while images load
- [ ] 69. Images persist in cache after app restart
- [ ] 70. Memory usage improved (check via profiler if needed)
- [ ] 71. Push notifications resolved for PC (or documented as unsupported)
- [ ] 72. Android build successfully deploys and runs
- [ ] 73. All features work correctly on Android device

---

## Summary

**AI Features Implementation Timeline:**

- **PR #13**: Vercel Backend Setup & Test Function (Day 0 - 2-3 hours)

  - Initialize Next.js project
  - Deploy test function to Vercel ✅
  - Configure mobile app to call backend ✅

- **PR #14**: Thread Summarization & Action Item Extraction (Day 1)

  - Backend endpoints for summarization and actions ✅
  - Mobile UI for displaying results ✅

- **PR #15**: Smart Search & Priority Detection (Day 2)

  - Semantic search with embeddings ✅
  - Priority detection for messages ✅

- **PR #17**: Decision Tracking & Multi-Step Agent (Day 3)

  - Decision extraction ✅
  - Multi-step agent with streaming ✅

- **PR #18**: AI Features Polish & Integration (Day 4)
  - Rate limiting and caching ✅
  - Error handling and analytics ✅
  - Production readiness ✅

**Total AI Features:** 5 Core + 1 Advanced

- Thread Summarization
- Action Item Extraction
- Smart Semantic Search
- Priority Detection
- Decision Tracking
- Multi-Step Agent (Advanced)

**Architecture:**

```
React Native App (Expo)
    ↓ HTTP/HTTPS
Vercel Serverless Functions (Node.js)
    ↓ API calls
OpenAI (GPT-4 Turbo + Embeddings)
    ↓ Firebase Admin SDK
Firebase (Firestore for messages)
```

---

## Key Reminders

- **Start with PR #11.5 first** - Verify Vercel deployment works before building features
- **Test each endpoint independently** before integrating with mobile app
- **Monitor OpenAI API usage and costs** in OpenAI dashboard
- **Implement proper error handling** - AI features can fail unpredictably
- **Use rate limiting** to prevent abuse and control costs
- **Cache expensive operations** (embeddings, summaries) to improve performance
- **Test with real conversations** - AI quality depends on good test data
- **Verify response times** meet performance targets at each PR
- **Keep backend and mobile app in sync** - deploy backend before testing mobile
- **Document all API endpoints** in backend README

Good luck implementing the AI features! 🤖✨
