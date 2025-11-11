import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";
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
import LinkBioView from "./LinkBioView";

// ⚠️ componentes devem começar com maiúscula senão o React trata como tag HTML
import PPage from "./p";
import BioPage from "./bio";

import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

const PAGES = {
  Dashboard,
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
  LinkBioView,
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

// Conteúdo que depende da localização (já com basename aplicado pelo Router)
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/CreatePetition" element={<CreatePetition />} />
        <Route path="/PetitionsList" element={<PetitionsList />} />
        <Route path="/PetitionDetails" element={<PetitionDetails />} />
        <Route path="/PetitionLanding" element={<PetitionLanding />} />
        <Route path="/LinkTreePages" element={<LinkTreePages />} />
        <Route path="/LinkTreeView" element={<LinkTreeView />} />
        <Route path="/WhatsAppSender" element={<WhatsAppSender />} />
        <Route path="/EmailSender" element={<EmailSender />} />
        <Route path="/WhatsAppCampaigns" element={<WhatsAppCampaigns />} />
        <Route path="/CreateWhatsAppCampaign" element={<CreateWhatsAppCampaign />} />
        <Route path="/EmailCampaigns" element={<EmailCampaigns />} />
        <Route path="/CreateEmailCampaign" element={<CreateEmailCampaign />} />
        <Route path="/MessageTemplates" element={<MessageTemplates />} />
        <Route path="/ImportSignatures" element={<ImportSignatures />} />
        <Route path="/LinkBioPages" element={<LinkBioPages />} />
        <Route path="/LinkBioView" element={<LinkBioView />} />
        <Route path="/p" element={<PPage />} />
        <Route path="/bio" element={<BioPage />} />
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  // Usa o base definido no Vite (base: '/peticoes/'); remove barra final p/ Router
  const basename = (import.meta.env.BASE_URL || "/peticoes/").replace(/\/$/, "");
  return (
    <Router basename={basename}>
      <PagesContent />
    </Router>
  );
}
