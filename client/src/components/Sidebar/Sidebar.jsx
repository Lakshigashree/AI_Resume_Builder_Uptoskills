/* src/components/Sidebar/Sidebar.jsx */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { 
  FaChevronLeft, FaChevronRight, FaMagic, 
  FaUserCircle, FaFileAlt, FaPaintBrush, 
  FaPlusCircle, FaCheckCircle, FaChartBar, FaTimes, FaSpinner 
} from "react-icons/fa";

// Import template preview images
import temp1 from "../../assets/images/temp1.png";
import temp2 from "../../assets/images/temp2.png";
import temp3 from "../../assets/images/Temp3.jpg";
import temp4 from "../../assets/images/temp4.png";
import temp5 from "../../assets/images/temp5.jpg";
import temp6 from "../../assets/images/temp6.png";
import temp7 from "../../assets/images/temp7.png";
import temp8 from "../../assets/images/temp8.jpg";
import temp9 from "../../assets/images/temp9.jpg";

const enhancementOptions = [
  "summary",
  "experience",
  "education",
  "skills",
  "achievements",
  "projects",
  "certifications",
  "languages",
  "interests",
];

const templates = [
  { id: 1, name: "Radiant Edge", preview: temp1 },
  { id: 2, name: "CodeCraft Classic", preview: temp2 },
  { id: 3, name: "TechSlate Pro", preview: temp3 },
  { id: 4, name: "Creative Spark", preview: temp4 },
  { id: 5, name: "Structured Precision", preview: temp5 },
  { id: 6, name: "Modern Momentum", preview: temp6 },
  { id: 7, name: "Creative Spectrum", preview: temp7 },
  { id: 8, name: "Executive Edge", preview: temp8 },
  { id: 9, name: "Tech Forward", preview: temp9 },
  { id: 10, name: "Classic Professional", preview: temp8 },
  { id: 11, name: "Professional Executive", preview: temp8 },
  { id: 12, name: "Strategic Technology Leader", preview: temp8 },
  { id: 13, name: "Clinical Practice Professional", preview: temp8 },
  { id: 14, name: "Laboratory Specialist", preview: temp6 },
  { id: 15, name: "Finance Analyst", preview: temp8 },
  { id: 16, name: "Fiscal Visionary", preview: temp8 },
  { id: 17, name: "Modern Web Developer", preview: temp8 },
  { id: 18, name: "Resume Preview", preview: temp8 },
  { id: 19, name: "Experience Highlight", preview: temp8 },
  { id: 20, name: "Professional Showcase", preview: temp8 },
  { id: 21, name: "Tech Innovator", preview: temp8 },
  { id: 22, name: "Career Catalyst", preview: temp8 },
  { id: 23, name: "Executive Profile", preview: temp8 },
  { id: 24, name: "Modern Professional", preview: temp8 },
  { id: 25, name: "Creative Professional", preview: temp8 },
  { id: 26, name: "Tech Specialist", preview: temp8 },
  { id: 27, name: "Design Visionary", preview: temp8 },
  { id: 28, name: "Code Architect", preview: temp8 },
  { id: 29, name: "UI Crafter", preview: temp8 },
  { id: 30, name: "Career Snapshot", preview: temp8 },
];

