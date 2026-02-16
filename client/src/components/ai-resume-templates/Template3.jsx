/* eslint-disable no-unused-vars */
import { 
  useState, 
  useRef, 
  useEffect 
} from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { toast } from 'react-toastify';
import html2pdf from "html2pdf.js";

// 🔹 Helpers from config (Ensure path is correct)
import { 
  hasContent, 
  getSafeUrl 
} from "../../utils/ResumeConfig";

// ---------- 🔹 DATA HELPERS (FIXED) 🔹 ----------
const safeArray = (v) => (Array.isArray(v) ? v : []);

const Template3 = () => {
  const resumeRef = useRef(null);
  const { 
    resumeData, 
    updateResumeData, 
    sectionOrder 
  } = useResume();
  
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});

  // --- Styling Constants ---
  const ACCENT_COLOR = "#004d40"; 
  const PRIMARY_TEXT_COLOR = "#343a40";
  const LIGHT_BACKGROUND = "#f4f7f6";
  const SECTION_HEADER_BG = "#eaf3f2";
  const FONT_HEADER = "Merriweather, serif";
  const FONT_BODY = "Lato, sans-serif";

  useEffect(() => {
    if (resumeData) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
    }
  }, [resumeData]);

  // ---------- HANDLERS ----------

  const handleFieldChange = (field, value) => {
    setLocalData((prev) => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const handleArrayUpdate = (section, index, value, key = null) => {
    const updated = [...(localData[section] || [])];
    if (updated[index] !== undefined) {
      if (key) {
        updated[index] = { 
          ...updated[index], 
          [key]: value 
        };
      } else {
        updated[index] = value;
      }
      setLocalData(prev => ({ 
        ...prev, 
        [section]: updated 
      }));
    }
  };

  const addItem = (section, template) => {
    setLocalData(prev => ({
      ...prev,
      [section]: [
        ...(prev[section] || []), 
        template
      ]
    }));
  };

  const removeItem = (section, index) => {
    setLocalData(prev => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      await updateResumeData(localData);
      setEditMode(false);
      toast.success("✅ Changes Saved Successfully");
    } catch (e) {
      toast.error("❌ Save Failed");
    }
  };

  const handleCancel = () => {
    setLocalData(JSON.parse(JSON.stringify(resumeData)));
    setEditMode(false);
  };

  const handleDownload = () => {
    const element = resumeRef.current;
    const options = {
      margin: 10,
      filename: `${localData.name || 'resume'}.pdf`,
      image: { 
        type: "jpeg", 
        quality: 0.98 
      },
      html2canvas: { 
        scale: 3, 
        useCORS: true, 
        letterRendering: true, 
        width: 794 
      },
      jsPDF: { 
        unit: "mm", 
        format: "a4", 
        orientation: "portrait" 
      },
      enableLinks: true
    };
    html2pdf().set(options).from(element).save();
  };

  const renderSafe = (val) => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    return val.title || val.name || val.degree || "";
  };

  const normalizeUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();
    return trimmed.startsWith("http") ? trimmed : "https://" + trimmed;
  };

  // --- Styles ---
  const sectionTitleContainerStyle = {
    display: "flex",
    alignItems: "center",
    backgroundColor: SECTION_HEADER_BG,
    padding: "0.7rem 1.2rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    borderLeft: `6px solid ${ACCENT_COLOR}`,
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    justifyContent: "space-between"
  };

  const sectionTitleStyle = {
    fontWeight: "700", 
    fontSize: "1.3rem", 
    letterSpacing: "1px",
    fontFamily: FONT_HEADER, 
    color: PRIMARY_TEXT_COLOR, 
    margin: 0,
    textTransform: "uppercase"
  };

  const editBoxStyle = editMode ? {
    border: "1px dashed #3b82f6", 
    backgroundColor: "#f9fafb", 
    padding: "15px", 
    borderRadius: "8px", 
    marginBottom: "2rem"
  } : { 
    marginBottom: "2.5rem" 
  };

  const inputStyle = { 
    width: "100%", 
    padding: "8px", 
    border: "1px solid #d1d5db", 
    borderRadius: "4px", 
    marginBottom: "5px" 
  };

  // --- 🔹 DYNAMIC SECTION COMPONENTS MAP 🔹 ---
  const sectionComponents = {
    summary: hasContent(localData, "summary", editMode) && (
      <div 
        key="summary" 
        style={editBoxStyle}
      >
        <div style={sectionTitleContainerStyle}>
          <h3 style={sectionTitleStyle}>
            Summary
          </h3>
        </div>
        {editMode ? (
          <textarea 
            style={{ 
              ...inputStyle, 
              minHeight: "100px" 
            }} 
            value={localData.summary} 
            onChange={(e) => handleFieldChange("summary", e.target.value)} 
          />
        ) : (
          <p 
            style={{ 
              lineHeight: "1.7", 
              color: PRIMARY_TEXT_COLOR, 
              textAlign: "justify" 
            }}
          >
            {localData.summary}
          </p>
        )}
      </div>
    ),

    experience: hasContent(localData, "experience", editMode) && (
      <div 
        key="experience" 
        style={editBoxStyle}
      >
        <div style={sectionTitleContainerStyle}>
          <h3 style={sectionTitleStyle}>
            Experience
          </h3>
          {editMode && (
            <button 
              onClick={() => addItem("experience", {
                title: "", 
                companyName: "", 
                date: "", 
                description: ""
              })} 
              style={{
                background: ACCENT_COLOR, 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                padding: "2px 8px"
              }}
            >
              +
            </button>
          )}
        </div>
        {safeArray(localData.experience).map((exp, i) => (
          <div 
            key={i} 
            style={{ marginBottom: "1.5rem" }}
          >
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input 
                  style={inputStyle} 
                  value={renderSafe(exp.title)} 
                  onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "title")} 
                  placeholder="Job Title" 
                />
                <input 
                  style={inputStyle} 
                  value={renderSafe(exp.companyName)} 
                  onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "companyName")} 
                  placeholder="Company" 
                />
                <textarea 
                  style={inputStyle} 
                  value={renderSafe(exp.description)} 
                  onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "description")} 
                  placeholder="Description" 
                />
                <button 
                  onClick={() => removeItem("experience", i)} 
                  style={{
                    color: "red", 
                    border: "none", 
                    background: "none", 
                    textAlign: "left", 
                    fontSize: "0.7rem"
                  }}
                >
                  Remove Block
                </button>
              </div>
            ) : (
              <div 
                style={{ 
                  borderLeft: `2px solid ${SECTION_HEADER_BG}`, 
                  paddingLeft: "1rem" 
                }}
              >
                <h4 
                  style={{ 
                    margin: 0, 
                    fontSize: "1.1rem", 
                    fontWeight: "700", 
                    color: ACCENT_COLOR, 
                    fontFamily: FONT_HEADER 
                  }}
                >
                  {renderSafe(exp.title)}
                </h4>
                <p 
                  style={{ 
                    margin: "0.2rem 0", 
                    fontSize: "0.95rem", 
                    fontWeight: "600" 
                  }}
                >
                  {renderSafe(exp.companyName)} | {exp.date}
                </p>
                <p 
                  style={{ 
                    fontSize: "0.9rem", 
                    lineHeight: "1.6" 
                  }}
                >
                  {renderSafe(exp.description)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    ),

    education: hasContent(localData, "education", editMode) && (
      <div 
        key="education" 
        style={editBoxStyle}
      >
        <div style={sectionTitleContainerStyle}>
          <h3 style={sectionTitleStyle}>
            Education
          </h3>
          {editMode && (
            <button 
              onClick={() => addItem("education", {
                degree: "", 
                institution: "", 
                duration: ""
              })} 
              style={{
                background: ACCENT_COLOR, 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                padding: "2px 8px"
              }}
            >
              +
            </button>
          )}
        </div>
        {safeArray(localData.education).map((edu, i) => (
          <div 
            key={i} 
            style={{ marginBottom: "1rem" }}
          >
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input 
                  style={inputStyle} 
                  value={renderSafe(edu.degree)} 
                  onChange={(e) => handleArrayUpdate("education", i, e.target.value, "degree")} 
                  placeholder="Degree" 
                />
                <input 
                  style={inputStyle} 
                  value={renderSafe(edu.institution)} 
                  onChange={(e) => handleArrayUpdate("education", i, e.target.value, "institution")} 
                  placeholder="School" 
                />
                <button 
                  onClick={() => removeItem("education", i)} 
                  style={{
                    color: "red", 
                    border: "none", 
                    background: "none", 
                    textAlign: "left", 
                    fontSize: "0.7rem"
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div 
                style={{ 
                  borderLeft: `2px solid ${SECTION_HEADER_BG}`, 
                  paddingLeft: "1rem" 
                }}
              >
                <h4 
                  style={{ 
                    margin: 0, 
                    fontWeight: "700", 
                    color: ACCENT_COLOR 
                  }}
                >
                  {renderSafe(edu.degree)}
                </h4>
                <p style={{ margin: 0 }}>
                  {renderSafe(edu.institution)} | {edu.duration}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    ),

    skills: hasContent(localData, "skills", editMode) && (
      <div 
        key="skills" 
        style={editBoxStyle}
      >
        <div style={sectionTitleContainerStyle}>
          <h3 style={sectionTitleStyle}>
            Skills
          </h3>
          {editMode && (
            <button 
              onClick={() => addItem("skills", "")} 
              style={{
                background: ACCENT_COLOR, 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                padding: "2px 8px"
              }}
            >
              +
            </button>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {safeArray(localData.skills).map((s, i) => (
            <div 
              key={i} 
              style={{ 
                backgroundColor: SECTION_HEADER_BG, 
                padding: "5px 12px", 
                borderRadius: "4px", 
                fontSize: "0.9rem" 
              }}
            >
              {editMode ? (
                <input 
                  style={{
                    border: "none", 
                    background: "transparent", 
                    width: "80px"
                  }} 
                  value={renderSafe(s)} 
                  onChange={(e) => handleArrayUpdate("skills", i, e.target.value)} 
                />
              ) : (
                renderSafe(s)
              )}
              {editMode && (
                <button 
                  onClick={() => removeItem("skills", i)} 
                  style={{
                    color: "red", 
                    border: "none", 
                    background: "none", 
                    marginLeft: "5px"
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    projects: hasContent(localData, "projects", editMode) && (
      <div 
        key="projects" 
        style={editBoxStyle}
      >
        <div style={sectionTitleContainerStyle}>
          <h3 style={sectionTitleStyle}>
            Projects
          </h3>
          {editMode && (
            <button 
              onClick={() => addItem("projects", {
                name: "", 
                description: ""
              })} 
              style={{
                background: ACCENT_COLOR, 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                padding: "2px 8px"
              }}
            >
              +
            </button>
          )}
        </div>
        {safeArray(localData.projects).map((p, i) => (
          <div 
            key={i} 
            style={{ marginBottom: "1rem" }}
          >
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input 
                  style={inputStyle} 
                  value={renderSafe(p.name)} 
                  onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "name")} 
                />
                <textarea 
                  style={inputStyle} 
                  value={renderSafe(p.description)} 
                  onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "description")} 
                />
                <button 
                  onClick={() => removeItem("projects", i)} 
                  style={{
                    color: "red", 
                    border: "none", 
                    background: "none", 
                    textAlign: "left", 
                    fontSize: "0.7rem"
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div 
                style={{ 
                  borderLeft: `2px solid ${SECTION_HEADER_BG}`, 
                  paddingLeft: "1rem" 
                }}
              >
                <h4 
                  style={{ 
                    margin: 0, 
                    fontWeight: "700", 
                    color: ACCENT_COLOR 
                  }}
                >
                  {renderSafe(p.name)}
                </h4>
                <p style={{ fontSize: "0.9rem" }}>
                  {renderSafe(p.description)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    ),

    certifications: hasContent(localData, "certifications", editMode) && (
        <div 
          key="certifications" 
          style={editBoxStyle}
        >
          <div style={sectionTitleContainerStyle}>
            <h3 style={sectionTitleStyle}>
              Certifications
            </h3>
            {editMode && (
              <button 
                onClick={() => addItem("certifications", {title:""})} 
                style={{
                  background: ACCENT_COLOR, 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px", 
                  padding: "2px 8px"
                }}
              >
                +
              </button>
            )}
          </div>
          {safeArray(localData.certifications).map((cert, i) => (
            <div 
              key={i} 
              style={{ 
                marginBottom: "5px", 
                display: "flex", 
                justifyContent: "space-between" 
              }}
            >
              {editMode ? (
                  <input 
                    style={inputStyle} 
                    value={renderSafe(cert.title)} 
                    onChange={(e) => handleArrayUpdate("certifications", i, e.target.value, "title")} 
                  />
              ) : (
                <div>• {renderSafe(cert.title)}</div>
              )}
              {editMode && (
                <button 
                  onClick={() => removeItem("certifications", i)} 
                  style={{
                    color: "red", 
                    border: "none", 
                    background: "none"
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
    ),

    achievements: hasContent(localData, "achievements", editMode) && (
        <div 
          key="achievements" 
          style={editBoxStyle}
        >
          <div style={sectionTitleContainerStyle}>
            <h3 style={sectionTitleStyle}>
              Achievements
            </h3>
            {editMode && (
              <button 
                onClick={() => addItem("achievements", "")} 
                style={{
                  background: ACCENT_COLOR, 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px", 
                  padding: "2px 8px"
                }}
              >
                +
              </button>
            )}
          </div>
          {safeArray(localData.achievements).map((ach, i) => (
            <div 
              key={i} 
              style={{ 
                marginBottom: "5px", 
                display: "flex", 
                justifyContent: "space-between" 
              }}
            >
              {editMode ? (
                  <input 
                    style={inputStyle} 
                    value={renderSafe(ach)} 
                    onChange={(e) => handleArrayUpdate("achievements", i, e.target.value)} 
                  />
              ) : (
                <li>{renderSafe(ach)}</li>
              )}
              {editMode && (
                <button 
                  onClick={() => removeItem("achievements", i)} 
                  style={{
                    color: "red", 
                    border: "none", 
                    background: "none"
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
    ),

    languages: hasContent(localData, "languages", editMode) && (
      <div 
        key="languages" 
        style={editBoxStyle}
      >
        <div style={sectionTitleContainerStyle}>
          <h3 style={sectionTitleStyle}>
            Languages
          </h3>
        </div>
        {editMode ? (
          <input 
            style={inputStyle} 
            value={localData.languages?.join(", ")} 
            onChange={(e) => handleFieldChange("languages", e.target.value.split(","))} 
          />
        ) : (
          <p>{localData.languages?.join(" • ")}</p>
        )}
      </div>
    ),

    interests: hasContent(localData, "interests", editMode) && (
      <div 
        key="interests" 
        style={editBoxStyle}
      >
        <div style={sectionTitleContainerStyle}>
          <h3 style={sectionTitleStyle}>
            Interests
          </h3>
        </div>
        {editMode ? (
          <input 
            style={inputStyle} 
            value={localData.interests?.join(", ")} 
            onChange={(e) => handleFieldChange("interests", e.target.value.split(","))} 
          />
        ) : (
          <p>{localData.interests?.join(" • ")}</p>
        )}
      </div>
    ),
  };

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        backgroundColor: LIGHT_BACKGROUND 
      }}
    >
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar 
          onDownload={handleDownload} 
          resumeRef={resumeRef} 
        />
        <div 
          style={{ 
            flexGrow: 1, 
            padding: "2.5rem", 
            display: "flex", 
            justifyContent: "center" 
          }}
        >
          <div 
            ref={resumeRef} 
            style={{ 
              backgroundColor: "#ffffff", 
              width: "794px", 
              minHeight: "1123px", 
              padding: "4rem", 
              borderRadius: "8px", 
              boxShadow: "0px 10px 30px rgba(0,0,0,0.1)", 
              fontFamily: FONT_BODY, 
              color: PRIMARY_TEXT_COLOR 
            }}
          >
            
            {/* HEADER */}
            <div 
              style={{ 
                marginBottom: "3rem", 
                textAlign: "center", 
                borderBottom: `3px solid ${ACCENT_COLOR}`, 
                paddingBottom: "1.5rem" 
              }}
            >
              {editMode ? (
                <div style={{ display: "grid", gap: "10px" }}>
                  <input 
                    style={{ 
                      fontSize: "2.5rem", 
                      fontWeight: "900", 
                      textAlign: "center" 
                    }} 
                    value={localData.name} 
                    onChange={(e) => handleFieldChange("name", e.target.value)} 
                    placeholder="Full Name" 
                  />
                  <input 
                    style={{ 
                      fontSize: "1.2rem", 
                      textAlign: "center", 
                      color: ACCENT_COLOR 
                    }} 
                    value={localData.role} 
                    onChange={(e) => handleFieldChange("role", e.target.value)} 
                    placeholder="Role" 
                  />
                </div>
              ) : (
                <>
                  <h1 
                    style={{ 
                      fontSize: "3rem", 
                      fontWeight: "900", 
                      textTransform: "uppercase", 
                      letterSpacing: "2px", 
                      margin: 0, 
                      fontFamily: FONT_HEADER 
                    }}
                  >
                    {localData.name || "Your Name"}
                  </h1>
                  <h2 
                    style={{ 
                      fontSize: "1.3rem", 
                      color: ACCENT_COLOR, 
                      fontWeight: "600", 
                      margin: "5px 0" 
                    }}
                  >
                    {localData.role || "Professional Role"}
                  </h2>
                </>
              )}

              {/* REDIRECTING LINKS */}
              <div 
                style={{ 
                  marginTop: "1.5rem", 
                  display: "flex", 
                  justifyContent: "center", 
                  flexWrap: "wrap", 
                  gap: "1.5rem", 
                  fontSize: "0.9rem" 
                }}
              >
                {editMode ? (
                  <div 
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr", 
                      gap: "10px", 
                      width: "100%" 
                    }}
                  >
                    <input style={inputStyle} value={localData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} placeholder="Phone" />
                    <input style={inputStyle} value={localData.email} onChange={(e) => handleFieldChange("email", e.target.value)} placeholder="Email" />
                    <input style={inputStyle} value={localData.linkedin} onChange={(e) => handleFieldChange("linkedin", e.target.value)} placeholder="LinkedIn" />
                    <input style={inputStyle} value={localData.github} onChange={(e) => handleFieldChange("github", e.target.value)} placeholder="GitHub" />
                    <input style={inputStyle} value={localData.portfolio} onChange={(e) => handleFieldChange("portfolio", e.target.value)} placeholder="Portfolio" />
                  </div>
                ) : (
                  <>
                    {localData.phone && (
                      <a href={`tel:${localData.phone}`} style={{ textDecoration: "none", color: "inherit" }}>📞 {localData.phone}</a>
                    )}
                    {localData.email && (
                      <a href={`mailto:${localData.email}`} style={{ textDecoration: "none", color: "inherit" }}>✉️ {localData.email}</a>
                    )}
                    {localData.linkedin && (
                      <a href={normalizeUrl(localData.linkedin)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: ACCENT_COLOR, fontWeight: "bold" }}>LinkedIn</a>
                    )}
                    {localData.github && (
                      <a href={normalizeUrl(localData.github)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: ACCENT_COLOR, fontWeight: "bold" }}>GitHub</a>
                    )}
                    {localData.portfolio && (
                      <a href={normalizeUrl(localData.portfolio)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: ACCENT_COLOR, fontWeight: "bold" }}>Portfolio</a>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* DYNAMIC BODY */}
            <div>
              {(sectionOrder || []).map((key) => sectionComponents[key] || null)}
            </div>

            {/* ACTIONS */}
            <div 
              data-html2canvas-ignore="true" 
              style={{ textAlign: "center", marginTop: "3rem" }}
            >
              {editMode ? (
                <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                  <button 
                    onClick={handleSave} 
                    style={{ 
                      background: ACCENT_COLOR, 
                      color: "white", 
                      padding: "10px 25px", 
                      borderRadius: "6px", 
                      border: "none", 
                      cursor: "pointer", 
                      fontWeight: "bold" 
                    }}
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={handleCancel} 
                    style={{ 
                      background: "#6c757d", 
                      color: "white", 
                      padding: "10px 25px", 
                      borderRadius: "6px", 
                      border: "none", 
                      cursor: "pointer", 
                      fontWeight: "bold" 
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setEditMode(true)} 
                  style={{ 
                    background: ACCENT_COLOR, 
                    color: "white", 
                    padding: "12px 40px", 
                    borderRadius: "6px", 
                    border: "none", 
                    cursor: "pointer", 
                    fontWeight: "bold" 
                  }}
                >
                  Edit Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template3;