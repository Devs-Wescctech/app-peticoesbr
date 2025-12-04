import Layout from "./Layout.jsx";
import PrivateRoute from "../components/PrivateRoute";

import LandingPage from "./LandingPage";
import Login from "./Login";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import CreatePetition from "./CreatePetition";
import PetitionsList from "./PetitionsList";
import PetitionDetails from "./PetitionDetails";
import PetitionLanding from "./PetitionLanding";
import LinkTreePages from "./LinkTreePages";
import LinkTreeView from "./LinkTreeView";
import WhatsAppSender from "./WhatsAppSender";
import EmailSender from "./EmailSender";
import WhatsAppCampaigns from "./WhatsAppCampaigns";
import CreateWhatsAppCampaign from "./CreateWhatsAppCampaign";
import EmailCampaigns from "./EmailCampaigns";
import CreateEmailCampaign from "./CreateEmailCampaign";
import MessageTemplates from "./MessageTemplates";
import ImportSignatures from "./ImportSignatures";
import LinkBioPages from "./LinkBioPages";

import PPage from "./p";
import BioPage from "./bio";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";

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
  EmailSender,
  WhatsAppCampaigns,
  CreateWhatsAppCampaign,
  EmailCampaigns,
  CreateEmailCampaign,
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

// Conteúdo que depende da localização (já com basename aplicado pelo Router)
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
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
        <Route path="/emailsender" element={<PrivateRoute><EmailSender /></PrivateRoute>} />
        <Route path="/whatsappcampaigns" element={<PrivateRoute><WhatsAppCampaigns /></PrivateRoute>} />
        <Route path="/createwhatsappcampaign" element={<PrivateRoute><CreateWhatsAppCampaign /></PrivateRoute>} />
        <Route path="/emailcampaigns" element={<PrivateRoute><EmailCampaigns /></PrivateRoute>} />
        <Route path="/createemailcampaign" element={<PrivateRoute><CreateEmailCampaign /></PrivateRoute>} />
        <Route path="/messagetemplates" element={<PrivateRoute><MessageTemplates /></PrivateRoute>} />
        <Route path="/importsignatures" element={<PrivateRoute><ImportSignatures /></PrivateRoute>} />
        <Route path="/linkbiopages" element={<PrivateRoute><LinkBioPages /></PrivateRoute>} />
        <Route path="/petitionlanding" element={<PetitionLanding />} />
        <Route path="/p" element={<PPage />} />
        <Route path="/bio" element={<BioPage />} />
        
        {/* Redirects para compatibilidade - rotas antigas PascalCase → lowercase */}
        <Route path="/Login" element={<Navigate to="/login" replace />} />
        <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/AdminDashboard" element={<Navigate to="/admindashboard" replace />} />
        <Route path="/CreatePetition" element={<Navigate to="/createpetition" replace />} />
        <Route path="/PetitionsList" element={<Navigate to="/petitionslist" replace />} />
        <Route path="/PetitionDetails" element={<Navigate to="/petitiondetails" replace />} />
        <Route path="/LinkTreePages" element={<Navigate to="/linktreepages" replace />} />
        <Route path="/LinkTreeView" element={<Navigate to="/linktreeview" replace />} />
        <Route path="/WhatsAppSender" element={<Navigate to="/whatsappsender" replace />} />
        <Route path="/EmailSender" element={<Navigate to="/emailsender" replace />} />
        <Route path="/WhatsAppCampaigns" element={<Navigate to="/whatsappcampaigns" replace />} />
        <Route path="/CreateWhatsAppCampaign" element={<Navigate to="/createwhatsappcampaign" replace />} />
        <Route path="/EmailCampaigns" element={<Navigate to="/emailcampaigns" replace />} />
        <Route path="/CreateEmailCampaign" element={<Navigate to="/createemailcampaign" replace />} />
        <Route path="/MessageTemplates" element={<Navigate to="/messagetemplates" replace />} />
        <Route path="/ImportSignatures" element={<Navigate to="/importsignatures" replace />} />
        <Route path="/LinkBioPages" element={<Navigate to="/linkbiopages" replace />} />
        <Route path="/PetitionLanding" element={<Navigate to="/petitionlanding" replace />} />
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  // Use the base defined in Vite config; remove trailing slash for Router
  const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return (
    <Router basename={basename}>
      <PagesContent />
    </Router>
  );
}
