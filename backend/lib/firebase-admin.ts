import admin from "firebase-admin";

// Initialize Firebase Admin SDK (singleton pattern)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// Export Firestore and Auth instances
export const db = admin.firestore();
export const auth = admin.auth();

// Define message interface
export interface FirebaseMessage {
  messageId: string;
  senderId: string;
  senderUsername: string;
  text: string;
  timestamp: admin.firestore.Timestamp;
  status: string;
  readAt?: admin.firestore.Timestamp | null;
  readBy?: string[] | null;
  imageURL?: string | null;
}

export {
  getMessagesForConversation,
  getMessagesFromFirebase,
} from "./firestore-messages";

export type {
  ConversationMessageRecord,
  GetMessagesOptions,
} from "./firestore-messages";