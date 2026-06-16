
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { LogOut, Settings, X } from 'lucide-react';
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
    logout: 'Déconnexion'
  } : {
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    courses: 'Courses',
    finances: 'Finances',
    notifications: 'Notifications',
    trash: 'Trash',
    settings: 'Settings',
    about: 'About Us',
    logout: 'Logout'
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[45] lg:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <aside className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-[50] transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <h1 className="text-3xl font-serif-display text-slate-900 dark:text-white tracking-wide lowercase pt-1">planify</h1>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className={activeTab === item.id ? 'text-white' : 'text-slate-400'}>
                {item.icon}
              </span>
              {translations[item.id] || item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Settings size={20} className={activeTab === 'settings' ? 'text-white' : 'text-slate-400'} />
            {translations['settings']}
          </button>

          <button 
            onClick={onLogoutClick}
            className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-300 active:scale-95"
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
