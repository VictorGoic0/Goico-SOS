# Messaging App - Implementation Task List

## Overview

Each PR represents a complete, testable feature. PRs build on each other sequentially. Test thoroughly with physical devices before merging each PR.

**Total PRs:** 11
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

- [x] **1.** File: `src/utils/conversation.js` (used instead of messaging.js)
- [x] **2.** Function: `sendMessage(conversationId, text, senderId, senderUsername)`
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

- [x] **3.** In `ChatScreen.js`:
- [x] **4.** Using Zustand drafts for input text (keep this pattern)
- [x] **5.** Enable send button when inputText is not empty
- [x] **6.** On send button press:
  - Call `sendMessage(conversationId, inputText, currentUserId, currentUsername)`
  - Clear input via `clearDraft(conversationId)`
  - Message appears instantly via Firebase's local cache
  - Status determined by `hasPendingWrites` metadata

**Set Up Firebase Listener with Metadata Changes:**

- [x] **7.** In `ChatScreen.js`:
- [x] **8.** Set up onSnapshot listener with `{ includeMetadataChanges: true }`
- [x] **9.** This option enables tracking of local writes vs server-confirmed writes
- [x] **10.** Map messages from snapshot:
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
- [x] **11.** Store directly in firebaseStore - no merging needed!

**Add Message Status Indicators:**

- [x] **12.** In `MessageBubble.js`:
- [x] **13.** If message is from current user, show status icon:
  - "sending": Clock emoji 🕐
  - "sent": Single checkmark ✓
  - "delivered": Double checkmark ✓✓
  - "read": Blue double checkmark ✓✓ (for future PR)
- [x] **14.** Position status icon at bottom-right of message bubble with timestamp

**Handle Delivered Status Update:**

- [x] **15.** In `ChatScreen.js`, in the onSnapshot listener:
- [x] **16.** When a new message is added and it's not from current user:
  - Update message status to "delivered" in Firestore
  - Uses `docChanges()` to detect new messages
  - Only marks as delivered if status is currently "sent"

**Update Firebase Store on Status Changes:**

- [x] **17.** `updateMessageStatus` function exists in firebaseStore
- [x] **18.** Messages automatically update in store via onSnapshot listener
- [x] **19.** Status changes propagate to UI in real-time

**Handle Keyboard Behavior:**

- [x] **20.** Import `KeyboardAvoidingView` from React Native
- [x] **21.** Wrap ChatScreen content in KeyboardAvoidingView
- [x] **22.** Platform-specific behavior: "padding" for iOS, undefined for Android
- [x] **23.** `keyboardVerticalOffset={90}` for iOS header compensation

**Auto-Scroll to Bottom:**

- [x] **24.** In `ChatScreen.js`:
- [x] **25.** Use FlatList ref
- [x] **26.** Scroll to end on content size change and layout
- [x] **27.** Scroll to end after sending message (with 100ms delay for smooth animation)

**Use Firebase's Built-in Optimistic Updates (hasPendingWrites):**

> **Architectural Decision**: Firebase Firestore has built-in optimistic updates with offline persistence. We don't need a separate pendingMessages array - Firebase handles this automatically through its local cache and metadata tracking.

- [x] **28. Remove pendingMessages from localStore**

  - Delete `pendingMessages` state from `src/stores/localStore.js`
  - Delete `addPendingMessage` and `removePendingMessage` actions
  - Keep `drafts`, `isSending`, and `isLoadingConversation` (these are still useful)

- [x] **29. Update conversation.js sendMessage function**

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

- [x] **30. Update ChatScreen onSnapshot listener**

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

- [x] **31. Update ChatScreen handleSend**

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

- [x] **32. Benefits of Firebase's Built-in Approach**
  - ✅ No duplicate messages or flickering
  - ✅ No manual deduplication needed
  - ✅ Single source of truth (Firebase cache)
  - ✅ Automatic offline queueing (Firebase handles it)
  - ✅ Simpler code (less logic to maintain)
  - ✅ Messages appear once and update in place
  - ✅ Status tracking built-in (hasPendingWrites)
  - ✅ Firebase's offline persistence works seamlessly

**Test with Firestore Offline Persistence:**

- [x] **33.** Turn on airplane mode
- [x] **34.** Send 3 messages → all show "sending" status (hasPendingWrites: true)
- [x] **35.** Turn off airplane mode
- [x] **36.** Messages automatically sync to Firestore (Firebase handles queue)
- [x] **37.** Status updates from "sending" to "sent" (hasPendingWrites: false)
- [x] **38.** Verify in Firebase console

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

- [x] Can type message and tap send button
- [x] Message appears instantly with "sending" status (🕐)
- [x] Status changes to "sent ✓" after Firestore confirms
- [x] Open second device as other user → message appears
- [x] Second device marks message as "delivered ✓✓"
- [x] First device sees status update to "delivered"
- [x] Offline test: send messages in airplane mode → sync when reconnected
- [x] Keyboard doesn't cover input field
- [x] FlatList auto-scrolls to new messages
- [x] Draft messages persist when navigating away and back
- [x] Current user visible in user list but not clickable (shows "You" badge)

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

- [x] Tap profile icon in Home screen → navigates to Profile screen
- [x] All fields pre-filled with current user data
- [x] Can change profile photo (uploads and displays new photo)
- [x] Can edit displayName and bio
- [x] Can change status
- [x] "Save Changes" updates Firestore and local state
- [x] Changes reflect immediately in UI
- [x] Changes visible in Home screen (if displayName changed)
- [x] Sign out works and returns to Login screen
- [x] Sign out updates presence to offline

---

## PR #9: Group Chats

**Goal**: Implement group chat creation and messaging

### Subtasks

**Add User Profile Preview to Direct Messages:**

