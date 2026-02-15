/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import {
  MapPin, Phone, Mail, Globe, Briefcase, GraduationCap,
  Award, Trophy, Linkedin, Github, Heart, Languages, Star, Plus, Trash2
} from "lucide-react";
import { toast } from "react-toastify";
import { handleGlobalDownload } from "../../utils/downloadResume";

// --- Safety Helper to prevent "Objects are not valid as React child" errors ---
const renderSafeText = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    return val.title || val.name || val.degree || val.description || val.language || "";
  }
  return String(val);
};

// --- Reusable Editable Components ---

const EditableField = ({ value, onChange, isEditing, placeholder = "" }) => {
  const safeValue = renderSafeText(value);
  if (isEditing) {
    return (
      <input
        type="text"
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "0.2rem", margin: "0.1rem 0",
          border: "1px solid #707070", borderRadius: "4px",
          fontFamily: "inherit", fontSize: "inherit",
          backgroundColor: "#f0f7ff"
        }}
      />
    );
  }
  return <>{safeValue}</>;
};

const EditableTextArea = ({ value, onChange, isEditing, style = {} }) => {
  const safeValue = renderSafeText(value);
  if (isEditing) {
    return (
      <textarea
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(2, safeValue.split('\n').length)}
        style={{
          width: "100%", padding: "0.4rem", margin: "0.5rem 0",
          border: "1px solid #707070", borderRadius: "4px",
          fontFamily: "inherit", fontSize: "0.95rem", lineHeight: "1.5",
          backgroundColor: "#f0f7ff", ...style,
        }}
      />
    );
  }
  return <p style={{ lineHeight: "1.7", color: style.color || "#343a40", margin: 0, whiteSpace: "pre-wrap" }}>{safeValue}</p>;
};

