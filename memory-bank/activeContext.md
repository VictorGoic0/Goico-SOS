# Active Context: Mobile Messaging App

## Current Work Focus

### Project Status: **AI + Dark Mode + Backend Auth & Rate Limiter Complete; RAG TDD PR #1–#8 Done; Message Reactions, PR #19 Next**

The project has completed core messaging (PRs #1–#11), AI backend and features (PRs #13–#16: Vercel, summarization, action items, search, priority, decision tracking, multi-step agent), polish in PR #18 (expo-image, push-on-PC, Android), **PR #17 Dark Mode** (theme system, ThemeContext, Appearance selector, theme applied to all screens), and **Backend Auth & Rate Limiter** (Firebase ID token verification, Upstash Redis rate limiting, CORS). **RAG (tasks-TDD.md)**: PRs #1–#8 complete — **`ensureConversationBackfilledForRag`** (full backfill when Pinecone has no vectors for `conversationId`), **`POST /api/index-message`** + mobile **`requestIndexMessageForRag`** for incremental upserts, retrieval default **topK = 5**. Task lists: **tasks-1.md**, **tasks-2.md**, **tasks-3.md**, **tasks-TDD.md**.

**Current Architecture**: React Native (mobile-app/) → Vercel serverless (backend/) → OpenAI (GPT-4o-mini, text-embedding-3-small) + Firebase (Firestore, Realtime DB, Storage) + Pinecone (RAG index `messages`, 512 dims). All AI/RAG routes protected by `authenticate()`. **Next**: PR #19 polish / PR #17 reactions (see tasks-3.md).

### Completed PRs

1. ✅ **PR #1**: React Native Setup & Environment Configuration
2. ✅ **PR #2**: Firebase Configuration & Zustand Stores
3. ✅ **PR #3**: Authentication (Signup & Login)
4. ✅ **PR #4**: Profile Setup & User Creation in Firestore
5. ✅ **PR #5**: User List & Presence Tracking
6. ✅ **PR #6**: One-on-One Messaging & Chat Screen
7. ✅ **PR #7**: Message Sending with Firebase-Native Optimistic Updates
8. ✅ **PR #8**: Profile Screen & Edit Profile
9. ✅ **PR #9**: Group Chats (Create, Edit, Manage, Delete)
10. ✅ **PR #10**: Push Notifications Setup (Vercel serverless functions)
11. ✅ **PR #11**: Read Receipts Implementation
12. ✅ **PR #13**: Vercel Backend Setup & Test Function
13. ✅ **PR #14**: Thread Summarization & Action Item Extraction
14. ✅ **PR #15**: Smart Search & Priority Detection
15. ✅ **PR #16**: Decision Tracking & Multi-Step Agent
16. ✅ **PR #17 (Dark Mode)**: Theme system, ThemeContext, Appearance (Light/System/Dark), theme applied to all screens and navigator

### Recently Completed: **Backend Auth & Rate Limiter**

- ✅ **Auth**: `verifyToken(req)` in `backend/lib/auth.ts` — extracts Bearer token, verifies with Firebase Admin, returns decoded user (uid, email). All 7 API routes (agent, summarize, search, extract-actions, decisions, priority, send-notification) call `authenticate(req)` at top.
- ✅ **Rate limiter**: `checkRateLimit(uid)` — Upstash Redis (HTTP), fixed window: 10 requests/user/24h, 100 global/24h; prefixes `rate:user:sos`, `rate:global:sos`. 429 response includes `{ error, detail, retryAfter }`.
- ✅ **Mobile**: `getAuthHeader()` in aiService and notifications — sends `Authorization: Bearer <idToken>` on every backend request; token from `auth.currentUser?.getIdToken()` (auto-refresh).
- ✅ **CORS**: `next.config.ts` — headers for `/api/:path*`, `Authorization` in allowed headers, origin from `CORS_ORIGIN` env.
- ✅ **Doc**: `docs/auth-rate-limiter.md` (or `docs/TDD-auth-rate-limiter.md`) — Phase 1 (auth) and Phase 2 (rate limiter) implemented and tested.

### Previously: **PR #17 - Dark Mode**

- ✅ **themeColors** in `tokens.js`: `light` and `dark` semantic palettes (background, surface, text, border, messageBubble, userBubble, status, etc.)
- ✅ **ThemeContext**: AsyncStorage persistence, `themeMode` (light/dark/system), `setTheme()`, `useColorScheme()` for system
- ✅ **App**: Wrapped in `ThemeProvider`; `StatusBar` follows theme
- ✅ **ProfileScreen**: Appearance section with Light / System / Dark selector
- ✅ **Screens themed**: HomeScreen, ChatScreen, ProfileScreen, GroupInfoScreen, CreateGroupScreen, ActionItemsScreen, DecisionsScreen, AgentChatScreen, ThreadSummaryModal
- ✅ **Components themed**: MessageBubble, UserListItem, CompactInput; AppNavigator header and loading screen
- ⏳ **PR #17 Message Reactions**: Not yet implemented (reactions UI, Firestore schema, picker)

### Previously: **PR #15 - Smart Search & Priority Detection**

**PR #15 Highlights:**

- ✅ **Hybrid Search Algorithm**: Combines semantic embeddings (cosine similarity) with keyword matching
  - Bidirectional stem matching (4-char stems): "meeting" matches "meet", "availability" matches "available"
  - Keyword boost of +0.25 when query terms found in message
  - Configurable threshold (0.4) balances precision vs recall
- ✅ **Semantic Search Backend** (`/api/search`): OpenAI text-embedding-3-small for embeddings
- ✅ **Priority Detection Backend** (`/api/priority`): Automatic urgency analysis using GPT-4o-mini
- ✅ **Search UI**: Toggle search bar in ChatScreen header, responsive results container
  - Results expand to content (max 60% of screen height)
  - Search input disabled during active search
  - Returns top 5 results with similarity scores
- ✅ **Priority Display**: High-priority messages show red border and 🔴 badge
- ✅ **Auto-Priority Detection**: New messages automatically analyzed for urgency
- ✅ **Variable Naming Standards**: Enforced via `.cursor/rules/variable-naming.mdc`

**PR #9 Highlights:**

- ✅ CreateGroupScreen for creating new groups
- ✅ Group selection with multiple participants
- ✅ Group name and photo setup with Firebase Storage upload
- ✅ GroupInfoScreen for viewing and editing group details
- ✅ Group messaging with multiple participants
- ✅ Group header shows participant count and group photo
- ✅ Delete conversation functionality for 1-on-1 and groups
- ✅ Leave group functionality
- ✅ Group notifications properly formatted

**PR #10 Highlights:**

- ✅ Push notification registration on login with Expo
- ✅ Push tokens saved to Firestore user documents
- ✅ Vercel serverless function (`/api/send-notification`) for notification delivery
- ✅ Notification tap handling with deep linking to conversations
- ✅ Group chat notifications formatted as "Group Name: Sender: Message"
- ✅ 1-on-1 notifications show "Sender Name" / "Message"
- ✅ Navigation reference for deep linking from notifications
- ✅ Foreground and background notification support

**PR #14 Highlights:**

- ✅ Thread summarization endpoint using GPT-4o-mini
- ✅ Action item extraction with structured JSON outputs (Zod schema)
- ✅ ThreadSummaryModal component with loading states
- ✅ ActionItemsScreen with list view of extracted actions
- ✅ AI buttons in ChatScreen (📝 Summary, 📋 Actions)
- ✅ Error handling with partial data recovery
- ✅ End-to-end testing complete

### Next Steps

**From docs/tasks-3.md:**

- ✅ PR #17 Dark Mode: theme system, Appearance selector, all screens/components themed — done and tested
- ⏳ PR #17 Message Reactions: reactions utils, MessageReactions/ReactionPicker, schema (remaining)
- ✅ PR #18: AI polish completed (expo-image, Push PC, Android) — done and tested
- ⏳ PR #19: AI polish remaining (error handling, health check, read receipts, docs, optional push profile photos)

**From docs/tasks-TDD.md (RAG pipeline):**

- ✅ PR #1–#8 TDD: Backfill-if-empty, incremental index-message, topK 5, docs

**Completed Features:**

- ✅ PRs #1–#11: Core messaging, profiles, presence, group chats, push notifications, read receipts
- ✅ PRs #13–#16: AI backend (Vercel), summarization, action items, search, priority, decision tracking, multi-step agent
- ✅ PR #17 Dark Mode: ThemeContext, themeColors, Appearance (Light/System/Dark), all screens and nav themed
- ✅ PR #18: AI polish completed (expo-image, push-on-PC doc, Android deployment)
- ✅ Backend Auth & Rate Limiter: Firebase token verification, Upstash Redis rate limits (10/user/24h, 100 global/24h), mobile sends Bearer token, CORS configured

**Documentation layout:** `docs/tasks-1.md` (PRs #1–#12), `docs/tasks-2.md` (PRs #13–#16), `docs/tasks-3.md` (PRs #17–#19), `docs/tasks-TDD.md` (RAG, 8 PRs). See `docs/PRD.md`, `docs/TDD_RAG_Pipeline.md`.

## Recent Changes

### Backend Auth & Rate Limiter (Completed)

**Implementation:** No Next.js middleware (Edge can't run firebase-admin). Shared helpers in `backend/lib/auth.ts` called at the top of each route:

- **verifyToken(req)** — reads `Authorization: Bearer <token>`, verifies with Firebase Admin `auth.verifyIdToken()`, returns `DecodedIdToken` or throws 401.
- **checkRateLimit(uid)** — Upstash Redis via `@upstash/ratelimit` + `@upstash/redis`; fixed window 10/user/24h and 100 global/24h (prefixes `rate:user:sos`, `rate:global:sos`). Checks global first, then per-user. On limit exceeded throws 429 with JSON `{ error: "RateLimitExceeded", detail, retryAfter }`.
- **authenticate(req)** — calls `verifyToken` then `checkRateLimit(user.uid)`, returns decoded user.

**Routes:** All 7 protected routes use `authenticate(req)` (agent, summarize, search, extract-actions, decisions, priority, send-notification). Test route remains unauthenticated.

**Mobile:** `mobile-app/src/services/aiService.js` and `mobile-app/src/utils/notifications.js` use `getAuthHeader()` (from `auth.currentUser?.getIdToken()`) and send `Authorization: Bearer <token>` on every backend request.

**Config:** CORS in `backend/next.config.ts`; env vars: Firebase Admin (existing), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, optional `CORS_ORIGIN`. Rate limiter tested and working.

### PR #15: Smart Search & Priority Detection (Completed)

**Hybrid Search Implementation:**

The search feature combines semantic understanding with traditional keyword matching for optimal results:

1. **Semantic Search** (OpenAI text-embedding-3-small):

   - Generates embeddings for search query and all messages
   - Calculates cosine similarity between vectors
   - Captures contextual meaning beyond exact keywords

2. **Keyword Matching** (Bidirectional Stem Matching):

   - Checks for exact phrase matches
   - 4-character stem matching (e.g., "meet" from "meeting")
   - Works both directions: query→message AND message→query
   - Adds +0.25 boost when keywords found

3. **Configurable Parameters** (at top of `/api/search/route.ts`):
   - `SIMILARITY_THRESHOLD = 0.4`: Balance precision vs recall
   - `KEYWORD_BOOST_AMOUNT = 0.25`: Bonus for keyword matches
   - `MAX_SEARCH_RESULTS = 5`: Number of results returned

**Search UX:**

- Toggle button (🔍) in ChatScreen header
- Search bar appears below header when active
- Results container expands with content (max 60% screen height)
- Search input disabled during active search
- Each result shows sender, message preview, similarity percentage

**Priority Detection:**

- Automatic analysis of incoming messages
- High-priority messages flagged with red border + 🔴 badge
- Factors: urgency indicators, deadlines, blockers, escalations
- Priority stored in message document (prevents re-analysis)

**Files Created:**

- `backend/app/api/search/route.ts` - Hybrid search endpoint
- `backend/app/api/priority/route.ts` - Priority detection endpoint
- `.cursor/rules/variable-naming.mdc` - Code standards enforcement

**Files Modified:**

- `mobile-app/src/services/aiService.js` - Added search/priority functions
- `mobile-app/src/screens/ChatScreen.js` - Search UI integration
- `mobile-app/src/components/MessageBubble.js` - Priority display

### PR #11: Read Receipts Implementation (Completed)

**3-State Message Status System:**

The app now implements a cleaner 3-state message status system:

- **sending** 🕐 - Message is being sent (hasPendingWrites: true)
- **sent** ✓ - Message confirmed by server
- **read** ✓ + "Read X ago" - Recipient has opened the conversation

**Key Features Implemented:**

- Updated `markMessagesAsRead` function (renamed from `markMessagesAsDelivered`)
- Messages marked as "read" when recipient opens ChatScreen
- 1-on-1 read receipts: "Read X ago" text below last message (right-aligned, outside bubble)
- Group chat read receipts with `readBy` array tracking individual readers
- Mini profile avatars (16x16px) for group read receipts with overlapping layout
- Long-press on group read receipt displays full list of reader names in alert
- Up to 3 avatars shown, "+N" indicator for overflow
- Migration complete: All "delivered" status messages converted to "sent"
- Updated `formatTimestamp` helper to handle Firestore Timestamp objects

**Files Modified:**

- `src/screens/ChatScreen.js` - Updated read receipt logic with group chat support
- `src/components/MessageBubble.js` - Added read receipt UI for 1-on-1 and groups
- `src/utils/helpers.js` - Updated timestamp formatting for Firestore Timestamps

**Design Decisions:**

- Show explicit "Read X ago" text instead of double checkmarks for clarity
- Read indicator only shows on last sent message to reduce clutter
- Group read receipts show who has read with visual avatars
- Sender excluded from `readBy` array in UI display
- Uses `arrayUnion` to prevent duplicate read entries

---

### PR #10: Push Notifications Setup (Completed)

**Architecture Implemented:**

```
React Native Mobile App (Expo Notifications)
    ↓ Fire-and-forget HTTP call
Vercel Serverless Function (/api/send-notification)
    ↓ Fetches participants & push tokens
Firebase Firestore (conversations & users)
    ↓ Sends formatted notifications
Expo Push Notification Service
    ↓ Delivers to devices
iOS/Android Devices
```

**Key Features:**

- Push notification registration on app launch (after login)
- Push tokens stored in Firestore user documents (`pushToken` field)
- Vercel endpoint handles all notification logic server-side
- Group chat notifications: "Group Name: Sender: Message"
- 1-on-1 notifications: "Sender Name: Message Text"
- Notification tap opens correct conversation via deep linking
- Navigation reference created for deep linking support
- Display names (not usernames) shown in notifications
- Profile photo URLs included in notification data

**Files Created:**

- `backend/app/api/send-notification/route.ts` - Notification delivery endpoint
- `mobile-app/src/utils/notifications.js` - Mobile notification utilities

**Files Modified:**

- `mobile-app/App.js` - Notification tap listener
- `mobile-app/src/navigation/AppNavigator.js` - Navigation reference export
- `mobile-app/src/utils/conversation.js` - Calls notification endpoint after sending
- `mobile-app/src/screens/ChatScreen.js` - Derives otherUser from conversation when navigating from notifications

**Testing:**

- ✅ Notifications deliver when app is closed/backgrounded
- ✅ Tapping notification opens correct conversation
- ✅ Group and 1-on-1 notifications formatted correctly
- ✅ Foreground notifications display in-app
- ✅ Display names and profile photos work

---

### PR #14: Thread Summarization & Action Item Extraction (Completed)

**Architecture Implemented:**

```
React Native Mobile App
    ↓ HTTP POST requests
Vercel Serverless Functions
    ├─ /api/summarize (GPT-4o-mini with generateText)
    └─ /api/extract-actions (GPT-4o-mini with generateObject)
    ↓ Fetches messages via Firebase Admin SDK
Firebase Firestore (messages)
    ↓ AI processing
OpenAI GPT-4o-mini API
```

**Key Features:**

- Thread summarization into 3-4 bullet points
- Action item extraction with structured JSON schema (Zod)
- Action items include: task, assignedTo, deadline, status, context
- AI buttons in ChatScreen (📝 Summary, 📋 Actions)
- Buttons disabled when no messages present
- ThreadSummaryModal for displaying summaries
- ActionItemsScreen for viewing action items list
- Graceful error handling with user-friendly messages
- Optional context field (handles partial data from AI)

**Files Created:**

- `backend/app/api/summarize/route.ts` - Summarization endpoint
- `backend/app/api/extract-actions/route.ts` - Action extraction endpoint
- `mobile-app/src/services/aiService.js` - AI backend communication
- `mobile-app/src/components/ThreadSummaryModal.js` - Summary modal UI
- `mobile-app/src/screens/ActionItemsScreen.js` - Action items list UI

**Files Modified:**

- `mobile-app/src/screens/ChatScreen.js` - Added AI buttons and summary modal
- `mobile-app/src/navigation/AppNavigator.js` - Added ActionItemsScreen route

**Technical Decisions:**

- Using GPT-4o-mini instead of GPT-4-turbo (supports structured outputs, faster, cheaper)
- Structured outputs with Zod schema for reliable JSON parsing
- Optional `context` field with default empty string (handles AI variability)
- Fire-and-forget pattern maintained for notifications

**Testing:**

- ✅ Summarization produces accurate 3-4 bullet point summaries
- ✅ Action item extraction identifies tasks, assignees, deadlines
- ✅ UI components display results correctly
- ✅ Error handling shows user-friendly messages
- ✅ Navigation works between all screens
- ✅ AI buttons integrate seamlessly into ChatScreen

---

### PR #8: Profile Screen & Edit Profile (Completed)

**What was built:**

- ✅ ProfileScreen with editable fields (display name, bio, status)
- ✅ Profile photo upload with loading indicator
- ✅ Save changes functionality (updates Firestore and Firebase Auth)
- ✅ Sign out functionality (sets presence to offline)
- ✅ Navigation from HomeScreen header profile button
- ✅ Pre-filled fields from current user data
- ✅ Button component enhanced with "danger" variant
- ✅ Loading states for photo upload and save operations

**Files Created:**

- 📄 NEW: `src/screens/ProfileScreen.js` - Profile viewing and editing

**Files Modified:**

- ✏️ `src/screens/HomeScreen.js` - Added profile button to header
- ✏️ `src/navigation/AppNavigator.js` - Added ProfileScreen to stack
- ✏️ `src/components/Button.js` - Added danger variant

### PR #7: Message Sending with Firebase-Native Optimistic Updates (Completed)

**What was built:**

- ✅ **Removed pendingMessages from localStore** - Firebase handles optimistic updates natively
- ✅ **Simplified sendMessage function** - Just writes to Firestore, no local tracking needed
- ✅ **Updated onSnapshot listener** - Added `includeMetadataChanges: true` to track local writes
- ✅ **Message status based on hasPendingWrites** - "sending" when pending, "sent" when confirmed
- ✅ **Single source of truth** - All messages come from firebaseStore
- ✅ **Read receipt tracking** - Messages marked as "read" when recipient opens ChatScreen
- ✅ **CompactInput component** - Reusable chat input with send button

**Message Status Flow**: sending (hasPendingWrites: true) → sent (hasPendingWrites: false) → read (recipient opens ChatScreen)

**Key Architectural Change:**

- **Before**: Manual pending message management with deduplication logic
- **After**: Firebase's built-in optimistic updates via `hasPendingWrites` metadata
- **Benefits**: No flickering, no duplicates, simpler code, automatic offline queueing

**Files Modified:**

- ✏️ `src/stores/localStore.js` - Removed pendingMessages, kept drafts and UI state
- ✏️ `src/screens/ChatScreen.js` - Simplified handleSend, updated listener with metadata tracking
- ✏️ `src/components/MessageBubble.js` - Status indicators (🕐 sending, ✓ sent, ✓✓ read)
- ✏️ `src/utils/conversation.js` - Simplified sendMessage function
- ✏️ `memory-bank/systemPatterns.md` - Updated 3-store architecture documentation

**Files Created:**

- 📄 NEW: `src/components/CompactInput.js` - Chat input component

### PR #6: One-on-One Messaging & Chat Screen (Completed)

**What was built:**

- ✅ ChatScreen with real-time message list
- ✅ MessageBubble component (sent vs received styling)
- ✅ Message input with send button
- ✅ Conversation utilities (getOrCreateConversation, sendMessage)
- ✅ Optimistic updates with localStore (messages show instantly)
- ✅ Real-time message listener (Firestore onSnapshot)
- ✅ Message timestamps and status indicators (✓ = sent, ✓✓ = read, 🕐 = sending)
- ✅ Navigation from UserListItem to ChatScreen
- ✅ Automatic conversation creation on first message
- ✅ Consistent conversation IDs (same ID regardless of user order)
- ✅ Keyboard handling (KeyboardAvoidingView)
- ✅ Auto-scroll to latest message

**Key Implementation Details:**

- Conversations auto-created when users first message each other
- Conversation ID format: `{userId1}_{userId2}` (sorted alphabetically)
- Messages stored in subcollection: `/conversations/{conversationId}/messages`
- Optimistic updates show "sending" status immediately
- Real-time sync removes pending messages when confirmed
- Message bubbles: Blue for sent, Gray for received
- Last message updates in conversation document

**Files Created/Modified:**

- 📄 NEW: `src/screens/ChatScreen.js` - Chat interface with message list
- 📄 NEW: `src/components/MessageBubble.js` - Message display component
- 📄 NEW: `src/utils/conversation.js` - Conversation management utilities
- ✏️ MODIFIED: `src/screens/HomeScreen.js` - Navigate to chat on user tap
- ✏️ MODIFIED: `src/navigation/AppNavigator.js` - Added Chat screen to stack

### PR #5: User List & Presence Tracking

**What was built:**

- ✅ HomeScreen with FlatList showing all users
- ✅ UserListItem component with avatar, name, username, presence indicator
- ✅ Presence utilities (initializePresence, updatePresence, listenToPresence, setUserOffline)
- ✅ Real-time presence tracking with Realtime Database
- ✅ Online/offline indicators (green dot = online, gray = offline)
- ✅ "Last seen" timestamps for offline users
- ✅ App state handling (foreground/background updates presence)
- ✅ Current user appears in the list
- ✅ Auto-disconnect handling (sets offline when connection lost)
- ✅ Pull-to-refresh functionality
- ✅ Sign out button (temporary, will move to Profile screen later)

**Key Implementation Details:**

- Presence stored in Realtime Database at `/presence/{userId}`
- Presence initialized on login after profile check
- AppState listener updates presence when app goes to background/foreground
- Sign out sets user offline before logging out
- Users see themselves in the list with real-time presence
- Avatar placeholders with colored initials when no profile picture

**Files Created/Modified:**

- 📄 NEW: `src/screens/HomeScreen.js` - User list with real-time data
- 📄 NEW: `src/components/UserListItem.js` - User row component
- 📄 NEW: `src/utils/presence.js` - Presence management utilities
- ✏️ MODIFIED: `src/navigation/AppNavigator.js` - Added presence initialization and listeners
- ✏️ MODIFIED: `src/utils/auth.js` - Set offline on sign out
- ✏️ MODIFIED: `src/config/firebase.js` - Added AsyncStorage persistence
- ✏️ MODIFIED: `src/styles/tokens.js` - Added missing color tokens

### PR #4: Profile Setup & User Creation

**What was built:**

- ✅ ProfileSetupScreen with username, display name, bio, and profile picture upload
- ✅ Profile utility functions (createUserProfile, getUserProfile, updateUserProfile)
- ✅ Profile image upload to Firebase Storage
- ✅ Username validation and uniqueness checking
- ✅ Firestore user document creation with full user data
- ✅ Updated AppNavigator with username-gating logic

**Key Implementation Details:**

- Username is **REQUIRED** (unique, lowercase, 3-20 characters, alphanumeric + underscore)
- Display name is **OPTIONAL** (defaults to username if not provided)
- Profile picture is **OPTIONAL** (uploaded to Firebase Storage if provided)
- Bio is **OPTIONAL** (max 200 characters)

**Navigation Flow:**

1. User logs in → Check Firestore for username
2. No username → ProfileSetupScreen (one-time only)
3. Has username → Home screen
4. Loading screen shown while checking profile

**Files Created/Modified:**

- 📄 NEW: `src/screens/ProfileSetupScreen.js` - Profile setup UI
- 📄 NEW: `src/utils/profile.js` - Profile management utilities
- ✏️ MODIFIED: `src/navigation/AppNavigator.js` - Added username gating logic

### Previous Completed Work

**PR #1-3:**

- ✅ React Native setup with Expo
- ✅ Firebase configuration (Auth, Firestore, Realtime DB, Storage)
- ✅ 3 Zustand stores (local, presence, firebase)
- ✅ Authentication screens (Login, Signup)
- ✅ Design system components (Button, Input, Card)
- ✅ Auth utility functions with error handling

## Active Decisions and Considerations

### New: AI Agent as Conversation Architecture (PR #16)

**Decision:** Implement the AI agent as a pinned conversation at the top of HomeScreen, rather than as separate screens/modals.

**Implementation:**

- AI agent appears as a static user object (not a real Firebase user)
- Always pinned at top of HomeScreen with distinct visual styling
- Uses existing ChatScreen UI for all interactions
- Messages route to `/api/agent` backend endpoint instead of Firebase
- Responses stream back in real-time like normal chat messages

**Rationale:**

- **Familiar UX**: Users already understand chat interface
- **Code Reuse**: No need for separate AgentChatScreen - reuses ChatScreen
- **Natural Integration**: AI feels like a team member, not a bolt-on feature
- **Scalable**: Easy to add more AI capabilities through conversation
- **Simplified Architecture**: One chat interface for everything

**Evolution Path:**

- PR #14: Build Summary/Action Items as separate buttons (quick wins)
- PR #16: Create AI agent conversation AND refactor buttons to use it (complete transition)
- Result: All AI features use unified conversational interface by end of PR #16

This creates a more unified and intuitive user experience for all AI features.

### Username-Gating Pattern

**Decision:** Username is the single source of truth for profile completion

- **Check:** On auth state change, fetch Firestore user document
- **Gate:** If no username exists, show ProfileSetupScreen
- **Flow:** ProfileSetupScreen → creates user document with username → Home screen
- **Future Enhancement:** Strict gating to prevent access to other screens (will add in later PR)

**Rationale:**

- Username is unique and permanent (cannot be changed)
- Simple boolean check: has username = profile complete
- Display name and profile picture are optional enhancements

### Architecture Decisions

- **3-Store Pattern**: Confirmed use of Local Store + Presence Store + Firebase Store
- **Firebase Services**: Firestore for data, Realtime Database for presence, Storage for images
- **Expo Managed Workflow**: Chosen for simplified development and deployment
- **Manual Testing**: No automated tests for MVP timeline
- **Username as Profile Gate**: Username existence = profile completion check

### Technical Priorities

1. **Reliability First**: Message delivery and status tracking must be perfect
2. **Real-time Performance**: <500ms message latency, <100ms presence updates
3. **Offline Support**: Firestore offline persistence + optimistic updates
4. **Cross-platform**: Consistent experience on iOS and Android

### Implementation Strategy

- **Sequential PRs**: 12 PRs building incrementally from foundation to advanced features
- **Physical Device Testing**: Test on real devices after every PR
- **Offline Testing**: Constant airplane mode testing for message queuing
- **Presence Testing**: Multi-device testing for online/offline status

## Current Blockers and Risks

### Identified Risks

1. **React Native Learning Curve**: First-time React Native development
   - **Mitigation**: Use Expo managed workflow, leverage React knowledge
2. **Firebase Complexity**: Real-time + Realtime Database integration
   - **Mitigation**: Start simple, test early, use proven patterns
3. **7-Day Timeline**: Aggressive timeline for full-featured app
   - **Mitigation**: Focus on core messaging first, AI features last
4. **Cross-platform Testing**: iOS and Android differences
   - **Mitigation**: Test on both platforms from day 1

### No Current Blockers

- All required documentation is in place
- Clear implementation path defined
- Dependencies and tools identified
- Architecture patterns established

## Next Implementation Phase

### Phase 2: User List & Presence Tracking (PR #5)

**Goal**: Display all users with real-time online/offline status

**Immediate Tasks**:

- [ ] Create HomeScreen (User List)
- [ ] Fetch all users from Firestore on app load
- [ ] Listen to Realtime Database `/presence` node
- [ ] Create UserListItem component with presence indicator
- [ ] Initialize presence on login (set isOnline: true)
- [ ] Update presence on app state changes (foreground/background)
- [ ] Implement `.onDisconnect()` for auto-offline
- [ ] Display "Last seen" timestamp for offline users
- [ ] Test presence with multiple devices

**Checkpoint**: Home screen shows all users with accurate presence status

### Phase 2: User Profiles & Presence (Day 1 - Hours 8-16)

**Goal**: Complete user profiles and presence tracking

**Tasks**:

- [ ] Build Profile screen (view/edit current user)
- [ ] Implement profile photo upload (Firebase Storage)
- [ ] Save imageURL to Firestore user document
- [ ] Build User List (Home screen)
- [ ] Fetch all users from Firestore → FIREBASE store
- [ ] Listen to Realtime Database `/presence` → PRESENCE store
- [ ] Display users with online/offline indicators
- [ ] Update presence on app foreground/background
- [ ] Implement `.onDisconnect()` for auto-offline
- [ ] Test presence with 2 devices

**Checkpoint**: Can create profile, upload photo, see all users with accurate presence

## Key Implementation Notes

### Design System Integration

- Existing design system components (Button, Card, Input) are well-structured
- Components use design tokens for consistency
- Ready to be adapted for React Native (StyleSheet instead of CSS)
- Focus on mobile-first design patterns

### Firebase Configuration Priority

- Set up Firebase project first
- Configure all services (Auth, Firestore, Realtime DB, Storage)
- Test Firebase connection before building UI
- Implement security rules early

### Testing Strategy

- **Physical Devices**: Use Expo Go app on real phones
- **Multi-device Testing**: Test presence and messaging with 2+ devices
- **Offline Testing**: Constant airplane mode testing
- **Performance Testing**: Monitor message latency and status updates

## Questions to Resolve

### Technical Questions

- [ ] **App name**: What should we call it? (not "WhatsApp Clone")
- [ ] **Color scheme**: Primary/accent colors for UI
- [ ] **AI features priority**: Chat assistant first or summaries first?
- [ ] **Username search**: Implement before or after AI agent?
- [ ] **Platform priority**: Test iOS first, Android first, or both simultaneously?
- [ ] **Push notification sound**: Custom sound or system default?
- [ ] **Message retention**: Keep all messages forever or limit to X days?

### Implementation Questions

- [ ] **Firebase project naming**: What to call the Firebase project?
- [ ] **Environment setup**: Local development vs cloud development?
- [ ] **Design system adaptation**: How to convert web components to React Native?
- [ ] **Testing devices**: Which devices to use for testing?

## Success Criteria for Next Phase

### Phase 1 Success (Foundation)

- ✅ Expo project created and runs on device
- ✅ Firebase project configured with all services
- ✅ 3 Zustand stores created and accessible
- ✅ Authentication flow working (signup → profile setup → login)
- ✅ Basic navigation between auth and main screens
- ✅ User documents created in Firestore
- ✅ Presence entries created in Realtime Database

### Phase 2 Success (Profiles & Presence)

- ✅ Profile screen allows editing and photo upload
- ✅ Home screen shows all users with presence indicators
- ✅ Presence updates accurately in real-time
- ✅ Online/offline status displays correctly
- ✅ App state changes update presence properly
- ✅ Multi-device presence testing works

## Resource Requirements

### Development Tools

- **Node.js**: v18 or later
- **Expo CLI**: Global installation
- **Firebase CLI**: For Cloud Functions deployment
- **EAS CLI**: For production builds

### Testing Devices

- **iOS Device**: iPhone with Expo Go app
- **Android Device**: Android phone with Expo Go app
- **Simulator/Emulator**: For development testing

### External Services

- **Firebase Project**: Free tier sufficient for MVP
- **OpenAI API**: GPT-4 access for AI features
- **Expo Account**: For deployment and testing

## Timeline Awareness

### Critical Path

- **Day 1**: Foundation + Profiles & Presence
- **Day 2**: Messaging Core + MVP Polish
- **Day 3-4**: Group Chats + Push Notifications
- **Day 5**: AI Agent Basic Integration
- **Day 6-7**: AI Advanced Features + Final Polish

### Risk Mitigation

- **Start with core messaging**: Ensure reliable foundation
- **Test early and often**: Don't wait until end to test
- **Focus on MVP first**: AI features are nice-to-have
- **Use proven patterns**: Don't reinvent the wheel
