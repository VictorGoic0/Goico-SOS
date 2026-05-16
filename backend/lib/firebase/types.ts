import type admin from "firebase-admin";

export type FirebaseMessage = {
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

export type MessageQueryOptions = {
  where?: { field: string; op: FirebaseFirestore.WhereFilterOp; value: unknown }[];
  orderBy?: { field: string; direction: "asc" | "desc" };
  limit?: number;
  startDate?: string;
  endDate?: string;
}