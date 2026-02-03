/* src/routes/AppRoutes.jsx */
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AdminProtectedRoute from "./AdminProtectedRoute.jsx";

/* ------------------ Loading UI ------------------ */
const Loading = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white text-lg">Loading...</p>
    </div>
  </div>
);

/* ------------------ Lazy Pages ------------------ */
const Home = lazy(() => import("../pages/Home.jsx"));
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const SignUp = lazy(() => import("../pages/auth/SignUp.jsx"));
const AdminPage = lazy(() => import("../pages/AdminPage.jsx"));
const TemplatePage = lazy(() => import("../pages/TemplatePage.jsx"));
const MyResumesPage = lazy(() => import("../pages/MyResumesPage.jsx"));
const ResumeUploadPage = lazy(() => import("../pages/ResumeUploadPage.jsx"));
const ResumeEditPage = lazy(() => import("../pages/ResumeEditPage.jsx"));
const ATSScorePage = lazy(() => import("../pages/ATSScorePage.jsx"));
const BuildOption = lazy(() => import("../pages/BuildOption.jsx"));

/* Details Pages */
const PersonalDetails = lazy(() => import("../pages/details/PersonalDetails.jsx"));
const WorkExperience = lazy(() => import("../pages/details/WorkExperience.jsx"));
const Languages = lazy(() => import("../pages/details/Languages.jsx"));
const Skills = lazy(() => import("../pages/details/Skills.jsx"));
const Education = lazy(() => import("../pages/details/Education.jsx"));
const Projects = lazy(() => import("../pages/details/Projects.jsx"));
const OtherDetails = lazy(() => import("../pages/details/OtherDetails.jsx"));

/* Resume Templates */
import Template1 from "../components/ai-resume-templates/Template1.jsx";
import Template2 from "../components/ai-resume-templates/Template2.jsx";
import Template3 from "../components/ai-resume-templates/Template3.jsx";
import Template4 from "../components/ai-resume-templates/Template4.jsx";
import Template5 from "../components/ai-resume-templates/Template5.jsx";
import Template6 from "../components/ai-resume-templates/Template6.jsx";
import Template7 from "../components/ai-resume-templates/Template7.jsx";
import Template8 from "../components/ai-resume-templates/Template8.jsx";
import Template9 from "../components/ai-resume-templates/Template9.jsx";
import Template10 from "../components/ai-resume-templates/Template10.jsx";
import Template11 from "../components/ai-resume-templates/Template11.jsx";
import Template12 from "../components/ai-resume-templates/Template12.jsx";
import Template13 from "../components/ai-resume-templates/Template13.jsx";
import Template14 from "../components/ai-resume-templates/Template14.jsx";
import Template15 from "../components/ai-resume-templates/Template15.jsx";
import Template16 from "../components/ai-resume-templates/Template16.jsx";
import Template17 from "../components/ai-resume-templates/Template17.jsx";
import Template18 from "../components/ai-resume-templates/Template18.jsx";
import Template19 from "../components/ai-resume-templates/Template19.jsx";
import Template20 from "../components/ai-resume-templates/Template20.jsx";
import Template21 from "../components/ai-resume-templates/Template21.jsx";
import Template22 from "../components/ai-resume-templates/Template22.jsx";
import Template23 from "../components/ai-resume-templates/Template23.jsx";
import Template24 from "../components/ai-resume-templates/Template24.jsx";
import Template25 from "../components/ai-resume-templates/Template25.jsx";
import Template26 from "../components/ai-resume-templates/Template26.jsx";
import Template27 from "../components/ai-resume-templates/Template27.jsx";
import Template28 from "../components/ai-resume-templates/Template28.jsx";
import Template29 from "../components/ai-resume-templates/Template29.jsx";
import Template30 from "../components/ai-resume-templates/Template30.jsx";

const NotFound = lazy(() => import("../pages/NotFound.jsx"));

