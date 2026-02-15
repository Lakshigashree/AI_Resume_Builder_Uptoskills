import React from "react";
import { 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  Zap, 
  BookOpen, 
  Code, 
  Award, 
  Trophy, 
  Activity,
  Link as LinkIcon,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Users,
  Target,
  Star,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader
} from "lucide-react";

/**
 * 🔹 1. Global Section Icons
 * Use this to keep icons consistent across all 30 templates.
 * Enhanced with more icon options and better color handling
 */
export const getSectionIcon = (key, color = "#00796b", size = 20) => {
  const iconProps = { 
    size, 
    style: { marginRight: "0.6rem", color },
    className: "section-icon" 
  };
  
  const icons = {
    summary: <Sparkles {...iconProps} />,
    experience: <Briefcase {...iconProps} />,
    education: <GraduationCap {...iconProps} />,
    skills: <Zap {...iconProps} />,
    projects: <Code {...iconProps} />,
    certifications: <Award {...iconProps} />,
    achievements: <Trophy {...iconProps} />,
    languages: <BookOpen {...iconProps} />,
    interests: <Activity {...iconProps} />,
    // Additional section types for flexibility
    objective: <Target {...iconProps} />,
    publications: <FileText {...iconProps} />,
    references: <Users {...iconProps} />,
    volunteer: <Heart {...iconProps} />,
    awards: <Star {...iconProps} />
  };
  
  return icons[key] || <CheckCircle {...iconProps} />;
};

/**
 * 🔹 2. Social & Contact Icons
 * Specific icons for the header links with enhanced options
 */
export const getContactIcon = (key, color = "#4b5563", size = 16) => {
  const props = { 
    size, 
    style: { color, marginRight: "4px" },
    className: "contact-icon"
  };
  
  const icons = {
    phone: <Phone {...props} />,
    email: <Mail {...props} />,
    location: <MapPin {...props} />,
    linkedin: <Linkedin {...props} />,
    github: <Github {...props} />,
    portfolio: <Globe {...props} />,
    website: <Globe {...props} />,
    twitter: <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>,
    link: <LinkIcon {...props} />
  };
  
  return icons[key] || null;
};

/**
 * 🔹 3. Status & Feedback Icons
 * For ATS score, loading states, and validation feedback
 */
export const getStatusIcon = (type, color, size = 16) => {
  const props = { size, style: { color } };
  
  const icons = {
    success: <CheckCircle {...props} />,
    warning: <AlertCircle {...props} />,
    loading: <Loader {...props} className="animate-spin" />,
    error: <AlertCircle {...props} />,
    info: <Sparkles {...props} />
  };
  
  return icons[type] || null;
};

/**
 * 🔹 4. Global Content Visibility Checker
 * Enhanced with better empty state detection and debug mode
 */
export const hasContent = (data, key, editMode = false, debug = false) => {
  // Debug logging for troubleshooting
  if (debug) {
    console.log(`Checking content for: ${key}`, data?.[key]);
  }
  
  // In edit mode, always show sections that can accept content
  if (editMode) return true;
  
  if (!data || !key) return false;
  
  const val = data[key];
  if (val === undefined || val === null) return false;

  // Check for arrays (Experience, Education, etc.)
  if (Array.isArray(val)) {
    if (val.length === 0) return false;
    
    // Check if at least one object in the array has meaningful text
    return val.some(item => {
      if (!item) return false;
      
      if (typeof item === "string") {
        return item.trim().length > 0;
      }
      
      // Check all keys in the object (e.g., title, company, degree)
      return Object.values(item).some(v => {
        if (v === undefined || v === null) return false;
        if (typeof v === "string") return v.trim().length > 0;
        if (typeof v === "number") return true; // Numbers are valid content
        if (Array.isArray(v)) return v.length > 0;
        return !!v; // For booleans, objects, etc.
      });
    });
  }

  // Check for strings (Summary)
  if (typeof val === "string") {
    return val.trim().length > 0;
  }
  
  // Check for objects (for single entry sections)
  if (typeof val === "object") {
    return Object.values(val).some(v => {
      if (!v) return false;
      if (typeof v === "string") return v.trim().length > 0;
      return true;
    });
  }
  
  // Numbers, booleans are considered content
  return val !== undefined && val !== null;
};

/**
 * 🔹 5. Social Link Formatter (The Redirector)
 * Enhanced with better URL handling and validation
 */
