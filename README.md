# Mobile Messaging App

A real-time messaging application built with React Native and Expo, featuring Firebase backend integration, user presence tracking, and AI-powered assistance.

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
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, Realtime Database, and Storage
   - Copy your Firebase config to `.env` file (see `.env.example`)

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

This is a learning project following a structured 12-PR implementation plan. See `tasks.md` for detailed task breakdown.

## 📄 License

This project is for educational purposes.

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Navigation](https://reactnavigation.org/)
