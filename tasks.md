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

- [ ] Install Node.js (v18 or later) from nodejs.org
- [ ] Verify installation: `node --version` and `npm --version`
- [ ] Install Expo CLI globally: `npm install -g expo-cli`

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

- [ ] Download "Expo Go" app from App Store (iOS) or Google Play (Android)
- [ ] Open Expo Go and create account (or sign in)

**Test Development Workflow:**

- [ ] In terminal, run: `npx expo start`
- [ ] Scan QR code with phone camera (iOS) or in Expo Go app (Android)
- [ ] App should load on your phone
- [ ] Edit `App.js` - change text to "Hello Messaging App"
- [ ] Save file and verify change appears on phone (hot reload)

**Install Core Dependencies:**

- [ ] Make sure you're in the root directory (where App.js is)
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

- [ ] Create folder structure (run these commands in PowerShell from root directory):

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

- [ ] Create `.env` file in root directory (will add Firebase keys later)

  ```bash
  # Windows PowerShell:
  New-Item .env -ItemType File

  # Or manually create .env file in root
  ```

- [x] ✅ `.env*` is already in `.gitignore` (line 33)
- [ ] Note: Expo uses `EXPO_PUBLIC_` prefix for environment variables (no need for dotenv package)

**Git Setup:**

- [x] ✅ Git already initialized (`.git` folder exists)
- [x] ✅ `.gitignore` exists and includes all necessary patterns:
  ```
  .env* (line 33)
  node_modules/ (line 49)
  .expo/ (line 52)
  *.jks, *.p8, *.p12, *.key, *.mobileprovision (lines 60-64)
  ```
- [ ] Commit PR #1 changes when complete:
  ```bash
  git add .
  git commit -m "PR #1: React Native setup and environment configuration"
  ```

**Documentation:**

- [ ] Update existing `README.md` with project information:
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
      status: "sending",
    });
    ```
  - Write to Firestore:
    ```javascript
    await addDoc(collection(db, "conversations", conversationId, "messages"), {
      senderId,
      senderUsername,
      text,
      timestamp: serverTimestamp(),
      status: "sent",
    });
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
  const pendingMessages = useLocalStore(
    (s) => s.pendingMessages[conversationId] || []
  );
  ```
- [ ] Get confirmed messages from FIREBASE store:
  ```javascript
  const confirmedMessages = useFirebaseStore(
    (s) => s.messages[conversationId] || []
  );
  ```
- [ ] Merge for display:
  ```javascript
  const allMessages = [...pendingMessages, ...confirmedMessages];
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
    await updateDoc(messageRef, { status: "delivered" });
    ```

**Update Firebase Store on Status Changes:**

- [ ] In `ChatScreen.js`, in the onSnapshot listener:
- [ ] When message is modified (status changed):
  - Update message in FIREBASE store:
    ```javascript
    useFirebaseStore
      .getState()
      .updateMessageStatus(conversationId, messageId, newStatus);
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
  flatListRef.current?.scrollToEnd({ animated: true });
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
