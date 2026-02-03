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
      case "summary": return <Sparkles size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "experience": return <Briefcase size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "education": return <GraduationCap size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "skills": return <Zap size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "languages": return <BookOpen size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "interests": return <Activity size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "projects": return <Code size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "certifications": return <Award size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      case "achievements": return <Trophy size={18} style={{ marginRight: "0.6rem", color: ACCENT_COLOR }} />;
      default: return null;
    }
  };

  // --- FIXED: renderArrayItem now returns a DIV instead of an LI to avoid nesting errors ---
  const renderArrayItem = (item, sectionKey) => {
    if (typeof item === "string") {
      return (
        <div key={item} style={{ marginBottom: "0.5rem", position: "relative", paddingLeft: "1.2rem" }}>
          <span style={{ position: "absolute", left: "0", color: ACCENT_COLOR, fontSize: "0.8rem" }}>&#9679;</span>
          {item}
        </div>
      );
    }

    if (typeof item === "object") {
      const title = item.title || item.degree || 'Untitled';
      const secondaryDetail = item.company || item.institution || item.client;
      const tertiaryDetail = item.duration || item.date;
      const description = item.description || item.details;
      const detailsArray = [secondaryDetail, tertiaryDetail].filter(Boolean);

      return (
        <div key={title} style={{ marginBottom: "1.5rem", borderLeft: `2px solid ${SECTION_HEADER_BG}`, paddingLeft: "1rem" }}>
          <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: ACCENT_COLOR, fontFamily: FONT_HEADER }}>
            {title}
          </h4>
          <p style={{ margin: "0.2rem 0 0.5rem 0", fontSize: "0.95rem", color: PRIMARY_TEXT_COLOR, fontWeight: "500" }}>
            {detailsArray.join(" | ")}
          </p>
          {description && (
            <div style={{ paddingLeft: "0.5rem", lineHeight: "1.6", margin: 0, fontSize: "0.9rem" }}>
                {Array.isArray(description) ? (
                    <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                        {description.map((bullet, i) => (
                            <li key={i} style={{ position: "relative", paddingLeft: "1.2rem", marginBottom: "0.2rem" }}>
                                 <span style={{ position: "absolute", left: "0", color: ACCENT_COLOR }}>&ndash;</span>
                                 {bullet}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ margin: 0 }}>{description}</p>
                )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: LIGHT_BACKGROUND }}>
      {/* Pass resumeRef to Navbar and Sidebar for functional Download/AI */}
      <Navbar resumeRef={resumeRef} />
      <div style={{ display: "flex" }}>
        <Sidebar resumeRef={resumeRef} />
        <div style={{ flexGrow: 1, padding: "2.5rem", display: "flex", justifyContent: "center" }}>
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#ffffff",
              width: "100%",
              maxWidth: "800px",
              padding: "4rem", 
              borderRadius: "4px", // More professional for templates
              border: "1px solid #e0e0e0",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
              fontFamily: FONT_BODY,
              color: PRIMARY_TEXT_COLOR,
            }}
          >
            {/* HEADER */}
            <div style={{ marginBottom: "3rem", textAlign: "center", borderBottom: `3px solid ${ACCENT_COLOR}`, paddingBottom: "1.5rem" }}>
              {editMode ? (
                <>
                  <input type="text" value={localData.name} onChange={(e) => handleFieldChange("name", e.target.value)} style={{ fontSize: "2.5rem", width: "100%", textAlign: "center", fontWeight: "900", fontFamily: FONT_HEADER, border: "1px solid #ccc" }} />
                  <input type="text" value={localData.role} onChange={(e) => handleFieldChange("role", e.target.value)} style={{ fontSize: "1.2rem", width: "100%", textAlign: "center", color: ACCENT_COLOR, border: "1px solid #ccc", marginTop: "10px" }} />
                </>
              ) : (
                <>
                  <h1 style={{ fontSize: "3rem", margin: 0, fontWeight: "900", textTransform: "uppercase", letterSpacing: "2px", color: PRIMARY_TEXT_COLOR, fontFamily: FONT_HEADER }}>
                    {resumeData.name}
                  </h1>
                  <h2 style={{ fontSize: "1.3rem", marginTop: "0.5rem", color: ACCENT_COLOR, fontWeight: "600", fontFamily: FONT_HEADER }}>
                    {resumeData.role}
                  </h2>
                </>
              )}

              <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1rem", fontSize: "0.9rem" }}>
                {resumeData.email && <span style={{ whiteSpace: "nowrap" }}><Mail size={14} style={{ color: ACCENT_COLOR, marginRight: "4px" }} /> {resumeData.email}</span>}
                {resumeData.phone && <span style={{ whiteSpace: "nowrap" }}><Phone size={14} style={{ color: ACCENT_COLOR, marginRight: "4px" }} /> {resumeData.phone}</span>}
                {resumeData.location && <span style={{ whiteSpace: "nowrap" }}><MapPin size={14} style={{ color: ACCENT_COLOR, marginRight: "4px" }} /> {resumeData.location}</span>}
              </div>
            </div>

            {/* SECTIONS */}
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
              if (!resumeData[section.key] || (Array.isArray(resumeData[section.key]) && resumeData[section.key].length === 0)) return null;

              return (
                <div key={section.key} style={{ marginBottom: "2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", backgroundColor: SECTION_HEADER_BG, padding: "0.5rem 1rem", borderRadius: "4px", marginBottom: "1rem", borderLeft: `5px solid ${ACCENT_COLOR}` }}>
                    {getSectionIcon(section.key)}
                    <h3 style={{ fontWeight: "700", fontSize: "1.1rem", fontFamily: FONT_HEADER, margin: 0 }}>{section.label}</h3>
                  </div>
                  <div style={{ padding: "0 0.5rem" }}>
                    {editMode ? (
                        <textarea value={Array.isArray(localData[section.key]) ? localData[section.key].join("\n") : localData[section.key]} onChange={(e) => handleFieldChange(section.key, e.target.value)} style={{ width: "100%", padding: "10px", minHeight: "100px" }} />
                    ) : (
                      Array.isArray(resumeData[section.key]) ? (
                        <div style={{ listStyleType: "none", padding: 0 }}>
                          {resumeData[section.key].map((item, idx) => (
                             <div key={idx}>{renderArrayItem(item, section.key)}</div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ lineHeight: "1.6", margin: 0 }}>{resumeData[section.key]}</p>
                      )
                    )}
                  </div>
                </div>
              );
            })}

            {/* EDIT CONTROLS */}
            <div className="hide-in-pdf" style={{ textAlign: "center", marginTop: "2rem" }}>
              {editMode ? (
                <>
                  <button onClick={handleSave} style={{ background: ACCENT_COLOR, color: "white", padding: "0.5rem 1rem", borderRadius: "4px", marginRight: "10px", cursor: "pointer", border: "none" }}>Save</button>
                  <button onClick={handleCancel} style={{ background: "#6c757d", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer", border: "none" }}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)} style={{ background: ACCENT_COLOR, color: "white", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer", border: "none" }}>Edit Details</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template30;