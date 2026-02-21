import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
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

const Template18 = () => {
  const resumeRef = useRef(null);
  const resumeContext = useResume();
  const { isAuthenticated } = useAuth();
  
  const { resumeData, updateResumeData, sectionOrder } = resumeContext || { sectionOrder: [] };
  
  const [localData, setLocalData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (resumeData && Object.keys(resumeData).length > 0) {
      setLocalData(JSON.parse(JSON.stringify(resumeData)));
      if (resumeData.photoUrl) {
        setProfileImage(resumeData.photoUrl);
      }
    } else {
      // Default data structure
      const defaultData = {
        name: "Your Name",
        role: "Professional Title",
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
        projects: [],
        certifications: [],
        achievements: [],
        languages: [],
        interests: [],
        photoUrl: null
      };
      setLocalData(defaultData);
    }
  }, [resumeData]);

  const handleFieldChange = (field, value) => {
    if (!localData) return;
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    localStorage.setItem('resumeData', JSON.stringify(updatedData));
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

  // Handle simple array changes (skills, interests, achievements, languages)
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

  const addEducation = () => {
    if (!localData) return;
    handleFieldChange("education", [
      ...(localData.education || []),
      { degree: "", institution: "", duration: "" },
    ]);
    toast.info("Added new education");
  };

  const removeEducation = (index) => {
    if (!localData) return;
    const updated = [...(localData.education || [])];
    updated.splice(index, 1);
    handleFieldChange("education", updated);
    toast.warn("Removed education");
  };

  const addExperience = () => {
    if (!localData) return;
    handleFieldChange("experience", [
      ...(localData.experience || []),
      {
        title: "",
        companyName: "",
        date: "",
        accomplishment: [""],
      },
    ]);
    toast.info("Added new experience");
  };

  const removeExperience = (index) => {
    if (!localData) return;
    const updated = [...(localData.experience || [])];
    updated.splice(index, 1);
    handleFieldChange("experience", updated);
    toast.warn("Removed experience");
  };

  const addProject = () => {
    if (!localData) return;
    handleFieldChange("projects", [
      ...(localData.projects || []),
      { name: "", description: "", technologies: [], link: "" },
    ]);
    toast.info("Added new project");
  };

  const removeProject = (index) => {
    if (!localData) return;
    const updated = [...(localData.projects || [])];
    updated.splice(index, 1);
    handleFieldChange("projects", updated);
    toast.warn("Removed project");
  };

  const addCertification = () => {
    if (!localData) return;
    handleFieldChange("certifications", [
      ...(localData.certifications || []),
      { title: "", issuer: "", date: "" },
    ]);
    toast.info("Added new certification");
  };

  const removeCertification = (index) => {
    if (!localData) return;
    const updated = [...(localData.certifications || [])];
    updated.splice(index, 1);
    handleFieldChange("certifications", updated);
    toast.warn("Removed certification");
  };

  const addAchievement = () => {
    if (!localData) return;
    handleFieldChange("achievements", [
      ...(localData.achievements || []),
      "",
    ]);
    toast.info("Added new achievement");
  };

  const removeAchievement = (index) => {
    if (!localData) return;
    const updated = [...(localData.achievements || [])];
    updated.splice(index, 1);
    handleFieldChange("achievements", updated);
    toast.warn("Removed achievement");
  };

  const addLanguage = () => {
    if (!localData) return;
    handleFieldChange("languages", [
      ...(localData.languages || []),
      "",
    ]);
    toast.info("Added new language");
  };

  const removeLanguage = (index) => {
    if (!localData) return;
    const updated = [...(localData.languages || [])];
    updated.splice(index, 1);
    handleFieldChange("languages", updated);
    toast.warn("Removed language");
  };

  const addInterest = () => {
    if (!localData) return;
    handleFieldChange("interests", [
      ...(localData.interests || []),
      "",
    ]);
    toast.info("Added new interest");
  };

  const removeInterest = (index) => {
    if (!localData) return;
    const updated = [...(localData.interests || [])];
    updated.splice(index, 1);
    handleFieldChange("interests", updated);
    toast.warn("Removed interest");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result);
        handleFieldChange("photoUrl", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!localData) return;
    
    try {
      setIsSaving(true);
      if (typeof updateResumeData === 'function') {
        await updateResumeData(localData);
      } else {
        localStorage.setItem('resumeData', JSON.stringify(localData));
      }
      setEditMode(false);
      toast.success('✅ Changes Saved Successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(resumeData ? JSON.parse(JSON.stringify(resumeData)) : null);
    setEditMode(false);
    toast.info("Changes discarded");
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

    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    
    element.style.height = 'auto';
    element.style.overflow = 'visible';

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
                 element.closest('button') !== null;
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    toast.info('📄 Generating PDF...', { autoClose: false, toastId: 'pdf-toast' });

    try {
      const editControls = document.querySelectorAll('.no-print');
      editControls.forEach(el => el.setAttribute('data-pdf-hide', 'true'));
      
      await html2pdf()
        .set(options)
        .from(element)
        .save();
      
      editControls.forEach(el => el.removeAttribute('data-pdf-hide'));
      
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
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
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

    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    
    element.style.height = 'auto';
    element.style.overflow = 'visible';

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
                 element.closest('button') !== null;
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    toast.info('📄 Generating preview...', { autoClose: false, toastId: 'preview-toast' });

    try {
      const editControls = document.querySelectorAll('.no-print');
      editControls.forEach(el => el.setAttribute('data-pdf-hide', 'true'));
      
      const pdf = await html2pdf()
        .set(options)
        .from(element)
        .toPdf()
        .get('pdf');

      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      editControls.forEach(el => el.removeAttribute('data-pdf-hide'));
      
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
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
      setIsPreviewing(false);
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

  // Check if sections have content
  const hasSummary = () => localData.summary && localData.summary.trim().length > 0;
  const hasSkills = () => localData.skills && localData.skills.some(s => s && s.trim().length > 0);
  const hasEducation = () => localData.education && localData.education.length > 0;
  const hasExperience = () => localData.experience && localData.experience.length > 0;
  const hasProjects = () => localData.projects && localData.projects.length > 0;
  const hasCertifications = () => localData.certifications && localData.certifications.length > 0;
  const hasAchievements = () => localData.achievements && localData.achievements.some(a => a && a.trim().length > 0);
  const hasLanguages = () => localData.languages && localData.languages.some(l => l && l.trim().length > 0);
  const hasInterests = () => localData.interests && localData.interests.some(i => i && i.trim().length > 0);
  const hasContact = () => localData.location?.trim() || localData.phone?.trim() || localData.email?.trim() || 
                          localData.linkedin?.trim() || localData.github?.trim() || localData.portfolio?.trim();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resumeRef={resumeRef} onDownload={handleDownload} onPreview={handlePreview} />

        <div style={{ flex: 1, padding: "2rem", display: "flex", justifyContent: "center" }}>
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              width: "100%",
              maxWidth: "850px",
              borderRadius: "0.5rem",
              fontFamily: "Arial, sans-serif",
              border: "1px solid #d1d5db",
            }}
            data-resume-template="template18"
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                {editMode ? (
                  <>
                    <input
                      value={localData.name || ""}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      style={{ fontSize: "1.5rem", fontWeight: "bold", width: "100%", border: "1px solid #d1d5db", padding: "4px" }}
                      placeholder="Your Name"
                      className="no-print"
                    />
                    <input
                      value={localData.role || ""}
                      onChange={(e) => handleFieldChange("role", e.target.value)}
                      style={{ fontSize: "1rem", color: "#555", width: "100%", border: "1px solid #d1d5db", padding: "4px", marginTop: "4px" }}
                      placeholder="Your Role"
                      className="no-print"
                    />
                  </>
                ) : (
                  <>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>{renderSafeText(localData.name) || "Your Name"}</h1>
                    <h2 style={{ fontSize: "1rem", color: "#555", margin: "4px 0 0 0" }}>{renderSafeText(localData.role) || "Professional Title"}</h2>
                  </>
                )}
              </div>
              <div>
                {editMode ? (
                  <label style={{ cursor: "pointer", display: "block", textAlign: "center" }} className="no-print">
                    <img
                      src={profileImage || localData.photoUrl || "https://via.placeholder.com/120"}
                      alt="Profile"
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "10px",
                        objectFit: "cover",
                      }}
                    />
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    <p style={{ fontSize: "0.75rem", color: "#2563eb", margin: "4px 0 0 0" }}>Click to change</p>
                  </label>
                ) : (
                  localData.photoUrl && (
                    <img
                      src={localData.photoUrl}
                      alt="Profile"
                      style={{ width: "120px", height: "120px", borderRadius: "10px", objectFit: "cover" }}
                    />
                  )
                )}
              </div>
            </div>

            <hr style={{ margin: "1rem 0", borderColor: "#ccc" }} />

            {/* CONTACT - Now placed above Summary */}
            {(editMode || hasContact()) && (
              <section>
                <h3 style={{ fontWeight: "700", fontSize: "20px", margin: "0 0 8px 0" }}>Contact</h3>
                <div>
                  {editMode ? (
                    <>
                      <input
                        value={localData.location || ""}
                        onChange={(e) => handleFieldChange("location", e.target.value)}
                        placeholder="Location"
                        style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                        className="no-print"
                      />
                      <input
                        value={localData.phone || ""}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        placeholder="Phone"
                        style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                        className="no-print"
                      />
                      <input
                        value={localData.email || ""}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        placeholder="Email"
                        style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                        className="no-print"
                      />
                      <input
                        value={localData.linkedin || ""}
                        onChange={(e) => handleFieldChange("linkedin", e.target.value)}
                        placeholder="LinkedIn"
                        style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                        className="no-print"
                      />
                      <input
                        value={localData.github || ""}
                        onChange={(e) => handleFieldChange("github", e.target.value)}
                        placeholder="GitHub"
                        style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                        className="no-print"
                      />
                      <input
                        value={localData.portfolio || ""}
                        onChange={(e) => handleFieldChange("portfolio", e.target.value)}
                        placeholder="Portfolio"
                        style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                        className="no-print"
                      />
                    </>
                  ) : (
                    <>
                      {localData.location && <p style={{ margin: "4px 0" }}>📍 {renderSafeText(localData.location)}</p>}
                      {localData.phone && (
                        <p style={{ margin: "4px 0" }}>
                          📞 <a href={getSafeUrl("phone", localData.phone)} style={{ color: "#2563eb", textDecoration: "none" }}>{renderSafeText(localData.phone)}</a>
                        </p>
                      )}
                      {localData.email && (
                        <p style={{ margin: "4px 0" }}>
                          ✉️ <a href={getSafeUrl("email", localData.email)} style={{ color: "#2563eb", textDecoration: "none" }}>{renderSafeText(localData.email)}</a>
                        </p>
                      )}
                      {localData.linkedin && (
                        <p style={{ margin: "4px 0" }}>
                          🔗 <a href={getSafeUrl("linkedin", localData.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>LinkedIn</a>
                        </p>
                      )}
                      {localData.github && (
                        <p style={{ margin: "4px 0" }}>
                          🐙 <a href={getSafeUrl("github", localData.github)} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>GitHub</a>
                        </p>
                      )}
                      {localData.portfolio && (
                        <p style={{ margin: "4px 0" }}>
                          🌐 <a href={getSafeUrl("portfolio", localData.portfolio)} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>Portfolio</a>
                        </p>
                      )}
                    </>
                  )}
                </div>
              </section>
            )}

            {(editMode || hasContact()) && <hr style={{ margin: "1rem 0", borderColor: "#ccc" }} />}

            {/* SUMMARY - Now placed below Contact */}
            {(editMode || hasSummary()) && (
              <section>
                <h3 style={{ color: "red", fontWeight: "700", fontSize: "20px", margin: "0 0 8px 0" }}>Summary</h3>
                {editMode ? (
                  <textarea
                    value={localData.summary || ""}
                    onChange={(e) => handleFieldChange("summary", e.target.value)}
                    rows={4}
                    style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                    placeholder="Write a professional summary..."
                    className="no-print"
                  />
                ) : (
                  <p style={{ margin: 0 }}>{renderSafeText(localData.summary)}</p>
                )}
              </section>
            )}

            {(editMode || hasSummary()) && <hr style={{ margin: "1rem 0", borderColor: "#ccc" }} />}

            {/* SKILLS */}
            {(editMode || hasSkills()) && (
              <section>
                <h3 style={{ color: "red", fontWeight: "700", fontSize: "20px", margin: "0 0 8px 0" }}>Skills</h3>
                {editMode ? (
                  <>
                    <textarea
                      value={(localData.skills || []).join(", ")}
                      onChange={(e) =>
                        handleFieldChange(
                          "skills",
                          e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        )
                      }
                      style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      placeholder="Enter skills separated by commas"
                      className="no-print"
                      rows={3}
                    />
                    <p style={{ fontSize: "0.75rem", color: "#666", margin: "4px 0 0 0" }}>Separate skills with commas</p>
                  </>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    {localData.skills?.map((skill, i) => (
                      <li key={i}>{renderSafeText(skill)}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {(editMode || hasSkills()) && <hr style={{ margin: "1rem 0", borderColor: "#ccc" }} />}

            {/* EDUCATION */}
            {(editMode || hasEducation()) && (
              <section>
                <h3 style={{ fontWeight: "700", fontSize: "20px", margin: "0 0 8px 0" }}>Education</h3>
                {(localData.education || []).map((edu, i) => (
                  <div key={i} style={{ marginBottom: "16px", position: "relative" }}>
                    {editMode ? (
                      <div style={{ border: "1px dashed #d1d5db", padding: "12px", borderRadius: "4px" }} className="no-print">
                        <input
                          value={edu.degree || ""}
                          onChange={(e) => handleArrayUpdate("education", i, "degree", e.target.value)}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Degree"
                        />
                        <input
                          value={edu.institution || ""}
                          onChange={(e) => handleArrayUpdate("education", i, "institution", e.target.value)}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Institution"
                        />
                        <input
                          value={edu.duration || ""}
                          onChange={(e) => handleArrayUpdate("education", i, "duration", e.target.value)}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Duration (e.g., 2020-2024)"
                        />
                        <button onClick={() => removeEducation(i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>
                          Remove Education
                        </button>
                      </div>
                    ) : (
                      <>
                        <p style={{ margin: "4px 0", fontWeight: "bold" }}>{renderSafeText(edu.degree)}</p>
                        <p style={{ margin: "4px 0" }}>{renderSafeText(edu.institution)} ({renderSafeText(edu.duration)})</p>
                      </>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button onClick={addEducation} style={{ color: "#2563eb", border: "none", background: "none", cursor: "pointer", fontSize: "14px" }} className="no-print">
                    + Add Education
                  </button>
                )}
              </section>
            )}

            {(editMode || hasEducation()) && <hr style={{ margin: "1rem 0", borderColor: "#ccc" }} />}

            {/* EXPERIENCE */}
            {(editMode || hasExperience()) && (
              <section>
                <h3 style={{ color: "red", fontWeight: "700", fontSize: "20px", margin: "0 0 8px 0" }}>Experience</h3>
                {(localData.experience || []).map((exp, i) => (
                  <div key={i} style={{ marginBottom: "24px", position: "relative" }}>
                    {editMode ? (
                      <div style={{ border: "1px dashed #d1d5db", padding: "12px", borderRadius: "4px" }} className="no-print">
                        <input
                          value={exp.title || ""}
                          onChange={(e) => handleArrayUpdate("experience", i, "title", e.target.value)}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Job Title"
                        />
                        <input
                          value={exp.companyName || ""}
                          onChange={(e) => handleArrayUpdate("experience", i, "companyName", e.target.value)}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Company Name"
                        />
                        <input
                          value={exp.date || ""}
                          onChange={(e) => handleArrayUpdate("experience", i, "date", e.target.value)}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Date (e.g., 2022-Present)"
                        />
                        <textarea
                          value={(exp.accomplishment || []).join("\n")}
                          onChange={(e) => {
                            const updated = [...(localData.experience || [])];
                            updated[i].accomplishment = e.target.value.split("\n").filter(Boolean);
                            handleFieldChange("experience", updated);
                          }}
                          rows={3}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Accomplishments (one per line)"
                        />
                        <button onClick={() => removeExperience(i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>
                          Remove Experience
                        </button>
                      </div>
                    ) : (
                      <>
                        <p style={{ margin: "4px 0", fontWeight: "bold" }}>{renderSafeText(exp.title)} at {renderSafeText(exp.companyName)}</p>
                        <p style={{ margin: "4px 0", color: "#666" }}>{renderSafeText(exp.date)}</p>
                        <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                          {(exp.accomplishment || []).map((item, j) => (
                            <li key={j}>{renderSafeText(item)}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button onClick={addExperience} style={{ color: "#2563eb", border: "none", background: "none", cursor: "pointer", fontSize: "14px" }} className="no-print">
                    + Add Experience
                  </button>
                )}
              </section>
            )}

            {(editMode || hasExperience()) && <hr style={{ margin: "1rem 0", borderColor: "#ccc" }} />}

            {/* PROJECTS */}
            {(editMode || hasProjects()) && (
              <section>
                <h3 style={{ fontWeight: "700", fontSize: "20px", margin: "0 0 8px 0" }}>Projects</h3>
                {(localData.projects || []).map((project, i) => (
                  <div key={i} style={{ marginBottom: "20px", position: "relative" }}>
                    {editMode ? (
                      <div style={{ border: "1px dashed #d1d5db", padding: "12px", borderRadius: "4px" }} className="no-print">
                        <input
                          value={project.name || ""}
                          onChange={(e) => handleArrayUpdate("projects", i, "name", e.target.value)}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Project Name"
                        />
                        <textarea
                          value={project.description || ""}
                          onChange={(e) => handleArrayUpdate("projects", i, "description", e.target.value)}
                          rows={2}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Project Description"
                        />
                        <input
                          value={Array.isArray(project.technologies) ? project.technologies.join(", ") : project.technologies || ""}
                          onChange={(e) => handleArrayUpdate("projects", i, "technologies", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Technologies (comma separated)"
                        />
                        <input
                          value={project.link || ""}
                          onChange={(e) => handleArrayUpdate("projects", i, "link", e.target.value)}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Project Link (optional)"
                        />
                        <button onClick={() => removeProject(i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>
                          Remove Project
                        </button>
                      </div>
                    ) : (
                      <>
                        <p style={{ margin: "4px 0", fontWeight: "bold" }}>{renderSafeText(project.name)}</p>
                        <p style={{ margin: "4px 0" }}>{renderSafeText(project.description)}</p>
                        {project.technologies && project.technologies.length > 0 && (
                          <p style={{ margin: "4px 0", fontSize: "0.9rem", color: "#666" }}>
                            <strong>Tech:</strong> {Array.isArray(project.technologies) ? project.technologies.map(t => renderSafeText(t)).join(", ") : renderSafeText(project.technologies)}
                          </p>
                        )}
                        {project.link && (
                          <p style={{ margin: "4px 0" }}>
                            <a href={getSafeUrl("portfolio", project.link)} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>
                              View Project ↗
                            </a>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button onClick={addProject} style={{ color: "#2563eb", border: "none", background: "none", cursor: "pointer", fontSize: "14px" }} className="no-print">
                    + Add Project
                  </button>
                )}
              </section>
            )}

            {(editMode || hasProjects()) && <hr style={{ margin: "1rem 0", borderColor: "#ccc" }} />}

            {/* CERTIFICATIONS */}
            {(editMode || hasCertifications()) && (
              <section>
                <h3 style={{ fontWeight: "700", fontSize: "20px", margin: "0 0 8px 0" }}>Certifications</h3>
                {(localData.certifications || []).map((cert, i) => (
                  <div key={i} style={{ marginBottom: "12px", position: "relative" }}>
                    {editMode ? (
                      <div style={{ border: "1px dashed #d1d5db", padding: "12px", borderRadius: "4px" }} className="no-print">
                        <input
                          value={cert.title || ""}
                          onChange={(e) => handleArrayUpdate("certifications", i, "title", e.target.value)}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Certification Title"
                        />
                        <input
                          value={cert.issuer || ""}
                          onChange={(e) => handleArrayUpdate("certifications", i, "issuer", e.target.value)}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Issuer"
                        />
                        <input
                          value={cert.date || ""}
                          onChange={(e) => handleArrayUpdate("certifications", i, "date", e.target.value)}
                          style={{ width: "100%", marginBottom: "8px", border: "1px solid #d1d5db", padding: "4px" }}
                          placeholder="Date"
                        />
                        <button onClick={() => removeCertification(i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>
                          Remove Certification
                        </button>
                      </div>
                    ) : (
                      <p style={{ margin: "4px 0" }}>
                        • <strong>{renderSafeText(cert.title)}</strong> — {renderSafeText(cert.issuer)} ({renderSafeText(cert.date)})
                      </p>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button onClick={addCertification} style={{ color: "#2563eb", border: "none", background: "none", cursor: "pointer", fontSize: "14px" }} className="no-print">
                    + Add Certification
                  </button>
                )}
              </section>
            )}

            {(editMode || hasCertifications()) && <hr style={{ margin: "1rem 0", borderColor: "#ccc" }} />}

            {/* ACHIEVEMENTS */}
            {(editMode || hasAchievements()) && (
              <section>
                <h3 style={{ fontWeight: "700", fontSize: "20px", margin: "0 0 8px 0" }}>Achievements</h3>
                {editMode ? (
                  <>
                    {(localData.achievements || []).map((ach, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }} className="no-print">
                        <input
                          value={ach || ""}
                          onChange={(e) => handleSimpleArrayChange("achievements", i, e.target.value)}
                          style={{ flex: 1, border: "1px solid #d1d5db", padding: "4px", marginRight: "8px" }}
                          placeholder="Achievement"
                        />
                        <button onClick={() => removeAchievement(i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>×</button>
                      </div>
                    ))}
                    <button onClick={addAchievement} style={{ color: "#2563eb", border: "none", background: "none", cursor: "pointer", fontSize: "14px", marginTop: "4px" }} className="no-print">
                      + Add Achievement
                    </button>
                  </>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    {(localData.achievements || []).map((ach, i) => (
                      <li key={i}>{renderSafeText(ach)}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {(editMode || hasAchievements()) && <hr style={{ margin: "1rem 0", borderColor: "#ccc" }} />}

            {/* LANGUAGES */}
            {(editMode || hasLanguages()) && (
              <section>
                <h3 style={{ fontWeight: "700", fontSize: "20px", margin: "0 0 8px 0" }}>Languages</h3>
                {editMode ? (
                  <>
                    {(localData.languages || []).map((lang, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }} className="no-print">
                        <input
                          value={lang || ""}
                          onChange={(e) => handleSimpleArrayChange("languages", i, e.target.value)}
                          style={{ flex: 1, border: "1px solid #d1d5db", padding: "4px", marginRight: "8px" }}
                          placeholder="Language"
                        />
                        <button onClick={() => removeLanguage(i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>×</button>
                      </div>
                    ))}
                    <button onClick={addLanguage} style={{ color: "#2563eb", border: "none", background: "none", cursor: "pointer", fontSize: "14px", marginTop: "4px" }} className="no-print">
                      + Add Language
                    </button>
                  </>
                ) : (
                  <p style={{ margin: 0 }}>{(localData.languages || []).map(l => renderSafeText(l)).join(" • ")}</p>
                )}
              </section>
            )}

            {(editMode || hasLanguages()) && <hr style={{ margin: "1rem 0", borderColor: "#ccc" }} />}

            {/* INTERESTS */}
            {(editMode || hasInterests()) && (
              <section>
                <h3 style={{ fontWeight: "700", fontSize: "20px", margin: "0 0 8px 0" }}>Interests</h3>
                {editMode ? (
                  <>
                    {(localData.interests || []).map((interest, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }} className="no-print">
                        <input
                          value={interest || ""}
                          onChange={(e) => handleSimpleArrayChange("interests", i, e.target.value)}
                          style={{ flex: 1, border: "1px solid #d1d5db", padding: "4px", marginRight: "8px" }}
                          placeholder="Interest"
                        />
                        <button onClick={() => removeInterest(i)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>×</button>
                      </div>
                    ))}
                    <button onClick={addInterest} style={{ color: "#2563eb", border: "none", background: "none", cursor: "pointer", fontSize: "14px", marginTop: "4px" }} className="no-print">
                      + Add Interest
                    </button>
                  </>
                ) : (
                  <p style={{ margin: 0 }}>{(localData.interests || []).map(i => renderSafeText(i)).join(" • ")}</p>
                )}
              </section>
            )}

            {/* Floating Edit/Save Controls */}
            <div className="no-print" style={{ 
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
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      backgroundColor: isSaving ? "#9ca3af" : "#10b981",
                      color: "#fff",
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
                      color: "#fff",
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
                    color: "#fff",
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

export default Template18;