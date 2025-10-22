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

- [ ] 43. In `src/screens/HomeScreen.js`:

  - Fetch user's conversations from Firestore
  - Display both 1-on-1 and group conversations

- [ ] 44. For each conversation:
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

- [ ] 1. Install package:
  ```bash
  npx expo install expo-notifications
  ```

**Request Notification Permissions:**

- [ ] 2. Create file: `src/utils/notifications.js`

- [ ] 3. Add function: `registerForPushNotifications()`

  - Request permissions using Expo Notifications API
  - Get Expo push token
  - Return token

- [ ] 4. In `src/screens/HomeScreen.js` or `App.js`:

  - On app start (after login), call `registerForPushNotifications()`

- [ ] 5. Save push token to Firestore user document:
  ```javascript
  await updateDoc(doc(db, "users", userId), {
    pushToken: token,
  });
  ```

**Set Up Firebase Cloud Functions:**

- [ ] 6. Install Firebase CLI globally (if not already installed):

  ```bash
  npm install -g firebase-tools
  ```

- [ ] 7. Login to Firebase:

  ```bash
  firebase login
  ```

- [ ] 8. Initialize Cloud Functions in your project root:

  ```bash
  firebase init functions
  ```

- [ ] 9. Select your Firebase project

- [ ] 10. Choose JavaScript (not TypeScript for simplicity)

- [ ] 11. Install dependencies when prompted

**Create Cloud Function for Notifications:**

- [ ] 12. Open file: `functions/index.js`

- [ ] 13. Import required modules:

  ```javascript
  const functions = require("firebase-functions");
  const admin = require("firebase-admin");
  admin.initializeApp();
  ```

- [ ] 14. Create function: `sendMessageNotification`

  - Trigger: onCreate in `/conversations/{convId}/messages/{msgId}`

- [ ] 15. Inside the function:

  - Get the new message data from snapshot
  - Get conversation document to find recipients
  - Get recipients' user documents to retrieve push tokens
  - Filter out sender from recipients
  - Only send notifications if recipients have push tokens

- [ ] 16. Send notification via Expo push API:

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

- [ ] 17. Deploy to Firebase:

  ```bash
  firebase deploy --only functions
  ```

- [ ] 18. Verify function appears in Firebase console (Functions section)

- [ ] 19. Check function logs in Firebase console to debug if needed

**Handle Notification Tap:**

- [ ] 20. In `App.js`:

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

- [ ] 21. Create navigation reference in App.js to allow navigation from listener

**Test Notifications:**

- [ ] 22. Close app completely on device A (not just background, fully quit)

- [ ] 23. Send message from device B

- [ ] 24. Verify device A receives notification on lock screen

- [ ] 25. Tap notification → verify app opens to correct conversation

**Handle Notifications While App is Open:**

- [ ] 26. In `App.js`:

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

- [ ] 27. Test: Send message while app is open → should show in-app notification

**Handle Notification Permissions Edge Cases:**

- [ ] 28. If user denies permissions:

  - Show message explaining notifications won't work
  - Provide button to open settings (optional)

- [ ] 29. Save permission status to avoid repeatedly asking

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

# Messaging App - AI Features Implementation Task List

## Overview

This document outlines the implementation of AI-powered features for the Remote Team Professional persona using Vercel AI SDK and OpenAI. These features build upon the core messaging infrastructure from tasks.md.

**Total PRs:** 4
**Timeline:** 3-4 days after core messaging is complete
**Target Persona:** Remote Team Professional

---

## PR #12: AI Foundation & Basic Features Setup

**Goal**: Set up Vercel AI SDK, OpenAI integration, and implement the first 2 AI features (Thread Summarization & Action Item Extraction)

### Why This Matters

These are the foundational AI features that provide immediate value to remote teams. Thread summarization helps with information overload, while action item extraction prevents missed tasks.

### Subtasks

**Install AI Dependencies:**

- [ ] Install Vercel AI SDK and OpenAI provider:

  ```bash
  npm install ai @ai-sdk/openai zod
  ```

- [ ] Verify installation and check package.json includes:
  ```json
  {
    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.x",
    "zod": "^3.22.0"
  }
  ```

**Environment Setup:**

- [ ] Add OpenAI API key to `.env`:

  ```
  EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
  ```