/* ------------------ Routes ------------------ */
const AppRoutes = ({ resumeRef }) => {
  // Helper to wrap templates so they attach to the Ref
  const TemplateWrapper = ({ Component }) => (
    <div ref={resumeRef} className="resume-capture-area bg-white">
      <Component />
    </div>
  );

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* -------- Public Routes -------- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* -------- Resume Flow -------- */}
        <Route path="/templatepage" element={<TemplatePage />} />
        <Route path="/my-resumes" element={<MyResumesPage />} />
        <Route path="/ai-edit" element={<ResumeUploadPage />} />
        <Route path="/edit-resume" element={<ResumeEditPage />} />
        <Route path="/ats-score" element={<ATSScorePage />} />

        {/* -------- Build Flow -------- */}
        <Route path="/build-option" element={<BuildOption />} />

        {/* -------- Details Flow -------- */}
        <Route path="/details/personal-details" element={<PersonalDetails />} />
        <Route path="/details/work-experience" element={<WorkExperience />} />
        <Route path="/details/languages" element={<Languages />} />
        <Route path="/details/skills" element={<Skills />} />
        <Route path="/details/education" element={<Education />} />
        <Route path="/details/projects" element={<Projects />} />
        <Route path="/details/other" element={<OtherDetails />} />

        {/* -------- Templates (Functional for Download/Share) -------- */}
        <Route path="/template1" element={<TemplateWrapper Component={Template1} />} />
        <Route path="/template2" element={<TemplateWrapper Component={Template2} />} />
        <Route path="/template3" element={<TemplateWrapper Component={Template3} />} />
        <Route path="/template4" element={<TemplateWrapper Component={Template4} />} />
        <Route path="/template5" element={<TemplateWrapper Component={Template5} />} />
        <Route path="/template6" element={<TemplateWrapper Component={Template6} />} />
        <Route path="/template7" element={<TemplateWrapper Component={Template7} />} />
        <Route path="/template8" element={<TemplateWrapper Component={Template8} />} />
        <Route path="/template9" element={<TemplateWrapper Component={Template9} />} />
        <Route path="/template10" element={<TemplateWrapper Component={Template10} />} />
        <Route path="/template11" element={<TemplateWrapper Component={Template11} />} />
        <Route path="/template12" element={<TemplateWrapper Component={Template12} />} />
        <Route path="/template13" element={<TemplateWrapper Component={Template13} />} />
        <Route path="/template14" element={<TemplateWrapper Component={Template14} />} />
        <Route path="/template15" element={<TemplateWrapper Component={Template15} />} />
        <Route path="/template16" element={<TemplateWrapper Component={Template16} />} />
        <Route path="/template17" element={<TemplateWrapper Component={Template17} />} />
        <Route path="/template18" element={<TemplateWrapper Component={Template18} />} />
        <Route path="/template19" element={<TemplateWrapper Component={Template19} />} />
        <Route path="/template20" element={<TemplateWrapper Component={Template20} />} />
        <Route path="/template21" element={<TemplateWrapper Component={Template21} />} />
        <Route path="/template22" element={<TemplateWrapper Component={Template22} />} />
        <Route path="/template23" element={<TemplateWrapper Component={Template23} />} />
        <Route path="/template24" element={<TemplateWrapper Component={Template24} />} />
        <Route path="/template25" element={<TemplateWrapper Component={Template25} />} />
        <Route path="/template26" element={<TemplateWrapper Component={Template26} />} />
        <Route path="/template27" element={<TemplateWrapper Component={Template27} />} />
        <Route path="/template28" element={<TemplateWrapper Component={Template28} />} />
        <Route path="/template29" element={<TemplateWrapper Component={Template29} />} />
        <Route path="/template30" element={<TemplateWrapper Component={Template30} />} />

        {/* -------- Admin (Protected) -------- */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminPage />
            </AdminProtectedRoute>
          }
        />

        {/* -------- 404 -------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;