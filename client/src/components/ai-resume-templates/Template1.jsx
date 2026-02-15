/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { toast } from 'react-toastify';
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import LoginPrompt from "../auth/LoginPrompt";
import html2pdf from "html2pdf.js";

// 🔹 Helpers from config
import { hasContent, getSafeUrl } from "../../utils/ResumeConfig";

const Template1 = () => {
  const resumeContext = useResume();
  const { isAuthenticated } = useAuth();
  
  // Destructure global state from context
  const { resumeData, updateResumeData, sectionOrder } = resumeContext || { sectionOrder: [] };
  
  const [localData, setLocalData] = useState(resumeData || {});
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const resumeRef = useRef();
  
  useEffect(() => {
    if (!isAuthenticated) setShowLoginPrompt(true);
  }, [isAuthenticated]);

  useEffect(() => {
    if (resumeData) setLocalData(JSON.parse(JSON.stringify(resumeData))); 
  }, [resumeData]);

  // ---------- HANDLERS ----------

  const handleInputChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleObjectChange = (section, index, field, value) => {
    const updatedSection = [...(localData[section] || [])];
    if (updatedSection[index]) {
      if (typeof updatedSection[index] === 'string') {
        updatedSection[index] = value;
      } else {
        updatedSection[index] = { ...updatedSection[index], [field]: value };
      }
    }
    setLocalData(prev => ({ ...prev, [section]: updatedSection }));
  };

  const addItem = (section, newItem) => {
    setLocalData(prev => ({
      ...prev,
      [section]: [...(Array.isArray(prev[section]) ? prev[section] : []), newItem]
    }));
  };

  const removeItem = (section, index) => {
    const updatedSection = (localData[section] || []).filter((_, i) => i !== index);
    setLocalData(prev => ({ ...prev, [section]: updatedSection }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (typeof updateResumeData !== 'function') throw new Error('Update function missing');
      await updateResumeData(localData);
      setEditMode(false);
      toast.success('✅ Changes Saved Successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(resumeData ? JSON.parse(JSON.stringify(resumeData)) : {});
    setEditMode(false);
  };

  const handleDownload = () => {
    const element = resumeRef.current;
    const options = {
      margin: 0,
      filename: `${localData.name || 'Resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, width: 794, windowWidth: 794, x: 0, y: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
  };

  const renderSafe = (val) => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    return val.name || val.title || val.degree || val.language || "";
  };

  const editBoxStyle = editMode ? {
    border: "1px dashed #3b82f6", backgroundColor: "#eff6ff", padding: "15px", borderRadius: "8px", marginBottom: "15px"
  } : { marginBottom: "20px" };

  const sectionHeaderStyle = {
    fontSize: "1.2rem", fontWeight: "bold", paddingBottom: "5px", marginBottom: "12px",
    display: "flex", justifyContent: "space-between", alignItems: "center", textTransform: "uppercase",
    borderBottom: `3px solid ${localData.textColor || "#0a91b2"}`, color: localData.textColor || "#0a91b2",
  };

  const inputStyle = { width: "100%", border: "1px solid #d1d5db", padding: "5px", borderRadius: "4px", marginBottom: "5px" };

  // ---------- 🔹 DYNAMIC SECTION RENDERER 🔹 ----------
  const sectionComponents = {
    summary: hasContent(localData, "summary", editMode) && (
      <div key="summary" style={editBoxStyle}>
        <div style={sectionHeaderStyle}>Summary</div>
        {editMode ? <textarea style={{ ...inputStyle, height: "80px" }} value={renderSafe(localData.summary)} onChange={(e) => handleInputChange("summary", e.target.value)} /> : <p style={{ fontSize: "0.95rem", lineHeight: "1.6", margin: 0, textAlign: "justify" }}>{renderSafe(localData.summary)}</p>}
      </div>
    ),
    education: hasContent(localData, "education", editMode) && (
      <div key="education" style={editBoxStyle}>
        <div style={sectionHeaderStyle}>
            Education
            {editMode && <button onClick={() => addItem("education", {degree:"", institution:""})} style={{fontSize:"12px", background:localData.textColor || "#0a91b2", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
        </div>
        {(localData.education || []).map((edu, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            {editMode ? (
                <>
                    <input style={inputStyle} value={renderSafe(edu.degree)} onChange={(e) => handleObjectChange("education", i, "degree", e.target.value)} placeholder="Degree"/>
                    <input style={inputStyle} value={renderSafe(edu.institution)} onChange={(e) => handleObjectChange("education", i, "institution", e.target.value)} placeholder="Institution"/>
                    <button onClick={() => removeItem("education", i)} style={{color:"red", border:"none", background:"none", fontSize:"0.7rem"}}>Remove</button>
                </>
            ) : (
                <>
                    <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{renderSafe(edu.degree)}</div>
                    <div style={{ fontSize: "0.85rem" }}>{renderSafe(edu.institution)}</div>
                </>
            )}
          </div>
        ))}
      </div>
    ),
    skills: hasContent(localData, "skills", editMode) && (
      <div key="skills" style={editBoxStyle}>
        <div style={sectionHeaderStyle}>
             Skills
             {editMode && <button onClick={() => addItem("skills", "")} style={{fontSize:"12px", background:localData.textColor || "#0a91b2", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {(localData.skills || []).map((s, i) => (
            <div key={i} style={{ backgroundColor: "#f3f4f6", padding: "4px 10px", borderRadius: "4px", fontSize: "0.85rem", border: "1px solid #e5e7eb" }}>
              {editMode ? <input style={{width:"70px", border:"none", background:"transparent"}} value={renderSafe(s)} onChange={(e) => handleObjectChange("skills", i, null, e.target.value)} /> : renderSafe(s)}
              {editMode && <button onClick={() => removeItem("skills", i)} style={{color:"red", marginLeft:"4px", border:"none", background:"none"}}>×</button>}
            </div>
          ))}
        </div>
      </div>
    ),
    experience: hasContent(localData, "experience", editMode) && (
      <div key="experience" style={editBoxStyle}>
        <div style={sectionHeaderStyle}>
             Experience
             {editMode && <button onClick={() => addItem("experience", {title:"", description:""})} style={{fontSize:"12px", background:localData.textColor || "#0a91b2", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
        </div>
        {(localData.experience || []).map((exp, i) => (
          <div key={i} style={{ marginBottom: "1.5rem" }}>
            {editMode ? (
                <>
                    <input style={inputStyle} value={renderSafe(exp.title)} onChange={(e) => handleObjectChange("experience", i, "title", e.target.value)} placeholder="Job Title" />
                    <textarea style={inputStyle} value={renderSafe(exp.description)} onChange={(e) => handleObjectChange("experience", i, "description", e.target.value)} placeholder="Description" />
                    <button onClick={() => removeItem("experience", i)} style={{color:"red", border:"none", background:"none", fontSize:"0.7rem"}}>Remove Block</button>
                </>
            ) : (
                <>
                    <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{renderSafe(exp.title)}</div>
                    <p style={{ fontSize: "0.9rem", margin: "5px 0", lineHeight: "1.5" }}>{renderSafe(exp.description)}</p>
                </>
            )}
          </div>
        ))}
      </div>
    ),
    projects: hasContent(localData, "projects", editMode) && (
      <div key="projects" style={editBoxStyle}>
        <div style={sectionHeaderStyle}>
             Projects
             {editMode && <button onClick={() => addItem("projects", {name:"", description:""})} style={{fontSize:"12px", background:localData.textColor || "#0a91b2", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
        </div>
        {(localData.projects || []).map((p, i) => (
          <div key={i} style={{ marginBottom: "1.2rem" }}>
            {editMode ? (
                <>
                    <input style={inputStyle} value={renderSafe(p.name)} onChange={(e) => handleObjectChange("projects", i, "name", e.target.value)} placeholder="Project Name"/>
                    <textarea style={inputStyle} value={renderSafe(p.description)} onChange={(e) => handleObjectChange("projects", i, "description", e.target.value)} placeholder="Details"/>
                    <button onClick={() => removeItem("projects", i)} style={{color:"red", border:"none", background:"none", fontSize:"0.7rem"}}>Remove</button>
                </>
            ) : (
                <>
                    <div style={{ fontWeight: "bold" }}>{renderSafe(p.name)}</div>
                    <p style={{ fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>{renderSafe(p.description)}</p>
                </>
            )}
          </div>
        ))}
      </div>
    ),
    certifications: hasContent(localData, "certifications", editMode) && (
      <div key="certifications" style={editBoxStyle}>
        <div style={sectionHeaderStyle}>
            Certifications
            {editMode && <button onClick={() => addItem("certifications", {title:""})} style={{fontSize:"12px", background:localData.textColor || "#0a91b2", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
        </div>
        {(localData.certifications || []).map((c, i) => (
          <div key={i} style={{ fontSize: "0.95rem", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
            {editMode ? <input style={inputStyle} value={renderSafe(c)} onChange={(e) => handleObjectChange("certifications", i, "title", e.target.value)} /> : <span>• {renderSafe(c)}</span>}
            {editMode && <button onClick={() => removeItem("certifications", i)} style={{color:"red", border:"none", background:"none"}}>×</button>}
          </div>
        ))}
      </div>
    ),
    achievements: hasContent(localData, "achievements", editMode) && (
      <div key="achievements" style={editBoxStyle}>
        <div style={sectionHeaderStyle}>
            Achievements
            {editMode && <button onClick={() => addItem("achievements", "")} style={{fontSize:"12px", background:localData.textColor || "#0a91b2", color:"white", border:"none", borderRadius:"4px", padding:"2px 8px"}}>+</button>}
        </div>
        {(localData.achievements || []).map((a, i) => (
          <div key={i} style={{ fontSize: "0.95rem", display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            {editMode ? <input style={inputStyle} value={renderSafe(a)} onChange={(e) => handleObjectChange("achievements", i, null, e.target.value)} /> : <span>• {renderSafe(a)}</span>}
            {editMode && <button onClick={() => removeItem("achievements", i)} style={{color:"red", border:"none", background:"none"}}>×</button>}
          </div>
        ))}
      </div>
    ),
    languages: hasContent(localData, "languages", editMode) && (
      <div key="languages" style={editBoxStyle}>
        <div style={sectionHeaderStyle}>Languages</div>
        {editMode ? <input style={inputStyle} value={localData.languages?.join(", ")} onChange={(e) => handleFieldChange("languages", e.target.value.split(","))} /> : <p style={{ fontSize: "0.95rem" }}>{(localData.languages || []).map(renderSafe).join(", ")}</p>}
      </div>
    ),
    interests: hasContent(localData, "interests", editMode) && (
      <div key="interests" style={editBoxStyle}>
        <div style={sectionHeaderStyle}>Interests</div>
        {editMode ? <input style={inputStyle} value={localData.interests?.join(", ")} onChange={(e) => handleFieldChange("interests", e.target.value.split(","))} /> : <p style={{ fontSize: "0.95rem" }}>{(localData.interests || []).map(renderSafe).join(", ")}</p>}
      </div>
    ),
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resumeRef={resumeRef} onDownload={handleDownload} />

        <div style={{ flexGrow: 1, padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#ffffff", color: "#1f2937", width: "794px", minHeight: "1123px", padding: "40px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)", fontFamily: localData.font || "serif", boxSizing: "border-box", overflow: "hidden", display: "flex", flexDirection: "column"
            }}
          >
            {/* HEADER */}
            <div style={editBoxStyle}>
              <div style={{ borderBottom: `4px solid ${localData.textColor || "#0a91b2"}`, paddingBottom: "1.5rem" }}>
                {editMode ? (
                  <div style={{ display: "grid", gap: "10px" }}>
                    <input style={{ fontSize: "2.2rem", fontWeight: "bold" }} value={renderSafe(localData.name)} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Full Name" />
                    <input value={renderSafe(localData.role)} onChange={(e) => handleInputChange("role", e.target.value)} placeholder="Title" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <input value={renderSafe(localData.phone)} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="Phone" />
                      <input value={renderSafe(localData.email)} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="Email" />
                      <input value={renderSafe(localData.linkedin)} onChange={(e) => handleInputChange("linkedin", e.target.value)} placeholder="LinkedIn" />
                      <input value={renderSafe(localData.github)} onChange={(e) => handleInputChange("github", e.target.value)} placeholder="GitHub" />
                      <input value={renderSafe(localData.portfolio)} onChange={(e) => handleInputChange("portfolio", e.target.value)} placeholder="Portfolio" />
                      <input value={renderSafe(localData.location)} onChange={(e) => handleInputChange("location", e.target.value)} placeholder="Place" />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                      <h1 style={{ fontSize: "2.8rem", fontWeight: "900", color: localData.textColor || "#0a91b2", margin: 0 }}>{renderSafe(localData.name) || "Your Name"}</h1>
                      <p style={{ fontSize: "1.3rem", color: "#4b5563", fontWeight: "600", margin: "5px 0" }}>{renderSafe(localData.role) || "Professional Title"}</p>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "0.9rem", whiteSpace: 'nowrap' }}>
                      {localData.phone && <div><a href={getSafeUrl("phone", localData.phone)} style={{ color: "inherit", textDecoration: "none" }}>{renderSafe(localData.phone)}</a></div>}
                      {localData.email && <div><a href={getSafeUrl("email", localData.email)} style={{ color: "#3b82f6", textDecoration: "none" }}>{renderSafe(localData.email)}</a></div>}
                      {localData.location && <div>{renderSafe(localData.location)}</div>}
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "5px" }}>
                        {localData.linkedin && <a href={getSafeUrl("linkedin", localData.linkedin)} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>LinkedIn</a>}
                        {localData.github && <a href={getSafeUrl("github", localData.github)} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>GitHub</a>}
                        {localData.portfolio && <a href={getSafeUrl("portfolio", localData.portfolio)} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>Portfolio</a>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DYNAMIC TWO-COLUMN BODY */}
            <div style={{ display: "flex", gap: "2.5rem", flex: 1 }}>
              <div style={{ flex: 1 }}>
                {(sectionOrder || []).slice(0, Math.ceil((sectionOrder || []).length / 2)).map(key => sectionComponents[key] || null)}
              </div>
              <div style={{ flex: 1.5 }}>
                {(sectionOrder || []).slice(Math.ceil((sectionOrder || []).length / 2)).map(key => sectionComponents[key] || null)}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div data-html2canvas-ignore="true" style={{ marginTop: "auto", paddingTop: "40px", display: "flex", gap: "1.5rem", justifyContent: "center" }}>
              {editMode ? (
                <>
                  <button onClick={handleSave} style={{ backgroundColor: "#10b981", color: "white", padding: "0.7rem 2.5rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Save Changes</button>
                  <button onClick={handleCancel} style={{ backgroundColor: "#ef4444", color: "white", padding: "0.7rem 2.5rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)} style={{ backgroundColor: "#1f2937", color: "white", padding: "0.8rem 3.5rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Edit Resume</button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showLoginPrompt && <LoginPrompt onClose={() => setShowLoginPrompt(false)} />}
    </div>
  );
};

export default Template1;