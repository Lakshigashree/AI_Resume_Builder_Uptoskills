import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";

/**
 * Simple PDF download handler - no page forcing, just natural PDF generation
 * @param {React.RefObject} resumeRef - The ref attached to the resume paper container
 * @param {string} name - User name for the filename
 * @param {Object} options - Additional configuration options
 * @returns {Promise<void>}
 */
export const handleGlobalDownload = async (
  resumeRef, 
  name = "Resume", 
  options = {}
) => {
  const element = resumeRef.current;
  
  if (!element) {
    toast.error("❌ Resume content not found! Please try refreshing.");
    return;
  }

  // Prevent multiple simultaneous downloads
  if (element.getAttribute('data-downloading') === 'true') {
    toast.warn("⏳ Download already in progress...");
    return;
  }

  // Store original styles
  const originalStyles = {
    overflow: element.style.overflow,
    height: element.style.height,
  };
  
  // Set downloading flag
  element.setAttribute('data-downloading', 'true');
  
  // Temporarily adjust for better PDF capture
  element.style.overflow = 'visible';
  element.style.height = 'auto';

  // Simple PDF options - no page forcing
  const pdfOptions = {
    margin: options.margin || [5, 5, 5, 5],
    filename: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
    image: { 
      type: "jpeg", 
      quality: options.quality || 0.98 
    },
    html2canvas: {
      scale: options.scale || 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (element) => {
        return element.getAttribute('data-html2canvas-ignore') === 'true' ||
               element.classList.contains('no-print') ||
               element.tagName === 'BUTTON' ||
               element.closest('button') !== null ||
               element.closest('.sidebar') !== null;
      },
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true
    },
    // Let CSS handle page breaks naturally
    pagebreak: { mode: ['css', 'legacy'] }
  };

  const progressToast = toast.info("📄 Generating PDF...", {
    autoClose: false,
    closeOnClick: false,
  });

  try {
    toast.update(progressToast, { render: "📄 Creating PDF..." });

    await html2pdf()
      .from(element)
      .set(pdfOptions)
      .save();

    toast.update(progressToast, {
      render: "✅ Download complete!",
      type: "success",
      autoClose: 3000,
    });

  } catch (err) {
    console.error("❌ PDF Generation Error:", err);
    toast.update(progressToast, {
      render: "❌ Download failed. Please try again.",
      type: "error",
      autoClose: 5000,
    });
  } finally {
    // Restore original styles
    element.style.overflow = originalStyles.overflow;
    element.style.height = originalStyles.height;
    
    // Remove downloading flag
    element.removeAttribute('data-downloading');
  }
};

/**
 * Preview PDF in new tab
 * @param {React.RefObject} resumeRef - The ref attached to the resume paper container
 * @param {Object} options - Preview options
 * @returns {Promise<void>}
 */
export const handlePreviewPDF = async (resumeRef, options = {}) => {
  const element = resumeRef.current;
  
  if (!element) {
    toast.error("❌ Resume content not found!");
    return;
  }

  const previewToast = toast.info("📄 Generating preview...", {
    autoClose: false,
  });

  try {
    const pdfOptions = {
      margin: options.margin || [5, 5, 5, 5],
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: options.scale || 2, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => 
          element.getAttribute('data-html2canvas-ignore') === 'true' ||
          element.classList.contains('no-print') ||
          element.tagName === 'BUTTON' ||
          element.closest('button') !== null,
      },
      jsPDF: { 
        unit: "mm", 
        format: "a4", 
        orientation: "portrait",
        compress: true
      },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    const pdf = await html2pdf()
      .from(element)
      .set(pdfOptions)
      .toPdf()
      .get('pdf');

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    toast.update(previewToast, {
      render: "✅ Preview opened in new tab!",
      type: "success",
      autoClose: 3000,
    });
  } catch (err) {
    console.error("❌ Preview Error:", err);
    toast.update(previewToast, {
      render: "❌ Failed to generate preview",
      type: "error",
      autoClose: 3000,
    });
  }
};

/**
 * Get PDF as blob for custom handling
 * @param {React.RefObject} resumeRef - The ref attached to the resume paper container
 * @param {Object} options - PDF options
 * @returns {Promise<Blob>} PDF blob
 */
export const getPDFBlob = async (resumeRef, options = {}) => {
  const element = resumeRef.current;
  
  if (!element) {
    throw new Error("Resume element not found");
  }

  const pdfOptions = {
    margin: options.margin || [5, 5, 5, 5],
    image: { type: "jpeg", quality: options.quality || 0.98 },
    html2canvas: { 
      scale: options.scale || 2, 
      useCORS: true,
      backgroundColor: '#ffffff',
      ignoreElements: (element) => 
        element.getAttribute('data-html2canvas-ignore') === 'true' ||
        element.classList.contains('no-print') ||
        element.tagName === 'BUTTON' ||
        element.closest('button') !== null,
    },
    jsPDF: { 
      unit: "mm", 
      format: "a4", 
      orientation: "portrait",
      compress: true
    },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  const pdf = await html2pdf()
    .from(element)
    .set(pdfOptions)
    .toPdf()
    .get('pdf');

  return pdf.output('blob');
};

// Export utility functions
export const pdfUtils = {
  handleGlobalDownload,
  handlePreviewPDF,
  getPDFBlob,
};