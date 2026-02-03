import React, { useState, useRef, useEffect } from "react";
import { toast } from 'react-toastify';
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import resumeService from "../../services/resumeService";

const Template1 = () => {
  const resumeContext = useResume();

  // Handle case where context might not be properly initialized
  const resumeData = resumeContext?.resumeData || {};
  const updateResumeData = resumeContext?.updateResumeData;

  const [localData, setLocalData] = useState(resumeData);
  const [editMode, setEditMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);
  const resumeRef = useRef();

  useEffect(() => {
    // Load data from localStorage first
    try {
      const savedData = localStorage.getItem('resumeData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setLocalData(parsedData);
        return;
      }
    } catch (error) {
      console.error('Template1: Error loading from localStorage:', error);
    }

    // Fallback to context data
    if (resumeData && Object.keys(resumeData).length > 0) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
    }
  }, [resumeData]);

  // Handlers (Keep existing logic) 
  const handleInputChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    localStorage.setItem('resumeData', JSON.stringify(updatedData));
  };

  const handleObjectChange = (section, index, field, value) => {
    const updatedSection = [...(localData[section] || [])];
    if (updatedSection[index]) {
      updatedSection[index] = { ...updatedSection[index], [field]: value };
    }
    const updatedData = { ...localData, [section]: updatedSection };
    setLocalData(updatedData);
    localStorage.setItem('resumeData', JSON.stringify(updatedData));
  };

  const addItem = (section, newItem) => {
    const updatedData = {
      ...localData,
      [section]: [...(localData[section] || []), newItem]
    };
    setLocalData(updatedData);
    localStorage.setItem('resumeData', JSON.stringify(updatedData));
  };

  const removeItem = (section, index) => {
    const updatedSection = (localData[section] || []).filter((_, i) => i !== index);
    const updatedData = { ...localData, [section]: updatedSection };
    setLocalData(updatedData);
    localStorage.setItem('resumeData', JSON.stringify(updatedData));
  };

  const handleSave = async () => {
    try {
      setSaveStatus('Saving...');
      setIsSavingToDatabase(true);

      if (!resumeContext) throw new Error('Resume context not available.');
      if (typeof updateResumeData !== 'function') throw new Error('updateResumeData is not a function.');

      await updateResumeData(localData);

      // Save to backend structure
      try {
        const structuredData = {
          templateId: 1,
          personalInfo: {
            name: localData.name || '',
            role: localData.role || '',
            email: localData.email || '',
            phone: localData.phone || '',
            location: localData.location || '',
            linkedin: localData.linkedin || '',
            github: localData.github || '',
          },
          summary: localData.summary || '',
          skills: localData.skills || [],
          experience: localData.experience || [],
          education: localData.education || [],
          projects: localData.projects || [],
          certifications: localData.certifications || [],
          achievements: localData.achievements || [],
          languages: localData.languages || [],
          interests: localData.interests || [],
        };
        await resumeService.saveResumeData(structuredData);
      } catch (error) {
        console.error('Save error:', error);
      }

      setEditMode(false);
      setSaveStatus('Data saved successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("Error saving resume data:", error);
      setSaveStatus(`Error: ${error.message}`);
      toast.error('Failed to save');
      setTimeout(() => setSaveStatus(''), 5000);
    } finally {
      setIsSavingToDatabase(false);
    }
  };

  const handleCancel = () => {
    setLocalData(resumeData ? JSON.parse(JSON.stringify(resumeData)) : {});
    setEditMode(false);
    setSaveStatus('');
  };

  const handleEnhance = (section) => {
    toast.info(`Enhancing ${section}...`);
  };

  const handleFontChange = (font) => {
    setLocalData({ ...localData, font });
  };

  const handleColorChange = (color) => {
    setLocalData({ ...localData, textColor: color });
  };

  const handleDownload = () => {
    window.print();
  };

  // Helper to render bullet lists for descriptions
  const renderList = (text) => {
    if (!text) return null;
    const items = text.split('\n').filter(item => item.trim());
    return (
      <ul style={{ paddingLeft: "1.2rem", margin: "0.25rem 0" }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: "0.25rem" }}>{item}</li>
        ))}
      </ul>
    );
  };

  // Helper functions to check if sections have data
  const hasSummary = () => {
    if (!localData.summary) return false;
    const summaryStr = typeof localData.summary === 'string' ? localData.summary : String(localData.summary);
    return summaryStr.trim().length > 0;
  };

  const hasSkills = () => {
    return localData.skills && localData.skills.length > 0 && localData.skills.some(skill => {
      if (!skill) return false;
      const skillStr = typeof skill === 'string' ? skill : String(skill);
      return skillStr.trim().length > 0;
    });
  };

  const hasExperience = () => {
    if (!localData.experience || localData.experience.length === 0) return false;
    return localData.experience.some(exp =>
      (exp.title && exp.title.trim().length > 0) ||
      (exp.company && exp.company.trim().length > 0) ||
      (exp.description && exp.description.trim().length > 0)
    );
  };

  const hasEducation = () => {
    if (!localData.education || localData.education.length === 0) return false;
    return localData.education.some(edu =>
      (edu.degree && edu.degree.trim().length > 0) ||
      (edu.institution && edu.institution.trim().length > 0)
    );
  };

  const hasProjects = () => {
    if (!localData.projects || localData.projects.length === 0) return false;
    return localData.projects.some(proj =>
      (proj.name && proj.name.trim().length > 0) ||
      (proj.description && proj.description.trim().length > 0)
    );
  };

  const hasCertifications = () => {
    if (!localData.certifications || localData.certifications.length === 0) return false;
    return localData.certifications.some(cert =>
      (cert.name && cert.name.trim().length > 0) ||
      (cert.title && cert.title.trim().length > 0)
    );
  };

  const hasAchievements = () => {
    return localData.achievements && localData.achievements.length > 0 && localData.achievements.some(ach => {
      if (!ach) return false;
      const achStr = typeof ach === 'string' ? ach : String(ach);
      return achStr.trim().length > 0;
    });
  };

  const hasLanguages = () => {
    return localData.languages && localData.languages.length > 0 && localData.languages.some(lang => {
      if (!lang) return false;
      const langStr = typeof lang === 'string' ? lang : String(lang);
      return langStr.trim().length > 0;
    });
  };

  const hasInterests = () => {
    return localData.interests && localData.interests.length > 0 && localData.interests.some(int => {
      if (!int) return false;
      const intStr = typeof int === 'string' ? int : String(int);
      return intStr.trim().length > 0;
    });
  };

  // Define the primary teal color from the image (or user selection)
  const primaryColor = localData.textColor || "#1d7a68";
  const leftColumnWidth = "33%";
  const rightColumnWidth = "67%";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar
          onEnhance={handleEnhance}
          resumeRef={resumeRef}
          onFontChange={handleFontChange}
          onColorChange={handleColorChange}
          onDownload={handleDownload}
        />

        <div style={{ flexGrow: 1, padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* Resume Container - Replicating the Microsoft Employee Resume Layout */}
          <div
            ref={resumeRef}
            style={{
              display: "flex",
              backgroundColor: "#ffffff",
              maxWidth: "210mm",
              minHeight: "297mm",
              width: "100%",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              fontFamily: localData.font || "Arial, sans-serif",
              boxSizing: "border-box"
            }}
          >

            {/* --- LEFT COLUMN (Teal Background) --- */}
            <div style={{
              width: leftColumnWidth,
              backgroundColor: primaryColor,
              color: "#ffffff",
              padding: "30px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start" // Left align text in general
            }}>

              {/* Profile Image (Circular) */}
              <div style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                backgroundColor: "#ccc",
                overflow: "hidden",
                margin: "0 auto 20px auto", // Center image
                border: "3px solid #fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#333"
              }}>
                {/* Placeholder for image logic - assuming text for now if no URL */}
                <span style={{ fontSize: "3rem" }}>👤</span>
              </div>

              {/* Name & Role */}
              <div style={{ width: "100%", textAlign: "center", marginBottom: "25px" }}>
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={localData.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      style={{ width: "100%", marginBottom: "5px", padding: "5px", color: "#000", textAlign: "center" }}
                      placeholder="NAME"
                    />
                    <input
                      type="text"
                      value={localData.role || ""}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                      style={{ width: "100%", padding: "5px", color: "#000", textAlign: "center" }}
                      placeholder="ROLE"
                    />
                  </>
                ) : (
                  <>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", textTransform: "uppercase", margin: "0 0 5px 0", letterSpacing: "1px" }}>
                      {localData.name || "YOUR NAME"}
                    </h1>
                    <div style={{ fontSize: "14px", fontWeight: "300" }}>{localData.role || "Role / Title"}</div>
                  </>
                )}
              </div>

              {/* Divider */}
              <div style={{ width: "100%", borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "20px" }}></div>

              {/* Contact Info */}
              <div style={{ width: "100%", marginBottom: "30px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "400", marginBottom: "15px" }}>Contact</h3>
                <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {editMode ? (
                    <>
                      <input type="text" value={localData.phone || ""} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="Phone" style={{ color: "black", width: "100%" }} />
                      <input type="text" value={localData.email || ""} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="Email" style={{ color: "black", width: "100%" }} />
                      <input type="text" value={localData.linkedin || ""} onChange={(e) => handleInputChange("linkedin", e.target.value)} placeholder="LinkedIn URL" style={{ color: "black", width: "100%" }} />
                      <input type="text" value={localData.github || ""} onChange={(e) => handleInputChange("github", e.target.value)} placeholder="Github/Portfolio" style={{ color: "black", width: "100%" }} />
                    </>
                  ) : (
                    <>
                      {localData.phone && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span>📱</span> {localData.phone}</div>}
                      {localData.email && <div style={{ display: "flex", alignItems: "center", gap: "8px", wordBreak: "break-all" }}><span>✉️</span> {localData.email}</div>}
                      {localData.linkedin && <div style={{ display: "flex", alignItems: "center", gap: "8px", wordBreak: "break-all" }}><span>🔗</span> {localData.linkedin.replace('https://', '')}</div>}
                      {localData.github && <div style={{ display: "flex", alignItems: "center", gap: "8px", wordBreak: "break-all" }}><span>🐙</span> <a href={localData.github} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{localData.github.replace('https://', '')}</a></div>}
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: "100%", borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "20px" }}></div>

              {/* Summary */}
              {(editMode || hasSummary()) && (
                <div style={{ width: "100%", marginBottom: "30px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "400", marginBottom: "10px" }}>Summary</h3>
                  {editMode ? (
                    <textarea
                      value={localData.summary || ""}
                      onChange={(e) => handleInputChange("summary", e.target.value)}
                      style={{ width: "100%", minHeight: "100px", color: "black", padding: "5px" }}
                    />
                  ) : (
                    <p style={{ fontSize: "13px", lineHeight: "1.5", textAlign: "left", opacity: "0.9" }}>
                      {localData.summary}
                    </p>
                  )}
                </div>
              )}

              {/* Divider */}
              <div style={{ width: "100%", borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "20px" }}></div>

              {/* Skills */}
              {(editMode || hasSkills()) && (
                <div style={{ width: "100%", marginBottom: "30px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "400", marginBottom: "10px" }}>Skills</h3>
                  <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                    {(() => {
                      const skills = editMode
                        ? (localData.skills || [])
                        : (localData.skills || []).filter(skill => {
                          if (!skill) return false;
                          const skillStr = typeof skill === 'string' ? skill : String(skill);
                          return skillStr.trim().length > 0;
                        });

                      return skills.length > 0 ? (
                        skills.map((skill, idx) => {
                          const originalIndex = editMode ? idx : localData.skills.findIndex(s => s === skill);
                          return (
                            <div key={editMode ? idx : `skill-${originalIndex}`} style={{ display: "flex", alignItems: "center" }}>
                              <span style={{ marginRight: "8px" }}>▪</span>
                              {editMode ? (
                                <>
                                  <input value={typeof skill === 'string' ? skill : (skill?.name || skill?.title || String(skill))}
                                    onChange={(e) => {
                                      const newSkills = [...localData.skills];
                                      newSkills[originalIndex] = e.target.value;
                                      setLocalData({ ...localData, skills: newSkills });
                                      localStorage.setItem('resumeData', JSON.stringify({ ...localData, skills: newSkills }));
                                    }}
                                    placeholder="New Skill"
                                    style={{ width: "80%", color: "black", padding: "2px" }}
                                  />
                                  <span onClick={() => removeItem("skills", originalIndex)} style={{ cursor: "pointer", marginLeft: "5px", fontWeight: "bold" }}>x</span>
                                </>
                              ) : (
                                <span>{typeof skill === 'string' ? skill : (skill?.name || skill?.title || String(skill))}</span>
                              )}
                            </div>
                          );
                        })
                      ) : null;
                    })()}
                    {editMode && (
                      <button onClick={() => addItem("skills", "")} style={{ marginTop: "10px", fontSize: "12px", color: "#333", background: "#fff", border: "none", padding: "2px 5px", cursor: "pointer" }}>+ Add Skill</button>
                    )}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div style={{ width: "100%", borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "20px" }}></div>

              {/* Certifications */}
              {(editMode || hasCertifications()) && (
                <div style={{ width: "100%" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "400", marginBottom: "10px" }}>Certifications</h3>
                  <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
                    {(() => {
                      const certifications = editMode
                        ? (localData.certifications || [])
                        : (localData.certifications || []).filter(cert =>
                          (cert.name && cert.name.trim().length > 0) ||
                          (cert.title && cert.title.trim().length > 0)
                        );

                      return certifications.length > 0 ? (
                        certifications.map((cert, idx) => {
                          const originalIndex = editMode ? idx : localData.certifications.findIndex(c => c === cert);
                          return (
                            <div key={editMode ? idx : `cert-${originalIndex}`} style={{ marginBottom: "8px" }}>
                              {editMode ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px", background: "rgba(255,255,255,0.1)", padding: "5px" }}>
                                  <input value={cert.name || cert.title || ""} onChange={(e) => handleObjectChange("certifications", originalIndex, "name", e.target.value)} placeholder="Name" style={{ color: "black" }} />
                                  <input value={cert.year || ""} onChange={(e) => handleObjectChange("certifications", originalIndex, "year", e.target.value)} placeholder="Year" style={{ color: "black" }} />
                                  <button onClick={() => removeItem("certifications", originalIndex)} style={{ fontSize: "10px", color: "red" }}>Remove</button>
                                </div>
                              ) : (
                                <div>{(cert.name || cert.title)} {cert.year ? `(${cert.year})` : ""}</div>
                              )}
                            </div>
                          );
                        })
                      ) : null;
                    })()}
                    {editMode && (
                      <button onClick={() => addItem("certifications", { name: "", year: "" })} style={{ fontSize: "12px", color: "#333", background: "#fff", border: "none", padding: "2px 5px", cursor: "pointer" }}>+ Add Cert</button>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN (White Background) */}
            <div style={{
              width: rightColumnWidth,
              padding: "30px 30px 30px 30px",
              color: "#333",
              display: "flex",
              flexDirection: "column"
            }}>

              {/* Professional Experience */}
              {(editMode || hasExperience()) && (
                <div style={{ marginBottom: "25px" }}>
                  <h2 style={{
                    fontSize: "18px",
                    color: primaryColor,
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${primaryColor}`,
                    paddingBottom: "5px",
                    marginBottom: "15px",
                    letterSpacing: "1px"
                  }}>
                    Professional Experience
                  </h2>

                  {(() => {
                    const experiences = editMode
                      ? (localData.experience || [])
                      : (localData.experience || []).filter(exp =>
                        (exp.title && exp.title.trim().length > 0) ||
                        (exp.company && exp.company.trim().length > 0) ||
                        (exp.description && exp.description.trim().length > 0)
                      );

                    return experiences.length > 0 ? (
                      experiences.map((exp, idx) => {
                        const originalIndex = editMode ? idx : localData.experience.findIndex(e => e === exp);
                        return (
                          <div key={editMode ? idx : `exp-${originalIndex}`} style={{ marginBottom: "20px" }}>
                            {editMode ? (
                              <div style={{ border: "1px dashed #ccc", padding: "10px", marginBottom: "10px" }}>
                                <input type="text" value={exp.title || ""} onChange={(e) => handleObjectChange("experience", originalIndex, "title", e.target.value)} placeholder="Job Title" style={{ width: "100%", marginBottom: "5px" }} />
                                <div style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                                  <input type="text" value={exp.company || ""} onChange={(e) => handleObjectChange("experience", originalIndex, "company", e.target.value)} placeholder="Company" style={{ flex: 1 }} />
                                  <input type="text" value={exp.location || ""} onChange={(e) => handleObjectChange("experience", originalIndex, "location", e.target.value)} placeholder="Location" style={{ flex: 1 }} />
                                </div>
                                <input type="text" value={exp.date || ""} onChange={(e) => handleObjectChange("experience", originalIndex, "date", e.target.value)} placeholder="Date Range" style={{ width: "100%", marginBottom: "5px" }} />
                                <textarea value={exp.description || ""} onChange={(e) => handleObjectChange("experience", originalIndex, "description", e.target.value)} placeholder="Description" style={{ width: "100%", minHeight: "60px" }} />
                                <button onClick={() => removeItem("experience", originalIndex)} style={{ color: "red", marginTop: "5px" }}>Remove</button>
                              </div>
                            ) : (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                                  <div style={{ fontWeight: "bold", fontSize: "15px", color: "#222" }}>{exp.title}</div>
                                  <div style={{ fontSize: "14px", color: primaryColor, fontWeight: "bold" }}>{exp.date}</div>
                                </div>
                                <div style={{ fontSize: "14px", color: primaryColor, marginBottom: "5px" }}>
                                  {exp.company} {exp.location ? `– ${exp.location}` : ""}
                                </div>
                                <div style={{ fontSize: "13px", color: "#444" }}>
                                  {renderList(exp.description)}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    ) : null;
                  })()}
                  {editMode && <button onClick={() => addItem("experience", { title: "", company: "", location: "", date: "", description: "" })} style={{ color: primaryColor, cursor: "pointer" }}>+ Add Experience</button>}
                </div>
              )}

              {/* Education */}
              {(editMode || hasEducation()) && (
                <div style={{ marginBottom: "25px" }}>
                  <h2 style={{
                    fontSize: "18px",
                    color: primaryColor,
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${primaryColor}`,
                    paddingBottom: "5px",
                    marginBottom: "15px",
                    letterSpacing: "1px"
                  }}>
                    Education
                  </h2>
                  {(() => {
                    const educations = editMode
                      ? (localData.education || [])
                      : (localData.education || []).filter(edu =>
                        (edu.degree && edu.degree.trim().length > 0) ||
                        (edu.institution && edu.institution.trim().length > 0)
                      );

                    return educations.length > 0 ? (
                      educations.map((edu, idx) => {
                        const originalIndex = editMode ? idx : localData.education.findIndex(e => e === edu);
                        return (
                          <div key={editMode ? idx : `edu-${originalIndex}`} style={{ marginBottom: "15px" }}>
                            {editMode ? (
                              <div style={{ border: "1px dashed #ccc", padding: "10px", marginBottom: "10px" }}>
                                <input type="text" value={edu.degree || ""} onChange={(e) => handleObjectChange("education", originalIndex, "degree", e.target.value)} placeholder="Degree" style={{ width: "100%", marginBottom: "5px" }} />
                                <input type="text" value={edu.institution || ""} onChange={(e) => handleObjectChange("education", originalIndex, "institution", e.target.value)} placeholder="University" style={{ width: "100%", marginBottom: "5px" }} />
                                <input type="text" value={edu.year || ""} onChange={(e) => handleObjectChange("education", originalIndex, "year", e.target.value)} placeholder="Year/Date" style={{ width: "100%", marginBottom: "5px" }} />
                                <button onClick={() => removeItem("education", originalIndex)} style={{ color: "red" }}>Remove</button>
                              </div>
                            ) : (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                  <div style={{ fontWeight: "bold", fontSize: "15px", color: "#222" }}>{edu.degree}</div>
                                  <div style={{ fontSize: "14px", color: primaryColor }}>{edu.year}</div>
                                </div>
                                <div style={{ fontSize: "14px", color: primaryColor }}>{edu.institution}</div>
                              </>
                            )}
                          </div>
                        );
                      })
                    ) : null;
                  })()}
                  {editMode && <button onClick={() => addItem("education", { degree: "", institution: "", year: "" })} style={{ color: primaryColor, cursor: "pointer" }}>+ Add Education</button>}
                </div>
              )}

              {/* Accomplishments */}
              {(editMode || hasAchievements()) && (
                <div style={{ marginBottom: "25px" }}>
                  <h2 style={{
                    fontSize: "18px",
                    color: primaryColor,
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${primaryColor}`,
                    paddingBottom: "5px",
                    marginBottom: "15px",
                    letterSpacing: "1px"
                  }}>
                    Accomplishments
                  </h2>
                  {(() => {
                    const achievements = editMode
                      ? (localData.achievements || [])
                      : (localData.achievements || []).filter(ach => {
                        if (!ach) return false;
                        const achStr = typeof ach === 'string' ? ach : String(ach);
                        return achStr.trim().length > 0;
                      });

                    return achievements.length > 0 ? (
                      <ul style={{ paddingLeft: "1.2rem", fontSize: "13px", margin: 0 }}>
                        {achievements.map((ach, idx) => {
                          const originalIndex = editMode ? idx : localData.achievements.findIndex(a => a === ach);
                          return (
                            <li key={editMode ? idx : `ach-${originalIndex}`} style={{ marginBottom: "5px", color: "#444" }}>
                              {editMode ? (
                                <div style={{ display: "flex", gap: "5px" }}>
                                  <input
                                    value={typeof ach === 'string' ? ach : (ach?.name || ach?.title || ach?.description || '')}
                                    onChange={(e) => {
                                      const newAch = [...localData.achievements];
                                      newAch[originalIndex] = e.target.value;
                                      setLocalData({ ...localData, achievements: newAch });
                                      localStorage.setItem('resumeData', JSON.stringify({ ...localData, achievements: newAch }));
                                    }} placeholder="Anchivement"
                                    style={{ width: "100%" }}
                                  />
                                  <button onClick={() => removeItem("achievements", originalIndex)} style={{ color: "red" }}>x</button>
                                </div>
                              ) : (
                                <span>{typeof ach === 'string' ? ach : (ach?.name || ach?.title || ach?.description || String(ach))}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null;
                  })()}
                  {editMode && <button onClick={() => addItem("achievements", "")} style={{ color: primaryColor, cursor: "pointer", marginTop: "5px" }}>+ Add Accomplishment</button>}
                </div>
              )}

              {/* Projects */}
              {(editMode || hasProjects()) && (
                <div style={{ marginBottom: "25px" }}>
                  <h2 style={{
                    fontSize: "18px",
                    color: primaryColor,
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${primaryColor}`,
                    paddingBottom: "5px",
                    marginBottom: "15px",
                    letterSpacing: "1px"
                  }}>
                    Projects
                  </h2>
                  {(() => {
                    const projects = editMode
                      ? (localData.projects || [])
                      : (localData.projects || []).filter(proj =>
                        (proj.name && proj.name.trim().length > 0) ||
                        (proj.description && proj.description.trim().length > 0)
                      );

                    return projects.length > 0 ? (
                      projects.map((proj, idx) => {
                        const originalIndex = editMode ? idx : localData.projects.findIndex(p => p === proj);
                        return (
                          <div key={editMode ? idx : `proj-${originalIndex}`} style={{ marginBottom: "15px" }}>
                            {editMode ? (
                              <div style={{ border: "1px dashed #ccc", padding: "10px" }}>
                                <input type="text" value={proj.name || ""} onChange={(e) => handleObjectChange("projects", originalIndex, "name", e.target.value)} placeholder="Project Name" style={{ width: "100%", marginBottom: "5px" }} />
                                <input type="text" value={proj.technologies || ""} onChange={(e) => handleObjectChange("projects", originalIndex, "technologies", e.target.value)} placeholder="Tech Stack" style={{ width: "100%", marginBottom: "5px" }} />
                                <textarea value={proj.description || ""} onChange={(e) => handleObjectChange("projects", originalIndex, "description", e.target.value)} placeholder="Description" style={{ width: "100%", minHeight: "50px" }} />
                                <button onClick={() => removeItem("projects", originalIndex)} style={{ color: "red" }}>Remove</button>
                              </div>
                            ) : (
                              <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.5" }}>
                                <span style={{ fontWeight: "bold", color: "#000" }}>{proj.name}: </span>
                                <span>{proj.description}</span>
                                {proj.technologies && <div style={{ fontSize: "12px", color: "#666", fontStyle: "italic", marginTop: "2px" }}>Tech: {proj.technologies}</div>}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : null;
                  })()}
                  {editMode && <button onClick={() => addItem("projects", { name: "", description: "", technologies: "" })} style={{ color: primaryColor, cursor: "pointer" }}>+ Add Project</button>}
                </div>
              )}

              {/* Languages Section - Edit Mode Only */}
              {editMode && (
                <div style={{ marginBottom: "25px" }}>
                  <h2 style={{
                    fontSize: "18px",
                    color: primaryColor,
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${primaryColor}`,
                    paddingBottom: "5px",
                    marginBottom: "15px",
                    letterSpacing: "1px"
                  }}>
                    Languages
                  </h2>
                  {(localData.languages || []).map((lang, idx) => (
                    <div key={idx} style={{ marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
                      <input
                        type="text"
                        value={typeof lang === 'string' ? lang : (lang?.name || lang?.title || String(lang || ""))}
                        onChange={(e) => {
                          const updated = [...(localData.languages || [])];
                          updated[idx] = e.target.value;
                          setLocalData({ ...localData, languages: updated });
                          localStorage.setItem('resumeData', JSON.stringify({ ...localData, languages: updated }));
                        }}
                        placeholder="Language"
                        style={{
                          flex: 1,
                          border: "1px solid #ccc",
                          padding: "5px",
                          borderRadius: "4px",
                          fontSize: "13px",
                        }}
                      />
                      <button
                        onClick={() => removeItem("languages", idx)}
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "5px 10px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addItem("languages", "")}
                    style={{
                      backgroundColor: primaryColor,
                      color: "#fff",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    + Add Language
                  </button>
                </div>
              )}

              {/* Interests Section - Edit Mode Only */}
              {editMode && (
                <div style={{ marginBottom: "25px" }}>
                  <h2 style={{
                    fontSize: "18px",
                    color: primaryColor,
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${primaryColor}`,
                    paddingBottom: "5px",
                    marginBottom: "15px",
                    letterSpacing: "1px"
                  }}>
                    Interests
                  </h2>
                  {(localData.interests || []).map((int, idx) => (
                    <div key={idx} style={{ marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
                      <input
                        type="text"
                        value={typeof int === 'string' ? int : (int?.name || int?.title || String(int || ""))}
                        onChange={(e) => {
                          const updated = [...(localData.interests || [])];
                          updated[idx] = e.target.value;
                          setLocalData({ ...localData, interests: updated });
                          localStorage.setItem('resumeData', JSON.stringify({ ...localData, interests: updated }));
                        }}
                        placeholder="Interest"
                        style={{
                          flex: 1,
                          border: "1px solid #ccc",
                          padding: "5px",
                          borderRadius: "4px",
                          fontSize: "13px",
                        }}
                      />
                      <button
                        onClick={() => removeItem("interests", idx)}
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "5px 10px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addItem("interests", "")}
                    style={{
                      backgroundColor: primaryColor,
                      color: "#fff",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    + Add Interest
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Action Buttons (Save/Cancel) */}
          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSavingToDatabase}
                  style={{
                    backgroundColor: "#16a34a", color: "white", padding: "0.5rem 1.5rem", borderRadius: "0.375rem", border: "none",
                    cursor: isSavingToDatabase ? "not-allowed" : "pointer", opacity: isSavingToDatabase ? 0.7 : 1
                  }}
                >
                  {saveStatus === 'Saving...' ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  style={{ backgroundColor: "#9ca3af", color: "white", padding: "0.5rem 1.5rem", borderRadius: "0.375rem", border: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{ backgroundColor: primaryColor, color: "white", padding: "0.5rem 1.5rem", borderRadius: "0.375rem", border: "none", cursor: "pointer" }}
              >
                Edit Resume
              </button>
            )}
          </div>
          {saveStatus && <div style={{ marginTop: "1rem", color: saveStatus.includes('Error') ? "red" : "green" }}>{saveStatus}</div>}

        </div>
      </div>
    </div>
  );
};

export default Template1;
