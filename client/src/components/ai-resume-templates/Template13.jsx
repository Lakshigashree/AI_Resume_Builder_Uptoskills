import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Briefcase,
  GraduationCap,
  User,
  Award,
  Globe,
  Calendar,
  Code,
  BookOpen,
  Heart,
  Scroll,
  Plus,
  Trash2,
  ExternalLink
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Template13 = () => {
  const resumeRef = useRef(null);
  const { resumeData, setResumeData } = useResume();
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});

  const [templateSettings, setTemplateSettings] = useState({
    fontFamily: "'Inter', sans-serif",
    primaryColor: "#1e40af",
    secondaryColor: "#64748b",
    accentColor: "#f59e0b",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  });

  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  // ChipInput component for Skills / Languages / Interests
  const ChipInput = ({ chips = [], onChange, placeholder = "Add item" }) => {
    const inputRef = useRef(null);

    useEffect(() => {
      // ensure chips is an array
      if (!Array.isArray(chips)) {
        onChange([]);
      }
    }, []);

    const addChip = (value) => {
      const v = String(value || "").trim();
      if (!v) return;
      // prevent duplicates (case-insensitive)
      const exists = chips.some((c) => c.toLowerCase() === v.toLowerCase());
      if (exists) return;
      onChange([...chips, v]);
    };

    const removeChip = (index) => {
      const newChips = [...chips];
      newChips.splice(index, 1);
      onChange(newChips);
    };

    return (
      <div className="flex flex-wrap gap-2 items-center">
        {chips.map((chip, idx) => (
          <span
            key={idx}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
          >
            <span className="text-sm">{chip}</span>
            <button
              type="button"
              onClick={() => removeChip(idx)}
              className="text-red-500 font-semibold ml-1"
              aria-label={`Remove ${chip}`}
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="p-2 border rounded min-w-[140px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              const val = e.target.value;
              addChip(val);
              e.target.value = "";
            } else if (e.key === "Backspace") {
              // if input empty, remove last chip
              if (!e.target.value && chips.length) {
                removeChip(chips.length - 1);
              }
            }
          }}
          onBlur={(e) => {
            const val = e.target.value;
            if (val && val.trim()) {
              addChip(val);
              e.target.value = "";
            }
          }}
        />
      </div>
    );
  };

  // Initialize data ensuring arrays exist
  useEffect(() => {
    if (resumeData) {
      setLocalData({
        ...resumeData,
        projects: resumeData.projects || [],
        certifications: resumeData.certifications || [],
        achievements: resumeData.achievements || [],
        courses: resumeData.courses || [],
        interests: resumeData.interests || [],
        skills: resumeData.skills || [],
        languages: resumeData.languages || [],
        experience: resumeData.experience || [],
        education: resumeData.education || [],
      });
    } else {
      // ensure defaults
      setLocalData((prev) => ({
        ...(prev || {}),
        projects: (prev && prev.projects) || [],
        certifications: (prev && prev.certifications) || [],
        achievements: (prev && prev.achievements) || [],
        courses: (prev && prev.courses) || [],
        interests: (prev && prev.interests) || [],
        skills: (prev && prev.skills) || [],
        languages: (prev && prev.languages) || [],
        experience: (prev && prev.experience) || [],
        education: (prev && prev.education) || [],
      }));
    }
  }, [resumeData]);

  const handleFieldChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    localStorage.setItem("resumeData", JSON.stringify(updatedData));
  };

  const handleNestedChange = (arrayKey, index, field, value) => {
    const updatedData = {
      ...localData,
      [arrayKey]: localData[arrayKey].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    };
    setLocalData(updatedData);
    localStorage.setItem("resumeData", JSON.stringify(updatedData));
  };

  const handleAddItem = (section, template) => {
    const updatedData = {
      ...localData,
      [section]: [...(localData[section] || []), template],
    };
    setLocalData(updatedData);
    localStorage.setItem("resumeData", JSON.stringify(updatedData));
  };

  const handleRemoveItem = (section, index) => {
    const updatedData = {
      ...localData,
      [section]: localData[section].filter((_, i) => i !== index),
    };
    setLocalData(updatedData);
    localStorage.setItem("resumeData", JSON.stringify(updatedData));
  };

  const handleTemplateSettingsChange = (field, value) => {
    setTemplateSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setResumeData(localData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalData(resumeData);
    setEditMode(false);
  };

  const handleEnhance = () => { };

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result);
        setTemplateSettings((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    const element = resumeRef.current;
    if (!element) {
      alert("Resume element not found!");
      return;
    }
    try {
      const clone = element.cloneNode(true);
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.width = "210mm";
      container.style.backgroundColor = "#ffffff";

      container.appendChild(clone);
      document.body.appendChild(container);

      clone.style.transform = "scale(1)";
      clone.style.margin = "0";

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${localData.name || "Resume"}.pdf`);
    } catch (error) {
      console.error("PDF Error", error);
    }
  };

  const SectionHeading = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-3 mb-6 mt-6 first:mt-0">
      <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-blue-600" />}
        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
          {title}
        </h2>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar
          onDownload={handleDownload}
          onSave={handleSave}
          onEnhance={handleEnhance}
          resumeRef={resumeRef}
        />

        <div className="flex-grow p-8 flex flex-col items-center pb-24">
          <div
            ref={resumeRef}
            style={{
              fontFamily: templateSettings.fontFamily,
              backgroundColor: "#ffffff",
              borderRadius: "1rem",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              maxWidth: "210mm",
              width: "100%",
              minHeight: "297mm",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(to right, #2563eb, #1e40af)",
                color: "#ffffff",
                padding: "2rem",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={localData.name}
                        onChange={(e) =>
                          handleFieldChange("name", e.target.value)
                        }
                        style={{
                          fontSize: "2.25rem",
                          fontWeight: "bold",
                          backgroundColor: "transparent",
                          color: "#ffffff",
                          borderBottom:
                            "2px solid rgba(255, 255, 255, 0.3)",
                          width: "100%",
                          marginBottom: "0.5rem",
                        }}
                      />
                      <input
                        type="text"
                        value={localData.role}
                        onChange={(e) =>
                          handleFieldChange("role", e.target.value)
                        }
                        style={{
                          fontSize: "1.25rem",
                          color: "#bfdbfe",
                          backgroundColor: "transparent",
                          borderBottom:
                            "2px solid rgba(255, 255, 255, 0.3)",
                          width: "100%",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <h1
                        style={{
                          fontSize: "2.25rem",
                          fontWeight: "bold",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {resumeData.name}
                      </h1>
                      <p style={{ fontSize: "1.25rem", color: "#bfdbfe" }}>
                        {resumeData.role}
                      </p>
                    </>
                  )}
                </div>

                <div className="ml-8 flex flex-col items-center">
                  <div className="relative group">
                    <img
                      src={uploadedPhoto || templateSettings.photo}
                      alt="Profile"
                      style={{
                        width: "8rem",
                        height: "8rem",
                        borderRadius: "9999px",
                        objectFit: "cover",
                        border: "4px solid #ffffff",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      }}
                    />
                    {editMode && (
                      <label
                        htmlFor="photo-upload"
                        style={{
                          position: "absolute",
                          bottom: "0.5rem",
                          right: "0.5rem",
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          borderRadius: "9999px",
                          padding: "0.5rem",
                          cursor: "pointer",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                      >
                        <Plus className="h-5 w-5" />
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Bar */}
            <div className="bg-gray-800 text-white px-6 py-4">
              <div className="flex flex-wrap justify-between items-center gap-4 text-sm w-full">
                {/* Email */}
                {(editMode || localData.email) && (
                  <div className="flex items-center gap-2 min-w-max">
                    <Mail className="w-4 h-4 text-yellow-400" />
                    {editMode ? (
                      <input
                        type="text"
                        value={localData.email || ""}
                        onChange={(e) =>
                          handleFieldChange("email", e.target.value)
                        }
                        className="bg-transparent border-b border-gray-600 text-white outline-none w-full max-w-[200px]"
                        placeholder="Email"
                      />
                    ) : (
                      <span>{localData.email}</span>
                    )}
                  </div>
                )}

                {/* Phone */}
                {(editMode || localData.phone) && (
                  <div className="flex items-center gap-2 min-w-max">
                    <Phone className="w-4 h-4 text-yellow-400" />
                    {editMode ? (
                      <input
                        type="text"
                        value={localData.phone || ""}
                        onChange={(e) =>
                          handleFieldChange("phone", e.target.value)
                        }
                        className="bg-transparent border-b border-gray-600 text-white outline-none w-full max-w-[150px]"
                        placeholder="Phone"
                      />
                    ) : (
                      <span>{localData.phone}</span>
                    )}
                  </div>
                )}

                {/* Location */}
                {(editMode || localData.location) && (
                  <div className="flex items-center gap-2 min-w-max">
                    <MapPin className="w-4 h-4 text-yellow-400" />
                    {editMode ? (
                      <input
                        type="text"
                        value={localData.location || ""}
                        onChange={(e) =>
                          handleFieldChange("location", e.target.value)
                        }
                        className="bg-transparent border-b border-gray-600 text-white outline-none w-full max-w-[150px]"
                        placeholder="Location"
                      />
                    ) : (
                      <span>{localData.location}</span>
                    )}
                  </div>
                )}

                {/* LinkedIn */}
                {(editMode || localData.linkedin) && (
                  <div className="flex items-center gap-2 min-w-max">
                    <Linkedin className="w-4 h-4 text-yellow-400" />
                    {editMode ? (
                      <input
                        type="text"
                        value={localData.linkedin || ""}
                        onChange={(e) =>
                          handleFieldChange("linkedin", e.target.value)
                        }
                        className="bg-transparent border-b border-gray-600 text-white outline-none w-full max-w-[200px]"
                        placeholder="LinkedIn"
                      />
                    ) : (
                      <span>{localData.linkedin}</span>
                    )}
                  </div>
                )}

                {/* GitHub */}
                {(editMode || localData.github) && (
                  <div className="flex items-center gap-2 min-w-max">
                    <Github className="w-4 h-4 text-yellow-400" />
                    {editMode ? (
                      <input
                        type="text"
                        value={localData.github || ""}
                        onChange={(e) =>
                          handleFieldChange("github", e.target.value)
                        }
                        className="bg-transparent border-b border-gray-600 text-white outline-none w-full max-w-[200px]"
                        placeholder="GitHub"
                      />
                    ) : (
                      <a href={localData.github} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{localData.github}</a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col md:flex-row">
              {/* LEFT COLUMN */}
              <div className="flex-1 p-8">
                {/* Profile Summary */}
                {(editMode || localData.summary) && (
                  <>
                    <SectionHeading
                      title="Professional Summary"
                      icon={User}
                    />
                    {editMode ? (
                      <textarea
                        value={localData.summary}
                        onChange={(e) =>
                          handleFieldChange("summary", e.target.value)
                        }
                        className="w-full text-gray-700 leading-relaxed p-4 border border-gray-300 rounded-lg"
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed text-lg mb-6">
                        {resumeData.summary}
                      </p>
                    )}
                  </>
                )}

                {/* EXPERIENCE */}
                {(editMode ||
                  (localData.experience &&
                    localData.experience.length > 0)) && (
                    <>
                      <SectionHeading title="Experience" icon={Briefcase} />
                      <div className="space-y-6 mb-8">
                        {(localData.experience || []).map((exp, i) => (
                          <div
                            key={i}
                            className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-600 relative"
                          >
                            {editMode && (
                              <button
                                onClick={() =>
                                  handleRemoveItem("experience", i)
                                }
                                className="absolute top-2 right-2 text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}

                            {editMode ? (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={exp.title}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "experience",
                                      i,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  className="w-full font-bold p-2 border rounded"
                                  placeholder="Job Title"
                                />
                                <input
                                  type="text"
                                  value={exp.companyName}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "experience",
                                      i,
                                      "companyName",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 border rounded"
                                  placeholder="Company"
                                />
                                <input
                                  type="text"
                                  value={exp.date}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "experience",
                                      i,
                                      "date",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 border rounded"
                                  placeholder="Date"
                                />
                                <textarea
                                  value={exp.accomplishment}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "experience",
                                      i,
                                      "accomplishment",
                                      [e.target.value]
                                    )
                                  }
                                  className="w-full p-2 border rounded"
                                  rows={3}
                                  placeholder="Description"
                                />
                              </div>
                            ) : (
                              <>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">
                                  {exp.title}
                                </h3>
                                <div className="flex items-center gap-4 mb-3">
                                  <span className="text-lg font-semibold text-blue-600">
                                    {exp.companyName}
                                  </span>
                                  <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />{" "}
                                    {exp.date}
                                  </span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                  {Array.isArray(exp.accomplishment)
                                    ? exp.accomplishment[0]
                                    : exp.accomplishment}
                                </p>
                              </>
                            )}
                          </div>
                        ))}

                        {editMode && (
                          <button
                            onClick={() =>
                              handleAddItem("experience", {
                                title: "New Role",
                                companyName: "Company",
                                date: "Date",
                                accomplishment: ["Description"],
                              })
                            }
                            className="flex items-center gap-2 text-blue-600 mt-2 font-medium"
                          >
                            <Plus size={16} /> Add Experience
                          </button>
                        )}
                      </div>
                    </>
                  )}

                {/* PROJECTS */}
                {(editMode ||
                  (localData.projects &&
                    localData.projects.length > 0)) && (
                    <>
                      <SectionHeading title="Projects" icon={Code} />
                      <div className="space-y-6 mb-8">
                        {(localData.projects || []).map((proj, i) => (
                          <div
                            key={i}
                            className="bg-gray-50 rounded-xl p-6 border-l-4 border-purple-600 relative"
                          >
                            {editMode && (
                              <button
                                onClick={() =>
                                  handleRemoveItem("projects", i)
                                }
                                className="absolute top-2 right-2 text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}

                            {editMode ? (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={proj.name}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "projects",
                                      i,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="w-full font-bold p-2 border rounded"
                                  placeholder="Project Name"
                                />
                                <input
                                  type="text"
                                  value={proj.link}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "projects",
                                      i,
                                      "link",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 border rounded"
                                  placeholder="Link"
                                />
                                <textarea
                                  value={proj.description}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "projects",
                                      i,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 border rounded"
                                  rows={3}
                                  placeholder="Description"
                                />
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className="text-xl font-bold text-gray-800">
                                    {proj.name}
                                  </h3>
                                  {proj.link && (
                                    <a
                                      href={proj.link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                                    >
                                      View <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                  {proj.description}
                                </p>
                              </>
                            )}
                          </div>
                        ))}

                        {editMode && (
                          <button
                            onClick={() =>
                              handleAddItem("projects", {
                                name: "New Project",
                                link: "",
                                description: "Description",
                              })
                            }
                            className="flex items-center gap-2 text-blue-600 mt-2 font-medium"
                          >
                            <Plus size={16} /> Add Project
                          </button>
                        )}
                      </div>
                    </>
                  )}

                {/* ACHIEVEMENTS */}
                {(editMode ||
                  (localData.achievements &&
                    localData.achievements.length > 0)) && (
                    <div>
                      <SectionHeading title="Achievements" icon={Award} />
                      <div className="space-y-4 mb-8">
                        {(localData.achievements || []).map((ach, i) => (
                          <div key={i} className="relative">
                            {editMode && (
                              <button
                                onClick={() =>
                                  handleRemoveItem("achievements", i)
                                }
                                className="absolute top-0 right-0 text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}

                            {editMode ? (
                              <div className="p-2 border rounded mb-2">
                                <input
                                  type="text"
                                  value={
                                    typeof ach === "string"
                                      ? ach
                                      : ach.title
                                  }
                                  onChange={(e) => {
                                    const newArr = [
                                      ...localData.achievements,
                                    ];
                                    if (typeof ach === "string")
                                      newArr[i] = e.target.value;
                                    else
                                      newArr[i] = {
                                        ...ach,
                                        title: e.target.value,
                                      };

                                    setLocalData({
                                      ...localData,
                                      achievements: newArr,
                                    });
                                  }}
                                  className="w-full p-1 border-b mb-1 font-bold"
                                />
                                {typeof ach === "object" && (
                                  <input
                                    type="text"
                                    value={ach.description}
                                    onChange={(e) =>
                                      handleNestedChange(
                                        "achievements",
                                        i,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-1 text-sm"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <h4 className="font-bold text-gray-800">
                                  {typeof ach === "string"
                                    ? ach
                                    : ach.title}
                                </h4>
                                {typeof ach === "object" && (
                                  <p className="text-sm text-gray-600">
                                    {ach.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {editMode && (
                          <button
                            onClick={() =>
                              handleAddItem("achievements", {
                                title: "Achievement",
                                description: "Details",
                              })
                            }
                            className="flex items-center gap-2 text-blue-600 mt-2 font-medium"
                          >
                            <Plus size={16} /> Add Achievement
                          </button>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* RIGHT COLUMN */}
              <div className="w-full md:w-80 bg-gray-50 p-8 border-l border-gray-200">
                {/* EDUCATION */}
                {(editMode ||
                  (localData.education &&
                    localData.education.length > 0)) && (
                    <div>
                      <SectionHeading
                        title="Education"
                        icon={GraduationCap}
                      />
                      <div className="space-y-4 mb-8">
                        {(localData.education || []).map((edu, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-xl p-4 shadow-sm relative"
                          >
                            {editMode && (
                              <button
                                onClick={() =>
                                  handleRemoveItem("education", i)
                                }
                                className="absolute top-2 right-2 text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}

                            {editMode ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "education",
                                      i,
                                      "degree",
                                      e.target.value
                                    )
                                  }
                                  className="w-full font-bold p-1 border rounded"
                                  placeholder="Degree"
                                />
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "education",
                                      i,
                                      "institution",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 border rounded"
                                  placeholder="Institution"
                                />
                                <input
                                  type="text"
                                  value={edu.duration}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "education",
                                      i,
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 border rounded"
                                  placeholder="Year"
                                />
                              </div>
                            ) : (
                              <>
                                <h3 className="text-lg font-bold text-gray-800">
                                  {edu.degree}
                                </h3>
                                <p className="text-blue-600 font-semibold">
                                  {edu.institution}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {edu.duration}
                                </p>
                              </>
                            )}
                          </div>
                        ))}

                        {editMode && (
                          <button
                            onClick={() =>
                              handleAddItem("education", {
                                degree: "Degree",
                                institution: "University",
                                duration: "Year",
                              })
                            }
                            className="flex items-center gap-2 text-blue-600 mt-2 text-sm font-medium"
                          >
                            <Plus size={14} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                {/* CERTIFICATIONS */}
                {(editMode ||
                  (localData.certifications &&
                    localData.certifications.length > 0)) && (
                    <div>
                      <SectionHeading
                        title="Certifications"
                        icon={Scroll}
                      />
                      <div className="space-y-4 mb-8">
                        {(localData.certifications || []).map((cert, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-xl p-4 shadow-sm relative"
                          >
                            {editMode && (
                              <button
                                onClick={() =>
                                  handleRemoveItem("certifications", i)
                                }
                                className="absolute top-1 right-1 text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}

                            {editMode ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={cert.title}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "certifications",
                                      i,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  className="w-full font-bold p-1 border rounded"
                                  placeholder="Title"
                                />
                                <input
                                  type="text"
                                  value={cert.issuer}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "certifications",
                                      i,
                                      "issuer",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 border rounded"
                                  placeholder="Issuer"
                                />
                                <input
                                  type="text"
                                  value={cert.date}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "certifications",
                                      i,
                                      "date",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 border rounded"
                                  placeholder="Date"
                                />
                              </div>
                            ) : (
                              <>
                                <h3 className="text-md font-bold text-gray-800">
                                  {cert.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {cert.issuer} | {cert.date}
                                </p>
                              </>
                            )}
                          </div>
                        ))}

                        {editMode && (
                          <button
                            onClick={() =>
                              handleAddItem("certifications", {
                                title: "Certificate",
                                issuer: "Issuer",
                                date: "Date",
                              })
                            }
                            className="flex items-center gap-2 text-blue-600 mt-2 text-sm font-medium"
                          >
                            <Plus size={14} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                {/* COURSES */}
                {(editMode ||
                  (localData.courses &&
                    localData.courses.length > 0)) && (
                    <div>
                      <SectionHeading title="Courses" icon={BookOpen} />
                      <div className="space-y-4 mb-8">
                        {(localData.courses || []).map((course, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-xl p-4 shadow-sm relative"
                          >
                            {editMode && (
                              <button
                                onClick={() =>
                                  handleRemoveItem("courses", i)
                                }
                                className="absolute top-1 right-1 text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}

                            {editMode ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={course.title}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "courses",
                                      i,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  className="w-full font-bold p-1 border rounded"
                                  placeholder="Course Name"
                                />
                                <input
                                  type="text"
                                  value={course.description}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "courses",
                                      i,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 border rounded"
                                  placeholder="Provider/Details"
                                />
                              </div>
                            ) : (
                              <>
                                <h3 className="text-md font-bold text-gray-800">
                                  {course.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {course.description}
                                </p>
                              </>
                            )}
                          </div>
                        ))}

                        {editMode && (
                          <button
                            onClick={() =>
                              handleAddItem("courses", {
                                title: "Course Name",
                                description: "Provider",
                              })
                            }
                            className="flex items-center gap-1 text-blue-600 text-xs font-bold mt-2"
                          >
                            <Plus size={14} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                {/* SKILLS */}
                {(editMode ||
                  (localData.skills &&
                    localData.skills.length > 0)) && (
                    <div>
                      <SectionHeading title="Skills" icon={Award} />
                      <div className="bg-white rounded-xl p-4 shadow-sm mb-8">
                        {editMode ? (
                          <ChipInput
                            chips={localData.skills || []}
                            onChange={(newChips) =>
                              handleFieldChange("skills", newChips)
                            }
                            placeholder="Type a skill and press Enter or Comma"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(resumeData.skills || []).map((skill, i) => (
                              <span
                                key={i}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* LANGUAGES */}
                {(editMode ||
                  (localData.languages &&
                    localData.languages.length > 0)) && (
                    <div>
                      <SectionHeading title="Languages" icon={Globe} />
                      <div className="bg-white rounded-xl p-4 shadow-sm mb-8">
                        {editMode ? (
                          <ChipInput
                            chips={localData.languages || []}
                            onChange={(newChips) =>
                              handleFieldChange("languages", newChips)
                            }
                            placeholder="Type a language and press Enter or Comma"
                          />
                        ) : (
                          <div className="space-y-2">
                            {(resumeData.languages || []).map(
                              (lang, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                >
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  <span className="text-gray-700">
                                    {lang}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* INTERESTS */}
                {(editMode ||
                  (localData.interests &&
                    localData.interests.length > 0)) && (
                    <div>
                      <SectionHeading title="Interests" icon={Heart} />
                      <div className="bg-white rounded-xl p-4 shadow-sm mb-8">
                        {editMode ? (
                          <ChipInput
                            chips={localData.interests || []}
                            onChange={(newChips) =>
                              handleFieldChange("interests", newChips)
                            }
                            placeholder="Type an interest and press Enter or Comma"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(resumeData.interests || []).map(
                              (interest, i) => (
                                <span
                                  key={i}
                                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                                >
                                  {interest}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Edit Buttons */}
          <div className="mt-8 text-center">
            {editMode ? (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg"
              >
                Edit Resume
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template13;
