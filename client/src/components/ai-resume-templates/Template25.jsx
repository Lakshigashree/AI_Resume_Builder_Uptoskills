/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import { getSafeUrl } from "../../utils/ResumeConfig";
import {
  MapPin, Phone, Mail, Globe, Linkedin, Github, Plus, Trash2
} from "lucide-react";

// ========== HELPER FUNCTION FOR SAFE TEXT RENDERING ==========
const renderSafeText = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    return val.title || val.name || val.degree || val.description || val.language || 
           val.institution || val.companyName || val.company || val.date || val.duration || "";
  }
  return String(val);
};

// ========== CONTENT VISIBILITY CHECK FUNCTIONS ==========
const hasContent = {
  array: (arr) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return false;
    return arr.some(item => {
      if (typeof item === 'string') return item.trim() !== "";
      if (typeof item === 'object' && item !== null) {
        return Object.values(item).some(val => val && String(val).trim() !== "");
      }
      return false;
    });
  },
  
  summary: (data) => data?.summary && data.summary.trim().length > 0,
  
  contact: (data) => {
    return data?.phone?.trim() ||
      data?.email?.trim() ||
      data?.linkedin?.trim() ||
      data?.github?.trim() ||
      data?.portfolio?.trim() ||
      data?.location?.trim();
  }
};

// --- Reusable Editable Components ---
const EditableField = ({ value, onChange, isEditing, placeholder = "", style = {} }) => {
  const safeValue = renderSafeText(value);
  if (isEditing) {
    return (
      <input
        type="text"
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "0.2rem", margin: "0.1rem 0",
          border: "1px solid #3b82f6", borderRadius: "4px",
          fontFamily: "inherit", fontSize: "inherit",
          backgroundColor: "#f8fafc", ...style
        }}
        className="no-print"
      />
    );
  }
  return <span style={style}>{safeValue}</span>;
};

const EditableTextArea = ({ value, onChange, isEditing, style = {} }) => {
  const safeValue = renderSafeText(value);
  if (isEditing) {
    return (
      <textarea
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(3, safeValue.split('\n').length)}
        style={{
          width: "100%", padding: "0.4rem", margin: "0.5rem 0",
          border: "1px solid #3b82f6", borderRadius: "4px",
          fontFamily: "inherit", fontSize: "0.95rem", lineHeight: "1.5",
          backgroundColor: "#f8fafc", ...style,
        }}
        className="no-print"
      />
    );
  }
  return <p style={{ lineHeight: "1.7", color: "#1f2937", margin: 0, whiteSpace: "pre-wrap" }}>{safeValue}</p>;
};

