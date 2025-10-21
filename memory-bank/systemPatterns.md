# System Patterns: Mobile Messaging App

## Architecture Overview

The app follows a **3-store Zustand architecture** pattern proven in CollabCanvas, designed for real-time collaborative applications with optimistic updates and reliable state management.

## Core Architecture Pattern

### 3-Store Separation

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Store   │    │ Presence Store  │    │ Firebase Store  │
│                 │    │                 │    │                 │
│ - drafts        │    │ - presence      │    │ - users         │
│ - isSending     │    │   data          │    │ - conversations │
│ - isLoading     │    │ - isOnline      │    │ - messages      │
│                 │    │ - lastSeen      │    │ Status: sent/   │
└─────────────────┘    └─────────────────┘    │   delivered/    │
         │                       │             │   read         │
         └───────────────────────┼─────────────┘                │
                                 │                              │
                    ┌────────────┴────────────┐                │
                    │    React Components     │                │
                    │  - Screens              │                │
                    │  - Navigation           │                │
                    │  - UI Components        │                │
                    └────────────────────────┘                │
                                                               │
                    ┌─────────────────────────────────────────┘
                    │
                    ▼
            ┌─────────────────┐
            │   Firebase      │
            │   Backend       │
            │                 │
            │ - Firestore     │◄─── Local Cache
            │ - Realtime DB   │    (hasPendingWrites)
            │ - Storage       │
            │ - Auth          │
            └─────────────────┘
```

**Note**: Firebase Firestore's built-in local cache and `hasPendingWrites` metadata handle optimistic updates automatically. We no longer need a separate `pendingMessages` array.

## Store Responsibilities

### 1. Local Store (UI State & Drafts)

**Purpose**: Handle local UI state and draft messages (NOT optimistic message updates)

```javascript
// stores/localStore.js
- drafts: { conversationId: "draft text..." }
- isSending: { conversationId: boolean }
- isLoadingConversation: { conversationId: boolean }
- setDraft()
- clearDraft()
- setIsSending()
- setIsLoadingConversation()
```

**Use cases:**

- Store draft messages being typed
- Track UI loading states
- Track sending states for buttons

**Important**: Firebase Firestore's built-in local cache handles optimistic updates automatically via `hasPendingWrites` metadata. We don't manually track pending messages!

### 2. Presence Store (Realtime Database)

**Purpose**: Real-time presence data (online/offline, lastSeen)

```javascript
// stores/presenceStore.js
- presenceData: { userId: { isOnline: boolean, lastSeen: timestamp } }
- updatePresence()
- setAllPresence()
- isUserOnline()
```

**Use cases:**

- Show green dot for online users
- Show "Last seen 5 mins ago" for offline users
- Updates from Realtime Database onValue() listener

### 3. Firebase Store (Source of Truth)

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

## Data Flow Patterns

### Message Send Flow (Firebase-Native Pattern)

```
USER SENDS MESSAGE
    ↓
1. WRITE TO FIRESTORE (status: "sent")
    ↓
2. FIRESTORE LOCAL CACHE (instant write)
    ↓
3. onSnapshot FIRES (hasPendingWrites: true)
    ↓
4. UI SHOWS MESSAGE (status: "sending")
    ↓
5. SERVER CONFIRMS WRITE
    ↓
6. onSnapshot FIRES (hasPendingWrites: false)
    ↓
7. UI UPDATES MESSAGE (status: "sent")
    ↓
8. RECIPIENT RECEIVES (status: "delivered")
    ↓
9. RECIPIENT READS (status: "read") [BONUS]
```

**Component renders:**

```javascript
// Single source of truth - Firebase Store only!
const messages = useFirebaseStore((s) => s.messages[conversationId] || []);

