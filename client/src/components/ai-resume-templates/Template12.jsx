import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import resumeService from "../../services/resumeService";
import { getSafeUrl } from "../../utils/ResumeConfig";
import html2pdf from "html2pdf.js";

const accent = "#bccfd0"; // soft teal-grey accent used across the layout

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
  const sectionOrder = resumeContext?.sectionOrder || [];

  const [localData, setLocalData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Initialize with default data if empty
  useEffect(() => {
    if (resumeData && Object.keys(resumeData).length > 0) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
    } else {
      // Default data structure
      const defaultData = {
        name: "ELLA BROOKS",
        role: "FULL STACK DEVELOPER",
        email: "ellabrooks@gmail.com",
        phone: "+1 234 567 8900",
        location: "Chennai, India",
        linkedin: "linkedin.com/in/ella",
        github: "github.com/ella",
        portfolio: "ellabrooks.dev",
        summary: "Write a compelling professional summary highlighting your key strengths and career goals...",
        experience: [
          {
            title: "Frontend Intern",
            company: "Google",
            duration: "2022 – 2023",
            description: "Developed and maintained web applications using React and TypeScript. Collaborated with cross-functional teams to deliver high-quality features."
          }
        ],
        education: [
          {
            degree: "BE in Computer Science",
            institution: "Bluefield University",
            year: "2017 – 2021"
          }
        ],
        skills: ["Front and Backend Development", "React.js / JavaScript", "Node.js / Express.js", "Git & REST APIs"],
        projects: [
          {
            name: "Portfolio Website",
            description: "Developed with React and Tailwind to showcase skills and projects professionally."
          }
        ],
        certifications: [
          {
            name: "AWS Cloud Practitioner",
            title: "AWS Cloud Practitioner"
          }
        ],
        achievements: ["Achievement 1", "Achievement 2"],
        languages: [
          { language: "English", proficiency: 6 },
          { language: "French", proficiency: 4 },
          { language: "Spanish", proficiency: 3 }
        ],
        interests: ["Travelling", "Books", "Photography"],
        templateId: 16
      };
      setLocalData(defaultData);
    }
  }, [resumeData]);

  const handleFieldChange = (field, value) => {
    if (!localData) return;
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    localStorage.setItem("resumeData", JSON.stringify(updated));
  };

  // Handle nested personal info fields
  const handlePersonalInfoChange = (field, value) => {
    if (!localData) return;
    const updated = { 
      ...localData, 
      [field]: value 
    };
    setLocalData(updated);
    localStorage.setItem("resumeData", JSON.stringify(updated));
  };

  // Handle array field changes for complex objects
  const handleArrayUpdate = (section, index, key, value) => {
    if (!localData || !localData[section]) return;
    
    setLocalData(prev => {
      const updated = [...(prev[section] || [])];
      if (!updated[index]) updated[index] = {};
      
      if (typeof updated[index] === 'object') {
        updated[index] = { ...updated[index], [key]: value };
      } else {
        updated[index] = value;
      }
      
      const newData = { ...prev, [section]: updated };
      localStorage.setItem("resumeData", JSON.stringify(newData));
      return newData;
    });
  };

  // Handle simple array changes (skills, interests, achievements)
  const handleSimpleArrayChange = (section, index, value) => {
    if (!localData || !localData[section]) return;
    
    setLocalData(prev => {
      const updated = [...(prev[section] || [])];
      updated[index] = value;
      const newData = { ...prev, [section]: updated };
      localStorage.setItem("resumeData", JSON.stringify(newData));
      return newData;
    });
  };

  // Add new item to array
  const handleAddItem = (section, emptyItem = "") => {
    if (!localData) return;
    
    setLocalData(prev => {
      const updated = {
        ...prev,
        [section]: [...(prev[section] || []), emptyItem]
      };
      localStorage.setItem("resumeData", JSON.stringify(updated));
      toast.info(`Added new ${section} item`);
      return updated;
    });
  };

  // Remove item from array
  const handleRemoveItem = (section, index) => {
    if (!localData || !localData[section]) return;
    
    setLocalData(prev => {
      const updated = [...(prev[section] || [])];
      updated.splice(index, 1);
      const newData = { ...prev, [section]: updated };
      localStorage.setItem("resumeData", JSON.stringify(newData));
      toast.warn(`Removed ${section} item`);
      return newData;
    });
  };

  // ========== DOWNLOAD FUNCTIONALITY ==========
  const handleDownload = async () => {
    const element = resumeRef.current;
    if (!element) {
      toast.error('Resume content not found');
      return;
    }

    if (isDownloading) return;
    setIsDownloading(true);

    // Store original styles
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    const originalPosition = element.style.position;
    const originalZIndex = element.style.zIndex;
    
    // Temporarily adjust for PDF capture
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    element.style.position = 'relative';
    element.style.zIndex = '1';

    const options = {
      margin: [5, 5, 5, 5],
      filename: `${localData?.name?.replace(/\s+/g, '_') || 'Resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      enableLinks: true,
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: false,
        ignoreElements: (element) => {
          return element.getAttribute('data-html2canvas-ignore') === 'true' ||
                 element.classList.contains('no-print') ||
                 element.tagName === 'BUTTON' ||
                 element.closest('button') !== null ||
                 element.classList.contains('hide-in-pdf');
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    toast.info('📄 Generating PDF...', { autoClose: false, toastId: 'pdf-toast' });

    try {
      // Hide edit controls and buttons during PDF generation
      const elementsToHide = document.querySelectorAll('.no-print, .hide-in-pdf, button');
      elementsToHide.forEach(el => el.setAttribute('data-pdf-hide', 'true'));
      
      // Generate PDF
      await html2pdf().set(options).from(element).save();
      
      // Restore hidden elements
      elementsToHide.forEach(el => el.removeAttribute('data-pdf-hide'));
      
      toast.update('pdf-toast', { 
        render: '✅ Download complete!', 
        type: 'success', 
        autoClose: 3000 
      });
    } catch (err) {
      console.error('PDF Error:', err);
      toast.update('pdf-toast', { 
        render: '❌ Download failed', 
        type: 'error', 
        autoClose: 3000 
      });
    } finally {
      // Restore original styles
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
      element.style.position = originalPosition;
      element.style.zIndex = originalZIndex;
      setIsDownloading(false);
    }
  };

  // ========== PREVIEW FUNCTIONALITY ==========
  const handlePreview = async () => {
    const element = resumeRef.current;
    if (!element) {
      toast.error('Resume content not found');
      return;
    }

    if (isPreviewing) return;
    setIsPreviewing(true);

    // Store original styles
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    const originalPosition = element.style.position;
    const originalZIndex = element.style.zIndex;
    
    // Temporarily adjust for PDF capture
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    element.style.position = 'relative';
    element.style.zIndex = '1';

    const options = {
      margin: [5, 5, 5, 5],
      filename: 'preview.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      enableLinks: true,
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: false,
        ignoreElements: (element) => {
          return element.getAttribute('data-html2canvas-ignore') === 'true' ||
                 element.classList.contains('no-print') ||
                 element.tagName === 'BUTTON' ||
                 element.closest('button') !== null ||
                 element.classList.contains('hide-in-pdf');
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    toast.info('📄 Generating preview...', { autoClose: false, toastId: 'preview-toast' });

    try {
      // Hide edit controls and buttons during preview
      const elementsToHide = document.querySelectorAll('.no-print, .hide-in-pdf, button');
      elementsToHide.forEach(el => el.setAttribute('data-pdf-hide', 'true'));
      
      // Generate PDF and open in new tab
      const pdf = await html2pdf()
        .set(options)
        .from(element)
        .toPdf()
        .get('pdf');

      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Restore hidden elements
      elementsToHide.forEach(el => el.removeAttribute('data-pdf-hide'));
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.update('preview-toast', { 
        render: '✅ Preview opened in new tab!', 
        type: 'success', 
        autoClose: 3000 
      });
    } catch (err) {
      console.error('Preview Error:', err);
      toast.update('preview-toast', { 
        render: '❌ Preview failed', 
        type: 'error', 
        autoClose: 3000 
      });
    } finally {
      // Restore original styles
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
      element.style.position = originalPosition;
      element.style.zIndex = originalZIndex;
      setIsPreviewing(false);
    }
  };

  const handleSave = async () => {
    if (!localData) {
      toast.error("No data to save");
      return;
    }

    try {
      setSaveStatus("Saving...");
      setIsSavingToDatabase(true);

      // Normalize data before saving
      const normalized = { ...localData };
      
      // Clean empty items from arrays
      normalized.skills = (normalized.skills || []).filter(s => s && typeof s === 'string' && s.trim());
      normalized.interests = (normalized.interests || []).filter(i => i && typeof i === 'string' && i.trim());
      
      normalized.achievements = (normalized.achievements || []).filter(a => {
        if (typeof a === 'string') return a.trim();
        return a?.title?.trim() || a?.description?.trim();
      });
      
      normalized.education = (normalized.education || []).filter(
        e => e?.degree?.trim() || e?.institution?.trim()
      );
      
      normalized.experience = (normalized.experience || []).filter(
        e => e?.title?.trim() || e?.company?.trim() || e?.description?.trim()
      );
      
      normalized.projects = (normalized.projects || []).filter(
        p => p?.name?.trim() || p?.description?.trim()
      );
      
      normalized.certifications = (normalized.certifications || []).filter(
        c => {
          if (typeof c === 'string') return c.trim();
          return c?.name?.trim() || c?.title?.trim();
        }
      );
      
      normalized.languages = (normalized.languages || []).filter(
        l => l?.language?.trim()
      );

      if (!resumeContext || typeof updateResumeData !== "function") {
        // Fallback: save to localStorage only
        localStorage.setItem("resumeData", JSON.stringify(normalized));
      } else {
        await updateResumeData(normalized);
      }

      if (isAuthenticated) {
        const structuredData = {
          templateId: 16,
          name: normalized.name || "",
          role: normalized.role || "",
          email: normalized.email || "",
          phone: normalized.phone || "",
          location: normalized.location || "",
          linkedin: normalized.linkedin || "",
          github: normalized.github || "",
          portfolio: normalized.portfolio || "",
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
    setLocalData(resumeData ? JSON.parse(JSON.stringify(resumeData)) : null);
    setEditMode(false);
    setSaveStatus("");
    toast.info("Changes discarded");
  };

  const handleEnhance = (section, enhancedData = null) => {
    const source = enhancedData || resumeContext?.resumeData;
    if (!source || !localData) return;
    const updated = { ...localData, ...source };
    setLocalData(updated);
    localStorage.setItem("resumeData", JSON.stringify(updated));
    if (updateResumeData) {
      updateResumeData(updated);
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

  const headerName = localData.name || "ELLA BROOKS";
  const role = localData.role || "FULL STACK DEVELOPER";
  const phone = localData.phone || "";
  const email = localData.email || "";
  const location = localData.location || "";
  const linkedin = localData.linkedin || "";
  const github = localData.github || "";
  const portfolio = localData.portfolio || "";

  // Personal profile / summary
  const summary = typeof localData.summary === "string" ? localData.summary : "";

  const education = Array.isArray(localData.education) ? localData.education : [];
  const experience = Array.isArray(localData.experience) ? localData.experience : [];
  const projects = Array.isArray(localData.projects) ? localData.projects : [];
  const certifications = Array.isArray(localData.certifications) ? localData.certifications : [];
  const skills = Array.isArray(localData.skills) ? localData.skills : [];
  const interests = Array.isArray(localData.interests) ? localData.interests : [];
  const achievements = Array.isArray(localData.achievements) ? localData.achievements : [];

  // Convert languages to objects with proficiency if they're strings
  const normalizeLanguages = (langs) => {
    if (!Array.isArray(langs) || langs.length === 0) {
      return [];
    }
    return langs.map((lang) => {
      if (typeof lang === "string") {
        return {
          language: lang,
          proficiency: 4,
        };
      }
      return {
        language: lang.language || lang.name || "",
        proficiency: lang.proficiency || lang.level || 4,
      };
    });
  };

  const languages = normalizeLanguages(localData.languages);

  // ========== Profile image visibility ==========
  const hasProfileImage = () => {
    return localData.photoUrl && localData.photoUrl.trim().length > 0;
  };

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

  const hasSkills = () =>
    Array.isArray(localData.skills) &&
    localData.skills.some(skill => skill && skill.trim().length > 0);

  const hasInterests = () =>
    Array.isArray(localData.interests) &&
    localData.interests.some(interest => interest && interest.trim().length > 0);

  const hasLanguages = () =>
    Array.isArray(localData.languages) &&
    localData.languages.some(lang => 
      (lang.language && lang.language.trim().length > 0) ||
      (typeof lang === 'string' && lang.trim().length > 0)
    );

  const hasAchievements = () =>
    Array.isArray(localData.achievements) &&
    localData.achievements.some(ach => {
      if (typeof ach === 'string') return ach.trim().length > 0;
      return ach && ((ach.title && ach.title.trim().length > 0) || 
                    (ach.description && ach.description.trim().length > 0));
    });

  // Map section keys to their display components
  const sectionComponents = {
    // Right side sections (main content)
    summary: (editMode || hasSummary()) && (
      <TimelineSection key="summary" number="01" title="PROFESSIONAL PROFILE">
        {editMode && (
          <div className="mb-2 flex justify-end no-print">
            <button
              type="button"
              onClick={() => handleFieldChange("summary", "")}
              className="text-xs text-red-500 hover:underline"
            >
              Clear section
            </button>
          </div>
        )}
        {editMode ? (
          <div className="no-print">
            <textarea
              value={summary}
              onChange={(e) => handleFieldChange("summary", e.target.value)}
              className="h-32 w-full rounded border border-gray-300 px-2 py-1 text-[14px] leading-relaxed outline-none"
              placeholder="Write a short professional summary about yourself..."
            />
          </div>
        ) : (
          <p className="text-[14px] leading-relaxed text-[#3c4a4c]">{renderSafeText(summary)}</p>
        )}
      </TimelineSection>
    ),

    education: (editMode || hasEducation()) && (
      <TimelineSection key="education" number="02" title="EDUCATION">
        {editMode && (
          <div className="mb-2 flex justify-end no-print">
            <button
              type="button"
              onClick={() => handleFieldChange("education", [])}
              className="text-xs text-red-500 hover:underline"
            >
              Remove all
            </button>
          </div>
        )}
        {editMode ? (
          <div className="space-y-4 no-print">
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
                      onClick={() => handleRemoveItem("education", index)}
                      className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={edu.degree || ""}
                  onChange={(e) => handleArrayUpdate("education", index, "degree", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                  placeholder="Degree (e.g., BE in Computer Science)"
                />
                <input
                  type="text"
                  value={edu.institution || ""}
                  onChange={(e) => handleArrayUpdate("education", index, "institution", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                  placeholder="Institution (e.g., Bluefield University)"
                />
                <input
                  type="text"
                  value={edu.year || ""}
                  onChange={(e) => handleArrayUpdate("education", index, "year", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                  placeholder="Year (e.g., 2017 – 2021)"
                />
              </div>
            ))}
            <button
              onClick={() => handleAddItem("education", { degree: "", institution: "", year: "" })}
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
                    {renderSafeText(edu.degree)}
                  </p>
                )}
                {(edu.institution || edu.year) && (
                  <p className="mt-0.5 text-[14px] font-medium text-[#4f6669]">
                    {renderSafeText(edu.institution)}
                    {edu.year && ` (${renderSafeText(edu.year)})`}
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
    ),

    projects: (editMode || hasProjects()) && (
      <TimelineSection key="projects" number="03" title="PROJECTS">
        {editMode && (
          <div className="mb-2 flex justify-end no-print">
            <button
              type="button"
              onClick={() => handleFieldChange("projects", [])}
              className="text-xs text-red-500 hover:underline"
            >
              Remove all
            </button>
          </div>
        )}
        {editMode ? (
          <div className="space-y-4 no-print">
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
                      onClick={() => handleRemoveItem("projects", index)}
                      className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={project.name || ""}
                  onChange={(e) => handleArrayUpdate("projects", index, "name", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                  placeholder="Project Name (e.g., Portfolio Website)"
                />
                <textarea
                  value={project.description || ""}
                  onChange={(e) => handleArrayUpdate("projects", index, "description", e.target.value)}
                  className="h-24 w-full rounded border border-gray-300 px-2 py-1 text-[14px] leading-relaxed outline-none"
                  placeholder="Project description"
                />
              </div>
            ))}
            <button
              onClick={() => handleAddItem("projects", { name: "", description: "" })}
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
                    {renderSafeText(project.name)}
                  </p>
                )}
                {project.description && (
                  <p className="text-[14px] text-[#4f6669]">
                    {renderSafeText(project.description)}
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
    ),

    experience: (editMode || hasExperience()) && (
      <TimelineSection key="experience" number="04" title="EXPERIENCE">
        {editMode && (
          <div className="mb-2 flex justify-end no-print">
            <button
              type="button"
              onClick={() => handleFieldChange("experience", [])}
              className="text-xs text-red-500 hover:underline"
            >
              Remove all
            </button>
          </div>
        )}
        {editMode ? (
          <div className="space-y-4 no-print">
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
                      onClick={() => handleRemoveItem("experience", index)}
                      className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={exp.title || ""}
                  onChange={(e) => handleArrayUpdate("experience", index, "title", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                  placeholder="Job Title (e.g., Frontend Intern)"
                />
                <input
                  type="text"
                  value={exp.company || ""}
                  onChange={(e) => handleArrayUpdate("experience", index, "company", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                  placeholder="Company (e.g., Google)"
                />
                <input
                  type="text"
                  value={exp.duration || ""}
                  onChange={(e) => handleArrayUpdate("experience", index, "duration", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                  placeholder="Duration (e.g., 2022 – 2023)"
                />
                <textarea
                  value={exp.description || ""}
                  onChange={(e) => handleArrayUpdate("experience", index, "description", e.target.value)}
                  className="h-24 w-full rounded border border-gray-300 px-2 py-1 text-[14px] leading-relaxed outline-none"
                  placeholder="Job description and responsibilities"
                />
              </div>
            ))}
            <button
              onClick={() => handleAddItem("experience", { title: "", company: "", duration: "", description: "" })}
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
                    {renderSafeText(exp.title)}
                    {exp.company && ` — ${renderSafeText(exp.company)}`}
                  </p>
                )}
                {exp.duration && (
                  <p className="text-[14px] font-medium text-[#4f6669]">
                    {renderSafeText(exp.duration)}
                  </p>
                )}
                {exp.description && (
                  <p className="mt-1.5 text-[14px] text-[#4f6669]">
                    {renderSafeText(exp.description)}
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
    ),

    certifications: (editMode || hasCertifications()) && (
      <TimelineSection key="certifications" number="05" title="CERTIFICATIONS">
        {editMode && (
          <div className="mb-2 flex justify-end no-print">
            <button
              type="button"
              onClick={() => handleFieldChange("certifications", [])}
              className="text-xs text-red-500 hover:underline"
            >
              Remove all
            </button>
          </div>
        )}
        {editMode ? (
          <div className="space-y-4 no-print">
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
                      onClick={() => handleRemoveItem("certifications", index)}
                      className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={cert.name || cert.title || ""}
                  onChange={(e) => handleArrayUpdate("certifications", index, "name", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-[14px] outline-none"
                  placeholder="Certification Name (e.g., AWS Cloud Practitioner)"
                />
              </div>
            ))}
            <button
              onClick={() => handleAddItem("certifications", { name: "", title: "" })}
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
                <li key={idx}>{renderSafeText(cert)}</li>
              ))}
          </ul>
        )}
      </TimelineSection>
    ),

    achievements: (editMode || hasAchievements()) && (
      <TimelineSection key="achievements" number="06" title="ACHIEVEMENTS">
        {editMode && (
          <div className="mb-2 flex justify-end no-print">
            <button
              type="button"
              onClick={() => handleFieldChange("achievements", [])}
              className="text-xs text-red-500 hover:underline"
            >
              Remove all
            </button>
          </div>
        )}
        {editMode ? (
          <div className="space-y-2 no-print">
            {achievements.map((ach, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2"
              >
                <input
                  type="text"
                  value={typeof ach === 'string' ? ach : ach.title || ""}
                  onChange={(e) => {
                    if (typeof ach === 'string') {
                      handleSimpleArrayChange("achievements", index, e.target.value);
                    } else {
                      handleArrayUpdate("achievements", index, "title", e.target.value);
                    }
                  }}
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                  placeholder="Achievement"
                />
                {achievements.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem("achievements", index)}
                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => handleAddItem("achievements", "")}
              className="w-full rounded bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              + Add Achievement
            </button>
          </div>
        ) : (
          <ul className="ml-4 list-disc space-y-1 text-[14px] marker:text-[#4e6f73]">
            {achievements.map((ach, idx) => (
              <li key={idx}>{renderSafeText(ach)}</li>
            ))}
          </ul>
        )}
      </TimelineSection>
    ),

    // Left sidebar sections
    skills: (editMode || hasSkills()) && (
      <section key="skills" className="mt-7 w-full text-left text-[14px] text-[#405053]">
        <h3 className="mb-2 border-b border-white/60 pb-1 text-xs font-semibold tracking-[0.2em] text-[#4a6265]">
          EXPERTISE SKILLS
        </h3>
        {editMode ? (
          <div className="space-y-2 no-print">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2"
              >
                <input
                  type="text"
                  value={skill || ""}
                  onChange={(e) => handleSimpleArrayChange("skills", index, e.target.value)}
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                  placeholder="Skill name"
                />
                {skills.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem("skills", index)}
                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => handleAddItem("skills", "")}
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
                <li key={idx}>{renderSafeText(skill)}</li>
              ))}
          </ul>
        )}
      </section>
    ),

    languages: (editMode || hasLanguages()) && (
      <section key="languages" className="mt-7 w-full text-left text-[14px] text-[#405053]">
        <h3 className="mb-2 border-b border-white/60 pb-1 text-xs font-semibold tracking-[0.2em] text-[#4a6265]">
          LANGUAGE
        </h3>
        {editMode ? (
          <div className="space-y-3 no-print">
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
                      onClick={() => handleRemoveItem("languages", index)}
                      className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={langObj.language || ""}
                  onChange={(e) => handleArrayUpdate("languages", index, "language", e.target.value)}
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
                      onChange={(e) => handleArrayUpdate("languages", index, "proficiency", parseInt(e.target.value, 10))}
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
              onClick={() => handleAddItem("languages", { language: "", proficiency: 4 })}
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
                  <p>{renderSafeText(langObj.language)}</p>
                  <DotRow filled={langObj.proficiency || 4} />
                </div>
              ))}
          </div>
        )}
      </section>
    ),

    interests: (editMode || hasInterests()) && (
      <section key="interests" className="mt-7 w-full text-left text-[14px] text-[#405053]">
        <h3 className="mb-2 border-b border-white/60 pb-1 text-xs font-semibold tracking-[0.2em] text-[#4a6265]">
          INTEREST
        </h3>
        {editMode ? (
          <div className="space-y-2 no-print">
            {interests.map((interest, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2"
              >
                <input
                  type="text"
                  value={interest || ""}
                  onChange={(e) => handleSimpleArrayChange("interests", index, e.target.value)}
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                  placeholder="Interest name"
                />
                {interests.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem("interests", index)}
                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => handleAddItem("interests", "")}
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
                <li key={idx}>{renderSafeText(interest)}</li>
              ))}
          </ul>
        )}
      </section>
    ),
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          /* Hide elements during PDF generation */
          [data-pdf-hide="true"] {
            display: none !important;
          }
          .no-print {
            display: block;
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
          <Sidebar 
            onEnhance={handleEnhance} 
            resumeRef={resumeRef}
            onDownload={handleDownload}
            onPreview={handlePreview}
            isDownloading={isDownloading}
            isPreviewing={isPreviewing}
          />

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
              ref={resumeRef}
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
                  className="flex w-full max-w-5xl overflow-hidden bg-white shadow-xl"
                  style={{ minHeight: '100vh', alignItems: 'stretch' }}
                  data-resume-template="template-new"
                >
                  {/* Left sidebar - Skills, Languages, Interests */}
                  <aside className="flex w-1/3 flex-col items-center bg-[#c1d5d5] px-8 pb-10 pt-10" style={{ minHeight: '100%', alignSelf: 'stretch' }}>
                    {/* Profile image - only shows when photo exists or in edit mode */}
                    {(hasProfileImage() || editMode) && (
                      <div className="mb-8 relative">
                        <div className="h-40 w-40 overflow-hidden rounded-full border-[6px] border-white shadow-md">
                          {hasProfileImage() ? (
                            <img
                              src={localData.photoUrl}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No photo</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Edit mode upload controls - always visible in edit mode */}
                        {editMode && (
                          <div className="mt-3 space-y-2 no-print">
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                              <span className="mb-1">📷 {hasProfileImage() ? 'Change Photo' : 'Upload Photo'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      handlePersonalInfoChange("photoUrl", reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            {hasProfileImage() && (
                              <button
                                onClick={() => handlePersonalInfoChange("photoUrl", "")}
                                className="w-full rounded bg-red-500 px-3 py-2 text-xs text-white hover:bg-red-600"
                              >
                                Remove Photo
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contact - All 5 links functional */}
                    <section className="mt-5 w-full text-left text-[14px] text-[#405053]">
                      <h3 className="mb-2 border-b border-white/60 pb-1 text-xs font-semibold tracking-[0.2em] text-[#4a6265]">
                        CONTACT
                      </h3>
                      <div className="space-y-2">
                        {editMode ? (
                          <div className="no-print">
                            <div className="flex items-center gap-2 mb-1">
                              <input
                                type="text"
                                value={phone}
                                onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="Phone"
                              />
                              {phone && (
                                <button
                                  onClick={() => handlePersonalInfoChange("phone", "")}
                                  className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                  title="Remove phone"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="Email"
                              />
                              {email && (
                                <button
                                  onClick={() => handlePersonalInfoChange("email", "")}
                                  className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                  title="Remove email"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <input
                                type="text"
                                value={location}
                                onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="Location"
                              />
                              {location && (
                                <button
                                  onClick={() => handlePersonalInfoChange("location", "")}
                                  className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                  title="Remove location"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <input
                                type="text"
                                value={linkedin}
                                onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="LinkedIn"
                              />
                              {linkedin && (
                                <button
                                  onClick={() => handlePersonalInfoChange("linkedin", "")}
                                  className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                  title="Remove LinkedIn"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <input
                                type="text"
                                value={github}
                                onChange={(e) => handlePersonalInfoChange("github", e.target.value)}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="GitHub"
                              />
                              {github && (
                                <button
                                  onClick={() => handlePersonalInfoChange("github", "")}
                                  className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                  title="Remove GitHub"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            {/* Portfolio field */}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={portfolio}
                                onChange={(e) => handlePersonalInfoChange("portfolio", e.target.value)}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-[13px] outline-none"
                                placeholder="Portfolio"
                              />
                              {portfolio && (
                                <button
                                  onClick={() => handlePersonalInfoChange("portfolio", "")}
                                  className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                  title="Remove portfolio"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            {phone && (
                              <p className="flex items-center gap-2">
                                <span className="text-[12px]">📞</span>
                                <a
                                  href={getSafeUrl("phone", phone)}
                                  style={{ color: "inherit", textDecoration: "none" }}
                                >
                                  {renderSafeText(phone)}
                                </a>
                              </p>
                            )}
                            {email && (
                              <p className="flex items-center gap-2 break-all">
                                <span className="text-[12px]">✉️</span>
                                <a
                                  href={getSafeUrl("email", email)}
                                  style={{ color: "inherit", textDecoration: "none" }}
                                >
                                  {renderSafeText(email)}
                                </a>
                              </p>
                            )}
                            {location && (
                              <p className="flex items-center gap-2">
                                <span className="text-[12px]">📍</span>
                                <span>{renderSafeText(location)}</span>
                              </p>
                            )}
                            {linkedin && (
                              <p className="flex items-center gap-2 break-all">
                                <span className="text-[12px]">in</span>
                                <a
                                  href={getSafeUrl("linkedin", linkedin)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "inherit", textDecoration: "none" }}
                                >
                                  LinkedIn
                                </a>
                              </p>
                            )}
                            {github && (
                              <p className="flex items-center gap-2 break-all">
                                <span className="text-[12px]">GitHub</span>
                                <a
                                  href={getSafeUrl("github", github)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "inherit", textDecoration: "none" }}
                                >
                                  GitHub
                                </a>
                              </p>
                            )}
                            {/* Portfolio link display */}
                            {portfolio && (
                              <p className="flex items-center gap-2 break-all">
                                <span className="text-[12px]">🌐</span>
                                <a
                                  href={getSafeUrl("portfolio", portfolio)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "inherit", textDecoration: "none" }}
                                >
                                  Portfolio
                                </a>
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </section>

                    {/* DYNAMIC LEFT SIDEBAR SECTIONS - skills, languages, interests */}
                    {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                      "skills", "languages", "interests"
                    ]).map((sectionKey) => {
                      if (["skills", "languages", "interests"].includes(sectionKey)) {
                        return sectionComponents[sectionKey] || null;
                      }
                      return null;
                    })}
                  </aside>

                  {/* Right content - Main sections */}
                  <main className="w-2/3 bg-white px-10 pb-10 pt-0" style={{ minHeight: '100%' }}>
                    {/* Shaded region above and behind the name header */}
                    <div className="-mx-10 h-20 bg-[#c1d5d5]" />

                    {/* Header name block inside light shaded bar */}
                    <header className="mt-0 mb-6">
                      <div className="-mx-10 bg-[#c1d5d5] px-10 py-6 text-center">
                        {editMode ? (
                          <div className="no-print space-y-2">
                            <input
                              type="text"
                              value={headerName}
                              onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                              className="w-full max-w-md rounded border border-gray-300 bg-white/70 px-3 py-1 text-center text-[26px] font-bold tracking-[0.3em] text-[#48656b] outline-none mx-auto"
                              placeholder="YOUR NAME"
                            />
                            <input
                              type="text"
                              value={role}
                              onChange={(e) => handlePersonalInfoChange("role", e.target.value)}
                              className="w-full max-w-md rounded border border-gray-300 bg-white/70 px-3 py-1 text-center text-[18px] tracking-[0.45em] text-[#6c858b] outline-none mx-auto"
                              placeholder="YOUR POSITION"
                            />
                          </div>
                        ) : (
                          <>
                            <h1 className="text-[34px] font-bold tracking-[0.4em] text-[#48656b]">
                              {renderSafeText(headerName)}
                            </h1>
                            <p className="mt-2 text-[20px] tracking-[0.55em] text-[#6c858b]">
                              {renderSafeText(role)}
                            </p>
                          </>
                        )}
                      </div>
                    </header>

                    {/* DYNAMIC RIGHT CONTENT SECTIONS - summary, experience, education, projects, certifications, achievements */}
                    <div className="relative mt-8 pl-2">
                      {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                        "summary", "experience", "education", "projects", 
                        "certifications", "achievements"
                      ]).map((sectionKey) => {
                        if (["summary", "experience", "education", "projects", 
                             "certifications", "achievements"].includes(sectionKey)) {
                          return sectionComponents[sectionKey] || null;
                        }
                        return null;
                      })}
                    </div>
                  </main>
                </div>
              </div>
            </div>

            {/* Floating Edit/Save Controls */}
            <div
              className="no-print"
              style={{
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
              }}
            >
              {editMode ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSavingToDatabase}
                    style={{
                      backgroundColor: isSavingToDatabase
                        ? "#9ca3af"
                        : "#10b981",
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
                    {isSavingToDatabase ? "Saving..." : "Save Changes"}
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
                </>
              ) : (
                <button
                  type="button"
                  className="no-print"
                  onClick={() => setEditMode(true)}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    padding: "0.6rem 1.4rem",
                    borderRadius: "0.5rem",
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
    </>
  );
};

export default TemplateNew;