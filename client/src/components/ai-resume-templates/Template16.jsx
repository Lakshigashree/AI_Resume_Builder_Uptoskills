import React, { 
  useState, 
  useRef, 
  useEffect 
} from "react";
import { 
  toast 
} from 'react-toastify';
import { 
  useLocation 
} from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { 
  useResume 
} from "../../context/ResumeContext";
import { 
  useAuth 
} from "../../context/AuthContext";
import resumeService from "../../services/resumeService";
import html2pdf from "html2pdf.js";
import { 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaEdit, 
  FaEnvelope, 
  FaPhone, 
  FaLinkedin, 
  FaGithub, 
  FaGlobe, 
  FaMapMarkerAlt 
} from "react-icons/fa";

/**
 * @component EditBlock
 * Wraps dynamic sections in a dashed container during edit mode.
 * Implements "Full Hide" logic for clean A4 printing.
 */
const EditBlock = ({ 
  title, 
  children, 
  onAdd, 
  onRemove, 
  isEditMode, 
  hasData 
}) => {
  // If we aren't editing and there is no data, hide the entire block (Title + Content)
  if (!isEditMode && !hasData) {
    return null;
  }

  return (
    <div 
      style={{
        position: "relative",
        padding: isEditMode ? "1.5rem" : "0",
        marginBottom: "2.5rem",
        border: isEditMode ? "2px dashed #3b82f6" : "none",
        borderRadius: "12px",
        backgroundColor: isEditMode ? "#eff6ff" : "transparent",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: isEditMode ? "1.5rem" : "1rem" 
        }}
      >
        <h3 
          style={{
            fontSize: "1.25rem",
            fontWeight: "800",
            color: "#1f2937",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            borderLeft: "4px solid #3b82f6",
            paddingLeft: "1rem",
            margin: 0
          }}
        >
          {title}
        </h3>
        
        {isEditMode && (
          <div 
            style={{ display: "flex", gap: "12px" }} 
            className="hide-in-pdf"
          >
            {onAdd && (
              <button 
                onClick={onAdd} 
                style={smallBtnStyle("#10b981")}
                title="Add new entry to this section"
              >
                <FaPlus size={10} /> ADD ITEM
              </button>
            )}
            <button 
              onClick={onRemove} 
              style={smallBtnStyle("#ef4444")}
              title="Hide this entire section"
            >
              <FaTrash size={10} /> HIDE SECTION
            </button>
          </div>
        )}
      </div>
      
      <div style={{ width: "100%" }}>
        {children}
      </div>
    </div>
  );
};

