import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseResumeFile, validateResumeFile } from "../utils/fileParser";
import { Upload, FileText, Edit3, Download, Eye, AlertCircle, CheckCircle, Loader2, Database } from 'lucide-react';
import Navbar from "../components/Navbar/Navbar.jsx";
import resumeService from "../services/resumeService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from 'react-toastify';
import { getAtsScoreFromAI } from "../services/geminiService";

const ResumeUploadPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resumeContent, setResumeContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [savedResumeId, setSavedResumeId] = useState(null);
  // 2. 3 new state variables for ATS score function after 'savedResumeId' (around line 23)
  const [jobDescription, setJobDescription] = useState("");
  const [atsData, setAtsData] = useState(null);
  const [isScoring, setIsScoring] = useState(false);
  const fileInputRef = useRef(null);

  // Enhanced file handling with immediate parsing, auto-save, and redirect
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear previous state
    setError('');
    setWarnings([]);
    setParsedData(null);
    setSavedResumeId(null);

    // Validate file
    const validation = validateResumeFile(file);
    if (!validation.isValid) {
      setError(validation.errors.join(' '));
      return;
    }

    // Set warnings if any
    if (validation.warnings.length > 0) {
      setWarnings(validation.warnings);
    }

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      // Parse file content immediately
      const parsed = await parseResumeFile(file);
      setParsedData(parsed);
      setResumeContent(parsed.content);
      setShowPreview(true);

      // Auto-save to database if user is authenticated
      if (isAuthenticated) {
        setIsSaving(true);
        try {
          const saveResult = await resumeService.autoSaveUploadedResume(parsed, file);
          if (saveResult.success) {
            setSavedResumeId(saveResult.data.id);
            toast.success('✅ Resume automatically saved to your account!');
          } else {
            console.warn('Failed to auto-save resume:', saveResult.error);
            toast.warning('Resume parsed but not saved to account. You can save it manually later.');
          }
        } catch (saveError) {
          console.warn('Auto-save error:', saveError);
          toast.warning('Resume parsed but not saved to account. You can save it manually later.');
        } finally {
          setIsSaving(false);
        }
      }

      // Automatically redirect to edit page with parsed data
      // COMMENT THIS WHOLE BLOCK OUT TEMPORARILY for ATS feature:
      /*
      setTimeout(() => {
        navigate('/edit-resume', {
          state: {
            file: file,
            content: parsed.content,
            parsedData: parsed,
            originalFile: file,
            savedResumeId: savedResumeId
          }
        });
      }, 2000); // Slightly longer delay to show save status
     */

    } catch (error) {
      setError(error.message);
      setShowPreview(false);
    } finally {
      setIsProcessing(false);
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
      const file = files[0];
      // Create a synthetic event object for handleFileSelect
      const syntheticEvent = {
        target: { files: [file] }
      };
      handleFileSelect(syntheticEvent);
    }
  };

  //Add the Scoring Function for ATS after the handleDrop function and before the return statement
  const handleCheckAtsScore = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a Job Description first!");
      return;
    }
    if (!resumeContent) {
      toast.error("Please upload a resume first!");
      return;
    }

    setIsScoring(true);
    try {
      const result = await getAtsScoreFromAI(resumeContent, jobDescription);
      if (result) {
        setAtsData(result);
        toast.success("ATS Analysis Complete!");
      }
    } catch (error) {
      toast.error("Failed to calculate ATS score.");
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f97316 0%, #10b981 100%)' }}>
      {/* Import Navbar with UptoSkills theme */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Upload className="mr-3 text-emerald-500" size={28} />
                Upload Your Resume
              </h2>

              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-emerald-50/30"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="text-white" size={32} />
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Drop files anywhere to upload
                    </p>
                    <p className="text-gray-500 mb-4">or</p>

                    <button className="bg-gradient-to-r from-orange-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                      Select Files
                    </button>
                  </div>

                  <p className="text-sm text-gray-400">
                    Upload limit: 50 MB
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="text-red-500 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-red-800">Upload Error</h4>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Warnings Display */}
              {warnings.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-yellow-800">Notice</h4>
                      {warnings.map((warning, index) => (
                        <p key={index} className="text-sm text-yellow-700 mt-1">{warning}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Success Display */}
              {uploadedFile && !error && parsedData && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-emerald-600" size={20} />
                      <div>
                        <span className="font-medium text-emerald-800">{uploadedFile.name}</span>
                        <p className="text-sm text-emerald-600">
                          Successfully parsed
                          {isAuthenticated && isSaving && ' • Saving to your account...'}
                          {isAuthenticated && !isSaving && savedResumeId && ' • Saved to your account!'}
                          {!isAuthenticated && ' • Redirecting to edit page...'}
                          {isAuthenticated && !isSaving && !savedResumeId && ' • Redirecting to edit page...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isAuthenticated && isSaving && (
                        <div className="flex items-center space-x-1 text-emerald-600">
                          <Database size={16} />
                          <span className="text-xs">Saving...</span>
                        </div>
                      )}
                      {isAuthenticated && savedResumeId && (
                        <div className="flex items-center space-x-1 text-emerald-600">
                          <Database size={16} />
                          <span className="text-xs">Saved!</span>
                        </div>
                      )}
                      <span className="text-sm text-emerald-600">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Indicator */}
              {isProcessing && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-2 text-emerald-600">
                    <Loader2 className="animate-spin" size={20} />
                    <span>
                      {isSaving ? 'Saving to your account...' : 'Parsing your resume and preparing for editing...'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div> {/* This </div> closes the "bg-white" card */}

              {/* ATS Match Optimizer Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Database className="mr-3 text-orange-500" size={24} />
                ATS Match Optimizer
              </h2>
              
              <textarea
                className="w-full h-32 p-3 border-2 border-emerald-50 rounded-lg focus:border-emerald-500 focus:outline-none transition-all text-sm"
                placeholder="Paste the target Job Description here to see your match score..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />

              <button
                onClick={handleCheckAtsScore}
                disabled={isScoring || !resumeContent}
                className="mt-4 w-full bg-gradient-to-r from-orange-500 to-emerald-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transform hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                {isScoring ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} /> Analyzing Match...
                  </div>
                ) : "🚀 Check ATS Match Score"}
              </button>

              {/* Animated Result Meter */}
              {atsData && (
                <div className="mt-8 border-t pt-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
                        <circle
                          cx="64" cy="64" r="58" stroke="#10b981" strokeWidth="8" fill="transparent"
                          strokeDasharray="364.4"
                          strokeDashoffset={364.4 - (364.4 * atsData.score) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-gray-800">{atsData.score}%</span>
                      </div>
                    </div>
                    
                    <div className="w-full space-y-3">
                      <h4 className="font-bold text-gray-700 text-sm">Critical Keywords Missing:</h4>
                      <div className="flex flex-wrap gap-2">
                        {atsData.missingKeywords?.map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-xs font-medium">
                            + {kw}
                          </span>
                        ))}
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 italic border border-emerald-100">
                        "{atsData.analysis}"
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {showPreview && parsedData && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <Eye className="mr-3 text-emerald-500" size={24} />
                    Resume Preview
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    File Type: {parsedData.fileType.toUpperCase()} • Ready for editing
                  </p>
                </div>

                {/* Resume Content */}
                <div className="p-6">
                  <div className="border-2 border-gray-300 rounded-lg bg-white shadow-inner" style={{ aspectRatio: '8.5/11' }}>
                    <div className="p-6 h-full overflow-y-auto">
                      {/* PDF Preview */}
                      {parsedData.fileType === 'pdf' && (
                        <iframe
                          src={URL.createObjectURL(uploadedFile)}
                          width="100%"
                          height="600px"
                          title="PDF Preview"
                          style={{ border: "1px solid #ccc", borderRadius: "8px", marginBottom: "16px" }}
                        />
                      )}
                      {/* Text Preview */}
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                        {parsedData.content}
                      </pre>
                    </div>
                  </div>

                  <div className="mt-4 text-center text-sm text-gray-500">
                    Parsed content ready for AI enhancement and manual editing
                  </div>
                </div>
              </div>
            )}

            {!showPreview && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-gray-400" size={48} />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Upload Your Resume</h3>
                <p className="text-gray-500">Upload your resume to see the preview and start editing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadPage;