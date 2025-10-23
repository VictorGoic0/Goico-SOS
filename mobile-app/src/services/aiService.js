const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Test backend connection
export const testBackend = async () => {
  try {
    const response = await fetch(`${API_URL}/api/test`);
    const data = await response.json();
    console.log("Backend test:", data);
    return data;
  } catch (error) {
    console.error("Backend connection failed:", error);
    throw error;
  }
};

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