const Template16 = () => {
  const resumeRef = useRef(null);
  const { resumeData, updateResumeData, sectionOrder } = useResume();
  const { isAuthenticated } = useAuth();

  const [localData, setLocalData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with global context on mount or change
  useEffect(() => {
    if (resumeData) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
    }
  }, [resumeData]);

  // Listen for Edit Mode toggles from the Sidebar
  useEffect(() => {
    const handleToggle = (e) => setEditMode(e.detail);
    window.addEventListener("toggleEditMode", handleToggle);
    return () => window.removeEventListener("toggleEditMode", handleToggle);
  }, []);

  // --- Handlers for Data Mutation ---

  const handleFieldChange = (field, value) => {
    setLocalData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const handleArrayUpdate = (section, index, key, value) => {
    const updated = [...(localData[section] || [])];
    if (key) {
      updated[index] = { 
        ...updated[index], 
        [key]: value 
      };
    } else {
      updated[index] = value;
    }
    handleFieldChange(section, updated);
  };

  const handleAddItem = (section, template) => {
    const current = localData[section] || [];
    handleFieldChange(section, [...current, template]);
    toast.info(`Added new entry to ${section}`);
  };

  const handleRemoveItem = (section, index) => {
    const current = (localData[section] || []).filter((_, i) => i !== index);
    handleFieldChange(section, current);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateResumeData(localData);
      if (isAuthenticated) {
        await resumeService.saveResumeData({ 
          ...localData, 
          templateId: 16 
        });
      }
      setEditMode(false);
      toast.success("Resume blocks updated successfully");
    } catch (err) {
      toast.error("Failed to sync changes with server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const element = resumeRef.current;
    const opt = {
      margin: 0,
      filename: `${localData.name || 'Resume'}_Professional.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 3, 
        useCORS: true, 
        letterRendering: true 
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
    html2pdf().set(opt).from(element).save();
  };

  // --- Safety Utility ---
  const renderSafe = (val) => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    return val.title || val.name || val.degree || "";
  };

  if (!localData) return null;

  // --- 🔹 DYNAMIC SECTION COMPONENT MAPPING 🔹 ---
  // Each block checks its own "hasData" status to decide if it should hide
  const sectionComponents = {
    summary: (
      <EditBlock 
        key="summary" 
        title="Professional Profile" 
        isEditMode={editMode} 
        hasData={!!localData.summary}
        onRemove={() => handleFieldChange("summary", "")}
      >
        {editMode ? (
          <textarea 
            style={textareaStyle} 
            value={localData.summary || ""} 
            onChange={(e) => handleFieldChange("summary", e.target.value)}
            placeholder="Write an impactful summary of your career..."
          />
        ) : (
          <p style={bodyTextStyle}>
            {localData.summary}
          </p>
        )}
      </EditBlock>
    ),
    experience: (
      <EditBlock 
        key="experience" 
        title="Work Experience" 
        isEditMode={editMode} 
        hasData={localData.experience?.length > 0}
        onAdd={() => handleAddItem("experience", {
          title: "", 
          company: "", 
          duration: "", 
          description: ""
        })}
        onRemove={() => handleFieldChange("experience", [])}
      >
        {(localData.experience || []).map((exp, i) => (
          <div key={i} style={itemContainerStyle(editMode)}>
            {editMode ? (
              <div style={{ display: "grid", gap: "12px" }}>
                <input 
                  style={inputStyle} 
                  value={exp.title} 
                  onChange={e => handleArrayUpdate("experience", i, "title", e.target.value)} 
                  placeholder="Job Title (e.g. Software Engineer)" 
                />
                <input 
                  style={inputStyle} 
                  value={exp.company} 
                  onChange={e => handleArrayUpdate("experience", i, "company", e.target.value)} 
                  placeholder="Company Name" 
                />
                <textarea 
                  style={textareaStyle} 
                  value={exp.description} 
                  onChange={e => handleArrayUpdate("experience", i, "description", e.target.value)} 
                  placeholder="Describe your achievements and impact..." 
                />
                <button 
                  onClick={() => handleRemoveItem("experience", i)} 
                  style={delBtnStyle}
                >
                  <FaTrash /> Remove this role
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={subHeaderStyle}>{exp.title}</h4>
                <p style={accentTextStyle}>{exp.company} | {exp.duration}</p>
                <p style={bodyTextStyle}>{exp.description}</p>
              </div>
            )}
          </div>
        ))}
      </EditBlock>
    ),
    education: (
      <EditBlock 
        key="education" 
        title="Academic Background" 
        isEditMode={editMode}
        hasData={localData.education?.length > 0}
        onAdd={() => handleAddItem("education", {
          degree: "", 
          institution: "", 
          year: ""
        })}
        onRemove={() => handleFieldChange("education", [])}
      >
        {(localData.education || []).map((edu, i) => (
          <div key={i} style={itemContainerStyle(editMode)}>
            {editMode ? (
              <div style={{ display: "grid", gap: "12px" }}>
                <input 
                  style={inputStyle} 
                  value={edu.degree} 
                  onChange={e => handleArrayUpdate("education", i, "degree", e.target.value)} 
                  placeholder="Degree (e.g. B.Tech IT)" 
                />
                <input 
                  style={inputStyle} 
                  value={edu.institution} 
                  onChange={e => handleArrayUpdate("education", i, "institution", e.target.value)} 
                  placeholder="University/College Name" 
                />
                <button 
                  onClick={() => handleRemoveItem("education", i)} 
                  style={delBtnStyle}
                >
                  <FaTrash /> Remove Education
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: "1rem" }}>
                <h4 style={subHeaderStyle}>{renderSafe(edu)}</h4>
                <p style={bodyTextStyle}>{edu.institution} | {edu.year}</p>
              </div>
            )}
          </div>
        ))}
      </EditBlock>
    ),
    skills: (
      <EditBlock 
        key="skills" 
        title="Technical Expertise" 
        isEditMode={editMode} 
        hasData={localData.skills?.length > 0}
        onRemove={() => handleFieldChange("skills", [])}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
          {(localData.skills || []).map((s, i) => (
            <div key={i} style={skillBadgeStyle}>
              {editMode ? (
                <input 
                  style={{ 
                    border: "none", 
                    background: "transparent", 
                    color: "white", 
                    width: "90px", 
                    outline: "none",
                    fontWeight: "600"
                  }}
                  value={renderSafe(s)} 
                  onChange={e => handleArrayUpdate("skills", i, null, e.target.value)} 
                />
              ) : renderSafe(s)}
              {editMode && (
                <FaTimes 
                  onClick={() => handleRemoveItem("skills", i)} 
                  style={{ cursor: "pointer", marginLeft: "8px", opacity: 0.8 }} 
                />
              )}
            </div>
          ))}
          {editMode && (
            <button 
              onClick={() => handleAddItem("skills", "New Skill")} 
              style={addBadgeStyle}
            >
              + ADD SKILL
            </button>
          )}
        </div>
      </EditBlock>
    ),
    projects: (
      <EditBlock 
        key="projects" 
        title="Key Projects" 
        isEditMode={editMode}
        hasData={localData.projects?.length > 0}
        onAdd={() => handleAddItem("projects", {
          name: "", 
          description: ""
        })}
        onRemove={() => handleFieldChange("projects", [])}
      >
        {(localData.projects || []).map((p, i) => (
          <div key={i} style={itemContainerStyle(editMode)}>
            {editMode ? (
              <div style={{ display: "grid", gap: "12px" }}>
                <input 
                  style={inputStyle} 
                  value={p.name} 
                  onChange={e => handleArrayUpdate("projects", i, "name", e.target.value)} 
                  placeholder="Project Name"
                />
                <textarea 
                  style={textareaStyle} 
                  value={p.description} 
                  onChange={e => handleArrayUpdate("projects", i, "description", e.target.value)} 
                  placeholder="Details about the project, tech stack used, and results..."
                />
                <button 
                  onClick={() => handleRemoveItem("projects", i)} 
                  style={delBtnStyle}
                >
                  <FaTrash /> Remove Project
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: "1.25rem" }}>
                <h4 style={subHeaderStyle}>{renderSafe(p)}</h4>
                <p style={bodyTextStyle}>{p.description}</p>
              </div>
            )}
          </div>
        ))}
      </EditBlock>
    ),
    certifications: (
      <EditBlock 
        key="certifications" 
        title="Certifications" 
        isEditMode={editMode} 
        hasData={localData.certifications?.length > 0}
        onRemove={() => handleFieldChange("certifications", [])}
      >
        {(localData.certifications || []).map((c, i) => (
          <div 
            key={i} 
            style={{ 
              marginBottom: "0.75rem", 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <p style={{ ...bodyTextStyle, fontWeight: "500" }}>• {renderSafe(c)}</p>
            {editMode && (
              <FaTrash 
                onClick={() => handleRemoveItem("certifications", i)} 
                style={{ color: "#ef4444", cursor: "pointer" }} 
              />
            )}
          </div>
        ))}
        {editMode && (
          <button 
            onClick={() => handleAddItem("certifications", {title: "New Certificate"})} 
            style={addLinkStyle}
          >
            + ADD CERTIFICATION
          </button>
        )}
      </EditBlock>
    ),
    achievements: (
      <EditBlock 
        key="achievements" 
        title="Accomplishments" 
        isEditMode={editMode} 
        hasData={localData.achievements?.length > 0}
        onRemove={() => handleFieldChange("achievements", [])}
      >
        {(localData.achievements || []).map((a, i) => (
          <div 
            key={i} 
            style={{ 
              marginBottom: "0.75rem", 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <p style={bodyTextStyle}>🏆 {renderSafe(a)}</p>
            {editMode && (
              <FaTrash 
                onClick={() => handleRemoveItem("achievements", i)} 
                style={{ color: "#ef4444", cursor: "pointer" }} 
              />
            )}
          </div>
        ))}
        {editMode && (
          <button 
            onClick={() => handleAddItem("achievements", "New Achievement")} 
            style={addLinkStyle}
          >
            + ADD ACHIEVEMENT
          </button>
        )}
      </EditBlock>
    ),
    languages: (
      <EditBlock 
        key="languages" 
        title="Languages" 
        isEditMode={editMode} 
        hasData={localData.languages?.length > 0}
        onRemove={() => handleFieldChange("languages", [])}
      >
        <p style={{ ...bodyTextStyle, fontWeight: "600", color: "#1f2937" }}>
          {(localData.languages || []).map(renderSafe).join(" • ")}
        </p>
        {editMode && (
          <input 
            style={{ ...inputStyle, marginTop: "1rem" }} 
            placeholder="English, French, Hindi..." 
            onChange={e => handleFieldChange("languages", e.target.value.split(","))} 
          />
        )}
      </EditBlock>
    ),
    interests: (
      <EditBlock 
        key="interests" 
        title="Interests & Hobbies" 
        isEditMode={editMode} 
        hasData={localData.interests?.length > 0}
        onRemove={() => handleFieldChange("interests", [])}
      >
        <p style={{ ...bodyTextStyle, fontStyle: "italic" }}>
          {(localData.interests || []).join(", ")}
        </p>
        {editMode && (
          <input 
            style={{ ...inputStyle, marginTop: "1rem" }} 
            placeholder="Chess, Reading, Trekking..." 
            onChange={e => handleFieldChange("interests", e.target.value.split(","))} 
          />
        )}
      </EditBlock>
    ),
  };

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        backgroundColor: "#f4f7f6",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar 
          onDownload={handleDownload} 
          resumeRef={resumeRef} 
        />

        <div 
          style={{ 
            flexGrow: 1, 
            padding: "4rem", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            overflowY: "auto"
          }}
        >
          
          {/* --- MAIN RESUME CONTAINER (A4 SPEC) --- */}
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#ffffff", 
              color: "#1f2937", 
              width: "210mm", 
              minHeight: "297mm",
              padding: "35mm 25mm", 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              boxSizing: "border-box", 
              fontFamily: "'Inter', 'Roboto', sans-serif",
              position: "relative"
            }}
          >
            {/* --- HEADER BLOCK --- */}
            <header 
              style={{ 
                borderBottom: "5px solid #1f2937", 
                paddingBottom: "2.5rem", 
                marginBottom: "3.5rem" 
              }}
            >
              {editMode ? (
                <div style={{ display: "grid", gap: "18px" }}>
                  <input 
                    style={{ ...inputStyle, fontSize: "2.8rem", fontWeight: "900" }} 
                    value={localData.name || ""} 
                    onChange={e => handleFieldChange("name", e.target.value)} 
                    placeholder="Full Name"
                  />
                  <input 
                    style={{ ...inputStyle, fontSize: "1.4rem", color: "#3b82f6", fontWeight: "700" }} 
                    value={localData.role || ""} 
                    onChange={e => handleFieldChange("role", e.target.value)} 
                    placeholder="Current Professional Title"
                  />
                  <div 
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr", 
                      gap: "12px" 
                    }}
                  >
                    <input style={smallInputStyle} value={localData.email} onChange={e => handleFieldChange("email", e.target.value)} placeholder="Email" />
                    <input style={smallInputStyle} value={localData.phone} onChange={e => handleFieldChange("phone", e.target.value)} placeholder="Phone" />
                    <input style={smallInputStyle} value={localData.linkedin} onChange={e => handleFieldChange("linkedin", e.target.value)} placeholder="LinkedIn URL" />
                    <input style={smallInputStyle} value={localData.github} onChange={e => handleFieldChange("github", e.target.value)} placeholder="GitHub URL" />
                  </div>
                </div>
              ) : (
                <div 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-end" 
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h1 
                      style={{ 
                        fontSize: "3.2rem", 
                        fontWeight: "900", 
                        margin: 0, 
                        color: "#111827", 
                        lineHeight: 1,
                        letterSpacing: "-0.02em"
                      }}
                    >
                      {localData.name || "Full Name"}
                    </h1>
                    <h2 
                      style={{ 
                        fontSize: "1.6rem", 
                        color: "#3b82f6", 
                        fontWeight: "700", 
                        marginTop: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      {localData.role || "Target Job Position"}
                    </h2>
                  </div>
                  <div 
                    style={{ 
                      textAlign: "right", 
                      fontSize: "0.95rem", 
                      color: "#4b5563", 
                      lineHeight: 1.8 
                    }}
                  >
                    <div style={contactRowStyle}><FaEnvelope size={12} color="#3b82f6"/> {localData.email}</div>
                    <div style={contactRowStyle}><FaPhone size={12} color="#3b82f6"/> {localData.phone}</div>
                    <div 
                      style={{ 
                        display: "flex", 
                        gap: "15px", 
                        marginTop: "12px", 
                        fontWeight: "800",
                        fontSize: "0.85rem"
                      }}
                    >
                      {localData.linkedin && (
                        <a href={localData.linkedin} style={headerLinkStyle}>LINKEDIN</a>
                      )}
                      {localData.github && (
                        <a href={localData.github} style={headerLinkStyle}>GITHUB</a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </header>

            {/* --- DYNAMIC SECTION LOOP --- */}
            <main>
              {(sectionOrder && sectionOrder.length > 0 
                ? sectionOrder 
                : ["summary", "experience", "education", "skills", "projects"]
              ).map(key => sectionComponents[key])}
            </main>
          </div>

          {/* --- FLOATING ACTION BAR --- */}
          <div 
            data-html2canvas-ignore="true" 
            style={{
              position: "fixed", 
              bottom: "40px", 
              display: "flex", 
              gap: "20px",
              padding: "18px 40px", 
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(15px)", 
              borderRadius: "60px", 
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              zIndex: 1000, 
              border: "1px solid #e5e7eb"
            }}
          >
            {editMode ? (
              <>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  style={actionBtnStyle("#10b981")}
                >
                  <FaSave /> {isSaving ? "SYNCING..." : "SAVE CHANGES"}
                </button>
                <button 
                  onClick={() => setEditMode(false)} 
                  style={actionBtnStyle("#6b7280")}
                >
                  <FaTimes /> CANCEL
                </button>
              </>
            ) : (
              <button 
                onClick={() => setEditMode(true)} 
                style={actionBtnStyle("#3b82f6")}
              >
                <FaEdit /> ENTER DYNAMIC EDIT MODE
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// --- CSS-in-JS Styles ---

const contactRowStyle = { 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "flex-end", 
  gap: "10px" 
};

const headerLinkStyle = { 
  color: "#3b82f6", 
  textDecoration: "none", 
  borderBottom: "2px solid #3b82f6",
  paddingBottom: "2px"
};

const bodyTextStyle = { 
  fontSize: "1rem", 
  lineHeight: "1.7", 
  color: "#374151", 
  margin: 0, 
  textAlign: "justify" 
};

const subHeaderStyle = { 
  fontSize: "1.3rem", 
  fontWeight: "800", 
  margin: "0 0 6px 0", 
  color: "#111827",
  letterSpacing: "-0.01em"
};

const accentTextStyle = { 
  fontSize: "0.95rem", 
  color: "#3b82f6", 
  fontWeight: "800", 
  marginBottom: "10px", 
  textTransform: "uppercase",
  letterSpacing: "0.03em"
};

const skillBadgeStyle = { 
  backgroundColor: "#1f2937", 
  color: "white", 
  padding: "8px 18px", 
  borderRadius: "6px", 
  fontSize: "0.9rem", 
  fontWeight: "700", 
  display: "flex", 
  alignItems: "center", 
  gap: "10px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const inputStyle = { 
  width: "100%", 
  padding: "12px", 
  border: "1px solid #cbd5e1", 
  borderRadius: "8px", 
  fontSize: "1rem",
  boxSizing: "border-box"
};

const textareaStyle = { 
  width: "100%", 
  padding: "12px", 
  border: "1px solid #cbd5e1", 
  borderRadius: "8px", 
  fontSize: "1rem", 
  minHeight: "120px", 
  fontFamily: "inherit",
  resize: "vertical",
  boxSizing: "border-box"
};

const smallInputStyle = { 
  padding: "10px", 
  border: "1px solid #cbd5e1", 
  borderRadius: "6px", 
  fontSize: "0.9rem",
  boxSizing: "border-box"
};

const itemContainerStyle = (edit) => ({ 
  padding: edit ? "20px" : "0", 
  borderBottom: edit ? "2px solid #e2e8f0" : "none", 
  marginBottom: "1.5rem",
  borderRadius: edit ? "10px" : "0",
  backgroundColor: edit ? "#ffffff" : "transparent"
});

const delBtnStyle = { 
  color: "#ef4444", 
  border: "1px solid #fecaca", 
  background: "#fef2f2", 
  padding: "6px 12px",
  borderRadius: "6px",
  fontSize: "0.75rem", 
  fontWeight: "800", 
  cursor: "pointer", 
  marginTop: "8px",
  width: "fit-content",
  display: "flex",
  alignItems: "center",
  gap: "5px"
};

const addLinkStyle = { 
  color: "#3b82f6", 
  border: "1px dashed #3b82f6", 
  background: "#eff6ff", 
  padding: "8px 16px",
  borderRadius: "8px",
  fontSize: "0.85rem", 
  fontWeight: "800", 
  cursor: "pointer", 
  marginTop: "12px" 
};

const addBadgeStyle = { 
  backgroundColor: "#10b981", 
  color: "white", 
  border: "none", 
  padding: "8px 20px", 
  borderRadius: "6px", 
  cursor: "pointer", 
  fontWeight: "800",
  fontSize: "0.85rem"
};

const smallBtnStyle = (color) => ({ 
  backgroundColor: color, 
  color: "white", 
  border: "none", 
  padding: "6px 12px", 
  borderRadius: "6px", 
  fontSize: "10px", 
  fontWeight: "900", 
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
});

const actionBtnStyle = (color) => ({ 
  backgroundColor: color, 
  color: "white", 
  border: "none", 
  padding: "14px 30px", 
  borderRadius: "50px", 
  fontWeight: "900", 
  cursor: "pointer", 
  display: "flex", 
  alignItems: "center", 
  gap: "12px", 
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  fontSize: "0.9rem",
  letterSpacing: "0.05em"
});

export default Template16;