const Sidebar = ({ resumeRef }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resumeData, setResumeData } = useResume();
  const { isAuthenticated } = useAuth();
  
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(null); 
  const [currentTemplateId, setCurrentTemplateId] = useState(null);
  const [enhancingSection, setEnhancingSection] = useState(null);

  // Sync current template from URL/Context
  useEffect(() => {
    const path = location.pathname;
    const templateMatch = path.match(/\/template(\d+)/);
    const tId = templateMatch ? templateMatch[1] : (resumeData?.templateId || location.state?.templateId);
    if (tId) setCurrentTemplateId(parseInt(tId, 10));
  }, [location.pathname, resumeData]);

  const handleTabClick = (tab) => {
    if (tab === 'ATS Score') {
      navigate("/ats-score");
      setActiveTab(null);
    } else {
      setActiveTab(activeTab === tab ? null : tab);
      if (collapsed) setCollapsed(false);
    }
  };

  const handleTemplateSelect = (templateId) => {
    const dataToPass = { ...resumeData, templateId };
    if (setResumeData) setResumeData(dataToPass);
    try {
      localStorage.setItem('resumeData', JSON.stringify(dataToPass));
    } catch (e) { console.error('Storage failed', e); }
    navigate(`/template${templateId}`, { state: { buildType: 'template', resumeData: dataToPass, templateId } });
    toast.success(`Switched to Template ${templateId}`);
  };

  // --- FUNCTIONAL AI ENHANCE LOGIC ---
  const handleEnhanceSection = async (section) => {
    setEnhancingSection(section);
    try {
      let contentToSend = "";
      if (section === "summary") {
        contentToSend = resumeData.summary || "";
      } else if (section === "skills") {
        contentToSend = Array.isArray(resumeData.skills) ? resumeData.skills.join(", ") : (resumeData.skills || "");
      } else {
        // Fallback for sections like experience, education etc.
        const sectionData = resumeData[section];
        contentToSend = typeof sectionData === 'string' ? sectionData : JSON.stringify(sectionData || "");
      }

      if (!contentToSend || !contentToSend.trim() || contentToSend === '""') {
        toast.info(`Please add content to ${section} first.`);
        return;
      }

      // 1. Get the token from storage (standard for authenticated routes)
      const token = localStorage.getItem("token"); 

      // 2. Call the endpoint mounted in server.js
      const response = await fetch("http://localhost:5000/api/ai/enhance", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 3. Required for authenticateToken
        },
        body: JSON.stringify({ section, data: contentToSend }),
      });

      const result = await response.json();

      if (response.ok && result.enhanced) {
        const updated = { ...resumeData };
        
        // Handle specialized parsing for structured data sections if returned as JSON strings
        if (["education", "personal", "languages"].includes(section)) {
            try {
                updated[section] = typeof result.enhanced === 'string' ? JSON.parse(result.enhanced) : result.enhanced;
            } catch (e) {
                updated[section] = result.enhanced;
            }
        } else {
            updated[section] = result.enhanced;
        }

        setResumeData(updated);
        toast.success(`${section.toUpperCase()} Enhanced successfully!`);
      } else {
        toast.error(result.error || "Enhancement failed. Check if you are logged in.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not connect to AI service.");
    } finally {
      setEnhancingSection(null);
    }
  };

  const SidebarNavItem = ({ icon, label, color, tabKey }) => (
    <button
      onClick={() => handleTabClick(tabKey)}
      className={`w-full flex flex-col items-center justify-center gap-1 py-4 rounded-xl transition-all duration-200 ${
        activeTab === tabKey ? "bg-indigo-50 shadow-inner" : "hover:bg-gray-50"
      } ${collapsed ? "px-2" : "px-4"}`}
    >
      <span className={`text-xl ${color}`}>{icon}</span>
      {!collapsed && <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-500">{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen sticky top-0 bg-white">
      {/* PRIMARY ICON SIDEBAR */}
      <div className={`border-r border-gray-200 p-4 flex flex-col items-center gap-4 transition-all duration-300 ${collapsed ? "w-20" : "w-28"}`} style={{ position: "relative" }}>
        <button className="absolute -right-3 top-8 bg-white border border-gray-300 rounded-full p-1 shadow-md z-50 hover:bg-gray-100" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
        </button>
        <div className="mb-4"><FaUserCircle size={collapsed ? 32 : 44} className="text-indigo-600" /></div>
        <div className="flex flex-col gap-1 w-full">
          <SidebarNavItem icon={<FaFileAlt />} label="Templates" color="text-blue-500" tabKey="Templates" />
          <SidebarNavItem icon={<FaPaintBrush />} label="Design" color="text-pink-500" tabKey="Design" />
          <SidebarNavItem icon={<FaPlusCircle />} label="Sections" color="text-orange-500" tabKey="Sections" />
          <SidebarNavItem icon={<FaCheckCircle />} label="Spelling" color="text-green-500" tabKey="Spell Check" />
          <SidebarNavItem icon={<FaMagic />} label="AI Enhance" color="text-indigo-500" tabKey="AI" />
          <SidebarNavItem icon={<FaChartBar />} label="ATS Score" color="text-purple-600" tabKey="ATS Score" />
        </div>
      </div>

      {/* EXPANDABLE CONTENT DRAWER */}
      {activeTab && !collapsed && (
        <div className="w-80 bg-gray-50 border-r border-gray-200 shadow-xl z-40 animate-in slide-in-from-left duration-300">
          <div className="p-5 flex justify-between items-center border-b bg-white">
            <h3 className="font-bold text-gray-700 text-xs tracking-widest uppercase">{activeTab}</h3>
            <FaTimes className="text-gray-400 cursor-pointer hover:text-red-500 transition" onClick={() => setActiveTab(null)} />
          </div>

          <div className="p-4 overflow-y-auto h-[calc(100vh-70px)]">
            {/* TEMPLATES GALLERY */}
            {activeTab === 'Templates' && (
              <div className="grid grid-cols-2 gap-3 pb-10">
                {templates.map((temp) => (
                  <button 
                    key={temp.id} 
                    onClick={() => handleTemplateSelect(temp.id)} 
                    className={`group relative rounded-lg border-2 transition-all duration-200 overflow-hidden ${currentTemplateId === temp.id ? "border-purple-500 shadow-md bg-white" : "border-gray-200 hover:border-purple-300 bg-white"}`}
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img src={temp.preview} alt={temp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-2 text-[9px] font-bold truncate text-gray-600 bg-white border-t border-gray-100">#{temp.id} {temp.name}</div>
                    {currentTemplateId === temp.id && <div className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full border border-white animate-pulse"></div>}
                  </button>
                ))}
              </div>
            )}

            {/* AI DRAWER SECTION */}
            {activeTab === 'AI' && (
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Section to Enhance</p>
                <div className="flex flex-col gap-2">
                  {enhancementOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleEnhanceSection(option)}
                      disabled={enhancingSection === option}
                      className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 hover:shadow-sm transition-all group disabled:opacity-50"
                    >
                      <span className="text-xs font-semibold text-gray-700 capitalize">{option}</span>
                      {enhancingSection === option ? (
                        <FaSpinner className="animate-spin text-indigo-500" />
                      ) : (
                        <FaMagic className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Design' && <div className="text-center py-10 text-gray-400 text-xs italic">Design & Formatting controls...</div>}
            {activeTab === 'Sections' && <div className="text-center py-10 text-gray-400 text-xs italic">Add/Remove Sections logic...</div>}
            {activeTab === 'Spell Check' && <div className="text-center py-10 text-gray-400 text-xs italic">Spell check analysis logic...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;