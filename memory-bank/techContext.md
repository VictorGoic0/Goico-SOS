# Technical Context: Mobile Messaging App

## Technology Stack

### Frontend Framework

- **React Native**: Cross-platform mobile development
- **Expo**: Managed workflow for simplified development and deployment
- **React Navigation**: Native navigation library for React Native

### State Management

- **Zustand**: Lightweight state management with 3-store architecture
- **Pattern**: Local Store + Presence Store + Firebase Store separation

### Backend & Real-Time Services

- **Firebase Platform**: Complete backend-as-a-service
  - **Firebase Auth**: User authentication (email/password)
  - **Firestore**: Document database for messages, profiles, conversations
  - **Realtime Database**: Real-time presence tracking
  - **Firebase Storage**: Image and file storage
  - **Cloud Functions**: Serverless functions for push notifications

### AI Integration

- **Vercel AI SDK**: Unified AI SDK for multiple providers
- **OpenAI GPT-4**: Large language model for chat assistance
- **Features**: Conversation summaries, smart replies, context-aware responses

### Push Notifications

- **Expo Notifications**: Cross-platform notification handling
- **Firebase Cloud Messaging**: Notification delivery service
- **Cloud Functions**: Trigger notifications on new messages

### Development Tools

- **Package Manager**: npm
- **Testing**: Manual testing only (no automated tests for MVP)
- **Deployment**: Expo EAS Build for iOS and Android
- **Version Control**: Git with GitHub

## Development Environment

### Prerequisites

- **Node.js**: v18 or later
- **npm**: Package manager
- **Expo CLI**: Global installation for project management
- **Expo Go App**: For testing on physical devices

### Project Setup

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

### Environment Configuration

```bash
# .env file
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

## Firebase Configuration

### Project Setup

1. **Create Firebase Project**: Go to Firebase Console
2. **Enable Services**:
   - Authentication (Email/Password)
   - Firestore Database (test mode initially)
   - Realtime Database (test mode initially)
   - Storage (test mode initially)
3. **Get Configuration**: Web app configuration object
4. **Set Security Rules**: Firestore and Realtime Database rules

### Firebase Initialization

```javascript
// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
});
export const realtimeDb = getDatabase(app);
export const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Persistence failed: Multiple tabs open");
  } else if (err.code === "unimplemented") {
    console.warn("Persistence not supported");
  }
});
```

## Project Structure

### Directory Organization

```
messaging-app/
├── src/
│   ├── screens/           # Screen components
│   │   ├── SignupScreen.js
│   │   ├── LoginScreen.js
│   │   ├── ProfileSetupScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ChatScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── CreateGroupScreen.js
│   │   ├── GroupInfoScreen.js
│   │   └── AIChatScreen.js
│   ├── components/        # Reusable components
│   │   ├── MessageBubble.js
│   │   ├── UserListItem.js
│   │   └── design-system/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       └── Input.jsx
│   ├── stores/           # Zustand stores
│   │   ├── localStore.js
│   │   ├── presenceStore.js
│   │   └── firebaseStore.js
│   ├── config/           # Configuration files
│   │   └── firebase.js
│   ├── utils/            # Utility functions
│   │   ├── auth.js
│   │   ├── userProfile.js
│   │   ├── messaging.js
│   │   ├── presence.js
│   │   ├── notifications.js
│   │   ├── aiService.js
│   │   └── helpers.js
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.js
│   └── styles/          # Design tokens and styles
│       └── tokens.js
├── functions/            # Firebase Cloud Functions
│   └── index.js
├── .env                 # Environment variables
├── .gitignore
├── app.json            # Expo configuration
├── package.json
└── README.md
```

## Dependencies

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

### Key Package Explanations

#### Firebase

- **firebase**: Complete Firebase SDK for React Native
- **Features**: Auth, Firestore, Realtime Database, Storage, Cloud Functions

#### Zustand

- **zustand**: Lightweight state management
- **Benefits**: Simple API, TypeScript support, no providers needed
- **Pattern**: Multiple stores for different concerns

#### React Navigation

- **@react-navigation/native**: Core navigation library
- **@react-navigation/native-stack**: Stack navigator implementation
- **react-native-screens**: Native screen components for better performance
- **react-native-safe-area-context**: Safe area handling for different devices

#### Expo Modules

- **expo-image-picker**: Camera and photo library access
- **expo-notifications**: Push notification handling

#### AI Integration

- **ai**: Vercel AI SDK for unified AI provider interface
- **openai**: OpenAI API client for GPT-4 integration

## Technical Constraints

### React Native Limitations

- **No DOM**: Use React Native components instead of HTML
- **Styling**: StyleSheet instead of CSS
- **Navigation**: React Navigation instead of browser routing
- **Platform Differences**: iOS and Android may behave differently

### Expo Managed Workflow

- **Benefits**: Simplified development, easy deployment, built-in modules
- **Limitations**: Some native modules may not be available
- **Alternative**: Eject to bare React Native if needed (not recommended for MVP)

### Firebase Limitations

- **Firestore**: Document size limits, query limitations
- **Realtime Database**: JSON structure limitations
- **Storage**: File size and type restrictions
- **Functions**: Cold start delays, execution time limits

### Performance Considerations

- **FlatList**: Use for large lists instead of ScrollView
- **Image Loading**: Optimize image sizes and loading
- **State Updates**: Minimize unnecessary re-renders
- **Memory**: Clean up listeners and subscriptions

## Development Workflow

### Local Development

```bash
# Start development server
npx expo start

