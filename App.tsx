
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TasksPage from './components/TasksPage';
import FinancesPage from './components/FinancesPage';
import TrashPage from './components/TrashPage';
import CalendarPage from './components/CalendarPage';
import NotificationsPage from './components/NotificationsPage';
import AboutPage from './components/AboutPage';
import AddTaskModal from './components/AddTaskModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import ProfileModal from './components/ProfileModal';
import AIChatBot from './components/AIChatBot';
import AuthPage from './components/AuthPage';
import MobileBottomNav from './components/MobileBottomNav';
import { DB } from './services/db';
import { supabase } from './services/supabaseClient';
import { iCalService } from './services/iCalService';
import { Task, Bill } from './types';
import { LogOut, Loader2, Database, Cloud, HardDrive, ShieldCheck, WifiOff, Globe, Clock, Moon, Sun, Check, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline'>('offline');
  
  const [activeTab, setActiveTab] = useState('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [externalTasks, setExternalTasks] = useState<Task[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [deletedBills, setDeletedBills] = useState<Bill[]>([]);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>('24h');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);

  useEffect(() => {
    let subscription: any = null;

    async function init() {
      const isConnected = await DB.checkConnection();
      setDbStatus(isConnected ? 'connected' : 'offline');

      // Get location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => console.warn("Location permission denied")
        );
      }

      // Handle OAuth redirect session and existing sessions
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const user = DB.handleAuthChange(session);
          if (user) {
            setCurrentUser(user);
            await loadUserData(user.id);
          }
        } else {
          setCurrentUser(null);
          setIsLoading(false);
        }
      });
      subscription = data.subscription;

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = DB.handleAuthChange(session);
        if (user) {
          setCurrentUser(user);
          await loadUserData(user.id);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const [t, b, dt, db, sett] = await Promise.all([
        DB.getTasks(userId, false),
        DB.getBills(userId, false),
        DB.getTasks(userId, true),
        DB.getBills(userId, true),
        DB.getSettings(userId)
      ]);
      setTasks(t);
      setBills(b);
      setDeletedTasks(dt);
      setDeletedBills(db);
      // Load user's saved dark mode preference
      setIsDarkMode(sett.darkMode !== undefined ? sett.darkMode : true);
      setLanguage(sett.language);
      setTimeFormat(sett.timeFormat);
      
      // Fetch fresh user data from Supabase (not cached) to get latest ical_urls
      const user = await DB.getFreshUser();
      if (user) {
        setCurrentUser(user);
      }
      if (user?.ical_urls?.length > 0) {
        try {
          const allExternal = await Promise.all(
            user.ical_urls.map(async (u: any) => {
              const urlStr = typeof u === 'string' ? u : u.url;
              const typeStr = typeof u === 'string' ? 'Course' : u.type;
              return iCalService.fetchCalendar(urlStr, typeStr);
            })
          );
          let flatExternal = allExternal.flat();
          
          // Apply hidden and completed states
          const hiddenIds = user.hidden_ical_events || [];
          const completedIds = user.completed_ical_events || [];
          const permDeletedIds = user.permanently_deleted_ical_events || [];
          
          flatExternal = flatExternal.filter(t => !hiddenIds.includes(t.id) && !permDeletedIds.includes(t.id));
          flatExternal = flatExternal.map(t => completedIds.includes(t.id) ? { ...t, status: 'completed' } : t);
          
          setExternalTasks(flatExternal);
        } catch (icalErr) {
          console.warn("Failed to fetch iCal calendars:", icalErr);
        }
      }
    } catch (e) {
      console.warn("Using local cached data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (user: any) => {
    setCurrentUser(user);
    setIsLoading(true);
    await loadUserData(user.id);
  };

  const handleLogout = () => {
    DB.logout();
    setCurrentUser(null);
    setShowLogoutConfirm(false);
  };

  const handleProfileUpdate = async (updates: { name: string, email: string, password?: string, avatar?: string, ical_urls?: any[], hidden_ical_events?: string[], completed_ical_events?: string[] }) => {
    try {
      const updatedUser = await DB.updateUser(updates);
      if (updatedUser) {
        setCurrentUser(updatedUser);
        setIsProfileModalOpen(false);
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      if (error.message === 'Auth session missing!') {
        alert(language === 'fr' ? 'Votre session a expiré. Veuillez vous reconnecter pour des raisons de sécurité.' : 'Your session has expired. Please log in again for security reasons.');
        handleLogout();
      } else {
        alert((language === 'fr' ? 'Erreur: ' : 'Error: ') + (error.message || 'Failed to update profile'));
      }
    }
  };

  useEffect(() => {
    if (currentUser && !isLoading) {
      DB.saveSettings(currentUser.id, { darkMode: isDarkMode, language, timeFormat });
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode, language, timeFormat, currentUser, isLoading]);

  const addTask = async (task: Task) => {
    if (!currentUser) return;
    setTasks(prev => [task, ...prev]);
    try {
      await DB.addTask(currentUser.id, task);
    } catch (error) {
      console.error("Failed to save task to cloud:", error);
      alert(language === 'fr' 
        ? "⚠️ Erreur de synchronisation : La tâche n'a pas pu être sauvegardée sur le cloud. Vérifiez votre connexion." 
        : "⚠️ Sync Error: Task could not be saved to the cloud. Check your connection.");
    }
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete) {
      setDeletedTasks(prev => [taskToDelete, ...prev]);
      setTasks(prev => prev.filter(t => t.id !== id));
      await DB.deleteTask(currentUser.id, id, false);
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    await DB.updateTask(currentUser.id, id, updates);
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const nextStatus: Task['status'] = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'todo';
      updateTask(id, { status: nextStatus });
    }
  };

  const addBill = async (bill: Bill) => {
    if (!currentUser) return;
    setBills(prev => [bill, ...prev]);
    try {
      await DB.addBill(currentUser.id, bill);
    } catch (error) {
      console.error("Failed to save bill to cloud:", error);
      alert(language === 'fr' 
        ? "⚠️ Erreur de synchronisation : La facture n'a pas pu être sauvegardée sur le cloud." 
        : "⚠️ Sync Error: Bill could not be saved to the cloud.");
    }
  };

  const deleteBill = async (id: string) => {
    const billToDelete = bills.find(b => b.id === id);
    if (billToDelete) {
      setDeletedBills(prev => [billToDelete, ...prev]);
      setBills(prev => prev.filter(b => b.id !== id));
      await DB.updateBill(currentUser.id, id, { is_deleted: true } as any);
    }
  };

  const toggleBillStatus = async (id: string) => {
    const bill = bills.find(b => b.id === id);
    if (bill) {
      const nextStatus: Bill['status'] = bill.status === 'paid' ? 'pending' : 'paid';
      setBills(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus } : b));
      await DB.updateBill(currentUser.id, id, { status: nextStatus });
    }
  };

  const updateBillAmount = async (id: string, amount: number) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, amount } : b));
    await DB.updateBill(currentUser.id, id, { amount });
  };

  // --- TRASH ACTIONS ---
  const restoreTask = async (id: string) => {
    const task = deletedTasks.find(t => t.id === id);
    if (task) {
      if (task.source) {
        const hiddenIds = currentUser.hidden_ical_events || [];
        await handleProfileUpdate({ ...currentUser, hidden_ical_events: hiddenIds.filter((h: string) => h !== id) });
        setExternalTasks(prev => [...prev, task]);
      } else {
        setTasks(prev => [task, ...prev]);
        await DB.updateTask(currentUser.id, id, { is_deleted: false } as any);
      }
      setDeletedTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const permanentDeleteTask = async (id: string) => {
    const task = deletedTasks.find(t => t.id === id);
    if (task?.source) {
      const hiddenIds = currentUser.hidden_ical_events || [];
      const permDeletedIds = currentUser.permanently_deleted_ical_events || [];
      await handleProfileUpdate({ 
        ...currentUser, 
        hidden_ical_events: hiddenIds.filter((h: string) => h !== id),
        permanently_deleted_ical_events: [...permDeletedIds, id]
      });
    } else {
      await DB.deleteTask(currentUser.id, id, true);
    }
    setDeletedTasks(prev => prev.filter(t => t.id !== id));
  };

  const restoreBill = async (id: string) => {
    const bill = deletedBills.find(b => b.id === id);
    if (bill) {
      setBills(prev => [bill, ...prev]);
      setDeletedBills(prev => prev.filter(b => b.id !== id));
      await DB.updateBill(currentUser.id, id, { is_deleted: false } as any);
    }
  };

  const permanentDeleteBill = async (id: string) => {
    setDeletedBills(prev => prev.filter(b => b.id !== id));
    await DB.deleteBill(currentUser.id, id, true);
  };

  const emptyTrash = async () => {
    const regularTaskIds = deletedTasks.filter(t => !t.source).map(t => t.id);
    const externalTaskIds = deletedTasks.filter(t => !!t.source).map(t => t.id);
    const bIds = deletedBills.map(b => b.id);
    
    setDeletedTasks([]);
    setDeletedBills([]);

    for (const id of regularTaskIds) {
      await DB.deleteTask(currentUser.id, id, true);
    }
    for (const id of bIds) {
      await DB.deleteBill(currentUser.id, id, true);
    }
    
    if (externalTaskIds.length > 0) {
      const permDeletedIds = currentUser.permanently_deleted_ical_events || [];
      const hiddenIds = currentUser.hidden_ical_events || [];
      await handleProfileUpdate({ 
        ...currentUser, 
        hidden_ical_events: hiddenIds.filter((id: string) => !externalTaskIds.includes(id)),
        permanently_deleted_ical_events: [...permDeletedIds, ...externalTaskIds]
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-[#6c5ce7]/20 rounded-full blur-xl animate-pulse" />
          <Loader2 size={64} className="text-[#6c5ce7] animate-spin relative z-10" />
        </div>
        <p className="text-[var(--color-text-muted)] font-bold uppercase text-xs tracking-widest">Planify Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-bg)] transition-colors">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        language={language} 
        onLogoutClick={() => setShowLogoutConfirm(true)} 
      />
        
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
          <header className="sticky top-0 z-30 glass-nav border-b border-[var(--color-border)] px-6 md:px-10 py-4 flex items-center justify-between transition-all duration-300">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-2 text-[var(--color-text-muted)] hover:bg-[var(--color-hover-bg)] rounded-xl transition-colors"
                >
                  <Menu size={24} />
                </button>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${dbStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                  {dbStatus === 'connected' ? <Cloud size={14} className="animate-pulse" /> : <HardDrive size={14} />}
                  {dbStatus === 'connected' ? 'Sync Cloud' : 'Mode Local'}
                </div>
              </div>
              {dbStatus === 'offline' && (
                  <div className="flex items-center gap-2 text-orange-400 text-[10px] font-bold">
                      <WifiOff size={14} /> MySQL Indisponible
                  </div>
              )}
          </header>

          {activeTab === 'dashboard' && <Dashboard tasks={[...tasks, ...externalTasks]} bills={bills} userName={currentUser.name} userAvatar={currentUser.avatar} onOpenModal={() => setIsModalOpen(true)} onSeeAllTasks={() => setActiveTab('calendar')} onViewTask={setSelectedTask} onOpenProfile={() => setIsProfileModalOpen(true)} onOpenNotifications={() => setActiveTab('notifications')} onGoToFinances={() => setActiveTab('finances')} timeFormat={timeFormat} language={language} />}
          {activeTab === 'calendar' && <CalendarPage tasks={[...tasks, ...externalTasks]} userName={currentUser.name} onOpenModal={() => setIsModalOpen(true)} onUpdateTask={updateTask} onViewTask={setSelectedTask} timeFormat={timeFormat} language={language} onSubscribeCalendar={async (url, type) => {
            const urls = currentUser.ical_urls || [];
            if (!urls.some((u: any) => (typeof u === 'string' ? u : u.url) === url)) {
              // Fetch iCal first to validate the URL works (throws on error)
              const newEvents = await iCalService.fetchCalendar(url, type);
              setExternalTasks(prev => [...prev, ...newEvents]);
              // Save the URL to the user profile
              await handleProfileUpdate({ ...currentUser, ical_urls: [...urls, { url, type }] });
            }
          }} onRemoveCalendar={async (url) => {
            const urls = currentUser.ical_urls || [];
            await handleProfileUpdate({ ...currentUser, ical_urls: urls.filter((u: any) => (typeof u === 'string' ? u : u.url) !== url) });
            setExternalTasks(prev => prev.filter(t => t.source !== url));
          }} currentIcalUrls={currentUser?.ical_urls?.map((u: any) => typeof u === 'string' ? u : u.url) || []} />}
          {activeTab === 'courses' && <TasksPage tasks={[...tasks, ...externalTasks].filter(t => t.type === 'Course')} onOpenModal={() => setIsModalOpen(true)} onToggleTaskStatus={toggleTaskStatus} onDeleteTask={deleteTask} onViewTask={setSelectedTask} timeFormat={timeFormat} language={language} />}
          {activeTab === 'finances' && <FinancesPage bills={bills} onOpenModal={() => setIsModalOpen(true)} onToggleBillStatus={toggleBillStatus} onDeleteBill={deleteBill} onUpdateBillAmount={updateBillAmount} language={language} />}
          {activeTab === 'notifications' && <NotificationsPage tasks={tasks} bills={bills} onGoToTasks={() => setActiveTab('calendar')} onGoToFinances={() => setActiveTab('finances')} language={language} />}
          {activeTab === 'about' && <AboutPage language={language} />}
          {activeTab === 'trash' && (
            <TrashPage 
              deletedTasks={deletedTasks} 
              deletedBills={deletedBills} 
              onRestoreTask={restoreTask} 
              onPermanentDeleteTask={permanentDeleteTask} 
              onRestoreBill={restoreBill} 
              onPermanentDeleteBill={permanentDeleteBill} 
              onEmptyTrash={emptyTrash} 
              onGoHome={() => setActiveTab('dashboard')} 
              language={language} 
            />
          )}
          {activeTab === 'settings' && (
            <div className="p-4 md:p-8 space-y-6 md:space-y-12 animate-in fade-in duration-500">
              <div>
                  <h2 className="text-3xl font-bold mb-2 text-[var(--color-text)]">{language === 'fr' ? 'Réglages' : 'Settings'}</h2>
                  <p className="text-[var(--color-text-muted)] font-medium">{language === 'fr' ? 'Gérez vos préférences personnelles.' : 'Manage your personal preferences.'}</p>
              </div>
              <div className="max-w-2xl">
                  <section className="space-y-4">
                      <h3 className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">{language === 'fr' ? 'Préférences' : 'Preferences'}</h3>
                      <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] space-y-6">
                          {/* Dark Mode Toggle */}
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-[var(--color-border)] rounded-xl">
                                      {isDarkMode ? <Moon size={18} className="text-[#6c5ce7]" /> : <Sun size={18} className="text-amber-400" />}
                                  </div>
                                  <span className="font-bold text-[var(--color-text)]">{language === 'fr' ? 'Mode Sombre' : 'Dark Mode'}</span>
                              </div>
                              <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center gap-2 cursor-pointer">
                                <span className={`text-xs font-bold ${isDarkMode ? 'text-emerald-400' : 'text-slate-500'}`}>{isDarkMode ? (language === 'fr' ? 'Activé' : 'On') : (language === 'fr' ? 'Désactivé' : 'Off')}</span>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-[#6c5ce7]' : 'bg-slate-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                              </button>
                          </div>

                          {/* Language */}
                          <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-[var(--color-border)] rounded-xl">
                                      <Globe size={18} className="text-[var(--color-text-muted)]" />
                                  </div>
                                  <span className="font-bold text-[var(--color-text)]">{language === 'fr' ? 'Langue' : 'Language'}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  <button 
                                    onClick={() => setLanguage('fr')}
                                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${language === 'fr' ? 'bg-[#6c5ce7] text-white border-[#6c5ce7] shadow-lg shadow-[#6c5ce7]/20' : 'bg-[var(--color-card-hover)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-border)]'}`}
                                  >
                                      {language === 'fr' && <Check size={14} />} Français
                                  </button>
                                  <button 
                                    onClick={() => setLanguage('en')}
                                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${language === 'en' ? 'bg-[#6c5ce7] text-white border-[#6c5ce7] shadow-lg shadow-[#6c5ce7]/20' : 'bg-[var(--color-card-hover)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-border)]'}`}
                                  >
                                      {language === 'en' && <Check size={14} />} English
                                  </button>
                              </div>
                          </div>

                          {/* Time Format */}
                          <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-[var(--color-border)] rounded-xl">
                                      <Clock size={18} className="text-[var(--color-text-muted)]" />
                                  </div>
                                  <span className="font-bold text-[var(--color-text)]">{language === 'fr' ? 'Format horaire' : 'Time Format'}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  <button 
                                    onClick={() => setTimeFormat('24h')}
                                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${timeFormat === '24h' ? 'bg-[#6c5ce7] text-white border-[#6c5ce7] shadow-lg shadow-[#6c5ce7]/20' : 'bg-[var(--color-card-hover)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-border)]'}`}
                                  >
                                      {timeFormat === '24h' && <Check size={14} />} 24 Heures
                                  </button>
                                  <button 
                                    onClick={() => setTimeFormat('12h')}
                                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${timeFormat === '12h' ? 'bg-[#6c5ce7] text-white border-[#6c5ce7] shadow-lg shadow-[#6c5ce7]/20' : 'bg-[var(--color-card-hover)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-border)]'}`}
                                  >
                                      {timeFormat === '12h' && <Check size={14} />} 12 Hours
                                  </button>
                              </div>
                          </div>
                      </div>
                  </section>
              </div>
            </div>
          )}
        </main>

          <AIChatBot 
            userName={currentUser.name} 
            tasks={[...tasks, ...externalTasks]} 
            bills={bills} 
            onAddTask={addTask} 
            onDeleteTask={deleteTask} 
            onUpdateTaskStatus={toggleTaskStatus} 
            onAddBill={addBill} 
            onDeleteBill={deleteBill} 
            onToggleBillStatus={toggleBillStatus} 
            onUpdateBillAmount={updateBillAmount}
            userLocation={userLocation}
            language={language}
          />

        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} language={language} />
        <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddTask={addTask} onAddBill={addBill} language={language} userLocation={userLocation} currentPage={activeTab} />
        
        {selectedTask && (
          <TaskDetailsModal 
            task={selectedTask} 
            isOpen={!!selectedTask} 
            onClose={() => setSelectedTask(null)} 
            onDelete={() => deleteTask(selectedTask.id)} 
            onUpdate={(updates) => updateTask(selectedTask.id, updates)} 
            onToggleStatus={async () => {
              if (selectedTask.source) {
                const completedIds = currentUser.completed_ical_events || [];
                const isCompleted = selectedTask.status === 'completed';
                const newCompletedIds = isCompleted 
                  ? completedIds.filter((id: string) => id !== selectedTask.id)
                  : [...completedIds, selectedTask.id];
                  
                await handleProfileUpdate({ ...currentUser, completed_ical_events: newCompletedIds });
                setExternalTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: isCompleted ? 'todo' : 'completed' } : t));
              } else {
                toggleTaskStatus(selectedTask.id);
              }
            }} 
            onHideExternalEvent={async (taskId) => {
              const hiddenIds = currentUser.hidden_ical_events || [];
              await handleProfileUpdate({ ...currentUser, hidden_ical_events: [...hiddenIds, taskId] });
              const hiddenTask = externalTasks.find(t => t.id === taskId);
              if (hiddenTask) {
                setDeletedTasks(prev => [...prev, hiddenTask]);
              }
              setExternalTasks(prev => prev.filter(t => t.id !== taskId));
            }}
            onRemoveCalendar={async (url) => {
              const urls = currentUser.ical_urls || [];
              await handleProfileUpdate({ ...currentUser, ical_urls: urls.filter((u: any) => (typeof u === 'string' ? u : u.url) !== url) });
              setExternalTasks(prev => prev.filter(t => (t as any).source !== url));
            }}
            language={language} 
            timeFormat={timeFormat} 
          />
        )}

        <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} userName={currentUser.name} userEmail={currentUser.email} userAvatar={currentUser.avatar} onUpdate={handleProfileUpdate} onLogout={() => setShowLogoutConfirm(true)} language={language} />
        
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-[var(--color-card)] p-10 rounded-3xl w-full max-w-sm text-center shadow-2xl border border-[var(--color-border)] animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6"><LogOut size={40} /></div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Déconnexion</h3>
              <p className="text-[var(--color-text-muted)] text-sm mb-8 font-medium">Êtes-vous sûr de vouloir quitter votre session ?</p>
              <div className="flex gap-4">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 bg-[var(--color-border)] rounded-xl font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)] transition-colors">Annuler</button>
                <button onClick={handleLogout} className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold shadow-xl shadow-red-500/20 hover:bg-red-600 transition-colors">Quitter</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default App;
