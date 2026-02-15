/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import SectionInputModal from "./SectionInputModal";
import html2pdf from "html2pdf.js";
import { 
  FaChevronLeft, FaChevronRight, FaMagic, 
  FaUserCircle, FaFileAlt, FaPaintBrush, 
  FaPlusCircle, FaCheckCircle, FaChartBar, FaTimes, 
  FaGraduationCap, FaBriefcase, FaUserEdit, FaUserTie, FaPlus, FaTrash,
  FaDownload, FaShareAlt, FaArrowUp, FaArrowDown, FaSpinner, FaEye
} from "react-icons/fa";

// Image imports
import temp1 from "../../assets/images/temp1.png";
import temp2 from "../../assets/images/temp2.png";
import temp3 from "../../assets/images/Temp3.jpg";
import temp4 from "../../assets/images/temp4.png";
import temp5 from "../../assets/images/temp5.jpg";
import temp6 from "../../assets/images/temp6.png";
import temp7 from "../../assets/images/temp7.png";
import temp8 from "../../assets/images/temp8.jpg";
import temp9 from "../../assets/images/temp8.jpg";
import temp10 from "../../assets/images/temp8.jpg";
import temp11 from "../../assets/images/temp7.png";
import temp12 from "../../assets/images/temp7.png";
import temp13 from "../../assets/images/temp8.jpg";
import temp14 from "../../assets/images/temp6.png";
import temp15 from "../../assets/images/temp4.png";
import temp16 from "../../assets/images/temp1.png";
import temp17 from "../../assets/images/temp2.png";
import temp18 from "../../assets/images/temp1.png";
import temp19 from "../../assets/images/temp8.jpg";
import temp20 from "../../assets/images/temp4.png";
import temp21 from "../../assets/images/temp5.jpg";
import temp22 from "../../assets/images/temp8.jpg";
import temp23 from "../../assets/images/temp5.jpg";
import temp24 from "../../assets/images/temp1.png";
import temp25 from "../../assets/images/temp2.png";
import temp26 from "../../assets/images/temp4.png";
import temp27 from "../../assets/images/temp8.jpg";
import temp28 from "../../assets/images/temp1.png";
import temp29 from "../../assets/images/temp2.png";
import temp30 from "../../assets/images/temp8.jpg";

// Fallback images in case specific ones don't exist
const fallbackImages = {
  classic: temp8,
  modern: temp6,
  creative: temp7,
  professional: temp8,
  executive: temp8,
  tech: temp3
};

const SECTION_DEFAULTS = {
  summary: "", experience: [], education: [], skills: [], projects: [], 
  achievements: [], certifications: [], languages: [], interests: [],
};

