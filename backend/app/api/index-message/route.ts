import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { processIndexMessageAfterSend } from "@/lib/index-messages";

export async function POST(req: Request) {
  try {
    try {
      await authenticate(req);
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await req.json();
    const { conversationId, messageId } = body as {
      conversationId?: string;
      messageId?: string;
    };

    if (!conversationId || !messageId) {
      return NextResponse.json(
        { error: "conversationId and messageId are required" },
        { status: 400 }
      );
    }

    const result = await processIndexMessageAfterSend(conversationId, messageId);

    return NextResponse.json({
      conversationId,
      messageId,
      mode: result.mode,
      indexed: result.indexed,
      failed: result.failed,
    });
  } catch (error) {
    console.error("index-message error:", error);
    return NextResponse.json(
      { error: "Failed to index message" },
      { status: 500 }
    );
  }
}