// Message status determined in onSnapshot listener:
useEffect(() => {
  const unsubscribe = onSnapshot(
    q,
    { includeMetadataChanges: true }, // Enable metadata tracking
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        messageId: doc.id,
        ...doc.data(),
        // hasPendingWrites: true = "sending"
        // hasPendingWrites: false = "sent"
        status: doc.metadata.hasPendingWrites
          ? "sending"
          : doc.data().status || "sent",
      }));
      setMessages(conversationId, messages);
    }
  );
  return unsubscribe;
}, [conversationId]);
```

### Presence Update Flow

```
APP STATE CHANGE
    ↓
1. UPDATE REALTIME DATABASE
    ↓
2. PRESENCE STORE UPDATES (onValue listener)
    ↓
3. UI COMPONENTS RE-RENDER
    ↓
4. SHOW ONLINE/OFFLINE STATUS
```

### Authentication Flow

```
USER LOGIN
    ↓
1. FIREBASE AUTH (signInWithEmailAndPassword)
    ↓
2. FIREBASE STORE (setCurrentUser)
    ↓
3. INITIALIZE PRESENCE (Realtime Database)
    ↓
4. NAVIGATION (Auth Stack → Main Stack)
```

## Firebase Data Schema

### Firestore Collections

#### Users Collection

```javascript
/users/{userId}
{
  userId: string,           // Firebase Auth UID
  username: string,         // unique, lowercase, for search
  displayName: string,      // shown in UI
  email: string,            // from Firebase Auth
  imageURL: string | null,  // Firebase Storage download URL
  bio: string | null,       // optional user bio
  status: string,           // "Available", "Busy", "Away"
  pushToken: string | null, // Expo push notification token
  createdAt: timestamp,
  lastEdit: timestamp
}
```

#### Conversations Collection

```javascript
/conversations/{conversationId}
{
  conversationId: string,
  participants: array<string>,        // [userId1, userId2] or more for groups
  participantUsernames: array<string>, // for easy display
  isGroup: boolean,                   // false for 1-on-1, true for groups
  groupName: string | null,           // only for groups
  groupImageURL: string | null,       // only for groups
  lastMessage: string,               // preview of last message
  lastMessageSenderId: string,       // who sent the last message
  lastMessageTimestamp: timestamp,
  createdAt: timestamp,
  lastEdit: timestamp
}
```

#### Messages Subcollection

```javascript
/conversations/{conversationId}/messages/{messageId}
{
  messageId: string,        // auto-generated
  senderId: string,        // user ID who sent the message
  senderUsername: string,  // for display, denormalized
  text: string,           // message content
  timestamp: timestamp,   // Firestore server timestamp
  status: string,         // "sending" | "sent" | "delivered" | "read"
  imageURL: string | null // for image messages - bonus feature
}
```

### Realtime Database Schema

#### Presence Node

```javascript
/presence/{userId}
{
  isOnline: boolean,
  lastSeen: timestamp    // server timestamp
}
```

**Why Realtime Database for presence:**

- Built-in `.onDisconnect()` is more reliable than Firestore
- Automatically sets `isOnline: false` when user disconnects
- Faster updates (<50ms)
- Cheaper (ephemeral data, not persistent)

## Component Architecture

### Screen Components

- **Auth Screens**: SignupScreen, LoginScreen, ProfileSetupScreen
- **Main Screens**: HomeScreen, ChatScreen, ProfileScreen, GroupInfoScreen
- **AI Screens**: AIChatScreen

### Reusable Components

- **MessageBubble**: Displays individual messages with status indicators
- **UserListItem**: Shows user info with presence status
- **Design System**: Button, Input, Card components

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
  - CreateGroupScreen (post-MVP)
  - GroupInfoScreen (post-MVP)
  - AIChatScreen (post-MVP)
```

## State Management Patterns

### Zustand Store Pattern

```javascript
// Example store structure
const useFirebaseStore = create((set, get) => ({
  // State
  currentUser: null,
  users: [],
  usersMap: {},

  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  setUsers: (users) =>
    set({
      users,
      usersMap: users.reduce(
        (map, user) => ({ ...map, [user.userId]: user }),
        {}
      ),
    }),

  // Computed values
  getCurrentUser: () => get().currentUser,
  getUserById: (userId) => get().usersMap[userId],
}));
```