export const getSafeUrl = (type, value) => {
  if (!value) return null;
  
  // Handle different input types
  let val = typeof value === "string" ? value.trim() : String(value).trim();
  
  // Remove any invisible characters
  val = val.replace(/[\u200B-\u200D\uFEFF]/g, '');

  switch (type) {
    case "email":
      // Validate email format before creating mailto link
      if (!val.includes('@') || !val.includes('.')) {
        console.warn("Invalid email format:", val);
        return null;
      }
      return `mailto:${val}`;
      
    case "phone":
      // Remove all non-numeric characters except +
      const cleanPhone = val.replace(/[^\d+]/g, '');
      return cleanPhone ? `tel:${cleanPhone}` : null;
      
    case "linkedin":
      // Ensure proper LinkedIn URL format
      if (!val.includes('linkedin.com')) {
        val = val.startsWith('in/') ? `https://linkedin.com/${val}` : `https://linkedin.com/in/${val}`;
      }
      return val.startsWith("http") ? val : `https://${val}`;
      
    case "github":
      // Ensure proper GitHub URL format
      if (!val.includes('github.com')) {
        val = val.startsWith('@') ? val.substring(1) : val;
        val = `https://github.com/${val}`;
      }
      return val.startsWith("http") ? val : `https://${val}`;
      
    case "portfolio":
    case "website":
      // Add https:// if missing
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        val = `https://${val}`;
      }
      return val;
      
    default:
      return val.startsWith("http") ? val : `https://${val}`;
  }
};

/**
 * 🔹 6. Data Normalization Helper
 * Enhanced to prevent [object Object] errors and handle complex data structures
 */
export const renderSafe = (val, fallback = "") => {
  if (val === undefined || val === null) return fallback;
  
  // Handle different types safely
  if (typeof val === "string") return val;
  
  if (typeof val === "number") return val.toString();
  
  if (typeof val === "boolean") return val ? "Yes" : "No";
  
  if (Array.isArray(val)) {
    // Join arrays for display
    return val.map(item => renderSafe(item)).filter(Boolean).join(", ");
  }
  
  if (typeof val === "object") {
    // Try common property names for objects
    const possibleKeys = [
      "name", "title", "degree", "language", 
      "value", "label", "text", "description",
      "company", "institution", "organization"
    ];
    
    for (const key of possibleKeys) {
      if (val[key] && typeof val[key] === "string") {
        return val[key];
      }
    }
    
    // If no matching key, try to stringify safely
    try {
      return JSON.stringify(val);
    } catch {
      return fallback;
    }
  }
  
  return fallback;
};

/**
 * 🔹 7. Format Date for Resume Display
 * Helper function to format dates consistently across templates
 */
export const formatResumeDate = (dateStr, options = {}) => {
  if (!dateStr) return options.default || "";
  
  const { format = "MMM YYYY", short = false } = options;
  
  // Handle "Present" case
  if (dateStr.toLowerCase() === "present") return "Present";
  
  // Try to parse the date
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return original if parsing fails
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    if (format === "MMM YYYY") return `${month} ${year}`;
    if (format === "YYYY") return `${year}`;
    if (format === "MM/YYYY") return `${date.getMonth() + 1}/${year}`;
    
    return `${month} ${year}`;
  } catch {
    return dateStr;
  }
};

/**
 * 🔹 8. Section Order Validator
 * Ensures section order array contains valid sections only
 */
export const validateSectionOrder = (order, validSections) => {
  if (!Array.isArray(order)) return validSections;
  
  // Filter out invalid sections and remove duplicates
  const valid = order.filter(section => 
    validSections.includes(section)
  );
  
  // Add any missing valid sections
  const missing = validSections.filter(section => 
    !valid.includes(section)
  );
  
  return [...valid, ...missing];
};

/**
 * 🔹 9. PDF Export Options
 * Centralized PDF configuration for consistent downloads
 */
export const getPDFOptions = (template = "default") => {
  const baseOptions = {
    margin: 0,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      logging: false
    },
    jsPDF: { 
      unit: "mm", 
      format: "a4", 
      orientation: "portrait" 
    }
  };

  const templateOptions = {
    default: {},
    compact: {
      html2canvas: { scale: 1.8 },
      margin: 2
    },
    professional: {
      html2canvas: { scale: 2.2 },
      image: { quality: 0.95 }
    }
  };

  return {
    ...baseOptions,
    ...(templateOptions[template] || {}),
    filename: `Resume_${new Date().toISOString().split('T')[0]}.pdf`
  };
};

/**
 * 🔹 10. Export all utilities as a single object
 * For convenient importing
 */
export const resumeUtils = {
  getSectionIcon,
  getContactIcon,
  getStatusIcon,
  hasContent,
  getSafeUrl,
  renderSafe,
  formatResumeDate,
  validateSectionOrder,
  getPDFOptions
};

export default resumeUtils;