- [ ] Verify API key is accessible in app (console.log test)
- [ ] Ensure `.env*` is in `.gitignore` (already done)

**Create AI Service Layer:**

- [ ] File: `src/services/aiService.js`
- [ ] Import required modules:

  ```javascript
  import { generateText, generateObject } from "ai";
  import { openai } from "@ai-sdk/openai";
  import { z } from "zod";
  ```

- [ ] Add error handling wrapper:
  ```javascript
  const withErrorHandling = async (fn, fallback) => {
    try {
      return await fn();
    } catch (error) {
      console.error("AI Service Error:", error);
      // Handle rate limits, API errors, timeouts
      throw new Error(
        "AI service temporarily unavailable. Please try again later."
      );
    }
  };
  ```

**Implement Thread Summarization:**

- [ ] File: `src/services/aiService.js`
- [ ] Function: `summarizeThread(conversationId)`

  - Fetch last 50 messages from conversation
  - Create prompt focusing on key topics, decisions, action items
  - Use `generateText` with GPT-4-turbo
  - Return formatted summary
  - Target response time: <2 seconds

- [ ] Prompt template:

  ```javascript
  const prompt = `Summarize this conversation thread in 3-4 bullet points. Focus on key topics, decisions, and action items:
  
  ${messages.map((m) => `${m.senderUsername}: ${m.text}`).join("\n")}
  
  Provide a concise summary with:
  - Main topics discussed
  - Key decisions made
  - Outstanding questions`;
  ```

**Implement Action Item Extraction:**

- [ ] File: `src/services/aiService.js`
- [ ] Define ActionItemSchema with Zod:

  ```javascript
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
  ```

- [ ] Function: `extractActionItems(conversationId)`
  - Fetch last 100 messages from conversation
  - Use `generateObject` with ActionItemSchema
  - Extract tasks, assignments, deadlines
  - Return structured action items
  - Target response time: <2 seconds

**Create UI Components:**

- [ ] File: `src/components/ThreadSummaryModal.js`

  - Modal overlay component
  - Display AI-generated summary
  - Loading state while processing
  - Close button
  - Copy summary button (bonus)

- [ ] File: `src/screens/ActionItemsScreen.js`
  - List view of extracted action items
  - Each item shows: task, assigned person, deadline, status
  - Checkbox to mark complete
  - "View in conversation" links
  - Refresh button to re-extract

**Add Navigation:**

- [ ] File: `src/navigation/AppNavigator.js`
- [ ] Add ActionItemsScreen to Main Stack

**Connect to Chat Screen:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] Add "📝 Summary" button to header
- [ ] Add "📋 Action Items" button to header
- [ ] On tap: Navigate to respective screens
- [ ] Pass conversationId via navigation params

**Add Loading States:**

- [ ] Show loading indicator while AI processing
- [ ] Disable buttons during processing
- [ ] Handle errors gracefully with user-friendly messages

**Test Basic AI Features:**

- [ ] Create conversation with 50+ messages covering various topics
- [ ] Test thread summarization:

  - Tap "📝 Summary" button
  - Verify summary captures main topics
  - Response time <2 seconds
  - Summary is 3-5 concise bullet points

- [ ] Test action item extraction:
  - Send messages with commitments: "I'll finish the report by Friday"
  - Send messages with assignments: "Can you review the PR?"
  - Tap "📋 Action Items" button
  - Verify all action items extracted correctly
  - Check assignedTo and deadline fields populated
  - Response time <2 seconds

**Files Created:**

- `src/services/aiService.js`
- `src/components/ThreadSummaryModal.js`
- `src/screens/ActionItemsScreen.js`

**Files Modified:**

- `src/screens/ChatScreen.js` (add AI buttons)
- `src/navigation/AppNavigator.js` (add ActionItemsScreen)
- `.env` (add OpenAI key)

**Test Before Merge:**

- [ ] AI dependencies installed successfully
- [ ] OpenAI API key accessible
- [ ] Thread summarization works with sample conversation
- [ ] Action item extraction identifies tasks correctly
- [ ] UI components display results properly
- [ ] Navigation between screens works
- [ ] Error handling works (test with invalid API key)
- [ ] Response times meet targets (<2 seconds)

---

## PR #13: Smart Search & Priority Detection

