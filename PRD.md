## Out of Scope for MVP

- ❌ Voice/video calls
- ❌ Message reactions/emojis (moved to bonus)
- ❌ Message editing/deletion
- ❌ File sharing beyond images
- ❌ End-to-end encryption
- ❌ User blocking/reporting
- ❌ Message search
- ❌ Typing indicators (moved to bonus)
- ❌ Multiple device support (web + mobile)
- ❌ Automated testing
- ❌ Message forwarding
- ❌ Voice notes
- ❌ Location sharing
- ❌ Stickers/GIFs
- ❌ Video messages

---

## Success Metrics

### MVP Success (Day 2)

- ✅ 2+ users can sign up and authenticate
- ✅ Users can send messages that appear instantly with "sending" status
- ✅ Message status updates correctly (sending → sent → delivered)
- ✅ Offline messages queue and send when reconnected
- ✅ Profile photos upload successfully via Firebase Storage
- ✅ User presence updates accurately from Realtime Database
- ✅ Zero data loss during testing
- ✅ 3-store Zustand architecture working smoothly

### Checkpoint 2 Success (Day 5)

- ✅ Group chats work with 3+ users
- ✅ Push notifications deliver when app is closed/background
- ✅ Tapping notification opens correct conversation
- ✅ AI agent responds to basic queries

### Final Success (Day 7)

- ✅ AI agent provides context-aware responses
- ✅ Conversation summaries work
- ✅ All core features work on iOS + Android
- ✅ App handles 50+ users without performance issues
- ✅ Comprehensive demo video completed
- ✅ Clean, documented codebase

---

## Submission Deliverables

1. **GitHub Repository**

   - Clean, documented code
   - README with setup instructions
   - Firebase configuration guide
   - Zustand store architecture documentation
   - Deployed app link (Expo Go or EAS)

2. **Demo Video** (3-5 minutes)

   - Show authentication and profile setup flow
   - Demonstrate 1-on-1 messaging with status indicators
   - Show offline message queuing
   - Demonstrate presence tracking
   - Show group chats
   - Demo push notifications
   - Demo AI agent features
   - Explain 3-store architecture

3. **Deployed Application**
   - Expo Go QR code or EAS build links (iOS + Android)
   - Works on iOS + Android
   - Supports 5+ simultaneous users
   - Push notifications functional

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

### Presence Tracking Flow (Realtime Database)

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
    where("status", "==", "delivered")
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
  - CreateGroupScreen (post-MVP)
  - GroupInfoScreen (post-MVP)
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
    "openai": "^4.20.0"
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

# Install AI SDK (later)
npm install ai openai
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
4. View other user's profile → Shows their info

**Presence:**

1. User A opens app → Shows online for User B
2. User A closes app → Shows offline for User B (within 1 min)
3. User A in background → Still shows online
4. Check lastSeen timestamp updates every minute

**Messaging:**

1. Send message → Shows "sending" → Changes to "sent ✓"
2. Recipient receives → Changes to "delivered ✓✓"
3. Recipient views conversation → Changes to "read" (bonus)
4. Send message while offline → Shows "sending" → Syncs when online
5. Send 50+ messages → No lag, smooth scrolling

**Offline Mode:**

1. Turn on airplane mode
2. Send 3 messages → All show "sending"
3. Turn off airplane mode
4. All 3 messages sync with correct timestamps
5. Recipient receives all 3 messages in order

**Group Chats:**

1. Create group with 3 users → All can see group
2. Send message in group → All receive
3. Each message shows sender name
4. Add new participant → They see message history
5. Leave group → Can't send messages

**Push Notifications:**

1. Close app
2. Send message from other device
3. Notification appears on lock screen
4. Tap notification → Opens conversation
5. Multiple messages → Multiple notifications (or grouped)

**AI Agent:**

1. Ask simple question → Get response
2. Ask for conversation summary → Get summary
3. Request smart reply → Get suggestions
4. Multi-turn conversation → Maintains context

---

## Questions to Resolve

- [ ] **App name** - What should we call it? (not "WhatsApp Clone")
- [ ] **Color scheme** - Primary/accent colors for UI
- [ ] **AI features priority** - Chat assistant first or summaries first?
- [ ] **Username search** - Implement before or after AI agent?
- [ ] **Platform priority** - Test iOS first, Android first, or both simultaneously?
- [ ] **Push notification sound** - Custom sound or system default?
- [ ] **Message retention** - Keep all messages forever or limit to X days?

---

## Next Steps

