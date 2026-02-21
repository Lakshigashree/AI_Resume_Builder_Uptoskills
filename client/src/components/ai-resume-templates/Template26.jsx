import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import { getSafeUrl } from "../../utils/ResumeConfig";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaGithub, FaLinkedin } from "react-icons/fa";
import { Plus, Trash2 } from "lucide-react";

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
  return <p style={{ lineHeight: "1.7", color: "#334155", margin: 0, whiteSpace: "pre-wrap" }}>{safeValue}</p>;
};

const Template26 = () => {
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

  const ACCENT_COLOR = "#2a1fecff";
  const LINK_COLOR = "#2563eb";
  const LIGHT_BACKGROUND = "#f5f5f5";
  const HEADER_BG = "#e0e7ff";

  // Template structures for new items with ALL fields
  const getEmptyEducation = () => ({
    year: "",
    school: "",
    degree: "",
    gpa: "",
    description: ""
  });

  const getEmptyExperience = () => ({
    company: "",
    period: "",
    title: "",
    details: [""],
    description: "",
    accomplishments: []
  });

  const getEmptyProject = () => ({
    name: "",
    description: "",
    technologies: [],
    link: "",
    date: ""
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

  // Default data structure with ALL 9 sections - EMPTY
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
    templateId: 26
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
      if (!updated[index]) updated[index] = {};
      if (key) {
        updated[index] = { ...updated[index], [key]: value };
      } else {
        updated[index] = value;
      }
      return { ...prev, [section]: updated };
    });
  };

  const handleNestedArrayChange = (section, itemIndex, field, nestedIndex, value) => {
    if (!localData) return;
    setLocalData((prev) => {
      const updated = [...(prev[section] || [])];
      if (!updated[itemIndex]) updated[itemIndex] = {};
      const currentDetails = updated[itemIndex][field] || [];
      const updatedDetails = [...currentDetails];
      updatedDetails[nestedIndex] = value;
      updated[itemIndex] = { ...updated[itemIndex], [field]: updatedDetails };
      return { ...prev, [section]: updated };
    });
  };

  const addNestedItem = (section, itemIndex, field) => {
    if (!localData) return;
    setLocalData((prev) => {
      const updated = [...(prev[section] || [])];
      if (!updated[itemIndex]) updated[itemIndex] = {};
      const currentDetails = updated[itemIndex][field] || [];
      const updatedDetails = [...currentDetails, ""];
      updated[itemIndex] = { ...updated[itemIndex], [field]: updatedDetails };
      return { ...prev, [section]: updated };
    });
  };

  const removeNestedItem = (section, itemIndex, field, nestedIndex) => {
    if (!localData) return;
    setLocalData((prev) => {
      const updated = [...(prev[section] || [])];
      if (!updated[itemIndex]) return prev;
      const currentDetails = updated[itemIndex][field] || [];
      const updatedDetails = currentDetails.filter((_, i) => i !== nestedIndex);
      updated[itemIndex] = { ...updated[itemIndex], [field]: updatedDetails };
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
      const updated = [...(prev[section] || [])];
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
      
      // Clean empty items from arrays
      normalized.skills = (normalized.skills || []).filter(s => s && typeof s === 'string' && s.trim());
      normalized.languages = (normalized.languages || []).filter(l => l && typeof l === 'string' && l.trim());
      normalized.interests = (normalized.interests || []).filter(i => i && typeof i === 'string' && i.trim());
      
      normalized.achievements = (normalized.achievements || []).filter(
        a => a?.title?.trim() || a?.description?.trim()
      );
      
      normalized.education = (normalized.education || []).filter(
        e => e?.degree?.trim() || e?.school?.trim() || e?.description?.trim()
      );
      
      normalized.experience = (normalized.experience || []).filter(
        e => e?.title?.trim() || e?.company?.trim() || e?.description?.trim()
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

  const sectionTitleStyle = {
    fontWeight: "700",
    fontSize: "1.1rem",
    color: ACCENT_COLOR,
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  };

  const verticalLineStyle = {
    position: "absolute",
    left: "38%",
    top: "0",
    bottom: "0",
    height: "100%",
    width: "2px",
    background: "#e5e7eb",
    transform: "translateX(-50%)",
    zIndex: "1",
  };

  const editBoxStyle = {
    border: "1px dashed #3b82f6",
    padding: "0.5rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    position: "relative"
  };

  const linkStyle = {
    color: LINK_COLOR,
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
    marginLeft: "0.5rem",
    flex: 1
  };

  // ========== SECTION COMPONENTS ==========

  // Header Section
  const headerSection = (
    <div
      style={{
        background: HEADER_BG,
        padding: "32px 0 24px 0",
        textAlign: "center",
        borderRadius: "0"
      }}
    >
      <h1 style={{ margin: 0, fontSize: "2.2rem", letterSpacing: "2px" }}>
        <EditableField 
          value={localData.name} 
          onChange={(v) => handleFieldChange("name", v)} 
          isEditing={editMode} 
          placeholder="YOUR NAME"
          style={{ fontSize: "2.2rem", fontWeight: "bold" }}
        />
      </h1>
      <div style={{ color: "#64748b", fontSize: "1.2rem", marginTop: "8px" }}>
        <EditableField 
          value={localData.role} 
          onChange={(v) => handleFieldChange("role", v)} 
          isEditing={editMode} 
          placeholder="Professional Title"
          style={{ fontSize: "1.2rem" }}
        />
      </div>
    </div>
  );

  // Contact Section - All 5 functional links with proper redirects
  const contactSection = (editMode || hasContent.contact(localData)) && (
    <div>
      <div style={sectionTitleStyle}>CONTACT</div>
      <div style={{ color: "#334155", fontSize: "1rem", marginTop: "8px" }}>
        {editMode ? (
          // EDIT MODE - Input fields
          <div className="no-print">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "12px" }}>
              <FaPhoneAlt color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
              <EditableField 
                value={localData.phone || ""} 
                onChange={(v) => handleFieldChange("phone", v)} 
                isEditing={editMode} 
                placeholder="Phone Number"
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "12px" }}>
              <FaEnvelope color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
              <EditableField 
                value={localData.email || ""} 
                onChange={(v) => handleFieldChange("email", v)} 
                isEditing={editMode} 
                placeholder="Email Address"
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "12px" }}>
              <FaLinkedin color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
              <EditableField 
                value={localData.linkedin || ""} 
                onChange={(v) => handleFieldChange("linkedin", v)} 
                isEditing={editMode} 
                placeholder="LinkedIn Username or URL"
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "12px" }}>
              <FaGithub color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
              <EditableField 
                value={localData.github || ""} 
                onChange={(v) => handleFieldChange("github", v)} 
                isEditing={editMode} 
                placeholder="GitHub Username or URL"
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "12px" }}>
              <FaGlobe color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
              <EditableField 
                value={localData.portfolio || ""} 
                onChange={(v) => handleFieldChange("portfolio", v)} 
                isEditing={editMode} 
                placeholder="Portfolio URL"
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "12px" }}>
              <FaMapMarkerAlt color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
              <EditableField 
                value={localData.location || ""} 
                onChange={(v) => handleFieldChange("location", v)} 
                isEditing={editMode} 
                placeholder="Location"
              />
            </div>
          </div>
        ) : (
          // VIEW MODE - All 5 links functional with getSafeUrl
          <>
            {localData.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "8px" }}>
                <FaPhoneAlt color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
                <a 
                  href={getSafeUrl("phone", localData.phone)} 
                  style={linkStyle}
                >
                  {renderSafeText(localData.phone)}
                </a>
              </div>
            )}
            
            {localData.email && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "8px" }}>
                <FaEnvelope color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
                <a 
                  href={getSafeUrl("email", localData.email)} 
                  style={linkStyle}
                >
                  {renderSafeText(localData.email)}
                </a>
              </div>
            )}
            
            {localData.linkedin && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "8px" }}>
                <FaLinkedin color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
                <a 
                  href={getSafeUrl("linkedin", localData.linkedin)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={linkStyle}
                >
                  LinkedIn
                </a>
              </div>
            )}
            
            {localData.github && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "8px" }}>
                <FaGithub color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
                <a 
                  href={getSafeUrl("github", localData.github)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={linkStyle}
                >
                  GitHub
                </a>
              </div>
            )}
            
            {localData.portfolio && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "8px" }}>
                <FaGlobe color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
                <a 
                  href={getSafeUrl("portfolio", localData.portfolio)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={linkStyle}
                >
                  Portfolio
                </a>
              </div>
            )}
            
            {localData.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "8px" }}>
                <FaMapMarkerAlt color="#87CEEB" size="14" style={{ minWidth: "16px" }} />
                <span style={{ marginLeft: "0.5rem", flex: 1 }}>{renderSafeText(localData.location)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Skills Section
  const skillsSection = (editMode || hasContent.array(localData.skills)) && (
    <div>
      <div style={sectionTitleStyle}>SKILLS</div>
      <div style={{ color: "#334155", fontSize: "1rem", marginTop: "8px" }}>
        {editMode ? (
          <div className="no-print">
            {(localData.skills || []).map((skill, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <EditableField 
                  value={skill || ""} 
                  onChange={(v) => handleArrayFieldChange("skills", idx, null, v)} 
                  isEditing={editMode} 
                  placeholder="Skill"
                />
                {(localData.skills?.length > 1 || idx > 0) && (
                  <Trash2 
                    size={14} 
                    style={{ cursor: 'pointer', color: 'red' }} 
                    onClick={() => removeItem("skills", idx)}
                    className="no-print"
                  />
                )}
              </div>
            ))}
            <button
              onClick={() => addItem("skills", "")}
              style={{
                marginTop: "8px",
                padding: "0.3rem 1rem",
                background: "#e0e7ff",
                color: ACCENT_COLOR,
                border: "1px solid",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
              className="no-print"
            >
              + Add Skill
            </button>
          </div>
        ) : (
          <ul style={{
            color: "#334155",
            fontSize: "1rem",
            marginTop: "8px",
            paddingLeft: "20px",
            listStyleType: "disc"
          }}>
            {(localData.skills || []).map((skill, idx) => (
              <li key={idx} style={{ marginBottom: "4px" }}>{renderSafeText(skill)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // Education Section
  const educationSection = (editMode || hasContent.array(localData.education)) && (
    <div>
      <div style={sectionTitleStyle}>EDUCATION</div>
      <div style={{ color: "#334155", fontSize: "1rem", marginTop: "8px" }}>
        {(localData.education || []).map((edu, idx) => (
          (editMode || edu?.degree?.trim() || edu?.school?.trim()) ? (
            <div key={idx} style={editMode ? { ...editBoxStyle, marginBottom: "1rem" } : { marginBottom: "1rem" }}>
              {editMode ? (
                <>
                  <EditableField 
                    value={edu?.year || ""} 
                    onChange={(v) => handleArrayFieldChange("education", idx, "year", v)} 
                    isEditing={editMode} 
                    placeholder="Year"
                  />
                  <EditableField 
                    value={edu?.school || ""} 
                    onChange={(v) => handleArrayFieldChange("education", idx, "school", v)} 
                    isEditing={editMode} 
                    placeholder="School/Institution"
                  />
                  <EditableField 
                    value={edu?.degree || ""} 
                    onChange={(v) => handleArrayFieldChange("education", idx, "degree", v)} 
                    isEditing={editMode} 
                    placeholder="Degree"
                  />
                  {(localData.education?.length > 1 || idx > 0) && (
                    <Trash2 
                      size={14} 
                      style={{ cursor: 'pointer', color: 'red', marginTop: "8px" }} 
                      onClick={() => removeItem("education", idx)}
                      className="no-print"
                    />
                  )}
                </>
              ) : (
                <>
                  <div><strong>{edu?.degree}</strong></div>
                  <div>{edu?.school}</div>
                  {edu?.year && <div style={{ fontSize: "0.9rem", color: "#64748b" }}>{edu.year}</div>}
                  {edu?.description && <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>{edu.description}</div>}
                </>
              )}
            </div>
          ) : null
        ))}
        {editMode && (
          <button
            onClick={() => addItem("education", getEmptyEducation())}
            style={{
              marginTop: "8px",
              padding: "0.3rem 1rem",
              background: "#e0e7ff",
              color: ACCENT_COLOR,
              border: "1px solid",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
            className="no-print"
          >
            + Add Education
          </button>
        )}
      </div>
    </div>
  );

  // Profile Summary Section
  const summarySection = (editMode || hasContent.summary(localData)) && (
    <div>
      <div style={sectionTitleStyle}>PROFILE SUMMARY</div>
      <div style={{ color: "#334155", fontSize: "1rem", marginTop: "8px" }}>
        {editMode ? (
          <>
            <EditableTextArea 
              value={localData.summary || ""} 
              onChange={(v) => handleFieldChange("summary", v)} 
              isEditing={editMode}
              placeholder="Write your professional summary..."
            />
            {localData.summary && (
              <button
                onClick={() => handleFieldChange("summary", "")}
                style={{ fontSize: "0.7rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", marginTop: "4px" }}
                className="no-print"
              >
                Clear
              </button>
            )}
          </>
        ) : (
          <p style={{ lineHeight: "1.6" }}>{renderSafeText(localData.summary)}</p>
        )}
      </div>
    </div>
  );

  // Work Experience Section
  const experienceSection = (editMode || hasContent.array(localData.experience)) && (
    <div>
      <div style={sectionTitleStyle}>WORK EXPERIENCE</div>
      <div style={{ color: "#334155", fontSize: "1rem", marginTop: "8px" }}>
        {(localData.experience || []).map((exp, idx) => (
          (editMode || exp?.title?.trim() || exp?.company?.trim()) ? (
            <div key={idx} style={editMode ? { ...editBoxStyle, marginBottom: "1.5rem" } : { marginBottom: "1.5rem" }}>
              {editMode ? (
                <>
                  <EditableField 
                    value={exp?.company || ""} 
                    onChange={(v) => handleArrayFieldChange("experience", idx, "company", v)} 
                    isEditing={editMode} 
                    placeholder="Company"
                  />
                  <EditableField 
                    value={exp?.title || ""} 
                    onChange={(v) => handleArrayFieldChange("experience", idx, "title", v)} 
                    isEditing={editMode} 
                    placeholder="Job Title"
                  />
                  <EditableField 
                    value={exp?.period || ""} 
                    onChange={(v) => handleArrayFieldChange("experience", idx, "period", v)} 
                    isEditing={editMode} 
                    placeholder="Period"
                  />
                  {(localData.experience?.length > 1 || idx > 0) && (
                    <Trash2 
                      size={14} 
                      style={{ cursor: 'pointer', color: 'red', marginTop: "8px" }} 
                      onClick={() => removeItem("experience", idx)}
                      className="no-print"
                    />
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{exp?.company}</strong>
                    <span style={{ color: "#64748b" }}>{exp?.period}</span>
                  </div>
                  <div style={{ fontStyle: "italic", marginBottom: "4px" }}>{exp?.title}</div>
                  {exp?.details && exp.details.length > 0 && exp.details[0] !== "" && (
                    <ul style={{
                      marginTop: "4px",
                      paddingLeft: "20px",
                      listStyleType: "disc"
                    }}>
                      {exp.details.filter(d => d && d.trim()).map((d, i) => (
                        <li key={i} style={{ marginBottom: "2px" }}>{d}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          ) : null
        ))}
        {editMode && (
          <button
            onClick={() => addItem("experience", getEmptyExperience())}
            style={{
              marginTop: "8px",
              padding: "0.3rem 1rem",
              background: "#e0e7ff",
              color: ACCENT_COLOR,
              border: "1px solid",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
            className="no-print"
          >
            + Add Experience
          </button>
        )}
      </div>
    </div>
  );

  // Languages Section
  const languagesSection = (editMode || hasContent.array(localData.languages)) && (
    <div>
      <div style={sectionTitleStyle}>LANGUAGES</div>
      <div style={{ color: "#334155", fontSize: "1rem", marginTop: "8px" }}>
        {editMode ? (
          <div className="no-print">
            {(localData.languages || []).map((lang, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <EditableField 
                  value={lang || ""} 
                  onChange={(v) => handleArrayFieldChange("languages", idx, null, v)} 
                  isEditing={editMode} 
                  placeholder="Language"
                />
                {(localData.languages?.length > 1 || idx > 0) && (
                  <Trash2 
                    size={14} 
                    style={{ cursor: 'pointer', color: 'red' }} 
                    onClick={() => removeItem("languages", idx)}
                    className="no-print"
                  />
                )}
              </div>
            ))}
            <button
              onClick={() => addItem("languages", "")}
              style={{
                marginTop: "8px",
                padding: "0.3rem 1rem",
                background: "#e0e7ff",
                color: ACCENT_COLOR,
                border: "1px solid",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
              className="no-print"
            >
              + Add Language
            </button>
          </div>
        ) : (
          <ul style={{
            color: "#334155",
            fontSize: "1rem",
            marginTop: "8px",
            paddingLeft: "20px",
            listStyleType: "disc"
          }}>
            {(localData.languages || []).map((lang, idx) => (
              <li key={idx} style={{ marginBottom: "4px" }}>{renderSafeText(lang)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // Interests Section
  const interestsSection = (editMode || hasContent.array(localData.interests)) && (
    <div>
      <div style={sectionTitleStyle}>INTERESTS</div>
      <div style={{ color: "#334155", fontSize: "1rem", marginTop: "8px" }}>
        {editMode ? (
          <div className="no-print">
            {(localData.interests || []).map((interest, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <EditableField 
                  value={interest || ""} 
                  onChange={(v) => handleArrayFieldChange("interests", idx, null, v)} 
                  isEditing={editMode} 
                  placeholder="Interest"
                />
                {(localData.interests?.length > 1 || idx > 0) && (
                  <Trash2 
                    size={14} 
                    style={{ cursor: 'pointer', color: 'red' }} 
                    onClick={() => removeItem("interests", idx)}
                    className="no-print"
                  />
                )}
              </div>
            ))}
            <button
              onClick={() => addItem("interests", "")}
              style={{
                marginTop: "8px",
                padding: "0.3rem 1rem",
                background: "#e0e7ff",
                color: ACCENT_COLOR,
                border: "1px solid",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
              className="no-print"
            >
              + Add Interest
            </button>
          </div>
        ) : (
          <ul style={{
            color: "#334155",
            fontSize: "1rem",
            marginTop: "8px",
            paddingLeft: "20px",
            listStyleType: "disc"
          }}>
            {(localData.interests || []).map((interest, idx) => (
              <li key={idx} style={{ marginBottom: "4px" }}>{renderSafeText(interest)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: LIGHT_BACKGROUND }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resumeRef={resumeRef} />
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
            className="resume-page"
            style={{
              maxWidth: "793px",
              width: "100%",
              minHeight: "1123px",
              padding: "1.5rem",
              backgroundColor: "#ffffff",
              color: "#000000",
              boxSizing: "border-box",
              pageBreakAfter: "always",
              pageBreakInside: "avoid",
              overflow: "hidden",
              border: "none",
            }}
            data-resume-template="template26"
          >
            {/* HEADER */}
            {headerSection}

            {/* Main Sections with Vertical Line */}
            <div style={{
              display: "flex",
              background: "#fff",
              borderRadius: "0",
              position: "relative",
              minHeight: "100%",
              padding: "32px 0",
            }}>
              <div style={verticalLineStyle} />

              {/* LEFT COLUMN */}
              <div style={{
                flex: "1",
                padding: "0 32px 0 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                gap: "32px",
              }}>
                {/* CONTACT SECTION - ALWAYS SHOW FIRST */}
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
              <div style={{
                flex: "1.7",
                padding: "0 32px 0 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                gap: "32px",
              }}>
                {/* DYNAMIC RIGHT COLUMN SECTIONS */}
                {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                  "summary", "experience"
                ]).map((sectionKey) => {
                  switch(sectionKey) {
                    case "summary": return summarySection;
                    case "experience": return experienceSection;
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

export default Template26;