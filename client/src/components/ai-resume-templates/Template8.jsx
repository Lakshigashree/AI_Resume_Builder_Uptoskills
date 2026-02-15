/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { toast } from 'react-toastify';
import html2pdf from "html2pdf.js";

// 🔹 Helpers from config
import { hasContent, getSafeUrl } from "../../utils/ResumeConfig";

const contactFields = [
  { key: "phone", icon: "📞" },
  { key: "email", icon: "✉️" },
  { key: "location", icon: "📍" },
  { key: "linkedin", icon: "🔗" },
  { key: "github", icon: "🐙" },
  { key: "portfolio", icon: "🌐" },
];

const safeArray = (v) => (Array.isArray(v) ? v : []);

const Template8 = () => {
  const resumeRef = useRef(null);
  const { resumeData, updateResumeData, sectionOrder } = useResume();
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});

  useEffect(() => {
    if (resumeData) setLocalData(JSON.parse(JSON.stringify(resumeData)));
  }, [resumeData]);

  // ---------- HANDLERS ----------

  const handleFieldChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
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
      margin: 0.5,
      filename: `${localData.name || "Resume"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
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

  // --- STYLES ---
  const sectionTitleStyle = {
    fontSize: "18px", fontWeight: "bold", color: "#ff7b25",
    textTransform: "uppercase", borderBottom: "1px solid #ddd",
    paddingBottom: "5px", marginBottom: "15px", display: "flex",
    justifyContent: "space-between", alignItems: "center"
  };

  const editBoxStyle = editMode ? {
    border: "1px solid #eee", padding: "10px", borderRadius: "4px", marginBottom: "20px", position: "relative"
  } : { marginBottom: "25px" };

  const inputStyle = { border: "1px solid #ddd", padding: "5px", fontSize: "14px", width: "100%", marginBottom: "5px" };

  // --- 🔹 DYNAMIC SECTION COMPONENTS MAP 🔹 ---
  const sectionComponents = {
    summary: hasContent(localData, "summary", editMode) && (
      <div key="summary" style={editBoxStyle}>
        <h3 style={sectionTitleStyle}>Professional Summary</h3>
        {editMode ? (
          <textarea style={{ ...inputStyle, minHeight: "80px" }} value={localData.summary} onChange={(e) => handleFieldChange("summary", e.target.value)} />
        ) : <p style={{ fontSize: "14px", lineHeight: "1.5", margin: 0 }}>{localData.summary}</p>}
      </div>
    ),
    skills: hasContent(localData, "skills", editMode) && (
      <div key="skills" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Skills
          {editMode && <button onClick={() => addItem("skills", "")} style={{ fontSize: "12px", border: "1px solid #ff7b25", background: "none", color: "#ff7b25", cursor: "pointer", padding: "2px 8px" }}>+</button>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {safeArray(localData.skills).map((s, i) => (
            <div key={i} style={{ backgroundColor: "#ff7b25", color: "white", padding: "5px 10px", borderRadius: "3px", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
              {editMode ? <input style={{ border: "none", background: "transparent", color: "white", width: "70px" }} value={renderSafe(s)} onChange={(e) => handleArrayUpdate("skills", i, e.target.value)} /> : renderSafe(s)}
              {editMode && <span onClick={() => removeItem("skills", i)} style={{ cursor: "pointer" }}>×</span>}
            </div>
          ))}
        </div>
      </div>
    ),
    experience: hasContent(localData, "experience", editMode) && (
      <div key="experience" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Professional Experience
          {editMode && <button onClick={() => addItem("experience", { title: "", companyName: "", date: "", description: "" })} style={{ fontSize: "12px", border: "1px solid #ff7b25", background: "none", color: "#ff7b25", cursor: "pointer", padding: "2px 8px" }}>+</button>}
        </div>
        {safeArray(localData.experience).map((exp, i) => (
          <div key={i} style={{ marginBottom: "15px" }}>
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input style={inputStyle} value={renderSafe(exp.title)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "title")} placeholder="Title" />
                <input style={inputStyle} value={renderSafe(exp.companyName)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "companyName")} placeholder="Company" />
                <button onClick={() => removeItem("experience", i)} style={{ color: "red", border: "none", background: "none", textAlign: "left", fontSize: "12px" }}>Remove Block</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px" }}>
                  <span>{renderSafe(exp.title)}</span><span>{exp.date}</span>
                </div>
                <div style={{ fontStyle: "italic", fontSize: "14px" }}>{renderSafe(exp.companyName)}</div>
                <div style={{ fontSize: "14px" }}>{renderSafe(exp.description)}</div>
              </>
            )}
          </div>
        ))}
      </div>
    ),
    education: hasContent(localData, "education", editMode) && (
      <div key="education" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Education
          {editMode && <button onClick={() => addItem("education", { degree: "", institution: "", duration: "" })} style={{ fontSize: "12px", border: "1px solid #ff7b25", background: "none", color: "#ff7b25", cursor: "pointer", padding: "2px 8px" }}>+</button>}
        </div>
        {safeArray(localData.education).map((edu, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input style={inputStyle} value={renderSafe(edu.degree)} onChange={(e) => handleArrayUpdate("education", i, e.target.value, "degree")} />
                <input style={inputStyle} value={renderSafe(edu.institution)} onChange={(e) => handleArrayUpdate("education", i, e.target.value, "institution")} />
                <button onClick={() => removeItem("education", i)} style={{ color: "red", border: "none", background: "none", textAlign: "left", fontSize: "12px" }}>Remove</button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ fontWeight: "bold" }}>{renderSafe(edu.degree)}</span><span>{edu.duration}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    ),
    projects: hasContent(localData, "project", editMode) && (
      <div key="projects" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Projects
          {editMode && <button onClick={() => addItem("project", { title: "", description: "" })} style={{ fontSize: "12px", border: "1px solid #ff7b25", background: "none", color: "#ff7b25", cursor: "pointer", padding: "2px 8px" }}>+</button>}
        </div>
        {safeArray(localData.project).map((prj, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input style={inputStyle} value={renderSafe(prj.title)} onChange={(e) => handleArrayUpdate("project", i, e.target.value, "title")} />
                <textarea style={inputStyle} value={renderSafe(prj.description)} onChange={(e) => handleArrayUpdate("project", i, e.target.value, "description")} />
                <button onClick={() => removeItem("project", i)} style={{ color: "red", border: "none", background: "none", textAlign: "left", fontSize: "12px" }}>Remove</button>
              </div>
            ) : (
              <div style={{ fontSize: "14px" }}><span style={{ fontWeight: "bold" }}>{renderSafe(prj.title)}</span>: {renderSafe(prj.description)}</div>
            )}
          </div>
        ))}
      </div>
    ),
    certifications: hasContent(localData, "certifications", editMode) && (
      <div key="certifications" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Certifications
          {editMode && <button onClick={() => addItem("certifications", { name: "", year: "" })} style={{ fontSize: "12px", border: "1px solid #ff7b25", background: "none", color: "#ff7b25", cursor: "pointer", padding: "2px 8px" }}>+</button>}
        </div>
        {safeArray(localData.certifications).map((cert, i) => (
          <div key={i} style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            {editMode ? <input style={inputStyle} value={renderSafe(cert.name)} onChange={(e) => handleArrayUpdate("certifications", i, e.target.value, "name")} /> : <span>{renderSafe(cert.name)}</span>}
            {editMode && <button onClick={() => removeItem("certifications", i)} style={{ border: "none", color: "red", background: "none" }}>×</button>}
          </div>
        ))}
      </div>
    ),
    achievements: hasContent(localData, "achievements", editMode) && (
      <div key="achievements" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Achievements
          {editMode && <button onClick={() => addItem("achievements", { title: "", year: "" })} style={{ fontSize: "12px", border: "1px solid #ff7b25", background: "none", color: "#ff7b25", cursor: "pointer", padding: "2px 8px" }}>+</button>}
        </div>
        {safeArray(localData.achievements).map((ach, i) => (
          <div key={i} style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            {editMode ? <input style={inputStyle} value={renderSafe(ach.title)} onChange={(e) => handleArrayUpdate("achievements", i, e.target.value, "title")} /> : <span>{renderSafe(ach.title)}</span>}
            {editMode && <button onClick={() => removeItem("achievements", i)} style={{ border: "none", color: "red", background: "none" }}>×</button>}
          </div>
        ))}
      </div>
    ),
    languages: hasContent(localData, "languages", editMode) && (
      <div key="languages" style={editBoxStyle}>
        <h3 style={sectionTitleStyle}>Languages</h3>
        {editMode ? (
          <input style={inputStyle} value={localData.languages?.join(", ")} onChange={(e) => handleFieldChange("languages", e.target.value.split(","))} placeholder="Comma separated" />
        ) : <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>{localData.languages?.map((l, i) => <span key={i} style={{ fontSize: "14px" }}>• {l}</span>)}</div>}
      </div>
    ),
    interests: hasContent(localData, "interests", editMode) && (
      <div key="interests" style={editBoxStyle}>
        <h3 style={sectionTitleStyle}>Interests</h3>
        {editMode ? (
          <input style={inputStyle} value={localData.interests?.join(", ")} onChange={(e) => handleFieldChange("interests", e.target.value.split(","))} placeholder="Comma separated" />
        ) : <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>{localData.interests?.map((it, i) => <span key={i} style={{ fontSize: "14px" }}>• {it}</span>)}</div>}
      </div>
    ),
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onDownload={handleDownload} resumeRef={resumeRef} />
        <div style={{ flexGrow: 1, padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div ref={resumeRef} style={{ fontFamily: "Arial, sans-serif", width: "210mm", minHeight: "297mm", padding: "30px", backgroundColor: "#fff", color: "#333", boxShadow: "0 0 10px rgba(0,0,0,0.1)", border: "1px solid #ddd", boxSizing: "border-box" }}>
            
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid #ff7b25", paddingBottom: "20px" }}>
              {editMode ? (
                <>
                  <input style={{ fontSize: "28px", fontWeight: "bold", color: "#ff7b25", textAlign: "center", width: "100%", border: "1px solid #ddd" }} value={localData.name} onChange={(e) => handleFieldChange("name", e.target.value)} />
                  <input style={{ fontSize: "18px", color: "#ff7b25", textAlign: "center", width: "100%", border: "1px solid #ddd", marginTop: "5px" }} value={localData.role} onChange={(e) => handleFieldChange("role", e.target.value)} />
                </>
              ) : (
                <>
                  <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#ff7b25", margin: 0 }}>{localData.name}</h1>
                  <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#ff7b25", margin: "5px 0 15px 0" }}>{localData.role}</h2>
                </>
              )}

              {/* Contact Links */}
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "20px", marginTop: "10px" }}>
                {contactFields.map(({ key, icon }) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
                    <span style={{ color: "#ff7b25", marginRight: "5px" }}>{icon}</span>
                    {editMode ? (
                      <input style={{ border: "1px solid #ddd", padding: "2px 5px", width: "100px" }} value={localData[key] || ""} onChange={(e) => handleFieldChange(key, e.target.value)} />
                    ) : (
                      localData[key] && (
                        key === "email" ? <a href={`mailto:${localData[key]}`} style={{ color: "inherit", textDecoration: "none" }}>{localData[key]}</a> :
                        key === "location" ? <span>{localData[key]}</span> :
                        <a href={normalizeUrl(localData[key])} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{localData[key]}</a>
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
            <div data-html2canvas-ignore="true" style={{ marginTop: "3rem", textAlign: "center" }}>
              {editMode ? (
                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                  <button onClick={handleSave} style={{ backgroundColor: "#16a34a", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px", cursor: "pointer" }}>Save</button>
                  <button onClick={handleCancel} style={{ backgroundColor: "#9ca3af", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setEditMode(true)} style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1.5rem", border: "none", borderRadius: "4px", cursor: "pointer" }}>Edit</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template8;