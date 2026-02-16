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

// 🔹 Helpers from config
import { 
  hasContent, 
  getSafeUrl 
} from "../../utils/ResumeConfig";

const PRINT_CSS = `
@page { size: A4; margin: 15mm; }
@media print {
  html, body { height: auto; -webkit-print-color-adjust: exact; }
  .resume-card { 
    box-shadow: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 12mm !important;
    background: #fff !important;
  }
  .no-print { display: none !important; }
  a { color: inherit !important; text-decoration: none !important; }
}
`;

const safeArray = (v) => (Array.isArray(v) ? v : []);

const Template7 = () => {
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
    setLocalData(prev => ({ 
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

  const normalizeUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();
    return trimmed.startsWith("http") ? trimmed : "https://" + trimmed;
  };

  // --- STYLES ---
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f9fafb"
    },
    card: {
      backgroundColor: "#ffffff",
      color: "#1f2937",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "2.5rem",
      boxSizing: "border-box"
    },
    sectionHeader: { 
      fontSize: "1.25rem", 
      fontWeight: 700, 
      color: "#111827", 
      borderBottom: "2px solid #e5e7eb", 
      paddingBottom: "0.5rem", 
      marginBottom: "1rem", 
      display: "flex", 
      justifyContent: "space-between",
      alignItems: "center", 
      textTransform: "uppercase"
    },
    editBox: { 
      border: "1px dashed #3b82f6", 
      background: "#f9fafb", 
      padding: "15px", 
      borderRadius: "8px", 
      marginBottom: "1.5rem" 
    },
    input: { 
      width: "100%", 
      padding: "8px", 
      border: "1px solid #d1d5db", 
      borderRadius: "4px", 
      marginBottom: "5px" 
    }
  };

  // --- 🔹 DYNAMIC SECTION COMPONENTS MAP 🔹 ---
  const sectionComponents = {
    summary: hasContent(localData, "summary", editMode) && (
      <div 
        key="summary" 
        style={editMode ? styles.editBox : { marginBottom: "2rem" }}
      >
        <h3 style={styles.sectionHeader}>
          About Me
        </h3>
        {editMode ? (
          <textarea 
            style={{ ...styles.input, minHeight: "100px" }} 
            value={localData.summary} 
            onChange={(e) => handleFieldChange("summary", e.target.value)} 
          />
        ) : (
          <p style={{ lineHeight: "1.6", color: "#374151" }}>
            {localData.summary}
          </p>
        )}
      </div>
    ),

    experience: hasContent(localData, "experience", editMode) && (
      <div 
        key="experience" 
        style={editMode ? styles.editBox : { marginBottom: "2rem" }}
      >
        <div style={styles.sectionHeader}>
          Experience
          {editMode && (
            <button 
              onClick={() => addItem("experience", {title:"", companyName:"", date:"", description:""})} 
              style={{
                fontSize:"11px", 
                background:"#111827", 
                color:"white", 
                border:"none", 
                padding:"2px 8px", 
                borderRadius:"4px"
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
                  style={styles.input} 
                  value={renderSafe(exp.title)} 
                  onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "title")} 
                  placeholder="Job Title" 
                />
                <input 
                  style={styles.input} 
                  value={renderSafe(exp.companyName)} 
                  onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "companyName")} 
                  placeholder="Company" 
                />
                <textarea 
                  style={styles.input} 
                  value={renderSafe(exp.description)} 
                  onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "description")} 
                  placeholder="Description" 
                />
                <button 
                  onClick={() => removeItem("experience", i)} 
                  style={{
                    color:"red", 
                    background:"none", 
                    border:"none", 
                    textAlign:"left", 
                    fontSize:"0.7rem"
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {renderSafe(exp.title)}
                </div>
                <div style={{ color: "#6b7280", fontStyle: "italic" }}>
                  {renderSafe(exp.companyName)} | {exp.date}
                </div>
                <p style={{ marginTop: "5px", fontSize: "0.95rem" }}>
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
        style={editMode ? styles.editBox : { marginBottom: "2rem" }}
      >
        <div style={styles.sectionHeader}>
          Education
          {editMode && (
            <button 
              onClick={() => addItem("education", {degree:"", institution:"", duration:""})} 
              style={{
                fontSize:"11px", 
                background:"#111827", 
                color:"white", 
                border:"none", 
                padding:"2px 8px", 
                borderRadius:"4px"
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
                  style={styles.input} 
                  value={renderSafe(edu.degree)} 
                  onChange={(e) => handleArrayUpdate("education", i, e.target.value, "degree")} 
                  placeholder="Degree" 
                />
                <input 
                  style={styles.input} 
                  value={renderSafe(edu.institution)} 
                  onChange={(e) => handleArrayUpdate("education", i, e.target.value, "institution")} 
                  placeholder="School" 
                />
                <button 
                  onClick={() => removeItem("education", i)} 
                  style={{
                    color:"red", 
                    background:"none", 
                    border:"none", 
                    textAlign:"left", 
                    fontSize:"0.7rem"
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{renderSafe(edu.degree)}</strong> from {renderSafe(edu.institution)}
                </div>
                <div style={{ color: "#6b7280" }}>
                  {edu.duration}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    ),

    skills: hasContent(localData, "skills", editMode) && (
      <div 
        key="skills" 
        style={editMode ? styles.editBox : { marginBottom: "2rem" }}
      >
        <div style={styles.sectionHeader}>
          Skills
          {editMode && (
            <button 
              onClick={() => addItem("skills", "")} 
              style={{
                fontSize:"11px", 
                background:"#111827", 
                color:"white", 
                border:"none", 
                padding:"2px 8px", 
                borderRadius:"4px"
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
                background: "#f3f4f6", 
                padding: "4px 10px", 
                borderRadius: "4px", 
                fontSize: "0.85rem", 
                display: "flex", 
                alignItems: "center", 
                gap: "5px" 
              }}
            >
              {editMode ? (
                <input 
                  style={{ border: "none", background: "transparent", width: "70px" }} 
                  value={renderSafe(s)} 
                  onChange={(e) => handleArrayUpdate("skills", i, e.target.value)} 
                />
              ) : (
                renderSafe(s)
              )}
              {editMode && (
                <span 
                  onClick={() => removeItem("skills", i)} 
                  style={{ color: "red", cursor: "pointer" }}
                >
                  ×
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    projects: hasContent(localData, "projects", editMode) && (
      <div 
        key="projects" 
        style={editMode ? styles.editBox : { marginBottom: "2rem" }}
      >
        <div style={styles.sectionHeader}>
          Projects
          {editMode && (
            <button 
              onClick={() => addItem("projects", {name:"", description:""})} 
              style={{
                fontSize:"11px", 
                background:"#111827", 
                color:"white", 
                border:"none", 
                padding:"2px 8px", 
                borderRadius:"4px"
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
                  style={styles.input} 
                  value={renderSafe(p.name)} 
                  onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "name")} 
                />
                <textarea 
                  style={styles.input} 
                  value={renderSafe(p.description)} 
                  onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "description")} 
                />
                <button 
                  onClick={() => removeItem("projects", i)} 
                  style={{
                    color:"red", 
                    background:"none", 
                    border:"none", 
                    textAlign:"left", 
                    fontSize:"0.7rem"
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <strong>{renderSafe(p.name)}</strong>: {renderSafe(p.description)}
              </div>
            )}
          </div>
        ))}
      </div>
    ),

    certifications: hasContent(localData, "certifications", editMode) && (
      <div 
        key="certifications" 
        style={editMode ? styles.editBox : { marginBottom: "2rem" }}
      >
        <div style={styles.sectionHeader}>
          Certifications
          {editMode && (
            <button 
              onClick={() => addItem("certifications", {title:""})} 
              style={{
                fontSize:"11px", 
                background:"#111827", 
                color:"white", 
                border:"none", 
                padding:"2px 8px", 
                borderRadius:"4px"
              }}
            >
              +
            </button>
          )}
        </div>
        {safeArray(localData.certifications).map((c, i) => (
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
                style={styles.input} 
                value={renderSafe(c.title)} 
                onChange={(e) => handleArrayUpdate("certifications", i, e.target.value, "title")} 
              />
            ) : (
              <div>• {renderSafe(c.title)}</div>
            )}
            {editMode && (
              <span 
                onClick={() => removeItem("certifications", i)} 
                style={{ color: "red", cursor: "pointer" }}
              >
                ×
              </span>
            )}
          </div>
        ))}
      </div>
    ),

    achievements: hasContent(localData, "achievements", editMode) && (
      <div 
        key="achievements" 
        style={editMode ? styles.editBox : { marginBottom: "2rem" }}
      >
        <div style={styles.sectionHeader}>
          Achievements
          {editMode && (
            <button 
              onClick={() => addItem("achievements", "")} 
              style={{
                fontSize:"11px", 
                background:"#111827", 
                color:"white", 
                border:"none", 
                padding:"2px 8px", 
                borderRadius:"4px"
              }}
            >
              +
            </button>
          )}
        </div>
        {safeArray(localData.achievements).map((a, i) => (
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
                style={styles.input} 
                value={renderSafe(a)} 
                onChange={(e) => handleArrayUpdate("achievements", i, e.target.value)} 
              />
            ) : (
              <li>{renderSafe(a)}</li>
            )}
            {editMode && (
              <span 
                onClick={() => removeItem("achievements", i)} 
                style={{ color: "red", cursor: "pointer" }}
              >
                ×
              </span>
            )}
          </div>
        ))}
      </div>
    ),

    languages: hasContent(localData, "languages", editMode) && (
      <div 
        key="languages" 
        style={editMode ? styles.editBox : { marginBottom: "2rem" }}
      >
        <h3 style={styles.sectionHeader}>Languages</h3>
        {editMode ? (
          <input 
            style={styles.input} 
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
        style={editMode ? styles.editBox : { marginBottom: "2rem" }}
      >
        <h3 style={styles.sectionHeader}>Interests</h3>
        {editMode ? (
          <input 
            style={styles.input} 
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
    <div style={styles.container}>
      <style>{PRINT_CSS}</style>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar 
          resumeRef={resumeRef} 
          onDownload={handleDownload} 
        />
        <div 
          style={{ 
            flexGrow: 1, 
            padding: "2rem", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center" 
          }}
        >
          <div 
            ref={resumeRef} 
            className="resume-card" 
            style={{ 
              ...styles.card, 
              width: "794px", 
              minHeight: "1123px" 
            }}
          >
            
            {/* HEADER */}
            <div 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                marginBottom: "2rem", 
                borderBottom: "4px solid #111827", 
                paddingBottom: "1.5rem" 
              }}
            >
              <div style={{ flex: 1 }}>
                {editMode ? (
                  <div style={{ display: "grid", gap: "5px" }}>
                    <input 
                      style={{ ...styles.input, fontSize: "1.5rem", fontWeight: 700 }} 
                      value={localData.name} 
                      onChange={(e) => handleFieldChange("name", e.target.value)} 
                    />
                    <input 
                      style={styles.input} 
                      value={localData.role} 
                      onChange={(e) => handleFieldChange("role", e.target.value)} 
                    />
                  </div>
                ) : (
                  <>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0 }}>
                      {localData.name?.toUpperCase()}
                    </h1>
                    <h2 style={{ fontSize: "1.2rem", color: "#6b7280", margin: 0 }}>
                      {localData.role}
                    </h2>
                  </>
                )}
              </div>

              {/* CONTACT LINKS */}
              <div 
                style={{ 
                  textAlign: "right", 
                  fontSize: "0.9rem", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "4px" 
                }}
              >
                {['phone', 'email', 'linkedin', 'github', 'portfolio', 'location'].map(key => (
                  <div key={key}>
                    {editMode ? (
                      <input 
                        style={{ width: 150, fontSize: "0.8rem" }} 
                        value={localData[key]} 
                        onChange={(e) => handleFieldChange(key, e.target.value)} 
                        placeholder={key} 
                      />
                    ) : (
                      localData[key] && (
                        key === 'location' ? (
                          <span>{localData[key]}</span>
                        ) : (
                          <a 
                            href={getSafeUrl(key, localData[key])} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}
                          >
                            {localData[key]}
                          </a>
                        )
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DYNAMIC BODY */}
            <div>
              {(sectionOrder || []).map((key) => sectionComponents[key] || null)}
            </div>

            {/* ACTIONS */}
            <div 
              data-html2canvas-ignore="true" 
              style={{ textAlign: "center", marginTop: "2rem" }}
            >
              {editMode ? (
                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                  <button 
                    onClick={handleSave} 
                    style={{ 
                      background: "#10b981", 
                      color: "#fff", 
                      padding: "10px 25px", 
                      border: "none", 
                      borderRadius: "5px", 
                      cursor: "pointer" 
                    }}
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={handleCancel} 
                    style={{ 
                      background: "#6b7280", 
                      color: "#fff", 
                      padding: "10px 25px", 
                      border: "none", 
                      borderRadius: "5px", 
                      cursor: "pointer" 
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setEditMode(true)} 
                  style={{ 
                    background: "#3b82f6", 
                    color: "#fff", 
                    padding: "12px 50px", 
                    border: "none", 
                    borderRadius: "5px", 
                    cursor: "pointer", 
                    fontWeight: 600 
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

export default Template7;