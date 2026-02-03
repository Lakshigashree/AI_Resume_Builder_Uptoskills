import { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Zap,
  BookOpen,
  Code,
  Award,
  Trophy,
  Activity,
} from "lucide-react";

const Template30 = () => {
  const resumeRef = useRef(null);
  const { resumeData, setResumeData } = useResume();
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData);

  // --- Constants for Enhanced Styling (Deep Teal/Navy) ---
  const ACCENT_COLOR = "#004d40";
  const PRIMARY_TEXT_COLOR = "#343a40";
  const LIGHT_BACKGROUND = "#f4f7f6";
  const SECTION_HEADER_BG = "#eaf3f2";
  const FONT_HEADER = "Merriweather, serif";
  const FONT_BODY = "Lato, sans-serif";

  useEffect(() => {
    setLocalData(resumeData);
  }, [resumeData]);

  const handleFieldChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    const updated = [...localData[section]];
    if (key) updated[index][key] = value;
    else updated[index] = value;
    setLocalData({ ...localData, [section]: updated });
  };

  const handleSave = () => {
    setResumeData(localData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalData(resumeData);
    setEditMode(false);
  };

  const getSectionIcon = (key) => {
    switch (key) {
      case "summary":
        return <Sparkles size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "experience":
        return <Briefcase size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "education":
        return <GraduationCap size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "skills":
        return <Zap size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "languages":
        return <BookOpen size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "interests":
        return <Activity size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "projects":
        return <Code size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "certifications":
        return <Award size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "achievements":
        return <Trophy size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      default:
        return null;
    }
  };

  const sectionTitleContainerStyle = {
    display: "flex",
    alignItems: "center",
    backgroundColor: SECTION_HEADER_BG,
    padding: "0.7rem 1.2rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    borderLeft: `6px solid ${ACCENT_COLOR}`,
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  };

  const sectionTitleStyle = {
    fontWeight: "700",
    fontSize: "1.3rem",
    letterSpacing: "1px",
    fontFamily: FONT_HEADER,
    color: PRIMARY_TEXT_COLOR,
    margin: 0,
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "0",
    marginBottom: "2.5rem",
  };

  const contactIconStyle = {
    color: ACCENT_COLOR,
    marginRight: "0.5rem",
    verticalAlign: "middle",
  };

  const renderArrayItem = (item, sectionKey) => {
    // Case 1: Item is a simple string (e.g., skills, languages)
    if (typeof item === "string") {
      return (
        <li key={item} style={{ marginBottom: "0.5rem", position: "relative", paddingLeft: "1rem" }}>
          <span
            style={{
              position: "absolute",
              left: "0",
              color: ACCENT_COLOR,
              fontSize: "0.6rem",
              lineHeight: "1.2",
            }}
          >
            &#9679;
          </span>
          {item}
        </li>
      );
    }

    // Case 2: Item is a complex object (e.g., experience, education, projects)
    if (typeof item === "object") {
      const title = item.title || item.degree || 'Untitled';
      const secondaryDetail = item.company || item.institution || item.client;
      const tertiaryDetail = item.duration || item.date;
      const description = item.description || item.details;

      const detailsArray = [secondaryDetail, tertiaryDetail].filter(Boolean);

      return (
        <div key={title} style={{ marginBottom: "1.5rem", borderLeft: `2px solid ${SECTION_HEADER_BG}`, paddingLeft: "1rem" }}>
          <h4 style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: "700",
            color: ACCENT_COLOR,
            fontFamily: FONT_HEADER
          }}>
            {title}
          </h4>

          <p style={{
            margin: "0.2rem 0 0.5rem 0",
            fontSize: "0.95rem",
            color: PRIMARY_TEXT_COLOR,
            fontWeight: "500"
          }}>
            {detailsArray.join(" | ")}
          </p>

          {/* Rendering the description/details */}
          {description && (
            <ul style={{ paddingLeft: "1rem", lineHeight: "1.6", margin: 0, fontSize: "0.9rem" }}>
              {/* Check if description is an array of bullet points or a single string */}
              {Array.isArray(description) ? (
                description.map((bullet, i) => (
                  <li key={i} style={{ position: "relative", paddingLeft: "1rem", marginBottom: "0.2rem" }}>
                    <span style={{ position: "absolute", left: "0", color: ACCENT_COLOR, fontSize: "0.8rem", lineHeight: "1.2" }}>&ndash;</span>
                    {bullet}
                  </li>
                ))
              ) : (
                <p style={{ margin: 0 }}>{description}</p>
              )}
            </ul>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: LIGHT_BACKGROUND }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resume={resumeData} />
        <div
          style={{
            flexGrow: 1,
            padding: "2.5rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#ffffff",
              width: "100%",
              maxWidth: "750px", // REDUCED MAX WIDTH
              padding: "4rem",
              borderRadius: "16px",
              border: "1px solid #e0e0e0",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
              fontFamily: FONT_BODY,
              color: PRIMARY_TEXT_COLOR,
            }}
          >
            {/* HEADER */}
            <div
              style={{
                marginBottom: "3rem",
                textAlign: "center",
                borderBottom: `3px solid ${ACCENT_COLOR}`,
                paddingBottom: "1.5rem",
              }}
            >
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={localData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    style={{
                      fontSize: "3.5rem",
                      width: "100%",
                      textAlign: "center",
                      fontWeight: "900",
                      marginBottom: "0.5rem",
                      color: PRIMARY_TEXT_COLOR,
                      fontFamily: FONT_HEADER,
                      border: "1px solid #ccc",
                    }}
                  />
                  <input
                    type="text"
                    value={localData.role}
                    onChange={(e) => handleFieldChange("role", e.target.value)}
                    style={{
                      fontSize: "1.5rem",
                      width: "100%",
                      textAlign: "center",
                      color: ACCENT_COLOR,
                      fontWeight: "500",
                      fontFamily: FONT_HEADER,
                      border: "1px solid #ccc",
                    }}
                  />
                </>
              ) : (
                <>
                  <h1
                    style={{
                      fontSize: "3.5rem",
                      margin: 0,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: "4px",
                      color: PRIMARY_TEXT_COLOR,
                      fontFamily: FONT_HEADER,
                    }}
                  >
                    {resumeData.name}
                  </h1>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      marginTop: "0.5rem",
                      color: ACCENT_COLOR,
                      fontWeight: "600",
                      fontFamily: FONT_HEADER,
                    }}
                  >
                    {resumeData.role}
                  </h2>
                </>
              )}

              {/* Contact Information - ENSURING SINGLE LINE DISPLAY */}
              <div
                style={{
                  marginTop: "2rem",
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "nowrap", // Added 'nowrap' to discourage wrapping
                  gap: "1.5rem",
                  color: PRIMARY_TEXT_COLOR,
                  fontSize: "1rem",
                }}
              >
                {/* Contact items use inline spans to ensure they stay on one line */}
                {resumeData.email && (
                  <span style={{ whiteSpace: "nowrap" }}>
                    <Mail size={16} style={contactIconStyle} />{" "}
                    {resumeData.email}
                  </span>
                )}
                {resumeData.phone && (
                  <span style={{ whiteSpace: "nowrap" }}>
                    <Phone size={16} style={contactIconStyle} />{" "}
                    {resumeData.phone}
                  </span>
                )}
                {resumeData.location && (
                  <span style={{ whiteSpace: "nowrap" }}>
                    <MapPin size={16} style={contactIconStyle} />{" "}
                    {resumeData.location}
                  </span>
                )}
                {/* Links */}
                {resumeData.linkedin && (
                  <span style={{ whiteSpace: "nowrap" }}>
                    <Globe size={16} style={contactIconStyle} />{" "}
                    <a
                      href={resumeData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: ACCENT_COLOR, textDecoration: "none", fontWeight: "600" }}
                    >
                      LinkedIn
                    </a>
                  </span>
                )}
                {resumeData.github && (
                  <span style={{ whiteSpace: "nowrap" }}>
                    <Globe size={16} style={contactIconStyle} />{" "}
                    <a
                      href={resumeData.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: ACCENT_COLOR, textDecoration: "none", fontWeight: "600" }}
                    >
                      GitHub
                    </a>
                  </span>
                )}
                {resumeData.portfolio && (
                  <span style={{ whiteSpace: "nowrap" }}>
                    <Globe size={16} style={contactIconStyle} />{" "}
                    <a
                      href={resumeData.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: ACCENT_COLOR, textDecoration: "none", fontWeight: "600" }}
                    >
                      Portfolio
                    </a>
                  </span>
                )}
              </div>
            </div>

            {/* SECTIONS (Omitted for brevity) */}
            {[
              { key: "summary", label: "Professional Summary" },
              { key: "experience", label: "Professional Experience" },
              { key: "education", label: "Education" },
              { key: "skills", label: "Technical Skills" },
              { key: "projects", label: "Key Projects" },
              { key: "certifications", label: "Certifications" },
              { key: "achievements", label: "Awards & Achievements" },
              { key: "languages", label: "Languages" },
              { key: "interests", label: "Interests" },
            ].map((section) => {
              if (
                !resumeData[section.key] ||
                (Array.isArray(resumeData[section.key]) &&
                  resumeData[section.key].length === 0)
              ) {
                return null;
              }

              return (
                <div key={section.key} style={cardStyle}>
                  <div style={sectionTitleContainerStyle}>
                    {getSectionIcon(section.key)}
                    <h3 style={sectionTitleStyle}>{section.label}</h3>
                  </div>
                  <div style={{ padding: "0 1.2rem", fontSize: "0.95rem" }}>
                    {editMode ? (
                      // === EDIT MODE === 
                      <>
                        {Array.isArray(localData[section.key]) ? (
                          localData[section.key].map((item, i) => (
                            <input
                              key={i}
                              value={
                                typeof item === "string"
                                  ? item
                                  : Object.values(item).join(" | ")
                              }
                              onChange={(e) =>
                                handleArrayFieldChange(
                                  section.key,
                                  i,
                                  null,
                                  e.target.value
                                )
                              }
                              style={{
                                width: "100%",
                                padding: "0.5rem",
                                marginBottom: "0.5rem",
                                border: "1px solid #ccc",
                              }}
                            />
                          ))
                        ) : (
                          <textarea
                            value={localData[section.key]}
                            onChange={(e) =>
                              handleFieldChange(section.key, e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "0.8rem",
                              minHeight: "100px",
                              border: "1px solid #ccc",
                            }}
                          />
                        )}
                      </>
                    ) : (
                      // === VIEW MODE ===
                      <>
                        {Array.isArray(resumeData[section.key]) ? (
                          <ul style={{ paddingLeft: 0, listStyleType: "none" }}>
                            {resumeData[section.key].map((item, idx) => (
                              <li key={idx} style={{ marginBottom: "1rem" }}>
                                {renderArrayItem(item, section.key)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ lineHeight: "1.7", color: PRIMARY_TEXT_COLOR }}>
                            {resumeData[section.key]}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* BUTTONS (Unchanged) */}
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    style={{
                      background: ACCENT_COLOR,
                      color: "white",
                      padding: "0.7rem 1.4rem",
                      borderRadius: "8px",
                      marginRight: "1rem",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      background: "#6c757d",
                      color: "white",
                      padding: "0.7rem 1.4rem",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Cancel Edit
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: ACCENT_COLOR,
                    color: "white",
                    padding: "0.7rem 1.4rem",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Edit Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template30;