1. **Immediate**: Create Expo project and set up Firebase
2. **Hour 1-2**: Set up Zustand stores and implement authentication
3. **Hour 3-8**: Build user profiles, presence, and user list
4. **Hour 9-16**: Implement 1-on-1 messaging with status tracking
5. **Hour 17-24**: Polish MVP and test thoroughly
6. **Day 3-5**: Add group chats, push notifications, and start AI integration
7. **Day 6-7**: Complete AI features and final polish

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App (Expo)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Local Store  │  │Presence Store│  │Firebase Store│     │
│  │              │  │              │  │              │     │
│  │ - pending    │  │ - presence   │  │ - users      │     │
│  │   messages   │  │   Data       │  │ - convos     │     │
│  │ - drafts     │  │              │  │ - messages   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│  ┌─────────────────────────┴───────────────────────────┐   │
│  │            React Components                         │   │
│  │  - Screens  - Navigation  - UI Components          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
   ┌────────────┐  ┌─────────────┐  ┌──────────────┐
   │  Firebase  │  │  Realtime   │  │   Firebase   │
   │ Firestore  │  │  Database   │  │   Storage    │
   │            │  │             │  │              │
   │ - users    │  │ - presence  │  │ - profile    │
   │ - convos   │  │             │  │   photos     │
   │ - messages │  │             │  │ - group      │
   │            │  │             │  │   photos     │
   └────────────┘  └─────────────┘  └──────────────┘
```

---

## Notes

- **Focus on messaging first**: A great chat experience beats fancy features
- **Test with real devices**: Expo Go on physical phones from day 1
- **Use airplane mode constantly**: Verify offline support works
- **Keep stores simple**: Clear separation = easier debugging
- **Leverage Expo**: Don't fight the framework, use its strengths
- **Firestore does heavy lifting**: Trust the built-in offline support
- **Test presence early**: .onDisconnect() behavior can be tricky
- **Status indicators matter**: Users expect to know if messages were delivered# Messaging App - Product Requirements Document

## Executive Summary

A real-time messaging app built with React Native and Expo, enabling users to chat one-on-one and in groups with AI-powered features. This MVP focuses on building rock-solid messaging infrastructure with user profiles, presence tracking, offline support, and message delivery status.

**Project Timeline**: 7-day sprint with checkpoints at Day 2, Day 5, and Day 7

---

## Product Vision

Build a modern messaging platform that combines real-time communication with AI assistance, providing users with seamless chat experiences across online and offline states with reliable message delivery tracking.

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
  - **Realtime Database**: User presence (isOnline, lastSeen)
  - **Firebase Storage**: Image/photo uploads
  - **Cloud Functions**: Push notifications
- **Real-time Sync**: Firestore listeners (onSnapshot) + Realtime Database listeners
- **Offline Support**: Firestore offline persistence (built-in)

### AI Integration

- **AI SDK**: Vercel AI SDK
- **AI Provider**: OpenAI (GPT-4)
- **Features**: Chat assistant, conversation summaries

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
- Status message (default: "Available")

✅ **User Presence** (Realtime Database)

- Show online/offline status for all users
- Update presence on app state changes
- Display last seen timestamp for offline users
- Auto-disconnect handling

✅ **User List**

- Display all registered users
- Show online/offline status (from Realtime Database)
- Tap user to start conversation

✅ **One-on-One Messaging**

- Send text messages in real-time
- View message history
- Messages sync instantly across devices
- Timestamps for each message
- **Message status tracking**: sending → sent → delivered → read (bonus)

✅ **Offline Support**

- Queue messages sent while offline
- Auto-send when connection restored
- Firestore handles this automatically
- Show "sending" status for queued messages

### MVP Success Criteria

- Two users can sign up and chat in real-time
- Messages appear instantly (<500ms)
- Message status shows correctly (sending/sent/delivered)
- Offline messages send successfully when reconnected
- User presence updates accurately
- Profile photos upload and display correctly

---

## Post-MVP Requirements

### Checkpoint 2 (Day 3-5 - Friday)

✅ **Group Chats**

- Create group conversations (3+ users)
- Add/remove participants
- Group name and photo (optional)
- Same message structure as 1-on-1 chats

✅ **Push Notifications**

- Request notification permission
- Send notification when message received (user not in app)
- Tap notification → open conversation
- Firebase Cloud Function triggers on new message

✅ **AI Agent - Basic**

- Start integrating Vercel AI SDK
- Basic chat assistant in conversations
- Simple responses and interactions

### Checkpoint 3 (Day 6-7 - Sunday)

✅ **AI Agent - Advanced**

- Conversation summaries
- Smart replies
- Context-aware responses
- AI accessible from any conversation

✅ **Polish & UX**

- Smooth animations
- Better loading states
- Error handling
- UI refinements

### Bonus Features (If Time Permits)

- **Add users by username search** (instead of seeing all users)
- Message reactions/emojis
- Voice messages
- Image/file sharing in messages
- Typing indicators

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
6. RECIPIENT READS (status: "read") [BONUS]
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
  - lastEdit: timestamp (renamed from updatedAt)
```

