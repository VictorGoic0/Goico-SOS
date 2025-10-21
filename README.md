# Mobile Messaging App

A modern real-time messaging platform built with React Native and Expo, designed for remote team professionals. Features include one-on-one and group chats, user presence tracking, message delivery status, offline support, and AI-powered assistance for enhanced productivity.

## 📖 Project Overview

This messaging app provides a seamless communication experience with:

- **Real-time sync** across devices using Firebase
- **Reliable message delivery** with status tracking (sending → sent → delivered → read)
- **Offline-first architecture** that queues messages when disconnected
- **User presence system** showing online/offline status and last seen timestamps
- **AI assistance** for conversation summaries, action items, and smart search
- **Cross-platform support** for iOS and Android

Built as a learning project to demonstrate production-grade mobile development practices including optimistic updates, 3-store state management architecture, and Firebase real-time features.

## 🚀 Features

- **Real-time Messaging**: One-on-one and group conversations with instant delivery
- **User Presence**: Live online/offline status tracking
- **Message Status**: Track message delivery (sending → sent → delivered → read)
- **Offline Support**: Messages queue automatically and sync when reconnected
- **Profile Management**: Customizable user profiles with photos
- **Push Notifications**: Stay connected even when the app is closed
- **AI Assistant**: Context-aware chat assistance and conversation summaries

## 📋 Prerequisites

