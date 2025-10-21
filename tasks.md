# Messaging App - Implementation Task List

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

- [x] Install Node.js (v18 or later) from nodejs.org
- [x] Verify installation: `node --version` and `npm --version`
- [x] Install Expo CLI globally: `npm install -g expo-cli`

**Create Expo Project:**

- [x] ✅ Expo project created with blank template
- [x] ✅ Verify project structure exists in root directory:
  ```
  Week 2 - Mobile Messaging App/
  ├── App.js              ← Expo entry point (already exists)
  ├── index.js            ← Expo wrapper (already exists)
  ├── package.json        ← Project config (already exists)
  ├── app.json            ← Expo config (already exists)
  ├── .gitignore          ← Git ignore file (already exists)
  ├── assets/             ← Images folder (already exists)
  ├── node_modules/       ← Will be created after npm install
  └── src/                ← CREATE THIS - your code goes here
      ├── screens/
      ├── components/
      ├── stores/
      ├── config/
      ├── utils/
      └── navigation/
  ```

**Install Expo Go on Phone:**

- [x] Download "Expo Go" app from App Store (iOS) or Google Play (Android)
- [x] Open Expo Go and create account (or sign in)

**Test Development Workflow:**

- [x] In terminal, run: `npx expo start`
- [x] Scan QR code with phone camera (iOS) or in Expo Go app (Android)
- [x] App should load on your phone
- [x] Edit `App.js` - change text to "Hello Messaging App"
- [x] Save file and verify change appears on phone (hot reload)

**Install Core Dependencies:**

- [x] Make sure you're in the root directory (where App.js is)
- [x] Install Firebase:
  ```bash
  npm install firebase
  ```
- [x] Install Zustand:
  ```bash
  npm install zustand
  ```
- [x] Install React Navigation:
  ```bash
  npm install @react-navigation/native @react-navigation/native-stack
  npx expo install react-native-screens react-native-safe-area-context
  ```

**Project Structure Setup:**

- [x] Create folder structure (run these commands in PowerShell from root directory):

  ```powershell
  # Create all directories
  New-Item -ItemType Directory -Path src
  New-Item -ItemType Directory -Path src\screens
  New-Item -ItemType Directory -Path src\components
  New-Item -ItemType Directory -Path src\stores
  New-Item -ItemType Directory -Path src\config
  New-Item -ItemType Directory -Path src\utils
  New-Item -ItemType Directory -Path src\navigation

  # Create empty files
  New-Item -ItemType File -Path src\stores\localStore.js
  New-Item -ItemType File -Path src\stores\presenceStore.js
  New-Item -ItemType File -Path src\stores\firebaseStore.js
  New-Item -ItemType File -Path src\config\firebase.js
  New-Item -ItemType File -Path src\navigation\AppNavigator.js
  New-Item -ItemType File -Path src\utils\helpers.js
  ```

  Final structure:

  ```
  src/
  ├── screens/           (empty folder for now)
  ├── components/        (empty folder for now)
  ├── stores/
  │   ├── localStore.js
  │   ├── presenceStore.js
  │   └── firebaseStore.js
  ├── config/
  │   └── firebase.js
  ├── utils/
  │   └── helpers.js
  └── navigation/
      └── AppNavigator.js
  ```

**Environment Variables:**

- [x] Create `.env` file in root directory (will add Firebase keys later)

  ```bash
  # Windows PowerShell:
  New-Item .env -ItemType File

  # Or manually create .env file in root
  ```

- [x] ✅ `.env*` is already in `.gitignore` (line 33)
- [x] Note: Expo uses `EXPO_PUBLIC_` prefix for environment variables (no need for dotenv package)

**Git Setup:**

- [x] ✅ Git already initialized (`.git` folder exists)
- [x] ✅ `.gitignore` exists and includes all necessary patterns:
  ```
  .env* (line 33)
  node_modules/ (line 49)
  .expo/ (line 52)
  *.jks, *.p8, *.p12, *.key, *.mobileprovision (lines 60-64)
  ```
- [x] Commit PR #1 changes when complete:
  ```bash
  git add .
  git commit -m "PR #1: React Native setup and environment configuration"
  ```

**Documentation:**

