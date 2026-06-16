
import React from 'react';
import { LayoutDashboard, Calendar, Wallet, ListTodo } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  language: 'fr' | 'en';
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab, language }) => {
  const items = [
    { id: 'dashboard', icon: <LayoutDashboard size={22} />, label: language === 'fr' ? 'Accueil' : 'Home' },
    { id: 'calendar', icon: <Calendar size={22} />, label: language === 'fr' ? 'Agenda' : 'Agenda' },
    { id: 'courses', icon: <ListTodo size={22} />, label: language === 'fr' ? 'Tâches' : 'Tasks' },
    { id: 'finances', icon: <Wallet size={22} />, label: language === 'fr' ? 'Banque' : 'Bank' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around h-16 z-[40] px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center w-full h-full transition-all gap-1 ${
            activeTab === item.id 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === item.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            {item.icon}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
