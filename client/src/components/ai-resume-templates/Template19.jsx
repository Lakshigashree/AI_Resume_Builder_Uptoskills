import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";

const Template19 = () => {
  const resumeRef = useRef(null);
  const { resumeData = {}, setResumeData } = useResume();

  // Ensure resumeData has sensible defaults
  const getDefaulted = (data) => ({
    name: "",
    role: "",
    location: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    skills: [],
    projects: [],
    education: [],
    experience: [],
    languagesDetailed: [],
    languages: [],
    certifications: [],
    achievements: [],
    ...data,
  });

  const [localData, setLocalData] = useState(getDefaulted(resumeData));
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const saveTimerRef = useRef(null);

  useEffect(() => {
    setLocalData(getDefaulted(resumeData));
  }, [resumeData]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const debouncedLocalSave = (updatedData) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("resumeData", JSON.stringify(updatedData));
      } catch (e) {
        console.warn("Failed to save locally:", e);
      }
    }, 800);
  };

  const handleFieldChange = (field, value) => {
    setLocalData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "languagesDetailed") {
        updated.languages = (value || []).map((l) => l.language || "").filter(Boolean);
      }
      debouncedLocalSave(updated);
      return updated;
    });
  };

  const handleSave = () => {
    const normalized = getDefaulted(localData);

    // Normalize skills
    if (Array.isArray(normalized.skills)) {
      normalized.skills = normalized.skills.filter(s => s && s.trim());
    } else if (typeof normalized.skills === "string") {
      normalized.skills = normalized.skills.split(",").map(s => s.trim()).filter(Boolean);
    } else {
      normalized.skills = [];
    }

    // Normalize other arrays to remove empty objects
    normalized.education = (normalized.education || []).filter(e => e.degree || e.institution);
    normalized.experience = (normalized.experience || []).filter(e => e.title || e.companyName);
    normalized.projects = (normalized.projects || []).filter(p => p.title || p.description);

    setResumeData(normalized);
    try {
      localStorage.setItem("resumeData", JSON.stringify(normalized));
    } catch (e) { }
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalData(getDefaulted(resumeData));
    setEditMode(false);
  };

  // --- Helpers ---
  const safe = (arr) => (Array.isArray(arr) ? arr : []);

  // STRICT VISIBILITY CHECK
  // Returns TRUE if (Edit Mode is ON) OR (Array has at least one valid non-empty item)
  const isVisible = (arr, section) => {
    if (editMode) return true;
    if (!Array.isArray(arr) || arr.length === 0) return false;

    return arr.some((item) => {
      if (typeof item === 'string') return item.trim().length > 0;

      // Check specific fields based on section
      switch (section) {
        case 'education': return !!(item.degree?.trim() || item.institution?.trim());
        case 'experience': return !!(item.title?.trim() || item.companyName?.trim());
        case 'projects': return !!(item.title?.trim() || item.description?.trim());
        case 'certifications': return !!((typeof item === 'object' ? item.title : item)?.toString().trim());
        case 'achievements': return !!((typeof item === 'object' ? item.title : item)?.toString().trim());
        case 'languages': return !!(item.language?.trim());
        default: return false;
      }
    });
  };

  // Specific helpers for add/remove
  // Note: We initialize with empty strings so they don't show up in View mode until typed in
  const addEducation = () => {
    const updated = [...safe(localData.education)];
    updated.push({ degree: "", institution: "", duration: "" });
    handleFieldChange("education", updated);
  };
  const removeEducation = (index) => {
    const updated = [...safe(localData.education)];
    updated.splice(index, 1);
    handleFieldChange("education", updated);
  };

  const addExperience = () => {
    const updated = [...safe(localData.experience)];
    updated.push({ title: "", companyName: "", date: "", accomplishment: [""] });
    handleFieldChange("experience", updated);
  };
  const removeExperience = (index) => {
    const updated = [...safe(localData.experience)];
    updated.splice(index, 1);
    handleFieldChange("experience", updated);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resumeRef={resumeRef} />
        <div style={{ flex: 1, padding: "2rem", display: "flex", justifyContent: "center" }}>

          {/* Resume Box */}
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              width: "100%",
              maxWidth: "850px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              borderRadius: "0.5rem",
              fontFamily: "Segoe UI, sans-serif",
            }}
          >
            {/* Header (Always Visible) */}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <div style={{ flex: 1 }}>
                  {editMode ? (
                    <>
                      <input
                        value={localData.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        placeholder="Full name"
                        style={{ fontSize: "1.75rem", fontWeight: "bold", width: "100%", marginBottom: "0.25rem" }}
                      />
                      <input
                        value={localData.role}
                        onChange={(e) => handleFieldChange("role", e.target.value)}
                        placeholder="Role / Title"
                        style={{ fontSize: "1rem", color: "#6b7280", width: "100%" }}
                      />
                    </>
                  ) : (
                    <>
                      <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", margin: 0 }}>{localData.name || "Your Name"}</h1>
                      <h2 style={{ fontSize: "1rem", color: "#6b7280", margin: 0 }}>{localData.role || "Your Role / Title"}</h2>
                    </>
                  )}
                </div>

                <div style={{ textAlign: "center" }}>
                  <img
                    src={profileImage || "https://www.bing.com/ck/a?!&&p=303792b58f7e213f23b05ed36bf6de634facb091a89ce39ac8d146c71800871bJmltdHM9MTc2MzI1MTIwMA&ptn=3&ver=2&hsh=4&fclid=174a8f25-0dc0-69e6-066c-9a6e0c72689a&u=a1L2ltYWdlcy9zZWFyY2g_cT1mb3JtYWwraW1hZ2UmaWQ9MjI5REI2RDlDMzIwNzU4Rjk5N0REODAzMDc1MTczM0E3M0U4QTczQSZGT1JNPUlRRlJCQQ"}
                    alt="Profile"
                    style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb" }}
                  />
                  {editMode && (
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginTop: "0.5rem", fontSize: "0.75rem" }} />
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.875rem", color: "#6b7280", alignItems: "center" }}>
                {[
                  { key: "location", placeholder: "Location" },
                  { key: "phone", placeholder: "Phone" },
                  { key: "email", placeholder: "Email" },
                  { key: "linkedin", placeholder: "LinkedIn" },
                  { key: "github", placeholder: "GitHub" },
                  { key: "portfolio", placeholder: "Portfolio" },
                ].map(({ key, placeholder }) =>
                  editMode ? (
                    <input
                      key={key}
                      value={localData[key] || ""}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      placeholder={placeholder}
                      style={{ borderBottom: "1px solid #ccc", width: "150px", fontSize: "0.875rem" }}
                    />
                  ) : (
                    localData[key] && (
                      <span key={key} style={{ minWidth: 120 }}>
                        {["linkedin", "github", "portfolio"].includes(key) ? (
                          <a href={localData[key]} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                            {localData[key]}
                          </a>
                        ) : key === "email" ? (
                          <a href={`mailto:${localData[key]}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {localData[key]}
                          </a>
                        ) : (
                          localData[key]
                        )}
                      </span>
                    )
                  )
                )}
              </div>
            </div>

            <hr style={{ marginBottom: "1rem", borderColor: "#e5e7eb" }} />

            {/* Summary */}
            {(editMode || (localData.summary && localData.summary.trim())) && (
              <div>
                <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Summary</h3>
                {editMode ? (
                  <textarea
                    value={localData.summary}
                    onChange={(e) => handleFieldChange("summary", e.target.value)}
                    rows={4}
                    placeholder="Write a short professional summary..."
                    style={{ width: "100%", marginTop: "0.5rem", borderRadius: "0.375rem", padding: "0.5rem" }}
                  />
                ) : (
                  <p>{localData.summary}</p>
                )}
                <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
              </div>
            )}

            {/* Skills */}
            {(editMode || (localData.skills && localData.skills.length > 0)) && (
              <div>
                <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Skills</h3>

                {editMode ? (
                  <>
                    {/* Existing skills list */}
                    {safe(localData.skills).map((skill, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
                        <input
                          value={skill}
                          onChange={(e) => {
                            const updated = [...safe(localData.skills)];
                            updated[i] = e.target.value;
                            handleFieldChange("skills", updated);
                          }}
                          placeholder="Skill"
                          style={{
                            flex: 1,
                            padding: "0.5rem",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                          }}
                        />
                        <button
                          onClick={() => {
                            const updated = [...safe(localData.skills)];
                            updated.splice(i, 1);
                            handleFieldChange("skills", updated);
                          }}
                          style={{
                            marginLeft: "0.5rem",
                            color: "red",
                            fontSize: "1rem",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        >
                          ✖
                        </button>
                      </div>
                    ))}

                    {/* EMPTY FIELD FOR NEW SKILL */}
                    <input
                      placeholder="Type a new skill and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          handleFieldChange("skills", [...safe(localData.skills), e.target.value.trim()]);
                          e.target.value = ""; // clear input
                        }
                      }}
                      style={{
                        width: "100%",
                        marginTop: "0.75rem",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                      }}
                    />

                    {/* Add Skill Button */}
                    <button
                      onClick={() =>
                        handleFieldChange("skills", [...safe(localData.skills), ""])
                      }
                      style={{ marginTop: "0.5rem", color: "#2563eb" }}
                    >
                      + Add Skill
                    </button>
                  </>
                ) : (
                  // VIEW MODE (only show actual skills)
                  <>
                    {localData.skills.length > 0 && (
                      <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                        {localData.skills.map((skill, i) => (
                          <li key={i}>{skill}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
              </div>
            )}



            {/* Projects */}
            {isVisible(localData.projects, 'projects') && (
              <div>
                <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Projects</h3>
                {safe(localData.projects).map((proj, i) => (
                  // Only render strictly if editing or if this specific project has a title
                  (editMode || (proj.title && proj.title.trim())) ? (
                    <div key={i} style={{ marginTop: "0.75rem" }}>
                      {editMode ? (
                        <>
                          <input
                            value={proj.title || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.projects)];
                              updated[i] = { ...proj, title: e.target.value };
                              handleFieldChange("projects", updated);
                            }}
                            placeholder="Project Title"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          <textarea
                            value={proj.description || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.projects)];
                              updated[i] = { ...proj, description: e.target.value };
                              handleFieldChange("projects", updated);
                            }}
                            placeholder="Project Description"
                            rows={3}
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          <input
                            value={(proj.technologies || []).join(", ")}
                            onChange={(e) => {
                              const updated = [...safe(localData.projects)];
                              updated[i] = { ...proj, technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) };
                              handleFieldChange("projects", updated);
                            }}
                            placeholder="Technologies"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          <input
                            value={proj.link || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.projects)];
                              updated[i] = { ...proj, link: e.target.value };
                              handleFieldChange("projects", updated);
                            }}
                            placeholder="Live Demo Link"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          <input
                            value={proj.githubLink || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.projects)];
                              updated[i] = { ...proj, githubLink: e.target.value };
                              handleFieldChange("projects", updated);
                            }}
                            placeholder="GitHub Link"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          <button
                            onClick={() => {
                              const updated = [...safe(localData.projects)];
                              updated.splice(i, 1);
                              handleFieldChange("projects", updated);
                            }}
                            style={{ color: "#dc2626", fontSize: "0.75rem" }}
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <p style={{ fontWeight: "600" }}>{proj.title}</p>
                          <p style={{ fontSize: "0.9rem" }}>{proj.description}</p>
                          {proj.technologies?.length > 0 && (
                            <p style={{ fontSize: "0.85rem", color: "#4b5563" }}><strong>Tech:</strong> {proj.technologies.join(", ")}</p>
                          )}
                          {proj.link && <p><a href={proj.link} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>Live Demo</a></p>}
                          {proj.githubLink && <p><a href={proj.githubLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>GitHub</a></p>}
                        </>
                      )}
                    </div>
                  ) : null
                ))}
                {editMode && (
                  <button
                    onClick={() => {
                      const updated = [...safe(localData.projects)];
                      updated.push({ title: "", description: "", technologies: [], link: "", githubLink: "" });
                      handleFieldChange("projects", updated);
                    }}
                    style={{ marginTop: "0.5rem", color: "#2563eb" }}
                  >
                    + Add Project
                  </button>
                )}
                <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
              </div>
            )}

            {/* Education */}
            {isVisible(localData.education, 'education') && (
              <div>
                <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Education</h3>
                {safe(localData.education).map((edu, i) => (
                  (editMode || (edu.degree && edu.degree.trim())) ? (
                    <div key={i} style={{ marginTop: "0.75rem" }}>
                      {editMode ? (
                        <>
                          <input
                            value={edu.degree || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.education)];
                              updated[i] = { ...edu, degree: e.target.value };
                              handleFieldChange("education", updated);
                            }}
                            placeholder="Degree"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          <input
                            value={edu.institution || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.education)];
                              updated[i] = { ...edu, institution: e.target.value };
                              handleFieldChange("education", updated);
                            }}
                            placeholder="Institution"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          <input
                            value={edu.duration || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.education)];
                              updated[i] = { ...edu, duration: e.target.value };
                              handleFieldChange("education", updated);
                            }}
                            placeholder="Duration"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          <button onClick={() => removeEducation(i)} style={{ color: "#dc2626", fontSize: "0.75rem" }}>Remove</button>
                        </>
                      ) : (
                        <>
                          <p style={{ fontWeight: "600" }}>{edu.degree}</p>
                          <p>{edu.institution} {edu.duration ? `(${edu.duration})` : ''}</p>
                        </>
                      )}
                    </div>
                  ) : null
                ))}
                {editMode && <button onClick={addEducation} style={{ marginTop: "0.5rem", color: "#2563eb" }}>+ Add Education</button>}
                <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
              </div>
            )}

            {/* Experience */}
            {isVisible(localData.experience, 'experience') && (
              <div>
                <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Experience</h3>
                {safe(localData.experience).map((exp, i) => (
                  (editMode || (exp.title && exp.title.trim())) ? (
                    <div key={i} style={{ marginTop: "0.75rem" }}>
                      {editMode ? (
                        <>
                          <input
                            value={exp.title || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.experience)];
                              updated[i] = { ...exp, title: e.target.value };
                              handleFieldChange("experience", updated);
                            }}
                            placeholder="Job Title"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          <input
                            value={exp.companyName || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.experience)];
                              updated[i] = { ...exp, companyName: e.target.value };
                              handleFieldChange("experience", updated);
                            }}
                            placeholder="Company"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          <input
                            value={exp.date || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.experience)];
                              updated[i] = { ...exp, date: e.target.value };
                              handleFieldChange("experience", updated);
                            }}
                            placeholder="Date"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          <textarea
                            value={(exp.accomplishment || []).join("\n")}
                            onChange={(e) => {
                              const updated = [...safe(localData.experience)];
                              updated[i] = { ...exp, accomplishment: e.target.value.split("\n").filter(Boolean) };
                              handleFieldChange("experience", updated);
                            }}
                            rows={3}
                            placeholder="Accomplishments (one per line)"
                            style={{ width: "100%", marginTop: "0.5rem" }}
                          />
                          <button onClick={() => removeExperience(i)} style={{ color: "#dc2626", fontSize: "0.75rem" }}>Remove</button>
                        </>
                      ) : (
                        <>
                          <p style={{ fontWeight: "600" }}>{exp.title} at {exp.companyName}</p>
                          <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>{exp.date}</p>
                          <ul style={{ paddingLeft: "1.5rem", listStyle: "disc" }}>
                            {safe(exp.accomplishment).map((item, j) => <li key={j}>{item}</li>)}
                          </ul>
                        </>
                      )}
                    </div>
                  ) : null
                ))}
                {editMode && <button onClick={addExperience} style={{ marginTop: "0.5rem", color: "#2563eb" }}>+ Add Experience</button>}
                <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
              </div>
            )}

            {/* Languages */}
            {isVisible(localData.languagesDetailed, 'languages') && (
              <div>
                <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Languages</h3>
                {safe(localData.languagesDetailed).map((lang, i) => (
                  (editMode || (lang.language && lang.language.trim())) ? (
                    <div key={i} style={{ marginTop: "0.5rem" }}>
                      {editMode ? (
                        <>
                          <input
                            value={lang.language || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.languagesDetailed)];
                              updated[i] = { ...lang, language: e.target.value };
                              handleFieldChange("languagesDetailed", updated);
                            }}
                            placeholder="Language"
                            style={{ width: "60%", marginRight: "0.5rem" }}
                          />
                          <select
                            value={lang.proficiency || "Beginner"}
                            onChange={(e) => {
                              const updated = [...safe(localData.languagesDetailed)];
                              updated[i] = { ...lang, proficiency: e.target.value };
                              handleFieldChange("languagesDetailed", updated);
                            }}
                            style={{ width: "35%" }}
                          >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                            <option>Native</option>
                          </select>
                          <button
                            onClick={() => {
                              const updated = [...safe(localData.languagesDetailed)];
                              updated.splice(i, 1);
                              handleFieldChange("languagesDetailed", updated);
                            }}
                            style={{ color: "#dc2626", fontSize: "0.75rem", marginLeft: "0.5rem" }}
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <p style={{ fontSize: "0.95rem" }}><strong>{lang.language}</strong> – {lang.proficiency}</p>
                      )}
                    </div>
                  ) : null
                ))}
                {editMode && (
                  <button
                    onClick={() => {
                      const updated = [...safe(localData.languagesDetailed)];
                      updated.push({ language: "", proficiency: "Beginner" });
                      handleFieldChange("languagesDetailed", updated);
                    }}
                    style={{ marginTop: "0.5rem", color: "#2563eb" }}
                  >
                    + Add Language
                  </button>
                )}
                <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
              </div>
            )}

            {/* Certifications */}
            {isVisible(localData.certifications, 'certifications') && (
              <div>
                <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Certifications</h3>
                {safe(localData.certifications).map((cert, i) => (
                  (editMode || ((typeof cert === 'string' ? cert : cert.title) || "").trim()) ? (
                    <div key={i} style={{ marginTop: "0.75rem" }}>
                      {editMode ? (
                        <>
                          <input
                            value={(typeof cert === "object" ? cert.title : cert) || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.certifications)];
                              if (typeof cert === "object") updated[i] = { ...cert, title: e.target.value };
                              else updated[i] = e.target.value;
                              handleFieldChange("certifications", updated);
                            }}
                            placeholder="Certification Title"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          {typeof cert === "object" && (
                            <>
                              <input
                                value={cert.issuer || ""}
                                onChange={(e) => {
                                  const updated = [...safe(localData.certifications)];
                                  updated[i] = { ...cert, issuer: e.target.value };
                                  handleFieldChange("certifications", updated);
                                }}
                                placeholder="Issuer"
                                style={{ width: "100%", marginBottom: "0.5rem" }}
                              />
                              <input
                                value={cert.date || ""}
                                onChange={(e) => {
                                  const updated = [...safe(localData.certifications)];
                                  updated[i] = { ...cert, date: e.target.value };
                                  handleFieldChange("certifications", updated);
                                }}
                                placeholder="Year"
                                style={{ width: "100%", marginBottom: "0.5rem" }}
                              />
                            </>
                          )}
                          <button
                            onClick={() => {
                              const updated = [...safe(localData.certifications)];
                              updated.splice(i, 1);
                              handleFieldChange("certifications", updated);
                            }}
                            style={{ color: "#dc2626", fontSize: "0.75rem" }}
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <div>
                          <p style={{ fontWeight: "600" }}>{typeof cert === "object" ? cert.title : cert}</p>
                          {typeof cert === "object" && cert.issuer && (
                            <p style={{ fontSize: "0.9rem", color: "#4b5563" }}>{cert.issuer} {cert.date && `(${cert.date})`}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null
                ))}
                {editMode && (
                  <button
                    onClick={() => {
                      const updated = [...safe(localData.certifications)];
                      updated.push({ title: "", issuer: "", date: "" });
                      handleFieldChange("certifications", updated);
                    }}
                    style={{ marginTop: "0.5rem", color: "#2563eb" }}
                  >
                    + Add Certification
                  </button>
                )}
                <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
              </div>
            )}

            {/* Achievements */}
            {isVisible(localData.achievements, 'achievements') && (
              <div>
                <h3 style={{ fontWeight: "650", fontSize: "1.1rem" }}>Achievements</h3>
                {safe(localData.achievements).map((ach, i) => (
                  (editMode || ((typeof ach === 'string' ? ach : ach.title) || "").trim()) ? (
                    <div key={i} style={{ marginTop: "0.75rem" }}>
                      {editMode ? (
                        <>
                          <input
                            value={(typeof ach === "object" ? ach.title : ach) || ""}
                            onChange={(e) => {
                              const updated = [...safe(localData.achievements)];
                              if (typeof ach === "object") updated[i] = { ...ach, title: e.target.value };
                              else updated[i] = e.target.value;
                              handleFieldChange("achievements", updated);
                            }}
                            placeholder="Achievement Title"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                          />
                          {typeof ach === "object" && (
                            <>
                              <textarea
                                value={ach.description || ""}
                                onChange={(e) => {
                                  const updated = [...safe(localData.achievements)];
                                  updated[i] = { ...ach, description: e.target.value };
                                  handleFieldChange("achievements", updated);
                                }}
                                placeholder="Description"
                                rows={2}
                                style={{ width: "100%", marginBottom: "0.5rem" }}
                              />
                              <input
                                value={ach.year || ""}
                                onChange={(e) => {
                                  const updated = [...safe(localData.achievements)];
                                  updated[i] = { ...ach, year: e.target.value };
                                  handleFieldChange("achievements", updated);
                                }}
                                placeholder="Year"
                                style={{ width: "100%", marginBottom: "0.5rem" }}
                              />
                            </>
                          )}
                          <button
                            onClick={() => {
                              const updated = [...safe(localData.achievements)];
                              updated.splice(i, 1);
                              handleFieldChange("achievements", updated);
                            }}
                            style={{ color: "#dc2626", fontSize: "0.75rem" }}
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <div>
                          <p style={{ fontWeight: "600" }}>{typeof ach === "object" ? ach.title : ach}</p>
                          {typeof ach === "object" && ach.description && <p style={{ fontSize: "0.9rem", color: "#4b5563" }}>{ach.description}</p>}
                          {typeof ach === "object" && ach.year && <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>{ach.year}</p>}
                        </div>
                      )}
                    </div>
                  ) : null
                ))}
                {editMode && (
                  <button
                    onClick={() => {
                      const updated = [...safe(localData.achievements)];
                      updated.push({ title: "", description: "", year: "" });
                      handleFieldChange("achievements", updated);
                    }}
                    style={{ marginTop: "0.5rem", color: "#2563eb" }}
                  >
                    + Add Achievement
                  </button>
                )}
                <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="no-print" style={{ textAlign: "center", padding: "1rem" }}>
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              style={{ backgroundColor: "#16a34a", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "0.375rem", marginRight: "0.5rem" }}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              style={{ backgroundColor: "#9ca3af", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "0.375rem" }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            style={{ backgroundColor: "#2563eb", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "0.375rem" }}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default Template19;