- [x] Update existing `README.md` with project information:
  - Project name: "Mobile Messaging App"
  - Description: Real-time messaging app with Firebase and AI features
  - Prerequisites: Node.js v18+, Expo Go app on phone
  - How to run: `npx expo start`
  - How to test: Scan QR code with phone camera (iOS) or Expo Go app (Android)
  - Folder structure: Explain src/ directory organization
  - Firebase setup instructions (add in PR #2)

**Files to Create:**

- `src/` folder and all subfolders (screens/, components/, stores/, config/, utils/, navigation/)
- `src/stores/localStore.js` (empty file for now, will implement in PR #2)
- `src/stores/presenceStore.js` (empty file for now, will implement in PR #2)
- `src/stores/firebaseStore.js` (empty file for now, will implement in PR #2)
- `src/config/firebase.js` (empty file for now, will implement in PR #2)
- `src/navigation/AppNavigator.js` (empty file for now, will implement in PR #3)
- `src/utils/helpers.js` (empty file for now, will implement in PR #2)
- `.env` file (empty for now, will add keys in PR #2)

**Files Already Exist:**

- ✅ `App.js`, `package.json`, `app.json`, `.gitignore`, `README.md`

**Test Before Merge:**

- [x] `npx expo start` runs without errors
- [x] Can scan QR code and see app on phone
- [x] Hot reload works (edit App.js, see changes on phone)
- [x] All dependencies installed successfully
- [x] No console errors in terminal or Expo Go app

---

## PR #2: Firebase Configuration & Zustand Stores

**Goal**: Set up Firebase project and create the 3-store Zustand architecture

### Subtasks

**Create Firebase Project:**

- [x] Go to https://console.firebase.google.com
- [x] Click "Add project"
- [x] Name it (e.g., "messaging-app-prod")
- [x] Disable Google Analytics (optional for MVP)
- [x] Wait for project to be created

**Enable Firebase Services:**

- [x] In Firebase console, go to "Authentication"
- [x] Click "Get Started"
- [x] Enable "Email/Password" sign-in method
- [x] Go to "Firestore Database"
- [x] Click "Create database"
- [x] Start in "test mode" (we'll add rules later)
- [x] Choose region: us-central1 (Iowa)
- [x] Go to "Realtime Database"
- [x] Click "Create database"
- [x] Start in "test mode"
- [x] Go to "Storage"
- [x] Click "Get Started"
- [x] Start in "test mode"

**Get Firebase Configuration:**

- [x] In Firebase console, click gear icon → Project settings
- [x] Scroll to "Your apps" section
- [x] Click "Web" icon (</>) to add web app
- [x] Register app (name it "messaging-app")
- [x] Copy the Firebase config object

**Configure Firebase in App:**

- [x] Add Firebase config to `.env`:

  ```
  EXPO_PUBLIC_FIREBASE_API_KEY=your_key
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
  EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_id
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
  EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
  ```

- [x] Create Firebase initialization file:
  - File: `src/config/firebase.js`
  - Import Firebase modules
  - Initialize Firebase app with config from env variables
  - Initialize and export: `auth`, `db` (Firestore), `realtimeDb`, `storage`
  - Enable Firestore offline persistence (50MB cache)

**Create Local Store:**

- [x] File: `src/stores/localStore.js`
- [x] Create Zustand store with:
  - `pendingMessages: {}` (object keyed by conversationId)
  - `drafts: {}` (object keyed by conversationId)
  - `addPendingMessage(conversationId, message)`
  - `removePendingMessage(conversationId, messageId)`
  - `setDraft(conversationId, text)`
  - `clearDraft(conversationId)`

**Create Presence Store:**

- [x] File: `src/stores/presenceStore.js`
- [x] Create Zustand store with:
  - `presenceData: {}` (object keyed by userId)
  - `updatePresence(userId, presenceObj)`
  - `setAllPresence(presenceMap)`
  - Helper function: `isUserOnline(userId)`

**Create Firebase Store:**

- [x] File: `src/stores/firebaseStore.js`
- [x] Create Zustand store with:
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

- [x] In `App.js`, import firebase config
- [x] Add console.log to verify Firebase initialized
- [x] Run app, check console for Firebase initialization message
- [x] No errors in console

**Create Utility Functions:**

- [x] File: `src/utils/helpers.js`
- [x] Function: `generateId()` - generates unique message/conversation IDs
- [x] Function: `formatTimestamp(timestamp)` - formats timestamps for display
- [x] Added bonus functions: formatLastSeen, formatMessageTime, validation helpers, avatar helpers

**Files Created:**

- `src/config/firebase.js` ✅
- `src/stores/localStore.js` ✅
- `src/stores/presenceStore.js` ✅
- `src/stores/firebaseStore.js` ✅
- `src/utils/helpers.js` ✅

**Files Modified:**

- `.env` ✅
- `App.js` (test Firebase connection) ✅

**Test Before Merge:**

- [x] Firebase initializes without errors
- [x] All three Zustand stores are accessible
- [x] Can import stores in components
- [x] No console errors
- [x] App still runs on phone

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
        useFirebaseStore.getState().setCurrentUser(user);
      } else {
        useFirebaseStore.getState().setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);
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
    usePresenceStore.getState().setAllPresence(presenceData);
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
    const presenceData = usePresenceStore((s) => s.presenceData[user.userId]);
    const isOnline = presenceData?.isOnline || false;
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
    const conversationId = [currentUserId, otherUserId].sort().join("_");
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
    useFirebaseStore.getState().setMessages(conversationId, messages);
    ```
  - Return cleanup function to unsubscribe

**Display Messages:**

- [ ] In `ChatScreen.js`:
- [ ] Get messages from Firebase store:
  ```javascript
  const messages = useFirebaseStore((s) => s.messages[conversationId] || []);
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
  const presenceData = usePresenceStore(
    (s) => s.presenceData[otherUser.userId]
  );
  const isOnline = presenceData?.isOnline || false;
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

- [x] Tap user in Home screen → navigates to Chat screen
- [x] Chat header shows other user's info and online status
- [x] Messages display correctly (if any exist)
- [x] Message bubbles styled correctly (left/right alignment, colors)
- [x] Timestamps display below messages
- [x] Back button returns to Home screen
- [x] Test with placeholder messages in Firestore

---

## PR #7: Message Sending with 3-Store Architecture

**Goal**: Implement sending messages with optimistic updates and status tracking (sending → sent → delivered)

### Subtasks

**Implement Send Message Function (Firebase-Native Approach):**

- [ ] **1.** File: `src/utils/conversation.js` (used instead of messaging.js)
- [ ] **2.** Function: `sendMessage(conversationId, text, senderId, senderUsername)`
  - **Simplified**: Just write to Firestore directly
  - Firebase's local cache handles optimistic updates automatically
  - Write to Firestore:
    ```javascript
    const messageRef = await addDoc(
      collection(db, "conversations", conversationId, "messages"),
      {
        senderId,
        senderUsername,
        text,
        timestamp: serverTimestamp(),
        status: "sent", // Server-confirmed status
      }
    );
    ```
  - Update conversation's lastMessage fields
  - Return messageRef for reference
  - No need to manually track pending state - Firebase does it!

**Connect Send Button to Function:**

- [ ] **3.** In `ChatScreen.js`:
- [ ] **4.** Using Zustand drafts for input text (keep this pattern)
- [ ] **5.** Enable send button when inputText is not empty
- [ ] **6.** On send button press:
  - Call `sendMessage(conversationId, inputText, currentUserId, currentUsername)`
  - Clear input via `clearDraft(conversationId)`
  - Message appears instantly via Firebase's local cache
  - Status determined by `hasPendingWrites` metadata

**Set Up Firebase Listener with Metadata Changes:**

- [ ] **7.** In `ChatScreen.js`:
- [ ] **8.** Set up onSnapshot listener with `{ includeMetadataChanges: true }`
- [ ] **9.** This option enables tracking of local writes vs server-confirmed writes
- [ ] **10.** Map messages from snapshot:
  ```javascript
  const messages = snapshot.docs.map((doc) => ({
    messageId: doc.id,
    ...doc.data(),
    // hasPendingWrites: true = local write (sending)
    // hasPendingWrites: false = server confirmed (sent)
    status: doc.metadata.hasPendingWrites
      ? "sending"
      : doc.data().status || "sent",
  }));
  ```
- [ ] **11.** Store directly in firebaseStore - no merging needed!

**Add Message Status Indicators:**

- [ ] **12.** In `MessageBubble.js`:
- [ ] **13.** If message is from current user, show status icon:
  - "sending": Clock emoji 🕐
  - "sent": Single checkmark ✓
  - "delivered": Double checkmark ✓✓
  - "read": Blue double checkmark ✓✓ (for future PR)
- [ ] **14.** Position status icon at bottom-right of message bubble with timestamp

**Handle Delivered Status Update:**

- [ ] **15.** In `ChatScreen.js`, in the onSnapshot listener:
- [ ] **16.** When a new message is added and it's not from current user:
  - Update message status to "delivered" in Firestore
  - Uses `docChanges()` to detect new messages
  - Only marks as delivered if status is currently "sent"

**Update Firebase Store on Status Changes:**

- [ ] **17.** `updateMessageStatus` function exists in firebaseStore
- [ ] **18.** Messages automatically update in store via onSnapshot listener
- [ ] **19.** Status changes propagate to UI in real-time

**Handle Keyboard Behavior:**

- [x] **20.** Import `KeyboardAvoidingView` from React Native
- [x] **21.** Wrap ChatScreen content in KeyboardAvoidingView
- [x] **22.** Platform-specific behavior: "padding" for iOS, undefined for Android
- [x] **23.** `keyboardVerticalOffset={90}` for iOS header compensation

**Auto-Scroll to Bottom:**

- [ ] **24.** In `ChatScreen.js`:
- [ ] **25.** Use FlatList ref
- [ ] **26.** Scroll to end on content size change and layout
- [ ] **27.** Scroll to end after sending message (with 100ms delay for smooth animation)

**Use Firebase's Built-in Optimistic Updates (hasPendingWrites):**

> **Architectural Decision**: Firebase Firestore has built-in optimistic updates with offline persistence. We don't need a separate pendingMessages array - Firebase handles this automatically through its local cache and metadata tracking.

- [ ] **28. Remove pendingMessages from localStore**

  - Delete `pendingMessages` state from `src/stores/localStore.js`
  - Delete `addPendingMessage` and `removePendingMessage` actions
  - Keep `drafts`, `isSending`, and `isLoadingConversation` (these are still useful)

- [ ] **29. Update conversation.js sendMessage function**

  - Simplify to just write to Firestore directly
  - No need to add to localStore first
  - Firebase's local cache handles optimistic updates automatically
  - Return the message document reference

  ```javascript
  export async function sendMessage(
    conversationId,
    text,
    senderId,
    senderUsername
  ) {
    // Just write to Firestore - that's it!
    const messageRef = await addDoc(
      collection(db, "conversations", conversationId, "messages"),
      {
        senderId,
        senderUsername,
        text,
        timestamp: serverTimestamp(),
        status: "sent", // Will be "sent" once confirmed by server
      }
    );

    // Update conversation's lastMessage
    await updateDoc(doc(db, "conversations", conversationId), {
      lastMessage: text,
      lastMessageSenderId: senderId,
      lastMessageTimestamp: serverTimestamp(),
      lastEdit: serverTimestamp(),
    });

    return messageRef;
  }
  ```

- [ ] **30. Update ChatScreen onSnapshot listener**

  - Add `{ includeMetadataChanges: true }` option to onSnapshot
  - This enables tracking of local vs server-confirmed writes
  - Map messages and check `doc.metadata.hasPendingWrites` to determine status

  ```javascript
  useEffect(() => {
    if (!conversationId) return;

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    // includeMetadataChanges: true is the key!
    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            messageId: doc.id,
            ...data,
            // Use Firebase metadata to determine status
            status: doc.metadata.hasPendingWrites
              ? "sending"
              : data.status || "sent",
          };
        });

        // Just set messages directly - no merging needed!
        setMessages(conversationId, messages);
      }
    );

    return unsubscribe;
  }, [conversationId]);
  ```

- [ ] **31. Update ChatScreen handleSend**

  - Remove all localStore pendingMessages logic
  - Just call sendMessage and let Firebase handle optimistic updates
  - Clear draft after sending

  ```javascript
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    clearDraft(conversationId);

    try {
      await sendMessage(
        conversationId,
        textToSend,
        currentUser.uid,
        currentUser.username
      );
      // That's it! Firebase handles the rest.
      // Message appears instantly in onSnapshot with hasPendingWrites: true
      // Then updates to hasPendingWrites: false when server confirms
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore draft on error
      setDraft(conversationId, textToSend);
    }
  };
  ```

- [ ] **32. Benefits of Firebase's Built-in Approach**
  - ✅ No duplicate messages or flickering
  - ✅ No manual deduplication needed
  - ✅ Single source of truth (Firebase cache)
  - ✅ Automatic offline queueing (Firebase handles it)
  - ✅ Simpler code (less logic to maintain)
  - ✅ Messages appear once and update in place
  - ✅ Status tracking built-in (hasPendingWrites)
  - ✅ Firebase's offline persistence works seamlessly

**Test with Firestore Offline Persistence:**

- [ ] **33.** Turn on airplane mode
- [ ] **34.** Send 3 messages → all show "sending" status (hasPendingWrites: true)
- [ ] **35.** Turn off airplane mode
- [ ] **36.** Messages automatically sync to Firestore (Firebase handles queue)
- [ ] **37.** Status updates from "sending" to "sent" (hasPendingWrites: false)
- [ ] **38.** Verify in Firebase console

**Note on Persistence:**

> Firebase's offline persistence is built-in and enabled by default (configured in `firebase.js`). Messages written while offline are automatically queued and synced when connection is restored. No additional code needed!

**Files Created:**

- `src/components/CompactInput.js` (design system component for chat input)
- Note: Using `src/utils/conversation.js` instead of separate messaging.js file

**Files Modified:**

- `src/screens/ChatScreen.js` - Added delivered status tracking, CompactInput
- `src/components/MessageBubble.js` - Status indicators
- `src/stores/localStore.js` - Added UI state (isSending, isLoadingConversation)
- `src/stores/firebaseStore.js` - updateMessageStatus already existed
- `src/screens/HomeScreen.js` - Current user no longer clickable
- `src/components/UserListItem.js` - "You" badge, disabled state for current user

**Test Before Merge:**

- [ ] Can type message and tap send button
- [ ] Message appears instantly with "sending" status (🕐)
- [ ] Status changes to "sent ✓" after Firestore confirms
- [ ] Open second device as other user → message appears
- [ ] Second device marks message as "delivered ✓✓"
- [ ] First device sees status update to "delivered"
- [ ] Offline test: send messages in airplane mode → sync when reconnected
- [ ] Keyboard doesn't cover input field
- [ ] FlatList auto-scrolls to new messages
- [ ] Draft messages persist when navigating away and back
- [ ] Current user visible in user list but not clickable (shows "You" badge)

---

## PR #8: Profile Screen & Edit Profile

**Goal**: Allow users to view and edit their own profile

### Subtasks

**Create Profile Screen:**

1. Create file: `src/screens/ProfileScreen.js`

2. Add UI Components:

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

3. In `src/screens/HomeScreen.js`:
   - Add profile icon to header (top-right)
   - On tap, navigate to ProfileScreen

**Pre-fill Current User Data:**

4. In `ProfileScreen.js`:
   - Get currentUser from Firebase store
   - Pre-fill all fields with current user data
   - Use state to track edits (useState for each field)

**Implement Change Photo:**

5. In `ProfileScreen.js`:
   - "Change Photo" button calls `pickImage()` (import from expo-image-picker)
   - Show loading indicator while uploading
   - Call `uploadProfilePhoto(userId, imageUri)` from userProfile utils
   - Update imageURL in Firestore
   - Update local state and Firebase store with new imageURL

**Implement Save Changes:**

6. In `ProfileScreen.js`:

   - On "Save Changes" button press:
     - Validate displayName not empty
     - Update Firestore user document with new values:
       ```javascript
       await updateDoc(doc(db, "users", userId), {
         displayName,
         bio,
         status,
         lastEdit: serverTimestamp(),
       });
       ```
     - Update Firebase store with new data
     - Show success message or toast

7. Also update Firebase Auth displayName:
   ```javascript
   await updateProfile(auth.currentUser, { displayName });
   ```

**Implement Sign Out:**

8. In `ProfileScreen.js`:

   - "Sign Out" button calls `signOutUser()` from auth utils

9. Before signing out, update presence to offline:

   ```javascript
   await set(ref(realtimeDb, `presence/${userId}`), {
     isOnline: false,
     lastSeen: serverTimestamp(),
   });
   ```

10. Navigate to Login screen after sign out

**Add Loading States:**

11. Show loading indicator while saving changes

12. Disable "Save Changes" button while processing

13. Show loading indicator while uploading photo

**Add to Navigation:**

14. In `src/navigation/AppNavigator.js`:
    - Add ProfileScreen to Main Stack

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

1. Create file: `src/screens/CreateGroupScreen.js`

2. Add UI Components:
   - Header: "Create Group"
   - Group Name TextInput
   - "Add Group Photo" Button (optional)
   - Section title: "Select Participants"
   - FlatList of all users with checkboxes
   - Selected count display: "3 selected"
   - "Create Group" Button (bottom)

**Multi-Select User List:**

3. In `CreateGroupScreen.js`:

   - Add state to track selected user IDs: `const [selectedUsers, setSelectedUsers] = useState([])`

4. Render all users (except current user) with checkboxes

5. Toggle selection on checkbox tap

6. Add validation: Minimum 2 users required to create group

**Implement Create Group:**

7. In `src/utils/messaging.js`:

   - Add function: `createGroupConversation(groupName, participantIds, groupImageURL)`

8. Inside `createGroupConversation`:

   - Generate conversationId (auto-generated)
   - Add current user to participants
   - Get usernames for all participants from Firebase store

9. Create conversation document in Firestore:

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

10. Return conversationId

**Connect Create Button:**

11. In `CreateGroupScreen.js`:

    - On "Create Group" button press:
      - Validate group name not empty
      - Validate at least 2 users selected

12. If group photo selected, upload it first (to Firebase Storage)

13. Call `createGroupConversation` with group data

14. Navigate to ChatScreen with new conversationId

**Update ChatScreen for Groups:**

15. In `src/screens/ChatScreen.js`:

    - Detect if conversation is group:
      ```javascript
      const conversation = useFirebaseStore(
        (s) => s.conversationsMap[conversationId]
      );
      const isGroup = conversation?.isGroup || false;
      ```

16. If group, update header to show:
    - Group name instead of user name
    - Participant count (e.g., "3 members")
    - Tap header → navigate to GroupInfoScreen

**Update MessageBubble for Groups:**

17. In `src/components/MessageBubble.js`:

    - Add prop: `isGroup` and `senderUsername`

18. If group and message is from another user:
    - Show sender's name above message
    - Use different colors for different senders (optional)

**Update Message Sending for Groups:**

19. Verify `sendMessage` function in `src/utils/messaging.js` works for both 1-on-1 and groups
    - Should already work without changes
    - Messages go to same subcollection structure

**Update Delivered Status for Groups:**

20. In `ChatScreen.js`:
    - For groups, mark as "delivered" when current user receives
    - (Advanced: track delivered status per user - optional for MVP)

**Create Group Info Screen:**

21. Create file: `src/screens/GroupInfoScreen.js`

22. Add UI Components:
    - Group photo (large, circular)
    - Group name (editable TextInput for creator, read-only for others)
    - Participants section title
    - List of participants (with photos and names)
    - "Add Participants" Button (for future)
    - "Leave Group" Button (bottom, red)

**Implement Leave Group:**

23. In `GroupInfoScreen.js`:

    - "Leave Group" button:
      - Remove current user from participants array in Firestore
      - Update conversation document

24. Navigate back to Home screen after leaving

**Add Navigation:**

25. In `src/navigation/AppNavigator.js`:
    - Add CreateGroupScreen to Main Stack
    - Add GroupInfoScreen to Main Stack

**Add "Create Group" Button to Home Screen:**

26. In `src/screens/HomeScreen.js`:

    - Add floating action button (FAB) or header button for "Create Group"

27. On tap, navigate to CreateGroupScreen

**Update Conversations List (Optional Enhancement):**

28. In `src/screens/HomeScreen.js`:

    - Fetch user's conversations from Firestore
    - Display both 1-on-1 and group conversations

29. For each conversation:
    - Show group icon for group chats
    - Display last message preview
    - Display timestamp of last message

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
- [ ] Can select multiple users (checkboxes work)
- [ ] Can enter group name
- [ ] Can upload group photo (optional, can skip)
- [ ] "Create Group" creates conversation in Firestore (verify in console)
- [ ] Navigates to ChatScreen with new group
- [ ] Can send messages in group
- [ ] All group members receive messages
- [ ] Sender names display above messages (for others' messages)
- [ ] Can tap header to view Group Info screen
- [ ] Can leave group (removes from participants in Firestore)
- [ ] Group appears in Home screen with other conversations

---

## PR #10: Push Notifications Setup

**Goal**: Implement push notifications for new messages

### Subtasks

**Install Expo Notifications:**

1. Install package:
   ```bash
   npx expo install expo-notifications
   ```

**Request Notification Permissions:**

2. Create file: `src/utils/notifications.js`

3. Add function: `registerForPushNotifications()`

   - Request permissions using Expo Notifications API
   - Get Expo push token
   - Return token

4. In `src/screens/HomeScreen.js` or `App.js`:

   - On app start (after login), call `registerForPushNotifications()`

5. Save push token to Firestore user document:
   ```javascript
   await updateDoc(doc(db, "users", userId), {
     pushToken: token,
   });
   ```

**Set Up Firebase Cloud Functions:**

6. Install Firebase CLI globally (if not already installed):

   ```bash
   npm install -g firebase-tools
   ```

7. Login to Firebase:

   ```bash
   firebase login
   ```

8. Initialize Cloud Functions in your project root:

   ```bash
   firebase init functions
   ```

9. Select your Firebase project

10. Choose JavaScript (not TypeScript for simplicity)

11. Install dependencies when prompted

**Create Cloud Function for Notifications:**

12. Open file: `functions/index.js`

13. Import required modules:

    ```javascript
    const functions = require("firebase-functions");
    const admin = require("firebase-admin");
    admin.initializeApp();
    ```

14. Create function: `sendMessageNotification`

    - Trigger: onCreate in `/conversations/{convId}/messages/{msgId}`

15. Inside the function:

    - Get the new message data from snapshot
    - Get conversation document to find recipients
    - Get recipients' user documents to retrieve push tokens
    - Filter out sender from recipients
    - Only send notifications if recipients have push tokens

16. Send notification via Expo push API:

    ```javascript
    const messages = pushTokens.map((token) => ({
      to: token,
      sound: "default",
      title: senderUsername,
      body: messageText,
      data: { conversationId, type: "new_message" },
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    ```

**Deploy Cloud Function:**

17. Deploy to Firebase:

    ```bash
    firebase deploy --only functions
    ```

18. Verify function appears in Firebase console (Functions section)

19. Check function logs in Firebase console to debug if needed

**Handle Notification Tap:**

20. In `App.js`:

    - Set up notification response listener:
      ```javascript
      useEffect(() => {
        const subscription =
          Notifications.addNotificationResponseReceivedListener((response) => {
            const { conversationId } =
              response.notification.request.content.data;
            // Navigate to ChatScreen with conversationId
            // Use navigation ref or context
          });
        return () => subscription.remove();
      }, []);
      ```

21. Create navigation reference in App.js to allow navigation from listener

**Test Notifications:**

22. Close app completely on device A (not just background, fully quit)

23. Send message from device B

24. Verify device A receives notification on lock screen

25. Tap notification → verify app opens to correct conversation

**Handle Notifications While App is Open:**

26. In `App.js`:

    - Set up foreground notification handler:
      ```javascript
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      ```

27. Test: Send message while app is open → should show in-app notification

**Handle Notification Permissions Edge Cases:**

28. If user denies permissions:

    - Show message explaining notifications won't work
    - Provide button to open settings (optional)

29. Save permission status to avoid repeatedly asking

**Files Created:**

- `src/utils/notifications.js`
- `functions/index.js` (Cloud Function)
- `functions/package.json` (auto-created by firebase init)

**Files Modified:**

- `App.js`
- Firestore users schema (add pushToken field)

**Test Before Merge:**

- [ ] App requests notification permission on first launch (after login)
- [ ] Permission dialog shows correctly
- [ ] Push token saved to Firestore user document (verify in console)
- [ ] Close app on device A completely
- [ ] Send message from device B
- [ ] Device A receives notification on lock screen
- [ ] Notification shows sender name and message preview
- [ ] Tap notification → opens correct conversation
- [ ] Notifications work for both 1-on-1 and group chats
- [ ] If app is open, notification shows as in-app alert (not lock screen)
- [ ] Cloud Function logs show successful execution (check Firebase console)

---

## PR #11: AI Agent Integration - Basic

**Goal**: Integrate Vercel AI SDK for basic chat assistant

### Subtasks

**Install Vercel AI SDK:**

1. Install packages:
   ```bash
   npm install ai openai
   ```

**Add OpenAI API Key:**

2. In `.env` file:

   ```
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Restart Expo server after adding env variable

**Create AI Service:**

4. Create file: `src/utils/aiService.js`

5. Import OpenAI:

   ```javascript
   import OpenAI from "openai";
   ```

6. Initialize OpenAI client:

   ```javascript
   const openai = new OpenAI({
     apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
   });
   ```

7. Add function: `sendToAI(prompt, conversationHistory = [])`

8. Inside `sendToAI`:

   - Create messages array with system prompt and conversation history
   - Call OpenAI chat completions API:
     ```javascript
     const response = await openai.chat.completions.create({
       model: "gpt-4",
       messages: [
         { role: "system", content: "You are a helpful assistant." },
         ...conversationHistory,
         { role: "user", content: prompt },
       ],
       stream: false,
     });
     ```

9. Return response content:

   ```javascript
   return response.choices[0].message.content;
   ```

10. Add error handling (try/catch) with user-friendly error message

**Create AI Chat Screen:**

11. Create file: `src/screens/AIChatScreen.js`

12. Structure similar to ChatScreen but simplified:

    - Header shows "AI Assistant" instead of user name
    - No online status indicator
    - Messages from AI have robot icon or different avatar

13. Add state for messages:
    ```javascript
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    ```

**Implement AI Message Flow:**

14. In `AIChatScreen.js`:

    - When user sends message:
      - Add user message to messages array immediately

15. Set loading state: `setIsLoading(true)`

16. Show "AI is typing..." indicator at bottom of message list

17. Build conversation history from messages array:

    ```javascript
    const history = messages.map((msg) => ({
      role: msg.isAI ? "assistant" : "user",
      content: msg.text,
    }));
    ```

18. Call `sendToAI(inputText, history)`

19. Add AI response to messages array:

    ```javascript
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        text: aiResponse,
        isAI: true,
        timestamp: Date.now(),
      },
    ]);
    ```

20. Set loading state: `setIsLoading(false)`

21. Clear input field

22. Store conversation in LOCAL state only (not Firestore for MVP)

**Style AI Messages Differently:**

23. In `src/components/MessageBubble.js` or create new `AIMessageBubble.js`:
    - Different background color for AI messages
    - Add robot icon or AI badge
    - Align left (like received messages)

**Add Navigation to AI Chat:**

24. In `src/navigation/AppNavigator.js`:
    - Add AIChatScreen to Main Stack

**Add AI Chat Button:**

25. In `src/screens/HomeScreen.js`:

    - Add "Chat with AI" button to header or as menu item

26. On tap, navigate to AIChatScreen

**Handle Streaming (Optional - Skip for MVP):**

27. If time permits later, implement streaming:
    - Set `stream: true` in OpenAI request
    - Display response word by word as it arrives
    - More complex, save for post-MVP

**Add Error Handling:**

28. Show error message if OpenAI API fails

29. Allow user to retry failed message

30. Handle network errors gracefully

**Files Created:**

- `src/utils/aiService.js`
- `src/screens/AIChatScreen.js`

**Files Modified:**

- `.env`
- `src/screens/HomeScreen.js`
- `src/navigation/AppNavigator.js`
- `src/components/MessageBubble.js` (optional, for AI styling)

**Test Before Merge:**

- [ ] Can navigate to AI Chat screen from Home
- [ ] Can type and send messages to AI
- [ ] "AI is typing..." indicator shows while waiting
- [ ] AI responds with relevant answers
- [ ] AI messages display with different styling (robot icon, different color)
- [ ] Conversation history maintained within session
- [ ] Can have multi-turn conversation (AI remembers context)
- [ ] Error handling works (test by using invalid API key)
- [ ] Messages display correctly (user vs AI)
- [ ] Scroll behavior works correctly

---

## PR #12: AI Agent Advanced Features & Final Polish

**Goal**: Add conversation summaries, smart replies, and final UI polish

### Subtasks

**Implement Conversation Summary:**

1. In `src/utils/aiService.js`:

   - Add function: `summarizeConversation(messages)`

2. Inside `summarizeConversation`:

   - Take last 50 messages from conversation (or all if less than 50)
   - Format as string with sender names and text

3. Create prompt:

   ```javascript
   "Summarize the following conversation in 2-3 sentences:\n\n" +
     formattedMessages;
   ```

4. Call OpenAI API with summary prompt

5. Return summary text

**Add Summary Button to Chat:**

6. In `src/screens/ChatScreen.js`:

   - Add "Summarize" button to header menu (three dots icon)

7. On tap:

   - Show loading indicator
   - Get messages from Firebase store

8. Call `summarizeConversation(messages)`

9. Display summary in modal or alert dialog

10. Add "Close" button to dismiss modal

**Implement Smart Replies:**

11. In `src/utils/aiService.js`:

    - Add function: `generateSmartReplies(lastMessage, conversationContext)`

12. Inside `generateSmartReplies`:

    - Create prompt: "Generate 3 short, natural reply suggestions (5-10 words each) for the message: '{lastMessage}'"
    - Include last 3-5 messages as context

13. Call OpenAI API

14. Parse response into array of 3 reply options

15. Return array of strings

**Add Smart Reply Chips to Chat:**

16. In `src/screens/ChatScreen.js`:

    - Add state: `const [smartReplies, setSmartReplies] = useState([])`

17. When new message received from other user:

    - Call `generateSmartReplies(lastMessage, recentMessages)`
    - Store in smartReplies state

18. Display 3 reply chips/buttons above input bar:

    - Horizontal scrollable row
    - Rounded pill-shaped buttons
    - Each shows one reply option

19. On chip tap:

    - Populate input field with reply text
    - Clear smart replies (or keep them for quick send)

20. Clear smart replies when user types their own message

**Make AI Context-Aware:**

21. Update `sendToAI` function in `aiService.js`:

    - Add optional parameter for conversation context
    - Include last 10 messages from actual conversation

22. Create function: `getAIResponseForConversation(prompt, conversationMessages)`
    - Format conversation messages for context
    - Call OpenAI with context
    - AI can reference the conversation

**Add AI to Any Conversation (Optional):**

23. In `src/screens/ChatScreen.js`:

    - Add "Ask AI" button in header or input bar

24. On tap:

    - Show modal/dialog for AI query
    - User types question about the conversation

25. Get AI response with full conversation as context

26. Display AI response in modal (not as message in chat)

**Final UI Polish:**

27. Consistent styling across all screens:

    - Same color scheme
    - Same button styles
    - Same text input styles
    - Same header styles

28. Add smooth animations:

    - Screen transitions
    - Modal/dialog animations
    - Message send animations
    - Typing indicator animations

29. Loading states for all async operations:

    - Message sending
    - Image uploading
    - Profile saving
    - AI responses
    - Conversation loading

30. Error handling with user-friendly messages:

    - Network errors
    - Firebase errors
    - AI errors
    - Image upload errors

31. Empty states:

    - No messages in conversation: "No messages yet. Say hi!"
    - No users online: "No users online right now"
    - No conversations: "Start a conversation by tapping a user"

32. Polish message bubbles:

    - Better padding and spacing
    - Subtle shadows
    - Rounded corners
    - Max width for long messages

33. Add message timestamps:

    - Group messages by date (Today, Yesterday, date)
    - Show time for each message on tap or always visible

34. Improve keyboard handling:

    - Smooth keyboard appearance
    - Input bar stays above keyboard
    - Auto-scroll when keyboard opens

35. Add pull-to-refresh on Home screen:
    - Refresh user list
    - Update presence data
    - Reload conversations

**Performance Optimization:**

36. Optimize FlatList rendering:

    - Use `getItemLayout` if fixed height messages
    - Add `windowSize` prop
    - Use `maxToRenderPerBatch`

37. Memoize components:

    - Wrap MessageBubble in React.memo
    - Wrap UserListItem in React.memo
    - Use useMemo for expensive calculations

38. Optimize image loading:

    - Add image placeholders while loading
    - Compress images before upload
    - Cache images properly

39. Reduce unnecessary re-renders:
    - Use useCallback for functions passed as props
    - Optimize Zustand selectors (select only what's needed)

**Add Message Features (Time Permitting):**

40. Long press message for options menu:

    - Copy text
    - Delete (local only, not from Firestore)

41. Copy message text to clipboard

42. Timestamp display:

    - Show full timestamp on tap
    - Or always visible in smaller text

43. Read receipts:
    - Mark messages as "read" when conversation viewed
    - Update status in Firestore
    - Show blue checkmarks for read messages

**Testing & Bug Fixes:**

44. Test all features end-to-end on physical device

45. Test with 3+ devices simultaneously:

    - All receive messages
    - Presence updates correctly
    - Notifications work for all

46. Test offline scenarios:

    - Send messages in airplane mode
    - Turn off/on WiFi
    - Verify queued messages send
    - Verify presence updates correctly

47. Test push notifications in various states:

    - App completely closed
    - App in background
    - App in foreground
    - Multiple notifications

48. Test AI features with edge cases:

    - Very long prompts
    - Empty prompts
    - API errors
    - Network timeouts

49. Fix any bugs discovered during testing

50. Polish any rough UI edges

**Create Demo Video:**

51. Record screen on physical device

52. Demo in 3-5 minutes showing:

    - Sign up and profile creation (30 seconds)
    - User list with presence indicators (15 seconds)
    - Sending messages with status indicators (30 seconds)
    - Offline message queuing (30 seconds)
    - Group chat creation and messaging (45 seconds)
    - Push notifications (show notification arriving) (20 seconds)
    - AI chat features (summary, smart replies) (60 seconds)
    - Profile editing (20 seconds)

53. Add voiceover or captions explaining features

54. Export video in high quality

**Documentation:**

55. Update `README.md` with:

    - Complete setup instructions
    - Prerequisites (Node, Expo CLI, Expo Go app)
    - How to add Firebase config to `.env`
    - How to add OpenAI key to `.env`
    - How to run: `npx expo start`
    - How to test on phone (scan QR code)
    - Feature list (bullet points)
    - Screenshots of main screens

56. Create `ARCHITECTURE.md` file:

    - Explain 3-store Zustand architecture
    - Explain message status flow (sending → sent → delivered → read)
    - Explain presence tracking with Realtime Database
    - Explain offline support
    - Include diagrams or code examples

57. Add code comments to complex sections:

    - 3-store interactions
    - Message status updates
    - Presence tracking logic
    - AI service functions

58. Document any known limitations or future improvements

**Deploy Production Build:**

59. Install EAS CLI (Expo Application Services):

    ```bash
    npm install -g eas-cli
    ```

60. Login to Expo account:

    ```bash
    eas login
    ```

61. Configure EAS build:

    ```bash
    eas build:configure
    ```

62. Build for iOS (if you have Mac/iOS):

    ```bash
    eas build --platform ios
    ```

63. Build for Android:

    ```bash
    eas build --platform android
    ```

64. Wait for builds to complete (can take 10-30 minutes)

65. Download APK (Android) or IPA (iOS) from Expo dashboard

66. Test production build on physical devices:

    - Install APK on Android device
    - Install IPA on iOS device (requires TestFlight or enterprise cert)

67. Verify all features work in production build:
    - Sometimes features work in Expo Go but not in production
    - Test notifications especially

**Final Cleanup:**

68. Remove any console.logs used for debugging

69. Remove any commented-out code

70. Format code consistently (use Prettier if available)

71. Check for any TODO comments and address them

72. Verify `.env` is in `.gitignore`

73. Verify no sensitive data in code (API keys, Firebase config should be in .env)

74. Make final Git commit with all changes

**Files Created:**

- `ARCHITECTURE.md`
- Demo video file (mp4)
- Screenshots folder with app screenshots

**Files Modified:**

- `src/utils/aiService.js`
- `src/screens/ChatScreen.js`
- `src/screens/AIChatScreen.js`
- All screen files (UI polish)
- All component files (optimization)
- `README.md`

**Test Before Merge:**

- [ ] Conversation summary works correctly
- [ ] Summary shows in modal with correct content
- [ ] Smart replies generate appropriate suggestions
- [ ] Smart reply chips display above input bar
- [ ] Tapping smart reply populates input
- [ ] AI is context-aware in conversations
- [ ] All UI elements polished and consistent
- [ ] Animations smooth and not jarring
- [ ] Loading states show for all async operations
- [ ] Error messages display user-friendly text
- [ ] Empty states show helpful messages
- [ ] No performance issues or lag when scrolling
- [ ] Images load smoothly with placeholders
- [ ] Pull-to-refresh works on Home screen
- [ ] All error scenarios handled gracefully
- [ ] App works on both iOS and Android (test both if possible)
- [ ] Production build installs and runs correctly
- [ ] All features work in production build
- [ ] Demo video covers all features clearly
- [ ] Documentation is complete and accurate
- [ ] No console errors or warnings

---

## Summary

**Post-MVP (Day 3-5):**

- PR #8: Profile editing
- PR #9: Group chats
- PR #10: Push notifications

**Final (Day 6-7):**

- PR #11: AI agent basics
- PR #12: Advanced AI features + polish

**Total Remaining PRs:** 5 (PR #8-12)

---

## Key Reminders

- **Test each PR thoroughly before moving to next**
- **Use physical devices for testing notifications**
- **Test presence updates with multiple devices**
- **Test offline mode after PR #8**
- **Cloud Functions deployment can take a few tries - be patient**
- **Production builds are different from Expo Go - test both**
- **OpenAI API costs money - monitor usage**
- **Smart replies can be slow - add loading states**
- **Demo video is important - make it clear and engaging**

Good luck finishing the app! 🚀