# Scan QR code with Expo Go app
# Or press 'i' for iOS simulator
# Or press 'a' for Android emulator
```

### Testing on Devices

1. **Install Expo Go**: Download from App Store/Google Play
2. **Scan QR Code**: Use camera (iOS) or Expo Go app (Android)
3. **Hot Reload**: Changes appear instantly on device
4. **Debug**: Shake device to open debug menu

### Deployment Process

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Security Considerations

### Firebase Security Rules

- **Firestore**: Restrict access to authenticated users only
- **Realtime Database**: User can only write to their own presence node
- **Storage**: Authenticated users can upload profile photos

### Environment Variables

- **API Keys**: Store in .env file, never commit to version control
- **Firebase Config**: Use environment variables for all sensitive data
- **OpenAI Key**: Keep API key secure and monitor usage

### Data Privacy

- **User Data**: Store only necessary user information
- **Messages**: No end-to-end encryption (out of scope for MVP)
- **AI Data**: OpenAI may log conversations (disclose to users)

## Performance Targets

### MVP Performance Goals

- **Message send latency**: <500ms (local optimistic update: instant)
- **Message receive latency**: <500ms (Firestore real-time)
- **Message status update**: <200ms (Firestore write)
- **User list loads**: <2 seconds
- **Presence updates**: <100ms (Realtime Database)
- **App handles 50+ users**: Without lag
- **Offline message queue**: Unlimited (Firestore handles)
- **Profile photo upload**: <5 seconds for typical images

### Optimization Strategies

- **FlatList**: Use for message lists with proper configuration
- **Image Optimization**: Compress images before upload
- **State Management**: Minimize store updates
- **Lazy Loading**: Load conversations and messages on demand
- **Caching**: Leverage Firestore offline persistence

## Troubleshooting Common Issues

### React Native Issues

- **Metro bundler errors**: Clear cache with `npx expo start --clear`
- **Hot reload not working**: Shake device and select "Reload"
- **Platform differences**: Test on both iOS and Android

### Firebase Issues

- **Permission denied**: Check Firestore security rules
- **Offline not working**: Verify persistence is enabled
- **Presence not updating**: Check Realtime Database rules

### Expo Issues

- **QR code not working**: Update Expo Go app
- **Build failures**: Check EAS configuration
- **Module not found**: Verify package installation

## Future Technical Considerations

### Scalability

- **User Growth**: Implement pagination for user lists
- **Message Volume**: Consider message archiving strategy
- **AI Usage**: Monitor OpenAI API costs and usage limits

### Platform Expansion

- **Web Version**: Consider React Native Web
- **Desktop**: Electron wrapper possibility
- **API**: REST API for third-party integrations

### Advanced Features

- **Real-time Collaboration**: Extend 3-store pattern
- **Offline Sync**: Advanced conflict resolution
- **Performance**: Implement advanced caching strategies
