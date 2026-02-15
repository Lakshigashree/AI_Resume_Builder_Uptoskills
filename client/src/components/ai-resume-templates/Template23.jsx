/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { MapPin, Phone, Mail, Linkedin, Github, Globe, Camera, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const Template23 = () => {
  const resumeRef = useRef(null);
  const fileInputRef = useRef(null);
  const { resumeData, setResumeData } = useResume();

  // default structure to avoid crashes
  const defaultTemplate = {
    name: "",
    role: "",
    phone: "",
    email: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    profileImage: "",
    summary: "",
    skills: [],
    languages: [],
    interests: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: []
  };

  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || defaultTemplate);

  useEffect(() => {
    setLocalData(resumeData || defaultTemplate);
  }, [resumeData]);

  // helpers
  const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";
  const hasArrayContent = (arr) => Array.isArray(arr) && arr.some((item) => {
    if (typeof item === "string") return isNonEmptyString(item);
    if (!item) return false;
    if (typeof item === "object") return Object.values(item).some(val => isNonEmptyString(String(val || "")));
    return Boolean(item);
  });
  const hasContact = (data) =>
    ["phone", "email", "location", "linkedin", "github", "portfolio"].some((k) => isNonEmptyString(data[k]));
  const hasExperienceContent = (experience) => {
    if (!Array.isArray(experience)) return false;
    return experience.some((exp) => {
      if (!exp || typeof exp !== "object") return false;
      const textFields = ["title", "companyName", "date", "companyLocation"];
      const hasText = textFields.some((f) => isNonEmptyString(exp[f] || ""));
      const accomplishments = Array.isArray(exp.accomplishment)
        ? exp.accomplishment.some(a => isNonEmptyString(a))
        : false;
      return hasText || accomplishments;
    });
  };

  // persist helpers
  const persist = (updated) => {
    setLocalData(updated);
    try {
      localStorage.setItem("resumeData", JSON.stringify(updated));
    } catch (e) {
      // ignore storage errors
    }
  };

  const handleFieldChange = (field, value) => {
    const updatedData = { ...(localData || defaultTemplate), [field]: value };
    persist(updatedData);
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    const arr = Array.isArray(localData[section]) ? [...localData[section]] : [];
    if (key) {
      arr[index] = { ...(arr[index] || {}), [key]: value };
    } else {
      arr[index] = value;
    }
    const updatedData = { ...(localData || defaultTemplate), [section]: arr };
    persist(updatedData);
  };

  const handleSave = () => {
    setResumeData(localData);
    setEditMode(false);
    toast.success("Resume saved successfully!");
  };

  const handleCancel = () => {
    setLocalData(resumeData || defaultTemplate);
    setEditMode(false);
  };

  // Download -> print dialog (user can choose Save as PDF)
  const handleDownload = () => {
    window.print();
  };

  const sectionHeaderStyle = {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1f4e79",
    borderBottom: "2px solid #1f4e79",
    marginBottom: "8px",
    paddingBottom: "2px",
    textTransform: "uppercase",
  };

  const profileImageStyle = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    cursor: "pointer",
    margin: "0 auto",
  };

  const renderText = (value, onChange, multiline = false, placeholder = "") =>
    editMode ? (
      multiline ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      ) : (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      )
    ) : (
      (isNonEmptyString(value) ? value : null)
    );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onEnhance={() => {}} resumeRef={resumeRef} />
        <div style={{ flexGrow: 1, padding: "2rem", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: "1000px" }}>
            <div
              ref={resumeRef}
              style={{
                backgroundColor: "#ffffff",
                display: "flex",
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                overflow: "hidden",
                fontFamily: "Arial, sans-serif",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                flexDirection: "column",
                minHeight: "297mm"
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#062E48",
                  padding: "15px 40px",
                  borderBottom: "1px solid #ccc",
                  gap: "40px",
                }}
              >
                <div style={{ flex: "1", textAlign: "left" }}>
                  <h1 style={{ fontSize: "3rem", fontWeight: "bold", margin: "0 0 4px 0", color: "white" }}>
                    {renderText(localData.name, (val) => handleFieldChange("name", val), false, "Full Name") || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Full Name</span>}
                  </h1>
                  <p style={{ fontSize: "1rem", color: "#E5E7EB", margin: "0" }}>
                    {renderText(localData.role, (val) => handleFieldChange("role", val), false, "Current Role") || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Current Role</span>}
                  </p>
                </div>

                {/* Profile Pic logic: Hidden if no image and not in edit mode */}
                {(isNonEmptyString(localData.profileImage) || editMode) && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => handleFieldChange("profileImage", reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div
                      style={{
                        cursor: editMode ? "pointer" : "default",
                        border: editMode ? "2px dashed #3b82f6" : "none",
                        borderRadius: "50%",
                        padding: editMode ? "2px" : "0",
                      }}
                      onClick={editMode ? () => fileInputRef.current.click() : undefined}
                      title={editMode ? "Click to change profile picture" : "Profile picture"}
                    >
                      {/* Only show default icon if in edit mode and image is empty */}
                      {isNonEmptyString(localData.profileImage) ? (
                        <img src={localData.profileImage} alt="Profile" style={profileImageStyle} />
                      ) : editMode ? (
                        <div style={{ ...profileImageStyle, backgroundColor: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Camera size={40} color="#9ca3af" />
                        </div>
                      ) : null}
                    </div>
                    {editMode && isNonEmptyString(localData.profileImage) && (
                      <button
                        onClick={() => handleFieldChange("profileImage", "")}
                        style={{
                          marginTop: "8px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          display: "block",
                          width: "100%"
                        }}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div style={{ display: "flex", padding: "20px", width: "100%" }}>
                {/* Left Sidebar */}
                <div style={{ width: "35%", paddingRight: "20px", borderRight: "1px solid #ccc", minHeight: "100%" }}>
                  {/* Contact */}
                  {(editMode || hasContact(localData)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Contact</h3>
                      <div style={{ marginBottom: "10px", paddingLeft: "12px" }}>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Phone size={14} /> 
                          {editMode ? (
                            renderText(localData.phone, (val) => handleFieldChange("phone", val), false, "Phone")
                          ) : (
                            isNonEmptyString(localData.phone) ? <a href={`tel:${localData.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{localData.phone}</a> : null
                          )}
                        </p>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Mail size={14} /> 
                          {editMode ? (
                            renderText(localData.email, (val) => handleFieldChange("email", val), false, "Email")
                          ) : (
                            isNonEmptyString(localData.email) ? <a href={`mailto:${localData.email}`} style={{ color: "inherit", textDecoration: "none" }}>{localData.email}</a> : null
                          )}
                        </p>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <MapPin size={14} /> {renderText(localData.location, (val) => handleFieldChange("location", val), false, "Location")}
                        </p>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Linkedin size={14} /> 
                          {editMode ? (
                            renderText(localData.linkedin, (val) => handleFieldChange("linkedin", val), false, "LinkedIn")
                          ) : (
                            isNonEmptyString(localData.linkedin) ? <a href={localData.linkedin.startsWith("http") ? localData.linkedin : `https://${localData.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>LinkedIn</a> : null
                          )}
                        </p>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Github size={14} /> 
                          {editMode ? (
                            renderText(localData.github, (val) => handleFieldChange("github", val), false, "GitHub")
                          ) : (
                            isNonEmptyString(localData.github) ? <a href={localData.github.startsWith("http") ? localData.github : `https://${localData.github}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>GitHub</a> : null
                          )}
                        </p>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Globe size={14} /> 
                          {editMode ? (
                            renderText(localData.portfolio, (val) => handleFieldChange("portfolio", val), false, "Portfolio")
                          ) : (
                            isNonEmptyString(localData.portfolio) ? <a href={localData.portfolio.startsWith("http") ? localData.portfolio : `https://${localData.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Portfolio</a> : null
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {(editMode || hasArrayContent(localData.education)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Education</h3>
                      {(Array.isArray(localData.education) ? localData.education : []).map((item, i) => (
                        <div key={i} style={{ marginBottom: "8px", border: editMode ? "1px dashed #3b82f6" : "none", padding: "4px" }}>
                          <div style={{ flex: 1 }}>
                            {editMode ? (
                              <>
                                <p>{renderText(item.degree, (val) => handleArrayFieldChange("education", i, "degree", val), false, "Degree")}</p>
                                <p>{renderText(item.institution, (val) => handleArrayFieldChange("education", i, "institution", val), false, "Institution")}</p>
                                <p>{renderText(item.duration, (val) => handleArrayFieldChange("education", i, "duration", val), false, "Duration")}</p>
                              </>
                            ) : (
                              <>
                                {isNonEmptyString(item.degree) && <p style={{ margin: 0, fontWeight: 700 }}>{item.degree}</p>}
                                {(isNonEmptyString(item.institution) || isNonEmptyString(item.duration)) && (
                                  <p style={{ margin: 0, color: "#6b7280" }}>{[item.institution, item.duration].filter(Boolean).join(" | ")}</p>
                                )}
                              </>
                            )}
                          </div>
                          {editMode && <button onClick={() => { const u = [...localData.education]; u.splice(i, 1); handleFieldChange("education", u); }} style={{ color: "red", border: "none", background: "none", cursor: "pointer", fontSize: "0.8rem" }}>Remove</button>}
                        </div>
                      ))}
                      {editMode && <button onClick={() => handleFieldChange("education", [...localData.education, { degree: "", institution: "", duration: "" }])} style={{ marginTop: "4px", backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Add Education</button>}
                    </div>
                  )}

                  {/* Skills */}
                  {(editMode || hasArrayContent(localData.skills)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Skills</h3>
                      <div style={{ paddingLeft: "12px" }}>
                        {(Array.isArray(localData.skills) ? localData.skills : []).map((item, i) => (
                          <div key={i} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ flex: 1 }}>{editMode ? renderText(item, (val) => handleArrayFieldChange("skills", i, null, val), false, "Skill") : item}</span>
                            {editMode && <button onClick={() => { const u = [...localData.skills]; u.splice(i, 1); handleFieldChange("skills", u); }} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>x</button>}
                          </div>
                        ))}
                        {editMode && <button onClick={() => persist({ ...localData, skills: [...(localData.skills || []), ""] })} style={{ backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Add Skill</button>}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {(editMode || hasArrayContent(localData.languages)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Languages</h3>
                      <div style={{ paddingLeft: "12px" }}>
                        {(Array.isArray(localData.languages) ? localData.languages : []).map((item, i) => (
                          <div key={i} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ flex: 1 }}>{editMode ? renderText(item, (val) => handleArrayFieldChange("languages", i, null, val), false, "Language") : item}</span>
                            {editMode && <button onClick={() => { const u = [...localData.languages]; u.splice(i, 1); handleFieldChange("languages", u); }} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>x</button>}
                          </div>
                        ))}
                        {editMode && <button onClick={() => persist({ ...localData, languages: [...(localData.languages || []), ""] })} style={{ backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Add Language</button>}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {(editMode || hasArrayContent(localData.interests)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Interests</h3>
                      <div style={{ paddingLeft: "12px" }}>
                        {(Array.isArray(localData.interests) ? localData.interests : []).map((item, i) => (
                          <div key={i} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ flex: 1 }}>{editMode ? renderText(item, (val) => handleArrayFieldChange("interests", i, null, val), false, "Interest") : item}</span>
                            {editMode && <button onClick={() => { const u = [...localData.interests]; u.splice(i, 1); handleFieldChange("interests", u); }} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>x</button>}
                          </div>
                        ))}
                        {editMode && <button onClick={() => persist({ ...localData, interests: [...(localData.interests || []), ""] })} style={{ backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Add Interest</button>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Content */}
                <div style={{ width: "65%", paddingLeft: "20px", flex: 1, minHeight: "100%" }}>
                  {/* Summary */}
                  {(editMode || isNonEmptyString(localData.summary)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Profile</h3>
                      {renderText(localData.summary, (val) => handleFieldChange("summary", val), true, "Write your profile summary")}
                    </div>
                  )}

                  {/* Experience */}
                  {(editMode || hasExperienceContent(localData.experience)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Experience</h3>
                      {(Array.isArray(localData.experience) ? localData.experience : []).map((exp, i) => (
                        <div key={i} style={{ marginBottom: "10px", border: editMode ? "1px dashed #3b82f6" : "none", padding: "8px" }}>
                          <p>{renderText(exp.title, (val) => handleArrayFieldChange("experience", i, "title", val), false, "Job Title")}</p>
                          <p>
                            {renderText(exp.companyName, (val) => handleArrayFieldChange("experience", i, "companyName", val), false, "Company Name")}
                            {(!editMode && isNonEmptyString(exp.date)) ? ` | ${exp.date}` : renderText(exp.date, (val) => handleArrayFieldChange("experience", i, "date", val), false, "Date")}
                          </p>
                          <p style={{ fontSize: "0.9rem" }}>{renderText(exp.description, (val) => handleArrayFieldChange("experience", i, "description", val), true, "Description")}</p>
                          {editMode && <button onClick={() => { const u = [...localData.experience]; u.splice(i, 1); handleFieldChange("experience", u); }} style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginTop: "5px" }}>Remove Experience</button>}
                        </div>
                      ))}
                      {editMode && <button onClick={() => persist({ ...localData, experience: [...(localData.experience || []), { title: "", companyName: "", date: "", description: "" }] })} style={{ backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Add Experience</button>}
                    </div>
                  )}

                  {/* Projects */}
                  {(editMode || hasArrayContent(localData.projects)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Projects</h3>
                      {(Array.isArray(localData.projects) ? localData.projects : []).map((proj, i) => (
                        <div key={i} style={{ marginBottom: "15px", border: editMode ? "1px dashed #3b82f6" : "none", padding: "8px" }}>
                          <p style={{ fontWeight: "bold", margin: 0 }}>{renderText(proj.name, (val) => handleArrayFieldChange("projects", i, "name", val), false, "Project Name")}</p>
                          <p style={{ fontSize: "0.9rem" }}>{renderText(proj.description, (val) => handleArrayFieldChange("projects", i, "description", val), true, "Description")}</p>
                          {editMode ? renderText(proj.link, (val) => handleArrayFieldChange("projects", i, "link", val), false, "Project Link") : (isNonEmptyString(proj.link) && <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "#1f4e79" }}>View Project</a>)}
                          {editMode && <button onClick={() => { const u = [...localData.projects]; u.splice(i, 1); handleFieldChange("projects", u); }} style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginTop: "5px" }}>Remove Project</button>}
                        </div>
                      ))}
                      {editMode && <button onClick={() => persist({ ...localData, projects: [...(localData.projects || []), { name: "", description: "", link: "" }] })} style={{ backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Add Project</button>}
                    </div>
                  )}

                  {/* Certifications */}
                  {(editMode || hasArrayContent(localData.certifications)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Certifications</h3>
                      {(Array.isArray(localData.certifications) ? localData.certifications : []).map((cert, i) => (
                        <div key={i} style={{ marginBottom: "10px", border: editMode ? "1px dashed #3b82f6" : "none", padding: "8px" }}>
                          <p>{renderText(cert.title, (val) => handleArrayFieldChange("certifications", i, "title", val), false, "Title")}</p>
                          <p>{renderText(cert.issuer, (val) => handleArrayFieldChange("certifications", i, "issuer", val), false, "Issuer")}</p>
                          {editMode && <button onClick={() => { const u = [...localData.certifications]; u.splice(i, 1); handleFieldChange("certifications", u); }} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>Remove</button>}
                        </div>
                      ))}
                      {editMode && <button onClick={() => persist({ ...localData, certifications: [...(localData.certifications || []), { title: "", issuer: "" }] })} style={{ backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Add Certification</button>}
                    </div>
                  )}

                  {/* Achievements */}
                  {(editMode || hasArrayContent(localData.achievements)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Achievements</h3>
                      <ul>
                        {(Array.isArray(localData.achievements) ? localData.achievements : []).map((ach, i) => (
                          <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ flex: 1 }}>{renderText(ach, (val) => handleArrayFieldChange("achievements", i, null, val), false, "Achievement")}</span>
                            {editMode && <button onClick={() => { const u = [...localData.achievements]; u.splice(i, 1); handleFieldChange("achievements", u); }} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>Remove</button>}
                          </li>
                        ))}
                      </ul>
                      {editMode && <button onClick={() => persist({ ...localData, achievements: [...(localData.achievements || []), ""] })} style={{ backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Add Achievement</button>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div style={{ marginTop: "1.5rem", textAlign: "center", display: "flex", justifyContent: "center", gap: "8px" }}>
              {editMode ? (
                <>
                  <button onClick={handleSave} style={{ backgroundColor: "#10b981", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", cursor: "pointer" }}>Save</button>
                  <button onClick={handleCancel} style={{ backgroundColor: "#ef4444", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", cursor: "pointer" }}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)} style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", cursor: "pointer" }}>Edit Resume</button>
              )}
              <button onClick={handleDownload} style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", cursor: "pointer" }}>Download PDF</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template23;