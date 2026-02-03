const express = require("express");
const router = express.Router();
const multer = require("multer");
const { analyzeResume, analyzeResumeFromText } = require("../controllers/atsController");
const { optionalAuth } = require("../middleware/auth");

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, DOCX, DOC, and TXT files
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload PDF, DOCX, DOC, or TXT files.'));
    }
  }
});

// Route to analyze uploaded resume file
router.post("/analyze-file", optionalAuth, upload.single('resume'), analyzeResume);

// Route to analyze resume from text content
router.post("/analyze-text", optionalAuth, analyzeResumeFromText);

module.exports = router;

