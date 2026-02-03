import { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaGithub } from "react-icons/fa";

const TemplateY = () => {
  const resumeRef = useRef(null);
  const { resumeData, setResumeData } = useResume();
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData);

  useEffect(() => {
    setLocalData(resumeData);
  }, [resumeData]);

  // Add/Remove helpers for array sections
  const handleFieldChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    const updated = [...localData[section]];
    updated[index][key] = value;
    setLocalData({ ...localData, [section]: updated });
  };

  const handleAddItem = (section, blankItem) => {
    setLocalData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), blankItem]
    }));
  };

  const handleRemoveItem = (section, idx) => {
    setLocalData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== idx)
    }));
  };

  const handleSave = () => {
    setResumeData(localData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalData(resumeData);
    setEditMode(false);
  };

  const sectionTitleStyle = {
    fontWeight: "700",
    fontSize: "1.1rem",
    color: "#2a1fecff",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "0.5rem",
    display: "flex",
    alignItems: "center",
  };

  const verticalLineStyle = {
    position: "absolute",
    left: "38%",
    top: "0",
    bottom: "0",
    height: "100%",
    width: "2px",
    background: "#e5e7eb",
    transform: "translateX(-50%)",
    zIndex: "1",

  };

  const horizontalLineStyle = {
    width: "100%",
    border: "none",
    borderTop: "2px solid #e5e7eb",
    margin: "0",
  };

  return (
    <>
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <Navbar />
        <div style={{ display: "flex" }}>
          <Sidebar onEnhance={() => { }} resumeRef={resumeRef} />
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
              className="resume-page"
              style={{
                maxWidth: "793px", // A4 width
                width: "100%",
                minHeight: "1123px", // A4 height
                padding: "1.5rem",
                backgroundColor: "#ffffff",
                color: "#000000", // Black text like the image
                boxSizing: "border-box",
                pageBreakAfter: "always",
                pageBreakInside: "avoid",
                overflow: "hidden", // Prevent content overflow
                border: "none", // No border
              }}
            >

              {/* Header */}
              <div
                style={{
                  background: "#e0e7ff",
                  padding: "32px 0 24px 0",
                  textAlign: "center",
                  borderRadius: "0"
                }}
              >
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={localData.name}
                      onChange={e => handleFieldChange("name", e.target.value)}
                      style={{ fontSize: "2.2rem", fontWeight: "bold", width: "100%", textAlign: "center" }}
                    />
                    <input
                      type="text"
                      value={localData.role}
                      onChange={e => handleFieldChange("role", e.target.value)}
                      style={{
                        fontSize: "1.1rem",
                        color: "#000000",
                        textAlign: "center",
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        marginBottom: "0.5rem",
                      }}
                    />
                  </>
                ) : (
                  <>
                    <h1 style={{ margin: 0, fontSize: "2.2rem", letterSpacing: "2px" }}>
                      {resumeData.name || "RICHARD SANCHEZ"}
                    </h1>
                    <div style={{ color: "#64748b", fontSize: "1.2rem", marginTop: "8px" }}>
                      {resumeData.role || "Full Stack Developer"}
                    </div>
                  </>
                )}
              </div>

              {/* Main Sections */}
              <div style={{
                display: "flex",
                background: "#fff",
                borderRadius: "0",
                position: "relative",
                minHeight: "100%",
                padding: "32px 0",
              }}>
                <div style={verticalLineStyle} />

                {/* Left Column */}
                <div style={{
                  flex: "1",
                  padding: "0 32px 0 32px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  gap: "32px",
                }}>
                  {/* Contact */}
                  <div>
                    <div style={sectionTitleStyle}>Contact</div>
                    <div style={{ color: "#334155", fontSize: "1rem", marginTop: "8px" }}>
                      {editMode ? (
                        <>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaPhoneAlt color="#87CEEB" size="12" />
                            <input
                              type="text"
                              value={localData.contact?.phone || ""}
                              onChange={e => handleFieldChange("contact", { ...localData.contact, phone: e.target.value })}
                              placeholder="Phone"
                              style={{ marginBottom: "8px", width: "100%" }}
                            />
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaEnvelope color="#87CEEB" size="12" />
                            <input
                              type="text"
                              value={localData.contact?.email || ""}
                              onChange={e => handleFieldChange("contact", { ...localData.contact, email: e.target.value })}
                              placeholder="Email"
                              style={{ marginBottom: "8px", width: "100%" }}
                            />
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaMapMarkerAlt color="#87CEEB" size="12" />
                            <input
                              type="text"
                              value={localData.contact?.address || ""}
                              onChange={e => handleFieldChange("contact", { ...localData.contact, address: e.target.value })}
                              placeholder="Address"
                              style={{ marginBottom: "8px", width: "100%" }}
                            />
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaGlobe color="#87CEEB" size="12" />
                            <input
                              type="text"
                              value={localData.contact?.website || ""}
                              onChange={e => handleFieldChange("contact", { ...localData.contact, website: e.target.value })}
                              placeholder="Website"
                              style={{ marginBottom: "8px", width: "100%" }}
                            />
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaGithub color="#87CEEB" size="12" />
                            <input
                              type="text"
                              value={localData.contact?.github || ""}
                              onChange={e => handleFieldChange("contact", { ...localData.contact, github: e.target.value })}
                              placeholder="GitHub"
                              style={{ marginBottom: "8px", width: "100%" }}
                            />
                          </span>
                        </>
                      ) : (
                        // ...inside your Contact section, replace the view mode code with:
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "8px" }}>
                            <FaPhoneAlt color="#87CEEB" size="12" />
                            <span>{resumeData.contact?.phone || "123-456-7890"}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "8px" }}>
                            <FaEnvelope color="#87CEEB" size="12" />
                            <span>{resumeData.contact?.email || "john.doe@email.com"}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "8px" }}>
                            <FaMapMarkerAlt color="#87CEEB" size="12" />
                            <span>{resumeData.contact?.address || "123 Main St, City"}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "8px" }}>
                            <FaGlobe color="#87CEEB" size="12" />
                            <a href={resumeData.contact?.website || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{resumeData.contact?.website || "www.johndoe.com"}</a>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "8px" }}>
                            <FaGithub color="#87CEEB" size="12" />
                            <a href={resumeData.contact?.github || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{resumeData.contact?.github || "github.com/johndoe"}</a>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <hr style={horizontalLineStyle} />
                  {/* Education */}
                  <div>
                    <div style={sectionTitleStyle}>Education</div>
                    <div style={{ color: "#334155", fontSize: "1rem", marginTop: "8px" }}>
                      {editMode ? (
                        <>
                          {localData.education?.map((edu, idx) => (
                            <div key={idx} style={{ marginBottom: "8px" }}>
                              <input
                                type="text"
                                value={edu.year || ""}
                                onChange={e => handleArrayFieldChange("education", idx, "year", e.target.value)}
                                placeholder="Year"
                                style={{ marginBottom: "4px", width: "100%" }}
                              />
                              <input
                                type="text"
                                value={edu.school || ""}
                                onChange={e => handleArrayFieldChange("education", idx, "school", e.target.value)}
                                placeholder="School"
                                style={{ marginBottom: "4px", width: "100%" }}
                              />
                              <input
                                type="text"
                                value={edu.degree || ""}
                                onChange={e => handleArrayFieldChange("education", idx, "degree", e.target.value)}
                                placeholder="Degree"
                                style={{ marginBottom: "4px", width: "100%" }}
                              />
                              <input
                                type="text"
                                value={edu.gpa || ""}
                                onChange={e => handleArrayFieldChange("education", idx, "gpa", e.target.value)}
                                placeholder="GPA"
                                style={{ marginBottom: "4px", width: "100%" }}
                              />
                              <button
                                type="button"
                                style={{
                                  marginTop: "4px",
                                  padding: "0.3rem 0.8rem",
                                  background: "#ef4444",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "0.3rem",
                                  fontWeight: "bold",
                                  cursor: "pointer"
                                }}
                                onClick={() => handleRemoveItem("education", idx)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            style={{
                              marginTop: "8px",
                              padding: "0.4rem 1rem",
                              background: "#e0e7ff",
                              color: "#342bd0ff",
                              border: "1px solid #342bd0ff",
                              borderRadius: "0.3rem",
                              fontWeight: "bold",
                              cursor: "pointer"
                            }}
                            onClick={() => handleAddItem("education", { year: "", school: "", degree: "", gpa: "" })}
                          >
                            + Add Education
                          </button>
                        </>
                      ) : (
                        resumeData.education?.map((edu, idx) => (
                          <div key={idx} style={{ marginBottom: "8px" }}>
                            <b>{edu.year}</b><br />
                            <b>{edu.school}</b>
                            <ul style={{
                              marginTop: "4px",
                              paddingLeft: "18px",
                              listStyleType: "disc",
                              listStylePosition: "inside"
                            }}>
                              {edu.degree && <li style={{ marginBottom: "6px" }}>{edu.degree}</li>}
                              {edu.gpa && <li style={{ marginBottom: "6px" }}>GPA: {edu.gpa}</li>}
                            </ul>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <hr style={horizontalLineStyle} />
                  {/* Skills */}
                  <div>
                    <div style={sectionTitleStyle}>Skills</div>
                    {editMode ? (
                      <>
                        <ul style={{
                          color: "#334155",
                          fontSize: "1rem",
                          marginTop: "8px",
                          paddingLeft: "0",
                          listStyleType: "none",
                          listStylePosition: "inside"
                        }}>
                          {localData.skills?.map((skill, idx) => (
                            <li key={idx} style={{ marginBottom: "6px", display: "flex", alignItems: "center" }}>
                              <input
                                type="text"
                                value={skill}
                                onChange={e => {
                                  const updated = [...localData.skills];
                                  updated[idx] = e.target.value;
                                  setLocalData({ ...localData, skills: updated });
                                }}
                                style={{ width: "90%" }}
                              />
                              <button
                                type="button"
                                style={{
                                  marginLeft: "8px",
                                  padding: "0.3rem 0.8rem",
                                  background: "#ef4444",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "0.3rem",
                                  fontWeight: "bold",
                                  cursor: "pointer"
                                }}
                                onClick={() => handleRemoveItem("skills", idx)}
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          style={{
                            marginTop: "8px",
                            padding: "0.4rem 1rem",
                            background: "#e0e7ff",
                            color: "#342bd0ff",
                            border: "1px solid #342bd0ff",
                            borderRadius: "0.3rem",
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                          onClick={() => handleAddItem("skills", "")}
                        >
                          + Add Skill
                        </button>
                      </>
                    ) : (
                      <ul style={{
                        color: "#334155",
                        fontSize: "1rem",
                        marginTop: "8px",
                        paddingLeft: "18px",
                        listStyleType: "disc",
                        listStylePosition: "inside"
                      }}>
                        {resumeData.skills?.map((skill, idx) => (
                          <li key={idx} style={{ marginBottom: "6px" }}>{skill}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <hr style={horizontalLineStyle} />
                  {/* Languages */}
                  <div>
                    <div style={sectionTitleStyle}>Languages</div>
                    {editMode ? (
                      <>
                        <ul style={{
                          color: "#334155",
                          fontSize: "1rem",
                          marginTop: "8px",
                          paddingLeft: "0",
                          listStyleType: "none",
                          listStylePosition: "inside"
                        }}>
                          {localData.languages?.map((lang, idx) => (
                            <li key={idx} style={{ marginBottom: "6px", display: "flex", alignItems: "center" }}>
                              <input
                                type="text"
                                value={lang}
                                onChange={e => {
                                  const updated = [...localData.languages];
                                  updated[idx] = e.target.value;
                                  setLocalData({ ...localData, languages: updated });
                                }}
                                style={{ width: "90%" }}
                              />
                              <button
                                type="button"
                                style={{
                                  marginLeft: "8px",
                                  padding: "0.3rem 0.8rem",
                                  background: "#ef4444",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "0.3rem",
                                  fontWeight: "bold",
                                  cursor: "pointer"
                                }}
                                onClick={() => handleRemoveItem("languages", idx)}
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          style={{
                            marginTop: "8px",
                            padding: "0.4rem 1rem",
                            background: "#e0e7ff",
                            color: "#342bd0ff",
                            border: "1px solid #342bd0ff",
                            borderRadius: "0.3rem",
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                          onClick={() => handleAddItem("languages", "")}
                        >
                          + Add Language
                        </button>
                      </>
                    ) : (
                      <ul style={{
                        color: "#334155",
                        fontSize: "1rem",
                        marginTop: "8px",
                        paddingLeft: "18px",
                        listStyleType: "disc",
                        listStylePosition: "inside"
                      }}>
                        {resumeData.languages?.map((lang, idx) => (
                          <li key={idx} style={{ marginBottom: "6px" }}>{lang}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {/* Right Column */}
                <div style={{
                  flex: "1.7",
                  padding: "0 32px 0 32px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  gap: "37px",
                }}>
                  {/* Profile Summary */}
                  <div>
                    <div style={sectionTitleStyle}>Profile Summary</div>
                    <div style={{ color: "#334155", fontSize: "1rem", marginTop: "8px" }}>
                      {editMode ? (
                        <textarea
                          value={localData.summary}
                          onChange={e => handleFieldChange("summary", e.target.value)}
                          style={{ width: "100%", minHeight: "60px" }}
                        />
                      ) : (
                        resumeData.summary
                      )}
                    </div>
                  </div>
                  <hr style={horizontalLineStyle} />
                  {/* Work Experience */}
                  <div>
                    <div style={sectionTitleStyle}>Work Experience</div>
                    <div style={{ color: "#334155", fontSize: "1rem", marginTop: "8px" }}>
                      {editMode ? (
                        <>
                          {localData.experience?.map((exp, idx) => (
                            <div key={idx} style={{ marginBottom: "20px" }}>
                              <input
                                type="text"
                                value={exp.company || ""}
                                onChange={e => handleArrayFieldChange("experience", idx, "company", e.target.value)}
                                placeholder="Company"
                                style={{ marginBottom: "4px", width: "100%" }}
                              />
                              <input
                                type="text"
                                value={exp.period || ""}
                                onChange={e => handleArrayFieldChange("experience", idx, "period", e.target.value)}
                                placeholder="Period"
                                style={{ marginBottom: "4px", width: "100%" }}
                              />
                              <input
                                type="text"
                                value={exp.title || ""}
                                onChange={e => handleArrayFieldChange("experience", idx, "title", e.target.value)}
                                placeholder="Title"
                                style={{ marginBottom: "4px", width: "100%" }}
                              />
                              <ul style={{
                                marginTop: "4px",
                                paddingLeft: "0",
                                listStyleType: "none",
                                listStylePosition: "inside"
                              }}>
                                {exp.details?.map((d, i) => (
                                  <li key={i} style={{ marginBottom: "6px", display: "flex", alignItems: "center" }}>
                                    <input
                                      type="text"
                                      value={d}
                                      onChange={e => {
                                        const updatedDetails = [...exp.details];
                                        updatedDetails[i] = e.target.value;
                                        handleArrayFieldChange("experience", idx, "details", updatedDetails);
                                      }}
                                      style={{ width: "90%" }}
                                    />
                                    <button
                                      type="button"
                                      style={{
                                        marginLeft: "8px",
                                        padding: "0.3rem 0.8rem",
                                        background: "#ef4444",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "0.3rem",
                                        fontWeight: "bold",
                                        cursor: "pointer"
                                      }}
                                      onClick={() => {
                                        const updatedDetails = exp.details.filter((_, j) => j !== i);
                                        handleArrayFieldChange("experience", idx, "details", updatedDetails);
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </li>
                                ))}
                              </ul>
                              <button
                                type="button"
                                style={{
                                  marginTop: "4px",
                                  padding: "0.3rem 0.8rem",
                                  background: "#e0e7ff",
                                  color: "#342bd0ff",
                                  border: "1px solid #342bd0ff",
                                  borderRadius: "0.3rem",
                                  fontWeight: "bold",
                                  cursor: "pointer"
                                }}
                                onClick={() => {
                                  const updatedDetails = [...(exp.details || []), ""];
                                  handleArrayFieldChange("experience", idx, "details", updatedDetails);
                                }}
                              >
                                + Add Detail
                              </button>
                              <button
                                type="button"
                                style={{
                                  marginTop: "4px",
                                  marginLeft: "8px",
                                  padding: "0.3rem 0.8rem",
                                  background: "#ef4444",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "0.3rem",
                                  fontWeight: "bold",
                                  cursor: "pointer"
                                }}
                                onClick={() => handleRemoveItem("experience", idx)}
                              >
                                Remove Experience
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            style={{
                              marginTop: "8px",
                              padding: "0.4rem 1rem",
                              background: "#e0e7ff",
                              color: "#342bd0ff",
                              border: "1px solid #342bd0ff",
                              borderRadius: "0.3rem",
                              fontWeight: "bold",
                              cursor: "pointer"
                            }}
                            onClick={() => handleAddItem("experience", { company: "", period: "", title: "", details: [""] })}
                          >
                            + Add Experience
                          </button>
                        </>
                      ) : (
                        resumeData.experience?.map((exp, idx) => (
                          <div key={idx} style={{ marginBottom: "20px" }}>
                            <b>{exp.company}</b> <span style={{ float: "right" }}>{exp.period}</span><br />
                            {exp.title}
                            <ul style={{
                              marginTop: "4px",
                              paddingLeft: "18px",
                              listStyleType: "disc",
                              listStylePosition: "inside"
                            }}>
                              {exp.details?.map((d, i) => (
                                <li key={i} style={{ marginBottom: "6px" }}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Edit/Save/Cancel Buttons */}
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              {!editMode ? (
                <button
                  style={{
                    padding: "0.75rem 2rem",
                    background: "#342bd0ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                  }}
                  onClick={() => setEditMode(true)}
                >
                  Edit Resume
                </button>
              ) : (
                <>
                  <button
                    style={{
                      padding: "0.75rem 2rem",
                      background: "#16a34aff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      cursor: "pointer",
                      marginRight: "1rem"
                    }}
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    style={{
                      padding: "0.75rem 2rem",
                      background: "#ef4444ff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      cursor: "pointer"
                    }}
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateY;