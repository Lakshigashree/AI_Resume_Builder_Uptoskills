const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

/**
 * Calculate ATS score based on resume content
 */
function calculateATSScore(resumeText, resumeData = null) {
  const checks = {
    contactInfo: checkContactInfo(resumeText, resumeData),
    keywords: checkKeywords(resumeText, resumeData),
    formatting: checkFormatting(resumeText),
    sections: checkSections(resumeText, resumeData),
    length: checkLength(resumeText),
    actionVerbs: checkActionVerbs(resumeText),
    quantifiableAchievements: checkQuantifiableAchievements(resumeText),
    fileFormat: { passed: true, score: 10, message: 'File format is ATS-friendly' }
  };

  // Calculate total score (out of 100)
  const totalScore = Object.values(checks).reduce((sum, check) => sum + check.score, 0);
  
  // Determine grade
  let grade = 'F';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 60) grade = 'C';
  else if (totalScore >= 50) grade = 'D';

  // Get recommendations
  const recommendations = getRecommendations(checks);

  return {
    score: Math.round(totalScore),
    grade,
    checks,
    recommendations,
    summary: getSummary(totalScore, grade)
  };
}

/**
 * Check contact information completeness
 */
function checkContactInfo(text, resumeData) {
  const checks = {
    name: false,
    email: false,
    phone: false,
    location: false
  };

  // Check for name
  const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+/m;
  checks.name = namePattern.test(text) || (resumeData?.personalInfo?.name?.length > 0);

  // Check for email
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  checks.email = emailPattern.test(text) || (resumeData?.personalInfo?.email?.length > 0);

  // Check for phone
  const phonePattern = /[\+\(]?[\d\s\-\(\)]{7,}/;
  checks.phone = phonePattern.test(text) || (resumeData?.personalInfo?.phone?.length > 0);

  // Check for location
  const locationPattern = /(city|state|country|address|location)/i;
  checks.location = locationPattern.test(text) || (resumeData?.personalInfo?.location?.length > 0);

  const passedCount = Object.values(checks).filter(Boolean).length;
  const score = (passedCount / 4) * 15; // 15 points max

  return {
    passed: passedCount === 4,
    score: Math.round(score),
    message: `Contact information: ${passedCount}/4 fields present`,
    details: checks
  };
}

/**
 * Check for important keywords
 */
function checkKeywords(text, resumeData) {
  const commonKeywords = [
    'experience', 'education', 'skills', 'certifications',
    'achievements', 'projects', 'summary', 'objective'
  ];

  const textLower = text.toLowerCase();
  const foundKeywords = commonKeywords.filter(keyword => 
    textLower.includes(keyword)
  );

  const score = (foundKeywords.length / commonKeywords.length) * 20; // 20 points max

  return {
    passed: foundKeywords.length >= 6,
    score: Math.round(score),
    message: `Found ${foundKeywords.length}/${commonKeywords.length} important sections`,
    details: { foundKeywords, missingKeywords: commonKeywords.filter(k => !foundKeywords.includes(k)) }
  };
}

/**
 * Check formatting issues
 */
function checkFormatting(text) {
  const issues = [];
  let score = 15; // Start with full points

  // Check for tables (not ATS-friendly)
  if (text.includes('|') || text.match(/\s{3,}/)) {
    issues.push('Contains tables or complex formatting');
    score -= 3;
  }

  // Check for special characters that might cause issues
  const specialChars = /[^\w\s@.,!?\-:;()]/g;
  const specialCharCount = (text.match(specialChars) || []).length;
  if (specialCharCount > 50) {
    issues.push('Too many special characters');
    score -= 2;
  }

  // Check for headers/footers
  if (text.match(/page \d+/i) || text.match(/^\d+$/m)) {
    issues.push('Contains page numbers or headers');
    score -= 2;
  }

  // Check for images/graphics indicators
  if (text.toLowerCase().includes('[image]') || text.toLowerCase().includes('[graphic]')) {
    issues.push('Contains images or graphics');
    score -= 3;
  }

  score = Math.max(0, score);

  return {
    passed: issues.length === 0,
    score: Math.round(score),
    message: issues.length === 0 ? 'Formatting is ATS-friendly' : `${issues.length} formatting issue(s) found`,
    details: { issues }
  };
}

/**
 * Check section completeness
 */
function checkSections(text, resumeData) {
  const requiredSections = [
    { name: 'Experience', keywords: ['experience', 'work', 'employment', 'career'] },
    { name: 'Education', keywords: ['education', 'academic', 'degree', 'university'] },
    { name: 'Skills', keywords: ['skills', 'competencies', 'technologies', 'proficiencies'] }
  ];

  const textLower = text.toLowerCase();
  const foundSections = requiredSections.filter(section =>
    section.keywords.some(keyword => textLower.includes(keyword))
  );

  // Also check resumeData if available
  if (resumeData) {
    if (resumeData.experience?.length > 0 && !foundSections.find(s => s.name === 'Experience')) {
      foundSections.push({ name: 'Experience', keywords: [] });
    }
    if (resumeData.education?.length > 0 && !foundSections.find(s => s.name === 'Education')) {
      foundSections.push({ name: 'Education', keywords: [] });
    }
    if (resumeData.skills?.length > 0 && !foundSections.find(s => s.name === 'Skills')) {
      foundSections.push({ name: 'Skills', keywords: [] });
    }
  }

  const score = (foundSections.length / requiredSections.length) * 15; // 15 points max

  return {
    passed: foundSections.length === requiredSections.length,
    score: Math.round(score),
    message: `Found ${foundSections.length}/${requiredSections.length} required sections`,
    details: { 
      foundSections: foundSections.map(s => s.name),
      missingSections: requiredSections.filter(s => !foundSections.find(fs => fs.name === s.name)).map(s => s.name)
    }
  };
}

/**
 * Check resume length
 */
function checkLength(text) {
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;

  let score = 10;
  let message = '';

  // Ideal length: 400-800 words
  if (wordCount < 200) {
    score = 3;
    message = 'Resume is too short (less than 200 words)';
  } else if (wordCount < 400) {
    score = 6;
    message = 'Resume is somewhat short (200-400 words)';
  } else if (wordCount > 1200) {
    score = 6;
    message = 'Resume is too long (more than 1200 words)';
  } else if (wordCount > 800) {
    score = 8;
    message = 'Resume is slightly long (800-1200 words)';
  } else {
    message = 'Resume length is optimal (400-800 words)';
  }

  return {
    passed: wordCount >= 400 && wordCount <= 800,
    score: Math.round(score),
    message,
    details: { wordCount, charCount }
  };
}

/**
 * Check for action verbs
 */
function checkActionVerbs(text) {
  const actionVerbs = [
    'achieved', 'managed', 'developed', 'implemented', 'created', 'designed',
    'led', 'improved', 'increased', 'reduced', 'optimized', 'delivered',
    'executed', 'established', 'coordinated', 'supervised', 'trained',
    'analyzed', 'researched', 'collaborated', 'initiated', 'launched'
  ];

  const textLower = text.toLowerCase();
  const foundVerbs = actionVerbs.filter(verb => textLower.includes(verb));

  const score = Math.min(10, (foundVerbs.length / 5) * 10); // 10 points max, cap at 5+ verbs

  return {
    passed: foundVerbs.length >= 3,
    score: Math.round(score),
    message: `Found ${foundVerbs.length} action verb(s)`,
    details: { foundVerbs, totalPossible: actionVerbs.length }
  };
}

/**
 * Check for quantifiable achievements
 */
function checkQuantifiableAchievements(text) {
  // Look for numbers, percentages, dollar amounts, etc.
  const numberPatterns = [
    /\d+%/g,  // Percentages
    /\$\d+[KMB]?/g,  // Dollar amounts
    /\d+\+/g,  // Numbers with plus
    /\d+ years?/gi,  // Years of experience
    /\d+ months?/gi,  // Months
    /increased by \d+/gi,
    /reduced by \d+/gi,
    /improved by \d+/gi
  ];

  let totalNumbers = 0;
  numberPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) totalNumbers += matches.length;
  });

  const score = Math.min(10, (totalNumbers / 3) * 10); // 10 points max, cap at 3+ numbers

  return {
    passed: totalNumbers >= 2,
    score: Math.round(score),
    message: `Found ${totalNumbers} quantifiable metric(s)`,
    details: { count: totalNumbers }
  };
}

