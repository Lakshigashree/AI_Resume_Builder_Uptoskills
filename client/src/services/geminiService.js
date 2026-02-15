const axios = require("axios");

const getEnhancedText = async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    // Using gemini-1.5-flash for maximum stability with JSON and text formatting
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await axios.post(url, {
            contents: [{ 
                parts: [{ text: prompt }] 
            }],
            // Adding generationConfig to ensure the AI doesn't get too creative with symbols
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });

        // Deep check of the response structure to prevent crashes
        if (
            response.data && 
            response.data.candidates && 
            response.data.candidates[0].content && 
            response.data.candidates[0].content.parts
        ) {
            return response.data.candidates[0].content.parts[0].text;
        }
        
        throw new Error("Invalid API response structure from Gemini");

    } catch (error) {
        // Detailed error logging to help you debug in the terminal
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error("❌ Gemini API Error:", errorMessage);
        throw new Error(`AI Enhancement Failed: ${errorMessage}`);
    }
};

module.exports = {
    getEnhancedText,
    enhanceTextWithGemini: getEnhancedText
};