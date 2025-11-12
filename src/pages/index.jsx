import Layout from "./Layout.jsx";
import PrivateRoute from "../components/PrivateRoute";

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

// ⚠️ componentes devem começar com maiúscula senão o React trata como tag HTML
import PPage from "./p";
import BioPage from "./bio";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";

const PAGES = {
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
  let last = url.split("/").pop() || "";
  if (last.includes("?")) last = last.split("?")[0];
  const pageName = Object.keys(PAGES).find((page) => page.toLowerCase() === last.toLowerCase());
  return pageName || Object.keys(PAGES)[0];
}

function RootRedirect() {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/Dashboard" replace /> : <Navigate to="/Login" replace />;
}

// Conteúdo que depende da localização (já com basename aplicado pelo Router)
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/Login" element={<Login />} />
        
        <Route path="/Dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/AdminDashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/CreatePetition" element={<PrivateRoute><CreatePetition /></PrivateRoute>} />
        <Route path="/PetitionsList" element={<PrivateRoute><PetitionsList /></PrivateRoute>} />
        <Route path="/PetitionDetails" element={<PrivateRoute><PetitionDetails /></PrivateRoute>} />
        <Route path="/LinkTreePages" element={<PrivateRoute><LinkTreePages /></PrivateRoute>} />
        <Route path="/LinkTreeView" element={<PrivateRoute><LinkTreeView /></PrivateRoute>} />
        <Route path="/WhatsAppSender" element={<PrivateRoute><WhatsAppSender /></PrivateRoute>} />
        <Route path="/EmailSender" element={<PrivateRoute><EmailSender /></PrivateRoute>} />
        <Route path="/WhatsAppCampaigns" element={<PrivateRoute><WhatsAppCampaigns /></PrivateRoute>} />
        <Route path="/CreateWhatsAppCampaign" element={<PrivateRoute><CreateWhatsAppCampaign /></PrivateRoute>} />
        <Route path="/EmailCampaigns" element={<PrivateRoute><EmailCampaigns /></PrivateRoute>} />
        <Route path="/CreateEmailCampaign" element={<PrivateRoute><CreateEmailCampaign /></PrivateRoute>} />
        <Route path="/MessageTemplates" element={<PrivateRoute><MessageTemplates /></PrivateRoute>} />
        <Route path="/ImportSignatures" element={<PrivateRoute><ImportSignatures /></PrivateRoute>} />
        <Route path="/LinkBioPages" element={<PrivateRoute><LinkBioPages /></PrivateRoute>} />
        
        <Route path="/PetitionLanding" element={<PetitionLanding />} />
        <Route path="/p" element={<PPage />} />
        <Route path="/bio" element={<BioPage />} />
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
