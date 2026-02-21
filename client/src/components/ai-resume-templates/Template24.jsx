/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import {
  MapPin, Phone, Mail, Globe, Briefcase, GraduationCap,
  Award, Trophy, Linkedin, Github, Heart, Languages, Star, Plus, Trash2
} from "lucide-react";
import { getSafeUrl } from "../../utils/ResumeConfig";

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
          border: "1px solid #707070", borderRadius: "4px",
          fontFamily: "inherit", fontSize: "inherit",
          backgroundColor: "#f0f7ff", ...style
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
          border: "1px solid #707070", borderRadius: "4px",
          fontFamily: "inherit", fontSize: "0.95rem", lineHeight: "1.5",
          backgroundColor: "#f0f7ff", ...style,
        }}
        className="no-print"
      />
    );
  }
  return <p style={{ lineHeight: "1.7", color: style.color || "#343a40", margin: 0, whiteSpace: "pre-wrap" }}>{safeValue}</p>;
};

const Template24 = () => {
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

  const ACCENT_COLOR = "#707070";
  const PRIMARY_TEXT_COLOR = "#343a40";
  const LIGHT_BACKGROUND = "#f4f7f6";
  const SECTION_HEADER_BG = "#f5f5f5";
  const FONT_HEADER = "Georgia, serif";
  const FONT_BODY = "Arial, sans-serif";

  // Default data structure with ALL 9 sections and COMPLETE field structures
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
    templateId: 24
  });

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
      normalized.achievements = (normalized.achievements || []).filter(a => a && typeof a === 'string' && a.trim());
      
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

  const leftTitleStyle = {
    backgroundColor: SECTION_HEADER_BG, padding: "0.75rem 0.5rem", margin: "1.5rem 0 0.5rem 0",
    textTransform: "uppercase", fontWeight: "bold", fontSize: "1rem", letterSpacing: "1px",
    color: PRIMARY_TEXT_COLOR, textAlign: "left", borderBottom: `2px solid ${ACCENT_COLOR}`,
    borderTop: `2px solid ${ACCENT_COLOR}`, display: "flex", justifyContent: "space-between", alignItems: "center"
  };

  const mainTitleStyle = {
    backgroundColor: SECTION_HEADER_BG, padding: "0.4rem 0.8rem", marginBottom: "1rem", marginTop: "1.5rem",
    textTransform: "uppercase", fontWeight: "bold", fontSize: "0.9rem", letterSpacing: "0.5px",
    color: PRIMARY_TEXT_COLOR, borderBottom: `1px solid ${ACCENT_COLOR}`, display: "flex",
    justifyContent: "space-between", alignItems: "center"
  };

  const editBoxStyle = {
    border: "1px dashed #3b82f6",
    padding: "0.5rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    position: "relative"
  };

  // ========== SECTION COMPONENTS WITH COMPLETE INFO ==========

  // Header Section
  const headerSection = (
    <div key="header" style={{ marginBottom: "1.5rem", textAlign: "center", borderBottom: `1px solid ${ACCENT_COLOR}`, paddingBottom: "1.5rem" }}>
      <h1 style={{ fontSize: "3rem", margin: 0, fontWeight: "900", letterSpacing: "3px", fontFamily: FONT_HEADER }}>
        <EditableField value={localData.name} onChange={(v) => handleFieldChange("name", v)} isEditing={editMode} placeholder="FULL NAME" />
      </h1>
      <h2 style={{ fontSize: "1.2rem", marginTop: "0.5rem", color: ACCENT_COLOR, fontWeight: "600", textTransform: "uppercase", letterSpacing: "2px" }}>
        <EditableField value={localData.role} onChange={(v) => handleFieldChange("role", v)} isEditing={editMode} placeholder="PROFESSIONAL TITLE" />
      </h2>
    </div>
  );

  // Contact Section - COMPLETE with all 5 functional links
  const contactSection = (editMode || hasContent.contact(localData)) && (
    <div key="contact">
      <div style={{ ...leftTitleStyle, marginTop: 0, borderTop: "none" }}>CONTACT</div>
      <div style={{ padding: "0 0.5rem", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Phone size={14} color={ACCENT_COLOR} />
          {editMode ? (
            <EditableField value={localData.phone} onChange={(v) => handleFieldChange("phone", v)} isEditing={editMode} placeholder="Phone Number" />
          ) : (
            localData.phone && <a href={getSafeUrl("phone", localData.phone)} style={{ color: "inherit", textDecoration: "none" }}>{renderSafeText(localData.phone)}</a>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Mail size={14} color={ACCENT_COLOR} />
          {editMode ? (
            <EditableField value={localData.email} onChange={(v) => handleFieldChange("email", v)} isEditing={editMode} placeholder="Email Address" />
          ) : (
            localData.email && <a href={getSafeUrl("email", localData.email)} style={{ color: "inherit", textDecoration: "none" }}>{renderSafeText(localData.email)}</a>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Linkedin size={14} color={ACCENT_COLOR} />
          {editMode ? (
            <EditableField value={localData.linkedin} onChange={(v) => handleFieldChange("linkedin", v)} isEditing={editMode} placeholder="LinkedIn Username or URL" />
          ) : (
            localData.linkedin && <a href={getSafeUrl("linkedin", localData.linkedin)} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>LinkedIn</a>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Github size={14} color={ACCENT_COLOR} />
          {editMode ? (
            <EditableField value={localData.github} onChange={(v) => handleFieldChange("github", v)} isEditing={editMode} placeholder="GitHub Username or URL" />
          ) : (
            localData.github && <a href={getSafeUrl("github", localData.github)} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>GitHub</a>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Globe size={14} color={ACCENT_COLOR} />
          {editMode ? (
            <EditableField value={localData.portfolio} onChange={(v) => handleFieldChange("portfolio", v)} isEditing={editMode} placeholder="Portfolio URL" />
          ) : (
            localData.portfolio && <a href={getSafeUrl("portfolio", localData.portfolio)} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Portfolio</a>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MapPin size={14} color={ACCENT_COLOR} />
          <EditableField value={localData.location} onChange={(v) => handleFieldChange("location", v)} isEditing={editMode} placeholder="City, Country" />
        </div>
      </div>
    </div>
  );

  // Education Section - COMPLETE with all fields
  const educationSection = (editMode || hasContent.array(localData.education)) && (
    <div key="education">
      <div style={leftTitleStyle}>
        EDUCATION
        {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('education', getEmptyEducation())} className="no-print" />}
      </div>
      {(localData.education || []).map((edu, idx) => (
        (editMode || edu?.degree?.trim() || edu?.institution?.trim()) ? (
          <div key={idx} style={editMode ? editBoxStyle : { marginBottom: "1.5rem", padding: "0 0.5rem", fontSize: "0.9rem", position: 'relative' }}>
            {editMode && (
              <Trash2 
                size={12} 
                style={{ position: 'absolute', right: 5, top: 5, cursor: 'pointer', color: 'red' }} 
                onClick={() => removeItem('education', idx)}
                className="no-print"
              />
            )}
            <div style={{ fontWeight: "bold", fontSize: "1rem" }}>
              <EditableField value={edu?.degree} onChange={(v) => handleArrayFieldChange("education", idx, "degree", v)} isEditing={editMode} placeholder="Degree (e.g., B.Sc. Computer Science)" />
            </div>
            <div style={{ color: ACCENT_COLOR, fontWeight: "500", marginTop: "2px" }}>
              <EditableField value={edu?.institution} onChange={(v) => handleArrayFieldChange("education", idx, "institution", v)} isEditing={editMode} placeholder="Institution Name" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.85rem" }}>
              <span style={{ fontStyle: "italic" }}>
                <EditableField value={edu?.duration} onChange={(v) => handleArrayFieldChange("education", idx, "duration", v)} isEditing={editMode} placeholder="Duration (e.g., 2018-2022)" />
              </span>
              <span>
                <EditableField value={edu?.grade} onChange={(v) => handleArrayFieldChange("education", idx, "grade", v)} isEditing={editMode} placeholder="Grade/GPA" />
              </span>
            </div>
            <div style={{ marginTop: "8px" }}>
              <EditableTextArea 
                value={edu?.description} 
                onChange={(v) => handleArrayFieldChange("education", idx, "description", v)} 
                isEditing={editMode}
                style={{ fontSize: "0.85rem" }}
              />
            </div>
          </div>
        ) : null
      ))}
    </div>
  );

  // Skills Section
  const skillsSection = (editMode || hasContent.array(localData.skills)) && (
    <div key="skills">
      <div style={leftTitleStyle}>
        SKILLS
        {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('skills', '')} className="no-print" />}
      </div>
      <div style={{ padding: "0 0.5rem", display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {(localData.skills || []).map((s, i) => {
          const skillValue = renderSafeText(s);
          return (editMode || (skillValue && skillValue.trim())) ? (
            <div key={i} style={{ display: 'flex', alignItems: 'center', backgroundColor: "#f0f0f0", padding: "4px 10px", borderRadius: "20px", gap: '6px' }}>
              <EditableField value={skillValue} onChange={(v) => handleArrayFieldChange("skills", i, null, v)} isEditing={editMode} placeholder="Skill" />
              {editMode && (
                <Trash2 
                  size={12} 
                  style={{ cursor: 'pointer', color: 'red' }} 
                  onClick={() => removeItem('skills', i)}
                  className="no-print"
                />
              )}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );

  // Languages Section
  const languagesSection = (editMode || hasContent.array(localData.languages)) && (
    <div key="languages">
      <div style={leftTitleStyle}>
        LANGUAGES
        {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('languages', '')} className="no-print" />}
      </div>
      <div style={{ padding: "0 0.5rem", display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {(localData.languages || []).map((l, i) => {
          const langValue = renderSafeText(l);
          return (editMode || (langValue && langValue.trim())) ? (
            <div key={i} style={{ display: 'flex', alignItems: 'center', backgroundColor: "#f9f9f9", padding: "4px 10px", borderRadius: "20px", gap: '6px', border: "1px solid #ddd" }}>
              <EditableField value={langValue} onChange={(v) => handleArrayFieldChange("languages", i, null, v)} isEditing={editMode} placeholder="Language" />
              {editMode && (
                <Trash2 
                  size={12} 
                  style={{ cursor: 'pointer', color: 'red' }} 
                  onClick={() => removeItem('languages', i)}
                  className="no-print"
                />
              )}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );

  // Interests Section
  const interestsSection = (editMode || hasContent.array(localData.interests)) && (
    <div key="interests">
      <div style={leftTitleStyle}>
        INTERESTS
        {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('interests', '')} className="no-print" />}
      </div>
      <div style={{ padding: "0 0.5rem", display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {(localData.interests || []).map((int, i) => {
          const interestValue = renderSafeText(int);
          return (editMode || (interestValue && interestValue.trim())) ? (
            <div key={i} style={{ display: 'flex', alignItems: 'center', backgroundColor: "#f9f9f9", padding: "4px 10px", borderRadius: "20px", gap: '6px', border: "1px solid #eee" }}>
              <EditableField value={interestValue} onChange={(v) => handleArrayFieldChange("interests", i, null, v)} isEditing={editMode} placeholder="Interest" />
              {editMode && (
                <Trash2 
                  size={12} 
                  style={{ cursor: 'pointer', color: 'red' }} 
                  onClick={() => removeItem('interests', i)}
                  className="no-print"
                />
              )}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );

  // Summary Section - COMPLETE
  const summarySection = (editMode || hasContent.summary(localData)) && (
    <div key="summary">
      <div style={mainTitleStyle}>
        PROFESSIONAL SUMMARY
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
      <div style={{ padding: "0 0.8rem" }}>
        <EditableTextArea 
          value={localData.summary} 
          onChange={(v) => handleFieldChange("summary", v)} 
          isEditing={editMode}
          placeholder="Write a compelling professional summary highlighting your experience, skills, and career goals..."
        />
      </div>
    </div>
  );

  // Experience Section - COMPLETE with all fields
  const experienceSection = (editMode || hasContent.array(localData.experience)) && (
    <div key="experience">
      <div style={mainTitleStyle}>
        WORK EXPERIENCE
        {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('experience', getEmptyExperience())} className="no-print" />}
      </div>
      {(localData.experience || []).map((exp, idx) => (
        (editMode || exp?.title?.trim() || exp?.companyName?.trim() || exp?.company?.trim()) ? (
          <div key={idx} style={editMode ? { ...editBoxStyle, marginBottom: "1.5rem" } : { marginBottom: "1.5rem", padding: "0 0.8rem", position: 'relative' }}>
            {editMode && (
              <Trash2 
                size={14} 
                style={{ position: 'absolute', right: 5, top: 5, cursor: 'pointer', color: 'red' }} 
                onClick={() => removeItem('experience', idx)}
                className="no-print"
              />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                <EditableField 
                  value={exp?.title} 
                  onChange={(v) => handleArrayFieldChange("experience", idx, "title", v)} 
                  isEditing={editMode} 
                  placeholder="Job Title"
                />
              </span>
              <span style={{ fontSize: "0.9rem", color: ACCENT_COLOR }}>
                <EditableField 
                  value={exp?.date || exp?.startDate} 
                  onChange={(v) => handleArrayFieldChange("experience", idx, "date", v)} 
                  isEditing={editMode} 
                  placeholder="Start Date - End Date"
                />
              </span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", marginBottom: "8px" }}>
              <span style={{ fontStyle: "italic", color: ACCENT_COLOR }}>
                <EditableField 
                  value={exp?.companyName || exp?.company} 
                  onChange={(v) => handleArrayFieldChange("experience", idx, "companyName", v)} 
                  isEditing={editMode} 
                  placeholder="Company Name"
                />
              </span>
              <span style={{ fontSize: "0.85rem" }}>
                <EditableField 
                  value={exp?.location} 
                  onChange={(v) => handleArrayFieldChange("experience", idx, "location", v)} 
                  isEditing={editMode} 
                  placeholder="Location"
                />
              </span>
            </div>

            <EditableTextArea 
              value={exp?.description || (Array.isArray(exp?.accomplishment) ? exp.accomplishment.join("\n") : "")} 
              onChange={(v) => {
                if (exp?.accomplishment) {
                  handleArrayFieldChange("experience", idx, "accomplishment", v.split("\n"));
                } else {
                  handleArrayFieldChange("experience", idx, "description", v);
                }
              }} 
              isEditing={editMode}
              placeholder="• Describe your responsibilities and achievements&#10;• Use bullet points for better readability&#10;• Start each point with an action verb"
            />
          </div>
        ) : null
      ))}
    </div>
  );

  // Projects Section - COMPLETE with all fields
  const projectsSection = (editMode || hasContent.array(localData.projects)) && (
    <div key="projects">
      <div style={mainTitleStyle}>
        PROJECTS
        {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('projects', getEmptyProject())} className="no-print" />}
      </div>
      {(localData.projects || []).map((proj, idx) => (
        (editMode || proj?.name?.trim() || proj?.description?.trim()) ? (
          <div key={idx} style={editMode ? { ...editBoxStyle, marginBottom: "1.5rem" } : { marginBottom: "1.5rem", padding: "0 0.8rem", position: 'relative' }}>
            {editMode && (
              <Trash2 
                size={14} 
                style={{ position: 'absolute', right: 5, top: 5, cursor: 'pointer', color: 'red' }} 
                onClick={() => removeItem('projects', idx)}
                className="no-print"
              />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                <EditableField 
                  value={proj?.name} 
                  onChange={(v) => handleArrayFieldChange("projects", idx, "name", v)} 
                  isEditing={editMode} 
                  placeholder="Project Name"
                />
              </span>
              <span style={{ fontSize: "0.85rem", color: ACCENT_COLOR }}>
                <EditableField 
                  value={proj?.date} 
                  onChange={(v) => handleArrayFieldChange("projects", idx, "date", v)} 
                  isEditing={editMode} 
                  placeholder="Date"
                />
              </span>
            </div>

            {proj?.technologies && (
              <div style={{ marginTop: "4px", marginBottom: "8px" }}>
                <EditableField 
                  value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies} 
                  onChange={(v) => handleArrayFieldChange("projects", idx, "technologies", v.split(",").map(t => t.trim()))} 
                  isEditing={editMode} 
                  placeholder="Technologies used (comma separated)"
                />
              </div>
            )}

            {proj?.link && (
              <div style={{ marginBottom: "8px" }}>
                <EditableField 
                  value={proj.link} 
                  onChange={(v) => handleArrayFieldChange("projects", idx, "link", v)} 
                  isEditing={editMode} 
                  placeholder="Project Link (URL)"
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

  // Achievements Section
  const achievementsSection = (editMode || hasContent.array(localData.achievements)) && (
    <div key="achievements">
      <div style={mainTitleStyle}>
        ACHIEVEMENTS
        {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('achievements', '')} className="no-print" />}
      </div>
      <div style={{ padding: "0 0.8rem" }}>
        {(localData.achievements || []).map((a, i) => {
          const achievementValue = renderSafeText(a);
          return (editMode || (achievementValue && achievementValue.trim())) ? (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
              {editMode && (
                <Trash2 
                  size={14} 
                  style={{ cursor: 'pointer', color: 'red', marginTop: '3px' }} 
                  onClick={() => removeItem('achievements', i)}
                  className="no-print"
                />
              )}
              <span style={{ flex: 1 }}>
                <EditableField 
                  value={achievementValue} 
                  onChange={(v) => handleArrayFieldChange("achievements", i, null, v)} 
                  isEditing={editMode} 
                  placeholder="Describe your achievement"
                />
              </span>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );

  // Certifications Section - COMPLETE with all fields
  const certificationsSection = (editMode || hasContent.array(localData.certifications)) && (
    <div key="certifications">
      <div style={mainTitleStyle}>
        CERTIFICATIONS
        {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('certifications', getEmptyCertification())} className="no-print" />}
      </div>
      <div style={{ padding: "0 0.8rem" }}>
        {(localData.certifications || []).map((c, i) => {
          const isStringCert = typeof c === 'string';
          const certTitle = isStringCert ? c : c?.title || '';
          const certIssuer = isStringCert ? '' : c?.issuer || '';
          const certDate = isStringCert ? '' : c?.date || '';
          const certLink = isStringCert ? '' : c?.link || '';
          
          return (editMode || certTitle?.trim() || certIssuer?.trim()) ? (
            <div key={i} style={editMode ? { ...editBoxStyle, marginBottom: "1rem" } : { marginBottom: "1rem", position: 'relative' }}>
              {editMode && (
                <Trash2 
                  size={14} 
                  style={{ position: 'absolute', right: 5, top: 5, cursor: 'pointer', color: 'red' }} 
                  onClick={() => removeItem('certifications', i)}
                  className="no-print"
                />
              )}
              
              {isStringCert ? (
                // Simple string certification
                <EditableField 
                  value={certTitle} 
                  onChange={(v) => handleArrayFieldChange("certifications", i, null, v)} 
                  isEditing={editMode} 
                  placeholder="Certification Name"
                />
              ) : (
                // Object certification with all fields
                <>
                  <div style={{ fontWeight: "bold" }}>
                    <EditableField 
                      value={c?.title} 
                      onChange={(v) => handleArrayFieldChange("certifications", i, "title", v)} 
                      isEditing={editMode} 
                      placeholder="Certification Name"
                    />
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.9rem" }}>
                    <span style={{ color: ACCENT_COLOR }}>
                      <EditableField 
                        value={c?.issuer} 
                        onChange={(v) => handleArrayFieldChange("certifications", i, "issuer", v)} 
                        isEditing={editMode} 
                        placeholder="Issuing Organization"
                      />
                    </span>
                    <span style={{ fontStyle: "italic" }}>
                      <EditableField 
                        value={c?.date} 
                        onChange={(v) => handleArrayFieldChange("certifications", i, "date", v)} 
                        isEditing={editMode} 
                        placeholder="Date"
                      />
                    </span>
                  </div>
                  
                  {c?.link && (
                    <div style={{ marginTop: "4px" }}>
                      <EditableField 
                        value={c?.link} 
                        onChange={(v) => handleArrayFieldChange("certifications", i, "link", v)} 
                        isEditing={editMode} 
                        placeholder="Credential URL"
                      />
                    </div>
                  )}
                  
                  {c?.description && (
                    <div style={{ marginTop: "4px" }}>
                      <EditableTextArea 
                        value={c?.description} 
                        onChange={(v) => handleArrayFieldChange("certifications", i, "description", v)} 
                        isEditing={editMode}
                        placeholder="Additional details about the certification..."
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null;
        })}
      </div>
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
              backgroundColor: "#ffffff", width: "100%", maxWidth: "210mm", minHeight: "297mm",
              padding: "2.5rem", fontFamily: FONT_BODY, color: PRIMARY_TEXT_COLOR,
              boxSizing: "border-box", boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
            }}
            data-resume-template="template24"
          >
            {/* HEADER */}
            {headerSection}

            <div style={{ display: "flex", gap: "40px" }}>
              {/* LEFT COLUMN */}
              <div style={{ flex: "0 0 35%" }}>
                {/* CONTACT */}
                {contactSection}

                {/* DYNAMIC LEFT COLUMN SECTIONS */}
                {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                  "education", "skills", "languages", "interests"
                ]).map((sectionKey) => {
                  switch(sectionKey) {
                    case "education": return educationSection;
                    case "skills": return skillsSection;
                    case "languages": return languagesSection;
                    case "interests": return interestsSection;
                    default: return null;
                  }
                })}
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ flex: "1" }}>
                {/* DYNAMIC RIGHT COLUMN SECTIONS */}
                {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                  "summary", "experience", "projects", "achievements", "certifications"
                ]).map((sectionKey) => {
                  switch(sectionKey) {
                    case "summary": return summarySection;
                    case "experience": return experienceSection;
                    case "projects": return projectsSection;
                    case "achievements": return achievementsSection;
                    case "certifications": return certificationsSection;
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
                    background: isSaving ? "#9ca3af" : "#16a34a",
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

export default Template24;