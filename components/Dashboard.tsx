
import React, { useState, useEffect, useRef } from 'react';
import { Task, Bill } from '../types';
import { 
  Bell, 
  ChevronRight, 
  MoreHorizontal, 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard, 
  Plus, 
  MapPin,
  ExternalLink,
  RefreshCcw,
  BarChart3,
  Download
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  tasks: Task[];
  bills: Bill[];
  userName: string;
  userAvatar: string;
  onOpenModal: () => void;
  onSeeAllTasks: () => void;
  onViewTask: (task: Task) => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  timeFormat: '24h' | '12h';
  language: 'fr' | 'en';
}

const Dashboard: React.FC<DashboardProps> = ({ 
  tasks, bills, userName, userAvatar, onOpenModal, onSeeAllTasks, onViewTask, onOpenProfile, onOpenNotifications, timeFormat, language 
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeBills = Array.isArray(bills) ? bills : [];

  const completedCount = safeTasks.filter(t => t.status === 'completed').length;
  const totalCount = safeTasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const chartData = [
    { name: 'Completed', value: completedCount, color: '#2563eb' },
    { name: 'Remaining', value: totalCount - completedCount, color: '#e2e8f0' },
  ];

  // --- Weekly Productivity Score ---
  const getWeekBounds = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { monday, sunday };
  };
  const { monday, sunday } = getWeekBounds();
  const weekTasks = safeTasks.filter(t => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return d >= monday && d <= sunday;
  });
  const weekCompleted = weekTasks.filter(t => t.status === 'completed').length;
  const weekTotal = weekTasks.length;
  const weekRate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

  const getProductivityEmoji = (rate: number) => {
    if (rate >= 90) return { emoji: '🏆', label: language === 'fr' ? 'Exceptionnel !' : 'Outstanding!', color: 'text-yellow-500' };
    if (rate >= 70) return { emoji: '🔥', label: language === 'fr' ? 'Excellent !' : 'On fire!', color: 'text-orange-500' };
    if (rate >= 50) return { emoji: '💪', label: language === 'fr' ? 'Bon travail !' : 'Good work!', color: 'text-blue-500' };
    if (rate >= 1)  return { emoji: '🎯', label: language === 'fr' ? 'On continue !' : 'Keep going!', color: 'text-indigo-500' };
    return { emoji: '📋', label: language === 'fr' ? 'Planifiez !' : 'Plan ahead!', color: 'text-slate-400' };
  };
  const productivity = getProductivityEmoji(weekRate);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const translations = language === 'fr' ? {
    greeting: `Bonjour, ${userName} 👋`,
    subGreeting: "Prêt pour votre session de planification aujourd'hui ?",
    add: "Ajouter",
    search: "Rechercher...",
    totalEvents: "Événements totaux",
    scheduledTasks: "Tâches planifiées",
    activeFinances: "Finances actives",
    todaySchedule: "Planning du jour",
    seeAll: "Voir tout",
    progress: "Progrès Quotidien",
    done: "Réalisé",
    remaining: "Restant",
    nextBill: "Prochain paiement",
    amount: "Montant",
    manage: "Gérer",
    noTasks: "Aucune tâche pour le moment. Cliquez sur Ajouter !",
    status: { todo: 'À faire', inProgress: 'En cours', completed: 'Terminé' },
    menu: {
      details: "Voir détails",
      refresh: "Actualiser",
      export: "Exporter",
      addTask: "Ajouter tâche",
      addBill: "Ajouter facture"
    }
  } : {
    greeting: `Hello, ${userName} 👋`,
    subGreeting: "Ready for your planning session today?",
    add: "Add",
    search: "Search...",
    totalEvents: "Total events",
    scheduledTasks: "Scheduled tasks",
    activeFinances: "Active finances",
    todaySchedule: "Today's schedule",
    seeAll: "See all",
    progress: "Daily Progress",
    done: "Done",
    remaining: "Remaining",
    nextBill: "Next payment",
    amount: "Amount",
    manage: "Manage",
    noTasks: "No tasks yet. Click Add!",
    status: { todo: 'To do', inProgress: 'In progress', completed: 'Completed' },
    menu: {
      details: "View details",
      refresh: "Refresh",
      export: "Export",
      addTask: "Add task",
      addBill: "Add bill"
    }
  };

  const formatTimeDisplay = (timeRange: string) => {
    if (!timeRange || typeof timeRange !== 'string') return 'N/A';
    if (timeFormat === '24h') return timeRange;
    return timeRange.split(' - ').map(t => {
      const [h, m] = t.split(':').map(Number);
      if (isNaN(h)) return t;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    }).join(' - ');
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const StatMenu = ({ id }: { id: string }) => {
    if (activeMenu !== id) return null;
    return (
      <div 
        ref={menuRef}
        className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200"
      >
        <button 
          onClick={() => { setActiveMenu(null); onSeeAllTasks(); }}
          className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
        >
          <BarChart3 size={16} className="text-blue-500" /> {translations.menu.details}
        </button>
        <button 
          onClick={() => setActiveMenu(null)}
          className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
        >
          <RefreshCcw size={16} className="text-slate-400" /> {translations.menu.refresh}
        </button>
        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
        <button 
          onClick={() => setActiveMenu(null)}
          className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
        >
          <Download size={16} className="text-slate-400" /> {translations.menu.export}
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif-display text-slate-800 dark:text-slate-100 tracking-tight transition-colors mb-2 animate-fade-up">{translations.greeting}</h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium animate-fade-up" style={{ animationDelay: '0.1s' }}>{translations.subGreeting}</p>
        </div>
        <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <button onClick={onOpenModal} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-full font-medium hover:scale-105 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
            <Plus size={18} /> <span>{translations.add}</span>
          </button>
          <button 
            onClick={onOpenNotifications}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell size={20} /> <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          <button 
            onClick={onOpenProfile}
            className="hidden md:block w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:scale-110 active:scale-95 transition-all shadow-sm ring-2 ring-transparent hover:ring-blue-500/30"
          >
            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform"><CalendarIcon size={22} /></div>
                <button onClick={(e) => toggleMenu(e, 'total')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
                </button>
                <StatMenu id="total" />
              </div>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalCount + safeBills.length}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{translations.totalEvents}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform"><Clock size={22} /></div>
                <button onClick={(e) => toggleMenu(e, 'tasks')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
                </button>
                <StatMenu id="tasks" />
              </div>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{safeTasks.length}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{translations.scheduledTasks}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform"><CreditCard size={22} /></div>
                <button onClick={(e) => toggleMenu(e, 'finances')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
                </button>
                <StatMenu id="finances" />
              </div>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{safeBills.length}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{translations.activeFinances}</p>
            </div>
          </div>

          <section className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 md:p-8 transition-colors animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{translations.todaySchedule}</h3>
              <button onClick={onSeeAllTasks} className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 hover:underline active:scale-95 transition-all">{translations.seeAll} <ChevronRight size={16} /></button>
            </div>
            <div className="space-y-4">
              {safeTasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => onViewTask(task)}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className={`w-1 md:w-1.5 h-10 rounded-full shrink-0 transition-all group-hover:w-2 ${task.color === 'blue' ? 'bg-blue-500' : task.color === 'green' ? 'bg-green-500' : task.color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors truncate">{task.title}</h5>
                      <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 font-medium">
                        <span className="flex items-center gap-1"><Clock size={10} /> {formatTimeDisplay(task.time)}</span>
                        <span className="hidden xs:inline">•</span>
                        <span className="opacity-75">{task.type}</span>
                        {task.location && <span className="flex items-center gap-1 text-red-500 truncate"><MapPin size={10} /> {task.location.name}</span>}
                      </p>
                    </div>
                  </div>
                  <div className={`shrink-0 ml-2 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : task.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {task.status === 'completed' ? translations.status.completed : task.status === 'in-progress' ? translations.status.inProgress : translations.status.todo}
                  </div>
                </div>
              ))}
              {safeTasks.length === 0 && <div className="py-8 text-center text-slate-400 font-medium italic">{translations.noTasks}</div>}
            </div>
          </section>
        </div>
 
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <section className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 md:p-8 relative transition-colors animate-fade-up" style={{ animationDelay: '0.3s' }}>
             <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">{translations.progress}</h3>
             <div className="h-40 md:h-48 w-full flex flex-col items-center justify-center relative">
                 <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" animationDuration={1000}>{chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie></PieChart></ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">{completionRate}%</span>
                   <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest">{translations.done}</span>
                </div>
             </div>
             <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4">
               <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                 <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{translations.remaining}</p>
                 <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{safeTasks.length - completedCount}</p>
               </div>
               <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                 <p className="text-[10px] text-blue-400 dark:text-blue-500 font-bold uppercase tracking-wider">{translations.done}</p>
                 <p className="text-lg font-bold text-blue-800 dark:text-blue-100">{completedCount}</p>
               </div>
             </div>
          </section>
 
          {/* Weekly Productivity Score Card */}
          <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-6 md:p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 overflow-hidden relative animate-fade-up" style={{ animationDelay: '0.35s' }}>
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full" />
            <div className="absolute -left-4 -bottom-6 w-20 h-20 bg-white/5 rounded-full" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-0.5">
                    {language === 'fr' ? 'Score Semaine' : 'Weekly Score'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{productivity.emoji}</span>
                    <span className="text-lg font-extrabold">{productivity.label}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-extrabold">{weekRate}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${weekRate}%` }}
                  />
                </div>
                <p className="text-[10px] text-indigo-200 font-bold">
                  {weekCompleted}/{weekTotal} {language === 'fr' ? 'tâches complétées cette semaine' : 'tasks completed this week'}
                </p>
              </div>

              {/* Breakdown by type */}
              {weekTotal > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['Task', 'Meeting', 'Course'] as const).map(type => {
                    const typeCount = weekTasks.filter(t => t.type === type).length;
                    const typeLabel = type === 'Task'
                      ? (language === 'fr' ? 'Tâches' : 'Tasks')
                      : type === 'Meeting'
                        ? (language === 'fr' ? 'RDV' : 'Meetings')
                        : (language === 'fr' ? 'Cours' : 'Courses');
                    return (
                      <div key={type} className="text-center bg-white/10 rounded-2xl py-2">
                        <p className="text-lg font-extrabold">{typeCount}</p>
                        <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-wide">{typeLabel}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
 
          {safeBills.length > 0 && (
            <section className="bg-blue-600 rounded-[32px] p-6 md:p-8 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/30 overflow-hidden relative group animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="absolute -right-10 -top-10 w-24 md:w-32 h-24 md:h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative z-10">
                <h3 className="text-[10px] md:text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">{translations.nextBill}</h3>
                <p className="text-lg md:text-xl font-bold mb-4 line-clamp-1">{safeBills[0].name}</p>
                <div className="flex justify-between items-end">
                   <div>
                    <p className="text-[9px] md:text-[10px] text-blue-100 opacity-70 uppercase tracking-widest font-bold mb-0.5">{translations.amount}</p>
                    <p className="text-2xl md:text-3xl font-extrabold">{Number(safeBills[0].amount).toFixed(2)} €</p>
                  </div>
                  <button className="bg-white text-blue-600 px-4 md:px-5 py-2 rounded-xl font-bold text-[10px] md:text-xs shadow-lg hover:bg-blue-50 transition-colors active:scale-95">{translations.manage}</button>
                </div>
              </div>
            </section>
          )} 
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
