# Username-Gating Pattern

## Overview

The username-gating pattern ensures users complete their profile setup before accessing the main app. This is a critical onboarding flow that creates the user's Firestore document on first login.

## Core Concept

**Username = Profile Completion Check**

- ✅ Has username → Profile complete → Access main app
- ❌ No username → Profile incomplete → Show ProfileSetupScreen (one-time only)

## Implementation

### 1. Navigation Check (AppNavigator.js)

```javascript
// On auth state change:
1. User logs in (Firebase Auth)
2. Fetch user document from Firestore
3. Check if username exists
4. Route accordingly:
   - No username → ProfileSetupScreen
   - Has username → Home screen
```

### 2. Profile Setup Flow (ProfileSetupScreen.js)

```javascript
User completes form:
1. Username (REQUIRED) - unique, lowercase, 3-20 chars
2. Display Name (OPTIONAL) - defaults to username
3. Bio (OPTIONAL) - max 200 chars
4. Profile Picture (OPTIONAL) - uploaded to Storage

On submit:
1. Validate username format
2. Check username uniqueness in Firestore
3. Upload profile image to Firebase Storage (if provided)
4. Create user document in Firestore
5. Update currentUser in store
6. Navigation automatically updates → Home screen
```

### 3. User Document Schema

```javascript
/users/{userId}
{
  userId: string,           // Firebase Auth UID
  username: string,         // REQUIRED - unique, lowercase
  displayName: string,      // Display name or username
  email: string,            // From Firebase Auth
  imageURL: string | null,  // Firebase Storage URL
  bio: string | null,       // Optional bio
  status: string,           // Default: "Available"
  pushToken: string | null, // For push notifications
  createdAt: timestamp,
  lastEdit: timestamp
}
```

## Key Files

### `src/navigation/AppNavigator.js`

- Auth state listener with async profile check
- Conditional navigation based on username existence
- Loading state while fetching profile

### `src/screens/ProfileSetupScreen.js`

- Form with username, display name, bio, profile picture
- Username validation and uniqueness checking
- Profile image picker with expo-image-picker
- Creates Firestore user document on submit

### `src/utils/profile.js`

- `getUserProfile(userId)` - Fetch user from Firestore
- `createUserProfile(profileData)` - Create user document
- `updateUserProfile(userId, updates)` - Update user document
- `checkUsernameExists(username)` - Check uniqueness
- `uploadProfileImage(userId, imageUri)` - Upload to Storage

## Username Requirements

### Validation Rules

- ✅ **Required**: Must have a value
- ✅ **Length**: 3-20 characters
- ✅ **Characters**: Alphanumeric + underscore only (`[a-zA-Z0-9_]`)
- ✅ **Uniqueness**: Must not exist in Firestore
- ✅ **Storage**: Stored as lowercase for consistency

### Why These Rules?

- **Permanent**: Username cannot be changed (important for mentions, references)
- **Unique**: Each user has a distinct identifier
- **Searchable**: Used for finding/adding users
- **Display**: Can be different from display name (username: "johndoe", display: "John Doe")

## Error Handling

### Username Taken

```javascript
if (usernameExists) {
  error.code = "username-taken";
  setErrors({ username: "This username is already taken" });
}
```

### Network Error

```javascript
catch (error) {
  if (error.code === "network-error") {
    Alert.alert("Network Error", "Please check your connection");
  }
}
```

### Image Upload Failure

```javascript
// Continue without image rather than failing entire operation
try {
  imageURL = await uploadProfileImage(userId, imageUri);
} catch (uploadError) {
  console.error("Failed to upload image, continuing without it");
  // Profile creation continues with imageURL = null
}
```

## Future Enhancements

### Strict Gating (Planned for Later PR)

Currently, navigation simply shows ProfileSetupScreen for users without username. Future enhancement will add strict gating:

```javascript
// Prevent access to ANY screen without username
if (!currentUser.username) {
  // Block navigation to:
  // - Home screen
  // - Chat screens
  // - Profile screens
  // - Any main app screens
  // Only allow:
  // - ProfileSetupScreen
  // - Sign out
}
```

### Username Change (Not Planned)

Username is designed to be permanent. If username change is needed in the future, consider:

- Impact on conversations (participantUsernames array)
- Impact on messages (senderUsername field)
- Impact on user search/mentions
- Migration strategy for existing data

## Testing Checklist

### New User Flow

1. ✅ Sign up with email/password
2. ✅ Automatically shown ProfileSetupScreen
3. ✅ Fill in username (required)
4. ✅ Optionally add display name, bio, profile picture
5. ✅ Submit and navigate to Home screen
6. ✅ User document created in Firestore

### Returning User Flow

1. ✅ Log in with credentials
2. ✅ System fetches user document from Firestore
3. ✅ Username exists → Navigate to Home screen
4. ✅ ProfileSetupScreen never shown again

### Edge Cases

- ✅ Username already taken → Show error
- ✅ Network error during profile creation → Show error
- ✅ Image upload fails → Continue without image
- ✅ User closes app during profile setup → Show ProfileSetupScreen on next login
- ✅ Multiple tabs/devices → Username uniqueness maintained by Firestore query

## Benefits

### User Experience

- ✅ Smooth onboarding flow
- ✅ Clear progress (username required to continue)
- ✅ Optional fields don't block progress
- ✅ One-time setup, never asked again

### Technical

- ✅ Simple boolean check (has username = complete)
- ✅ Single source of truth (Firestore)
- ✅ No complex state management
- ✅ Works offline (Firestore cache)
- ✅ Consistent across devices

### Future-Proof

- ✅ Easy to add strict gating later
- ✅ Easy to add more profile fields
- ✅ Username as permanent identifier
- ✅ Display name can be changed independently