**Goal**: Implement semantic search using OpenAI embeddings and automatic priority detection for messages

### Subtasks

**Implement Semantic Search:**

- [ ] File: `src/services/aiService.js`
- [ ] Import embedding function:

  ```javascript
  import { embed } from "ai";
  ```

- [ ] Function: `semanticSearch(query, conversationId)`

  - Get query embedding using text-embedding-3-small
  - Fetch messages from conversation (last 200)
  - Compute embeddings for all messages
  - Calculate cosine similarity
  - Filter results above threshold (0.7)
  - Sort by similarity score
  - Return top 10 results

- [ ] Helper function: `cosineSimilarity(vecA, vecB)`
  - Calculate cosine similarity between two vectors
  - Return similarity score (0-1)

**Implement Priority Detection:**

- [ ] File: `src/services/aiService.js`
- [ ] Define PrioritySchema with Zod:

  ```javascript
  const PrioritySchema = z.object({
    priority: z.enum(["high", "normal", "low"]),
    reason: z.string(),
    urgencyScore: z.number().min(0).max(10),
  });
  ```

- [ ] Function: `detectPriority(messageText)`
  - Analyze message for urgency indicators
  - Consider: deadlines, immediate action requests, escalations, blockers
  - Use `generateObject` with PrioritySchema
  - Return priority level, reason, and urgency score
  - Target response time: <8 seconds

**Create Search Components:**

- [ ] File: `src/components/SemanticSearchBar.js`

  - Search input field
  - Search mode toggle (semantic vs keyword)
  - Loading indicator during search
  - Results display with similarity scores
  - "View in conversation" links

- [ ] File: `src/screens/SearchResultsScreen.js`
  - Display search results
  - Show message context
  - Highlight matching text
  - Navigate to specific message in conversation

**Update Message Schema:**

- [ ] File: `src/utils/conversation.js`
- [ ] Add priority fields to message creation:
  ```javascript
  {
    text: "...",
    priority: "high" | "normal" | "low" | null,
    priorityReason: "Contains urgent deadline" | null,
    urgencyScore: 0-10 | null
  }
  ```

**Implement Auto-Priority Detection:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] On new message received (not from current user):
  - Call `detectPriority(messageText)`
  - Update message with priority data
  - Show priority badge in UI

**Update MessageBubble Component:**

- [ ] File: `src/components/MessageBubble.js`
- [ ] Add priority display:
  - High priority: Red border/badge
  - Normal priority: No special styling
  - Low priority: Subtle indicator (optional)
- [ ] Show priority reason on long-press (optional)

**Add Search to Chat Screen:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] Add search bar below header
- [ ] Toggle between semantic and keyword search
- [ ] Display search results in overlay
- [ ] Navigate to specific message on tap

**Update Push Notifications:**

- [ ] File: `functions/index.js` (Cloud Function)
- [ ] Customize notification for high-priority messages:
  ```javascript
  const title =
    message.priority === "high"
      ? `🔴 ${message.senderUsername}`
      : message.senderUsername;
  ```

**Add Navigation:**

- [ ] File: `src/navigation/AppNavigator.js`
- [ ] Add SearchResultsScreen to Main Stack

**Performance Optimization:**

- [ ] Cache message embeddings in Firestore (optional)
- [ ] Implement search debouncing (500ms)
- [ ] Limit search to recent messages for performance

**Test Smart Search:**

- [ ] Create messages with varied topics
- [ ] Test semantic search:

  - Search for "meeting schedule" (semantic query)
  - Verify results include messages about "calendar", "availability", "time to meet"
  - Compare with keyword search (should find different results)
  - Response time <2 seconds

- [ ] Test keyword search:
  - Search for exact phrases
  - Verify results match keywords
  - Performance is fast (<500ms)

**Test Priority Detection:**

- [ ] Send urgent message: "Production is down! Need help ASAP!"
- [ ] Verify message flagged as high priority with red border
- [ ] Check priority reason is accurate
- [ ] Send normal message: "Let me know when you're free"
- [ ] Verify marked as normal priority
- [ ] Test with various message types
- [ ] Response time <8 seconds

**Files Created:**

- `src/components/SemanticSearchBar.js`
- `src/screens/SearchResultsScreen.js`

**Files Modified:**

