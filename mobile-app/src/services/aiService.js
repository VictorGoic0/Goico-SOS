const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Helper function with error handling
const callBackend = async (endpoint, body) => {
  try {
    const response = await fetch(`${API_URL}/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw new Error(
      "AI service temporarily unavailable. Please try again later."
    );
  }
};

// Thread Summarization
export const summarizeThread = async (conversationId, messageCount = 50) => {
  return await callBackend("summarize", {
    conversationId,
    messageCount,
  });
};

// Action Item Extraction
export const extractActionItems = async (
  conversationId,
  messageCount = 100
) => {
  return await callBackend("extract-actions", {
    conversationId,
    messageCount,
  });
};

// Semantic Search
export const semanticSearch = async (
  conversationId,
  query,
  messageCount = 200
) => {
  return await callBackend("search", {
    conversationId,
    query,
    messageCount,
  });
};

// Priority Detection
export const detectPriority = async (messageText) => {
  return await callBackend("priority", { messageText });
};