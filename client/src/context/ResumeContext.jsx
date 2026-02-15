/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";

const ResumeContext = createContext();

/**
 * 🔹 ROLE_ORDERS Configuration
 * These keys MUST match the keys used in your template's sectionMap.
 */
const ROLE_ORDERS = {
  fresher: [
    "summary", 
    "education", 
    "skills", 
    "projects", 
    "experience", 
    "certifications", 
    "languages", 
    "achievements", 
    "interests"
  ],
  experienced: [
    "summary", 
    "experience", 
    "skills", 
    "projects", 
    "education", 
    "certifications", 
    "languages", 
    "achievements", 
    "interests"
  ],
  custom: [
    "summary", 
    "experience", 
    "projects", 
    "skills", 
    "education", 
    "certifications", 
    "languages", 
    "interests", 
    "achievements"
  ],
};

const defaultResumeData = {
  name: "",
  role: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  profileImage: "", 
  resumeMode: "custom", // Defaulting to custom mode
  summary: "",
  skills: [],
  languages: [],
  interests: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: [],
};

export const ResumeProvider = ({ children }) => {
  const [resumeData, setResumeData] = useState(defaultResumeData);
  
  /**
   * 🔹 sectionOrder State
   * This is the "Source of Truth" for section placement in all 30 templates.
   */
  const [sectionOrder, setSectionOrder] = useState(ROLE_ORDERS.custom);

  /**
   * 🔹 Live Synchronization Effect
   * Triggers whenever resumeData.resumeMode is updated by the Sidebar.
   */
  useEffect(() => {
    const currentMode = resumeData.resumeMode || "custom";
    if (ROLE_ORDERS[currentMode]) {
      setSectionOrder(ROLE_ORDERS[currentMode]);
    }
  }, [resumeData.resumeMode]);

  // Load persistent data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setResumeData(prev => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error('❌ Error parsing saved resume data:', error);
      }
    }
  }, []);

  /**
   * 🔹 updateResumeData
   * Updates state and persists to localStorage.
   */
  const updateResumeData = (newData) => {
  setResumeData(prev => {
    const updated =
      typeof newData === "function"
        ? newData(prev)
        : { ...prev, ...newData };

    localStorage.setItem("resumeData", JSON.stringify(updated));
    return updated;
  });
};


  /**
   * 🔹 resetResumeData
   * Reverts to defaults and clears storage.
   */
  const resetResumeData = () => {
    setResumeData(defaultResumeData);
    setSectionOrder(ROLE_ORDERS.custom);
    localStorage.removeItem('resumeData');
  };

  return (
    <ResumeContext.Provider value={{ 
      resumeData, 
      updateResumeData, 
      resetResumeData,
      sectionOrder,    // 🔹 Exported for Template mapping
      setSectionOrder, // 🔹 Exported for manual reordering in 'custom' mode
      roleOrders: ROLE_ORDERS 
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => useContext(ResumeContext);
export { ResumeContext };