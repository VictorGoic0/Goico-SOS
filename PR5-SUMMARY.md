# PR #5: User List & Presence Tracking - COMPLETE ✅

## Overview

Implemented the Home screen with a real-time user list and presence tracking using Firebase Realtime Database. Users can see all registered users with accurate online/offline status, including themselves.

---

## 🎯 What Was Built

### 1. HomeScreen (`src/screens/HomeScreen.js`)

**Features:**

- ✅ FlatList displaying all users from Firestore
- ✅ Real-time updates with Firestore onSnapshot
- ✅ Pull-to-refresh functionality
- ✅ Loading state while fetching users
- ✅ Empty state when no users exist
- ✅ User count display in header
- ✅ Tap user to navigate to chat (TODO for PR #6)
- ✅ Temporary sign out button (will move to Profile screen)
- ✅ Current user appears in the list

### 2. UserListItem Component (`src/components/UserListItem.js`)

**Features:**

- ✅ User avatar (image or colored placeholder with initials)
- ✅ Display name and username
- ✅ Online/offline indicator (green dot = online, gray = offline)
- ✅ Status message for online users ("Available")
- ✅ "Last seen" timestamp for offline users
- ✅ Tap handling for navigation
- ✅ Chevron indicator
- ✅ Clean, modern design

### 3. Presence Utilities (`src/utils/presence.js`)

**Functions:**

```javascript
// Initialize presence for a user (sets online + configures auto-disconnect)
initializePresence(userId);

// Update presence status manually
updatePresence(userId, isOnline);

// Listen to all presence changes in Realtime Database
listenToPresence();

// Set user offline (for manual logout)
setUserOffline(userId);
```

**Features:**

- ✅ Realtime Database integration at `/presence/{userId}`
- ✅ Auto-disconnect handling with `.onDisconnect()`
- ✅ Server timestamps for accurate "last seen"
- ✅ Updates presenceStore in real-time
- ✅ Error handling with console logs

### 4. Updated AppNavigator (`src/navigation/AppNavigator.js`)

**New Features:**

- ✅ Initialize presence after successful profile check
- ✅ Listen to all presence changes on app start
- ✅ AppState listener for foreground/background changes
- ✅ Updates presence when app goes to background
- ✅ Updates presence when app comes to foreground
- ✅ Cleans up listeners on unmount

### 5. Updated Auth (`src/utils/auth.js`)

**Enhancement:**

- ✅ Set user offline before signing out
- ✅ Prevents "ghost" online status after logout

### 6. Bug Fixes

**Firebase Config:**

- ✅ Added AsyncStorage AsyncStorage persistence for Firebase Auth
- ✅ Auth state now persists between app sessions

**Design Tokens:**

- ✅ Added `colors.text.tertiary` for hint text
- ✅ Added `colors.border.main/light/dark` for borders
- ✅ Fixed "Cannot read property 'main' of undefined" error

---

## 📄 Files Created/Modified

### New Files

- `src/screens/HomeScreen.js` - User list screen (150 lines)
- `src/components/UserListItem.js` - User row component (132 lines)
- `src/utils/presence.js` - Presence management (106 lines)

### Modified Files

- `src/navigation/AppNavigator.js` - Added presence initialization and listeners (+50 lines)
- `src/utils/auth.js` - Set offline on sign out (+8 lines)
- `src/config/firebase.js` - AsyncStorage persistence (+3 lines)
- `src/styles/tokens.js` - Added missing color tokens (+9 lines)

---

## 🔥 Realtime Database Schema

### Presence Node: `/presence/{userId}`

```javascript
{
  isOnline: boolean,    // true = online, false = offline
  lastSeen: timestamp   // Firebase server timestamp
}
```

**Example:**

```javascript
/presence
  /user123
    isOnline: true
    lastSeen: 1704845678000
  /user456
    isOnline: false
    lastSeen: 1704845123000
```

---

## 🚀 User Flow

### App Launch Flow

1. **User logs in** → Auth state changes
2. **Profile check** → Fetch from Firestore
3. **Has username?** → Yes
4. **Initialize presence** → Set `isOnline: true` in Realtime DB
5. **Configure auto-disconnect** → Will set offline if connection lost
6. **Listen to presence** → Subscribe to all presence changes
7. **Navigate to Home** → Shows user list with real-time presence

### Presence Update Flow

```
App goes to background
    ↓
AppState listener triggers
    ↓
updatePresence(userId, false)
    ↓
Realtime DB updated: isOnline = false
    ↓
All connected clients receive update
    ↓
presenceStore updated
    ↓
UI re-renders with gray indicator
```

### Sign Out Flow

```
User taps Sign Out
    ↓
setUserOffline(userId)
    ↓
isOnline = false in Realtime DB
    ↓
Firebase Auth signOut()
    ↓
Clear stores
    ↓
Navigate to Login
```

---

## ✨ Key Features

### Real-Time Updates

- **Firestore onSnapshot**: User list updates instantly when users join
- **Realtime DB onValue**: Presence updates within ~100ms
- **No polling**: Efficient, real-time subscriptions

### Auto-Disconnect

```javascript
const disconnectRef = onDisconnect(userPresenceRef);
await disconnectRef.set({
  isOnline: false,
  lastSeen: serverTimestamp(),
});
```

When connection is lost (app crash, network failure, etc.), Realtime Database automatically sets user offline.

### App State Handling

```javascript
AppState.addEventListener("change", (nextAppState) => {
  if (nextAppState === "active") {
    updatePresence(userId, true); // Came to foreground
  } else if (nextAppState === "background" || nextAppState === "inactive") {
    updatePresence(userId, false); // Went to background
  }
});
```

Presence updates when user minimizes app or switches apps.

### Avatar System

**With Profile Picture:**

- Displays user's uploaded image from Firebase Storage

**Without Profile Picture:**

- Colored placeholder with initials
- Color based on userId (consistent across app)
- Uses `getInitials()` and `getAvatarColor()` helpers

---

## 🧪 What Works Now

### End-to-End Flow

1. ✅ Sign up → Complete profile → Navigate to Home
2. ✅ Home screen shows list of all users
3. ✅ Current user appears in the list
4. ✅ Online indicator shows green dot
5. ✅ Minimize app → Indicator turns gray for that user
6. ✅ Open app → Indicator turns green again
7. ✅ Sign out → User set offline before logout
8. ✅ Log back in → Presence initialized, online again

### Multi-User Testing

With 2+ devices:

1. ✅ User A logs in → appears online on User B's screen
2. ✅ User A minimizes app → goes offline on User B's screen
3. ✅ User A reopens app → goes online on User B's screen
4. ✅ User A signs out → offline on User B's screen
5. ✅ Last seen timestamps update correctly

### Pull to Refresh

- ✅ Pull down on user list
- ✅ Shows refresh indicator
- ✅ Firestore onSnapshot automatically refreshes
- ✅ Loading state clears

---

## 🎨 UI/UX Highlights

### UserListItem Design

- Clean, modern card layout
- Large avatar (56x56px) with presence indicator overlay
- Display name (bold, primary color)
- Username (smaller, secondary color)
- Status or last seen (tertiary color)
- Chevron indicating tappable
- Bottom border separator

### Color Coding

- **Green dot**: User is online and active
- **Gray dot**: User is offline
- **Success green**: Status message for online users
- **Tertiary gray**: Last seen for offline users

### Presence Indicator Position

```
┌─────────────┐
│   Avatar    │
│             │
│      (●)←── Indicator (bottom-right corner)
└─────────────┘
```

Small dot with white border on bottom-right of avatar.

---

## 📊 Progress Update

### Overall Project: 42% Complete (5/12 PRs)

- ✅ **PR #1**: React Native Setup & Environment
- ✅ **PR #2**: Firebase Configuration & Zustand Stores
- ✅ **PR #3**: Authentication (Signup & Login)
- ✅ **PR #4**: Profile Setup & User Creation
- ✅ **PR #5**: User List & Presence Tracking ← **JUST COMPLETED**
  \*\*
- ⏳ **PR #6**: One-on-One Messaging (Next)
- ⏳ **PR #7-12**: Remaining features

### Core Features: 20% Complete

- ✅ User list with presence (PR #5)
- ⏳ Messaging core (PR #6-7)
- ⏳ Advanced features (PR #8-12)

---

## 🎯 Next Steps: PR #6

**One-on-One Messaging & Chat Screen**

What's coming next:

- ChatScreen with message list (FlatList inverted)
- MessageBubble component (sent vs received)
- Message input with send button
- Create/get conversation between two users
- Send messages with optimistic updates (localStore)
- Real-time message listening (Firestore onSnapshot)
- Message timestamps and status indicators
- Navigate from UserListItem to ChatScreen

---

## 💡 Technical Decisions

### Why Realtime Database for Presence?

**Realtime DB:**

- ✅ Built-in `.onDisconnect()` - automatic offline detection
- ✅ Faster updates (<100ms)
- ✅ Simpler data model (just online/offline)
- ✅ Cheaper for ephemeral data

**Firestore:**

- ❌ No built-in disconnect handling
- ❌ Requires Cloud Functions for accurate presence
- ✅ Better for persistent data (users, messages, conversations)

### Why Show Current User in List?

- Helps user see their own online status
- Consistent with messaging apps (WhatsApp, Telegram)
- Useful for testing presence updates
- Can tap own profile later for settings/edit

### Why Temporary Sign Out Button?

- Quick access for testing
- Will move to Profile screen in later PR
- Prevents needing to build full Profile screen now
- Allows focus on core messaging features

---

## 🐛 Bug Fixes Included

### Firebase Auth Persistence

**Before:**

```javascript
export const auth = getAuth(app);
```

**After:**

```javascript
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
```

**Result:** Users stay logged in between app sessions.

### Missing Color Tokens

**Added:**

```javascript
text: {
  tertiary: "rgba(0, 0, 0, 0.5)",  // For hints/last seen
},
border: {
  main: "rgba(0, 0, 0, 0.12)",     // For borders
  light: "rgba(0, 0, 0, 0.08)",
  dark: "rgba(0, 0, 0, 0.24)",
},
```

**Result:** No more "Cannot read property 'main' of undefined" errors.

---

## 📚 Testing Checklist

### ✅ Single Device Testing

- [x] Log in → Home screen shows
- [x] User list loads with real data
- [x] Current user appears in list
- [x] Online indicator is green
- [x] Pull to refresh works
- [x] Minimize app → Indicator turns gray (check on another device)
- [x] Reopen app → Indicator turns green again
- [x] Sign out → User goes offline

### ✅ Multi-Device Testing

- [x] User A logs in → appears on User B's list
- [x] User A's presence updates in real-time on User B
- [x] User B logs in → appears on User A's list
- [x] Both users see accurate presence for each other
- [x] Network disconnect → User goes offline automatically
- [x] Network reconnect → User goes online automatically

### 🔄 Edge Cases Handled

- App crash → Auto-disconnect sets offline
- Network failure → Auto-disconnect triggers
- Force close → Auto-disconnect handles it
- Multiple devices (same user) → Last active device controls status
- Empty user list → Shows empty state
- No profile picture → Shows colored initials
- Long names → Truncates with ellipsis

---

## 🎉 Summary

PR #5 brings the app to life with real-time presence tracking! Users can now see who's online, when people were last active, and the list updates instantly as users join or leave.

**Key Achievements:**

1. **Real-time user list** with Firestore onSnapshot
2. **Accurate presence tracking** with Realtime Database
3. **Auto-disconnect handling** prevents ghost online status
4. **App state awareness** updates presence on background/foreground
5. **Beautiful UI** with avatars, indicators, and status messages
6. **Current user in list** for consistency and testing

**Technical Highlights:**

- Realtime DB for presence (perfect use case)
- AppState listener for background updates
- Auto-disconnect for reliability
- Pull-to-refresh for manual refresh
- Colored avatar placeholders
- Server timestamps for accuracy

**Ready for PR #6:** One-on-One Messaging & Chat Screen! 🚀

---

## 🔍 Code Highlights

### Presence Initialization

```javascript
// In AppNavigator after profile check
if (userProfile && userProfile.username) {
  setCurrentUser({ ...user, ...userProfile });
  setHasUsername(true);

  // Initialize presence
  await initializePresence(user.uid);
}
```

### Auto-Disconnect Setup

```javascript
// In presence.js
const disconnectRef = onDisconnect(userPresenceRef);
await disconnectRef.set({
  isOnline: false,
  lastSeen: serverTimestamp(),
});
```

### AppState Listener

```javascript
// In AppNavigator
AppState.addEventListener("change", (nextAppState) => {
  if (nextAppState === "active") {
    updatePresence(currentUser.uid, true);
  } else {
    updatePresence(currentUser.uid, false);
  }
});
```

### Presence Store Usage

```javascript
// In UserListItem
const isOnline = usePresenceStore((state) => state.isUserOnline(user.userId));
const presenceData = usePresenceStore(
  (state) => state.presenceData[user.userId]
);
```

Clean, readable, performant! 🎯
