/* src/components/Navbar/Navbar.jsx */
import React from "react";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Exact Teal-to-Orange gradient for the top-right button
  const buttonGradient = {
    background: "linear-gradient(90deg, #14b8a6 0%, #f97316 100%)",
    border: "none"
  };

  return (
    <>
      {/* Navbar Container: Background set to Dark Blue/Black */}
      <nav className="fixed top-0 left-0 right-0 h-16 z-[100] bg-[#0f172a] text-white shadow-lg">
        <div className="max-w-full mx-auto px-10 h-full flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/UptoSkills_logo.png" alt="UptoSkills Logo" className="h-7 w-auto" />
              
              {/* Dynamic Gradient Text for AI Resume Builder */}
              <span className="text-lg font-bold tracking-tight uppercase bg-gradient-to-r from-[#14b8a6] to-[#f97316] bg-clip-text text-transparent">
                AI Resume Builder
              </span>
            </Link>
          </div>

          {/* Right Side Actions (Top Navbar Only) */}
          <div className="flex items-center space-x-6">
            {!isAuthenticated ? (
              <>
                <Link to="/signup" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                  SignUp
                </Link>
                <Link 
                  to="/login" 
                  style={buttonGradient} 
                  className="text-white px-6 py-2 rounded-md text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
                >
                  SignIn
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-400">Dashboard</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent page content from being hidden behind the fixed navbar */}
      <div className="h-16 w-full"></div>
    </>
  );
};

export default Navbar;