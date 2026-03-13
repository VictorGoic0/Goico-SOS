# Messaging App - Implementation Task List (Part 3)

## PR #17: Dark Mode & Message Reactions

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
- [ ] Save theme preference to Firestore user document (or AsyncStorage for device persistence)
- [ ] Load theme preference on app start
- [ ] Apply theme to all screens

**ThemeContext with Device Persistence (optional consolidation):**

- [ ] File: `mobile-app/src/contexts/ThemeContext.js` (or `src/contexts/ThemeContext.js`)
- [ ] Create theme context with AsyncStorage persistence and system preference:
  - Use `useColorScheme()` from React Native for system theme
  - State: `themeMode` — `'light' | 'dark' | 'system'`
  - Load saved theme from AsyncStorage on mount
  - Expose `setTheme(mode)` that saves to AsyncStorage and updates state
  - Compute `isDark` from `themeMode === 'system' ? systemColorScheme : themeMode`
- [ ] File: `mobile-app/src/styles/tokens.js` (or equivalent): add `colors.light` and `colors.dark` with background, surface, text, border, primary, etc., mirroring light theme with dark variants
- [ ] Wrap app in `ThemeProvider` in `App.js`; render `AppNavigator` and `StatusBar style="auto"` inside
- [ ] In Profile screen: add "Appearance" section with theme selector — Light / System / Dark (TouchableOpacity per option, call `setTheme`)
- [ ] Apply theme to all screens: HomeScreen, ChatScreen, ProfileScreen, GroupInfoScreen, CreateGroupScreen, ThreadSummaryModal, ActionItemsScreen, DecisionsScreen, AgentChatScreen (use `useTheme()` and `colors.dark` / `colors.light` per `isDark`)

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

## PR #18: AI Features Polish & Integration (completed items)

**Goal**: Polish all AI features — expo-image, push/PC behavior, Android deployment (completed and tested)

### Subtasks

**Implement expo-image for Production-Quality Image Caching:**

**Note:** Using `expo-image` instead of `react-native-fast-image` because FastImage requires native code and doesn't work with Expo Go. expo-image provides similar benefits (disk caching, smooth scrolling, memory efficiency) while maintaining fast development workflow.

- [x] 16. Install expo-image:

  ```bash
  cd mobile-app
  npx expo install expo-image
  ```

- [x] 17. Update `MessageBubble.js` to use expo-image:

  ```javascript
  // Change import from:
  import { Image } from "react-native";
  // To:
  import { Image } from "expo-image";

  // Replace sender avatar Image (around line 56)
  {sender?.imageURL ? (
    <Image
      source={{ uri: sender.imageURL }}
      style={styles.senderAvatar}
      contentFit="cover"
      priority="normal"
      cachePolicy="memory-disk"
    />
  ) : (
    // ... existing placeholder code
  )}

  // Replace mini avatars Image (around line 156)
  <Image
    key={userId}
    source={{ uri: user.imageURL }}
    style={[
      styles.miniAvatar,
      index > 0 && styles.miniAvatarOverlap,
    ]}
    contentFit="cover"
    priority="normal"
    cachePolicy="memory-disk"
  />
  ```

- [x] 18. Update `UserListItem.js` to use expo-image:

  ```javascript
  // Change import from:
  import { Image } from "react-native";
  // To:
  import { Image } from "expo-image";

  // Replace user avatar Image (around line 85)
  {user.imageURL ? (
    <Image
      source={{ uri: user.imageURL }}
      style={styles.avatar}
      contentFit="cover"
      priority="high"  // High priority for user list
      cachePolicy="memory-disk"
    />
  ) : (
    // ... existing placeholder code
  )}
  ```

