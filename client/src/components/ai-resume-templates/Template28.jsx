import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";


const Template28 = () => {
  const resumeRef = useRef(null);
  const { resumeData, setResumeData } = useResume();
  const [localData, setLocalData] = useState(resumeData || {});
  const [isDownloading, setIsDownloading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setLocalData(resumeData || {});
  }, [resumeData]);

  // --- Download
  

  // --- Save / Edit toggles
  const handleSave = () => {
    setResumeData(localData);
    try {
      localStorage.setItem("resumeData", JSON.stringify(localData));
    } catch (e) {
      console.warn("LocalStorage write failed", e);
    }
    setEditMode(false);
  };

  const handleEditToggle = () => setEditMode((s) => !s);

  // --- helpers
  const safeString = (v) => (v === null || v === undefined ? "" : v);

  const handleChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  // For arrays of simple strings (skills, achievements, languages, certifications)
  const handleSimpleArrayChange = (section, idx, value) => {
    setLocalData((prev) => {
      const arr = Array.isArray(prev[section]) ? [...prev[section]] : [];
      arr[idx] = value;
      return { ...prev, [section]: arr };
    });
  };

  const handleAddSimpleArrayItem = (section, initial = "") => {
    setLocalData((prev) => {
      const arr = Array.isArray(prev[section]) ? [...prev[section]] : [];
      arr.push(initial);
      return { ...prev, [section]: arr };
    });
  };

  const handleRemoveSimpleArrayItem = (section, idx) => {
    setLocalData((prev) => {
      const arr = Array.isArray(prev[section]) ? [...prev[section]] : [];
      arr.splice(idx, 1);
      return { ...prev, [section]: arr };
    });
  };

  // For complex arrays (experience, education, projects)
  const handleObjectArrayChange = (section, idx, key, value) => {
    setLocalData((prev) => {
      const arr = Array.isArray(prev[section]) ? [...prev[section]] : [];
      const item = arr[idx] ? { ...arr[idx] } : {};
      item[key] = value;
      arr[idx] = item;
      return { ...prev, [section]: arr };
    });
  };

  const handleAddObjectArrayItem = (section, template = {}) => {
    setLocalData((prev) => {
      const arr = Array.isArray(prev[section]) ? [...prev[section]] : [];
      arr.push(template);
      return { ...prev, [section]: arr };
    });
  };

  const handleRemoveObjectArrayItem = (section, idx) => {
    setLocalData((prev) => {
      const arr = Array.isArray(prev[section]) ? [...prev[section]] : [];
      arr.splice(idx, 1);
      return { ...prev, [section]: arr };
    });
  };

  // Render safe text (string or small object)
  const renderText = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value.title || value.name || value.degree || value.language || JSON.stringify(value);
    }
    return String(value);
  };

  // --- Render
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f9fc" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar />

        <div
          style={{
            flexGrow: 1,
            padding: "3rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#fff",
              maxWidth: "850px",
              width: "100%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              borderRadius: "1.25rem",
              fontFamily: "'Inter', sans-serif",
              padding: "2.5rem 3rem",
              color: "#222",
              position: "relative",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                {/* Name */}
                {editMode ? (
                  <input
                    type="text"
                    value={safeString(localData.fullName)}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Your Name"
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      width: "100%",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      padding: "6px 8px",
                      marginBottom: 8,
                    }}
                  />
                ) : (
                  <h1
                    style={{
                      fontSize: "2.2rem",
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: 4,
                      textTransform: "capitalize",
                    }}
                  >
                    {renderText(localData.fullName) || "Your Name"}
                  </h1>
                )}

                {/* Role */}
                {editMode ? (
                  <input
                    type="text"
                    value={safeString(localData.role)}
                    onChange={(e) => handleChange("role", e.target.value)}
                    placeholder="Your Role (e.g., Full Stack Developer)"
                    style={{
                      fontSize: "1rem",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      padding: "6px 8px",
                      marginBottom: 8,
                      color: "#2563eb",
                      width: "100%",
                    }}
                  />
                ) : (
                  <p style={{ color: "#2563eb", fontWeight: 600, marginBottom: 8 }}>
                    {renderText(localData.role) || "Your Role (e.g., Full Stack Developer)"}
                  </p>
                )}

                {/* Contact Line */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.6rem 1.2rem",
                    fontSize: "0.95rem",
                    color: "#374151",
                    alignItems: "center",
                  }}
                >
                  {/* Phone */}
                  {editMode ? (
                    <input
                      type="text"
                      value={safeString(localData.phone)}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Phone"
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 6,
                        padding: "6px 8px",
                        minWidth: 160,
                      }}
                    />
                  ) : (
                    localData.phone && <span>📞 {localData.phone}</span>
                  )}

                  {/* Email */}
                  {editMode ? (
                    <input
                      type="email"
                      value={safeString(localData.email)}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="Email"
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 6,
                        padding: "6px 8px",
                        minWidth: 220,
                      }}
                    />
                  ) : (
                    localData.email && <span>📧 {localData.email}</span>
                  )}

                  {/* LinkedIn */}
                  {editMode ? (
                    <input
                      type="text"
                      value={safeString(localData.linkedin)}
                      onChange={(e) => handleChange("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 6,
                        padding: "6px 8px",
                        minWidth: 240,
                      }}
                    />
                  ) : (
                    localData.linkedin && (
                      <a
                        href={localData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#6b7280", textDecoration: "none" }}
                      >
                        🔗 {localData.linkedin}
                      </a>
                    )
                  )}

                  {/* GitHub */}
                  {editMode ? (
                    <input
                      type="text"
                      value={safeString(localData.github)}
                      onChange={(e) => handleChange("github", e.target.value)}
                      placeholder="https://github.com/yourusername"
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 6,
                        padding: "6px 8px",
                        minWidth: 220,
                      }}
                    />
                  ) : (
                    localData.github && (
                      <a
                        href={localData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#6b7280", textDecoration: "none" }}
                      >
                        💻 {localData.github}
                      </a>
                    )
                  )}

                  {/* Portfolio */}
                  {editMode ? (
                    <input
                      type="text"
                      value={safeString(localData.portfolio)}
                      onChange={(e) => handleChange("portfolio", e.target.value)}
                      placeholder="https://yourportfolio.com"
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 6,
                        padding: "6px 8px",
                        minWidth: 220,
                      }}
                    />
                  ) : (
                    localData.portfolio && (
                      <a
                        href={localData.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#6b7280", textDecoration: "none" }}
                      >
                        🌐 {localData.portfolio}
                      </a>
                    )
                  )}

                  {/* Location */}
                  {editMode ? (
                    <input
                      type="text"
                      value={safeString(localData.location)}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="City, State/Country"
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 6,
                        padding: "6px 8px",
                        minWidth: 160,
                      }}
                    />
                  ) : (
                    localData.location && <span>📍 {localData.location}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Main layout */}
            <div
              style={{
                display: "flex",
                marginTop: 20,
                gap: 24,
                alignItems: "flex-start",
              }}
            >
              {/* LEFT (2/3) */}
              <div style={{ flex: 2 }}>
                {/* SUMMARY */}
                {(localData.summary || editMode) && (
                  <section style={{ marginBottom: 18 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>
                      SUMMARY
                    </h3>
                    {editMode ? (
                      <textarea
                        value={safeString(localData.summary)}
                        onChange={(e) => handleChange("summary", e.target.value)}
                        placeholder="Brief professional summary..."
                        style={{
                          width: "100%",
                          minHeight: 100,
                          border: "1px solid #eee",
                          borderRadius: 6,
                          padding: 8,
                        }}
                      />
                    ) : (
                      <p style={{ lineHeight: 1.7, color: "#374151" }}>{renderText(localData.summary)}</p>
                    )}
                  </section>
                )}

                {/* EXPERIENCE */}
                {(localData.experience?.length > 0 || editMode) && (
                  <section style={{ marginBottom: 18 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>
                      EXPERIENCE
                    </h3>

                    {/* list experience */}
                    {(localData.experience || []).map((exp, idx) => {
                      const item = exp || {};
                      return (
                        <div key={idx} style={{ marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid #f1f1f1" }}>
                          {editMode ? (
                            <>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <input
                                  placeholder="Job Title"
                                  value={safeString(item.jobTitle)}
                                  onChange={(e) => handleObjectArrayChange("experience", idx, "jobTitle", e.target.value)}
                                  style={{ flex: "1 1 240px", padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                                <input
                                  placeholder="Company"
                                  value={safeString(item.company)}
                                  onChange={(e) => handleObjectArrayChange("experience", idx, "company", e.target.value)}
                                  style={{ flex: "1 1 240px", padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                              </div>
                              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                                <input
                                  placeholder="Location"
                                  value={safeString(item.location)}
                                  onChange={(e) => handleObjectArrayChange("experience", idx, "location", e.target.value)}
                                  style={{ flex: "1 1 220px", padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                                <input
                                  placeholder="Start Date"
                                  value={safeString(item.startDate)}
                                  onChange={(e) => handleObjectArrayChange("experience", idx, "startDate", e.target.value)}
                                  style={{ width: 140, padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                                <input
                                  placeholder="End Date"
                                  value={safeString(item.endDate)}
                                  onChange={(e) => handleObjectArrayChange("experience", idx, "endDate", e.target.value)}
                                  style={{ width: 140, padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <input
                                    type="checkbox"
                                    checked={!!item.current}
                                    onChange={(e) => handleObjectArrayChange("experience", idx, "current", e.target.checked)}
                                  />
                                  I currently work here
                                </label>
                              </div>
                              <textarea
                                placeholder="Job Description"
                                value={safeString(item.description)}
                                onChange={(e) => handleObjectArrayChange("experience", idx, "description", e.target.value)}
                                style={{ width: "100%", minHeight: 80, marginTop: 8, borderRadius: 6, border: "1px solid #eee", padding: 8 }}
                              />

                              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button
                                  onClick={() => handleRemoveObjectArrayItem("experience", idx)}
                                  style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6 }}
                                >
                                  Remove
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <h4 style={{ fontWeight: 600 }}>{renderText(item.jobTitle)}</h4>
                              <p style={{ color: "#2563eb", margin: "2px 0" }}>{renderText(item.company)}</p>
                              <p style={{ color: "#6b7280", fontSize: 13 }}>
                                📅 {renderText(item.startDate)} - {item.current ? "Present" : renderText(item.endDate)} &nbsp; 📍 {renderText(item.location)}
                              </p>
                              <p style={{ color: "#374151", marginTop: 6 }}>{renderText(item.description)}</p>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {/* add experience button */}
                    {editMode && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          onClick={() =>
                            handleAddObjectArrayItem("experience", {
                              jobTitle: "",
                              company: "",
                              location: "",
                              startDate: "",
                              endDate: "",
                              description: "",
                              current: false,
                            })
                          }
                          style={{ background: "#2563eb", color: "#fff", padding: "8px 12px", border: "none", borderRadius: 6 }}
                        >
                          + Add Experience
                        </button>
                      </div>
                    )}
                  </section>
                )}

                {/* EDUCATION */}
                {(localData.education?.length > 0 || editMode) && (
                  <section style={{ marginBottom: 18 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>EDUCATION</h3>
                    {(localData.education || []).map((edu, idx) => {
                      const item = edu || {};
                      return (
                        <div key={idx} style={{ marginBottom: 12 }}>
                          {editMode ? (
                            <>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <input
                                  placeholder="Degree (e.g., B.Tech in Computer Science)"
                                  value={safeString(item.degree)}
                                  onChange={(e) => handleObjectArrayChange("education", idx, "degree", e.target.value)}
                                  style={{ flex: "1 1 360px", padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                                <input
                                  placeholder="College/University"
                                  value={safeString(item.college)}
                                  onChange={(e) => handleObjectArrayChange("education", idx, "college", e.target.value)}
                                  style={{ flex: "1 1 260px", padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                              </div>
                              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <input
                                  placeholder="Start Date"
                                  value={safeString(item.startDate)}
                                  onChange={(e) => handleObjectArrayChange("education", idx, "startDate", e.target.value)}
                                  style={{ width: 140, padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                                <input
                                  placeholder="End Date"
                                  value={safeString(item.endDate)}
                                  onChange={(e) => handleObjectArrayChange("education", idx, "endDate", e.target.value)}
                                  style={{ width: 140, padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                                <input
                                  placeholder="Location"
                                  value={safeString(item.location)}
                                  onChange={(e) => handleObjectArrayChange("education", idx, "location", e.target.value)}
                                  style={{ flex: "1 1 180px", padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <button
                                  onClick={() => handleRemoveObjectArrayItem("education", idx)}
                                  style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6 }}
                                >
                                  Remove
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <h4 style={{ fontWeight: 600 }}>{renderText(item.degree)}</h4>
                              <p style={{ color: "#2563eb", margin: "2px 0" }}>{renderText(item.college)}</p>
                              <p style={{ color: "#6b7280", fontSize: 13 }}>
                                📅 {renderText(item.startDate)} - {renderText(item.endDate)} &nbsp; 📍 {renderText(item.location)}
                              </p>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {editMode && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          onClick={() => handleAddObjectArrayItem("education", { degree: "", college: "", startDate: "", endDate: "", location: "" })}
                          style={{ background: "#2563eb", color: "#fff", padding: "8px 12px", border: "none", borderRadius: 6 }}
                        >
                          + Add Education
                        </button>
                      </div>
                    )}
                  </section>
                )}

                {/* PROJECTS */}
                {(localData.projects?.length > 0 || editMode) && (
                  <section style={{ marginBottom: 18 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>PROJECTS</h3>
                    {(localData.projects || []).map((proj, idx) => {
                      const item = proj || {};
                      return (
                        <div key={idx} style={{ marginBottom: 12 }}>
                          {editMode ? (
                            <>
                              <input
                                placeholder="Project Title"
                                value={safeString(item.title)}
                                onChange={(e) => handleObjectArrayChange("projects", idx, "title", e.target.value)}
                                style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #eee", marginBottom: 8 }}
                              />
                              <input
                                placeholder="Technologies (comma separated)"
                                value={safeString(item.technologies)}
                                onChange={(e) =>
                                  // accept either array or comma-separated string
                                  handleObjectArrayChange(
                                    "projects",
                                    idx,
                                    "technologies",
                                    typeof item.technologies === "string" ? e.target.value : e.target.value.split(",").map((s) => s.trim())
                                  )
                                }
                                style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #eee", marginBottom: 8 }}
                              />
                              <textarea
                                placeholder="Brief description"
                                value={safeString(item.description)}
                                onChange={(e) => handleObjectArrayChange("projects", idx, "description", e.target.value)}
                                style={{ width: "100%", minHeight: 80, borderRadius: 6, border: "1px solid #eee", padding: 8 }}
                              />
                              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <input
                                  placeholder="Live Demo URL"
                                  value={safeString(item.live)}
                                  onChange={(e) => handleObjectArrayChange("projects", idx, "live", e.target.value)}
                                  style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                                <input
                                  placeholder="GitHub URL"
                                  value={safeString(item.github)}
                                  onChange={(e) => handleObjectArrayChange("projects", idx, "github", e.target.value)}
                                  style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #eee" }}
                                />
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <button
                                  onClick={() => handleRemoveObjectArrayItem("projects", idx)}
                                  style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6 }}
                                >
                                  Remove
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <h4 style={{ fontWeight: 600 }}>{renderText(item.title)}</h4>
                              {item.technologies && (
                                <p style={{ color: "#2563eb", fontSize: 13 }}>
                                  {Array.isArray(item.technologies) ? item.technologies.join(", ") : renderText(item.technologies)}
                                </p>
                              )}
                              <p style={{ color: "#374151" }}>{renderText(item.description)}</p>
                              {item.github && (
                                <p style={{ fontSize: 13, color: "#2563eb" }}>
                                  🔗 GitHub:{" "}
                                  <a href={item.github} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>
                                    {item.github}
                                  </a>
                                </p>
                              )}
                              {item.live && (
                                <p style={{ fontSize: 13, color: "#2563eb" }}>
                                  🔗 Live:{" "}
                                  <a href={item.live} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>
                                    {item.live}
                                  </a>
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}

                    {editMode && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          onClick={() =>
                            handleAddObjectArrayItem("projects", {
                              title: "",
                              technologies: [],
                              description: "",
                              live: "",
                              github: "",
                              startDate: "",
                              endDate: "",
                            })
                          }
                          style={{ background: "#2563eb", color: "#fff", padding: "8px 12px", border: "none", borderRadius: 6 }}
                        >
                          + Add Project
                        </button>
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* RIGHT (1/3) */}
              <div style={{ flex: 1 }}>
                {/* Achievements */}
                {(localData.achievements?.length > 0 || editMode) && (
                  <section style={{ marginBottom: 18 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>ACHIEVEMENTS</h3>
                    <ul style={{ listStyle: "none", padding: 0, color: "#374151", lineHeight: 1.7 }}>
                      {(localData.achievements || []).map((ach, idx) => (
                        <li key={idx} style={{ marginBottom: 8 }}>
                          {editMode ? (
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                value={safeString(ach)}
                                onChange={(e) => handleSimpleArrayChange("achievements", idx, e.target.value)}
                                style={{ flex: 1, padding: "6px 8px", border: "1px solid #eee", borderRadius: 6 }}
                              />
                              <button
                                onClick={() => handleRemoveSimpleArrayItem("achievements", idx)}
                                style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 8px", borderRadius: 6 }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <span>⚡ {renderText(ach)}</span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {editMode && (
                      <button
                        onClick={() => handleAddSimpleArrayItem("achievements", "")}
                        style={{ background: "#2563eb", color: "#fff", padding: "8px 12px", border: "none", borderRadius: 6 }}
                      >
                        + Add Achievement
                      </button>
                    )}
                  </section>
                )}

                {/* Skills */}
                {(localData.skills?.length > 0 || editMode) && (
                  <section style={{ marginBottom: 18 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>SKILLS</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(localData.skills || []).map((skill, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {editMode ? (
                            <>
                              <input
                                value={safeString(skill)}
                                onChange={(e) => handleSimpleArrayChange("skills", idx, e.target.value)}
                                style={{ flex: 1, padding: "6px 8px", border: "1px solid #eee", borderRadius: 6 }}
                              />
                              <button
                                onClick={() => handleRemoveSimpleArrayItem("skills", idx)}
                                style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 8px", borderRadius: 6 }}
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <span style={{ backgroundColor: "#f3f4f6", padding: "6px 8px", borderRadius: 6 }}>{renderText(skill)}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {editMode && (
                      <button
                        onClick={() => handleAddSimpleArrayItem("skills", "")}
                        style={{ marginTop: 8, background: "#2563eb", color: "#fff", padding: "8px 12px", border: "none", borderRadius: 6 }}
                      >
                        + Add Skill
                      </button>
                    )}
                  </section>
                )}

                {/* Languages */}
                {(localData.languages?.length > 0 || editMode) && (
                  <section style={{ marginBottom: 18 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>LANGUAGES</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {(localData.languages || []).map((lang, idx) => (
                        <li key={idx} style={{ marginBottom: 8 }}>
                          {editMode ? (
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                value={safeString(lang)}
                                onChange={(e) => handleSimpleArrayChange("languages", idx, e.target.value)}
                                style={{ flex: 1, padding: "6px 8px", border: "1px solid #eee", borderRadius: 6 }}
                              />
                              <button
                                onClick={() => handleRemoveSimpleArrayItem("languages", idx)}
                                style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 8px", borderRadius: 6 }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <span>🌐 {renderText(lang)}</span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {editMode && (
                      <button
                        onClick={() => handleAddSimpleArrayItem("languages", "")}
                        style={{ background: "#2563eb", color: "#fff", padding: "8px 12px", border: "none", borderRadius: 6 }}
                      >
                        + Add Language
                      </button>
                    )}
                  </section>
                )}

                {/* Certifications */}
                {(localData.certifications?.length > 0 || editMode) && (
                  <section style={{ marginBottom: 18 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>CERTIFICATIONS</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {(localData.certifications || []).map((cert, idx) => (
                        <li key={idx} style={{ marginBottom: 8 }}>
                          {editMode ? (
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                value={safeString(cert)}
                                onChange={(e) => handleSimpleArrayChange("certifications", idx, e.target.value)}
                                style={{ flex: 1, padding: "6px 8px", border: "1px solid #eee", borderRadius: 6 }}
                              />
                              <button
                                onClick={() => handleRemoveSimpleArrayItem("certifications", idx)}
                                style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 8px", borderRadius: 6 }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <span>🎓 {renderText(cert)}</span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {editMode && (
                      <button
                        onClick={() => handleAddSimpleArrayItem("certifications", "")}
                        style={{ background: "#2563eb", color: "#fff", padding: "8px 12px", border: "none", borderRadius: 6 }}
                      >
                        + Add Certification
                      </button>
                    )}
                  </section>
                )}
              </div>
            </div>

            {/* Footer section with Edit / Save & Download centered */}
            <div style={{ textAlign: "center", marginTop: 28 }}>
              {!editMode ? (
                <button
                  onClick={handleEditToggle}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: "0 6px 18px rgba(37,99,235,0.15)",
                    marginRight: 12,
                  }}
                >
                  ✏️ Edit
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  style={{
                    backgroundColor: "#10b981",
                    color: "#fff",
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: "0 6px 18px rgba(16,185,129,0.15)",
                    marginRight: 12,
                  }}
                >
                  💾 Save
                </button>
              )}
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, marginTop: 12 }}>
                Generated using AI Resume Builder
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template28;
