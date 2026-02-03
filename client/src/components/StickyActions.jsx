import React, { useState } from 'react';
import { Download, Share2, Sparkles } from "lucide-react";

const StickyActions = ({ onDownload, onShare }) => {
  const [showDownloadLabel, setShowDownloadLabel] = useState(false);
  const [showShareLabel, setShowShareLabel] = useState(false);

  return (
    <>
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .glow-green {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.3);
        }

        .glow-blue {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3);
        }

        .tooltip-glow {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-5">
        {/* Download Button */}
        <div 
          className="relative group"
          onMouseEnter={() => setShowDownloadLabel(true)}
          onMouseLeave={() => setShowDownloadLabel(false)}
          style={{ animation: 'float 3s ease-in-out infinite' }}
        >
          {/* Glowing background blur */}
          <div 
            className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"
            style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
          ></div>
          
          {/* Main button */}
          <button
            onClick={onDownload}
            className="relative p-4 rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white hover:from-green-600 hover:via-green-700 hover:to-emerald-700 hover:scale-110 active:scale-95 transition-all duration-300 glow-green"
            title="Download Resume"
          >
            {/* Inner shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <Download size={22} className="relative z-10 drop-shadow-lg" />
          </button>
          
          {/* Tooltip */}
          {showDownloadLabel && (
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white text-sm font-semibold whitespace-nowrap tooltip-glow border border-gray-700 backdrop-blur-sm animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="flex items-center gap-2">
                <Download size={16} className="text-green-400" />
                <span>Download PDF</span>
              </div>
              {/* Arrow pointing to button */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-gray-900"></div>
              </div>
            </div>
          )}
        </div>

        {/* Share Button */}
        <div 
          className="relative group"
          onMouseEnter={() => setShowShareLabel(true)}
          onMouseLeave={() => setShowShareLabel(false)}
          style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}
        >
          {/* Glowing background blur */}
          <div 
            className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"
            style={{ animation: 'glow-pulse 2s ease-in-out infinite 0.5s' }}
          ></div>
          
          {/* Main button */}
          <button
            onClick={onShare}
            className="relative p-4 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white hover:from-blue-600 hover:via-blue-700 hover:to-cyan-700 hover:scale-110 active:scale-95 transition-all duration-300 glow-blue"
            title="Share Resume"
          >
            {/* Inner shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <Share2 size={22} className="relative z-10 drop-shadow-lg" />
          </button>
          
          {/* Tooltip */}
          {showShareLabel && (
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white text-sm font-semibold whitespace-nowrap tooltip-glow border border-gray-700 backdrop-blur-sm animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-blue-400" />
                <span>Share Resume</span>
              </div>
              {/* Arrow pointing to button */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-gray-900"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StickyActions;