- [x] 19. Update `ChatScreen.js` header to use expo-image:

  ```javascript
  // Change import from:
  import { Image } from "react-native";
  // To:
  import { Image } from "expo-image";

  // Replace header avatars (around line 330 and 348)

  // Group avatar:
  {conversation?.groupImageURL ? (
    <Image
      source={{ uri: conversation.groupImageURL }}
      style={styles.headerAvatar}
      contentFit="cover"
      priority="high"
      cachePolicy="memory-disk"
    />
  ) : (
    // ... existing placeholder code
  )}

  // 1-on-1 avatar:
  {otherUser?.imageURL ? (
    <Image
      source={{ uri: otherUser.imageURL }}
      style={styles.headerAvatar}
      contentFit="cover"
      priority="high"
      cachePolicy="memory-disk"
    />
  ) : (
    // ... existing placeholder code
  )}
  ```

- [x] 20. Update any other Image components for profile pictures:

  - ✅ `GroupInfoScreen.js` - Updated participant avatars and group photo (2 Image components)
  - ✅ `ProfileScreen.js` - Updated profile photo (1 Image component)
  - ✅ `CreateGroupScreen.js` - Updated participant avatars and group photo preview (2 Image components)
  - ✅ `HomeScreen.js` - Updated header profile photo and group conversation avatars (2 Image components)
  - ✅ All profile image `Image` components now use expo-image with proper caching props

  **Note**: expo-image automatically handles pre-loading efficiently. Manual Image.prefetch() is optional and not needed for this app.

**Why This Matters for Production:**

- **Persistent Disk Caching**: Images cached between app sessions (not just in memory)
- **60fps Scrolling**: Background decoding keeps UI smooth
- **Memory Efficient**: Auto-downsampling to display size (reduces RAM usage significantly)
- **Request Deduplication**: Same image URL = single network request
- **Instant Loading**: Cached images appear in <100ms vs 500-2000ms
- **Reduced Data Usage**: Critical for users on limited data plans
- **Expo-managed**: Works with Expo Go, no native build required
- **Modern API**: Clean interface with contentFit, priority, cachePolicy props

**Fix Push Notifications on PC (Windows/Mac Desktop):**

- [x] 25. Investigate why push notifications don't work on PC:

  - ✅ Expo notifications require different setup for web (VAPID keys)
  - ✅ Web push uses Web Push Protocol (different from mobile APNs/FCM)
  - ✅ This is expected behavior - web and mobile use different push systems
  - ✅ Findings documented below

- [x] 26. ~~If desktop push notifications are supported~~ (Skipped - web push requires VAPID)

  - N/A - Web push requires VAPID configuration and service workers
  - Not needed for MVP - mobile push is the priority
  - Can be added later if web push becomes a requirement

- [x] 27. Desktop push notifications are NOT supported (documented):
  - ✅ Added platform check to gracefully skip web platform
  - ✅ Web users can still use app fully (Firebase real-time listeners work)
  - ✅ Console message explains why push notifications are skipped
  - ✅ No error thrown - graceful degradation implemented
  - 📝 **Result**: Web app works perfectly, just no push notifications banner
  - 📝 **Alternative**: Users on web still get real-time message updates via Firebase
  - 📝 **Future Enhancement**: Could add VAPID setup for web push if needed

**Fix Android Deployed Build Issues:**

- [x] 28. Investigate Android deployment breaking:

  - ✅ **Root Cause #1**: Missing `android.package` in `app.json`
  - ✅ **Root Cause #2**: `newArchEnabled: true` was forcing custom dev builds
  - ✅ **Root Cause #3**: `expo-dev-client` package was installed (requires custom builds)
  - ✅ **Root Cause #4**: Notification registration blocking Android emulator
  - ✅ **Solution**: Removed blockers and added platform-aware checks

- [x] 29. Applied Android build fixes:

  - ✅ Added `android.package: "com.victormgoico.messagingapp"` to `app.json`
  - ✅ Removed `newArchEnabled: true` from `app.json` (not needed for Expo Go)
  - ✅ Removed `expo-dev-client` package from `package.json`
  - ✅ Updated notification registration to be platform-aware:
    - iOS simulator: blocked (no APNs support)
    - Android emulator: allowed (works with Expo Go)
    - Web: blocked (requires VAPID keys)

