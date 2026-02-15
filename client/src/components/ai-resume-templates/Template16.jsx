import React, { useState, useRef, useEffect } from "react";
import { toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import resumeService from "../../services/resumeService";

const Template16 = () => {
  const resumeRef = useRef(null);
  const resumeContext = useResume();
  const { isAuthenticated } = useAuth();

  const routerLocation = useLocation();
  const [downloadRequested, setDownloadRequested] = useState(false);

  // Auto-download trigger when coming from My Resumes
  useEffect(() => {
    if (routerLocation.state?.triggerDownload && resumeRef.current && !downloadRequested) {
      setDownloadRequested(true);
      // Small delay to ensure styles are fully loaded in the browser
      setTimeout(() => {
        const downloadBtn = document.querySelector('button[title="Download PDF"]');
        if (downloadBtn) downloadBtn.click();
      }, 1000);
    }
  }, [routerLocation.state, resumeRef, downloadRequested]);

  // Handle case where context might not be properly initialized
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

  // Also listen to context changes directly
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

      // Check if context is available
      if (!resumeContext) {
        throw new Error('Resume context is not available. Make sure ResumeProvider is wrapping your component.');
      }

      // Check if updateResumeData function exists
      if (typeof updateResumeData !== 'function') {
        console.error('Available context methods:', Object.keys(resumeContext));
        throw new Error(`updateResumeData is not a function. Available methods: ${Object.keys(resumeContext).join(', ')}`);
      }

      // Call the context update function
      await updateResumeData(localData);

      // Save to database if user is authenticated
      if (isAuthenticated) {
        // Transform flat data structure to backend expected format
        const structuredData = {
          templateId: 16, // Template16
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
          languages: localData.languages || []
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
        // Saved locally only
        setSaveStatus('Saved locally (Sign in to save to database)');
        toast.info('Resume saved locally. Sign in to save permanently.');
      }

      // Exit edit mode
      setEditMode(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(''), 3000);

    } catch (error) {
      console.error("Error saving resume data:", error);
      setSaveStatus(`Error: ${error.message}`);
      toast.error('Failed to save');

      // Clear error message after 5 seconds
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

      // Ensure summary is a string (not array) for Template16
      if (section === "summary" && Array.isArray(updatedData.summary)) {
        updatedData.summary = updatedData.summary.join("\n");
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

      // Ensure skills is an array
      if (section === "skills" && !Array.isArray(updatedData.skills)) {
        if (typeof updatedData.skills === "string") {
          updatedData.skills = updatedData.skills.split(",").map(s => s.trim()).filter(Boolean);
        } else {
          updatedData.skills = [];
        }
      }

      setLocalData(updatedData);
      // Also update localStorage
      localStorage.setItem('resumeData', JSON.stringify(updatedData));
      // Update context to ensure consistency
      if (updateResumeData) {
        updateResumeData(updatedData);
      }
    }
  };

  // Helper functions to check if sections have data
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

  const hasCertifications = () => {
    if (!localData.certifications || localData.certifications.length === 0) return false;
    return localData.certifications.some(cert =>
      (cert.title && cert.title.trim().length > 0) ||
      (cert.name && cert.name.trim().length > 0) ||
      (cert.issuer && cert.issuer.trim().length > 0)
    );
  };

  const hasAchievements = () => {
    return localData.achievements && localData.achievements.length > 0 && localData.achievements.some(ach => ach && ach.trim().length > 0);
  };

  const hasLanguages = () => {
    return localData.languages && localData.languages.length > 0 && localData.languages.some(lang => lang && lang.trim().length > 0);
  };

  const hasInterests = () => {
    return localData.interests && localData.interests.length > 0 && localData.interests.some(int => int && int.trim().length > 0);
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
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
        }}
      >
        <Navbar />
        <div style={{ display: "flex" }}>
          <Sidebar onEnhance={handleEnhance} resumeRef={resumeRef} />

          <div
            style={{
              flexGrow: 1,
              padding: "2.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "2rem",
                  borderBottom: "2px solid #3b82f6",
                  paddingBottom: "1rem",
                  gap: "2rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={localData.name || ""}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        style={{
                          fontSize: "2.5rem",
                          fontWeight: "bold",
                          color: "#1f2937",
                          marginBottom: "0.5rem",
                          width: "100%",
                          border: "1px solid #d1d5db",
                          padding: "0.5rem",
                          borderRadius: "0.375rem",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Job Title/Role"
                        value={localData.role || ""}
                        onChange={(e) => handleFieldChange("role", e.target.value)}
                        style={{
                          fontSize: "1.25rem",
                          color: "#3b82f6",
                          fontWeight: "600",
                          width: "100%",
                          border: "1px solid #d1d5db",
                          padding: "0.5rem",
                          borderRadius: "0.375rem",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <h1
                        style={{
                          fontSize: "2.5rem",
                          fontWeight: "bold",
                          color: "#1f2937",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {localData.name || "Your Name"}
                      </h1>
                      <h2
                        style={{
                          fontSize: "1.25rem",
                          color: "#3b82f6",
                          fontWeight: "600",
                        }}
                      >
                        {localData.role || "Professional Title"}
                      </h2>
                    </>
                  )}
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
                  {editMode ? (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <label style={{ fontSize: "0.95rem", fontWeight: "600", color: "#374151" }}>
                          GitHub:
                        </label>
                        <input
                          type="text"
                          placeholder="https://github.com/username"
                          value={localData.github || ""}
                          onChange={(e) => handleFieldChange("github", e.target.value)}
                          style={{
                            fontSize: "1rem",
                            color: "#374151",
                            width: "100%",
                            border: "1px solid #d1d5db",
                            padding: "0.5rem",
                            borderRadius: "0.375rem",
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <label style={{ fontSize: "0.95rem", fontWeight: "600", color: "#374151" }}>
                          LinkedIn:
                        </label>
                        <input
                          type="text"
                          placeholder="https://linkedin.com/in/username"
                          value={localData.linkedin || ""}
                          onChange={(e) => handleFieldChange("linkedin", e.target.value)}
                          style={{
                            fontSize: "1rem",
                            color: "#374151",
                            width: "100%",
                            border: "1px solid #d1d5db",
                            padding: "0.5rem",
                            borderRadius: "0.375rem",
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {localData.github && (
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#374151", whiteSpace: "nowrap" }}>
                            GitHub:
                          </span>
                          <a
                            href={localData.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "1rem",
                              color: "#3b82f6",
                              textDecoration: "none",
                              wordBreak: "break-all",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.textDecoration = "underline";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.textDecoration = "none";
                            }}
                          >
                            {localData.github}
                          </a>
                        </div>
                      )}
                      {localData.linkedin && (
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#374151", whiteSpace: "nowrap" }}>
                            LinkedIn:
                          </span>
                          <a
                            href={localData.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "1rem",
                              color: "#3b82f6",
                              textDecoration: "none",
                              wordBreak: "break-all",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.textDecoration = "underline";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.textDecoration = "none";
                            }}
                          >
                            {localData.linkedin}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Summary Section */}
              {(editMode || hasSummary()) && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#1f2937",
                      marginBottom: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    Professional Summary
                  </h3>
                  {editMode ? (
                    <textarea
                      value={localData.summary || ""}
                      onChange={(e) => handleFieldChange("summary", e.target.value)}
                      style={{
                        width: "100%",
                        minHeight: "100px",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                        resize: "vertical",
                      }}
                      placeholder="Enter your professional summary..."
                    />
                  ) : (
                    <p style={{ fontSize: "0.875rem", lineHeight: "1.6", color: "#374151" }}>
                      {localData.summary}
                    </p>
                  )}
                </div>
              )}


              {/* Skills Section */}
              {(editMode || hasSkills()) && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#1f2937",
                      marginBottom: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    Skills
                  </h3>

                  {editMode ? (
                    <>
                      <textarea
                        value={localData.skillsText ?? (localData.skills ? localData.skills.join(", ") : "")}
                        onChange={(e) => {
                          const text = e.target.value;
                          setLocalData((prev) => ({ ...prev, skillsText: text }));
                        }}
                        onBlur={() => {
                          const parsed = (localData.skillsText || "")
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s.length > 0);
                          handleFieldChange("skills", parsed);
                          setLocalData((prev) => {
                            const { skillsText, ...rest } = prev;
                            return rest;
                          });
                        }}
                        style={{
                          width: "100%",
                          minHeight: "60px",
                          padding: "0.75rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.375rem",
                          fontSize: "0.875rem",
                          lineHeight: "1.5",
                          resize: "vertical",
                        }}
                        placeholder="Enter skills separated by commas..."
                      />
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.5rem" }}>
                        Example: React, JavaScript, Node.js
                      </p>
                    </>
                  ) : (
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginTop: "0.5rem",
                      paddingTop: "0.25rem",
                      minHeight: "auto",
                      lineHeight: "normal",
                      alignItems: "center"
                    }}>
                      {localData.skills && localData.skills.length > 0 && localData.skills
                        .filter(skill => skill && skill.trim().length > 0)
                        .map((skill, index) => (
                          <span
                            key={index}
                            style={{
                              backgroundColor: "#3b82f6",
                              color: "#ffffff",
                              borderRadius: "1rem",
                              fontSize: "12px",
                              fontWeight: "500",
                              height: "24px",
                              lineHeight: "15px",
                              display: "inline-block",
                              padding: "0 12px",
                              whiteSpace: "nowrap",
                              boxSizing: "border-box",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Experience Section */}
              {(editMode || hasExperience()) && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#1f2937",
                      marginBottom: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    Professional Experience
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
                              marginBottom: "1.5rem",
                              border: "1px solid #e5e7eb",
                              borderRadius: "0.5rem",
                              padding: "1rem",
                              backgroundColor: editMode ? "#f9fafb" : "transparent",
                              display: editMode ? "flex" : "block",
                              gap: "1rem",
                              alignItems: "center",
                            }}
                          >
                            {editMode ? (
                              <div style={{ flex: 1, width: editMode ? "calc(100% - 100px)" : "100%" }}>
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
                                    fontSize: "1.125rem",
                                    fontWeight: "bold",
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
                                    fontSize: "1rem",
                                    color: "#3b82f6",
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
                                  placeholder="Duration"
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
                                  }}
                                />
                              </div>
                            ) : (
                              <>
                                {exp.title && <h4 style={{ fontSize: "1.125rem", fontWeight: "bold" }}>{exp.title}</h4>}
                                {exp.company && <p style={{ color: "#3b82f6", fontWeight: "600" }}>{exp.company}</p>}
                                {exp.duration && <p style={{ color: "#6b7280" }}>{exp.duration}</p>}
                                {exp.description && <p style={{ fontSize: "0.875rem", color: "#374151" }}>{exp.description}</p>}
                              </>
                            )}
                            {editMode && (
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
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                ❌ Remove
                              </button>
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
                        const newExp = [
                          ...(localData.experience || []),
                          { title: "", company: "", duration: "", description: "" },
                        ];
                        handleFieldChange("experience", newExp);
                      }}
                      style={{
                        backgroundColor: "#10b981",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.375rem",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                    >
                      ➕ Add Experience
                    </button>
                  )}
                </div>
              )}

              {/* Education Section */}
              {(editMode || hasEducation()) && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#1f2937",
                      marginBottom: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "0.5rem",
                    }}
                  >
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
                              marginBottom: "1.5rem",
                              border: "1px solid #e5e7eb",
                              borderRadius: "0.5rem",
                              padding: "1rem",
                              backgroundColor: editMode ? "#f9fafb" : "transparent",
                              display: editMode ? "flex" : "block",
                              gap: "1rem",
                              alignItems: "center",
                            }}
                          >
                            {editMode ? (
                              <div style={{ flex: 1, width: editMode ? "calc(100% - 100px)" : "100%" }}>
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
                                    fontSize: "1rem",
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
                                  }}
                                />
                              </div>
                            ) : (
                              <>
                                {edu.degree && <h4 style={{ fontSize: "1rem", fontWeight: "bold" }}>{edu.degree}</h4>}
                                {edu.institution && <p style={{ color: "#3b82f6", fontWeight: "600" }}>{edu.institution}</p>}
                                {edu.year && <p style={{ color: "#6b7280" }}>{edu.year}</p>}
                              </>
                            )}
                            {editMode && (
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
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                ❌ Remove
                              </button>
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
                        const newEdu = [
                          ...(localData.education || []),
                          { degree: "", institution: "", year: "" },
                        ];
                        handleFieldChange("education", newEdu);
                      }}
                      style={{
                        backgroundColor: "#10b981",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.375rem",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                    >
                      ➕ Add Education
                    </button>
                  )}
                </div>
              )}

              {/* Projects Section */}
              {(editMode || hasProjects()) && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "bold",
                      color: "#1f2937",
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Projects
                  </h3>
                  <div
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      marginBottom: "1rem",
                    }}
                  />

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

                        // Format dates for display
                        const formatDate = (dateStr) => {
                          if (!dateStr) return "";
                          // If already in MM/YYYY format, return as is
                          if (/^\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
                          // Try to parse and format
                          const date = new Date(dateStr);
                          if (isNaN(date.getTime())) return dateStr;
                          const month = String(date.getMonth() + 1).padStart(2, "0");
                          const year = date.getFullYear();
                          return `${month}/${year}`;
                        };

                        const startDate = formatDate(proj.startDate || "");
                        const endDate = formatDate(proj.endDate || "");
                        const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate || "";

                        return (
                          <div
                            key={editMode ? index : `proj-${originalIndex}`}
                            style={{
                              marginBottom: "1rem",
                              border: editMode ? "1px solid #e5e7eb" : "none",
                              borderRadius: editMode ? "0.5rem" : "0",
                              padding: editMode ? "1rem" : "0",
                              backgroundColor: editMode ? "#f9fafb" : "transparent",
                              display: editMode ? "flex" : "block",
                              gap: "1rem",
                              alignItems: editMode ? "flex-start" : "stretch",
                            }}
                          >
                            {editMode ? (
                              <div style={{ flex: 1, width: editMode ? "calc(100% - 100px)" : "100%" }}>
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
                                  placeholder="Project description..."
                                  style={{
                                    width: "100%",
                                    minHeight: "60px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "0.375rem",
                                    padding: "0.5rem",
                                    fontSize: "0.875rem",
                                    resize: "vertical",
                                  }}
                                />
                              </div>
                            ) : (
                              <div style={{ marginBottom: "0.75rem" }}>
                                {(proj.name || proj.title) && (
                                  <div style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                                    {proj.name || proj.title}
                                  </div>
                                )}
                                {proj.description && (
                                  <div
                                    style={{
                                      fontSize: "0.875rem",
                                      color: "#374151",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      gap: "1rem",
                                    }}
                                  >
                                    <span style={{ flex: 1 }}>{proj.description}</span>
                                    {dateRange && (
                                      <span
                                        style={{
                                          fontSize: "0.875rem",
                                          color: "#374151",
                                          whiteSpace: "nowrap",
                                          flexShrink: 0,
                                        }}
                                      >
                                        {dateRange}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            {editMode && (
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
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                  height: "fit-content",
                                }}
                              >
                                ❌ Remove
                              </button>
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
                        const newProj = [
                          ...(localData.projects || []),
                          { name: "", title: "", description: "", startDate: "", endDate: "" },
                        ];
                        handleFieldChange("projects", newProj);
                      }}
                      style={{
                        backgroundColor: "#10b981",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.375rem",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                    >
                      ➕ Add Project
                    </button>
                  )}
                </div>
              )}


              {/* Certifications Section - Edit Mode Only */}
              {editMode && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#1f2937",
                      marginBottom: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    Certifications
                  </h3>
                  {(localData.certifications || []).map((cert, index) => (
                    <div key={index} style={{ marginBottom: "1.5rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem", backgroundColor: "#f9fafb", position: "relative" }}>
                      <button
                        onClick={() => {
                          const newCert = localData.certifications.filter((_, i) => i !== index);
                          handleFieldChange("certifications", newCert);
                        }}
                        style={{
                          position: "absolute",
                          top: "0.5rem",
                          right: "0.5rem",
                          backgroundColor: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "0.25rem",
                          padding: "0.25rem 0.5rem",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                      >
                        ❌ Remove
                      </button>
                      <input
                        type="text"
                        value={cert.title || cert.name || ""}
                        onChange={(e) => {
                          const updated = [...(localData.certifications || [])];
                          updated[index] = { ...updated[index], title: e.target.value, name: e.target.value };
                          handleFieldChange("certifications", updated);
                        }}
                        placeholder="Certification Title"
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
                      <input
                        type="text"
                        value={cert.issuer || ""}
                        onChange={(e) => {
                          const updated = [...(localData.certifications || [])];
                          updated[index] = { ...updated[index], issuer: e.target.value };
                          handleFieldChange("certifications", updated);
                        }}
                        placeholder="Issuing Organization"
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
                        value={cert.date || ""}
                        onChange={(e) => {
                          const updated = [...(localData.certifications || [])];
                          updated[index] = { ...updated[index], date: e.target.value };
                          handleFieldChange("certifications", updated);
                        }}
                        placeholder="Date (MM/YYYY)"
                        style={{
                          fontSize: "0.875rem",
                          width: "100%",
                          border: "1px solid #d1d5db",
                          padding: "0.5rem",
                          borderRadius: "0.375rem",
                        }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newCert = [
                        ...(localData.certifications || []),
                        { title: "", name: "", issuer: "", date: "" },
                      ];
                      handleFieldChange("certifications", newCert);
                    }}
                    style={{
                      backgroundColor: "#10b981",
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.375rem",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    ➕ Add Certification
                  </button>
                </div>
              )}

              {/* Achievements Section - Edit Mode Only */}
              {editMode && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#1f2937",
                      marginBottom: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    Achievements
                  </h3>
                  {(localData.achievements || []).map((ach, index) => (
                    <div key={index} style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="text"
                        value={ach || ""}
                        onChange={(e) => {
                          const updated = [...(localData.achievements || [])];
                          updated[index] = e.target.value;
                          handleFieldChange("achievements", updated);
                        }}
                        placeholder="Achievement"
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
                          whiteSpace: "nowrap",
                        }}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newAch = [...(localData.achievements || []), ""];
                      handleFieldChange("achievements", newAch);
                    }}
                    style={{
                      backgroundColor: "#10b981",
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.375rem",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    ➕ Add Achievement
                  </button>
                </div>
              )}

              {/* Languages Section - Edit Mode Only */}
              {editMode && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#1f2937",
                      marginBottom: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    Languages
                  </h3>
                  {(localData.languages || []).map((lang, index) => (
                    <div key={index} style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="text"
                        value={lang || ""}
                        onChange={(e) => {
                          const updated = [...(localData.languages || [])];
                          updated[index] = e.target.value;
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
                          whiteSpace: "nowrap",
                        }}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newLang = [...(localData.languages || []), ""];
                      handleFieldChange("languages", newLang);
                    }}
                    style={{
                      backgroundColor: "#10b981",
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.375rem",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    ➕ Add Language
                  </button>
                </div>
              )}

              {/* Interests Section - Edit Mode Only */}
              {editMode && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#1f2937",
                      marginBottom: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    Interests
                  </h3>
                  {(localData.interests || []).map((int, index) => (
                    <div key={index} style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="text"
                        value={int || ""}
                        onChange={(e) => {
                          const updated = [...(localData.interests || [])];
                          updated[index] = e.target.value;
                          handleFieldChange("interests", updated);
                        }}
                        placeholder="Interest"
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
                          const newInt = localData.interests.filter((_, i) => i !== index);
                          handleFieldChange("interests", newInt);
                        }}
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "0.25rem",
                          padding: "0.5rem 0.75rem",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newInt = [...(localData.interests || []), ""];
                      handleFieldChange("interests", newInt);
                    }}
                    style={{
                      backgroundColor: "#10b981",
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.375rem",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    ➕ Add Interest
                  </button>
                </div>
              )}

              {/* Edit Mode Controls */}
              {editMode && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "2rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  {saveStatus && (
                    <p style={{
                      fontSize: "0.875rem",
                      color: saveStatus.includes("Error") || saveStatus.includes("Failed") ? "#ef4444" : "#10b981",
                      fontWeight: "500",
                      margin: 0,
                    }}>
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
                        <span style={{
                          display: "inline-block",
                          width: "12px",
                          height: "12px",
                          border: "2px solid #ffffff",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }} />
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    marginTop: "2rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e5e7eb",
                    marginRight: "2rem",
                  }}
                >
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

export default Template16;
