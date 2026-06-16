
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
  Download,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Users,
  Zap
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
  onGoToFinances: () => void;
  timeFormat: '24h' | '12h';
  language: 'fr' | 'en';
}

const Dashboard: React.FC<DashboardProps> = ({ 
  tasks, bills, userName, userAvatar, onOpenModal, onSeeAllTasks, onViewTask, onOpenProfile, onOpenNotifications, onGoToFinances, timeFormat, language 
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeBills = Array.isArray(bills) ? bills : [];

  const completedCount = safeTasks.filter(t => t.status === 'completed').length;
  const totalCount = safeTasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const chartData = [
    { name: 'Completed', value: completedCount, color: '#6c5ce7' },
    { name: 'Remaining', value: totalCount - completedCount, color: '#1e293b' },
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
    greeting: `Bienvenue, ${userName}`,
    subGreeting: "Mesurez votre productivité et suivez vos tâches.",
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
    },
    exportData: "Exporter données",
    createReport: "Créer rapport"
  } : {
    greeting: `Welcome back, ${userName}`,
    subGreeting: "Measure your productivity and track your tasks.",
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
    },
    exportData: "Export data",
    createReport: "Create report"
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
        className="absolute right-0 top-10 w-48 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-2xl shadow-black/40 z-50 py-2 animate-in fade-in zoom-in duration-200"
      >
        <button 
          onClick={() => { setActiveMenu(null); onSeeAllTasks(); }}
          className="w-full px-4 py-2.5 text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-bg)] flex items-center gap-3 transition-colors"
        >
          <BarChart3 size={16} className="text-[#6c5ce7]" /> {translations.menu.details}
        </button>
        <button 
          onClick={() => setActiveMenu(null)}
          className="w-full px-4 py-2.5 text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-bg)] flex items-center gap-3 transition-colors"
        >
          <RefreshCcw size={16} className="text-[var(--color-text-dim)]" /> {translations.menu.refresh}
        </button>
        <div className="h-px bg-[var(--color-border)] my-1 mx-2" />
        <button 
          onClick={() => setActiveMenu(null)}
          className="w-full px-4 py-2.5 text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-bg)] flex items-center gap-3 transition-colors"
        >
          <Download size={16} className="text-[var(--color-text-dim)]" /> {translations.menu.export}
        </button>
      </div>
    );
  };

  // Stat cards data — Dashdark style
  const statCards = [
    {
      icon: <Eye size={18} />,
      label: translations.totalEvents,
      value: totalCount + safeBills.length,
      trend: '+12.4%',
      trendUp: true,
      id: 'total'
    },
    {
      icon: <Users size={18} />,
      label: translations.scheduledTasks,
      value: safeTasks.length,
      trend: '+8.2%',
      trendUp: true,
      id: 'tasks'
    },
    {
      icon: <Zap size={18} />,
      label: language === 'fr' ? 'Complétion' : 'Completion',
      value: completionRate + '%',
      trend: weekRate > 50 ? '+' + weekRate + '%' : weekRate + '%',
      trendUp: weekRate >= 50,
      id: 'completion'
    },
    {
      icon: <CreditCard size={18} />,
      label: translations.activeFinances,
      value: safeBills.length,
      trend: safeBills.length > 0 ? safeBills.length + ' active' : '0',
      trendUp: false,
      id: 'finances'
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] tracking-tight transition-colors mb-1 animate-fade-up">{translations.greeting}</h2>
          <p className="text-sm md:text-base text-[var(--color-text-muted)] font-medium animate-fade-up" style={{ animationDelay: '0.1s' }}>{translations.subGreeting}</p>
        </div>
        <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <button onClick={onOpenModal} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#6c5ce7] text-white rounded-xl font-semibold hover:bg-[#5b4bd5] transition-all shadow-lg shadow-[#6c5ce7]/20 active:scale-95">
            <Plus size={18} /> <span>{translations.createReport}</span>
          </button>
          <button 
            onClick={onOpenNotifications}
            className="p-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-card-hover)] transition-colors relative"
          >
            <Bell size={20} /> <span className="absolute top-2 right-2 w-2 h-2 bg-[#6c5ce7] rounded-full border-2 border-[var(--color-card)]"></span>
          </button>
          <button 
            onClick={onOpenProfile}
            className="hidden md:block w-10 h-10 rounded-xl border border-[var(--color-border)] overflow-hidden hover:scale-110 active:scale-95 transition-all ring-2 ring-transparent hover:ring-[#6c5ce7]/30"
          >
            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
          </button>
        </div>
      </header>

      {/* Stat Cards — Dashdark Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        {statCards.map((card) => (
          <div key={card.id} className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] hover:border-[#6c5ce7]/40 hover:shadow-[0_0_25px_rgba(108,92,231,0.15)] transition-all duration-300 group relative overflow-hidden gradient-border">
            <div className="absolute inset-0 shimmer pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <div className="p-1.5 bg-[var(--color-subtle-bg)] border border-[var(--color-subtle-border)] rounded-lg">{card.icon}</div>
                  <span className="text-xs font-medium">{card.label}</span>
                </div>
                <button onClick={(e) => toggleMenu(e, card.id)} className="p-1 hover:bg-[var(--color-hover-bg)] rounded-lg transition-colors">
                  <MoreHorizontal size={16} className="text-[var(--color-text-dim)]" />
                </button>
                <StatMenu id={card.id} />
              </div>
              <div className="flex items-end justify-between">
                <h4 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">{card.value}</h4>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                  card.trendUp 
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                    : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'
                }`}>
                  {card.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          {/* Today's Schedule */}
          <section className="bg-[var(--color-card)] backdrop-blur-md rounded-2xl border border-[var(--color-border)] p-6 md:p-8 transition-all hover:border-[#6c5ce7]/20 hover:shadow-[0_0_25px_rgba(108,92,231,0.05)] animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--color-text)]">{translations.todaySchedule}</h3>
              <button onClick={onSeeAllTasks} className="text-[#6c5ce7] text-sm font-semibold flex items-center gap-1 hover:text-[#a78bfa] active:scale-95 transition-all">{translations.seeAll} <ChevronRight size={16} /></button>
            </div>
            <div className="space-y-3">
              {safeTasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => onViewTask(task)}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--color-hover-bg)] transition-all duration-200 border border-transparent hover:border-[var(--color-subtle-border)] cursor-pointer group"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className={`w-1 md:w-1.5 h-10 rounded-full shrink-0 transition-all group-hover:w-2 ${task.color === 'blue' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : task.color === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : task.color === 'purple' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`}></div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] transition-colors truncate">{task.title}</h5>
                      <p className="text-[10px] md:text-xs text-[var(--color-text-muted)] flex flex-wrap items-center gap-2 font-medium">
                        <span className="flex items-center gap-1"><Clock size={10} /> {formatTimeDisplay(task.time)}</span>
                        <span className="hidden xs:inline text-[var(--color-text-dim)]">•</span>
                        <span className="text-[var(--color-text-dim)]">{task.type}</span>
                        {task.location && <span className="flex items-center gap-1 text-red-400 truncate"><MapPin size={10} /> {task.location.name}</span>}
                      </p>
                    </div>
                  </div>
                  <div className={`shrink-0 ml-2 px-2 md:px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${task.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : task.status === 'in-progress' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'}`}>
                    {task.status === 'completed' ? translations.status.completed : task.status === 'in-progress' ? translations.status.inProgress : translations.status.todo}
                  </div>
                </div>
              ))}
              {safeTasks.length === 0 && <div className="py-8 text-center text-[var(--color-text-dim)] font-medium italic">{translations.noTasks}</div>}
            </div>
          </section>
        </div>
 
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          {/* Progress Ring */}
          <section className="bg-[var(--color-card)] backdrop-blur-md rounded-2xl border border-[var(--color-border)] p-6 md:p-8 relative transition-all hover:border-[#6c5ce7]/20 hover:shadow-[0_0_25px_rgba(108,92,231,0.05)] animate-fade-up" style={{ animationDelay: '0.3s' }}>
             <h3 className="text-lg font-bold text-[var(--color-text)] mb-6">{translations.progress}</h3>
             <div className="h-40 md:h-48 w-full flex flex-col items-center justify-center relative">
                 <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" animationDuration={1000}>{chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie></PieChart></ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)]">{completionRate}%</span>
                   <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest">{translations.done}</span>
                </div>
             </div>
             <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4">
                <div className="text-center p-3 bg-[var(--color-subtle-bg)] rounded-xl border border-[var(--color-subtle-border)]">
                  <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">{translations.remaining}</p>
                  <p className="text-lg font-bold text-[var(--color-text)]">{safeTasks.length - completedCount}</p>
                </div>
                <div className="text-center p-3 bg-[#6c5ce7]/10 rounded-xl border border-[#6c5ce7]/20">
                  <p className="text-[10px] text-[#a78bfa] font-bold uppercase tracking-wider">{translations.done}</p>
                  <p className="text-lg font-bold text-[var(--color-text)]">{completedCount}</p>
                </div>
             </div>
          </section>
 
          {/* Weekly Productivity Score Card */}
          <section className="bg-gradient-to-br from-[#6c5ce7] to-[#3b82f6] rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-[#6c5ce7]/15 overflow-hidden relative animate-fade-up hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '0.35s' }}>
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full" />
            <div className="absolute -left-4 -bottom-6 w-20 h-20 bg-white/5 rounded-full" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-0.5">
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
                <p className="text-[10px] text-white/60 font-bold">
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
                      <div key={type} className="text-center bg-white/10 rounded-xl py-2">
                        <p className="text-lg font-extrabold">{typeCount}</p>
                        <p className="text-[9px] font-bold text-white/60 uppercase tracking-wide">{typeLabel}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
 
          {safeBills.length > 0 && (
            <section className="bg-[var(--color-card)] backdrop-blur-md rounded-2xl p-6 md:p-8 border border-[var(--color-border)] hover:border-[#6c5ce7]/20 hover:shadow-[0_0_25px_rgba(108,92,231,0.05)] overflow-hidden relative group animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="absolute -right-10 -top-10 w-24 md:w-32 h-24 md:h-32 bg-[#6c5ce7]/5 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative z-10">
                <h3 className="text-[10px] md:text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{translations.nextBill}</h3>
                <p className="text-lg md:text-xl font-bold text-[var(--color-text)] mb-4 line-clamp-1">{safeBills[0].name}</p>
                <div className="flex justify-between items-end">
                   <div>
                    <p className="text-[9px] md:text-[10px] text-[var(--color-text-dim)] uppercase tracking-widest font-bold mb-0.5">{translations.amount}</p>
                    <p className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)]">{Number(safeBills[0].amount).toFixed(2)} €</p>
                  </div>
                  <button onClick={onGoToFinances} className="bg-[#6c5ce7] text-white px-4 md:px-5 py-2 rounded-xl font-bold text-[10px] md:text-xs shadow-lg shadow-[#6c5ce7]/20 hover:bg-[#5b4bd5] transition-colors active:scale-95">{translations.manage}</button>
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