// Organized templates by category for better UX
const templates = [
  // Category 1: Classic & Professional (1-10)
  { id: 1, name: "Radiant Edge", preview: temp1, category: "classic" },
  { id: 2, name: "CodeCraft Classic", preview: temp2, category: "classic" },
  { id: 3, name: "TechSlate Pro", preview: temp3, category: "tech" },
  { id: 4, name: "Creative Spark", preview: temp4, category: "creative" },
  { id: 5, name: "Structured Precision", preview: temp5, category: "professional" },
  { id: 6, name: "Modern Momentum", preview: temp6, category: "modern" },
  { id: 7, name: "Creative Spectrum", preview: temp7, category: "creative" },
  { id: 8, name: "Executive Edge", preview: temp8, category: "executive" },
  { id: 9, name: "Tech Forward", preview: temp9, category: "tech" },
  { id: 10, name: "Classic Professional", preview: temp10 || fallbackImages.classic, category: "classic" },
  
  // Category 2: Executive & Leadership (11-15)
  { id: 11, name: "Professional Executive", preview: temp11 || fallbackImages.executive, category: "executive" },
  { id: 12, name: "Strategic Technology Leader", preview: temp12 || fallbackImages.executive, category: "executive" },
  { id: 13, name: "Clinical Practice Professional", preview: temp13 || fallbackImages.professional, category: "professional" },
  { id: 14, name: "Laboratory Specialist", preview: temp14 || fallbackImages.modern, category: "professional" },
  { id: 15, name: "Finance Analyst", preview: temp15 || fallbackImages.professional, category: "professional" },
  
  // Category 3: Finance & Business (16-20)
  { id: 16, name: "Fiscal Visionary", preview: temp16 || fallbackImages.professional, category: "business" },
  { id: 17, name: "Modern Web Developer", preview: temp17 || fallbackImages.tech, category: "tech" },
  { id: 18, name: "Resume Preview", preview: temp18 || fallbackImages.modern, category: "modern" },
  { id: 19, name: "Experience Highlight", preview: temp19 || fallbackImages.modern, category: "modern" },
  { id: 20, name: "Professional Showcase", preview: temp20 || fallbackImages.professional, category: "professional" },
  
  // Category 4: Tech & Innovation (21-25)
  { id: 21, name: "Tech Innovator", preview: temp21 || fallbackImages.tech, category: "tech" },
  { id: 22, name: "Career Catalyst", preview: temp22 || fallbackImages.modern, category: "modern" },
  { id: 23, name: "Executive Profile", preview: temp23 || fallbackImages.executive, category: "executive" },
  { id: 24, name: "Modern Professional", preview: temp24 || fallbackImages.modern, category: "modern" },
  { id: 25, name: "Creative Professional", preview: temp25 || fallbackImages.creative, category: "creative" },
  
  // Category 5: Design & Development (26-30)
  { id: 26, name: "Tech Specialist", preview: temp26 || fallbackImages.tech, category: "tech" },
  { id: 27, name: "Design Visionary", preview: temp27 || fallbackImages.creative, category: "creative" },
  { id: 28, name: "Code Architect", preview: temp28 || fallbackImages.tech, category: "tech" },
  { id: 29, name: "UI Crafter", preview: temp29 || fallbackImages.creative, category: "creative" },
  { id: 30, name: "Career Snapshot", preview: temp30 || fallbackImages.modern, category: "modern" },
];

// Get unique categories for filtering
const categories = [...new Set(templates.map(t => t.category))];

/**
 * Enhanced PDF download handler with intelligent 1-page fitting
 * @param {React.RefObject} resumeRef - The ref attached to the resume paper container
 * @param {string} name - User name for the filename
 * @param {Object} options - Additional options
 */
export const handleGlobalDownload = async (
  resumeRef, 
  name = "Resume", 
  options = {},
  onProgress = null
) => {
  const element = resumeRef.current;
  
  if (!element) {
    toast.error("❌ Resume content not found! Please try refreshing.");
    return;
  }

  // Prevent multiple simultaneous downloads
  if (element.getAttribute('data-downloading') === 'true') {
    toast.warn("⏳ Download already in progress...");
    return;
  }

  // Set downloading flag
  element.setAttribute('data-downloading', 'true');

  const pdfOptions = {
    margin: options.margin || 0,
    filename: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
    image: { type: options.imageType || "jpeg", quality: options.quality || 1 },
    html2canvas: {
      scale: options.scale || 2,
      useCORS: true,
      letterRendering: true,
      ignoreElements: (element) => 
        element.getAttribute('data-html2canvas-ignore') === 'true',
    },
    jsPDF: {
      unit: "mm",
      format: options.pageSize || "a4",
      orientation: options.orientation || "portrait",
      compress: true
    },
    pagebreak: { mode: ['css', 'legacy'] } // Allow natural page breaks
  };

  const progressToast = toast.info("📄 Generating PDF...", {
    autoClose: false,
    closeOnClick: false,
  });

  try {
    if (onProgress) onProgress(30);
    
    const pdf = await html2pdf()
      .from(element)
      .set(pdfOptions)
      .toPdf()
      .get('pdf');

    if (onProgress) onProgress(80);
    
    await pdf.save();

    if (onProgress) onProgress(100);
    toast.update(progressToast, {
      render: "✅ Download complete!",
      type: "success",
      autoClose: 3000,
    });

  } catch (err) {
    console.error("❌ PDF Generation Error:", err);
    toast.update(progressToast, {
      render: "❌ Download failed. Please try again.",
      type: "error",
      autoClose: 5000,
    });
  } finally {
    element.removeAttribute('data-downloading');
  }
};