/**
 * Get recommendations based on checks
 */
function getRecommendations(checks) {
  const recommendations = [];

  if (!checks.contactInfo.passed) {
    recommendations.push({
      priority: 'high',
      category: 'Contact Information',
      message: 'Add complete contact information including name, email, phone, and location'
    });
  }

  if (!checks.sections.passed) {
    recommendations.push({
      priority: 'high',
      category: 'Sections',
      message: `Add missing sections: ${checks.sections.details.missingSections.join(', ')}`
    });
  }

  if (!checks.keywords.passed) {
    recommendations.push({
      priority: 'medium',
      category: 'Keywords',
      message: 'Include more relevant keywords and section headers'
    });
  }

  if (!checks.length.passed) {
    recommendations.push({
      priority: 'medium',
      category: 'Length',
      message: checks.length.message
    });
  }

  if (!checks.formatting.passed) {
    recommendations.push({
      priority: 'high',
      category: 'Formatting',
      message: 'Remove complex formatting, tables, and graphics for better ATS compatibility'
    });
  }

  if (!checks.actionVerbs.passed) {
    recommendations.push({
      priority: 'medium',
      category: 'Content',
      message: 'Use more action verbs to describe your achievements'
    });
  }

  if (!checks.quantifiableAchievements.passed) {
    recommendations.push({
      priority: 'medium',
      category: 'Achievements',
      message: 'Add quantifiable metrics (percentages, numbers, dollar amounts) to showcase impact'
    });
  }

  return recommendations;
}