**Indexes Needed:**

- `username` (for username search)

**Note:** `isOnline` and `lastSeen` are NOT in Firestore - they're in Realtime Database

---

### Realtime Database: `presence` (Real-time presence only)

```
/presence/{userId}
  - isOnline: boolean
  - lastSeen: timestamp (server timestamp)
```

**Why Realtime Database for presence:**

- Built-in `.onDisconnect()` is more reliable than Firestore
- Automatically sets `isOnline: false` when user disconnects
- Faster updates (<50ms)
- Cheaper (ephemeral data, not persistent)

**Implementation:**

```javascript
// When user opens app
set(presenceRef, { isOnline: true, lastSeen: serverTimestamp() });

// Auto-disconnect
onDisconnect(presenceRef).set({
  isOnline: false,
  lastSeen: serverTimestamp(),
});

// Update lastSeen every minute while active
setInterval(() => {
  update(presenceRef, { lastSeen: serverTimestamp() });
}, 60000);
```

---

### Collection: `conversations` (Firestore)

```
/conversations/{conversationId}
  - conversationId: string (auto-generated or deterministic for 1-on-1)
  - participants: array<string> (array of user IDs - [userId1, userId2] or more for groups)
  - participantUsernames: array<string> (for easy display - ["john_doe", "jane_smith"])
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
```

**Message Status Flow:**

1. **"sending"**: Optimistic local state (in LOCAL store, not written to Firestore yet)
2. **"sent"**: Successfully written to Firestore
3. **"delivered"**: Recipient's app has received it (onSnapshot fired on their device)
4. **"read"**: Recipient opened conversation and viewed message (bonus)

**Indexes Needed:**

- `timestamp` (for ordering messages chronologically)
- `status` (optional, for querying unread messages)

---

## User Stories

### As a New User

- I can sign up with email and password
- I complete my profile (username, display name) after signup
- I can optionally upload a profile photo and bio
- I can see all other users and their online/offline status

### As a Messaging User

- I can tap any user to start a conversation
- I can send messages that appear instantly with "sending" status
- I see message status change to "sent" then "delivered"
- I can see message timestamps
- I can view my conversation history
- I can see when the other person is online or their last seen time
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

### As a Group Chat User (Post-MVP)

- I can create a group chat with multiple users
- I can name the group and add a group photo
- I can see who sent each message in the group
- I can add or remove participants
- Message status shows "delivered" when all participants receive it

### As a Notified User (Post-MVP)

- I receive push notifications when I get a message (and app is closed/background)
- I can tap the notification to open the conversation
- Notifications show sender name and message preview

### As an AI-Assisted User (Post-MVP)

- I can ask the AI assistant questions in any conversation
- I can request conversation summaries
- I can get smart reply suggestions
- The AI understands context from the conversation

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
10. App creates Firestore `/users/{uid}` document
11. App creates Realtime Database `/presence/{uid}` entry
12. User lands on Home screen (user list)

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
2. Taps send button
3. **App adds to LOCAL store** (status: "sending", optimistic update)
4. **UI shows message immediately** with "sending" indicator
5. **App writes to Firestore** (status: "sent")
6. **Once Firestore confirms**, remove from LOCAL store
7. **onSnapshot updates FIREBASE store** (status: "sent")
8. **Recipient's onSnapshot fires** → add to their FIREBASE store
9. **Recipient's app writes back** (status: "delivered")
10. **Sender sees status update** to "delivered"
11. **(Bonus)** When recipient views conversation, mark as "read"

### Offline Message Flow