/**
 * Preview PDF in new tab
 * @param {React.RefObject} resumeRef - The ref attached to the resume paper container
 */
const handlePreviewPDF = async (resumeRef) => {
  const element = resumeRef.current;
  
  if (!element) {
    toast.error("Resume content not found!");
    return;
  }

  const options = {
    margin: 0,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  try {
    toast.info("Generating preview...");
    const pdf = await html2pdf().from(element).set(options).toPdf().get('pdf');
    const blob = pdf.output('blob');
    window.open(URL.createObjectURL(blob), '_blank');
    toast.success("Preview opened in new tab!");
  } catch (err) {
    console.error("Preview Error:", err);
    toast.error("Failed to generate preview");
  }
};

const Sidebar = ({ resumeRef }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resumeData, updateResumeData, sectionOrder, setSectionOrder } = useResume();
  
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(null); 
  const [currentTemplateId, setCurrentTemplateId] = useState(null);
  const [modalConfig, setModalConfig] = useState({ show: false, section: null });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const circleButtonStyle = {
    background: "linear-gradient(90deg, #008a91 0%, #5d8233 50%, #b35100 100%)",
    border: "none",
    color: "white",
    cursor: "pointer",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    transition: "transform 0.2s ease"
  };

  useEffect(() => {
    const path = location.pathname;
    const templateMatch = path.match(/\/template(\d+)/);
    const tId = templateMatch ? templateMatch[1] : (resumeData?.templateId);
    if (tId) setCurrentTemplateId(parseInt(tId, 10));
  }, [location.pathname, resumeData]);

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    await handleGlobalDownload(
      resumeRef, 
      resumeData?.personalInfo?.fullName || resumeData?.name || 'Resume',
      {
        quality: 0.98,
        margin: 5,
        scale: 2
      }
    );
    setIsDownloading(false);
  };

  const handlePreviewClick = async () => {
    if (isPreviewing) return;
    setIsPreviewing(true);
    await handlePreviewPDF(resumeRef);
    setIsPreviewing(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Professional Resume',
        url: window.location.href,
      }).then(() => toast.success("Shared successfully!"))
        .catch(() => toast.error("Error sharing"));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info("Link copied to clipboard!");
    }
  };

  const handleTabClick = (tab) => {
    if (tab === 'ATS Score') navigate("/ats-score");
    else setActiveTab(activeTab === tab ? null : tab);
  };

  const handleAddSection = (section) => {
    const backup = resumeData.hiddenData?.[section];
    if (backup && (Array.isArray(backup) ? backup.length > 0 : (typeof backup === 'string' && backup.trim() !== ""))) {
      const updated = { ...resumeData, [section]: backup };
      if (updated.hiddenData) {
        const newHidden = { ...updated.hiddenData };
        delete newHidden[section];
        updated.hiddenData = newHidden;
      }
      updateResumeData(updated);
      toast.success(`${section} section restored!`);
      return;
    }
    setModalConfig({ show: true, section });
  };

  const handleSaveModalData = (section, data) => {
    const updated = { ...resumeData };
    if (Array.isArray(SECTION_DEFAULTS[section])) {
      updated[section] = [...(resumeData[section] || []), data];
    } else {
      updated[section] = data;
    }
    updateResumeData(updated); 
    setModalConfig({ show: false, section: null });
  };

  const handleRemoveSection = (section) => {
    const currentData = resumeData[section];
    const updated = { ...resumeData };
    updated.hiddenData = { ...(resumeData.hiddenData || {}), [section]: currentData };
    updated[section] = Array.isArray(SECTION_DEFAULTS[section]) ? [] : "";
    updateResumeData(updated);
    toast.warn(`${section} section hidden.`);
  };

  const handleRoleChange = (role) => {
    updateResumeData({ ...resumeData, resumeMode: role });
    toast.info(`Profile mode set to: ${role.toUpperCase()}`);
  };

  // Move Section Logic for Custom Mode
  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    // Swap elements
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSectionOrder(newOrder);
    toast.success("Section order updated!");
  };

  const SidebarNavItem = ({ icon, label, color, tabKey }) => (
    <button
      onClick={() => handleTabClick(tabKey)}
      className={`w-full flex flex-col items-center justify-center gap-1 py-4 rounded-xl transition-all duration-200 ${
        activeTab === tabKey ? "bg-indigo-50 shadow-inner" : "hover:bg-gray-50"
      } ${collapsed ? "px-2" : "px-4"}`}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
    >
      <span className={`text-xl ${color}`}>{icon}</span>
      {!collapsed && <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-500">{label}</span>}
    </button>
  );

  // Filter templates based on selected category
  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <>
      <div className="flex h-screen sticky top-0 bg-white" data-html2canvas-ignore="true">
        <div className={`border-r border-gray-200 p-4 flex flex-col items-center gap-3 transition-all duration-300 ${collapsed ? "w-20" : "w-28"}`} style={{ position: "relative" }}>
          <button 
            className="absolute -right-3 top-8 bg-white border border-gray-300 rounded-full p-1 z-50 shadow-md hover:bg-gray-100" 
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
          </button>
          <div className="mb-2"><FaUserCircle size={collapsed ? 32 : 44} className="text-indigo-600" /></div>
          
          <div className="flex flex-col gap-1 w-full overflow-y-auto no-scrollbar">
            <SidebarNavItem icon={<FaFileAlt />} label="Templates" color="text-blue-500" tabKey="Templates" />
            <SidebarNavItem icon={<FaUserTie />} label="Roles" color="text-cyan-600" tabKey="Role Selector" />
            <SidebarNavItem icon={<FaPaintBrush />} label="Design" color="text-pink-500" tabKey="Design" />
            <SidebarNavItem icon={<FaPlusCircle />} label="Sections" color="text-orange-500" tabKey="Sections" />
            <SidebarNavItem icon={<FaCheckCircle />} label="Spelling" color="text-green-500" tabKey="Spell Check" />
            <SidebarNavItem icon={<FaMagic />} label="AI Enhance" color="text-indigo-500" tabKey="AI" />
            <SidebarNavItem icon={<FaChartBar />} label="ATS Score" color="text-purple-600" tabKey="ATS Score" />
          </div>
        </div>

        {activeTab && !collapsed && (
          <div className="w-80 bg-gray-50 border-r border-gray-200 shadow-xl z-40 animate-in slide-in-from-left duration-300">
            <div className="p-5 flex justify-between items-center border-b bg-white">
              <h3 className="font-bold text-gray-700 text-xs tracking-widest uppercase">{activeTab}</h3>
              <FaTimes 
                className="text-gray-400 cursor-pointer hover:text-red-500 transition" 
                onClick={() => setActiveTab(null)}
                aria-label="Close panel"
              />
            </div>

            <div className="p-4 overflow-y-auto h-[calc(100vh-70px)] no-scrollbar">
              {activeTab === 'Role Selector' && (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Select Experience Level</p>
                    <div className="flex flex-col gap-3">
                      {[
                        { id: 'fresher', label: 'Fresher', icon: <FaGraduationCap />, desc: 'Prioritizes Education & Projects' },
                        { id: 'experienced', label: 'Experienced', icon: <FaBriefcase />, desc: 'Prioritizes Work History' },
                        { id: 'custom', label: 'Custom', icon: <FaUserEdit />, desc: 'Manual section arrangement' }
                      ].map((role) => (
                        <button
                          key={role.id}
                          onClick={() => handleRoleChange(role.id)}
                          className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                            resumeData?.resumeMode === role.id 
                            ? "border-indigo-600 bg-indigo-50 shadow-sm" 
                            : "border-white bg-white hover:border-indigo-200 shadow-sm"
                          }`}
                          aria-label={`Select ${role.label} mode`}
                        >
                          <div className={`p-3 rounded-lg ${resumeData?.resumeMode === role.id ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"}`}>
                            {role.icon}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm text-gray-800">{role.label}</p>
                            <p className="text-[10px] text-gray-500 leading-tight mt-1">{role.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MANUAL REARRANGE UI - Only visible in Custom mode */}
                  {resumeData?.resumeMode === 'custom' && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-t pt-4">Rearrange Sections</p>
                      <div className="flex flex-col gap-2">
                        {sectionOrder.map((section, index) => (
                          <div key={section} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <span className="text-xs font-bold text-gray-700 capitalize">{section}</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => moveSection(index, 'up')}
                                disabled={index === 0}
                                className={`p-1.5 rounded hover:bg-gray-100 ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600'}`}
                                aria-label="Move section up"
                              >
                                <FaArrowUp size={12} />
                              </button>
                              <button 
                                onClick={() => moveSection(index, 'down')}
                                disabled={index === sectionOrder.length - 1}
                                className={`p-1.5 rounded hover:bg-gray-100 ${index === sectionOrder.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600'}`}
                                aria-label="Move section down"
                              >
                                <FaArrowDown size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Sections' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    {Object.keys(SECTION_DEFAULTS).map((section) => {
                      const data = resumeData[section];
                      const isActive = Array.isArray(data) ? data.length > 0 : (!!data && data.trim() !== "");
                      
                      return (
                        <div key={section} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-200 transition-colors">
                          <span className="text-xs font-bold text-gray-700 capitalize">{section}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleAddSection(section)} 
                              className={`p-2 rounded-md transition-colors ${
                                isActive 
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                              disabled={isActive}
                              aria-label={`Add ${section}`}
                            >
                              <FaPlus size={12} />
                            </button>
                            {isActive && (
                              <button 
                                onClick={() => handleRemoveSection(section)} 
                                className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                                aria-label={`Remove ${section}`}
                              >
                                <FaTrash size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'Templates' && (
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-1 pb-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-2 py-1 text-[10px] font-bold rounded ${
                        selectedCategory === "all" 
                          ? "bg-indigo-600 text-white" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      ALL
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2 py-1 text-[10px] font-bold rounded ${
                          selectedCategory === cat 
                            ? "bg-indigo-600 text-white" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Templates Grid */}
                  <div className="grid grid-cols-2 gap-3 pb-10">
                    {filteredTemplates.map((temp) => (
                      <button 
                        key={temp.id} 
                        onClick={() => navigate(`/template${temp.id}`)} 
                        className={`group relative rounded-lg border-2 transition-all ${
                          currentTemplateId === temp.id ? "border-purple-500 shadow-md" : "border-gray-200 hover:border-purple-300"
                        }`}
                        aria-label={`Select template ${temp.name}`}
                      >
                        <img 
                          src={temp.preview} 
                          alt={temp.name} 
                          className="w-full aspect-[3/4] object-cover rounded-t-lg"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.target.src = temp8; // Use temp8 as fallback
                          }}
                        />
                        <div className="p-2 text-[9px] font-bold text-gray-600 truncate bg-white rounded-b-lg">
                          #{temp.id} {temp.name}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Template Count */}
                  <div className="text-[10px] text-gray-400 text-center pb-2">
                    Showing {filteredTemplates.length} of {templates.length} templates
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {modalConfig.show && (
          <SectionInputModal 
            section={modalConfig.section} 
            onClose={() => setModalConfig({ show: false, section: null })}
            onSave={handleSaveModalData}
          />
        )}
      </div>

      <div 
        style={{ 
          position: "fixed", 
          right: "30px", 
          bottom: "40px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "15px", 
          zIndex: 9999 
        }}
        data-html2canvas-ignore="true"
      >
        <button 
          onClick={handlePreviewClick}
          style={circleButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.filter = "brightness(0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.filter = "brightness(1)";
          }}
          title="Preview Resume"
          disabled={isPreviewing}
          aria-label="Preview Resume"
        >
          {isPreviewing ? <FaSpinner className="animate-spin" size={20} /> : <FaEye size={20} />}
        </button>
        <button 
          onClick={handleDownloadPDF}
          style={circleButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.filter = "brightness(0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.filter = "brightness(1)";
          }}
          title="Download PDF"
          disabled={isDownloading}
          aria-label="Download PDF"
        >
          {isDownloading ? <FaSpinner className="animate-spin" size={20} /> : <FaDownload size={20} />}
        </button>
        <button 
          onClick={handleShare} 
          style={circleButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.filter = "brightness(0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.filter = "brightness(1)";
          }}
          title="Share Link"
          aria-label="Share Resume"
        >
          <FaShareAlt size={20} />
        </button>
      </div>
    </>
  );
};

export default Sidebar;