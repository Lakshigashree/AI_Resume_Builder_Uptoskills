// Role based ATS keyword database
// Role based ATS keyword database
const ROLE_KEYWORDS = {

  // ---------------- IT ROLES ----------------
  "Software Developer": [
    "javascript","java","python","c++","api","rest api","git","github",
    "debugging","oop","data structures","algorithms","problem solving","deployment"
  ],

  "Frontend Developer": [
    "html","css","javascript","react","tailwind","bootstrap","responsive design",
    "ui","ux","web performance","cross browser","dom","frontend","figma"
  ],

  "Backend Developer": [
    "node","express","api","database","mongodb","mysql","authentication",
    "authorization","server","backend","rest api","jwt","security"
  ],

  "Full Stack Developer": [
    "react","node","mongodb","mysql","api","frontend","backend","deployment",
    "git","github","full stack","web application","authentication"
  ],

  "Data Analyst": [
    "excel","sql","power bi","tableau","data visualization","statistics",
    "python","pandas","numpy","dashboard","reporting","analytics","data cleaning"
  ],

  "Machine Learning Engineer": [
    "python","machine learning","deep learning","tensorflow","pytorch","scikit-learn",
    "nlp","computer vision","model training","feature engineering","deployment","flask","fastapi"
  ],

  // ---------------- COMMERCE ROLES ----------------
  "Accountant": [
    "tally","gst","taxation","accounting","ledger","balance sheet","journal entry",
    "financial statements","bookkeeping","reconciliation","invoice","compliance"
  ],

  "Financial Analyst": [
    "financial modeling","forecasting","budgeting","valuation","ratio analysis",
    "excel","financial statements","investment","risk analysis","profitability"
  ],

  "Banking Associate": [
    "customer service","banking operations","kYC","loan processing","documentation",
    "account opening","transactions","compliance","financial products","sales"
  ],

  "Auditor": [
    "audit","internal audit","compliance","risk assessment","documentation",
    "financial records","verification","regulations","reporting","inspection"
  ],

  "Tax Consultant": [
    "gst","income tax","tax filing","tax planning","returns","deductions",
    "compliance","financial records","consultation","regulations"
  ],

  // ---------------- GENERAL ROLES ----------------
  "HR Executive": [
    "recruitment","screening","onboarding","employee engagement","hr policies",
    "attendance","payroll","communication","training","performance management"
  ],

  "Marketing Executive": [
    "marketing","seo","social media","branding","campaigns","content marketing",
    "lead generation","analytics","advertising","promotion","digital marketing"
  ],

  "Operations Executive": [
    "operations","coordination","process improvement","reporting","planning",
    "logistics","workflow","team management","documentation","efficiency"
  ],

  "Customer Support": [
    "customer handling","communication","problem solving","ticketing","crm",
    "client support","service","issue resolution","email support","chat support"
  ]
};
const DEFAULT_KEYWORDS = [
  "communication",
  "teamwork",
  "problem solving",
  "leadership",
  "time management",
  "adaptability",
  "responsibility",
  "collaboration"
];

export function analyzeResume(text, role) {
  if (!text || !role) return null;

  const lowerText = text.toLowerCase();
  const keywords = ROLE_KEYWORDS[role] || [];

  let matched = [];
  let missing = [];

  keywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase()))
      matched.push(keyword);
    else
      missing.push(keyword);
  });

  const score = Math.round((matched.length / keywords.length) * 100);

  return {
    score,
    matchedKeywords: matched,
    missingKeywords: missing,
    suggestions: missing.slice(0, 6).map(k => `Add experience or project related to "${k}"`)
  };
}
