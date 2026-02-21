/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import resumeService from "../../services/resumeService";
import { getSafeUrl } from "../../utils/ResumeConfig";
import {
  FaPhoneAlt, FaEnvelope, FaLinkedin, FaMapMarkerAlt,
  FaGithub, FaGlobe, FaAward, FaCertificate, FaProjectDiagram,
  FaGraduationCap, FaBriefcase, FaCode, FaLanguage, FaHeart
} from "react-icons/fa";

// ========== HELPER FUNCTION FOR SAFE TEXT RENDERING ==========
const renderSafeText = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    // Try common property names in order of priority
    return item.title || item.name || item.language || item.degree || 
           item.keyAchievements || item.projectName || JSON.stringify(item);
  }
  return String(item);
};

const Template21 = () => {
  const resumeRef = useRef(null);
  const resumeContext = useResume();
  const { isAuthenticated, getToken } = useAuth?.() || {};
  
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
    github: "",
    portfolio: "",
    location: "",
    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    interests: [],
    templateId: 21
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
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    if (!localData || !localData[section]) return;
    
    setLocalData((prev) => {
      const arr = [...(prev[section] || [])];
      if (!arr[index]) arr[index] = {};
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, [section]: arr };
    });
  };

  const handleSimpleArrayChange = (section, index, value) => {
    if (!localData || !localData[section]) return;
    
    setLocalData((prev) => {
      const arr = [...(prev[section] || [])];
      arr[index] = value;
      return { ...prev, [section]: arr };
    });
  };

  // ========== ADD/REMOVE FUNCTIONS ==========

  const addEducation = () => {
    const current = localData?.education || [];
    const updated = [
      ...current,
      { degree: "", institution: "", duration: "" }
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

  const addExperience = () => {
    const current = localData?.experience || [];
    const updated = [
      ...current,
      { title: "", companyName: "", date: "", description: "" }
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

  const addProject = () => {
    const current = localData?.projects || [];
    const updated = [
      ...current,
      { name: "", description: "", technologies: [], link: "" }
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

  const addCertification = () => {
    const current = localData?.certifications || [];
    const updated = [
      ...current,
      { title: "", issuer: "", date: "" }
    ];
    handleFieldChange("certifications", updated);
    toast.info("Added new certification");
  };

  const removeCertification = (index) => {
    const updated = [...(localData?.certifications || [])];
    updated.splice(index, 1);
    handleFieldChange("certifications", updated);
    toast.warn("Removed certification");
  };

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

  const addLanguage = () => {
    const current = localData?.languages || [];
    // Languages can be either strings or objects with language property
    const updated = [...current, ""];
    handleFieldChange("languages", updated);
    toast.info("Added new language");
  };

  const removeLanguage = (index) => {
    const updated = [...(localData?.languages || [])];
    updated.splice(index, 1);
    handleFieldChange("languages", updated);
    toast.warn("Removed language");
  };

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
      
      normalized.certifications = (normalized.certifications || []).filter(
        c => c.title?.trim()
      );
      
      normalized.achievements = (normalized.achievements || []).filter(
        a => a && a.trim()
      );
      
      // Handle languages - could be strings or objects
      normalized.languages = (normalized.languages || []).filter(l => {
        if (typeof l === 'string') return l && l.trim();
        if (typeof l === 'object') return l.language?.trim();
        return false;
      });
      
      normalized.interests = (normalized.interests || []).filter(
        i => i && i.trim()
      );

      if (typeof updateResumeData === 'function') {
        await updateResumeData(normalized);
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
  // These functions check if a section has any content (for view mode)

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

  const hasCertifications = () => 
    localData.certifications && localData.certifications.some(c => c.title?.trim());

  const hasAchievements = () => 
    localData.achievements && localData.achievements.some(a => a && a.trim().length > 0);

  // ✅ FIXED: Handle both string and object languages
  const hasLanguages = () => {
    if (!localData.languages || !Array.isArray(localData.languages)) return false;
    return localData.languages.some(l => {
      if (typeof l === 'string') return l && l.trim().length > 0;
      if (typeof l === 'object') return l.language?.trim().length > 0;
      return false;
    });
  };

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

  // Helper to get display text from language (string or object)
  const getLanguageText = (lang) => {
    if (typeof lang === 'string') return lang;
    if (typeof lang === 'object') return lang.language || "";
    return "";
  };

  // Styles
  const sectionTitleStyle = { 
    fontWeight: "bold", 
    fontSize: "1.1rem", 
    borderBottom: "2px solid #87CEEB", 
    color: "#000000", 
    marginTop: "1rem", 
    paddingBottom: "0.25rem", 
    textTransform: "uppercase",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };
  
  const sectionCardStyle = { 
    backgroundColor: "#f8f9fa", 
    padding: "0.8rem", 
    borderRadius: "0.5rem", 
    marginTop: "0.5rem", 
    border: "1px solid #e9ecef" 
  };
  
  const inputStyle = { 
    width: "100%", 
    border: "1px solid #87CEEB", 
    borderRadius: "4px", 
    padding: "6px", 
    fontSize: "0.85rem", 
    background: "#E6F3FF", 
    marginBottom: "5px" 
  };

  const editBoxStyle = {
    border: "1px dashed #3b82f6",
    padding: "0.8rem",
    borderRadius: "0.5rem",
    marginBottom: "0.5rem",
    position: "relative"
  };

  // ========== SECTION COMPONENTS ==========
  // Each section includes its title AND content, and only renders if visible

  const sectionComponents = {
    // LEFT COLUMN SECTIONS
    skills: (editMode || hasSkills()) && (
      <div key="skills">
        <h3 style={sectionTitleStyle}>
          Skills
          {editMode && (
            <button
              onClick={addSkill}
              style={{ fontSize: "0.8rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}
              className="no-print"
            >
              + Add
            </button>
          )}
        </h3>
        <div style={sectionCardStyle}>
          {editMode ? (
            <div>
              {safe(localData.skills).map((skill, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                  <input
                    type="text"
                    value={skill || ""}
                    onChange={(e) => handleSimpleArrayChange("skills", i, e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                    placeholder="Skill"
                  />
                  <button
                    onClick={() => removeSkill(i)}
                    style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginLeft: "5px" }}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          ) : (
            safe(localData.skills).map((s, i) => <div key={i}>• {renderSafeText(s)}</div>)
          )}
        </div>
      </div>
    ),

    // ✅ FIXED: Languages section handles both strings and objects
    languages: (editMode || hasLanguages()) && (
      <div key="languages">
        <h3 style={sectionTitleStyle}>
          Languages
          {editMode && (
            <button
              onClick={addLanguage}
              style={{ fontSize: "0.8rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}
              className="no-print"
            >
              + Add
            </button>
          )}
        </h3>
        <div style={sectionCardStyle}>
          {editMode ? (
            <div>
              {safe(localData.languages).map((lang, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                  <input
                    type="text"
                    value={getLanguageText(lang)}
                    onChange={(e) => {
                      const updated = [...(localData.languages || [])];
                      // Preserve object structure if it exists, otherwise just string
                      if (typeof updated[i] === 'object') {
                        updated[i] = { ...updated[i], language: e.target.value };
                      } else {
                        updated[i] = e.target.value;
                      }
                      handleFieldChange("languages", updated);
                    }}
                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                    placeholder="Language"
                  />
                  <button
                    onClick={() => removeLanguage(i)}
                    style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginLeft: "5px" }}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span>
              {safe(localData.languages)
                .map(l => getLanguageText(l))
                .filter(t => t.trim())
                .join(", ")}
            </span>
          )}
        </div>
      </div>
    ),

    achievements: (editMode || hasAchievements()) && (
      <div key="achievements">
        <h3 style={sectionTitleStyle}>
          Achievements
          {editMode && (
            <button
              onClick={addAchievement}
              style={{ fontSize: "0.8rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}
              className="no-print"
            >
              + Add
            </button>
          )}
        </h3>
        <div style={sectionCardStyle}>
          {editMode ? (
            <div>
              {safe(localData.achievements).map((ach, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                  <input
                    type="text"
                    value={ach || ""}
                    onChange={(e) => handleSimpleArrayChange("achievements", i, e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                    placeholder="Achievement"
                  />
                  <button
                    onClick={() => removeAchievement(i)}
                    style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginLeft: "5px" }}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          ) : (
            safe(localData.achievements).map((a, i) => <div key={i}>★ {renderSafeText(a)}</div>)
          )}
        </div>
      </div>
    ),

    interests: (editMode || hasInterests()) && (
      <div key="interests">
        <h3 style={sectionTitleStyle}>
          Interests
          {editMode && (
            <button
              onClick={addInterest}
              style={{ fontSize: "0.8rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}
              className="no-print"
            >
              + Add
            </button>
          )}
        </h3>
        <div style={sectionCardStyle}>
          {editMode ? (
            <div>
              {safe(localData.interests).map((interest, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                  <input
                    type="text"
                    value={interest || ""}
                    onChange={(e) => handleSimpleArrayChange("interests", i, e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                    placeholder="Interest"
                  />
                  <button
                    onClick={() => removeInterest(i)}
                    style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginLeft: "5px" }}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span>{safe(localData.interests).join(", ")}</span>
          )}
        </div>
      </div>
    ),

    // RIGHT COLUMN SECTIONS
    summary: (editMode || hasSummary()) && (
      <div key="summary">
        <h3 style={sectionTitleStyle}>
          Summary
          {editMode && (
            <button
              onClick={() => handleFieldChange("summary", "")}
              style={{ fontSize: "0.8rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
              className="no-print"
            >
              Clear
            </button>
          )}
        </h3>
        <div style={sectionCardStyle}>
          {editMode ? (
            <textarea
              value={localData.summary || ""}
              onChange={(e) => handleFieldChange("summary", e.target.value)}
              style={{ ...inputStyle, minHeight: "80px" }}
              placeholder="Write a professional summary..."
            />
          ) : (
            <p style={{ fontSize: "0.85rem", margin: 0 }}>{renderSafeText(localData.summary)}</p>
          )}
        </div>
      </div>
    ),

    experience: (editMode || hasExperience()) && (
      <div key="experience">
        <h3 style={sectionTitleStyle}>
          Experience
          {editMode && (
            <button
              onClick={addExperience}
              style={{ fontSize: "0.8rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}
              className="no-print"
            >
              + Add
            </button>
          )}
        </h3>
        {(localData.experience || []).map((exp, i) => (
          (editMode || (exp.title?.trim() || exp.companyName?.trim())) ? (
            <div key={i} style={editMode ? editBoxStyle : sectionCardStyle}>
              {editMode && (
                <button
                  onClick={() => removeExperience(i)}
                  style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                  className="no-print"
                >
                  ✖
                </button>
              )}
              {editMode ? (
                <>
                  <input
                    value={exp.title || ""}
                    onChange={(e) => handleArrayFieldChange("experience", i, "title", e.target.value)}
                    style={inputStyle}
                    placeholder="Job Title"
                  />
                  <input
                    value={exp.companyName || ""}
                    onChange={(e) => handleArrayFieldChange("experience", i, "companyName", e.target.value)}
                    style={inputStyle}
                    placeholder="Company"
                  />
                  <input
                    value={exp.date || ""}
                    onChange={(e) => handleArrayFieldChange("experience", i, "date", e.target.value)}
                    style={inputStyle}
                    placeholder="Date (e.g., 2022-2024)"
                  />
                  <textarea
                    value={exp.description || ""}
                    onChange={(e) => handleArrayFieldChange("experience", i, "description", e.target.value)}
                    style={inputStyle}
                    placeholder="Description"
                    rows={2}
                  />
                </>
              ) : (
                <>
                  <div style={{ fontWeight: "bold" }}>{renderSafeText(exp.title)}</div>
                  <div style={{ fontSize: "0.85rem" }}>
                    {renderSafeText(exp.companyName)} {exp.date && `| ${renderSafeText(exp.date)}`}
                  </div>
                  {exp.description && (
                    <p style={{ fontSize: "0.8rem", margin: "4px 0 0 0" }}>{renderSafeText(exp.description)}</p>
                  )}
                </>
              )}
            </div>
          ) : null
        ))}
      </div>
    ),

    education: (editMode || hasEducation()) && (
      <div key="education">
        <h3 style={sectionTitleStyle}>
          Education
          {editMode && (
            <button
              onClick={addEducation}
              style={{ fontSize: "0.8rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}
              className="no-print"
            >
              + Add
            </button>
          )}
        </h3>
        {(localData.education || []).map((edu, i) => (
          (editMode || (edu.degree?.trim() || edu.institution?.trim())) ? (
            <div key={i} style={editMode ? editBoxStyle : sectionCardStyle}>
              {editMode && (
                <button
                  onClick={() => removeEducation(i)}
                  style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                  className="no-print"
                >
                  ✖
                </button>
              )}
              {editMode ? (
                <>
                  <input
                    value={edu.degree || ""}
                    onChange={(e) => handleArrayFieldChange("education", i, "degree", e.target.value)}
                    style={inputStyle}
                    placeholder="Degree"
                  />
                  <input
                    value={edu.institution || ""}
                    onChange={(e) => handleArrayFieldChange("education", i, "institution", e.target.value)}
                    style={inputStyle}
                    placeholder="Institution"
                  />
                  <input
                    value={edu.duration || ""}
                    onChange={(e) => handleArrayFieldChange("education", i, "duration", e.target.value)}
                    style={inputStyle}
                    placeholder="Duration"
                  />
                </>
              ) : (
                <>
                  <div style={{ fontWeight: "bold" }}>{renderSafeText(edu.degree)}</div>
                  <div style={{ fontSize: "0.85rem" }}>
                    {renderSafeText(edu.institution)} {edu.duration && `| ${renderSafeText(edu.duration)}`}
                  </div>
                </>
              )}
            </div>
          ) : null
        ))}
      </div>
    ),

    projects: (editMode || hasProjects()) && (
      <div key="projects">
        <h3 style={sectionTitleStyle}>
          Projects
          {editMode && (
            <button
              onClick={addProject}
              style={{ fontSize: "0.8rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}
              className="no-print"
            >
              + Add
            </button>
          )}
        </h3>
        {(localData.projects || []).map((proj, i) => (
          (editMode || (proj.name?.trim() || proj.description?.trim())) ? (
            <div key={i} style={editMode ? editBoxStyle : sectionCardStyle}>
              {editMode && (
                <button
                  onClick={() => removeProject(i)}
                  style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                  className="no-print"
                >
                  ✖
                </button>
              )}
              {editMode ? (
                <>
                  <input
                    value={proj.name || ""}
                    onChange={(e) => handleArrayFieldChange("projects", i, "name", e.target.value)}
                    style={inputStyle}
                    placeholder="Project Name"
                  />
                  <textarea
                    value={proj.description || ""}
                    onChange={(e) => handleArrayFieldChange("projects", i, "description", e.target.value)}
                    style={inputStyle}
                    placeholder="Description"
                    rows={2}
                  />
                  <input
                    value={(proj.technologies || []).join(", ")}
                    onChange={(e) => handleArrayFieldChange("projects", i, "technologies", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                    style={inputStyle}
                    placeholder="Technologies (comma separated)"
                  />
                  <input
                    value={proj.link || ""}
                    onChange={(e) => handleArrayFieldChange("projects", i, "link", e.target.value)}
                    style={inputStyle}
                    placeholder="Project Link"
                  />
                </>
              ) : (
                <>
                  <div style={{ fontWeight: "bold" }}>{renderSafeText(proj.name)}</div>
                  <p style={{ fontSize: "0.8rem", margin: "4px 0" }}>{renderSafeText(proj.description)}</p>
                  {proj.technologies?.length > 0 && (
                    <p style={{ fontSize: "0.75rem", color: "#666" }}>
                      <strong>Tech:</strong> {safe(proj.technologies).join(", ")}
                    </p>
                  )}
                  {proj.link && (
                    <a href={getSafeUrl("portfolio", proj.link)} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "#2563eb" }}>
                      View Project
                    </a>
                  )}
                </>
              )}
            </div>
          ) : null
        ))}
      </div>
    ),

    certifications: (editMode || hasCertifications()) && (
      <div key="certifications">
        <h3 style={sectionTitleStyle}>
          Certifications
          {editMode && (
            <button
              onClick={addCertification}
              style={{ fontSize: "0.8rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}
              className="no-print"
            >
              + Add
            </button>
          )}
        </h3>
        {(localData.certifications || []).map((cert, i) => (
          (editMode || cert.title?.trim()) ? (
            <div key={i} style={editMode ? editBoxStyle : sectionCardStyle}>
              {editMode && (
                <button
                  onClick={() => removeCertification(i)}
                  style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                  className="no-print"
                >
                  ✖
                </button>
              )}
              {editMode ? (
                <>
                  <input
                    value={cert.title || ""}
                    onChange={(e) => handleArrayFieldChange("certifications", i, "title", e.target.value)}
                    style={inputStyle}
                    placeholder="Certification Title"
                  />
                  <input
                    value={cert.issuer || ""}
                    onChange={(e) => handleArrayFieldChange("certifications", i, "issuer", e.target.value)}
                    style={inputStyle}
                    placeholder="Issuer"
                  />
                  <input
                    value={cert.date || ""}
                    onChange={(e) => handleArrayFieldChange("certifications", i, "date", e.target.value)}
                    style={inputStyle}
                    placeholder="Date"
                  />
                </>
              ) : (
                <div style={{ fontSize: "0.85rem" }}>
                  • {renderSafeText(cert.title)} - {renderSafeText(cert.issuer)} {cert.date && `(${renderSafeText(cert.date)})`}
                </div>
              )}
            </div>
          ) : null
        ))}
      </div>
    )
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resumeRef={resumeRef} />
        <div style={{ flexGrow: 1, padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <div 
            ref={resumeRef} 
            className="resume-page" 
            style={{ 
              maxWidth: "210mm", 
              width: "100%", 
              minHeight: "297mm", 
              padding: "1.5rem", 
              backgroundColor: "#ffffff", 
              boxSizing: "border-box", 
              position: "relative" 
            }}
            data-resume-template="template21"
          >
            
            {/* HEADER - Always visible */}
            <div style={{ backgroundColor: "#E6F3FF", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #87CEEB", textAlign: "center" }}>
              {editMode ? (
                <>
                  <input 
                    type="text" 
                    value={renderSafeText(localData.name)} 
                    onChange={(e) => handleFieldChange("name", e.target.value)} 
                    style={{ ...inputStyle, fontSize: "1.5rem", textAlign: "center" }} 
                    placeholder="Full Name"
                    className="no-print"
                  />
                  <input 
                    type="text" 
                    value={renderSafeText(localData.role)} 
                    onChange={(e) => handleFieldChange("role", e.target.value)} 
                    style={{ ...inputStyle, textAlign: "center" }} 
                    placeholder="Job Title"
                    className="no-print"
                  />
                </>
              ) : (
                <>
                  <h1 style={{ fontSize: "2rem", fontWeight: "bold", textTransform: "uppercase", margin: 0 }}>
                    {renderSafeText(localData.name) || "FULL NAME"}
                  </h1>
                  <h2 style={{ fontSize: "1.1rem", margin: "5px 0" }}>
                    {renderSafeText(localData.role)}
                  </h2>
                </>
              )}

              {/* CONTACT INFO - ALL 5 LINKS */}
              {(editMode || hasAnyContact()) && (
                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1rem", marginTop: "10px", fontSize: "0.85rem" }}>
                  {editMode ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", width: "100%" }} className="no-print">
                      <input type="text" value={localData.phone || ""} onChange={(e) => handleFieldChange("phone", e.target.value)} style={inputStyle} placeholder="Phone" />
                      <input type="text" value={localData.email || ""} onChange={(e) => handleFieldChange("email", e.target.value)} style={inputStyle} placeholder="Email" />
                      <input type="text" value={localData.linkedin || ""} onChange={(e) => handleFieldChange("linkedin", e.target.value)} style={inputStyle} placeholder="LinkedIn" />
                      <input type="text" value={localData.github || ""} onChange={(e) => handleFieldChange("github", e.target.value)} style={inputStyle} placeholder="GitHub" />
                      <input type="text" value={localData.portfolio || ""} onChange={(e) => handleFieldChange("portfolio", e.target.value)} style={inputStyle} placeholder="Portfolio" />
                      <input type="text" value={localData.location || ""} onChange={(e) => handleFieldChange("location", e.target.value)} style={inputStyle} placeholder="Location" />
                    </div>
                  ) : (
                    <>
                      {localData.phone && (
                        <a href={getSafeUrl("phone", localData.phone)} style={{ textDecoration: "none", color: "inherit" }}>
                          <FaPhoneAlt color="#87CEEB" /> {renderSafeText(localData.phone)}
                        </a>
                      )}
                      {localData.email && (
                        <a href={getSafeUrl("email", localData.email)} style={{ textDecoration: "none", color: "inherit" }}>
                          <FaEnvelope color="#87CEEB" /> {renderSafeText(localData.email)}
                        </a>
                      )}
                      {localData.linkedin && (
                        <a href={getSafeUrl("linkedin", localData.linkedin)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                          <FaLinkedin color="#87CEEB" /> LinkedIn
                        </a>
                      )}
                      {localData.github && (
                        <a href={getSafeUrl("github", localData.github)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                          <FaGithub color="#87CEEB" /> GitHub
                        </a>
                      )}
                      {localData.portfolio && (
                        <a href={getSafeUrl("portfolio", localData.portfolio)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                          <FaGlobe color="#87CEEB" /> Portfolio
                        </a>
                      )}
                      {localData.location && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <FaMapMarkerAlt color="#87CEEB" /> {renderSafeText(localData.location)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* TWO-COLUMN LAYOUT */}
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
              {/* LEFT COLUMN */}
              <div style={{ width: "35%" }}>
                {/* Render left column sections in order */}
                {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                  "skills", "languages", "achievements", "interests"
                ]).map((sectionKey) => {
                  if (["skills", "languages", "achievements", "interests"].includes(sectionKey)) {
                    return sectionComponents[sectionKey] || null;
                  }
                  return null;
                })}
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ width: "65%" }}>
                {/* Render right column sections in order */}
                {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                  "summary", "experience", "education", "projects", "certifications"
                ]).map((sectionKey) => {
                  if (["summary", "experience", "education", "projects", "certifications"].includes(sectionKey)) {
                    return sectionComponents[sectionKey] || null;
                  }
                  return null;
                })}
              </div>
            </div>
          </div>

          {/* FLOATING EDIT/SAVE CONTROLS */}
          <div 
            data-html2canvas-ignore="true" 
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

export default Template21;