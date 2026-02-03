import { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { MapPin, Phone, Mail, Linkedin, Github, Globe } from "lucide-react";

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
          style={{ width: "100%", padding: "4px" }}
        />
      ) : (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: "100%", padding: "4px" }}
        />
      )
    ) : (
      (isNonEmptyString(value) ? value : null)
    );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onEnhance={() => { }} resumeRef={resumeRef} />
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
                    <img src={localData.profileImage || "/images/profile.jpg"} alt="Profile" style={profileImageStyle} />
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div style={{ display: "flex", padding: "20px", width: "100%" }}>
                {/* Left Sidebar */}
                <div style={{ width: "35%", paddingRight: "20px", borderRight: "1px solid #ccc", minHeight: "100%" }}>
                  {/* Contact - show only when contact exists or editing */}
                  {(editMode || hasContact(localData)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Contact</h3>
                      <div style={{ marginBottom: "10px", paddingLeft: "12px" }}>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Phone size={14} /> {renderText(localData.phone, (val) => handleFieldChange("phone", val), false, "Phone") || (!editMode ? null : <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Phone</span>)}
                        </p>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Mail size={14} /> {renderText(localData.email, (val) => handleFieldChange("email", val), false, "Email") || (!editMode ? null : <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Email</span>)}
                        </p>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <MapPin size={14} /> {renderText(localData.location, (val) => handleFieldChange("location", val), false, "Location") || (!editMode ? null : <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Location</span>)}
                        </p>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Linkedin size={14} /> {editMode ? renderText(localData.linkedin, (val) => handleFieldChange("linkedin", val), false, "LinkedIn") : (localData.linkedin && <a href={localData.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{localData.linkedin}</a>)}
                        </p>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Github size={14} /> {editMode ? renderText(localData.github, (val) => handleFieldChange("github", val), false, "GitHub") : (localData.github && <a href={localData.github} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{localData.github}</a>)}
                        </p>
                        <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Globe size={14} /> {editMode ? renderText(localData.portfolio, (val) => handleFieldChange("portfolio", val), false, "Portfolio") : (localData.portfolio && <a href={localData.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{localData.portfolio}</a>)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Education - show only if has content or editing */}
                  {(editMode || hasArrayContent(localData.education)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Education</h3>
                      {(Array.isArray(localData.education) ? localData.education : []).map((item, i) => (
                        <div key={i} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ flex: 1 }}>
                            {editMode ? (
                              <>
                                <p>{renderText(item.degree, (val) => handleArrayFieldChange("education", i, "degree", val), false, "Degree")}</p>
                                <p>{renderText(item.institution, (val) => handleArrayFieldChange("education", i, "institution", val), false, "Institution")}</p>
                                <p>{renderText(item.duration, (val) => handleArrayFieldChange("education", i, "duration", val), false, "Duration")}</p>
                                <p>{renderText(item.location, (val) => handleArrayFieldChange("education", i, "location", val), false, "Location")}</p>
                              </>
                            ) : (
                              <>
                                {isNonEmptyString(item.degree) && <p style={{ margin: 0, fontWeight: 700 }}>{item.degree}</p>}
                                {(isNonEmptyString(item.institution) || isNonEmptyString(item.duration) || isNonEmptyString(item.location)) && (
                                  <p style={{ margin: 0, color: "#6b7280" }}>{[item.institution, item.duration, item.location].filter(Boolean).join(" | ")}</p>
                                )}
                              </>
                            )}
                          </div>
                          {editMode && (
                            <button
                              onClick={() => {
                                const updated = [...(localData.education || [])];
                                updated.splice(i, 1);
                                persist({ ...localData, education: updated });
                              }}
                              style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      {editMode && (
                        <button
                          onClick={() =>
                            persist({
                              ...localData,
                              education: [...(localData.education || []), { degree: "", institution: "", duration: "", location: "" }]
                            })
                          }
                          style={{ marginTop: "4px", backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                          Add education
                        </button>
                      )}
                    </div>
                  )}

                  {/* Skills */}
                  {(editMode || hasArrayContent(localData.skills)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Skills</h3>
                      <div style={{ paddingLeft: "12px" }}>
                        {(Array.isArray(localData.skills) ? localData.skills : []).map((item, i) => (
                          <div key={i} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ flex: 1 }}>
                              {editMode ? (
                                renderText(item, (val) => handleArrayFieldChange("skills", i, null, val), false, "Skill")
                              ) : (
                                isNonEmptyString(item) ? <span>{item}</span> : null
                              )}
                            </span>
                            {editMode && (
                              <button
                                onClick={() => {
                                  const updated = [...(localData.skills || [])];
                                  updated.splice(i, 1);
                                  persist({ ...localData, skills: updated });
                                }}
                                style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        {editMode && (
                          <button
                            onClick={() => persist({ ...localData, skills: [...(localData.skills || []), ""] })}
                            style={{ marginTop: "4px", backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                          >
                            Add skill
                          </button>
                        )}
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
                            <span style={{ flex: 1 }}>
                              {editMode ? (
                                renderText(typeof item === "object" ? (item.language || "") : item, (val) => handleArrayFieldChange("languages", i, null, val), false, "Language")
                              ) : (
                                typeof item === "object" ? `${item.language || ""}${item.proficiency ? ` — ${item.proficiency}` : ""}` : item
                              )}
                            </span>
                            {editMode && (
                              <button
                                onClick={() => {
                                  const updated = [...(localData.languages || [])];
                                  updated.splice(i, 1);
                                  persist({ ...localData, languages: updated });
                                }}
                                style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        {editMode && (
                          <button
                            onClick={() => persist({ ...localData, languages: [...(localData.languages || []), ""] })}
                            style={{ marginTop: "4px", backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                          >
                            Add language
                          </button>
                        )}
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
                            <span style={{ flex: 1 }}>
                              {editMode ? renderText(item, (val) => handleArrayFieldChange("interests", i, null, val), false, "Interest") : item}
                            </span>
                            {editMode && (
                              <button
                                onClick={() => {
                                  const updated = [...(localData.interests || [])];
                                  updated.splice(i, 1);
                                  persist({ ...localData, interests: updated });
                                }}
                                style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        {editMode && (
                          <button
                            onClick={() => persist({ ...localData, interests: [...(localData.interests || []), ""] })}
                            style={{ marginTop: "4px", backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                          >
                            Add interest
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Content */}
                <div style={{ width: "65%", paddingLeft: "20px", flex: 1, minHeight: "100%" }}>
                  {/* Profile */}
                  {(editMode || isNonEmptyString(localData.summary)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Profile</h3>
                      {renderText(localData.summary, (val) => handleFieldChange("summary", val), true, "Write your profile summary") || (!editMode ? null : <textarea value={localData.summary || ""} onChange={(e) => handleFieldChange("summary", e.target.value)} placeholder="Write your profile summary" style={{ width: "100%", padding: 4 }} />)}
                    </div>
                  )}

                  {/* Experience */}
                  {(editMode || hasExperienceContent(localData.experience)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Experience</h3>
                      {(Array.isArray(localData.experience) ? localData.experience : []).map((exp, i) => {
                        const hasExp = exp && (isNonEmptyString(exp.title) || isNonEmptyString(exp.companyName) || isNonEmptyString(exp.date) || isNonEmptyString(exp.companyLocation) || (Array.isArray(exp.accomplishment) && exp.accomplishment.some(a => isNonEmptyString(a))));
                        if (!hasExp && !editMode) return null;
                        return (
                          <div key={i} style={{ marginBottom: "10px", border: editMode ? "1px dashed #3b82f6" : "none", padding: "8px" }}>
                            <p>{renderText(exp.title, (val) => handleArrayFieldChange("experience", i, "title", val), false, "Job Title")}</p>
                            <p>
                              {renderText(exp.companyName, (val) => handleArrayFieldChange("experience", i, "companyName", val), false, "Company Name")}
                              {(!editMode && (isNonEmptyString(exp.companyName) && (isNonEmptyString(exp.date) || isNonEmptyString(exp.companyLocation)))) ? " | " : " "}
                              {renderText(exp.date, (val) => handleArrayFieldChange("experience", i, "date", val), false, "Date")}
                              {(!editMode && isNonEmptyString(exp.date) && isNonEmptyString(exp.companyLocation)) ? " | " : " "}
                              {renderText(exp.companyLocation, (val) => handleArrayFieldChange("experience", i, "companyLocation", val), false, "Location")}
                            </p>

                            <ul style={{ paddingLeft: "18px" }}>
                              {(Array.isArray(exp.accomplishment) ? exp.accomplishment : []).map((acc, idx) => {
                                if (!isNonEmptyString(acc) && !editMode) return null;
                                return (
                                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {renderText(acc, (val) => {
                                      const updatedAcc = [...(exp.accomplishment || [])];
                                      updatedAcc[idx] = val;
                                      handleArrayFieldChange("experience", i, "accomplishment", updatedAcc);
                                    }, false, "Accomplishment")}
                                    {editMode && (
                                      <button
                                        onClick={() => {
                                          const updatedAcc = [...(exp.accomplishment || [])];
                                          updatedAcc.splice(idx, 1);
                                          handleArrayFieldChange("experience", i, "accomplishment", updatedAcc);
                                        }}
                                        style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>

                            {editMode && (
                              <>
                                <button
                                  onClick={() => handleArrayFieldChange("experience", i, "accomplishment", [...(exp.accomplishment || []), ""])}
                                  style={{ marginTop: "4px", backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                >
                                  Add Accomplishment
                                </button>
                                <button
                                  onClick={() => {
                                    const updated = [...(localData.experience || [])];
                                    updated.splice(i, 1);
                                    persist({ ...localData, experience: updated });
                                  }}
                                  style={{ color: "red", marginTop: "4px", border: "none", background: "none", cursor: "pointer", marginLeft: 8 }}
                                >
                                  Remove Experience
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                      {editMode && (
                        <button
                          onClick={() => persist({ ...localData, experience: [...(localData.experience || []), { title: "", companyName: "", date: "", companyLocation: "", accomplishment: [""] }] })}
                          style={{ marginTop: "4px", backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                          Add Experience
                        </button>
                      )}
                    </div>
                  )}

                  {/* Certifications */}
                  {(editMode || hasArrayContent(localData.certifications)) && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={sectionHeaderStyle}>Certifications</h3>
                      {(Array.isArray(localData.certifications) ? localData.certifications : []).map((cert, i) => {
                        const hasCert = cert && (isNonEmptyString(cert.title) || isNonEmptyString(cert.issuer) || isNonEmptyString(cert.date));
                        if (!hasCert && !editMode) return null;
                        return (
                          <div key={i} style={{ marginBottom: "10px", border: editMode ? "1px dashed #3b82f6" : "none", padding: "8px" }}>
                            <p>{renderText(cert.title, (val) => handleArrayFieldChange("certifications", i, "title", val), false, "Certification Title")}</p>
                            <p>{renderText(cert.issuer, (val) => handleArrayFieldChange("certifications", i, "issuer", val), false, "Issuer")}</p>
                            <p>{renderText(cert.date, (val) => handleArrayFieldChange("certifications", i, "date", val), false, "Date")}</p>
                            {editMode && (
                              <button
                                onClick={() => {
                                  const updated = [...(localData.certifications || [])];
                                  updated.splice(i, 1);
                                  persist({ ...localData, certifications: updated });
                                }}
                                style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                              >
                                Remove Certification
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {editMode && (
                        <button
                          onClick={() => persist({ ...localData, certifications: [...(localData.certifications || []), { title: "", issuer: "", date: "" }] })}
                          style={{ marginTop: "4px", backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                          Add Certification
                        </button>
                      )}
                    </div>
                  )}

                  {/* Achievements */}
                  {(editMode || hasArrayContent(localData.achievements)) && (
                    <div>
                      <h3 style={sectionHeaderStyle}>Achievements</h3>
                      <ul>
                        {(Array.isArray(localData.achievements) ? localData.achievements : []).map((ach, i) => {
                          if (!isNonEmptyString(typeof ach === "string" ? ach : JSON.stringify(ach)) && !editMode) return null;
                          return (
                            <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {renderText(ach, (val) => handleArrayFieldChange("achievements", i, null, val), false, "Achievement")}
                              {editMode && (
                                <button
                                  onClick={() => {
                                    const updated = [...(localData.achievements || [])];
                                    updated.splice(i, 1);
                                    persist({ ...localData, achievements: updated });
                                  }}
                                  style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                                >
                                  Remove
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      {editMode && (
                        <button
                          onClick={() => persist({ ...localData, achievements: [...(localData.achievements || []), ""] })}
                          style={{ marginTop: "4px", backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                          Add Achievement
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit / Download Buttons */}
            <div style={{ marginTop: "1.5rem", textAlign: "center", display: "flex", justifyContent: "center", gap: "8px" }}>
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    style={{ backgroundColor: "#10b981", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", cursor: "pointer" }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{ backgroundColor: "#ef4444", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDownload}
                    style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", cursor: "pointer" }}
                  >
                    Download
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", cursor: "pointer" }}
                  >
                    Edit Resume
                  </button>
                  <button
                    onClick={handleDownload}
                    style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", cursor: "pointer" }}
                  >
                    Download
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template23;
