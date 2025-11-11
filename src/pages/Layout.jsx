
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Link2,
  TrendingUp,
  Menu,
  X,
  MessageCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Criar Petição",
    url: createPageUrl("CreatePetition"),
    icon: PlusCircle,
  },
  {
    title: "Minhas Petições",
    url: createPageUrl("PetitionsList"),
    icon: FileText,
  },
  {
    title: "Páginas LinkBio",
    url: createPageUrl("LinkBioPages"),
    icon: Link2,
  },
  {
    title: "Campanhas WhatsApp",
    url: createPageUrl("WhatsAppCampaigns"),
    icon: MessageCircle,
  },
  {
    title: "Campanhas Email",
    url: createPageUrl("EmailCampaigns"),
    icon: Mail,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const primaryColor = "#6366f1";
  const secondaryColor = "#a855f7";

  const isPublicPage = currentPageName === 'PetitionLanding' || 
                       currentPageName === 'LinkBioView' ||
                       currentPageName === 'p' || 
                       currentPageName === 'bio';

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <style>{`
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
        
        .bg-primary-gradient {
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%) !important;
        }
        
        .text-primary {
          color: ${primaryColor} !important;
        }
        
        .border-primary {
          border-color: ${primaryColor} !important;
        }
        
        .hover-primary:hover {
          background-color: ${primaryColor}20 !important;
        }
        
        .progress-bar-primary {
          background: linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%) !important;
        }
      `}</style>

      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex bg-white border-r border-gray-200 flex-col fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
              }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="font-bold text-base text-gray-900">PetiçõesBR</h2>
                <p className="text-xs text-gray-500">Sistema de Petições</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                } : {}}
                title={item.title}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium text-sm">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="border-t border-gray-100">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full p-4 flex items-center justify-center gap-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Minimizar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
              }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-bold text-base text-gray-900">PetiçõesBR</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <nav className="bg-white border-t border-gray-200 p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      <main className={`flex-1 overflow-auto md:mt-0 mt-16 transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        {children}
      </main>
    </div>
  );
}
