import './styles/index.css';
import React, { useRef } from 'react'; // 1. Import useRef
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ResumeProvider } from './context/ResumeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { UniversalSaveProvider } from './components/UniversalSaveProvider.jsx';

// Import universal save service
import './services/universalSaveService.js';

function App() {
  // 2. Create the reference that will hold the Resume DOM element
  const resumeRef = useRef(null);

  return (
    <>
      <AuthProvider>
        <ResumeProvider>
          <UniversalSaveProvider>
            <Router>
              {/* 3. Pass the resumeRef to your routes */}
              <AppRoutes resumeRef={resumeRef} />
            </Router>
          </UniversalSaveProvider>
        </ResumeProvider>
      </AuthProvider>

      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;