import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import defaultProfile from "../../assets/images/profile.jpg";
import { toast } from 'react-toastify'; // Import toast

const Template6 = () => {
  const resumeRef = useRef(null);

  // --- 1. SAFETY GUARD: PREVENT CRASH IF CONTEXT IS MISSING ---
  const context = useResume();
  
  if (!context) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: "3rem", height: "3rem", border: "4px solid #f3f3f3", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p>Loading Resume Data...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { resumeData, setResumeData } = context;

  // --- 2. SAFE STATE INITIALIZATION ---
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});
  const [loading, setLoading] = useState(false);
  const [headingColor, setHeadingColor] = useState("#2563eb");
  const colorInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // --- DATA CLEANING & INITIALIZATION ---
  const cleanData = (data) => {
    if (!data) return {};
    const cleaned = { ...data };
    
    // 1. Remove placeholders
    const placeholders = [
      "Your Professional Domain",
      "Your professional summary will appear here",
      "Your professional summary will appear here.",
      "Job Title",
      "Company Name"
    ];

    if (placeholders.includes(cleaned.role)) cleaned.role = "";
    if (placeholders.includes(cleaned.summary)) cleaned.summary = "";

    // 2. NORMALIZE LANGUAGES
    if (Array.isArray(cleaned.languages)) {
      cleaned.languages = cleaned.languages.map(lang => {
        if (typeof lang === 'string') {
          return { language: lang, proficiency: 'Intermediate' };
        }
        return lang;
      });
    }

    // 3. NORMALIZE ACHIEVEMENTS
    if (Array.isArray(cleaned.achievements)) {
      cleaned.achievements = cleaned.achievements.map(ach => {
        if (typeof ach === 'string') {
          return { keyAchievements: ach, describe: '' };
        }
        if (ach && (ach.title || ach.name) && !ach.keyAchievements) {
          return {
            ...ach,
            keyAchievements: ach.title || ach.name,
            describe: ach.description || ach.describe || ''
          };
        }
        return ach;
      });
    }

    // 4. NORMALIZE SKILLS
    if (Array.isArray(cleaned.skills)) {
      cleaned.skills = cleaned.skills.map(s => typeof s === 'object' ? (s.skill || s.name || '') : s).filter(Boolean);
    }
    
    return cleaned;
  };

  useEffect(() => {
    if (resumeData) {
      setLocalData(cleanData(resumeData));
    }
  }, [resumeData]);

  // --- HELPER FUNCTIONS ---

  const hasSectionData = (section) => {
    const content = localData?.[section];
    if (!content) return false;
    if (editMode) return true;
    if (Array.isArray(content)) {
      if (content.length === 0) return false;
      return content.some(item => !isItemEmpty(item));
    }
    return typeof content === 'string' && content.trim().length > 0;
  };

  const isItemEmpty = (item) => {
    if (!item) return true;
    if (typeof item === 'string') return item.trim().length === 0;
    return Object.values(item).every(val => !val || (typeof val === 'string' && val.trim() === ''));
  };

  // --- HANDLERS ---

  const handleFieldChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    const updated = [...(localData[section] || [])];
    if (!updated[index]) updated[index] = {}; 
    updated[index] = { ...updated[index], [key]: value };
    setLocalData({ ...localData, [section]: updated });
  };

  const handleSkillsChange = (value) => {
    const skillsArray = value.split(",").map(skill => skill.trim());
    setLocalData({ ...localData, skills: skillsArray });
  };
  
  const handleInterestsChange = (value) => {
    const interestsArray = value.split(",").map(int => int.trim());
    setLocalData({ ...localData, interests: interestsArray });
  };

  const addNewEntry = (section) => {
    const newEntry = section === "experience" ? {
      title: '', companyName: '', date: '', companyLocation: '', description: '', accomplishment: ''
    } : section === "education" ? {
      degree: '', institution: '', duration: '', grade: ""
    } : section === "courses" ? {
      title: '', description: ''
    } : section === "projects" ? {
      name: '', duration: '', description: '', technologies: [], link: '', github: ''
    } : section === "achievements" ? {
      keyAchievements: '', describe: ''
    } : section === "languages" ? {
      language: '', proficiency: ''
    } : section === "certifications" ? {
      title: '', issuer: '', date: ''
    } : section === "references" ? {
      name: '', position: '', company: '', contact: ''
    } : null;

    if (newEntry) {
      setLocalData(prev => ({
        ...prev,
        [section]: [...(prev[section] || []), newEntry]
      }));
    }
  };

  const removeEntry = (section, index) => {
    setLocalData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
  try {
    setResumeData(localData);
    localStorage.setItem("resumeData", JSON.stringify(localData));
    setEditMode(false);
  } catch (error) {
    console.error("Save error:", error);
  }
};


  const handleCancel = () => {
    setLocalData(cleanData(resumeData));
    setEditMode(false);
  };

  const handleEnhance = (section) => {
    console.log("Enhancing", section);
  };

  const handleOpenColorPicker = () => {
    if (colorInputRef.current) colorInputRef.current.click();
  };

  const handleOpenPhotoPicker = () => {
    if (photoInputRef.current) photoInputRef.current.click();
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalData((prev) => ({ ...prev, photo: objectUrl }));
  };

  // --- STYLES ---
  const emptySectionPlaceholderStyle = {
    padding: "1rem",
    border: "2px dashed #d1d5db",
    borderRadius: "0.5rem",
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "1.5rem",
    backgroundColor: "rgba(249, 250, 251, 0.5)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Navbar />
      
      {loading && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 50
        }}>
          <div style={{
            backgroundColor: "white", padding: "2rem", borderRadius: "0.5rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              width: "4rem", height: "4rem", border: "2px solid #f3f3f3",
              borderTop: "2px solid #3b82f6", borderRadius: "50%",
              animation: "spin 1s linear infinite", margin: "0 auto 1rem"
            }}></div>
            <p style={{ fontSize: "1.125rem", fontWeight: "600", color: "#374151" }}>
              AI is enhancing your resume...
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "flex" }}>
        {/* Pass data to Sidebar safely */}
        <Sidebar onEnhance={handleEnhance} resumeRef={resumeRef} />

        <div style={{ 
          flexGrow: 1, padding: "2.5rem", display: "flex", 
          flexDirection: "column", alignItems: "center", marginLeft: "1.5rem"
        }}>
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#fff", color: "#111827", maxWidth: "64rem",
              width: "100%", padding: "1.25rem", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              borderRadius: "0.5rem", fontSize: "0.75rem", position: "relative"
            }}
          >
            {/* --- PROFILE PHOTO --- */}
            {(editMode || localData?.photo || defaultProfile) && (
              <div style={{ position: "absolute", top: "1rem", right: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem" }}>
                <img
                  src={localData?.photo || defaultProfile}
                  alt="Profile"
                  style={{ width: "6rem", height: "6rem", borderRadius: "9999px", objectFit: "cover", border: `2px solid ${headingColor}` }}
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
                {editMode && (
                  <button
                    onClick={handleOpenPhotoPicker}
                    style={{
                      backgroundColor: "#2563eb", color: "white", cursor: "pointer",
                      fontWeight: "600", padding: "0.25rem 0.5rem", borderRadius: "0.375rem",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)", border: "none", fontSize: "0.7rem"
                    }}
                  >
                    Browse
                  </button>
                )}
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
              </div>
            )}

            {/* --- HEADER INFO --- */}
            <div style={{ fontSize: "1rem", textAlign: "left", padding: "0.125rem", marginRight: "7rem" }}>
              <div style={{ fontSize: "2.125rem", fontWeight: "bolder" }}>
                {editMode ? (
                  <input
                    type="text"
                    value={localData.name || ""}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    style={{ fontSize: "2.125rem", fontWeight: "bolder", width: "100%", border: "none", outline: "none", backgroundColor: "#e7f1ff" }}
                    placeholder="Your Name"
                  />
                ) : (
                  <h2 style={{ fontSize: "1.75rem", fontWeight: "bolder" }}>{localData.name}</h2>
                )}
              </div>

              <div style={{ color: "rgb(122, 122, 243)", fontSize: "1.25rem" }}>
                  {editMode ? (
                  <input
                      type="text"
                      value={localData.role || ""}
                      onChange={(e) => handleFieldChange("role", e.target.value)}
                      style={{ color: "rgb(122, 122, 243)", fontSize: "1.25rem", width: "100%", border: "none", outline: "none", backgroundColor: "#e7f1ff" }}
                      placeholder="Professional Title"
                  />
                  ) : (
                    localData.role
                  )}
              </div>

              <div style={{ display: "flex", justifyContent: "left", fontSize: "1rem", margin: "0.625rem 0 0.625rem 0", gap: "0.75rem", flexWrap: "wrap" }}>
                {(editMode || localData?.phone) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3125rem" }}>
                    <FontAwesomeIcon icon={faPhone} />
                    {editMode ? <input type="text" value={localData.phone || ""} onChange={(e) => handleFieldChange("phone", e.target.value)} style={{ border: "none", outline: "none", backgroundColor: "#e7f1ff" }} placeholder="Phone" /> : <span>{localData.phone}</span>} |
                  </div>
                )}
                {(editMode || localData?.email) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3125rem" }}>
                    <FontAwesomeIcon icon={faEnvelope} />
                    {editMode ? <input type="email" value={localData.email || ""} onChange={(e) => handleFieldChange("email", e.target.value)} style={{ border: "none", outline: "none", backgroundColor: "#e7f1ff" }} placeholder="Email" /> : <span>{localData.email}</span>} |
                  </div>
                )}
                {(editMode || localData?.linkedin) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3125rem" }}>
                    <FontAwesomeIcon icon={faLinkedin} />
                    {editMode ? <input type="text" value={localData.linkedin || ""} onChange={(e) => handleFieldChange("linkedin", e.target.value)} style={{ border: "none", outline: "none", backgroundColor: "#e7f1ff" }} placeholder="LinkedIn" /> : <span>{localData.linkedin}</span>} |
                  </div>
                )}
                {(editMode || localData?.location) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3125rem" }}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    {editMode ? <input type="text" value={localData.location || ""} onChange={(e) => handleFieldChange("location", e.target.value)} style={{ border: "none", outline: "none", backgroundColor: "#e7f1ff" }} placeholder="Location" /> : <span>{localData.location}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* --- SUMMARY SECTION --- */}
            {(() => {
               const hasData = hasSectionData("summary");
               if (!hasData && !editMode) return null;
               
               return (
                <div style={{ marginBottom: "1.5rem" }}>
                   <h3 style={{ fontSize: "1.25rem", textAlign: "left", margin: "0.625rem 0.0625rem", fontWeight: "700", color: headingColor, borderBottom: `2px solid ${headingColor}` }}>
                    Professional Summary
                  </h3>
                  {editMode ? (
                    <textarea
                      value={localData.summary || ""}
                      onChange={(e) => handleFieldChange("summary", e.target.value)}
                      style={{ width: "100%", minHeight: "4rem", border: "none", outline: "none", backgroundColor: "#e7f1ff", resize: "vertical" }}
                      placeholder="Write your professional summary here..."
                    />
                  ) : (
                    <div>{localData.summary}</div>
                  )}
                </div>
               );
            })()}

            {/* --- SKILLS SECTION --- */}
            {(() => {
                const hasData = hasSectionData("skills");
                if (!hasData && !editMode) return null;

                if (editMode && (!localData.skills || localData.skills.length === 0)) {
                    return (
                        <div onClick={() => setLocalData({...localData, skills: [""]})} style={emptySectionPlaceholderStyle}>
                           + Add Skills
                        </div>
                    );
                }

                return (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.25rem", textAlign: "left", margin: "0.625rem 0.0625rem", fontWeight: "700", color: headingColor, borderBottom: `2px solid ${headingColor}` }}>
                      Skills
                    </h3>
                    {editMode ? (
                      <textarea
                        value={localData?.skills?.join(", ") || ""}
                        onChange={(e) => handleSkillsChange(e.target.value)}
                        style={{ width: "100%", minHeight: "3rem", border: "none", backgroundColor: "#e7f1ff", resize: "vertical" }}
                        placeholder="Java, Python, React, etc. (comma separated)"
                      />
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {localData?.skills?.map((skill, index) => (
                           skill && <span key={index} style={{ backgroundColor: "#e5e7eb", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.8125rem" }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
            })()}

            {/* --- EXPERIENCE SECTION --- */}
            {(() => {
               const hasData = hasSectionData("experience");
               if (!hasData && !editMode) return null;

               if (editMode && (!localData.experience || localData.experience.length === 0)) {
                   return (
                       <div onClick={() => addNewEntry("experience")} style={emptySectionPlaceholderStyle}>
                           + Add Experience
                       </div>
                   );
               }

               return (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", textAlign: "left", margin: "0.625rem 0.0625rem", fontWeight: "700", color: headingColor, borderBottom: `2px solid ${headingColor}` }}>
                    Experience
                  </h3>
                  {localData?.experience?.map((exp, idx) => {
                     if (!editMode && isItemEmpty(exp)) return null;
                     return (
                       <div key={idx} style={{ marginBottom: "1rem", padding: editMode ? "10px" : "0", border: editMode ? "1px dashed #ccc" : "none" }}>
                       <div style={{ display: "grid", width: "100%", gridTemplateColumns: "80% 20%" }}>
                           <div>
                           {editMode ? <input type="text" value={exp.companyName || ""} onChange={(e) => handleArrayFieldChange("experience", idx, "companyName", e.target.value)} style={{ fontSize: "1.125rem", width: "100%", border: "none", backgroundColor: "#e7f1ff" }} placeholder="Company Name" /> : <p style={{ fontSize: "1.125rem", fontWeight: "bold" }}>{exp.companyName}</p>}
                           </div>
                           <div>
                           {editMode ? <input type="text" value={exp.date || ""} onChange={(e) => handleArrayFieldChange("experience", idx, "date", e.target.value)} style={{ fontSize: "0.9375rem", width: "100%", border: "none", backgroundColor: "#e7f1ff" }} placeholder="Date" /> : <p style={{ fontSize: "0.9375rem", textAlign: "right" }}>{exp.date}</p>}
                           </div>
                       </div>
                       <div>
                           {editMode ? <input type="text" value={exp.title || ""} onChange={(e) => handleArrayFieldChange("experience", idx, "title", e.target.value)} style={{ fontSize: "1rem", width: "100%", border: "none", backgroundColor: "#e7f1ff" }} placeholder="Job Title" /> : <p style={{ fontSize: "1rem", fontStyle: "italic" }}>{exp.title}</p>}
                       </div>
                       
                       {editMode ? <textarea value={exp.description || ""} onChange={(e) => handleArrayFieldChange("experience", idx, "description", e.target.value)} style={{ width: "100%", minHeight: "3rem", border: "none", backgroundColor: "#e7f1ff", resize: "vertical" }} placeholder="Job Description" /> : <div style={{ fontSize: "0.9375rem" }}>{exp.description}</div>}
                       
                       {editMode && <button onClick={() => removeEntry("experience", idx)} style={{ backgroundColor: "#ef4444", color: "white", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", border: "none", marginTop: "5px", fontSize: "0.75rem", cursor: "pointer" }}>Remove Entry</button>}
                       </div>
                     );
                  })}
                  {editMode && (
                    <button onClick={() => addNewEntry("experience")} style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", marginTop: "10px" }}>
                      + Add Experience
                    </button>
                  )}
                </div>
               );
            })()}

            {/* --- EDUCATION SECTION --- */}
            {(() => {
                const hasData = hasSectionData("education");
                if (!hasData && !editMode) return null;
                
                if (editMode && (!localData.education || localData.education.length === 0)) {
                    return <div onClick={() => addNewEntry("education")} style={emptySectionPlaceholderStyle}>+ Add Education</div>;
                }

                return (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", textAlign: "left", margin: "0.625rem 0.0625rem", fontWeight: "700", color: headingColor, borderBottom: `2px solid ${headingColor}` }}>
                    Education
                  </h3>
                  {localData?.education?.map((edu, idx) => {
                     if (!editMode && isItemEmpty(edu)) return null;
                     return (
                    <div key={idx} style={{ marginBottom: "1rem", padding: editMode ? "10px" : "0", border: editMode ? "1px dashed #ccc" : "none" }}>
                      <div style={{ display: "grid", width: "100%", gridTemplateColumns: "80% 20%" }}>
                        <div>
                          {editMode ? <input type="text" value={edu.institution || ""} onChange={(e) => handleArrayFieldChange("education", idx, "institution", e.target.value)} style={{ fontSize: "1.125rem", width: "100%", border: "none", backgroundColor: "#e7f1ff" }} placeholder="Institution Name" /> : <p style={{ fontSize: "1.125rem", fontWeight: "bold" }}>{edu.institution}</p>}
                        </div>
                        <div>
                          {editMode ? <input type="text" value={edu.duration || ""} onChange={(e) => handleArrayFieldChange("education", idx, "duration", e.target.value)} style={{ fontSize: "0.9375rem", width: "100%", border: "none", backgroundColor: "#e7f1ff" }} placeholder="Year" /> : <p style={{ fontSize: "0.9375rem", textAlign: "right" }}>{edu.duration}</p>}
                        </div>
                      </div>
                      <div>
                          {editMode ? <input type="text" value={edu.degree || ""} onChange={(e) => handleArrayFieldChange("education", idx, "degree", e.target.value)} style={{ fontSize: "1rem", width: "100%", border: "none", backgroundColor: "#e7f1ff" }} placeholder="Degree" /> : <p style={{ fontSize: "1rem" }}>{edu.degree}</p>}
                      </div>
                      {editMode && <button onClick={() => removeEntry("education", idx)} style={{ backgroundColor: "#ef4444", color: "white", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", border: "none", marginTop: "5px", fontSize: "0.75rem", cursor: "pointer" }}>Remove Entry</button>}
                    </div>
                  )})}
                  {editMode && (
                    <button onClick={() => addNewEntry("education")} style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", marginTop: "10px" }}>
                      + Add Education
                    </button>
                  )}
                </div>
                );
            })()}

            {/* --- ACHIEVEMENTS SECTION --- */}
            {(() => {
               const hasData = hasSectionData("achievements");
               if (!hasData && !editMode) return null;

               if (editMode && (!localData.achievements || localData.achievements.length === 0)) {
                   return <div onClick={() => addNewEntry("achievements")} style={emptySectionPlaceholderStyle}>+ Add Achievements</div>;
               }

               return (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", textAlign: "left", margin: "0.625rem 0.0625rem", fontWeight: "700", color: headingColor, borderBottom: `2px solid ${headingColor}` }}>
                    Achievements
                  </h3>
                  {localData?.achievements?.map((ach, idx) => {
                     if (!editMode && isItemEmpty(ach)) return null;
                     return (
                    <div key={idx} style={{ marginBottom: "1rem", padding: editMode ? "10px" : "0", border: editMode ? "1px dashed #ccc" : "none" }}>
                      {editMode ? <input type="text" value={ach.keyAchievements || ""} onChange={(e) => handleArrayFieldChange("achievements", idx, "keyAchievements", e.target.value)} style={{ fontSize: "1rem", width: "100%", border: "none", backgroundColor: "#e7f1ff", fontWeight: "bold" }} placeholder="Achievement Title" /> : <p style={{ fontSize: "1rem", fontWeight: "bold" }}>{ach.keyAchievements}</p>}
                      {editMode ? <textarea value={ach.describe || ""} onChange={(e) => handleArrayFieldChange("achievements", idx, "describe", e.target.value)} style={{ fontSize: "0.9375rem", width: "100%", minHeight: "3rem", border: "none", backgroundColor: "#e7f1ff", resize: "vertical" }} placeholder="Description" /> : <p style={{ fontSize: "0.9375rem" }}>{ach.describe}</p>}
                      {editMode && <button onClick={() => removeEntry("achievements", idx)} style={{ backgroundColor: "#ef4444", color: "white", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", border: "none", marginTop: "5px", fontSize: "0.75rem", cursor: "pointer" }}>Remove Entry</button>}
                    </div>
                  )})}
                  {editMode && (
                    <button onClick={() => addNewEntry("achievements")} style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", marginTop: "10px" }}>
                      + Add Achievement
                    </button>
                  )}
                </div>
               );
            })()}

             {/* --- LANGUAGES SECTION --- */}
             {(() => {
                const hasData = hasSectionData("languages");
                if (!hasData && !editMode) return null;
                
                if (editMode && (!localData.languages || localData.languages.length === 0)) {
                    return <div onClick={() => addNewEntry("languages")} style={emptySectionPlaceholderStyle}>+ Add Languages</div>;
                }

                return (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", textAlign: "left", margin: "0.625rem 0.0625rem", fontWeight: "700", color: headingColor, borderBottom: `2px solid ${headingColor}` }}>
                    Languages
                  </h3>
                  {localData?.languages?.map((lang, idx) => {
                     if (!editMode && isItemEmpty(lang)) return null;
                     return (
                    <div key={idx} style={{ marginBottom: "0.5rem", padding: editMode ? "5px" : "0", border: editMode ? "1px dashed #ccc" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                          {editMode ? <input type="text" value={lang.language || ""} onChange={(e) => handleArrayFieldChange("languages", idx, "language", e.target.value)} style={{ fontSize: "1rem", border: "none", backgroundColor: "#e7f1ff", width: "45%" }} placeholder="Language" /> : <span style={{ fontSize: "1rem", fontWeight: "bold" }}>{lang.language}</span>}
                          {editMode ? <input type="text" value={lang.proficiency || ""} onChange={(e) => handleArrayFieldChange("languages", idx, "proficiency", e.target.value)} style={{ fontSize: "1rem", border: "none", backgroundColor: "#e7f1ff", width: "45%" }} placeholder="Proficiency" /> : <span style={{ fontSize: "1rem" }}>{lang.proficiency}</span>}
                      </div>
                      {editMode && <button onClick={() => removeEntry("languages", idx)} style={{ backgroundColor: "#ef4444", color: "white", padding: "0.1rem 0.4rem", borderRadius: "0.2rem", border: "none", fontSize: "0.6rem", cursor: "pointer", marginTop: "4px" }}>Remove</button>}
                    </div>
                  )})}
                  {editMode && (
                    <button onClick={() => addNewEntry("languages")} style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", marginTop: "10px" }}>
                      + Add Language
                    </button>
                  )}
                </div>
                );
            })()}

            {/* --- PROJECTS SECTION --- */}
            {(() => {
               const hasData = hasSectionData("projects");
               if (!hasData && !editMode) return null;

               if (editMode && (!localData.projects || localData.projects.length === 0)) {
                   return <div onClick={() => addNewEntry("projects")} style={emptySectionPlaceholderStyle}>+ Add Projects</div>;
               }

               return (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", textAlign: "left", margin: "0.625rem 0.0625rem", fontWeight: "700", color: headingColor, borderBottom: `2px solid ${headingColor}` }}>
                    Projects
                  </h3>
                  {localData?.projects?.map((prj, idx) => {
                     if (!editMode && isItemEmpty(prj)) return null;
                     return (
                    <div key={idx} style={{ marginBottom: "1rem", padding: editMode ? "10px" : "0", border: editMode ? "1px dashed #ccc" : "none" }}>
                      <div style={{ display: "grid", width: "100%", gridTemplateColumns: "80% 20%" }}>
                        <div>
                          {editMode ? <input type="text" value={prj.name || prj.title || ""} onChange={(e) => handleArrayFieldChange("projects", idx, "name", e.target.value)} style={{ fontSize: "1.125rem", width: "100%", border: "none", backgroundColor: "#e7f1ff" }} placeholder="Project Name" /> : <p style={{ fontSize: "1.125rem", fontWeight: "bold" }}>{prj.name || prj.title}</p>}
                        </div>
                        <div>
                          {editMode ? <input type="text" value={prj.duration || ""} onChange={(e) => handleArrayFieldChange("projects", idx, "duration", e.target.value)} style={{ fontSize: "1rem", width: "100%", border: "none", backgroundColor: "#e7f1ff" }} placeholder="Duration" /> : <p style={{ fontSize: "1rem", textAlign: "right" }}>{prj.duration}</p>}
                        </div>
                      </div>
                      {editMode ? <textarea value={prj.description || ""} onChange={(e) => handleArrayFieldChange("projects", idx, "description", e.target.value)} style={{ fontSize: "1rem", width: "100%", minHeight: "3rem", border: "none", backgroundColor: "#e7f1ff", resize: "vertical" }} placeholder="Project Description" /> : <p style={{ fontSize: "1rem" }}>{prj.description}</p>}
                      {editMode && <button onClick={() => removeEntry("projects", idx)} style={{ backgroundColor: "#ef4444", color: "white", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", border: "none", marginTop: "5px", fontSize: "0.75rem", cursor: "pointer" }}>Remove Entry</button>}
                    </div>
                  )})}
                  {editMode && (
                    <button onClick={() => addNewEntry("projects")} style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", marginTop: "10px" }}>
                      + Add Project
                    </button>
                  )}
                </div>
               );
            })()}

            {/* --- CERTIFICATIONS SECTION --- */}
            {(() => {
                const hasData = hasSectionData("certifications");
                if (!hasData && !editMode) return null;
                
                if (editMode && (!localData.certifications || localData.certifications.length === 0)) {
                    return <div onClick={() => addNewEntry("certifications")} style={emptySectionPlaceholderStyle}>+ Add Certifications</div>;
                }

                return (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", textAlign: "left", margin: "0.625rem 0.0625rem", fontWeight: "700", color: headingColor, borderBottom: `2px solid ${headingColor}` }}>
                    Certifications
                  </h3>
                  {localData?.certifications?.map((cert, idx) => {
                     if (!editMode && isItemEmpty(cert)) return null;
                     return (
                    <div key={idx} style={{ marginBottom: "1rem", padding: editMode ? "5px" : "0", border: editMode ? "1px dashed #ccc" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                          {editMode ? <input type="text" value={cert.title || ""} onChange={(e) => handleArrayFieldChange("certifications", idx, "title", e.target.value)} style={{ fontSize: "1rem", border: "none", backgroundColor: "#e7f1ff", width: "60%" }} placeholder="Certificate Name" /> : <span style={{ fontSize: "1rem", fontWeight: "bold" }}>{cert.title}</span>}
                          {editMode ? <input type="text" value={cert.date || ""} onChange={(e) => handleArrayFieldChange("certifications", idx, "date", e.target.value)} style={{ fontSize: "1rem", border: "none", backgroundColor: "#e7f1ff", width: "30%" }} placeholder="Date" /> : <span style={{ fontSize: "0.9375rem" }}>{cert.date}</span>}
                      </div>
                      {editMode ? <input type="text" value={cert.issuer || ""} onChange={(e) => handleArrayFieldChange("certifications", idx, "issuer", e.target.value)} style={{ fontSize: "0.9rem", border: "none", backgroundColor: "#e7f1ff", width: "100%" }} placeholder="Issuing Org" /> : <div style={{ fontSize: "0.9rem", fontStyle: "italic" }}>{cert.issuer}</div>}
                      {editMode && <button onClick={() => removeEntry("certifications", idx)} style={{ backgroundColor: "#ef4444", color: "white", padding: "0.1rem 0.4rem", borderRadius: "0.2rem", border: "none", fontSize: "0.6rem", cursor: "pointer", marginTop: "4px" }}>Remove</button>}
                    </div>
                  )})}
                  {editMode && (
                    <button onClick={() => addNewEntry("certifications")} style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", marginTop: "10px" }}>
                      + Add Certification
                    </button>
                  )}
                </div>
                );
            })()}

            {/* --- INTERESTS SECTION --- */}
            {(() => {
                const hasData = hasSectionData("interests");
                if (!hasData && !editMode) return null;

                if (editMode && (!localData.interests || localData.interests.length === 0)) {
                    return <div onClick={() => setLocalData({...localData, interests: [""]})} style={emptySectionPlaceholderStyle}>+ Add Interests</div>;
                }

                return (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.25rem", textAlign: "left", margin: "0.625rem 0.0625rem", fontWeight: "700", color: headingColor, borderBottom: `2px solid ${headingColor}` }}>
                      Interests
                    </h3>
                    {editMode ? (
                      <textarea
                        value={localData?.interests?.join(", ") || ""}
                        onChange={(e) => handleInterestsChange(e.target.value)}
                        style={{ width: "100%", minHeight: "3rem", border: "none", backgroundColor: "#e7f1ff", resize: "vertical" }}
                        placeholder="Coding, Reading, Hiking (comma separated)"
                      />
                    ) : (
                      <div style={{ fontSize: "0.9375rem" }}>{localData?.interests?.join(", ")}</div>
                    )}
                  </div>
                );
            })()}

             {/* --- REFERENCES SECTION --- */}
             {(() => {
                const hasData = hasSectionData("references");
                if (!hasData && !editMode) return null;
                
                if (editMode && (!localData.references || localData.references.length === 0)) {
                    return <div onClick={() => addNewEntry("references")} style={emptySectionPlaceholderStyle}>+ Add References</div>;
                }

                return (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", textAlign: "left", margin: "0.625rem 0.0625rem", fontWeight: "700", color: headingColor, borderBottom: `2px solid ${headingColor}` }}>
                    References
                  </h3>
                  {localData?.references?.map((ref, idx) => {
                     if (!editMode && isItemEmpty(ref)) return null;
                     return (
                    <div key={idx} style={{ marginBottom: "1rem", padding: editMode ? "10px" : "0", border: editMode ? "1px dashed #ccc" : "none" }}>
                      {editMode ? <input type="text" value={ref.name || ""} onChange={(e) => handleArrayFieldChange("references", idx, "name", e.target.value)} style={{ fontSize: "1rem", border: "none", backgroundColor: "#e7f1ff", width: "100%" }} placeholder="Reference Name" /> : <p style={{ fontSize: "1rem", fontWeight: "bold" }}>{ref.name}</p>}
                      {editMode ? <input type="text" value={ref.position || ""} onChange={(e) => handleArrayFieldChange("references", idx, "position", e.target.value)} style={{ fontSize: "0.9rem", border: "none", backgroundColor: "#e7f1ff", width: "100%" }} placeholder="Position & Company" /> : <p style={{ fontSize: "0.9rem" }}>{ref.position} {ref.company ? `at ${ref.company}` : ''}</p>}
                      {editMode ? <input type="text" value={ref.contact || ""} onChange={(e) => handleArrayFieldChange("references", idx, "contact", e.target.value)} style={{ fontSize: "0.9rem", border: "none", backgroundColor: "#e7f1ff", width: "100%" }} placeholder="Contact Info" /> : <p style={{ fontSize: "0.9rem" }}>{ref.contact}</p>}
                      {editMode && <button onClick={() => removeEntry("references", idx)} style={{ backgroundColor: "#ef4444", color: "white", padding: "0.1rem 0.4rem", borderRadius: "0.2rem", border: "none", fontSize: "0.6rem", cursor: "pointer", marginTop: "4px" }}>Remove</button>}
                    </div>
                  )})}
                  {editMode && (
                    <button onClick={() => addNewEntry("references")} style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", marginTop: "10px" }}>
                      + Add Reference
                    </button>
                  )}
                </div>
                );
            })()}

          </div>

          {/* EDIT/SAVE/CANCEL BUTTONS */}
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            {editMode ? (
              <>
                <button onClick={handleOpenColorPicker} style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1rem", borderRadius: "0.375rem", marginRight: "0.5rem", border: "none", cursor: "pointer" }}>Change Color</button>
                <button onClick={handleSave} style={{ backgroundColor: "#10b981", color: "white", padding: "0.5rem 1rem", borderRadius: "0.375rem", marginRight: "0.5rem", border: "none", cursor: "pointer" }}>Save</button>
                <button onClick={handleCancel} style={{ backgroundColor: "#6b7280", color: "white", padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer" }}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer" }}>Edit</button>
            )}
            <input ref={colorInputRef} type="color" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} style={{ display: "none" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template6;