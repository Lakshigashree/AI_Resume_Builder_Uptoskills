import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, TrendingUp, Loader2, Download, Info } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar.jsx';
import { toast } from 'react-toastify';
import resumeService from '../services/resumeService.js';
import { useResume } from '../context/ResumeContext.jsx';

const ATSScorePage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { resumeData } = useResume();

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      setError('Please upload a PDF, DOCX, DOC, or TXT file.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setUploadedFile(file);
    setError('');
    setAtsResult(null);
  };

  const handleAnalyzeFile = async () => {
    if (!uploadedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await resumeService.analyzeATSFile(uploadedFile);
      
      if (result.success) {
        setAtsResult(result.data);
        toast.success('Resume analyzed successfully!');
      } else {
        setError(result.error || 'Failed to analyze resume');
        toast.error(result.error || 'Failed to analyze resume');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the resume');
      toast.error('An error occurred while analyzing the resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeCurrentResume = async () => {
    if (!resumeData || (!resumeData.name && !resumeData.summary)) {
      setError('No resume data available. Please build a resume first or upload a file.');
      toast.warning('No resume data available');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Convert resume data to text
      const resumeText = resumeService.structuredDataToText(resumeData);
      
      const result = await resumeService.analyzeATSText(resumeText, resumeData);
      
      if (result.success) {
        setAtsResult(result.data);
        toast.success('Resume analyzed successfully!');
      } else {
        setError(result.error || 'Failed to analyze resume');
        toast.error(result.error || 'Failed to analyze resume');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the resume');
      toast.error('An error occurred while analyzing the resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const syntheticEvent = { target: { files: [files[0]] } };
      handleFileSelect(syntheticEvent);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCheckIcon = (passed) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ATS Resume Score Checker
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Upload your resume or analyze your current resume to get an ATS compatibility score and detailed recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Upload className="mr-3 text-purple-500" size={28} />
              Upload Resume
            </h2>

            {/* File Upload Area */}
            <div
              className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-purple-50/30 mb-4"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="text-white" size={32} />
                </div>

                <div>
                  <p className="text-gray-700 font-medium">
                    {uploadedFile ? uploadedFile.name : 'Click or drag file here to upload'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    PDF, DOCX, DOC, or TXT (Max 10MB)
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAnalyzeFile}
                disabled={!uploadedFile || isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Analyze Uploaded File
                  </>
                )}
              </button>

              {resumeData && (resumeData.name || resumeData.summary) && (
                <button
                  onClick={handleAnalyzeCurrentResume}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Analyze Current Resume
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">What is ATS?</p>
                  <p>
                    Applicant Tracking Systems (ATS) are software used by employers to filter resumes. 
                    Our checker analyzes your resume for ATS compatibility and provides actionable recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="mr-3 text-purple-500" size={28} />
              Analysis Results
            </h2>

            {!atsResult ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Upload a resume or analyze your current resume to see results</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score Display */}
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                  <div className="mb-4">
                    <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(atsResult.score)} text-white mb-4`}>
                      <div className="text-center">
                        <div className="text-4xl font-bold">{atsResult.score}</div>
                        <div className="text-lg font-semibold">{atsResult.grade}</div>
                      </div>
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold ${getScoreColor(atsResult.score)} mb-2`}>
                    ATS Score: {atsResult.score}/100
                  </h3>
                  <p className="text-gray-700">{atsResult.summary}</p>
                </div>

                {/* Detailed Checks */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Analysis</h3>
                  <div className="space-y-4">
                    {Object.entries(atsResult.checks).map(([key, check]) => (
                      <div key={key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            {getCheckIcon(check.passed)}
                            <span className="ml-2 font-semibold text-gray-800 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                          <span className={`font-bold ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {check.score}/100
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{check.message}</p>
                        {check.details && Object.keys(check.details).length > 0 && (
                          <div className="text-xs text-gray-500 mt-2">
                            {Object.entries(check.details).map(([detailKey, detailValue]) => (
                              <div key={detailKey} className="mt-1">
                                <span className="font-semibold">{detailKey}:</span>{' '}
                                {Array.isArray(detailValue) ? detailValue.join(', ') : String(detailValue)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {atsResult.recommendations && atsResult.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                      Recommendations
                    </h3>
                    <div className="space-y-3">
                      {atsResult.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${
                            rec.priority === 'high'
                              ? 'bg-red-50 border-red-500'
                              : 'bg-yellow-50 border-yellow-500'
                          }`}
                        >
                          <div className="flex items-start">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${
                                rec.priority === 'high'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-yellow-200 text-yellow-800'
                              }`}
                            >
                              {rec.priority.toUpperCase()}
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{rec.category}</p>
                              <p className="text-sm text-gray-700 mt-1">{rec.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSScorePage;

