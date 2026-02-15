const { getEnhancedText } = require("../services/geminiService");
const { saveEnhancementHistory } = require("../models/resumeModel");

const enhanceSection = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { section, data } = req.body;

    if (!section || !data) {
      return res.status(400).json({ error: "Missing section or data" });
    }

    const prompt = generatePrompt(section, data);
    const enhancedText = await getEnhancedText(prompt);
    
    // 🔹 FIX 1: Strip Markdown code blocks (e.g., ```json ... ```) 
    // AI models often wrap JSON in these blocks, which causes JSON.parse to fail.
    const cleanText = enhancedText.replace(/```json|```/gi, "").trim();

    let finalData = cleanText;

    // 🔹 FIX 2: Handle sections that MUST be Objects/Arrays
    const jsonSections = ["education", "personal", "languages", "ats_score"];
    
    if (jsonSections.includes(section)) {
      try {
        finalData = JSON.parse(cleanText);
      } catch (e) {
        console.error(`⚠️ AI returned invalid JSON for ${section}. Falling back to raw text.`);
        // Fallback to the cleaned text to avoid a 500 error, allowing the frontend to handle it
        finalData = cleanText;
      }
    }
    
    const processingTime = Date.now() - startTime;

    // Save to database history
    try {
      const historyData = typeof data === 'string' ? data : JSON.stringify(data);
      const historyEnhanced = typeof finalData === 'string' ? finalData : JSON.stringify(finalData);
      
      await saveEnhancementHistory(
        section, 
        historyData, 
        historyEnhanced, 
        processingTime
      );
    } catch (dbError) {
      console.error("⚠️ History Save Failed:", dbError.message);
    }

    // Send the response (enhanced can now be a String or an Object/Array)
    res.status(200).json({ enhanced: finalData });

  } catch (err) {
    console.error("❌ Gemini Controller Error:", err); 
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: err.message 
    });
  }
};

