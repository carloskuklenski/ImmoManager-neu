import React, { useState } from 'react';
import { Home, Building, Users, Menu, X, PieChart, FileSpreadsheet, Calculator, TrendingUp, Share2, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, login, logout, isLoading, checkLoginStatus } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'properties', label: 'Immobilien', icon: Building },
    { id: 'tenants', label: 'Mieter', icon: Users },
    { id: 'utilities', label: 'Nebenkosten', icon: FileSpreadsheet },
    { id: 'rent-increases', label: 'Mieterhöhungen', icon: TrendingUp },
    { id: 'calculator', label: 'Renditerechner', icon: Calculator },
    { id: 'portfolio', label: 'Portfolio & Sharing', icon: Share2 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400 animate-pulse">ImmoManager wird geladen...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center">
              <Home className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">ImmoManager</h1>
            <p className="text-slate-400 text-lg">
              Ihre professionelle Immobilienverwaltung. Sicher, effizient und überall griffbereit.
            </p>
          </div>

          <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6">Willkommen zurück</h2>
            <div className="space-y-4">
              <button 
                onClick={login}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all font-bold text-lg shadow-xl shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="w-6 h-6" />
                Mit Google anmelden
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-800 px-2 text-slate-500">Probleme?</span></div>
              </div>

              <button 
                onClick={checkLoginStatus}
                className="w-full text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                Anmeldestatus manuell prüfen
              </button>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 text-left leading-relaxed">
                  <span className="text-emerald-500 font-semibold">Safari/iOS Nutzer:</span> Falls die Anmeldung nicht reagiert, deaktivieren Sie bitte in den Einstellungen unter "Safari" die Option <span className="italic">"Cross-Sitetracking verhindern"</span> oder nutzen Sie Chrome/Desktop.
                </p>
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-500 leading-relaxed">
              Durch die Anmeldung stimmen Sie unseren Nutzungsbedingungen zu. 
              Ihre Daten werden sicher in Ihrem Google Drive gespeichert.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="text-center">
              <div className="text-emerald-400 font-bold text-xl">100%</div>
              <div className="text-slate-500 text-xs uppercase tracking-wider">Sicher</div>
            </div>
            <div className="text-center border-x border-slate-800">
              <div className="text-emerald-400 font-bold text-xl">Cloud</div>
              <div className="text-slate-500 text-xs uppercase tracking-wider">Sync</div>
            </div>
            <div className="text-center">
              <div className="text-emerald-400 font-bold text-xl">Free</div>
              <div className="text-slate-500 text-xs uppercase tracking-wider">Tools</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950 shrink-0">
          <span className="text-xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6 text-emerald-400" />
            ImmoManager
          </span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-4 py-2 text-slate-300">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Abmelden
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8">
          <button 
            className="lg:hidden mr-4 text-slate-500 hover:text-slate-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">
            {navItems.find(i => i.id === activeTab)?.label}
          </h1>
        </header>
        
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
