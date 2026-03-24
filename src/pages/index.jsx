import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import Layout from "./Layout.jsx";
import PrivateRoute from "../components/PrivateRoute";
import { Loader2 } from "lucide-react";

const LandingPage = lazy(() => import("./LandingPage"));
const Login = lazy(() => import("./Login"));
const Dashboard = lazy(() => import("./Dashboard"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const CreatePetition = lazy(() => import("./CreatePetition"));
const PetitionsList = lazy(() => import("./PetitionsList"));
const PetitionDetails = lazy(() => import("./PetitionDetails"));
const PetitionLanding = lazy(() => import("./PetitionLanding"));
const LinkTreePages = lazy(() => import("./LinkTreePages"));
const LinkTreeView = lazy(() => import("./LinkTreeView"));
const WhatsAppSender = lazy(() => import("./WhatsAppSender"));
const WhatsAppCampaigns = lazy(() => import("./WhatsAppCampaigns"));
const CreateWhatsAppCampaign = lazy(() => import("./CreateWhatsAppCampaign"));
const MessageTemplates = lazy(() => import("./MessageTemplates"));
const ImportSignatures = lazy(() => import("./ImportSignatures"));
const LinkBioPages = lazy(() => import("./LinkBioPages"));
const PPage = lazy(() => import("./p"));
const BioPage = lazy(() => import("./bio"));
const PetitionDemo = lazy(() => import("./PetitionDemo"));
const TermosDeUso = lazy(() => import("./TermosDeUso"));

const PAGES = {
  LandingPage,
  Login,
  Dashboard,
  AdminDashboard,
  CreatePetition,
  PetitionsList,
  PetitionDetails,
  PetitionLanding,
  LinkTreePages,
  LinkTreeView,
  WhatsAppSender,
  WhatsAppCampaigns,
  CreateWhatsAppCampaign,
  MessageTemplates,
  ImportSignatures,
  LinkBioPages,
  p: PPage,
  bio: BioPage,
};

function _getCurrentPage(pathname) {
  let url = pathname;
  if (url.endsWith("/")) url = url.slice(0, -1);
  if (url === "" || url === "/") return "LandingPage";
  let last = url.split("/").pop() || "";
  if (last.includes("?")) last = last.split("?")[0];
  const pageName = Object.keys(PAGES).find((page) => page.toLowerCase() === last.toLowerCase());
  return pageName || "LandingPage";
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
        <p className="text-white/70 text-sm">Carregando...</p>
      </div>
    </div>
  );
}

function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/admindashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/createpetition" element={<PrivateRoute><CreatePetition /></PrivateRoute>} />
          <Route path="/petitionslist" element={<PrivateRoute><PetitionsList /></PrivateRoute>} />
          <Route path="/petitiondetails" element={<PrivateRoute><PetitionDetails /></PrivateRoute>} />
          <Route path="/linktreepages" element={<PrivateRoute><LinkTreePages /></PrivateRoute>} />
          <Route path="/linktreeview" element={<PrivateRoute><LinkTreeView /></PrivateRoute>} />
          <Route path="/whatsappsender" element={<PrivateRoute><WhatsAppSender /></PrivateRoute>} />
          <Route path="/whatsappcampaigns" element={<PrivateRoute><WhatsAppCampaigns /></PrivateRoute>} />
          <Route path="/createwhatsappcampaign" element={<PrivateRoute><CreateWhatsAppCampaign /></PrivateRoute>} />
          <Route path="/messagetemplates" element={<PrivateRoute><MessageTemplates /></PrivateRoute>} />
          <Route path="/importsignatures" element={<PrivateRoute><ImportSignatures /></PrivateRoute>} />
          <Route path="/linkbiopages" element={<PrivateRoute><LinkBioPages /></PrivateRoute>} />
          <Route path="/petitionlanding" element={<PetitionLanding />} />
          <Route path="/p" element={<PPage />} />
          <Route path="/bio" element={<BioPage />} />
          <Route path="/petition-demo" element={<PetitionDemo />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          
          <Route path="/Login" element={<Navigate to="/login" replace />} />
          <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/AdminDashboard" element={<Navigate to="/admindashboard" replace />} />
          <Route path="/CreatePetition" element={<Navigate to="/createpetition" replace />} />
          <Route path="/PetitionsList" element={<Navigate to="/petitionslist" replace />} />
          <Route path="/PetitionDetails" element={<Navigate to="/petitiondetails" replace />} />
          <Route path="/LinkTreePages" element={<Navigate to="/linktreepages" replace />} />
          <Route path="/LinkTreeView" element={<Navigate to="/linktreeview" replace />} />
          <Route path="/WhatsAppSender" element={<Navigate to="/whatsappsender" replace />} />
          <Route path="/WhatsAppCampaigns" element={<Navigate to="/whatsappcampaigns" replace />} />
          <Route path="/CreateWhatsAppCampaign" element={<Navigate to="/createwhatsappcampaign" replace />} />
          <Route path="/MessageTemplates" element={<Navigate to="/messagetemplates" replace />} />
          <Route path="/ImportSignatures" element={<Navigate to="/importsignatures" replace />} />
          <Route path="/LinkBioPages" element={<Navigate to="/linkbiopages" replace />} />
          <Route path="/PetitionLanding" element={<Navigate to="/petitionlanding" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default function Pages() {
  const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return (
    <Router basename={basename}>
      <PagesContent />
    </Router>
  );
}
