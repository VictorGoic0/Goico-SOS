**Navigate to Profile Screen:**
- [ ] In `HomeScreen.js`:
- [ ] Add profile icon to header (top-right)
- [ ] On tap, navigate to ProfileScreen

**Pre-fill Current User Data:**
- [ ] In `ProfileScreen.js`:
- [ ] Get currentUser from Firebase store
- [ ] Pre-fill all fields with current user data
- [ ] Use state to track edits

**Implement Change Photo:**
- [ ] In `ProfileScreen.js`:
- [ ] "Change Photo" button calls `pickImage()`
- [ ] Show loading indicator while uploading
- [ ] Call `uploadProfilePhoto(userId, imageUri)` from userProfile utils
- [ ] Update imageURL in Firestore
- [ ] Update local state and Firebase store

**Implement Save Changes:**
- [ ] In `ProfileScreen.js`:
- [ ] On "Save Changes" button press:
  - Validate displayName not empty
  - Update Firestore user document with new values:
    ```javascript
    await updateDoc(doc(db, 'users', userId), {
      displayName,
      bio,
      status,
      lastEdit: serverTimestamp()
    })
    ```
  - Update Firebase store with new data
  - Show success message or toast
  - Also update Firebase Auth displayName:
    ```javascript
    await updateProfile(auth.currentUser, { displayName })
    ```

**Implement Sign Out:**
- [ ] In `ProfileScreen.js`:
- [ ] "Sign Out" button calls `signOutUser()`
- [ ] Before signing out, update presence to offline:
  ```javascript
  await set(ref(realtimeDb, `presence/${userId}`), {
    isOnline: false,
    lastSeen: serverTimestamp()
  })
  ```
- [ ] Navigate to Login screen

**Add Loading States:**
- [ ] Show loading indicator while saving changes
- [ ] Disable "Save Changes" button while processing
- [ ] Show loading indicator while uploading photo

**Add to Navigation:**
- [ ] In `AppNavigator.js`:
- [ ] Add ProfileScreen to Main Stack

**Files Created:**
- `src/screens/ProfileScreen.js`

**Files Modified:**
- `src/screens/HomeScreen.js`
- `src/utils/userProfile.js` (add updateUserProfile function if needed)
- `src/navigation/AppNavigator.js`

**Test Before Merge:**
- [ ] Tap profile icon in Home screen → navigates to Profile screen
- [ ] All fields pre-filled with current user data
- [ ] Can change profile photo (uploads and displays new photo)
- [ ] Can edit displayName and bio
- [ ] Can change status
- [ ] "Save Changes" updates Firestore and local state
- [ ] Changes reflect immediately in UI
- [ ] Changes visible in Home screen (if displayName changed)
- [ ] Sign out works and returns to Login screen
- [ ] Sign out updates presence to offline

---

## PR #9: Group Chats
**Goal**: Implement group chat creation and messaging

### Subtasks

**Create Group Chat Screen:**
- [ ] File: `src/screens/CreateGroupScreen.js`
- [ ] UI Components:
  - Header: "Create Group"
  - Group Name TextInput
  - "Add Group Photo" Button (optional)
  - Section: "Select Participants"
  - FlatList of all users with checkboxes
  - Selected count display: "3 selected"
  - "Create Group" Button (bottom)

**Multi-Select User List:**
- [ ] In `CreateGroupScreen.js`:
- [ ] State to track selected user IDs: `const [selectedUsers, setSelectedUsers] = useState([])`
- [ ] Render all users (except current user) with checkboxes
- [ ] Toggle selection on checkbox tap
- [ ] Minimum 2 users required to create group

**Implement Create Group:**
- [ ] File: `src/utils/messaging.js`
- [ ] Function: `createGroupConversation(groupName, participantIds, groupImageURL)`
  - Generate conversationId (auto-generated)
  - Add current user to participants
  - Get usernames for all participants
  - Create conversation document:
    ```javascript
    {
      conversationId,
      participants: [currentUserId, ...participantIds],
      participantUsernames: [currentUsername, ...usernames],
      isGroup: true,
      groupName,
      groupImageURL: groupImageURL || null,
      lastMessage: '',
      lastMessageSenderId: '',
      lastMessageTimestamp: null,
      createdAt: serverTimestamp(),
      lastEdit: serverTimestamp()
    }
    ```
  - Return conversationId

**Connect Create Button:**
- [ ] In `CreateGroupScreen.js`:
- [ ] On "Create Group" button:
  - Validate group name not empty
  - Validate at least 2 users selected
  - If group photo selected, upload it first
  - Call `createGroupConversation`
  - Navigate to ChatScreen with new conversationId

**Update ChatScreen for Groups:**
- [ ] In `ChatScreen.js`:
- [ ] Detect if conversation is group:
  ```javascript
  const conversation = useFirebaseStore(s => 
    s.conversationsMap[conversationId]
  )
  const isGroup = conversation?.isGroup || false
  ```
- [ ] If group:
  - Header shows group name and participant count
  - Header tap → navigate to GroupInfoScreen (next)
  
- [ ] Update MessageBubble for groups:
  - Show sender's name above message (for other users' messages)
  - Use different colors for different senders

**Update Message Sending for Groups:**
- [ ] In `src/utils/messaging.js`:
- [ ] `sendMessage` function works for both 1-on-1 and groups (no changes needed)

**Update Delivered Status for Groups:**
- [ ] In `ChatScreen.js`:
- [ ] For groups, mark as "delivered" when current user receives
- [ ] (Advanced: track delivered status per user - optional for MVP)

**Create Group Info Screen:**
- [ ] File: `src/screens/GroupInfoScreen.js`
- [ ] UI Components:
  - Group photo (large)
  - Group name (editable by creator)
  - Participants list (with photos and names)
  - "Add Participants" Button
  - "Leave Group" Button (bottom, red)

**Implement Leave Group:**
- [ ] In `GroupInfoScreen.js`:
- [ ] "Leave Group" button:
  - Remove current user from participants array
  - Update conversation document
  - Navigate back to Home screen

