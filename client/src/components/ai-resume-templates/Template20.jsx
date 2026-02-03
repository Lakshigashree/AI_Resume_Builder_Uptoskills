import React, { useState, useRef, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { useResume } from "../../context/ResumeContext";
import { FaPhoneAlt, FaEnvelope, FaLinkedin, FaMapMarkerAlt, FaGithub } from "react-icons/fa";

const Template20 = () => {
  const resumeRef = useRef(null);
  const { resumeData, setResumeData } = useResume();
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});

  useEffect(() => {
    setLocalData(resumeData || {});
  }, [resumeData]);

  const handleFieldChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    localStorage.setItem("resumeData", JSON.stringify(updatedData));
  };

  const handleSave = () => {
    setResumeData(localData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalData(resumeData || {});
    setEditMode(false);
  };

  const handleEnhance = (section) => {
    // reserved for AI enhance
  };

  const sectionTitleStyle = {
    fontWeight: "bold",
    fontSize: "1.2rem",
    borderBottom: "2px solid #22c55e",
    color: "#2563eb",
    marginTop: "1.5rem",
    paddingBottom: "0.3rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };

  const sectionCardStyle = {
    backgroundColor: "#f9fafb",
    padding: "1rem",
    borderRadius: "0.5rem",
    marginTop: "0.75rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  // ---------- visibility checks for sections (for VIEW mode) ----------
  const hasSummary =
    typeof resumeData?.summary === "string" &&
    resumeData.summary.trim().length > 0;

  const hasSkills =
    Array.isArray(resumeData?.skills) && resumeData.skills.length > 0;

  const hasEducation =
    Array.isArray(resumeData?.education) && resumeData.education.length > 0;

  const hasExperience =
    Array.isArray(resumeData?.experience) && resumeData.experience.length > 0;

  const hasLanguages =
    Array.isArray(resumeData?.languages) && resumeData.languages.length > 0;

  // const hasCertificates =
  //   Array.isArray(resumeData?.certificates) &&
  //   resumeData.certificates.length > 0;

  const hasCertificates =
    Array.isArray(resumeData?.certificates) &&
    resumeData.certificates.some(
      (c) =>
        (c?.title && c.title.trim() !== "") ||
        (c?.issuer && c.issuer.trim() !== "") ||
        (c?.date && c.date.trim() !== "")
    );

  const hasAchievements =
    Array.isArray(resumeData?.achievements) &&
    resumeData.achievements.length > 0;

  const hasAnyContact =
    resumeData?.phone ||
    resumeData?.email ||
    resumeData?.linkedin ||
    resumeData?.location ||
    resumeData?.github;

  // ---------- lists for edit / view ----------
  const educationList = editMode
    ? (localData.education && localData.education.length > 0
      ? localData.education
      : [{ degree: "", duration: "", institution: "", location: "" }])
    : (resumeData.education || []);

  const experienceList = editMode
    ? (localData.experience && localData.experience.length > 0
      ? localData.experience
      : [
        {
          title: "",
          date: "",
          companyName: "",
          companyLocation: "",
          accomplishment: [],
        },
      ])
    : (resumeData.experience || []);

  const languagesList = editMode
    ? (localData.languages && localData.languages.length > 0
      ? localData.languages
      : [{ language: "", proficiency: "" }])
    : (resumeData.languages || []);

  const certificatesList = editMode
    ? (localData.certificates && localData.certificates.length > 0
      ? localData.certificates
      : [{ title: "", issuer: "", date: "" }])
    : (resumeData.certificates || []);

  const achievementsList = editMode
    ? (localData.achievements && localData.achievements.length > 0
      ? localData.achievements
      : [""])
    : (resumeData.achievements || []);

  // ---------- add-more handlers ----------
  const addEducation = () => {
    const current = localData.education || [];
    const updated = [
      ...current,
      { degree: "", duration: "", institution: "", location: "" },
    ];
    handleFieldChange("education", updated);
  };

  const addExperience = () => {
    const current = localData.experience || [];
    const updated = [
      ...current,
      {
        title: "",
        date: "",
        companyName: "",
        companyLocation: "",
        accomplishment: [],
      },
    ];
    handleFieldChange("experience", updated);
  };

  const addLanguage = () => {
    const current = localData.languages || [];
    const updated = [...current, { language: "", proficiency: "" }];
    handleFieldChange("languages", updated);
  };

  const addCertificate = () => {
    const current = localData.certificates || [];
    const updated = [...current, { title: "", issuer: "", date: "" }];
    handleFieldChange("certificates", updated);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onEnhance={handleEnhance} resumeRef={resumeRef} />
        <div
          style={{
            flexGrow: 1,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <div
            ref={resumeRef}
            style={{
              color: "#1f2937",
              maxWidth: "60rem",
              width: "100%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              padding: "2.5rem",
              border: "3px solid #22c55e",
              borderRadius: "1rem",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                textAlign: "center",
                borderBottom: "3px solid #22c55e",
                paddingBottom: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={localData.name || ""}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      textAlign: "center",
                      width: "100%",
                    }}
                  />
                  <input
                    type="text"
                    value={localData.role || ""}
                    onChange={(e) => handleFieldChange("role", e.target.value)}
                    style={{
                      fontSize: "1.2rem",
                      color: "#059669",
                      textAlign: "center",
                      width: "100%",
                    }}
                  />
                </>
              ) : (
                <>
                  {resumeData.name && (
                    <h1
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: "#2563eb",
                      }}
                    >
                      {resumeData.name}
                    </h1>
                  )}
                  {resumeData.role && (
                    <h2 style={{ fontSize: "1.2rem", color: "#059669" }}>
                      {resumeData.role}
                    </h2>
                  )}
                </>
              )}

              {/* Contact Info */}
              {(editMode || hasAnyContact) && (
                <div
                  style={{
                    marginTop: "0.8rem",
                    fontSize: "0.95rem",
                    color: "#374151",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    width: "100%",
                    maxWidth: "40rem",
                    marginInline: "auto",
                  }}
                >
                  {(editMode || resumeData.phone) && (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <FaPhoneAlt color="#059669" /> {resumeData.phone}
                    </span>
                  )}
                  {(editMode || resumeData.email) && (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <FaEnvelope color="#2563eb" /> {resumeData.email}
                    </span>
                  )}
                  {(editMode || resumeData.linkedin) && (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <FaLinkedin color="#2563eb" />
                      {editMode ? (
                        <span>{resumeData.linkedin}</span>
                      ) : (
                        <a href={resumeData.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                          {resumeData.linkedin}
                        </a>
                      )}
                    </span>
                  )}
                  {(editMode || resumeData.location) && (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <FaMapMarkerAlt color="#059669" /> {resumeData.location}
                    </span>
                  )}
                  {(editMode || resumeData.github) && (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <FaGithub color="#000000" />
                      {editMode ? (
                        <span>{resumeData.github}</span>
                      ) : (
                        <a href={resumeData.github} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                          {resumeData.github}
                        </a>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* SUMMARY */}
            {(editMode || hasSummary) && (
              <>
                <h3 style={sectionTitleStyle}>Summary</h3>
                <div style={sectionCardStyle}>
                  {editMode ? (
                    <textarea
                      value={localData.summary || ""}
                      onChange={(e) => handleFieldChange("summary", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.25rem",
                      }}
                      rows={4}
                    />
                  ) : (
                    <p>{resumeData.summary}</p>
                  )}
                </div>
              </>
            )}

            {/* SKILLS */}
            {(editMode || hasSkills) && (
              <>
                <h3 style={sectionTitleStyle}>Skills</h3>
                <div style={sectionCardStyle}>
                  {editMode ? (
                    <textarea
                      value={localData.skills?.join(", ") || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "skills",
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.25rem",
                      }}
                    />
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {resumeData.skills?.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: "#dbeafe",
                            color: "#1e3a8a",
                            padding: "0.3rem 0.7rem",
                            borderRadius: "20px",
                            fontSize: "0.95rem",
                            fontWeight: "500",
                            border: "1px solid #93c5fd",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* EDUCATION */}
            {(editMode || hasEducation) && (
              <>
                <h3 style={sectionTitleStyle}>Education</h3>
                <div style={sectionCardStyle}>
                  {educationList.map((edu, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: "1rem",
                        borderBottom: "1px dashed #22c55e",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      {editMode ? (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <input
                              type="text"
                              value={edu.degree || ""}
                              onChange={(e) => {
                                const updated = [...(localData.education || [])];
                                updated[idx] = {
                                  ...(updated[idx] || {}),
                                  degree: e.target.value,
                                };
                                handleFieldChange("education", updated);
                              }}
                              style={{ fontWeight: "600", width: "70%" }}
                            />
                            <input
                              type="text"
                              value={edu.duration || ""}
                              onChange={(e) => {
                                const updated = [...(localData.education || [])];
                                updated[idx] = {
                                  ...(updated[idx] || {}),
                                  duration: e.target.value,
                                };
                                handleFieldChange("education", updated);
                              }}
                              style={{ width: "25%", textAlign: "right" }}
                            />
                          </div>
                          <input
                            type="text"
                            value={edu.institution || ""}
                            onChange={(e) => {
                              const updated = [...(localData.education || [])];
                              updated[idx] = {
                                ...(updated[idx] || {}),
                                institution: e.target.value,
                              };
                              handleFieldChange("education", updated);
                            }}
                            style={{ width: "100%", marginTop: "0.3rem" }}
                          />
                          <input
                            type="text"
                            value={edu.location || ""}
                            onChange={(e) => {
                              const updated = [...(localData.education || [])];
                              updated[idx] = {
                                ...(updated[idx] || {}),
                                location: e.target.value,
                              };
                              handleFieldChange("education", updated);
                            }}
                            style={{ width: "100%", fontSize: "0.85rem" }}
                          />
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <p
                              style={{
                                fontWeight: "600",
                                color: "#2563eb",
                              }}
                            >
                              {edu.degree}
                            </p>
                            <p
                              style={{
                                fontSize: "0.875rem",
                                color: "#059669",
                              }}
                            >
                              {edu.duration}
                            </p>
                          </div>
                          <p style={{ color: "#059669" }}>{edu.institution}</p>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              color: "#4b5563",
                            }}
                          >
                            {edu.location}
                          </p>
                        </>
                      )}
                    </div>
                  ))}

                  {editMode && (
                    <button
                      type="button"
                      onClick={addEducation}
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "0.375rem",
                        border: "1px dashed #22c55e",
                        background: "#ecfdf5",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                      }}
                    >
                      + Add Education
                    </button>
                  )}
                </div>
              </>
            )}

            {/* EXPERIENCE */}
            {(editMode || hasExperience) && (
              <>
                <h3 style={sectionTitleStyle}>Experience</h3>
                <div style={sectionCardStyle}>
                  {experienceList.map((exp, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: "1rem",
                        borderBottom: "1px dashed #2563eb",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      {editMode ? (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <input
                              type="text"
                              value={exp.title || ""}
                              onChange={(e) => {
                                const updated = [...(localData.experience || [])];
                                updated[idx] = {
                                  ...(updated[idx] || {}),
                                  title: e.target.value,
                                };
                                handleFieldChange("experience", updated);
                              }}
                              style={{ fontWeight: "600", width: "70%" }}
                            />
                            <input
                              type="text"
                              value={exp.date || ""}
                              onChange={(e) => {
                                const updated = [...(localData.experience || [])];
                                updated[idx] = {
                                  ...(updated[idx] || {}),
                                  date: e.target.value,
                                };
                                handleFieldChange("experience", updated);
                              }}
                              style={{ width: "25%", textAlign: "right" }}
                            />
                          </div>
                          <input
                            type="text"
                            value={exp.companyName || ""}
                            onChange={(e) => {
                              const updated = [...(localData.experience || [])];
                              updated[idx] = {
                                ...(updated[idx] || {}),
                                companyName: e.target.value,
                              };
                              handleFieldChange("experience", updated);
                            }}
                            style={{ width: "100%", marginTop: "0.3rem" }}
                          />
                          <input
                            type="text"
                            value={exp.companyLocation || ""}
                            onChange={(e) => {
                              const updated = [...(localData.experience || [])];
                              updated[idx] = {
                                ...(updated[idx] || {}),
                                companyLocation: e.target.value,
                              };
                              handleFieldChange("experience", updated);
                            }}
                            style={{ width: "100%", marginTop: "0.3rem" }}
                          />
                          <textarea
                            value={(exp.accomplishment || []).join("\n")}
                            onChange={(e) => {
                              const updated = [...(localData.experience || [])];
                              updated[idx] = {
                                ...(updated[idx] || {}),
                                accomplishment: e.target.value
                                  .split("\n")
                                  .filter(Boolean),
                              };
                              handleFieldChange("experience", updated);
                            }}
                            style={{
                              width: "100%",
                              border: "1px solid #d1d5db",
                              borderRadius: "0.25rem",
                              padding: "0.5rem",
                              marginTop: "0.3rem",
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <p
                              style={{
                                fontWeight: "600",
                                color: "#2563eb",
                              }}
                            >
                              {exp.title}{" "}
                              <span style={{ color: "#374151" }}>
                                at {exp.companyName}
                              </span>
                            </p>
                            <p
                              style={{
                                fontSize: "0.875rem",
                                color: "#059669",
                              }}
                            >
                              {exp.date}
                            </p>
                          </div>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                            }}
                          >
                            {exp.companyLocation}
                          </p>
                          <ul
                            style={{
                              paddingLeft: "1.5rem",
                              listStyleType: "disc",
                            }}
                          >
                            {exp.accomplishment?.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ))}

                  {editMode && (
                    <button
                      type="button"
                      onClick={addExperience}
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "0.375rem",
                        border: "1px dashed #2563eb",
                        background: "#eff6ff",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                      }}
                    >
                      + Add Experience
                    </button>
                  )}
                </div>
              </>
            )}

            {/* LANGUAGES */}
            {(editMode || hasLanguages) && (
              <>
                <h3 style={sectionTitleStyle}>Languages</h3>
                <div style={sectionCardStyle}>
                  {languagesList.map((lang, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: "0.75rem",
                        borderBottom: "1px dashed #e5e7eb",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      {editMode ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <input
                            type="text"
                            value={lang.language || ""}
                            onChange={(e) => {
                              const updated = [...(localData.languages || [])];
                              updated[idx] = {
                                ...(updated[idx] || {}),
                                language: e.target.value,
                              };
                              handleFieldChange("languages", updated);
                            }}
                            placeholder="Language (e.g. English)"
                            style={{ flex: 1, minWidth: "150px" }}
                          />
                          <select
                            value={lang.proficiency || ""}
                            onChange={(e) => {
                              const updated = [...(localData.languages || [])];
                              updated[idx] = {
                                ...(updated[idx] || {}),
                                proficiency: e.target.value,
                              };
                              handleFieldChange("languages", updated);
                            }}
                            style={{
                              minWidth: "150px",
                              padding: "0.4rem",
                              borderRadius: "0.25rem",
                              border: "1px solid #d1d5db",
                            }}
                          >
                            <option value="">Proficiency</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Native">Native</option>
                          </select>
                        </div>
                      ) : (
                        <p>
                          <strong>{lang.language}</strong>{" "}
                          {lang.proficiency && <>– {lang.proficiency}</>}
                        </p>
                      )}
                    </div>
                  ))}

                  {editMode && (
                    <button
                      type="button"
                      onClick={addLanguage}
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "0.375rem",
                        border: "1px dashed #0ea5e9",
                        background: "#ecfeff",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                      }}
                    >
                      + Add Language
                    </button>
                  )}
                </div>
              </>
            )}

            {/* CERTIFICATES */}
            {(editMode || hasCertificates) && (
              <>
                <h3 style={sectionTitleStyle}>Certificates</h3>
                <div style={sectionCardStyle}>
                  {certificatesList.map((cert, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: "1rem",
                        borderBottom: "1px dashed #22c55e",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            value={cert.title || ""}
                            onChange={(e) => {
                              const updated = [...(localData.certificates || [])];
                              updated[idx] = {
                                ...(updated[idx] || {}),
                                title: e.target.value,
                              };
                              handleFieldChange("certificates", updated);
                            }}
                            placeholder="Certificate Title"
                            style={{ width: "100%", fontWeight: "600" }}
                          />
                          <input
                            type="text"
                            value={cert.issuer || ""}
                            onChange={(e) => {
                              const updated = [...(localData.certificates || [])];
                              updated[idx] = {
                                ...(updated[idx] || {}),
                                issuer: e.target.value,
                              };
                              handleFieldChange("certificates", updated);
                            }}
                            placeholder="Issuing Organization"
                            style={{ width: "100%", marginTop: "0.3rem" }}
                          />
                          <input
                            type="text"
                            value={cert.date || ""}
                            onChange={(e) => {
                              const updated = [...(localData.certificates || [])];
                              updated[idx] = {
                                ...(updated[idx] || {}),
                                date: e.target.value,
                              };
                              handleFieldChange("certificates", updated);
                            }}
                            placeholder="Year"
                            style={{
                              width: "100%",
                              fontSize: "0.85rem",
                              marginTop: "0.3rem",
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <p
                              style={{
                                fontWeight: "600",
                                color: "#2563eb",
                              }}
                            >
                              {cert.title}
                            </p>
                            <p
                              style={{
                                fontSize: "0.875rem",
                                color: "#059669",
                              }}
                            >
                              {cert.date}
                            </p>
                          </div>
                          <p
                            style={{
                              fontSize: "0.9rem",
                              color: "#4b5563",
                            }}
                          >
                            {cert.issuer}
                          </p>
                        </>
                      )}
                    </div>
                  ))}

                  {editMode && (
                    <button
                      type="button"
                      onClick={addCertificate}
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "0.375rem",
                        border: "1px dashed #22c55e",
                        background: "#ecfdf5",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                      }}
                    >
                      + Add Certificate
                    </button>
                  )}
                </div>
              </>
            )}

            {/* ACHIEVEMENTS */}
            {(editMode || hasAchievements) && (
              <>
                <h3 style={sectionTitleStyle}>Achievements</h3>
                <div style={sectionCardStyle}>
                  {editMode ? (
                    <textarea
                      value={achievementsList.join("\n")}
                      onChange={(e) => {
                        const lines = e.target.value
                          .split("\n")
                          .map((l) => l.trim())
                          .filter(Boolean);
                        handleFieldChange("achievements", lines);
                      }}
                      placeholder="Write each achievement on a new line"
                      style={{
                        width: "100%",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.25rem",
                        padding: "0.5rem",
                        minHeight: "100px",
                      }}
                    />
                  ) : (
                    <ul
                      style={{
                        paddingLeft: "1.5rem",
                        listStyleType: "disc",
                      }}
                    >
                      {achievementsList.map((ach, idx) => (
                        <li key={idx}>{ach}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>

          {/* BUTTONS */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    backgroundColor: "#16a34a",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    margin: "0 0.5rem",
                  }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "#9ca3af",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    margin: "0 0.5rem",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  margin: "0 0.5rem",
                }}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template20;
