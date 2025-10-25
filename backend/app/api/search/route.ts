import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { getMessagesFromFirebase, FirebaseMessage } from "@/lib/firebase-admin";

// Helper: Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function POST(req: Request) {
  try {
    const { conversationId, query, messageCount = 200 } = await req.json();

    // Validate input
    if (!conversationId || !query) {
      return NextResponse.json(
        { error: "conversationId and query are required" },
        { status: 400 }
      );
    }

    // Fetch messages from Firebase
    const messages: FirebaseMessage[] = await getMessagesFromFirebase(
      conversationId,
      messageCount
    );

    if (messages.length === 0) {
      return NextResponse.json({ 
        results: [],
        query,
        conversationId 
      });
    }

    // Get query embedding
    const { embedding: queryEmbedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });

    // Compute embeddings for all messages
    const messageEmbeddings = await Promise.all(
      messages.map((msg: FirebaseMessage) =>
        embed({
          model: openai.embedding("text-embedding-3-small"),
          value: msg.text,
        })
      )
    );

    // Calculate similarity scores and filter
    const results = messages
      .map((msg, i) => ({
        ...msg,
        similarity: cosineSimilarity(
          queryEmbedding,
          messageEmbeddings[i].embedding
        ),
      }))
      .filter((r) => r.similarity > 0.7) // Threshold for relevance
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Return top 10 results

    return NextResponse.json({
      results,
      query,
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