const generatePrompt = (section, data) => {
  switch (section) {
    case "summary":
      return `
You are a professional resume writer. 
Rewrite the following summary to be concise (2-3 lines), clear, and impactful for a software developer applying to top tech companies.

Instructions:
- Remove filler or vague phrases.
- Keep only the most impressive, relevant details.
- Output as 2 or 3 clean sentences.
- No bullet points, quotes, asterisks, or brackets.

Original:
${data}
`;

    case "skills":
      return `
Rewrite the following skills into 3–4 clean bullet points, one per line.

Instructions:
- Group related skills and avoid redundancy.
- Be concise, modern, and skip outdated tools.
- Do NOT use quotes, asterisks, or JSON.

Original:
${JSON.stringify(data)}
`;

    case "experience":
      return `
Enhance the job experience below into a clean, professional format.

Format:
Job Title @ Company
Duration | Location
• Achievement 1 (impact-driven)
• Achievement 2 (quantifiable if possible)

Avoid:
- Quotes, brackets, JSON, asterisks.
- Too many technical jargons unless relevant.

Original:
${JSON.stringify(data)}
`;

    case "education":
      return `
You are a professional resume writer. Enhance this education data and return it as a valid JSON array.

Instructions:
- Return ONLY a valid JSON array, no additional text
- Each education entry should have: degree, institution, year, grade
- Improve descriptions to be more professional and impactful
- Keep all original information but enhance clarity
- Example format: [{"degree": "Bachelor of Science in Computer Science", "institution": "Stanford University", "year": "2018-2022", "grade": "3.8 GPA"}]

Original:
${JSON.stringify(data)}

Return only the JSON array:
`;

    case "personal":
      return `
You are a professional resume writer. Enhance this personal details data and return it as a valid JSON object.

Instructions:
- Return ONLY a valid JSON object, no additional text
- Enhance the summary/bio to be more professional and impactful
- Keep all original contact information but improve formatting
- Object should have fields: name, role, email, phone, location, linkedin, github, summary
- Example format: {"name": "John Doe", "role": "Senior Software Engineer", "email": "john@email.com", "phone": "+1 (555) 123-4567", "location": "San Francisco, CA", "linkedin": "linkedin.com/in/johndoe", "github": "github.com/johndoe", "summary": "Experienced software engineer with 5+ years developing scalable web applications..."}

Original:
${JSON.stringify(data)}

Return only the JSON object:
`;

    case "projects":
      return `
Reformat these projects professionally.

Instructions:
- List 1–2 impressive projects.
- Use this format:
  Project Name – Tech Used
  • What it does / why it matters (concise)

- No JSON, asterisks, or quotes.
- Focus on impact or usefulness.

Original:
${JSON.stringify(data)}
`;

    case "certifications":
      return `
List certifications in a professional and clean format.

Instructions:
- Use this format:
  Certification Name – Issuing Organization
  Date

- List only relevant ones.
- No quotes, JSON, or asterisks.

Original:
${JSON.stringify(data)}
`;

    case "achievements":
      return `
List professional achievements in bullet points.

Instructions:
- Each line should be one achievement.
- Focus on awards, recognitions, or milestones.
- Do NOT use asterisks, quotes, or JSON.

Original:
${JSON.stringify(data)}
`;

    case "interests":
      return `
List the user's interests in a clean, readable way.

Instructions:
- Bullet point format, like:
  - Interest 1
  - Interest 2
- Keep it short and simple.
- No stars, quotes, or extra decorations.

Original:
${JSON.stringify(data)}
`;

    case "languages":
      return `
You are a professional resume writer. Enhance this languages data and return it as a valid JSON array.

Instructions:
- Return ONLY a valid JSON array, no additional text
- Each language entry should have: language, proficiency
- Improve proficiency descriptions to be professional (e.g., "Native", "Fluent", "Conversational", "Basic")
- Keep all original languages but enhance clarity
- Example format: [{"language": "English", "proficiency": "Native"}, {"language": "Spanish", "proficiency": "Conversational"}]

Original:
${JSON.stringify(data)}

Return only the JSON array:
`;

    case "full_resume":
      return `
You are a professional resume writer and ATS (Applicant Tracking System) optimization expert.

Enhance the following complete resume to make it:
- ATS-friendly with proper formatting
- Professional and impactful
- Well-structured with clear sections
- Free of grammatical errors
- Optimized for keyword relevance

Instructions:
- Maintain the original structure and all personal information
- Improve language clarity and professional tone
- Ensure consistent formatting throughout
- Remove any unnecessary symbols, asterisks, or decorations
- Make achievements quantifiable where possible
- Keep it concise yet comprehensive

Original Resume:
${data}
`;

     case "ats_score":
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid data format for ATS score");
      }
      
      const jd = data.jobDescription || "No job description provided";
      const resume = data.resumeText || "No resume content provided";

      return `
You are an expert ATS (Applicant Tracking System) optimization professional. 
Analyze the provided Resume Content against the target Job Description.

Instructions:
1. Calculate a match score (0-100) based on hard skills, soft skills, and experience level.
2. Identify "Missing Keywords" that are critical in the JD but absent in the Resume.
3. Provide a brief professional "Analysis" (2-3 sentences) of the overall candidate fit.
4. Provide "Actionable Fixes" - specific steps the user can take to improve this specific resume.

Return ONLY a valid JSON object with this exact structure:
{
  "score": number,
  "missingKeywords": ["keyword1", "keyword2"],
  "analysis": "string summary",
  "actionableFixes": ["fix1", "fix2"],
  "formattingFeedback": "advice on readability"
}

Job Description:
${jd}

Resume Content:
${resume}
`;

    default:
      return `
Polish the following resume section. Avoid using JSON, quotes, or unnecessary symbols.

Original:
${JSON.stringify(data)}
`;
  }
};

module.exports = { enhanceSection };