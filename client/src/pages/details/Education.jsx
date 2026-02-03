import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence for smoother removal
import { ResumeContext } from '../../context/ResumeContext';

const Education = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId, buildType } = location.state || {};
  const { resumeData, updateResumeData } = useContext(ResumeContext);

  const [education, setEducation] = useState(
    (resumeData?.educationDetailed || []).map((edu, index) => ({
      id: edu.id ?? index + 1,
      ...edu
    })) || [
      {
        id: 1,
        degree: '',
        institution: '',
        year: '',
        grade: ''
      }
    ]
  );

  const handleEducationChange = (id, field, value) => {
    setEducation(prev => 
      prev.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const addEducation = () => {
    const newId = education.length > 0 ? Math.max(...education.map(edu => edu.id)) + 1 : 1;
    setEducation(prev => [
      ...prev,
      {
        id: newId,
        degree: '',
        institution: '',
        year: '',
        grade: ''
      }
    ]);
  };

  const removeEducation = (id) => {
    if (education.length > 1) {
      setEducation(prev => prev.filter(edu => edu.id !== id));
    } else {
      alert("You must have at least one education entry.");
    }
  };

  const handleNext = () => {
    const isComplete = education.every(edu => edu.degree.trim() && edu.institution.trim());
    
    if (!isComplete) {
      alert("Please fill in at least the Degree and Institution for your education entries.");
      return;
    }

    const updatedData = {
      ...resumeData,
      education: education.map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        duration: edu.year,
        location: '', 
        grade: edu.grade
      })).filter(edu => edu.degree.trim() || edu.institution.trim()),
      educationDetailed: education
    };
    
    updateResumeData(updatedData);
    navigate('/details/work-experience', { 
      state: { templateId, buildType } 
    });
  };

  const handleBackClick = () => {
    navigate('/details/personal-details', { 
      state: { templateId, buildType } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 py-12 md:p-12 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        {/* Back Button */}
        <motion.button
          onClick={handleBackClick}
          className="mb-8 flex items-center text-white hover:text-teal-100 transition-all duration-300 ease-in-out focus:outline-none p-4 rounded-2xl shadow-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 backdrop-blur-lg border border-teal-400/30"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </motion.button>

        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-teal-400 font-semibold">Education</span>
            <span className="text-gray-400 text-sm">Step 2 of 6</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-teal-500 to-orange-500 h-2 rounded-full" style={{ width: '33%' }}></div>
          </div>
        </div>

        {/* Header */}
        <motion.div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-orange-400 bg-clip-text text-transparent">
            Education
          </h1>
          <p className="text-gray-300">Add your educational background and qualifications</p>
        </motion.div>

        {/* Education List */}
        <motion.div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-600 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Educational Background</h2>
          <div className="space-y-6">
            <AnimatePresence>
              {education.map((edu, index) => (
                <motion.div 
                  key={edu.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, x: -50, height: 0 }}
                  className="border border-gray-600 rounded-xl p-6 bg-gray-800/30"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white italic">Level {index + 1}</h3>
                    
                    {/* ENHANCED DELETE BUTTON */}
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(edu.id)}
                        className="flex items-center gap-2 text-red-400 hover:text-white hover:bg-red-500 transition-all duration-300 p-2 rounded-lg"
                        title="Delete this entry"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                      className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-teal-400 focus:outline-none transition-all duration-300"
                      placeholder="Degree (e.g. Bachelor of Science)"
                    />
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                      className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-teal-400 focus:outline-none transition-all duration-300"
                      placeholder="Institution"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onKeyPress={(e) => { if (!/[0-9\-\/]/.test(e.key)) e.preventDefault(); }}
                      onChange={(e) => handleEducationChange(edu.id, 'year', e.target.value)}
                      className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-teal-400 focus:outline-none transition-all duration-300"
                      placeholder="Year (e.g. 2018-2022)"
                    />
                    <input
                      type="text"
                      value={edu.grade}
                      onChange={(e) => handleEducationChange(edu.id, 'grade', e.target.value)}
                      className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-teal-400 focus:outline-none transition-all duration-300"
                      placeholder="Grade/GPA (Optional)"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <button
            onClick={addEducation}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            + Add Education
          </button>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Next
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Education;