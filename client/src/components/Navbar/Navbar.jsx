/* src/components/Navbar/Navbar.jsx */
import React, { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaDownload, FaShareAlt } from 'react-icons/fa';
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Navbar = ({ resumeRef }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const darkGradientStyle = {
    background: "linear-gradient(90deg, #008a91 0%, #5d8233 50%, #b35100 100%)",
    border: "none"
  };

  const isEditorPage = location.pathname !== "/";

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const currentScroll = window.innerHeight + window.scrollY;
      setIsVisible(currentScroll + 50 >= scrollHeight);
    };

    if (isEditorPage) {
      window.addEventListener("scroll", handleScroll);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isEditorPage]);

  const handleDownloadPDF = async () => {
    if (isGenerating) return;
    
    // Safety check: ensure ref exists
    const element = resumeRef?.current;
    if (!element) {
      toast.error("Please wait... Resume is still loading.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.info("Generating high-quality PDF...", { autoClose: false });
    
    try {
      // Small delay to ensure any pending UI updates finish
      await new Promise((r) => setTimeout(r, 300));

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Handle multiple pages if resume is long
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; 
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save("My_UptoSkills_Resume.pdf");
      toast.dismiss(toastId);
      toast.success("Downloaded successfully!");
    } catch (err) {
      console.error("❌ PDF Generation Error:", err);
      toast.dismiss(toastId);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: "My Professional Resume",
      text: "Check out my resume built on UptoSkills!",
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => toast.success("Shared successfully"))
        .catch((err) => console.log("Error sharing", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info("Resume link copied to clipboard!");
    }
  };

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 h-16 z-[50] bg-white text-gray-800 shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src="/UptoSkills_logo.png" alt="UptoSkills Logo" className="h-9 w-auto" />
              <div className="h-6 w-[1.5px] bg-gray-300 mx-4 hidden sm:block"></div>
              <span className="hidden sm:block text-lg font-bold tracking-tight bg-gradient-to-r from-[#008a91] via-[#5d8233] to-[#b35100] bg-clip-text text-transparent uppercase">
                AI Resume Builder
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {isEditorPage && (
        <div className="fixed inset-0 pointer-events-none z-[10000]">
          {/* Floating Action Buttons */}
          <div className="absolute bottom-32 right-8 flex flex-col space-y-4 pointer-events-auto">
            <button 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              title="Download PDF"
              style={darkGradientStyle} 
              className={`p-4 rounded-full text-white shadow-2xl hover:scale-110 active:scale-95 transition-all ${isGenerating ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <FaDownload size={24} className={isGenerating ? "animate-bounce" : ""} />
            </button>
            <button 
              onClick={handleShare}
              title="Share Resume"
              style={darkGradientStyle} 
              className="p-4 rounded-full text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <FaShareAlt size={24} />
            </button>
          </div>

          {/* Bottom Auth Toggle Bar */}
          {!isAuthenticated && (
            <div 
              className={`absolute bottom-8 right-8 flex items-center space-x-3 transition-all duration-500 transform pointer-events-auto ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <Link to="/login" style={darkGradientStyle} className="text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:opacity-90">
                Sign In
              </Link>
              <Link to="/signup" style={darkGradientStyle} className="text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:opacity-90">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
      <div className="h-16 w-full"></div>
    </>
  );
};

export default Navbar;