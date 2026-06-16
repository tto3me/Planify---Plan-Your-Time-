
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Bill } from '../types';
import { 
  Bell, 
  Clock, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Filter,
  ArrowRight,
  Info
} from 'lucide-react';

interface NotificationsPageProps {
  tasks: Task[];
  bills: Bill[];
  onGoToTasks: () => void;
  onGoToFinances: () => void;
  language: 'fr' | 'en';
}

type NotificationCategory = 'all' | 'tasks' | 'finances' | 'system';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: NotificationCategory;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ tasks, bills, onGoToTasks, onGoToFinances, language }) => {
  const [activeFilter, setActiveFilter] = useState<NotificationCategory>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const translations = language === 'fr' ? {
    title: 'Centre de Notifications',
    subTitle: 'Restez informé de vos échéances et activités.',
    empty: 'Aucune notification pour le moment.',
    markAllRead: 'Tout marquer comme lu',
    clearAll: 'Effacer tout',
    categories: {
      all: 'Toutes',
      tasks: 'Tâches',
      finances: 'Finances',
      system: 'Système'
    },
    alerts: {
      taskDueToday: "Tâche aujourd'hui",
      billDueSoon: "Facture proche",
      welcome: "Bienvenue sur Planify !"
    }
  } : {
    title: 'Notifications Center',
    subTitle: 'Stay informed about your deadlines and activities.',
    empty: 'No notifications at the moment.',
    markAllRead: 'Mark all as read',
    clearAll: 'Clear all',
    categories: {
      all: 'All',
      tasks: 'Tasks',
      finances: 'Finances',
      system: 'System'
    },
    alerts: {
      taskDueToday: "Task today",
      billDueSoon: "Bill due soon",
      welcome: "Welcome to Planify!"
    }
  };

  // Generate notifications from props on mount or data change
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const items: NotificationItem[] = [];

    // System Welcome
    items.push({
      id: 'welcome',
      title: translations.alerts.welcome,
      message: language === 'fr' ? "Commencez à planifier votre succès dès aujourd'hui." : "Start planning your success today.",
      time: "Maintenant",
      category: 'system',
      isRead: false,
      priority: 'low'
    });

    // Task Alerts
    tasks.filter(t => t.date === today && t.status !== 'completed').forEach(task => {
      items.push({
        id: `task-${task.id}`,
        title: translations.alerts.taskDueToday,
        message: `${task.title} (${task.time})`,
        time: "Aujourd'hui",
        category: 'tasks',
        isRead: false,
        priority: 'high'
      });
    });

    // Bill Alerts
    bills.filter(b => b.status === 'pending').forEach(bill => {
      items.push({
        id: `bill-${bill.id}`,
        title: translations.alerts.billDueSoon,
        message: `${bill.name} - ${bill.amount} € (Échéance: ${bill.dueDate})`,
        time: bill.dueDate,
        category: 'finances',
        isRead: false,
        priority: 'medium'
      });
    });

    setNotifications(items);
  }, [tasks, bills, language]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => 
    activeFilter === 'all' ? true : n.category === activeFilter
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Bell className="text-blue-600" size={32} /> {translations.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{translations.subTitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 transition-all"
          >
            {translations.markAllRead}
          </button>
          <button 
            onClick={handleClearAll}
            className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 px-2 py-1 flex items-center gap-1 transition-all"
          >
            <Trash2 size={14} /> {translations.clearAll}
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['all', 'tasks', 'finances', 'system'] as NotificationCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeFilter === cat 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-none' 
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {translations.categories[cat]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredNotifications.map((notif) => (
          <div 
            key={notif.id}
            onClick={() => handleMarkRead(notif.id)}
            className={`p-6 bg-white dark:bg-slate-900 rounded-3xl border transition-all hover:shadow-md group relative overflow-hidden cursor-pointer ${
              notif.isRead ? 'border-slate-100 dark:border-slate-800 opacity-80' : 'border-blue-100 dark:border-blue-900/40 ring-4 ring-blue-500/5'
            }`}
          >
            {!notif.isRead && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>}
            
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${
                notif.category === 'tasks' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                notif.category === 'finances' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
              }`}>
                {notif.category === 'tasks' ? <Clock size={24} /> : 
                 notif.category === 'finances' ? <Wallet size={24} /> : 
                 <Info size={24} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate pr-4">{notif.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{notif.message}</p>
                
                <div className="mt-4 flex items-center gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      notif.category === 'tasks' ? onGoToTasks() : onGoToFinances();
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    {language === 'fr' ? 'Consulter' : 'View details'} <ArrowRight size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.id);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                  >
                    {language === 'fr' ? 'Masquer' : 'Dismiss'}
                  </button>
                </div>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notif.id);
                  }}
                  className="p-2 text-slate-300 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="py-20 text-center space-y-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300 dark:text-slate-700">
              <Bell size={32} />
            </div>
            <p className="text-slate-400 dark:text-slate-500 font-medium">{translations.empty}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
