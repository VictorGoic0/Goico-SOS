# System Patterns: Mobile Messaging App

## Architecture Overview

The app follows a **3-store Zustand architecture** pattern proven in CollabCanvas, designed for real-time collaborative applications with optimistic updates and reliable state management.

## Core Architecture Pattern

### 3-Store Separation

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Store   │    │ Presence Store  │    │ Firebase Store  │
│                 │    │                 │    │                 │
│ - pending       │    │ - presence      │    │ - users         │
│   messages      │    │   data          │    │ - conversations │
│ - drafts        │    │ - isOnline      │    │ - messages      │
│ Status: sending │    │ - lastSeen      │    │ Status: sent/   │
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
            │ - Firestore     │
            │ - Realtime DB   │
            │ - Storage       │
            │ - Auth          │
            └─────────────────┘
```

## Store Responsibilities

### 1. Local Store (Optimistic Updates)

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

### Message Send Flow (3-Store Pattern)

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
6. RECIPIENT READS (status: "read") [BONUS]
```

**Component renders:**

```javascript
const allMessages = [
  ...useLocalStore((s) => s.pendingMessages[conversationId] || []),
  ...useFirebaseStore((s) => s.messages[conversationId] || []),
];
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
  const messages = useFirebaseStore((s) => s.messages[conversationId] || []);
  const pendingMessages = useLocalStore(
    (s) => s.pendingMessages[conversationId] || []
  );
  const allMessages = [...pendingMessages, ...messages];

  // Local state for UI-only concerns
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
};
```

## Real-Time Update Patterns

### Firestore Listeners

```javascript
// Listen to messages in real-time
const unsubscribe = onSnapshot(
  query(collection(db, "conversations", conversationId, "messages")),
  (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      messageId: doc.id,
      ...doc.data(),
    }));
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

### Optimistic Update Error Recovery

```javascript
const sendMessage = async (conversationId, text) => {
  // 1. Optimistic update
  const messageId = generateId();
  useLocalStore.getState().addPendingMessage(conversationId, {
    messageId,
    text,
    status: "sending",
  });

  try {
    // 2. Write to Firestore
    await addDoc(collection(db, "conversations", conversationId, "messages"), {
      text,
      status: "sent",
    });

    // 3. Remove from local store
    useLocalStore.getState().removePendingMessage(conversationId, messageId);
  } catch (error) {
    // 4. Error recovery - message stays in local store with "sending" status
    console.error("Failed to send message:", error);
    // User can retry or message will sync when connection restored
  }
};
```

### Offline State Management

```javascript
// Firestore handles offline persistence automatically
// Local store provides immediate UI feedback
// Firebase store receives updates when connection restored
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
