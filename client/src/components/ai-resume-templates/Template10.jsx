/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import resumeService from "../../services/resumeService";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import { Plus, Trash2 } from "lucide-react";

const normalizeUrl = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return "https://" + trimmed;
};

const Template10 = () => {
  const resumeRef = useRef(null);
  const { resumeData, updateResumeData, sectionOrder } = useResume();
  const { isAuthenticated } = useAuth();
  const [editMode, setEditMode] = useState(false);
  
  const [localData, setLocalData] = useState(() => ({
    ...resumeData,
    skills: resumeData?.skills || [],
    experience: resumeData?.experience || [],
    education: resumeData?.education || [],
    projects: resumeData?.projects || [],
    certifications: resumeData?.certifications || [],
    achievements: resumeData?.achievements || [],
    languages: resumeData?.languages || [],
    interests: resumeData?.interests || []
  }));

  useEffect(() => {
    if (resumeData) setLocalData(JSON.parse(JSON.stringify(resumeData)));
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
      toast.success('✅ Changes Saved Successfully');
    } catch (error) {
      toast.error('❌ Failed to save');
    }
  };

  const handleCancel = () => {
    setLocalData(JSON.parse(JSON.stringify(resumeData)));
    setEditMode(false);
  };

  const handleDownload = () => {
    const options = {
      margin: 0.5,
      filename: `${localData.name || 'resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(options).from(resumeRef.current).save();
  };

  const renderSafe = (v) => (typeof v === 'string' ? v : (v?.title || v?.name || v?.degree || ""));

  const hasContent = (key) => {
    if (editMode) return true;
    const val = localData[key];
    if (Array.isArray(val)) return val.length > 0;
    return val && val.trim().length > 0;
  };

  // --- STYLES ---
  const styles = {
    sectionBox: { marginBottom: "2rem", padding: "0 2rem", position: "relative" },
    sectionTitle: { fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
    divider: { borderBottom: "1px solid #d1d5db", marginBottom: "1.5rem" },
    input: { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "8px" },
    editRow: { background: "#f8fafc", border: "1px dashed #cbd5e1", padding: "15px", borderRadius: "8px", marginBottom: "15px" }
  };

  // --- 🔹 DYNAMIC SECTION COMPONENTS MAP 🔹 ---
  const sectionComponents = {
    summary: hasContent("summary") && (
      <section key="summary" style={styles.sectionBox}>
        <h2 style={styles.sectionTitle}>Summary</h2>
        <div style={styles.divider}></div>
        {editMode ? (
          <textarea style={{ ...styles.input, minHeight: "100px" }} value={localData.summary} onChange={(e) => handleFieldChange("summary", e.target.value)} />
        ) : <p style={{ lineHeight: "1.6", color: "#374151" }}>{localData.summary}</p>}
      </section>
    ),

    experience: hasContent("experience") && (
      <section key="experience" style={styles.sectionBox}>
        <div style={styles.sectionTitle}>
          Experience
          {editMode && <button onClick={() => addItem("experience", { title: "", companyName: "", date: "", description: "" })} style={{ border: "none", background: "none", cursor: "pointer" }}><Plus size={20} /></button>}
        </div>
        <div style={styles.divider}></div>
        {(localData.experience || []).map((exp, i) => (
          <div key={i} style={editMode ? styles.editRow : { marginBottom: "1.5rem" }}>
            {editMode ? (
              <>
                <input style={styles.input} value={renderSafe(exp.title)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "title")} placeholder="Title" />
                <input style={styles.input} value={renderSafe(exp.companyName)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "companyName")} placeholder="Company" />
                <textarea style={styles.input} value={renderSafe(exp.description)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "description")} placeholder="Description" />
                <button onClick={() => removeItem("experience", i)} style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}><Trash2 size={16} /> Remove</button>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>{renderSafe(exp.title)}</h3>
                <p style={{ color: "#6b7280" }}>{renderSafe(exp.companyName)} | {exp.date}</p>
                <p style={{ fontSize: "0.95rem", marginTop: "5px" }}>{renderSafe(exp.description)}</p>
              </>
            )}
          </div>
        ))}
      </section>
    ),

    education: hasContent("education") && (
      <section key="education" style={styles.sectionBox}>
        <div style={styles.sectionTitle}>
          Education
          {editMode && <button onClick={() => addItem("education", { degree: "", institution: "", duration: "" })} style={{ border: "none", background: "none", cursor: "pointer" }}><Plus size={20} /></button>}
        </div>
        <div style={styles.divider}></div>
        {(localData.education || []).map((edu, i) => (
          <div key={i} style={editMode ? styles.editRow : { marginBottom: "1rem" }}>
            {editMode ? (
              <>
                <input style={styles.input} value={renderSafe(edu.degree)} onChange={(e) => handleArrayUpdate("education", i, e.target.value, "degree")} placeholder="Degree" />
                <input style={styles.input} value={renderSafe(edu.institution)} onChange={(e) => handleArrayUpdate("education", i, e.target.value, "institution")} placeholder="School" />
                <button onClick={() => removeItem("education", i)} style={{ color: "red", border: "none", background: "none" }}><Trash2 size={16} /></button>
              </>
            ) : (
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>{renderSafe(edu.institution)}</h3>
                <p>{renderSafe(edu.degree)} | {edu.duration}</p>
              </div>
            )}
          </div>
        ))}
      </section>
    ),

    skills: hasContent("skills") && (
      <section key="skills" style={styles.sectionBox}>
        <div style={styles.sectionTitle}>
          Skills
          {editMode && <button onClick={() => addItem("skills", "")} style={{ border: "none", background: "none", cursor: "pointer" }}><Plus size={20} /></button>}
        </div>
        <div style={styles.divider}></div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {(localData.skills || []).map((s, i) => (
            <div key={i} style={{ background: "#f3f4f6", padding: "5px 15px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              {editMode ? <input style={{ border: "none", background: "transparent", width: "80px" }} value={renderSafe(s)} onChange={(e) => handleArrayUpdate("skills", i, e.target.value)} /> : renderSafe(s)}
              {editMode && <Trash2 size={12} color="red" onClick={() => removeItem("skills", i)} style={{ cursor: "pointer" }} />}
            </div>
          ))}
        </div>
      </section>
    ),

    projects: hasContent("projects") && (
      <section key="projects" style={styles.sectionBox}>
        <div style={styles.sectionTitle}>
          Projects
          {editMode && <button onClick={() => addItem("projects", { name: "", description: "" })} style={{ border: "none", background: "none", cursor: "pointer" }}><Plus size={20} /></button>}
        </div>
        <div style={styles.divider}></div>
        {(localData.projects || []).map((p, i) => (
          <div key={i} style={editMode ? styles.editRow : { marginBottom: "1rem" }}>
            {editMode ? (
              <>
                <input style={styles.input} value={renderSafe(p.name)} onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "name")} />
                <textarea style={styles.input} value={renderSafe(p.description)} onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "description")} />
                <button onClick={() => removeItem("projects", i)} style={{ color: "red", border: "none", background: "none" }}><Trash2 size={16} /></button>
              </>
            ) : (
              <div><h3 style={{ fontWeight: "600" }}>{renderSafe(p.name)}</h3><p>{renderSafe(p.description)}</p></div>
            )}
          </div>
        ))}
      </section>
    ),

    certifications: hasContent("certifications") && (
      <section key="certifications" style={styles.sectionBox}>
        <div style={styles.sectionTitle}>Certifications {editMode && <button onClick={() => addItem("certifications", { title: "" })}>+</button>}</div>
        {(localData.certifications || []).map((c, i) => (
          <div key={i} style={{ marginBottom: "5px" }}>
            {editMode ? <input style={styles.input} value={renderSafe(c.title)} onChange={(e) => handleArrayUpdate("certifications", i, e.target.value, "title")} /> : <span>• {renderSafe(c.title)}</span>}
          </div>
        ))}
      </section>
    ),

    achievements: hasContent("achievements") && (
      <section key="achievements" style={styles.sectionBox}>
        <div style={styles.sectionTitle}>Achievements {editMode && <button onClick={() => addItem("achievements", "")}>+</button>}</div>
        {(localData.achievements || []).map((a, i) => (
          <div key={i} style={{ marginBottom: "5px" }}>
            {editMode ? <input style={styles.input} value={renderSafe(a)} onChange={(e) => handleArrayUpdate("achievements", i, e.target.value)} /> : <li>{renderSafe(a)}</li>}
          </div>
        ))}
      </section>
    ),

    languages: hasContent("languages") && (
      <section key="languages" style={styles.sectionBox}>
        <h2 style={styles.sectionTitle}>Languages</h2>
        {editMode ? <input style={styles.input} value={localData.languages?.join(", ")} onChange={(e) => handleFieldChange("languages", e.target.value.split(","))} /> : <p>{localData.languages?.join(" • ")}</p>}
      </section>
    ),

    interests: hasContent("interests") && (
      <section key="interests" style={styles.sectionBox}>
        <h2 style={styles.sectionTitle}>Interests</h2>
        {editMode ? <input style={styles.input} value={localData.interests?.join(", ")} onChange={(e) => handleFieldChange("interests", e.target.value.split(","))} /> : <p>{localData.interests?.join(" • ")}</p>}
      </section>
    ),
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onDownload={handleDownload} resumeRef={resumeRef} />
        <div style={{ flexGrow: 1, padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div ref={resumeRef} style={{ backgroundColor: "#fff", color: "#111827", maxWidth: "64rem", width: "100%", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", borderRadius: "0.5rem" }}>
            
            {/* HEADER */}
            <header style={{ padding: "3rem 2rem", borderBottom: "2px solid #3b82f6" }}>
              {editMode ? (
                <div style={{ display: "grid", gap: "10px" }}>
                  <input style={{ fontSize: "3rem", fontWeight: "bold" }} value={localData.name} onChange={(e) => handleFieldChange("name", e.target.value)} />
                  <input style={{ fontSize: "1.25rem", color: "#6b7280" }} value={localData.role} onChange={(e) => handleFieldChange("role", e.target.value)} />
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: "3rem", fontWeight: "bold", margin: "0" }}>{localData.name || ''}</h1>
                  <p style={{ fontSize: "1.25rem", color: "#6b7280" }}>{localData.role || ''}</p>
                </>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "1.5rem", color: "#6b7280", fontSize: "0.9rem" }}>
                {['phone', 'email', 'linkedin', 'github', 'portfolio', 'location'].map(k => (
                  <div key={k}>
                    {editMode ? (
                      <input style={{ width: "110px" }} value={localData[k]} onChange={(e) => handleFieldChange(k, e.target.value)} placeholder={k} />
                    ) : localData[k] && (
                      <a href={k === 'phone' ? `tel:${localData[k]}` : k === 'email' ? `mailto:${localData[k]}` : normalizeUrl(localData[k])} style={{ color: "inherit", textDecoration: "none" }}>{localData[k]}</a>
                    )}
                  </div>
                ))}
              </div>
            </header>

            {/* BODY */}
            <div style={{ padding: "2rem 0" }}>
              {sectionOrder.map(key => sectionComponents[key] || null)}
            </div>

            {/* ACTION BUTTONS */}
            <div data-html2canvas-ignore="true" style={{ textAlign: "center", padding: "2rem" }}>
              {editMode ? (
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                  <button onClick={handleSave} style={{ backgroundColor: "#10b981", color: "white", padding: "10px 30px", borderRadius: "5px", border: "none", cursor: "pointer" }}>Save</button>
                  <button onClick={handleCancel} style={{ backgroundColor: "#6b7280", color: "white", padding: "10px 30px", borderRadius: "5px", border: "none", cursor: "pointer" }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setEditMode(true)} style={{ backgroundColor: "#3b82f6", color: "white", padding: "12px 50px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Edit Resume</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template10;