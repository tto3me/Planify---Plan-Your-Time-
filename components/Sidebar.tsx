
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { LogOut, Settings, X, Search } from 'lucide-react';
import Logo from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  language: 'fr' | 'en';
  onLogoutClick: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  language,
  onLogoutClick,
  isOpen,
  onClose
}) => {
  const translations: Record<string, string> = language === 'fr' ? {
    dashboard: 'Dashboard',
    calendar: 'Calendrier',
    courses: 'Cours',
    finances: 'Finances',
    notifications: 'Notifications',
    trash: 'Corbeille',
    settings: 'Réglages',
    about: 'À propos',
    logout: 'Déconnexion',
    search: 'Rechercher...'
  } : {
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    courses: 'Courses',
    finances: 'Finances',
    notifications: 'Notifications',
    trash: 'Trash',
    settings: 'Settings',
    about: 'About Us',
    logout: 'Logout',
    search: 'Search for...'
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <aside className={`fixed left-0 top-0 h-full w-64 glass-nav border-r border-[var(--color-border)] flex flex-col z-[50] transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <h1 className="text-xl font-bold text-[var(--color-text)] tracking-wide lowercase pt-0.5">planify</h1>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-hover-bg)] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder={translations.search}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-subtle-bg)] border border-[var(--color-subtle-border)] rounded-xl text-sm text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[#6c5ce7]/50 focus:ring-1 focus:ring-[#6c5ce7]/20 transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out ${
                activeTab === item.id
                  ? 'bg-[#6c5ce7]/15 text-[#a78bfa] border border-[#6c5ce7]/25 shadow-[0_0_15px_rgba(108,92,231,0.2)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-hover-bg)] hover:text-[var(--color-text)] border border-transparent hover:translate-x-1'
              }`}
            >
              <span className={`transition-colors ${activeTab === item.id ? 'text-[#a78bfa]' : 'text-[var(--color-text-dim)]'}`}>
                {item.icon}
              </span>
              {translations[item.id] || item.label}
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6c5ce7] shadow-[0_0_8px_#6c5ce7]" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--color-border)] space-y-0.5">
          <button 
            onClick={() => { setActiveTab('settings'); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out ${
              activeTab === 'settings'
                ? 'bg-[#6c5ce7]/15 text-[#a78bfa] border border-[#6c5ce7]/25 shadow-[0_0_15px_rgba(108,92,231,0.2)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-hover-bg)] hover:text-[var(--color-text)] border border-transparent hover:translate-x-1'
            }`}
          >
            <Settings size={20} className={activeTab === 'settings' ? 'text-[#a78bfa]' : 'text-[var(--color-text-dim)]'} />
            {translations['settings']}
          </button>

          <button 
            onClick={onLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 ease-out hover:translate-x-1 border border-transparent active:scale-95"
          >
            <LogOut size={20} />
            {translations['logout']}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
