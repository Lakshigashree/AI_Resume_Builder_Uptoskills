import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import { MapPin, Phone, Mail, Linkedin, Github, Globe } from "lucide-react";
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

// Helper functions to check if sections have meaningful content
const hasContent = {
  certifications: (data) =>
    data.certifications &&
    data.certifications.length > 0 &&
    data.certifications.some(
      (cert) =>
        (typeof cert.title === "string" && cert.title.trim() !== "") ||
        (typeof cert.issuer === "string" && cert.issuer.trim() !== "") ||
        (typeof cert.date === "string" && cert.date.trim() !== "")
    ),

  achievements: (data) =>
    data.achievements &&
    data.achievements.length > 0 &&
    data.achievements.some(
      (item) => typeof item === "string" && item.trim() !== ""
    ),

  languages: (data) =>
    data.languages &&
    data.languages.length > 0 &&
    data.languages.some(
      (lang) => typeof lang === "string" && lang.trim() !== ""
    ),

  interests: (data) =>
    data.interests &&
    data.interests.length > 0 &&
    data.interests.some(
      (int) => typeof int === "string" && int.trim() !== ""
    ),

  projects: (data) =>
    data.projects &&
    data.projects.length > 0 &&
    data.projects.some(
      (proj) => 
        (typeof proj.name === "string" && proj.name.trim() !== "") ||
        (typeof proj.description === "string" && proj.description.trim() !== "")
    ),

  skills: (data) =>
    data.skills &&
    data.skills.length > 0 &&
    data.skills.some((skill) => typeof skill === "string" && skill.trim() !== ""),

  experience: (data) =>
    data.experience &&
    data.experience.length > 0 &&
    data.experience.some(
      (exp) => 
        (typeof exp.title === "string" && exp.title.trim() !== "") ||
        (typeof exp.companyName === "string" && exp.companyName.trim() !== "")
    ),

  education: (data) =>
    data.education &&
    data.education.length > 0 &&
    data.education.some(
      (edu) => 
        (typeof edu.degree === "string" && edu.degree.trim() !== "") ||
        (typeof edu.institution === "string" && edu.institution.trim() !== "")
    ),

  summary: (data) =>
    typeof data.summary === "string" && data.summary.trim() !== "",
};