### Component State Pattern

```javascript
// Screen components use stores for global state
const ChatScreen = () => {
  // Single source of truth - Firebase Store
  const messages = useFirebaseStore((s) => s.messages[conversationId] || []);

  // Local Store for drafts and UI state
  const drafts = useLocalStore((s) => s.drafts);
  const inputText = drafts[conversationId] || "";

  // Local state for component-specific concerns
  const [conversationId, setConversationId] = useState(null);
  const flatListRef = useRef(null);
};
```

## Real-Time Update Patterns

### Firestore Listeners

```javascript
// Listen to messages in real-time with metadata changes
const unsubscribe = onSnapshot(
  query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("timestamp", "asc")
  ),
  { includeMetadataChanges: true }, // Enable hasPendingWrites tracking
  (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        messageId: doc.id,
        ...data,
        // Determine status from Firebase metadata
        status: doc.metadata.hasPendingWrites
          ? "sending"
          : data.status || "sent",
      };
    });
    useFirebaseStore.getState().setMessages(conversationId, messages);
  }
);
```

### Realtime Database Listeners

```javascript
// Listen to presence changes
const unsubscribe = onValue(ref(realtimeDb, "presence"), (snapshot) => {
  const presenceData = snapshot.val() || {};
  usePresenceStore.getState().setAllPresence(presenceData);
});
```

## Error Handling Patterns

### Firebase-Native Error Recovery

```javascript
const handleSend = async () => {
  const textToSend = inputText.trim();
  if (!textToSend) return;

  // Clear draft immediately for instant UI feedback
  clearDraft(conversationId);

  try {
    // Just write to Firestore - that's it!
    // Firebase's local cache handles optimistic updates
    await sendMessage(
      conversationId,
      currentUser.uid,
      currentUser.username,
      textToSend
    );

    // Message appears instantly with hasPendingWrites: true ("sending")
    // Then updates to hasPendingWrites: false ("sent") when server confirms
  } catch (error) {
    console.error("Error sending message:", error);
    // Restore draft on error so user doesn't lose their message
    setDraft(conversationId, textToSend);
  }
};
```

### Offline State Management

```javascript
// Firebase Firestore handles offline persistence automatically:
// 1. Writes are cached locally when offline
// 2. hasPendingWrites: true indicates locally cached writes
// 3. Automatic sync when connection restored
// 4. No manual queue management needed!

// Offline persistence is enabled in firebase.js:
enableIndexedDbPersistence(db, { cacheSizeBytes: 50 * 1024 * 1024 });
```

## Performance Patterns

### FlatList Optimization

```javascript
// Use FlatList for message lists
<FlatList
  data={allMessages}
  keyExtractor={(item) => item.messageId}
  inverted={true} // New messages at bottom
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### Image Loading Optimization

```javascript
// Use React Native Image component with proper sizing
<Image
  source={{ uri: user.imageURL }}
  style={{ width: 40, height: 40, borderRadius: 20 }}
  resizeMode="cover"
/>
```

## Security Patterns

### Firestore Security Rules

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
    }
  }
}
```

### Realtime Database Security Rules

```json
{
  "rules": {
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

## Testing Patterns

### Manual Testing Strategy

- **Physical devices**: Test on real iOS and Android devices
- **Offline scenarios**: Use airplane mode to test message queuing
- **Presence testing**: Open/close app on multiple devices
- **Status flow testing**: Verify sending → sent → delivered progression
- **Cross-platform testing**: Ensure consistent experience

### Key Test Scenarios

1. **Authentication**: Sign up, login, profile setup
2. **Messaging**: Send messages, verify status updates
3. **Offline**: Send messages while offline, verify sync
4. **Presence**: Online/offline status accuracy
5. **Groups**: Create groups, send messages, manage participants
6. **Notifications**: Push notification delivery and tap handling
7. **AI**: AI responses, conversation summaries, smart replies
