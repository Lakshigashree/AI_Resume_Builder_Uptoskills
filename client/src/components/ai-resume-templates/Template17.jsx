/* eslint-disable no-unused-vars */
import { MapPin, Phone, Mail, Linkedin, Github, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import { getSafeUrl } from "../../utils/ResumeConfig";
import html2pdf from "html2pdf.js";

// ---------- DATA HELPERS / NORMALIZATION (aligned with Template2) ----------

const DEFAULT_RESUME = {
    name: "",
    role: "",
    phone: "",
    email: "",
    linkedin: "",
    location: "",
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
};

const EMPTY_EXPERIENCE = {
    title: "",
    companyName: "",
    date: "",
    companyLocation: "",
    accomplishment: [""],
};

const EMPTY_EDUCATION = {
    degree: "",
    institution: "",
    duration: "",
    location: "",
};

const EMPTY_PROJECT = {
    name: "",
    description: "",
    technologies: [],
    link: "",
    github: "",
};

const EMPTY_CERTIFICATION = {
    title: "",
    issuer: "",
    date: "",
};

const safeArray = (val) => (Array.isArray(val) ? val : []);

// ========== HELPER FUNCTION FOR SAFE TEXT RENDERING ==========
const renderSafeText = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object") {
        return item.title || item.name || item.language || item.degree || JSON.stringify(item);
    }
    return String(item);
};

// Strings used as fake placeholders – treat them as empty
const PLACEHOLDERS = new Set([
    "Company Name",
    "Job Title",
    "YYYY - YYYY",
    "City, Country",
    "Describe your work here.",
    "Degree",
    "Institution",
    "Project Name",
    "Short project description.",
    "Tech1",
    "Tech2",
    "Certification Title",
    "Issuer",
    "New Skill",
    "New Achievement",
    "New Language",
    "New Interest",
]);

const hasText = (val) => {
    if (typeof val !== "string") return false;
    const trimmed = val.trim();
    if (!trimmed) return false;
    if (PLACEHOLDERS.has(trimmed)) return false;
    const lower = trimmed.toLowerCase();
    if (trimmed === "-" || lower === "n/a" || lower === "na") return false;
    return true;
};

const cleanText = (val) => (hasText(val) ? val.trim() : "");

const hasNonEmptyStringArray = (arr) =>
    safeArray(arr).some((v) => hasText(v));

const hasExperienceContent = (exp) =>
    hasText(exp?.companyName) ||
    hasText(exp?.title) ||
    hasText(exp?.date) ||
    hasText(exp?.companyLocation) ||
    hasNonEmptyStringArray(exp?.accomplishment);

const hasEducationContent = (edu) =>
    hasText(edu?.institution) ||
    hasText(edu?.degree) ||
    hasText(edu?.duration) ||
    hasText(edu?.location);

const hasProjectContent = (p) =>
    hasText(p?.name) ||
    hasText(p?.description) ||
    hasNonEmptyStringArray(p?.technologies) ||
    hasText(p?.link) ||
    hasText(p?.github);

const hasCertificationContent = (c) =>
    hasText(c?.title) || hasText(c?.issuer) || hasText(c?.date);

const normalizeData = (raw) => {
    const data = {
        ...DEFAULT_RESUME,
        ...(raw || {}),
    };

    // Headline + contacts + summary
    data.name = cleanText(data.name);
    data.role = cleanText(data.role);
    data.phone = cleanText(data.phone);
    data.email = cleanText(data.email);
    data.location = cleanText(data.location);
    data.linkedin = cleanText(data.linkedin);
    data.github = cleanText(data.github);
    data.portfolio = cleanText(data.portfolio);
    data.summary = cleanText(data.summary);

    // Simple lists
    data.skills = safeArray(data.skills).filter(hasText);
    data.achievements = safeArray(data.achievements).filter(hasText);
    data.languages = safeArray(data.languages).filter(hasText);
    data.interests = safeArray(data.interests).filter(hasText);

    // Experience
    data.experience = safeArray(data.experience)
        .map((exp) => ({
            title: cleanText(exp?.title),
            companyName: cleanText(exp?.companyName),
            date: cleanText(exp?.date),
            companyLocation: cleanText(exp?.companyLocation),
            accomplishment: safeArray(exp?.accomplishment).filter(hasText),
        }))
        .filter(hasExperienceContent);

    // Education
    data.education = safeArray(data.education)
        .map((edu) => ({
            degree: cleanText(edu?.degree),
            institution: cleanText(edu?.institution),
            duration: cleanText(edu?.duration),
            location: cleanText(edu?.location),
        }))
        .filter(hasEducationContent);

    // Projects
    data.projects = safeArray(data.projects)
        .map((p) => ({
            name: cleanText(p?.name),
            description: cleanText(p?.description),
            technologies: safeArray(p?.technologies).filter(hasText),
            link: cleanText(p?.link),
            github: cleanText(p?.github || p?.githubLink),
        }))
        .filter(hasProjectContent);

    // Certifications
    data.certifications = safeArray(data.certifications)
        .map((c) => ({
            title: cleanText(c?.title),
            issuer: cleanText(c?.issuer),
            date: cleanText(c?.date),
        }))
        .filter(hasCertificationContent);

    return data;
};

