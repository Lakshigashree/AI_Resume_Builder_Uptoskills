const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function enhanceResume(text, role) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an ATS resume analyzer.

Target Job Role: ${role}

TASKS:
1) Improve the resume professionally
2) Calculate ATS score (0-100)
3) Provide missing keywords
4) Give section-wise scores
5) Provide improvement suggestions

Return ONLY JSON in this format:

{
  "enhancedText": "...",
  "analysis": {
    "atsScore": number,
    "missingKeywords": [],
    "sectionScores": {
      "skills": number,
      "experience": number,
      "projects": number,
      "education": number
    },
    "suggestions": []
  }
}

Resume:
${text}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  try {
    return JSON.parse(response);
  } catch (err) {
    console.log("Gemini raw output:", response);
    throw new Error("Invalid AI JSON");
  }
}

module.exports = enhanceResume;
