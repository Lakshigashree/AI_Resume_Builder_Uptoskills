import React, { useState, useEffect, useRef, forwardRef } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import PropTypes from "prop-types";
import { getSafeUrl } from "../../utils/ResumeConfig"; // Import URL helper

// --- Helper function to safely render text from objects or strings ---
const renderSafeText = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    // Try common property names in order of priority
    return item.title || item.name || item.language || item.degree || JSON.stringify(item);
  }
  return String(item);
};

// --- Resume Preview Component (PURE INLINE STYLES - NO CSS CLASSES) ---
const UserResumePreview = forwardRef(
  ({ data, themeColor, zoomLevel, sectionOrder }, ref) => {
   
    // Custom theme colors
    const theme = {
      text: "#000000",       
      accent: "#4b42f5",     
      bullet: "#4b42f5",     
      gray: "#555555"        
    };

    // Safety check
    if (!data) return null;

    // Helper components with inline styles only
    const Section = ({ title, children, icon }) => (
      <section style={{ marginBottom: "1.5rem" }}>
        {title && (
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "bold", 
            marginBottom: "0.75rem", 
            display: "flex", 
            alignItems: "center",
            color: theme.accent,
            borderBottom: "0px"
          }}>
            <span style={{ marginRight: "0.5rem", fontSize: "1.5rem" }}>{icon}</span>
            {title}
          </h2>
        )}
        {children}
      </section>
    );

    // Map section keys to their display components
    const sectionComponents = {
      // SUMMARY
      summary: data.summary && (
        <Section key="summary" title="Summary" icon="👤">
          <p style={{ fontSize: "1rem", lineHeight: "1.6", textAlign: "justify", color: "#333333", margin: 0 }}>
            {renderSafeText(data.summary)}
          </p>
        </Section>
      ),

      // EXPERIENCE
      experience: Array.isArray(data.experience) && data.experience.length > 0 && (
        <Section key="experience" title="Experience" icon="💼">
          {data.experience.map((exp, i) => (
            <div key={exp.id || i} style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.25rem" }}>
                <h3 style={{ fontSize: "1.125rem", color: "#000000", margin: 0 }}>
                  <span style={{ fontWeight: "bold" }}>{renderSafeText(exp.title)}</span>
                  {exp.companyName && (
                    <>
                       {" at "}
                      <span style={{ fontWeight: "bold", color: theme.accent }}>
                        {renderSafeText(exp.companyName)}
                      </span>
                    </>
                  )}
                </h3>
                <span style={{ fontSize: "0.875rem", fontWeight: "bold", whiteSpace: "nowrap", color: "#555555" }}>
                  {exp.date}
                </span>
              </div>
              
              <p style={{ fontSize: "0.875rem", fontStyle: "italic", marginBottom: "0.5rem", color: "#666666", margin: 0 }}>
                {exp.companyLocation}
              </p>

              <ul style={{ listStyle: "none", paddingLeft: "0.5rem", margin: 0 }}>
                {Array.isArray(exp.accomplishment) && exp.accomplishment.map((point, j) => {
                  const safePoint = renderSafeText(point);
                  return safePoint && safePoint.trim() !== "" && (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", fontSize: "1rem", marginBottom: "0.25rem" }}>
                      <span style={{ marginRight: "0.5rem", fontSize: "1.25rem", lineHeight: "1", color: theme.bullet }}>•</span> 
                      <span>{safePoint}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Section>
      ),

      // EDUCATION
      education: Array.isArray(data.education) && data.education.length > 0 && (
        <Section key="education" title="Education" icon="🎓">
          {data.education.map((edu, i) => (
            <div key={edu.id || i} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#000000", margin: 0 }}>
                  {renderSafeText(edu.degree)}
                </h3>
                <span style={{ fontSize: "0.875rem", fontWeight: "bold", whiteSpace: "nowrap", color: "#555555" }}>
                  {edu.duration}
                </span>
              </div>
              <p style={{ fontSize: "1rem", fontStyle: "italic", color: theme.accent, margin: 0 }}>
                {renderSafeText(edu.institution)}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#555555", margin: 0 }}>
                {edu.location}
              </p>
            </div>
          ))}
        </Section>
      ),

      // SKILLS
      skills: Array.isArray(data.skills) && data.skills.length > 0 && (
        <Section key="skills" title="Skills" icon="💡">
          <ul style={{ listStyle: "none", paddingLeft: "0.5rem", margin: 0 }}>
            {data.skills.map((skill, i) => {
              const safeSkill = renderSafeText(skill);
              return safeSkill && safeSkill.trim() ? (
                <li key={i} style={{ display: "flex", alignItems: "center", fontSize: "1rem", marginBottom: "0.25rem" }}>
                  <span style={{ marginRight: "0.5rem", fontSize: "1.5rem", lineHeight: "1", color: theme.bullet }}>•</span>
                  <span>{safeSkill}</span>
                </li>
              ) : null;
            })}
          </ul>
        </Section>
      ),

      // PROJECTS
      projects: Array.isArray(data.projects) && data.projects.length > 0 && (
        <Section key="projects" title="Projects" icon="🚀">
          {data.projects.map((project, i) => (
            <div key={project.id || i} style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#000000", margin: 0 }}>
                  {renderSafeText(project.name)}
                </h3>
                {project.link && (
                  <a href={getSafeUrl("portfolio", project.link)} target="_blank" rel="noreferrer" style={{ fontSize: "0.875rem", color: theme.accent, textDecoration: "none" }}>
                    View Project ↗
                  </a>
                )}
              </div>
              {project.technologies && (
                <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem", color: "#444444", margin: 0 }}>
                  <span style={{ fontWeight: "bold" }}>Tech Stack: </span>
                  {Array.isArray(project.technologies) 
                    ? project.technologies.map(t => renderSafeText(t)).join(", ") 
                    : renderSafeText(project.technologies)}
                </p>
              )}
              <p style={{ fontSize: "1rem", color: "#000000", margin: 0 }}>{renderSafeText(project.description)}</p>
            </div>
          ))}
        </Section>
      ),

      // CERTIFICATIONS
      certifications: Array.isArray(data.certifications) && data.certifications.length > 0 && (
        <Section key="certifications" title="Certifications" icon="📜">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {data.certifications.map((cert, i) => (
              <li key={cert.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: "bold", color: "#000000", margin: 0 }}>{renderSafeText(cert.title)}</h4>
                  <p style={{ fontSize: "0.875rem", fontStyle: "italic", color: "#555555", margin: 0 }}>{renderSafeText(cert.issuer)}</p>
                </div>
                <span style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#555555" }}>{cert.date}</span>
              </li>
            ))}
          </ul>
        </Section>
      ),

      // ACHIEVEMENTS
      achievements: Array.isArray(data.achievements) && data.achievements.length > 0 && (
        <Section key="achievements" title="Achievements" icon="🏆">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {data.achievements.map((ach, i) => {
              if (typeof ach === 'object') {
                return (
                  <li key={i} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <h4 style={{ fontSize: "1rem", fontWeight: "bold", color: "#000000", margin: 0 }}>{renderSafeText(ach.title)}</h4>
                      <span style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#555555" }}>{ach.date}</span>
                    </div>
                    <p style={{ fontSize: "0.875rem", fontStyle: "italic", color: "#555555", margin: 0 }}>{renderSafeText(ach.description)}</p>
                  </li>
                );
              } else {
                const safeAch = renderSafeText(ach);
                return safeAch && (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", fontSize: "1rem", marginBottom: "0.25rem" }}>
                    <span style={{ marginRight: "0.5rem", fontSize: "1.25rem", lineHeight: "1", color: theme.bullet }}>•</span>
                    {safeAch}
                  </li>
                );
              }
            })}
          </ul>
        </Section>
      ),

      // LANGUAGES
      languages: Array.isArray(data.languages) && data.languages.length > 0 && (
        <Section key="languages" title="Languages" icon="🗣️">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {data.languages.map((lang, i) => {
              const safeLang = renderSafeText(lang);
              return safeLang && safeLang.trim() ? (
                <span key={i} style={{ fontSize: "1rem", color: "#000000" }}>
                  <span style={{ color: theme.accent, marginRight: "0.25rem" }}>•</span>
                  {safeLang}
                </span>
              ) : null;
            })}
          </div>
        </Section>
      ),

      // INTERESTS
      interests: Array.isArray(data.interests) && data.interests.length > 0 && (
        <Section key="interests" title="Interests" icon="🎯">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {data.interests.map((interest, i) => {
              const safeInterest = renderSafeText(interest);
              return safeInterest && safeInterest.trim() ? (
                <span key={i} style={{ fontSize: "1rem", color: "#000000" }}>
                  <span style={{ color: theme.accent, marginRight: "0.25rem" }}>•</span>
                  {safeInterest}
                </span>
              ) : null;
            })}
          </div>
        </Section>
      )
    };

    return (
      <div
        ref={ref}
        id="resume-preview-id"
        style={{
          fontFamily: "'Times New Roman', Times, serif", 
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
          color: theme.text,
          lineHeight: "1.5",
          backgroundColor: "#ffffff",
          width: "100%",
          maxWidth: "210mm", // A4 width
          margin: "0 auto",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          overflow: "hidden"
        }}
      >
        {/* --- HEADER --- */}
        <header style={{ paddingTop: "2.5rem", paddingBottom: "1rem", paddingLeft: "3rem", paddingRight: "3rem", textAlign: "center", backgroundColor: "#ffffff" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#000000", lineHeight: "1.2" }}>
            {data.name || "Your Name"}
          </h1>
          {data.role && ( 
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: theme.accent }}>
              {data.role}
            </p>
          )}
          
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.5rem", fontSize: "1rem", color: theme.gray }}>
            {data.location && ( 
              <p style={{ display: "flex", alignItems: "center", margin: 0 }}>
                <span style={{ marginRight: "0.25rem" }}>📍</span>
                {data.location}
              </p>
            )}
            {data.phone && (
              <p style={{ display: "flex", alignItems: "center", margin: 0 }}>
                <span style={{ marginRight: "0.25rem" }}>📞</span>
                <a href={getSafeUrl("phone", data.phone)} style={{ color: "inherit", textDecoration: "none" }}>
                  {data.phone}
                </a>
              </p>
            )}
            {data.email && (
              <p style={{ display: "flex", alignItems: "center", margin: 0 }}>
                <span style={{ marginRight: "0.25rem" }}>✉️</span>
                <a href={getSafeUrl("email", data.email)} style={{ color: "inherit", textDecoration: "none" }}>
                  {data.email}
                </a>
              </p>
            )}
            {data.linkedin && (
              <p style={{ display: "flex", alignItems: "center", margin: 0 }}>
                <span style={{ marginRight: "0.25rem" }}>🔗</span>
                <a href={getSafeUrl("linkedin", data.linkedin)} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                  LinkedIn
                </a>
              </p>
            )}
            {data.github && (
              <p style={{ display: "flex", alignItems: "center", margin: 0 }}>
                <span style={{ marginRight: "0.25rem" }}>💻</span>
                <a href={getSafeUrl("github", data.github)} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                  GitHub
                </a>
              </p>
            )}
            {data.portfolio && ( 
              <p style={{ display: "flex", alignItems: "center", margin: 0 }}>
                <span style={{ marginRight: "0.25rem" }}>🌐</span>
                <a href={getSafeUrl("portfolio", data.portfolio)} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                  Portfolio
                </a>
              </p>
            )}
          </div>
        </header>

        {/* Horizontal Line */}
        <div style={{ margin: "0 3rem 2rem 3rem", borderBottom: "2px solid #000000", opacity: 0.8 }}></div>

        <div style={{ paddingLeft: "3rem", paddingRight: "3rem", paddingBottom: "3rem", backgroundColor: "#ffffff" }}>
          {/* DYNAMIC SECTION RENDERING - Using sectionOrder from context */}
          {(sectionOrder || [
            "summary", "experience", "education", "skills", "projects", 
            "certifications", "achievements", "languages", "interests"
          ]).map((sectionKey) => sectionComponents[sectionKey] || null)}
        </div>
      </div>
    );
  }
);

UserResumePreview.displayName = "UserResumePreview";
UserResumePreview.propTypes = {
  data: PropTypes.object.isRequired,
  themeColor: PropTypes.string,
  zoomLevel: PropTypes.number,
  sectionOrder: PropTypes.array
};

// --- FORM HELPER COMPONENTS (Standard CSS Classes are fine here as they aren't printed) ---
const FormSectionWrapper = ({ title, children }) => (
  <div className="mb-8 p-5 border rounded-lg bg-slate-50 shadow-sm">
    <h3 className="text-xl font-semibold text-indigo-700 mb-5">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);
FormSectionWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-base font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder || label}
      className="border border-gray-300 p-2.5 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
    />
  </div>
);
Input.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
};

const Textarea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="block text-base font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <textarea
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder || label}
      rows={rows}
      className="border border-gray-300 p-2.5 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
    />
  </div>
);
Textarea.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
};