// Build edit-mode state from normalized saved data
const buildEditingState = (savedRaw) => {
    const saved = normalizeData(savedRaw);

    const experience =
        safeArray(saved.experience).length > 0
            ? safeArray(saved.experience).map((exp) => ({
                title: exp.title || "",
                companyName: exp.companyName || "",
                date: exp.date || "",
                companyLocation: exp.companyLocation || "",
                accomplishment:
                    safeArray(exp.accomplishment).length > 0
                        ? safeArray(exp.accomplishment)
                        : [""],
            }))
            : [JSON.parse(JSON.stringify(EMPTY_EXPERIENCE))];

    const education =
        safeArray(saved.education).length > 0
            ? safeArray(saved.education).map((edu) => ({
                degree: edu.degree || "",
                institution: edu.institution || "",
                duration: edu.duration || "",
                location: edu.location || "",
            }))
            : [JSON.parse(JSON.stringify(EMPTY_EDUCATION))];

    const projects =
        safeArray(saved.projects).length > 0
            ? safeArray(saved.projects).map((p) => ({
                name: p.name || "",
                description: p.description || "",
                technologies: safeArray(p.technologies),
                link: p.link || "",
                github: p.github || "",
            }))
            : [JSON.parse(JSON.stringify(EMPTY_PROJECT))];

    const certifications =
        safeArray(saved.certifications).length > 0
            ? safeArray(saved.certifications).map((c) => ({
                title: c.title || "",
                issuer: c.issuer || "",
                date: c.date || "",
            }))
            : [JSON.parse(JSON.stringify(EMPTY_CERTIFICATION))];

    const skills =
        safeArray(saved.skills).length > 0 ? safeArray(saved.skills) : [""];
    const achievements =
        safeArray(saved.achievements).length > 0
            ? safeArray(saved.achievements)
            : [""];
    const languages =
        safeArray(saved.languages).length > 0 ? safeArray(saved.languages) : [""];
    const interests =
        safeArray(saved.interests).length > 0 ? safeArray(saved.interests) : [""];

    return {
        ...DEFAULT_RESUME,
        ...saved,
        experience,
        education,
        projects,
        certifications,
        skills,
        achievements,
        languages,
        interests,
    };
};

// shared input style for contact row
const contactInputStyle = {
    border: "none",
    borderBottom: "1px solid #d1d5db",
    outline: "none",
    background: "transparent",
    width: "100%",
    marginBottom: "0.4rem",
    fontSize: "0.95rem",
};

const contactRowItemStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: "0.95rem",
    marginBottom: "0.25rem",
    color: "#374151",
};

// ---------- COMPONENT ----------

