import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import { getSafeUrl } from "../../utils/ResumeConfig";
import { 
  FaPhoneAlt, 
  FaEnvelope, 
  FaLinkedin, 
  FaMapMarkerAlt, 
  FaGithub,
  FaGlobe 
} from "react-icons/fa";

// ========== HELPER FUNCTION FOR SAFE TEXT RENDERING ==========
const renderSafeText = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    // Try common property names in order of priority
    return item.title || item.name || item.language || item.degree || item.projectName || JSON.stringify(item);
  }
  return String(item);
};

const Template20 = () => {
  const resumeRef = useRef(null);
  const resumeContext = useResume();
  const { isAuthenticated } = useAuth();
  
  const { 
    resumeData, 
    updateResumeData, 
    sectionOrder 
  } = resumeContext || { 
    resumeData: {}, 
    updateResumeData: null, 
    sectionOrder: [] 
  };
  
  const [localData, setLocalData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Default data structure with ALL 9 sections
  const getDefaultData = () => ({
    name: "",
    role: "",
    phone: "",
    email: "",
    linkedin: "",
    location: "",
    github: "",
    portfolio: "",
    summary: "",
    skills: [],
    education: [],
    experience: [],
    projects: [],           // Projects section
    certifications: [],      // ✅ FIXED: Changed from 'certificates' to 'certifications'
    languages: [],
    achievements: [],
    interests: [],
    templateId: 20
  });

  // Initialize data from context or defaults
  useEffect(() => {
    if (resumeData && Object.keys(resumeData).length > 0) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
    } else {
      setLocalData(getDefaultData());
    }
  }, [resumeData]);

  // ========== HANDLER FUNCTIONS ==========

  const handleFieldChange = (field, value) => {
    if (!localData) return;
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    localStorage.setItem("resumeData", JSON.stringify(updatedData));
  };

  // Handle array field changes for complex objects
  const handleArrayUpdate = (section, index, key, value) => {
    if (!localData || !localData[section]) return;
    
    setLocalData(prev => {
      const updated = [...(prev[section] || [])];
      if (!updated[index]) updated[index] = {};
      
      if (typeof updated[index] === 'object') {
        updated[index] = { ...updated[index], [key]: value };
      } else {
        updated[index] = value;
      }
      
      const newData = { ...prev, [section]: updated };
      localStorage.setItem("resumeData", JSON.stringify(newData));
      return newData;
    });
  };

  // Handle simple array changes (skills, achievements, interests)
  const handleSimpleArrayChange = (section, index, value) => {
    if (!localData || !localData[section]) return;
    
    setLocalData(prev => {
      const updated = [...(prev[section] || [])];
      updated[index] = value;
      const newData = { ...prev, [section]: updated };
      localStorage.setItem("resumeData", JSON.stringify(newData));
      return newData;
    });
  };

  // ========== ADD/REMOVE FUNCTIONS ==========

  // Education
  const addEducation = () => {
    const current = localData?.education || [];
    const updated = [
      ...current,
      { degree: "", duration: "", institution: "", location: "" }
    ];
    handleFieldChange("education", updated);
    toast.info("Added new education");
  };

  const removeEducation = (index) => {
    const updated = [...(localData?.education || [])];
    updated.splice(index, 1);
    handleFieldChange("education", updated);
    toast.warn("Removed education");
  };

  // Experience
  const addExperience = () => {
    const current = localData?.experience || [];
    const updated = [
      ...current,
      {
        title: "",
        date: "",
        companyName: "",
        companyLocation: "",
        accomplishment: []
      }
    ];
    handleFieldChange("experience", updated);
    toast.info("Added new experience");
  };

  const removeExperience = (index) => {
    const updated = [...(localData?.experience || [])];
    updated.splice(index, 1);
    handleFieldChange("experience", updated);
    toast.warn("Removed experience");
  };

  // Projects
  const addProject = () => {
    const current = localData?.projects || [];
    const updated = [
      ...current,
      { 
        name: "", 
        description: "", 
        technologies: [], 
        link: "",
        githubLink: "" 
      }
    ];
    handleFieldChange("projects", updated);
    toast.info("Added new project");
  };

  const removeProject = (index) => {
    const updated = [...(localData?.projects || [])];
    updated.splice(index, 1);
    handleFieldChange("projects", updated);
    toast.warn("Removed project");
  };

  // Languages
  const addLanguage = () => {
    const current = localData?.languages || [];
    const updated = [...current, { language: "", proficiency: "" }];
    handleFieldChange("languages", updated);
    toast.info("Added new language");
  };

  const removeLanguage = (index) => {
    const updated = [...(localData?.languages || [])];
    updated.splice(index, 1);
    handleFieldChange("languages", updated);
    toast.warn("Removed language");
  };

  // ✅ FIXED: Changed from 'certificates' to 'certifications'
  const addCertification = () => {
    const current = localData?.certifications || [];
    const updated = [...current, { title: "", issuer: "", date: "" }];
    handleFieldChange("certifications", updated);
    toast.info("Added new certification");
  };

  const removeCertification = (index) => {
    const updated = [...(localData?.certifications || [])];
    updated.splice(index, 1);
    handleFieldChange("certifications", updated);
    toast.warn("Removed certification");
  };

  // Achievements
  const addAchievement = () => {
    const current = localData?.achievements || [];
    const updated = [...current, ""];
    handleFieldChange("achievements", updated);
    toast.info("Added new achievement");
  };

  const removeAchievement = (index) => {
    const updated = [...(localData?.achievements || [])];
    updated.splice(index, 1);
    handleFieldChange("achievements", updated);
    toast.warn("Removed achievement");
  };

  // Skills
  const addSkill = () => {
    const current = localData?.skills || [];
    const updated = [...current, ""];
    handleFieldChange("skills", updated);
    toast.info("Added new skill");
  };

  const removeSkill = (index) => {
    const updated = [...(localData?.skills || [])];
    updated.splice(index, 1);
    handleFieldChange("skills", updated);
    toast.warn("Removed skill");
  };

  // Interests
  const addInterest = () => {
    const current = localData?.interests || [];
    const updated = [...current, ""];
    handleFieldChange("interests", updated);
    toast.info("Added new interest");
  };

  const removeInterest = (index) => {
    const updated = [...(localData?.interests || [])];
    updated.splice(index, 1);
    handleFieldChange("interests", updated);
    toast.warn("Removed interest");
  };

  // ========== SAVE/CANCEL FUNCTIONS ==========

  const handleSave = async () => {
    if (!localData) return;
    
    try {
      setIsSaving(true);
      
      // Normalize data before saving
      const normalized = { ...localData };
      
      // Normalize skills
      if (Array.isArray(normalized.skills)) {
        normalized.skills = normalized.skills.filter(s => s && s.trim());
      } else if (typeof normalized.skills === "string") {
        normalized.skills = normalized.skills.split(",").map(s => s.trim()).filter(Boolean);
      } else {
        normalized.skills = [];
      }

      // Normalize other arrays to remove empty items
      normalized.education = (normalized.education || []).filter(
        e => e.degree?.trim() || e.institution?.trim()
      );
      
      normalized.experience = (normalized.experience || []).filter(
        e => e.title?.trim() || e.companyName?.trim()
      );
      
      normalized.projects = (normalized.projects || []).filter(
        p => p.name?.trim() || p.description?.trim()
      );
      
      normalized.languages = (normalized.languages || []).filter(
        l => l.language?.trim()
      );
      
      // ✅ FIXED: Changed from 'certificates' to 'certifications'
      normalized.certifications = (normalized.certifications || []).filter(
        c => c.title?.trim()
      );
      
      normalized.achievements = (normalized.achievements || []).filter(
        a => a && a.trim()
      );
      
      normalized.interests = (normalized.interests || []).filter(
        i => i && i.trim()
      );

      if (typeof updateResumeData === 'function') {
        await updateResumeData(normalized);
      } else {
        // Fallback: just update local state
        setLocalData(normalized);
      }
      
      try {
        localStorage.setItem("resumeData", JSON.stringify(normalized));
      } catch (e) { 
        console.warn("Failed to save to localStorage:", e);
      }
      
      setEditMode(false);
      toast.success('✅ Changes Saved Successfully');
    } catch (error) {
      console.error("Save error:", error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(resumeData ? JSON.parse(JSON.stringify(resumeData)) : getDefaultData());
    setEditMode(false);
    toast.info("Changes discarded");
  };

  const handleEnhance = (section) => {
    // reserved for AI enhance
    console.log("Enhance section:", section);
  };

  // Show loading if no data
  if (!localData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  // ========== CONTENT VISIBILITY CHECKS ==========

  const hasSummary = () => 
    localData.summary && localData.summary.trim().length > 0;

  const hasSkills = () => 
    localData.skills && localData.skills.some(s => s && s.trim().length > 0);

  const hasEducation = () => 
    localData.education && localData.education.some(e => e.degree?.trim() || e.institution?.trim());

  const hasExperience = () => 
    localData.experience && localData.experience.some(e => e.title?.trim() || e.companyName?.trim());

  const hasProjects = () => 
    localData.projects && localData.projects.some(p => p.name?.trim() || p.description?.trim());

  const hasLanguages = () => 
    localData.languages && localData.languages.some(l => l.language?.trim());

  // ✅ FIXED: Changed from 'hasCertificates' to 'hasCertifications'
  const hasCertifications = () => 
    localData.certifications && localData.certifications.some(c => c.title?.trim());

  const hasAchievements = () => 
    localData.achievements && localData.achievements.some(a => a && a.trim().length > 0);

  const hasInterests = () => 
    localData.interests && localData.interests.some(i => i && i.trim().length > 0);

  const hasAnyContact = () => 
    localData.phone?.trim() ||
    localData.email?.trim() ||
    localData.linkedin?.trim() ||
    localData.location?.trim() ||
    localData.github?.trim() ||
    localData.portfolio?.trim();

  // Safe array helper
  const safe = (arr) => (Array.isArray(arr) ? arr : []);

  // ========== STYLES ==========

  const sectionTitleStyle = {
    fontWeight: "bold",
    fontSize: "1.2rem",
    borderBottom: "2px solid #22c55e",
    color: "#2563eb",
    marginTop: "1.5rem",
    paddingBottom: "0.3rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };

  const sectionCardStyle = {
    backgroundColor: "#f9fafb",
    padding: "1rem",
    borderRadius: "0.5rem",
    marginTop: "0.75rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  // ========== SECTION COMPONENTS ==========

  const sectionComponents = {
    summary: (editMode || hasSummary()) && (
      <div key="summary">
        <h3 style={sectionTitleStyle}>Summary</h3>
        <div style={sectionCardStyle}>
          {editMode ? (
            <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem" }} className="no-print">
              <textarea
                value={localData.summary || ""}
                onChange={(e) => handleFieldChange("summary", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.25rem",
                }}
                rows={4}
                placeholder="Write a professional summary..."
              />
            </div>
          ) : (
            <p>{renderSafeText(localData.summary)}</p>
          )}
        </div>
      </div>
    ),

    skills: (editMode || hasSkills()) && (
      <div key="skills">
        <h3 style={sectionTitleStyle}>Skills</h3>
        <div style={sectionCardStyle}>
          {editMode ? (
            <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem" }} className="no-print">
              {safe(localData.skills).map((skill, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    value={skill || ""}
                    onChange={(e) => handleSimpleArrayChange("skills", i, e.target.value)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.25rem",
                      marginRight: "0.5rem"
                    }}
                    placeholder="Skill"
                  />
                  <button
                    onClick={() => removeSkill(i)}
                    style={{
                      color: "red",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "1rem"
                    }}
                  >
                    ✖
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder="Type a new skill and press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    handleFieldChange("skills", [...safe(localData.skills), e.target.value.trim()]);
                    e.target.value = "";
                  }
                }}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.25rem",
                  marginTop: "0.5rem"
                }}
              />
              <button
                onClick={addSkill}
                style={{
                  marginTop: "0.5rem",
                  color: "#2563eb",
                  background: "none",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                + Add Skill
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {safe(localData.skills).map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "#dbeafe",
                    color: "#1e3a8a",
                    padding: "0.3rem 0.7rem",
                    borderRadius: "20px",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    border: "1px solid #93c5fd",
                  }}
                >
                  {renderSafeText(skill)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    ),

    education: (editMode || hasEducation()) && (
      <div key="education">
        <h3 style={sectionTitleStyle}>Education</h3>
        <div style={sectionCardStyle}>
          {safe(localData.education).map((edu, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "1rem",
                borderBottom: "1px dashed #22c55e",
                paddingBottom: "0.5rem",
                position: "relative"
              }}
            >
              {editMode && (
                <button
                  onClick={() => removeEducation(idx)}
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    color: "red",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1rem"
                  }}
                  className="no-print"
                >
                  ✖
                </button>
              )}
              {editMode ? (
                <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem" }} className="no-print">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <input
                      type="text"
                      value={edu.degree || ""}
                      onChange={(e) => handleArrayUpdate("education", idx, "degree", e.target.value)}
                      style={{ fontWeight: "600", width: "70%", padding: "0.3rem" }}
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={edu.duration || ""}
                      onChange={(e) => handleArrayUpdate("education", idx, "duration", e.target.value)}
                      style={{ width: "25%", textAlign: "right", padding: "0.3rem" }}
                      placeholder="Duration"
                    />
                  </div>
                  <input
                    type="text"
                    value={edu.institution || ""}
                    onChange={(e) => handleArrayUpdate("education", idx, "institution", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.3rem", padding: "0.3rem" }}
                    placeholder="Institution"
                  />
                  <input
                    type="text"
                    value={edu.location || ""}
                    onChange={(e) => handleArrayUpdate("education", idx, "location", e.target.value)}
                    style={{ width: "100%", fontSize: "0.85rem", padding: "0.3rem" }}
                    placeholder="Location"
                  />
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontWeight: "600", color: "#2563eb", margin: 0 }}>
                      {renderSafeText(edu.degree)}
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#059669", margin: 0 }}>
                      {renderSafeText(edu.duration)}
                    </p>
                  </div>
                  <p style={{ color: "#059669", margin: "0.2rem 0" }}>
                    {renderSafeText(edu.institution)}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#4b5563", margin: 0 }}>
                    {renderSafeText(edu.location)}
                  </p>
                </>
              )}
            </div>
          ))}

          {editMode && (
            <button
              type="button"
              onClick={addEducation}
              style={{
                marginTop: "0.5rem",
                padding: "0.35rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px dashed #22c55e",
                background: "#ecfdf5",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
              className="no-print"
            >
              + Add Education
            </button>
          )}
        </div>
      </div>
    ),

    experience: (editMode || hasExperience()) && (
      <div key="experience">
        <h3 style={sectionTitleStyle}>Experience</h3>
        <div style={sectionCardStyle}>
          {safe(localData.experience).map((exp, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "1rem",
                borderBottom: "1px dashed #2563eb",
                paddingBottom: "0.5rem",
                position: "relative"
              }}
            >
              {editMode && (
                <button
                  onClick={() => removeExperience(idx)}
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    color: "red",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1rem"
                  }}
                  className="no-print"
                >
                  ✖
                </button>
              )}
              {editMode ? (
                <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem" }} className="no-print">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <input
                      type="text"
                      value={exp.title || ""}
                      onChange={(e) => handleArrayUpdate("experience", idx, "title", e.target.value)}
                      style={{ fontWeight: "600", width: "70%", padding: "0.3rem" }}
                      placeholder="Job Title"
                    />
                    <input
                      type="text"
                      value={exp.date || ""}
                      onChange={(e) => handleArrayUpdate("experience", idx, "date", e.target.value)}
                      style={{ width: "25%", textAlign: "right", padding: "0.3rem" }}
                      placeholder="Date"
                    />
                  </div>
                  <input
                    type="text"
                    value={exp.companyName || ""}
                    onChange={(e) => handleArrayUpdate("experience", idx, "companyName", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.3rem", padding: "0.3rem" }}
                    placeholder="Company Name"
                  />
                  <input
                    type="text"
                    value={exp.companyLocation || ""}
                    onChange={(e) => handleArrayUpdate("experience", idx, "companyLocation", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.3rem", padding: "0.3rem" }}
                    placeholder="Company Location"
                  />
                  <textarea
                    value={(exp.accomplishment || []).join("\n")}
                    onChange={(e) => {
                      const updated = [...(localData.experience || [])];
                      updated[idx].accomplishment = e.target.value.split("\n").filter(Boolean);
                      handleFieldChange("experience", updated);
                    }}
                    style={{
                      width: "100%",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.25rem",
                      padding: "0.5rem",
                      marginTop: "0.3rem"
                    }}
                    rows={3}
                    placeholder="Accomplishments (one per line)"
                  />
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontWeight: "600", color: "#2563eb", margin: 0 }}>
                      {renderSafeText(exp.title)}{" "}
                      <span style={{ color: "#374151" }}>
                        at {renderSafeText(exp.companyName)}
                      </span>
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#059669", margin: 0 }}>
                      {renderSafeText(exp.date)}
                    </p>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0.2rem 0" }}>
                    {renderSafeText(exp.companyLocation)}
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", listStyleType: "disc", margin: "0.5rem 0 0 0" }}>
                    {safe(exp.accomplishment).map((item, i) => (
                      <li key={i}>{renderSafeText(item)}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}

          {editMode && (
            <button
              type="button"
              onClick={addExperience}
              style={{
                marginTop: "0.5rem",
                padding: "0.35rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px dashed #2563eb",
                background: "#eff6ff",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
              className="no-print"
            >
              + Add Experience
            </button>
          )}
        </div>
      </div>
    ),

    projects: (editMode || hasProjects()) && (
      <div key="projects">
        <h3 style={sectionTitleStyle}>Projects</h3>
        <div style={sectionCardStyle}>
          {safe(localData.projects).map((project, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "1rem",
                borderBottom: "1px dashed #22c55e",
                paddingBottom: "0.5rem",
                position: "relative"
              }}
            >
              {editMode && (
                <button
                  onClick={() => removeProject(idx)}
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    color: "red",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1rem"
                  }}
                  className="no-print"
                >
                  ✖
                </button>
              )}
              {editMode ? (
                <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem" }} className="no-print">
                  <input
                    type="text"
                    value={project.name || ""}
                    onChange={(e) => handleArrayUpdate("projects", idx, "name", e.target.value)}
                    style={{ width: "100%", fontWeight: "600", marginBottom: "0.5rem", padding: "0.3rem" }}
                    placeholder="Project Name"
                  />
                  <textarea
                    value={project.description || ""}
                    onChange={(e) => handleArrayUpdate("projects", idx, "description", e.target.value)}
                    style={{
                      width: "100%",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.25rem",
                      padding: "0.5rem",
                      marginBottom: "0.5rem"
                    }}
                    rows={2}
                    placeholder="Project Description"
                  />
                  <input
                    type="text"
                    value={(project.technologies || []).join(", ")}
                    onChange={(e) => handleArrayUpdate("projects", idx, "technologies", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.3rem" }}
                    placeholder="Technologies (comma separated)"
                  />
                  <input
                    type="text"
                    value={project.link || ""}
                    onChange={(e) => handleArrayUpdate("projects", idx, "link", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.3rem" }}
                    placeholder="Live Demo Link"
                  />
                  <input
                    type="text"
                    value={project.githubLink || ""}
                    onChange={(e) => handleArrayUpdate("projects", idx, "githubLink", e.target.value)}
                    style={{ width: "100%", padding: "0.3rem" }}
                    placeholder="GitHub Link"
                  />
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: "600", color: "#2563eb", margin: 0 }}>
                    {renderSafeText(project.name)}
                  </p>
                  <p style={{ fontSize: "0.9rem", margin: "0.2rem 0" }}>
                    {renderSafeText(project.description)}
                  </p>
                  {project.technologies?.length > 0 && (
                    <p style={{ fontSize: "0.85rem", color: "#4b5563", margin: "0.2rem 0" }}>
                      <strong>Tech:</strong> {safe(project.technologies).map(t => renderSafeText(t)).join(", ")}
                    </p>
                  )}
                  {project.link && (
                    <p style={{ margin: "0.2rem 0" }}>
                      <a href={getSafeUrl("portfolio", project.link)} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                        Live Demo
                      </a>
                    </p>
                  )}
                  {project.githubLink && (
                    <p style={{ margin: "0.2rem 0" }}>
                      <a href={getSafeUrl("github", project.githubLink)} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                        GitHub
                      </a>
                    </p>
                  )}
                </>
              )}
            </div>
          ))}

          {editMode && (
            <button
              type="button"
              onClick={addProject}
              style={{
                marginTop: "0.5rem",
                padding: "0.35rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px dashed #22c55e",
                background: "#ecfdf5",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
              className="no-print"
            >
              + Add Project
            </button>
          )}
        </div>
      </div>
    ),

    languages: (editMode || hasLanguages()) && (
      <div key="languages">
        <h3 style={sectionTitleStyle}>Languages</h3>
        <div style={sectionCardStyle}>
          {safe(localData.languages).map((lang, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "0.75rem",
                borderBottom: "1px dashed #e5e7eb",
                paddingBottom: "0.5rem",
                position: "relative"
              }}
            >
              {editMode && (
                <button
                  onClick={() => removeLanguage(idx)}
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    color: "red",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1rem"
                  }}
                  className="no-print"
                >
                  ✖
                </button>
              )}
              {editMode ? (
                <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem" }} className="no-print">
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      value={lang.language || ""}
                      onChange={(e) => handleArrayUpdate("languages", idx, "language", e.target.value)}
                      placeholder="Language (e.g. English)"
                      style={{ flex: 1, minWidth: "150px", padding: "0.3rem" }}
                    />
                    <select
                      value={lang.proficiency || ""}
                      onChange={(e) => handleArrayUpdate("languages", idx, "proficiency", e.target.value)}
                      style={{
                        minWidth: "150px",
                        padding: "0.3rem",
                        borderRadius: "0.25rem",
                        border: "1px solid #d1d5db",
                      }}
                    >
                      <option value="">Proficiency</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Native">Native</option>
                    </select>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0 }}>
                  <strong>{renderSafeText(lang.language)}</strong>{" "}
                  {lang.proficiency && <>– {lang.proficiency}</>}
                </p>
              )}
            </div>
          ))}

          {editMode && (
            <button
              type="button"
              onClick={addLanguage}
              style={{
                marginTop: "0.5rem",
                padding: "0.35rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px dashed #0ea5e9",
                background: "#ecfeff",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
              className="no-print"
            >
              + Add Language
            </button>
          )}
        </div>
      </div>
    ),

    // ✅ FIXED: Changed from 'certificates' to 'certifications'
    certifications: (editMode || hasCertifications()) && (
      <div key="certifications">
        <h3 style={sectionTitleStyle}>Certifications</h3>
        <div style={sectionCardStyle}>
          {safe(localData.certifications).map((cert, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "1rem",
                borderBottom: "1px dashed #22c55e",
                paddingBottom: "0.5rem",
                position: "relative"
              }}
            >
              {editMode && (
                <button
                  onClick={() => removeCertification(idx)}
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    color: "red",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1rem"
                  }}
                  className="no-print"
                >
                  ✖
                </button>
              )}
              {editMode ? (
                <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem" }} className="no-print">
                  <input
                    type="text"
                    value={cert.title || ""}
                    onChange={(e) => handleArrayUpdate("certifications", idx, "title", e.target.value)}
                    placeholder="Certification Title"
                    style={{ width: "100%", fontWeight: "600", marginBottom: "0.5rem", padding: "0.3rem" }}
                  />
                  <input
                    type="text"
                    value={cert.issuer || ""}
                    onChange={(e) => handleArrayUpdate("certifications", idx, "issuer", e.target.value)}
                    placeholder="Issuing Organization"
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.3rem" }}
                  />
                  <input
                    type="text"
                    value={cert.date || ""}
                    onChange={(e) => handleArrayUpdate("certifications", idx, "date", e.target.value)}
                    placeholder="Year"
                    style={{ width: "100%", fontSize: "0.85rem", padding: "0.3rem" }}
                  />
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontWeight: "600", color: "#2563eb", margin: 0 }}>
                      {renderSafeText(cert.title)}
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#059669", margin: 0 }}>
                      {renderSafeText(cert.date)}
                    </p>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "#4b5563", margin: "0.2rem 0 0 0" }}>
                    {renderSafeText(cert.issuer)}
                  </p>
                </>
              )}
            </div>
          ))}

          {editMode && (
            <button
              type="button"
              onClick={addCertification}
              style={{
                marginTop: "0.5rem",
                padding: "0.35rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px dashed #22c55e",
                background: "#ecfdf5",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
              className="no-print"
            >
              + Add Certification
            </button>
          )}
        </div>
      </div>
    ),

    achievements: (editMode || hasAchievements()) && (
      <div key="achievements">
        <h3 style={sectionTitleStyle}>Achievements</h3>
        <div style={sectionCardStyle}>
          {editMode ? (
            <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem" }} className="no-print">
              {safe(localData.achievements).map((ach, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    value={ach || ""}
                    onChange={(e) => handleSimpleArrayChange("achievements", i, e.target.value)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.25rem",
                      marginRight: "0.5rem"
                    }}
                    placeholder="Achievement"
                  />
                  <button
                    onClick={() => removeAchievement(i)}
                    style={{
                      color: "red",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "1rem"
                    }}
                  >
                    ✖
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder="Type a new achievement and press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    handleFieldChange("achievements", [...safe(localData.achievements), e.target.value.trim()]);
                    e.target.value = "";
                  }
                }}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.25rem",
                  marginTop: "0.5rem"
                }}
              />
              <button
                onClick={addAchievement}
                style={{
                  marginTop: "0.5rem",
                  color: "#2563eb",
                  background: "none",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                + Add Achievement
              </button>
            </div>
          ) : (
            <ul style={{ paddingLeft: "1.5rem", listStyleType: "disc", margin: 0 }}>
              {safe(localData.achievements).map((ach, idx) => (
                <li key={idx}>{renderSafeText(ach)}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    ),

    interests: (editMode || hasInterests()) && (
      <div key="interests">
        <h3 style={sectionTitleStyle}>Interests</h3>
        <div style={sectionCardStyle}>
          {editMode ? (
            <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem" }} className="no-print">
              {safe(localData.interests).map((interest, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    value={interest || ""}
                    onChange={(e) => handleSimpleArrayChange("interests", i, e.target.value)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.25rem",
                      marginRight: "0.5rem"
                    }}
                    placeholder="Interest"
                  />
                  <button
                    onClick={() => removeInterest(i)}
                    style={{
                      color: "red",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "1rem"
                    }}
                  >
                    ✖
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder="Type a new interest and press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    handleFieldChange("interests", [...safe(localData.interests), e.target.value.trim()]);
                    e.target.value = "";
                  }
                }}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.25rem",
                  marginTop: "0.5rem"
                }}
              />
              <button
                onClick={addInterest}
                style={{
                  marginTop: "0.5rem",
                  color: "#2563eb",
                  background: "none",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                + Add Interest
              </button>
            </div>
          ) : (
            <p>{(localData.interests || []).map(i => renderSafeText(i)).join(" • ")}</p>
          )}
        </div>
      </div>
    )
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onEnhance={handleEnhance} resumeRef={resumeRef} />
        <div
          style={{
            flexGrow: 1,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <div
            ref={resumeRef}
            style={{
              color: "#1f2937",
              maxWidth: "60rem",
              width: "100%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              padding: "2.5rem",
              border: "3px solid #22c55e",
              borderRadius: "1rem",
            }}
            data-resume-template="template20"
          >
            {/* ===== HEADER SECTION ===== */}
            <div
              style={{
                textAlign: "center",
                borderBottom: "3px solid #22c55e",
                paddingBottom: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={localData.name || ""}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      textAlign: "center",
                      width: "100%",
                      border: "1px solid #d1d5db",
                      padding: "0.25rem",
                      marginBottom: "0.5rem"
                    }}
                    placeholder="Your Name"
                    className="no-print"
                  />
                  <input
                    type="text"
                    value={localData.role || ""}
                    onChange={(e) => handleFieldChange("role", e.target.value)}
                    style={{
                      fontSize: "1.2rem",
                      color: "#059669",
                      textAlign: "center",
                      width: "100%",
                      border: "1px solid #d1d5db",
                      padding: "0.25rem"
                    }}
                    placeholder="Your Role"
                    className="no-print"
                  />
                </>
              ) : (
                <>
                  {localData.name && (
                    <h1
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: "#2563eb",
                        margin: 0
                      }}
                    >
                      {renderSafeText(localData.name)}
                    </h1>
                  )}
                  {localData.role && (
                    <h2 style={{ fontSize: "1.2rem", color: "#059669", margin: "0.25rem 0 0 0" }}>
                      {renderSafeText(localData.role)}
                    </h2>
                  )}
                </>
              )}

              {/* ===== CONTACT INFO - ALL 5 LINKS ===== */}
              {(editMode || hasAnyContact()) && (
                <div
                  style={{
                    marginTop: "0.8rem",
                    fontSize: "0.95rem",
                    color: "#374151",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1.5rem",
                    width: "100%",
                    maxWidth: "50rem",
                    marginInline: "auto",
                  }}
                >
                  {editMode ? (
                    // EDIT MODE CONTACT INPUTS
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <FaPhoneAlt color="#059669" />
                        <input
                          value={localData.phone || ""}
                          onChange={(e) => handleFieldChange("phone", e.target.value)}
                          placeholder="Phone"
                          style={{ width: "120px", borderBottom: "1px solid #ccc", padding: "0.25rem" }}
                          className="no-print"
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <FaEnvelope color="#2563eb" />
                        <input
                          value={localData.email || ""}
                          onChange={(e) => handleFieldChange("email", e.target.value)}
                          placeholder="Email"
                          style={{ width: "150px", borderBottom: "1px solid #ccc", padding: "0.25rem" }}
                          className="no-print"
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <FaLinkedin color="#2563eb" />
                        <input
                          value={localData.linkedin || ""}
                          onChange={(e) => handleFieldChange("linkedin", e.target.value)}
                          placeholder="LinkedIn"
                          style={{ width: "120px", borderBottom: "1px solid #ccc", padding: "0.25rem" }}
                          className="no-print"
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <FaMapMarkerAlt color="#059669" />
                        <input
                          value={localData.location || ""}
                          onChange={(e) => handleFieldChange("location", e.target.value)}
                          placeholder="Location"
                          style={{ width: "120px", borderBottom: "1px solid #ccc", padding: "0.25rem" }}
                          className="no-print"
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <FaGithub color="#000000" />
                        <input
                          value={localData.github || ""}
                          onChange={(e) => handleFieldChange("github", e.target.value)}
                          placeholder="GitHub"
                          style={{ width: "120px", borderBottom: "1px solid #ccc", padding: "0.25rem" }}
                          className="no-print"
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <FaGlobe color="#2563eb" />
                        <input
                          value={localData.portfolio || ""}
                          onChange={(e) => handleFieldChange("portfolio", e.target.value)}
                          placeholder="Portfolio"
                          style={{ width: "120px", borderBottom: "1px solid #ccc", padding: "0.25rem" }}
                          className="no-print"
                        />
                      </div>
                    </>
                  ) : (
                    // VIEW MODE CONTACT DISPLAY
                    <>
                      {localData.phone && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <FaPhoneAlt color="#059669" />
                          <a href={getSafeUrl("phone", localData.phone)} style={{ color: "inherit", textDecoration: "none" }}>
                            {renderSafeText(localData.phone)}
                          </a>
                        </span>
                      )}
                      {localData.email && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <FaEnvelope color="#2563eb" />
                          <a href={getSafeUrl("email", localData.email)} style={{ color: "inherit", textDecoration: "none" }}>
                            {renderSafeText(localData.email)}
                          </a>
                        </span>
                      )}
                      {localData.linkedin && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <FaLinkedin color="#2563eb" />
                          <a href={getSafeUrl("linkedin", localData.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                            LinkedIn
                          </a>
                        </span>
                      )}
                      {localData.location && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <FaMapMarkerAlt color="#059669" />
                          {renderSafeText(localData.location)}
                        </span>
                      )}
                      {localData.github && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <FaGithub color="#000000" />
                          <a href={getSafeUrl("github", localData.github)} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                            GitHub
                          </a>
                        </span>
                      )}
                      {localData.portfolio && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <FaGlobe color="#2563eb" />
                          <a href={getSafeUrl("portfolio", localData.portfolio)} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                            Portfolio
                          </a>
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ===== DYNAMIC SECTIONS ===== */}
            {/* Render all 9 sections based on sectionOrder from context */}
            {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
              "summary",
              "skills",
              "education",
              "experience",
              "projects",
              "languages",
              "certifications",  // ✅ FIXED: Changed from 'certificates' to 'certifications'
              "achievements",
              "interests"
            ]).map((sectionKey) => sectionComponents[sectionKey] || null)}
          </div>

          {/* ===== FLOATING EDIT/SAVE CONTROLS ===== */}
          <div 
            className="no-print" 
            style={{ 
              position: "fixed", 
              bottom: "40px", 
              left: "50%", 
              transform: "translateX(-50%)",
              zIndex: 1000,
              backgroundColor: "white",
              padding: "1rem 2rem",
              borderRadius: "50px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              display: "flex",
              gap: "1rem",
              border: "1px solid #e5e7eb"
            }}
          >
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    backgroundColor: isSaving ? "#9ca3af" : "#16a34a",
                    color: "#fff",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "0.375rem",
                    border: "none",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  style={{
                    backgroundColor: "#9ca3af",
                    color: "#fff",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "0.375rem",
                    border: "none",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                ✏️ Edit Resume
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template20;