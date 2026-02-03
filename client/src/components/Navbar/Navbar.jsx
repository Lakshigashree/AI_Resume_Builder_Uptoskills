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

  // --- INTEGRATED PROFESSIONAL DOWNLOAD LOGIC ---
  const handleDownloadPDF = async () => {
    if (isGenerating) return;
    if (!resumeRef?.current) {
      toast.error("Resume element not found");
      return;
    }

    setIsGenerating(true);
    let originalStyles = [];
    
    try {
      toast.info("Preparing your professional PDF...");
      // Small delay to allow UI state to settle
      await new Promise((r) => setTimeout(r, 200));

      const element = resumeRef.current;

      // Hide non-printable elements
      const hideElements = element.querySelectorAll('.hide-in-pdf');
      hideElements.forEach((el) => {
        originalStyles.push({
          element: el,
          display: el.style.display,
          visibility: el.style.visibility,
          opacity: el.style.opacity,
          height: el.style.height,
          margin: el.style.margin,
          padding: el.style.padding,
        });
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.height = '0';
        el.style.margin = '0';
        el.style.padding = '0';
      });

      // Capture with advanced error handling for color parsing (oklch/oklab)
      let canvas;
      try {
        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          ignoreElements: (el) => el.classList?.contains('hide-in-pdf'),
        });
      } catch (colorError) {
        console.warn('Handling color parsing error, retrying with simplified config...');
        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      // Handle multi-page resumes
      while (heightLeft > 0) {
        position -= pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save("My_Professional_Resume.pdf");
      toast.success("Resume downloaded successfully!");
    } catch (err) {
      console.error("❌ PDF Error:", err);
      toast.error("Failed to generate PDF. Try disabling unusual fonts.");
    } finally {
      // Restore original UI styles
      originalStyles.forEach(({ element, display, visibility, opacity, height, margin, padding }) => {
        element.style.display = display;
        element.style.visibility = visibility;
        element.style.opacity = opacity;
        element.style.height = height;
        element.style.margin = margin;
        element.style.padding = padding;
      });
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Professional Resume",
        text: "Check out my resume built on UptoSkills!",
        url: window.location.href,
      })
      .then(() => toast.success("Shared successfully"))
      .catch((error) => console.log("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.info("Link copied to clipboard!"));
    }
  };

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 h-16 z-[50] bg-white text-gray-800 shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/UptoSkills_logo.png" alt="UptoSkills Logo" className="h-9 w-auto" />
            </Link>
          </div>
        </div>
      </nav>

      {isEditorPage && (
        <div className="fixed inset-0 pointer-events-none z-[10000]">
          {/* Sticky Floating Icons */}
          <div className="absolute bottom-32 right-8 flex flex-col space-y-4 pointer-events-auto">
            <button 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              style={darkGradientStyle} 
              className={`p-4 rounded-full text-white shadow-xl hover:scale-110 transition-transform ${isGenerating ? 'opacity-70' : ''}`}
            >
              <FaDownload size={24} className={isGenerating ? "animate-pulse" : ""} />
            </button>
            <button 
              onClick={handleShare}
              style={darkGradientStyle} 
              className="p-4 rounded-full text-white shadow-xl hover:scale-110 transition-transform"
            >
              <FaShareAlt size={24} />
            </button>
          </div>

          {/* Bottom Authentication Links */}
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
        </div>
      )}
      <div className="h-16 w-full"></div>
    </>
  );
};

export default Navbar;