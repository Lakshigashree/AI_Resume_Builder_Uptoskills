/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import resumeService from "../../services/resumeService";
import { toast } from "react-toastify";
import { handleGlobalDownload } from "../../utils/downloadResume";
import {
  FaPhoneAlt, FaEnvelope, FaLinkedin, FaMapMarkerAlt,
  FaGithub, FaGlobe, FaAward, FaCertificate, FaProjectDiagram,
  FaGraduationCap
} from "react-icons/fa";

const Template21 = () => {
  const resumeRef = useRef(null);
  const { resumeData, updateResumeData } = useResume();
  const { isAuthenticated, getToken } = useAuth?.() || {};
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});

  useEffect(() => { setLocalData(resumeData || {}); }, [resumeData]);

  // --- SAFE RENDERING HELPER ---
  const renderSafeText = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") return val.name || val.title || val.degree || val.keyAchievements || "";
    return String(val);
  };

  const handleFieldChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    setLocalData((prev) => {
      const arr = [...(prev[section] || [])];
      if (!arr[index]) arr[index] = {};
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, [section]: arr };
    });
  };

  const handleSave = () => {
    if (typeof updateResumeData === "function") updateResumeData(localData);
    setEditMode(false);
    toast.success("Resume updated!");
  };

  const sectionTitleStyle = { fontWeight: "bold", fontSize: "1.1rem", borderBottom: "2px solid #87CEEB", color: "#000000", marginTop: "1rem", paddingBottom: "0.25rem", textTransform: "uppercase" };
  const sectionCardStyle = { backgroundColor: "#f8f9fa", padding: "0.8rem", borderRadius: "0.5rem", marginTop: "0.5rem", border: "1px solid #e9ecef" };
  const inputStyle = { width: "100%", border: "1px solid #87CEEB", borderRadius: "4px", padding: "6px", fontSize: "0.85rem", background: "#E6F3FF", marginBottom: "5px" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resumeRef={resumeRef} onDownload={() => handleGlobalDownload(resumeRef, localData.name)} />
        <div style={{ flexGrow: 1, padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <div ref={resumeRef} className="resume-page" style={{ maxWidth: "210mm", width: "100%", minHeight: "297mm", padding: "1.5rem", backgroundColor: "#ffffff", boxSizing: "border-box", position: "relative" }}>
            
            {/* HEADER */}
            <div style={{ backgroundColor: "#E6F3FF", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #87CEEB", textAlign: "center" }}>
              {editMode ? (
                <>
                  <input type="text" value={renderSafeText(localData.name)} onChange={(e) => handleFieldChange("name", e.target.value)} style={{ ...inputStyle, fontSize: "1.5rem", textAlign: "center" }} placeholder="Name" />
                  <input type="text" value={renderSafeText(localData.role)} onChange={(e) => handleFieldChange("role", e.target.value)} style={{ ...inputStyle, textAlign: "center" }} placeholder="Role" />
                </>
              ) : (
                <>
                  <h1 style={{ fontSize: "2rem", fontWeight: "bold", textTransform: "uppercase", margin: 0 }}>{renderSafeText(localData.name) || "FULL NAME"}</h1>
                  <h2 style={{ fontSize: "1.1rem", margin: "5px 0" }}>{renderSafeText(localData.role)}</h2>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1rem", marginTop: "10px", fontSize: "0.85rem" }}>
                {editMode ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", width: "100%" }}>
                    <input type="text" value={localData.phone || ""} onChange={(e) => handleFieldChange("phone", e.target.value)} style={inputStyle} placeholder="Phone" />
                    <input type="text" value={localData.email || ""} onChange={(e) => handleFieldChange("email", e.target.value)} style={inputStyle} placeholder="Email" />
                    <input type="text" value={localData.linkedin || ""} onChange={(e) => handleFieldChange("linkedin", e.target.value)} style={inputStyle} placeholder="LinkedIn" />
                    <input type="text" value={localData.github || ""} onChange={(e) => handleFieldChange("github", e.target.value)} style={inputStyle} placeholder="GitHub" />
                    <input type="text" value={localData.portfolio || ""} onChange={(e) => handleFieldChange("portfolio", e.target.value)} style={inputStyle} placeholder="Portfolio" />
                  </div>
                ) : (
                  <>
                    {localData.phone && <a href={`tel:${localData.phone}`} style={{ textDecoration: "none", color: "inherit" }}><FaPhoneAlt color="#87CEEB" /> {localData.phone}</a>}
                    {localData.email && <a href={`mailto:${localData.email}`} style={{ textDecoration: "none", color: "inherit" }}><FaEnvelope color="#87CEEB" /> {localData.email}</a>}
                    {localData.linkedin && <a href={localData.linkedin.startsWith("http") ? localData.linkedin : `https://${localData.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}><FaLinkedin color="#87CEEB" /> LinkedIn</a>}
                    {localData.github && <a href={localData.github.startsWith("http") ? localData.github : `https://${localData.github}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}><FaGithub color="#87CEEB" /> GitHub</a>}
                    {localData.portfolio && <a href={localData.portfolio.startsWith("http") ? localData.portfolio : `https://${localData.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}><FaGlobe color="#87CEEB" /> Portfolio</a>}
                  </>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1.5rem" }}>
              {/* LEFT COLUMN */}
              <div style={{ width: "35%" }}>
                <h3 style={sectionTitleStyle}>Skills</h3>
                <div style={sectionCardStyle}>
                  {editMode ? (
                    <textarea value={Array.isArray(localData.skills) ? localData.skills.join(", ") : ""} onChange={(e) => handleFieldChange("skills", e.target.value.split(","))} style={inputStyle} />
                  ) : (
                    localData.skills?.map((s, i) => <div key={i}>• {renderSafeText(s)}</div>)
                  )}
                </div>

                <h3 style={sectionTitleStyle}>Languages</h3>
                <div style={sectionCardStyle}>
                  {editMode ? <input type="text" value={Array.isArray(localData.languages) ? localData.languages.join(", ") : ""} onChange={(e) => handleFieldChange("languages", e.target.value.split(","))} style={inputStyle} /> : <span>{localData.languages?.join(", ")}</span>}
                </div>

                {/* ACHIEVEMENTS */}
                <h3 style={sectionTitleStyle}>Achievements</h3>
                <div style={sectionCardStyle}>
                  {editMode ? (
                    <textarea value={Array.isArray(localData.achievements) ? localData.achievements.map(a => a.keyAchievements || a).join("\n") : ""} onChange={(e) => handleFieldChange("achievements", e.target.value.split("\n").map(val => ({ keyAchievements: val })))} style={{ ...inputStyle, minHeight: "80px" }} />
                  ) : (
                    localData.achievements?.map((a, i) => <div key={i}>★ {renderSafeText(a.keyAchievements || a)}</div>)
                  )}
                </div>

                <h3 style={sectionTitleStyle}>Interests</h3>
                <div style={sectionCardStyle}>
                  {editMode ? <input type="text" value={Array.isArray(localData.interests) ? localData.interests.join(", ") : ""} onChange={(e) => handleFieldChange("interests", e.target.value.split(","))} style={inputStyle} /> : <span>{localData.interests?.join(", ")}</span>}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ width: "65%" }}>
                <h3 style={sectionTitleStyle}>Summary</h3>
                <div style={sectionCardStyle}>
                  {editMode ? <textarea value={renderSafeText(localData.summary)} onChange={(e) => handleFieldChange("summary", e.target.value)} style={{ ...inputStyle, minHeight: "80px" }} /> : <p style={{ fontSize: "0.85rem", margin: 0 }}>{localData.summary}</p>}
                </div>

                <h3 style={sectionTitleStyle}>Experience</h3>
                {(localData.experience || []).map((exp, i) => (
                  <div key={i} style={sectionCardStyle}>
                    {editMode ? (
                      <>
                        <input value={renderSafeText(exp.title)} onChange={(e) => handleArrayFieldChange("experience", i, "title", e.target.value)} style={inputStyle} placeholder="Title" />
                        <input value={renderSafeText(exp.companyName)} onChange={(e) => handleArrayFieldChange("experience", i, "companyName", e.target.value)} style={inputStyle} placeholder="Company" />
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: "bold" }}>{renderSafeText(exp.title)}</div>
                        <div style={{ fontSize: "0.85rem" }}>{renderSafeText(exp.companyName)} | {renderSafeText(exp.date)}</div>
                      </>
                    )}
                  </div>
                ))}

                {/* EDUCATION */}
                <h3 style={sectionTitleStyle}>Education</h3>
                {(localData.education || []).map((edu, i) => (
                  <div key={i} style={sectionCardStyle}>
                    {editMode ? (
                      <>
                        <input value={renderSafeText(edu.degree)} onChange={(e) => handleArrayFieldChange("education", i, "degree", e.target.value)} style={inputStyle} placeholder="Degree" />
                        <input value={renderSafeText(edu.institution)} onChange={(e) => handleArrayFieldChange("education", i, "institution", e.target.value)} style={inputStyle} placeholder="Institution" />
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: "bold" }}>{renderSafeText(edu.degree)}</div>
                        <div style={{ fontSize: "0.85rem" }}>{renderSafeText(edu.institution)} | {renderSafeText(edu.duration)}</div>
                      </>
                    )}
                  </div>
                ))}

                <h3 style={sectionTitleStyle}>Projects</h3>
                {(localData.projects || []).map((proj, i) => (
                  <div key={i} style={sectionCardStyle}>
                    {editMode ? (
                      <>
                        <input value={renderSafeText(proj.name)} onChange={(e) => handleArrayFieldChange("projects", i, "name", e.target.value)} style={inputStyle} placeholder="Project Name" />
                        <textarea value={renderSafeText(proj.description)} onChange={(e) => handleArrayFieldChange("projects", i, "description", e.target.value)} style={inputStyle} placeholder="Description" />
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: "bold" }}>{renderSafeText(proj.name)}</div>
                        <p style={{ fontSize: "0.8rem", margin: "4px 0" }}>{renderSafeText(proj.description)}</p>
                      </>
                    )}
                  </div>
                ))}

                <h3 style={sectionTitleStyle}>Certifications</h3>
                {(localData.certifications || []).map((cert, i) => (
                  <div key={i} style={sectionCardStyle}>
                    {editMode ? (
                      <input value={renderSafeText(cert.title)} onChange={(e) => handleArrayFieldChange("certifications", i, "title", e.target.value)} style={inputStyle} placeholder="Certification" />
                    ) : (
                      <div style={{ fontSize: "0.85rem" }}>• {renderSafeText(cert.title || cert.name)} - {renderSafeText(cert.issuer || cert.organization)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div data-html2canvas-ignore="true" style={{ marginTop: "1.5rem" }}>
            {editMode ? (
              <button onClick={handleSave} style={{ backgroundColor: "#16a34a", color: "#fff", padding: "10px 25px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Save Changes</button>
            ) : (
              <button onClick={() => setEditMode(true)} style={{ backgroundColor: "#87CEEB", padding: "10px 25px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Edit Resume</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template21;