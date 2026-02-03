import React, { useState, useRef, useEffect } from "react";
import { toast } from 'react-toastify';
import Sidebar from "../Sidebar/Sidebar"; // This might need to be ../../Sidebar/Sidebar depending on actual structure. Assuming standard components structure.
// Actually, earlier templates in this folder use `../Sidebar/Sidebar`.
// Let me double check one existing template import.
// Template20 uses `import Sidebar from "../Sidebar/Sidebar";`. 
// Wait, Template20 is in `client/src/components/ai-resume-templates`. `Sidebar` is likely in `client/src/components/Sidebar`.
// So `../Sidebar/Sidebar` is correct if `Sidebar` is a sibling of `ai-resume-templates`? No.
// `ai-resume-templates` is in `components`. `Sidebar` is in `components`.
// So `../Sidebar/Sidebar` means "go up to `components`, then down to `Sidebar`". This IS correct.
// Im fixing the imports based on OTHER templates in the same folder.
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext"; // Template20 uses `../../context/ResumeContext`. Correct.
import resumeService from "../../services/resumeService"; // Assuming this follows the same pattern.

const Template31 = () => {
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
      console.error('Template31: Error loading from localStorage:', error);
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
          templateId: 1, // keeping as is, but maybe should be dynamic?
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
                      {localData.linkedin && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", wordBreak: "break-all" }}>
                          <span>🔗</span>
                          <a href={localData.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                            {localData.linkedin.replace('https://', '')}
                          </a>
                        </div>
                      )}
                      {localData.github && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", wordBreak: "break-all" }}>
                          <span>🐙</span>
                          <a href={localData.github} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                            {localData.github.replace('https://', '')}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: "100%", borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "20px" }}></div>

              {/* Summary */}
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

              {/* Divider */}
              <div style={{ width: "100%", borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "20px" }}></div>

              {/* Skills */}
              <div style={{ width: "100%", marginBottom: "30px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "400", marginBottom: "10px" }}>Skills</h3>
                <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                  {localData.skills?.map((skill, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ marginRight: "8px" }}>▪</span>
                      {editMode ? (
                        <>
                          <input
                            value={skill}
                            onChange={(e) => {
                              const newSkills = [...localData.skills];
                              newSkills[idx] = e.target.value;
                              setLocalData({ ...localData, skills: newSkills });
                            }}
                            style={{ width: "80%", color: "black", padding: "2px" }}
                          />
                          <span onClick={() => removeItem("skills", idx)} style={{ cursor: "pointer", marginLeft: "5px", fontWeight: "bold" }}>x</span>
                        </>
                      ) : (
                        <span>{skill}</span>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <button onClick={() => addItem("skills", "New Skill")} style={{ marginTop: "10px", fontSize: "12px", color: "#333", background: "#fff", border: "none", padding: "2px 5px", cursor: "pointer" }}>+ Add Skill</button>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: "100%", borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "20px" }}></div>

              {/* Certifications */}
              <div style={{ width: "100%" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "400", marginBottom: "10px" }}>Certifications</h3>
                <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
                  {localData.certifications?.map((cert, idx) => (
                    <div key={idx} style={{ marginBottom: "8px" }}>
                      {editMode ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px", background: "rgba(255,255,255,0.1)", padding: "5px" }}>
                          <input value={cert.name} onChange={(e) => handleObjectChange("certifications", idx, "name", e.target.value)} placeholder="Name" style={{ color: "black" }} />
                          <input value={cert.year} onChange={(e) => handleObjectChange("certifications", idx, "year", e.target.value)} placeholder="Year" style={{ color: "black" }} />
                          <button onClick={() => removeItem("certifications", idx)} style={{ fontSize: "10px", color: "red" }}>Remove</button>
                        </div>
                      ) : (
                        <div>{cert.name} {cert.year ? `(${cert.year})` : ""}</div>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <button onClick={() => addItem("certifications", { name: "New Cert", year: "2024" })} style={{ fontSize: "12px", color: "#333", background: "#fff", border: "none", padding: "2px 5px", cursor: "pointer" }}>+ Add Cert</button>
                  )}
                </div>
              </div>

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

                {localData.experience?.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: "20px" }}>
                    {editMode ? (
                      <div style={{ border: "1px dashed #ccc", padding: "10px", marginBottom: "10px" }}>
                        <input type="text" value={exp.title} onChange={(e) => handleObjectChange("experience", idx, "title", e.target.value)} placeholder="Job Title" style={{ width: "100%", marginBottom: "5px" }} />
                        <div style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                          <input type="text" value={exp.company} onChange={(e) => handleObjectChange("experience", idx, "company", e.target.value)} placeholder="Company" style={{ flex: 1 }} />
                          <input type="text" value={exp.location} onChange={(e) => handleObjectChange("experience", idx, "location", e.target.value)} placeholder="Location" style={{ flex: 1 }} />
                        </div>
                        <input type="text" value={exp.date} onChange={(e) => handleObjectChange("experience", idx, "date", e.target.value)} placeholder="Date Range" style={{ width: "100%", marginBottom: "5px" }} />
                        <textarea value={exp.description} onChange={(e) => handleObjectChange("experience", idx, "description", e.target.value)} placeholder="Description" style={{ width: "100%", minHeight: "60px" }} />
                        <button onClick={() => removeItem("experience", idx)} style={{ color: "red", marginTop: "5px" }}>Remove</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                          <div style={{ fontWeight: "bold", fontSize: "15px", color: "#222" }}>{exp.title}</div>
                          <div style={{ fontSize: "14px", color: primaryColor, fontWeight: "bold" }}>{exp.date}</div>
                        </div>
                        <div style={{ fontSize: "14px", color: primaryColor, marginBottom: "5px" }}>
                          {exp.company} – {exp.location}
                        </div>
                        <div style={{ fontSize: "13px", color: "#444" }}>
                          {renderList(exp.description)}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {editMode && <button onClick={() => addItem("experience", { title: "Title", company: "Company", location: "Location", date: "Date", description: "Description" })} style={{ color: primaryColor, cursor: "pointer" }}>+ Add Experience</button>}
              </div>

              {/* Education */}
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
                {localData.education?.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: "15px" }}>
                    {editMode ? (
                      <div style={{ border: "1px dashed #ccc", padding: "10px", marginBottom: "10px" }}>
                        <input type="text" value={edu.degree} onChange={(e) => handleObjectChange("education", idx, "degree", e.target.value)} placeholder="Degree" style={{ width: "100%", marginBottom: "5px" }} />
                        <input type="text" value={edu.institution} onChange={(e) => handleObjectChange("education", idx, "institution", e.target.value)} placeholder="University" style={{ width: "100%", marginBottom: "5px" }} />
                        <input type="text" value={edu.year} onChange={(e) => handleObjectChange("education", idx, "year", e.target.value)} placeholder="Year/Date" style={{ width: "100%", marginBottom: "5px" }} />
                        <button onClick={() => removeItem("education", idx)} style={{ color: "red" }}>Remove</button>
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
                ))}
                {editMode && <button onClick={() => addItem("education", { degree: "Degree", institution: "University", year: "Year" })} style={{ color: primaryColor, cursor: "pointer" }}>+ Add Education</button>}
              </div>

              {/* Accomplishments */}
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
                <ul style={{ paddingLeft: "1.2rem", fontSize: "13px", margin: 0 }}>
                  {localData.achievements?.map((ach, idx) => (
                    <li key={idx} style={{ marginBottom: "5px", color: "#444" }}>
                      {editMode ? (
                        <div style={{ display: "flex", gap: "5px" }}>
                          <input value={ach} onChange={(e) => {
                            const newAch = [...localData.achievements];
                            newAch[idx] = e.target.value;
                            setLocalData({ ...localData, achievements: newAch });
                          }} style={{ width: "100%" }} />
                          <button onClick={() => removeItem("achievements", idx)} style={{ color: "red" }}>x</button>
                        </div>
                      ) : (
                        <span>{ach}</span>
                      )}
                    </li>
                  ))}
                </ul>
                {editMode && <button onClick={() => addItem("achievements", "New Achievement")} style={{ color: primaryColor, cursor: "pointer", marginTop: "5px" }}>+ Add Accomplishment</button>}
              </div>

              {/* Projects */}
              <div>
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
                {localData.projects?.map((proj, idx) => (
                  <div key={idx} style={{ marginBottom: "15px" }}>
                    {editMode ? (
                      <div style={{ border: "1px dashed #ccc", padding: "10px" }}>
                        <input type="text" value={proj.name} onChange={(e) => handleObjectChange("projects", idx, "name", e.target.value)} placeholder="Project Name" style={{ width: "100%", marginBottom: "5px" }} />
                        <input type="text" value={proj.technologies} onChange={(e) => handleObjectChange("projects", idx, "technologies", e.target.value)} placeholder="Tech Stack" style={{ width: "100%", marginBottom: "5px" }} />
                        <textarea value={proj.description} onChange={(e) => handleObjectChange("projects", idx, "description", e.target.value)} placeholder="Description" style={{ width: "100%", minHeight: "50px" }} />
                        <button onClick={() => removeItem("projects", idx)} style={{ color: "red" }}>Remove</button>
                      </div>
                    ) : (
                      <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.5" }}>
                        <span style={{ fontWeight: "bold", color: "#000" }}>{proj.name}: </span>
                        <span>{proj.description}</span>
                        {proj.technologies && <div style={{ fontSize: "12px", color: "#666", fontStyle: "italic", marginTop: "2px" }}>Tech: {proj.technologies}</div>}
                      </div>
                    )}
                  </div>
                ))}
                {editMode && <button onClick={() => addItem("projects", { name: "Project", description: "Desc", technologies: "Tech" })} style={{ color: primaryColor, cursor: "pointer" }}>+ Add Project</button>}
              </div>

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

export default Template31;