- [x] 30. Test Android deployment:

  - ✅ App opens on Android emulator via `npx expo start` + press `a`
  - ✅ Push notifications work on Android emulator
  - ✅ All features work correctly (messaging, profiles, groups)
  - ✅ Cache clearing: Must clear from emulator settings (terminal cache clear doesn't work)
  - 📝 **Note**: Using Expo Go (no custom build needed)

- [x] 31. Document Android deployment process:
  - ✅ Updated README with Android emulator setup steps
  - ✅ Documented cache clearing process for emulator
  - ✅ Added platform check explanations
  - ✅ Noted that Expo Go works for all features with platform-aware checks

**Files Modified (PR #18 completed work):**

- `mobile-app/src/components/MessageBubble.js` (expo-image for avatars)
- `mobile-app/src/components/UserListItem.js` (expo-image for user list)
- `mobile-app/src/screens/ChatScreen.js` (expo-image)
- `mobile-app/src/screens/GroupInfoScreen.js` (expo-image for group photos)
- `mobile-app/src/screens/ProfileScreen.js` (expo-image)
- `mobile-app/src/screens/CreateGroupScreen.js` (expo-image for participant selection)
- `mobile-app/src/screens/HomeScreen.js` (expo-image)
- `app.json` (Android package, notification platform checks)

**Test Before Merge (tested ✅):**

- [x] 53. expo-image installed and working across all profile images
- [x] 54. Message bubbles load profile pictures instantly on repeated views
- [x] 55. Group chat avatars load smoothly without staggered appearance
- [x] 56. Scrolling remains smooth (60fps) while images load
- [x] 57. Images persist in cache after app restart
- [x] 59. Push notifications resolved for PC (or documented as unsupported)
- [x] 60. Android build successfully deploys and runs
- [x] 61. All features work correctly on Android device

---

## PR #19: AI Features Polish & Integration (remaining work)

**Goal**: Complete remaining polish — error handling, health check, read receipts, documentation, and optional enhancements

### Subtasks

**Add Error Handling Improvements:**

- [ ] 1. File: `backend/lib/error-handler.ts`
- [ ] 2. Create centralized error handler:

  ```typescript
  export class AIServiceError extends Error {
    constructor(
      message: string,
      public statusCode: number = 500,
      public code?: string
    ) {
      super(message);
      this.name = "AIServiceError";
    }
  }

  export function handleAPIError(error: unknown) {
    console.error("API Error:", error);

    if (error instanceof AIServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    // OpenAI specific errors
    if (error.message?.includes("rate_limit")) {
      return NextResponse.json(
        { error: "AI service rate limit reached. Please try again later." },
        { status: 429 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
  ```

**Improve Mobile Error Handling:**

- [ ] 3. File: `mobile-app/src/services/aiService.js`
- [ ] 4. Enhance error messages:

  ```javascript
  const callBackend = async (endpoint, body) => {
    try {
      const response = await fetch(`${API_URL}/api/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": getCurrentUserId(),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          const resetAt = new Date(data.resetAt);
          throw new Error(
            `Rate limit exceeded. Try again at ${resetAt.toLocaleTimeString()}`
          );
        }

        if (response.status === 404) {
          throw new Error("No messages found in this conversation");
        }

        throw new Error(`Server error (${response.status}). Please try again.`);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes("Network request failed")) {
        throw new Error(
          "Connection failed. Check your internet and try again."
        );
      }
      throw error;
    }
  };
  ```

**Add Loading Skeletons:**

- [ ] 5. Create skeleton components for AI screens:

  ```javascript
  // In each AI screen, show skeleton while loading:
  {
    loading && (
      <View style={styles.skeleton}>
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLine} />
      </View>
    );
  }
  ```

**Create Backend Health Check:**

- [ ] 6. File: `backend/app/api/health/route.ts`
- [ ] 7. Implement health check endpoint:

  ```typescript
  import { NextResponse } from "next/server";
  import { db } from "@/lib/firebase-admin";

  export async function GET() {
    try {
      // Test Firebase connection
      await db.collection("_health").doc("check").get();

      return NextResponse.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          firebase: "ok",
          openai: "ok",
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          status: "unhealthy",
          error: error.message,
        },
        { status: 503 }
      );
    }
  }
  ```

**Update Backend README:**

- [ ] 8. File: `backend/README.md`
- [ ] 9. Document:
  - All API endpoints
  - Request/response formats
  - Error codes
  - Environment variables
  - Testing instructions

**Deploy Final Backend:**

- [ ] 10. Deploy to Vercel:

  ```bash
  cd backend
  vercel --prod
  ```

**Add Read Receipt Settings:**

- [ ] 11. In `src/screens/ProfileScreen.js`:

  - Add toggle: "Send Read Receipts" (default: enabled)
  - Save preference to Firestore user document
  - Respect user's privacy choice

- [ ] 12. Update read receipt logic:
  - Only send read receipts if user has enabled them
  - Still show received read receipts regardless of setting

**Push Notification Profile Photos (Nice-to-Have):**

Note: Currently, profile photos are included in notification data but don't display in the notification banner. These are optional enhancements:

- [ ] 13. **Option 1: iOS Notification Service Extension**

  - Requires native Swift/Objective-C code
  - Intercepts notification before display
  - Downloads image from URL and attaches to notification
  - Requires EAS Build or ejecting from Expo
  - Most control, but highest complexity

- [ ] 14. **Option 2: Android Native Configuration**

  - Configure large icon support via Expo config plugins
  - Easier than iOS implementation
  - Still requires EAS Build (not Expo Go)
  - Better Android notification appearance

- [ ] 15. **Option 3: EAS Build + Config Plugin (Recommended)**

  - Use Expo's build service instead of Expo Go
  - Add notification config plugin to `app.json`
  - Maintains most of Expo's managed workflow
  - Example config:
    ```json
    {
      "expo": {
        "plugins": [
          [
            "expo-notifications",
            {
              "icon": "./assets/icon.png",
              "sounds": ["./assets/notification-sound.wav"]
            }
          ]
        ]
      }
    }
    ```

- [ ] 16. **Option 4: Eject to Bare React Native**
  - Full native control over notifications
  - Implement custom notification service extensions
  - Lose Expo's managed workflow benefits
  - Maximum flexibility, maximum complexity

**Test All AI Features:**

- [ ] 17. Thread summarization with various conversation types
- [ ] 18. Action item extraction with different task formats
- [ ] 19. Semantic search with complex queries
- [ ] 20. Priority detection with various urgency levels
- [ ] 21. Decision tracking with different decision types
- [ ] 22. Multi-step agent with complex workflows
- [ ] 23. Error handling (invalid inputs, network errors)
- [ ] 24. Dark mode (all AI screens)
- [ ] 25. Performance (response times meet targets)
- [ ] 26. Image loading performance with expo-image (smooth scrolling, instant cached images)

**Files Created:**

- `backend/lib/error-handler.ts` (error handling)
- `backend/app/api/health/route.ts` (health check)

**Files Modified:**

- Backend API routes (add error handling)
- All mobile AI screens (dark mode support)
- `mobile-app/src/services/aiService.js` (improved error handling)
- `backend/README.md` (complete documentation)

**Test Before Merge:**

- [ ] 27. All AI features work in dark mode
- [ ] 28. Error handling is user-friendly
- [ ] 29. Health check endpoint works
- [ ] 30. All features work offline (with cached data)
- [ ] 31. Performance meets targets
- [ ] 32. Documentation is complete and accurate
- [ ] 33. Backend is production-ready
- [ ] 34. Read receipt settings toggle works in ProfileScreen
- [ ] 35. Read receipts respect user privacy settings
- [ ] 36. Memory usage improved (check via profiler if needed)
