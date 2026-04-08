import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { ensureConversationBackfilledForRag } from "@/lib/index-messages";
import { retrieveSearchHits } from "@/lib/retrieve-messages";

export async function POST(req: Request) {
  try {
    try {
      await authenticate(req);
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await req.json();
    const { conversationId, query } = body as {
      conversationId?: string;
      query?: string;
    };

    const trimmedQuery = typeof query === "string" ? query.trim() : "";

    if (!conversationId || !trimmedQuery) {
      return NextResponse.json(
        { error: "conversationId and query are required" },
        { status: 400 }
      );
    }

    await ensureConversationBackfilledForRag(conversationId);
    const results = await retrieveSearchHits(conversationId, trimmedQuery);

    return NextResponse.json({
      results,
      query: trimmedQuery,
      conversationId,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search messages" },
      { status: 500 }
    );
  }
}
