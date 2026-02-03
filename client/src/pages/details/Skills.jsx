import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResumeContext } from '../../context/ResumeContext';
import { useAuth } from '../../context/AuthContext';
import resumeService from '../../services/resumeService';
import { toast } from 'react-toastify';

const Skills = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId, buildType } = location.state || {};
  const { resumeData, updateResumeData } = useContext(ResumeContext);
  const { isAuthenticated } = useAuth();

  // ✅ FIXED INITIAL STATE
  const [skills, setSkills] = useState(() => {
    if (resumeData?.skillsDetailed?.length > 0) {
      return resumeData.skillsDetailed;
    }
    return [{ id: 1, skill: '' }];
  });

  const handleSkillChange = (id, value) => {
    setSkills(prev =>
      prev.map(skill =>
        skill.id === id ? { ...skill, skill: value } : skill
      )
    );
  };

  const addSkill = () => {
    const newId = skills.length > 0
      ? Math.max(...skills.map(s => s.id)) + 1
      : 1;

    setSkills(prev => [...prev, { id: newId, skill: '' }]);
  };

  const removeSkill = (id) => {
    if (skills.length > 1) {
      setSkills(prev => prev.filter(skill => skill.id !== id));
    }
  };

  // ✅ SAVE FUNCTION USED BY BOTH NEXT & BACK
  const saveToContext = () => {
    const updatedData = {
      ...resumeData,
      skills: skills.map(s => s.skill).filter(s => s.trim()),
      skillsDetailed: skills
    };

    updateResumeData(updatedData);
    return updatedData;
  };

  const handleNext = () => {
    saveToContext();
    navigate('/details/projects', {
      state: { templateId, buildType }
    });
  };

  const handleBackClick = () => {
    saveToContext(); // ✅ THIS WAS MISSING BEFORE
    navigate('/details/work-experience', {
      state: { templateId, buildType }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 py-12 md:p-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto relative z-10"
      >

        {/* Back Button */}
        <motion.button
          onClick={handleBackClick}
          className="mb-8 flex items-center text-white p-4 rounded-2xl bg-teal-600 hover:bg-teal-700"
        >
          ← Back
        </motion.button>

        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-white mb-6">Skills</h1>

        {/* Skills List */}
        <div className="bg-gray-800 p-6 rounded-xl space-y-4">
          {skills.map(skill => (
            <div key={skill.id} className="flex gap-4">
              <input
                value={skill.skill}
                onChange={(e) => handleSkillChange(skill.id, e.target.value)}
                placeholder="e.g. React, Python"
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded"
              />
              {skills.length > 1 && (
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="text-red-400"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addSkill}
            className="mt-3 bg-blue-600 px-4 py-2 text-white rounded"
          >
            + Add Skill
          </button>
        </div>

        {/* Next */}
        <div className="text-center mt-6">
          <button
            onClick={handleNext}
            className="bg-teal-600 px-6 py-2 text-white rounded"
          >
            Next
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default Skills;