- `src/services/aiService.js` (add search and priority functions)
- `src/components/MessageBubble.js` (add priority display)
- `src/screens/ChatScreen.js` (add search and auto-priority)
- `src/utils/conversation.js` (update message schema)
- `functions/index.js` (update notifications)
- `src/navigation/AppNavigator.js` (add SearchResultsScreen)

**Test Before Merge:**

- [ ] Semantic search finds contextually relevant messages
- [ ] Keyword search works for exact matches
- [ ] Priority detection flags urgent messages correctly
- [ ] High-priority messages show red border/badge
- [ ] Push notifications show priority indicators
- [ ] Search performance meets targets
- [ ] Auto-priority detection works on new messages
- [ ] Search results navigate to correct messages

---

## PR #14: Decision Tracking & Multi-Step Agent

**Goal**: Implement decision extraction and the advanced multi-step AI agent for complex workflows

### Subtasks

**Implement Decision Tracking:**

- [ ] File: `src/services/aiService.js`
- [ ] Define DecisionSchema with Zod:

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
  ```

- [ ] Function: `extractDecisions(conversationId)`
  - Fetch last 100 messages from conversation
  - Look for decision phrases: "let's do...", "we agreed...", "decided to...", "going with..."
  - Use `generateObject` with DecisionSchema
  - Filter out low-confidence decisions
  - Return structured decisions with participants and context
  - Target response time: <2 seconds

**Create Decision Tracking UI:**

- [ ] File: `src/screens/DecisionsScreen.js`
  - Timeline view of identified decisions
  - Each decision shows:
    - What was decided
    - Participants involved
    - Timestamp
    - Context
    - Confidence level
    - "View in conversation" link
  - Filter by date range (All, This Week, This Month)
  - Refresh button to re-extract

**Add Decision Navigation:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] Add "✓ Decisions" button to header
- [ ] Navigate to DecisionsScreen with conversationId

**Implement Multi-Step Agent:**

- [ ] File: `src/services/aiService.js`
- [ ] Import streaming functions:

  ```javascript
  import { streamText, tool } from "ai";
  ```

- [ ] Define agent tools:

  ```javascript
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
        // Search logic here
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
  ```

- [ ] Function: `executeAgent(userQuery, conversationId, onStepUpdate)`
  - Use `streamText` with tools and maxSteps: 10
  - System prompt for remote team assistant
  - Handle step-by-step progress updates
  - Return final formatted result
  - Target response time: <15 seconds

**Create Agent Chat Interface:**

- [ ] File: `src/screens/AgentChatScreen.js`
  - Chat interface with AI agent
  - User can type complex queries
  - Shows step-by-step progress:
    - Step 1: Searching messages from last week...
    - Step 2: Extracting action items...
    - Step 3: Categorizing by person...
    - Step 4: Generating report...
  - Displays final formatted results
  - Example queries shown for guidance
  - Message history in conversation format

**Add Agent Navigation:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] Add "🤖 Agent" button to header
- [ ] Navigate to AgentChatScreen with conversationId

**Implement Helper Functions:**

- [ ] File: `src/utils/aiHelpers.js`
- [ ] Function: `searchMessages(conversationId, filters)`

  - Search messages by date range or keyword
  - Return filtered message list

- [ ] Function: `groupBy(array, key)`

  - Group array items by specified key
  - Return grouped object

- [ ] Function: `formatReport(data, title)`
  - Format data into readable report
  - Return formatted string

**Add Navigation:**

- [ ] File: `src/navigation/AppNavigator.js`
- [ ] Add DecisionsScreen to Main Stack
- [ ] Add AgentChatScreen to Main Stack

**Error Handling & Fallbacks:**

- [ ] Handle agent tool failures gracefully
- [ ] Provide fallback responses for complex queries
- [ ] Show clear error messages to users
- [ ] Implement retry logic for failed steps

**Test Decision Tracking:**

- [ ] Create conversation with clear decisions:
  - "Let's go with option B for the architecture"
  - "We agreed to extend the deadline to Q2"
  - "Decided to use microservices approach"
- [ ] Test decision extraction:
  - Tap "✓ Decisions" button
  - Verify decisions extracted correctly
  - Check participants list is accurate
  - Verify timestamp and context are correct
  - Test filter by date range
  - Response time <2 seconds

**Test Multi-Step Agent:**

- [ ] Test complex workflow:

  - Query: "Find all action items from last week, categorize by person, and create a summary report"
  - Verify step-by-step progress shown:
    - Step 1: Searching messages from last week...
    - Step 2: Extracting action items...
    - Step 3: Categorizing by person...
    - Step 4: Generating report...
  - Check final report is well-formatted and accurate
  - Total response time <15 seconds

- [ ] Test simpler queries:

  - "Summarize this conversation"
  - "What decisions were made?"
  - "Who has pending tasks?"

- [ ] Test error handling:
  - Query with no results
  - Invalid conversation ID
  - Network errors

**Files Created:**

- `src/screens/DecisionsScreen.js`
- `src/screens/AgentChatScreen.js`
- `src/utils/aiHelpers.js`

**Files Modified:**

- `src/services/aiService.js` (add decision extraction and agent)
- `src/screens/ChatScreen.js` (add Decisions and Agent buttons)
- `src/navigation/AppNavigator.js` (add new screens)

**Test Before Merge:**

- [ ] Decision tracking identifies decisions correctly
- [ ] Decisions screen shows timeline view
- [ ] Multi-step agent executes complex workflows
- [ ] Agent shows step-by-step progress
- [ ] Final reports are well-formatted
- [ ] Error handling works for edge cases
- [ ] Response times meet targets
- [ ] Navigation between screens works
- [ ] Agent maintains context across steps

---

## PR #15: Typing Indicators & Connection Status

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

## PR #16: Dark Mode & Message Reactions

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

---

## PR #17: AI Features Polish & Integration

**Goal**: Polish all AI features, implement rate limiting, and ensure production readiness

### Subtasks

**Implement Rate Limiting:**

- [ ] File: `src/services/aiService.js`
- [ ] Add rate limiting configuration:

  ```javascript
  const AI_RATE_LIMIT = {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  };
  ```

- [ ] Function: `checkRateLimit()`

  - Track request timestamps
  - Check if user exceeded limit
  - Throw error if limit exceeded
  - Clean up old timestamps

- [ ] Integrate rate limiting into all AI functions
- [ ] Show user-friendly error messages for rate limits

**Add Dark Mode Support:**

- [ ] File: `src/components/ThreadSummaryModal.js`
- [ ] Update styling to use theme colors
- [ ] Ensure readability in dark mode

- [ ] File: `src/screens/ActionItemsScreen.js`
- [ ] Apply dark theme colors
- [ ] Update list item styling

- [ ] File: `src/screens/DecisionsScreen.js`
- [ ] Apply dark theme colors
- [ ] Update timeline styling

- [ ] File: `src/screens/AgentChatScreen.js`
- [ ] Apply dark theme colors
- [ ] Update chat interface styling

- [ ] File: `src/components/SemanticSearchBar.js`
- [ ] Apply dark theme colors
- [ ] Update search input styling

**Improve AI Feature UX:**

- [ ] Add loading skeletons for all AI screens
- [ ] Implement pull-to-refresh on AI screens
- [ ] Add confirmation dialogs for expensive operations
- [ ] Show progress indicators for long-running operations
- [ ] Add tooltips explaining AI features

**Add AI Feature Settings:**

- [ ] File: `src/screens/ProfileScreen.js`
- [ ] Add AI settings section:

  - "Enable Auto-Priority Detection" toggle
  - "AI Response Speed" slider (fast vs accurate)
  - "Max Messages to Analyze" setting
  - "Enable AI Features" master toggle

- [ ] Save settings to Firestore user document
- [ ] Respect user preferences in AI functions

**Implement Caching:**

- [ ] File: `src/services/aiService.js`
- [ ] Add caching for expensive operations:

  - Cache thread summaries (24 hours)
  - Cache action item extractions (12 hours)
  - Cache decision extractions (12 hours)
  - Cache search results (1 hour)

- [ ] Use Firestore for cache storage
- [ ] Implement cache invalidation

**Add Analytics:**

- [ ] File: `src/services/aiService.js`
- [ ] Track AI feature usage:

  - Which features are used most
  - Response times
  - Error rates
  - User satisfaction (optional)

- [ ] Log to Firestore analytics collection
- [ ] Use for optimization and debugging

**Improve Error Handling:**

- [ ] Add specific error messages for different failure types
- [ ] Implement retry logic with exponential backoff
- [ ] Add fallback responses for AI failures
- [ ] Show helpful suggestions when AI fails

**Add AI Feature Onboarding:**

- [ ] File: `src/components/AIOnboardingModal.js`
- [ ] Show on first AI feature use
- [ ] Explain each AI feature briefly
- [ ] Show example queries for agent
- [ ] Allow users to skip onboarding

**Performance Optimization:**

- [ ] Implement lazy loading for AI screens
- [ ] Optimize re-renders in AI components
- [ ] Add memoization where appropriate
- [ ] Implement virtual scrolling for large result sets

**Add AI Feature Indicators:**

- [ ] File: `src/screens/ChatScreen.js`
- [ ] Show AI feature availability indicators
- [ ] Display when AI analysis is in progress
- [ ] Show AI feature usage statistics

**Test All AI Features:**

- [ ] Test thread summarization with various conversation types
- [ ] Test action item extraction with different task formats
- [ ] Test semantic search with complex queries
- [ ] Test priority detection with various urgency levels
- [ ] Test decision tracking with different decision types
- [ ] Test multi-step agent with complex workflows

**Test Dark Mode:**

- [ ] Toggle dark mode in Profile settings
- [ ] Verify all AI screens adapt to dark theme
- [ ] Check text contrast and readability
- [ ] Test theme persistence

**Test Rate Limiting:**

- [ ] Send 20+ AI requests quickly
- [ ] Verify rate limit error appears
- [ ] Wait 1 minute and verify requests work again
- [ ] Test rate limit reset

**Test Performance:**

- [ ] Test AI features with large conversations (500+ messages)
- [ ] Verify response times meet targets
- [ ] Test offline behavior
- [ ] Test with slow network connection

**Files Created:**

- `src/components/AIOnboardingModal.js`

**Files Modified:**

- `src/services/aiService.js` (add rate limiting, caching, analytics)
- `src/screens/ProfileScreen.js` (add AI settings)
- All AI screen components (dark mode support)
- `src/screens/ChatScreen.js` (add AI indicators)

**Test Before Merge:**

- [ ] All AI features work in dark mode
- [ ] Rate limiting prevents abuse
- [ ] Caching improves performance
- [ ] Error handling is user-friendly
- [ ] AI settings are respected
- [ ] Performance meets targets
- [ ] Onboarding helps new users
- [ ] Analytics track usage correctly
- [ ] All features work offline (with cached data)

---

## Summary

**AI Features Implementation Timeline:**

- **PR #12**: AI Foundation & Basic Features (Day 1)

  - Thread Summarization ✅
  - Action Item Extraction ✅

- **PR #13**: Smart Search & Priority Detection (Day 2)

  - Semantic Search ✅
  - Priority Detection ✅

- **PR #14**: Decision Tracking & Multi-Step Agent (Day 3)

  - Decision Tracking ✅
  - Multi-Step Agent ✅

- **PR #15**: Typing Indicators & Connection Status (Day 4)

  - Real-time Typing Indicators ✅
  - Connection Status Indicators ✅

- **PR #16**: Dark Mode & Message Reactions (Day 5)

  - Dark Mode Theme System ✅
  - Message Reactions ✅

- **PR #17**: AI Features Polish & Integration (Day 6)
  - Rate Limiting ✅
  - Performance Optimization ✅
  - Production Readiness ✅

**Total AI Features:** 5 Core + 1 Advanced

- Thread Summarization
- Action Item Extraction
- Smart Semantic Search
- Priority Detection
- Decision Tracking
- Multi-Step Agent (Advanced)

**Additional MVP Features:** 3 Core + 2 Bonus

- Typing Indicators (MVP)
- Connection Status (MVP)
- Dark Mode (MVP)
- Message Reactions (Bonus +2 points)
- Rich Media Previews (Bonus +2 points)

---

## Key Reminders

- **Test each AI feature thoroughly before moving to next**
- **Use real conversations for testing (not dummy data)**
- **Monitor OpenAI API usage and costs**
- **Implement proper error handling and fallbacks**
- **Ensure all features work offline (with cached data)**
- **Test with various conversation lengths and types**
- **Verify response times meet performance targets**
- **After PR #17, transition to final polish and deployment**

Good luck implementing the AI features! 🤖✨