/**
 * Get summary based on score
 */
function getSummary(score, grade) {
  if (score >= 90) {
    return 'Excellent! Your resume is highly optimized for ATS systems.';
  } else if (score >= 80) {
    return 'Good! Your resume is well-optimized with minor improvements needed.';
  } else if (score >= 70) {
    return 'Fair. Your resume needs some improvements to pass ATS filters effectively.';
  } else if (score >= 60) {
    return 'Needs improvement. Several areas need attention to improve ATS compatibility.';
  } else {
    return 'Requires significant work. Multiple critical areas need to be addressed.';
  }
}

/**
 * Analyze uploaded resume file
 */
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    let resumeText = '';

    // Extract text based on file type
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      resumeText = await extractTextFromPDF(file.buffer);
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.toLowerCase().endsWith('.docx')
    ) {
      resumeText = await extractTextFromDOCX(file.buffer);
    } else if (file.mimetype === 'text/plain' || file.originalname.toLowerCase().endsWith('.txt')) {
      resumeText = file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file format. Please upload PDF, DOCX, or TXT files.'
      });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract text from the file. Please ensure the file contains readable text.'
      });
    }

    // Calculate ATS score
    const atsResult = calculateATSScore(resumeText);

    res.json({
      success: true,
      data: {
        ...atsResult,
        extractedText: resumeText.substring(0, 500) // First 500 chars for preview
      }
    });
  } catch (error) {
    console.error('ATS Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze resume'
    });
  }
};

/**
 * Analyze resume from text content
 */
const analyzeResumeFromText = async (req, res) => {
  try {
    const { text, resumeData } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Resume text is required'
      });
    }

    // Calculate ATS score
    const atsResult = calculateATSScore(text, resumeData);

    res.json({
      success: true,
      data: atsResult
    });
  } catch (error) {
    console.error('ATS Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze resume'
    });
  }
};

module.exports = {
  analyzeResume,
  analyzeResumeFromText
};

