/* eslint-disable no-unused-vars */
import { 
  useState, 
  useRef, 
  useEffect 
} from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import html2pdf from "html2pdf.js";
import { 
  toast 
} from 'react-toastify';

// 🔹 Helpers from config
import { 
  hasContent, 
  getSafeUrl 
} from "../../utils/ResumeConfig";

const Template2 = () => {
  const resumeRef = useRef(null);
  const { 
    resumeData, 
    updateResumeData, 
    sectionOrder 
  } = useResume();

  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});

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
      setLocalData((prev) => ({ 
        ...prev, 
        [section]: updated 
      }));
    }
  };

  const addItem = (section, template) => {
    setLocalData((prev) => ({
      ...prev,
      [section]: [
        ...(prev[section] || []), 
        template
      ]
    }));
  };

  const removeItem = (section, index) => {
    setLocalData((prev) => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      await updateResumeData(localData);
      setEditMode(false);
      toast.success("✅ Changes Saved");
    } catch (e) {
      toast.error("❌ Save Failed");
    }
  };

  const handleCancel = () => {
    setLocalData(JSON.parse(JSON.stringify(resumeData)));
    setEditMode(false);
  };

  const handleDownload = () => {
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
    html2pdf().set(options).from(resumeRef.current).save();
  };

  const renderSafe = (val) => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    return val.title || val.name || val.degree || "";
  };

  // ---------- STYLING ----------
  const sectionHeadingStyle = {
    fontWeight: "bold", 
    fontSize: "1.25rem", 
    color: "#111827", 
    marginBottom: "0.5rem",
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center"
  };

  const sectionDividerStyle = { 
    border: "none", 
    borderTop: "1px solid #e5e7eb", 
    margin: "0 0 0.75rem" 
  };
  
  const editBoxStyle = editMode ? {
    border: "1px dashed #3b82f6", 
    backgroundColor: "#f9fafb", 
    padding: "15px", 
    borderRadius: "8px", 
    marginBottom: "15px"
  } : { 
    marginBottom: "1.75rem" 
  };

  const inputStyle = { 
    width: "100%", 
    padding: "6px", 
    border: "1px solid #d1d5db", 
    borderRadius: "4px", 
    marginBottom: "5px" 
  };

  // --- 🔹 DYNAMIC SECTION COMPONENTS MAP 🔹 ---
  const sectionComponents = {
    summary: hasContent(localData, "summary", editMode) && (
      <section 
        key="summary" 
        style={editBoxStyle}
      >
        <h2 style={sectionHeadingStyle}>
          About Me
        </h2>
        <hr style={sectionDividerStyle} />
        {editMode ? (
          <textarea 
            value={localData.summary} 
            onChange={(e) => handleFieldChange("summary", e.target.value)} 
            style={{ 
              ...inputStyle, 
              minHeight: "80px" 
            }} 
          />
        ) : (
          <p 
            style={{ 
              fontSize: "0.9rem", 
              color: "#374151", 
              lineHeight: 1.6, 
              textAlign: "justify" 
            }}
          >
            {localData.summary}
          </p>
        )}
      </section>
    ),

    education: hasContent(localData, "education", editMode) && (
      <section 
        key="education" 
        style={editBoxStyle}
      >
        <div style={sectionHeadingStyle}>
            Education
            {editMode && (
              <button 
                onClick={() => addItem("education", {
                  degree: "", 
                  institution: "", 
                  duration: ""
                })} 
                style={{
                  fontSize: "11px", 
                  padding: "2px 8px", 
                  background: "#111827", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px"
                }}
              >
                +
              </button>
            )}
        </div>
        <hr style={sectionDividerStyle} />
        {(localData.education || []).map((edu, idx) => (
          <div 
            key={idx} 
            style={{ marginBottom: "1rem" }}
          >
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input 
                  style={inputStyle} 
                  value={renderSafe(edu.institution)} 
                  onChange={(e) => handleArrayUpdate("education", idx, e.target.value, "institution")} 
                  placeholder="Institution" 
                />
                <input 
                  style={inputStyle} 
                  value={renderSafe(edu.degree)} 
                  onChange={(e) => handleArrayUpdate("education", idx, e.target.value, "degree")} 
                  placeholder="Degree" 
                />
                <button 
                  onClick={() => removeItem("education", idx)} 
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
              <>
                <p 
                  style={{ 
                    fontSize: "0.85rem", 
                    color: "#4b5563", 
                    marginBottom: "0.1rem" 
                  }}
                >
                  {renderSafe(edu.institution)} {edu.duration && `| ${edu.duration}`}
                </p>
                <p 
                  style={{ 
                    fontSize: "0.9rem", 
                    fontWeight: 600 
                  }}
                >
                  {renderSafe(edu.degree)}
                </p>
              </>
            )}
          </div>
        ))}
      </section>
    ),

    experience: hasContent(localData, "experience", editMode) && (
      <section 
        key="experience" 
        style={editBoxStyle}
      >
        <div style={sectionHeadingStyle}>
            Work Experience
            {editMode && (
              <button 
                onClick={() => addItem("experience", {
                  title: "", 
                  companyName: "", 
                  description: "", 
                  date: ""
                })} 
                style={{
                  fontSize: "11px", 
                  padding: "2px 8px", 
                  background: "#111827", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px"
                }}
              >
                +
              </button>
            )}
        </div>
        <hr style={sectionDividerStyle} />
        {(localData.experience || []).map((exp, idx) => (
          <div 
            key={idx} 
            style={{ marginBottom: "1rem" }}
          >
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input 
                  style={inputStyle} 
                  value={renderSafe(exp.companyName)} 
                  onChange={(e) => handleArrayUpdate("experience", idx, e.target.value, "companyName")} 
                  placeholder="Company" 
                />
                <input 
                  style={inputStyle} 
                  value={renderSafe(exp.title)} 
                  onChange={(e) => handleArrayUpdate("experience", idx, e.target.value, "title")} 
                  placeholder="Title" 
                />
                <textarea 
                  style={inputStyle} 
                  value={renderSafe(exp.description)} 
                  onChange={(e) => handleArrayUpdate("experience", idx, e.target.value, "description")} 
                  placeholder="Description" 
                />
                <button 
                  onClick={() => removeItem("experience", idx)} 
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
              <>
                <p 
                  style={{ 
                    fontSize: "0.85rem", 
                    color: "#4b5563", 
                    marginBottom: "0.1rem" 
                  }}
                >
                  {renderSafe(exp.companyName)} {exp.date && `| ${exp.date}`}
                </p>
                <p 
                  style={{ 
                    fontSize: "0.9rem", 
                    fontWeight: 600 
                  }}
                >
                  {renderSafe(exp.title)}
                </p>
                <p 
                  style={{ 
                    fontSize: "0.85rem", 
                    color: "#374151", 
                    marginTop: "5px" 
                  }}
                >
                  {renderSafe(exp.description)}
                </p>
              </>
            )}
          </div>
        ))}
      </section>
    ),

    skills: hasContent(localData, "skills", editMode) && (
      <section 
        key="skills" 
        style={editBoxStyle}
      >
        <div style={sectionHeadingStyle}>
            Skills
            {editMode && (
              <button 
                onClick={() => addItem("skills", "")} 
                style={{
                  fontSize: "11px", 
                  padding: "2px 8px", 
                  background: "#111827", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px"
                }}
              >
                +
              </button>
            )}
        </div>
        <hr style={sectionDividerStyle} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {(localData.skills || []).map((skill, idx) => (
            <div 
              key={idx} 
              style={{ 
                background: "#f3f4f6", 
                padding: "4px 10px", 
                borderRadius: "4px", 
                fontSize: "0.85rem" 
              }}
            >
              {editMode ? (
                <input 
                  style={{
                    border: "none", 
                    background: "transparent", 
                    width: "70px"
                  }} 
                  value={renderSafe(skill)} 
                  onChange={(e) => handleArrayUpdate("skills", idx, e.target.value)} 
                />
              ) : (
                <span>• {renderSafe(skill)}</span>
              )}
              {editMode && (
                <button 
                  onClick={() => removeItem("skills", idx)} 
                  style={{ 
                    border: "none", 
                    color: "red", 
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
      </section>
    ),

    projects: hasContent(localData, "projects", editMode) && (
      <section 
        key="projects" 
        style={editBoxStyle}
      >
        <div style={sectionHeadingStyle}>
            Projects
            {editMode && (
              <button 
                onClick={() => addItem("projects", {
                  name: "", 
                  description: ""
                })} 
                style={{
                  fontSize: "11px", 
                  padding: "2px 8px", 
                  background: "#111827", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px"
                }}
              >
                +
              </button>
            )}
        </div>
        <hr style={sectionDividerStyle} />
        {(localData.projects || []).map((proj, idx) => (
          <div 
            key={idx} 
            style={{ marginBottom: "1rem" }}
          >
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input 
                  style={inputStyle} 
                  value={renderSafe(proj.name)} 
                  onChange={(e) => handleArrayUpdate("projects", idx, e.target.value, "name")} 
                  placeholder="Project Name" 
                />
                <textarea 
                  style={inputStyle} 
                  value={renderSafe(proj.description)} 
                  onChange={(e) => handleArrayUpdate("projects", idx, e.target.value, "description")} 
                  placeholder="Description" 
                />
                <button 
                  onClick={() => removeItem("projects", idx)} 
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
              <>
                <p 
                  style={{ 
                    fontSize: "0.9rem", 
                    fontWeight: 600 
                  }}
                >
                  {renderSafe(proj.name)}
                </p>
                <p 
                  style={{ 
                    fontSize: "0.85rem", 
                    color: "#374151" 
                  }}
                >
                  {renderSafe(proj.description)}
                </p>
              </>
            )}
          </div>
        ))}
      </section>
    ),

    certifications: hasContent(localData, "certifications", editMode) && (
      <section 
        key="certifications" 
        style={editBoxStyle}
      >
        <div style={sectionHeadingStyle}>
            Certifications
            {editMode && (
              <button 
                onClick={() => addItem("certifications", {title:""})} 
                style={{
                  fontSize: "11px", 
                  padding: "2px 8px", 
                  background: "#111827", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px"
                }}
              >
                +
              </button>
            )}
        </div>
        <hr style={sectionDividerStyle} />
        {(localData.certifications || []).map((cert, idx) => (
          <div 
            key={idx} 
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
                  onChange={(e) => handleArrayUpdate("certifications", idx, e.target.value, "title")} 
                />
            ) : (
              <p>• {renderSafe(cert.title)}</p>
            )}
            {editMode && (
              <button 
                onClick={() => removeItem("certifications", idx)} 
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
      </section>
    ),

    achievements: hasContent(localData, "achievements", editMode) && (
        <section 
          key="achievements" 
          style={editBoxStyle}
        >
          <div style={sectionHeadingStyle}>
              Achievements
              {editMode && (
                <button 
                  onClick={() => addItem("achievements", "")} 
                  style={{
                    fontSize: "11px", 
                    padding: "2px 8px", 
                    background: "#111827", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "4px"
                  }}
                >
                  +
                </button>
              )}
          </div>
          <hr style={sectionDividerStyle} />
          {(localData.achievements || []).map((ach, idx) => (
            <div 
              key={idx} 
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
                    onChange={(e) => handleArrayUpdate("achievements", idx, e.target.value)} 
                  />
              ) : (
                <p>• {renderSafe(ach)}</p>
              )}
              {editMode && (
                <button 
                  onClick={() => removeItem("achievements", idx)} 
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
        </section>
      ),

    languages: hasContent(localData, "languages", editMode) && (
      <section 
        key="languages" 
        style={editBoxStyle}
      >
        <h2 style={sectionHeadingStyle}>
          Languages
        </h2>
        <hr style={sectionDividerStyle} />
        {editMode ? (
          <input 
            style={inputStyle} 
            value={localData.languages?.join(", ")} 
            onChange={(e) => handleFieldChange("languages", e.target.value.split(","))} 
          />
        ) : (
          <p style={{ fontSize: "0.9rem" }}>
            {localData.languages?.join(", ")}
          </p>
        )}
      </section>
    ),

    interests: hasContent(localData, "interests", editMode) && (
      <section 
        key="interests" 
        style={editBoxStyle}
      >
        <h2 style={sectionHeadingStyle}>
          Interests
        </h2>
        <hr style={sectionDividerStyle} />
        {editMode ? (
          <input 
            style={inputStyle} 
            value={localData.interests?.join(", ")} 
            onChange={(e) => handleFieldChange("interests", e.target.value.split(","))} 
          />
        ) : (
          <p style={{ fontSize: "0.9rem" }}>
            {localData.interests?.join(", ")}
          </p>
        )}
      </section>
    ),
  };

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        backgroundColor: "#f3f4f6" 
      }}
    >
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar 
          resumeRef={resumeRef} 
          onDownload={handleDownload} 
        />
        <div 
          style={{ 
            flexGrow: 1, 
            padding: "1.5rem 0.75rem", 
            marginTop: "4rem", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center" 
          }}
        >
          <div 
            ref={resumeRef} 
            style={{ 
              backgroundColor: "#ffffff", 
              color: "#111827", 
              width: "794px", 
              padding: "3rem", 
              boxShadow: "0 20px 45px -30px rgba(15,23,42,0.8)", 
              boxSizing: "border-box" 
            }}
          >
            
            {/* HEADER */}
            <div 
              style={{ 
                textAlign: "center", 
                marginBottom: "2rem" 
              }}
            >
              {editMode ? (
                <div style={{ display: "grid", gap: "10px" }}>
                  <input 
                    value={localData.name} 
                    onChange={(e) => handleFieldChange("name", e.target.value)} 
                    style={{ 
                      fontSize: "2rem", 
                      fontWeight: 800, 
                      textAlign: "center" 
                    }} 
                    placeholder="Full Name" 
                  />
                  <input 
                    value={localData.role} 
                    onChange={(e) => handleFieldChange("role", e.target.value)} 
                    style={{ 
                      fontSize: "1.1rem", 
                      textAlign: "center", 
                      color: "#4b5563" 
                    }} 
                    placeholder="Job Title" 
                  />
                  <div 
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr", 
                      gap: "10px" 
                    }}
                  >
                    <input 
                      value={localData.phone} 
                      onChange={(e) => handleFieldChange("phone", e.target.value)} 
                      placeholder="Phone" 
                    />
                    <input 
                      value={localData.email} 
                      onChange={(e) => handleFieldChange("email", e.target.value)} 
                      placeholder="Email" 
                    />
                    <input 
                      value={localData.linkedin} 
                      onChange={(e) => handleFieldChange("linkedin", e.target.value)} 
                      placeholder="LinkedIn" 
                    />
                    <input 
                      value={localData.github} 
                      onChange={(e) => handleFieldChange("github", e.target.value)} 
                      placeholder="GitHub" 
                    />
                    <input 
                      value={localData.portfolio} 
                      onChange={(e) => handleFieldChange("portfolio", e.target.value)} 
                      placeholder="Portfolio" 
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 
                    style={{ 
                      fontSize: "2.2rem", 
                      fontWeight: 800, 
                      textTransform: "uppercase", 
                      margin: 0 
                    }}
                  >
                    {localData.name || "Your Name"}
                  </h1>
                  <p 
                    style={{ 
                      fontSize: "1.05rem", 
                      color: "#4b5563", 
                      marginTop: "5px" 
                    }}
                  >
                    {localData.role || "Job Title"}
                  </p>
                  <div 
                    style={{ 
                      display: "flex", 
                      justifyContent: "center", 
                      flexWrap: "wrap", 
                      gap: "0.8rem", 
                      marginTop: "10px", 
                      fontSize: "0.85rem", 
                      color: "#2563eb" 
                    }}
                  >
                    {localData.phone && (
                      <a 
                        href={getSafeUrl("phone", localData.phone)} 
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        📞 {localData.phone}
                      </a>
                    )}
                    {localData.email && (
                      <a 
                        href={getSafeUrl("email", localData.email)} 
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        ✉️ {localData.email}
                      </a>
                    )}
                    {localData.linkedin && (
                      <a 
                        href={getSafeUrl("linkedin", localData.linkedin)} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: "inherit" }}
                      >
                        🔗 LinkedIn
                      </a>
                    )}
                    {localData.github && (
                      <a 
                        href={getSafeUrl("github", localData.github)} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: "inherit" }}
                      >
                        🐙 GitHub
                      </a>
                    )}
                    {localData.portfolio && (
                      <a 
                        href={getSafeUrl("portfolio", localData.portfolio)} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: "inherit" }}
                      >
                        🌐 Portfolio
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 🔹 DYNAMIC BODY: REORDERS LIVE BASED ON CONTEXT 🔹 */}
            <div>
              {(sectionOrder || []).map((key) => sectionComponents[key] || null)}
            </div>

            {/* ACTIONS */}
            <div 
              data-html2canvas-ignore="true" 
              style={{ 
                marginTop: "3rem", 
                textAlign: "center" 
              }}
            >
              {editMode ? (
                <>
                  <button 
                    onClick={handleSave} 
                    style={{ 
                      backgroundColor: "#10b981", 
                      color: "white", 
                      padding: "0.75rem 2rem", 
                      borderRadius: "6px", 
                      border: "none", 
                      cursor: "pointer", 
                      fontWeight: "bold", 
                      marginRight: "10px" 
                    }}
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleCancel} 
                    style={{ 
                      backgroundColor: "#ef4444", 
                      color: "white", 
                      padding: "0.75rem 2rem", 
                      borderRadius: "6px", 
                      border: "none", 
                      cursor: "pointer", 
                      fontWeight: "bold" 
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setEditMode(true)} 
                  style={{ 
                    backgroundColor: "#3b82f6", 
                    color: "white", 
                    padding: "0.8rem 3rem", 
                    borderRadius: "8px", 
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

export default Template2;