1. User loses internet connection
2. User types and sends message
3. App adds to LOCAL store (status: "sending")
4. Firestore write queued locally (automatic)
5. UI shows "sending..." indicator
6. User reconnects
7. Firestore syncs queued writes automatically (status: "sent")
8. LOCAL store clears, FIREBASE store updates
9. Messages appear with correct timestamps

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
- Search bar (bonus feature)
- List of all users:
  - Profile photo (circular)
  - Display name
  - Online indicator (green dot) or "Last seen: X mins ago"
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
    - Online/offline status indicator (green dot when online)
    - "Online" text when user is active
  - (For groups: Group name + participant count)
  - Delete conversation button (trash icon, enabled when messages exist)
  - Info icon (tap for user profile or group info)
- Message list (FlatList, inverted for bottom scroll):
  - Messages from other users (left-aligned, gray bubble)
  - Messages from current user (right-aligned, blue bubble)
  - Timestamps (below message or grouped by time)
  - **Message status indicators** (for sent messages):
    - Single checkmark: sent ✓
    - Double checkmark: delivered ✓✓
    - Blue double checkmark: read ✓✓ (bonus)
  - Sender name (for groups)
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
- Save button
- Sign out button (bottom)

**Functionality:**

- Update profile fields → save to Firestore
- Upload new profile photo → Firebase Storage → update imageURL
- Update display name → also update Firebase Auth profile
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

### 6. Group Chat Screens (Post-MVP)

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

## Performance Targets

### MVP Performance

- ✅ Message send latency: <500ms (local optimistic update: instant)
- ✅ Message receive latency: <500ms (Firestore real-time)
- ✅ Message status update: <200ms (Firestore write)
- ✅ User list loads: <2 seconds
- ✅ Presence updates: <100ms (Realtime Database)
- ✅ App handles 50+ users without lag
- ✅ Offline message queue: Unlimited (Firestore handles)
- ✅ Profile photo upload: <5 seconds for typical images

### Stretch Performance (Post-MVP)

- Message send/receive: <200ms
- Support 1000+ users with pagination
- Lazy load conversations and messages
- Image compression before upload

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

      // Messages in conversation
      match /messages/{messageId} {
        allow read: if request.auth != null &&
                       request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow create: if request.auth != null &&
                         request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow update: if request.auth != null &&
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

    // Send push notification
    const payload = {
      notification: {
        title: message.senderUsername,
        body: message.text,
        sound: "default",
      },
      data: {
        conversationId,
        type: "new_message",
      },
    };

    await admin.messaging().sendToDevice(pushTokens, payload);
  });
