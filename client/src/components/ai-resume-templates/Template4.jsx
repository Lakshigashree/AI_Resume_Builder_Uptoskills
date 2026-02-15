/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import html2pdf from "html2pdf.js";
import { toast } from 'react-toastify';

// 🔹 Helpers from config
import { getSafeUrl } from "../../utils/ResumeConfig";

const DEFAULT_RESUME = {
  name: "", role: "", phone: "", email: "", location: "",
  linkedin: "", github: "", portfolio: "", summary: "",
  skills: [], experience: [], education: [], projects: [],
  certifications: [], achievements: [], languages: [], interests: [],
};

const safeArray = (v) => (Array.isArray(v) ? v : []);

const normalizeData = (raw) => {
  const data = { ...DEFAULT_RESUME, ...(raw || {}) };
  // Basic cleaning to prevent object-as-child crashes
  data.skills = safeArray(data.skills).map(s => typeof s === 'string' ? s : (s.name || ""));
  data.achievements = safeArray(data.achievements).map(a => typeof a === 'string' ? a : (a.title || ""));
  return data;
};

const Template4 = () => {
  const resumeRef = useRef(null);
  const { resumeData, updateResumeData, sectionOrder } = useResume();

  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(() => normalizeData(resumeData || {}));

  useEffect(() => {
    if (resumeData) setLocalData(normalizeData(resumeData));
  }, [resumeData]);

  // ---------- HANDLERS ----------

  const handleFieldChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayUpdate = (section, index, value, key = null) => {
    const updated = [...(localData[section] || [])];
    if (updated[index] !== undefined) {
      if (key) updated[index] = { ...updated[index], [key]: value };
      else updated[index] = value;
      setLocalData(prev => ({ ...prev, [section]: updated }));
    }
  };

  const addItem = (section, template) => {
    setLocalData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), template]
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
    setLocalData(normalizeData(resumeData));
    setEditMode(false);
  };

  const handleDownload = () => {
    const options = {
      margin: 10,
      filename: `${localData.name || 'resume'}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, width: 794 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      enableLinks: true
    };
    html2pdf().set(options).from(resumeRef.current).save();
  };

  const renderSafe = (val) => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    return val.title || val.name || val.degree || "";
  };

  const hasContent = (key) => {
    if (editMode) return true;
    const val = localData[key];
    if (Array.isArray(val)) return val.length > 0;
    return val && val.trim().length > 0;
  };

  // ---------- STYLES ----------
  const styles = {
    sectionTitle: { fontSize: "18px", fontWeight: 600, color: "#00796b", textTransform: "uppercase", borderBottom: "2px solid #b2dfdb", paddingBottom: "6px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    editRow: { background: "#f0fdfa", border: "1px dashed #14b8a6", padding: "15px", borderRadius: "8px", marginBottom: "15px" },
    input: { border: "1px solid #ccc", padding: "8px", marginBottom: "8px", borderRadius: "4px", width: "100%" },
    pill: { backgroundColor: "#00796b", color: "#fff", padding: "6px 12px", borderRadius: "20px", fontSize: "13px" }
  };

  // --- 🔹 DYNAMIC SECTION COMPONENTS MAP 🔹 ---
  const sectionComponents = {
    summary: hasContent("summary") && (
      <div key="summary" style={{ marginBottom: 25, padding: 20, borderRadius: 10, background: "linear-gradient(to right, #e0f7fa, #ffffff)" }}>
        <h3 style={{ ...styles.sectionTitle, borderBottom: "1px solid #ccc" }}>Professional Summary</h3>
        {editMode ? (
          <textarea style={{ ...styles.input, minHeight: 100 }} value={localData.summary} onChange={(e) => handleFieldChange("summary", e.target.value)} />
        ) : <p style={{ margin: 0, lineHeight: 1.6 }}>{localData.summary}</p>}
      </div>
    ),

    experience: hasContent("experience") && (
      <div key="experience" style={{ marginBottom: 25 }}>
        <div style={styles.sectionTitle}>
          Experience
          {editMode && <button onClick={() => addItem("experience", { title: "", companyName: "", date: "", description: "" })} style={{ fontSize: 12, padding: "2px 8px", cursor: "pointer" }}>+</button>}
        </div>
        {safeArray(localData.experience).map((exp, i) => (
          <div key={i} style={editMode ? styles.editRow : { marginBottom: 16 }}>
            {editMode ? (
              <>
                <input style={styles.input} value={renderSafe(exp.title)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "title")} placeholder="Job Title" />
                <input style={styles.input} value={renderSafe(exp.companyName)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "companyName")} placeholder="Company" />
                <textarea style={styles.input} value={renderSafe(exp.description)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "description")} placeholder="Description" />
                <button onClick={() => removeItem("experience", i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>Remove Block</button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}><span>{renderSafe(exp.title)}</span><span>{exp.date}</span></div>
                <div style={{ fontStyle: "italic", color: "#555" }}>{renderSafe(exp.companyName)}</div>
                <p style={{ fontSize: "0.95rem", marginTop: 5 }}>{renderSafe(exp.description)}</p>
              </>
            )}
          </div>
        ))}
      </div>
    ),

    education: hasContent("education") && (
      <div key="education" style={{ marginBottom: 25 }}>
        <div style={styles.sectionTitle}>
          Education
          {editMode && <button onClick={() => addItem("education", { degree: "", institution: "", duration: "" })} style={{ fontSize: 12, padding: "2px 8px", cursor: "pointer" }}>+</button>}
        </div>
        {safeArray(localData.education).map((edu, i) => (
          <div key={i} style={editMode ? styles.editRow : { marginBottom: 12 }}>
            {editMode ? (
              <>
                <input style={styles.input} value={renderSafe(edu.degree)} onChange={(e) => handleArrayUpdate("education", i, e.target.value, "degree")} placeholder="Degree" />
                <input style={styles.input} value={renderSafe(edu.institution)} onChange={(e) => handleArrayUpdate("education", i, e.target.value, "institution")} placeholder="School" />
                <button onClick={() => removeItem("education", i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>Remove</button>
              </>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><strong>{renderSafe(edu.degree)}</strong>, {renderSafe(edu.institution)}</span>
                <span>{edu.duration}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    ),

    skills: hasContent("skills") && (
      <div key="skills" style={{ marginBottom: 25 }}>
        <div style={styles.sectionTitle}>
          Skills
          {editMode && <button onClick={() => addItem("skills", "")} style={{ fontSize: 12, padding: "2px 8px", cursor: "pointer" }}>+</button>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {safeArray(localData.skills).map((skill, i) => (
            <div key={i} style={editMode ? { border: "1px solid #ccc", padding: "2px 5px" } : styles.pill}>
              {editMode ? (
                <input style={{ border: "none", background: "transparent", width: 80 }} value={renderSafe(skill)} onChange={(e) => handleArrayUpdate("skills", i, e.target.value)} />
              ) : renderSafe(skill)}
              {editMode && <button onClick={() => removeItem("skills", i)} style={{ color: "red", border: "none", background: "none", marginLeft: "5px", cursor: "pointer" }}>×</button>}
            </div>
          ))}
        </div>
      </div>
    ),

    projects: hasContent("projects") && (
      <div key="projects" style={{ marginBottom: 25 }}>
        <div style={styles.sectionTitle}>
          Projects
          {editMode && <button onClick={() => addItem("projects", { name: "", description: "" })} style={{ fontSize: 12, padding: "2px 8px", cursor: "pointer" }}>+</button>}
        </div>
        {safeArray(localData.projects).map((p, i) => (
          <div key={i} style={editMode ? styles.editRow : { marginBottom: 12 }}>
            {editMode ? (
              <>
                <input style={styles.input} value={renderSafe(p.name)} onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "name")} />
                <textarea style={styles.input} value={renderSafe(p.description)} onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "description")} />
                <button onClick={() => removeItem("projects", i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>Remove</button>
              </>
            ) : (
              <div><strong>{renderSafe(p.name)}</strong>: {renderSafe(p.description)}</div>
            )}
          </div>
        ))}
      </div>
    ),

    certifications: hasContent("certifications") && (
      <div key="certifications" style={{ marginBottom: 25 }}>
        <div style={styles.sectionTitle}>
          Certifications
          {editMode && <button onClick={() => addItem("certifications", { title: "" })} style={{ fontSize: 12, padding: "2px 8px", cursor: "pointer" }}>+</button>}
        </div>
        {safeArray(localData.certifications).map((cert, i) => (
          <div key={i} style={editMode ? styles.editRow : { marginBottom: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {editMode ? (
              <>
                <input style={{ ...styles.input, marginBottom: 0 }} value={renderSafe(cert.title)} onChange={(e) => handleArrayUpdate("certifications", i, e.target.value, "title")} />
                <button onClick={() => removeItem("certifications", i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginLeft: 10 }}>✕</button>
              </>
            ) : <div>• {renderSafe(cert.title)}</div>}
          </div>
        ))}
      </div>
    ),

    achievements: hasContent("achievements") && (
      <div key="achievements" style={{ marginBottom: 25 }}>
        <div style={styles.sectionTitle}>
          Achievements
          {editMode && <button onClick={() => addItem("achievements", "")} style={{ fontSize: 12, padding: "2px 8px", cursor: "pointer" }}>+</button>}
        </div>
        {safeArray(localData.achievements).map((ach, i) => (
          <div key={i} style={editMode ? styles.editRow : { marginBottom: 5 }}>
            {editMode ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <input style={{ ...styles.input, marginBottom: 0 }} value={renderSafe(ach)} onChange={(e) => handleArrayUpdate("achievements", i, e.target.value)} />
                <button onClick={() => removeItem("achievements", i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginLeft: 10 }}>✕</button>
              </div>
            ) : <div>• {renderSafe(ach)}</div>}
          </div>
        ))}
      </div>
    ),

    languages: hasContent("languages") && (
      <div key="languages" style={{ marginBottom: 25 }}>
        <h3 style={styles.sectionTitle}>Languages</h3>
        {editMode ? (
          <input style={styles.input} value={localData.languages?.join(", ")} onChange={(e) => handleFieldChange("languages", e.target.value.split(","))} />
        ) : <p>{localData.languages?.join(" • ")}</p>}
      </div>
    ),

    interests: hasContent("interests") && (
      <div key="interests" style={{ marginBottom: 25 }}>
        <h3 style={styles.sectionTitle}>Interests</h3>
        {editMode ? (
          <input style={styles.input} value={localData.interests?.join(", ")} onChange={(e) => handleFieldChange("interests", e.target.value.split(","))} />
        ) : <p>{localData.interests?.join(" • ")}</p>}
      </div>
    ),
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onDownload={handleDownload} resumeRef={resumeRef} />
        <div style={{ flexGrow: 1, padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div ref={resumeRef} style={{ backgroundColor: "#fff", width: "794px", minHeight: "1123px", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderRadius: "10px", boxSizing: "border-box" }}>
            
            {/* HEADER */}
            <div style={{ textAlign: "center", marginBottom: 20, borderBottom: `2px solid #14b8a6`, paddingBottom: 20, background: "linear-gradient(to right, #e0f7fa, #ffffff)", borderRadius: 10, paddingTop: 20 }}>
              {editMode ? (
                <div style={{ display: "grid", gap: 10, padding: "0 20px" }}>
                  <input style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }} value={localData.name} onChange={(e) => handleFieldChange("name", e.target.value)} />
                  <input style={{ fontSize: 18, color: "#14b8a6", textAlign: "center" }} value={localData.role} onChange={(e) => handleFieldChange("role", e.target.value)} />
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: 30, fontWeight: "bold", color: "#1e293b", textTransform: "uppercase" }}>{localData.name}</h1>
                  <h2 style={{ fontSize: 20, color: "#14b8a6", textTransform: "uppercase" }}>{localData.role}</h2>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 15, marginTop: 15, fontSize: 14 }}>
                {['phone', 'email', 'linkedin', 'github', 'portfolio'].map(key => (
                  <div key={key}>
                    {editMode ? (
                      <input style={{ width: 100, fontSize: 12 }} value={localData[key]} onChange={(e) => handleFieldChange(key, e.target.value)} placeholder={key} />
                    ) : (
                      localData[key] && <a href={getSafeUrl(key, localData[key])} style={{ textDecoration: "none", color: "inherit" }}>{localData[key]}</a>
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
            <div data-html2canvas-ignore="true" style={{ textAlign: "center", marginTop: 30 }}>
              {editMode ? (
                <>
                  <button onClick={handleSave} style={{ background: "#14b8a6", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 5, marginRight: 10, cursor: "pointer" }}>Save Changes</button>
                  <button onClick={handleCancel} style={{ background: "#6b7280", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 5, cursor: "pointer" }}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)} style={{ background: "#14b8a6", color: "#fff", padding: "10px 40px", border: "none", borderRadius: 5, cursor: "pointer" }}>Edit Resume</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template4;