- [x] 1. In `ChatScreen.js`, update header to show user's profile photo next to their display name for 1-on-1 chats
- [x] 2. Display circular profile photo (or placeholder with initials) in the header
- [x] 3. Ensure online/offline status indicator appears next to the profile photo

**Enable Web Support:**

- [x] 4. Install web dependencies:

  - Run: `npx expo install react-dom react-native-web`
  - Enables running app in browser for multi-device testing

- [x] 5. Start web server:

  - Run: `npm run web` or `expo start --web`
  - App will open in browser (typically at http://localhost:8081)

- [x] 6. Test multi-device messaging:
  - Keep phone app running via Expo Go
  - Open web version in browser
  - Send messages between devices to verify real-time sync

**Delete Conversation Feature:**

- [x] 7. Create utility function in `src/utils/conversation.js`:

  - Add function: `deleteConversation(conversationId)`
  - Delete all messages in the conversation subcollection
  - Delete the conversation document from Firestore
  - Handle errors gracefully

- [x] 8. In `HomeScreen.js`, add long-press/context menu to user list items:

  - Only show delete option if a conversation exists with that user
  - Check `conversationsMap` for existing conversation with user
  - Display menu with "Delete Conversation" option

  **Implementation:**

  - Added `conversationsMap` from global firebaseStore (instead of local state)
  - Created `handleUserLongPress(user)` function that checks if conversation exists
  - Uses `getConversationId(currentUser.uid, user.userId)` to determine conversation ID
  - Only shows alert if `conversationsMap[conversationId]` exists
  - Passes `onLongPress` prop to `UserListItem` component

  **Architectural Decision:**

  - Moved conversation listener from HomeScreen to AppNavigator (global)
  - Created `listenToConversations(userId)` utility in `conversation.js`
  - Follows same pattern as `listenToPresence()` for consistency
  - Stores full conversation data (not just IDs) in global store for future features (last message, timestamps, etc.)

- [x] 9. On delete tap from HomeScreen:

  - Show confirmation modal/alert: "Delete conversation with [username]?"
  - Include message: "This will delete all messages. You can message them again to start a new conversation."
  - Add "Cancel" and "Delete" buttons

  **Implementation:**

  - Uses React Native's `Alert.alert()` with custom title and message
  - Displays user's display name or username in confirmation
  - Two buttons: "Cancel" (style: "cancel") and "Delete" (style: "destructive")
  - Destructive button triggers `handleDeleteConversation(conversationId, user)`

- [x] 10. On confirmation, call `deleteConversation(conversationId)`

  - Show loading indicator while deleting
  - Navigate away or refresh list after deletion
  - Show success feedback (toast or brief message)

  **Implementation:**

  - `handleDeleteConversation` calls `deleteConversation(conversationId)` from utils
  - Sets `deletingConversationId` state to show loading indicator in UserListItem
  - UserListItem receives `isDeleting` prop and shows ActivityIndicator instead of chevron
  - Disables user interaction while deleting (disabled prop on TouchableOpacity)
  - Shows success Alert after deletion completes
  - Shows error Alert if deletion fails
  - Firestore listener automatically updates global store (no optimistic update needed)

  **Files Modified:**

  - `src/screens/HomeScreen.js` - Added delete handlers, consuming conversationsMap from global store
  - `src/components/UserListItem.js` - Added onLongPress, isDeleting props, loading indicator
  - `src/utils/conversation.js` - Added listenToConversations(userId) utility function
  - `src/navigation/AppNavigator.js` - Added conversations listener alongside presence listener

- [x] 11. In `ChatScreen.js`, add "Delete Conversation" button to header:

  - Button should always be visible (trash icon or text)
  - Disable button if no messages exist (0 messages)
  - Enable button only if 1 or more messages exist

  **Implementation:**

  - Added `isDeleting` state to track deletion in progress
  - Updated navigation header useEffect to include `headerRight` with delete button
  - Button shows trash emoji (🗑️) when active
  - Shows ActivityIndicator when `isDeleting` is true
  - Button disabled when no messages exist (`conversationMessages.length === 0`) or when deleting
  - Uses red background (`colors.error.main`) when enabled, gray when disabled
  - Dependencies include `conversationMessages.length` to re-render when messages change

- [x] 12. On delete button tap from ChatScreen:

  - Show confirmation modal/alert: "Delete this entire conversation?"
  - Include message: "This will permanently delete all messages. This cannot be undone."
  - Add "Cancel" and "Delete" buttons

  **Implementation:**

  - Created `handleDeleteConversation` function that shows Alert.alert confirmation
  - More severe message than HomeScreen version ("cannot be undone" vs "can message again")
  - Two buttons: "Cancel" and "Delete" (destructive style)
  - Delete button triggers async deletion flow

- [x] 13. On confirmation from ChatScreen:

  - Call `deleteConversation(conversationId)`
  - Show loading indicator while deleting
  - Navigate back to HomeScreen after successful deletion
  - Show success feedback

  **Implementation:**

  - Sets `isDeleting` to true before deletion (shows spinner in header button)
  - Calls `deleteConversation(conversationId)` utility function
  - Navigates back with `navigation.goBack()` immediately after successful deletion
  - Shows success Alert with setTimeout (300ms delay so it appears after navigation)
  - Error handling: resets `isDeleting` and shows error Alert if deletion fails
  - Firestore listener automatically cleans up global store

  **Files Modified:**

  - `src/screens/ChatScreen.js` - Added delete button to header, delete handler, loading state

- [x] 14. Update Firestore security rules (if needed):

  - Ensure users can delete their own conversations
  - Verify both participants can delete the conversation

  **Implementation:**

  - Created Firebase security rules for Firestore, Realtime Database, and Storage
  - Added comprehensive Firebase setup guide to README.md
  - Documented all rules with copy-paste instructions for Firebase Console
  - Rules ensure authenticated users can read all data, but only modify their own
  - Conversation participants can delete conversations
  - Message senders can delete their own messages

  **Files Modified:**

  - `README.md` - Added Firebase setup section, security rules, development workflow, and contributing guidelines

- [x] 15. Handle edge cases:

  - What happens if other user is viewing conversation while it's deleted
  - Handle deletion errors (network issues, permission errors)
  - Prevent double-deletion (disable button after first tap)

  **Implementation:**

  - Edge case handled: When other user is viewing conversation while it's deleted, messages disappear rapidly as Firestore listener detects deletions
  - Error handling: Already implemented in deleteConversation with try-catch and error alerts
  - Double-deletion prevented: Button disabled via isDeleting state during deletion process

**Create Group Chat Screen:**

- [x] 16. Create file: `src/screens/CreateGroupScreen.js`

- [x] 17. Add UI Components:

  - Header: "Create Group"
  - Group Name TextInput
  - "Add Group Photo" Button (optional)
  - Section title: "Select Participants"
  - FlatList of all users with checkboxes
  - Selected count display: "3 selected"
  - "Create Group" Button (bottom)

  **Implementation:**

  - Created complete CreateGroupScreen component with all required UI elements
  - Group name input with 50 character limit
  - "Add Group Photo" button (placeholder for image picker)
  - Section header showing "Select Participants" with dynamic selected count
  - FlatList rendering all users (except current user) with checkboxes
  - Selected count displays in real-time (e.g., "3 selected")
  - Create Group button fixed at bottom (disabled when name empty or < 2 users selected)
  - User items show avatar (or initials), display name, username
  - Checkbox UI with checkmark when selected (✓)
  - KeyboardAvoidingView for proper input behavior
  - ScrollView to handle long user lists
  - Loading state while fetching users
  - Empty state when no other users exist

  **Files Created:**

  - `src/screens/CreateGroupScreen.js` - Complete group creation UI

**Multi-Select User List:**

- [x] 18. In `CreateGroupScreen.js`:

  - Add state to track selected user IDs: `const [selectedUsers, setSelectedUsers] = useState([])`

  **Implementation:**

  - Added `selectedUsers` state initialized to empty array (line 28)
  - State tracks array of user IDs that are currently selected

- [x] 19. Render all users (except current user) with checkboxes

  **Implementation:**

  - Filter current user from list: `availableUsers = users.filter((user) => user.userId !== currentUser.uid)`
  - FlatList renders all available users with checkbox UI
  - Each user item shows avatar, display name, username, and checkbox
  - Checkbox shows checkmark (✓) when selected

- [x] 20. Toggle selection on checkbox tap

  **Implementation:**

  - `toggleUserSelection(userId)` function adds/removes user from selectedUsers array
  - Called on TouchableOpacity press for entire user item
  - If user is already selected, removes them; otherwise adds them
  - Visual feedback with checkbox state change

- [x] 21. Add validation: Minimum 2 users required to create group

  **Implementation:**

  - Create Group button disabled when: `!groupName.trim() || selectedUsers.length < 2`
  - Validates both group name (not empty) and minimum 2 participants
  - Button visually disabled until validation passes

**Implement Create Group:**

- [x] 22. In `src/utils/conversation.js`:

  - Add function: `createGroupConversation(groupName, participantIds, groupImageURL)`

- [x] 23. Inside `createGroupConversation`:

  - Generate conversationId (auto-generated by Firestore addDoc)
  - Add current user to participants
  - Get usernames for all participants from Firebase store

- [x] 24. Create conversation document in Firestore:

  ```javascript
  {
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

- [x] 25. Return conversationId (docRef.id)

**Connect Create Button:**

- [x] 26. In `CreateGroupScreen.js`:

  - On "Create Group" button press:
    - Validate group name not empty
    - Validate at least 2 users selected

- [x] 27. If group photo selected, upload it first (to Firebase Storage)

  **Implementation:**

  - Created `uploadGroupPhoto(conversationId, imageUri)` function in `conversation.js`
  - Uploads to correct path: `conversation-files/{conversationId}/group-photo.jpg`
  - Created `updateGroupConversation(conversationId, updates)` utility function
  - Accepts updates object with optional `groupName`, `imageUri`, or `groupImageURL`
  - Handles photo upload internally when `imageUri` provided
  - Automatically adds `lastEdit` timestamp
  - Fixed: Added missing `updateDoc` import to `conversation.js`

- [x] 28. Call `createGroupConversation` with group data

  **Implementation:**

  - Creates group conversation first without photo (to get conversationId)
  - Then calls `updateGroupConversation` to upload and attach photo
  - Two-step process: create → update with photo

- [x] 29. Navigate to ChatScreen with new conversationId

  **Implementation:**

  - Uses `navigation.replace()` to prevent going back to create screen
  - Passes `conversationId`, `isGroup: true`, and `groupName` params

**Update ChatScreen for Groups:**

- [x] 30. In `src/screens/ChatScreen.js`:

  - Detect if conversation is group:
    ```javascript
    const conversation = useFirebaseStore(
      (s) => s.conversationsMap[conversationId]
    );
    const isGroup = conversation?.isGroup || false;
    ```

- [x] 31. If group, update header to show:
  - Group name instead of user name
  - Participant count (e.g., "3 members")
    tasks.md file. - Tap header → navigate to GroupInfoScreen (prepared for future)

**Update MessageBubble for Groups:**

- [x] 32. In `src/components/MessageBubble.js`:

  - Add prop: `isGroup` (boolean to indicate if conversation is a group)
  - **DO NOT add senderUsername prop** - instead, access sender info via `usersMap`
  - Get `usersMap` from firebaseStore: `const usersMap = useFirebaseStore((s) => s.usersMap)`
  - Get sender object: `const sender = usersMap[message.senderId]`
  - Access sender.displayName, sender.username, sender.imageURL as needed

- [x] 33. If group AND message is from another user (not current user):

  - **Only render sender info for received messages in groups**
  - Show sender's small profile photo (24x24 circular) OR initials in colored circle
  - Show sender's display name (or username as fallback) above/beside message
  - Show message bubble below sender info
  - Layout: [Photo] [Name + Bubble] (left-aligned for received messages)

  **For 1-on-1 chats OR sent messages:**

  - Keep current rendering (just the bubble, no sender info)
  - Sent messages always right-aligned, received always left-aligned

  **Conditional rendering logic:**

  ```javascript
  // Show sender info only if:
  // 1. It's a group chat (isGroup === true)
  // 2. Message is from another user (!isSent)
  const showSenderInfo = isGroup && !isSent;
  ```

  **Implementation:**

  - Added `isGroup` prop to MessageBubble component
  - Gets `usersMap` from firebaseStore to access sender info
  - Added `showSenderInfo = isGroup && !isSent` conditional logic
  - Renders sender avatar (24x24 circular) with colored initials placeholder
  - Shows sender's displayName (or username fallback) above bubble
  - Created `bubbleWrapper` container for name + bubble
  - Updated ChatScreen to pass `isGroup` prop to MessageBubble
  - All existing 1-on-1 and sent message styling preserved
  - No linting errors

**Update Message Sending for Groups:**

- [x] 34. Verify `sendMessage` function in `src/utils/conversation.js` works for both 1-on-1 and groups
  - ✅ Verified: Works without changes
  - Messages go to same subcollection structure
  - Function uses conversationId regardless of isGroup flag

**Update Delivered Status for Groups:**

- [x] 35. In `ChatScreen.js`:
  - For groups, mark as "delivered" when current user receives
  - Already implemented: existing delivered status logic works for both 1-on-1 and groups
  - Messages marked as delivered when viewed, regardless of conversation type

**Create Group Info Screen:**

- [x] 36. Create file: `src/screens/GroupInfoScreen.js`

- [x] 37. Add UI Components:

  - Group photo (large, 120x120 circular) - tappable to change
  - Group name (editable TextInput) with 50 character limit
  - Participants section title with member count
  - List of participants (with photos and names)
  - "You" badge for current user
  - "Save Changes" Button (saves name and/or photo)
  - "Leave Group" Button (bottom, red, danger variant)

  **Implementation:**

  - Created GroupInfoScreen similar to CreateGroupScreen but for viewing/editing
  - Shows current group photo or placeholder (👥)
  - Allows editing group name and photo
  - Uses `updateGroupConversation` to save changes
  - Lists all participants with avatars and usernames
  - "Leave Group" button prepared (placeholder alert for now)
  - Added to AppNavigator as "GroupInfo" screen
  - Enabled header tap in ChatScreen for groups to navigate to GroupInfo
  - No linting errors

**Implement Leave Group:**

- [x] 38. In `GroupInfoScreen.js`:

  - "Leave Group" button:
    - Remove current user from participants array in Firestore
    - Update conversation document

  **Implementation:**

  - Created `leaveGroupConversation` function in `src/utils/conversation.js`
  - Uses Firestore's `arrayRemove` to remove user from participants array
  - Updates `lastEdit` timestamp
  - Added import for `arrayRemove` from firebase/firestore
  - In GroupInfoScreen, added `isLeaving` state for loading indicator
  - Shows confirmation alert before leaving
  - Alert displays group name and warning message

- [x] 39. Navigate back to Home screen after leaving

  **Implementation:**

  - Uses `navigation.reset()` to navigate to Home screen
  - Resets navigation stack to prevent going back to group chat
  - Leaves group → immediately returns to Home
  - Error handling shows alert if leave fails
  - Button shows "Leaving..." text and loading state while processing

**Add Navigation:**

- [x] 40. In `src/navigation/AppNavigator.js`:

  - ✅ CreateGroupScreen already added to Main Stack (completed in earlier tasks)
  - ✅ GroupInfoScreen already added to Main Stack (completed in task 37)

**Add "Create Group" Button to Home Screen:**

- [x] 41. In `src/screens/HomeScreen.js`:

  - ✅ Already implemented: floating action button in bottom right
  - Blue primary button with "Create Group" text
  - Includes shadow/elevation for material design effect

- [x] 42. On tap, navigate to CreateGroupScreen

  - ✅ Already implemented: `onPress={() => navigation.navigate("CreateGroup")}`
  - Button navigates correctly to CreateGroupScreen

**Update Conversations List (Optional Enhancement):**

- [x] 43. In `src/screens/HomeScreen.js`:

  - Fetch user's conversations from Firestore
  - Display both 1-on-1 and group conversations

  **Implementation:**

  - Added `conversations` from firebaseStore (already being listened to via `listenToConversations`)
  - Created `groupConversations` by filtering conversations where `isGroup === true`
  - Combined group conversations and users into a single `combinedList` with type markers
  - Groups appear first in the list, followed by users
  - Created `renderGroupConversation` function to display group items:
    - Shows group avatar (photo or 👥 placeholder with colored background)
    - Displays group name and member count
    - Includes "Group" badge for easy identification
    - Shows loading indicator when deleting
  - Added `handleGroupPress` to navigate to group chat
  - Added `handleGroupLongPress` to allow deleting groups
  - Updated `handleDeleteConversation` to handle both user and group deletions
  - Updated header subtitle to show count: "X groups • Y users"
  - Updated empty state message to be more generic
  - FlatList now uses `combinedList` with proper key extraction
  - All group conversations user is part of now display in HomeScreen
  - No linter errors

- [x] 44. For each conversation:

  - Show group icon for group chats (✅ Implemented above)
  - Display last message preview
  - Display timestamp of last message

  **Implementation:**

  **HomeScreen.js:**

  - Added `formatTimestamp` to imports from helpers
  - Updated `renderUser` to pass conversation data to UserListItem:
    - `lastMessage`, `lastMessageTimestamp`, `lastMessageSenderId`, `currentUserId`
  - Updated `renderGroupConversation` to display last message and timestamp:
    - Checks if `lastMessage` exists and is not empty
    - Handles Firestore timestamp conversion (`.seconds` property)
    - Formats timestamp using `formatTimestamp` helper
    - Shows "You: " prefix for messages sent by current user
    - Falls back to member count if no messages exist
    - Displays timestamp in top right of group name row
    - Shows message preview below group name
  - Removed group badge in favor of message preview
  - Updated styles: Added `groupHeaderRow`, `timestamp`, `lastMessagePreview`

  **UserListItem.js:**

  - Added new props: `lastMessage`, `lastMessageTimestamp`, `lastMessageSenderId`, `currentUserId`
  - Added `formatTimestamp` to imports from helpers
  - Checks if conversation has messages (`hasConversation`)
  - Formats timestamp and message preview with "You: " prefix for sent messages
  - Updated rendering logic:
    - If conversation exists: Shows last message preview and timestamp
    - If no conversation: Shows username and presence/status (existing behavior)
  - Timestamp displays in nameRow, aligned to the right
  - Updated styles:
    - `displayName` now has `flex: 1` to allow timestamp alignment
    - Added `timestamp` style
    - Added `lastMessageText` style
  - No linter errors

  **Result:**

  - Both 1-on-1 conversations and group chats now show last message preview
  - Timestamps display in user-friendly format ("Just now", "5m ago", "Yesterday", etc.)
  - "You: " prefix indicates messages sent by current user
  - For group chats: Shows sender's display name/username for messages from others (e.g., "Alice: message")
  - For 1-on-1 chats: No sender prefix for received messages (redundant with avatar/name display)
  - Falls back gracefully when no messages exist
  - Consistent styling across group and user conversations

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

- [x] Can navigate to Create Group screen
- [x] Can select multiple users (checkboxes work)
- [x] Can enter group name
- [x] Can upload group photo (optional, can skip)
- [x] "Create Group" creates conversation in Firestore (verify in console)
- [x] Navigates to ChatScreen with new group
- [x] Can send messages in group
- [x] All group members receive messages
- [x] Sender names display above messages (for others' messages)
- [x] Can tap header to view Group Info screen
- [x] Can leave group (removes from participants in Firestore)
- [x] Group appears in Home screen with other conversations
- [x] Last message preview shows with sender name for groups
- [x] Timestamps display correctly

**✅ PR #9: Group Chats - COMPLETE AND TESTED!**

---

## PR #10: Push Notifications Setup

**Goal**: Implement push notifications for new messages

### Subtasks

**Install Expo Notifications:**

- [x] 1. Install package:
  ```bash
  npx expo install expo-notifications
  ```

**Request Notification Permissions:**

- [x] 2. Create file: `src/utils/notifications.js`

- [x] 3. Add function: `registerForPushNotifications()`

  - Request permissions using Expo Notifications API
  - Get Expo push token
  - Return token

  **Implementation:**

  - Created `src/utils/notifications.js` with complete notification handling
  - `registerForPushNotifications()` function:
    - Checks if running on physical device (required for push notifications)
    - Requests notification permissions from user
    - Gets Expo push token using `Notifications.getExpoPushTokenAsync()`
    - Sets up Android notification channel for proper notification display
    - Returns token or null if failed
  - Added `setNotificationHandler` to configure foreground notification behavior
  - Added helper functions: `addNotificationReceivedListener` and `addNotificationResponseListener`
  - Includes error handling and logging
  - **Note**: Need to install `expo-device` package: `npx expo install expo-device`
  - **Note**: Replace `"your-project-id"` in the code with actual Expo project ID

- [x] 4. In `src/screens/HomeScreen.js` or `App.js`:

  - On app start (after login), call `registerForPushNotifications()`

- [x] 5. Save push token to Firestore user document:

  ```javascript
  await updateDoc(doc(db, "users", userId), {
    pushToken: token,
  });
  ```

  **Implementation:**

  - Added push notification registration to `AppNavigator.js`
  - Created useEffect that runs when user is authenticated and has username
  - Calls `registerForPushNotifications()` to get push token
  - Saves token to Firestore user document using `updateDoc`
  - Only runs on physical devices (gracefully skips on emulators)
  - Includes error handling and logging
  - Token is automatically updated in Firestore when user logs in

**Create Vercel Notification Endpoint:**

- [x] 6. File: `backend/app/api/send-notification/route.ts`

- [x] 7. Create notification endpoint:

  ```typescript
  import { NextResponse } from "next/server";
  import { getMessagesFromFirebase, db } from "@/lib/firebase-admin";

  export async function POST(req: Request) {
    try {
      const {
        conversationId,
        messageId,
        senderId,
        senderUsername,
        messageText,
      } = await req.json();

      // Get conversation to find recipients
      const conversationRef = db
        .collection("conversations")
        .doc(conversationId);
      const conversation = await conversationRef.get();

      if (!conversation.exists) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      const participants = conversation.data()?.participants || [];
      const recipients = participants.filter((id: string) => id !== senderId);

      // Get push tokens for recipients
      const pushTokens: string[] = [];
      for (const recipientId of recipients) {
        const userDoc = await db.collection("users").doc(recipientId).get();
        const pushToken = userDoc.data()?.pushToken;
        if (pushToken) {
          pushTokens.push(pushToken);
        }
      }

      if (pushTokens.length === 0) {
        return NextResponse.json({ message: "No recipients with push tokens" });
      }

      // Send notifications via Expo Push API
      const messages = pushTokens.map((token) => ({
        to: token,
        sound: "default",
        title: senderUsername,
        body: messageText,
        data: { conversationId, messageId, type: "new_message" },
      }));

      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();

      return NextResponse.json({
        success: true,
        sentTo: pushTokens.length,
        result,
      });
    } catch (error) {
      console.error("Notification error:", error);
      return NextResponse.json(
        { error: "Failed to send notification" },
        { status: 500 }
      );
    }
  }
  ```

- [x] 8. Add notification helper to mobile app: `src/utils/notifications.js`

  ```javascript
  const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  export async function sendPushNotification(
    conversationId,
    messageId,
    senderId,
    senderUsername,
    messageText
  ) {
    try {
      const response = await fetch(`${API_URL}/api/send-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messageId,
          senderId,
          senderUsername,
          messageText,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send notification:", response.status);
      }
    } catch (error) {
      console.error("Notification request failed:", error);
      // Don't throw - notifications are non-critical
    }
  }
  ```

**Call Notification Endpoint After Sending Messages:**

- [x] 9. In `src/utils/conversation.js`, update `sendMessage` function:

  ```javascript
  import { sendPushNotification } from "./notifications";

  export async function sendMessage(
    conversationId,
    senderId,
    senderUsername,
    text
  ) {
    // ... existing message sending code ...

    const messageRef = await addDoc(/* ... */);

    // Send push notification (don't await - fire and forget)
    sendPushNotification(
      conversationId,
      messageRef.id,
      senderId,
      senderUsername,
      text
    ).catch((err) => console.error("Push notification failed:", err));

    return messageRef;
  }
  ```

**Deploy to Vercel:**

- [x] 10. Deploy updated backend:

  ```bash
  cd backend
  vercel --prod
  ```

- [x] 11. Test endpoint manually (optional):

  ```bash
  curl -X POST https://your-app.vercel.app/api/send-notification \
    -H "Content-Type: application/json" \
    -d '{"conversationId":"test","messageId":"test","senderId":"test","senderUsername":"Test","messageText":"Hello"}'
  ```

**Enhance Notification with Display Name and Profile Photo:**

- [x] 12. Update `backend/app/api/send-notification/route.ts` to fetch sender's user data:

  ```typescript
  // After getting recipients, also fetch sender's data
  const senderDoc = await db.collection("users").doc(senderId).get();
  const senderData = senderDoc.data();

  // Use displayName with fallback to username
  const senderDisplayName = senderData?.displayName || senderUsername;

  // Get profile image URL if available
  const senderImageURL = senderData?.imageURL || null;
  ```

- [x] 13. Include displayName and image in notification payload:

  ```typescript
  const messages = pushTokens.map((token) => ({
    to: token,
    sound: "default",
    title: senderDisplayName, // ← Use displayName instead of username
    body: messageText,
    data: {
      conversationId,
      messageId,
      type: "new_message",
      senderImageURL, // ← Include sender's profile photo
    },
  }));
  ```

- [x] 14. Deploy backend and test notification shows:
  - Sender's display name (not username) in notification title
  - Profile photo displays correctly (iOS/Android behavior may vary)

**Handle Notification Tap:**

- [ ] 15. In `App.js`:

  - Set up notification response listener:
    ```javascript
    useEffect(() => {
      const subscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const { conversationId } = response.notification.request.content.data;
          // Navigate to ChatScreen with conversationId
          // Use navigation ref or context
        });
      return () => subscription.remove();
    }, []);
    ```

- [ ] 16. Create navigation reference in App.js to allow navigation from listener

**Test Notifications:**

- [ ] 17. Close app completely on device A (not just background, fully quit)

- [ ] 18. Send message from device B

- [ ] 19. Verify device A receives notification on lock screen

- [ ] 20. Tap notification → verify app opens to correct conversation

**Handle Notifications While App is Open:**

- [ ] 21. In `App.js`:

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

- [ ] 22. Test: Send message while app is open → should show in-app notification

**Handle Notification Permissions Edge Cases:**

- [ ] 23. If user denies permissions:

  - Show message explaining notifications won't work
  - Provide button to open settings (optional)

- [ ] 24. Save permission status to avoid repeatedly asking

**Files Created:**

- `src/utils/notifications.js` (already exists - add sendPushNotification function)
- `backend/app/api/send-notification/route.ts` (new Vercel endpoint)

**Files Modified:**

- `App.js` (notification handlers)
- `src/utils/conversation.js` (call notification endpoint after sending)
- Firestore users schema (add pushToken field - already done)

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
- [ ] Check Vercel logs to verify notification endpoint is called successfully

---

## PR #11: Read Receipts Implementation

**Goal**: Implement read receipts for both 1-on-1 and group chats to show when messages have been read

### Subtasks

**Update Message Schema for Read Receipts:**

- [ ] 1. In `src/utils/conversation.js`:

  - Add function: `markMessagesAsRead(conversationId, currentUserId)`
  - Query messages that are not from current user and have status "sent" or "delivered"
  - Update status to "read" using batch write

- [ ] 2. For group chats, add `readBy` array field to messages:
  - Track which users have read each message
  - Use `arrayUnion` to add current user to readBy array
  - Keep backward compatibility with simple status field

**Implement Read Receipt Detection:**

- [ ] 3. In `src/screens/ChatScreen.js`:

  - Add useEffect to detect when conversation is viewed
  - Call `markMessagesAsRead` when ChatScreen mounts or becomes focused
  - Only mark messages as read if they're from other users

- [ ] 4. Handle app state changes:
  - Mark messages as read when app comes to foreground
  - Don't mark as read if user just backgrounded the app

**Update Message Status Indicators:**

- [ ] 5. In `src/components/MessageBubble.js`:
  - Add "read" status indicator: Blue double checkmark ✓✓
  - Update status display logic:
    - "sending": Gray clock 🕐
    - "sent": Single checkmark ✓
    - "delivered": Double checkmark ✓✓
    - "read": Blue double checkmark ✓✓

**Group Chat Read Receipts:**

- [ ] 6. For group messages, show read count:

  - Display "Read by X of Y" below message
  - Calculate from `readBy` array length vs total participants
  - Show individual names on long-press (optional)

- [ ] 7. Update group message status logic:
  - Mark as "delivered" when any user receives
  - Mark as "read" when any user reads
  - Show blue checkmarks when all participants have read

**Add Read Receipt UI Components:**

- [ ] 8. Create `ReadReceiptIndicator` component:

  - Shows read count for group messages
  - Handles long-press to show individual readers
  - Different styling for 1-on-1 vs group chats

- [ ] 9. Update MessageBubble to include read receipt indicator:
  - Position below timestamp
  - Only show for sent messages (not received)
  - Different layout for group vs 1-on-1

**Handle Edge Cases:**

- [ ] 10. Prevent duplicate read receipts:

  - Check if user already in readBy array before adding
  - Use Firestore transactions for atomic updates

- [ ] 11. Handle offline scenarios:

  - Queue read receipt updates when offline
  - Sync when connection restored

- [ ] 12. Handle user leaving/joining groups:
  - Update read count calculations
  - Remove user from readBy arrays when they leave

**Update Firebase Store:**

- [ ] 13. In `src/stores/firebaseStore.js`:
  - Add function: `updateMessageReadStatus(conversationId, messageId, readBy)`
  - Update message in store when read status changes
  - Handle both simple status and readBy array updates

**Add Read Receipt Settings:**

- [ ] 14. In `src/screens/ProfileScreen.js`:

  - Add toggle: "Send Read Receipts" (default: enabled)
  - Save preference to Firestore user document
  - Respect user's privacy choice

- [ ] 15. Update read receipt logic:
  - Only send read receipts if user has enabled them
  - Still show received read receipts regardless of setting

**Performance Optimization:**

- [ ] 16. Batch read receipt updates:

  - Update multiple messages in single batch write
  - Reduce Firestore write operations

- [ ] 17. Debounce read receipt updates:
  - Don't update on every scroll
  - Update when user stops scrolling for 2+ seconds

**Test Read Receipts:**

- [ ] 18. Test 1-on-1 read receipts:

  - Send message from Device A
  - Open conversation on Device B
  - Verify Device A shows blue checkmarks

- [ ] 19. Test group read receipts:

  - Send message in group chat
  - Have different users read the message
  - Verify read count updates correctly

- [ ] 20. Test edge cases:
  - User leaves group while message unread
  - Multiple users read simultaneously
  - Offline/online transitions

**Files Created:**

- `src/components/ReadReceiptIndicator.js`

**Files Modified:**

- `src/utils/conversation.js` (add markMessagesAsRead function)
- `src/screens/ChatScreen.js` (add read receipt detection)
- `src/components/MessageBubble.js` (add read receipt display)
- `src/stores/firebaseStore.js` (add read receipt updates)
- `src/screens/ProfileScreen.js` (add read receipt settings)

**Test Before Merge:**

- [ ] 1-on-1 messages show blue checkmarks when read
- [ ] Group messages show "Read by X of Y" correctly
- [ ] Read receipts work when app comes to foreground
- [ ] Read receipts respect user privacy settings
- [ ] Offline read receipts sync when reconnected
- [ ] No duplicate read receipts sent
- [ ] Performance is smooth with many messages
- [ ] Works correctly in groups with users joining/leaving

---

## Summary

**Post-MVP (Day 3-5):**

- PR #8: Profile editing ✅
- PR #9: Group chats 🔄 (in progress)
- PR #10: Push notifications
- PR #11: Read Receipts

**Total Remaining PRs:** 3 (PR #9-11)

---

## Key Reminders

- **Test each PR thoroughly before moving to next**
- **Use physical devices for testing notifications**
- **Test presence updates with multiple devices**
- **Test offline mode after PR #8**
- **Cloud Functions deployment can take a few tries - be patient**
- **Production builds are different from Expo Go - test both**
- **After PR #10, transition to PRD-2 based AI features**

Good luck finishing the app! 🚀

---

## PR #12: Typing Indicators & Connection Status

**Goal**: Implement real-time typing indicators and connection status indicators for better user experience

### Why This Matters

Typing indicators provide immediate feedback that someone is responding, improving the real-time feel of the app. Connection status helps users understand network state and offline capabilities.

### Subtasks

**Implement Typing Indicators:**

- [ ] File: `src/utils/typing.js`
- [ ] Function: `updateTypingState(conversationId, userId, isTyping)`

  - Write to Realtime Database: `/typing/{conversationId}/{userId}`
  - Set: `{ isTyping: boolean, timestamp: serverTimestamp() }`
  - Auto-clear after 3 seconds of no activity

- [ ] Function: `listenToTyping(conversationId, onTypingUpdate)`
  - Listen to `/typing/{conversationId}` in Realtime Database
  - Filter out current user
  - Return typing users array
  - Return unsubscribe function

**Add Typing to Chat Screen:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] Add debounced typing handler:

  ```javascript
  const handleTyping = debounce(() => {
    updateTypingState(conversationId, currentUserId, true);
    // Auto-clear after 3 seconds
    setTimeout(() => {
      updateTypingState(conversationId, currentUserId, false);
    }, 3000);
  }, 1000);
  ```

- [ ] Call `handleTyping` on text input change
- [ ] Set up typing listener on mount
- [ ] Display typing indicator below header:
  - "User is typing..." for 1-on-1
  - "John, Sarah are typing..." for groups

**Implement Connection Status:**

- [ ] File: `src/utils/connectionStatus.js`
- [ ] Function: `setupConnectionListener(onStatusChange)`

  - Listen to Firestore connection state
  - Return "Online", "Connecting...", "Offline"
  - Handle network state changes

- [ ] Add connection status banner to ChatScreen
- [ ] Show "Offline" when disconnected
- [ ] Show "Connecting..." when reconnecting
- [ ] Hide when "Online"

**Update Presence Store:**

- [ ] File: `src/stores/presenceStore.js`
- [ ] Add typing state:
  ```javascript
  typingData: {
    conversationId: {
      userId: boolean;
    }
  }
  setTypingUsers(conversationId, users);
  ```

**Test Typing Indicators:**

- [ ] User A starts typing → User B sees "User A is typing..."
- [ ] User A stops typing → Indicator disappears after 3 seconds
- [ ] In group: Multiple users typing → Shows "John, Sarah are typing..."
- [ ] Verify <100ms latency
- [ ] Test with 2+ devices

**Test Connection Status:**

- [ ] Turn on airplane mode → Shows "Offline" banner
- [ ] Turn off airplane mode → Shows "Connecting..." then disappears
- [ ] Test with slow network connection
- [ ] Verify status updates accurately

**Files Created:**

- `src/utils/typing.js`
- `src/utils/connectionStatus.js`

**Files Modified:**

- `src/screens/ChatScreen.js` (add typing and connection status)
- `src/stores/presenceStore.js` (add typing state)

**Test Before Merge:**

- [ ] Typing indicators work in real-time (<100ms)
- [ ] Auto-clear after 3 seconds of inactivity
- [ ] Group typing shows multiple users
- [ ] Connection status updates accurately
- [ ] Works offline/online transitions
- [ ] No memory leaks from listeners

---

## PR #13: Dark Mode & Message Reactions

**Goal**: Implement dark mode theme system and message reactions for enhanced user experience

### Why This Matters

Dark mode is a standard expectation for modern apps and provides better usability in low-light conditions. Message reactions add engagement and quick feedback without cluttering the chat.

### Subtasks

**Implement Dark Mode:**

- [ ] File: `src/contexts/ThemeContext.js`
- [ ] Create theme context with light/dark color palettes:

  ```javascript
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
  ```

- [ ] Add theme toggle to Profile screen
- [ ] Save theme preference to Firestore user document
- [ ] Load theme preference on app start
- [ ] Apply theme to all screens

**Update All Components for Dark Mode:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] File: `src/screens/HomeScreen.js`
- [ ] File: `src/screens/ProfileScreen.js`
- [ ] File: `src/components/MessageBubble.js`
- [ ] File: `src/components/UserListItem.js`
- [ ] All AI feature screens
- [ ] Use theme colors instead of hardcoded colors

**Implement Message Reactions:**

- [ ] File: `src/utils/reactions.js`
- [ ] Function: `addReaction(conversationId, messageId, userId, emoji)`

  - Add reaction to message document in Firestore
  - Use `arrayUnion` to add reaction object
  - Structure: `{ userId, emoji, timestamp }`

- [ ] Function: `removeReaction(conversationId, messageId, userId, emoji)`

  - Remove specific reaction from message
  - Use `arrayRemove` to remove reaction object

- [ ] Function: `listenToReactions(conversationId, messageId, onReactionsUpdate)`
  - Listen to message document changes
  - Return reactions array
  - Return unsubscribe function

**Create Reaction UI:**

- [ ] File: `src/components/MessageReactions.js`
- [ ] Display reactions below message
- [ ] Show emoji with count (👍 3)
- [ ] Tap reaction to add/remove
- [ ] Long-press to see who reacted
- [ ] Available emojis: 👍 ❤️ 😂 🎉 😮 😢

**Add Reaction Picker:**

- [ ] File: `src/components/ReactionPicker.js`
- [ ] Modal with emoji grid
- [ ] Tap emoji to add reaction
- [ ] Close on tap outside
- [ ] Position near message

**Update MessageBubble:**

- [ ] File: `src/components/MessageBubble.js`
- [ ] Add long-press handler to show reaction picker
- [ ] Display MessageReactions component
- [ ] Handle reaction tap events

**Update Message Schema:**

- [ ] File: `src/utils/conversation.js`
- [ ] Add reactions field to message creation:
  ```javascript
  {
    text: "...",
    reactions: [
      { userId: "user1", emoji: "👍", timestamp: serverTimestamp() },
      { userId: "user2", emoji: "❤️", timestamp: serverTimestamp() }
    ]
  }
  ```

**Test Dark Mode:**

- [ ] Toggle dark mode in Profile settings
- [ ] Verify theme updates immediately across all screens
- [ ] Check status colors are brighter in dark mode
- [ ] Verify text contrast is readable (WCAG AA)
- [ ] Test theme persistence (close app, reopen)
- [ ] Test with all AI features

**Test Message Reactions:**

- [ ] Long-press message → reaction picker appears
- [ ] Tap emoji → reaction added to message
- [ ] Tap existing reaction → removes reaction
- [ ] Multiple users can react to same message
- [ ] Reactions sync in real-time across devices
- [ ] Long-press reaction → shows who reacted

**Files Created:**

- `src/contexts/ThemeContext.js`
- `src/components/MessageReactions.js`
- `src/components/ReactionPicker.js`
- `src/utils/reactions.js`

**Files Modified:**

- All screen components (dark mode support)
- `src/components/MessageBubble.js` (reactions)
- `src/screens/ProfileScreen.js` (theme toggle)
- `src/utils/conversation.js` (reactions schema)

**Test Before Merge:**

- [ ] Dark mode works across all screens
- [ ] Theme persistence works correctly
- [ ] Text contrast meets accessibility standards
- [ ] Message reactions work in real-time
- [ ] Reaction picker appears on long-press
- [ ] Multiple users can react simultaneously
- [ ] Reactions display correctly in both themes
