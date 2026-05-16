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

    await ragPipeline.ensureBackfilled(conversationId);
    const results = await ragPipeline.retrieveSearchHits(conversationId, trimmedQuery);

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
