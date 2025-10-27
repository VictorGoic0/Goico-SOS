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

// Decision Extraction
export const extractDecisions = async (conversationId, messageCount = 100) => {
  return await callBackend("decisions", {
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

// Multi-Step Agent with Streaming
export const executeAgent = async (userQuery, conversationId, onChunk) => {
  console.log("executeAgent called with:", { userQuery, conversationId });

  try {
    console.log("Fetching from:", `${API_URL}/api/agent`);
    const response = await fetch(`${API_URL}/api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userQuery, conversationId }),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      throw new Error(`Agent error: ${response.status}`);
    }

    console.log("Starting to read stream...");
    console.log("response.body:", response.body);

    // Try reading the entire response as text first
    const text = await response.text();
    console.log("Got full text response:", text);

    if (text && onChunk) {
      onChunk(text, text);
    }

    const fullText = text;

    console.log("executeAgent complete! fullText:", fullText);
    return fullText;
  } catch (error) {
    console.error("Agent execution failed:", error);
    console.error("Error details:", error.message, error.stack);
    throw error;
  }
};