```

---

## Implementation Priorities

### Phase 1: Foundation (Day 1 - Hours 0-8)

**Goal**: Get authentication and basic navigation working

- [ ] Set up React Native project with Expo (`npx create-expo-app`)
- [ ] Install dependencies: Zustand, Firebase, React Navigation
- [ ] Set up Firebase project (Auth + Firestore + Realtime Database + Storage)
- [ ] Create 3 Zustand stores (localStore, presenceStore, firebaseStore)
- [ ] Implement signup flow (email + password only)
- [ ] Implement profile setup screen (username, displayName, optional photo/bio)
- [ ] Implement login flow
- [ ] Create user profile document on signup (Firestore)
- [ ] Create presence entry on login (Realtime Database)
- [ ] Basic navigation (Auth screens ↔ Home screen)

**Checkpoint**: Users can sign up, complete profile, log in, and see Home screen

---

### Phase 2: User Profiles & Presence (Day 1 - Hours 8-16)

**Goal**: Complete user profiles and presence tracking

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

---

### Phase 3: Messaging Core (Day 2 - Hours 0-12)

**Goal**: Get 1-on-1 messaging working with status tracking

- [ ] Create or find conversation when users tap each other
- [ ] Build Chat screen UI
- [ ] Implement send message with 3-store flow:
  - Add to LOCAL store (status: "sending")
  - Write to Firestore (status: "sent")
  - Remove from LOCAL store
  - onSnapshot updates FIREBASE store
- [ ] Implement real-time message listening (onSnapshot)
- [ ] Merge LOCAL + FIREBASE messages in UI
- [ ] Display message status indicators (✓ sent, ✓✓ delivered)
- [ ] Update status to "delivered" when recipient receives
- [ ] Handle offline persistence (Firestore auto-queues)
- [ ] Test message flow with 2 devices

**Checkpoint**: Two users can chat in real-time with accurate status indicators

---

### Phase 4: MVP Polish (Day 2 - Hours 12-24)

**Goal**: Complete MVP requirements

- [ ] Test offline message queuing (airplane mode)
- [ ] Verify message status flow end-to-end
- [ ] Add loading states (sending messages, loading conversations)
- [ ] Improve UI/UX (styling, message bubbles, timestamps)
- [ ] Add error handling (failed sends, no internet)
- [ ] Optimize FlatList performance (message list)
- [ ] Bug fixes
- [ ] Test with 3+ users
- [ ] Deploy test build (Expo Go or EAS Build)

**Checkpoint**: MVP complete - ready for demo

---

### Phase 5: Group Chats (Day 3-4)

**Goal**: Extend conversations to support groups

- [ ] Create Group screen (select users, name group, optional photo)
- [ ] Extend conversation schema (isGroup, groupName, groupImageURL)
- [ ] Update conversation creation logic for groups
- [ ] Update Chat screen for group messages:
  - Show sender names above messages
  - Update header (group name, participant count)
- [ ] Build Group Info screen (participants, add/remove, leave)
- [ ] Update message status for groups (delivered when all receive)
- [ ] Test group messaging with 3+ users

**Checkpoint**: Groups working with 3+ users

---

### Phase 6: Push Notifications (Day 4-5)

**Goal**: Send notifications when users receive messages

- [ ] Install expo-notifications
- [ ] Request notification permission on app start
- [ ] Get push token and save to Firestore user document (pushToken field)
- [ ] Set up Firebase Cloud Functions project
- [ ] Deploy `sendMessageNotification` Cloud Function
- [ ] Test notification delivery (app in background)
- [ ] Handle notification tap → open conversation
- [ ] Test with multiple devices

**Checkpoint**: Push notifications working

---

### Phase 7: AI Agent - Basic (Day 5)

**Goal**: Integrate Vercel AI SDK

- [ ] Install Vercel AI SDK
- [ ] Set up OpenAI API key (environment variable)
- [ ] Create AI chat interface (separate screen or in-conversation)
- [ ] Basic Q&A functionality
- [ ] Stream AI responses
- [ ] Test AI responses in conversations

**Checkpoint**: AI agent responds to messages

---

### Phase 8: AI Agent - Advanced (Day 6-7)

**Goal**: Add complex AI features

- [ ] Implement conversation summarization
- [ ] Add smart reply suggestions
- [ ] Add context-aware responses (pass conversation history)
- [ ] Make AI accessible from any chat (button in header)
- [ ] Polish AI UX (loading states, streaming indicators)
- [ ] Test AI features thoroughly

**Checkpoint**: AI features complete

---

### Phase 9: Final Polish (Day 7)

**Goal**: Ship-ready product

- [ ] Final bug fixes
- [ ] Performance optimization (FlatList, image loading)
- [ ] UI/UX polish (animations, smooth transitions)
- [ ] Test all features end-to-end (auth, messaging, groups, AI, notifications)
- [ ] Deploy production build (EAS Build)
- [ ] Create demo video (3-5 minutes)
- [ ] Write comprehensive README

**Checkpoint**: Ready for submission

---

## Known Risks & Mitigation

### Risk 1: React Native + Expo learning curve

**Mitigation**: Use Expo (simplifies 90% of native setup). Leverage React knowledge. Use Expo documentation extensively. Test on real device from day 1.

### Risk 2: Firebase real-time + Realtime Database complexity

**Mitigation**: Start with simple onSnapshot and onValue listeners. Use Firestore's built-in offline support. Test presence with .onDisconnect() early. Keep schemas simple.

### Risk 3: Zustand 3-store architecture overhead

**Mitigation**: You've done this before in CollabCanvas. Copy proven patterns. Keep stores focused. Document data flow clearly.

### Risk 4: Message status tracking complexity

**Mitigation**: Implement incrementally (sending → sent first, then delivered). Test with 2 devices constantly. Use Firestore transactions for atomic updates.

### Risk 5: Offline message queuing edge cases

**Mitigation**: Let Firestore handle most of it automatically. Test airplane mode scenarios early and often. Keep LOCAL store logic simple.

### Risk 6: Profile photo uploads slow or fail

**Mitigation**: Use Firebase Storage (optimized for mobile). Add image compression with expo-image-manipulator. Show upload progress. Test on slow network.

### Risk 7: Push notifications don't work

**Mitigation**: Use Expo's managed workflow (handles certificates). Test on physical device (push doesn't work in simulator). Debug with Expo notification tool. Deploy Cloud Function early.

### Risk 8: AI agent integration takes too long

**Mitigation**: Use Vercel AI SDK (simplest option). Start with basic chat, add features incrementally. AI is last priority - can be demo-only if needed.

### Risk 9: Group chats add unexpected complexity

**Mitigation**: Reuse 1-on-1 message structure. Test with 3 users first before scaling up. Keep group features minimal for MVP.

---

## Out of Scope for MVP

- ❌ Voice/video calls
- ❌ Message reactions/emojis (moved to bonus)
- ❌ Message editing/deletion
- ❌ File sharing beyond images
- ❌ End-to-end encryption
- ❌ User blocking/reporting
- ❌ Message search
- ❌ Typing indicators
- ❌ Multiple device support (web + mobile)
- ❌ Automated testing
- ❌ Message forwarding
- ❌ Voice notes
- ❌ Location sharing
- ❌ Stickers/GIFs
- ❌ Video messages

---

## Post-MVP / Bonus Tasks

### Performance & Scalability

#### Hybrid Conversation Deletion (High Priority)

**Problem**: Current client-side deletion works well for small conversations (<500 messages) but could timeout or fail on large conversations (10K+ messages).

**Solution**: Implement intelligent deletion strategy:

1. **Track Message Count**

   - Add `messageCount` field to conversation documents
   - Increment on each message send
   - Use for deletion strategy decision

2. **Smart Deletion Logic**

   ```javascript
   if (messageCount < 100) {
     // Small conversation - immediate client-side deletion
     await deleteConversation(conversationId);
   } else {
     // Large conversation - async server-side deletion
     await markConversationForDeletion(conversationId);
     // Show toast: "Deleting conversation in background..."
   }
   ```

3. **Soft Delete Option**

   - Add `deletedBy: [userId]` field to conversations
   - Filter out deleted conversations in UI
   - Allow "undo" within 30 seconds
   - Enables per-user deletion (one user can delete, other keeps it)

4. **Cloud Function for Background Deletion**

   ```javascript
   // Trigger on conversation.markedForDeletion = true
   // Use admin.firestore().recursiveDelete() for efficient bulk deletion
   // Delete conversation after all messages are removed
   ```

5. **Scheduled Cleanup Job**
   - Cloud Scheduler + Cloud Function
   - Run daily to hard-delete conversations marked as deleted 30+ days ago
   - Saves storage costs and allows data recovery window

**Benefits**:

- ✅ Instant UI response for users
- ✅ No timeout issues on large conversations
- ✅ "Undo" capability improves UX
- ✅ Reduces client bandwidth usage
- ✅ Scales to millions of messages
- ✅ Independent per-user deletion

**Implementation Complexity**: Medium
**Priority**: Implement when conversations regularly exceed 1000 messages

---

### Other Performance Improvements

#### Message Pagination

- Load messages in batches (50 at a time)
- Infinite scroll for older messages
- Reduces initial load time for long conversations

#### Image Optimization

- Compress images before upload
- Generate thumbnails for faster loading
- Use progressive loading (blur → full image)

#### Presence Optimization

- Batch presence updates (max 1 update per 5 seconds)
- Use Firebase Realtime Database single listener
- Reduce unnecessary writes

---

### Feature Enhancements

#### Message Reactions

- Add emoji reactions to messages
- Real-time reaction updates
- Show reaction counts

#### Typing Indicators

- Show "User is typing..." indicator
- Real-time typing status
- Auto-hide after 3 seconds

#### Message Search

- Full-text search across conversations
- Search by user, date, or content
- Use Algolia or Firestore text search

#### Read Receipts (Individual)

- Track when each message was read
- Show read timestamp
- Blue checkmarks when read

#### Message Forwarding

- Forward messages to other conversations
- Preserve original sender info
- Add "Forwarded" label

#### Voice Messages

- Record audio messages
- Playback controls
- Waveform visualization

#### File Sharing

- Support PDF, docs, spreadsheets
- File size limits (25MB)
- Download and preview

---

### Infrastructure Improvements

#### Automated Testing

- Unit tests for utility functions
- Integration tests for Firebase operations
- E2E tests with Detox

#### Error Monitoring

- Integrate Sentry for error tracking
- Log critical errors to analytics
- Alert on high error rates

#### Analytics

- Track user engagement metrics
- Message send rates
- Feature usage statistics

#### Rate Limiting

- Prevent message spam (max 10 msgs/second)
- Conversation creation limits
- API rate limiting

---

### Security Enhancements

#### End-to-End Encryption

- Encrypt messages client-side
- Key exchange protocol
- Secure key storage

#### User Blocking/Reporting

- Block users from messaging
- Report inappropriate content
- Admin moderation tools

#### Two-Factor Authentication

- SMS or authenticator app
- Required for sensitive actions
- Account recovery flow
