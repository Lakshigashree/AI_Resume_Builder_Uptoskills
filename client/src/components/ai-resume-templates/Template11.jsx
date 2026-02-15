import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { 
  FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaGlobe, 
  FaPlus, FaTrash, FaSave, FaTimes, FaEdit,
  FaGraduationCap, FaBriefcase, FaAward, FaCertificate, FaLanguage, FaLightbulb,
  FaCheckCircle, FaPlusCircle
} from "react-icons/fa";
import { toast } from "react-toastify";

const Template11 = () => {
  const resumeRef = useRef(null);
  const { resumeData, updateResumeData, sectionOrder } = useResume();
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // 1. SYNC DATA FROM CONTEXT
  useEffect(() => {
    if (resumeData && Object.keys(resumeData).length > 0) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
    } else {
      // Default data structure
      const defaultData = {
        name: "Your Name",
        role: "Your Job Title",
        email: "email@example.com",
        phone: "+1 234 567 8900",
        linkedin: "linkedin.com/in/username",
        github: "github.com/username",
        portfolio: "portfolio.com",
        summary: "Write a compelling professional summary highlighting your key strengths and career goals...",
        experience: [
          {
            title: "Job Title",
            companyName: "Company Name",
            date: "2022 - Present",
            accomplishment: ["Key accomplishment 1", "Key accomplishment 2"]
          }
        ],
        education: [
          {
            degree: "Degree Name",
            institution: "Institution Name",
            duration: "2018 - 2022"
          }
        ],
        skills: ["React", "Node.js", "JavaScript", "Python", "MongoDB"],
        projects: [
          {
            name: "Project Name",
            description: "Project description goes here"
          }
        ],
        certifications: [
          {
            title: "Certification Name"
          }
        ],
        achievements: ["Achievement 1", "Achievement 2"],
        languages: ["English", "Spanish", "French"],
        interests: ["Reading", "Traveling", "Photography"],
        templateId: 11
      };
      setLocalData(defaultData);
    }
  }, [resumeData]);

  // 2. LISTEN FOR SIDEBAR FLOATING EDIT BUTTON
  useEffect(() => {
    const handleToggleEdit = (e) => {
      setEditMode(e.detail);
    };
    window.addEventListener("toggleEditMode", handleToggleEdit);
    return () => window.removeEventListener("toggleEditMode", handleToggleEdit);
  }, []);

  // --- Handlers ---
  const handleFieldChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayUpdate = (section, index, key, value) => {
    const updated = [...(localData[section] || [])];
    if (typeof updated[index] === 'object' && updated[index] !== null) {
      updated[index] = { ...updated[index], [key]: value };
    } else {
      updated[index] = value;
    }
    setLocalData((prev) => ({ ...prev, [section]: updated }));
  };

  const handleAddItem = (section, emptyItem) => {
    setLocalData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), emptyItem],
    }));
    toast.info(`Added new ${section} item`);
  };

  const handleRemoveItem = (section, index) => {
    const updated = [...(localData[section] || [])];
    updated.splice(index, 1);
    setLocalData((prev) => ({ ...prev, [section]: updated }));
    toast.warn(`Removed ${section} item`);
  };

  // ========== FIXED SKILLS HANDLER ==========
  const handleAddSkill = () => {
    if (!newSkill.trim()) {
      toast.warn("Please enter a skill");
      return;
    }
    
    const currentSkills = localData.skills || [];
    const updatedSkills = [...currentSkills, newSkill.trim()];
    handleFieldChange("skills", updatedSkills);
    setNewSkill("");
    toast.success(`Added skill: ${newSkill}`);
  };

  const handleRemoveSkill = (index) => {
    const currentSkills = localData.skills || [];
    const updatedSkills = currentSkills.filter((_, i) => i !== index);
    handleFieldChange("skills", updatedSkills);
    toast.warn("Skill removed");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateResumeData(localData);
      setEditMode(false);
      toast.success("✅ Save Successful");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("❌ Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(resumeData ? JSON.parse(JSON.stringify(resumeData)) : null);
    setEditMode(false);
    toast.info("Changes discarded");
  };

  const getSafeUrl = (link) => {
    if (!link) return "#";
    return link.startsWith("http") ? link : `https://${link}`;
  };

  if (!localData) return null;

  // --- Dynamic Section Renderer ---
  const renderSection = (sectionKey) => {
    const data = localData[sectionKey];
    const blockClass = editMode 
      ? "mb-6 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 relative" 
      : "mb-6";

    const titleClass = "text-sm font-bold border-b border-gray-800 pb-1 mb-3 uppercase tracking-widest text-gray-900 flex items-center gap-2";

    switch (sectionKey) {
      case "summary":
        return (data || editMode) && (
          <section key="summary" className={blockClass}>
            <h2 className={titleClass}>
              <FaAward className="text-gray-600" size={14} />
              Summary
            </h2>
            {editMode ? (
              <textarea
                value={data || ""}
                onChange={(e) => handleFieldChange("summary", e.target.value)}
                className="w-full p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-400"
                rows={3}
                placeholder="Write your professional summary..."
              />
            ) : (
              <p className="text-gray-600 text-[13px] leading-relaxed text-justify">{data}</p>
            )}
          </section>
        );

      case "experience":
        return (data?.length > 0 || editMode) && (
          <section key="experience" className={blockClass}>
            <div className={titleClass}>
              <FaBriefcase className="text-gray-600" size={14} />
              <span>Experience</span>
              {editMode && (
                <button 
                  data-html2canvas-ignore="true" 
                  onClick={() => handleAddItem("experience", { title: "", companyName: "", date: "", accomplishment: [] })} 
                  className="ml-auto text-blue-600 hover:text-blue-800 transition-colors"
                  title="Add Experience"
                >
                  <FaPlus size={12} />
                </button>
              )}
            </div>
            {data?.map((exp, i) => (
              <div key={i} className={`mb-4 ${editMode ? "bg-white p-3 border rounded mb-2 relative" : ""}`}>
                {editMode && (
                  <button 
                    data-html2canvas-ignore="true" 
                    onClick={() => handleRemoveItem("experience", i)} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remove"
                  >
                    <FaTrash size={10} />
                  </button>
                )}
                {editMode ? (
                  <div className="space-y-2">
                    <input 
                      value={exp.title || ""} 
                      onChange={(e) => handleArrayUpdate("experience", i, "title", e.target.value)} 
                      className="w-full text-xs font-bold border-b p-1" 
                      placeholder="Job Title"
                    />
                    <input 
                      value={exp.companyName || ""} 
                      onChange={(e) => handleArrayUpdate("experience", i, "companyName", e.target.value)} 
                      className="w-full text-xs border-b p-1" 
                      placeholder="Company Name"
                    />
                    <input 
                      value={exp.date || ""} 
                      onChange={(e) => handleArrayUpdate("experience", i, "date", e.target.value)} 
                      className="w-full text-xs border-b p-1" 
                      placeholder="Date (e.g., 2022-Present)"
                    />
                    <textarea 
                      value={(exp.accomplishment || []).join("\n")} 
                      onChange={(e) => handleArrayUpdate("experience", i, "accomplishment", e.target.value.split("\n").filter(line => line.trim()))} 
                      className="w-full text-[11px] border p-1" 
                      placeholder="Accomplishments (one per line)"
                      rows={3}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-[14px] font-bold text-gray-800">{exp.title}</h3>
                      <span className="text-[11px] font-medium text-gray-400 uppercase">{exp.date}</span>
                    </div>
                    <p className="text-blue-700 text-[12px] font-semibold mb-1">{exp.companyName}</p>
                    {exp.accomplishment?.length > 0 && (
                      <ul className="space-y-1">
                        {exp.accomplishment.map((bullet, idx) => bullet && (
                          <li key={idx} className="text-[12px] text-gray-600 flex gap-2">
                            <span className="text-gray-400">•</span> {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            ))}
          </section>
        );

      case "projects":
        return (data?.length > 0 || editMode) && (
          <section key="projects" className={blockClass}>
            <div className={titleClass}>
              <FaBriefcase className="text-gray-600" size={14} />
              <span>Projects</span>
              {editMode && (
                <button 
                  data-html2canvas-ignore="true" 
                  onClick={() => handleAddItem("projects", { name: "", description: "" })} 
                  className="ml-auto text-blue-600 hover:text-blue-800 transition-colors"
                  title="Add Project"
                >
                  <FaPlus size={12} />
                </button>
              )}
            </div>
            {data?.map((proj, i) => (
              <div key={i} className={`mb-3 ${editMode ? "bg-white p-2 border rounded relative" : ""}`}>
                {editMode && (
                  <button 
                    data-html2canvas-ignore="true" 
                    onClick={() => handleRemoveItem("projects", i)} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remove"
                  >
                    <FaTrash size={10} />
                  </button>
                )}
                {editMode ? (
                  <>
                    <input 
                      value={proj.name || ""} 
                      onChange={(e) => handleArrayUpdate("projects", i, "name", e.target.value)} 
                      className="w-full text-xs font-bold p-1 border-b mb-2" 
                      placeholder="Project Name"
                    />
                    <textarea 
                      value={proj.description || ""} 
                      onChange={(e) => handleArrayUpdate("projects", i, "description", e.target.value)} 
                      className="w-full text-[11px] border p-1" 
                      placeholder="Project Description"
                      rows={2}
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-[13px] font-bold text-gray-800">{proj.name}</h3>
                    <p className="text-[12px] text-gray-600">{proj.description}</p>
                  </>
                )}
              </div>
            ))}
          </section>
        );

      // ========== FIXED SKILLS SECTION ==========
      case "skills":
        return (data?.length > 0 || editMode) && (
          <section key="skills" className={blockClass}>
            <h2 className={titleClass}>
              <FaAward className="text-gray-600" size={14} />
              Skills
            </h2>
            
            {editMode ? (
              <div>
                {/* Add new skill input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-xs p-2 border rounded"
                    placeholder="Enter a skill (e.g., React) and press Enter or click Add"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                  >
                    <FaPlusCircle size={12} /> Add
                  </button>
                </div>
                
                {/* Skills list */}
                <div className="flex flex-wrap gap-2">
                  {data?.map((skill, i) => (
                    <div key={i} className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 flex items-center gap-2">
                      <span className="text-[12px] text-blue-800">{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(i)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove skill"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  ))}
                  {(!data || data.length === 0) && (
                    <p className="text-gray-400 italic text-xs">No skills added yet. Add your first skill above.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data?.map((skill, i) => (
                  <span key={i} className="text-[12px] text-gray-700 border border-gray-300 px-3 py-1 rounded-full bg-gray-50">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>
        );

      case "education":
        return (data?.length > 0 || editMode) && (
          <section key="education" className={blockClass}>
            <div className={titleClass}>
              <FaGraduationCap className="text-gray-600" size={14} />
              <span>Education</span>
              {editMode && (
                <button 
                  data-html2canvas-ignore="true" 
                  onClick={() => handleAddItem("education", { degree: "", institution: "", duration: "" })} 
                  className="ml-auto text-blue-600 hover:text-blue-800 transition-colors"
                  title="Add Education"
                >
                  <FaPlus size={12} />
                </button>
              )}
            </div>
            {data?.map((edu, i) => (
              <div key={i} className={`mb-2 ${editMode ? "bg-white p-2 border rounded relative" : ""}`}>
                {editMode && (
                  <button 
                    data-html2canvas-ignore="true" 
                    onClick={() => handleRemoveItem("education", i)} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remove"
                  >
                    <FaTrash size={10} />
                  </button>
                )}
                {editMode ? (
                  <>
                    <input 
                      value={edu.degree || ""} 
                      onChange={(e) => handleArrayUpdate("education", i, "degree", e.target.value)} 
                      className="w-full text-xs border-b p-1 mb-1" 
                      placeholder="Degree"
                    />
                    <input 
                      value={edu.institution || ""} 
                      onChange={(e) => handleArrayUpdate("education", i, "institution", e.target.value)} 
                      className="w-full text-xs border-b p-1 mb-1" 
                      placeholder="Institution"
                    />
                    <input 
                      value={edu.duration || ""} 
                      onChange={(e) => handleArrayUpdate("education", i, "duration", e.target.value)} 
                      className="w-full text-xs border-b p-1" 
                      placeholder="Duration"
                    />
                  </>
                ) : (
                  <div className="flex justify-between font-bold text-[13px]">
                    <span>{edu.degree}</span>
                    <span className="text-[11px] text-gray-400">{edu.duration}</span>
                  </div>
                )}
              </div>
            ))}
          </section>
        );

      case "achievements":
        return (data?.length > 0 || editMode) && (
          <section key="achievements" className={blockClass}>
            <div className={titleClass}>
              <FaAward className="text-gray-600" size={14} />
              <span>Achievements</span>
              {editMode && (
                <button 
                  data-html2canvas-ignore="true" 
                  onClick={() => handleAddItem("achievements", "")} 
                  className="ml-auto text-blue-600 hover:text-blue-800 transition-colors"
                  title="Add Achievement"
                >
                  <FaPlus size={12} />
                </button>
              )}
            </div>
            {editMode ? (
              <div className="space-y-2">
                {data?.map((ach, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={typeof ach === 'string' ? ach : ach.title || ""}
                      onChange={(e) => {
                        if (Array.isArray(data)) {
                          const updated = [...data];
                          updated[i] = e.target.value;
                          handleFieldChange("achievements", updated);
                        }
                      }}
                      className="flex-1 text-xs border p-1 rounded"
                      placeholder="Achievement"
                    />
                    <button
                      data-html2canvas-ignore="true"
                      onClick={() => handleRemoveItem("achievements", i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="list-disc list-inside text-[12px] text-gray-600 space-y-1">
                {data?.map((ach, i) => (
                  <li key={i}>{typeof ach === 'string' ? ach : ach.title}</li>
                ))}
              </ul>
            )}
          </section>
        );

      case "certifications":
        return (data?.length > 0 || editMode) && (
          <section key="certifications" className={blockClass}>
            <div className={titleClass}>
              <FaCertificate className="text-gray-600" size={14} />
              <span>Certifications</span>
              {editMode && (
                <button 
                  data-html2canvas-ignore="true" 
                  onClick={() => handleAddItem("certifications", { title: "" })} 
                  className="ml-auto text-blue-600 hover:text-blue-800 transition-colors"
                  title="Add Certification"
                >
                  <FaPlus size={12} />
                </button>
              )}
            </div>
            {editMode ? (
              <div className="space-y-2">
                {data?.map((cert, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={cert.title || ""}
                      onChange={(e) => handleArrayUpdate("certifications", i, "title", e.target.value)}
                      className="flex-1 text-xs border p-1 rounded"
                      placeholder="Certification Name"
                    />
                    <button
                      data-html2canvas-ignore="true"
                      onClick={() => handleRemoveItem("certifications", i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {data?.map((cert, i) => (
                  <div key={i} className="text-[11px] flex items-center gap-2">
                    <FaCheckCircle className="text-blue-600 flex-shrink-0" /> 
                    <span>{cert.title}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      case "languages":
        return (data?.length > 0 || editMode) && (
          <section key="languages" className={blockClass}>
            <div className={titleClass}>
              <FaLanguage className="text-gray-600" size={14} />
              <span>Languages</span>
              {editMode && (
                <button 
                  data-html2canvas-ignore="true" 
                  onClick={() => handleAddItem("languages", "")} 
                  className="ml-auto text-blue-600 hover:text-blue-800 transition-colors"
                  title="Add Language"
                >
                  <FaPlus size={12} />
                </button>
              )}
            </div>
            {editMode ? (
              <div className="space-y-2">
                {data?.map((lang, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={lang}
                      onChange={(e) => {
                        const updated = [...data];
                        updated[i] = e.target.value;
                        handleFieldChange("languages", updated);
                      }}
                      className="flex-1 text-xs border p-1 rounded"
                      placeholder="Language"
                    />
                    <button
                      data-html2canvas-ignore="true"
                      onClick={() => handleRemoveItem("languages", i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-gray-600">{data?.join(" • ")}</p>
            )}
          </section>
        );

      case "interests":
        return (data?.length > 0 || editMode) && (
          <section key="interests" className={blockClass}>
            <div className={titleClass}>
              <FaGlobe className="text-gray-600" size={14} />
              <span>Interests</span>
              {editMode && (
                <button 
                  data-html2canvas-ignore="true" 
                  onClick={() => handleAddItem("interests", "")} 
                  className="ml-auto text-blue-600 hover:text-blue-800 transition-colors"
                  title="Add Interest"
                >
                  <FaPlus size={12} />
                </button>
              )}
            </div>
            {editMode ? (
              <div className="space-y-2">
                {data?.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={item}
                      onChange={(e) => {
                        const updated = [...data];
                        updated[i] = e.target.value;
                        handleFieldChange("interests", updated);
                      }}
                      className="flex-1 text-xs border p-1 rounded"
                      placeholder="Interest"
                    />
                    <button
                      data-html2canvas-ignore="true"
                      onClick={() => handleRemoveItem("interests", i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data?.map((item, i) => (
                  <span key={i} className="text-[11px] border px-3 py-1 rounded-full bg-gray-50">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </section>
        );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col no-scrollbar">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar already has all the icons - preview, download, share */}
        <Sidebar resumeRef={resumeRef} />

        <div className="flex-1 flex flex-col items-center p-6 overflow-y-auto no-scrollbar pb-32">
          
          <div
            ref={resumeRef}
            className="w-full max-w-[210mm] bg-white shadow-xl p-14 min-h-[297mm] overflow-hidden flex flex-col"
            style={{ fontFamily: "'Inter', sans-serif" }}
            data-resume-template="template11"
          >
            {/* Header */}
            <header className="mb-8 text-center border-b-[6px] border-gray-900 pb-8">
              {editMode ? (
                <div className="space-y-2">
                  <input 
                    value={localData.name || ""} 
                    onChange={(e) => handleFieldChange("name", e.target.value)} 
                    className="text-4xl font-bold w-full text-center border-b p-1" 
                    placeholder="Your Name"
                  />
                  <input 
                    value={localData.role || ""} 
                    onChange={(e) => handleFieldChange("role", e.target.value)} 
                    className="text-lg w-full text-center text-blue-600 italic border-b p-1" 
                    placeholder="Job Title"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-5xl font-black uppercase tracking-tight text-gray-900 leading-tight">
                    {localData.name || "Your Name"}
                  </h1>
                  <p className="text-xl font-medium text-blue-700 tracking-widest uppercase opacity-80">
                    {localData.role || "Job Title"}
                  </p>
                </>
              )}

              <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-6 pt-6 border-t border-gray-100 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                {editMode ? (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <input 
                      value={localData.email || ""} 
                      onChange={(e) => handleFieldChange("email", e.target.value)} 
                      className="p-1 border text-[10px]" 
                      placeholder="Email"
                    />
                    <input 
                      value={localData.phone || ""} 
                      onChange={(e) => handleFieldChange("phone", e.target.value)} 
                      className="p-1 border text-[10px]" 
                      placeholder="Phone"
                    />
                    <input 
                      value={localData.linkedin || ""} 
                      onChange={(e) => handleFieldChange("linkedin", e.target.value)} 
                      className="p-1 border text-[10px]" 
                      placeholder="LinkedIn"
                    />
                    <input 
                      value={localData.github || ""} 
                      onChange={(e) => handleFieldChange("github", e.target.value)} 
                      className="p-1 border text-[10px]" 
                      placeholder="GitHub"
                    />
                    <input 
                      value={localData.portfolio || ""} 
                      onChange={(e) => handleFieldChange("portfolio", e.target.value)} 
                      className="p-1 border text-[10px]" 
                      placeholder="Portfolio"
                    />
                  </div>
                ) : (
                  <>
                    {localData.email && (
                      <a href={`mailto:${localData.email}`} className="hover:text-blue-600 transition-colors uppercase flex items-center gap-1">
                        <FaEnvelope size={12} /> Email
                      </a>
                    )}
                    {localData.phone && (
                      <a href={`tel:${localData.phone}`} className="hover:text-blue-600 transition-colors uppercase flex items-center gap-1">
                        <FaPhone size={12} /> Phone
                      </a>
                    )}
                    {localData.linkedin && (
                      <a href={getSafeUrl(localData.linkedin)} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors uppercase flex items-center gap-1">
                        <FaLinkedin size={12} /> LinkedIn
                      </a>
                    )}
                    {localData.github && (
                      <a href={getSafeUrl(localData.github)} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors uppercase flex items-center gap-1">
                        <FaGithub size={12} /> GitHub
                      </a>
                    )}
                    {localData.portfolio && (
                      <a href={getSafeUrl(localData.portfolio)} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors uppercase flex items-center gap-1">
                        <FaGlobe size={12} /> Portfolio
                      </a>
                    )}
                  </>
                )}
              </div>
            </header>

            <main className="flex-1">
              {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                "summary", "experience", "education", "skills", "projects", 
                "certifications", "achievements", "languages", "interests"
              ]).map((key) => (
                <React.Fragment key={key}>
                  {renderSection(key)}
                </React.Fragment>
              ))}
            </main>
          </div>

          {/* EDIT & SAVE BUTTONS */}
          <div data-html2canvas-ignore="true" className="fixed bottom-10 flex gap-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white z-50">
            {editMode ? (
              <>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <FaSave /> {isSaving ? "Saving..." : "Save"}
                </button>
                <button 
                  onClick={handleCancel} 
                  className="bg-gray-100 text-gray-600 px-8 py-2 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setEditMode(true)} 
                className="bg-blue-600 text-white px-10 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
              >
                <FaEdit /> Edit Resume
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template11;