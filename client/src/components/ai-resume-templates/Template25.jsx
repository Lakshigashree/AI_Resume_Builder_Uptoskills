/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { toast } from 'react-toastify';
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import resumeService from "../../services/resumeService";

const Template25 = () => {
  const resumeRef = useRef(null);
  const resumeContext = useResume();
  const { isAuthenticated } = useAuth();
  
  const resumeData = resumeContext?.resumeData || {};
  const updateResumeData = resumeContext?.updateResumeData;
  
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData);
  const [saveStatus, setSaveStatus] = useState('');
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);

  useEffect(() => {
    if (resumeData) {
      setLocalData(resumeData);
    }
  }, [resumeData]);

  const handleFieldChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    const updatedSection = [...(localData[section] || [])];
    if (key) {
      updatedSection[index] = { ...updatedSection[index], [key]: value };
    } else {
      updatedSection[index] = value;
    }
    handleFieldChange(section, updatedSection);
  };

  const addItem = (section, template) => {
    const updated = [...(localData[section] || []), template];
    handleFieldChange(section, updated);
  };

  const removeItem = (section, index) => {
    const updated = [...(localData[section] || [])];
    updated.splice(index, 1);
    handleFieldChange(section, updated);
  };

  const handleSave = async () => {
    try {
      setSaveStatus('Saving...');
      setIsSavingToDatabase(true);
      if (typeof updateResumeData !== 'function') throw new Error('Update function missing');
      await updateResumeData(localData);
      setEditMode(false);
      toast.success('✅ Changes Saved Successfully');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSavingToDatabase(false);
      setSaveStatus('');
    }
  };

  const handleCancel = () => {
    setLocalData(resumeContext?.resumeData || {});
    setEditMode(false);
  };

  const shouldShow = (section) => {
    if (editMode) return true;
    const data = localData[section];
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === 'string') return data.trim() !== '';
    return false;
  };

  return (
    <>
      <style>
        {`
          .section-block { margin-bottom: 2rem; width: 100%; }
          .section-header-container { border-bottom: 2px solid #1f2937; margin-bottom: 1rem; padding-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }
          .section-title { font-size: 1rem; font-weight: 800; color: #1f2937; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
          .link-redirect { color: #2563eb; text-decoration: none; font-weight: 500; font-size: 0.85rem; }
          .link-redirect:hover { text-decoration: underline; }
          .remove-btn { color: #ef4444; border: none; background: none; cursor: pointer; font-size: 0.75rem; font-weight: bold; margin-left: 10px; }
          .add-btn { background: #10b981; color: white; border: none; border-radius: 4px; padding: 2px 10px; cursor: pointer; font-size: 0.75rem; font-weight: bold; }
          .edit-input { width: 100%; border: 1px solid #3b82f6; border-radius: 4px; padding: 6px; font-size: 0.9rem; background-color: #f8fafc; margin-bottom: 5px; box-sizing: border-box; }
          
          @media print {
            .hide-in-pdf { display: none !important; }
          }
        `}
      </style>
      <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
        <Navbar />
        <div style={{ display: "flex" }}>
          <Sidebar resumeRef={resumeRef} />
          <div style={{ flexGrow: 1, padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div ref={resumeRef} style={{ backgroundColor: "#ffffff", color: "#1f2937", width: "210mm", minHeight: "297mm", padding: "3rem", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)", boxSizing: "border-box" }}>
              
              {/* 1. HEADER & 5 REDIRECT LINKS */}
              <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  {editMode ? (
                    <input className="edit-input" style={{ fontSize: "2.5rem", textAlign: "center", fontWeight: "bold" }} value={localData.name || ""} onChange={(e) => handleFieldChange("name", e.target.value)} />
                  ) : (
                    <h1 style={{ fontSize: "2.75rem", fontWeight: "900", textTransform: "uppercase", margin: 0 }}>{localData.name || "Your Name"}</h1>
                  )}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  {editMode ? (
                    <input className="edit-input" style={{ fontSize: "1.2rem", textAlign: "center", color: "#2563eb" }} value={localData.role || ""} onChange={(e) => handleFieldChange("role", e.target.value)} />
                  ) : (
                    <p style={{ fontSize: "1.25rem", color: "#2563eb", fontWeight: "600", margin: 0 }}>{localData.role || "Professional Title"}</p>
                  )}
                </div>
                
                <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap", fontSize: "0.9rem" }}>
                  {editMode ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
                      <input className="edit-input" placeholder="Phone" value={localData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} />
                      <input className="edit-input" placeholder="Email" value={localData.email} onChange={(e) => handleFieldChange("email", e.target.value)} />
                      <input className="edit-input" placeholder="LinkedIn URL" value={localData.linkedin} onChange={(e) => handleFieldChange("linkedin", e.target.value)} />
                      <input className="edit-input" placeholder="GitHub URL" value={localData.github} onChange={(e) => handleFieldChange("github", e.target.value)} />
                      <input className="edit-input" placeholder="Portfolio URL" value={localData.portfolio} onChange={(e) => handleFieldChange("portfolio", e.target.value)} />
                      <input className="edit-input" placeholder="Location" value={localData.location} onChange={(e) => handleFieldChange("location", e.target.value)} />
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                      {localData.phone && <a href={`tel:${localData.phone}`} className="link-redirect">{localData.phone}</a>}
                      {localData.email && <a href={`mailto:${localData.email}`} className="link-redirect">{localData.email}</a>}
                      {localData.linkedin && <a href={localData.linkedin.startsWith('http') ? localData.linkedin : `https://${localData.linkedin}`} target="_blank" rel="noreferrer" className="link-redirect">LinkedIn</a>}
                      {localData.github && <a href={localData.github.startsWith('http') ? localData.github : `https://${localData.github}`} target="_blank" rel="noreferrer" className="link-redirect">GitHub</a>}
                      {localData.portfolio && <a href={localData.portfolio.startsWith('http') ? localData.portfolio : `https://${localData.portfolio}`} target="_blank" rel="noreferrer" className="link-redirect">Portfolio</a>}
                      {localData.location && <span style={{color: "#4b5563"}}>{localData.location}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* EQUALLY DIVIDED COLUMNS */}
              <div style={{ display: "flex", gap: "3rem" }}>
                {/* LEFT COLUMN */}
                <div style={{ flex: "1" }}>
                  {/* 2. PROFILE */}
                  {shouldShow("summary") && (
                    <div className="section-block">
                      <div className="section-header-container"><h3 className="section-title">Profile</h3></div>
                      {editMode ? <textarea className="edit-input" style={{ minHeight: "100px" }} value={localData.summary} onChange={(e) => handleFieldChange("summary", e.target.value)} /> : <p style={{ fontSize: "0.95rem", lineHeight: "1.7", margin: 0 }}>{localData.summary}</p>}
                    </div>
                  )}

                  {/* 3. EXPERIENCE */}
                  {shouldShow("experience") && (
                    <div className="section-block">
                      <div className="section-header-container">
                        <h3 className="section-title">Experience</h3>
                        {editMode && <button className="add-btn hide-in-pdf" data-html2canvas-ignore="true" onClick={() => addItem("experience", {title:"", company:"", duration:"", description:""})}>+ Add</button>}
                      </div>
                      {localData.experience?.map((exp, i) => (
                        <div key={i} style={{ marginBottom: "1.5rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                            {editMode ? <input className="edit-input" value={exp.title} onChange={(e) => handleArrayFieldChange("experience", i, "title", e.target.value)} /> : <span>{exp.title}</span>}
                            {editMode && <button className="remove-btn hide-in-pdf" data-html2canvas-ignore="true" onClick={() => removeItem("experience", i)}>Remove</button>}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#4b5563", marginBottom: "4px" }}>
                            {editMode ? <input className="edit-input" value={exp.company} onChange={(e) => handleArrayFieldChange("experience", i, "company", e.target.value)} /> : exp.company} | {editMode ? <input className="edit-input" value={exp.duration} onChange={(e) => handleArrayFieldChange("experience", i, "duration", e.target.value)} /> : exp.duration}
                          </div>
                          {editMode ? <textarea className="edit-input" value={exp.description} onChange={(e) => handleArrayFieldChange("experience", i, "description", e.target.value)} /> : <p style={{ fontSize: "0.9rem", margin: 0 }}>{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4. PROJECTS */}
                  {shouldShow("projects") && (
                    <div className="section-block">
                      <div className="section-header-container">
                        <h3 className="section-title">Projects</h3>
                        {editMode && <button className="add-btn hide-in-pdf" data-html2canvas-ignore="true" onClick={() => addItem("projects", {name:"", description:""})}>+ Add</button>}
                      </div>
                      {localData.projects?.map((proj, i) => (
                        <div key={i} style={{ marginBottom: "1rem" }}>
                          <div style={{ fontWeight: "bold" }}>{editMode ? <input className="edit-input" value={proj.name} onChange={(e) => handleArrayFieldChange("projects", i, "name", e.target.value)} /> : proj.name}</div>
                          {editMode ? <textarea className="edit-input" value={proj.description} onChange={(e) => handleArrayFieldChange("projects", i, "description", e.target.value)} /> : <p style={{ fontSize: "0.85rem", margin: 0 }}>{proj.description}</p>}
                          {editMode && <button className="remove-btn hide-in-pdf" data-html2canvas-ignore="true" onClick={() => removeItem("projects", i)}>Remove</button>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 5. INTERESTS */}
                  {shouldShow("interests") && (
                    <div className="section-block">
                      <div className="section-header-container"><h3 className="section-title">Interests</h3></div>
                      {editMode ? <input className="edit-input" value={localData.interests?.join(", ")} onChange={(e) => handleFieldChange("interests", e.target.value.split(","))} /> : <p style={{ fontSize: "0.85rem" }}>{localData.interests?.join(", ")}</p>}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ flex: "1" }}>
                  {/* 6. SKILLS */}
                  {shouldShow("skills") && (
                    <div className="section-block">
                      <div className="section-header-container">
                        <h3 className="section-title">Skills</h3>
                        {editMode && <button className="add-btn hide-in-pdf" data-html2canvas-ignore="true" onClick={() => addItem("skills", "")}>+ Add</button>}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {localData.skills?.map((s, i) => (
                          <div key={i} style={{ backgroundColor: "#f3f4f6", padding: "4px 10px", borderRadius: "4px", fontSize: "0.8rem", display: "flex", alignItems: "center" }}>
                            {editMode ? <input className="edit-input" value={s} onChange={(e) => handleArrayFieldChange("skills", i, null, e.target.value)} style={{width: "60px", marginBottom: 0}} /> : s}
                            {editMode && <button onClick={() => removeItem("skills", i)} className="remove-btn hide-in-pdf" data-html2canvas-ignore="true">x</button>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7. EDUCATION */}
                  {shouldShow("education") && (
                    <div className="section-block">
                      <div className="section-header-container">
                        <h3 className="section-title">Education</h3>
                        {editMode && <button className="add-btn hide-in-pdf" data-html2canvas-ignore="true" onClick={() => addItem("education", {degree:"", institution:"", year:""})}>+ Add</button>}
                      </div>
                      {localData.education?.map((edu, i) => (
                        <div key={i} style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
                          <div style={{ fontWeight: "bold" }}>{editMode ? <input className="edit-input" value={edu.degree} onChange={(e) => handleArrayFieldChange("education", i, "degree", e.target.value)} /> : edu.degree}</div>
                          <div>{editMode ? <input className="edit-input" value={edu.institution} onChange={(e) => handleArrayFieldChange("education", i, "institution", e.target.value)} /> : edu.institution}</div>
                          {editMode && <button className="remove-btn hide-in-pdf" data-html2canvas-ignore="true" onClick={() => removeItem("education", i)}>Remove</button>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 8. CERTIFICATIONS */}
                  {shouldShow("certifications") && (
                    <div className="section-block">
                      <div className="section-header-container">
                        <h3 className="section-title">Certifications</h3>
                        {editMode && <button className="add-btn hide-in-pdf" data-html2canvas-ignore="true" onClick={() => addItem("certifications", {title:""})}>+ Add</button>}
                      </div>
                      {localData.certifications?.map((c, i) => (
                        <div key={i} style={{ fontSize: "0.85rem", marginBottom: "5px", display: "flex", alignItems: "center" }}>
                          <span style={{marginRight: "8px"}}>•</span>
                          {editMode ? <input className="edit-input" value={c.title} onChange={(e) => handleArrayFieldChange("certifications", i, "title", e.target.value)} /> : <span>{c.title}</span>}
                          {editMode && <button className="remove-btn hide-in-pdf" data-html2canvas-ignore="true" onClick={() => removeItem("certifications", i)}>x</button>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 9. LANGUAGES */}
                  {shouldShow("languages") && (
                    <div className="section-block">
                      <div className="section-header-container"><h3 className="section-title">Languages</h3></div>
                      {editMode ? <input className="edit-input" value={localData.languages?.join(", ")} onChange={(e) => handleFieldChange("languages", e.target.value.split(","))} /> : <p style={{ fontSize: "0.85rem" }}>{localData.languages?.join(", ")}</p>}
                    </div>
                  )}

                  {/* 10. ACHIEVEMENTS */}
                {shouldShow("achievements") && (
                  <div className="section-block">
                    <div className="section-header-container">
                      <h3 className="section-title">Awards</h3>
                      {editMode && (
                        <button
                          className="add-btn hide-in-pdf"
                          data-html2canvas-ignore="true"
                          onClick={() =>
                            addItem("achievements", { title: "", description: "", year: "" })
                          }
                        > + Add
                        </button>
                      )}
                    </div>

                    <ul style={{ paddingLeft: "1rem", fontSize: "0.85rem", margin: 0 }}>
                      {localData.achievements?.map((a, i) => (
                        <li key={i} style={{ marginBottom: "8px" }}>
                          {editMode ? (
                            <>
                              <input
                                className="edit-input"
                                placeholder="Title"
                                value={a?.title || ""}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "achievements",
                                    i,
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                              <input
                                className="edit-input"
                                placeholder="Description"
                                value={a?.description || ""}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "achievements",
                                    i,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                              <input
                                className="edit-input"
                                placeholder="Year"
                                value={a?.year || ""}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "achievements",
                                    i,
                                    "year",
                                    e.target.value
                                  )
                                }
                              />
                              <button
                                className="remove-btn hide-in-pdf"
                                data-html2canvas-ignore="true"
                                onClick={() => removeItem("achievements", i)}
                              > remove
                              </button>
                            </>
                          ) : (
                            <>
                              <strong>{a?.title}</strong>
                              {a?.description && ` — ${a.description}`}
                              {a?.year && ` (${a.year})`}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                </div>
              </div>

              {/* ACTION BUTTONS (EXCLUDED FROM PDF) */}
              <div className="hide-in-pdf" data-html2canvas-ignore="true" style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "3rem" }}>
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
      </div>
    </>
  );
};

export default Template25;