const Template17 = () => {
    const resumeRef = useRef(null);
    const resumeContext = useResume();
    const { isAuthenticated } = useAuth();

    const resumeData = resumeContext?.resumeData || {};
    const updateResumeData = resumeContext?.updateResumeData;
    const sectionOrder = resumeContext?.sectionOrder || [];

    const [editMode, setEditMode] = useState(false);
    const [localData, setLocalData] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalData(buildEditingState(resumeData));
    }, [resumeData]);

    const handleFieldChange = (field, value) => {
        setLocalData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleArrayFieldChange = (section, index, key, value) => {
        setLocalData((prev) => {
            const arr = safeArray(prev[section]);
            const updated = arr.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        [key]: value,
                    }
                    : item
            );
            return { ...prev, [section]: updated };
        });
    };

    const handleSimpleListChange = (section, index, value) => {
        setLocalData((prev) => {
            const arr = safeArray(prev[section]);
            const updated = arr.map((item, i) => (i === index ? value : item));
            return { ...prev, [section]: updated };
        });
    };

    const handleAddRow = (section) => {
        setLocalData((prev) => {
            const arr = safeArray(prev[section]);
            let newItem;
            if (section === "experience") {
                newItem = JSON.parse(JSON.stringify(EMPTY_EXPERIENCE));
            } else if (section === "education") {
                newItem = JSON.parse(JSON.stringify(EMPTY_EDUCATION));
            } else if (section === "projects") {
                newItem = JSON.parse(JSON.stringify(EMPTY_PROJECT));
            } else if (section === "certifications") {
                newItem = JSON.parse(JSON.stringify(EMPTY_CERTIFICATION));
            } else {
                newItem = "";
            }
            return { ...prev, [section]: [...arr, newItem] };
        });
    };

    const handleRemoveRow = (section, index) => {
        setLocalData((prev) => {
            const arr = safeArray(prev[section]);
            const updated = arr.filter((_, i) => i !== index);

            // Always keep at least one blank row in edit mode
            if (updated.length === 0) {
                if (section === "experience") {
                    return {
                        ...prev,
                        experience: [JSON.parse(JSON.stringify(EMPTY_EXPERIENCE))],
                    };
                }
                if (section === "education") {
                    return {
                        ...prev,
                        education: [JSON.parse(JSON.stringify(EMPTY_EDUCATION))],
                    };
                }
                if (section === "projects") {
                    return {
                        ...prev,
                        projects: [JSON.parse(JSON.stringify(EMPTY_PROJECT))],
                    };
                }
                if (section === "certifications") {
                    return {
                        ...prev,
                        certifications: [JSON.parse(JSON.stringify(EMPTY_CERTIFICATION))],
                    };
                }
                return { ...prev, [section]: [""] };
            }

            return { ...prev, [section]: updated };
        });
    };

    const handleClearSection = (section) => {
        setLocalData((prev) => {
            if (section === "experience") {
                return {
                    ...prev,
                    experience: [JSON.parse(JSON.stringify(EMPTY_EXPERIENCE))],
                };
            }
            if (section === "education") {
                return {
                    ...prev,
                    education: [JSON.parse(JSON.stringify(EMPTY_EDUCATION))],
                };
            }
            if (section === "projects") {
                return {
                    ...prev,
                    projects: [JSON.parse(JSON.stringify(EMPTY_PROJECT))],
                };
            }
            if (section === "certifications") {
                return {
                    ...prev,
                    certifications: [JSON.parse(JSON.stringify(EMPTY_CERTIFICATION))],
                };
            }
            return { ...prev, [section]: [""] };
        });
    };

    const handleSave = async () => {
        if (!localData) return;
        
        setIsSaving(true);
        try {
            const cleaned = normalizeData(localData);
            if (updateResumeData) {
                await updateResumeData(cleaned);
            }
            setEditMode(false);
            toast.success("✅ Changes saved successfully!");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("❌ Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setLocalData(buildEditingState(resumeData));
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

        // Store original styles
        const originalHeight = element.style.height;
        const originalOverflow = element.style.overflow;
        
        // Temporarily adjust for PDF capture
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
                           element.classList.contains('hide-in-pdf') ||
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
            // Add a class to hide edit controls during PDF generation
            const editControls = document.querySelectorAll('.hide-in-pdf');
            editControls.forEach(el => el.setAttribute('data-pdf-hide', 'true'));
            
            await html2pdf()
                .set(options)
                .from(element)
                .save();
            
            // Restore edit controls
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
            // Restore original styles
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

        // Store original styles
        const originalHeight = element.style.height;
        const originalOverflow = element.style.overflow;
        
        // Temporarily adjust for PDF capture
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
                           element.classList.contains('hide-in-pdf') ||
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
            // Hide edit controls during preview
            const editControls = document.querySelectorAll('.hide-in-pdf');
            editControls.forEach(el => el.setAttribute('data-pdf-hide', 'true'));
            
            const pdf = await html2pdf()
                .set(options)
                .from(element)
                .toPdf()
                .get('pdf');

            const blob = pdf.output('blob');
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            
            // Restore edit controls
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
            // Restore original styles
            element.style.height = originalHeight;
            element.style.overflow = originalOverflow;
            setIsPreviewing(false);
        }
    };

    const sectionTitleStyle = {
        fontWeight: 700,
        fontSize: "1.1rem",
        color: "#4f46e5",
        textTransform: "uppercase",
        marginBottom: "0.5rem",
    };

    const sectionDivider = {
        border: "none",
        borderTop: "1px solid #e5e7eb",
        marginBottom: "1rem",
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

    // View data (normalized)
    const viewData = normalizeData(resumeData);

    const showSummary = hasText(viewData.summary);
    const showExperience = safeArray(viewData.experience).some(hasExperienceContent);
    const showEducation = safeArray(viewData.education).some(hasEducationContent);
    const showProjects = safeArray(viewData.projects).some(hasProjectContent);
    const showCertifications = safeArray(viewData.certifications).some(hasCertificationContent);
    const showSkills = safeArray(viewData.skills).some(hasText);
    const showAchievements = safeArray(viewData.achievements).some(hasText);
    const showLanguages = safeArray(viewData.languages).some(hasText);
    const showInterests = safeArray(viewData.interests).some(hasText);

    // Map section keys to their display components
    const sectionComponents = {
        summary: (editMode || showSummary) && (
            <div key="summary" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ ...sectionTitleStyle, fontSize: "1.7rem", fontWeight: 700 }}>
                    Summary
                </h3>
                <hr style={sectionDivider} />
                {editMode ? (
                    <textarea
                        value={localData.summary || ""}
                        onChange={(e) => handleFieldChange("summary", e.target.value)}
                        placeholder="Write a short professional summary..."
                        style={{ width: "100%", minHeight: "4rem" }}
                        className="hide-in-pdf"
                    />
                ) : (
                    <p>{renderSafeText(viewData.summary)}</p>
                )}
            </div>
        ),

        experience: (editMode || showExperience) && (
            <div key="experience" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ ...sectionTitleStyle, fontSize: "1.7rem", fontWeight: 700 }}>
                    Experience
                </h3>
                <hr style={sectionDivider} />

                {editMode
                    ? safeArray(localData.experience).map((exp, idx) => (
                        <div
                            key={idx}
                            style={{
                                marginBottom: "1rem",
                                borderBottom: "1px dashed #e5e7eb",
                                paddingBottom: "0.75rem",
                            }}
                            className="hide-in-pdf"
                        >
                            <input
                                type="text"
                                value={exp.title || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("experience", idx, "title", e.target.value)
                                }
                                placeholder="Job Title"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <input
                                type="text"
                                value={exp.companyName || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("experience", idx, "companyName", e.target.value)
                                }
                                placeholder="Company"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <input
                                type="text"
                                value={exp.date || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("experience", idx, "date", e.target.value)
                                }
                                placeholder="YYYY - YYYY"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <input
                                type="text"
                                value={exp.companyLocation || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("experience", idx, "companyLocation", e.target.value)
                                }
                                placeholder="City, Country"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <textarea
                                value={safeArray(exp.accomplishment).join("\n")}
                                onChange={(e) =>
                                    handleArrayFieldChange("experience", idx, "accomplishment", e.target.value.split("\n"))
                                }
                                placeholder="Describe your work (one bullet per line)"
                                style={{
                                    width: "100%",
                                    minHeight: "3rem",
                                    marginTop: "0.25rem",
                                }}
                            />
                            <div style={{ marginTop: "0.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow("experience", idx)}
                                    style={{
                                        fontSize: "0.8rem",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.25rem",
                                        border: "1px solid #ef4444",
                                        color: "#ef4444",
                                        background: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    Remove Experience
                                </button>
                            </div>
                        </div>
                    ))
                    : safeArray(viewData.experience)
                        .filter(hasExperienceContent)
                        .map((exp, idx) => (
                            <div key={idx} style={{ marginBottom: "1rem" }}>
                                <p style={{ margin: 0 }}>
                                    {hasText(exp.title) && <strong>{renderSafeText(exp.title)}</strong>}
                                    {hasText(exp.companyName) && (
                                        <> — {renderSafeText(exp.companyName)}</>
                                    )}
                                    {hasText(exp.date) && <> ({renderSafeText(exp.date)})</>}
                                    {hasText(exp.companyLocation) && (
                                        <>
                                            <br />
                                            <em>{renderSafeText(exp.companyLocation)}</em>
                                        </>
                                    )}
                                </p>
                                {hasNonEmptyStringArray(exp.accomplishment) && (
                                    <ul
                                        style={{
                                            paddingLeft: "1.25rem",
                                            lineHeight: "1.6",
                                            marginTop: "0.25rem",
                                        }}
                                    >
                                        {safeArray(exp.accomplishment)
                                            .filter(hasText)
                                            .map((a, i) => (
                                                <li key={i}>{renderSafeText(a)}</li>
                                            ))}
                                    </ul>
                                )}
                            </div>
                        ))}

                {editMode && (
                    <div style={{ marginTop: "0.5rem" }} className="hide-in-pdf">
                        <button
                            type="button"
                            onClick={() => handleAddRow("experience")}
                            style={{
                                fontSize: "0.85rem",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "0.375rem",
                                border: "1px solid #3b82f6",
                                color: "#3b82f6",
                                background: "white",
                                marginRight: "0.5rem",
                                cursor: "pointer",
                            }}
                        >
                            + Add Experience
                        </button>
                        <button
                            type="button"
                            onClick={() => handleClearSection("experience")}
                            style={{
                                fontSize: "0.85rem",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "0.375rem",
                                border: "1px solid #6b7280",
                                color: "#6b7280",
                                background: "white",
                                cursor: "pointer",
                            }}
                        >
                            Remove Experience Section
                        </button>
                    </div>
                )}
            </div>
        ),

        education: (editMode || showEducation) && (
            <div key="education" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ ...sectionTitleStyle, fontSize: "1.7rem", fontWeight: 700 }}>
                    Education
                </h3>
                <hr style={sectionDivider} />

                {editMode
                    ? safeArray(localData.education).map((edu, idx) => (
                        <div
                            key={idx}
                            style={{
                                marginBottom: "1rem",
                                borderBottom: "1px dashed #e5e7eb",
                                paddingBottom: "0.75rem",
                            }}
                            className="hide-in-pdf"
                        >
                            <input
                                type="text"
                                value={edu.degree || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("education", idx, "degree", e.target.value)
                                }
                                placeholder="Degree"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <input
                                type="text"
                                value={edu.institution || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("education", idx, "institution", e.target.value)
                                }
                                placeholder="Institution"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <input
                                type="text"
                                value={edu.duration || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("education", idx, "duration", e.target.value)
                                }
                                placeholder="YYYY - YYYY"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <input
                                type="text"
                                value={edu.location || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("education", idx, "location", e.target.value)
                                }
                                placeholder="City, Country"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <div style={{ marginTop: "0.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow("education", idx)}
                                    style={{
                                        fontSize: "0.8rem",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.25rem",
                                        border: "1px solid #ef4444",
                                        color: "#ef4444",
                                        background: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    Remove Education
                                </button>
                            </div>
                        </div>
                    ))
                    : safeArray(viewData.education)
                        .filter(hasEducationContent)
                        .map((edu, idx) => (
                            <p key={idx}>
                                {hasText(edu.degree) && (
                                    <strong>{renderSafeText(edu.degree)}</strong>
                                )}
                                {hasText(edu.institution) && (
                                    <> — {renderSafeText(edu.institution)}</>
                                )}
                                {hasText(edu.duration) && <> ({renderSafeText(edu.duration)})</>}
                                {hasText(edu.location) && <> — {renderSafeText(edu.location)}</>}
                            </p>
                        ))}

                {editMode && (
                    <div style={{ marginTop: "0.5rem" }} className="hide-in-pdf">
                        <button
                            type="button"
                            onClick={() => handleAddRow("education")}
                            style={{
                                fontSize: "0.85rem",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "0.375rem",
                                border: "1px solid #3b82f6",
                                color: "#3b82f6",
                                background: "white",
                                marginRight: "0.5rem",
                                cursor: "pointer",
                            }}
                        >
                            + Add Education
                        </button>
                        <button
                            type="button"
                            onClick={() => handleClearSection("education")}
                            style={{
                                fontSize: "0.85rem",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "0.375rem",
                                border: "1px solid #6b7280",
                                color: "#6b7280",
                                background: "white",
                                cursor: "pointer",
                            }}
                        >
                            Remove Education Section
                        </button>
                    </div>
                )}
            </div>
        ),

        projects: (editMode || showProjects) && (
            <div key="projects" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ ...sectionTitleStyle, fontSize: "1.7rem", fontWeight: 700 }}>
                    Projects
                </h3>
                <hr style={sectionDivider} />

                {editMode
                    ? safeArray(localData.projects).map((project, idx) => (
                        <div
                            key={idx}
                            style={{
                                marginBottom: "1rem",
                                borderBottom: "1px dashed #e5e7eb",
                                paddingBottom: "0.75rem",
                            }}
                            className="hide-in-pdf"
                        >
                            <input
                                type="text"
                                value={project.name || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("projects", idx, "name", e.target.value)
                                }
                                placeholder="Project Name"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <textarea
                                value={project.description || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("projects", idx, "description", e.target.value)
                                }
                                placeholder="Short project description."
                                style={{
                                    width: "100%",
                                    minHeight: "3rem",
                                    marginBottom: "0.25rem",
                                }}
                            />
                            <input
                                type="text"
                                value={safeArray(project.technologies).join(", ")}
                                onChange={(e) =>
                                    handleArrayFieldChange("projects", idx, "technologies", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
                                }
                                placeholder="Technologies (comma separated)"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <input
                                type="text"
                                value={project.link || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("projects", idx, "link", e.target.value)
                                }
                                placeholder="Live link (optional)"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <input
                                type="text"
                                value={project.github || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("projects", idx, "github", e.target.value)
                                }
                                placeholder="GitHub link (optional)"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <div style={{ marginTop: "0.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow("projects", idx)}
                                    style={{
                                        fontSize: "0.8rem",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.25rem",
                                        border: "1px solid #ef4444",
                                        color: "#ef4444",
                                        background: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    Remove Project
                                </button>
                            </div>
                        </div>
                    ))
                    : safeArray(viewData.projects)
                        .filter(hasProjectContent)
                        .map((project, idx) => (
                            <div key={idx} style={{ marginBottom: "1rem" }}>
                                {hasText(project.name) && (
                                    <p style={{ margin: 0, fontWeight: 600 }}>
                                        {renderSafeText(project.name)}
                                    </p>
                                )}
                                {hasText(project.description) && (
                                    <p style={{ margin: "0.1rem 0" }}>
                                        {renderSafeText(project.description)}
                                    </p>
                                )}
                                {safeArray(project.technologies).length > 0 && (
                                    <p style={{ margin: "0.1rem 0", fontSize: "0.9rem" }}>
                                        <strong>Tech:</strong>{" "}
                                        {safeArray(project.technologies).map(t => renderSafeText(t)).join(", ")}
                                    </p>
                                )}
                                {(hasText(project.link) || hasText(project.github)) && (
                                    <p style={{ margin: "0.1rem 0", fontSize: "0.9rem" }}>
                                        {hasText(project.link) && (
                                            <>
                                                <a
                                                    href={getSafeUrl("portfolio", project.link)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ color: "#2563eb" }}
                                                >
                                                    Live
                                                </a>
                                                {hasText(project.github) ? " · " : ""}
                                            </>
                                        )}
                                        {hasText(project.github) && (
                                            <a
                                                href={getSafeUrl("github", project.github)}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ color: "#2563eb" }}
                                            >
                                                GitHub
                                            </a>
                                        )}
                                    </p>
                                )}
                            </div>
                        ))}

                {editMode && (
                    <div style={{ marginTop: "0.5rem" }} className="hide-in-pdf">
                        <button
                            type="button"
                            onClick={() => handleAddRow("projects")}
                            style={{
                                fontSize: "0.85rem",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "0.375rem",
                                border: "1px solid #3b82f6",
                                color: "#3b82f6",
                                background: "white",
                                marginRight: "0.5rem",
                                cursor: "pointer",
                            }}
                        >
                            + Add Project
                        </button>
                        <button
                            type="button"
                            onClick={() => handleClearSection("projects")}
                            style={{
                                fontSize: "0.85rem",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "0.375rem",
                                border: "1px solid #6b7280",
                                color: "#6b7280",
                                background: "white",
                                cursor: "pointer",
                            }}
                        >
                            Remove Projects Section
                        </button>
                    </div>
                )}
            </div>
        ),

        certifications: (editMode || showCertifications) && (
            <div key="certifications" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ ...sectionTitleStyle, fontSize: "1.7rem", fontWeight: 700 }}>
                    Certifications
                </h3>
                <hr style={sectionDivider} />

                {editMode
                    ? safeArray(localData.certifications).map((cert, idx) => (
                        <div
                            key={idx}
                            style={{
                                marginBottom: "1rem",
                                borderBottom: "1px dashed #e5e7eb",
                                paddingBottom: "0.75rem",
                            }}
                            className="hide-in-pdf"
                        >
                            <input
                                type="text"
                                value={cert.title || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("certifications", idx, "title", e.target.value)
                                }
                                placeholder="Certification Title"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <input
                                type="text"
                                value={cert.issuer || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("certifications", idx, "issuer", e.target.value)
                                }
                                placeholder="Issuer"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <input
                                type="text"
                                value={cert.date || ""}
                                onChange={(e) =>
                                    handleArrayFieldChange("certifications", idx, "date", e.target.value)
                                }
                                placeholder="Date"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                    border: "none",
                                    borderBottom: "1px solid #d1d5db",
                                    background: "transparent",
                                    outline: "none",
                                }}
                            />
                            <div style={{ marginTop: "0.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow("certifications", idx)}
                                    style={{
                                        fontSize: "0.8rem",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.25rem",
                                        border: "1px solid #ef4444",
                                        color: "#ef4444",
                                        background: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    Remove Certification
                                </button>
                            </div>
                        </div>
                    ))
                    : safeArray(viewData.certifications)
                        .filter(hasCertificationContent)
                        .map((cert, idx) => (
                            <p key={idx}>
                                {hasText(cert.title) && (
                                    <strong>{renderSafeText(cert.title)}</strong>
                                )}
                                {hasText(cert.issuer) && <> — {renderSafeText(cert.issuer)}</>}
                                {hasText(cert.date) && <> ({renderSafeText(cert.date)})</>}
                            </p>
                        ))}

                {editMode && (
                    <div style={{ marginTop: "0.5rem" }} className="hide-in-pdf">
                        <button
                            type="button"
                            onClick={() => handleAddRow("certifications")}
                            style={{
                                fontSize: "0.85rem",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "0.375rem",
                                border: "1px solid #3b82f6",
                                color: "#3b82f6",
                                background: "white",
                                marginRight: "0.5rem",
                                cursor: "pointer",
                            }}
                        >
                            + Add Certification
                        </button>
                        <button
                            type="button"
                            onClick={() => handleClearSection("certifications")}
                            style={{
                                fontSize: "0.85rem",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "0.375rem",
                                border: "1px solid #6b7280",
                                color: "#6b7280",
                                background: "white",
                                cursor: "pointer",
                            }}
                        >
                            Remove Certifications Section
                        </button>
                    </div>
                )}
            </div>
        ),

        achievements: (editMode || showAchievements) && (
            <div key="achievements" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ ...sectionTitleStyle, fontSize: "1.7rem", fontWeight: 700 }}>
                    Achievements
                </h3>
                <hr style={sectionDivider} />

                {editMode ? (
                    <>
                        {safeArray(localData.achievements).map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "0.5rem",
                                }}
                                className="hide-in-pdf"
                            >
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleSimpleListChange("achievements", idx, e.target.value)}
                                    placeholder="New Achievement"
                                    style={{
                                        flexGrow: 1,
                                        border: "none",
                                        borderBottom: "1px solid #d1d5db",
                                        background: "transparent",
                                        outline: "none",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow("achievements", idx)}
                                    style={{
                                        marginLeft: "0.5rem",
                                        fontSize: "0.75rem",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.25rem",
                                        border: "1px solid #ef4444",
                                        color: "#ef4444",
                                        background: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                        <div style={{ marginTop: "0.5rem" }} className="hide-in-pdf">
                            <button
                                type="button"
                                onClick={() => handleAddRow("achievements")}
                                style={{
                                    fontSize: "0.85rem",
                                    padding: "0.35rem 0.75rem",
                                    borderRadius: "0.375rem",
                                    border: "1px solid #3b82f6",
                                    color: "#3b82f6",
                                    background: "white",
                                    marginRight: "0.5rem",
                                    cursor: "pointer",
                                }}
                            >
                                + Add Achievement
                            </button>
                            <button
                                type="button"
                                onClick={() => handleClearSection("achievements")}
                                style={{
                                    fontSize: "0.85rem",
                                    padding: "0.35rem 0.75rem",
                                    borderRadius: "0.375rem",
                                    border: "1px solid #6b7280",
                                    color: "#6b7280",
                                    background: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Remove Achievements Section
                            </button>
                        </div>
                    </>
                ) : (
                    <ul style={{ paddingLeft: "1.25rem", lineHeight: "1.6", margin: 0 }}>
                        {safeArray(viewData.achievements)
                            .filter(hasText)
                            .map((item, i) => (
                                <li key={i}>{renderSafeText(item)}</li>
                            ))}
                    </ul>
                )}
            </div>
        ),

        skills: (editMode || showSkills) && (
            <div key="skills" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ ...sectionTitleStyle, fontSize: "1.7rem", fontWeight: 700 }}>
                    Skills
                </h3>
                <hr style={sectionDivider} />

                {editMode ? (
                    <>
                        {safeArray(localData.skills).map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "0.5rem",
                                }}
                                className="hide-in-pdf"
                            >
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleSimpleListChange("skills", idx, e.target.value)}
                                    placeholder="New Skill"
                                    style={{
                                        flexGrow: 1,
                                        border: "none",
                                        borderBottom: "1px solid #d1d5db",
                                        background: "transparent",
                                        outline: "none",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow("skills", idx)}
                                    style={{
                                        marginLeft: "0.5rem",
                                        fontSize: "0.75rem",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.25rem",
                                        border: "1px solid #ef4444",
                                        color: "#ef4444",
                                        background: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                        <div style={{ marginTop: "0.5rem" }} className="hide-in-pdf">
                            <button
                                type="button"
                                onClick={() => handleAddRow("skills")}
                                style={{
                                    fontSize: "0.85rem",
                                    padding: "0.35rem 0.75rem",
                                    borderRadius: "0.375rem",
                                    border: "1px solid #3b82f6",
                                    color: "#3b82f6",
                                    background: "white",
                                    marginRight: "0.5rem",
                                    cursor: "pointer",
                                }}
                            >
                                + Add Skill
                            </button>
                            <button
                                type="button"
                                onClick={() => handleClearSection("skills")}
                                style={{
                                    fontSize: "0.85rem",
                                    padding: "0.35rem 0.75rem",
                                    borderRadius: "0.375rem",
                                    border: "1px solid #6b7280",
                                    color: "#6b7280",
                                    background: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Remove Skills Section
                            </button>
                        </div>
                    </>
                ) : (
                    <ul style={{ paddingLeft: "1.25rem", lineHeight: "1.6", margin: 0 }}>
                        {safeArray(viewData.skills)
                            .filter(hasText)
                            .map((item, i) => (
                                <li key={i}>{renderSafeText(item)}</li>
                            ))}
                    </ul>
                )}
            </div>
        ),

        languages: (editMode || showLanguages) && (
            <div key="languages" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ ...sectionTitleStyle, fontSize: "1.7rem", fontWeight: 700 }}>
                    Languages
                </h3>
                <hr style={sectionDivider} />

                {editMode ? (
                    <>
                        {safeArray(localData.languages).map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "0.5rem",
                                }}
                                className="hide-in-pdf"
                            >
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleSimpleListChange("languages", idx, e.target.value)}
                                    placeholder="New Language"
                                    style={{
                                        flexGrow: 1,
                                        border: "none",
                                        borderBottom: "1px solid #d1d5db",
                                        background: "transparent",
                                        outline: "none",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow("languages", idx)}
                                    style={{
                                        marginLeft: "0.5rem",
                                        fontSize: "0.75rem",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.25rem",
                                        border: "1px solid #ef4444",
                                        color: "#ef4444",
                                        background: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                        <div style={{ marginTop: "0.5rem" }} className="hide-in-pdf">
                            <button
                                type="button"
                                onClick={() => handleAddRow("languages")}
                                style={{
                                    fontSize: "0.85rem",
                                    padding: "0.35rem 0.75rem",
                                    borderRadius: "0.375rem",
                                    border: "1px solid #3b82f6",
                                    color: "#3b82f6",
                                    background: "white",
                                    marginRight: "0.5rem",
                                    cursor: "pointer",
                                }}
                            >
                                + Add Language
                            </button>
                            <button
                                type="button"
                                onClick={() => handleClearSection("languages")}
                                style={{
                                    fontSize: "0.85rem",
                                    padding: "0.35rem 0.75rem",
                                    borderRadius: "0.375rem",
                                    border: "1px solid #6b7280",
                                    color: "#6b7280",
                                    background: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Remove Languages Section
                            </button>
                        </div>
                    </>
                ) : (
                    <ul style={{ paddingLeft: "1.25rem", lineHeight: "1.6", margin: 0 }}>
                        {safeArray(viewData.languages)
                            .filter(hasText)
                            .map((item, i) => (
                                <li key={i}>{renderSafeText(item)}</li>
                            ))}
                    </ul>
                )}
            </div>
        ),

        interests: (editMode || showInterests) && (
            <div key="interests" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ ...sectionTitleStyle, fontSize: "1.7rem", fontWeight: 700 }}>
                    Interests
                </h3>
                <hr style={sectionDivider} />

                {editMode ? (
                    <>
                        {safeArray(localData.interests).map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "0.5rem",
                                }}
                                className="hide-in-pdf"
                            >
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleSimpleListChange("interests", idx, e.target.value)}
                                    placeholder="New Interest"
                                    style={{
                                        flexGrow: 1,
                                        border: "none",
                                        borderBottom: "1px solid #d1d5db",
                                        background: "transparent",
                                        outline: "none",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow("interests", idx)}
                                    style={{
                                        marginLeft: "0.5rem",
                                        fontSize: "0.75rem",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.25rem",
                                        border: "1px solid #ef4444",
                                        color: "#ef4444",
                                        background: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                        <div style={{ marginTop: "0.5rem" }} className="hide-in-pdf">
                            <button
                                type="button"
                                onClick={() => handleAddRow("interests")}
                                style={{
                                    fontSize: "0.85rem",
                                    padding: "0.35rem 0.75rem",
                                    borderRadius: "0.375rem",
                                    border: "1px solid #3b82f6",
                                    color: "#3b82f6",
                                    background: "white",
                                    marginRight: "0.5rem",
                                    cursor: "pointer",
                                }}
                            >
                                + Add Interest
                            </button>
                            <button
                                type="button"
                                onClick={() => handleClearSection("interests")}
                                style={{
                                    fontSize: "0.85rem",
                                    padding: "0.35rem 0.75rem",
                                    borderRadius: "0.375rem",
                                    border: "1px solid #6b7280",
                                    color: "#6b7280",
                                    background: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Remove Interests Section
                            </button>
                        </div>
                    </>
                ) : (
                    <ul style={{ paddingLeft: "1.25rem", lineHeight: "1.6", margin: 0 }}>
                        {safeArray(viewData.interests)
                            .filter(hasText)
                            .map((item, i) => (
                                <li key={i}>{renderSafeText(item)}</li>
                            ))}
                    </ul>
                )}
            </div>
        ),
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
            <Navbar />
            <div style={{ display: "flex" }}>
                <Sidebar onEnhance={() => { }} resumeRef={resumeRef} />
                <div
                    style={{
                        flexGrow: 1,
                        padding: "2.5rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <div
                        ref={resumeRef}
                        style={{
                            backgroundColor: "#fdfcfb",
                            color: "#111827",
                            width: "210mm",
                            minHeight: "297mm",
                            padding: "2rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.75rem",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                            fontFamily: "Arial, sans-serif",
                            boxSizing: "border-box",
                        }}
                        data-resume-template="template17"
                    >
                        {/* ===== HEADER (cornered layout) ===== */}
                        <div style={{ marginBottom: "1.8rem" }}>
                            {/* Name + Role */}
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    {editMode ? (
                                        <>
                                            <input
                                                value={localData.name || ""}
                                                onChange={(e) => handleFieldChange("name", e.target.value)}
                                                placeholder="Your Name"
                                                style={{
                                                    fontSize: "3.2rem",
                                                    fontWeight: 700,
                                                    border: "none",
                                                    outline: "none",
                                                    background: "transparent",
                                                    color: "#4B5563",
                                                }}
                                                className="hide-in-pdf"
                                            />
                                            <input
                                                value={localData.role || ""}
                                                onChange={(e) => handleFieldChange("role", e.target.value)}
                                                placeholder="Your Role"
                                                style={{
                                                    fontSize: "1.3rem",
                                                    border: "none",
                                                    outline: "none",
                                                    background: "transparent",
                                                    color: "#3b82f6",
                                                    display: "block",
                                                    marginTop: "0.25rem",
                                                }}
                                                className="hide-in-pdf"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            {hasText(viewData.name) && (
                                                <div
                                                    style={{
                                                        fontSize: "3.2rem",
                                                        fontWeight: 700,
                                                        color: "#4B5563",
                                                    }}
                                                >
                                                    {renderSafeText(viewData.name)}
                                                </div>
                                            )}
                                            {hasText(viewData.role) && (
                                                <div
                                                    style={{
                                                        fontSize: "1.3rem",
                                                        color: "#3b82f6",
                                                    }}
                                                >
                                                    {renderSafeText(viewData.role)}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Contact Row - All 5 links functional */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                    rowGap: "0.5rem",
                                    columnGap: "2rem",
                                    marginTop: "1rem",
                                }}
                            >
                                {/* LEFT COLUMN */}
                                <div>
                                    {editMode ? (
                                        <>
                                            <input
                                                value={localData.location || ""}
                                                onChange={(e) => handleFieldChange("location", e.target.value)}
                                                placeholder="Location"
                                                style={contactInputStyle}
                                                className="hide-in-pdf"
                                            />
                                            <input
                                                value={localData.email || ""}
                                                onChange={(e) => handleFieldChange("email", e.target.value)}
                                                placeholder="Email"
                                                style={contactInputStyle}
                                                className="hide-in-pdf"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            {hasText(viewData.location) && (
                                                <div style={contactRowItemStyle}>
                                                    <MapPin size={14} style={{ marginRight: "4px" }} />
                                                    <span>{renderSafeText(viewData.location)}</span>
                                                </div>
                                            )}
                                            {hasText(viewData.email) && (
                                                <div style={contactRowItemStyle}>
                                                    <Mail size={14} style={{ marginRight: "4px" }} />
                                                    <a
                                                        href={getSafeUrl("email", viewData.email)}
                                                        style={{ color: "inherit", textDecoration: "none" }}
                                                    >
                                                        {renderSafeText(viewData.email)}
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* CENTER COLUMN */}
                                <div>
                                    {editMode ? (
                                        <>
                                            <input
                                                value={localData.phone || ""}
                                                onChange={(e) => handleFieldChange("phone", e.target.value)}
                                                placeholder="Phone"
                                                style={contactInputStyle}
                                                className="hide-in-pdf"
                                            />
                                            <input
                                                value={localData.linkedin || ""}
                                                onChange={(e) => handleFieldChange("linkedin", e.target.value)}
                                                placeholder="LinkedIn"
                                                style={contactInputStyle}
                                                className="hide-in-pdf"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            {hasText(viewData.phone) && (
                                                <div style={contactRowItemStyle}>
                                                    <Phone size={14} style={{ marginRight: "4px" }} />
                                                    <a
                                                        href={getSafeUrl("phone", viewData.phone)}
                                                        style={{ color: "inherit", textDecoration: "none" }}
                                                    >
                                                        {renderSafeText(viewData.phone)}
                                                    </a>
                                                </div>
                                            )}
                                            {hasText(viewData.linkedin) && (
                                                <div style={contactRowItemStyle}>
                                                    <Linkedin size={14} style={{ marginRight: "4px" }} />
                                                    <a
                                                        href={getSafeUrl("linkedin", viewData.linkedin)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: "inherit", textDecoration: "none" }}
                                                    >
                                                        LinkedIn
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* RIGHT COLUMN */}
                                <div>
                                    {editMode ? (
                                        <>
                                            <input
                                                value={localData.github || ""}
                                                onChange={(e) => handleFieldChange("github", e.target.value)}
                                                placeholder="GitHub"
                                                style={contactInputStyle}
                                                className="hide-in-pdf"
                                            />
                                            <input
                                                value={localData.portfolio || ""}
                                                onChange={(e) => handleFieldChange("portfolio", e.target.value)}
                                                placeholder="Portfolio"
                                                style={contactInputStyle}
                                                className="hide-in-pdf"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            {hasText(viewData.github) && (
                                                <div style={contactRowItemStyle}>
                                                    <Github size={14} style={{ marginRight: "4px" }} />
                                                    <a
                                                        href={getSafeUrl("github", viewData.github)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: "inherit", textDecoration: "none" }}
                                                    >
                                                        GitHub
                                                    </a>
                                                </div>
                                            )}
                                            {hasText(viewData.portfolio) && (
                                                <div style={contactRowItemStyle}>
                                                    <Globe size={14} style={{ marginRight: "4px" }} />
                                                    <a
                                                        href={getSafeUrl("portfolio", viewData.portfolio)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: "inherit", textDecoration: "none" }}
                                                    >
                                                        Portfolio
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* DYNAMIC SECTION RENDERING - Using sectionOrder */}
                        {(sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
                            "summary", "experience", "education", "projects",
                            "certifications", "achievements", "skills", "languages", "interests"
                        ]).map((sectionKey) => sectionComponents[sectionKey] || null)}
                    </div>

                    {/* Floating Edit/Save Controls */}
                    <div
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
                                    backgroundColor: "#3b82f6",
                                    color: "white",
                                    padding: "0.5rem 1.5rem",
                                    borderRadius: "0.375rem",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
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

export default Template17;