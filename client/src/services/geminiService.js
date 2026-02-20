import authService from "./authService";

const API_BASE = "http://localhost:5000/api";

export const enhanceTextWithGemini = async (section, data, targetRole) => {
  try {
    const response = await authService.authenticatedRequest(
      `${API_BASE}/enhance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section,
          data,
          targetRole, // ⭐ NOW SENT
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Server error:", result);
      return null;
    }

    return result.enhanced;
  } catch (error) {
    console.error("❌ Enhance API error:", error);
    return null;
  }
};
