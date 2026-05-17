
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
import { LogOut, Loader2, Database, Cloud, HardDrive, ShieldCheck, WifiOff, Globe, Clock, Moon, Sun, Check } from 'lucide-react';

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

  const [isDarkMode, setIsDarkMode] = useState(false);
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
      setIsDarkMode(sett.darkMode === 1 || sett.darkMode === true);
      setLanguage(sett.language);
      setTimeFormat(sett.timeFormat);
      
      const user = DB.getCurrentUser();
      if (user?.ical_urls?.length > 0) {
        const allExternal = await Promise.all(
          user.ical_urls.map((url: string) => iCalService.fetchCalendar(url))
        );
        setExternalTasks(allExternal.flat());
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

  const handleProfileUpdate = async (updates: { name: string, email: string, password?: string, avatar?: string, ical_urls?: string[] }) => {
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
      if (isDarkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
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
      setTasks(prev => [task, ...prev]);
      setDeletedTasks(prev => prev.filter(t => t.id !== id));
      await DB.updateTask(currentUser.id, id, { is_deleted: false } as any);
    }
  };

  const permanentDeleteTask = async (id: string) => {
    setDeletedTasks(prev => prev.filter(t => t.id !== id));
    await DB.deleteTask(currentUser.id, id, true);
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
    const tIds = deletedTasks.map(t => t.id);
    const bIds = deletedBills.map(b => b.id);
    
    setDeletedTasks([]);
    setDeletedBills([]);

    for (const id of tIds) {
      await DB.deleteTask(currentUser.id, id, true);
    }
    for (const id of bIds) {
      await DB.deleteBill(currentUser.id, id, true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 size={64} className="text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Planify Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        language={language} 
        onLogoutClick={() => setShowLogoutConfirm(true)} 
      />
        
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
          <header className="px-8 pt-8 flex items-center justify-between">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${dbStatus === 'connected' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400' : 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400'}`}>
                {dbStatus === 'connected' ? <Cloud size={14} /> : <HardDrive size={14} />}
                {dbStatus === 'connected' ? 'Sync Cloud' : 'Mode Local'}
              </div>
              {dbStatus === 'offline' && (
                  <div className="flex items-center gap-2 text-orange-500 text-[10px] font-bold">
                      <WifiOff size={14} /> MySQL Indisponible
                  </div>
              )}
          </header>

          {activeTab === 'dashboard' && <Dashboard tasks={[...tasks, ...externalTasks]} bills={bills} userName={currentUser.name} userAvatar={currentUser.avatar} onOpenModal={() => setIsModalOpen(true)} onSeeAllTasks={() => setActiveTab('calendar')} onViewTask={setSelectedTask} onOpenProfile={() => setIsProfileModalOpen(true)} onOpenNotifications={() => setActiveTab('notifications')} onGoToFinances={() => setActiveTab('finances')} timeFormat={timeFormat} language={language} />}
          {activeTab === 'calendar' && <CalendarPage tasks={[...tasks, ...externalTasks]} userName={currentUser.name} onOpenModal={() => setIsModalOpen(true)} onUpdateTask={updateTask} onViewTask={setSelectedTask} timeFormat={timeFormat} language={language} onSubscribeCalendar={async (url) => {
            const urls = currentUser.ical_urls || [];
            if (!urls.includes(url)) {
              // Fetch iCal first to validate the URL works (throws on error)
              const newEvents = await iCalService.fetchCalendar(url);
              setExternalTasks(prev => [...prev, ...newEvents]);
              // Save the URL to the user profile
              await handleProfileUpdate({ ...currentUser, ical_urls: [...urls, url] });
            }
          }} onRemoveCalendar={async (url) => {
            const urls = currentUser.ical_urls || [];
            await handleProfileUpdate({ ...currentUser, ical_urls: urls.filter((u: string) => u !== url) });
            setExternalTasks(prev => prev.filter(t => t.source !== url));
          }} currentIcalUrls={currentUser?.ical_urls || []} />}
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
            <div className="p-8 space-y-12 animate-in fade-in duration-500">
              <div>
                  <h2 className="text-3xl font-bold mb-2">{language === 'fr' ? 'Réglages' : 'Settings'}</h2>
                  <p className="text-slate-500 font-medium">{language === 'fr' ? 'Gérez vos préférences personnelles.' : 'Manage your personal preferences.'}</p>
              </div>
              <div className="max-w-2xl">
                  <section className="space-y-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{language === 'fr' ? 'Préférences' : 'Preferences'}</h3>
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                      {isDarkMode ? <Moon size={18} className="text-blue-500" /> : <Sun size={18} className="text-orange-500" />}
                                  </div>
                                  <span className="font-bold">{language === 'fr' ? 'Mode Sombre' : 'Dark Mode'}</span>
                              </div>
                              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${isDarkMode ? 'translate-x-6' : ''}`} />
                              </button>
                          </div>

                          <div className="space-y-3 pt-2 border-t border-slate-50 dark:border-slate-800">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                      <Globe size={18} className="text-slate-500" />
                                  </div>
                                  <span className="font-bold">{language === 'fr' ? 'Langue' : 'Language'}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  <button 
                                    onClick={() => setLanguage('fr')}
                                    className={`py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all ${language === 'fr' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-100'}`}
                                  >
                                      {language === 'fr' && <Check size={14} />} Français
                                  </button>
                                  <button 
                                    onClick={() => setLanguage('en')}
                                    className={`py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all ${language === 'en' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-100'}`}
                                  >
                                      {language === 'en' && <Check size={14} />} English
                                  </button>
                              </div>
                          </div>

                          <div className="space-y-3 pt-2 border-t border-slate-50 dark:border-slate-800">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                      <Clock size={18} className="text-slate-500" />
                                  </div>
                                  <span className="font-bold">{language === 'fr' ? 'Format horaire' : 'Time Format'}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  <button 
                                    onClick={() => setTimeFormat('24h')}
                                    className={`py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all ${timeFormat === '24h' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-100'}`}
                                  >
                                      {timeFormat === '24h' && <Check size={14} />} 24 Heures
                                  </button>
                                  <button 
                                    onClick={() => setTimeFormat('12h')}
                                    className={`py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all ${timeFormat === '12h' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-100'}`}
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

        {activeTab === 'dashboard' && (
          <AIChatBot 
            userName={currentUser.name} 
            tasks={tasks} 
            bills={bills} 
            onAddTask={addTask} 
            onDeleteTask={deleteTask} 
            onUpdateTaskStatus={toggleTaskStatus} 
            onAddBill={addBill} 
            onDeleteBill={deleteBill} 
            onToggleBillStatus={toggleBillStatus} 
            onUpdateBillAmount={updateBillAmount}
            userLocation={userLocation}
          />
        )}

        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} language={language} />
        <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddTask={addTask} onAddBill={addBill} language={language} userLocation={userLocation} currentPage={activeTab} />
        
        {selectedTask && (
          <TaskDetailsModal 
            task={selectedTask} 
            isOpen={!!selectedTask} 
            onClose={() => setSelectedTask(null)} 
            onDelete={() => deleteTask(selectedTask.id)} 
            onUpdate={(updates) => updateTask(selectedTask.id, updates)} 
            onToggleStatus={() => toggleTaskStatus(selectedTask.id)} 
            language={language} 
            timeFormat={timeFormat} 
          />
        )}

        <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} userName={currentUser.name} userEmail={currentUser.email} userAvatar={currentUser.avatar} onUpdate={handleProfileUpdate} onLogout={() => setShowLogoutConfirm(true)} language={language} />
        
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] w-full max-w-sm text-center shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><LogOut size={40} /></div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Déconnexion</h3>
              <p className="text-slate-500 text-sm mb-8 font-medium">Êtes-vous sûr de vouloir quitter votre session ?</p>
              <div className="flex gap-4">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300">Annuler</button>
                <button onClick={handleLogout} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-200 dark:shadow-none">Quitter</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default App;
