const express = require("express");
const router = express.Router();
const { getEnhancedText } = require("../services/geminiService");

router.post("/", async (req, res) => {
  try {
    const { section, data, targetRole } = req.body;

    if (!data) {
      return res.status(400).json({ error: "No resume content provided" });
    }

    const prompt = `
You are an ATS resume optimizer.

Target Job Role: ${targetRole || "General"}

Rewrite and improve the following resume professionally.
Make it ATS optimized, structured, and impactful.

Resume:
${data}
`;

    const enhanced = await getEnhancedText(prompt);

    res.json({
      enhanced: enhanced   // ⭐ IMPORTANT — frontend expects "enhanced"
    });

  } catch (err) {
    console.error("❌ Enhance Route Error:", err.message);
    res.status(500).json({ error: "AI enhancement failed" });
  }
});

module.exports = router;
