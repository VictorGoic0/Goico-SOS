import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { getMessagesFromFirebase, FirebaseMessage } from "@/lib/firebase-admin";

// Search configuration
const SIMILARITY_THRESHOLD = 0.4; // Adjust this to tune search precision vs recall
// Higher values (0.5-0.7): More precise, fewer results
// Lower values (0.3-0.4): More recall, may include loosely related results
// Note: Keyword boost adds +0.25, so messages with matching keywords typically score 0.5+

const KEYWORD_BOOST_AMOUNT = 0.25; // Bonus score when query terms found in message
const MAX_SEARCH_RESULTS = 5; // Number of top results to return

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
        const keywordBoost = hasKeywordMatch ? KEYWORD_BOOST_AMOUNT : 0;
        
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

    // Hybrid search threshold of 0.4:
    // - Keyword-matched messages typically score 0.5-1.0 (semantic + 0.25 boost)
    // - Pure semantic matches need 0.4+ similarity to be relevant
    // - Balances precision (avoiding irrelevant results) with recall (finding related messages)
    const results = scoredMessages
      .filter((result) => result.similarity > 0.4)
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

