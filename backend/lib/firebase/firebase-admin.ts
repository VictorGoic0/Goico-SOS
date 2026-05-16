import admin from "firebase-admin";
import { config } from "../config";
import { QuerySnapshot } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}
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

class FirebaseAdmin {
  private db: admin.firestore.Firestore;
  private auth: admin.auth.Auth;

  constructor(adminInstance: typeof admin) {
    this.db = adminInstance.firestore();
    this.auth = adminInstance.auth();
  }

  async verifyAndDecodeToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifyIdToken(token);
  }

  async getUser(userId: string) {
    const user = (await this.db.collection("users").doc(userId).get()).data()
    return user
  }

  async getConversation(conversationId: string) {
    const conversationRef = this.db
      .collection("conversations")
      .doc(conversationId);
    const conversation = await conversationRef.get();
    return conversation;
  }

  async getMessagesFromFirebase(
    conversationId: string,
    limit: number = 50
  ): Promise<FirebaseMessage[]> {
    try {
      const snapshot = await this.getConversationSnapshot(conversationId, limit)

      if (this.isEmpty(snapshot)) {
        return [];
      }

      const messages = this.snapshotToMessages(snapshot);
      return messages as FirebaseMessage[];
    } catch (error) {
      console.error("Error fetching messages from Firebase:", error);
      throw new Error("Failed to fetch messages from database");
    }
  }

  async getConversationSnapshot(conversationId: string, limit: number = 50): Promise<QuerySnapshot> {
    const messagesRef = this.db
        .collection("conversations")
        .doc(conversationId)
        .collection("messages")
        .orderBy("timestamp", "desc")
        .limit(limit);

      const snapshot = await messagesRef.get();
      return snapshot;
  }

  isEmpty(snapshot: QuerySnapshot) {
    return snapshot.empty;
  }

  snapshotToMessages(snapshot: QuerySnapshot): FirebaseMessage[] {
    const messages = snapshot.docs.map((doc) => ({
        messageId: doc.id,
        ...doc.data(),
      }));
    return messages as FirebaseMessage[];
  }

  async searchMessages(
    conversationId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      keyword?: string;
    }
  ) {
    const query: any = this.buildQuery(conversationId, filters)

    const snapshot = await query.get();
    const messages = this.snapshotToMessages(snapshot);

    if (filters.keyword) {
      return this.filterByKeyword(messages, filters.keyword)
    }

    return messages;
  }

  private buildQuery(conversationId, options) {
    let query: any = this.db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages");

    if (options.startDate) {
      query = query.where("timestamp", ">=", new Date(options.startDate));
    }

    if (options.endDate) {
      query = query.where("timestamp", "<=", new Date(options.endDate));
    }

    return query;
  }

  filterByKeyword(messages: FirebaseMessage[], keyword: string) {
    return messages.filter((message: FirebaseMessage) =>
        message.text.toLowerCase().includes(keyword!.toLowerCase())
      );
  }

  async getConversationMessageSnapshot(conversationId: string, messageId: string) {
    const snapshot = await this.db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .doc(messageId)
      .get();

    if (!snapshot.exists) {
      return null;
    }
    return snapshot;
  }
}

/** Shared instance for API routes and server utilities (initialized module-side). */
export const firebaseAdmin = new FirebaseAdmin(admin);