const Template22 = () => {
  const resumeRef = useRef(null);
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
  
  const [localData, setLocalData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Default data structure with ALL 9 sections
  const getDefaultData = () => ({
    name: "",
    role: "",
    location: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],           // ✅ Projects section
    certifications: [],      // ✅ Certifications section
    achievements: [],
    languages: [],
    interests: [],
    profileImage: null,
    templateId: 22
  });

  // Initialize data from context or defaults
  useEffect(() => {
    if (resumeData && Object.keys(resumeData).length > 0) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
      if (resumeData.profileImage) {
        setProfileImage(resumeData.profileImage);
      }
    } else {
      setLocalData(getDefaultData());
    }
  }, [resumeData]);

  // ========== HANDLER FUNCTIONS ==========

  const handleFieldChange = (field, value) => {
    if (!localData) return;
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    localStorage.setItem('resumeData', JSON.stringify(updatedData));
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    if (!localData || !localData[section]) return;
    
    setLocalData(prev => {
      const arr = [...(prev[section] || [])];
      if (!arr[index]) arr[index] = {};
      
      if (key) {
        // For objects with keys (experience, education, projects, certifications)
        arr[index] = { ...arr[index], [key]: value };
      } else {
        // For simple arrays (skills, achievements, languages, interests)
        arr[index] = value;
      }
      
      const updatedData = { ...prev, [section]: arr };
      localStorage.setItem('resumeData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleAddItem = (section, template) => {
    if (!localData) return;
    const current = localData[section] || [];
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

  // Template for new items
  const itemTemplates = {
    certifications: { title: "", issuer: "", date: "" },
    achievements: "",
    languages: "",
    interests: "",
    projects: { name: "", description: "", technologies: [], link: "" },
    skills: "",
    experience: { title: "", companyName: "", date: "", accomplishment: [] },
    education: { degree: "", institution: "", duration: "" }
  };

  // ========== IMAGE HANDLER ==========
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

  // ========== SAVE FUNCTION ==========
  const handleSave = async () => {
    if (!localData) return;
    
    try {
      setIsSaving(true);
      
      // Normalize data before saving
      const normalized = { ...localData };
      
      // Clean empty items from arrays
      normalized.skills = (normalized.skills || []).filter(s => s && s.trim());
      normalized.achievements = (normalized.achievements || []).filter(a => a && a.trim());
      normalized.languages = (normalized.languages || []).filter(l => l && l.trim());
      normalized.interests = (normalized.interests || []).filter(i => i && i.trim());
      
      normalized.education = (normalized.education || []).filter(
        e => e.degree?.trim() || e.institution?.trim()
      );
      
      normalized.experience = (normalized.experience || []).filter(
        e => e.title?.trim() || e.companyName?.trim()
      );
      
      normalized.projects = (normalized.projects || []).filter(
        p => p.name?.trim() || p.description?.trim()
      );
      
      normalized.certifications = (normalized.certifications || []).filter(
        c => c.title?.trim()
      );

      if (typeof updateResumeData === 'function') {
        await updateResumeData(normalized);
      }
      
      // Save to localStorage
      localStorage.setItem('resumeData', JSON.stringify(normalized));
      
      setEditMode(false);
      toast.success('✅ Changes Saved Successfully');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Error saving resume');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(resumeData ? JSON.parse(JSON.stringify(resumeData)) : getDefaultData());
    setEditMode(false);
    toast.info("Changes discarded");
  };

  // ========== HELPER FUNCTION - MUST BE DEFINED BEFORE USE ==========
  const hasAnyContact = () => {
    if (!localData) return false;
    return localData.location?.trim() ||
      localData.phone?.trim() ||
      localData.email?.trim() ||
      localData.linkedin?.trim() ||
      localData.github?.trim() ||
      localData.portfolio?.trim();
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

  // ========== STYLES ==========
  const sectionTitleStyle = {
    fontSize: "1.6rem",
    fontWeight: "700",
    marginBottom: "0.75rem",
    color: "#1f2937",
    borderBottom: "2px solid #4f46e5",
    paddingBottom: "0.25rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };

  const listStyle = {
    paddingLeft: "1.25rem",
    lineHeight: "1.6",
    marginBottom: "1rem",
  };

  const editBoxStyle = {
    border: "1px dashed #3b82f6",
    padding: "1rem",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
    position: "relative"
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.25rem",
    marginBottom: "0.5rem",
    fontSize: "0.9rem"
  };

  const buttonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    marginTop: "0.5rem"
  };

  // ========== SECTION COMPONENTS ==========
  // LEFT COLUMN SECTIONS (Main content)

  const summarySection = (editMode || hasContent.summary(localData)) && (
    <div key="summary" style={{ marginBottom: "1.5rem" }}>
      <h3 style={sectionTitleStyle}>
        Summary
        {editMode && (
          <button
            onClick={() => handleFieldChange("summary", "")}
            style={{ fontSize: "0.8rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
            className="no-print"
          >
            Clear
          </button>
        )}
      </h3>
      {editMode ? (
        <textarea
          value={localData.summary || ""}
          onChange={(e) => handleFieldChange("summary", e.target.value)}
          style={{ ...inputStyle, minHeight: "100px" }}
          placeholder="Write a professional summary..."
          className="no-print"
        />
      ) : (
        <p>{renderSafeText(localData.summary)}</p>
      )}
    </div>
  );

  const experienceSection = (editMode || hasContent.experience(localData)) && (
    <div key="experience" style={{ marginBottom: "1.5rem" }}>
      <h3 style={sectionTitleStyle}>
        Experience
        {editMode && (
          <button
            onClick={() => handleAddItem("experience", itemTemplates.experience)}
            style={{ fontSize: "0.8rem", color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}
            className="no-print"
          >
            + Add
          </button>
        )}
      </h3>
      {(localData.experience || []).map((exp, idx) => (
        (editMode || (exp.title?.trim() || exp.companyName?.trim())) ? (
          <div key={idx} style={editMode ? editBoxStyle : { marginBottom: "1rem" }}>
            {editMode && (
              <button
                onClick={() => handleRemoveItem("experience", idx)}
                style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                className="no-print"
              >
                ✖
              </button>
            )}
            {editMode ? (
              <>
                <input
                  value={exp.title || ""}
                  onChange={(e) => handleArrayFieldChange("experience", idx, "title", e.target.value)}
                  style={inputStyle}
                  placeholder="Job Title"
                />
                <input
                  value={exp.companyName || ""}
                  onChange={(e) => handleArrayFieldChange("experience", idx, "companyName", e.target.value)}
                  style={inputStyle}
                  placeholder="Company"
                />
                <input
                  value={exp.date || ""}
                  onChange={(e) => handleArrayFieldChange("experience", idx, "date", e.target.value)}
                  style={inputStyle}
                  placeholder="Date (e.g., 2022-2024)"
                />
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: "bold" }}>Accomplishments:</label>
                  {(exp.accomplishment || []).map((acc, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "0.25rem" }}>
                      <input
                        value={acc || ""}
                        onChange={(e) => {
                          const updated = [...(exp.accomplishment || [])];
                          updated[i] = e.target.value;
                          handleArrayFieldChange("experience", idx, "accomplishment", updated);
                        }}
                        style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                        placeholder="Accomplishment"
                      />
                      <button
                        onClick={() => {
                          const updated = [...(exp.accomplishment || [])];
                          updated.splice(i, 1);
                          handleArrayFieldChange("experience", idx, "accomplishment", updated);
                        }}
                        style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginLeft: "5px" }}
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updated = [...(exp.accomplishment || []), ""];
                      handleArrayFieldChange("experience", idx, "accomplishment", updated);
                    }}
                    style={{ fontSize: "0.8rem", color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}
                  >
                    + Add Accomplishment
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  <strong>{renderSafeText(exp.title)}</strong> — {renderSafeText(exp.companyName)}
                </p>
                {exp.date && <p style={{ fontSize: "0.9rem", color: "#666" }}>{renderSafeText(exp.date)}</p>}
                <ul style={listStyle}>
                  {(exp.accomplishment || []).map((acc, i) => (
                    <li key={i}>{renderSafeText(acc)}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : null
      ))}
    </div>
  );

  const educationSection = (editMode || hasContent.education(localData)) && (
    <div key="education" style={{ marginBottom: "1.5rem" }}>
      <h3 style={sectionTitleStyle}>
        Education
        {editMode && (
          <button
            onClick={() => handleAddItem("education", itemTemplates.education)}
            style={{ fontSize: "0.8rem", color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}
            className="no-print"
          >
            + Add
          </button>
        )}
      </h3>
      {(localData.education || []).map((edu, idx) => (
        (editMode || (edu.degree?.trim() || edu.institution?.trim())) ? (
          <div key={idx} style={editMode ? editBoxStyle : { marginBottom: "1rem" }}>
            {editMode && (
              <button
                onClick={() => handleRemoveItem("education", idx)}
                style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                className="no-print"
              >
                ✖
              </button>
            )}
            {editMode ? (
              <>
                <input
                  value={edu.degree || ""}
                  onChange={(e) => handleArrayFieldChange("education", idx, "degree", e.target.value)}
                  style={inputStyle}
                  placeholder="Degree"
                />
                <input
                  value={edu.institution || ""}
                  onChange={(e) => handleArrayFieldChange("education", idx, "institution", e.target.value)}
                  style={inputStyle}
                  placeholder="Institution"
                />
                <input
                  value={edu.duration || ""}
                  onChange={(e) => handleArrayFieldChange("education", idx, "duration", e.target.value)}
                  style={inputStyle}
                  placeholder="Duration"
                />
              </>
            ) : (
              <p>
                <strong>{renderSafeText(edu.degree)}</strong>, {renderSafeText(edu.institution)} ({renderSafeText(edu.duration)})
              </p>
            )}
          </div>
        ) : null
      ))}
    </div>
  );

  // ✅ NEW: Projects Section
  const projectsSection = (editMode || hasContent.projects(localData)) && (
    <div key="projects" style={{ marginBottom: "1.5rem" }}>
      <h3 style={sectionTitleStyle}>
        Projects
        {editMode && (
          <button
            onClick={() => handleAddItem("projects", itemTemplates.projects)}
            style={{ fontSize: "0.8rem", color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}
            className="no-print"
          >
            + Add
          </button>
        )}
      </h3>
      {(localData.projects || []).map((proj, idx) => (
        (editMode || (proj.name?.trim() || proj.description?.trim())) ? (
          <div key={idx} style={editMode ? editBoxStyle : { marginBottom: "1rem" }}>
            {editMode && (
              <button
                onClick={() => handleRemoveItem("projects", idx)}
                style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                className="no-print"
              >
                ✖
              </button>
            )}
            {editMode ? (
              <>
                <input
                  value={proj.name || ""}
                  onChange={(e) => handleArrayFieldChange("projects", idx, "name", e.target.value)}
                  style={inputStyle}
                  placeholder="Project Name"
                />
                <textarea
                  value={proj.description || ""}
                  onChange={(e) => handleArrayFieldChange("projects", idx, "description", e.target.value)}
                  style={inputStyle}
                  placeholder="Project Description"
                  rows={2}
                />
                <input
                  value={(proj.technologies || []).join(", ")}
                  onChange={(e) => handleArrayFieldChange("projects", idx, "technologies", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                  style={inputStyle}
                  placeholder="Technologies (comma separated)"
                />
                <input
                  value={proj.link || ""}
                  onChange={(e) => handleArrayFieldChange("projects", idx, "link", e.target.value)}
                  style={inputStyle}
                  placeholder="Project Link"
                />
              </>
            ) : (
              <>
                <p><strong>{renderSafeText(proj.name)}</strong></p>
                <p>{renderSafeText(proj.description)}</p>
                {proj.technologies?.length > 0 && (
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>
                    <strong>Tech:</strong> {proj.technologies.join(", ")}
                  </p>
                )}
                {proj.link && (
                  <a href={getSafeUrl("portfolio", proj.link)} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5" }}>
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

  const certificationsSection = (editMode || hasContent.certifications(localData)) && (
    <div key="certifications" style={{ marginBottom: "1.5rem" }}>
      <h3 style={sectionTitleStyle}>
        Certifications
        {editMode && (
          <button
            onClick={() => handleAddItem("certifications", itemTemplates.certifications)}
            style={{ fontSize: "0.8rem", color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}
            className="no-print"
          >
            + Add
          </button>
        )}
      </h3>
      {(localData.certifications || []).map((cert, idx) => (
        (editMode || cert.title?.trim()) ? (
          <div key={idx} style={editMode ? editBoxStyle : { marginBottom: "0.5rem" }}>
            {editMode && (
              <button
                onClick={() => handleRemoveItem("certifications", idx)}
                style={{ position: "absolute", top: "5px", right: "5px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                className="no-print"
              >
                ✖
              </button>
            )}
            {editMode ? (
              <>
                <input
                  value={cert.title || ""}
                  onChange={(e) => handleArrayFieldChange("certifications", idx, "title", e.target.value)}
                  style={inputStyle}
                  placeholder="Certification Title"
                />
                <input
                  value={cert.issuer || ""}
                  onChange={(e) => handleArrayFieldChange("certifications", idx, "issuer", e.target.value)}
                  style={inputStyle}
                  placeholder="Issuer"
                />
                <input
                  value={cert.date || ""}
                  onChange={(e) => handleArrayFieldChange("certifications", idx, "date", e.target.value)}
                  style={inputStyle}
                  placeholder="Date"
                />
              </>
            ) : (
              <p>
                <strong>{renderSafeText(cert.title)}</strong> — {renderSafeText(cert.issuer)}, {renderSafeText(cert.date)}
              </p>
            )}
          </div>
        ) : null
      ))}
    </div>
  );

  const achievementsSection = (editMode || hasContent.achievements(localData)) && (
    <div key="achievements" style={{ marginBottom: "1.5rem" }}>
      <h3 style={sectionTitleStyle}>
        Achievements
        {editMode && (
          <button
            onClick={() => handleAddItem("achievements", itemTemplates.achievements)}
            style={{ fontSize: "0.8rem", color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}
            className="no-print"
          >
            + Add
          </button>
        )}
      </h3>
      {editMode ? (
        <div>
          {(localData.achievements || []).map((ach, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                value={ach || ""}
                onChange={(e) => handleArrayFieldChange("achievements", idx, null, e.target.value)}
                style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                placeholder="Achievement"
              />
              <button
                onClick={() => handleRemoveItem("achievements", idx)}
                style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginLeft: "5px" }}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      ) : (
        <ul style={listStyle}>
          {(localData.achievements || []).map((ach, idx) => (
            <li key={idx}>{renderSafeText(ach)}</li>
          ))}
        </ul>
      )}
    </div>
  );

  // RIGHT COLUMN SECTIONS

  const profileImageSection = (
    <div key="profile" style={{ textAlign: "center", marginBottom: "1rem" }}>
      {editMode ? (
        <>
          <label htmlFor="profileImageUpload" style={{ cursor: "pointer" }} className="no-print">
            <img
              src={profileImage || localData.profileImage || "/images/profile.jpg"}
              alt="Profile"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #6b7280",
              }}
            />
          </label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            id="profileImageUpload"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          <p style={{ fontSize: "0.8rem", textAlign: "left" }} className="no-print">
            Click image to upload a new one
          </p>
        </>
      ) : (
        localData.profileImage && (
          <img
            src={localData.profileImage}
            alt="Profile"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        )
      )}
    </div>
  );

  const contactSection = (editMode || hasAnyContact()) && (
    <div key="contact" style={{ marginBottom: "1.5rem" }}>
      <h3 style={sectionTitleStyle}>Contact</h3>
      {[
        { icon: MapPin, field: "location", label: "Location" },
        { icon: Phone, field: "phone", label: "Phone" },
        { icon: Mail, field: "email", label: "Email" },
        { icon: Linkedin, field: "linkedin", label: "LinkedIn" },
        { icon: Github, field: "github", label: "GitHub" },
        { icon: Globe, field: "portfolio", label: "Portfolio" },
      ].map(({ icon: Icon, field, label }, idx) => (
        <p key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
          <Icon size={16} style={{ marginRight: 6 }} />
          {editMode ? (
            <input
              value={localData[field] || ""}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "4px", padding: "4px" }}
              placeholder={label}
              className="no-print"
            />
          ) : field === "email" ? (
            <a
              href={getSafeUrl("email", localData[field])}
              style={{ color: "#2563eb", textDecoration: "underline", fontSize: "0.85rem" }}
            >
              {renderSafeText(localData[field])}
            </a>
          ) : field === "linkedin" || field === "github" || field === "portfolio" ? (
            <a
              href={getSafeUrl(field, localData[field])}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb", textDecoration: "underline", fontSize: "0.85rem" }}
            >
              {field === "linkedin" ? "LinkedIn" : field === "github" ? "GitHub" : "Portfolio"}
            </a>
          ) : (
            renderSafeText(localData[field])
          )}
        </p>
      ))}
    </div>
  );

  const skillsSection = (editMode || hasContent.skills(localData)) && (
    <div key="skills" style={{ marginBottom: "1.5rem" }}>
      <h3 style={sectionTitleStyle}>
        Skills
        {editMode && (
          <button
            onClick={() => handleAddItem("skills", itemTemplates.skills)}
            style={{ fontSize: "0.8rem", color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}
            className="no-print"
          >
            + Add
          </button>
        )}
      </h3>
      {editMode ? (
        <div>
          {(localData.skills || []).map((skill, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                value={skill || ""}
                onChange={(e) => handleArrayFieldChange("skills", idx, null, e.target.value)}
                style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                placeholder="Skill"
              />
              <button
                onClick={() => handleRemoveItem("skills", idx)}
                style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginLeft: "5px" }}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      ) : (
        <ul style={listStyle}>
          {(localData.skills || []).map((skill, idx) => (
            <li key={idx}>{renderSafeText(skill)}</li>
          ))}
        </ul>
      )}
    </div>
  );

  const languagesSection = (editMode || hasContent.languages(localData)) && (
    <div key="languages" style={{ marginBottom: "1.5rem" }}>
      <h3 style={sectionTitleStyle}>
        Languages
        {editMode && (
          <button
            onClick={() => handleAddItem("languages", itemTemplates.languages)}
            style={{ fontSize: "0.8rem", color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}
            className="no-print"
          >
            + Add
          </button>
        )}
      </h3>
      {editMode ? (
        <div>
          {(localData.languages || []).map((lang, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                value={lang || ""}
                onChange={(e) => handleArrayFieldChange("languages", idx, null, e.target.value)}
                style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                placeholder="Language"
              />
              <button
                onClick={() => handleRemoveItem("languages", idx)}
                style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginLeft: "5px" }}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      ) : (
        <ul style={listStyle}>
          {(localData.languages || []).map((lang, idx) => (
            <li key={idx}>{renderSafeText(lang)}</li>
          ))}
        </ul>
      )}
    </div>
  );

  const interestsSection = (editMode || hasContent.interests(localData)) && (
    <div key="interests" style={{ marginBottom: "1.5rem" }}>
      <h3 style={sectionTitleStyle}>
        Interests
        {editMode && (
          <button
            onClick={() => handleAddItem("interests", itemTemplates.interests)}
            style={{ fontSize: "0.8rem", color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}
            className="no-print"
          >
            + Add
          </button>
        )}
      </h3>
      {editMode ? (
        <div>
          {(localData.interests || []).map((interest, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                value={interest || ""}
                onChange={(e) => handleArrayFieldChange("interests", idx, null, e.target.value)}
                style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                placeholder="Interest"
              />
              <button
                onClick={() => handleRemoveItem("interests", idx)}
                style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginLeft: "5px" }}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      ) : (
        <ul style={listStyle}>
          {(localData.interests || []).map((interest, idx) => (
            <li key={idx}>{renderSafeText(interest)}</li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resumeRef={resumeRef} />
        <div
          style={{
            flexGrow: 1,
            padding: "2rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: "900px" }}>
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
                flexDirection: "row",
              }}
              data-resume-template="template22"
            >
              {/* LEFT COLUMN - Main Content */}
              <div style={{ flex: 2, padding: "2rem" }}>
                {/* Header */}
                <div style={{ marginBottom: "1rem" }}>
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={localData.name || ""}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        style={{
                          fontSize: "2.5rem",
                          fontWeight: "700",
                          width: "100%",
                          marginBottom: "0.5rem",
                          border: "1px solid #d1d5db",
                          padding: "0.25rem"
                        }}
                        placeholder="Full Name"
                        className="no-print"
                      />
                      <input
                        type="text"
                        value={localData.role || ""}
                        onChange={(e) => handleFieldChange("role", e.target.value)}
                        style={{
                          fontSize: "1.2rem",
                          width: "100%",
                          marginBottom: "1rem",
                          border: "1px solid #d1d5db",
                          padding: "0.25rem"
                        }}
                        placeholder="Job Title"
                        className="no-print"
                      />
                    </>
                  ) : (
                    <>
                      <h1 style={{ fontSize: "2.5rem", fontWeight: "700", margin: 0 }}>
                        {renderSafeText(localData.name) || "Your Name"}
                      </h1>
                      <h2 style={{ fontSize: "1.2rem", color: "#4f46e5", marginTop: "0.25rem" }}>
                        {renderSafeText(localData.role)}
                      </h2>
                    </>
                  )}
                </div>

                {/* DYNAMIC LEFT COLUMN SECTIONS */}
                {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                  "summary", "experience", "education", "projects", "certifications", "achievements"
                ]).map((sectionKey) => {
                  switch(sectionKey) {
                    case "summary": return summarySection;
                    case "experience": return experienceSection;
                    case "education": return educationSection;
                    case "projects": return projectsSection;
                    case "certifications": return certificationsSection;
                    case "achievements": return achievementsSection;
                    default: return null;
                  }
                })}
              </div>

              {/* RIGHT COLUMN - Sidebar */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#f3f4f6",
                  padding: "2rem",
                  borderLeft: "1px solid #e5e7eb",
                }}
              >
                {/* Profile Image */}
                {profileImageSection}

                {/* Contact */}
                {contactSection}

                {/* Skills */}
                {skillsSection}

                {/* Languages */}
                {languagesSection}

                {/* Interests */}
                {interestsSection}
              </div>
            </div>

            {/* FLOATING EDIT/SAVE CONTROLS */}
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
                      backgroundColor: "#6b7280",
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
                    backgroundColor: "#2563eb",
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template22;