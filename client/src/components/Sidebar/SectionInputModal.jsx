import React, { useState } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

const SectionInputModal = ({ section, onClose, onSave }) => {
  const [formData, setFormData] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderFields = () => {
    switch (section) {
      case "summary":
        return (
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            placeholder="Write a professional summary..."
            onChange={(e) => setFormData(e.target.value)}
          />
        );
      case "experience":
        return (
          <div className="space-y-3">
            <input className="w-full p-2 border rounded text-sm" placeholder="Job Title" onChange={(e) => handleChange("title", e.target.value)} />
            <input className="w-full p-2 border rounded text-sm" placeholder="Company Name" onChange={(e) => handleChange("company", e.target.value)} />
            <input className="w-full p-2 border rounded text-sm" placeholder="Duration (e.g., 2022 - Present)" onChange={(e) => handleChange("duration", e.target.value)} />
            <textarea className="w-full p-2 border rounded h-20 text-sm" placeholder="Work Description" onChange={(e) => handleChange("description", e.target.value)} />
          </div>
        );
      case "education":
        return (
          <div className="space-y-3">
            <input className="w-full p-2 border rounded text-sm" placeholder="Degree / Course" onChange={(e) => handleChange("degree", e.target.value)} />
            <input className="w-full p-2 border rounded text-sm" placeholder="Institution / College" onChange={(e) => handleChange("institution", e.target.value)} />
            <input className="w-full p-2 border rounded text-sm" placeholder="Year" onChange={(e) => handleChange("year", e.target.value)} />
          </div>
        );
      case "projects":
        return (
          <div className="space-y-3">
            <input className="w-full p-2 border rounded text-sm" placeholder="Project Name" onChange={(e) => handleChange("name", e.target.value)} />
            <textarea className="w-full p-2 border rounded h-20 text-sm" placeholder="Project Description" onChange={(e) => handleChange("description", e.target.value)} />
          </div>
        );
      case "languages":
        return (
          <div className="space-y-3">
            <input className="w-full p-2 border rounded text-sm" placeholder="Language (e.g. English)" onChange={(e) => handleChange("language", e.target.value)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold uppercase">Proficiency (1-6)</label>
              <input type="range" min="1" max="6" defaultValue="4" className="w-full accent-indigo-600" onChange={(e) => handleChange("proficiency", parseInt(e.target.value))} />
            </div>
          </div>
        );
      case "certifications":
        return (
          <div className="space-y-3">
            <input className="w-full p-2 border rounded text-sm" placeholder="Certification Name" onChange={(e) => handleChange("name", e.target.value)} />
            <input className="w-full p-2 border rounded text-sm" placeholder="Issuing Organization" onChange={(e) => handleChange("organization", e.target.value)} />
            <input className="w-full p-2 border rounded text-sm" placeholder="Year" onChange={(e) => handleChange("year", e.target.value)} />
          </div>
        );
      case "skills":
      case "interests":
      case "achievements":
        return (
          <input
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            placeholder={`Enter ${section.slice(0, -1)} name...`}
            onChange={(e) => setFormData(e.target.value)}
          />
        );
      default:
        return <p className="text-gray-400 italic text-sm">Enter details for {section}</p>;
    }
  };

  const handleLocalSave = () => {
    let finalData = formData;

    // Normalization to prevent the "Objects are not valid" crash
    if (section === "certifications") {
      // Ensuring keys match the error logs: title, description, year
      finalData = {
        title: formData.name || "Certification",
        description: formData.organization || "",
        year: formData.year || ""
      };
    }

    if (section === "languages") {
      finalData = {
        language: formData.language || "Language",
        proficiency: formData.proficiency || 4
      };
    }

    // Ensure Skill/Interest/Achievement is always a simple string
    if (["skills", "interests", "achievements"].includes(section)) {
      if (typeof formData === 'object' && formData !== null) {
        finalData = Object.values(formData)[0] || "";
      }
    }

    onSave(section, finalData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200 overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-lg">
          <h3 className="font-bold uppercase tracking-wider text-sm">Add New {section}</h3>
          <button onClick={onClose} className="hover:rotate-90 transition-all duration-200"><FaTimes /></button>
        </div>
        <div className="p-6 bg-gray-50/50">
          {renderFields()}
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 text-gray-500 font-bold border border-gray-200 rounded-xl hover:bg-white transition-colors">Cancel</button>
            <button onClick={handleLocalSave} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-md transition-all active:scale-95">
              <FaSave /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionInputModal;