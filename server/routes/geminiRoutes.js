/* server/routes/geminiRoutes.js */
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { enhanceSection } = require("../controllers/geminiController");

// Use a specific path here so it's easier to manage in server.js
router.post("/enhance", authenticateToken, enhanceSection);

module.exports = router;