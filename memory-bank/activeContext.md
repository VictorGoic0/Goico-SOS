# Active Context: Mobile Messaging App

## Current Work Focus

### Project Status: **Development Phase - One-on-One Messaging Complete (PR #6)**

The project has completed PRs #1-6, establishing core messaging functionality with real-time chat and optimistic updates.

### Completed PRs

1. ✅ **PR #1**: React Native Setup & Environment Configuration
2. ✅ **PR #2**: Firebase Configuration & Zustand Stores
3. ✅ **PR #3**: Authentication (Signup & Login)
4. ✅ **PR #4**: Profile Setup & User Creation in Firestore
5. ✅ **PR #5**: User List & Presence Tracking
6. ✅ **PR #6**: One-on-One Messaging & Chat Screen

### Immediate Next Steps

1. **PR #7**: Message Status Tracking & Offline Support
2. **PR #8**: Group Chats
3. **PR #9**: Push Notifications

## Recent Changes

### PR #6: One-on-One Messaging & Chat Screen (Just Completed)

**What was built:**

- ✅ ChatScreen with real-time message list
- ✅ MessageBubble component (sent vs received styling)
- ✅ Message input with send button
- ✅ Conversation utilities (getOrCreateConversation, sendMessage)
- ✅ Optimistic updates with localStore (messages show instantly)
- ✅ Real-time message listener (Firestore onSnapshot)
- ✅ Message timestamps and status indicators (✓ = sent, ✓✓ = delivered, 🕐 = sending)
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

### New: Username-Gating Pattern

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
