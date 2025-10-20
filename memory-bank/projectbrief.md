# Project Brief: Mobile Messaging App

## Project Overview

A real-time messaging app built with React Native and Expo, enabling users to chat one-on-one and in groups with AI-powered features. This MVP focuses on building rock-solid messaging infrastructure with user profiles, presence tracking, offline support, and message delivery status.

## Project Timeline

**7-day sprint** with checkpoints at Day 2, Day 5, and Day 7

## Core Requirements

### MVP Requirements (Day 1-2 Checkpoint)

✅ **Authentication**

- Email/password signup (email + password only)
- First-time profile completion (username, displayName, optional photo/bio)
- Login flow
- Sign out functionality

✅ **User Profiles**

- Username (unique, for adding users)
- Display name (shown in UI)
- Email (from auth)
- Profile photo via imageURL (optional, via Firebase Storage)
- Bio (optional)
- Status message (default: "Available")

✅ **User Presence** (Realtime Database)

- Show online/offline status for all users
- Update presence on app state changes
- Display last seen timestamp for offline users
- Auto-disconnect handling

✅ **User List**

- Display all registered users
- Show online/offline status (from Realtime Database)
- Tap user to start conversation

✅ **One-on-One Messaging**

- Send text messages in real-time
- View message history
- Messages sync instantly across devices
- Timestamps for each message
- **Message status tracking**: sending → sent → delivered → read (bonus)

✅ **Offline Support**

- Queue messages sent while offline
- Auto-send when connection restored
- Firestore handles this automatically
- Show "sending" status for queued messages

### Post-MVP Requirements

#### Checkpoint 2 (Day 3-5 - Friday)

✅ **Group Chats**

- Create group conversations (3+ users)
- Add/remove participants
- Group name and photo (optional)
- Same message structure as 1-on-1 chats

✅ **Push Notifications**

- Request notification permission
- Send notification when message received (user not in app)
- Tap notification → open conversation
- Firebase Cloud Function triggers on new message

✅ **AI Agent - Basic**

- Start integrating Vercel AI SDK
- Basic chat assistant in conversations
- Simple responses and interactions

#### Checkpoint 3 (Day 6-7 - Sunday)

✅ **AI Agent - Advanced**

- Conversation summaries
- Smart replies
- Context-aware responses
- AI accessible from any conversation

✅ **Polish & UX**

- Smooth animations
- Better loading states
- Error handling
- UI refinements

## Success Metrics

### MVP Success (Day 2)

- ✅ 2+ users can sign up and authenticate
- ✅ Users can send messages that appear instantly with "sending" status
- ✅ Message status updates correctly (sending → sent → delivered)
- ✅ Offline messages queue and send when reconnected
- ✅ Profile photos upload successfully via Firebase Storage
- ✅ User presence updates accurately from Realtime Database
- ✅ Zero data loss during testing
- ✅ 3-store Zustand architecture working smoothly

### Checkpoint 2 Success (Day 5)

- ✅ Group chats work with 3+ users
- ✅ Push notifications deliver when app is closed/background
- ✅ Tapping notification opens correct conversation
- ✅ AI agent responds to basic queries

### Final Success (Day 7)

- ✅ AI agent provides context-aware responses
- ✅ Conversation summaries work
- ✅ All core features work on iOS + Android
- ✅ App handles 50+ users without performance issues
- ✅ Comprehensive demo video completed
- ✅ Clean, documented codebase

## Tech Stack

### Frontend

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: Zustand (3-store architecture)
- **Styling**: React Native StyleSheet

### Backend & Real-Time

- **Platform**: Firebase
  - **Firebase Auth**: User authentication (email/password)
  - **Firestore**: Messages, profiles, conversations (source of truth)
  - **Realtime Database**: User presence (isOnline, lastSeen)
  - **Firebase Storage**: Image/photo uploads
  - **Cloud Functions**: Push notifications
- **Real-time Sync**: Firestore listeners (onSnapshot) + Realtime Database listeners
- **Offline Support**: Firestore offline persistence (built-in)

### AI Integration

- **AI SDK**: Vercel AI SDK
- **AI Provider**: OpenAI (GPT-4)
- **Features**: Chat assistant, conversation summaries

### Push Notifications

- **Expo Notifications**: Native push notification support
- **Firebase Cloud Messaging**: Delivery via Cloud Functions

## Key Constraints

- **7-day timeline**: Must prioritize core messaging functionality
- **React Native learning curve**: Use Expo managed workflow
- **No automated testing**: Manual testing only for MVP
- **Cross-platform**: Must work on both iOS and Android

## Out of Scope for MVP

- ❌ Voice/video calls
- ❌ Message reactions/emojis (moved to bonus)
- ❌ Message editing/deletion
- ❌ File sharing beyond images
- ❌ End-to-end encryption
- ❌ User blocking/reporting
- ❌ Message search
- ❌ Typing indicators (moved to bonus)
- ❌ Multiple device support (web + mobile)
- ❌ Automated testing
- ❌ Message forwarding
- ❌ Voice notes
- ❌ Location sharing
- ❌ Stickers/GIFs
- ❌ Video messages

## Submission Deliverables

1. **GitHub Repository**

   - Clean, documented code
   - README with setup instructions
   - Firebase configuration guide
   - Zustand store architecture documentation
   - Deployed app link (Expo Go or EAS)

2. **Demo Video** (3-5 minutes)

   - Show authentication and profile setup flow
   - Demonstrate 1-on-1 messaging with status indicators
   - Show offline message queuing
   - Demonstrate presence tracking
   - Show group chats
   - Demo push notifications
   - Demo AI agent features
   - Explain 3-store architecture

3. **Deployed Application**
   - Expo Go QR code or EAS build links (iOS + Android)
   - Works on iOS + Android
   - Supports 5+ simultaneous users
   - Push notifications functional
