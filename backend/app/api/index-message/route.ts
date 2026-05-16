import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { ragPipeline } from "@/lib/rag/pipeline";

export async function POST(request: Request) {
  try {
    try {
      await auth.authenticate(request);
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await request.json();
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

    const result = await ragPipeline.processAfterSend(conversationId, messageId);

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
