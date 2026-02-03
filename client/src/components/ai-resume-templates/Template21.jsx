import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import resumeService from "../../services/resumeService";
import { toast } from "react-toastify";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaLinkedin,
  FaMapMarkerAlt,
  FaGithub,
  FaGlobe,
} from "react-icons/fa";

const Template21 = () => {
  const resumeRef = useRef(null);
  const { resumeData, updateResumeData } = useResume();
  const { isAuthenticated, getToken } = useAuth?.() || {};
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    setLocalData(resumeData || {});
  }, [resumeData]);
  useEffect(() => {
    const sanitizeArrayOfObjects = (arr, keysToCheck = []) => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((item) => {
          if (!item || (typeof item === "object" && Object.keys(item).length === 0)) return false;
          // if item is a string
          if (typeof item === "string") return item.trim() !== "";
          // if object - check important keys (if provided), otherwise check any meaningful value
          if (keysToCheck.length > 0) {
            return keysToCheck.some((k) => {
              const v = item[k];
              if (typeof v === "string") return v.trim() !== "" && !/^-+$/.test(v.trim());
              if (Array.isArray(v)) return v.some((x) => typeof x === "string" ? x.trim() !== "" : !!x);
              return !!v;
            });
          }
          // fallback: keep the object if any meaningful value exists
          return Object.values(item).some((v) => {
            if (typeof v === "string") return v.trim() !== "" && !/^-+$/.test(v.trim());
            if (Array.isArray(v)) return v.some((x) => typeof x === "string" ? x.trim() !== "" : !!x);
            return !!v;
          });
        })
        .map((it) => (typeof it === "object" ? it : it));
    };

    const sanitized = { ...(resumeData || {}) };

    // sanitize common array sections
    sanitized.experience = sanitizeArrayOfObjects(sanitized.experience, ["title", "companyName", "date", "companyLocation"]);
    sanitized.education = sanitizeArrayOfObjects(sanitized.education, ["degree", "institution"]);
    sanitized.projects = sanitizeArrayOfObjects(sanitized.projects, ["name", "description"]);
    sanitized.skills = Array.isArray(sanitized.skills) ? sanitized.skills.filter(s => typeof s === "string" && s.trim() !== "") : [];
    sanitized.languages = Array.isArray(sanitized.languages) ? sanitized.languages.filter(s => typeof s === "string" && s.trim() !== "") : [];
    sanitized.interests = Array.isArray(sanitized.interests) ? sanitized.interests.filter(s => typeof s === "string" && s.trim() !== "") : [];

    setLocalData(sanitized);
  }, [resumeData]);

  // ---------- SECTION VISIBILITY HELPERS ----------
  const hasNonEmptyArrayOfStrings = (arr) =>
    Array.isArray(arr) &&
    arr.some((item) => typeof item === "string" && item.trim() !== "");

  const hasSkills = (data) => hasNonEmptyArrayOfStrings(data?.skills);
  const hasLanguages = (data) => hasNonEmptyArrayOfStrings(data?.languages);
  const hasInterests = (data) => hasNonEmptyArrayOfStrings(data?.interests);

  const hasEducation = (data) =>
    Array.isArray(data?.education) &&
    data.education.some(
      (edu) =>
        edu &&
        (edu.degree || edu.institution || edu.duration || edu.location)
    );

  const isMeaningfulString = (s) =>
    typeof s === "string" && s.trim() !== "" && !/^-+$/.test(s.trim());

  const nonEmptyArray = (arr) =>
    Array.isArray(arr) && arr.some((it) => {
      if (typeof it === "string") return isMeaningfulString(it);
      if (typeof it === "object" && it !== null) {
        // check for object with at least one meaningful field
        return Object.values(it).some((v) => {
          if (typeof v === "string") return isMeaningfulString(v);
          if (Array.isArray(v)) return v.some((x) => isMeaningfulString(x));
          return !!v;
        });
      }
      return !!it;
    });

  const hasExperience = (data) =>
    Array.isArray(data?.experience) &&
    data.experience.some((exp) => {
      if (!exp || (typeof exp === "object" && Object.keys(exp).length === 0)) return false;
      return (
        isMeaningfulString(exp.title) ||
        isMeaningfulString(exp.companyName) ||
        (isMeaningfulString(exp.date)) ||
        isMeaningfulString(exp.companyLocation) ||
        (Array.isArray(exp.accomplishment) && exp.accomplishment.some((a) => isMeaningfulString(a)))
      );
    });


  const hasProjects = (data) =>
    Array.isArray(data?.projects) &&
    data.projects.some(
      (project) =>
        project &&
        (project.name ||
          project.description ||
          (Array.isArray(project.technologies) &&
            project.technologies.length > 0) ||
          project.link ||
          project.github)
    );

  const hasSummary = (data) =>
    typeof data?.summary === "string" && data.summary.trim() !== "";

  // ---------- FIELD HANDLERS ----------
  const handleFieldChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    try {
      localStorage.setItem("resumeData", JSON.stringify(updatedData));
    } catch (e) {
      // ignore storage errors
    }
  };

  const handleArrayFieldChange = (field, index, value) => {
    setLocalData((prev) => {
      const arr = Array.isArray(prev[field]) ? [...prev[field]] : [];
      while (arr.length <= index) arr.push({});
      arr[index] = { ...arr[index], ...value };
      return { ...prev, [field]: arr };
    });
  };

  // ---------- SAVE (updates context/localStorage and persists to backend when authenticated) ----------
  const handleSave = async () => {
    // small logs to help debugging
    console.log("handleSave invoked. isAuthenticated:", isAuthenticated);
    console.log("localData (pre-normalize):", localData);

    const normalize = (data) => {
      const out = { ...data };

      const splitChunks = (text) => {
        if (!text || typeof text !== "string") return [];
        const parts = text
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean);
        if (parts.length === 0) {
          const single = text
            .split(/\n/)
            .map((p) => p.trim())
            .filter(Boolean);
          return single.map((s) => s);
        }
        return parts;
      };

      // Education parsing
      try {
        if (Array.isArray(out.education) && out.education.length === 1) {
          const raw = out.education[0].degree || "";
          const chunks = splitChunks(raw);
          if (chunks.length > 1) {
            out.education = chunks.map((chunk) => {
              const lines = chunk
                .split(/\n+/)
                .map((l) => l.trim())
                .filter(Boolean);
              return {
                degree: lines[0] || "",
                institution: lines[1] || "",
                duration: lines[2] || "",
                location: lines[3] || "",
              };
            });
          }
        }
      } catch (e) { }

      // Experience parsing
      try {
        if (Array.isArray(out.experience) && out.experience.length === 1) {
          const raw = out.experience[0].title || "";
          const chunks = splitChunks(raw);
          if (chunks.length > 1) {
            out.experience = chunks.map((chunk) => {
              const lines = chunk
                .split(/\n+/)
                .map((l) => l.trim())
                .filter(Boolean);
              return {
                title: lines[0] || "",
                companyName: lines[1] || "",
                date:
                  lines[2] && lines[2].trim() !== "-"
                    ? lines[2].trim()
                    : "",
                companyLocation: lines[3] || "",
                accomplishment: lines.slice(4).filter(Boolean),
              };
            });
          }
        }
      } catch (e) { }

      // Projects parsing
      try {
        if (Array.isArray(out.projects) && out.projects.length === 1) {
          const raw = out.projects[0].name || "";
          const chunks = splitChunks(raw);
          if (chunks.length > 1) {
            out.projects = chunks.map((chunk) => {
              const lines = chunk
                .split(/\n+/)
                .map((l) => l.trim())
                .filter(Boolean);
              return {
                name: lines[0] || "",
                description: lines[1] || "",
                technologies: lines[2]
                  ? lines[2]
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                  : [],
                link: lines[3] || "",
                github: lines[4] || "",
              };
            });
          }
        }
      } catch (e) { }

      return out;
    };

    const normalized = normalize(localData);

    // 1) Update local context/storage for immediate UI responsiveness
    try {
      if (typeof updateResumeData === "function") {
        updateResumeData(normalized);
      } else {
        localStorage.setItem("resumeData", JSON.stringify(normalized));
      }
      setLocalData(normalized);
    } catch (err) {
      console.error("Error updating local context/storage:", err);
      toast.error("Failed to update local resume preview.");
    }

    // 2) If not authenticated, only local save
    if (!isAuthenticated) {
      setSaveStatus("Saved locally");
      setTimeout(() => setSaveStatus(""), 3000);
      setEditMode(false);
      return;
    }

    // 3) Authenticated: save to backend
    setIsSaving(true);
    setSaveStatus("Saving to server...");
    try {
      const structuredData = {
        templateId: 21,
        personalInfo: {
          name: normalized.name || "",
          role: normalized.role || "",
          email: normalized.email || "",
          phone: normalized.phone || "",
          location: normalized.location || "",
          linkedin: normalized.linkedin || "",
          github: normalized.github || "",
          portfolio: normalized.portfolio || "",
          profileImage: normalized.profileImage || "",
        },
        summary: normalized.summary || "",
        skills: normalized.skills || [],
        experience: normalized.experience || [],
        education: normalized.education || [],
        projects: normalized.projects || [],
        certifications: normalized.certifications || [],
        achievements: normalized.achievements || [],
        interests: normalized.interests || [],
        languages: normalized.languages || [],
      };

      console.log("structuredData being sent to server:", structuredData);

      const token =
        typeof getToken === "function" ? await getToken() : null;

      const result = await resumeService.saveResumeData(structuredData, token);

      console.log("server response from saveResumeData:", result);

      if (result?.success) {
        toast.success("Saved to database");
        setSaveStatus("Saved to database");

        // IMPORTANT: map server response to the client shape if needed
        let finalData = normalized; // default to our normalized data

        if (result.data) {
          // If backend returns nested structure like { personalInfo: {...}, ... }
          if (result.data.personalInfo) {
            const p = result.data.personalInfo;
            finalData = {
              name: p.name || normalized.name || "",
              role: p.role || normalized.role || "",
              email: p.email || normalized.email || "",
              phone: p.phone || normalized.phone || "",
              location: p.location || normalized.location || "",
              linkedin: p.linkedin || normalized.linkedin || "",
              github: p.github || normalized.github || "",
              portfolio: p.portfolio || normalized.portfolio || "",
              profileImage: p.profileImage || normalized.profileImage || "",
              // other top-level arrays — prefer server values if present otherwise normalized
              summary: result.data.summary ?? normalized.summary ?? "",
              skills: Array.isArray(result.data.skills) ? result.data.skills : (normalized.skills || []),
              experience: Array.isArray(result.data.experience) ? result.data.experience : (normalized.experience || []),
              education: Array.isArray(result.data.education) ? result.data.education : (normalized.education || []),
              projects: Array.isArray(result.data.projects) ? result.data.projects : (normalized.projects || []),
              certifications: Array.isArray(result.data.certifications) ? result.data.certifications : (normalized.certifications || []),
              achievements: Array.isArray(result.data.achievements) ? result.data.achievements : (normalized.achievements || []),
              interests: Array.isArray(result.data.interests) ? result.data.interests : (normalized.interests || []),
              languages: Array.isArray(result.data.languages) ? result.data.languages : (normalized.languages || []),
            };
          } else {
            // If server returned the same flat shape expected by client, use it
            finalData = { ...normalized, ...result.data };
          }
        }

        // Apply finalData to context and local state
        try {
          if (typeof updateResumeData === "function") updateResumeData(finalData);
          setLocalData(finalData);
        } catch (e) {
          console.warn("Could not update context with server data, using normalized", e);
          // keep normalized in local state (already set)
        }

        // close editor now that save succeeded
        setEditMode(false);
      } else {
        // server reported failure — keep edit mode open so user can retry
        const errMsg = result?.error || "Server save failed";
        toast.error("Failed to save to server: " + errMsg);
        setSaveStatus("Server save failed: " + errMsg);
        setEditMode(true);
      }
    } catch (err) {
      console.error("Error saving resume to server:", err);
      toast.error("Error saving to server");
      setSaveStatus("Error saving to server");
      // keep edit mode open
      setEditMode(true);
    } finally {
      setIsSaving(false);
      // clear status after a bit but leave edit mode alone (handled above)
      setTimeout(() => setSaveStatus(""), 4000);
    }
  };


  const handleCancel = () => {
    setLocalData(resumeData || {});
    setEditMode(false);
    setSaveStatus("");
  };

  const handleEnhance = () => { };

  const addArrayItem = (field, item = {}) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: Array.isArray(prev[field]) ? [...prev[field], item] : [item],
    }));
  };

  const sectionTitleStyle = {
    fontWeight: "bold",
    fontSize: "1.1rem",
    borderBottom: "2px solid #87CEEB",
    color: "#000000",
    marginTop: "1rem",
    paddingBottom: "0.25rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };

  const sectionCardStyle = {
    backgroundColor: "#f8f9fa",
    padding: "0.8rem",
    borderRadius: "0.5rem",
    marginTop: "0.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e9ecef",
  };

  const leftSectionCardStyle = {
    backgroundColor: "#f8f9fa",
    padding: "0.8rem",
    borderRadius: "0.5rem",
    marginTop: "0.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e9ecef",
  };

  const headerStyle = {
    backgroundColor: "#E6F3FF",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
    border: "1px solid #87CEEB",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
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
            className="resume-page"
            style={{
              maxWidth: "793px",
              width: "100%",
              minHeight: "1123px",
              maxHeight: "1123px",
              padding: "1.5rem",
              backgroundColor: "#ffffff",
              color: "#000000",
              boxSizing: "border-box",
              pageBreakAfter: "always",
              pageBreakInside: "avoid",
              overflowY: "auto",
              overflowX: "hidden",
              border: "none",
            }}
          >
            {/* HEADER */}
            <div style={headerStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1.5rem",
                }}
              >
                {/* Left - Profile Image */}
                <div style={{ flexShrink: 0 }}>
                  {editMode ? (
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: "120px",
                          height: "120px",
                          border: "2px dashed #87CEEB",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "0.5rem",
                          cursor: "pointer",
                          backgroundColor: "#f8f9fa",
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const items = e.clipboardData.items;
                          for (let i = 0; i < items.length; i++) {
                            if (items[i].type.indexOf("image") !== -1) {
                              const file = items[i].getAsFile();
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                handleFieldChange("profileImage", ev.target.result);
                              };
                              reader.readAsDataURL(file);
                              break;
                            }
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const files = e.dataTransfer.files;
                          if (
                            files.length > 0 &&
                            files[0].type.startsWith("image/")
                          ) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              handleFieldChange("profileImage", ev.target.result);
                            };
                            reader.readAsDataURL(files[0]);
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        title="Paste image (Ctrl+V) or drag & drop image here"
                      >
                        {localData.profileImage ? (
                          <img
                            src={localData.profileImage}
                            alt="Profile Preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{ textAlign: "center", color: "#87CEEB" }}
                          >
                            <div
                              style={{ fontSize: "2rem", marginBottom: "0.25rem" }}
                            >
                              📷
                            </div>
                            <div style={{ fontSize: "0.75rem" }}>Paste Image</div>
                          </div>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          margin: 0,
                        }}
                      >
                        Paste image (Ctrl+V) or drag & drop
                      </p>
                    </div>
                  ) : (
                    <>
                      {localData.profileImage && (
                        <img
                          src={localData.profileImage}
                          alt="Profile"
                          style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "3px solid #87CEEB",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Center - Name and Role */}
                <div style={{ flex: 1, textAlign: "center" }}>
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={localData.name || ""}
                        onChange={(e) =>
                          handleFieldChange("name", e.target.value)
                        }
                        style={{
                          fontSize: "2rem",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          textAlign: "center",
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          color: "#000000",
                          marginBottom: "0.5rem",
                        }}
                        placeholder="Your Name"
                      />
                      <input
                        type="text"
                        value={localData.role || ""}
                        onChange={(e) =>
                          handleFieldChange("role", e.target.value)
                        }
                        style={{
                          fontSize: "1.1rem",
                          color: "#000000",
                          textAlign: "center",
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          marginBottom: "0.5rem",
                        }}
                        placeholder="Your Role (e.g., Full Stack Developer)"
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
                            color: "#000000",
                            margin: "0 0 0.5rem 0",
                          }}
                        >
                          {resumeData.name}
                        </h1>
                      )}
                      {resumeData.role && (
                        <h2
                          style={{
                            fontSize: "1.1rem",
                            color: "#000000",
                            margin: "0 0 0.5rem 0",
                          }}
                        >
                          {resumeData.role}
                        </h2>
                      )}
                    </>
                  )}

                  {/* Contact Information */}
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#000000",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {editMode ? (
                      <>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            alignItems: "center",
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <FaPhoneAlt color="#87CEEB" size="12" />
                            <input
                              type="text"
                              value={localData.phone || ""}
                              onChange={(e) =>
                                handleFieldChange("phone", e.target.value)
                              }
                              style={{
                                border: "none",
                                background: "transparent",
                                fontSize: "0.85rem",
                                color: "#000000",
                                width: "100px",
                                textAlign: "center",
                              }}
                              placeholder="Phone"
                            />
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <FaEnvelope color="#87CEEB" size="12" />
                            <input
                              type="text"
                              value={localData.email || ""}
                              onChange={(e) =>
                                handleFieldChange("email", e.target.value)
                              }
                              style={{
                                border: "none",
                                background: "transparent",
                                fontSize: "0.85rem",
                                color: "#000000",
                                width: "120px",
                                textAlign: "center",
                              }}
                              placeholder="Email"
                            />
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <FaLinkedin color="#87CEEB" size="12" />
                            <input
                              type="text"
                              value={localData.linkedin || ""}
                              onChange={(e) =>
                                handleFieldChange("linkedin", e.target.value)
                              }
                              style={{
                                border: "none",
                                background: "transparent",
                                fontSize: "0.85rem",
                                color: "#000000",
                                width: "130px",
                                textAlign: "center",
                              }}
                              placeholder="LinkedIn"
                            />
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <FaMapMarkerAlt color="#87CEEB" size="12" />
                            <input
                              type="text"
                              value={localData.location || ""}
                              onChange={(e) =>
                                handleFieldChange("location", e.target.value)
                              }
                              style={{
                                border: "none",
                                background: "transparent",
                                fontSize: "0.85rem",
                                color: "#000000",
                                width: "80px",
                                textAlign: "center",
                              }}
                              placeholder="Location"
                            />
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: "0.35rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <FaGithub color="#87CEEB" size="12" />
                            <input
                              type="text"
                              value={localData.github || ""}
                              onChange={(e) =>
                                handleFieldChange("github", e.target.value)
                              }
                              style={{
                                border: "none",
                                background: "transparent",
                                fontSize: "0.85rem",
                                color: "#000000",
                                width: "160px",
                                textAlign: "center",
                              }}
                              placeholder="GitHub"
                            />
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <FaGlobe color="#87CEEB" size="12" />
                            <input
                              type="text"
                              value={localData.portfolio || ""}
                              onChange={(e) =>
                                handleFieldChange("portfolio", e.target.value)
                              }
                              style={{
                                border: "none",
                                background: "transparent",
                                fontSize: "0.85rem",
                                color: "#000000",
                                width: "160px",
                                textAlign: "center",
                              }}
                              placeholder="Website"
                            />
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "center",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          {resumeData.phone && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <FaPhoneAlt color="#87CEEB" size="12" />{" "}
                              {resumeData.phone}
                            </span>
                          )}
                          {resumeData.email && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <FaEnvelope color="#87CEEB" size="12" />{" "}
                              {resumeData.email}
                            </span>
                          )}
                          {resumeData.linkedin && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <FaLinkedin color="#87CEEB" size="12" />{" "}
                              <a href={resumeData.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{resumeData.linkedin}</a>
                            </span>
                          )}
                          {resumeData.location && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <FaMapMarkerAlt color="#87CEEB" size="12" />{" "}
                              {resumeData.location}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: "0.35rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {resumeData.github && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <FaGithub color="#87CEEB" size="12" />{" "}
                              <a href={resumeData.github} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{resumeData.github}</a>
                            </span>
                          )}
                          {resumeData.portfolio && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <FaGlobe color="#87CEEB" size="12" />{" "}
                              <a href={resumeData.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{resumeData.portfolio}</a>
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {/* Left Column */}
              <div style={{ width: "35%" }}>
                {/* SKILLS SECTION */}
                {(editMode || hasSkills(resumeData)) && (
                  <div>
                    <h3 style={sectionTitleStyle}>Skills & Technologies</h3>
                    <div style={leftSectionCardStyle}>
                      {editMode ? (
                        <textarea
                          value={
                            Array.isArray(localData.skills)
                              ? localData.skills.join(", ")
                              : localData.skills || ""
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              "skills",
                              e.target.value
                                .split(",")
                                .map((skill) => skill.trim())
                                .filter(Boolean)
                            )
                          }
                          style={{
                            width: "100%",
                            minHeight: "80px",
                            border: "none",
                            resize: "vertical",
                            fontFamily: "inherit",
                            fontSize: "0.85rem",
                            lineHeight: "1.3",
                            background: "transparent",
                          }}
                          placeholder="Enter your skills..."
                        />
                      ) : (
                        <>
                          {Array.isArray(resumeData.skills) &&
                            resumeData.skills.length > 0 && (
                              <ul
                                style={{
                                  margin: "0",
                                  paddingLeft: "1rem",
                                  fontSize: "0.85rem",
                                  lineHeight: "1.3",
                                }}
                              >
                                {resumeData.skills.map((skill, idx) => (
                                  <li
                                    key={idx}
                                    style={{ marginBottom: "0.5rem" }}
                                  >
                                    {skill}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* LANGUAGES SECTION */}
                {(editMode || hasLanguages(resumeData)) && (
                  <div style={{ marginTop: "0.8rem" }}>
                    <h3 style={sectionTitleStyle}>Languages</h3>
                    <div style={leftSectionCardStyle}>
                      {editMode ? (
                        <textarea
                          value={
                            Array.isArray(localData.languages)
                              ? localData.languages.join(", ")
                              : localData.languages || ""
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              "languages",
                              e.target.value
                                .split(",")
                                .map((lang) => lang.trim())
                                .filter(Boolean)
                            )
                          }
                          style={{
                            width: "100%",
                            minHeight: "50px",
                            border: "none",
                            resize: "vertical",
                            fontFamily: "inherit",
                            fontSize: "0.85rem",
                            lineHeight: "1.3",
                            background: "transparent",
                          }}
                          placeholder="Enter languages..."
                        />
                      ) : (
                        <>
                          {Array.isArray(resumeData.languages) &&
                            resumeData.languages.length > 0 && (
                              <ul
                                style={{
                                  margin: "0",
                                  paddingLeft: "1rem",
                                  fontSize: "0.85rem",
                                  lineHeight: "1.3",
                                }}
                              >
                                {resumeData.languages.map((lang, idx) => (
                                  <li
                                    key={idx}
                                    style={{ marginBottom: "0.5rem" }}
                                  >
                                    {lang}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* EDUCATION SECTION */}
                {(editMode || hasEducation(resumeData)) && (
                  <div style={{ marginTop: "0.8rem" }}>
                    <h3 style={sectionTitleStyle}>Education</h3>
                    {(editMode
                      ? Array.isArray(localData.education)
                        ? localData.education
                        : []
                      : resumeData.education || []
                    ).length > 0 ? (
                      <div style={sectionCardStyle}>
                        {(editMode
                          ? localData.education || []
                          : resumeData.education || []
                        ).map((edu, index) => (
                          <div key={index} style={{ marginBottom: "0.75rem" }}>
                            {editMode ? (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <input
                                    type="text"
                                    value={edu.degree || ""}
                                    onChange={(e) =>
                                      handleArrayFieldChange("education", index, {
                                        degree: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.95rem",
                                      fontWeight: "bold",
                                      border: "none",
                                      marginBottom: "0.3rem",
                                      background: "transparent",
                                    }}
                                    placeholder="Degree"
                                  />
                                  <input
                                    type="text"
                                    value={edu.institution || ""}
                                    onChange={(e) =>
                                      handleArrayFieldChange("education", index, {
                                        institution: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.85rem",
                                      color: "#000000",
                                      border: "none",
                                      marginBottom: "0.3rem",
                                      background: "transparent",
                                    }}
                                    placeholder="Institution"
                                  />
                                  <input
                                    type="text"
                                    value={edu.duration || ""}
                                    onChange={(e) =>
                                      handleArrayFieldChange("education", index, {
                                        duration: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.75rem",
                                      color: "#6b7280",
                                      border: "none",
                                      marginBottom: "0.3rem",
                                      background: "transparent",
                                    }}
                                    placeholder="Duration (e.g., 2016 - 2020)"
                                  />
                                  <input
                                    type="text"
                                    value={edu.location || ""}
                                    onChange={(e) =>
                                      handleArrayFieldChange("education", index, {
                                        location: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.75rem",
                                      color: "#6b7280",
                                      border: "none",
                                      background: "transparent",
                                    }}
                                    placeholder="Location"
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                {edu.degree && (
                                  <h4
                                    style={{
                                      margin: "0 0 0.2rem 0",
                                      fontSize: "0.95rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {edu.degree}
                                  </h4>
                                )}
                                {edu.institution && (
                                  <p
                                    style={{
                                      margin: "0 0 0.2rem 0",
                                      fontSize: "0.85rem",
                                      color: "#000000",
                                    }}
                                  >
                                    {edu.institution}
                                  </p>
                                )}
                                {(edu.duration || edu.location) && (
                                  <>
                                    {edu.duration && (
                                      <p
                                        style={{
                                          margin: "0 0 0.2rem 0",
                                          fontSize: "0.75rem",
                                          color: "#6b7280",
                                        }}
                                      >
                                        {edu.duration}
                                      </p>
                                    )}
                                    {edu.location && (
                                      <p
                                        style={{
                                          margin: "0",
                                          fontSize: "0.75rem",
                                          color: "#6b7280",
                                        }}
                                      >
                                        {edu.location}
                                      </p>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={sectionCardStyle}>
                        {editMode ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              alignItems: "center",
                            }}
                          >
                            <textarea
                              placeholder="Add your education details..."
                              value={
                                localData.education && localData.education[0]
                                  ? localData.education[0].degree || ""
                                  : ""
                              }
                              onChange={(e) => {
                                handleArrayFieldChange("education", 0, {
                                  degree: e.target.value,
                                });
                              }}
                              style={{
                                width: "100%",
                                minHeight: "60px",
                                border: "none",
                                resize: "vertical",
                                fontFamily: "inherit",
                                fontSize: "0.85rem",
                                lineHeight: "1.3",
                                background: "transparent",
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    )}
                    {editMode && (
                      <div style={{ marginTop: "0.25rem" }}>
                        <button
                          onClick={() =>
                            addArrayItem("education", {
                              degree: "",
                              institution: "",
                              duration: "",
                              location: "",
                            })
                          }
                          aria-label="Add education"
                          title="Add education"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#0875b8",
                            fontSize: "1.25rem",
                            lineHeight: "1",
                            cursor: "pointer",
                            padding: "0.15rem 0.4rem",
                          }}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* INTERESTS SECTION */}
                {(editMode || hasInterests(resumeData)) && (
                  <div style={{ marginTop: "0.8rem" }}>
                    <h3 style={sectionTitleStyle}>Interests</h3>
                    <div style={leftSectionCardStyle}>
                      {editMode ? (
                        <textarea
                          value={
                            Array.isArray(localData.interests)
                              ? localData.interests.join(", ")
                              : localData.interests || ""
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              "interests",
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            )
                          }
                          style={{
                            width: "100%",
                            minHeight: "50px",
                            border: "none",
                            resize: "vertical",
                            fontFamily: "inherit",
                            fontSize: "0.85rem",
                            lineHeight: "1.3",
                            background: "transparent",
                          }}
                          placeholder="Enter your interests (comma separated)..."
                        />
                      ) : (
                        <>
                          {Array.isArray(resumeData?.interests) &&
                            resumeData.interests.length > 0 && (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "0.85rem",
                                  color: "#000000",
                                  lineHeight: "1.3",
                                }}
                              >
                                {resumeData.interests.join(", ")}
                              </p>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div style={{ width: "65%" }}>
                {/* SUMMARY SECTION */}
                {(editMode || hasSummary(resumeData)) && (
                  <div>
                    <h3 style={sectionTitleStyle}>Professional Summary</h3>
                    <div style={sectionCardStyle}>
                      {editMode ? (
                        <textarea
                          value={localData.summary || ""}
                          onChange={(e) =>
                            handleFieldChange("summary", e.target.value)
                          }
                          style={{
                            width: "100%",
                            minHeight: "60px",
                            border: "none",
                            resize: "vertical",
                            fontFamily: "inherit",
                            fontSize: "0.85rem",
                            lineHeight: "1.3",
                            background: "transparent",
                          }}
                          placeholder="Enter your professional summary..."
                        />
                      ) : (
                        <>
                          {resumeData.summary && (
                            <p
                              style={{
                                margin: "0",
                                fontSize: "0.85rem",
                                lineHeight: "1.3",
                              }}
                            >
                              {resumeData.summary}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* EXPERIENCE SECTION */}
                {(editMode || hasExperience(resumeData)) && (
                  <div style={{ marginTop: "0.8rem" }}>
                    <h3 style={sectionTitleStyle}>Professional Experience</h3>
                    {(editMode
                      ? Array.isArray(localData.experience)
                        ? localData.experience
                        : []
                      : resumeData.experience || []
                    ).length > 0 ? (
                      <div style={sectionCardStyle}>
                        {(editMode
                          ? localData.experience || []
                          : resumeData.experience || []
                        ).map((exp, index) => (
                          <div key={index} style={{ marginBottom: "0.75rem" }}>
                            {editMode ? (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: "0.5rem",
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <input
                                    type="text"
                                    value={exp.title || ""}
                                    onChange={(e) =>
                                      handleArrayFieldChange("experience", index, {
                                        title: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.95rem",
                                      fontWeight: "bold",
                                      border: "none",
                                      marginBottom: "0.3rem",
                                      background: "transparent",
                                    }}
                                    placeholder="Job Title"
                                  />
                                  <input
                                    type="text"
                                    value={exp.companyName || ""}
                                    onChange={(e) =>
                                      handleArrayFieldChange("experience", index, {
                                        companyName: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.85rem",
                                      color: "#000000",
                                      border: "none",
                                      marginBottom: "0.3rem",
                                      background: "transparent",
                                    }}
                                    placeholder="Company Name"
                                  />
                                  <input
                                    type="text"
                                    value={
                                      typeof exp.date === "string" &&
                                        !/^-+$/.test(exp.date.trim())
                                        ? exp.date.trim()
                                        : ""
                                    }
                                    onChange={(e) =>
                                      handleArrayFieldChange("experience", index, {
                                        date: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.75rem",
                                      color: "#6b7280",
                                      border: "none",
                                      marginBottom: "0.3rem",
                                      background: "transparent",
                                    }}
                                    placeholder="Duration (e.g., 2020 - Present)"
                                  />
                                  <input
                                    type="text"
                                    value={exp.companyLocation || ""}
                                    onChange={(e) =>
                                      handleArrayFieldChange("experience", index, {
                                        companyLocation: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.75rem",
                                      color: "#6b7280",
                                      border: "none",
                                      marginBottom: "0.3rem",
                                      background: "transparent",
                                    }}
                                    placeholder="Company Location"
                                  />
                                  <textarea
                                    value={
                                      Array.isArray(exp.accomplishment)
                                        ? exp.accomplishment.join("\n")
                                        : exp.accomplishment || ""
                                    }
                                    onChange={(e) =>
                                      handleArrayFieldChange("experience", index, {
                                        accomplishment: e.target.value
                                          .split("\n")
                                          .filter((item) => item.trim()),
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      minHeight: "60px",
                                      border: "none",
                                      resize: "vertical",
                                      fontFamily: "inherit",
                                      fontSize: "0.8rem",
                                      lineHeight: "1.3",
                                      background: "transparent",
                                    }}
                                    placeholder="Describe your key accomplishments..."
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                {exp.title && (
                                  <h4
                                    style={{
                                      margin: "0 0 0.2rem 0",
                                      fontSize: "0.95rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {exp.title}
                                  </h4>
                                )}
                                {exp.companyName && (
                                  <p
                                    style={{
                                      margin: "0 0 0.2rem 0",
                                      fontSize: "0.85rem",
                                      color: "#000000",
                                    }}
                                  >
                                    {exp.companyName}
                                  </p>
                                )}
                                {(exp.date || exp.companyLocation) && (
                                  <p
                                    style={{
                                      margin: "0 0 0.3rem 0",
                                      fontSize: "0.75rem",
                                      color: "#6b7280",
                                    }}
                                  >
                                    {exp.date && <span>{exp.date} </span>}
                                    {exp.companyLocation && (
                                      <span>{exp.companyLocation}</span>
                                    )}
                                  </p>
                                )}
                                {Array.isArray(exp.accomplishment) &&
                                  exp.accomplishment.length > 0 && (
                                    <ul
                                      style={{
                                        margin: "0",
                                        paddingLeft: "1rem",
                                        fontSize: "0.8rem",
                                        lineHeight: "1.3",
                                      }}
                                    >
                                      {exp.accomplishment.map(
                                        (acc, accIndex) => (
                                          <li key={accIndex}>{acc}</li>
                                        )
                                      )}
                                    </ul>
                                  )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={sectionCardStyle}>
                        {editMode ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              alignItems: "center",
                            }}
                          >
                            <textarea
                              placeholder="Add your experience details..."
                              value={
                                localData.experience && localData.experience[0]
                                  ? localData.experience[0].title || ""
                                  : ""
                              }
                              onChange={(e) => {
                                handleArrayFieldChange("experience", 0, {
                                  title: e.target.value,
                                });
                              }}
                              style={{
                                width: "100%",
                                minHeight: "80px",
                                border: "none",
                                resize: "vertical",
                                fontFamily: "inherit",
                                fontSize: "0.85rem",
                                lineHeight: "1.3",
                                background: "transparent",
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    )}
                    {editMode && (
                      <div style={{ marginTop: "0.25rem" }}>
                        <button
                          onClick={() =>
                            addArrayItem("experience", {
                              title: "",
                              companyName: "",
                              date: "",
                              companyLocation: "",
                              accomplishment: [],
                            })
                          }
                          aria-label="Add experience"
                          title="Add experience"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#0875b8",
                            fontSize: "1.25rem",
                            lineHeight: "1",
                            cursor: "pointer",
                            padding: "0.15rem 0.4rem",
                          }}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* PROJECTS SECTION */}
                {(editMode || hasProjects(resumeData)) && (
                  <div style={{ marginTop: "0.8rem" }}>
                    <h3 style={sectionTitleStyle}>Projects</h3>
                    {(editMode
                      ? Array.isArray(localData.projects)
                        ? localData.projects
                        : []
                      : resumeData.projects || []
                    ).length > 0 ? (
                      <div style={sectionCardStyle}>
                        {(editMode
                          ? localData.projects || []
                          : resumeData.projects || []
                        ).map((project, index) => (
                          <div key={index} style={{ marginBottom: "0.75rem" }}>
                            {editMode ? (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: "0.5rem",
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <input
                                    type="text"
                                    value={project.name || ""}
                                    onChange={(e) =>
                                      handleArrayFieldChange("projects", index, {
                                        name: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.95rem",
                                      fontWeight: "bold",
                                      border: "none",
                                      marginBottom: "0.3rem",
                                      background: "transparent",
                                    }}
                                    placeholder="Project Name"
                                  />
                                  <textarea
                                    value={project.description || ""}
                                    onChange={(e) =>
                                      handleArrayFieldChange("projects", index, {
                                        description: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      minHeight: "50px",
                                      border: "none",
                                      resize: "vertical",
                                      fontFamily: "inherit",
                                      fontSize: "0.8rem",
                                      lineHeight: "1.3",
                                      marginBottom: "0.3rem",
                                      background: "transparent",
                                    }}
                                    placeholder="Project description..."
                                  />
                                  <input
                                    type="text"
                                    value={
                                      Array.isArray(project.technologies)
                                        ? project.technologies.join(", ")
                                        : project.technologies || ""
                                    }
                                    onChange={(e) =>
                                      handleArrayFieldChange("projects", index, {
                                        technologies: e.target.value
                                          .split(",")
                                          .map((t) => t.trim())
                                          .filter(Boolean),
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.75rem",
                                      color: "#6b7280",
                                      border: "none",
                                      marginBottom: "0.3rem",
                                      background: "transparent",
                                    }}
                                    placeholder="Technologies used (comma separated)..."
                                  />
                                  <input
                                    type="text"
                                    value={project.link || ""}
                                    onChange={(e) =>
                                      handleArrayFieldChange("projects", index, {
                                        link: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.75rem",
                                      color: "#6b7280",
                                      border: "none",
                                      marginBottom: "0.3rem",
                                      background: "transparent",
                                    }}
                                    placeholder="Project link (optional)..."
                                  />
                                  <input
                                    type="text"
                                    value={project.github || ""}
                                    onChange={(e) =>
                                      handleArrayFieldChange("projects", index, {
                                        github: e.target.value,
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      fontSize: "0.75rem",
                                      color: "#6b7280",
                                      border: "none",
                                      background: "transparent",
                                    }}
                                    placeholder="GitHub link (optional)..."
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                {project.name && (
                                  <h4
                                    style={{
                                      margin: "0 0 0.2rem 0",
                                      fontSize: "0.95rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {project.name}
                                  </h4>
                                )}
                                {project.description && (
                                  <p
                                    style={{
                                      margin: "0 0 0.2rem 0",
                                      fontSize: "0.8rem",
                                      lineHeight: "1.3",
                                    }}
                                  >
                                    {project.description}
                                  </p>
                                )}
                                {Array.isArray(project.technologies) &&
                                  project.technologies.length > 0 && (
                                    <p
                                      style={{
                                        margin: "0 0 0.2rem 0",
                                        fontSize: "0.75rem",
                                        color: "#6b7280",
                                      }}
                                    >
                                      <strong>Tech:</strong>{" "}
                                      {project.technologies.join(", ")}
                                    </p>
                                  )}
                                {(project.link || project.github) && (
                                  <p
                                    style={{
                                      margin: "0",
                                      fontSize: "0.75rem",
                                      color: "#6b7280",
                                    }}
                                  >
                                    {project.link && (
                                      <span style={{ marginRight: "1rem" }}>
                                        🔗{" "}
                                        <a
                                          href={project.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ color: "#87CEEB" }}
                                        >
                                          Live Demo
                                        </a>
                                      </span>
                                    )}
                                    {project.github && (
                                      <span>
                                        📁{" "}
                                        <a
                                          href={project.github}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ color: "#87CEEB" }}
                                        >
                                          GitHub
                                        </a>
                                      </span>
                                    )}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={sectionCardStyle}>
                        {editMode ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              alignItems: "center",
                            }}
                          >
                            <textarea
                              placeholder="Add your project details..."
                              value={
                                localData.projects && localData.projects[0]
                                  ? localData.projects[0].name || ""
                                  : ""
                              }
                              onChange={(e) => {
                                handleArrayFieldChange("projects", 0, {
                                  name: e.target.value,
                                });
                              }}
                              style={{
                                width: "100%",
                                minHeight: "60px",
                                border: "none",
                                resize: "vertical",
                                fontFamily: "inherit",
                                fontSize: "0.85rem",
                                lineHeight: "1.3",
                                background: "transparent",
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    )}
                    {editMode && (
                      <div style={{ marginTop: "0.25rem" }}>
                        <button
                          onClick={() =>
                            addArrayItem("projects", {
                              name: "",
                              description: "",
                              technologies: [],
                              link: "",
                              github: "",
                            })
                          }
                          aria-label="Add project"
                          title="Add project"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#0875b8",
                            fontSize: "1.25rem",
                            lineHeight: "1",
                            cursor: "pointer",
                            padding: "0.15rem 0.4rem",
                          }}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Mode Controls */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    backgroundColor: isSaving ? "#05966970" : "#16a34a",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    margin: "0 0.5rem",
                    border: "none",
                    cursor: isSaving ? "not-allowed" : "pointer",
                  }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  style={{
                    backgroundColor: "#9ca3af",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    margin: "0 0.5rem",
                    border: "none",
                    cursor: isSaving ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                {saveStatus && (
                  <div style={{ marginTop: "0.5rem", color: "#374151" }}>
                    {saveStatus}
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  backgroundColor: "#87CEEB",
                  color: "#000",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  margin: "0 0.5rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          * {
            border: none !important;
            border-radius: 0 !important;
            border-image: none !important;
            border-style: none !important;
            outline: none !important;
            box-shadow: none !important;
          }

          .resume-page {
            max-width: 210mm !important;
            width: 210mm !important;
            min-height: 297mm !important;
            height: 297mm !important;
            padding: 15mm !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
            overflow: visible !important;
            position: relative !important;
            background: white !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .resume-page > * {
            page-break-inside: avoid !important;
            border: none !important;
          }

          .resume-page::before,
          .resume-page::after {
            display: none !important;
            border: none !important;
          }

          @page {
            size: A4;
            margin: 0;
          }

          .resume-page {
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            border: none !important;
            outline: none !important;
          }

          h3 {
            border-bottom: 2px solid #87ceeb !important;
          }

          p,
          h1,
          h2,
          h3,
          h4,
          li,
          input,
          textarea {
            font-size: inherit !important;
            line-height: 1.3 !important;
            margin: 0.2rem 0 !important;
            padding: 0 !important;
          }
        }

        .resume-page {
          aspect-ratio: 1 / 1.414;
          max-height: 1123px;
        }

        .resume-page {
          overflow: hidden;
          position: relative;
        }

        @media print {
          .resume-page {
            transform: none !important;
            transition: none !important;
            animation: none !important;
          }

          .resume-page * {
            visibility: visible !important;
            display: block !important;
          }

          .resume-page {
            display: block !important;
            flex: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Template21;
