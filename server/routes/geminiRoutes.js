/* server/routes/geminiRoutes.js */
const express = require("express");
const router = express.Router();
// Temporarily bypass authentication to verify AI functionality
// const { authenticateToken } = require("../middleware/auth"); 
const { enhanceSection } = require("../controllers/geminiController");

/**
 * Route: POST /api/ai/enhance
 * Description: Sends section data to Gemini AI for professional rewriting
 */
router.post("/enhance", enhanceSection);

module.exports = router;