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

    // Helper: Check if message contains query keywords (fuzzy match with word variations)
    const containsKeyword = (messageText: string, query: string): boolean => {
      const messageLower = messageText.toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Check exact phrase match
      if (messageLower.includes(queryLower)) return true;
      
      // Check if query is contained in message (partial match)
      if (queryLower.length > 4 && messageLower.includes(queryLower)) return true;
      
      // Check individual words (for multi-word queries)
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
      const messageWords = messageLower.split(/\s+/);
      
      // Check for exact word matches
      if (queryWords.some(qWord => messageWords.some(mWord => mWord.includes(qWord)))) {
        return true;
      }
      
      // Check for word stem matches (e.g., "availability" matches "available")
      // Simple approach: check if first 5 characters match for words > 5 chars
      for (const qWord of queryWords) {
        if (qWord.length > 5) {
          const qStem = qWord.substring(0, 5);
          if (messageWords.some(mWord => mWord.startsWith(qStem))) {
            return true;
          }
        }
      }
      
      return false;
    };

    // Calculate similarity scores with hybrid approach
    const scoredMessages = messages
      .map((msg, i) => {
        const semanticScore = cosineSimilarity(
          queryEmbedding,
          messageEmbeddings[i].embedding
        );
        
        // Boost score if message contains the query keywords
        const hasKeywordMatch = containsKeyword(msg.text, query);
        const keywordBoost = hasKeywordMatch ? 0.25 : 0; // Add 0.25 to score
        
        // Cap final score at 1.0
        const finalScore = Math.min(semanticScore + keywordBoost, 1.0);
        
        return {
          ...msg,
          similarity: finalScore,
          semanticScore: semanticScore,
          hasKeywordMatch: hasKeywordMatch,
        };
      })
      .sort((a, b) => b.similarity - a.similarity);

    // Log top scores for debugging
    console.log('Search query:', query);
    console.log('Top 5 results:', scoredMessages.slice(0, 5).map(m => ({
      text: m.text.substring(0, 50),
      semanticScore: m.semanticScore.toFixed(3),
      hasKeyword: m.hasKeywordMatch,
      finalScore: m.similarity.toFixed(3),
    })));

    // Hybrid search threshold explanation:
    // - Pure semantic score typically ranges 0.3-0.9 for relevant matches
    // - Keyword boost adds 0.25 when query terms are found in message
    // - Threshold of 0.3 catches both semantic matches and keyword boosted results
    // - Examples: 
    //   * Exact phrase match: 0.8 semantic + 0.25 boost = 1.05 (capped at 1.0)
    //   * Related words ("availability"/"available"): 0.35 + 0.25 = 0.6
    //   * Pure semantic: needs 0.3+ to pass
    const results = scoredMessages
      .filter((r) => r.similarity > 0.3)
      .slice(0, 10); // Return top 10 results

    return NextResponse.json({
      results,
      query,
      conversationId,
      totalMessages: messages.length,
      maxScore: scoredMessages[0]?.similarity || 0,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search messages" },
      { status: 500 }
    );
  }
}

