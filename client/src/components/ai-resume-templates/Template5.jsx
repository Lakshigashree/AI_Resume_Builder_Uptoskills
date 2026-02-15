/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { useResume } from "../../context/ResumeContext";
import { toast } from 'react-toastify';
import html2pdf from "html2pdf.js";

// 🔹 Helpers from config
import { hasContent, getSafeUrl } from "../../utils/ResumeConfig";

const safeArray = (v) => (Array.isArray(v) ? v : []);

const Template5 = () => {
  const resumeRef = useRef();
  const { resumeData, setResumeData, updateResumeData, sectionOrder } = useResume() || {};
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});

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
    const options = {
      margin: 10,
      filename: `${localData.name || 'resume'}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, width: 794 },
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

  const normalizeUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();
    return trimmed.startsWith("http") ? trimmed : "https://" + trimmed;
  };

  // --- STYLES ---
  const sectionTitleStyle = {
    fontSize: "1.25rem", fontWeight: "bold", borderBottom: "2px solid #d1d5db",
    paddingBottom: "0.25rem", marginBottom: "0.75rem", display: "flex", 
    justifyContent: "space-between", alignItems: "center", textTransform: "uppercase"
  };

  const editBoxStyle = editMode ? {
    border: "1px dashed #3b82f6", backgroundColor: "#fffbeb", padding: "15px", borderRadius: "8px", marginBottom: "1.5rem"
  } : { marginBottom: "1.5rem" };

  const inputStyle = { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "5px" };

  // --- 🔹 DYNAMIC SECTION RENDERER 🔹 ---
  const sectionComponents = {
    summary: hasContent(localData, "summary", editMode) && (
      <div key="summary" style={editBoxStyle}>
        <h2 style={sectionTitleStyle}>Summary</h2>
        {editMode ? (
          <textarea style={{ ...inputStyle, minHeight: "100px" }} value={localData.summary} onChange={(e) => handleFieldChange("summary", e.target.value)} />
        ) : <p style={{ fontSize: "1rem", color: "#374151", textAlign: "justify" }}>{localData.summary}</p>}
      </div>
    ),
    experience: hasContent(localData, "experience", editMode) && (
      <div key="experience" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Experience
          {editMode && <button onClick={() => addItem("experience", {title:"", companyName:"", date:"", description:""})} style={{fontSize:"11px", background:"#3b82f6", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
        </div>
        {safeArray(localData.experience).map((exp, i) => (
          <div key={i} style={{ marginBottom: "1.25rem" }}>
            {editMode ? (
              <div style={{display:"grid", gap:"5px"}}>
                <input style={inputStyle} value={renderSafe(exp.title)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "title")} placeholder="Title" />
                <input style={inputStyle} value={renderSafe(exp.companyName)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "companyName")} placeholder="Company" />
                <textarea style={inputStyle} value={renderSafe(exp.description)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "description")} placeholder="Description" />
                <button onClick={() => removeItem("experience", i)} style={{color:"red", border:"none", background:"none", textAlign:"left", fontSize:"0.7rem"}}>Remove Block</button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>{renderSafe(exp.companyName)}</h3>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{renderSafe(exp.title)} | {exp.date}</p>
                <p style={{ fontSize: "0.875rem", color: "#374151" }}>{renderSafe(exp.description)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    ),
    education: hasContent(localData, "education", editMode) && (
      <div key="education" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Education
          {editMode && <button onClick={() => addItem("education", {degree:"", institution:"", duration:""})} style={{fontSize:"11px", background:"#3b82f6", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
        </div>
        {safeArray(localData.education).map((edu, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            {editMode ? (
              <div style={{display:"grid", gap:"5px"}}>
                <input style={inputStyle} value={renderSafe(edu.degree)} onChange={(e) => handleArrayUpdate("education", i, e.target.value, "degree")} placeholder="Degree" />
                <input style={inputStyle} value={renderSafe(edu.institution)} onChange={(e) => handleArrayUpdate("education", i, e.target.value, "institution")} placeholder="School" />
                <button onClick={() => removeItem("education", i)} style={{color:"red", border:"none", background:"none", textAlign:"left", fontSize:"0.7rem"}}>Remove</button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>{renderSafe(edu.institution)}</h3>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{renderSafe(edu.degree)} | {edu.duration}</p>
              </>
            )}
          </div>
        ))}
      </div>
    ),
    skills: hasContent(localData, "skills", editMode) && (
      <div key="skills" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Skills
          {editMode && <button onClick={() => addItem("skills", "")} style={{fontSize:"11px", background:"#3b82f6", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {safeArray(localData.skills).map((s, i) => (
            <div key={i} style={{ backgroundColor: "#f3f4f6", padding: "4px 10px", borderRadius: "4px", fontSize: "0.9rem" }}>
              {editMode ? <input style={{border:"none", background:"transparent", width:"80px"}} value={renderSafe(s)} onChange={(e) => handleArrayUpdate("skills", i, e.target.value)} /> : renderSafe(s)}
              {editMode && <button onClick={() => removeItem("skills", i)} style={{color:"red", border:"none", background:"none", marginLeft:"5px"}}>×</button>}
            </div>
          ))}
        </div>
      </div>
    ),
    projects: hasContent(localData, "projects", editMode) && (
      <div key="projects" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Projects
          {editMode && <button onClick={() => addItem("projects", {name:"", description:""})} style={{fontSize:"11px", background:"#3b82f6", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
        </div>
        {safeArray(localData.projects).map((p, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            {editMode ? (
              <div style={{display:"grid", gap:"5px"}}>
                <input style={inputStyle} value={renderSafe(p.name)} onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "name")} />
                <textarea style={inputStyle} value={renderSafe(p.description)} onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "description")} />
                <button onClick={() => removeItem("projects", i)} style={{color:"red", border:"none", background:"none", textAlign:"left", fontSize:"0.7rem"}}>Remove</button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>{renderSafe(p.name)}</h3>
                <p style={{ fontSize: "0.875rem", color: "#374151" }}>{renderSafe(p.description)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    ),
    certifications: hasContent(localData, "certifications", editMode) && (
        <div key="certifications" style={editBoxStyle}>
          <div style={sectionTitleStyle}>
            Certifications
            {editMode && <button onClick={() => addItem("certifications", {title:""})} style={{fontSize:"11px", background:"#3b82f6", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
          </div>
          {safeArray(localData.certifications).map((cert, i) => (
            <div key={i} style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
              {editMode ? (
                  <input style={inputStyle} value={renderSafe(cert.title)} onChange={(e) => handleArrayUpdate("certifications", i, e.target.value, "title")} />
              ) : <div>• {renderSafe(cert.title)}</div>}
              {editMode && <button onClick={() => removeItem("certifications", i)} style={{color:"red", border:"none", background:"none"}}>×</button>}
            </div>
          ))}
        </div>
    ),
    achievements: hasContent(localData, "achievements", editMode) && (
        <div key="achievements" style={editBoxStyle}>
          <div style={sectionTitleStyle}>
            Achievements
            {editMode && <button onClick={() => addItem("achievements", "")} style={{fontSize:"11px", background:"#3b82f6", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
          </div>
          {safeArray(localData.achievements).map((ach, i) => (
            <div key={i} style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
              {editMode ? (
                  <input style={inputStyle} value={renderSafe(ach)} onChange={(e) => handleArrayUpdate("achievements", i, e.target.value)} />
              ) : <li>{renderSafe(ach)}</li>}
              {editMode && <button onClick={() => removeItem("achievements", i)} style={{color:"red", border:"none", background:"none"}}>×</button>}
            </div>
          ))}
        </div>
    ),
    languages: hasContent(localData, "languages", editMode) && (
      <div key="languages" style={editBoxStyle}>
        <h2 style={sectionTitleStyle}>Languages</h2>
        {editMode ? <input style={inputStyle} value={localData.languages?.join(", ")} onChange={(e) => handleFieldChange("languages", e.target.value.split(","))} /> : <p>{localData.languages?.join(" • ")}</p>}
      </div>
    ),
    interests: hasContent(localData, "interests", editMode) && (
      <div key="interests" style={editBoxStyle}>
        <h2 style={sectionTitleStyle}>Interests</h2>
        {editMode ? <input style={inputStyle} value={localData.interests?.join(", ")} onChange={(e) => handleFieldChange("interests", e.target.value.split(","))} /> : <p>{localData.interests?.join(" • ")}</p>}
      </div>
    ),
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fef3c7" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onDownload={handleDownload} resumeRef={resumeRef} />
        <div style={{ flexGrow: 1, padding: "1rem", marginTop: "4rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div ref={resumeRef} style={{ backgroundColor: "#ffffff", width: "794px", minHeight: "1123px", padding: "3rem", borderRadius: "8px", boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}>
            
            {/* HEADER */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              {editMode ? (
                <div style={{display:"grid", gap:"10px", maxWidth:"500px", margin:"0 auto"}}>
                  <input style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center" }} value={localData.name} onChange={(e) => handleFieldChange("name", e.target.value)} placeholder="Full Name" />
                  <input style={{ fontSize: "1.1rem", textAlign: "center", color: "#6b7280" }} value={localData.role} onChange={(e) => handleFieldChange("role", e.target.value)} placeholder="Title" />
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
                    <input style={inputStyle} value={localData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} placeholder="Phone" />
                    <input style={inputStyle} value={localData.email} onChange={(e) => handleFieldChange("email", e.target.value)} placeholder="Email" />
                    <input style={inputStyle} value={localData.linkedin} onChange={(e) => handleFieldChange("linkedin", e.target.value)} placeholder="LinkedIn" />
                    <input style={inputStyle} value={localData.github} onChange={(e) => handleFieldChange("github", e.target.value)} placeholder="GitHub" />
                    <input style={inputStyle} value={localData.portfolio} onChange={(e) => handleFieldChange("portfolio", e.target.value)} placeholder="Portfolio" />
                  </div>
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", textTransform: "uppercase" }}>{localData.name || "Your Name"}</h1>
                  <p style={{ fontSize: "1.2rem", color: "#6b7280" }}>{localData.role || "Job Title"}</p>
                  <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1rem", marginTop: "1rem", fontSize: "0.9rem" }}>
                    {localData.phone && <a href={getSafeUrl("phone", localData.phone)} style={{ textDecoration: "none", color: "inherit" }}>📞 {localData.phone}</a>}
                    {localData.email && <a href={getSafeUrl("email", localData.email)} style={{ textDecoration: "none", color: "inherit" }}>✉️ {localData.email}</a>}
                    {localData.linkedin && <a href={getSafeUrl("linkedin", localData.linkedin)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "#2563eb" }}>LinkedIn</a>}
                    {localData.github && <a href={getSafeUrl("github", localData.github)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "#2563eb" }}>GitHub</a>}
                    {localData.portfolio && <a href={getSafeUrl("portfolio", localData.portfolio)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "#2563eb" }}>Portfolio</a>}
                  </div>
                </>
              )}
            </div>

            {/* DYNAMIC BODY */}
            <div>
              {(sectionOrder || []).map((key) => sectionComponents[key] || null)}
            </div>

            {/* ACTIONS */}
            <div data-html2canvas-ignore="true" style={{ textAlign: "center", marginTop: "3rem" }}>
              {editMode ? (
                <div style={{display:"flex", justifyContent:"center", gap:"15px"}}>
                  <button onClick={handleSave} style={{ backgroundColor: "#10b981", color: "white", padding: "10px 25px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Save Changes</button>
                  <button onClick={handleCancel} style={{ backgroundColor: "#6b7280", color: "white", padding: "10px 25px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setEditMode(true)} style={{ backgroundColor: "#3b82f6", color: "white", padding: "12px 40px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Edit Resume</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template5;