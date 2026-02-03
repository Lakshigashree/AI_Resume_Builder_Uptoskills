import React, { useState, useRef, useEffect } from "react";
import { toast } from 'react-toastify';
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import resumeService from "../../services/resumeService";

const TemplateP = () => {
  const resumeRef = useRef(null);
  const resumeContext = useResume();
  const { isAuthenticated } = useAuth();

  const resumeData = resumeContext?.resumeData || {};
  const setResumeData = resumeContext?.setResumeData;
  const updateResumeData = resumeContext?.updateResumeData;

  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData);
  const [saveStatus, setSaveStatus] = useState('');
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);

  useEffect(() => {
    if (resumeData) {
      setLocalData(resumeData);
    }
  }, [resumeData]);

  useEffect(() => {
    if (resumeContext?.resumeData) {
      setLocalData(resumeContext.resumeData);
    }
  }, [resumeContext?.resumeData]);

  const handleFieldChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    localStorage.setItem('resumeData', JSON.stringify(updatedData));
  };

  const handleSave = async () => {
    try {
      setSaveStatus('Saving...');
      setIsSavingToDatabase(true);

      if (!resumeContext) {
        throw new Error('Resume context is not available.');
      }

      if (typeof updateResumeData !== 'function') {
        throw new Error('updateResumeData is not a function');
      }

      await updateResumeData(localData);

      if (isAuthenticated) {
        const structuredData = {
          templateId: 17, // TemplateP
          personalInfo: {
            name: localData.name || '',
            role: localData.role || '',
            email: localData.email || '',
            phone: localData.phone || '',
            location: localData.location || '',
            linkedin: localData.linkedin || '',
            github: localData.github || '',
            portfolio: localData.portfolio || ''
          },
          summary: localData.summary || '',
          skills: localData.skills || [],
          experience: localData.experience || [],
          education: localData.education || [],
          projects: localData.projects || [],
          certifications: localData.certifications || [],
          achievements: localData.achievements || [],
          interests: localData.interests || [],
          languages: localData.languages || [],
          courses: localData.courses || []
        };

        const saveResult = await resumeService.saveResumeData(structuredData);
        if (saveResult.success) {
          toast.success('✅ Resume saved to database');
          setSaveStatus('Saved to database');
        } else {
          console.error('Database save error:', saveResult.error);
          toast.error('Failed to save to database');
          setSaveStatus('Failed to save');
        }
      } else {
        setSaveStatus('Saved locally (Sign in to save to database)');
        toast.info('Resume saved locally. Sign in to save permanently.');
      }

      setEditMode(false);
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
    setLocalData(resumeData);
    setEditMode(false);
  };

  const handleEnhance = (section, enhancedData = null) => {
    // Sync localData with updated resumeData from context after enhancement
    // The Sidebar component handles the actual enhancement and updates the context
    // enhancedData is passed from Sidebar if available, otherwise use context
    const sourceData = enhancedData || resumeContext?.resumeData;

    if (sourceData) {
      const updatedData = { ...sourceData };

      // Ensure summary is a string (not array) for TemplateP
      if (section === "summary") {
        if (Array.isArray(updatedData.summary)) {
          updatedData.summary = updatedData.summary.join("\n");
        } else if (typeof updatedData.summary !== "string") {
          updatedData.summary = String(updatedData.summary || "");
        }
      }

      // Handle experience section - ensure description is properly set
      if (section === "experience" && updatedData.experience && updatedData.experience.length > 0) {
        updatedData.experience = updatedData.experience.map((exp) => {
          // If enhancement added accomplishment but no description, use accomplishment
          if (exp.accomplishment && (!exp.description || exp.description.trim() === "")) {
            const accomplishmentText = Array.isArray(exp.accomplishment)
              ? exp.accomplishment.join("\n")
              : exp.accomplishment;
            return {
              ...exp,
              description: accomplishmentText,
            };
          }
          // If description exists, keep it
          return exp;
        });
      }

      // Handle skills - ensure it's an array
      if (section === "skills") {
        if (!Array.isArray(updatedData.skills)) {
          if (typeof updatedData.skills === "string") {
            updatedData.skills = updatedData.skills.split(/,|\n/).map(s => s.trim()).filter(Boolean);
          } else {
            updatedData.skills = [];
          }
        }
      }

      // Handle education - ensure proper structure
      if (section === "education" && updatedData.education) {
        if (!Array.isArray(updatedData.education)) {
          updatedData.education = [];
        }
        // Ensure each education entry has required fields
        updatedData.education = updatedData.education.map((edu) => ({
          degree: edu.degree || "",
          institution: edu.institution || "",
          year: edu.year || "",
          ...edu
        }));
      }

      // Handle projects - ensure proper structure
      if (section === "projects" && updatedData.projects) {
        if (!Array.isArray(updatedData.projects)) {
          updatedData.projects = [];
        }
        // Ensure each project has required fields
        updatedData.projects = updatedData.projects.map((proj) => ({
          name: proj.name || proj.title || "",
          title: proj.title || proj.name || "",
          description: proj.description || "",
          startDate: proj.startDate || "",
          endDate: proj.endDate || "",
          link: proj.link || "",
          github: proj.github || "",
          ...proj
        }));
      }

      // Handle achievements - ensure it's an array
      if (section === "achievements") {
        if (!Array.isArray(updatedData.achievements)) {
          if (typeof updatedData.achievements === "string") {
            updatedData.achievements = updatedData.achievements
              .split("\n")
              .map(s => s.replace(/^[-*•]\s*/, "").trim())
              .filter(Boolean);
          } else {
            updatedData.achievements = [];
          }
        }
      }

      // Handle languages - ensure it's an array
      if (section === "languages") {
        if (!Array.isArray(updatedData.languages)) {
          if (typeof updatedData.languages === "string") {
            updatedData.languages = updatedData.languages
              .split("\n")
              .map(s => s.replace(/^[-*•]\s*/, "").trim())
              .filter(Boolean);
          } else {
            updatedData.languages = [];
          }
        }
      }

      // Handle interests - ensure it's an array
      if (section === "interests") {
        if (!Array.isArray(updatedData.interests)) {
          if (typeof updatedData.interests === "string") {
            updatedData.interests = updatedData.interests
              .split("\n")
              .map(s => s.replace(/^[-*•]\s*/, "").trim())
              .filter(Boolean);
          } else {
            updatedData.interests = [];
          }
        }
      }

      // Handle courses - ensure proper structure
      if (section === "courses") {
        if (!Array.isArray(updatedData.courses)) {
          // If it's a string (from Sidebar enhancement), parse it
          if (typeof updatedData.courses === "string") {
            const courseLines = updatedData.courses
              .split("\n")
              .map(s => s.replace(/^[-*•]\s*/, "").trim())
              .filter(Boolean);
            updatedData.courses = courseLines.map((line, index) => {
              // Try to parse course name and provider from the line
              const parts = line.split(" - ");
              return {
                name: parts[0] || line,
                title: parts[0] || line,
                provider: parts[1] || "",
              };
            });
          } else {
            updatedData.courses = [];
          }
        } else {
          // Ensure each course has required fields
          updatedData.courses = updatedData.courses.map((course) => ({
            name: course.name || course.title || "",
            title: course.title || course.name || "",
            provider: course.provider || "",
            ...course
          }));
        }
      }

      // Handle certifications - ensure proper structure
      if (section === "certifications") {
        if (!Array.isArray(updatedData.certifications)) {
          // If it's a string (from Sidebar enhancement), parse it
          if (typeof updatedData.certifications === "string") {
            const certLines = updatedData.certifications
              .split("\n")
              .map(s => s.replace(/^[-*•]\s*/, "").trim())
              .filter(Boolean);
            updatedData.certifications = certLines.map((line) => {
              // Try to parse certification name and issuer from the line
              const parts = line.split(" - ");
              return {
                name: parts[0] || line,
                title: parts[0] || line,
                issuer: parts[1] || "",
                date: "",
              };
            });
          } else {
            updatedData.certifications = [];
          }
        } else {
          // Ensure each certification has required fields
          updatedData.certifications = updatedData.certifications.map((cert) => ({
            name: cert.name || cert.title || "",
            title: cert.title || cert.name || "",
            issuer: cert.issuer || "",
            date: cert.date || "",
            ...cert
          }));
        }
      }

      // Update local state and context
      setLocalData(updatedData);
      localStorage.setItem('resumeData', JSON.stringify(updatedData));
      if (updateResumeData) {
        updateResumeData(updatedData);
      }
    }
  };

  // Helper functions
  const hasSummary = () => {
    return localData.summary && localData.summary.trim().length > 0;
  };

  const hasSkills = () => {
    return localData.skills && localData.skills.length > 0 && localData.skills.some(skill => skill && skill.trim().length > 0);
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
      (proj.title && proj.title.trim().length > 0) ||
      (proj.description && proj.description.trim().length > 0)
    );
  };

  const hasAchievements = () => {
    if (!localData.achievements || localData.achievements.length === 0) return false;
    return localData.achievements.some(ach => {
      if (!ach) return false;
      // Handle string format
      if (typeof ach === "string") {
        return ach.trim().length > 0;
      }
      // Handle object format
      if (typeof ach === "object") {
        const title = ach.title || ach.name || "";
        const description = ach.description || "";
        const description2 = ach.description2 || "";
        return (
          (title && title.trim().length > 0) ||
          (description && (typeof description === "string" ? description.trim().length > 0 : description.length > 0)) ||
          (description2 && description2.trim().length > 0)
        );
      }
      return false;
    });
  };

  const hasLanguages = () => {
    return localData.languages && localData.languages.length > 0 && localData.languages.some(lang => lang && lang.trim().length > 0);
  };

  const hasCourses = () => {
    if (!localData.courses || localData.courses.length === 0) return false;
    return localData.courses.some(course =>
      (course.name && course.name.trim().length > 0) ||
      (course.title && course.title.trim().length > 0) ||
      (course.provider && course.provider.trim().length > 0)
    );
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  // Format date range for display (e.g., "Jan 2023 - Mar 2023")
  const formatDateRange = (startDate, endDate) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const format = (dateStr) => {
      if (!dateStr) return "";
      if (/^\d{2}\/\d{4}$/.test(dateStr)) {
        const [month, year] = dateStr.split("/");
        return `${months[parseInt(month) - 1]} ${year}`;
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };
    const start = format(startDate);
    const end = format(endDate);
    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    if (end) return end;
    return "";
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        <Navbar />
        <div style={{ display: "flex" }}>
          <Sidebar onEnhance={handleEnhance} resumeRef={resumeRef} />

          <div style={{ flexGrow: 1, padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              ref={resumeRef}
              style={{
                backgroundColor: "#ffffff",
                color: "#1f2937",
                maxWidth: "72rem",
                width: "100%",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "2.5rem",
              }}
            >
              {/* Header Section */}
              <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem" }}>
                <div style={{ marginBottom: "0.75rem" }}>
                  {editMode ? (
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={localData.name || ""}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        color: "#1f2937",
                        textTransform: "uppercase",
                        width: "100%",
                        border: "1px solid #d1d5db",
                        padding: "0.5rem",
                        borderRadius: "0.375rem",
                      }}
                    />
                  ) : (
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1f2937", textTransform: "uppercase", margin: 0 }}>
                      {localData.name || "Your Name"}
                    </h1>
                  )}
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  {editMode ? (
                    <input
                      type="text"
                      placeholder="Job Title | Specialization | Role"
                      value={localData.role || ""}
                      onChange={(e) => handleFieldChange("role", e.target.value)}
                      style={{
                        fontSize: "1rem",
                        color: "#3b82f6",
                        width: "100%",
                        border: "1px solid #d1d5db",
                        padding: "0.5rem",
                        borderRadius: "0.375rem",
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: "1rem", color: "#3b82f6", margin: 0 }}>
                      {localData.role || "Professional Title"}
                    </p>
                  )}
                </div>
                <div>
                  {editMode ? (
                    <input
                      type="text"
                      placeholder="Phone | Email | LinkedIn | GitHub"
                      value={`${localData.phone || ""} | ${localData.email || ""} | ${localData.linkedin || ""} | ${localData.github || ""}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("|").map(p => p.trim());
                        handleFieldChange("phone", parts[0] || "");
                        handleFieldChange("email", parts[1] || "");
                        handleFieldChange("linkedin", parts[2] || "");
                        handleFieldChange("github", parts[3] || "");
                      }}
                      style={{
                        fontSize: "0.875rem",
                        width: "100%",
                        border: "1px solid #d1d5db",
                        padding: "0.5rem",
                        borderRadius: "0.375rem",
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: "0.875rem", color: "#374151", margin: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
                      {localData.phone && <span>{localData.phone}</span>}
                      {localData.phone && (localData.email || localData.linkedin || localData.github) && <span>|</span>}

                      {localData.email && <span>{localData.email}</span>}
                      {localData.email && (localData.linkedin || localData.github) && <span>|</span>}

                      {localData.linkedin && (
                        <a href={localData.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                          {localData.linkedin}
                        </a>
                      )}
                      {localData.linkedin && localData.github && <span>|</span>}

                      {localData.github && (
                        <a href={localData.github} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                          {localData.github}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Two Column Layout - Profile/Key Skills at top */}
              <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start", marginBottom: "1.75rem" }}>
                {/* Left Column */}
                <div style={{ flex: "2.5", minWidth: 0 }}>
                  {/* PROFILE Section */}
                  {(editMode || hasSummary()) && (
                    <div style={{ marginBottom: "1.75rem" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.5px" }}>
                        Profile
                      </h3>
                      <div style={{ borderBottom: "1px solid #d1d5db", marginBottom: "0.75rem" }} />
                      {editMode ? (
                        <textarea
                          value={localData.summary || ""}
                          onChange={(e) => handleFieldChange("summary", e.target.value)}
                          placeholder="Your professional summary..."
                          style={{
                            width: "100%",
                            minHeight: "100px",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.5rem",
                            fontSize: "0.875rem",
                            resize: "vertical",
                          }}
                        />
                      ) : (
                        <p style={{ fontSize: "0.875rem", color: "#374151", lineHeight: "1.6", margin: 0 }}>
                          {localData.summary}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div style={{ flex: "1", minWidth: 0 }}>
                  {/* KEY SKILLS Section */}
                  {(editMode || hasSkills()) && (
                    <div>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.5px" }}>
                        Key Skills
                      </h3>
                      <div style={{ borderBottom: "1px solid #d1d5db", marginBottom: "0.75rem" }} />
                      {editMode ? (
                        <>
                          {(localData.skills || []).map((skill, index) => (
                            <div key={index} style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                              <input
                                type="text"
                                value={skill || ""}
                                onChange={(e) => {
                                  const updated = [...(localData.skills || [])];
                                  updated[index] = e.target.value;
                                  handleFieldChange("skills", updated);
                                }}
                                placeholder="Skill"
                                style={{
                                  flex: 1,
                                  border: "1px solid #d1d5db",
                                  padding: "0.5rem",
                                  borderRadius: "0.375rem",
                                  fontSize: "0.875rem",
                                }}
                              />
                              <button
                                onClick={() => {
                                  const newSkills = localData.skills.filter((_, i) => i !== index);
                                  handleFieldChange("skills", newSkills);
                                }}
                                style={{
                                  backgroundColor: "#ef4444",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "0.25rem",
                                  padding: "0.5rem 0.75rem",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ❌
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newSkills = [...(localData.skills || []), ""];
                              handleFieldChange("skills", newSkills);
                            }}
                            style={{
                              backgroundColor: "#10b981",
                              color: "#fff",
                              padding: "0.5rem 1rem",
                              borderRadius: "0.375rem",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                            }}
                          >
                            ➕ Add Skill
                          </button>
                        </>
                      ) : (
                        <div>
                          {(localData.skills || []).map((skill, index) => (
                            <div key={index} style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.25rem" }}>
                              • {skill}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* LANGUAGES Section - Full Width */}
              {(editMode || hasLanguages()) && (
                <div style={{ marginBottom: "1.75rem" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.5px" }}>
                    Languages
                  </h3>
                  <div style={{ borderBottom: "1px solid #d1d5db", marginBottom: "0.75rem" }} />
                  {(() => {
                    // Helper function to get proficiency level and dots
                    const getProficiencyInfo = (lang) => {
                      if (typeof lang === "string") {
                        return { name: lang, proficiency: "Beginner", filledDots: 1 };
                      }
                      const proficiency = lang.proficiency || lang.level || "Beginner";
                      let filledDots = 1;
                      if (proficiency === "Beginner" || proficiency === "Basic") filledDots = 1;
                      else if (proficiency === "Elementary") filledDots = 2;
                      else if (proficiency === "Intermediate" || proficiency === "Conversational") filledDots = 3;
                      else if (proficiency === "Advanced" || proficiency === "Professional") filledDots = 4;
                      else if (proficiency === "Fluent" || proficiency === "Native" || proficiency === "Proficient") filledDots = 5;
                      return { name: lang.name || lang.language || "", proficiency, filledDots };
                    };

                    return editMode ? (
                      <>
                        {(localData.languages || []).map((lang, index) => {
                          const langObj = typeof lang === "string" ? { name: lang, proficiency: "Beginner" } : lang;
                          return (
                            <div key={index} style={{ marginBottom: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                              <input
                                type="text"
                                value={langObj.name || langObj.language || ""}
                                onChange={(e) => {
                                  const updated = [...(localData.languages || [])];
                                  updated[index] = { ...langObj, name: e.target.value, language: e.target.value };
                                  handleFieldChange("languages", updated);
                                }}
                                placeholder="Language"
                                style={{
                                  flex: 1,
                                  border: "1px solid #d1d5db",
                                  padding: "0.5rem",
                                  borderRadius: "0.375rem",
                                  fontSize: "0.875rem",
                                }}
                              />
                              <select
                                value={langObj.proficiency || "Beginner"}
                                onChange={(e) => {
                                  const updated = [...(localData.languages || [])];
                                  updated[index] = { ...langObj, proficiency: e.target.value };
                                  handleFieldChange("languages", updated);
                                }}
                                style={{
                                  border: "1px solid #d1d5db",
                                  padding: "0.5rem",
                                  borderRadius: "0.375rem",
                                  fontSize: "0.875rem",
                                  minWidth: "120px",
                                }}
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Elementary">Elementary</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Fluent">Fluent</option>
                                <option value="Native">Native</option>
                              </select>
                              <button
                                onClick={() => {
                                  const newLang = localData.languages.filter((_, i) => i !== index);
                                  handleFieldChange("languages", newLang);
                                }}
                                style={{
                                  backgroundColor: "#ef4444",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "0.25rem",
                                  padding: "0.5rem 0.75rem",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ❌
                              </button>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => {
                            const newLang = [...(localData.languages || []), { name: "", proficiency: "Beginner" }];
                            handleFieldChange("languages", newLang);
                          }}
                          style={{
                            backgroundColor: "#10b981",
                            color: "#fff",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.375rem",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                          }}
                        >
                          ➕ Add Language
                        </button>
                      </>
                    ) : (
                      <div>
                        {(localData.languages || []).map((lang, index) => {
                          const { name, proficiency, filledDots } = getProficiencyInfo(lang);
                          if (!name) return null;

                          return (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "0.5rem",
                                width: "100%"
                              }}
                            >
                              <div style={{ fontSize: "0.875rem", color: "#374151", flexShrink: 0 }}>
                                {name}
                              </div>
                              <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", flex: 1, justifyContent: "center", margin: "0 1rem" }}>
                                {[1, 2, 3, 4, 5].map((dotNum) => (
                                  <div
                                    key={dotNum}
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor: dotNum <= filledDots ? "#1f2937" : "#d1d5db",
                                    }}
                                  />
                                ))}
                              </div>
                              <div style={{ fontSize: "0.875rem", color: "#374151", flexShrink: 0, textAlign: "right" }}>
                                {proficiency}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* PROJECTS Section - Full Width */}
              {(editMode || hasProjects()) && (
                <div style={{ marginBottom: "1.75rem" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.5px" }}>
                    Projects
                  </h3>
                  {(() => {
                    const projects = editMode
                      ? (localData.projects || [])
                      : (localData.projects || []).filter(proj =>
                        (proj.name && proj.name.trim().length > 0) ||
                        (proj.title && proj.title.trim().length > 0) ||
                        (proj.description && proj.description.trim().length > 0)
                      );

                    return projects.length > 0 ? (
                      projects.map((proj, index) => {
                        const originalIndex = editMode ? index : localData.projects.findIndex(p => p === proj);
                        const startDate = proj.startDate || "";
                        const endDate = proj.endDate || "";
                        const dateRange = formatDateRange(startDate, endDate);

                        return (
                          <div key={editMode ? index : `proj-${originalIndex}`} style={{ marginBottom: "1rem" }}>
                            {editMode ? (
                              <div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem", backgroundColor: "#f9fafb", marginBottom: "0.5rem" }}>
                                <input
                                  type="text"
                                  value={proj.name || proj.title || ""}
                                  onChange={(e) => {
                                    const newProj = [...localData.projects];
                                    newProj[originalIndex] = { ...newProj[originalIndex], name: e.target.value, title: e.target.value };
                                    handleFieldChange("projects", newProj);
                                  }}
                                  placeholder="Project Name"
                                  style={{
                                    fontSize: "1rem",
                                    fontWeight: "bold",
                                    width: "100%",
                                    border: "1px solid #d1d5db",
                                    padding: "0.5rem",
                                    borderRadius: "0.375rem",
                                    marginBottom: "0.5rem",
                                  }}
                                />
                                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                  <input
                                    type="text"
                                    value={proj.startDate || ""}
                                    onChange={(e) => {
                                      const newProj = [...localData.projects];
                                      newProj[originalIndex] = { ...newProj[originalIndex], startDate: e.target.value };
                                      handleFieldChange("projects", newProj);
                                    }}
                                    placeholder="Start Date (MM/YYYY)"
                                    style={{
                                      fontSize: "0.875rem",
                                      flex: 1,
                                      border: "1px solid #d1d5db",
                                      padding: "0.5rem",
                                      borderRadius: "0.375rem",
                                    }}
                                  />
                                  <input
                                    type="text"
                                    value={proj.endDate || ""}
                                    onChange={(e) => {
                                      const newProj = [...localData.projects];
                                      newProj[originalIndex] = { ...newProj[originalIndex], endDate: e.target.value };
                                      handleFieldChange("projects", newProj);
                                    }}
                                    placeholder="End Date (MM/YYYY)"
                                    style={{
                                      fontSize: "0.875rem",
                                      flex: 1,
                                      border: "1px solid #d1d5db",
                                      padding: "0.5rem",
                                      borderRadius: "0.375rem",
                                    }}
                                  />
                                </div>
                                <textarea
                                  value={proj.description || ""}
                                  onChange={(e) => {
                                    const newProj = [...localData.projects];
                                    newProj[originalIndex] = { ...newProj[originalIndex], description: e.target.value };
                                    handleFieldChange("projects", newProj);
                                  }}
                                  placeholder="Project description (use bullet points)"
                                  style={{
                                    width: "100%",
                                    minHeight: "80px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "0.375rem",
                                    padding: "0.5rem",
                                    fontSize: "0.875rem",
                                    resize: "vertical",
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newProj = localData.projects.filter((_, i) => i !== originalIndex);
                                    handleFieldChange("projects", newProj);
                                  }}
                                  style={{
                                    backgroundColor: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "0.25rem",
                                    padding: "0.5rem 0.75rem",
                                    cursor: "pointer",
                                    fontSize: "0.75rem",
                                    marginTop: "0.5rem",
                                  }}
                                >
                                  ❌ Remove
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                                {/* Vertical line indicator */}
                                <div style={{ width: "2px", backgroundColor: "#1f2937", flexShrink: 0, minHeight: "100%" }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1f2937", marginBottom: "0.25rem" }}>
                                    {proj.name || proj.title}
                                  </div>
                                  {dateRange && (
                                    <div style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>
                                      {dateRange}
                                    </div>
                                  )}
                                  {proj.description && (
                                    <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: "1.6" }}>
                                      {proj.description.split('\n').map((line, i) => (
                                        line.trim() && (
                                          <div key={i} style={{ marginBottom: "0.25rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                                            <span style={{ color: "#1f2937", fontSize: "0.5rem", lineHeight: "1.8", marginTop: "0.4rem", flexShrink: 0 }}>●</span>
                                            <span style={{ flex: 1 }}>{line.trim()}</span>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      !editMode ? null : <p style={{ color: "#6b7280", fontStyle: "italic" }}>No projects listed</p>
                    );
                  })()}
                  {editMode && (
                    <button
                      onClick={() => {
                        const newProj = [...(localData.projects || []), { name: "", title: "", description: "", startDate: "", endDate: "" }];
                        handleFieldChange("projects", newProj);
                      }}
                      style={{
                        backgroundColor: "#10b981",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.375rem",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                      }}
                    >
                      ➕ Add Project
                    </button>
                  )}
                </div>
              )}

              {/* Two Column Layout - Experience/Achievements */}
              <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start", marginBottom: "1.75rem" }}>
                {/* Left Column */}
                <div style={{ flex: "2.5", minWidth: 0 }}>
                  {/* WORK EXPERIENCE Section */}
                  {(editMode || hasExperience()) && (
                    <div style={{ marginBottom: "1.75rem" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.5px" }}>
                        Work Experience
                      </h3>
                      {(() => {
                        const experiences = editMode
                          ? (localData.experience || [])
                          : (localData.experience || []).filter(exp =>
                            (exp.title && exp.title.trim().length > 0) ||
                            (exp.company && exp.company.trim().length > 0) ||
                            (exp.description && exp.description.trim().length > 0)
                          );

                        return experiences.length > 0 ? (
                          experiences.map((exp, index) => {
                            const originalIndex = editMode ? index : localData.experience.findIndex(e => e === exp);
                            return (
                              <div
                                key={editMode ? index : `exp-${originalIndex}`}
                                style={{
                                  marginBottom: "1rem",
                                  backgroundColor: editMode ? "#f9fafb" : "#ffffff",
                                  border: editMode ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                                  borderRadius: "0.375rem",
                                  padding: "1rem",
                                  boxShadow: editMode ? "none" : "0 1px 3px rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                {editMode ? (
                                  <div>
                                    <input
                                      type="text"
                                      value={exp.title || ""}
                                      onChange={(e) => {
                                        const newExp = [...localData.experience];
                                        newExp[originalIndex] = { ...newExp[originalIndex], title: e.target.value };
                                        handleFieldChange("experience", newExp);
                                      }}
                                      placeholder="Job Title"
                                      style={{
                                        fontSize: "0.95rem",
                                        fontWeight: "700",
                                        width: "100%",
                                        border: "1px solid #d1d5db",
                                        padding: "0.5rem",
                                        borderRadius: "0.375rem",
                                        marginBottom: "0.5rem",
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={exp.company || ""}
                                      onChange={(e) => {
                                        const newExp = [...localData.experience];
                                        newExp[originalIndex] = { ...newExp[originalIndex], company: e.target.value };
                                        handleFieldChange("experience", newExp);
                                      }}
                                      placeholder="Company"
                                      style={{
                                        fontSize: "0.875rem",
                                        width: "100%",
                                        border: "1px solid #d1d5db",
                                        padding: "0.5rem",
                                        borderRadius: "0.375rem",
                                        marginBottom: "0.5rem",
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={exp.duration || ""}
                                      onChange={(e) => {
                                        const newExp = [...localData.experience];
                                        newExp[originalIndex] = { ...newExp[originalIndex], duration: e.target.value };
                                        handleFieldChange("experience", newExp);
                                      }}
                                      placeholder="Duration (e.g., March 2021 - Present)"
                                      style={{
                                        fontSize: "0.875rem",
                                        width: "100%",
                                        border: "1px solid #d1d5db",
                                        padding: "0.5rem",
                                        borderRadius: "0.375rem",
                                        marginBottom: "0.5rem",
                                      }}
                                    />
                                    <textarea
                                      value={exp.description || ""}
                                      onChange={(e) => {
                                        const newExp = [...localData.experience];
                                        newExp[originalIndex] = { ...newExp[originalIndex], description: e.target.value };
                                        handleFieldChange("experience", newExp);
                                      }}
                                      placeholder="Job description..."
                                      style={{
                                        width: "100%",
                                        minHeight: "80px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "0.375rem",
                                        padding: "0.5rem",
                                        fontSize: "0.875rem",
                                        marginBottom: "0.5rem",
                                        resize: "vertical",
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        const newExp = localData.experience.filter((_, i) => i !== originalIndex);
                                        handleFieldChange("experience", newExp);
                                      }}
                                      style={{
                                        backgroundColor: "#ef4444",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "0.25rem",
                                        padding: "0.5rem 0.75rem",
                                        cursor: "pointer",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      ❌ Remove
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    {exp.title && <div style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.25rem", color: "#1f2937" }}>{exp.title}</div>}
                                    {exp.company && <div style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.25rem" }}>{exp.company}</div>}
                                    {exp.duration && <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>{exp.duration}</div>}
                                    {exp.description && <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: "1.6" }}>{exp.description}</div>}
                                  </>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          !editMode ? null : <p style={{ color: "#6b7280", fontStyle: "italic" }}>No experience listed</p>
                        );
                      })()}
                      {editMode && (
                        <button
                          onClick={() => {
                            const newExp = [...(localData.experience || []), { title: "", company: "", duration: "", description: "" }];
                            handleFieldChange("experience", newExp);
                          }}
                          style={{
                            backgroundColor: "#10b981",
                            color: "#fff",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.375rem",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                          }}
                        >
                          ➕ Add Experience
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div style={{ flex: "1", minWidth: 0 }}>
                  {/* KEY ACHIEVEMENTS Section */}
                  {(editMode || hasAchievements()) && (
                    <div style={{ marginBottom: "1.75rem" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.5px" }}>
                        Key Achievements
                      </h3>
                      {editMode ? (
                        <>
                          {(localData.achievements || []).map((ach, index) => {
                            // Normalize achievement to object format
                            let achievementObj = {};
                            if (typeof ach === "string") {
                              const parts = ach.split(":");
                              achievementObj = {
                                title: parts[0] || "",
                                description: parts[1]?.trim() || "",
                                description2: parts[2]?.trim() || ""
                              };
                            } else {
                              achievementObj = {
                                title: ach.title || ach.name || "",
                                description: Array.isArray(ach.description) ? ach.description[0] || "" : (ach.description || ""),
                                description2: Array.isArray(ach.description) ? ach.description[1] || "" : ""
                              };
                            }

                            return (
                              <div
                                key={index}
                                style={{
                                  marginBottom: "1rem",
                                  backgroundColor: "#f9fafb",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "0.375rem",
                                  padding: "1rem"
                                }}
                              >
                                <input
                                  type="text"
                                  value={achievementObj.title}
                                  onChange={(e) => {
                                    const updated = [...(localData.achievements || [])];
                                    const currentAch = updated[index];
                                    if (typeof currentAch === "string") {
                                      const parts = currentAch.split(":");
                                      updated[index] = {
                                        title: e.target.value,
                                        description: parts[1]?.trim() || "",
                                        description2: parts[2]?.trim() || ""
                                      };
                                    } else {
                                      updated[index] = {
                                        ...currentAch,
                                        title: e.target.value,
                                        name: e.target.value
                                      };
                                    }
                                    handleFieldChange("achievements", updated);
                                  }}
                                  placeholder="Achievement Title/Heading"
                                  style={{
                                    width: "100%",
                                    border: "1px solid #d1d5db",
                                    padding: "0.5rem",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.95rem",
                                    fontWeight: "700",
                                    marginBottom: "0.5rem",
                                  }}
                                />
                                <textarea
                                  value={achievementObj.description}
                                  onChange={(e) => {
                                    const updated = [...(localData.achievements || [])];
                                    const currentAch = updated[index];
                                    if (typeof currentAch === "string") {
                                      const parts = currentAch.split(":");
                                      updated[index] = {
                                        title: parts[0] || "",
                                        description: e.target.value,
                                        description2: parts[2]?.trim() || ""
                                      };
                                    } else {
                                      updated[index] = {
                                        ...currentAch,
                                        description: e.target.value
                                      };
                                    }
                                    handleFieldChange("achievements", updated);
                                  }}
                                  placeholder="Description (first line)"
                                  style={{
                                    width: "100%",
                                    border: "1px solid #d1d5db",
                                    padding: "0.5rem",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.875rem",
                                    marginBottom: "0.5rem",
                                    minHeight: "60px",
                                    resize: "vertical",
                                  }}
                                />
                                <textarea
                                  value={achievementObj.description2}
                                  onChange={(e) => {
                                    const updated = [...(localData.achievements || [])];
                                    const currentAch = updated[index];
                                    if (typeof currentAch === "string") {
                                      const parts = currentAch.split(":");
                                      updated[index] = {
                                        title: parts[0] || "",
                                        description: parts[1]?.trim() || "",
                                        description2: e.target.value
                                      };
                                    } else {
                                      updated[index] = {
                                        ...currentAch,
                                        description2: e.target.value
                                      };
                                    }
                                    handleFieldChange("achievements", updated);
                                  }}
                                  placeholder="Description (second line - optional)"
                                  style={{
                                    width: "100%",
                                    border: "1px solid #d1d5db",
                                    padding: "0.5rem",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.875rem",
                                    marginBottom: "0.5rem",
                                    minHeight: "60px",
                                    resize: "vertical",
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newAch = localData.achievements.filter((_, i) => i !== index);
                                    handleFieldChange("achievements", newAch);
                                  }}
                                  style={{
                                    backgroundColor: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "0.25rem",
                                    padding: "0.5rem 0.75rem",
                                    cursor: "pointer",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  ❌ Remove
                                </button>
                              </div>
                            );
                          })}
                          <button
                            onClick={() => {
                              const newAch = [...(localData.achievements || []), { title: "", description: "", description2: "" }];
                              handleFieldChange("achievements", newAch);
                            }}
                            style={{
                              backgroundColor: "#10b981",
                              color: "#fff",
                              padding: "0.5rem 1rem",
                              borderRadius: "0.375rem",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                            }}
                          >
                            ➕ Add Achievement
                          </button>
                        </>
                      ) : (
                        <div>
                          {(localData.achievements || []).map((ach, index) => {
                            let achievementTitle = "";
                            let achievementDesc = "";
                            let achievementDesc2 = "";

                            if (typeof ach === "string") {
                              const parts = ach.split(":");
                              achievementTitle = parts[0] || ach;
                              achievementDesc = parts[1]?.trim() || "";
                              achievementDesc2 = parts[2]?.trim() || "";
                            } else {
                              achievementTitle = ach.title || ach.name || "";
                              // Handle description - can be string, array, or separate description2 field
                              if (ach.description2) {
                                achievementDesc = ach.description || "";
                                achievementDesc2 = ach.description2 || "";
                              } else if (Array.isArray(ach.description)) {
                                achievementDesc = ach.description[0] || "";
                                achievementDesc2 = ach.description[1] || "";
                              } else {
                                achievementDesc = ach.description || "";
                              }
                            }

                            if (!achievementTitle && !achievementDesc) return null;

                            return (
                              <div
                                key={index}
                                style={{
                                  marginBottom: "1rem",
                                  backgroundColor: "#ffffff",
                                  borderRadius: "0.375rem",
                                  padding: "1rem",
                                  border: "1px solid #e5e7eb",
                                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                {achievementTitle && (
                                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1f2937", marginBottom: achievementDesc ? "0.5rem" : "0" }}>
                                    {achievementTitle}
                                  </div>
                                )}
                                {achievementDesc && (
                                  <div style={{ fontSize: "0.875rem", fontWeight: "400", color: "#374151", lineHeight: "1.6", marginBottom: achievementDesc2 ? "0.25rem" : "0" }}>
                                    {achievementDesc}
                                  </div>
                                )}
                                {achievementDesc2 && (
                                  <div style={{ fontSize: "0.875rem", fontWeight: "400", color: "#374151", lineHeight: "1.6" }}>
                                    {achievementDesc2}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Two Column Layout - Education/Courses */}
              <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start" }}>
                {/* Left Column */}
                <div style={{ flex: "2.5", minWidth: 0 }}>
                  {/* EDUCATION Section */}
                  {(editMode || hasEducation()) && (
                    <div style={{ marginBottom: "1.75rem" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.5px" }}>
                        Education
                      </h3>
                      {(() => {
                        const educations = editMode
                          ? (localData.education || [])
                          : (localData.education || []).filter(edu =>
                            (edu.degree && edu.degree.trim().length > 0) ||
                            (edu.institution && edu.institution.trim().length > 0)
                          );

                        return educations.length > 0 ? (
                          educations.map((edu, index) => {
                            const originalIndex = editMode ? index : localData.education.findIndex(e => e === edu);
                            return (
                              <div
                                key={editMode ? index : `edu-${originalIndex}`}
                                style={{
                                  marginBottom: "1rem",
                                  backgroundColor: editMode ? "#f9fafb" : "#ffffff",
                                  border: editMode ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                                  borderRadius: "0.375rem",
                                  padding: "1rem",
                                  boxShadow: editMode ? "none" : "0 1px 3px rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                {editMode ? (
                                  <div>
                                    <input
                                      type="text"
                                      value={edu.degree || ""}
                                      onChange={(e) => {
                                        const newEdu = [...localData.education];
                                        newEdu[originalIndex] = { ...newEdu[originalIndex], degree: e.target.value };
                                        handleFieldChange("education", newEdu);
                                      }}
                                      placeholder="Degree"
                                      style={{
                                        fontSize: "0.95rem",
                                        fontWeight: "700",
                                        width: "100%",
                                        border: "1px solid #d1d5db",
                                        padding: "0.5rem",
                                        borderRadius: "0.375rem",
                                        marginBottom: "0.5rem",
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={edu.institution || ""}
                                      onChange={(e) => {
                                        const newEdu = [...localData.education];
                                        newEdu[originalIndex] = { ...newEdu[originalIndex], institution: e.target.value };
                                        handleFieldChange("education", newEdu);
                                      }}
                                      placeholder="Institution"
                                      style={{
                                        fontSize: "0.875rem",
                                        width: "100%",
                                        border: "1px solid #d1d5db",
                                        padding: "0.5rem",
                                        borderRadius: "0.375rem",
                                        marginBottom: "0.5rem",
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={edu.year || ""}
                                      onChange={(e) => {
                                        const newEdu = [...localData.education];
                                        newEdu[originalIndex] = { ...newEdu[originalIndex], year: e.target.value };
                                        handleFieldChange("education", newEdu);
                                      }}
                                      placeholder="Year"
                                      style={{
                                        fontSize: "0.875rem",
                                        width: "100%",
                                        border: "1px solid #d1d5db",
                                        padding: "0.5rem",
                                        borderRadius: "0.375rem",
                                        marginBottom: "0.5rem",
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        const newEdu = localData.education.filter((_, i) => i !== originalIndex);
                                        handleFieldChange("education", newEdu);
                                      }}
                                      style={{
                                        backgroundColor: "#ef4444",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "0.25rem",
                                        padding: "0.5rem 0.75rem",
                                        cursor: "pointer",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      ❌ Remove
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    {edu.degree && <div style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.25rem", color: "#1f2937" }}>{edu.degree}</div>}
                                    {edu.institution && <div style={{ fontSize: "0.875rem", color: "#374151" }}>{edu.institution}</div>}
                                    {edu.year && <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>{edu.year}</div>}
                                  </>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          !editMode ? null : <p style={{ color: "#6b7280", fontStyle: "italic" }}>No education listed</p>
                        );
                      })()}
                      {editMode && (
                        <button
                          onClick={() => {
                            const newEdu = [...(localData.education || []), { degree: "", institution: "", year: "" }];
                            handleFieldChange("education", newEdu);
                          }}
                          style={{
                            backgroundColor: "#10b981",
                            color: "#fff",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.375rem",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                          }}
                        >
                          ➕ Add Education
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div style={{ flex: "1", minWidth: 0 }}>
                  {/* COURSES Section */}
                  {(editMode || hasCourses()) && (
                    <div style={{ marginBottom: "1.75rem" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.5px" }}>
                        Courses
                      </h3>
                      {(() => {
                        const courses = editMode
                          ? (localData.courses || [])
                          : (localData.courses || []).filter(course =>
                            (course.name && course.name.trim().length > 0) ||
                            (course.title && course.title.trim().length > 0) ||
                            (course.provider && course.provider.trim().length > 0)
                          );

                        return courses.length > 0 ? (
                          courses.map((course, index) => {
                            const originalIndex = editMode ? index : localData.courses.findIndex(c => c === course);
                            return (
                              <div
                                key={editMode ? index : `course-${originalIndex}`}
                                style={{
                                  marginBottom: "1rem",
                                  backgroundColor: editMode ? "#f9fafb" : "#ffffff",
                                  border: editMode ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                                  borderRadius: "0.375rem",
                                  padding: "1rem",
                                  boxShadow: editMode ? "none" : "0 1px 3px rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                {editMode ? (
                                  <div>
                                    <input
                                      type="text"
                                      value={course.name || course.title || ""}
                                      onChange={(e) => {
                                        const newCourse = [...localData.courses];
                                        newCourse[originalIndex] = { ...newCourse[originalIndex], name: e.target.value, title: e.target.value };
                                        handleFieldChange("courses", newCourse);
                                      }}
                                      placeholder="Course Name"
                                      style={{
                                        fontSize: "0.95rem",
                                        fontWeight: "700",
                                        width: "100%",
                                        border: "1px solid #d1d5db",
                                        padding: "0.5rem",
                                        borderRadius: "0.375rem",
                                        marginBottom: "0.5rem",
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={course.provider || ""}
                                      onChange={(e) => {
                                        const newCourse = [...localData.courses];
                                        newCourse[originalIndex] = { ...newCourse[originalIndex], provider: e.target.value };
                                        handleFieldChange("courses", newCourse);
                                      }}
                                      placeholder="Provider (e.g., Google, Coursera)"
                                      style={{
                                        fontSize: "0.875rem",
                                        width: "100%",
                                        border: "1px solid #d1d5db",
                                        padding: "0.5rem",
                                        borderRadius: "0.375rem",
                                        marginBottom: "0.5rem",
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        const newCourse = localData.courses.filter((_, i) => i !== originalIndex);
                                        handleFieldChange("courses", newCourse);
                                      }}
                                      style={{
                                        backgroundColor: "#ef4444",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "0.25rem",
                                        padding: "0.5rem 0.75rem",
                                        cursor: "pointer",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      ❌ Remove
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.25rem", color: "#1f2937" }}>
                                      {course.name || course.title}
                                    </div>
                                    {course.provider && (
                                      <div style={{ fontSize: "0.875rem", color: "#374151" }}>
                                        {course.provider}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          !editMode ? null : <p style={{ color: "#6b7280", fontStyle: "italic" }}>No courses listed</p>
                        );
                      })()}
                      {editMode && (
                        <button
                          onClick={() => {
                            const newCourse = [...(localData.courses || []), { name: "", title: "", provider: "" }];
                            handleFieldChange("courses", newCourse);
                          }}
                          style={{
                            backgroundColor: "#10b981",
                            color: "#fff",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.375rem",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                          }}
                        >
                          ➕ Add Course
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Mode Controls */}
              {editMode && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "center", alignItems: "center", marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
                  {saveStatus && (
                    <p style={{ fontSize: "0.875rem", color: saveStatus.includes("Error") || saveStatus.includes("Failed") ? "#ef4444" : "#10b981", fontWeight: "500", margin: 0 }}>
                      {saveStatus}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      onClick={handleSave}
                      disabled={isSavingToDatabase}
                      style={{
                        backgroundColor: isSavingToDatabase ? "#9ca3af" : "#3b82f6",
                        color: "#ffffff",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.375rem",
                        border: "none",
                        cursor: isSavingToDatabase ? "not-allowed" : "pointer",
                        fontWeight: "500",
                        opacity: isSavingToDatabase ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {isSavingToDatabase && (
                        <span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid #ffffff", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      )}
                      {isSavingToDatabase ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSavingToDatabase}
                      style={{
                        backgroundColor: isSavingToDatabase ? "#9ca3af" : "#6b7280",
                        color: "#ffffff",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.375rem",
                        border: "none",
                        cursor: isSavingToDatabase ? "not-allowed" : "pointer",
                        fontWeight: "500",
                        opacity: isSavingToDatabase ? 0.7 : 1,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Button */}
              {!editMode && (
                <div className="hide-in-pdf" style={{ display: "flex", justifyContent: "center", marginTop: "2rem", paddingTop: "1rem" }}>
                  <button
                    onClick={() => setEditMode(true)}
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "#ffffff",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "0.375rem",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "1rem",
                      boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#2563eb";
                      e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#3b82f6";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    ✏️ Edit Resume
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateP;

