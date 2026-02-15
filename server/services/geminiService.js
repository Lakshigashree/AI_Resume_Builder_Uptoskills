/* server/services/geminiService.js */
const { GoogleGenerativeAI } = require("@google/generative-ai");

const getEnhancedText = async (prompt) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Set a longer timeout for slower networks
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    // Check if the error is specifically a fetch/network failure
    if (error.message.includes("fetch failed")) {
       console.error("❌ Network Error: Your server cannot reach Google. Check your internet or VPN.");
       throw new Error("Network error: Server cannot reach AI services. Please check internet connectivity.");
    }
    console.error("❌ Error in getEnhancedText:", error.message);
    throw new Error(`Failed to enhance text: ${error.message}`);
  }
};

module.exports = { getEnhancedText };