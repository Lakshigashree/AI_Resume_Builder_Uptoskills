import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import resumeService from "../../services/resumeService";

const accent = "#bccfd0"; // soft teal-grey accent used across the layout

const DotRow = ({ filled = 0 }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 6 }).map((_, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <span
          key={idx}
          className={`h-1.5 w-1.5 rounded-full ${idx < filled ? "bg-[#4e6f73]" : "bg-white border border-[#4e6f73]/30"
            }`}
        />
      ))}
    </div>
  );
};

const TimelineSection = ({ number, title, children }) => (
  <div className="relative flex gap-6">
    {/* Numbered circle */}
    <div className="flex flex-col items-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#9fb1b4] bg-white text-sm font-semibold text-[#6a8285]">
        {number}
      </div>
      {/* Vertical connector line */}
      <div className="mt-1 h-full w-px flex-1 bg-[#d5e0e1]" />
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0 pb-8">
      <div
        className="inline-block rounded-sm px-5 py-2 text-xs font-semibold tracking-[0.18em] text-[#4c6669]"
        style={{ backgroundColor: accent }}
      >
        {title}
      </div>
      <div className="mt-3 w-full text-[14px] leading-relaxed text-[#3c4a4c]">
        {children}
      </div>
    </div>
  </div>
);

const TemplateNew = () => {
  const resumeRef = useRef(null);
  const resumeContext = useResume();
  const { isAuthenticated } = useAuth();

  const resumeData = resumeContext?.resumeData || {};
  const updateResumeData = resumeContext?.updateResumeData;

  const [localData, setLocalData] = useState(resumeData);
  const [editMode, setEditMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);


  useEffect(() => {
    setLocalData(resumeData || {});
  }, [resumeData]);


  const handleFieldChange = (field, value) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    localStorage.setItem("resumeData", JSON.stringify(updated));
  };

  const handleSave = async () => {
    try {
      setSaveStatus("Saving...");
      setIsSavingToDatabase(true);

      if (!resumeContext || typeof updateResumeData !== "function") {
        // Fallback: save to localStorage only
        localStorage.setItem("resumeData", JSON.stringify(localData));
      } else {
        await updateResumeData(localData);
      }

      if (isAuthenticated) {
        const structuredData = {
          templateId: 16, // keep consistent with Template16 for backend
          personalInfo: {
            name: localData.name || "",
            role: localData.role || "",
            email: localData.email || "",
            phone: localData.phone || "",
            location: localData.location || "",
            linkedin: localData.linkedin || "",
            github: localData.github || "",
            portfolio: localData.portfolio || "",
          },
          summary: localData.summary || "",
          skills: localData.skills || [],
          experience: localData.experience || [],
          education: localData.education || [],
          projects: localData.projects || [],
          certifications: localData.certifications || [],
          achievements: localData.achievements || [],
          interests: localData.interests || [],
          languages: localData.languages || [],
        };

        const saveResult = await resumeService.saveResumeData(structuredData);
        if (saveResult.success) {
          toast.success("Resume saved to database");
          setSaveStatus("Saved to database");
        } else {
          console.error("Database save error:", saveResult.error);
          toast.error("Failed to save to database");
          setSaveStatus("Failed to save");
        }
      } else {
        toast.info("Resume saved locally. Sign in to save permanently.");
        setSaveStatus("Saved locally (Sign in to save to database)");
      }

      setEditMode(false);
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      console.error("Error saving resume data:", err);
      toast.error("Failed to save");
      setSaveStatus(`Error: ${err.message}`);
      setTimeout(() => setSaveStatus(""), 5000);
    } finally {
      setIsSavingToDatabase(false);
    }
  };

  const handleCancel = () => {
    setLocalData(resumeData || {});
    setEditMode(false);
    setSaveStatus("");
  };

  const handleEnhance = (section, enhancedData = null) => {
    const source = enhancedData || resumeContext?.resumeData;
    if (!source) return;
    const updated = { ...source };
    setLocalData(updated);
    localStorage.setItem("resumeData", JSON.stringify(updated));
    if (updateResumeData) {
      updateResumeData(updated);
    }
  };

  const headerName = localData.name || "ELLA BROOKS";
  const role = localData.role || "FULL STACK DEVELOPER";

  const phone = localData.phone || "8529637410";
  const email = localData.email || "ellabrooks@gmail.com";
  const location = localData.location || "Chennai, India";
  const linkedin = localData.linkedin || "linkedin.com/in/ella";
  const github = localData.github || "github.com/ella";

  // Personal profile / summary: start empty by default and show only what user types
  const summary =
    typeof localData.summary === "string" ? localData.summary : "";

  const education = Array.isArray(localData.education)
    ? localData.education.length > 0
      ? localData.education
      : [{ degree: "", institution: "", year: "" }]
    : [{ degree: "BE in Computer Science", institution: "Bluefield University (2017 – 2021)", year: "" }];

  const experience = Array.isArray(localData.experience)
    ? localData.experience.length > 0
      ? localData.experience
      : [{ title: "", company: "", duration: "", description: "" }]
    : [{ title: "Frontend Intern — Google", company: "Google", duration: "2022 – 2023", description: "" }];

  const projects = Array.isArray(localData.projects)
    ? localData.projects.length > 0
      ? localData.projects
      : [{ name: "", description: "" }]
    : [{ name: "Portfolio Website", description: "Developed with React and Tailwind to showcase skills and projects professionally." }];

  const certifications = Array.isArray(localData.certifications)
    ? localData.certifications.length > 0
      ? localData.certifications
      : [{ name: "", title: "" }]
    : [{ name: "AWS Cloud Practitioner", title: "AWS Cloud Practitioner" }];

  const skills = Array.isArray(localData.skills)
    ? localData.skills.length > 0
      ? localData.skills
      : ["Front and Backend Development", "React.js / JavaScript", "Node.js / Express.js", "Git & REST APIs"]
    : ["Front and Backend Development", "React.js / JavaScript", "Node.js / Express.js", "Git & REST APIs"];

  const interests = Array.isArray(localData.interests)
    ? localData.interests.length > 0
      ? localData.interests
      : ["Travelling", "Books"]
    : ["Travelling", "Books"];

  // Convert languages to objects with proficiency if they're strings
  const normalizeLanguages = (langs) => {
    if (!Array.isArray(langs)) {
      return [
        { language: "English", proficiency: 6 },
        { language: "French", proficiency: 4 },
        { language: "Spanish", proficiency: 3 },
        { language: "German", proficiency: 2 },
      ];
    }
    return langs.map((lang) => {
      if (typeof lang === "string") {
        // Migrate old format (string) to new format (object)
        const defaultLevels = {
          English: 6,
          French: 4,
          Spanish: 3,
          German: 2,
        };
        return {
          language: lang,
          proficiency: defaultLevels[lang] || 4,
        };
      }
      return {
        language: lang.language || lang.name || "",
        proficiency: lang.proficiency || lang.level || 4,
      };
    });
  };

  const languages = normalizeLanguages(localData.languages);

  // Helpers to decide which sections should be shown in view mode
  const hasSummary = () =>
    typeof localData.summary === "string" &&
    localData.summary.trim().length > 0;

  const hasEducation = () =>
    Array.isArray(localData.education) &&
    localData.education.some(
      (edu) =>
        edu &&
        ((edu.degree && edu.degree.trim().length > 0) ||
          (edu.institution && edu.institution.trim().length > 0) ||
          (edu.year && edu.year.trim().length > 0))
    );

  const hasProjects = () =>
    Array.isArray(localData.projects) &&
    localData.projects.some(
      (proj) =>
        proj &&
        ((proj.name && proj.name.trim().length > 0) ||
          (proj.description && proj.description.trim().length > 0))
    );

  const hasExperience = () =>
    Array.isArray(localData.experience) &&
    localData.experience.some(
      (exp) =>
        exp &&
        ((exp.title && exp.title.trim().length > 0) ||
          (exp.company && exp.company.trim().length > 0) ||
          (exp.duration && exp.duration.trim().length > 0) ||
          (exp.description && exp.description.trim().length > 0))
    );

  const hasCertifications = () =>
    Array.isArray(localData.certifications) &&
    localData.certifications.some(
      (cert) =>
        cert &&
        ((cert.name && cert.name.trim().length > 0) ||
          (cert.title && cert.title.trim().length > 0))
    );

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
            {/* Resume canvas */}
            <div
              style={{
                backgroundColor: "#ffffff",
                color: "#1f2937",
                maxWidth: "72rem",
                width: "100%",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex min-h-[800px] items-center justify-center bg-[#e1e6e8] py-8">
                <div
                  ref={resumeRef}
                  className="flex w-full max-w-5xl overflow-hidden bg-white shadow-xl"
                  style={{ minHeight: '100vh', alignItems: 'stretch' }}
                >
                  {/* Left sidebar */}
                  <aside className="flex w-1/3 flex-col items-center bg-[#c1d5d5] px-8 pb-10 pt-10" style={{ minHeight: '100%', alignSelf: 'stretch' }}>
                    {/* Profile image */}
                    <div className="mb-8 relative">
                      <div className="h-40 w-40 overflow-hidden rounded-full border-[6px] border-white shadow-md">
                        <img
                          src={
                            localData.photoUrl ||
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EPhoto%3C/text%3E%3C/svg%3E"
                          }
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {editMode && (
                        <div className="mt-3 space-y-2 hide-in-pdf">
                          <label className="flex cursor-pointer flex-col items-center justify-center rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                            <span className="mb-1">📷 Upload Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    handleFieldChange("photoUrl", reader.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {localData.photoUrl && (
                            <button
                              onClick={() => handleFieldChange("photoUrl", "")}
                              className="w-full rounded bg-red-500 px-3 py-2 text-xs text-white hover:bg-red-600"
                            >
                              Remove Photo
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Contact */}
                    <section className="mt-5 w-full text-left text-[14px] text-[#405053]">
                      <h3 className="mb-2 border-b border-white/60 pb-1 text-xs font-semibold tracking-[0.2em] text-[#4a6265]">
                        CONTACT
                      </h3>
                      <div className="space-y-2">
                        {editMode ? (
                          <div className="hide-in-pdf">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={phone}
                                onChange={(e) =>
                                  handleFieldChange("phone", e.target.value)
                                }
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="Phone"
                              />
                              <button
                                onClick={() => handleFieldChange("phone", "")}
                                className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                title="Remove phone"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                  handleFieldChange("email", e.target.value)
                                }
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="Email"
                              />
                              <button
                                onClick={() => handleFieldChange("email", "")}
                                className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                title="Remove email"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={location}
                                onChange={(e) =>
                                  handleFieldChange("location", e.target.value)
                                }
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="Location"
                              />
                              <button
                                onClick={() => handleFieldChange("location", "")}
                                className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                title="Remove location"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={linkedin}
                                onChange={(e) =>
                                  handleFieldChange("linkedin", e.target.value)
                                }
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="LinkedIn"
                              />
                              <button
                                onClick={() => handleFieldChange("linkedin", "")}
                                className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                title="Remove LinkedIn"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={github}
                                onChange={(e) =>
                                  handleFieldChange("github", e.target.value)
                                }
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="GitHub"
                              />
                              <button
                                onClick={() => handleFieldChange("github", "")}
                                className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                title="Remove GitHub"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {phone && (
                              <p className="flex items-center gap-2">
                                <span className="text-[12px]">📞</span>
                                <span>{phone}</span>
                              </p>
                            )}
                            {email && (
                              <p className="flex items-center gap-2 break-all">
                                <span className="text-[12px]">✉️</span>
                                <span>{email}</span>
                              </p>
                            )}
                            {location && (
                              <p className="flex items-center gap-2">
                                <span className="text-[12px]">📍</span>
                                <span>{location}</span>
                              </p>
                            )}
                            {linkedin && (
                              <p className="flex items-center gap-2 break-all">
                                <span className="text-[12px]">in</span>
                                <span>{linkedin}</span>
                              </p>
                            )}
                            {github && (
                              <p className="flex items-center gap-2 break-all">
                                <span className="text-[12px]">GitHub</span>
                                <a href={github} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{github}</a>
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </section>

                    {/* Expertise skills */}
                    <section className="mt-7 w-full text-left text-[14px] text-[#405053]">
                      <h3 className="mb-2 border-b border-white/60 pb-1 text-xs font-semibold tracking-[0.2em] text-[#4a6265]">
                        EXPERTISE SKILLS
                      </h3>
                      {editMode ? (
                        <div className="space-y-2 hide-in-pdf">
                          {skills.map((skill, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2"
                            >
                              <input
                                type="text"
                                value={skill || ""}
                                onChange={(e) => {
                                  const updated = [...skills];
                                  updated[index] = e.target.value;
                                  handleFieldChange("skills", updated);
                                }}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="Skill name"
                              />
                              {skills.length > 1 && (
                                <button
                                  onClick={() => {
                                    const updated = skills.filter(
                                      (_, i) => i !== index
                                    );
                                    handleFieldChange("skills", updated);
                                  }}
                                  className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const updated = [...skills, ""];
                              handleFieldChange("skills", updated);
                            }}
                            className="w-full rounded bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
                          >
                            + Add Skill
                          </button>
                        </div>
                      ) : (
                        <ul className="ml-4 list-disc space-y-1.5 marker:text-[#4e6f73]">
                          {skills
                            .filter((skill) => skill && skill.trim())
                            .map((skill, idx) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <li key={idx}>{skill}</li>
                            ))}
                        </ul>
                      )}
                    </section>

                    {/* Language */}
                    <section className="mt-7 w-full text-left text-[14px] text-[#405053]">
                      <h3 className="mb-2 border-b border-white/60 pb-1 text-xs font-semibold tracking-[0.2em] text-[#4a6265]">
                        LANGUAGE
                      </h3>
                      {editMode ? (
                        <div className="space-y-3 hide-in-pdf">
                          {languages.map((langObj, index) => (
                            <div
                              key={index}
                              className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-600">
                                  Language #{index + 1}
                                </span>
                                {languages.length > 1 && (
                                  <button
                                    onClick={() => {
                                      const updated = languages.filter(
                                        (_, i) => i !== index
                                      );
                                      handleFieldChange("languages", updated);
                                    }}
                                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                value={langObj.language || ""}
                                onChange={(e) => {
                                  const updated = [...languages];
                                  updated[index] = {
                                    ...updated[index],
                                    language: e.target.value,
                                  };
                                  handleFieldChange("languages", updated);
                                }}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="Language name (e.g., English)"
                              />
                              <div className="flex items-center gap-3">
                                <label className="text-xs text-gray-600">
                                  Proficiency:
                                </label>
                                <div className="flex flex-1 items-center gap-2">
                                  <input
                                    type="range"
                                    min="0"
                                    max="6"
                                    value={langObj.proficiency || 4}
                                    onChange={(e) => {
                                      const updated = [...languages];
                                      updated[index] = {
                                        ...updated[index],
                                        proficiency: parseInt(e.target.value, 10),
                                      };
                                      handleFieldChange("languages", updated);
                                    }}
                                    className="flex-1"
                                  />
                                  <div className="flex items-center gap-1">
                                    <DotRow filled={langObj.proficiency || 4} />
                                    <span className="text-xs text-gray-600 w-8">
                                      ({langObj.proficiency || 4}/6)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const updated = [
                                ...languages,
                                { language: "", proficiency: 4 },
                              ];
                              handleFieldChange("languages", updated);
                            }}
                            className="w-full rounded bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                          >
                            + Add Language
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {languages
                            .filter((lang) => lang.language && lang.language.trim())
                            .map((langObj, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <p>{langObj.language}</p>
                                <DotRow filled={langObj.proficiency || 4} />
                              </div>
                            ))}
                        </div>
                      )}
                    </section>

                    {/* Interests */}
                    <section className="mt-7 w-full text-left text-[14px] text-[#405053]">
                      <h3 className="mb-2 border-b border-white/60 pb-1 text-xs font-semibold tracking-[0.2em] text-[#4a6265]">
                        INTEREST
                      </h3>
                      {editMode ? (
                        <div className="space-y-2 hide-in-pdf">
                          {interests.map((interest, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2"
                            >
                              <input
                                type="text"
                                value={interest || ""}
                                onChange={(e) => {
                                  const updated = [...interests];
                                  updated[index] = e.target.value;
                                  handleFieldChange("interests", updated);
                                }}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="Interest name"
                              />
                              {interests.length > 1 && (
                                <button
                                  onClick={() => {
                                    const updated = interests.filter(
                                      (_, i) => i !== index
                                    );
                                    handleFieldChange("interests", updated);
                                  }}
                                  className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const updated = [...interests, ""];
                              handleFieldChange("interests", updated);
                            }}
                            className="w-full rounded bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
                          >
                            + Add Interest
                          </button>
                        </div>
                      ) : (
                        <ul className="ml-4 list-disc space-y-1.5 marker:text-[#4e6f73]">
                          {interests
                            .filter((interest) => interest && interest.trim())
                            .map((interest, idx) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <li key={idx}>{interest}</li>
                            ))}
                        </ul>
                      )}
                    </section>
                  </aside>

                  {/* Right content */}
                  <main className="w-2/3 bg-white px-10 pb-10 pt-0" style={{ minHeight: '100%' }}>
                    {/* Shaded region above and behind the name header */}
                    <div className="-mx-10 h-20 bg-[#c1d5d5]" />

                    {/* Header name block inside light shaded bar */}
                    <header className="mt-0 mb-6">
                      <div className="-mx-10 bg-[#c1d5d5] px-10 py-6 text-center">
                        {editMode ? (
                          <div className="hide-in-pdf">
                            <input
                              type="text"
                              value={headerName}
                              onChange={(e) =>
                                handleFieldChange("name", e.target.value)
                              }
                              className="mb-2 w-full max-w-md rounded border border-gray-300 bg-white/70 px-3 py-1 text-center text-[26px] font-bold tracking-[0.3em] text-[#48656b] outline-none"
                              placeholder="YOUR NAME"
                            />
                            <input
                              type="text"
                              value={role}
                              onChange={(e) =>
                                handleFieldChange("role", e.target.value)
                              }
                              className="w-full max-w-md rounded border border-gray-300 bg-white/70 px-3 py-1 text-center text-[18px] tracking-[0.45em] text-[#6c858b] outline-none"
                              placeholder="YOUR POSITION"
                            />
                          </div>
                        ) : (
                          <>
                            <h1 className="text-[34px] font-bold tracking-[0.4em] text-[#48656b]">
                              {headerName}
                            </h1>
                            <p className="mt-2 text-[20px] tracking-[0.55em] text-[#6c858b]">
                              {role}
                            </p>
                          </>
                        )}
                      </div>
                    </header>

                    {/* Timeline sections on white background */}
                    <div className="relative mt-8 pl-2">
                      {/* Professional Profile */}
                      {(editMode || hasSummary()) && (
                        <TimelineSection
                          number="01"
                          title="PROFESSIONAL PROFILE"
                        >
                          {editMode && (
                            <div className="mb-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleFieldChange("summary", "")}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Remove section
                              </button>
                            </div>
                          )}
                          {editMode ? (
                            <div className="hide-in-pdf">
                              <textarea
                                value={summary}
                                onChange={(e) =>
                                  handleFieldChange("summary", e.target.value)
                                }
                                className="h-32 w-full rounded border border-gray-300 px-2 py-1 text-[14px] leading-relaxed outline-none"
                                placeholder="Write a short professional summary about yourself..."
                              />
                            </div>
                          ) : (
                            summary
                          )}
                        </TimelineSection>
                      )}

                      {/* Education */}
                      {(editMode || hasEducation()) && (
                        <TimelineSection number="02" title="EDUCATION">
                          {editMode ? (
                            <div className="space-y-4 hide-in-pdf">
                              <div className="mb-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleFieldChange("education", [])}
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Remove section
                                </button>
                              </div>
                              {education.map((edu, index) => (
                                <div
                                  key={index}
                                  className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-600">
                                      Education #{index + 1}
                                    </span>
                                    {education.length > 1 && (
                                      <button
                                        onClick={() => {
                                          const updated = education.filter(
                                            (_, i) => i !== index
                                          );
                                          handleFieldChange("education", updated);
                                        }}
                                        className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    value={edu.degree || ""}
                                    onChange={(e) => {
                                      const updated = [...education];
                                      updated[index] = {
                                        ...updated[index],
                                        degree: e.target.value,
                                      };
                                      handleFieldChange("education", updated);
                                    }}
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                                    placeholder="Degree (e.g., BE in Computer Science)"
                                  />
                                  <input
                                    type="text"
                                    value={edu.institution || ""}
                                    onChange={(e) => {
                                      const updated = [...education];
                                      updated[index] = {
                                        ...updated[index],
                                        institution: e.target.value,
                                      };
                                      handleFieldChange("education", updated);
                                    }}
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                                    placeholder="Institution (e.g., Bluefield University (2017 – 2021))"
                                  />
                                  <input
                                    type="text"
                                    value={edu.year || ""}
                                    onChange={(e) => {
                                      const updated = [...education];
                                      updated[index] = {
                                        ...updated[index],
                                        year: e.target.value,
                                      };
                                      handleFieldChange("education", updated);
                                    }}
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                                    placeholder="Year (optional)"
                                  />
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const updated = [
                                    ...education,
                                    { degree: "", institution: "", year: "" },
                                  ];
                                  handleFieldChange("education", updated);
                                }}
                                className="w-full rounded bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                              >
                                + Add Education
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {education.map((edu, index) => (
                                <div key={index}>
                                  {edu.degree && (
                                    <p className="text-[14px] font-semibold text-[#273335]">
                                      {edu.degree}
                                    </p>
                                  )}
                                  {(edu.institution || edu.year) && (
                                    <p className="mt-0.5 text-[14px] font-medium text-[#4f6669]">
                                      {edu.institution}
                                      {edu.year && ` (${edu.year})`}
                                    </p>
                                  )}
                                  {index < education.length - 1 && (
                                    <div className="my-2 h-px bg-gray-200" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </TimelineSection>
                      )}

                      {/* Projects */}
                      {(editMode || hasProjects()) && (
                        <TimelineSection number="03" title="PROJECTS">
                          {editMode ? (
                            <div className="space-y-4 hide-in-pdf">
                              <div className="mb-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleFieldChange("projects", [])}
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Remove section
                                </button>
                              </div>
                              {projects.map((project, index) => (
                                <div
                                  key={index}
                                  className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-600">
                                      Project #{index + 1}
                                    </span>
                                    {projects.length > 1 && (
                                      <button
                                        onClick={() => {
                                          const updated = projects.filter(
                                            (_, i) => i !== index
                                          );
                                          handleFieldChange("projects", updated);
                                        }}
                                        className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    value={project.name || ""}
                                    onChange={(e) => {
                                      const updated = [...projects];
                                      updated[index] = {
                                        ...updated[index],
                                        name: e.target.value,
                                      };
                                      handleFieldChange("projects", updated);
                                    }}
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                                    placeholder="Project Name (e.g., Portfolio Website)"
                                  />
                                  <textarea
                                    value={project.description || ""}
                                    onChange={(e) => {
                                      const updated = [...projects];
                                      updated[index] = {
                                        ...updated[index],
                                        description: e.target.value,
                                      };
                                      handleFieldChange("projects", updated);
                                    }}
                                    className="h-24 w-full rounded border border-gray-300 px-2 py-1 text-[14px] leading-relaxed outline-none"
                                    placeholder="Project description"
                                  />
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const updated = [
                                    ...projects,
                                    { name: "", description: "" },
                                  ];
                                  handleFieldChange("projects", updated);
                                }}
                                className="w-full rounded bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                              >
                                + Add Project
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {projects.map((project, index) => (
                                <div key={index}>
                                  {project.name && (
                                    <p className="text-[14px] font-semibold text-[#273335]">
                                      {project.name}
                                    </p>
                                  )}
                                  {project.description && (
                                    <p className="text-[14px] text-[#4f6669]">
                                      {project.description}
                                    </p>
                                  )}
                                  {index < projects.length - 1 && (
                                    <div className="my-2 h-px bg-gray-200" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </TimelineSection>
                      )}

                      {/* Experience */}
                      {(editMode || hasExperience()) && (
                        <TimelineSection number="04" title="EXPERIENCE">
                          {editMode ? (
                            <div className="space-y-4 hide-in-pdf">
                              <div className="mb-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleFieldChange("experience", [])
                                  }
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Remove section
                                </button>
                              </div>
                              {experience.map((exp, index) => (
                                <div
                                  key={index}
                                  className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-600">
                                      Experience #{index + 1}
                                    </span>
                                    {experience.length > 1 && (
                                      <button
                                        onClick={() => {
                                          const updated = experience.filter(
                                            (_, i) => i !== index
                                          );
                                          handleFieldChange("experience", updated);
                                        }}
                                        className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    value={exp.title || ""}
                                    onChange={(e) => {
                                      const updated = [...experience];
                                      updated[index] = {
                                        ...updated[index],
                                        title: e.target.value,
                                      };
                                      handleFieldChange("experience", updated);
                                    }}
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                                    placeholder="Job Title (e.g., Frontend Intern)"
                                  />
                                  <input
                                    type="text"
                                    value={exp.company || ""}
                                    onChange={(e) => {
                                      const updated = [...experience];
                                      updated[index] = {
                                        ...updated[index],
                                        company: e.target.value,
                                      };
                                      handleFieldChange("experience", updated);
                                    }}
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                                    placeholder="Company (e.g., Google)"
                                  />
                                  <input
                                    type="text"
                                    value={exp.duration || ""}
                                    onChange={(e) => {
                                      const updated = [...experience];
                                      updated[index] = {
                                        ...updated[index],
                                        duration: e.target.value,
                                      };
                                      handleFieldChange("experience", updated);
                                    }}
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                                    placeholder="Duration (e.g., 2022 – 2023)"
                                  />
                                  <textarea
                                    value={exp.description || ""}
                                    onChange={(e) => {
                                      const updated = [...experience];
                                      updated[index] = {
                                        ...updated[index],
                                        description: e.target.value,
                                      };
                                      handleFieldChange("experience", updated);
                                    }}
                                    className="h-24 w-full rounded border border-gray-300 px-2 py-1 text-[14px] leading-relaxed outline-none"
                                    placeholder="Job description and responsibilities"
                                  />
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const updated = [
                                    ...experience,
                                    { title: "", company: "", duration: "", description: "" },
                                  ];
                                  handleFieldChange("experience", updated);
                                }}
                                className="w-full rounded bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                              >
                                + Add Experience
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {experience.map((exp, index) => (
                                <div key={index}>
                                  {exp.title && (
                                    <p className="text-[14px] font-semibold text-[#273335]">
                                      {exp.title}
                                      {exp.company && ` — ${exp.company}`}
                                    </p>
                                  )}
                                  {exp.duration && (
                                    <p className="text-[14px] font-medium text-[#4f6669]">
                                      {exp.duration}
                                    </p>
                                  )}
                                  {exp.description && (
                                    <p className="mt-1.5 text-[14px] text-[#4f6669]">
                                      {exp.description}
                                    </p>
                                  )}
                                  {index < experience.length - 1 && (
                                    <div className="my-3 h-px bg-gray-200" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </TimelineSection>
                      )}

                      {/* Certifications */}
                      {(editMode || hasCertifications()) && (
                        <TimelineSection number="05" title="CERTIFICATIONS">
                          {editMode ? (
                            <div className="space-y-4 hide-in-pdf">
                              <div className="mb-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleFieldChange("certifications", [])
                                  }
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Remove section
                                </button>
                              </div>
                              {certifications.map((cert, index) => (
                                <div
                                  key={index}
                                  className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-600">
                                      Certification #{index + 1}
                                    </span>
                                    {certifications.length > 1 && (
                                      <button
                                        onClick={() => {
                                          const updated = certifications.filter(
                                            (_, i) => i !== index
                                          );
                                          handleFieldChange("certifications", updated);
                                        }}
                                        className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    value={cert.name || cert.title || ""}
                                    onChange={(e) => {
                                      const updated = [...certifications];
                                      updated[index] = {
                                        ...updated[index],
                                        name: e.target.value,
                                        title: e.target.value,
                                      };
                                      handleFieldChange("certifications", updated);
                                    }}
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                                    placeholder="Certification Name (e.g., AWS Cloud Practitioner)"
                                  />
                                  {cert.organization && (
                                    <input
                                      type="text"
                                      value={cert.organization || ""}
                                      onChange={(e) => {
                                        const updated = [...certifications];
                                        updated[index] = {
                                          ...updated[index],
                                          organization: e.target.value,
                                        };
                                        handleFieldChange("certifications", updated);
                                      }}
                                      className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                                      placeholder="Issuing Organization (optional)"
                                    />
                                  )}
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const updated = [
                                    ...certifications,
                                    { name: "", title: "" },
                                  ];
                                  handleFieldChange("certifications", updated);
                                }}
                                className="w-full rounded bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                              >
                                + Add Certification
                              </button>
                            </div>
                          ) : (
                            <ul className="ml-4 list-disc space-y-1 text-[14px] marker:text-[#4e6f73]">
                              {certifications
                                .map((c) => c?.name || c?.title || "")
                                .filter(Boolean)
                                .map((cert, idx) => (
                                  // eslint-disable-next-line react/no-array-index-key
                                  <li key={idx}>{cert}</li>
                                ))}
                            </ul>
                          )}
                        </TimelineSection>
                      )}
                    </div>
                  </main>
                </div>
              </div>
            </div>

            {/* Edit / Save Controls */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "2rem",
                alignItems: "center",
              }}
            >
              {saveStatus && (
                <p
                  className="hide-in-pdf"
                  style={{
                    fontSize: "0.875rem",
                    color:
                      saveStatus.includes("Error") ||
                        saveStatus.includes("Failed")
                        ? "#ef4444"
                        : "#10b981",
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {saveStatus}
                </p>
              )}

              {editMode ? (
                <div className="hide-in-pdf" style={{ display: "flex", gap: "1rem" }}>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSavingToDatabase}
                    style={{
                      backgroundColor: isSavingToDatabase
                        ? "#9ca3af"
                        : "#3b82f6",
                      color: "#ffffff",
                      padding: "0.6rem 1.4rem",
                      borderRadius: "0.5rem",
                      border: "none",
                      cursor: isSavingToDatabase ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {isSavingToDatabase && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          border: "2px solid #ffffff",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    )}
                    {isSavingToDatabase ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSavingToDatabase}
                    style={{
                      backgroundColor: "#6b7280",
                      color: "#ffffff",
                      padding: "0.6rem 1.4rem",
                      borderRadius: "0.5rem",
                      border: "none",
                      cursor: isSavingToDatabase ? "not-allowed" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="hide-in-pdf"
                  onClick={() => setEditMode(true)}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "1rem",
                    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.3)",
                  }}
                >
                  ✏️ Edit Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateNew;

