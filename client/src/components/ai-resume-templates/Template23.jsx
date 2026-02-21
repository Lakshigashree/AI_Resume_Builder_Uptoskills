/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import { MapPin, Phone, Mail, Linkedin, Github, Globe, Camera, Trash2 } from "lucide-react";
import { getSafeUrl } from "../../utils/ResumeConfig";

// ========== HELPER FUNCTION FOR SAFE TEXT RENDERING ==========
const renderSafeText = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    // Try common property names in order of priority
    return item.title || item.name || item.language || item.degree || JSON.stringify(item);
  }
  return String(item);
};

const Template23 = () => {
  const resumeRef = useRef(null);
  const fileInputRef = useRef(null);
  const resumeContext = useResume();
  const { isAuthenticated } = useAuth() || {};
  
  const { 
    resumeData, 
    updateResumeData, 
    sectionOrder 
  } = resumeContext || { 
    resumeData: {}, 
    updateResumeData: null, 
    sectionOrder: [] 
  };

  // default structure to avoid crashes
  const defaultTemplate = {
    name: "",
    role: "",
    phone: "",
    email: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    profileImage: "",
    summary: "",
    skills: [],
    languages: [],
    interests: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
    templateId: 23
  };

  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (resumeData && Object.keys(resumeData).length > 0) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
      if (resumeData.profileImage) {
        setProfileImage(resumeData.profileImage);
      }
    } else {
      setLocalData(defaultTemplate);
    }
  }, [resumeData]);

  // helpers
  const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";
  
  const hasArrayContent = (arr) => {
    if (!Array.isArray(arr)) return false;
    return arr.some((item) => {
      if (typeof item === "string") return isNonEmptyString(item);
      if (!item) return false;
      if (typeof item === "object") {
        return Object.values(item).some(val => isNonEmptyString(String(val || "")));
      }
      return Boolean(item);
    });
  };
  
  const hasContact = (data) => {
    return ["phone", "email", "location", "linkedin", "github", "portfolio"].some(
      (k) => isNonEmptyString(data?.[k])
    );
  };
  
  const hasExperienceContent = (experience) => {
    if (!Array.isArray(experience)) return false;
    return experience.some((exp) => {
      if (!exp || typeof exp !== "object") return false;
      const textFields = ["title", "companyName", "date", "companyLocation", "description"];
      const hasText = textFields.some((f) => isNonEmptyString(exp[f] || ""));
      const accomplishments = Array.isArray(exp.accomplishment)
        ? exp.accomplishment.some(a => isNonEmptyString(a))
        : false;
      return hasText || accomplishments;
    });
  };
  
  const hasSummary = () => isNonEmptyString(localData?.summary);
  const hasSkills = () => hasArrayContent(localData?.skills);
  const hasLanguages = () => hasArrayContent(localData?.languages);
  const hasInterests = () => hasArrayContent(localData?.interests);
  const hasEducation = () => hasArrayContent(localData?.education);
  const hasProjects = () => hasArrayContent(localData?.projects);
  const hasCertifications = () => hasArrayContent(localData?.certifications);
  const hasAchievements = () => hasArrayContent(localData?.achievements);

  // persist helpers
  const persist = (updated) => {
    setLocalData(updated);
    try {
      localStorage.setItem("resumeData", JSON.stringify(updated));
    } catch (e) {
      // ignore storage errors
    }
  };

  const handleFieldChange = (field, value) => {
    if (!localData) return;
    const updatedData = { ...localData, [field]: value };
    persist(updatedData);
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    if (!localData) return;
    const arr = Array.isArray(localData[section]) ? [...localData[section]] : [];
    if (!arr[index]) arr[index] = {};
    
    if (key) {
      // For objects with keys
      arr[index] = { ...(arr[index] || {}), [key]: value };
    } else {
      // For simple arrays
      arr[index] = value;
    }
    const updatedData = { ...localData, [section]: arr };
    persist(updatedData);
  };

  const handleAddItem = (section, template) => {
    if (!localData) return;
    const current = Array.isArray(localData[section]) ? [...localData[section]] : [];
    const updated = [...current, template];
    handleFieldChange(section, updated);
    toast.info(`Added new ${section.slice(0, -1)}`);
  };

  const handleRemoveItem = (section, index) => {
    if (!localData || !localData[section]) return;
    const updated = [...localData[section]];
    updated.splice(index, 1);
    handleFieldChange(section, updated);
    toast.warn(`Removed ${section.slice(0, -1)}`);
  };

  const handleSave = async () => {
    if (!localData) return;
    
    try {
      setIsSaving(true);
      
      // Normalize data before saving
      const normalized = { ...localData };
      
      // Clean empty items from arrays
      normalized.skills = (normalized.skills || []).filter(s => s && s.trim());
      normalized.languages = (normalized.languages || []).filter(l => l && l.trim());
      normalized.interests = (normalized.interests || []).filter(i => i && i.trim());
      normalized.achievements = (normalized.achievements || []).filter(a => a && a.trim());
      
      normalized.education = (normalized.education || []).filter(
        e => e.degree?.trim() || e.institution?.trim()
      );
      
      normalized.experience = (normalized.experience || []).filter(
        e => e.title?.trim() || e.companyName?.trim() || e.description?.trim()
      );
      
      normalized.projects = (normalized.projects || []).filter(
        p => p.name?.trim() || p.description?.trim()
      );
      
      normalized.certifications = (normalized.certifications || []).filter(
        c => c.title?.trim()
      );

      if (typeof updateResumeData === 'function') {
        await updateResumeData(normalized);
      } else {
        setResumeData?.(normalized);
      }
      
      // Save to localStorage
      localStorage.setItem('resumeData', JSON.stringify(normalized));
      
      setEditMode(false);
      toast.success("Resume saved successfully!");
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Error saving resume');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(resumeData ? JSON.parse(JSON.stringify(resumeData)) : defaultTemplate);
    setEditMode(false);
    toast.info("Changes discarded");
  };

  // Download -> print dialog (user can choose Save as PDF)
  const handleDownload = () => {
    window.print();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        handleFieldChange("profileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Show loading if no data
  if (!localData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  const sectionHeaderStyle = {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1f4e79",
    borderBottom: "2px solid #1f4e79",
    marginBottom: "8px",
    paddingBottom: "2px",
    textTransform: "uppercase",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };

  const profileImageStyle = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    cursor: "pointer",
    margin: "0 auto",
  };

  const editBoxStyle = {
    border: "1px dashed #3b82f6",
    padding: "8px",
    borderRadius: "4px",
    marginBottom: "8px",
    position: "relative"
  };

  const inputStyle = {
    width: "100%",
    padding: "4px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginBottom: "4px"
  };

  const buttonStyle = {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "2px 6px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    marginTop: "4px"
  };

  const renderText = (value, onChange, multiline = false, placeholder = "") =>
    editMode ? (
      multiline ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )
    ) : (
      isNonEmptyString(value) ? value : null
    );

  // ========== SECTION COMPONENTS ==========

  const profileImageSection = (
    <div key="profile">
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
      <div
        style={{
          cursor: editMode ? "pointer" : "default",
          border: editMode ? "2px dashed #3b82f6" : "none",
          borderRadius: "50%",
          padding: editMode ? "2px" : "0",
        }}
        onClick={editMode ? () => fileInputRef.current.click() : undefined}
        title={editMode ? "Click to change profile picture" : "Profile picture"}
      >
        {isNonEmptyString(localData.profileImage) || profileImage ? (
          <img 
            src={profileImage || localData.profileImage} 
            alt="Profile" 
            style={profileImageStyle} 
          />
        ) : editMode ? (
          <div style={{ ...profileImageStyle, backgroundColor: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Camera size={40} color="#9ca3af" />
          </div>
        ) : null}
      </div>
      {editMode && isNonEmptyString(localData.profileImage) && (
        <button
          onClick={() => handleFieldChange("profileImage", "")}
          style={{
            marginTop: "8px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.75rem",
            display: "block",
            width: "100%"
          }}
        >
          Remove Photo
        </button>
      )}
    </div>
  );

  const contactSection = (editMode || hasContact(localData)) && (
    <div key="contact" style={{ marginBottom: "20px" }}>
      <h3 style={sectionHeaderStyle}>Contact</h3>
      <div style={{ marginBottom: "10px", paddingLeft: "12px" }}>
        {/* Phone */}
        <p style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <Phone size={14} /> 
          {editMode ? (
            renderText(localData.phone, (val) => handleFieldChange("phone", val), false, "Phone")
          ) : (
            isNonEmptyString(localData.phone) ? 
              <a href={getSafeUrl("phone", localData.phone)} style={{ color: "inherit", textDecoration: "none" }}>
                {renderSafeText(localData.phone)}
              </a> : null
          )}
        </p>
        
        {/* Email */}
        <p style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <Mail size={14} /> 
          {editMode ? (
            renderText(localData.email, (val) => handleFieldChange("email", val), false, "Email")
          ) : (
            isNonEmptyString(localData.email) ? 
              <a href={getSafeUrl("email", localData.email)} style={{ color: "inherit", textDecoration: "none" }}>
                {renderSafeText(localData.email)}
              </a> : null
          )}
        </p>
        
        {/* Location */}
        <p style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <MapPin size={14} /> 
          {renderText(localData.location, (val) => handleFieldChange("location", val), false, "Location")}
        </p>
        
        {/* LinkedIn */}
        <p style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <Linkedin size={14} /> 
          {editMode ? (
            renderText(localData.linkedin, (val) => handleFieldChange("linkedin", val), false, "LinkedIn")
          ) : (
            isNonEmptyString(localData.linkedin) ? 
              <a href={getSafeUrl("linkedin", localData.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                LinkedIn
              </a> : null
          )}
        </p>
        
        {/* GitHub */}
        <p style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <Github size={14} /> 
          {editMode ? (
            renderText(localData.github, (val) => handleFieldChange("github", val), false, "GitHub")
          ) : (
            isNonEmptyString(localData.github) ? 
              <a href={getSafeUrl("github", localData.github)} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                GitHub
              </a> : null
          )}
        </p>
        
        {/* Portfolio */}
        <p style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <Globe size={14} /> 
          {editMode ? (
            renderText(localData.portfolio, (val) => handleFieldChange("portfolio", val), false, "Portfolio")
          ) : (
            isNonEmptyString(localData.portfolio) ? 
              <a href={getSafeUrl("portfolio", localData.portfolio)} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                Portfolio
              </a> : null
          )}
        </p>
      </div>
    </div>
  );

  const educationSection = (editMode || hasEducation()) && (
    <div key="education" style={{ marginBottom: "20px" }}>
      <h3 style={sectionHeaderStyle}>
        Education
        {editMode && (
          <button
            onClick={() => handleAddItem("education", { degree: "", institution: "", duration: "" })}
            style={{ fontSize: "0.8rem", color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}
          >
            + Add
          </button>
        )}
      </h3>
      {(Array.isArray(localData.education) ? localData.education : []).map((item, i) => (
        (editMode || (item.degree?.trim() || item.institution?.trim())) ? (
          <div key={i} style={editMode ? editBoxStyle : { marginBottom: "8px" }}>
            {editMode && (
              <button
                onClick={() => handleRemoveItem("education", i)}
                style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
              >
                ✖
              </button>
            )}
            <div style={{ flex: 1 }}>
              {editMode ? (
                <>
                  <p>{renderText(item.degree, (val) => handleArrayFieldChange("education", i, "degree", val), false, "Degree")}</p>
                  <p>{renderText(item.institution, (val) => handleArrayFieldChange("education", i, "institution", val), false, "Institution")}</p>
                  <p>{renderText(item.duration, (val) => handleArrayFieldChange("education", i, "duration", val), false, "Duration")}</p>
                </>
              ) : (
                <>
                  {isNonEmptyString(item.degree) && <p style={{ margin: 0, fontWeight: 700 }}>{renderSafeText(item.degree)}</p>}
                  {(isNonEmptyString(item.institution) || isNonEmptyString(item.duration)) && (
                    <p style={{ margin: 0, color: "#6b7280" }}>
                      {[item.institution, item.duration].filter(Boolean).map(renderSafeText).join(" | ")}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        ) : null
      ))}
    </div>
  );

  const skillsSection = (editMode || hasSkills()) && (
    <div key="skills" style={{ marginBottom: "20px" }}>
      <h3 style={sectionHeaderStyle}>
        Skills
        {editMode && (
          <button
            onClick={() => handleAddItem("skills", "")}
            style={{ fontSize: "0.8rem", color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}
          >
            + Add
          </button>
        )}
      </h3>
      <div style={{ paddingLeft: "12px" }}>
        {(Array.isArray(localData.skills) ? localData.skills : []).map((item, i) => (
          (editMode || (item && item.trim())) ? (
            <div key={i} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ flex: 1 }}>
                {editMode ? (
                  renderText(item, (val) => handleArrayFieldChange("skills", i, null, val), false, "Skill")
                ) : (
                  renderSafeText(item)
                )}
              </span>
              {editMode && (
                <button 
                  onClick={() => handleRemoveItem("skills", i)} 
                  style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                >
                  ✖
                </button>
              )}
            </div>
          ) : null
        ))}
      </div>
    </div>
  );

  const languagesSection = (editMode || hasLanguages()) && (
    <div key="languages" style={{ marginBottom: "20px" }}>
      <h3 style={sectionHeaderStyle}>
        Languages
        {editMode && (
          <button
            onClick={() => handleAddItem("languages", "")}
            style={{ fontSize: "0.8rem", color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}
          >
            + Add
          </button>
        )}
      </h3>
      <div style={{ paddingLeft: "12px" }}>
        {(Array.isArray(localData.languages) ? localData.languages : []).map((item, i) => (
          (editMode || (item && item.trim())) ? (
            <div key={i} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ flex: 1 }}>
                {editMode ? (
                  renderText(item, (val) => handleArrayFieldChange("languages", i, null, val), false, "Language")
                ) : (
                  renderSafeText(item)
                )}
              </span>
              {editMode && (
                <button 
                  onClick={() => handleRemoveItem("languages", i)} 
                  style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                >
                  ✖
                </button>
              )}
            </div>
          ) : null
        ))}
      </div>
    </div>
  );

  const interestsSection = (editMode || hasInterests()) && (
    <div key="interests" style={{ marginBottom: "20px" }}>
      <h3 style={sectionHeaderStyle}>
        Interests
        {editMode && (
          <button
            onClick={() => handleAddItem("interests", "")}
            style={{ fontSize: "0.8rem", color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}
          >
            + Add
          </button>
        )}
      </h3>
      <div style={{ paddingLeft: "12px" }}>
        {(Array.isArray(localData.interests) ? localData.interests : []).map((item, i) => (
          (editMode || (item && item.trim())) ? (
            <div key={i} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ flex: 1 }}>
                {editMode ? (
                  renderText(item, (val) => handleArrayFieldChange("interests", i, null, val), false, "Interest")
                ) : (
                  renderSafeText(item)
                )}
              </span>
              {editMode && (
                <button 
                  onClick={() => handleRemoveItem("interests", i)} 
                  style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                >
                  ✖
                </button>
              )}
            </div>
          ) : null
        ))}
      </div>
    </div>
  );

  const summarySection = (editMode || hasSummary()) && (
    <div key="summary" style={{ marginBottom: "20px" }}>
      <h3 style={sectionHeaderStyle}>
        Profile
        {editMode && (
          <button
            onClick={() => handleFieldChange("summary", "")}
            style={{ fontSize: "0.8rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
          >
            Clear
          </button>
        )}
      </h3>
      {renderText(localData.summary, (val) => handleFieldChange("summary", val), true, "Write your profile summary")}
    </div>
  );

  const experienceSection = (editMode || hasExperienceContent(localData.experience)) && (
    <div key="experience" style={{ marginBottom: "20px" }}>
      <h3 style={sectionHeaderStyle}>
        Experience
        {editMode && (
          <button
            onClick={() => handleAddItem("experience", { title: "", companyName: "", date: "", description: "", accomplishment: [] })}
            style={{ fontSize: "0.8rem", color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}
          >
            + Add
          </button>
        )}
      </h3>
      {(Array.isArray(localData.experience) ? localData.experience : []).map((exp, i) => (
        (editMode || exp.title?.trim() || exp.companyName?.trim() || exp.description?.trim()) ? (
          <div key={i} style={editMode ? { ...editBoxStyle, marginBottom: "15px" } : { marginBottom: "15px" }}>
            {editMode && (
              <button
                onClick={() => handleRemoveItem("experience", i)}
                style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
              >
                ✖
              </button>
            )}
            {editMode ? (
              <>
                <p>{renderText(exp.title, (val) => handleArrayFieldChange("experience", i, "title", val), false, "Job Title")}</p>
                <p>{renderText(exp.companyName, (val) => handleArrayFieldChange("experience", i, "companyName", val), false, "Company Name")}</p>
                <p>{renderText(exp.date, (val) => handleArrayFieldChange("experience", i, "date", val), false, "Date")}</p>
                <p>{renderText(exp.description, (val) => handleArrayFieldChange("experience", i, "description", val), true, "Description")}</p>
              </>
            ) : (
              <>
                {isNonEmptyString(exp.title) && <p style={{ fontWeight: "bold", margin: 0 }}>{renderSafeText(exp.title)}</p>}
                {(isNonEmptyString(exp.companyName) || isNonEmptyString(exp.date)) && (
                  <p style={{ margin: "4px 0", color: "#6b7280" }}>
                    {[exp.companyName, exp.date].filter(Boolean).map(renderSafeText).join(" | ")}
                  </p>
                )}
                {isNonEmptyString(exp.description) && (
                  <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>{renderSafeText(exp.description)}</p>
                )}
              </>
            )}
          </div>
        ) : null
      ))}
    </div>
  );

  const projectsSection = (editMode || hasProjects()) && (
    <div key="projects" style={{ marginBottom: "20px" }}>
      <h3 style={sectionHeaderStyle}>
        Projects
        {editMode && (
          <button
            onClick={() => handleAddItem("projects", { name: "", description: "", link: "", technologies: [] })}
            style={{ fontSize: "0.8rem", color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}
          >
            + Add
          </button>
        )}
      </h3>
      {(Array.isArray(localData.projects) ? localData.projects : []).map((proj, i) => (
        (editMode || proj.name?.trim() || proj.description?.trim()) ? (
          <div key={i} style={editMode ? { ...editBoxStyle, marginBottom: "15px" } : { marginBottom: "15px" }}>
            {editMode && (
              <button
                onClick={() => handleRemoveItem("projects", i)}
                style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
              >
                ✖
              </button>
            )}
            {editMode ? (
              <>
                <p>{renderText(proj.name, (val) => handleArrayFieldChange("projects", i, "name", val), false, "Project Name")}</p>
                <p>{renderText(proj.description, (val) => handleArrayFieldChange("projects", i, "description", val), true, "Description")}</p>
                <p>{renderText(proj.link, (val) => handleArrayFieldChange("projects", i, "link", val), false, "Project Link")}</p>
                <p>{renderText(proj.technologies?.join(", "), (val) => handleArrayFieldChange("projects", i, "technologies", val.split(",").map(t => t.trim()).filter(Boolean)), false, "Technologies (comma separated)")}</p>
              </>
            ) : (
              <>
                {isNonEmptyString(proj.name) && <p style={{ fontWeight: "bold", margin: 0 }}>{renderSafeText(proj.name)}</p>}
                {isNonEmptyString(proj.description) && (
                  <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>{renderSafeText(proj.description)}</p>
                )}
                {proj.technologies?.length > 0 && (
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>
                    <strong>Tech:</strong> {proj.technologies.map(renderSafeText).join(", ")}
                  </p>
                )}
                {isNonEmptyString(proj.link) && (
                  <a href={getSafeUrl("portfolio", proj.link)} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "#1f4e79" }}>
                    View Project
                  </a>
                )}
              </>
            )}
          </div>
        ) : null
      ))}
    </div>
  );

  const certificationsSection = (editMode || hasCertifications()) && (
    <div key="certifications" style={{ marginBottom: "20px" }}>
      <h3 style={sectionHeaderStyle}>
        Certifications
        {editMode && (
          <button
            onClick={() => handleAddItem("certifications", { title: "", issuer: "", date: "" })}
            style={{ fontSize: "0.8rem", color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}
          >
            + Add
          </button>
        )}
      </h3>
      {(Array.isArray(localData.certifications) ? localData.certifications : []).map((cert, i) => (
        (editMode || cert.title?.trim()) ? (
          <div key={i} style={editMode ? editBoxStyle : { marginBottom: "10px" }}>
            {editMode && (
              <button
                onClick={() => handleRemoveItem("certifications", i)}
                style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
              >
                ✖
              </button>
            )}
            {editMode ? (
              <>
                <p>{renderText(cert.title, (val) => handleArrayFieldChange("certifications", i, "title", val), false, "Title")}</p>
                <p>{renderText(cert.issuer, (val) => handleArrayFieldChange("certifications", i, "issuer", val), false, "Issuer")}</p>
                <p>{renderText(cert.date, (val) => handleArrayFieldChange("certifications", i, "date", val), false, "Date")}</p>
              </>
            ) : (
              <p style={{ margin: 0 }}>
                <strong>{renderSafeText(cert.title)}</strong>
                {isNonEmptyString(cert.issuer) && ` — ${renderSafeText(cert.issuer)}`}
                {isNonEmptyString(cert.date) && ` (${renderSafeText(cert.date)})`}
              </p>
            )}
          </div>
        ) : null
      ))}
    </div>
  );

  const achievementsSection = (editMode || hasAchievements()) && (
    <div key="achievements" style={{ marginBottom: "20px" }}>
      <h3 style={sectionHeaderStyle}>
        Achievements
        {editMode && (
          <button
            onClick={() => handleAddItem("achievements", "")}
            style={{ fontSize: "0.8rem", color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}
          >
            + Add
          </button>
        )}
      </h3>
      <ul style={{ paddingLeft: "20px", margin: 0 }}>
        {(Array.isArray(localData.achievements) ? localData.achievements : []).map((ach, i) => (
          (editMode || (ach && ach.trim())) ? (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ flex: 1 }}>
                {editMode ? (
                  renderText(ach, (val) => handleArrayFieldChange("achievements", i, null, val), false, "Achievement")
                ) : (
                  renderSafeText(ach)
                )}
              </span>
              {editMode && (
                <button 
                  onClick={() => handleRemoveItem("achievements", i)} 
                  style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
                >
                  ✖
                </button>
              )}
            </li>
          ) : null
        ))}
      </ul>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resumeRef={resumeRef} />
        <div style={{ flexGrow: 1, padding: "2rem", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: "1000px" }}>
            <div
              ref={resumeRef}
              style={{
                backgroundColor: "#ffffff",
                display: "flex",
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                overflow: "hidden",
                fontFamily: "Arial, sans-serif",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                flexDirection: "column",
                minHeight: "297mm"
              }}
              data-resume-template="template23"
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#062E48",
                  padding: "15px 40px",
                  borderBottom: "1px solid #ccc",
                  gap: "40px",
                }}
              >
                <div style={{ flex: "1", textAlign: "left" }}>
                  <h1 style={{ fontSize: "3rem", fontWeight: "bold", margin: "0 0 4px 0", color: "white" }}>
                    {editMode ? (
                      renderText(localData.name, (val) => handleFieldChange("name", val), false, "Full Name")
                    ) : (
                      isNonEmptyString(localData.name) ? renderSafeText(localData.name) : <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Full Name</span>
                    )}
                  </h1>
                  <p style={{ fontSize: "1rem", color: "#E5E7EB", margin: "0" }}>
                    {editMode ? (
                      renderText(localData.role, (val) => handleFieldChange("role", val), false, "Current Role")
                    ) : (
                      isNonEmptyString(localData.role) ? renderSafeText(localData.role) : <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Current Role</span>
                    )}
                  </p>
                </div>

                {/* Profile Pic logic: Hidden if no image and not in edit mode */}
                {(isNonEmptyString(localData.profileImage) || editMode) && (
                  <div>
                    {profileImageSection}
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div style={{ display: "flex", padding: "20px", width: "100%" }}>
                {/* Left Sidebar */}
                <div style={{ width: "35%", paddingRight: "20px", borderRight: "1px solid #ccc", minHeight: "100%" }}>
                  {/* Contact */}
                  {contactSection}

                  {/* DYNAMIC LEFT COLUMN SECTIONS */}
                  {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                    "education", "skills", "languages", "interests"
                  ]).map((sectionKey) => {
                    switch(sectionKey) {
                      case "education": return educationSection;
                      case "skills": return skillsSection;
                      case "languages": return languagesSection;
                      case "interests": return interestsSection;
                      default: return null;
                    }
                  })}
                </div>

                {/* Right Content */}
                <div style={{ width: "65%", paddingLeft: "20px", flex: 1, minHeight: "100%" }}>
                  {/* DYNAMIC RIGHT COLUMN SECTIONS */}
                  {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                    "summary", "experience", "projects", "certifications", "achievements"
                  ]).map((sectionKey) => {
                    switch(sectionKey) {
                      case "summary": return summarySection;
                      case "experience": return experienceSection;
                      case "projects": return projectsSection;
                      case "certifications": return certificationsSection;
                      case "achievements": return achievementsSection;
                      default: return null;
                    }
                  })}
                </div>
              </div>
            </div>

            {/* Floating Edit/Save Controls */}
            <div 
              className="no-print" 
              style={{ 
                position: "fixed", 
                bottom: "40px", 
                left: "50%", 
                transform: "translateX(-50%)",
                zIndex: 1000,
                backgroundColor: "white",
                padding: "1rem 2rem",
                borderRadius: "50px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                display: "flex",
                gap: "1rem",
                border: "1px solid #e5e7eb"
              }}
            >
              {editMode ? (
                <>
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    style={{
                      backgroundColor: isSaving ? "#9ca3af" : "#10b981",
                      color: "white",
                      padding: "0.5rem 1.5rem",
                      borderRadius: "0.375rem",
                      border: "none",
                      cursor: isSaving ? "not-allowed" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    onClick={handleCancel} 
                    disabled={isSaving}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      padding: "0.5rem 1.5rem",
                      borderRadius: "0.375rem",
                      border: "none",
                      cursor: isSaving ? "not-allowed" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setEditMode(true)} 
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "0.375rem",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  ✏️ Edit Resume
                </button>
              )}
              <button 
                onClick={handleDownload} 
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template23;