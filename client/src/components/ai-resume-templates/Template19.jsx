import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import { getSafeUrl } from "../../utils/ResumeConfig";

// ========== HELPER FUNCTION FOR SAFE TEXT RENDERING ==========
const renderSafeText = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    // Try common property names in order of priority
    return item.title || item.name || item.language || item.degree || JSON.stringify(item);
  }
  return String(item);
};

const Template19 = () => {
  const resumeRef = useRef(null);
  const resumeContext = useResume();
  const { isAuthenticated } = useAuth();
  
  const { resumeData, updateResumeData, sectionOrder } = resumeContext || { sectionOrder: [] };
  
  const [localData, setLocalData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const saveTimerRef = useRef(null);

  // Default data structure
  const getDefaultData = () => ({
    name: "",
    role: "",
    location: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    skills: [],
    projects: [],
    education: [],
    experience: [],
    languagesDetailed: [],
    languages: [],
    certifications: [],
    achievements: [],
    interests: [],
    photoUrl: null
  });

  useEffect(() => {
    if (resumeData && Object.keys(resumeData).length > 0) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
      if (resumeData.photoUrl) {
        setProfileImage(resumeData.photoUrl);
      }
    } else {
      setLocalData(getDefaultData());
    }
  }, [resumeData]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const debouncedLocalSave = (updatedData) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("resumeData", JSON.stringify(updatedData));
      } catch (e) {
        console.warn("Failed to save locally:", e);
      }
    }, 800);
  };

  const handleFieldChange = (field, value) => {
    if (!localData) return;
    setLocalData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "languagesDetailed") {
        updated.languages = (value || []).map((l) => l.language || "").filter(Boolean);
      }
      debouncedLocalSave(updated);
      return updated;
    });
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
      debouncedLocalSave(newData);
      return newData;
    });
  };

  // Handle simple array changes
  const handleSimpleArrayChange = (section, index, value) => {
    if (!localData || !localData[section]) return;
    
    setLocalData(prev => {
      const updated = [...(prev[section] || [])];
      updated[index] = value;
      const newData = { ...prev, [section]: updated };
      debouncedLocalSave(newData);
      return newData;
    });
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
      normalized.education = (normalized.education || []).filter(e => e.degree?.trim() || e.institution?.trim());
      normalized.experience = (normalized.experience || []).filter(e => e.title?.trim() || e.companyName?.trim());
      normalized.projects = (normalized.projects || []).filter(p => p.name?.trim() || p.description?.trim());
      normalized.certifications = (normalized.certifications || []).filter(c => 
        typeof c === 'string' ? c.trim() : c.title?.trim()
      );
      normalized.achievements = (normalized.achievements || []).filter(a => 
        typeof a === 'string' ? a.trim() : a.title?.trim()
      );
      normalized.languagesDetailed = (normalized.languagesDetailed || []).filter(l => l.language?.trim());
      normalized.interests = (normalized.interests || []).filter(i => i && i.trim());

      if (typeof updateResumeData === 'function') {
        await updateResumeData(normalized);
      }
      
      try {
        localStorage.setItem("resumeData", JSON.stringify(normalized));
      } catch (e) { }
      
      setEditMode(false);
      toast.success('✅ Changes Saved Successfully');
    } catch (error) {
      console.error(error);
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

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result);
        handleFieldChange("photoUrl", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add item functions
  const addEducation = () => {
    const updated = [...(localData?.education || [])];
    updated.push({ degree: "", institution: "", duration: "" });
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
    const updated = [...(localData?.experience || [])];
    updated.push({ title: "", companyName: "", date: "", accomplishment: [] });
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
    const updated = [...(localData?.projects || [])];
    updated.push({ name: "", description: "", technologies: [], link: "", githubLink: "" });
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
    const updated = [...(localData?.certifications || [])];
    updated.push({ title: "", issuer: "", date: "" });
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
    const updated = [...(localData?.achievements || [])];
    updated.push({ title: "", description: "", year: "" });
    handleFieldChange("achievements", updated);
    toast.info("Added new achievement");
  };

  const removeAchievement = (index) => {
    const updated = [...(localData?.achievements || [])];
    updated.splice(index, 1);
    handleFieldChange("achievements", updated);
    toast.warn("Removed achievement");
  };

  const addLanguage = () => {
    const updated = [...(localData?.languagesDetailed || [])];
    updated.push({ language: "", proficiency: "Beginner" });
    handleFieldChange("languagesDetailed", updated);
    toast.info("Added new language");
  };

  const removeLanguage = (index) => {
    const updated = [...(localData?.languagesDetailed || [])];
    updated.splice(index, 1);
    handleFieldChange("languagesDetailed", updated);
    toast.warn("Removed language");
  };

  const addInterest = () => {
    const updated = [...(localData?.interests || [])];
    updated.push("");
    handleFieldChange("interests", updated);
    toast.info("Added new interest");
  };

  const removeInterest = (index) => {
    const updated = [...(localData?.interests || [])];
    updated.splice(index, 1);
    handleFieldChange("interests", updated);
    toast.warn("Removed interest");
  };

  const addSkill = () => {
    const updated = [...(localData?.skills || [])];
    updated.push("");
    handleFieldChange("skills", updated);
    toast.info("Added new skill");
  };

  const removeSkill = (index) => {
    const updated = [...(localData?.skills || [])];
    updated.splice(index, 1);
    handleFieldChange("skills", updated);
    toast.warn("Removed skill");
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

  // Check if sections have content
  const hasSummary = () => localData.summary && localData.summary.trim().length > 0;
  const hasSkills = () => localData.skills && localData.skills.some(s => s && s.trim().length > 0);
  const hasEducation = () => localData.education && localData.education.some(e => e.degree?.trim() || e.institution?.trim());
  const hasExperience = () => localData.experience && localData.experience.some(e => e.title?.trim() || e.companyName?.trim());
  const hasProjects = () => localData.projects && localData.projects.some(p => p.name?.trim() || p.description?.trim());
  const hasCertifications = () => localData.certifications && localData.certifications.some(c => 
    typeof c === 'string' ? c.trim() : c.title?.trim()
  );
  const hasAchievements = () => localData.achievements && localData.achievements.some(a => 
    typeof a === 'string' ? a.trim() : a.title?.trim()
  );
  const hasLanguages = () => localData.languagesDetailed && localData.languagesDetailed.some(l => l.language?.trim());
  const hasInterests = () => localData.interests && localData.interests.some(i => i && i.trim().length > 0);
  const hasContact = () => localData.location?.trim() || localData.phone?.trim() || localData.email?.trim() || 
                          localData.linkedin?.trim() || localData.github?.trim() || localData.portfolio?.trim();

  // Safe array helper
  const safe = (arr) => (Array.isArray(arr) ? arr : []);

  // Section components for dynamic rendering
  const sectionComponents = {
    summary: (editMode || hasSummary()) && (
      <div key="summary">
        <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Summary</h3>
        {editMode ? (
          <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem", marginTop: "0.5rem" }} className="no-print">
            <textarea
              value={localData.summary || ""}
              onChange={(e) => handleFieldChange("summary", e.target.value)}
              rows={4}
              placeholder="Write a short professional summary..."
              style={{ width: "100%", borderRadius: "0.375rem", padding: "0.5rem", border: "1px solid #d1d5db" }}
            />
          </div>
        ) : (
          <p style={{ marginTop: "0.5rem" }}>{renderSafeText(localData.summary)}</p>
        )}
        <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
      </div>
    ),

    skills: (editMode || hasSkills()) && (
      <div key="skills">
        <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Skills</h3>
        {editMode ? (
          <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem", marginTop: "0.5rem" }} className="no-print">
            {safe(localData.skills).map((skill, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
                <input
                  value={skill || ""}
                  onChange={(e) => handleSimpleArrayChange("skills", i, e.target.value)}
                  placeholder="Skill"
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                  }}
                />
                <button
                  onClick={() => removeSkill(i)}
                  style={{
                    marginLeft: "0.5rem",
                    color: "red",
                    fontSize: "1rem",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  ✖
                </button>
              </div>
            ))}
            <input
              placeholder="Type a new skill and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  handleFieldChange("skills", [...safe(localData.skills), e.target.value.trim()]);
                  e.target.value = "";
                }
              }}
              style={{
                width: "100%",
                marginTop: "0.75rem",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
            <button onClick={addSkill} style={{ marginTop: "0.5rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>
              + Add Skill
            </button>
          </div>
        ) : (
          <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
            {localData.skills?.map((skill, i) => (
              <li key={i}>{renderSafeText(skill)}</li>
            ))}
          </ul>
        )}
        <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
      </div>
    ),

    education: (editMode || hasEducation()) && (
      <div key="education">
        <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Education</h3>
        {safe(localData.education).map((edu, i) => (
          (editMode || (edu.degree?.trim() || edu.institution?.trim())) ? (
            <div key={i} style={{ marginTop: "0.75rem" }}>
              {editMode ? (
                <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem", position: "relative" }} className="no-print">
                  <button
                    onClick={() => removeEducation(i)}
                    style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                  >
                    ✖
                  </button>
                  <input
                    value={edu.degree || ""}
                    onChange={(e) => handleArrayUpdate("education", i, "degree", e.target.value)}
                    placeholder="Degree"
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <input
                    value={edu.institution || ""}
                    onChange={(e) => handleArrayUpdate("education", i, "institution", e.target.value)}
                    placeholder="Institution"
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <input
                    value={edu.duration || ""}
                    onChange={(e) => handleArrayUpdate("education", i, "duration", e.target.value)}
                    placeholder="Duration"
                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: "600" }}>{renderSafeText(edu.degree)}</p>
                  <p>{renderSafeText(edu.institution)} {edu.duration ? `(${renderSafeText(edu.duration)})` : ''}</p>
                </>
              )}
            </div>
          ) : null
        ))}
        {editMode && (
          <button onClick={addEducation} style={{ marginTop: "0.5rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }} className="no-print">
            + Add Education
          </button>
        )}
        <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
      </div>
    ),

    experience: (editMode || hasExperience()) && (
      <div key="experience">
        <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Experience</h3>
        {safe(localData.experience).map((exp, i) => (
          (editMode || (exp.title?.trim() || exp.companyName?.trim())) ? (
            <div key={i} style={{ marginTop: "0.75rem" }}>
              {editMode ? (
                <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem", position: "relative" }} className="no-print">
                  <button
                    onClick={() => removeExperience(i)}
                    style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                  >
                    ✖
                  </button>
                  <input
                    value={exp.title || ""}
                    onChange={(e) => handleArrayUpdate("experience", i, "title", e.target.value)}
                    placeholder="Job Title"
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <input
                    value={exp.companyName || ""}
                    onChange={(e) => handleArrayUpdate("experience", i, "companyName", e.target.value)}
                    placeholder="Company"
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <input
                    value={exp.date || ""}
                    onChange={(e) => handleArrayUpdate("experience", i, "date", e.target.value)}
                    placeholder="Date"
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <textarea
                    value={(exp.accomplishment || []).join("\n")}
                    onChange={(e) => {
                      const updated = [...(localData.experience || [])];
                      updated[i].accomplishment = e.target.value.split("\n").filter(Boolean);
                      handleFieldChange("experience", updated);
                    }}
                    rows={3}
                    placeholder="Accomplishments (one per line)"
                    style={{ width: "100%", marginTop: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: "600" }}>{renderSafeText(exp.title)} at {renderSafeText(exp.companyName)}</p>
                  <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>{renderSafeText(exp.date)}</p>
                  <ul style={{ paddingLeft: "1.5rem", listStyle: "disc" }}>
                    {safe(exp.accomplishment).map((item, j) => (
                      <li key={j}>{renderSafeText(item)}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : null
        ))}
        {editMode && (
          <button onClick={addExperience} style={{ marginTop: "0.5rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }} className="no-print">
            + Add Experience
          </button>
        )}
        <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
      </div>
    ),

    projects: (editMode || hasProjects()) && (
      <div key="projects">
        <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Projects</h3>
        {safe(localData.projects).map((proj, i) => (
          (editMode || (proj.name?.trim() || proj.description?.trim())) ? (
            <div key={i} style={{ marginTop: "0.75rem" }}>
              {editMode ? (
                <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem", position: "relative" }} className="no-print">
                  <button
                    onClick={() => removeProject(i)}
                    style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                  >
                    ✖
                  </button>
                  <input
                    value={proj.name || ""}
                    onChange={(e) => handleArrayUpdate("projects", i, "name", e.target.value)}
                    placeholder="Project Title"
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <textarea
                    value={proj.description || ""}
                    onChange={(e) => handleArrayUpdate("projects", i, "description", e.target.value)}
                    placeholder="Project Description"
                    rows={3}
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <input
                    value={(proj.technologies || []).join(", ")}
                    onChange={(e) => handleArrayUpdate("projects", i, "technologies", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                    placeholder="Technologies (comma separated)"
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <input
                    value={proj.link || ""}
                    onChange={(e) => handleArrayUpdate("projects", i, "link", e.target.value)}
                    placeholder="Live Demo Link"
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  <input
                    value={proj.githubLink || ""}
                    onChange={(e) => handleArrayUpdate("projects", i, "githubLink", e.target.value)}
                    placeholder="GitHub Link"
                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: "600" }}>{renderSafeText(proj.name)}</p>
                  <p style={{ fontSize: "0.9rem" }}>{renderSafeText(proj.description)}</p>
                  {proj.technologies?.length > 0 && (
                    <p style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                      <strong>Tech:</strong> {proj.technologies.map(t => renderSafeText(t)).join(", ")}
                    </p>
                  )}
                  {proj.link && (
                    <p>
                      <a href={getSafeUrl("portfolio", proj.link)} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                        Live Demo
                      </a>
                    </p>
                  )}
                  {proj.githubLink && (
                    <p>
                      <a href={getSafeUrl("github", proj.githubLink)} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                        GitHub
                      </a>
                    </p>
                  )}
                </>
              )}
            </div>
          ) : null
        ))}
        {editMode && (
          <button onClick={addProject} style={{ marginTop: "0.5rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }} className="no-print">
            + Add Project
          </button>
        )}
        <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
      </div>
    ),

    certifications: (editMode || hasCertifications()) && (
      <div key="certifications">
        <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Certifications</h3>
        {safe(localData.certifications).map((cert, i) => {
          const hasContent = typeof cert === 'string' ? cert.trim() : cert.title?.trim();
          return (editMode || hasContent) ? (
            <div key={i} style={{ marginTop: "0.75rem" }}>
              {editMode ? (
                <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem", position: "relative" }} className="no-print">
                  <button
                    onClick={() => removeCertification(i)}
                    style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                  >
                    ✖
                  </button>
                  <input
                    value={typeof cert === 'object' ? cert.title || "" : cert || ""}
                    onChange={(e) => {
                      const updated = [...safe(localData.certifications)];
                      if (typeof cert === "object") {
                        updated[i] = { ...cert, title: e.target.value };
                      } else {
                        updated[i] = e.target.value;
                      }
                      handleFieldChange("certifications", updated);
                    }}
                    placeholder="Certification Title"
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  {typeof cert === "object" && (
                    <>
                      <input
                        value={cert.issuer || ""}
                        onChange={(e) => handleArrayUpdate("certifications", i, "issuer", e.target.value)}
                        placeholder="Issuer"
                        style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                      />
                      <input
                        value={cert.date || ""}
                        onChange={(e) => handleArrayUpdate("certifications", i, "date", e.target.value)}
                        placeholder="Year"
                        style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: "600" }}>{typeof cert === "object" ? renderSafeText(cert.title) : renderSafeText(cert)}</p>
                  {typeof cert === "object" && cert.issuer && (
                    <p style={{ fontSize: "0.9rem", color: "#4b5563" }}>
                      {renderSafeText(cert.issuer)} {cert.date && `(${renderSafeText(cert.date)})`}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : null;
        })}
        {editMode && (
          <button onClick={addCertification} style={{ marginTop: "0.5rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }} className="no-print">
            + Add Certification
          </button>
        )}
        <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
      </div>
    ),

    achievements: (editMode || hasAchievements()) && (
      <div key="achievements">
        <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Achievements</h3>
        {safe(localData.achievements).map((ach, i) => {
          const hasContent = typeof ach === 'string' ? ach.trim() : ach.title?.trim();
          return (editMode || hasContent) ? (
            <div key={i} style={{ marginTop: "0.75rem" }}>
              {editMode ? (
                <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem", position: "relative" }} className="no-print">
                  <button
                    onClick={() => removeAchievement(i)}
                    style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                  >
                    ✖
                  </button>
                  <input
                    value={typeof ach === 'object' ? ach.title || "" : ach || ""}
                    onChange={(e) => {
                      const updated = [...safe(localData.achievements)];
                      if (typeof ach === "object") {
                        updated[i] = { ...ach, title: e.target.value };
                      } else {
                        updated[i] = e.target.value;
                      }
                      handleFieldChange("achievements", updated);
                    }}
                    placeholder="Achievement Title"
                    style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                  {typeof ach === "object" && (
                    <>
                      <textarea
                        value={ach.description || ""}
                        onChange={(e) => handleArrayUpdate("achievements", i, "description", e.target.value)}
                        placeholder="Description"
                        rows={2}
                        style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                      />
                      <input
                        value={ach.year || ""}
                        onChange={(e) => handleArrayUpdate("achievements", i, "year", e.target.value)}
                        placeholder="Year"
                        style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: "600" }}>{typeof ach === "object" ? renderSafeText(ach.title) : renderSafeText(ach)}</p>
                  {typeof ach === "object" && ach.description && (
                    <p style={{ fontSize: "0.9rem", color: "#4b5563" }}>{renderSafeText(ach.description)}</p>
                  )}
                  {typeof ach === "object" && ach.year && (
                    <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>{renderSafeText(ach.year)}</p>
                  )}
                </div>
              )}
            </div>
          ) : null;
        })}
        {editMode && (
          <button onClick={addAchievement} style={{ marginTop: "0.5rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }} className="no-print">
            + Add Achievement
          </button>
        )}
        <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
      </div>
    ),

    languages: (editMode || hasLanguages()) && (
      <div key="languages">
        <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Languages</h3>
        {safe(localData.languagesDetailed).map((lang, i) => (
          (editMode || lang.language?.trim()) ? (
            <div key={i} style={{ marginTop: "0.5rem" }}>
              {editMode ? (
                <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem", position: "relative" }} className="no-print">
                  <button
                    onClick={() => removeLanguage(i)}
                    style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                  >
                    ✖
                  </button>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      value={lang.language || ""}
                      onChange={(e) => handleArrayUpdate("languagesDetailed", i, "language", e.target.value)}
                      placeholder="Language"
                      style={{ flex: 1, padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                    />
                    <select
                      value={lang.proficiency || "Beginner"}
                      onChange={(e) => handleArrayUpdate("languagesDetailed", i, "proficiency", e.target.value)}
                      style={{ width: "120px", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Native</option>
                    </select>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: "0.95rem" }}>
                  <strong>{renderSafeText(lang.language)}</strong> – {lang.proficiency}
                </p>
              )}
            </div>
          ) : null
        ))}
        {editMode && (
          <button onClick={addLanguage} style={{ marginTop: "0.5rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }} className="no-print">
            + Add Language
          </button>
        )}
        <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
      </div>
    ),

    interests: (editMode || hasInterests()) && (
      <div key="interests">
        <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Interests</h3>
        {editMode ? (
          <div style={{ border: "1px dashed #3b82f6", padding: "1rem", borderRadius: "0.5rem", marginTop: "0.5rem" }} className="no-print">
            {safe(localData.interests).map((interest, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
                <input
                  value={interest || ""}
                  onChange={(e) => handleSimpleArrayChange("interests", i, e.target.value)}
                  placeholder="Interest"
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                  }}
                />
                <button
                  onClick={() => removeInterest(i)}
                  style={{
                    marginLeft: "0.5rem",
                    color: "red",
                    fontSize: "1rem",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  ✖
                </button>
              </div>
            ))}
            <input
              placeholder="Type a new interest and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  handleFieldChange("interests", [...safe(localData.interests), e.target.value.trim()]);
                  e.target.value = "";
                }
              }}
              style={{
                width: "100%",
                marginTop: "0.75rem",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
            <button onClick={addInterest} style={{ marginTop: "0.5rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>
              + Add Interest
            </button>
          </div>
        ) : (
          <p style={{ marginTop: "0.5rem" }}>{(localData.interests || []).map(i => renderSafeText(i)).join(" • ")}</p>
        )}
        <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
      </div>
    )
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        {/* Sidebar already has preview, download, share icons globally */}
        <Sidebar resumeRef={resumeRef} />

        <div style={{ flex: 1, padding: "2rem", display: "flex", justifyContent: "center" }}>

          {/* Resume Box */}
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              width: "100%",
              maxWidth: "850px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              borderRadius: "0.5rem",
              fontFamily: "Segoe UI, sans-serif",
            }}
            data-resume-template="template19"
          >
            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <div style={{ flex: 1 }}>
                  {editMode ? (
                    <>
                      <input
                        value={localData.name || ""}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        placeholder="Full name"
                        style={{ fontSize: "1.75rem", fontWeight: "bold", width: "100%", marginBottom: "0.25rem", border: "1px solid #ccc", padding: "0.25rem" }}
                        className="no-print"
                      />
                      <input
                        value={localData.role || ""}
                        onChange={(e) => handleFieldChange("role", e.target.value)}
                        placeholder="Role / Title"
                        style={{ fontSize: "1rem", color: "#6b7280", width: "100%", border: "1px solid #ccc", padding: "0.25rem" }}
                        className="no-print"
                      />
                    </>
                  ) : (
                    <>
                      <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", margin: 0 }}>{renderSafeText(localData.name) || "Your Name"}</h1>
                      <h2 style={{ fontSize: "1rem", color: "#6b7280", margin: 0 }}>{renderSafeText(localData.role) || "Your Role / Title"}</h2>
                    </>
                  )}
                </div>

                <div style={{ textAlign: "center" }}>
                  <img
                    src={profileImage || localData.photoUrl || "https://via.placeholder.com/120"}
                    alt="Profile"
                    style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb" }}
                  />
                  {editMode && (
                    <div className="no-print" style={{ marginTop: "0.5rem" }}>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: "0.75rem" }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info - All 5 links */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.875rem", color: "#6b7280", alignItems: "center" }}>
                {editMode ? (
                  <>
                    <input
                      value={localData.location || ""}
                      onChange={(e) => handleFieldChange("location", e.target.value)}
                      placeholder="Location"
                      style={{ borderBottom: "1px solid #ccc", width: "150px", fontSize: "0.875rem", padding: "0.25rem" }}
                      className="no-print"
                    />
                    <input
                      value={localData.phone || ""}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      placeholder="Phone"
                      style={{ borderBottom: "1px solid #ccc", width: "150px", fontSize: "0.875rem", padding: "0.25rem" }}
                      className="no-print"
                    />
                    <input
                      value={localData.email || ""}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      placeholder="Email"
                      style={{ borderBottom: "1px solid #ccc", width: "150px", fontSize: "0.875rem", padding: "0.25rem" }}
                      className="no-print"
                    />
                    <input
                      value={localData.linkedin || ""}
                      onChange={(e) => handleFieldChange("linkedin", e.target.value)}
                      placeholder="LinkedIn"
                      style={{ borderBottom: "1px solid #ccc", width: "150px", fontSize: "0.875rem", padding: "0.25rem" }}
                      className="no-print"
                    />
                    <input
                      value={localData.github || ""}
                      onChange={(e) => handleFieldChange("github", e.target.value)}
                      placeholder="GitHub"
                      style={{ borderBottom: "1px solid #ccc", width: "150px", fontSize: "0.875rem", padding: "0.25rem" }}
                      className="no-print"
                    />
                    <input
                      value={localData.portfolio || ""}
                      onChange={(e) => handleFieldChange("portfolio", e.target.value)}
                      placeholder="Portfolio"
                      style={{ borderBottom: "1px solid #ccc", width: "150px", fontSize: "0.875rem", padding: "0.25rem" }}
                      className="no-print"
                    />
                  </>
                ) : (
                  <>
                    {localData.location && <span>📍 {renderSafeText(localData.location)}</span>}
                    {localData.phone && (
                      <span>
                        📞 <a href={getSafeUrl("phone", localData.phone)} style={{ color: "inherit", textDecoration: "none" }}>
                          {renderSafeText(localData.phone)}
                        </a>
                      </span>
                    )}
                    {localData.email && (
                      <span>
                        ✉️ <a href={getSafeUrl("email", localData.email)} style={{ color: "inherit", textDecoration: "none" }}>
                          {renderSafeText(localData.email)}
                        </a>
                      </span>
                    )}
                    {localData.linkedin && (
                      <span>
                        🔗 <a href={getSafeUrl("linkedin", localData.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>
                          LinkedIn
                        </a>
                      </span>
                    )}
                    {localData.github && (
                      <span>
                        🐙 <a href={getSafeUrl("github", localData.github)} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>
                          GitHub
                        </a>
                      </span>
                    )}
                    {localData.portfolio && (
                      <span>
                        🌐 <a href={getSafeUrl("portfolio", localData.portfolio)} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>
                          Portfolio
                        </a>
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <hr style={{ marginBottom: "1rem", borderColor: "#e5e7eb" }} />

            {/* DYNAMIC SECTIONS - Rendered in order */}
            {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
              "summary", "skills", "education", "experience", "projects",
              "certifications", "achievements", "languages", "interests"
            ]).map((sectionKey) => sectionComponents[sectionKey] || null)}
          </div>
        </div>
      </div>

      {/* Floating Edit/Save Controls - Only these buttons are needed */}
      <div className="no-print" style={{ 
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
      }}>
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
  );
};

export default Template19;