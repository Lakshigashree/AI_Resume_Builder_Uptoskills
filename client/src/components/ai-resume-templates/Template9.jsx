/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { 
  FaPlus, FaTrash, FaPhone, FaEnvelope, 
  FaLinkedin, FaGithub, FaGlobe, FaMapMarkerAlt 
} from "react-icons/fa";
import { toast } from 'react-toastify';
import html2pdf from "html2pdf.js";

// ---------- DATA HELPERS ----------
const normalizeUrl = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  return trimmed.startsWith("http") ? trimmed : "https://" + trimmed;
};

const safeArray = (v) => (Array.isArray(v) ? v : []);

const hasText = (val) => (typeof val === "string" && val.trim().length > 0);

const Template9 = () => {
  const resumeRef = useRef(null);
  const { resumeData, setResumeData, updateResumeData, sectionOrder } = useResume();
  const [editMode, setEditMode] = useState(false);
  
  const [localData, setLocalData] = useState(() => ({
    ...resumeData,
    skills: resumeData?.skills || [],
    experience: resumeData?.experience || [],
    achievements: resumeData?.achievements || [],
    education: resumeData?.education || [],
    certifications: resumeData?.certifications || [],
    languages: resumeData?.languages || [],
    projects: resumeData?.projects || [],
    interests: resumeData?.interests || [],
  }));

  const [activeSection, setActiveSection] = useState(null);

  // Sync with global context
  useEffect(() => {
    if (resumeData) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
    }
  }, [resumeData]);

  // ---------- RENDER SAFE HELPER (Prevents Object Crash) ----------
  const renderSafe = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val.title || val.name || val.degree || val.language || val.label || "";
  };

  const hasContent = (key) => {
    if (editMode) return true;
    const val = localData[key];
    if (Array.isArray(val)) return val.length > 0;
    return hasText(val);
  };

  // ---------- HANDLERS ----------
  const handleFieldChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldUpdate = (section, index, value, key = null) => {
    const updatedArray = [...(localData[section] || [])];
    if (key) {
      updatedArray[index] = { ...updatedArray[index], [key]: value };
    } else {
      updatedArray[index] = value;
    }
    setLocalData(prev => ({ ...prev, [section]: updatedArray }));
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
      if (typeof updateResumeData === 'function') {
        await updateResumeData(localData);
      } else if (typeof setResumeData === 'function') {
        setResumeData(localData);
      }
      setEditMode(false);
      setActiveSection(null);
      toast.success("✅ Resume saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("❌ Failed to save changes.");
    }
  };

  const handleCancel = () => {
    setLocalData(JSON.parse(JSON.stringify(resumeData)));
    setEditMode(false);
    setActiveSection(null);
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

  // ---------- STYLING OBJECTS ----------
  const styles = {
    sectionBox: { marginBottom: "2.5rem", position: "relative" },
    headerText: { 
      fontSize: "1.25rem", 
      fontWeight: "bold", 
      borderBottom: "3px solid #3b82f6", 
      color: "#1e40af", 
      paddingBottom: "8px", 
      marginBottom: "18px", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      textTransform: "uppercase",
      letterSpacing: "1px"
    },
    editContainer: { 
      background: "#f8fafc", 
      border: "1px dashed #3b82f6", 
      padding: "20px", 
      borderRadius: "8px", 
      marginBottom: "15px" 
    },
    input: { 
      width: "100%", 
      padding: "10px", 
      border: "1px solid #cbd5e1", 
      borderRadius: "4px", 
      marginBottom: "10px", 
      fontSize: "0.95rem" 
    },
    addBtn: { 
      background: "#1e40af", 
      color: "white", 
      border: "none", 
      borderRadius: "4px", 
      padding: "5px 12px", 
      cursor: "pointer", 
      fontSize: "0.85rem", 
      display: "flex", 
      alignItems: "center", 
      gap: "6px" 
    },
    removeBtn: { 
      color: "#ef4444", 
      background: "none", 
      border: "none", 
      cursor: "pointer", 
      fontSize: "0.9rem", 
      fontWeight: "600", 
      display: "flex", 
      alignItems: "center", 
      gap: "5px",
      marginTop: "5px"
    }
  };

  // ---------- SECTION COMPONENTS MAP ----------

  const sectionComponents = {
    summary: hasContent("summary") && (
      <div key="summary" style={styles.sectionBox} onClick={(e) => { e.stopPropagation(); setActiveSection("summary"); }}>
        <h3 style={styles.headerText}>Professional Summary</h3>
        {editMode ? (
          <textarea 
            value={localData.summary} 
            onChange={(e) => handleFieldChange("summary", e.target.value)} 
            style={{ ...styles.input, minHeight: "120px" }} 
          />
        ) : (
          <p style={{ lineHeight: "1.7", color: "#374151", textAlign: "justify", margin: 0 }}>{localData.summary}</p>
        )}
      </div>
    ),

    skills: hasContent("skills") && (
      <div key="skills" style={styles.sectionBox} onClick={(e) => { e.stopPropagation(); setActiveSection("skills"); }}>
        <div style={styles.headerText}>
          <span>Skills</span>
          {editMode && <button onClick={() => addItem("skills", "")} style={styles.addBtn}><FaPlus /> Add Skill</button>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {safeArray(localData.skills).map((skill, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#eff6ff", padding: "6px 15px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
              {editMode ? (
                <input 
                  value={renderSafe(skill)} 
                  onChange={(e) => handleArrayFieldUpdate("skills", i, e.target.value)} 
                  style={{ border: "none", background: "transparent", width: "100px", outline: "none" }} 
                />
              ) : <span style={{fontWeight: "600", color: "#1e40af"}}>{renderSafe(skill)}</span>}
              {editMode && <FaTrash onClick={() => removeItem("skills", i)} style={{ color: "#ef4444", cursor: "pointer", fontSize: "12px" }} />}
            </div>
          ))}
        </div>
      </div>
    ),

    experience: hasContent("experience") && (
      <div key="experience" style={styles.sectionBox} onClick={(e) => { e.stopPropagation(); setActiveSection("experience"); }}>
        <div style={styles.headerText}>
          <span>Work Experience</span>
          {editMode && <button onClick={() => addItem("experience", { title: "", companyName: "", description: "", date: "" })} style={styles.addBtn}><FaPlus /> Add Block</button>}
        </div>
        {safeArray(localData.experience).map((exp, i) => (
          <div key={i} style={editMode ? styles.editContainer : { marginBottom: "20px" }}>
            {editMode ? (
              <>
                <input style={styles.input} value={renderSafe(exp.title)} onChange={(e) => handleArrayFieldUpdate("experience", i, e.target.value, "title")} placeholder="Job Title" />
                <input style={styles.input} value={renderSafe(exp.companyName)} onChange={(e) => handleArrayFieldUpdate("experience", i, e.target.value, "companyName")} placeholder="Company Name" />
                <input style={styles.input} value={renderSafe(exp.date)} onChange={(e) => handleArrayFieldUpdate("experience", i, e.target.value, "date")} placeholder="Duration" />
                <textarea style={{ ...styles.input, minHeight: "80px" }} value={renderSafe(exp.description)} onChange={(e) => handleArrayFieldUpdate("experience", i, e.target.value, "description")} placeholder="Responsibilities" />
                <button onClick={() => removeItem("experience", i)} style={styles.removeBtn}><FaTrash /> Remove Block</button>
              </>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                  <span style={{fontSize: "1.1rem"}}>{renderSafe(exp.title)}</span>
                  <span style={{color: "#6b7280"}}>{exp.date}</span>
                </div>
                <div style={{ color: "#2563eb", fontWeight: "600", marginBottom: "5px" }}>{renderSafe(exp.companyName)}</div>
                <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: "1.6" }}>{renderSafe(exp.description)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    ),

    education: hasContent("education") && (
      <div key="education" style={styles.sectionBox} onClick={(e) => { e.stopPropagation(); setActiveSection("education"); }}>
        <div style={styles.headerText}>
          <span>Education</span>
          {editMode && <button onClick={() => addItem("education", { degree: "", institution: "", duration: "" })} style={styles.addBtn}><FaPlus /> Add Education</button>}
        </div>
        {safeArray(localData.education).map((edu, i) => (
          <div key={i} style={editMode ? styles.editContainer : { marginBottom: "15px" }}>
            {editMode ? (
              <>
                <input style={styles.input} value={renderSafe(edu.degree)} onChange={(e) => handleArrayFieldUpdate("education", i, e.target.value, "degree")} placeholder="Degree" />
                <input style={styles.input} value={renderSafe(edu.institution)} onChange={(e) => handleArrayFieldUpdate("education", i, e.target.value, "institution")} placeholder="Institution" />
                <input style={styles.input} value={renderSafe(edu.duration)} onChange={(e) => handleArrayUpdate("education", i, e.target.value, "duration")} placeholder="Year" />
                <button onClick={() => removeItem("education", i)} style={styles.removeBtn}><FaTrash /> Remove Block</button>
              </>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "1.05rem" }}>{renderSafe(edu.degree)}</div>
                  <div style={{ color: "#4b5563" }}>{renderSafe(edu.institution)}</div>
                </div>
                <div style={{ fontWeight: "bold", color: "#1e40af" }}>{edu.duration}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    ),

    projects: hasContent("projects") && (
      <div key="projects" style={styles.sectionBox} onClick={(e) => { e.stopPropagation(); setActiveSection("projects"); }}>
        <div style={styles.headerText}>
          <span>Projects</span>
          {editMode && <button onClick={() => addItem("projects", { name: "", description: "", link: "" })} style={styles.addBtn}><FaPlus /> Add Project</button>}
        </div>
        {safeArray(localData.projects).map((proj, i) => (
          <div key={i} style={editMode ? styles.editContainer : { marginBottom: "20px" }}>
            {editMode ? (
              <>
                <input style={{...styles.input, fontWeight: "bold"}} value={renderSafe(proj.name)} onChange={(e) => handleArrayFieldUpdate("projects", i, e.target.value, "name")} placeholder="Project Name" />
                <textarea style={styles.input} value={renderSafe(proj.description)} onChange={(e) => handleArrayFieldUpdate("projects", i, e.target.value, "description")} placeholder="Details" />
                <input style={styles.input} value={renderSafe(proj.link)} onChange={(e) => handleArrayFieldUpdate("projects", i, e.target.value, "link")} placeholder="Live Link" />
                <button onClick={() => removeItem("projects", i)} style={styles.removeBtn}><FaTrash /> Remove Block</button>
              </>
            ) : (
              <div>
                <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{renderSafe(proj.name)}</div>
                <p style={{ margin: "5px 0", color: "#4b5563" }}>{renderSafe(proj.description)}</p>
                {proj.link && <a href={normalizeUrl(proj.link)} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontWeight: "bold", fontSize: "0.85rem" }}>View Project</a>}
              </div>
            )}
          </div>
        ))}
      </div>
    ),

    certifications: hasContent("certifications") && (
      <div key="certifications" style={styles.sectionBox}>
        <div style={styles.headerText}>
          <span>Certifications</span>
          {editMode && <button onClick={() => addItem("certifications", { title: "" })} style={styles.addBtn}><FaPlus /> Add</button>}
        </div>
        {safeArray(localData.certifications).map((cert, i) => (
          <div key={i} style={editMode ? styles.editContainer : { marginBottom: "8px" }}>
            {editMode ? (
              <>
                <input style={styles.input} value={renderSafe(cert.title)} onChange={(e) => handleArrayFieldUpdate("certifications", i, e.target.value, "title")} />
                <button onClick={() => removeItem("certifications", i)} style={styles.removeBtn}><FaTrash /> Remove</button>
              </>
            ) : <div style={{fontWeight: "500"}}>• {renderSafe(cert.title)}</div>}
          </div>
        ))}
      </div>
    ),

    achievements: hasContent("achievements") && (
      <div key="achievements" style={styles.sectionBox}>
        <div style={styles.headerText}>
          <span>Achievements</span>
          {editMode && <button onClick={() => addItem("achievements", "")} style={styles.addBtn}><FaPlus /> Add</button>}
        </div>
        <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
          {safeArray(localData.achievements).map((ach, i) => (
            <li key={i} style={editMode ? {listStyle: "none"} : { marginBottom: "8px" }}>
              {editMode ? (
                <div style={styles.editContainer}>
                  <input style={styles.input} value={renderSafe(ach)} onChange={(e) => handleArrayFieldUpdate("achievements", i, e.target.value)} />
                  <button onClick={() => removeItem("achievements", i)} style={styles.removeBtn}><FaTrash /> Remove</button>
                </div>
              ) : <span style={{color: "#374151"}}>{renderSafe(ach)}</span>}
            </li>
          ))}
        </ul>
      </div>
    ),

    languages: hasContent("languages") && (
      <div key="languages" style={styles.sectionBox}>
        <h3 style={styles.headerText}>Languages</h3>
        {editMode ? (
          <input value={localData.languages?.join(", ")} onChange={(e) => handleFieldChange("languages", e.target.value.split(","))} style={styles.input} />
        ) : <p style={{fontWeight: "500"}}>{localData.languages?.join(" • ")}</p>}
      </div>
    ),

    interests: hasContent("interests") && (
      <div key="interests" style={styles.sectionBox}>
        <h3 style={styles.headerText}>Interests</h3>
        {editMode ? (
          <input value={localData.interests?.join(", ")} onChange={(e) => handleFieldChange("interests", e.target.value.split(","))} style={styles.input} />
        ) : <p style={{color: "#4b5563"}}>{localData.interests?.join(" • ")}</p>}
      </div>
    ),
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onDownload={handleDownload} resumeRef={resumeRef} />
        <div style={{ flexGrow: 1, padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div ref={resumeRef} style={{ backgroundColor: "#fff", width: "794px", minHeight: "1123px", padding: "60px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)", position: "relative", boxSizing: "border-box" }}>
            
            {/* Header Section */}
            <div style={{ textAlign: "center", borderBottom: "4px solid #1e40af", paddingBottom: "25px", marginBottom: "35px" }}>
              {editMode ? (
                <div style={{ display: "grid", gap: "10px", maxWidth: "600px", margin: "0 auto" }}>
                  <input style={{ fontSize: "2.5rem", fontWeight: "bold", textAlign: "center", border: "1px solid #3b82f6" }} value={localData.name} onChange={(e) => handleFieldChange("name", e.target.value)} />
                  <input style={{ fontSize: "1.2rem", textAlign: "center", color: "#3b82f6", fontWeight: "600" }} value={localData.role} onChange={(e) => handleFieldChange("role", e.target.value)} />
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: "3rem", fontWeight: "900", margin: 0, textTransform: "uppercase", letterSpacing: "2px" }}>{localData.name}</h1>
                  <h2 style={{ fontSize: "1.4rem", color: "#3b82f6", margin: "8px 0", fontWeight: "700", textTransform: "uppercase" }}>{localData.role}</h2>
                </>
              )}

              {/* 5 Editable Redirecting Links */}
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "20px", marginTop: "20px", fontSize: "0.95rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaPhone color="#2563eb" />
                  {editMode ? <input style={{width:"120px"}} value={localData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} /> : <a href={`tel:${localData.phone}`} style={{textDecoration: "none", color: "#4b5563"}}>{localData.phone}</a>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaEnvelope color="#2563eb" />
                  {editMode ? <input value={localData.email} onChange={(e) => handleFieldChange("email", e.target.value)} /> : <a href={`mailto:${localData.email}`} style={{textDecoration: "none", color: "#4b5563"}}>{localData.email}</a>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaLinkedin color="#2563eb" />
                  {editMode ? <input value={localData.linkedin} onChange={(e) => handleFieldChange("linkedin", e.target.value)} /> : <a href={normalizeUrl(localData.linkedin)} target="_blank" rel="noreferrer" style={{textDecoration: "none", color: "#4b5563"}}>LinkedIn</a>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaGithub color="#2563eb" />
                  {editMode ? <input value={localData.github} onChange={(e) => handleFieldChange("github", e.target.value)} /> : <a href={normalizeUrl(localData.github)} target="_blank" rel="noreferrer" style={{textDecoration: "none", color: "#4b5563"}}>GitHub</a>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaGlobe color="#2563eb" />
                  {editMode ? <input value={localData.portfolio} onChange={(e) => handleFieldChange("portfolio", e.target.value)} /> : <a href={normalizeUrl(localData.portfolio)} target="_blank" rel="noreferrer" style={{textDecoration: "none", color: "#4b5563"}}>Portfolio</a>}
                </div>
              </div>
            </div>

            {/* DYNAMIC SECTIONS LIST */}
            <div>{sectionOrder.map((key) => sectionComponents[key] || null)}</div>

            {/* ACTION BUTTONS (Excluded from PDF) */}
            <div data-html2canvas-ignore="true" style={{ textAlign: "center", marginTop: "50px", paddingBottom: "40px" }}>
              {editMode ? (
                <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                  <button onClick={handleSave} style={{ backgroundColor: "#10b981", color: "white", padding: "14px 40px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>SAVE CHANGES</button>
                  <button onClick={handleCancel} style={{ backgroundColor: "#6b7280", color: "white", padding: "14px 40px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>CANCEL</button>
                </div>
              ) : (
                <button onClick={() => setEditMode(true)} style={{ backgroundColor: "#1e40af", color: "white", padding: "16px 80px", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "1.2rem" }}>EDIT RESUME</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template9;