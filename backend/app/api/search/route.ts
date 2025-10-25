import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { getMessagesFromFirebase, FirebaseMessage } from "@/lib/firebase-admin";

// Helper: Calculate cosine similarity between two vectors
function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  const dotProduct = vectorA.reduce((sum, valueA, i) => sum + valueA * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, valueA) => sum + valueA * valueA, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, valueB) => sum + valueB * valueB, 0));
  
  const similarity = dotProduct / (magnitudeA * magnitudeB);
  
  // Cosine similarity should be between -1 and 1, but for text embeddings it's typically 0-1
  if (similarity < -1 || similarity > 1 || isNaN(similarity)) {
    console.error('Invalid cosine similarity:', similarity);
    return 0;
  }
  
  return similarity;
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
      messages.map((message: FirebaseMessage) =>
        embed({
          model: openai.embedding("text-embedding-3-small"),
          value: message.text,
        })
      )
    );

    // Helper: Check if message contains query keywords (fuzzy match with word variations)
    const containsKeyword = (messageText: string, searchQuery: string): boolean => {
      const messageLower = messageText.toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      
      // Check exact phrase match
      if (messageLower.includes(queryLower)) return true;
      
      // Check individual words (for multi-word queries)
      // Filter out very short words (< 3 chars) as they're often stop words
      const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
      const messageWords = messageLower.split(/\s+/);
      
      // Check for exact word matches
      for (const queryWord of queryWords) {
        const hasMatch = messageWords.some(messageWord => messageWord.includes(queryWord));
        if (hasMatch) return true;
      }
      
      // Check for word stem matches (bidirectional)
      // Examples: "availability" matches "available", "meeting" matches "meet"
      for (const queryWord of queryWords) {
        for (const messageWord of messageWords) {
          // Skip very short words
          if (queryWord.length < 4 || messageWord.length < 4) continue;
          
          // Bidirectional stem matching using first 4 characters
          const queryStem = queryWord.substring(0, 4);
          const messageStem = messageWord.substring(0, 4);
          
          // Check if either word starts with the other's stem
          if (queryWord.startsWith(messageStem) || messageWord.startsWith(queryStem)) {
            return true;
          }
        }
      }
      
      return false;
    };

    // Calculate similarity scores with hybrid approach
    const scoredMessages = messages
      .map((message, index) => {
        const messageEmbedding = messageEmbeddings[index].embedding;
        const semanticScore = cosineSimilarity(queryEmbedding, messageEmbedding);
        
        // Boost score if message contains the query keywords
        const hasKeywordMatch = containsKeyword(message.text, query);
        const keywordBoost = hasKeywordMatch ? 0.25 : 0; // Add 0.25 to score
        
        // Cap final score at 1.0
        const finalScore = Math.min(semanticScore + keywordBoost, 1.0);
        
        return {
          ...message,
          similarity: finalScore,
          semanticScore: semanticScore,
          hasKeywordMatch: hasKeywordMatch,
        };
      })
      .sort((resultA, resultB) => resultB.similarity - resultA.similarity);

    // Log top scores for debugging with full message text
    console.log('=== SEARCH DEBUG ===');
    console.log('Query:', query);
    console.log('Total messages searched:', messages.length);
    console.log('\nTop 5 scored messages:');
    scoredMessages.slice(0, 5).forEach((result, index) => {
      console.log(`\n${index + 1}. "${result.text}"`);
      console.log(`   Semantic: ${result.semanticScore.toFixed(4)}`);
      console.log(`   Keyword: ${result.hasKeywordMatch ? '+0.25' : '+0.00'}`);
      console.log(`   Final: ${result.similarity.toFixed(4)}`);
    });
    console.log('===================\n');

    // Hybrid search threshold explanation:
    // - Pure semantic score typically ranges 0.3-0.9 for relevant matches
    // - Keyword boost adds 0.25 when query terms are found in message
    // - Threshold of 0.3 catches both semantic matches and keyword boosted results
    // - Examples: 
    //   * Exact phrase match: 0.8 semantic + 0.25 boost = 1.05 (capped at 1.0)
    //   * Related words ("availability"/"available"): 0.35 + 0.25 = 0.6
    //   * Pure semantic: needs 0.3+ to pass
    const results = scoredMessages
      .filter((result) => result.similarity > 0.3)
      .slice(0, 5); // Return top 5 results

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