const Template24 = () => {
  const resumeRef = useRef(null);
  const { resumeData, updateResumeData } = useResume();
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});

  const ACCENT_COLOR = "#707070";
  const PRIMARY_TEXT_COLOR = "#343a40";
  const LIGHT_BACKGROUND = "#f4f7f6";
  const SECTION_HEADER_BG = "#f5f5f5";
  const FONT_HEADER = "Georgia, serif";
  const FONT_BODY = "Arial, sans-serif";

  useEffect(() => {
    setLocalData(resumeData);
  }, [resumeData]);

  const hasContent = (arr) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return false;
    return arr.some(item => {
      if (typeof item === 'string') return item.trim() !== "";
      if (typeof item === 'object' && item !== null) {
        return Object.values(item).some(val => val && String(val).trim() !== "");
      }
      return false;
    });
  };

  const handleFieldChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    setLocalData((prev) => {
      const updated = [...(prev[section] || [])];
      if (key) {
        updated[index] = { ...updated[index], [key]: value };
      } else {
        updated[index] = value;
      }
      return { ...prev, [section]: updated };
    });
  };

  const addItem = (section, template) => {
    setLocalData(prev => ({ ...prev, [section]: [...(prev[section] || []), template] }));
  };

  const removeItem = (section, index) => {
    setLocalData(prev => {
      const updated = [...prev[section]];
      updated.splice(index, 1);
      return { ...prev, [section]: updated };
    });
  };

  const handleSave = () => {
    if (typeof updateResumeData === 'function') {
      updateResumeData(localData);
      setEditMode(false);
      toast.success("Resume updated successfully!");
    }
  };

  const handleCancel = () => {
    setLocalData(resumeData);
    setEditMode(false);
  };

  const leftTitleStyle = {
    backgroundColor: SECTION_HEADER_BG, padding: "0.75rem 0.5rem", margin: "1.5rem 0 0.5rem 0",
    textTransform: "uppercase", fontWeight: "bold", fontSize: "1rem", letterSpacing: "1px",
    color: PRIMARY_TEXT_COLOR, textAlign: "left", borderBottom: `2px solid ${ACCENT_COLOR}`,
    borderTop: `2px solid ${ACCENT_COLOR}`, display: "flex", justifyContent: "space-between", alignItems: "center"
  };

  const mainTitleStyle = {
    backgroundColor: SECTION_HEADER_BG, padding: "0.4rem 0.8rem", marginBottom: "1rem", marginTop: "1.5rem",
    textTransform: "uppercase", fontWeight: "bold", fontSize: "0.9rem", letterSpacing: "0.5px",
    color: PRIMARY_TEXT_COLOR, borderBottom: `1px solid ${ACCENT_COLOR}`, display: "flex",
    justifyContent: "space-between", alignItems: "center"
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: LIGHT_BACKGROUND }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resumeRef={resumeRef} onDownload={() => handleGlobalDownload(resumeRef, localData.name)} />

        <div style={{ flexGrow: 1, padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#ffffff", width: "100%", maxWidth: "210mm", minHeight: "297mm",
              padding: "2.5rem", fontFamily: FONT_BODY, color: PRIMARY_TEXT_COLOR,
              boxSizing: "border-box", boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            {/* 1. HEADER (NAME & ROLE) */}
            <div style={{ marginBottom: "1.5rem", textAlign: "center", borderBottom: `1px solid ${ACCENT_COLOR}`, paddingBottom: "1.5rem" }}>
              <h1 style={{ fontSize: "3rem", margin: 0, fontWeight: "900", letterSpacing: "3px", fontFamily: FONT_HEADER }}>
                <EditableField value={localData.name} onChange={(v) => handleFieldChange("name", v)} isEditing={editMode} placeholder="FULL NAME" />
              </h1>
              <h2 style={{ fontSize: "1.2rem", marginTop: "0.5rem", color: ACCENT_COLOR, fontWeight: "600", textTransform: "uppercase", letterSpacing: "2px" }}>
                <EditableField value={localData.role} onChange={(v) => handleFieldChange("role", v)} isEditing={editMode} placeholder="ROLE" />
              </h2>
            </div>

            <div style={{ display: "flex", gap: "40px" }}>
              {/* LEFT COLUMN */}
              <div style={{ flex: "0 0 35%" }}>
                {/* 2. CONTACT (5 LINKS) */}
                <div style={{ ...leftTitleStyle, marginTop: 0, borderTop: "none" }}>CONTACT</div>
                <div style={{ padding: "0 0.5rem", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Phone size={14} color={ACCENT_COLOR} />
                    {editMode ? <EditableField value={localData.phone} onChange={(v) => handleFieldChange("phone", v)} isEditing={editMode} placeholder="Phone" /> : <a href={`tel:${localData.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{localData.phone}</a>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Mail size={14} color={ACCENT_COLOR} />
                    {editMode ? <EditableField value={localData.email} onChange={(v) => handleFieldChange("email", v)} isEditing={editMode} placeholder="Email" /> : <a href={`mailto:${localData.email}`} style={{ color: "inherit", textDecoration: "none" }}>{localData.email}</a>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Linkedin size={14} color={ACCENT_COLOR} />
                    {editMode ? <EditableField value={localData.linkedin} onChange={(v) => handleFieldChange("linkedin", v)} isEditing={editMode} placeholder="LinkedIn URL" /> : <a href={localData.linkedin?.startsWith('http') ? localData.linkedin : `https://${localData.linkedin}`} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>LinkedIn</a>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Github size={14} color={ACCENT_COLOR} />
                    {editMode ? <EditableField value={localData.github} onChange={(v) => handleFieldChange("github", v)} isEditing={editMode} placeholder="GitHub URL" /> : <a href={localData.github?.startsWith('http') ? localData.github : `https://${localData.github}`} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>GitHub</a>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Globe size={14} color={ACCENT_COLOR} />
                    {editMode ? <EditableField value={localData.portfolio} onChange={(v) => handleFieldChange("portfolio", v)} isEditing={editMode} placeholder="Portfolio URL" /> : <a href={localData.portfolio?.startsWith('http') ? localData.portfolio : `https://${localData.portfolio}`} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Portfolio</a>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin size={14} color={ACCENT_COLOR} />
                    <EditableField value={localData.location} onChange={(v) => handleFieldChange("location", v)} isEditing={editMode} placeholder="Location" />
                  </div>
                </div>

                {/* 3. EDUCATION */}
                {(editMode || hasContent(localData.education)) && (
                  <>
                    <div style={leftTitleStyle}>
                      EDUCATION
                      {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('education', { degree: '', institution: '', duration: '' })} />}
                    </div>
                    {(localData.education || []).map((edu, idx) => (
                      <div key={idx} style={{ marginBottom: "1rem", padding: "0 0.5rem", fontSize: "0.9rem", position: 'relative' }}>
                        {editMode && <Trash2 size={12} style={{ position: 'absolute', right: -10, cursor: 'pointer', color: 'red' }} onClick={() => removeItem('education', idx)} />}
                        <div style={{ fontWeight: "bold" }}><EditableField value={edu.degree} onChange={(v) => handleArrayFieldChange("education", idx, "degree", v)} isEditing={editMode} /></div>
                        <div style={{ color: ACCENT_COLOR }}><EditableField value={edu.institution} onChange={(v) => handleArrayFieldChange("education", idx, "institution", v)} isEditing={editMode} /></div>
                        <div style={{ fontStyle: "italic", fontSize: "0.8rem" }}><EditableField value={edu.duration} onChange={(v) => handleArrayFieldChange("education", idx, "duration", v)} isEditing={editMode} /></div>
                      </div>
                    ))}
                  </>
                )}

                {/* 4. SKILLS */}
                {(editMode || hasContent(localData.skills)) && (
                  <>
                    <div style={leftTitleStyle}>
                      SKILLS
                      {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('skills', '')} />}
                    </div>
                    <div style={{ padding: "0 0.5rem", display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {(localData.skills || []).map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', backgroundColor: "#f0f0f0", padding: "2px 6px", borderRadius: "4px", gap: '4px' }}>
                          <EditableField value={s} onChange={(v) => handleArrayFieldChange("skills", i, null, v)} isEditing={editMode} />
                          {editMode && <Trash2 size={10} style={{ cursor: 'pointer', color: 'red' }} onClick={() => removeItem('skills', i)} />}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* 5. LANGUAGES */}
                {(editMode || hasContent(localData.languages)) && (
                  <>
                    <div style={leftTitleStyle}>
                      LANGUAGES
                      {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('languages', '')} />}
                    </div>
                    <div style={{ padding: "0 0.5rem", display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {(localData.languages || []).map((l, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', backgroundColor: "#f9f9f9", padding: "2px 6px", borderRadius: "4px", gap: '4px', border: "1px solid #ddd" }}>
                          <EditableField value={l} onChange={(v) => handleArrayFieldChange("languages", i, null, v)} isEditing={editMode} />
                          {editMode && <Trash2 size={10} style={{ cursor: 'pointer', color: 'red' }} onClick={() => removeItem('languages', i)} />}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* 6. INTERESTS */}
                {(editMode || hasContent(localData.interests)) && (
                  <>
                    <div style={leftTitleStyle}>
                      INTERESTS
                      {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('interests', '')} />}
                    </div>
                    <div style={{ padding: "0 0.5rem", display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {(localData.interests || []).map((int, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', backgroundColor: "#f9f9f9", padding: "2px 6px", borderRadius: "4px", gap: '4px', border: "1px solid #eee" }}>
                          <EditableField value={int} onChange={(v) => handleArrayFieldChange("interests", i, null, v)} isEditing={editMode} />
                          {editMode && <Trash2 size={10} style={{ cursor: 'pointer', color: 'red' }} onClick={() => removeItem('interests', i)} />}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ flex: "1" }}>
                {/* 7. SUMMARY */}
                {(editMode || localData.summary) && (
                  <>
                    <div style={mainTitleStyle}>SUMMARY</div>
                    <div style={{ padding: "0 0.8rem" }}>
                      <EditableTextArea value={localData.summary} onChange={(v) => handleFieldChange("summary", v)} isEditing={editMode} />
                    </div>
                  </>
                )}

                {/* 8. EXPERIENCE */}
                {(editMode || hasContent(localData.experience)) && (
                  <>
                    <div style={mainTitleStyle}>
                      EXPERIENCE
                      {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('experience', { title: '', companyName: '', date: '', accomplishment: [] })} />}
                    </div>
                    {(localData.experience || []).map((exp, idx) => (
                      <div key={idx} style={{ marginBottom: "1.5rem", padding: "0 0.8rem", position: 'relative' }}>
                        {editMode && <Trash2 size={14} style={{ position: 'absolute', right: 0, top: 0, cursor: 'pointer', color: 'red' }} onClick={() => removeItem('experience', idx)} />}
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                          <span><EditableField value={exp.companyName || exp.company} onChange={(v) => handleArrayFieldChange("experience", idx, "companyName", v)} isEditing={editMode} /></span>
                          <span style={{ fontSize: "0.85rem", color: ACCENT_COLOR }}><EditableField value={exp.date} onChange={(v) => handleArrayFieldChange("experience", idx, "date", v)} isEditing={editMode} /></span>
                        </div>
                        <div style={{ fontStyle: "italic", fontSize: "0.95rem", color: ACCENT_COLOR }}><EditableField value={exp.title} onChange={(v) => handleArrayFieldChange("experience", idx, "title", v)} isEditing={editMode} /></div>
                        <EditableTextArea value={Array.isArray(exp.accomplishment) ? exp.accomplishment.join("\n") : exp.description} onChange={(v) => handleArrayFieldChange("experience", idx, "accomplishment", v.split("\n"))} isEditing={editMode} />
                      </div>
                    ))}
                  </>
                )}

                {/* 9. PROJECTS */}
                {(editMode || hasContent(localData.projects)) && (
                  <>
                    <div style={mainTitleStyle}>
                      PROJECTS
                      {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('projects', { name: '', description: '' })} />}
                    </div>
                    {(localData.projects || []).map((proj, idx) => (
                      <div key={idx} style={{ marginBottom: "1.2rem", padding: "0 0.8rem", position: 'relative' }}>
                        {editMode && <Trash2 size={14} style={{ position: 'absolute', right: 0, top: 0, cursor: 'pointer', color: 'red' }} onClick={() => removeItem('projects', idx)} />}
                        <div style={{ fontWeight: "bold" }}><EditableField value={proj.name} onChange={(v) => handleArrayFieldChange("projects", idx, "name", v)} isEditing={editMode} /></div>
                        <EditableTextArea value={proj.description} onChange={(v) => handleArrayFieldChange("projects", idx, "description", v)} isEditing={editMode} />
                      </div>
                    ))}
                  </>
                )}

                {/* ACHIEVEMENTS */}
                {(editMode || hasContent(localData.achievements)) && (
                  <>
                    <div style={mainTitleStyle}>
                      ACHIEVEMENTS
                      {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('achievements', '')} />}
                    </div>
                    <div style={{ padding: "0 0.8rem", fontSize: "0.9rem" }}>
                      {(localData.achievements || []).map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          {editMode && <Trash2 size={12} style={{ cursor: 'pointer', color: 'red' }} onClick={() => removeItem('achievements', i)} />}
                          <EditableField value={a} onChange={(v) => handleArrayFieldChange("achievements", i, null, v)} isEditing={editMode} />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* CERTIFICATIONS */}
                {(editMode || hasContent(localData.certifications)) && (
                  <>
                    <div style={mainTitleStyle}>
                      CERTIFICATIONS
                      {editMode && <Plus size={14} style={{ cursor: 'pointer' }} onClick={() => addItem('certifications', { title: '' })} />}
                    </div>
                    <div style={{ padding: "0 0.8rem", fontSize: "0.9rem" }}>
                      {(localData.certifications || []).map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          {editMode && <Trash2 size={12} style={{ cursor: 'pointer', color: 'red' }} onClick={() => removeItem('certifications', i)} />}
                          <EditableField value={c} onChange={(v) => handleArrayFieldChange("certifications", i, "title", v)} isEditing={editMode} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* EDIT CONTROLS */}
          <div data-html2canvas-ignore="true" style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            {editMode ? (
              <>
                <button onClick={handleSave} style={{ background: "#16a34a", color: "white", padding: "0.7rem 1.5rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Save Changes</button>
                <button onClick={handleCancel} style={{ background: "#ef4444", color: "white", padding: "0.7rem 1.5rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Cancel Edit</button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} style={{ background: ACCENT_COLOR, color: "white", padding: "0.7rem 2rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Edit Resume Content</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template24;