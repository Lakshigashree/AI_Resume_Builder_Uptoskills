import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import resumeService from "../../services/resumeService";
import { toast } from "react-toastify";
import { Download, Upload, Share, Settings, Edit, Plus, Save, Trash2, Bot, ArrowUp, ArrowDown, Mail } from "lucide-react";

const Template10 = () => {
  const resumeRef = useRef(null);
  const { resumeData, setResumeData, updateResumeData } = useResume();
  const { isAuthenticated } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(() => {
    // Initialize with default structure
    return {
      name: "",
      role: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      achievements: [],
      skills: [],
      languages: [],
      interests: []
    };
  });
  const [sections, setSections] = useState(["header", "summary", "experience", "achievements", "projects", "education", "skills"]);
  const [isRearrangeMode, setIsRearrangeMode] = useState(false);
  const [editingSections, setEditingSections] = useState({});
  const [editingHeader, setEditingHeader] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const saveTimeoutRef = useRef(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Comprehensive data normalization function
  const sanitizeResumeData = (data) => {
    if (!data || typeof data !== 'object') {
      return {
        name: "",
        role: "",
        email: "",
        phone: "",
        location: "",
        summary: "",
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        achievements: [],
        skills: [],
        languages: [],
        interests: []
      };
    }

    const isPlaceholderString = (s) => {
      if (typeof s !== 'string') return false;
      const trimmed = s.trim();
      if (trimmed.length === 0) return true;
      if (/^[\-–—\s]+$/.test(trimmed)) return true;
      if (/^\s*(?:your|add|example|placeholder|new|company|institution|position|location|degree|title|issuer|start\s*-\s*end)\b/i.test(trimmed)) return true;
      return false;
    };

    const isValueFilled = (val) => {
      if (val == null) return false;
      if (typeof val === 'string') return !isPlaceholderString(val) && val.trim().length > 0;
      if (Array.isArray(val)) return val.some(v => isValueFilled(v));
      if (typeof val === 'object') return Object.values(val).some(v => isValueFilled(v));
      return Boolean(val);
    };

    // Normalize experience - ensure accomplishment is always an array
    const normalizeExperience = (experience) => {
      if (!Array.isArray(experience)) return [];
      return experience.map(exp => {
        if (typeof exp !== 'object' || exp === null) return null;

        // Ensure accomplishment is always an array
        let accomplishment = [];
        if (Array.isArray(exp.accomplishment)) {
          accomplishment = exp.accomplishment;
        } else if (exp.accomplishment) {
          if (typeof exp.accomplishment === 'string') {
            accomplishment = exp.accomplishment.split('\n').filter(a => a.trim());
          } else {
            accomplishment = [String(exp.accomplishment)];
          }
        } else if (exp.responsibilities) {
          if (Array.isArray(exp.responsibilities)) {
            accomplishment = exp.responsibilities;
          } else if (typeof exp.responsibilities === 'string') {
            accomplishment = exp.responsibilities.split('\n').filter(a => a.trim());
          } else {
            accomplishment = [String(exp.responsibilities)];
          }
        }

        return {
          id: exp.id || Date.now() + Math.random(),
          title: exp.title || exp.jobTitle || "",
          companyName: exp.companyName || exp.company || "",
          date: exp.date || (exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : (exp.startDate || exp.endDate || "")),
          companyLocation: exp.companyLocation || exp.location || "",
          accomplishment: accomplishment
        };
      }).filter(exp => exp !== null && isValueFilled(exp));
    };

    // Normalize education
    const normalizeEducation = (education) => {
      if (!Array.isArray(education)) return [];
      return education.map(edu => {
        if (typeof edu !== 'object' || edu === null) return null;
        return {
          id: edu.id || Date.now() + Math.random(),
          degree: edu.degree || "",
          institution: edu.institution || "",
          duration: edu.duration || edu.year || "",
          location: edu.location || ""
        };
      }).filter(edu => edu !== null && isValueFilled(edu));
    };

    // Normalize projects - ensure technologies is always an array
    const normalizeProjects = (projects) => {
      if (!Array.isArray(projects)) return [];
      return projects.map(proj => {
        if (typeof proj !== 'object' || proj === null) return null;

        let technologies = [];
        if (Array.isArray(proj.technologies)) {
          technologies = proj.technologies;
        } else if (proj.technologies) {
          if (typeof proj.technologies === 'string') {
            technologies = proj.technologies.split(',').map(t => t.trim()).filter(Boolean);
          } else {
            technologies = [String(proj.technologies)];
          }
        }

        return {
          id: proj.id || Date.now() + Math.random(),
          name: proj.name || "",
          description: proj.description || "",
          technologies: technologies,
          link: proj.link || "",
          github: proj.github || ""
        };
      }).filter(proj => proj !== null && isValueFilled(proj));
    };

    // Normalize certifications
    const normalizeCertifications = (certifications) => {
      if (!Array.isArray(certifications)) return [];
      return certifications.map(cert => {
        if (typeof cert !== 'object' || cert === null) return null;
        return {
          id: cert.id || Date.now() + Math.random(),
          title: cert.title || "",
          issuer: cert.issuer || "",
          date: cert.date || ""
        };
      }).filter(cert => cert !== null && isValueFilled(cert));
    };

    // Normalize achievements to ensure they are always strings
    const normalizeAchievements = (achievements) => {
      if (!Array.isArray(achievements)) return [];
      return achievements.map(achievement => {
        if (typeof achievement === 'string') {
          return achievement.trim();
        }
        if (typeof achievement === 'object' && achievement !== null) {
          return achievement.title || achievement.description || achievement.name || "";
        }
        return String(achievement || "");
      }).filter(achievement => achievement && achievement.trim().length > 0);
    };

    // Normalize skills/languages/interests to always be arrays
    const normalizeArrayField = (field) => {
      if (Array.isArray(field)) {
        return field.filter(item => item && String(item).trim().length > 0);
      }
      if (typeof field === 'string' && field.trim()) {
        return field.split(',').map(s => s.trim()).filter(Boolean);
      }
      return [];
    };

    // Merge older `workExperience` shape into `experience` if present
    if (Array.isArray(data.workExperience) && data.workExperience.length > 0) {
      data.experience = [...(data.experience || []), ...normalizeExperience(data.workExperience)];
      delete data.workExperience;
    }

    return {
      name: data.name || "",
      role: data.role || "",
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
      summary: data.summary || "",
      experience: normalizeExperience(data.experience),
      education: normalizeEducation(data.education),
      projects: normalizeProjects(data.projects),
      certifications: normalizeCertifications(data.certifications),
      achievements: normalizeAchievements(data.achievements),
      skills: normalizeArrayField(data.skills),
      languages: normalizeArrayField(data.languages),
      interests: normalizeArrayField(data.interests)
    };
  };

  // Initialize localData from resumeData on mount
  useEffect(() => {
    if (resumeData) {
      const cleaned = sanitizeResumeData(resumeData);
      setLocalData(cleaned);
    }
  }, []); // Only run on mount

  // Keep localData in sync with context resumeData when not actively editing
  useEffect(() => {
    if (!editMode && resumeData) {
      const cleaned = sanitizeResumeData(resumeData);
      setLocalData(cleaned);
    }
  }, [resumeData, editMode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Helper to determine whether a field/section has meaningful content
  const isFilled = (value) => {
    if (value == null) return false;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length === 0) return false;
      if (/^[\-–—\s]+$/.test(trimmed)) return false;
      if (/^\s*(?:your|add|example|placeholder|new|company|institution|position|location|degree|title|issuer|start\s*-\s*end)\b/i.test(trimmed)) return false;
      return true;
    }
    if (Array.isArray(value)) return value.length > 0 && value.some(v => isFilled(v));
    if (typeof value === 'object') return Object.values(value).some(v => isFilled(v));
    return Boolean(value);
  };

  // Function to save to database (extracted for reuse)
  const saveToDatabase = async (dataToSave) => {
    if (!isAuthenticated) return;

    try {
      const cleaned = sanitizeResumeData(dataToSave);

      // Transform flat data structure to backend expected format
      const structuredData = {
        templateId: 10, // Template10
        personalInfo: {
          name: cleaned.name || '',
          role: cleaned.role || '',
          email: cleaned.email || '',
          phone: cleaned.phone || '',
          location: cleaned.location || '',
          linkedin: cleaned.linkedin || '',
          github: cleaned.github || '',
          portfolio: cleaned.portfolio || ''
        },
        summary: cleaned.summary || '',
        skills: cleaned.skills || [],
        experience: cleaned.experience || [],
        education: cleaned.education || [],
        projects: cleaned.projects || [],
        certifications: cleaned.certifications || [],
        achievements: cleaned.achievements || [],
        interests: cleaned.interests || [],
        languages: cleaned.languages || []
      };

      const saveResult = await resumeService.saveResumeData(structuredData);
      if (saveResult && saveResult.success) {
        setIsAutoSaving(false);
        return true;
      } else {
        console.error('Auto-save error:', saveResult?.error);
        setIsAutoSaving(false);
        return false;
      }
    } catch (error) {
      console.error('Error auto-saving resume:', error);
      setIsAutoSaving(false);
      return false;
    }
  };

  // Debounced auto-save function
  const debouncedAutoSave = (dataToSave) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (2 seconds after last change)
    saveTimeoutRef.current = setTimeout(async () => {
      if (isAuthenticated && editMode) {
        setIsAutoSaving(true);
        await saveToDatabase(dataToSave);
      }
    }, 2000); // Wait 2 seconds after last change
  };

  const handleFieldChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);

    // Save to localStorage via context immediately
    if (updateResumeData) {
      updateResumeData(updatedData);
    }

    // Trigger debounced database save
    if (isAuthenticated && editMode) {
      debouncedAutoSave(updatedData);
    }
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    if (!Array.isArray(localData[section])) {
      setLocalData({ ...localData, [section]: [] });
      return;
    }
    const updated = [...localData[section]];
    if (updated[index]) {
      updated[index] = { ...updated[index], [key]: value };
      const updatedData = { ...localData, [section]: updated };
      setLocalData(updatedData);

      // Save to localStorage via context immediately
      if (updateResumeData) {
        updateResumeData(updatedData);
      }

      // Trigger debounced database save
      if (isAuthenticated && editMode) {
        debouncedAutoSave(updatedData);
      }
    }
  };

  const handleSave = async () => {
    try {
      // Clear any pending auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      const cleaned = sanitizeResumeData(localData);

      // Save to localStorage via context
      if (updateResumeData) {
        updateResumeData(cleaned);
      } else {
        setResumeData(cleaned);
      }
      setLocalData(cleaned);

      // Save to database if user is authenticated
      if (isAuthenticated) {
        const saved = await saveToDatabase(cleaned);
        if (saved) {
          toast.success('✅ Resume saved to database successfully!');
        } else {
          toast.warning('Resume saved locally, but failed to save to database. Please try again.');
        }
      } else {
        // User not authenticated - saved locally only
        toast.info('Resume saved locally. Sign in to save permanently to database.');
      }

      setEditMode(false);
      setEditingSections({});
      setEditingHeader(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume. Please try again.');
    }
  };

  const handleCancel = () => {
    if (resumeData) {
      const cleaned = sanitizeResumeData(resumeData);
      setLocalData(cleaned);
    }
    setEditMode(false);
    setEditingSections({});
    setEditingHeader(false);
  };

  const handleEnhance = (section) => {
  };

  const moveSection = (index, direction) => {
    const newSections = [...sections];
    if (direction === "up" && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === "down" && index < sections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    setSections(newSections);
  };

  const handleEdit = (section) => {
    setEditMode(true);
    setEditingSections({ ...editingSections, [section]: true });
  };

  const handleEditHeader = () => {
    setEditMode(true);
    setEditingHeader(true);
  };

  const handleSaveSection = (section) => {
    setEditingSections({ ...editingSections, [section]: false });
  };

  const handleDelete = (section, id = null) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (id !== null && Array.isArray(localData[section])) {
        const updatedContent = localData[section].filter(item => {
          if (typeof item === 'object' && item !== null) {
            return item.id !== id;
          }
          return true;
        });
        setLocalData({ ...localData, [section]: updatedContent });
      }
    }
  };

  const handleAddExperience = () => {
    const newExp = {
      id: Date.now() + Math.random(),
      title: "",
      companyName: "",
      date: "",
      companyLocation: "",
      accomplishment: []
    };

    setLocalData({
      ...localData,
      experience: [...(localData.experience || []), newExp]
    });

    setEditMode(true);
    setEditingSections(prev => ({ ...prev, experience: true }));
  };

  const handleAddEducation = () => {
    const newEducation = {
      id: Date.now() + Math.random(),
      degree: "",
      institution: "",
      duration: "",
      location: ""
    };
    setLocalData({
      ...localData,
      education: [...(localData.education || []), newEducation]
    });
    handleEdit('education');
  };

  const handleAddProject = () => {
    const newProject = {
      id: Date.now() + Math.random(),
      name: "",
      description: "",
      technologies: [],
      link: "",
      github: ""
    };
    setLocalData({
      ...localData,
      projects: [...(localData.projects || []), newProject]
    });
    handleEdit('projects');
  };

  const handleAddCertification = () => {
    const newCertification = {
      id: Date.now() + Math.random(),
      title: "",
      issuer: "",
      date: ""
    };
    setLocalData({
      ...localData,
      certifications: [...(localData.certifications || []), newCertification]
    });
    handleEdit('certifications');
  };

  const handleAddAchievement = () => {
    const currentAchievements = localData.achievements || [];
    setLocalData({
      ...localData,
      achievements: [...currentAchievements, ""]
    });
    handleEdit('achievements');
  };

  const handleContentChange = (section, value, field = null, id = null) => {
    let updatedData;

    if (section === 'header') {
      updatedData = {
        ...localData,
        [field]: value
      };
      setLocalData(updatedData);
    } else if (section === 'summary') {
      updatedData = {
        ...localData,
        summary: value
      };
      setLocalData(updatedData);
    } else if (id !== null && Array.isArray(localData[section])) {
      const updatedContent = localData[section].map(item => {
        if (item && typeof item === 'object' && item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
      updatedData = { ...localData, [section]: updatedContent };
      setLocalData(updatedData);
    } else {
      return;
    }

    // Save to localStorage via context immediately
    if (updateResumeData) {
      updateResumeData(updatedData);
    }

    // Trigger debounced database save
    if (isAuthenticated && editMode) {
      debouncedAutoSave(updatedData);
    }
  };

  const SuccessMessage = () => (
    <div style={{
      position: "fixed",
      bottom: "1rem",
      right: "1rem",
      backgroundColor: "#10b981",
      color: "white",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      zIndex: 1000
    }}>
      Changes saved successfully!
    </div>
  );

  const SectionButtons = ({ section }) => (
    <div style={{
      display: editMode ? "flex" : "none",
      gap: "0.5rem",
      position: "absolute",
      right: "0",
      top: "0",
      backgroundColor: "rgba(255,255,255,0.9)",
      padding: "0.5rem",
      borderRadius: "0.5rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      zIndex: 10
    }}>
      {(section === 'experience' || section === 'education' || section === 'projects' || section === 'certifications' || section === 'achievements') && (
        <button
          onClick={() => {
            if (section === 'experience') handleAddExperience();
            else if (section === 'education') handleAddEducation();
            else if (section === 'projects') handleAddProject();
            else if (section === 'certifications') handleAddCertification();
            else if (section === 'achievements') handleAddAchievement();
          }}
          style={{
            color: "#10b981",
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: "0.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Add new item"
        >
          <Plus size={18} />
        </button>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onEnhance={handleEnhance} resumeRef={resumeRef} />

        <div style={{
          flexGrow: 1,
          padding: "2.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto"
        }}>
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#fff",
              color: "#111827",
              maxWidth: "64rem",
              width: "100%",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              borderRadius: "0.5rem",
              position: "relative"
            }}
          >
            {showSuccessMessage && <SuccessMessage />}
            {isAutoSaving && (
              <div style={{
                position: "fixed",
                bottom: "1rem",
                left: "1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                zIndex: 1000,
                fontSize: "0.875rem"
              }}>
                Auto-saving...
              </div>
            )}

            {sections.map((sectionName) => {
              switch (sectionName) {
                case 'header':
                  return (
                    <header key={sectionName} style={{
                      marginBottom: "2rem",
                      position: "relative",
                      padding: "2rem"
                    }}>
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        width: "100%",
                        gap: "1rem"
                      }}>
                        <div style={{ flex: 1 }}>
                          {editMode ? (
                            <>
                              <input
                                style={{
                                  fontSize: "3rem",
                                  fontWeight: "bold",
                                  width: "100%",
                                  marginBottom: "0.5rem",
                                  padding: "0.25rem",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "0.25rem",
                                  backgroundColor: "#fff"
                                }}
                                value={localData.name || ''}
                                onChange={(e) => handleContentChange('header', e.target.value, 'name')}
                              />
                              <input
                                style={{
                                  fontSize: "1.125rem",
                                  color: "#6b7280",
                                  width: "100%",
                                  padding: "0.25rem",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "0.25rem",
                                  backgroundColor: "#fff"
                                }}
                                value={localData.role || ''}
                                onChange={(e) => handleContentChange('header', e.target.value, 'role')}
                              />
                            </>
                          ) : (
                            <>
                              <h1 style={{ fontSize: "3rem", fontWeight: "bold", margin: "0" }}>{localData.name || ''}</h1>
                              <p style={{ fontSize: "1.125rem", color: "#6b7280", margin: "0" }}>{localData.role || ''}</p>
                            </>
                          )}
                        </div>
                        <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                          {editMode ? (
                            <>
                              <input
                                style={{
                                  display: "block",
                                  width: "100%",
                                  marginBottom: "0.25rem",
                                  padding: "0.25rem",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "0.25rem",
                                  backgroundColor: "#fff"
                                }}
                                value={localData.phone || ''}
                                onChange={(e) => handleContentChange('header', e.target.value, 'phone')}
                              />
                              <input
                                style={{
                                  display: "block",
                                  width: "100%",
                                  marginBottom: "0.25rem",
                                  padding: "0.25rem",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "0.25rem",
                                  backgroundColor: "#fff"
                                }}
                                value={localData.email || ''}
                                onChange={(e) => handleContentChange('header', e.target.value, 'email')}
                              />
                              <input
                                style={{
                                  display: "block",
                                  width: "100%",
                                  padding: "0.25rem",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "0.25rem",
                                  backgroundColor: "#fff"
                                }}
                                value={localData.location || ''}
                                onChange={(e) => handleContentChange('header', e.target.value, 'location')}
                              />
                            </>
                          ) : (
                            <>
                              {localData.phone && <div style={{ marginBottom: "0.25rem" }}>{localData.phone}</div>}
                              {localData.email && <div style={{ marginBottom: "0.25rem" }}><a href={`mailto:${localData.email}`} style={{ color: "inherit", textDecoration: "none" }}>{localData.email}</a></div>}
                              {localData.location && <div style={{ marginBottom: "0.25rem" }}>{localData.location}</div>}
                              {localData.linkedin && <div style={{ marginBottom: "0.25rem" }}><a href={localData.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>LinkedIn</a></div>}
                              {localData.github && <div style={{ marginBottom: "0.25rem" }}><a href={localData.github} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>GitHub</a></div>}
                              {localData.portfolio && <div><a href={localData.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Portfolio</a></div>}
                            </>
                          )}
                        </div>
                      </div>
                    </header>
                  );

                case 'summary':
                  return (editMode || isFilled(localData.summary)) && (
                    <section key={sectionName} style={{
                      marginBottom: "2rem",
                      position: "relative",
                      padding: "0 2rem"
                    }}>
                      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Summary</h2>
                      <div style={{ borderBottom: "1px solid #d1d5db", marginBottom: "2rem" }}></div>
                      <SectionButtons section="summary" />
                      {editMode ? (
                        <textarea
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.25rem",
                            backgroundColor: "#fff",
                            minHeight: "4rem",
                            resize: "vertical"
                          }}
                          value={localData.summary || ''}
                          onChange={(e) => handleContentChange('summary', e.target.value)}
                          rows={4}
                        />
                      ) : (
                        <p style={{ color: "#374151" }}>{localData.summary || ''}</p>
                      )}
                    </section>
                  );

                case 'experience':
                  return (editMode || isFilled(localData.experience)) && (
                    <section key={sectionName} style={{
                      marginBottom: "2rem",
                      position: "relative",
                      padding: "0 2rem"
                    }}>
                      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Experience</h2>
                      <div style={{ borderBottom: "1px solid #d1d5db", marginBottom: "2rem" }}></div>
                      <SectionButtons section="experience" />
                      {(localData.experience || []).map((exp, idx) => {
                        if (!exp || typeof exp !== 'object') return null;
                        const accomplishment = Array.isArray(exp.accomplishment) ? exp.accomplishment : [];
                        return (
                          <div key={exp.id || idx} style={{
                            marginBottom: "1.5rem",
                            position: "relative",
                            border: "1px solid #e5e7eb",
                            padding: "1rem",
                            borderRadius: "0.5rem"
                          }}>
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "0.5rem"
                            }}>
                              {editMode ? (
                                <>
                                  <input
                                    style={{
                                      fontSize: "1.25rem",
                                      fontWeight: "600",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "0.25rem",
                                      padding: "0.5rem",
                                      marginBottom: "0.5rem",
                                      width: "100%",
                                      backgroundColor: "#fff"
                                    }}
                                    value={exp.title || ''}
                                    onChange={(e) => handleArrayFieldChange('experience', idx, 'title', e.target.value)}
                                  />
                                  <input
                                    style={{
                                      color: "#6b7280",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "0.25rem",
                                      padding: "0.5rem",
                                      width: "100%",
                                      marginBottom: "0.5rem",
                                      backgroundColor: "#fff"
                                    }}
                                    value={exp.companyName || ''}
                                    onChange={(e) => handleArrayFieldChange('experience', idx, 'companyName', e.target.value)}
                                  />
                                  <input
                                    style={{
                                      color: "#6b7280",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "0.25rem",
                                      padding: "0.5rem",
                                      width: "100%",
                                      marginBottom: "0.5rem",
                                      backgroundColor: "#fff"
                                    }}
                                    value={exp.date || ''}
                                    onChange={(e) => handleArrayFieldChange('experience', idx, 'date', e.target.value)}
                                  />
                                  <input
                                    style={{
                                      color: "#6b7280",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "0.25rem",
                                      padding: "0.5rem",
                                      width: "100%",
                                      backgroundColor: "#fff"
                                    }}
                                    value={exp.companyLocation || ''}
                                    onChange={(e) => handleArrayFieldChange('experience', idx, 'companyLocation', e.target.value)}
                                  />
                                </>
                              ) : (
                                <>
                                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: "0" }}>{exp.title || ''}</h3>
                                  <span style={{ color: "#6b7280" }}>
                                    {exp.companyName || ''} {exp.date ? `(${exp.date})` : ''} {exp.companyLocation ? `- ${exp.companyLocation}` : ''}
                                  </span>
                                </>
                              )}
                            </div>
                            {editMode ? (
                              <textarea
                                style={{
                                  width: "100%",
                                  padding: "0.5rem",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "0.25rem",
                                  marginTop: "0.5rem",
                                  backgroundColor: "#fff",
                                  minHeight: "3rem",
                                  resize: "vertical"
                                }}
                                value={accomplishment.join('\n')}
                                onChange={(e) => handleArrayFieldChange('experience', idx, 'accomplishment', e.target.value.split('\n').filter(a => a.trim()))}
                                rows={3}
                              />
                            ) : (
                              accomplishment.length > 0 && (
                                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
                                  {accomplishment.map((a, i) => (
                                    <li key={i} style={{ color: "#374151" }}>{a}</li>
                                  ))}
                                </ul>
                              )
                            )}
                            <button
                              onClick={() => handleDelete('experience', exp.id || idx)}
                              style={{
                                position: "absolute",
                                top: "0.5rem",
                                right: "0.5rem",
                                color: "#ef4444",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                display: editMode ? "block" : "none",
                                padding: "0.25rem"
                              }}
                              title="Delete this experience"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        );
                      })}
                    </section>
                  );

                case 'achievements':
                  return (editMode || isFilled(localData.achievements)) && (
                    <section key={sectionName} style={{
                      marginBottom: "2rem",
                      position: "relative",
                      padding: "0 2rem"
                    }}>
                      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Achievements</h2>
                      <div style={{ borderBottom: "1px solid #d1d5db", marginBottom: "2rem" }}></div>
                      <SectionButtons section="achievements" />
                      {editMode ? (
                        <div>
                          {(localData.achievements || []).map((achievement, idx) => {
                            const achievementText = typeof achievement === 'string'
                              ? achievement
                              : (achievement?.title || achievement?.description || achievement?.name || '');

                            return (
                              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                <textarea
                                  style={{
                                    flex: 1,
                                    padding: "0.5rem",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "0.25rem",
                                    backgroundColor: "#fff",
                                    minHeight: "2rem",
                                    resize: "vertical"
                                  }}
                                  value={achievementText}
                                  onChange={(e) => {
                                    const updatedAchievements = [...(localData.achievements || [])];
                                    updatedAchievements[idx] = e.target.value;
                                    handleFieldChange('achievements', updatedAchievements);
                                  }}
                                  rows={1}
                                />
                                <button
                                  onClick={() => {
                                    const updatedAchievements = (localData.achievements || []).filter((_, index) => index !== idx);
                                    handleFieldChange('achievements', updatedAchievements);
                                  }}
                                  style={{
                                    color: "#ef4444",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    padding: "0.25rem"
                                  }}
                                  title="Delete this achievement"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <ul style={{ paddingLeft: "1.25rem" }}>
                          {(localData.achievements || []).map((item, i) => {
                            const achievementText = typeof item === 'string'
                              ? item
                              : (item?.title || item?.description || item?.name || '');

                            return achievementText ? (
                              <li key={i} style={{ color: "#374151" }}>{achievementText}</li>
                            ) : null;
                          })}
                        </ul>
                      )}
                    </section>
                  );

                case 'projects':
                  return (editMode || isFilled(localData.projects)) && (
                    <section key={sectionName} style={{
                      marginBottom: "2rem",
                      position: "relative",
                      padding: "0 2rem"
                    }}>
                      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Projects</h2>
                      <div style={{ borderBottom: "1px solid #d1d5db", marginBottom: "2rem" }}></div>
                      <SectionButtons section="projects" />
                      {(localData.projects || []).map((proj, idx) => {
                        if (!proj || typeof proj !== 'object') return null;
                        const technologies = Array.isArray(proj.technologies) ? proj.technologies : [];
                        return (
                          <div key={proj.id || idx} style={{
                            marginBottom: "1.5rem",
                            position: "relative",
                            border: "1px solid #e5e7eb",
                            padding: "1rem",
                            borderRadius: "0.5rem"
                          }}>
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "0.5rem"
                            }}>
                              {editMode ? (
                                <>
                                  <input
                                    style={{
                                      fontSize: "1.25rem",
                                      fontWeight: "600",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "0.25rem",
                                      padding: "0.5rem",
                                      marginBottom: "0.5rem",
                                      width: "100%",
                                      backgroundColor: "#fff"
                                    }}
                                    value={proj.name || ''}
                                    onChange={(e) => handleArrayFieldChange('projects', idx, 'name', e.target.value)}
                                  />
                                  <textarea
                                    style={{
                                      width: "100%",
                                      padding: "0.5rem",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "0.25rem",
                                      marginTop: "0.5rem",
                                      marginBottom: "0.5rem",
                                      backgroundColor: "#fff",
                                      minHeight: "3rem",
                                      resize: "vertical"
                                    }}
                                    value={proj.description || ''}
                                    onChange={(e) => handleArrayFieldChange('projects', idx, 'description', e.target.value)}
                                    rows={3}
                                  />
                                  <input
                                    style={{
                                      width: "100%",
                                      padding: "0.5rem",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "0.25rem",
                                      backgroundColor: "#fff",
                                      marginBottom: "0.5rem"
                                    }}
                                    value={technologies.join(', ')}
                                    onChange={(e) => handleArrayFieldChange('projects', idx, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                    placeholder="Technologies used"
                                  />
                                  <input
                                    style={{
                                      width: "100%",
                                      padding: "0.5rem",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "0.25rem",
                                      backgroundColor: "#fff",
                                      marginBottom: "0.5rem"
                                    }}
                                    value={proj.link || ''}
                                    onChange={(e) => handleArrayFieldChange('projects', idx, 'link', e.target.value)}
                                    placeholder="Live Link"
                                  />
                                  <input
                                    style={{
                                      width: "100%",
                                      padding: "0.5rem",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "0.25rem",
                                      backgroundColor: "#fff"
                                    }}
                                    value={proj.github || ''}
                                    onChange={(e) => handleArrayFieldChange('projects', idx, 'github', e.target.value)}
                                    placeholder="GitHub Link"
                                  />
                                </>
                              ) : (
                                <>
                                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: "0" }}>{proj.name || ''}</h3>
                                  {proj.description && <p style={{ color: "#374151", marginTop: "0.5rem" }}>{proj.description}</p>}
                                  {technologies.length > 0 && (
                                    <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                                      <span style={{ fontWeight: "500" }}>Technologies:</span> {technologies.join(', ')}
                                    </p>
                                  )}
                                  {(proj.link || proj.github) && (
                                    <p style={{ marginTop: "0.5rem" }}>
                                      {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", marginRight: "1rem" }}>Live</a>}
                                      {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6" }}>GitHub</a>}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                            <button
                              onClick={() => handleDelete('projects', proj.id || idx)}
                              style={{
                                position: "absolute",
                                top: "0.5rem",
                                right: "0.5rem",
                                color: "#ef4444",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                display: editMode ? "block" : "none",
                                padding: "0.25rem"
                              }}
                              title="Delete this project"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        );
                      })}
                    </section>
                  );

                case 'education':
                  return (editMode || isFilled(localData.education)) && (
                    <section key={sectionName} style={{
                      marginBottom: "2rem",
                      position: "relative",
                      padding: "0 2rem"
                    }}>
                      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Education</h2>
                      <div style={{ borderBottom: "1px solid #d1d5db", marginBottom: "2rem" }}></div>
                      <SectionButtons section="education" />
                      {(localData.education || []).map((edu, idx) => {
                        if (!edu || typeof edu !== 'object') return null;
                        return (
                          <div key={edu.id || idx} style={{
                            marginBottom: "1rem",
                            position: "relative",
                            border: "1px solid #e5e7eb",
                            padding: "1rem",
                            borderRadius: "0.5rem"
                          }}>
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              alignItems: "flex-start"
                            }}>
                              <div style={{ flex: 1 }}>
                                {editMode ? (
                                  <>
                                    <input
                                      style={{
                                        fontSize: "1.25rem",
                                        fontWeight: "600",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "0.25rem",
                                        padding: "0.5rem",
                                        marginBottom: "0.5rem",
                                        width: "100%",
                                        backgroundColor: "#fff"
                                      }}
                                      value={edu.institution || ''}
                                      onChange={(e) => handleArrayFieldChange('education', idx, 'institution', e.target.value)}
                                    />
                                    <input
                                      style={{
                                        color: "#374151",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "0.25rem",
                                        padding: "0.5rem",
                                        width: "100%",
                                        backgroundColor: "#fff"
                                      }}
                                      value={edu.degree || ''}
                                      onChange={(e) => handleArrayFieldChange('education', idx, 'degree', e.target.value)}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: "0" }}>{edu.institution || ''}</h3>
                                    <p style={{ color: "#374151", margin: "0" }}>{edu.degree || ''}</p>
                                  </>
                                )}
                              </div>
                              <div style={{ marginTop: "0.5rem" }}>
                                {editMode ? (
                                  <>
                                    <input
                                      style={{
                                        color: "#6b7280",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "0.25rem",
                                        padding: "0.5rem",
                                        width: "100%",
                                        marginBottom: "0.5rem",
                                        backgroundColor: "#fff"
                                      }}
                                      value={edu.duration || ''}
                                      onChange={(e) => handleArrayFieldChange('education', idx, 'duration', e.target.value)}
                                    />
                                    <input
                                      style={{
                                        color: "#6b7280",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "0.25rem",
                                        padding: "0.5rem",
                                        width: "100%",
                                        backgroundColor: "#fff"
                                      }}
                                      value={edu.location || ''}
                                      onChange={(e) => handleArrayFieldChange('education', idx, 'location', e.target.value)}
                                    />
                                  </>
                                ) : (
                                  <span style={{ color: "#6b7280" }}>
                                    {edu.duration || ''} {edu.duration && edu.location ? '- ' : ''}{edu.location || ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete('education', edu.id || idx)}
                              style={{
                                position: "absolute",
                                top: "0.5rem",
                                right: "0.5rem",
                                color: "#ef4444",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                display: editMode ? "block" : "none",
                                padding: "0.25rem"
                              }}
                              title="Delete this education"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        );
                      })}
                    </section>
                  );

                case 'skills':
                  return (editMode || isFilled(localData.skills) || isFilled(localData.languages) || isFilled(localData.interests)) && (
                    <section key={sectionName} style={{
                      marginBottom: "2rem",
                      position: "relative",
                      padding: "0 2rem 2rem 2rem"
                    }}>
                      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Skills</h2>
                      <div style={{ borderBottom: "1px solid #d1d5db", marginBottom: "2rem" }}></div>
                      <SectionButtons section="skills" />

                      {/* Technical Skills */}
                      <div style={{ marginBottom: "1rem" }}>
                        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>Technical Skills:</h3>
                        {editMode ? (
                          <input
                            style={{
                              width: "100%",
                              padding: "0.5rem",
                              border: "1px solid #d1d5db",
                              borderRadius: "0.25rem",
                              backgroundColor: "#fff"
                            }}
                            value={(localData.skills || []).join(', ')}
                            onChange={(e) => handleFieldChange('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          />
                        ) : (
                          <p style={{ color: "#374151" }}>{(localData.skills || []).length > 0 ? (localData.skills || []).join(' • ') : 'No skills listed'}</p>
                        )}
                      </div>

                      {/* Languages */}
                      {(localData.languages && localData.languages.length > 0) || editMode ? (
                        <div style={{ marginBottom: "1rem" }}>
                          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>Languages:</h3>
                          {editMode ? (
                            <input
                              style={{
                                width: "100%",
                                padding: "0.5rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "0.25rem",
                                backgroundColor: "#fff"
                              }}
                              value={(localData.languages || []).join(', ')}
                              onChange={(e) => handleFieldChange('languages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            />
                          ) : (
                            <p style={{ color: "#374151" }}>{(localData.languages || []).join(' • ')}</p>
                          )}
                        </div>
                      ) : null}

                      {/* Interests */}
                      {(localData.interests && localData.interests.length > 0) || editMode ? (
                        <div>
                          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>Interests:</h3>
                          {editMode ? (
                            <input
                              style={{
                                width: "100%",
                                padding: "0.5rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "0.25rem",
                                backgroundColor: "#fff"
                              }}
                              value={(localData.interests || []).join(', ')}
                              onChange={(e) => handleFieldChange('interests', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            />
                          ) : (
                            <p style={{ color: "#374151" }}>{(localData.interests || []).join(' • ')}</p>
                          )}
                        </div>
                      ) : null}
                    </section>
                  );

                default:
                  return null;
              }
            })}
          </div>

          {/* Global Edit Controls */}
          <div style={{
            marginTop: "1rem",
            textAlign: "center",
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            flexWrap: "wrap"
          }}>
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  Save All Changes
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "#6b7280",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "500"
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
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Edit Resume
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .flex {
            flex-direction: column;
          }
          .max-w-4xl {
            max-width: 100%;
            padding: 1rem;
          }
          header .flex {
            flex-direction: column;
            align-items: flex-start;
          }
          .text-right {
            text-align: left !important;
          }
          .control-buttons {
            right: 1rem;
            top: 0.5rem;
          }
          div[style*="padding: \"2.5rem\""] {
            padding: 1rem !important;
          }
          div[style*="padding: \"2rem\""] {
            padding: 1rem !important;
          }
          div[style*="padding: \"0 2rem\""] {
            padding: 0 1rem !important;
          }
          div[style*="padding: \"0 2rem 2rem 2rem\""] {
            padding: 0 1rem 1rem 1rem !important;
          }
          h1[style*="fontSize: \"3rem\""] {
            font-size: 2rem !important;
          }
          h2[style*="fontSize: \"2rem\""] {
            font-size: 1.5rem !important;
          }
          h3[style*="fontSize: \"1.25rem\""] {
            font-size: 1.125rem !important;
          }
          input[style*="fontSize: \"3rem\""] {
            font-size: 2rem !important;
          }
          input[style*="fontSize: \"1.25rem\""] {
            font-size: 1.125rem !important;
          }
        }
        @media print {
          div[style*="position: \"absolute\""] {
            display: none !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Template10;
