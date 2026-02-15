import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaSpinner } from "react-icons/fa";

const SectionInputModal = ({ section, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Reset form when section changes
  useEffect(() => {
    setFormData({});
    setErrors({});
    setCharCount(0);
  }, [section]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    
    // Update character count for textareas
    if (field === 'description' || field === 'summary') {
      setCharCount(value.length);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    switch (section) {
      case "summary":
        if (!formData.summary?.trim()) {
          newErrors.summary = "Summary is required";
        } else if (formData.summary.length > 500) {
          newErrors.summary = "Summary must be less than 500 characters";
        }
        break;

      case "experience":
        if (!formData.title?.trim()) newErrors.title = "Job title is required";
        if (!formData.company?.trim()) newErrors.company = "Company name is required";
        if (!formData.duration?.trim()) newErrors.duration = "Duration is required";
        break;

      case "education":
        if (!formData.degree?.trim()) newErrors.degree = "Degree is required";
        if (!formData.institution?.trim()) newErrors.institution = "Institution is required";
        if (!formData.year?.trim()) newErrors.year = "Year is required";
        else if (!/^\d{4}(\s*-\s*\d{4}|(\s*-\s*Present)?)$/.test(formData.year)) {
          newErrors.year = "Use format: 2020-2024 or 2024-Present";
        }
        break;

      case "projects":
        if (!formData.name?.trim()) newErrors.name = "Project name is required";
        if (!formData.description?.trim()) newErrors.description = "Description is required";
        break;

      case "languages":
        if (!formData.language?.trim()) newErrors.language = "Language name is required";
        if (formData.proficiency && (formData.proficiency < 1 || formData.proficiency > 6)) {
          newErrors.proficiency = "Proficiency must be between 1-6";
        }
        break;

      case "certifications":
        if (!formData.name?.trim()) newErrors.name = "Certification name is required";
        if (!formData.organization?.trim()) newErrors.organization = "Organization is required";
        if (!formData.year?.trim()) newErrors.year = "Year is required";
        else if (!/^\d{4}$/.test(formData.year)) {
          newErrors.year = "Enter valid year (e.g., 2024)";
        }
        break;

      case "skills":
      case "interests":
      case "achievements":
        if (!formData.value?.trim() && !formData?.trim()) {
          newErrors.value = `${section.slice(0, -1)} name is required`;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocalSave = async () => {
    if (!validateForm()) {
      // Show first error in toast or focus first error field
      const firstError = Object.values(errors)[0];
      if (firstError) {
        // You could add a toast here if needed
        console.warn("Validation error:", firstError);
      }
      return;
    }

    setIsSaving(true);

    // Simulate async save (remove if not needed)
    await new Promise(resolve => setTimeout(resolve, 300));

    let finalData = formData;

    // Normalization based on section type
    switch (section) {
      case "certifications":
        finalData = {
          title: formData.name?.trim() || "Certification",
          description: formData.organization?.trim() || "",
          year: formData.year?.trim() || "",
          issuer: formData.organization?.trim() || "",
          name: formData.name?.trim() || "",
          organization: formData.organization?.trim() || ""
        };
        break;

      case "experience":
        finalData = {
          title: formData.title?.trim() || "",
          company: formData.company?.trim() || "",
          duration: formData.duration?.trim() || "",
          description: formData.description?.trim() || "",
          achievements: formData.description?.trim() ? [formData.description.trim()] : [],
          location: formData.location || "",
          current: formData.duration?.toLowerCase().includes('present') || false
        };
        break;

      case "education":
        finalData = {
          degree: formData.degree?.trim() || "",
          institution: formData.institution?.trim() || "",
          year: formData.year?.trim() || "",
          gpa: formData.gpa || "",
          location: formData.location || ""
        };
        break;

      case "projects":
        finalData = {
          name: formData.name?.trim() || "",
          description: formData.description?.trim() || "",
          technologies: formData.technologies?.split(',').map(tech => tech.trim()) || [],
          link: formData.link || "",
          startDate: formData.startDate || "",
          endDate: formData.endDate || ""
        };
        break;

      case "languages":
        finalData = {
          language: formData.language?.trim() || "Language",
          proficiency: formData.proficiency || 4,
          level: getProficiencyLevel(formData.proficiency || 4)
        };
        break;

      case "skills":
        finalData = typeof formData === 'string' ? formData.trim() : formData.value?.trim() || "";
        break;

      case "interests":
        finalData = typeof formData === 'string' ? formData.trim() : formData.value?.trim() || "";
        break;

      case "achievements":
        finalData = typeof formData === 'string' ? formData.trim() : formData.value?.trim() || "";
        break;

      case "summary":
        finalData = formData.summary?.trim() || "";
        break;

      default:
        finalData = formData;
    }

    // Ensure we never pass null or undefined
    if (finalData === null || finalData === undefined) {
      finalData = "";
    }

    onSave(section, finalData);
    setIsSaving(false);
    onClose();
  };

  const getProficiencyLevel = (value) => {
    const levels = ["Elementary", "Limited Working", "Professional Working", "Full Professional", "Native/Bilingual"];
    return levels[Math.min(4, Math.max(0, value - 1))] || "Professional";
  };

  const getProficiencyLabel = (value) => {
    const labels = ["Beginner", "Elementary", "Intermediate", "Advanced", "Fluent", "Native"];
    return labels[value - 1] || "Intermediate";
  };

  const renderFields = () => {
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
    const errorClass = "border-red-300 bg-red-50 focus:ring-red-500";
    const labelClass = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block";

    switch (section) {
      case "summary":
        return (
          <div className="space-y-2">
            <label className={labelClass}>Professional Summary <span className="text-red-400">*</span></label>
            <textarea
              className={`${inputClass} h-32 resize-none`}
              placeholder="Write a compelling professional summary highlighting your key strengths and career goals..."
              value={formData.summary || ""}
              onChange={(e) => {
                handleChange("summary", e.target.value);
                setCharCount(e.target.value.length);
              }}
              maxLength={500}
            />
            <div className="flex justify-between text-xs">
              <span className={`${charCount > 450 ? 'text-orange-500' : 'text-gray-400'}`}>
                {charCount}/500 characters
              </span>
              {errors.summary && <span className="text-red-500">{errors.summary}</span>}
            </div>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Job Title <span className="text-red-400">*</span></label>
              <input
                className={`${inputClass} ${errors.title ? errorClass : ''}`}
                placeholder="e.g., Senior Software Engineer"
                value={formData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className={labelClass}>Company <span className="text-red-400">*</span></label>
              <input
                className={`${inputClass} ${errors.company ? errorClass : ''}`}
                placeholder="e.g., Google, Microsoft"
                value={formData.company || ""}
                onChange={(e) => handleChange("company", e.target.value)}
              />
              {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company}</p>}
            </div>
            <div>
              <label className={labelClass}>Duration <span className="text-red-400">*</span></label>
              <input
                className={`${inputClass} ${errors.duration ? errorClass : ''}`}
                placeholder="e.g., Jan 2022 - Present"
                value={formData.duration || ""}
                onChange={(e) => handleChange("duration", e.target.value)}
              />
              {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
            </div>
            <div>
              <label className={labelClass}>Location (Optional)</label>
              <input
                className={inputClass}
                placeholder="e.g., San Francisco, CA"
                value={formData.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} h-24 resize-none`}
                placeholder="Describe your responsibilities and achievements..."
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>
        );

      case "education":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Degree/Course <span className="text-red-400">*</span></label>
              <input
                className={`${inputClass} ${errors.degree ? errorClass : ''}`}
                placeholder="e.g., B.Tech Computer Science"
                value={formData.degree || ""}
                onChange={(e) => handleChange("degree", e.target.value)}
              />
              {errors.degree && <p className="text-xs text-red-500 mt-1">{errors.degree}</p>}
            </div>
            <div>
              <label className={labelClass}>Institution <span className="text-red-400">*</span></label>
              <input
                className={`${inputClass} ${errors.institution ? errorClass : ''}`}
                placeholder="e.g., Stanford University"
                value={formData.institution || ""}
                onChange={(e) => handleChange("institution", e.target.value)}
              />
              {errors.institution && <p className="text-xs text-red-500 mt-1">{errors.institution}</p>}
            </div>
            <div>
              <label className={labelClass}>Year/Graduation Date <span className="text-red-400">*</span></label>
              <input
                className={`${inputClass} ${errors.year ? errorClass : ''}`}
                placeholder="e.g., 2024"
                value={formData.year || ""}
                onChange={(e) => handleChange("year", e.target.value)}
              />
              {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
            </div>
            <div>
              <label className={labelClass}>GPA (Optional)</label>
              <input
                className={inputClass}
                placeholder="e.g., 3.8/4.0"
                value={formData.gpa || ""}
                onChange={(e) => handleChange("gpa", e.target.value)}
              />
            </div>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Project Name <span className="text-red-400">*</span></label>
              <input
                className={`${inputClass} ${errors.name ? errorClass : ''}`}
                placeholder="e.g., AI Resume Builder"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className={labelClass}>Technologies (comma-separated)</label>
              <input
                className={inputClass}
                placeholder="e.g., React, Node.js, MongoDB"
                value={formData.technologies || ""}
                onChange={(e) => handleChange("technologies", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Project Link (Optional)</label>
              <input
                className={inputClass}
                placeholder="e.g., https://github.com/..."
                value={formData.link || ""}
                onChange={(e) => handleChange("link", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Description <span className="text-red-400">*</span></label>
              <textarea
                className={`${inputClass} h-24 resize-none ${errors.description ? errorClass : ''}`}
                placeholder="Describe your project and your role..."
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>
          </div>
        );

      case "languages":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Language <span className="text-red-400">*</span></label>
              <input
                className={`${inputClass} ${errors.language ? errorClass : ''}`}
                placeholder="e.g., English, Spanish"
                value={formData.language || ""}
                onChange={(e) => handleChange("language", e.target.value)}
              />
              {errors.language && <p className="text-xs text-red-500 mt-1">{errors.language}</p>}
            </div>
            <div>
              <label className={labelClass}>Proficiency Level</label>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-indigo-600 min-w-[80px]">
                  {getProficiencyLabel(formData.proficiency || 4)}
                </span>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={formData.proficiency || 4}
                  className="flex-1 accent-indigo-600"
                  onChange={(e) => handleChange("proficiency", parseInt(e.target.value))}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                <span>Beginner</span>
                <span>Native</span>
              </div>
            </div>
          </div>
        );

      case "certifications":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Certification Name <span className="text-red-400">*</span></label>
              <input
                className={`${inputClass} ${errors.name ? errorClass : ''}`}
                placeholder="e.g., AWS Certified Developer"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className={labelClass}>Issuing Organization <span className="text-red-400">*</span></label>
              <input
                className={`${inputClass} ${errors.organization ? errorClass : ''}`}
                placeholder="e.g., Amazon Web Services"
                value={formData.organization || ""}
                onChange={(e) => handleChange("organization", e.target.value)}
              />
              {errors.organization && <p className="text-xs text-red-500 mt-1">{errors.organization}</p>}
            </div>
            <div>
              <label className={labelClass}>Year <span className="text-red-400">*</span></label>
              <input
                className={`${inputClass} ${errors.year ? errorClass : ''}`}
                placeholder="e.g., 2024"
                value={formData.year || ""}
                onChange={(e) => handleChange("year", e.target.value)}
              />
              {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
            </div>
            <div>
              <label className={labelClass}>Credential ID (Optional)</label>
              <input
                className={inputClass}
                placeholder="e.g., ABC123XYZ"
                value={formData.credentialId || ""}
                onChange={(e) => handleChange("credentialId", e.target.value)}
              />
            </div>
          </div>
        );

      case "skills":
      case "interests":
      case "achievements":
        const label = section === "skills" ? "Skill" : 
                     section === "interests" ? "Interest" : "Achievement";
        return (
          <div className="space-y-2">
            <label className={labelClass}>{label} Name <span className="text-red-400">*</span></label>
            <input
              className={`${inputClass} ${errors.value ? errorClass : ''}`}
              placeholder={`Enter ${label.toLowerCase()} name...`}
              value={formData.value || formData || ""}
              onChange={(e) => {
                if (typeof formData === 'string') {
                  setFormData(e.target.value);
                } else {
                  handleChange("value", e.target.value);
                }
              }}
            />
            {section === "skills" && (
              <p className="text-xs text-gray-400 mt-1">
                You can add multiple skills later from the main editor
              </p>
            )}
            {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value}</p>}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700">
              ⚠️ Enter details for {section} section
            </p>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shadow-lg">
          <h3 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
            <span className="bg-white/20 px-2 py-1 rounded-lg text-xs">
              NEW
            </span>
            Add {section?.charAt(0).toUpperCase() + section?.slice(1) || "Section"}
          </h3>
          <button 
            onClick={onClose} 
            className="hover:rotate-90 hover:bg-white/20 p-1 rounded-full transition-all duration-200"
            disabled={isSaving}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6 bg-gray-50/50 max-h-[70vh] overflow-y-auto">
          {renderFields()}
          
          <div className="mt-8 flex gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 py-3 text-gray-600 font-bold border-2 border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 transition-all"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              onClick={handleLocalSave} 
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionInputModal;