import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResumeContext } from '../../context/ResumeContext';
import { useAuth } from '../../context/AuthContext';
import resumeService from '../../services/resumeService';
import { toast } from 'react-toastify';

const OtherDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId, buildType } = location.state || {};
  const { resumeData, updateResumeData } = useContext(ResumeContext);
  const { isAuthenticated } = useAuth();

  const [certifications, setCertifications] = useState([
    { id: 1, name: '', issuer: '', year: '' }
  ]);

  const [achievements, setAchievements] = useState([
    { id: 1, title: '', description: '', year: '' }
  ]);

  // ✅ Restore data when coming back
  useEffect(() => {
    if (resumeData?.certificationsDetailed?.length) {
      setCertifications(resumeData.certificationsDetailed);
    }

    if (resumeData?.achievementsDetailed?.length) {
      setAchievements(resumeData.achievementsDetailed);
    }
  }, [resumeData]);

  const handleCertificationChange = (id, field, value) => {
    setCertifications(prev =>
      prev.map(cert => cert.id === id ? { ...cert, [field]: value } : cert)
    );
  };

  const addCertification = () => {
    const newId = Math.max(...certifications.map(c => c.id)) + 1;
    setCertifications(prev => [...prev, { id: newId, name: '', issuer: '', year: '' }]);
  };

  const removeCertification = (id) => {
    if (certifications.length > 1) {
      setCertifications(prev => prev.filter(cert => cert.id !== id));
    }
  };

  const handleAchievementChange = (id, field, value) => {
    setAchievements(prev =>
      prev.map(a => a.id === id ? { ...a, [field]: value } : a)
    );
  };

  const addAchievement = () => {
    const newId = Math.max(...achievements.map(a => a.id)) + 1;
    setAchievements(prev => [...prev, { id: newId, title: '', description: '', year: '' }]);
  };

  const removeAchievement = (id) => {
    if (achievements.length > 1) {
      setAchievements(prev => prev.filter(a => a.id !== id));
    }
  };

  // ✅ Save before going back
  const handleBackClick = () => {
    updateResumeData({
      ...resumeData,
      certificationsDetailed: certifications,
      achievementsDetailed: achievements
    });

    navigate('/details/languages', {
      state: { templateId, buildType }
    });
  };

  const handleFinish = async () => {
    const finalData = {
      ...resumeData,
      certifications: certifications.map(cert => ({
        title: cert.name,
        issuer: cert.issuer,
        date: cert.year
      })).filter(cert => cert.title.trim()),
      achievements: achievements.map(a => ({
        title: a.title,
        description: a.description,
        year: a.year
      })).filter(a => a.title.trim()),
      certificationsDetailed: certifications,
      achievementsDetailed: achievements
    };

    updateResumeData(finalData);

    if (isAuthenticated) {
      try {
        const resumeText = resumeService.structuredDataToText(finalData);
        const title = `Resume - ${finalData.personalInfo?.name || 'Generated'}`;
        const saveResult = await resumeService.saveResume(resumeText, title);

        if (saveResult.success) toast.success('Data saved successfully');
        else toast.error('Failed to save');
      } catch {
        toast.error('Failed to save');
      }
    } else {
      toast.success('Data saved successfully');
    }

    navigate(`/template${templateId}`, {
      state: { resumeData: finalData }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 py-12 md:p-12 relative overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto relative z-10">

        <motion.button onClick={handleBackClick} className="mb-8 flex items-center text-white p-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600">
          ← Back
        </motion.button>

        <h1 className="text-3xl font-bold text-center text-white mb-8">Additional Details</h1>

        {/* Certifications */}
        <div className="bg-gray-800/50 border border-gray-600 rounded-3xl p-8 mb-8">
          <h2 className="text-white text-xl mb-4">Certifications</h2>

          {certifications.map((cert, i) => (
            <div key={cert.id} className="grid md:grid-cols-3 gap-4 mb-4">
              <input value={cert.name} onChange={(e) => handleCertificationChange(cert.id, 'name', e.target.value)} placeholder="Certification" className="bg-gray-700 p-3 rounded text-white" />
              <input value={cert.issuer} onChange={(e) => handleCertificationChange(cert.id, 'issuer', e.target.value)} placeholder="Issuer" className="bg-gray-700 p-3 rounded text-white" />
              <input value={cert.year} onChange={(e) => handleCertificationChange(cert.id, 'year', e.target.value)} placeholder="Year" className="bg-gray-700 p-3 rounded text-white" />
            </div>
          ))}

          <button onClick={addCertification} className="bg-blue-600 px-4 py-2 rounded text-white">+ Add Certification</button>
        </div>

        {/* Achievements */}
        <div className="bg-gray-800/50 border border-gray-600 rounded-3xl p-8 mb-8">
          <h2 className="text-white text-xl mb-4">Achievements</h2>

          {achievements.map((a) => (
            <div key={a.id} className="space-y-3 mb-4">
              <input value={a.title} onChange={(e) => handleAchievementChange(a.id, 'title', e.target.value)} placeholder="Title" className="bg-gray-700 p-3 rounded text-white w-full" />
              <textarea value={a.description} onChange={(e) => handleAchievementChange(a.id, 'description', e.target.value)} placeholder="Description" className="bg-gray-700 p-3 rounded text-white w-full" />
              <input value={a.year} onChange={(e) => handleAchievementChange(a.id, 'year', e.target.value)} placeholder="Year" className="bg-gray-700 p-3 rounded text-white w-full" />
            </div>
          ))}

          <button onClick={addAchievement} className="bg-blue-600 px-4 py-2 rounded text-white">+ Add Achievement</button>
        </div>

        <button onClick={handleFinish} className="bg-gradient-to-r from-teal-500 to-orange-500 px-8 py-3 rounded text-white">
          Finish & Generate Resume
        </button>
      </motion.div>
    </div>
  );
};

export default OtherDetails;
