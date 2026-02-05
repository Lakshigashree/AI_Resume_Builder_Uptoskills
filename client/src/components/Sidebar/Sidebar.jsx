import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import SectionInputModal from "./SectionInputModal";
import { 
  FaChevronLeft, FaChevronRight, FaMagic, 
  FaUserCircle, FaFileAlt, FaPaintBrush, 
  FaPlusCircle, FaCheckCircle, FaChartBar, FaTimes, 
  FaGraduationCap, FaBriefcase, FaUserEdit, FaUserTie, FaPlus, FaTrash
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
import temp9 from "../../assets/images/temp9.jpg";

const SECTION_DEFAULTS = {
  summary: "", experience: [], education: [], skills: [], projects: [], 
  achievements: [], certifications: [], languages: [], interests: [],
};

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

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resumeData, updateResumeData } = useResume();
  
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(null); 
  const [currentTemplateId, setCurrentTemplateId] = useState(null);
  const [modalConfig, setModalConfig] = useState({ show: false, section: null });

  useEffect(() => {
    const path = location.pathname;
    const templateMatch = path.match(/\/template(\d+)/);
    const tId = templateMatch ? templateMatch[1] : (resumeData?.templateId);
    if (tId) setCurrentTemplateId(parseInt(tId, 10));
  }, [location.pathname, resumeData]);

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

  // SAFE REMOVE LOGIC: Set to empty valid type to prevent Template crashes
  const handleRemoveSection = (section) => {
    const currentData = resumeData[section];
    const updated = { ...resumeData };
    
    updated.hiddenData = {
      ...(resumeData.hiddenData || {}),
      [section]: currentData
    };

    // Instead of deleting the key (which triggers template fallbacks), set to empty array/string
    updated[section] = Array.isArray(SECTION_DEFAULTS[section]) ? [] : "";
    
    updateResumeData(updated);
    toast.warn(`${section} section hidden.`);
  };

  const handleRoleChange = (role) => {
    updateResumeData({ ...resumeData, resumeMode: role });
    toast.info(`Profile mode set to: ${role.toUpperCase()}`);
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
      <div className={`border-r border-gray-200 p-4 flex flex-col items-center gap-3 transition-all duration-300 ${collapsed ? "w-20" : "w-28"}`} style={{ position: "relative" }}>
        <button className="absolute -right-3 top-8 bg-white border border-gray-300 rounded-full p-1 z-50 shadow-md hover:bg-gray-100" onClick={() => setCollapsed(!collapsed)}>
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
            <FaTimes className="text-gray-400 cursor-pointer hover:text-red-500 transition" onClick={() => setActiveTab(null)} />
          </div>

          <div className="p-4 overflow-y-auto h-[calc(100vh-70px)] no-scrollbar">
            {activeTab === 'Role Selector' && (
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Experience Level</p>
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
                            className={`p-2 rounded-md transition-colors ${isActive ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                            disabled={isActive}
                          >
                            <FaPlus size={12} />
                          </button>
                          {isActive && (
                            <button onClick={() => handleRemoveSection(section)} className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
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
              <div className="grid grid-cols-2 gap-3 pb-10">
                {templates.map((temp) => (
                  <button key={temp.id} onClick={() => navigate(`/template${temp.id}`)} className={`group relative rounded-lg border-2 transition-all ${currentTemplateId === temp.id ? "border-purple-500 shadow-md" : "border-gray-200"}`}>
                    <img src={temp.preview} alt={temp.name} className="w-full aspect-[3/4] object-cover" />
                    <div className="p-2 text-[9px] font-bold text-gray-600 truncate bg-white">#{temp.id} {temp.name}</div>
                  </button>
                ))}
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
  );
};

export default Sidebar;