**Add Navigation:**
- [ ] In `AppNavigator.js`:
- [ ] Add CreateGroupScreen to Main Stack
- [ ] Add GroupInfoScreen to Main Stack

**Add "Create Group" Button to Home Screen:**
- [ ] In `HomeScreen.js`:
- [ ] Add floating action button (FAB) or header button
- [ ] On tap, navigate to CreateGroupScreen

**Update Conversations List (Bonus):**
- [ ] In `HomeScreen.js`:
- [ ] Show both 1-on-1 and group conversations
- [ ] Display group icon for group chats
- [ ] Display last message preview

**Files Created:**
- `src/screens/CreateGroupScreen.js`
- `src/screens/GroupInfoScreen.js`

**Files Modified:**
- `src/screens/ChatScreen.js`
- `src/components/MessageBubble.js`
- `src/screens/HomeScreen.js`
- `src/utils/messaging.js`
- `src/navigation/AppNavigator.js`

**Test Before Merge:**
- [ ] Can navigate to Create Group screen
- [ ] Can select multiple users
- [ ] Can enter group name
- [ ] Can upload group photo (optional)
- [ ] "Create Group" creates conversation in Firestore
- [ ] Navigates to ChatScreen with new group
- [ ] Can send messages in group
- [ ] All group members receive messages
- [ ] Sender names display above messages (for others' messages)
- [ ] Can view Group Info screen
- [ ] Can leave group (removes from participants)
- [ ] Group appears in Home screen with other conversations

---

## PR #10: Push Notifications Setup
**Goal**: Implement push notifications for new messages

### Subtasks

**Install Expo Notifications:**
- [ ] Install package:
  ```bash
  npx expo install expo-notifications
  ```

**Request Notification Permissions:**
- [ ] File: `src/utils/notifications.js`
- [ ] Function: `registerForPushNotifications()`
  - Request permissions
  - Get Expo push token
  - Return token

- [ ] In `App.js` or `HomeScreen.js`:
- [ ] On app start (after login), call `registerForPushNotifications()`
- [ ] Save push token to Firestore user document:
  ```javascript
  await updateDoc(doc(db, 'users', userId), {
    pushToken: token
  })
  ```

**Set Up Firebase Cloud Functions:**
- [ ] Install Firebase CLI globally:
  ```bash
  npm install -g firebase-tools
  ```
- [ ] Initialize Cloud Functions in project:
  ```bash
  firebase init functions
  ```
- [ ] Select JavaScript
- [ ] Install dependencies

**Create Cloud Function for Notifications:**
- [ ] File: `functions/index.js`
- [ ] Function: `sendMessageNotification`
  - Trigger: onCreate in `/conversations/{convId}/messages/{msgId}`
  - Get conversation to find recipients
  - Get recipients' push tokens from Firestore
  - Filter out sender
  - Send notification via Expo push API:
    ```javascript
    const message = {
      to: pushTokens,
      sound: 'default',
      title: senderUsername,
      body: messageText,
      data: { conversationId, type: 'new_message' }
    }
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })
    ```

**Deploy Cloud Function:**
- [ ] Deploy to Firebase:
  ```bash
  firebase deploy --only functions
  ```
- [ ] Verify function appears in Firebase console (Functions section)

**Handle Notification Tap:**
- [ ] In `App.js`:
- [ ] Set up notification response listener:
  ```javascript
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      response => {
        const { conversationId } = response.notification.request.content.data
        // Navigate to ChatScreen with conversationId
      }
    )
    return () => subscription.remove()
  }, [])
  ```

**Test Notifications:**
- [ ] Close app completely (background or quit)
- [ ] Send message from second device
- [ ] First device should receive notification
- [ ] Tap notification → opens conversation

**Handle Notifications While App is Open:**
- [ ] In `App.js`:
- [ ] Set up foreground notification handler:
  ```javascript
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
  ```

**Files Created:**
- `src/utils/notifications.js`
- `functions/index.js` (Cloud Function)

**Files Modified:**
- `App.js`
- Firestore users schema (add pushToken field)

**Test Before Merge:**
- [ ] App requests notification permission on first launch
- [ ] Push token saved to Firestore user document
- [ ] Close app on device A
- [ ] Send message from device B
- [ ] Device A receives notification
- [ ] Notification shows sender name and message preview
- [ ] Tap notification opens correct conversation
- [ ] Notifications work for both 1-on-1 and group chats
- [ ] No notification received if app is open (or shows in-app alert)

---

## PR #11: AI Agent Integration - Basic
**Goal**: Integrate Vercel AI SDK for basic chat assistant

### Subtasks

**Install Vercel AI SDK:**
- [ ] Install packages:
  ```bash
  npm install ai openai
  ```

**Add OpenAI API Key:**
- [ ] In `.env`:
  ```
  EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
  ```

**Create AI Service:**
- [ ] File: `src/utils/aiService.js`
- [ ] Function: `sendToAI(prompt, conversationHistory)`
  - Initialize OpenAI client with API key
  - Create chat completion request:
    ```javascript
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...conversationHistory,
        { role: 'user', content: prompt }
      ],
      stream: false
    })
    return response.choices[0].message.content
    ```

**Create AI Chat Screen:**
- [ ] File: `src/screens/AIChatScreen.js`
- [ ] Similar to ChatScreen but:
  - No "other user" in header
  - Header shows "AI Assistant"
  - Messages from AI have different styling (maybe a robot icon)
  - Input bar same as regular chat

**Implement AI Message Flow:**
- [ ] In `AIChatScreen.js`:
- [ ] When user sends message:
  - Display user message immediately
  - Show "AI is typing..." indicator
  - Call `sendToAI(message, conversationHistory)`
  - Display AI response as new message
  - Store conversation in local state (not Firestore for MVP)

**Add Navigation to AI Chat:**
- [ ] In `AppNavigator.js`:
- [ ] Add AIChatScreen to Main Stack

**Add AI Chat Button:**
- [ ] In `HomeScreen.js`:
- [ ] Add "Chat with AI" button or menu item
- [ ] On tap, navigate to AIChatScreen

**Handle Streaming (Bonus):**
- [ ] If time permits, implement streaming responses:
  - Use `stream: true` in OpenAI request
  - Display response word by word as it arrives

**Files Created:**
- `src/utils/aiService.js`
- `src/screens/AIChatScreen.js`

**Files Modified:**
- `.env`
- `src/screens/HomeScreen.js`
- `src/navigation/AppNavigator.js`

**Test Before Merge:**
- [ ] Can navigate to AI Chat screen
- [ ] Can send messages to AI
- [ ] AI responds with relevant answers
- [ ] "Typing..." indicator shows while waiting
- [ ] Conversation history maintained within session
- [ ] Messages display correctly (user vs AI)

---

## PR #12: AI Agent Advanced Features & Final Polish
**Goal**: Add conversation summaries, smart replies, and final UI polish

### Subtasks

**Implement Conversation Summary:**
- [ ] In `src/utils/aiService.js`:
- [ ] Function: `summarizeConversation(messages)`
  - Take last 50 messages from conversation
  - Format as conversation history
  - Prompt: "Summarize the following conversation in 2-3 sentences"
  - Return summary

**Add Summary Button to Chat:**
- [ ] In `ChatScreen.js`:
- [ ] Add "Summarize" button to header or menu
- [ ] On tap:
  - Show loading indicator
  - Call `summarizeConversation(messages)`
  - Display summary in modal or alert

**Implement Smart Replies:**
- [ ] In `src/utils/aiService.js`:
- [ ] Function: `generateSmartReplies(lastMessage)`
  - Prompt: "Generate 3 short, natural reply suggestions for: {lastMessage}"
  - Return array of 3 reply options

**Add Smart Reply Chips to Chat:**
- [ ] In `ChatScreen.js`:
- [ ] When new message received (from other user):
  - Call `generateSmartReplies(lastMessage)`
  - Display 3 reply chips above input bar
  - On chip tap, populate input with reply text

**Make AI Context-Aware:**
- [ ] Update `sendToAI` function:
- [ ] Pass recent conversation context (last 10 messages)
- [ ] AI can reference the conversation

**Add AI to Group Chats:**
- [ ] Allow users to invoke AI in any conversation
- [ ] Add "/ai" command or AI button in chat
- [ ] AI response appears as message in conversation

**Final UI Polish:**
- [ ] Consistent styling across all screens
- [ ] Smooth animations and transitions
- [ ] Loading states for all async operations
- [ ] Error handling with user-friendly messages
- [ ] Empty states (no messages, no users, etc.)
- [ ] Polish message bubbles (better padding, shadows, rounded corners)
- [ ] Add message timestamps (group by date)
- [ ] Improve keyboard handling
- [ ] Add pull-to-refresh on Home screen

**Performance Optimization:**
- [ ] Optimize FlatList rendering (use `getItemLayout` if possible)
- [ ] Memoize components where appropriate
- [ ] Lazy load message history (pagination)
- [ ] Optimize image loading (add placeholders)
- [ ] Reduce unnecessary re-renders

**Error Handling:**
- [ ] Add global error boundary
- [ ] Handle network errors gracefully
- [ ] Handle Firebase errors (auth, Firestore, Storage)
- [ ] Handle AI errors (OpenAI API failures)
- [ ] Show toast/snackbar for errors

**Add Message Features (Time Permitting):**
- [ ] Long press message for options (copy, delete - local only)
- [ ] Copy message text
- [ ] Timestamp display (show time on tap)
- [ ] Read receipts (mark as "read" when conversation viewed)

**Testing & Bug Fixes:**
- [ ] Test all features end-to-end
- [ ] Test with 3+ devices simultaneously
- [ ] Test offline scenarios thoroughly
- [ ] Test push notifications in various states
- [ ] Test AI features with edge cases
- [ ] Fix any bugs discovered

**Create Demo Video:**
- [ ] Record 3-5 minute demo showing:
  - Sign up and profile creation
  - User list with presence
  - Sending messages with status indicators
  - Offline message queuing
  - Group chat creation and messaging
  - Push notifications (screen recording)
  - AI chat features (summary, smart replies)
  - Profile editing

**Documentation:**
- [ ] Update README with:
  - Complete setup instructions
  - How to add Firebase config
  - How to add OpenAI key
  - How to run on device
  - Feature list
  - Architecture explanation (3 stores)
  - Screenshots
- [ ] Document Zustand store architecture
- [ ] Add comments to complex code
- [ ] Create ARCHITECTURE.md file

**Deploy Production Build:**
- [ ] Test build locally: `npx expo build`
- [ ] Deploy with EAS Build:
  ```bash
  npm install -g eas-cli
  eas build --platform ios
  eas build --platform android
  ```
- [ ] Generate QR codes or download links
- [ ] Test production build on devices

**Files Created:**
- `ARCHITECTURE.md`
- Demo video file
- Screenshots folder

**Files Modified:**
- `src/utils/aiService.js`
- `src/screens/ChatScreen.js`
- `src/screens/AIChatScreen.js`
- All screens (UI polish)
- `README.md`

**Test Before Merge:**
- [ ] Conversation summary works correctly
- [ ] Smart replies generate appropriate suggestions
- [ ] AI is context-aware in conversations
- [ ] All UI elements polished and consistent
- [ ] No performance issues or lag
- [ ] All error scenarios handled gracefully
- [ ] App works on both iOS and Android
- [ ] Production build installs and runs correctly
- [ ] Demo video covers all features
- [ ] Documentation is complete and accurate

---

## Summary

**Critical Path (MVP - Day 1-2):**
PR #1 → #2 → #3 → #4 → #5 → #6 → #7 → #8

**Post-MVP (Day 3-5):**
PR #9 → #10 → #11

**Final (Day 6-7):**
PR #12

**Total PRs:** 12
**Estimated Time:** 7 days

---

## Key Reminders

- **Test with physical devices after every PR** - Use Expo Go app on your phone
- **Never skip testing presence** - Open app on 2 devices and verify online/offline status
- **Test offline mode constantly** - Use airplane mode to verify message queuing
- **3-store architecture is critical** - Keep LOCAL, PRESENCE, and FIREBASE stores separate
- **Message status flow must work** - Verify sending → sent → delivered progression
- **Firebase console is your friend** - Check Firestore, Realtime Database, and Storage regularly
- **Expo documentation** - Reference https://docs.expo.dev/ for React Native specifics
- **Hot reload is fast** - Make small changes and see them instantly on device

---

## Pro Tips for React Native Beginners

1. **Always use StyleSheet.create()** for styles (better performance)
2. **Use FlatList for lists** (not ScrollView with .map())
3. **KeyboardAvoidingView is essential** for chat inputs
4. **Always add key prop** to list items
5. **Use useCallback for functions** passed to children
6. **Test on real device, not just simulator** - especially for notifications
7. **Expo Go vs Production builds** - Some features work differently
8. **React Native debugger** - Shake device to open debug menu
9. **Console.log to terminal** - Check terminal running expo start for logs
10. **Reload app** - Shake device → "Reload" if hot reload breaks# Messaging App - Implementation Task List

## Overview
Each PR represents a complete, testable feature. PRs build on each other sequentially. Test thoroughly with physical devices before merging each PR.

**Total PRs:** 12
**Timeline:** 7 days with checkpoints at Day 2, Day 5, and Day 7

---

## PR #1: React Native Setup & Environment Configuration
**Goal**: Set up React Native with Expo and ensure you can run the app on a physical device

### Why This Matters
Since you've never used React Native, this PR focuses on getting your development environment working properly. You'll be able to see changes instantly on your phone.

### Subtasks

**Install Prerequisites:**
- [ ] Install Node.js (v18 or later) from nodejs.org
- [ ] Verify installation: `node --version` and `npm --version`
- [ ] Install Expo CLI globally: `npm install -g expo-cli`

**Create Expo Project:**
- [ ] Run: `npx create-expo-app messaging-app`
- [ ] Navigate to project: `cd messaging-app`
- [ ] Verify project structure exists:
  ```
  messaging-app/
  ├── App.js
  ├── package.json
  ├── app.json
  └── assets/
  ```

**Install Expo Go on Phone:**
- [ ] Download "Expo Go" app from App Store (iOS) or Google Play (Android)
- [ ] Open Expo Go and create account (or sign in)

**Test Development Workflow:**
- [ ] In terminal, run: `npx expo start`
- [ ] Scan QR code with phone camera (iOS) or in Expo Go app (Android)
- [ ] App should load on your phone
- [ ] Edit `App.js` - change text to "Hello Messaging App"
- [ ] Save file and verify change appears on phone (hot reload)

**Install Core Dependencies:**
- [ ] Install Firebase:
  ```bash
  npm install firebase
  ```
- [ ] Install Zustand:
  ```bash
  npm install zustand
  ```
- [ ] Install React Navigation:
  ```bash
  npm install @react-navigation/native @react-navigation/native-stack
  npx expo install react-native-screens react-native-safe-area-context
  ```

**Project Structure Setup:**
- [ ] Create folder structure:
  ```
  src/
  ├── screens/
  ├── components/
  ├── stores/
  │   ├── localStore.js
  │   ├── presenceStore.js
  │   └── firebaseStore.js
  ├── config/
  │   └── firebase.js
  ├── utils/
  └── navigation/
      └── AppNavigator.js
  ```

**Environment Variables:**
- [ ] Create `.env` file in root (will add Firebase keys later)
- [ ] Add `.env` to `.gitignore`
- [ ] Install dotenv: `npm install dotenv`

**Git Setup:**
- [ ] Initialize git: `git init`
- [ ] Create `.gitignore` (Expo creates one automatically, verify it includes):
  ```
  node_modules/
  .expo/
  .expo-shared/
  *.jks
  *.p8
  *.p12
  *.key
  *.mobileprovision
  .env
  ```
- [ ] Initial commit: `git add .` and `git commit -m "Initial Expo setup"`

**Documentation:**
- [ ] Create `README.md`:
  - Project name and description
  - Prerequisites (Node, Expo Go app)
  - How to run: `npx expo start`
  - How to test on phone (scan QR code)
  - Folder structure explanation

**Files Created:**
- `src/stores/localStore.js` (empty for now)
- `src/stores/presenceStore.js` (empty for now)
- `src/stores/firebaseStore.js` (empty for now)
- `src/config/firebase.js` (empty for now)
- `src/navigation/AppNavigator.js` (empty for now)
- `.env`
- `README.md`
- `.gitignore`

**Test Before Merge:**
- [ ] `npx expo start` runs without errors
- [ ] Can scan QR code and see app on phone
- [ ] Hot reload works (edit App.js, see changes on phone)
- [ ] All dependencies installed successfully
- [ ] No console errors in terminal or Expo Go app

---

## PR #2: Firebase Configuration & Zustand Stores
**Goal**: Set up Firebase project and create the 3-store Zustand architecture

### Subtasks

**Create Firebase Project:**
- [ ] Go to https://console.firebase.google.com
- [ ] Click "Add project"
- [ ] Name it (e.g., "messaging-app-prod")
- [ ] Disable Google Analytics (optional for MVP)
- [ ] Wait for project to be created

**Enable Firebase Services:**
- [ ] In Firebase console, go to "Authentication"
- [ ] Click "Get Started"
- [ ] Enable "Email/Password" sign-in method
- [ ] Go to "Firestore Database"
- [ ] Click "Create database"
- [ ] Start in "test mode" (we'll add rules later)
- [ ] Choose region (closest to you)
- [ ] Go to "Realtime Database"
- [ ] Click "Create database"
- [ ] Start in "test mode"
- [ ] Go to "Storage"
- [ ] Click "Get Started"
- [ ] Start in "test mode"

**Get Firebase Configuration:**
- [ ] In Firebase console, click gear icon → Project settings
- [ ] Scroll to "Your apps" section
- [ ] Click "Web" icon (</>) to add web app
- [ ] Register app (name it "messaging-app")
- [ ] Copy the Firebase config object

**Configure Firebase in App:**
- [ ] Add Firebase config to `.env`:
  ```
  EXPO_PUBLIC_FIREBASE_API_KEY=your_key
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
  EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_id
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
  EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
  ```

- [ ] Create Firebase initialization file:
  - File: `src/config/firebase.js`
  - Import Firebase modules
  - Initialize Firebase app with config from env variables
  - Initialize and export: `auth`, `db` (Firestore), `realtimeDb`, `storage`
  - Enable Firestore offline persistence

**Create Local Store:**
- [ ] File: `src/stores/localStore.js`
- [ ] Create Zustand store with:
  - `pendingMessages: {}` (object keyed by conversationId)
  - `drafts: {}` (object keyed by conversationId)
  - `addPendingMessage(conversationId, message)`
  - `removePendingMessage(conversationId, messageId)`
  - `setDraft(conversationId, text)`
  - `clearDraft(conversationId)`

**Create Presence Store:**
- [ ] File: `src/stores/presenceStore.js`
- [ ] Create Zustand store with:
  - `presenceData: {}` (object keyed by userId)
  - `updatePresence(userId, presenceObj)`
  - `setAllPresence(presenceMap)`
  - Helper function: `isUserOnline(userId)`

**Create Firebase Store:**
- [ ] File: `src/stores/firebaseStore.js`
- [ ] Create Zustand store with:
  - `currentUser: null`
  - `users: []`
  - `usersMap: {}`
  - `conversations: []`
  - `conversationsMap: {}`
  - `messages: {}` (keyed by conversationId)
  - `setCurrentUser(user)`
  - `setUsers(users)` (also creates usersMap)
  - `setConversations(conversations)` (also creates conversationsMap)
  - `setMessages(conversationId, messages)`
  - `addMessage(conversationId, message)`
  - `updateMessageStatus(conversationId, messageId, status)`

**Test Firebase Connection:**
- [ ] In `App.js`, import firebase config
- [ ] Add console.log to verify Firebase initialized
- [ ] Run app, check console for Firebase initialization message
- [ ] No errors in console

**Create Utility Functions:**
- [ ] File: `src/utils/helpers.js`
- [ ] Function: `generateId()` - generates unique message/conversation IDs
- [ ] Function: `formatTimestamp(timestamp)` - formats timestamps for display

**Files Created:**
- `src/config/firebase.js`
- `src/stores/localStore.js`
- `src/stores/presenceStore.js`
- `src/stores/firebaseStore.js`
- `src/utils/helpers.js`

**Files Modified:**
- `.env`
- `App.js` (test Firebase connection)

**Test Before Merge:**
- [ ] Firebase initializes without errors
- [ ] All three Zustand stores are accessible
- [ ] Can import stores in components
- [ ] No console errors
- [ ] App still runs on phone

---

## PR #3: Authentication (Signup & Login)
**Goal**: Implement email/password authentication with Firebase Auth

### Subtasks

**Create Auth Screens:**
- [ ] File: `src/screens/SignupScreen.js`
  - Email TextInput
  - Password TextInput (with secure entry)
  - Confirm Password TextInput
  - "Sign Up" Button
  - "Already have an account? Log In" link
  - Error message display (Text component)
  - Use basic React Native styling

- [ ] File: `src/screens/LoginScreen.js`
  - Email TextInput
  - Password TextInput (with secure entry)
  - "Log In" Button
  - "Don't have an account? Sign Up" link
  - Error message display
  - Use basic React Native styling

**Implement Auth Functions:**
- [ ] File: `src/utils/auth.js`
- [ ] Function: `signUpUser(email, password)`
  - Use `createUserWithEmailAndPassword` from Firebase Auth
  - Return user object or throw error
  
- [ ] Function: `signInUser(email, password)`
  - Use `signInWithEmailAndPassword` from Firebase Auth
  - Return user object or throw error
  
- [ ] Function: `signOutUser()`
  - Use `signOut` from Firebase Auth
  - Clear Firebase store: `useFirebaseStore.getState().setCurrentUser(null)`

**Connect Auth to UI:**
- [ ] In `SignupScreen.js`:
  - Add state for email, password, confirmPassword, error
  - Validate passwords match
  - Call `signUpUser` on button press
  - On success: Navigate to ProfileSetupScreen (create next PR)
  - On error: Display error message
  
- [ ] In `LoginScreen.js`:
  - Add state for email, password, error
  - Call `signInUser` on button press
  - On success: Navigate to Home screen
  - On error: Display error message

**Setup Navigation:**
- [ ] File: `src/navigation/AppNavigator.js`
- [ ] Import `NavigationContainer`, `createNativeStackNavigator`
- [ ] Create stack navigator with two stacks:
  - Auth Stack: SignupScreen, LoginScreen
  - Main Stack: (empty for now, will add Home screen later)
- [ ] Conditionally render based on `currentUser` from firebaseStore
- [ ] If no currentUser → show Auth Stack
- [ ] If currentUser exists → show Main Stack

**Auth State Listener:**
- [ ] In `App.js`:
- [ ] Import `onAuthStateChanged` from Firebase Auth
- [ ] Set up listener in useEffect:
  ```javascript
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        useFirebaseStore.getState().setCurrentUser(user)
      } else {
        useFirebaseStore.getState().setCurrentUser(null)
      }
    })
    return unsubscribe
  }, [])
  ```

**Update App.js:**
- [ ] Replace default App content with `<AppNavigator />`
- [ ] Wrap with any necessary providers (if needed)

**Test Authentication Flow:**
- [ ] Sign up with new email/password
- [ ] Verify account created in Firebase console (Authentication section)
- [ ] Log out
- [ ] Log in with same credentials
- [ ] Test validation (password mismatch, invalid email, etc.)
- [ ] Test error messages display correctly

**Files Created:**
- `src/screens/SignupScreen.js`
- `src/screens/LoginScreen.js`
- `src/utils/auth.js`
- `src/navigation/AppNavigator.js`

**Files Modified:**
- `App.js`
- `src/stores/firebaseStore.js` (if any auth-related state needed)

**Test Before Merge:**
- [ ] Can sign up with new account
- [ ] Account appears in Firebase console
- [ ] Can log in with credentials
- [ ] Can log out
- [ ] Navigation switches between Auth and Main stacks
- [ ] Error messages display correctly
- [ ] App persists auth state (reload app while logged in stays logged in)

---

## PR #4: Profile Setup & User Creation in Firestore
**Goal**: Allow users to complete their profile after signup and create user document in Firestore

### Subtasks

**Create Profile Setup Screen:**
- [ ] File: `src/screens/ProfileSetupScreen.js`
- [ ] UI Components:
  - Header: "Complete Your Profile"
  - Username TextInput (lowercase, no spaces, unique)
  - Display Name TextInput (can have spaces)
  - Bio TextInput (multiline, optional, placeholder: "Tell us about yourself")
  - Status Picker/Dropdown ("Available", "Busy", "Away")
  - "Upload Photo" Button (optional, can skip)
  - "Continue" Button
  - "Skip" link (for photo and bio)

**Install Image Picker:**
- [ ] Install expo-image-picker:
  ```bash
  npx expo install expo-image-picker
  ```

**Implement Image Upload:**
- [ ] In `ProfileSetupScreen.js`:
- [ ] Import `* as ImagePicker from 'expo-image-picker'`
- [ ] Function: `pickImage()`
  - Request permissions: `ImagePicker.requestMediaLibraryPermissionsAsync()`
  - Launch image picker: `ImagePicker.launchImageLibraryAsync()`
  - Options: `allowsEditing: true`, `aspect: [1, 1]`, `quality: 0.8`
  - Store selected image URI in state

**Create User Profile Functions:**
- [ ] File: `src/utils/userProfile.js`
- [ ] Function: `createUserProfile(userId, profileData)`
  - Takes: userId, username, displayName, bio, status, imageURL (optional)
  - Creates document in Firestore: `/users/{userId}`
  - Include fields: userId, username, displayName, email, imageURL, bio, status, createdAt, lastEdit
  - Return created user object

- [ ] Function: `uploadProfilePhoto(userId, imageUri)`
  - Convert image URI to blob
  - Upload to Firebase Storage: `profile_photos/${userId}/${Date.now()}.jpg`
  - Get download URL
  - Return imageURL

- [ ] Function: `checkUsernameAvailability(username)`
  - Query Firestore users collection where username === input
  - Return true if available, false if taken

**Connect Profile Setup to Signup:**
- [ ] In `SignupScreen.js`:
  - After successful `signUpUser`, navigate to `ProfileSetupScreen`
  - Pass userId via navigation params

- [ ] In `ProfileSetupScreen.js`:
  - Get userId from navigation params or Firebase auth
  - On "Continue" button:
    - Validate username (no spaces, lowercase, not empty)
    - Check username availability
    - If photo selected, call `uploadProfilePhoto`
    - Call `createUserProfile` with all data
    - Update Firebase store with current user
    - Navigate to Home screen

**Create Realtime Database Presence on Profile Creation:**
- [ ] File: `src/utils/presence.js`
- [ ] Function: `initializePresence(userId)`
  - Write to Realtime Database: `/presence/{userId}`
  - Set: `{ isOnline: true, lastSeen: serverTimestamp() }`
  - Setup onDisconnect: `{ isOnline: false, lastSeen: serverTimestamp() }`

- [ ] Call `initializePresence` after profile creation in `ProfileSetupScreen.js`

**Add Loading States:**
- [ ] In `ProfileSetupScreen.js`:
  - Show loading indicator while uploading photo
  - Show loading indicator while creating profile
  - Disable "Continue" button while processing

**Files Created:**
- `src/screens/ProfileSetupScreen.js`
- `src/utils/userProfile.js`
- `src/utils/presence.js`

**Files Modified:**
- `src/screens/SignupScreen.js`
- `src/navigation/AppNavigator.js` (add ProfileSetupScreen)

**Test Before Merge:**
- [ ] Sign up new account → lands on ProfileSetupScreen
- [ ] Can enter username, displayName, bio
- [ ] Can select profile photo from device
- [ ] Photo uploads to Firebase Storage (check in Firebase console)
- [ ] User document created in Firestore (check in Firebase console)
- [ ] Presence entry created in Realtime Database (check in Firebase console)
- [ ] After setup, navigates to Home screen
- [ ] Username validation works (no spaces, not empty)
- [ ] Can skip photo and bio (optional fields)

---

## PR #5: User List & Presence Tracking
**Goal**: Display all users with real-time online/offline status from Realtime Database

### Subtasks

**Create Home Screen (User List):**
- [ ] File: `src/screens/HomeScreen.js`
- [ ] UI Components:
  - Header with app title
  - Current user profile icon (top-right, tap to view profile)
  - Sign out icon (top-right)
  - FlatList to display all users
  - Each list item:
    - Circular profile photo (or placeholder if no photo)
    - Display name
    - Online indicator (green dot) or "Last seen X mins ago"
    - Tap item → navigate to Chat screen

**Fetch Users from Firestore:**
- [ ] In `HomeScreen.js`, useEffect on mount:
- [ ] Query Firestore `/users` collection
- [ ] Use `getDocs` to fetch all users
- [ ] Store in Firebase store: `useFirebaseStore.getState().setUsers(users)`
- [ ] Filter out current user from display

**Listen to Presence from Realtime Database:**
- [ ] In `src/utils/presence.js`:
- [ ] Function: `listenToAllPresence()`
  - Use `onValue` listener on `/presence`
  - On data change, update Presence store:
    ```javascript
    usePresenceStore.getState().setAllPresence(presenceData)
    ```
  - Return unsubscribe function

- [ ] In `HomeScreen.js`, useEffect on mount:
  - Call `listenToAllPresence()`
  - Return cleanup function to unsubscribe

**Update Presence on App State:**
- [ ] Install app state listener:
  ```bash
  # Already included in React Native
  ```
- [ ] In `App.js` or `HomeScreen.js`:
- [ ] Import `AppState` from 'react-native'
- [ ] Set up AppState listener:
  - When app goes to background → update presence (isOnline: false)
  - When app returns to foreground → update presence (isOnline: true)
  - Update lastSeen every 60 seconds while app is active

**Create User List Item Component:**
- [ ] File: `src/components/UserListItem.js`
- [ ] Props: user, onPress
- [ ] Display:
  - Profile photo (use Image component with imageURL)
  - Display name
  - Online indicator from Presence store
    ```javascript
    const presenceData = usePresenceStore(s => s.presenceData[user.userId])
    const isOnline = presenceData?.isOnline || false
    ```
  - If offline, show "Last seen X mins ago" (calculate from lastSeen timestamp)
- [ ] OnPress: call onPress(user)

**Format Last Seen Timestamp:**
- [ ] In `src/utils/helpers.js`:
- [ ] Function: `formatLastSeen(timestamp)`
  - If less than 1 minute: "Just now"
  - If less than 60 minutes: "X mins ago"
  - If less than 24 hours: "X hours ago"
  - Otherwise: "X days ago"

**Sort Users (Online First):**
- [ ] In `HomeScreen.js`:
- [ ] When rendering FlatList, sort users:
  - Online users first
  - Then offline users by lastSeen (most recent first)

**Add Sign Out Functionality:**
- [ ] In `HomeScreen.js`:
- [ ] Add sign out button to header
- [ ] On press: call `signOutUser()` from auth utils
- [ ] Update presence to offline before signing out

**Add Navigation to AppNavigator:**
- [ ] In `src/navigation/AppNavigator.js`:
- [ ] Add HomeScreen to Main Stack
- [ ] Add ChatScreen placeholder (will build in next PR)

**Handle Profile Photo Placeholder:**
- [ ] Create placeholder for users without photos
- [ ] Use user's initials in colored circle (or generic avatar icon)

**Files Created:**
- `src/screens/HomeScreen.js`
- `src/components/UserListItem.js`

**Files Modified:**
- `src/utils/presence.js`
- `src/utils/helpers.js`
- `src/navigation/AppNavigator.js`
- `App.js` (AppState listener)

**Test Before Merge:**
- [ ] Home screen shows list of all users (except current user)
- [ ] Online users show green dot
- [ ] Offline users show "Last seen..." with correct time
- [ ] Users sorted correctly (online first)
- [ ] Profile photos display correctly
- [ ] Placeholder shows for users without photos
- [ ] Open app on second device → first device shows as online
- [ ] Close app on second device → first device shows as offline (within 1 min)
- [ ] Sign out works and returns to login screen

---

## PR #6: One-on-One Messaging - Basic Chat UI
**Goal**: Create chat screen and implement basic message display (no sending yet)

### Subtasks

**Create Chat Screen:**
- [ ] File: `src/screens/ChatScreen.js`
- [ ] UI Components:
  - Header:
    - Back button (navigate to Home)
    - Other user's photo, name, online status
  - Message list (FlatList, inverted)
  - Message input bar (bottom):
    - TextInput (multiline)
    - Send button (disabled for now)

**Create Message Bubble Component:**
- [ ] File: `src/components/MessageBubble.js`
- [ ] Props: message, isCurrentUser
- [ ] Display:
  - Message text
  - Timestamp (below message)
  - Align right if current user, left if other user
  - Different background color for current user vs other user
  - Rounded corners (bubble style)

**Create Conversation on User Tap:**
- [ ] In `HomeScreen.js`:
- [ ] When user taps another user:
  - Generate conversationId (deterministic for 1-on-1):
    ```javascript
    const conversationId = [currentUserId, otherUserId].sort().join('_')
    ```
  - Check if conversation exists in Firestore
  - If not, create conversation document:
    ```javascript
    {
      conversationId,
      participants: [currentUserId, otherUserId],
      participantUsernames: [currentUsername, otherUsername],
      isGroup: false,
      lastMessage: '',
      lastMessageSenderId: '',
      lastMessageTimestamp: null,
      createdAt: serverTimestamp(),
      lastEdit: serverTimestamp()
    }
    ```
  - Navigate to ChatScreen with params: `{ conversationId, otherUser }`

**Fetch Messages from Firestore:**
- [ ] In `ChatScreen.js`:
- [ ] Get conversationId from navigation params
- [ ] useEffect on mount:
  - Set up Firestore listener on `/conversations/{conversationId}/messages`
  - Order by timestamp (ascending)
  - Use `onSnapshot` for real-time updates
  - Store messages in Firebase store:
    ```javascript
    useFirebaseStore.getState().setMessages(conversationId, messages)
    ```
  - Return cleanup function to unsubscribe

**Display Messages:**
- [ ] In `ChatScreen.js`:
- [ ] Get messages from Firebase store:
  ```javascript
  const messages = useFirebaseStore(s => s.messages[conversationId] || [])
  ```
- [ ] Render FlatList:
  - Inverted (so new messages appear at bottom)
  - Use MessageBubble component for each item
  - KeyExtractor: message.messageId

**Display Header with Other User Info:**
- [ ] In `ChatScreen.js`:
- [ ] Get otherUser from navigation params
- [ ] Display otherUser's photo, displayName
- [ ] Get online status from Presence store:
  ```javascript
  const presenceData = usePresenceStore(s => s.presenceData[otherUser.userId])
  const isOnline = presenceData?.isOnline || false
  ```
- [ ] Show "Online" or "Last seen X mins ago"

**Create Placeholder Messages for Testing:**
- [ ] Manually add 2-3 messages in Firebase console (Firestore)
- [ ] Collection: `/conversations/{conversationId}/messages`
- [ ] Add test messages with different senders
- [ ] Verify they appear in ChatScreen

**Files Created:**
- `src/screens/ChatScreen.js`
- `src/components/MessageBubble.js`

**Files Modified:**
- `src/screens/HomeScreen.js`
- `src/navigation/AppNavigator.js` (add ChatScreen)

**Test Before Merge:**
- [ ] Tap user in Home screen → navigates to Chat screen
- [ ] Chat header shows other user's info and online status
- [ ] Messages display correctly (if any exist)
- [ ] Message bubbles styled correctly (left/right alignment, colors)
- [ ] Timestamps display below messages
- [ ] Back button returns to Home screen
- [ ] Test with placeholder messages in Firestore

---

## PR #7: Message Sending with 3-Store Architecture
**Goal**: Implement sending messages with optimistic updates and status tracking (sending → sent → delivered)

### Subtasks

**Implement Send Message Function:**
- [ ] File: `src/utils/messaging.js`
- [ ] Function: `sendMessage(conversationId, text, senderId, senderUsername)`
  - Generate messageId with `generateId()`
  - Create message object for LOCAL store (status: "sending")
  - Add to LOCAL store:
    ```javascript
    useLocalStore.getState().addPendingMessage(conversationId, {
      messageId,
      senderId,
      senderUsername,
      text,
      timestamp: Date.now(),
      status: 'sending'
    })
    ```
  - Write to Firestore:
    ```javascript
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId,
      senderUsername,
      text,
      timestamp: serverTimestamp(),
      status: 'sent'
    })
    ```
  - Remove from LOCAL store after Firestore confirms
  - Update conversation's lastMessage fields
  - Catch errors: if write fails, message stays in LOCAL store with "sending" status

**Connect Send Button to Function:**
- [ ] In `ChatScreen.js`:
- [ ] Add state for input text: `const [inputText, setInputText] = useState('')`
- [ ] Enable send button when inputText is not empty
- [ ] On send button press:
  - Call `sendMessage(conversationId, inputText, currentUserId, currentUsername)`
  - Clear input: `setInputText('')`

**Merge LOCAL + FIREBASE Messages:**
- [ ] In `ChatScreen.js`:
- [ ] Get pending messages from LOCAL store:
  ```javascript
  const pendingMessages = useLocalStore(s => s.pendingMessages[conversationId] || [])
  ```
- [ ] Get confirmed messages from FIREBASE store:
  ```javascript
  const confirmedMessages = useFirebaseStore(s => s.messages[conversationId] || [])
  ```
- [ ] Merge for display:
  ```javascript
  const allMessages = [...pendingMessages, ...confirmedMessages]
  ```
- [ ] Sort by timestamp

**Add Message Status Indicators:**
- [ ] In `MessageBubble.js`:
- [ ] If message is from current user, show status icon:
  - "sending": Gray clock icon or "..." animation
  - "sent": Single checkmark ✓
  - "delivered": Double checkmark ✓✓
  - "read": Blue double checkmark ✓✓ (bonus, implement later)
- [ ] Position status icon at bottom-right of message bubble

**Handle Delivered Status Update:**
- [ ] In `ChatScreen.js`, in the onSnapshot listener:
- [ ] When a new message is added and it's not from current user:
  - Update message status to "delivered":
    ```javascript
    await updateDoc(messageRef, { status: 'delivered' })
    ```

**Update Firebase Store on Status Changes:**
- [ ] In `ChatScreen.js`, in the onSnapshot listener:
- [ ] When message is modified (status changed):
  - Update message in FIREBASE store:
    ```javascript
    useFirebaseStore.getState().updateMessageStatus(
      conversationId,
      messageId,
      newStatus
    )
    ```

**Handle Keyboard Behavior:**
- [ ] Import `KeyboardAvoidingView` from React Native
- [ ] Wrap ChatScreen content in KeyboardAvoidingView:
  - `behavior="padding"` (iOS) or `behavior="height"` (Android)
  - `keyboardVerticalOffset` to account for header

**Auto-Scroll to Bottom:**
- [ ] In `ChatScreen.js`:
- [ ] Use FlatList ref
- [ ] When new message arrives, scroll to end:
  ```javascript
  flatListRef.current?.scrollToEnd({ animated: true })
  ```

**Test with Firestore Offline Persistence:**
- [ ] Turn on airplane mode
- [ ] Send 3 messages → all show "sending" status
- [ ] Turn off airplane mode
- [ ] Messages sync to Firestore (status: "sent")
- [ ] Verify in Firebase console

**Files Created:**
- `src/utils/messaging.js`

**Files Modified:**
- `src/screens/ChatScreen.js`
- `src/components/MessageBubble.js`
- `src/stores/localStore.js` (if any adjustments needed)
- `src/stores/firebaseStore.js` (if any adjustments needed)

**Test Before Merge:**
- [ ] Can type message and tap send button
- [ ] Message appears instantly with "sending" status
- [ ] Status changes to "sent ✓" after Firestore confirms
- [ ] Open second device as other user → message appears
- [ ] Second device marks message as "delivered ✓✓"
- [ ] First device sees status update to "delivered"
- [ ] Offline test: send messages in airplane mode → sync when reconnected
- [ ] Keyboard doesn't cover input field
- [ ] FlatList auto-scrolls to new messages

---

## PR #8: Profile Screen & Edit Profile
**Goal**: Allow users to view and edit their own profile

### Subtasks

**Create Profile Screen:**
- [ ] File: `src/screens/ProfileScreen.js`
- [ ] UI Components:
  - Large circular profile photo at top
  - "Change Photo" button (below photo)
  - Display Name (editable TextInput)
  - Username (non-editable Text, gray color)
  - Email (non-editable Text, gray color)
  - Bio (editable TextInput, multiline)
  - Status picker/dropdown (Available, Busy, Away)
  - "Save Changes" Button
  - "Sign Out" Button (bottom, red color)

**Navigate to Profile Screen:**
- [ ] In `HomeScreen.js`:
- [ ] Add profile icon