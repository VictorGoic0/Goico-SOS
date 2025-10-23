import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const {
      conversationId,
      messageId,
      senderId,
      senderUsername,
      messageText,
    } = await req.json();

    // Get conversation to find recipients
    const conversationRef = db
      .collection("conversations")
      .doc(conversationId);
    const conversation = await conversationRef.get();

    if (!conversation.exists) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const participants = conversation.data()?.participants || [];
    const recipients = participants.filter((id: string) => id !== senderId);

    // Debug logging
    console.log('Send notification debug:', {
      conversationId,
      senderId,
      participants,
      recipients,
      senderIdType: typeof senderId,
      participantsTypes: participants.map((p: string) => typeof p)
    });

    // Get sender's user data for display name and profile photo
    const senderDoc = await db.collection("users").doc(senderId).get();
    const senderData = senderDoc.data();
    const senderDisplayName = senderData?.displayName || senderUsername;
    const senderImageURL = senderData?.imageURL || null;

    // Get push tokens for recipients
    const pushTokens: string[] = [];
    for (const recipientId of recipients) {
      const userDoc = await db.collection("users").doc(recipientId).get();
      const pushToken = userDoc.data()?.pushToken;
      if (pushToken) {
        pushTokens.push(pushToken);
      }
    }

    if (pushTokens.length === 0) {
      return NextResponse.json({ message: "No recipients with push tokens" });
    }

    // Send notifications via Expo Push API
    const messages = pushTokens.map((token) => ({
      to: token,
      sound: "default",
      title: senderDisplayName,
      body: messageText,
      data: { 
        conversationId, 
        messageId, 
        type: "new_message",
        senderImageURL 
      },
    }));

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      sentTo: pushTokens.length,
      result,
    });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