- **Node.js**: v18 or later ([Download](https://nodejs.org))
- **Expo Go App**: Install on your phone
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "Week 2 - Mobile Messaging App"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase** (Required for full functionality)

   See the detailed [Firebase Setup Guide](#-firebase-setup) below

## 🚀 Running the App

1. **Start the Expo development server**

   ```bash
   npx expo start
   ```

2. **Open on your device**

   - **iOS**: Scan the QR code with your iPhone camera
   - **Android**: Scan the QR code in the Expo Go app
   - **Emulator**: Press `a` for Android or `i` for iOS (Mac only)

3. **See changes live**
   - Edit any file and save
   - Changes appear instantly on your device (hot reload)

## 📁 Project Structure

```
Week 2 - Mobile Messaging App/
├── App.js                    # Main app entry point
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (Firebase config)
├── assets/                   # Images, icons, splash screens
└── src/                      # Application source code
    ├── screens/              # Screen components (Login, Chat, etc.)
    ├── components/           # Reusable UI components
    ├── stores/               # Zustand state management (3-store pattern)
    │   ├── localStore.js     # Local/optimistic updates
    │   ├── presenceStore.js  # User presence data
    │   └── firebaseStore.js  # Firebase data (source of truth)
    ├── config/
    │   └── firebase.js       # Firebase initialization
    ├── utils/                # Helper functions
    │   ├── auth.js           # Authentication utilities
    │   ├── messaging.js      # Message sending/receiving
    │   ├── presence.js       # Presence tracking
    │   └── helpers.js        # General utilities
    └── navigation/
        └── AppNavigator.js   # Navigation configuration
```

## 🏗️ Architecture

This app uses a **3-store Zustand architecture** for optimal real-time performance:

- **Local Store**: Optimistic updates, pending messages (instant UI feedback)
- **Presence Store**: Real-time user online/offline status (Realtime Database)
- **Firebase Store**: Source of truth for all data (Firestore)

## 🔧 Tech Stack

- **Frontend**: React Native, Expo
- **State Management**: Zustand (3-store pattern)
- **Backend**: Firebase
  - Authentication (email/password)
  - Firestore (messages, profiles, conversations)
  - Realtime Database (user presence)
  - Storage (profile photos)
  - Cloud Functions (push notifications)
- **Navigation**: React Navigation
- **AI**: Vercel AI SDK with OpenAI GPT-4

## 🔥 Firebase Setup

This app requires Firebase for authentication, real-time messaging, user presence, and file storage. Follow these steps to set up your Firebase project:

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "messaging-app")
4. Disable Google Analytics (optional for MVP)
5. Click "Create project"

### 2. Enable Firebase Services

#### Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

#### Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (we'll add rules later)
4. Choose a location closest to your users
5. Click "Enable"

#### Realtime Database

1. Go to **Build** → **Realtime Database**
2. Click "Create Database"
3. Start in **test mode**
4. Choose a location
5. Click "Enable"

#### Storage

1. Go to **Build** → **Storage**
2. Click "Get started"
3. Start in **test mode**
4. Click "Done"

### 3. Get Firebase Configuration

1. In Project Overview, click the **Web** icon (`</>`)
2. Register your app with a nickname (e.g., "messaging-app-web")
3. Copy the Firebase configuration object
4. Create a `.env` file in the project root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
```

### 4. Configure Firebase Security Rules

⚠️ **Important**: The default test mode rules expire after 30 days and allow public access. Configure production rules immediately:

#### Firestore Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace with the following rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && request.auth.uid == userId;
    }

    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid in resource.data.participants;

      // Messages subcollection
      match /messages/{messageId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null && request.auth.uid == resource.data.senderId;
      }
    }
  }
}
```

3. Click **Publish**

#### Realtime Database Rules

1. Go to **Realtime Database** → **Rules** tab
2. Replace with the following rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": false,
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $userId"
      }
    }
  }
}
```

3. Click **Publish**

#### Storage Rules

1. Go to **Storage** → **Rules** tab
2. Replace with the following rules:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    // Profile images
    match /profile-images/{userId}/{filename} {
      allow read: if request.auth != null;
      allow write, delete: if request.auth != null && request.auth.uid == userId;
    }

    // Conversation files
    match /conversation-files/{conversationId}/{filename} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

### 5. Verify Setup

Run the app and try:

- Creating a new account (tests Auth + Firestore)
- Uploading a profile picture (tests Storage)
- Sending a message (tests Firestore)
- Going online/offline (tests Realtime Database)

## 📱 Development Tips

### Testing on Physical Device (Recommended)

- Provides real-world performance testing
- Test push notifications and camera features
- See actual network conditions

### Testing Offline Mode

- Enable airplane mode on your device
- Send messages (they'll show "sending" status)
- Disable airplane mode
- Messages automatically sync to Firebase

### Debugging

- Shake your device to open the debug menu
- View console logs in terminal where `npx expo start` is running
- Use React DevTools for component inspection

## 🚢 Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 📖 Implementation Progress

- ✅ **PR #1**: React Native Setup & Environment Configuration
- ⏳ **PR #2**: Firebase Configuration & Zustand Stores
- ⏳ **PR #3**: Authentication (Signup & Login)
- ⏳ **PR #4**: Profile Setup & User Creation
- ⏳ **PR #5**: User List & Presence Tracking
- ⏳ **PR #6**: One-on-One Messaging - Basic Chat UI
- ⏳ **PR #7**: Message Sending with 3-Store Architecture
- ⏳ **PR #8**: Profile Screen & Edit Profile
- ⏳ **PR #9**: Group Chats
- ⏳ **PR #10**: Push Notifications
- ⏳ **PR #11**: AI Agent - Basic Integration
- ⏳ **PR #12**: AI Agent - Advanced Features & Polish

## 🤝 Contributing

We welcome contributions! This project follows a structured PR-based development approach.

### Development Workflow

1. **Fork and clone** the repository
2. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the project structure
4. **Test thoroughly** on both iOS and Android
5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add user blocking feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** with a clear description

### Code Style Guidelines

- Use **functional components** with hooks
- Follow the **3-store Zustand pattern** (local, presence, firebase)
- Add **JSDoc comments** for utility functions
- Use **React Native StyleSheet** for styling (not inline styles)
- Keep components **small and focused** (single responsibility)
- Place **reusable logic** in utility functions

### Project Structure Conventions

- **Screens**: Full-page components in `src/screens/`
- **Components**: Reusable UI components in `src/components/`
- **Utils**: Helper functions and utilities in `src/utils/`
- **Stores**: Zustand stores in `src/stores/`
- **Navigation**: Navigation setup in `src/navigation/`

### Testing Your Changes

1. **Test on physical device** (recommended)
2. **Test offline mode** (airplane mode)
3. **Test with multiple users** (different accounts)
4. **Test edge cases** (empty states, errors, slow network)
5. **Verify Firebase rules** don't break

### Pull Request Guidelines

- **Title**: Use conventional commits (feat/fix/docs/refactor/test)
- **Description**: Explain what changed and why
- **Screenshots**: Include for UI changes
- **Testing**: Describe how you tested the changes
- **Breaking changes**: Clearly mark any breaking changes

### Implementation Plan

This project follows a 17-PR implementation plan. See `tasks.md` for:

- Detailed task breakdown
- Implementation notes
- Architectural decisions
- Completed features

Current progress:

- ✅ PRs #1-8: Foundation, Auth, Profiles, Messaging Core
- 🔄 PR #9: Group Chats (In Progress)
- ⏳ PRs #10-17: Notifications, Read Receipts, AI Features

### Need Help?

- Check `memory-bank/` folder for architecture documentation
- Review `PRD.md` for product requirements
- Look at existing code for patterns and examples
- Open an issue for questions or suggestions

## 📄 License

This project is for educational purposes.

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Navigation](https://reactnavigation.org/)