// --- Resume Edit Form ---
const UserResumeEditForm = ({ formData, setFormData }) => {
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (section, index, field, value) => {
    setFormData((prev) => {
      const newArray = [...(prev[section] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  const handleExperiencePointChange = (expIndex, pointIndex, value) => {
    setFormData((prev) => {
      const newExperience = [...(prev.experience || [])];
      const currentPoints = newExperience[expIndex].accomplishment
        ? [...newExperience[expIndex].accomplishment]
        : [];
      currentPoints[pointIndex] = value;
      newExperience[expIndex] = {
        ...newExperience[expIndex],
        accomplishment: currentPoints,
      };
      return { ...prev, experience: newExperience };
    });
  };

  const addArrayItem = (section, template) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [
        ...(prev[section] || []),
        { ...template, id: `${section.slice(0, 3)}-${Date.now()}` },
      ],
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData((prev) => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index),
    }));
  };

  const addExperiencePoint = (expIndex) => {
    setFormData((prev) => {
      const newExperience = [...(prev.experience || [])];
      const currentPoints = newExperience[expIndex].accomplishment
        ? [...newExperience[expIndex].accomplishment]
        : [];
      currentPoints.push("");
      newExperience[expIndex] = {
        ...newExperience[expIndex],
        accomplishment: currentPoints,
      };
      return { ...prev, experience: newExperience };
    });
  };

  const removeExperiencePoint = (expIndex, pointIndex) => {
    setFormData((prev) => {
      const newExperience = [...(prev.experience || [])];
      if (newExperience[expIndex] && newExperience[expIndex].accomplishment) {
        newExperience[expIndex] = {
          ...newExperience[expIndex],
          accomplishment: newExperience[expIndex].accomplishment.filter(
            (_, i) => i !== pointIndex
          ),
        };
      }
      return { ...prev, experience: newExperience };
    });
  };

  const handleListChange = (field, value) => {
    const modifiedValue = value.replace(/\n/g, ",");
    setFormData((prev) => ({
      ...prev,
      [field]: modifiedValue.split(",").map(s => s.trim()).filter(s => s), 
    }));
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl space-y-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
        Edit Your Resume
      </h2>

      <FormSectionWrapper title="Personal Details">
        <Input label="Full Name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
        <Input label="Job Title" value={formData.role} onChange={(e) => updateField("role", e.target.value)} />
        <Input label="Address" value={formData.location} onChange={(e) => updateField("location", e.target.value)} />
        <Input label="Phone" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} type="tel" />
        <Input label="Email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} type="email" />
        <Input label="LinkedIn" value={formData.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} />
        <Input label="GitHub" value={formData.github} onChange={(e) => updateField("github", e.target.value)} />
        <Input label="Portfolio" value={formData.portfolio} onChange={(e) => updateField("portfolio", e.target.value)} />
      </FormSectionWrapper>

      <FormSectionWrapper title="Profile Summary">
        <Textarea label="Summary" value={formData.summary} onChange={(e) => updateField("summary", e.target.value)} rows={5} />
      </FormSectionWrapper>

      <FormSectionWrapper title="Work Experience">
        {(formData.experience || []).map((exp, i) => (
          <div key={exp.id || i} className="p-4 border rounded-md bg-white space-y-3 relative">
            <button onClick={() => removeArrayItem("experience", i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 font-bold text-xl">🗑️</button>
            <Input label="Job Title" value={exp.title} onChange={(e) => handleArrayFieldChange("experience", i, "title", e.target.value)} />
            <Input label="Company" value={exp.companyName} onChange={(e) => handleArrayFieldChange("experience", i, "companyName", e.target.value)} />
            <Input label="Duration" value={exp.date} onChange={(e) => handleArrayFieldChange("experience", i, "date", e.target.value)} />
            <Input label="Location" value={exp.companyLocation} onChange={(e) => handleArrayFieldChange("experience", i, "companyLocation", e.target.value)} />
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1.5">Responsibilities:</label>
              {(exp.accomplishment || []).map((point, j) => (
                <div key={j} className="flex items-center mb-2">
                  <Textarea value={point} onChange={(e) => handleExperiencePointChange(i, j, e.target.value)} rows={1} />
                  <button onClick={() => removeExperiencePoint(i, j)} className="ml-3 text-red-400 hover:text-red-600 p-1 text-lg">🗑️</button>
                </div>
              ))}
              <button onClick={() => addExperiencePoint(i)} className="text-md text-indigo-600 hover:text-indigo-800 flex items-center mt-2 font-semibold">➕ Add Point</button>
            </div>
          </div>
        ))}
        <button onClick={() => addArrayItem("experience", { id: `exp-${Date.now()}`, title: "", companyName: "", date: "", companyLocation: "", accomplishment: [""] })} className="bg-indigo-500 text-white px-5 py-2.5 rounded-md hover:bg-indigo-600 flex items-center text-md">➕ Add Experience</button>
      </FormSectionWrapper>

      <FormSectionWrapper title="Education">
        {(formData.education || []).map((edu, i) => (
          <div key={edu.id || i} className="p-4 border rounded-md bg-white space-y-3 relative">
            <button onClick={() => removeArrayItem("education", i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 text-xl">🗑️</button>
            <Input label="Duration" value={edu.duration} onChange={(e) => handleArrayFieldChange("education", i, "duration", e.target.value)} />
            <Input label="Degree" value={edu.degree} onChange={(e) => handleArrayFieldChange("education", i, "degree", e.target.value)} />
            <Input label="Institution" value={edu.institution} onChange={(e) => handleArrayFieldChange("education", i, "institution", e.target.value)} />
            <Input label="Location" value={edu.location} onChange={(e) => handleArrayFieldChange("education", i, "location", e.target.value)} />
          </div>
        ))}
        <button onClick={() => addArrayItem("education", { id: `edu-${Date.now()}`, duration: "", degree: "", institution: "", location: "" })} className="bg-indigo-500 text-white px-5 py-2.5 rounded-md hover:bg-indigo-600 flex items-center text-md">➕ Add Education</button>
      </FormSectionWrapper>

      <FormSectionWrapper title="Projects">
        {(formData.projects || []).map((proj, i) => (
          <div key={proj.id || i} className="p-4 border rounded-md bg-white space-y-3 relative">
            <button onClick={() => removeArrayItem("projects", i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 text-xl">🗑️</button>
            <Input label="Project Name" value={proj.name} onChange={(e) => handleArrayFieldChange("projects", i, "name", e.target.value)} />
            <Input label="Technologies (comma separated)" value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies || ""} onChange={(e) => handleArrayFieldChange("projects", i, "technologies", e.target.value.split(",").map(t => t.trim()).filter(t => t))} />
            <Input label="Project Link" value={proj.link} onChange={(e) => handleArrayFieldChange("projects", i, "link", e.target.value)} />
            <Textarea label="Description" value={proj.description} onChange={(e) => handleArrayFieldChange("projects", i, "description", e.target.value)} rows={3} />
          </div>
        ))}
        <button onClick={() => addArrayItem("projects", { id: `proj-${Date.now()}`, name: "", technologies: [], link: "", description: "" })} className="bg-indigo-500 text-white px-5 py-2.5 rounded-md hover:bg-indigo-600 flex items-center text-md">➕ Add Project</button>
      </FormSectionWrapper>

      <FormSectionWrapper title="Certifications">
        {(formData.certifications || []).map((cert, i) => (
          <div key={cert.id || i} className="p-4 border rounded-md bg-white space-y-3 relative">
            <button onClick={() => removeArrayItem("certifications", i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 text-xl">🗑️</button>
            <Input label="Title" value={cert.title} onChange={(e) => handleArrayFieldChange("certifications", i, "title", e.target.value)} />
            <Input label="Issuer" value={cert.issuer} onChange={(e) => handleArrayFieldChange("certifications", i, "issuer", e.target.value)} />
            <Input label="Date" value={cert.date} onChange={(e) => handleArrayFieldChange("certifications", i, "date", e.target.value)} />
          </div>
        ))}
        <button onClick={() => addArrayItem("certifications", { id: `cert-${Date.now()}`, title: "", issuer: "", date: "" })} className="bg-indigo-500 text-white px-5 py-2.5 rounded-md hover:bg-indigo-600 flex items-center text-md">➕ Add Certification</button>
      </FormSectionWrapper>

      {/* ========== FIXED ACHIEVEMENTS SECTION ========== */}
      <FormSectionWrapper title="Achievements">
        {Array.isArray(formData.achievements) && formData.achievements.map((ach, i) => (
          <div key={ach.id || i} className="p-4 border rounded-md bg-white space-y-3 relative">
            <button onClick={() => removeArrayItem("achievements", i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 text-xl">🗑️</button>
            <Input label="Achievement Title" value={ach.title || ""} onChange={(e) => handleArrayFieldChange("achievements", i, "title", e.target.value)} placeholder="e.g. Hackathon Winner" />
            <Input label="Description / Organization" value={ach.description || ""} onChange={(e) => handleArrayFieldChange("achievements", i, "description", e.target.value)} placeholder="e.g. Smart India Hackathon" />
            <Input label="Date / Year" value={ach.date || ""} onChange={(e) => handleArrayFieldChange("achievements", i, "date", e.target.value)} placeholder="e.g. 2025" />
          </div>
        ))}
        <button onClick={() => addArrayItem("achievements", { id: `ach-${Date.now()}`, title: "", description: "", date: "" })} className="bg-indigo-500 text-white px-5 py-2.5 rounded-md hover:bg-indigo-600 flex items-center text-md">➕ Add Achievement</button>
      </FormSectionWrapper>

      <FormSectionWrapper title="Skills">
        <Textarea label="Skills (comma-separated)" value={(formData.skills || []).join(", ")} onChange={(e) => handleListChange("skills", e.target.value)} />
      </FormSectionWrapper>

      <FormSectionWrapper title="Languages">
        <Textarea label="Languages (comma-separated)" value={(formData.languages || []).join(", ")} onChange={(e) => handleListChange("languages", e.target.value)} />
      </FormSectionWrapper>

      <FormSectionWrapper title="Interests">
        <Textarea label="Interests (comma-separated)" value={(formData.interests || []).join(", ")} onChange={(e) => handleListChange("interests", e.target.value)} />
      </FormSectionWrapper>
    </div>
  );
};

UserResumeEditForm.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

// --- Main Template Component ---
const Template15 = () => {
  const { resumeData, updateResumeData, sectionOrder } = useResume();
  const [formData, setFormData] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  const resumeRef = useRef(null);

  useEffect(() => {
    if (resumeData) {
      let cleanAchievements = resumeData.achievements || [];
      if (cleanAchievements.length > 0 && typeof cleanAchievements[0] === 'string') {
         cleanAchievements = cleanAchievements.map(a => ({ title: a, description: "", date: "" }));
      }

      setFormData({
        ...resumeData,
        projects: resumeData.projects || [],
        certifications: resumeData.certifications || [],
        achievements: cleanAchievements, 
        skills: resumeData.skills || [],
        languages: resumeData.languages || [],
        interests: resumeData.interests || [],
        experience: resumeData.experience || [],
        education: resumeData.education || []
      });
    }
  }, [resumeData]);

  const handleSave = () => {
    if (updateResumeData) {
      updateResumeData(formData);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setFormData(resumeData);
    setIsEditing(false);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDownload = async () => {
    const element = resumeRef.current;
    if (!element) {
      alert("Resume element not found!");
      return;
    }
    try {
      const clone = element.cloneNode(true);
      
      // Create a container to hold the clone, preventing inheritance of global styles
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '210mm'; 
      container.style.backgroundColor = '#ffffff'; 
      container.style.color = '#000000';
      container.style.fontFamily = "'Times New Roman', Times, serif";
      
      container.appendChild(clone);
      document.body.appendChild(container);

      clone.style.transform = 'scale(1)';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      clone.style.transformOrigin = 'top left';
      clone.style.backgroundColor = '#ffffff';
      
      const canvas = await html2canvas(clone, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#ffffff", 
        logging: false
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pdfWidth, pdfHeight] });
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const downloadName = (resumeData.name || "Resume").replace(/\s+/g, "_");
      pdf.save(`${downloadName}_Resume.pdf`);

    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert(`Failed to download PDF: ${error.message}.`);
    }
  };

  if (!formData || !resumeData) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p>Loading Your Resume...</p>
        </div>
    );
  }

  // Floating button styles
  const buttonStyle = { 
    padding: "0.75rem 1.5rem", 
    borderRadius: "0.375rem", 
    border: "none", 
    fontSize: "1rem", 
    fontWeight: "600", 
    cursor: "pointer", 
    transition: "all 0.3s" 
  };
  const saveButtonStyle = { ...buttonStyle, backgroundColor: "#10b981", color: "white", marginRight: "0.5rem" };
  const cancelButtonStyle = { ...buttonStyle, backgroundColor: "#6b7280", color: "white" };
  const editButtonStyle = { ...buttonStyle, backgroundColor: "#3b82f6", color: "white" };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar onDownload={handleDownload} resumeRef={resumeRef} />
        <div className="flex-1 p-6 pb-24"> 
          <div className="max-w-7xl mx-auto">
            <div className="w-full mt-8">
              <div className="max-w-2xl mx-auto" hidden={!isEditing}>
                <UserResumeEditForm formData={formData} setFormData={setFormData} />
              </div>
              <div hidden={isEditing}>
                <UserResumePreview 
                  ref={resumeRef} 
                  data={resumeData} 
                  themeColor="indigo" 
                  zoomLevel={1} 
                  sectionOrder={sectionOrder}
                />
              </div>
            </div>
            
            {/* Floating Action Buttons at Bottom */}
            <div style={{ 
              position: "fixed", 
              bottom: "30px", 
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
            }}>
              {isEditing ? (
                <>
                  <button onClick={handleSave} style={saveButtonStyle}>Save Changes</button>
                  <button onClick={handleCancel} style={cancelButtonStyle}>Cancel</button>
                </>
              ) : (
                <button onClick={handleEdit} style={editButtonStyle}>Edit Resume</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template15;