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

/**
 * Helper function to fetch messages from a conversation
 * @param conversationId - The ID of the conversation
 * @param limit - Maximum number of messages to fetch (default: 50)
 * @returns Array of messages with their data
 */
export async function getMessagesFromFirebase(
  conversationId: string,
  limit: number = 50
): Promise<FirebaseMessage[]> {
  try {
    const messagesRef = db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(limit);

    const snapshot = await messagesRef.get();

    if (snapshot.empty) {
      return [];
    }

    // Map documents to message objects
    const messages = snapshot.docs.map((doc) => ({
      messageId: doc.id,
      ...doc.data(),
    }));

    return messages as FirebaseMessage[];
  } catch (error) {
    console.error("Error fetching messages from Firebase:", error);
    throw new Error("Failed to fetch messages from database");
  }
}