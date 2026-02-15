import { useResume } from "../../context/ResumeContext";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import LoginPrompt from "../auth/LoginPrompt";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import { getContactIcon, getSectionIcon, getSafeUrl } from "../../utils/ResumeConfig";

const Template14 = () => {
  const resumeContext = useResume();
  const { isAuthenticated } = useAuth();
  
  // Destructure global state from context
  const { resumeData, updateResumeData, sectionOrder } = resumeContext || { sectionOrder: [] };
  
  const [localData, setLocalData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const resumeRef = useRef(null);
  const routerLocation = useLocation();
  const [downloadRequested, setDownloadRequested] = useState(false);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) setShowLoginPrompt(true);
  }, [isAuthenticated]);

  // Initialize local data from context
  useEffect(() => {
    if (resumeData && Object.keys(resumeData).length > 0) {
      // Deep clone to avoid reference issues
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
    } else {
      // Default data structure
      const defaultData = {
        personalInfo: {
          name: "Your Name",
          role: "Your Job Title",
          email: "email@example.com",
          phone: "+1 234 567 8900",
          linkedin: "linkedin.com/in/username",
          github: "github.com/username",
          portfolio: "portfolio.com",
          location: "City, Country"
        },
        summary: "Write a compelling professional summary...",
        experience: [
          {
            title: "Job Title",
            company: "Company Name",
            duration: "2022 - Present",
            accomplishments: ["Key accomplishment 1", "Key accomplishment 2"]
          }
        ],
        education: [
          {
            degree: "Degree Name",
            institution: "Institution Name",
            duration: "2018 - 2022",
            gpa: "3.8/4.0"
          }
        ],
        skills: ["Skill 1", "Skill 2", "Skill 3"],
        projects: [
          {
            name: "Project Name",
            description: "Project description",
            technologies: ["Tech1", "Tech2"],
            link: "project.link"
          }
        ],
        certifications: [
          {
            name: "Certification Name",
            organization: "Issuing Organization",
            year: "2024"
          }
        ],
        languages: [
          { name: "Language", proficiency: 4 }
        ],
        achievements: ["Achievement 1", "Achievement 2"],
        interests: ["Interest 1", "Interest 2"],
        templateId: 14,
        resumeMode: "fresher",
        hiddenData: {},
        textColor: "#ffffff", // For header text
        bgColor: "#2563eb",   // For header background
        font: "sans-serif"    // Font family
      };
      setLocalData(defaultData);
    }
  }, [resumeData]);

  // Auto-download trigger
  useEffect(() => {
    if (routerLocation.state?.triggerDownload && resumeRef.current && !downloadRequested) {
      setDownloadRequested(true);
      setTimeout(() => {
        handleDownload();
      }, 800);
    }
  }, [routerLocation.state, resumeRef]);

  // ---------- UTILITY FUNCTIONS ----------
  const renderSafe = (val) => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return val.toString();
    return val.name || val.title || val.degree || val.language || val || "";
  };

  // ---------- HANDLERS ----------
  const handlePersonalInfoChange = (field, value) => {
    setLocalData(prev => ({
      ...prev,
      personalInfo: {
        ...(prev?.personalInfo || {}),
        [field]: value
      }
    }));
  };

  const handleInputChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleObjectChange = (section, index, field, value) => {
    setLocalData(prev => {
      const updatedSection = [...(prev[section] || [])];
      if (updatedSection[index]) {
        if (typeof updatedSection[index] === 'string') {
          updatedSection[index] = value;
        } else {
          updatedSection[index] = { ...updatedSection[index], [field]: value };
        }
      }
      return { ...prev, [section]: updatedSection };
    });
  };

  const handleSimpleArrayChange = (section, index, value) => {
    setLocalData(prev => {
      const updated = [...(prev[section] || [])];
      updated[index] = value;
      return { ...prev, [section]: updated };
    });
  };

  const addItem = (section, newItem) => {
    setLocalData(prev => ({
      ...prev,
      [section]: [...(Array.isArray(prev[section]) ? prev[section] : []), newItem]
    }));
  };

  const removeItem = (section, index) => {
    setLocalData(prev => {
      const updatedSection = (prev[section] || []).filter((_, i) => i !== index);
      return { ...prev, [section]: updatedSection };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (typeof updateResumeData !== 'function') {
        throw new Error('Update function missing');
      }
      await updateResumeData(localData);
      setEditMode(false);
      toast.success('✅ Changes Saved Successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(resumeData ? JSON.parse(JSON.stringify(resumeData)) : {});
    setEditMode(false);
    toast.info('Changes discarded');
  };

  const handleDownload = () => {
    const element = resumeRef.current;
    if (!element) {
      toast.error('Resume content not found');
      return;
    }

    const options = {
      margin: 0,
      filename: `${localData.personalInfo?.name || 'Resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        ignoreElements: (element) => 
          element.getAttribute('data-html2canvas-ignore') === 'true'
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    toast.info('Generating PDF...');
    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => toast.success('✅ Download complete!'))
      .catch((err) => {
        console.error(err);
        toast.error('Download failed');
      });
  };

  // Check if section has content
  const hasContent = (data, key) => {
    if (editMode) return true;
    const val = data?.[key];
    if (!val) return false;
    
    if (Array.isArray(val)) {
      if (val.length === 0) return false;
      return val.some(item => {
        if (!item) return false;
        if (typeof item === 'string') return item.trim().length > 0;
        return Object.values(item).some(v => 
          v && typeof v === 'string' && v.trim().length > 0
        );
      });
    }
    if (typeof val === 'string') return val.trim().length > 0;
    return true;
  };

  // Edit mode styles
  const editBoxStyle = editMode ? {
    border: "1px dashed #3b82f6",
    backgroundColor: "#eff6ff",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
    position: "relative"
  } : { marginBottom: "20px" };

  const inputStyle = {
    width: "100%",
    border: "1px solid #d1d5db",
    padding: "8px 12px",
    borderRadius: "6px",
    marginBottom: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s"
  };

  const personalInfo = localData.personalInfo || {};
  const {
    name = "",
    role = "",
    email = "",
    phone = "",
    linkedin = "",
    github = "",
    portfolio = "",
    location = ""
  } = personalInfo;

  // Section components (same structure as Template 1)
  const sectionComponents = {
    summary: hasContent(localData, "summary") && (
      <div key="summary" style={editBoxStyle}>
        <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
          <h2 className="text-xl font-bold flex items-center">
            {getSectionIcon("summary", editMode ? "#000" : "#00796b", 18)}
            Professional Summary
          </h2>
        </div>
        {editMode ? (
          <textarea
            style={{ ...inputStyle, minHeight: "100px" }}
            value={renderSafe(localData.summary)}
            onChange={(e) => handleInputChange("summary", e.target.value)}
            placeholder="Write a compelling professional summary..."
          />
        ) : (
          <p className="text-gray-700 leading-relaxed">{renderSafe(localData.summary)}</p>
        )}
      </div>
    ),

    experience: hasContent(localData, "experience") && (
      <div key="experience" style={editBoxStyle}>
        <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
          <h2 className="text-xl font-bold flex items-center">
            {getSectionIcon("experience", editMode ? "#000" : "#00796b", 18)}
            Experience
          </h2>
          {editMode && (
            <button
              onClick={() => addItem("experience", { title: "", company: "", duration: "", accomplishments: [] })}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              + Add
            </button>
          )}
        </div>

        {(localData.experience || []).map((exp, i) => (
          <div key={i} style={{ marginBottom: "1.5rem", position: "relative" }}>
            {editMode ? (
              <div style={{ border: "1px solid #e5e7eb", padding: "15px", borderRadius: "8px", marginBottom: "10px" }}>
                <input
                  style={inputStyle}
                  value={renderSafe(exp.title)}
                  onChange={(e) => handleObjectChange("experience", i, "title", e.target.value)}
                  placeholder="Job Title"
                />
                <input
                  style={inputStyle}
                  value={renderSafe(exp.company)}
                  onChange={(e) => handleObjectChange("experience", i, "company", e.target.value)}
                  placeholder="Company Name"
                />
                <input
                  style={inputStyle}
                  value={exp.duration || ""}
                  onChange={(e) => handleObjectChange("experience", i, "duration", e.target.value)}
                  placeholder="Duration (e.g., Jan 2022 - Present)"
                />
                <textarea
                  style={{ ...inputStyle, minHeight: "80px" }}
                  value={(exp.accomplishments || []).join("\n")}
                  onChange={(e) => handleObjectChange(
                    "experience",
                    i,
                    "accomplishments",
                    e.target.value.split("\n").filter(line => line.trim())
                  )}
                  placeholder="Accomplishments (one per line)"
                />
                <button
                  onClick={() => removeItem("experience", i)}
                  style={{ color: "red", border: "none", background: "none", fontSize: "0.8rem", marginTop: "5px" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-black">{exp.title || "Position Title"}</h3>
                <p className="italic text-gray-700">
                  {exp.company || "Company Name"}
                  {exp.duration && <span className="text-gray-500"> — {exp.duration}</span>}
                </p>
                {exp.accomplishments && exp.accomplishments.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 mt-2">
                    {exp.accomplishments.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    ),

    education: hasContent(localData, "education") && (
      <div key="education" style={editBoxStyle}>
        <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
          <h2 className="text-xl font-bold flex items-center">
            {getSectionIcon("education", editMode ? "#000" : "#00796b", 18)}
            Education
          </h2>
          {editMode && (
            <button
              onClick={() => addItem("education", { degree: "", institution: "", duration: "", gpa: "" })}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              + Add
            </button>
          )}
        </div>

        {(localData.education || []).map((edu, i) => (
          <div key={i} style={{ marginBottom: "1rem", position: "relative" }}>
            {editMode ? (
              <div style={{ border: "1px solid #e5e7eb", padding: "15px", borderRadius: "8px", marginBottom: "10px" }}>
                <input
                  style={inputStyle}
                  value={renderSafe(edu.degree)}
                  onChange={(e) => handleObjectChange("education", i, "degree", e.target.value)}
                  placeholder="Degree"
                />
                <input
                  style={inputStyle}
                  value={renderSafe(edu.institution)}
                  onChange={(e) => handleObjectChange("education", i, "institution", e.target.value)}
                  placeholder="Institution"
                />
                <input
                  style={inputStyle}
                  value={edu.duration || ""}
                  onChange={(e) => handleObjectChange("education", i, "duration", e.target.value)}
                  placeholder="Duration"
                />
                <input
                  style={inputStyle}
                  value={edu.gpa || ""}
                  onChange={(e) => handleObjectChange("education", i, "gpa", e.target.value)}
                  placeholder="GPA (Optional)"
                />
                <button
                  onClick={() => removeItem("education", i)}
                  style={{ color: "red", border: "none", background: "none", fontSize: "0.8rem", marginTop: "5px" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-black">{edu.degree || "Degree"}</h3>
                <p className="italic text-gray-700">
                  {edu.institution || "Institution"}
                  {edu.duration && <span className="text-gray-500"> — {edu.duration}</span>}
                  {edu.gpa && <span className="text-gray-500"> | GPA: {edu.gpa}</span>}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    ),

    projects: hasContent(localData, "projects") && (
      <div key="projects" style={editBoxStyle}>
        <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
          <h2 className="text-xl font-bold flex items-center">
            {getSectionIcon("projects", editMode ? "#000" : "#00796b", 18)}
            Projects
          </h2>
          {editMode && (
            <button
              onClick={() => addItem("projects", { name: "", description: "", technologies: [], link: "" })}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              + Add
            </button>
          )}
        </div>

        {(localData.projects || []).map((proj, i) => (
          <div key={i} style={{ marginBottom: "1.2rem", position: "relative" }}>
            {editMode ? (
              <div style={{ border: "1px solid #e5e7eb", padding: "15px", borderRadius: "8px", marginBottom: "10px" }}>
                <input
                  style={inputStyle}
                  value={renderSafe(proj.name)}
                  onChange={(e) => handleObjectChange("projects", i, "name", e.target.value)}
                  placeholder="Project Name"
                />
                <textarea
                  style={{ ...inputStyle, minHeight: "60px" }}
                  value={proj.description || ""}
                  onChange={(e) => handleObjectChange("projects", i, "description", e.target.value)}
                  placeholder="Project Description"
                />
                <input
                  style={inputStyle}
                  value={(proj.technologies || []).join(", ")}
                  onChange={(e) => handleObjectChange(
                    "projects",
                    i,
                    "technologies",
                    e.target.value.split(",").map(tech => tech.trim())
                  )}
                  placeholder="Technologies (comma-separated)"
                />
                <input
                  style={inputStyle}
                  value={proj.link || ""}
                  onChange={(e) => handleObjectChange("projects", i, "link", e.target.value)}
                  placeholder="Project Link (Optional)"
                />
                <button
                  onClick={() => removeItem("projects", i)}
                  style={{ color: "red", border: "none", background: "none", fontSize: "0.8rem", marginTop: "5px" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-black">
                  {proj.name || "Project Name"}
                  {proj.link && (
                    <a
                      href={getSafeUrl("portfolio", proj.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm ml-2 hover:underline"
                    >
                      🔗 Link
                    </a>
                  )}
                </h3>
                <p className="text-gray-700">{proj.description}</p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Tech: {proj.technologies.join(", ")}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    ),

    skills: hasContent(localData, "skills") && (
      <div key="skills" style={editBoxStyle}>
        <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
          <h2 className="text-xl font-bold flex items-center">
            {getSectionIcon("skills", editMode ? "#000" : "#00796b", 18)}
            Skills
          </h2>
          {editMode && (
            <button
              onClick={() => addItem("skills", "")}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              + Add
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(localData.skills || []).map((skill, i) => (
            <div key={i} style={{ display: "inline-block" }}>
              {editMode ? (
                <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                  <input
                    style={{ ...inputStyle, width: "150px", marginBottom: 0 }}
                    value={renderSafe(skill)}
                    onChange={(e) => handleSimpleArrayChange("skills", i, e.target.value)}
                    placeholder="Skill"
                  />
                  <button
                    onClick={() => removeItem("skills", i)}
                    style={{ color: "red", border: "none", background: "none", marginLeft: "5px" }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium mr-2 mb-2">
                  {renderSafe(skill)}
                </span>
              )}
            </div>
          ))}
          {editMode && (localData.skills || []).length === 0 && (
            <p className="text-gray-400 italic">Click + Add to add skills</p>
          )}
        </div>
      </div>
    ),

    languages: hasContent(localData, "languages") && (
      <div key="languages" style={editBoxStyle}>
        <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
          <h2 className="text-xl font-bold flex items-center">
            {getSectionIcon("languages", editMode ? "#000" : "#00796b", 18)}
            Languages
          </h2>
          {editMode && (
            <button
              onClick={() => addItem("languages", { name: "", proficiency: 4 })}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              + Add
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(localData.languages || []).map((lang, i) => (
            <div key={i}>
              {editMode ? (
                <div style={{ border: "1px solid #e5e7eb", padding: "10px", borderRadius: "8px", marginBottom: "8px", width: "200px" }}>
                  <input
                    style={{ ...inputStyle, marginBottom: "8px" }}
                    value={lang.name || ""}
                    onChange={(e) => handleObjectChange("languages", i, "name", e.target.value)}
                    placeholder="Language"
                  />
                  <select
                    value={lang.proficiency || 4}
                    onChange={(e) => handleObjectChange("languages", i, "proficiency", parseInt(e.target.value))}
                    style={inputStyle}
                  >
                    <option value={1}>Beginner</option>
                    <option value={2}>Elementary</option>
                    <option value={3}>Intermediate</option>
                    <option value={4}>Advanced</option>
                    <option value={5}>Fluent</option>
                    <option value={6}>Native</option>
                  </select>
                  <button
                    onClick={() => removeItem("languages", i)}
                    style={{ color: "red", border: "none", background: "none", fontSize: "0.8rem", marginTop: "5px" }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium mr-2 mb-2">
                  {lang.name || "Language"}
                  {lang.proficiency && (
                    <span className="text-xs ml-1 opacity-75">
                      ({["Beg", "Elem", "Int", "Adv", "Flt", "Nat"][lang.proficiency - 1]})
                    </span>
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    achievements: hasContent(localData, "achievements") && (
      <div key="achievements" style={editBoxStyle}>
        <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
          <h2 className="text-xl font-bold flex items-center">
            {getSectionIcon("achievements", editMode ? "#000" : "#00796b", 18)}
            Achievements
          </h2>
          {editMode && (
            <button
              onClick={() => addItem("achievements", "")}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              + Add
            </button>
          )}
        </div>

        {editMode ? (
          <div>
            {(localData.achievements || []).map((achievement, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <input
                  style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                  value={renderSafe(achievement)}
                  onChange={(e) => handleSimpleArrayChange("achievements", i, e.target.value)}
                  placeholder="Enter achievement"
                />
                <button
                  onClick={() => removeItem("achievements", i)}
                  style={{ color: "red", border: "none", background: "none", marginLeft: "8px" }}
                >
                  ×
                </button>
              </div>
            ))}
            {(localData.achievements || []).length === 0 && (
              <p className="text-gray-400 italic">Click + Add to add achievements</p>
            )}
          </div>
        ) : (
          <ul className="list-disc list-inside text-gray-700">
            {(localData.achievements || []).map((achievement, i) => (
              <li key={i} className="mb-1">{renderSafe(achievement)}</li>
            ))}
          </ul>
        )}
      </div>
    ),

    interests: hasContent(localData, "interests") && (
      <div key="interests" style={editBoxStyle}>
        <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
          <h2 className="text-xl font-bold flex items-center">
            {getSectionIcon("interests", editMode ? "#000" : "#00796b", 18)}
            Interests
          </h2>
          {editMode && (
            <button
              onClick={() => addItem("interests", "")}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              + Add
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(localData.interests || []).map((interest, i) => (
            <div key={i}>
              {editMode ? (
                <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                  <input
                    style={{ ...inputStyle, width: "150px", marginBottom: 0 }}
                    value={renderSafe(interest)}
                    onChange={(e) => handleSimpleArrayChange("interests", i, e.target.value)}
                    placeholder="Interest"
                  />
                  <button
                    onClick={() => removeItem("interests", i)}
                    style={{ color: "red", border: "none", background: "none", marginLeft: "5px" }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium mr-2 mb-2">
                  {renderSafe(interest)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    certifications: hasContent(localData, "certifications") && (
      <div key="certifications" style={editBoxStyle}>
        <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
          <h2 className="text-xl font-bold flex items-center">
            {getSectionIcon("certifications", editMode ? "#000" : "#00796b", 18)}
            Certifications
          </h2>
          {editMode && (
            <button
              onClick={() => addItem("certifications", { name: "", organization: "", year: "" })}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              + Add
            </button>
          )}
        </div>

        {(localData.certifications || []).map((cert, i) => (
          <div key={i} style={{ marginBottom: "0.8rem", position: "relative" }}>
            {editMode ? (
              <div style={{ border: "1px solid #e5e7eb", padding: "10px", borderRadius: "8px", marginBottom: "8px" }}>
                <input
                  style={inputStyle}
                  value={cert.name || cert.title || ""}
                  onChange={(e) => handleObjectChange("certifications", i, "name", e.target.value)}
                  placeholder="Certification Name"
                />
                <input
                  style={inputStyle}
                  value={cert.organization || ""}
                  onChange={(e) => handleObjectChange("certifications", i, "organization", e.target.value)}
                  placeholder="Issuing Organization"
                />
                <input
                  style={inputStyle}
                  value={cert.year || ""}
                  onChange={(e) => handleObjectChange("certifications", i, "year", e.target.value)}
                  placeholder="Year"
                />
                <button
                  onClick={() => removeItem("certifications", i)}
                  style={{ color: "red", border: "none", background: "none", fontSize: "0.8rem", marginTop: "5px" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="text-black font-medium">
                • {cert.name || cert.title || "Certification"}
                {cert.organization && <span className="text-gray-600 font-normal"> — {cert.organization}</span>}
                {cert.year && <span className="text-gray-500 text-sm ml-2">({cert.year})</span>}
              </p>
            )}
          </div>
        ))}
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar resumeRef={resumeRef} />

        <div className="flex-1 p-6 flex justify-center items-start">
          <div
            ref={resumeRef}
            className="bg-white text-gray-900 font-sans shadow-lg border border-gray-300 rounded-lg resume-paper"
            style={{
              width: "794px",
              minHeight: "1123px",
              padding: "40px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              fontFamily: localData.font || "sans-serif",
              boxSizing: "border-box",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
            data-resume-template="template14"
          >
            {/* HEADER - Exact same UI as original Template14 */}
            <div
              className={`p-6 rounded-t-xl text-left ${
                editMode ? "bg-transparent text-black" : "bg-blue-600 text-white"
              }`}
              style={editMode ? {} : { backgroundColor: localData.bgColor || "#2563eb" }}
            >
              {editMode ? (
                <div style={{ display: "grid", gap: "10px" }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                    className="w-full border border-gray-400 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Your Full Name"
                  />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => handlePersonalInfoChange("role", e.target.value)}
                    className="w-full border border-gray-400 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Your Job Title"
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                      className="w-full border border-gray-400 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Email Address"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                      className="w-full border border-gray-400 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Phone Number"
                    />
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
                      className="w-full border border-gray-400 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="LinkedIn Profile URL"
                    />
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => handlePersonalInfoChange("github", e.target.value)}
                      className="w-full border border-gray-400 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="GitHub Profile URL"
                    />
                    <input
                      type="text"
                      value={portfolio}
                      onChange={(e) => handlePersonalInfoChange("portfolio", e.target.value)}
                      className="w-full border border-gray-400 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Portfolio Website URL"
                    />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                      className="w-full border border-gray-400 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Location (City, Country)"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-bold" style={{ color: localData.textColor || "#ffffff" }}>
                    {name || "Your Name"}
                  </h1>
                  <p className="text-lg mt-1" style={{ color: localData.textColor || "#ffffff" }}>
                    {role || "Your Job Title"}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-sm">
                    {email && (
                      <a 
                        href={getSafeUrl("email", email)} 
                        className="flex items-center hover:underline"
                        style={{ color: localData.textColor || "#ffffff" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getContactIcon("email", localData.textColor || "#ffffff", 14)}
                        <span className="ml-1">{email}</span>
                      </a>
                    )}
                    {phone && (
                      <a 
                        href={getSafeUrl("phone", phone)} 
                        className="flex items-center hover:underline"
                        style={{ color: localData.textColor || "#ffffff" }}
                      >
                        {getContactIcon("phone", localData.textColor || "#ffffff", 14)}
                        <span className="ml-1">{phone}</span>
                      </a>
                    )}
                    {linkedin && (
                      <a 
                        href={getSafeUrl("linkedin", linkedin)} 
                        className="flex items-center hover:underline"
                        style={{ color: localData.textColor || "#ffffff" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getContactIcon("linkedin", localData.textColor || "#ffffff", 14)}
                        <span className="ml-1">LinkedIn</span>
                      </a>
                    )}
                    {github && (
                      <a 
                        href={getSafeUrl("github", github)} 
                        className="flex items-center hover:underline"
                        style={{ color: localData.textColor || "#ffffff" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getContactIcon("github", localData.textColor || "#ffffff", 14)}
                        <span className="ml-1">GitHub</span>
                      </a>
                    )}
                    {portfolio && (
                      <a 
                        href={getSafeUrl("portfolio", portfolio)} 
                        className="flex items-center hover:underline"
                        style={{ color: localData.textColor || "#ffffff" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getContactIcon("portfolio", localData.textColor || "#ffffff", 14)}
                        <span className="ml-1">Portfolio</span>
                      </a>
                    )}
                    {location && (
                      <span className="flex items-center" style={{ color: localData.textColor || "#ffffff" }}>
                        {getContactIcon("location", localData.textColor || "#ffffff", 14)}
                        <span className="ml-1">{location}</span>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* BODY - Dynamically render sections based on sectionOrder */}
            <div className="p-8" style={{ flex: 1 }}>
              {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                "summary", "experience", "education", "projects", "skills", 
                "languages", "achievements", "interests", "certifications"
              ]).map(sectionKey => sectionComponents[sectionKey] || null)}
            </div>

            {/* ACTION BUTTONS - Same as Template 1 but styled for Template14 */}
            <div className="text-center mt-4 mb-6" data-html2canvas-ignore="true">
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-6 py-2 rounded mr-3 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Edit Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showLoginPrompt && <LoginPrompt onClose={() => setShowLoginPrompt(false)} />}
    </div>
  );
};

export default Template14;