/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faMapMarkerAlt, faGlobe, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import { toast } from 'react-toastify';

// 🔹 Helpers from config
import { hasContent, getSafeUrl } from "../../utils/ResumeConfig";

const safeArray = (v) => (Array.isArray(v) ? v : []);

const Template6 = () => {
  const resumeRef = useRef(null);
  const context = useResume();
  
  if (!context) return <div style={{textAlign: "center", padding: "50px"}}>Loading Context...</div>;

  const { resumeData, updateResumeData, sectionOrder } = context;

  // --- STATE ---
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});
  const [headingColor, setHeadingColor] = useState("#2563eb");
  const colorInputRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (resumeData) setLocalData(JSON.parse(JSON.stringify(resumeData)));
  }, [resumeData]);

  // --- HANDLERS ---
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
    setLocalData(prev => ({ ...prev, [section]: [...(prev[section] || []), template] }));
  };

  const removeItem = (section, index) => {
    setLocalData(prev => ({ ...prev, [section]: (prev[section] || []).filter((_, i) => i !== index) }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFieldChange("photo", reader.result);
      };
      reader.readAsDataURL(file);
    }
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

  // --- STYLES ---
  const sectionTitleStyle = {
    fontSize: "1.25rem", fontWeight: "700", color: headingColor,
    borderBottom: `2px solid ${headingColor}`, paddingBottom: "5px",
    marginBottom: "1rem", display: "flex", justifyContent: "space-between",
    alignItems: "center", textTransform: "uppercase"
  };

  const editBoxStyle = editMode ? {
    border: "1px dashed #3b82f6", backgroundColor: "#f0f7ff", padding: "15px", borderRadius: "8px", marginBottom: "15px"
  } : { marginBottom: "1.5rem" };

  const inputStyle = { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "5px" };

  // --- 🔹 DYNAMIC SECTION COMPONENTS MAP 🔹 ---
  const sectionComponents = {
    summary: hasContent(localData, "summary", editMode) && (
      <div key="summary" style={editBoxStyle}>
        <h3 style={sectionTitleStyle}>Professional Summary</h3>
        {editMode ? (
          <textarea style={{ ...inputStyle, minHeight: "100px" }} value={localData.summary} onChange={(e) => handleFieldChange("summary", e.target.value)} />
        ) : <div style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>{localData.summary}</div>}
      </div>
    ),
    skills: hasContent(localData, "skills", editMode) && (
      <div key="skills" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Skills
          {editMode && <button onClick={() => addItem("skills", "")} style={{ fontSize: "11px", background: headingColor, color: "white", border: "none", padding: "2px 8px" }}>+</button>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {safeArray(localData.skills).map((s, i) => (
            <div key={i} style={{ backgroundColor: "#e5e7eb", padding: "0.25rem 0.75rem", borderRadius: "0.25rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px" }}>
              {editMode ? <input style={{ border: "none", background: "transparent", width: "80px" }} value={renderSafe(s)} onChange={(e) => handleArrayUpdate("skills", i, e.target.value)} /> : renderSafe(s)}
              {editMode && <FontAwesomeIcon icon={faTrash} onClick={() => removeItem("skills", i)} style={{ color: "red", fontSize: "10px", cursor: "pointer" }} />}
            </div>
          ))}
        </div>
      </div>
    ),
    experience: hasContent(localData, "experience", editMode) && (
      <div key="experience" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Experience
          {editMode && <button onClick={() => addItem("experience", { title: "", companyName: "", date: "", description: "" })} style={{ fontSize: "11px", background: headingColor, color: "white", border: "none", padding: "2px 8px" }}>+</button>}
        </div>
        {safeArray(localData.experience).map((exp, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input style={inputStyle} value={renderSafe(exp.title)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "title")} placeholder="Job Title" />
                <input style={inputStyle} value={renderSafe(exp.companyName)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "companyName")} placeholder="Company" />
                <textarea style={inputStyle} value={renderSafe(exp.description)} onChange={(e) => handleArrayUpdate("experience", i, e.target.value, "description")} />
                <button onClick={() => removeItem("experience", i)} style={{ color: "red", border: "none", background: "none", textAlign: "left", fontSize: "0.7rem" }}>Remove Block</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}><span>{renderSafe(exp.companyName)}</span><span>{exp.date}</span></div>
                <div style={{ fontStyle: "italic", fontSize: "0.9rem" }}>{renderSafe(exp.title)}</div>
                <div style={{ fontSize: "0.9rem" }}>{renderSafe(exp.description)}</div>
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
          {editMode && <button onClick={() => addItem("education", { degree: "", institution: "", duration: "" })} style={{ fontSize: "11px", background: headingColor, color: "white", border: "none", padding: "2px 8px" }}>+</button>}
        </div>
        {safeArray(localData.education).map((edu, i) => (
          <div key={i} style={{ marginBottom: "0.75rem" }}>
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input style={inputStyle} value={renderSafe(edu.institution)} onChange={(e) => handleArrayUpdate("education", i, e.target.value, "institution")} />
                <input style={inputStyle} value={renderSafe(edu.degree)} onChange={(e) => handleArrayUpdate("education", i, e.target.value, "degree")} />
                <button onClick={() => removeItem("education", i)} style={{ color: "red", border: "none", background: "none", textAlign: "left" }}>Remove</button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><span style={{ fontWeight: "bold" }}>{renderSafe(edu.institution)}</span> — {renderSafe(edu.degree)}</div>
                <span>{edu.duration}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    ),
    projects: hasContent(localData, "projects", editMode) && (
      <div key="projects" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Projects
          {editMode && <button onClick={() => addItem("projects", { name: "", description: "" })} style={{ fontSize: "11px", background: headingColor, color: "white", border: "none", padding: "2px 8px" }}>+</button>}
        </div>
        {safeArray(localData.projects).map((prj, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            {editMode ? (
              <div style={{ display: "grid", gap: "5px" }}>
                <input style={inputStyle} value={renderSafe(prj.name)} onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "name")} />
                <textarea style={inputStyle} value={renderSafe(prj.description)} onChange={(e) => handleArrayUpdate("projects", i, e.target.value, "description")} />
                <button onClick={() => removeItem("projects", i)} style={{ color: "red", border: "none", background: "none", textAlign: "left" }}>Remove</button>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: "bold" }}>{renderSafe(prj.name)}</div>
                <div style={{ fontSize: "0.9rem" }}>{renderSafe(prj.description)}</div>
              </>
            )}
          </div>
        ))}
      </div>
    ),
    certifications: hasContent(localData, "certifications", editMode) && (
      <div key="certifications" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Certifications
          {editMode && <button onClick={() => addItem("certifications", { title: "" })} style={{ fontSize: "11px", background: headingColor, color: "white", border: "none", padding: "2px 8px" }}>+</button>}
        </div>
        {safeArray(localData.certifications).map((cert, i) => (
          <div key={i} style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
            {editMode ? <input style={inputStyle} value={renderSafe(cert.title)} onChange={(e) => handleArrayUpdate("certifications", i, e.target.value, "title")} /> : <div>• {renderSafe(cert.title)}</div>}
            {editMode && <FontAwesomeIcon icon={faTrash} onClick={() => removeItem("certifications", i)} style={{ color: "red", cursor: "pointer" }} />}
          </div>
        ))}
      </div>
    ),
    achievements: hasContent(localData, "achievements", editMode) && (
      <div key="achievements" style={editBoxStyle}>
        <div style={sectionTitleStyle}>
          Achievements
          {editMode && <button onClick={() => addItem("achievements", "")} style={{ fontSize: "11px", background: headingColor, color: "white", border: "none", padding: "2px 8px" }}>+</button>}
        </div>
        {safeArray(localData.achievements).map((ach, i) => (
          <div key={i} style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
            {editMode ? <input style={inputStyle} value={renderSafe(ach)} onChange={(e) => handleArrayUpdate("achievements", i, e.target.value)} /> : <li>{renderSafe(ach)}</li>}
            {editMode && <FontAwesomeIcon icon={faTrash} onClick={() => removeItem("achievements", i)} style={{ color: "red", cursor: "pointer" }} />}
          </div>
        ))}
      </div>
    ),
    languages: hasContent(localData, "languages", editMode) && (
      <div key="languages" style={editBoxStyle}>
        <h3 style={sectionTitleStyle}>Languages</h3>
        {editMode ? <input style={inputStyle} value={localData.languages?.join(", ")} onChange={(e) => handleFieldChange("languages", e.target.value.split(","))} /> : <p>{localData.languages?.join(" • ")}</p>}
      </div>
    ),
    interests: hasContent(localData, "interests", editMode) && (
      <div key="interests" style={editBoxStyle}>
        <h3 style={sectionTitleStyle}>Interests</h3>
        {editMode ? <input style={inputStyle} value={localData.interests?.join(", ")} onChange={(e) => handleFieldChange("interests", e.target.value.split(","))} /> : <p>{localData.interests?.join(" • ")}</p>}
      </div>
    ),
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onDownload={handleDownload} resumeRef={resumeRef} />

        <div style={{ flexGrow: 1, padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div ref={resumeRef} style={{ backgroundColor: "#fff", width: "794px", minHeight: "1123px", padding: "50px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", borderRadius: "4px", position: "relative" }}>
            
            {/* 🔹 PHOTO SECTION (REMOVES IF EMPTY IN VIEW MODE) 🔹 */}
            {(editMode || localData?.photo) && (
              <div style={{ position: "absolute", top: "50px", right: "50px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                {localData?.photo ? (
                  <img src={localData.photo} alt="Profile" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${headingColor}` }} />
                ) : editMode && (
                  <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "2px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", textAlign: "center" }}>No Photo</div>
                )}
                {editMode && (
                  <>
                    <button onClick={() => photoInputRef.current.click()} style={{ fontSize: "10px", padding: "4px 8px", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Upload Photo</button>
                    {localData?.photo && <button onClick={() => handleFieldChange("photo", "")} style={{ fontSize: "10px", padding: "4px 8px", background: "red", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Remove</button>}
                  </>
                )}
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
              </div>
            )}

            {/* HEADER */}
            <div style={{ marginRight: localData?.photo || editMode ? "120px" : "0", marginBottom: "30px" }}>
              {editMode ? (
                <div style={{ display: "grid", gap: "10px" }}>
                  <input style={{ fontSize: "2rem", fontWeight: "bold", border: "none", background: "#f0f7ff" }} value={localData.name} onChange={(e) => handleFieldChange("name", e.target.value)} />
                  <input style={{ fontSize: "1.2rem", color: headingColor }} value={localData.role} onChange={(e) => handleFieldChange("role", e.target.value)} />
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#111827", margin: 0 }}>{localData.name}</h1>
                  <h2 style={{ fontSize: "1.5rem", color: headingColor, margin: "5px 0" }}>{localData.role}</h2>
                </>
              )}

              {/* CONTACT LINKS */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "15px", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <FontAwesomeIcon icon={faPhone} />
                  {editMode ? <input value={localData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} style={{width: "110px"}} /> : <a href={`tel:${localData.phone}`} style={{textDecoration: "none", color: "inherit"}}>{localData.phone}</a>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <FontAwesomeIcon icon={faEnvelope} />
                  {editMode ? <input value={localData.email} onChange={(e) => handleFieldChange("email", e.target.value)} /> : <a href={`mailto:${localData.email}`} style={{textDecoration: "none", color: "inherit"}}>{localData.email}</a>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <FontAwesomeIcon icon={faLinkedin} />
                  {editMode ? <input value={localData.linkedin} onChange={(e) => handleFieldChange("linkedin", e.target.value)} /> : <a href={getSafeUrl("linkedin", localData.linkedin)} target="_blank" rel="noreferrer" style={{textDecoration: "none", color: "inherit"}}>LinkedIn</a>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <FontAwesomeIcon icon={faGithub} />
                  {editMode ? <input value={localData.github} onChange={(e) => handleFieldChange("github", e.target.value)} /> : <a href={getSafeUrl("github", localData.github)} target="_blank" rel="noreferrer" style={{textDecoration: "none", color: "inherit"}}>GitHub</a>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <FontAwesomeIcon icon={faGlobe} />
                  {editMode ? <input value={localData.portfolio} onChange={(e) => handleFieldChange("portfolio", e.target.value)} /> : <a href={getSafeUrl("portfolio", localData.portfolio)} target="_blank" rel="noreferrer" style={{textDecoration: "none", color: "inherit"}}>Portfolio</a>}
                </div>
              </div>
            </div>

            {/* DYNAMIC BODY */}
            <div>
              {(sectionOrder || []).map((key) => sectionComponents[key] || null)}
            </div>

            {/* ACTION BUTTONS */}
            <div data-html2canvas-ignore="true" style={{ textAlign: "center", marginTop: "50px" }}>
              {editMode ? (
                <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                  <button onClick={() => colorInputRef.current.click()} style={{ background: headingColor, color: "white", padding: "10px 20px", borderRadius: "4px", border: "none", cursor: "pointer" }}>Pick Color</button>
                  <button onClick={handleSave} style={{ background: "#10b981", color: "white", padding: "10px 30px", borderRadius: "4px", border: "none", cursor: "pointer" }}>Save</button>
                  <button onClick={handleCancel} style={{ background: "#6b7280", color: "white", padding: "10px 30px", borderRadius: "4px", border: "none", cursor: "pointer" }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setEditMode(true)} style={{ background: headingColor, color: "white", padding: "12px 50px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Edit Resume</button>
              )}
              <input ref={colorInputRef} type="color" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} style={{ display: "none" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template6;