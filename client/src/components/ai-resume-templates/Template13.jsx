import React, { 
  useState, 
  useRef, 
  useEffect 
} from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Briefcase,
  GraduationCap,
  User,
  Award,
  Globe,
  Calendar,
  Code,
  BookOpen,
  Heart,
  Scroll,
  Plus,
  Trash2,
  ExternalLink
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";

const Template13 = () => {
  const resumeRef = useRef(null);
  const { 
    resumeData, 
    updateResumeData, 
    sectionOrder 
  } = useResume();
  
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData || {});

  const [templateSettings, setTemplateSettings] = useState({
    fontFamily: "'Inter', sans-serif",
    primaryColor: "#1e40af",
    secondaryColor: "#64748b",
    accentColor: "#f59e0b",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  });

  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  /**
   * ChipInput Component
   * Handles Skills, Languages, and Interests
   */
  const ChipInput = ({ 
    chips = [], 
    onChange, 
    placeholder = "Add item" 
  }) => {
    const inputRef = useRef(null);
    
    useEffect(() => { 
      if (!Array.isArray(chips)) { 
        onChange([]); 
      } 
    }, []);

    const addChip = (value) => {
      const v = String(value || "").trim();
      if (!v) return;
      const exists = chips.some((c) => c.toLowerCase() === v.toLowerCase());
      if (exists) return;
      onChange([...chips, v]);
    };

    const removeChip = (index) => {
      const newChips = [...chips];
      newChips.splice(index, 1);
      onChange(newChips);
    };

    return (
      <div className="flex flex-wrap gap-2 items-center">
        {chips.map((chip, idx) => (
          <span 
            key={idx} 
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
          >
            <span className="text-sm font-medium">{chip}</span>
            <button 
              type="button" 
              onClick={() => removeChip(idx)} 
              className="text-red-500 font-bold ml-1"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 min-w-[140px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addChip(e.target.value);
              e.target.value = "";
            } else if (e.key === "Backspace" && !e.target.value && chips.length) {
              removeChip(chips.length - 1);
            }
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    if (resumeData) {
      setLocalData({
        ...resumeData,
        projects: resumeData.projects || [],
        certifications: resumeData.certifications || [],
        achievements: resumeData.achievements || [],
        courses: resumeData.courses || [],
        interests: resumeData.interests || [],
        skills: resumeData.skills || [],
        languages: resumeData.languages || [],
        experience: resumeData.experience || [],
        education: resumeData.education || [],
      });
    }
  }, [resumeData]);

  const handleFieldChange = (field, value) => {
    setLocalData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const handleNestedChange = (arrayKey, index, field, value) => {
    setLocalData(prev => ({
      ...prev,
      [arrayKey]: prev[arrayKey].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddItem = (section, template) => {
    setLocalData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), template],
    }));
  };

  const handleRemoveItem = (section, index) => {
    setLocalData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    updateResumeData(localData);
    setEditMode(false);
    toast.success("Resume saved successfully!");
  };

  const handleCancel = () => {
    setLocalData(resumeData);
    setEditMode(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result);
        setTemplateSettings((prev) => ({ 
          ...prev, 
          photo: reader.result 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    const element = resumeRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true 
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ 
        orientation: "portrait", 
        unit: "mm", 
        format: "a4" 
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${localData.name || "Resume"}.pdf`);
    } catch (error) { 
      console.error("PDF Error", error); 
    }
  };

  const SectionHeading = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-3 mb-6 mt-4 first:mt-0">
      <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-blue-600" />}
        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
          {title}
        </h2>
      </div>
    </div>
  );

  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case "summary":
        return (editMode || localData.summary) && (
          <div key="summary" className="mb-8">
            <SectionHeading title="Professional Summary" icon={User} />
            {editMode ? (
              <textarea 
                value={localData.summary} 
                onChange={(e) => handleFieldChange("summary", e.target.value)} 
                className="w-full text-gray-700 leading-relaxed p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                rows={4} 
              />
            ) : (
              <p className="text-gray-700 leading-relaxed text-lg">
                {localData.summary}
              </p>
            )}
          </div>
        );

      case "experience":
        return (editMode || localData.experience?.length > 0) && (
          <div key="experience" className="mb-8">
            <SectionHeading title="Experience" icon={Briefcase} />
            <div className="space-y-6">
              {localData.experience?.map((exp, i) => (
                <div 
                  key={i} 
                  className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-600 relative"
                >
                  {editMode && (
                    <button 
                      onClick={() => handleRemoveItem("experience", i)} 
                      className="absolute top-2 right-2 text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {editMode ? (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={exp.title} 
                        onChange={(e) => handleNestedChange("experience", i, "title", e.target.value)} 
                        className="w-full font-bold p-2 border rounded" 
                        placeholder="Job Title" 
                      />
                      <input 
                        type="text" 
                        value={exp.companyName} 
                        onChange={(e) => handleNestedChange("experience", i, "companyName", e.target.value)} 
                        className="w-full p-2 border rounded" 
                        placeholder="Company" 
                      />
                      <input 
                        type="text" 
                        value={exp.date} 
                        onChange={(e) => handleNestedChange("experience", i, "date", e.target.value)} 
                        className="w-full p-2 border rounded" 
                        placeholder="Date Range" 
                      />
                      <textarea 
                        value={exp.accomplishment} 
                        onChange={(e) => handleNestedChange("experience", i, "accomplishment", [e.target.value])} 
                        className="w-full p-2 border rounded" 
                        rows={3} 
                        placeholder="Description" 
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-800">
                        {exp.title}
                      </h3>
                      <div className="flex items-center gap-4 text-blue-600 font-semibold mb-2">
                        <span>{exp.companyName}</span>
                        <span className="text-gray-400 font-normal">|</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={14} />
                          {exp.date}
                        </span>
                      </div>
                      <p className="text-gray-700">
                        {Array.isArray(exp.accomplishment) ? exp.accomplishment[0] : exp.accomplishment}
                      </p>
                    </>
                  )}
                </div>
              ))}
              {editMode && (
                <button 
                  onClick={() => handleAddItem("experience", { title: "", companyName: "", date: "", accomplishment: [""] })} 
                  className="text-blue-600 font-bold flex items-center gap-1"
                >
                  <Plus size={18}/> Add Experience
                </button>
              )}
            </div>
          </div>
        );

      case "projects":
        return (editMode || localData.projects?.length > 0) && (
          <div key="projects" className="mb-8">
            <SectionHeading title="Projects" icon={Code} />
            <div className="grid grid-cols-1 gap-6">
              {localData.projects?.map((proj, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative"
                >
                  {editMode && (
                    <button 
                      onClick={() => handleRemoveItem("projects", i)} 
                      className="absolute top-2 right-2 text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {editMode ? (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={proj.name} 
                        onChange={(e) => handleNestedChange("projects", i, "name", e.target.value)} 
                        className="w-full font-bold p-2 border rounded" 
                        placeholder="Project Name" 
                      />
                      <input 
                        type="text" 
                        value={proj.link} 
                        onChange={(e) => handleNestedChange("projects", i, "link", e.target.value)} 
                        className="w-full p-2 border rounded" 
                        placeholder="Project Link" 
                      />
                      <textarea 
                        value={proj.description} 
                        onChange={(e) => handleNestedChange("projects", i, "description", e.target.value)} 
                        className="w-full p-2 border rounded" 
                        rows={3} 
                        placeholder="Description" 
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {proj.name}
                        </h3>
                        {proj.link && (
                          <a 
                            href={proj.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-blue-600 flex items-center gap-1 text-sm"
                          >
                            <ExternalLink size={14} /> View
                          </a>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {proj.description}
                      </p>
                    </>
                  )}
                </div>
              ))}
              {editMode && (
                <button 
                  onClick={() => handleAddItem("projects", { name: "", link: "", description: "" })} 
                  className="text-blue-600 font-bold flex items-center gap-1"
                >
                  <Plus size={18}/> Add Project
                </button>
              )}
            </div>
          </div>
        );

      case "education":
        return (editMode || localData.education?.length > 0) && (
          <div key="education" className="mb-8">
            <SectionHeading title="Education" icon={GraduationCap} />
            <div className="space-y-4">
              {localData.education?.map((edu, i) => (
                <div key={i} className="bg-blue-50/50 rounded-xl p-4 relative">
                  {editMode && (
                    <button 
                      onClick={() => handleRemoveItem("education", i)} 
                      className="absolute top-2 right-2 text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {editMode ? (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={edu.degree} 
                        onChange={(e) => handleNestedChange("education", i, "degree", e.target.value)} 
                        className="w-full font-bold p-1 border rounded" 
                      />
                      <input 
                        type="text" 
                        value={edu.institution} 
                        onChange={(e) => handleNestedChange("education", i, "institution", e.target.value)} 
                        className="w-full p-1 border rounded" 
                      />
                      <input 
                        type="text" 
                        value={edu.duration} 
                        onChange={(e) => handleNestedChange("education", i, "duration", e.target.value)} 
                        className="w-full p-1 border rounded" 
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-gray-800">
                        {edu.degree}
                      </h3>
                      <p className="text-blue-700 font-medium">
                        {edu.institution}
                      </p>
                      <p className="text-sm text-gray-500">
                        {edu.duration}
                      </p>
                    </>
                  )}
                </div>
              ))}
              {editMode && (
                <button 
                  onClick={() => handleAddItem("education", { degree: "", institution: "", duration: "" })} 
                  className="text-blue-600 font-bold flex items-center gap-1 text-sm"
                >
                  <Plus size={14}/> Add Education
                </button>
              )}
            </div>
          </div>
        );

      case "skills":
        return (editMode || localData.skills?.length > 0) && (
          <div key="skills" className="mb-8">
            <SectionHeading title="Skills" icon={Award} />
            {editMode ? (
              <ChipInput 
                chips={localData.skills} 
                onChange={(newChips) => handleFieldChange("skills", newChips)} 
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {localData.skills?.map((skill, i) => (
                  <span 
                    key={i} 
                    className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case "certifications":
        return (editMode || localData.certifications?.length > 0) && (
          <div key="certifications" className="mb-8">
            <SectionHeading title="Certifications" icon={Scroll} />
            <div className="space-y-3">
              {localData.certifications?.map((cert, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  {editMode && (
                    <button 
                      onClick={() => handleRemoveItem("certifications", i)} 
                      className="text-red-500 mt-1"
                    >
                      <Trash2 size={14}/>
                    </button>
                  )}
                  <div>
                    {editMode ? (
                      <input 
                        value={cert.title} 
                        onChange={(e) => handleNestedChange("certifications", i, "title", e.target.value)} 
                        className="font-bold border-b border-gray-300 outline-none" 
                      />
                    ) : (
                      <p className="font-bold text-gray-800">
                        {cert.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {cert.issuer} • {cert.date}
                    </p>
                  </div>
                </div>
              ))}
              {editMode && (
                <button 
                  onClick={() => handleAddItem("certifications", { title: "", issuer: "", date: "" })} 
                  className="text-blue-600 font-bold text-xs"
                >
                  + Add Cert
                </button>
              )}
            </div>
          </div>
        );

      case "achievements":
        return (editMode || localData.achievements?.length > 0) && (
          <div key="achievements" className="mb-8">
            <SectionHeading title="Achievements" icon={Award} />
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {localData.achievements?.map((ach, i) => (
                <li key={i} className="relative group">
                  {editMode ? (
                    <input 
                      value={typeof ach === 'string' ? ach : ach.title} 
                      onChange={(e) => {
                        const newAch = [...localData.achievements];
                        newAch[i] = e.target.value;
                        handleFieldChange("achievements", newAch);
                      }} 
                      className="w-11/12 border-b border-gray-300 outline-none" 
                    />
                  ) : (
                    <span>{typeof ach === 'string' ? ach : ach.title}</span>
                  )}
                  {editMode && (
                    <button 
                      onClick={() => handleRemoveItem("achievements", i)} 
                      className="text-red-500 ml-2"
                    >
                      <Trash2 size={12}/>
                    </button>
                  )}
                </li>
              ))}
              {editMode && (
                <button 
                  onClick={() => handleAddItem("achievements", "New Achievement")} 
                  className="text-blue-600 font-bold text-xs"
                >
                  + Add Achievement
                </button>
              )}
            </ul>
          </div>
        );

      case "languages":
        return (editMode || localData.languages?.length > 0) && (
          <div key="languages" className="mb-8">
            <SectionHeading title="Languages" icon={Globe} />
            {editMode ? (
              <ChipInput 
                chips={localData.languages} 
                onChange={(newChips) => handleFieldChange("languages", newChips)} 
              />
            ) : (
              <div className="flex flex-wrap gap-4">
                {localData.languages?.map((lang, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"/> 
                    <span className="font-medium text-gray-700">{lang}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "interests":
        return (editMode || localData.interests?.length > 0) && (
          <div key="interests" className="mb-8">
            <SectionHeading title="Interests" icon={Heart} />
            {editMode ? (
              <ChipInput 
                chips={localData.interests} 
                onChange={(newChips) => handleFieldChange("interests", newChips)} 
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {localData.interests?.map((int, i) => (
                  <span 
                    key={i} 
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {int}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      default: 
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar 
          onDownload={handleDownload} 
          onSave={handleSave} 
          resumeRef={resumeRef} 
        />
        <div className="flex-grow p-8 flex flex-col items-center pb-24">
          <div 
            ref={resumeRef} 
            style={{ 
              fontFamily: templateSettings.fontFamily, 
              backgroundColor: "#ffffff", 
              borderRadius: "1rem", 
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)", 
              maxWidth: "210mm", 
              width: "100%", 
              minHeight: "297mm" 
            }}
          >
            
            {/* Header Section */}
            <div 
              style={{ 
                background: "linear-gradient(to right, #2563eb, #1e40af)", 
                color: "#ffffff", 
                padding: "2.5rem" 
              }} 
              className="rounded-t-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editMode ? (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={localData.name} 
                        onChange={(e) => handleFieldChange("name", e.target.value)} 
                        className="text-4xl font-bold bg-transparent border-b-2 border-white/30 w-full outline-none" 
                      />
                      <input 
                        type="text" 
                        value={localData.role} 
                        onChange={(e) => handleFieldChange("role", e.target.value)} 
                        className="text-xl text-blue-200 bg-transparent border-b-2 border-white/30 w-full outline-none" 
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-4xl font-bold mb-2 tracking-tight">
                        {localData.name}
                      </h1>
                      <p className="text-xl text-blue-100 font-medium">
                        {localData.role}
                      </p>
                    </>
                  )}
                </div>
                <div className="relative group">
                  <img 
                    src={uploadedPhoto || templateSettings.photo} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover" 
                  />
                  {editMode && (
                    <label 
                      htmlFor="photo-upload" 
                      className="absolute bottom-0 right-0 bg-white p-2 rounded-full text-blue-600 shadow-lg cursor-pointer"
                    >
                      <Plus size={20} />
                      <input 
                        id="photo-upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoChange} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Bar */}
            <div className="bg-gray-800 text-white px-8 py-5 flex flex-wrap justify-between gap-4 text-sm shadow-inner">
              <div className="flex items-center gap-2">
                <Mail className="text-yellow-400" size={16} />
                {editMode ? (
                  <input 
                    value={localData.email} 
                    onChange={(e) => handleFieldChange("email", e.target.value)} 
                    className="bg-transparent border-b border-gray-600" 
                  />
                ) : (
                  <span>{localData.email}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-yellow-400" size={16} />
                {editMode ? (
                  <input 
                    value={localData.phone} 
                    onChange={(e) => handleFieldChange("phone", e.target.value)} 
                    className="bg-transparent border-b border-gray-600" 
                  />
                ) : (
                  <span>{localData.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-yellow-400" size={16} />
                {editMode ? (
                  <input 
                    value={localData.location} 
                    onChange={(e) => handleFieldChange("location", e.target.value)} 
                    className="bg-transparent border-b border-gray-600" 
                  />
                ) : (
                  <span>{localData.location}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Linkedin className="text-yellow-400" size={16} />
                {editMode ? (
                  <input 
                    value={localData.linkedin} 
                    onChange={(e) => handleFieldChange("linkedin", e.target.value)} 
                    className="bg-transparent border-b border-gray-600" 
                  />
                ) : (
                  <a href={localData.linkedin} className="hover:underline">
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </div>

            {/* DYNAMIC BODY */}
            <div className="p-10 space-y-2">
              {sectionOrder.map((sectionKey) => (
                <React.Fragment key={sectionKey}>
                  {renderSection(sectionKey)}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex gap-6">
            {editMode ? (
              <>
                <button 
                  onClick={handleSave} 
                  className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all"
                >
                  Save Changes
                </button>
                <button 
                  onClick={handleCancel} 
                  className="bg-gray-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setEditMode(true)} 
                className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:bg-blue-700 transition-all transform hover:scale-105"
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

export default Template13;