const Template25 = () => {
  const resumeRef = useRef(null);
  const resumeContext = useResume();
  const { isAuthenticated } = useAuth() || {};
  
  const { 
    resumeData, 
    updateResumeData, 
    sectionOrder 
  } = resumeContext || { 
    resumeData: {}, 
    updateResumeData: null, 
    sectionOrder: [] 
  };
  
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const ACCENT_COLOR = "#1f2937";
  const LINK_COLOR = "#2563eb";
  const LIGHT_BACKGROUND = "#f1f5f9";

  // Template structures for new items with ALL fields
  const getEmptyEducation = () => ({
    degree: "",
    institution: "",
    duration: "",
    grade: "",
    description: ""
  });

  const getEmptyExperience = () => ({
    title: "",
    companyName: "",
    company: "",
    location: "",
    date: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    accomplishment: []
  });

  const getEmptyProject = () => ({
    name: "",
    description: "",
    technologies: [],
    link: "",
    date: "",
    accomplishments: []
  });

  const getEmptyCertification = () => ({
    title: "",
    issuer: "",
    date: "",
    link: "",
    description: ""
  });

  const getEmptyAchievement = () => ({
    title: "",
    description: "",
    year: ""
  });

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
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    interests: [],
    templateId: 25
  });

  useEffect(() => {
    if (resumeData && Object.keys(resumeData).length > 0) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
    } else {
      setLocalData(getDefaultData());
    }
  }, [resumeData]);

  const handleFieldChange = (field, value) => {
    if (!localData) return;
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    if (!localData) return;
    setLocalData((prev) => {
      const updated = [...(prev[section] || [])];
      if (key) {
        updated[index] = { ...updated[index], [key]: value };
      } else {
        updated[index] = value;
      }
      return { ...prev, [section]: updated };
    });
  };

  const addItem = (section, template) => {
    if (!localData) return;
    setLocalData(prev => ({ ...prev, [section]: [...(prev[section] || []), template] }));
    toast.info(`Added new ${section.slice(0, -1)}`);
  };

  const removeItem = (section, index) => {
    if (!localData) return;
    setLocalData(prev => {
      const updated = [...prev[section]];
      updated.splice(index, 1);
      toast.warn(`Removed ${section.slice(0, -1)}`);
      return { ...prev, [section]: updated };
    });
  };

  const handleSave = async () => {
    if (!localData) return;
    
    try {
      setIsSaving(true);
      
      // Normalize data before saving
      const normalized = { ...localData };
      
      // Clean empty items from arrays but preserve structure
      normalized.skills = (normalized.skills || []).filter(s => s && typeof s === 'string' && s.trim());
      normalized.languages = (normalized.languages || []).filter(l => l && typeof l === 'string' && l.trim());
      normalized.interests = (normalized.interests || []).filter(i => i && typeof i === 'string' && i.trim());
      
      normalized.achievements = (normalized.achievements || []).filter(
        a => a?.title?.trim() || a?.description?.trim()
      );
      
      normalized.education = (normalized.education || []).filter(
        e => e?.degree?.trim() || e?.institution?.trim() || e?.description?.trim()
      );
      
      normalized.experience = (normalized.experience || []).filter(
        e => e?.title?.trim() || e?.companyName?.trim() || e?.company?.trim() || e?.description?.trim()
      );
      
      normalized.projects = (normalized.projects || []).filter(
        p => p?.name?.trim() || p?.description?.trim()
      );
      
      normalized.certifications = (normalized.certifications || []).filter(
        c => {
          if (typeof c === 'string') return c.trim();
          return c?.title?.trim() || c?.issuer?.trim();
        }
      );

      if (typeof updateResumeData === 'function') {
        await updateResumeData(normalized);
      }
      
      setEditMode(false);
      toast.success("Resume updated successfully!");
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Error saving resume');
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

  const sectionHeaderStyle = {
    borderBottom: `2px solid ${ACCENT_COLOR}`,
    marginBottom: "1rem",
    paddingBottom: "4px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };

  const sectionTitleStyle = {
    fontSize: "1rem",
    fontWeight: "800",
    color: ACCENT_COLOR,
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0
  };

  const linkStyle = {
    color: LINK_COLOR,
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "0.85rem"
  };

  const editBoxStyle = {
    border: "1px dashed #3b82f6",
    padding: "0.5rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    position: "relative"
  };

  // ========== SECTION COMPONENTS ==========

  // Header Section
  const headerSection = (
    <div key="header" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
      <div style={{ marginBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "2.75rem", fontWeight: "900", textTransform: "uppercase", margin: 0 }}>
          <EditableField 
            value={localData.name} 
            onChange={(v) => handleFieldChange("name", v)} 
            isEditing={editMode} 
            placeholder="YOUR NAME"
            style={{ fontSize: "2.75rem", fontWeight: "900", textTransform: "uppercase" }}
          />
        </h1>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ fontSize: "1.25rem", color: LINK_COLOR, fontWeight: "600", margin: 0 }}>
          <EditableField 
            value={localData.role} 
            onChange={(v) => handleFieldChange("role", v)} 
            isEditing={editMode} 
            placeholder="Professional Title"
            style={{ fontSize: "1.25rem", color: LINK_COLOR, fontWeight: "600" }}
          />
        </p>
      </div>

      {/* Contact Links - All 5 functional */}
      <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap", fontSize: "0.9rem" }}>
        {editMode ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
            <EditableField value={localData.phone} onChange={(v) => handleFieldChange("phone", v)} isEditing={editMode} placeholder="Phone" />
            <EditableField value={localData.email} onChange={(v) => handleFieldChange("email", v)} isEditing={editMode} placeholder="Email" />
            <EditableField value={localData.linkedin} onChange={(v) => handleFieldChange("linkedin", v)} isEditing={editMode} placeholder="LinkedIn URL" />
            <EditableField value={localData.github} onChange={(v) => handleFieldChange("github", v)} isEditing={editMode} placeholder="GitHub URL" />
            <EditableField value={localData.portfolio} onChange={(v) => handleFieldChange("portfolio", v)} isEditing={editMode} placeholder="Portfolio URL" />
            <EditableField value={localData.location} onChange={(v) => handleFieldChange("location", v)} isEditing={editMode} placeholder="Location" />
          </div>
        ) : (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            {localData.phone && (
              <a href={getSafeUrl("phone", localData.phone)} style={linkStyle}>
                {renderSafeText(localData.phone)}
              </a>
            )}
            {localData.email && (
              <a href={getSafeUrl("email", localData.email)} style={linkStyle}>
                {renderSafeText(localData.email)}
              </a>
            )}
            {localData.linkedin && (
              <a href={getSafeUrl("linkedin", localData.linkedin)} target="_blank" rel="noreferrer" style={linkStyle}>
                LinkedIn
              </a>
            )}
            {localData.github && (
              <a href={getSafeUrl("github", localData.github)} target="_blank" rel="noreferrer" style={linkStyle}>
                GitHub
              </a>
            )}
            {localData.portfolio && (
              <a href={getSafeUrl("portfolio", localData.portfolio)} target="_blank" rel="noreferrer" style={linkStyle}>
                Portfolio
              </a>
            )}
            {localData.location && (
              <span style={{ color: "#4b5563" }}>{renderSafeText(localData.location)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Profile/Summary Section
  const summarySection = (editMode || hasContent.summary(localData)) && (
    <div key="summary" className="section-block" style={{ marginBottom: "2rem", width: "100%" }}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>Profile</h3>
        {editMode && (
          <button
            onClick={() => handleFieldChange("summary", "")}
            style={{ fontSize: "0.7rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
            className="no-print"
          >
            Clear
          </button>
        )}
      </div>
      <EditableTextArea 
        value={localData.summary} 
        onChange={(v) => handleFieldChange("summary", v)} 
        isEditing={editMode}
        placeholder="Write a compelling professional summary highlighting your experience, skills, and career goals..."
      />
    </div>
  );

  // Experience Section
  const experienceSection = (editMode || hasContent.array(localData.experience)) && (
    <div key="experience" className="section-block" style={{ marginBottom: "2rem", width: "100%" }}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>Experience</h3>
        {editMode && (
          <button 
            className="add-btn no-print"
            onClick={() => addItem("experience", getEmptyExperience())}
            style={{ background: "#10b981", color: "white", border: "none", borderRadius: "4px", padding: "2px 10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}
          >
            + Add
          </button>
        )}
      </div>
      {(localData.experience || []).map((exp, idx) => (
        (editMode || exp?.title?.trim() || exp?.companyName?.trim() || exp?.company?.trim()) ? (
          <div key={idx} style={editMode ? { ...editBoxStyle, marginBottom: "1.5rem" } : { marginBottom: "1.5rem", position: "relative" }}>
            {editMode && (
              <Trash2 
                size={14} 
                style={{ position: 'absolute', right: 5, top: 5, cursor: 'pointer', color: 'red' }} 
                onClick={() => removeItem("experience", idx)}
                className="no-print"
              />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginBottom: "4px" }}>
              <EditableField 
                value={exp?.title} 
                onChange={(v) => handleArrayFieldChange("experience", idx, "title", v)} 
                isEditing={editMode} 
                placeholder="Job Title"
              />
            </div>
            <div style={{ fontSize: "0.85rem", color: "#4b5563", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
              <EditableField 
                value={exp?.companyName || exp?.company} 
                onChange={(v) => handleArrayFieldChange("experience", idx, "companyName", v)} 
                isEditing={editMode} 
                placeholder="Company Name"
              />
              <EditableField 
                value={exp?.date || exp?.duration} 
                onChange={(v) => handleArrayFieldChange("experience", idx, "date", v)} 
                isEditing={editMode} 
                placeholder="Duration"
              />
            </div>
            <EditableTextArea 
              value={exp?.description || (Array.isArray(exp?.accomplishment) ? exp.accomplishment.join("\n") : "")} 
              onChange={(v) => handleArrayFieldChange("experience", idx, "description", v)} 
              isEditing={editMode}
              placeholder="• Describe your responsibilities and achievements&#10;• Use bullet points for better readability"
            />
          </div>
        ) : null
      ))}
    </div>
  );

  // Projects Section
  const projectsSection = (editMode || hasContent.array(localData.projects)) && (
    <div key="projects" className="section-block" style={{ marginBottom: "2rem", width: "100%" }}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>Projects</h3>
        {editMode && (
          <button 
            className="add-btn no-print"
            onClick={() => addItem("projects", getEmptyProject())}
            style={{ background: "#10b981", color: "white", border: "none", borderRadius: "4px", padding: "2px 10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}
          >
            + Add
          </button>
        )}
      </div>
      {(localData.projects || []).map((proj, idx) => (
        (editMode || proj?.name?.trim() || proj?.description?.trim()) ? (
          <div key={idx} style={editMode ? { ...editBoxStyle, marginBottom: "1.5rem" } : { marginBottom: "1.5rem", position: "relative" }}>
            {editMode && (
              <Trash2 
                size={14} 
                style={{ position: 'absolute', right: 5, top: 5, cursor: 'pointer', color: 'red' }} 
                onClick={() => removeItem("projects", idx)}
                className="no-print"
              />
            )}
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              <EditableField 
                value={proj?.name} 
                onChange={(v) => handleArrayFieldChange("projects", idx, "name", v)} 
                isEditing={editMode} 
                placeholder="Project Name"
              />
            </div>
            {proj?.technologies && (
              <div style={{ marginBottom: "4px", fontSize: "0.85rem", color: "#4b5563" }}>
                <EditableField 
                  value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies} 
                  onChange={(v) => handleArrayFieldChange("projects", idx, "technologies", v.split(",").map(t => t.trim()))} 
                  isEditing={editMode} 
                  placeholder="Technologies (comma separated)"
                />
              </div>
            )}
            {proj?.link && (
              <div style={{ marginBottom: "4px" }}>
                <EditableField 
                  value={proj.link} 
                  onChange={(v) => handleArrayFieldChange("projects", idx, "link", v)} 
                  isEditing={editMode} 
                  placeholder="Project URL"
                />
              </div>
            )}
            <EditableTextArea 
              value={proj?.description} 
              onChange={(v) => handleArrayFieldChange("projects", idx, "description", v)} 
              isEditing={editMode}
              placeholder="Describe your project, its purpose, and your contributions..."
            />
          </div>
        ) : null
      ))}
    </div>
  );

  // Interests Section
  const interestsSection = (editMode || hasContent.array(localData.interests)) && (
    <div key="interests" className="section-block" style={{ marginBottom: "2rem", width: "100%" }}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>Interests</h3>
      </div>
      {editMode ? (
        <EditableField 
          value={localData.interests?.join(", ")} 
          onChange={(v) => handleFieldChange("interests", v.split(",").map(i => i.trim()))} 
          isEditing={editMode} 
          placeholder="Interests (comma separated)"
        />
      ) : (
        <p style={{ fontSize: "0.85rem", margin: 0 }}>
          {(localData.interests || []).join(", ")}
        </p>
      )}
    </div>
  );

  // Skills Section
  const skillsSection = (editMode || hasContent.array(localData.skills)) && (
    <div key="skills" className="section-block" style={{ marginBottom: "2rem", width: "100%" }}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>Skills</h3>
        {editMode && (
          <button 
            className="add-btn no-print"
            onClick={() => addItem("skills", "")}
            style={{ background: "#10b981", color: "white", border: "none", borderRadius: "4px", padding: "2px 10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}
          >
            + Add
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {(localData.skills || []).map((s, i) => {
          const skillValue = renderSafeText(s);
          return (editMode || (skillValue && skillValue.trim())) ? (
            <div key={i} style={{ backgroundColor: "#f3f4f6", padding: "4px 10px", borderRadius: "4px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
              <EditableField 
                value={skillValue} 
                onChange={(v) => handleArrayFieldChange("skills", i, null, v)} 
                isEditing={editMode} 
                placeholder="Skill"
                style={{ width: "80px", marginBottom: 0, backgroundColor: "#f3f4f6" }}
              />
              {editMode && (
                <Trash2 
                  size={10} 
                  style={{ cursor: 'pointer', color: 'red' }} 
                  onClick={() => removeItem("skills", i)}
                  className="no-print"
                />
              )}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );

  // Education Section
  const educationSection = (editMode || hasContent.array(localData.education)) && (
    <div key="education" className="section-block" style={{ marginBottom: "2rem", width: "100%" }}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>Education</h3>
        {editMode && (
          <button 
            className="add-btn no-print"
            onClick={() => addItem("education", getEmptyEducation())}
            style={{ background: "#10b981", color: "white", border: "none", borderRadius: "4px", padding: "2px 10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}
          >
            + Add
          </button>
        )}
      </div>
      {(localData.education || []).map((edu, idx) => (
        (editMode || edu?.degree?.trim() || edu?.institution?.trim()) ? (
          <div key={idx} style={editMode ? { ...editBoxStyle, marginBottom: "1rem" } : { marginBottom: "1rem", fontSize: "0.85rem", position: "relative" }}>
            {editMode && (
              <Trash2 
                size={12} 
                style={{ position: 'absolute', right: 5, top: 5, cursor: 'pointer', color: 'red' }} 
                onClick={() => removeItem("education", idx)}
                className="no-print"
              />
            )}
            <div style={{ fontWeight: "bold" }}>
              <EditableField 
                value={edu?.degree} 
                onChange={(v) => handleArrayFieldChange("education", idx, "degree", v)} 
                isEditing={editMode} 
                placeholder="Degree"
              />
            </div>
            <div>
              <EditableField 
                value={edu?.institution} 
                onChange={(v) => handleArrayFieldChange("education", idx, "institution", v)} 
                isEditing={editMode} 
                placeholder="Institution"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              <EditableField 
                value={edu?.duration} 
                onChange={(v) => handleArrayFieldChange("education", idx, "duration", v)} 
                isEditing={editMode} 
                placeholder="Duration"
              />
              <EditableField 
                value={edu?.grade} 
                onChange={(v) => handleArrayFieldChange("education", idx, "grade", v)} 
                isEditing={editMode} 
                placeholder="Grade/GPA"
              />
            </div>
            {edu?.description && (
              <EditableTextArea 
                value={edu?.description} 
                onChange={(v) => handleArrayFieldChange("education", idx, "description", v)} 
                isEditing={editMode}
              />
            )}
          </div>
        ) : null
      ))}
    </div>
  );

  // Certifications Section
  const certificationsSection = (editMode || hasContent.array(localData.certifications)) && (
    <div key="certifications" className="section-block" style={{ marginBottom: "2rem", width: "100%" }}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>Certifications</h3>
        {editMode && (
          <button 
            className="add-btn no-print"
            onClick={() => addItem("certifications", getEmptyCertification())}
            style={{ background: "#10b981", color: "white", border: "none", borderRadius: "4px", padding: "2px 10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}
          >
            + Add
          </button>
        )}
      </div>
      {(localData.certifications || []).map((c, idx) => {
        const isStringCert = typeof c === 'string';
        return (editMode || (isStringCert ? c?.trim() : c?.title?.trim())) ? (
          <div key={idx} style={editMode ? { ...editBoxStyle, marginBottom: "0.5rem" } : { marginBottom: "0.5rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
            {editMode && (
              <Trash2 
                size={12} 
                style={{ position: 'absolute', right: 5, top: 5, cursor: 'pointer', color: 'red' }} 
                onClick={() => removeItem("certifications", idx)}
                className="no-print"
              />
            )}
            <span style={{ marginRight: "8px" }}>•</span>
            {isStringCert ? (
              <EditableField 
                value={c} 
                onChange={(v) => handleArrayFieldChange("certifications", idx, null, v)} 
                isEditing={editMode} 
                placeholder="Certification Name"
              />
            ) : (
              <div style={{ flex: 1 }}>
                <EditableField 
                  value={c?.title} 
                  onChange={(v) => handleArrayFieldChange("certifications", idx, "title", v)} 
                  isEditing={editMode} 
                  placeholder="Certification Name"
                />
                {c?.issuer && (
                  <EditableField 
                    value={c?.issuer} 
                    onChange={(v) => handleArrayFieldChange("certifications", idx, "issuer", v)} 
                    isEditing={editMode} 
                    placeholder="Issuer"
                  />
                )}
              </div>
            )}
          </div>
        ) : null;
      })}
    </div>
  );

  // Languages Section
  const languagesSection = (editMode || hasContent.array(localData.languages)) && (
    <div key="languages" className="section-block" style={{ marginBottom: "2rem", width: "100%" }}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>Languages</h3>
      </div>
      {editMode ? (
        <EditableField 
          value={localData.languages?.join(", ")} 
          onChange={(v) => handleFieldChange("languages", v.split(",").map(l => l.trim()))} 
          isEditing={editMode} 
          placeholder="Languages (comma separated)"
        />
      ) : (
        <p style={{ fontSize: "0.85rem", margin: 0 }}>
          {(localData.languages || []).join(", ")}
        </p>
      )}
    </div>
  );

  // Achievements Section
  const achievementsSection = (editMode || hasContent.array(localData.achievements)) && (
    <div key="achievements" className="section-block" style={{ marginBottom: "2rem", width: "100%" }}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>Awards & Achievements</h3>
        {editMode && (
          <button 
            className="add-btn no-print"
            onClick={() => addItem("achievements", getEmptyAchievement())}
            style={{ background: "#10b981", color: "white", border: "none", borderRadius: "4px", padding: "2px 10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}
          >
            + Add
          </button>
        )}
      </div>
      <ul style={{ paddingLeft: "1rem", fontSize: "0.85rem", margin: 0 }}>
        {(localData.achievements || []).map((a, idx) => (
          <li key={idx} style={{ marginBottom: "8px", position: "relative" }}>
            {editMode && (
              <Trash2 
                size={12} 
                style={{ position: 'absolute', right: 0, top: 0, cursor: 'pointer', color: 'red' }} 
                onClick={() => removeItem("achievements", idx)}
                className="no-print"
              />
            )}
            {editMode ? (
              <div>
                <EditableField 
                  value={a?.title} 
                  onChange={(v) => handleArrayFieldChange("achievements", idx, "title", v)} 
                  isEditing={editMode} 
                  placeholder="Award Title"
                />
                <EditableField 
                  value={a?.description} 
                  onChange={(v) => handleArrayFieldChange("achievements", idx, "description", v)} 
                  isEditing={editMode} 
                  placeholder="Description"
                />
                <EditableField 
                  value={a?.year} 
                  onChange={(v) => handleArrayFieldChange("achievements", idx, "year", v)} 
                  isEditing={editMode} 
                  placeholder="Year"
                />
              </div>
            ) : (
              <>
                <strong>{a?.title}</strong>
                {a?.description && ` — ${a.description}`}
                {a?.year && ` (${a.year})`}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: LIGHT_BACKGROUND }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resumeRef={resumeRef} />
        <div style={{ flexGrow: 1, padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#ffffff",
              color: ACCENT_COLOR,
              width: "210mm",
              minHeight: "297mm",
              padding: "3rem",
              boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
              boxSizing: "border-box"
            }}
            data-resume-template="template25"
          >
            {/* HEADER */}
            {headerSection}

            {/* TWO COLUMN LAYOUT */}
            <div style={{ display: "flex", gap: "3rem" }}>
              {/* LEFT COLUMN */}
              <div style={{ flex: "1" }}>
                {/* DYNAMIC LEFT COLUMN SECTIONS */}
                {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                  "summary", "experience", "projects", "interests"
                ]).map((sectionKey) => {
                  switch(sectionKey) {
                    case "summary": return summarySection;
                    case "experience": return experienceSection;
                    case "projects": return projectsSection;
                    case "interests": return interestsSection;
                    default: return null;
                  }
                })}
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ flex: "1" }}>
                {/* DYNAMIC RIGHT COLUMN SECTIONS */}
                {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                  "skills", "education", "certifications", "languages", "achievements"
                ]).map((sectionKey) => {
                  switch(sectionKey) {
                    case "skills": return skillsSection;
                    case "education": return educationSection;
                    case "certifications": return certificationsSection;
                    case "languages": return languagesSection;
                    case "achievements": return achievementsSection;
                    default: return null;
                  }
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
                    background: isSaving ? "#9ca3af" : "#10b981",
                    color: "white",
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
                    background: "#ef4444",
                    color: "white",
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
                  background: ACCENT_COLOR,
                  color: "white",
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

export default Template25;