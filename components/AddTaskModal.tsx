import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Clock, CreditCard, BookOpen, Users, Receipt, Repeat, Bell, Check, Zap, ChevronLeft, MoreHorizontal, Search, MapPin, Loader2, Navigation, ChevronDown, PlusCircle, Plus } from 'lucide-react';
import OpenAI from 'openai';
import { Task, Bill, TaskStatus, TaskLocation } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  onAddBill: (bill: Bill) => void;
  language: 'fr' | 'en';
  userLocation: { latitude: number; longitude: number } | null;
  currentPage?: string;
}

const LOGO = (domain: string) => `https://logo.clearbit.com/${domain}`;
const FALLBACK = (domain: string) => `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;

const FINANCE_TEMPLATES = [
  { id: 'netflix', name: 'Netflix', logo: LOGO('netflix.com'), color: 'bg-red-600', category: 'subscription', plans: [{ name: 'Standard avec pub', amount: '5.99' }, { name: 'Standard', amount: '13.49' }, { name: 'Premium (4K)', amount: '19.99' }] },
  { id: 'spotify', name: 'Spotify', logo: LOGO('spotify.com'), color: 'bg-green-500', category: 'subscription', plans: [{ name: 'Personnel', amount: '11.12' }, { name: 'Duo', amount: '15.17' }, { name: 'Famille', amount: '18.21' }] },
  { id: 'basicfit', name: 'Basic-Fit', logo: LOGO('basic-fit.com'), color: 'bg-orange-500', category: 'subscription', plans: [{ name: 'Basic (4 sem.)', amount: '19.99' }, { name: 'Comfort (4 sem.)', amount: '24.99' }, { name: 'Premium (4 sem.)', amount: '29.99' }] },
  { id: 'fitnesspark', name: 'Fitness Park', logo: LOGO('fitnesspark.fr'), color: 'bg-blue-900', category: 'subscription', plans: [{ name: 'Classic (4 sem.)', amount: '29.95' }, { name: 'Ultimate (4 sem.)', amount: '39.95' }] },
  { id: 'disneyplus', name: 'Disney+', logo: LOGO('disneyplus.com'), color: 'bg-blue-800', category: 'subscription', plans: [{ name: 'Standard avec pub', amount: '5.99' }, { name: 'Standard', amount: '9.99' }, { name: 'Premium', amount: '13.99' }] },
  { id: 'amazonprime', name: 'Amazon Prime', logo: LOGO('amazon.com'), color: 'bg-blue-400', category: 'subscription', plans: [{ name: 'Mensuel', amount: '6.99' }, { name: 'Annuel', amount: '69.90' }] },
  { id: 'youtubepremium', name: 'YouTube Premium', logo: LOGO('youtube.com'), color: 'bg-red-600', category: 'subscription', plans: [{ name: 'Individuel', amount: '12.99' }, { name: 'Famille', amount: '23.99' }, { name: 'Étudiant', amount: '7.99' }] },
  { id: 'icloud', name: 'iCloud+', logo: LOGO('apple.com'), color: 'bg-slate-400', category: 'subscription', plans: [{ name: '50 Go', amount: '0.99' }, { name: '200 Go', amount: '2.99' }, { name: '2 To', amount: '9.99' }] },
  { id: 'chatgpt', name: 'ChatGPT Plus', logo: LOGO('openai.com'), color: 'bg-emerald-600', category: 'subscription', plans: [{ name: 'Plus (Individual)', amount: '20.00' }] },
  { id: 'canalplus', name: 'Canal+', logo: LOGO('canalplus.com'), color: 'bg-black', category: 'subscription', plans: [{ name: 'Canal+ Basic', amount: '22.99' }, { name: 'Ciné Séries', amount: '29.99' }, { name: 'Sport', amount: '34.99' }] },
  { id: 'free', name: 'Free Mobile', logo: LOGO('free.fr'), color: 'bg-red-700', category: 'subscription', plans: [{ name: 'Forfait 2€', amount: '2.00' }, { name: 'Série Free', amount: '9.99' }, { name: 'Forfait Free 5G', amount: '19.99' }] },
  { id: 'appletv', name: 'Apple TV+', logo: LOGO('tv.apple.com'), color: 'bg-black', category: 'subscription', plans: [{ name: 'Mensuel', amount: '9.99' }] },
  { id: 'paramount', name: 'Paramount+', logo: LOGO('paramountplus.com'), color: 'bg-blue-600', category: 'subscription', plans: [{ name: 'Standard avec pub', amount: '7.99' }, { name: 'Premium', amount: '10.99' }] },
  { id: 'max', name: 'Max (HBO)', logo: LOGO('max.com'), color: 'bg-blue-900', category: 'subscription', plans: [{ name: 'Basic avec pub', amount: '5.99' }, { name: 'Standard', amount: '9.99' }, { name: 'Premium', amount: '13.99' }] },
  { id: 'nintendo', name: 'Switch Online', logo: LOGO('nintendo.com'), color: 'bg-red-600', category: 'subscription', plans: [{ name: 'Individuel (1 an)', amount: '19.99' }, { name: 'Familial (1 an)', amount: '34.99' }] },
  { id: 'psplus', name: 'PS Plus', logo: LOGO('playstation.com'), color: 'bg-blue-700', category: 'subscription', plans: [{ name: 'Essential', amount: '8.99' }, { name: 'Extra', amount: '13.99' }, { name: 'Premium', amount: '16.99' }] },
  { id: 'xbox', name: 'Game Pass', logo: LOGO('xbox.com'), color: 'bg-green-600', category: 'subscription', plans: [{ name: 'PC', amount: '9.99' }, { name: 'Ultimate', amount: '14.99' }] },
  { id: 'deezer', name: 'Deezer', logo: LOGO('deezer.com'), color: 'bg-black', category: 'subscription', plans: [{ name: 'Premium', amount: '11.99' }, { name: 'Famille', amount: '19.99' }] },
  { id: 'adobe', name: 'Creative Cloud', logo: LOGO('adobe.com'), color: 'bg-red-600', category: 'subscription', plans: [{ name: 'Photo Plan', amount: '11.99' }, { name: 'All Apps', amount: '62.99' }] },
  { id: 'dropbox', name: 'Dropbox', logo: LOGO('dropbox.com'), color: 'bg-blue-500', category: 'subscription', plans: [{ name: 'Plus (2 To)', amount: '11.99' }, { name: 'Family', amount: '19.99' }] },
  { id: 'orange', name: 'Orange', logo: LOGO('orange.fr'), color: 'bg-orange-500', category: 'subscription', plans: [{ name: 'Forfait 2h', amount: '5.99' }, { name: 'Forfait 100Go', amount: '16.99' }, { name: 'Fibre Livebox', amount: '24.99' }] },
  { id: 'sfr', name: 'SFR', logo: LOGO('sfr.fr'), color: 'bg-red-600', category: 'subscription', plans: [{ name: 'Forfait 5G', amount: '15.99' }, { name: 'Box Fibre', amount: '29.99' }] },
  { id: 'bouygues', name: 'Bouygues Telecom', logo: LOGO('bouyguestelecom.fr'), color: 'bg-blue-500', category: 'subscription', plans: [{ name: 'B&You 20Go', amount: '6.99' }, { name: 'Bbox Fit', amount: '18.99' }] },
  { id: 'sosh', name: 'Sosh', logo: LOGO('sosh.fr'), color: 'bg-orange-400', category: 'subscription', plans: [{ name: 'Forfait 40Go', amount: '9.99' }, { name: 'Forfait 130Go', amount: '12.99' }] },
  { id: 'redbysfr', name: 'RED by SFR', logo: LOGO('red-by-sfr.fr'), color: 'bg-green-500', category: 'subscription', plans: [{ name: 'Forfait 100Go', amount: '9.99' }] },
  { id: 'midjourney', name: 'Midjourney', logo: LOGO('midjourney.com'), color: 'bg-slate-800', category: 'subscription', plans: [{ name: 'Basic Plan', amount: '10.00' }, { name: 'Standard Plan', amount: '30.00' }] },
  { id: 'github', name: 'GitHub Copilot', logo: LOGO('github.com'), color: 'bg-slate-900', category: 'subscription', plans: [{ name: 'Copilot Individual', amount: '10.00' }] }
];

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, onAddBill, language, userLocation, currentPage }) => {
  const [activeTab, setActiveTab] = useState<'planning' | 'finance'>('planning');
  const [financeMode, setFinanceMode] = useState<'template' | 'manual'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string | null>(null);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Location search state
  const [locationSearch, setLocationSearch] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationResults, setLocationResults] = useState<TaskLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<TaskLocation | null>(null);

  const defaultType = currentPage === 'courses' ? 'Course' as const : 'Task' as const;

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 - 10:00',
    type: defaultType as 'Task' | 'Meeting' | 'Course',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    financeCategory: 'invoice' as 'invoice' | 'subscription',
    reminder: 'Aucun'
  });

  // Update default type when currentPage changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, type: currentPage === 'courses' ? 'Course' : 'Task' }));
  }, [currentPage]);

  const searchLocation = async () => {
    if (!locationSearch.trim()) return;
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      alert("⚠️ Clé OpenAI manquante dans le fichier .env");
      return;
    }

    setIsSearchingLocation(true);
    setLocationResults([]);

    try {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      const prompt = `Trouve des lieux réels et des adresses exactes correspondant à "${locationSearch}" ${userLocation ? `à proximité des coordonnées (lat: ${userLocation.latitude}, lng: ${userLocation.longitude})` : ''}. 
      Réponds UNIQUEMENT avec un tableau JSON d'objets contenant 'name' (nom du lieu), 'address' (adresse complète) et 'url' (un lien Google Maps basé sur le nom et l'adresse).
      Exemple de format: [{"name": "Lieu", "address": "123 Rue de...", "url": "https://maps.google.com/?q=..."}]`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Tu es un assistant expert en géolocalisation qui répond uniquement en JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (content) {
        const data = JSON.parse(content);
        const places = Array.isArray(data.places) ? data.places : Object.values(data)[0];
        if (Array.isArray(places)) {
          setLocationResults(places.slice(0, 5));
        }
      }
    } catch (err) {
      console.error("Location search error:", err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    const filtered = FINANCE_TEMPLATES.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (searchQuery.trim() !== '') return filtered;
    return showAllTemplates ? filtered : filtered.slice(0, 11);
  }, [searchQuery, showAllTemplates]);

  if (!isOpen) return null;

  const currentTemplate = FINANCE_TEMPLATES.find(t => t.id === selectedTemplateId);

  const handleTemplateClick = (template: typeof FINANCE_TEMPLATES[0]) => {
    setSelectedTemplateId(template.id);
    setSelectedPlanName(null); 
    const defaultPlan = template.plans[0];
    setFormData({
      ...formData,
      title: `${template.name} - ${defaultPlan.name}`,
      amount: defaultPlan.amount,
      financeCategory: template.category as any
    });
    setSelectedPlanName(defaultPlan.name);
  };

  const handlePlanSelect = (plan: { name: string, amount: string }) => {
    if (!currentTemplate) return;
    setSelectedPlanName(plan.name);
    setFormData({
      ...formData,
      title: `${currentTemplate.name} - ${plan.name}`,
      amount: plan.amount
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reminderValue = formData.reminder === 'Aucun' ? undefined : formData.reminder;
    
    if (activeTab === 'planning') {
      const colors = { Task: 'green', Meeting: 'blue', Course: 'purple' };
      onAddTask({
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        status: 'todo' as TaskStatus,
        color: colors[formData.type] || 'orange',
        reminder: reminderValue,
        location: selectedLocation || undefined
      });
    } else {
      onAddBill({
        id: Math.random().toString(36).substr(2, 9),
        name: formData.title,
        amount: parseFloat(formData.amount) || 0,
        dueDate: formData.dueDate,
        status: 'pending',
        category: formData.financeCategory,
        reminder: reminderValue
      });
    }
    onClose();
    const today = new Date().toISOString().split('T')[0];
    setFormData({ 
      title: '', 
      date: today,
      time: '09:00 - 10:00', 
      type: currentPage === 'courses' ? 'Course' : 'Task', 
      amount: '', 
      dueDate: today,
      financeCategory: 'invoice',
      reminder: 'Aucun'
    });
    setSelectedTemplateId(null);
    setSelectedPlanName(null);
    setShowAllTemplates(false);
    setSearchQuery('');
    setSelectedLocation(null);
    setLocationSearch('');
    setLocationResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-transparent dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{language === 'fr' ? 'Ajouter un élément' : 'Add an Item'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-2 bg-slate-50 dark:bg-slate-800/50 flex border-b border-slate-100 dark:border-slate-800">
          <button 
            type="button"
            onClick={() => setActiveTab('planning')}
            className={`flex-1 py-3 px-4 rounded-3xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'planning' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <Calendar size={18} /> {language === 'fr' ? 'Planning' : 'Planning'}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`flex-1 py-3 px-4 rounded-3xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'finance' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <CreditCard size={18} /> {language === 'fr' ? 'Finances' : 'Finances'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-hide">
          {activeTab === 'planning' ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{language === 'fr' ? 'Titre de la tâche' : 'Task Title'}</label>
                <input 
                  required
                  type="text" 
                  placeholder={language === 'fr' ? "Ex: Réunion d'équipe" : "Ex: Team Meeting"}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-slate-100 font-bold"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{language === 'fr' ? 'Type' : 'Type'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {([['Task', language === 'fr' ? 'Tâche' : 'Task', 'green'], ['Meeting', language === 'fr' ? 'Réunion' : 'Meeting', 'blue'], ['Course', language === 'fr' ? 'Cours' : 'Course', 'purple']] as const).map(([value, label, color]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({...formData, type: value as 'Task' | 'Meeting' | 'Course'})}
                      className={`py-3 px-4 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${formData.type === value
                        ? color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-800 shadow-sm'
                        : color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 shadow-sm'
                        : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      {value === 'Task' ? <Clock size={14} /> : value === 'Meeting' ? <Users size={14} /> : <BookOpen size={14} />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500" /> {language === 'fr' ? 'Lieu (Recherche Google Maps)' : 'Location (Google Maps Search)'}
                </label>
                
                {selectedLocation ? (
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-[20px] border border-blue-200 dark:border-blue-900/30 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-blue-600 text-white rounded-xl">
                        <Navigation size={14} className="shrink-0" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-blue-700 dark:text-blue-300 truncate tracking-tight">{selectedLocation.name}</span>
                        <span className="text-[10px] font-bold text-blue-500/80 truncate">{selectedLocation.address}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedLocation(null)} className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full text-blue-600 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder={language === 'fr' ? "Chercher un lieu..." : "Search for a place..."}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-bold pr-14"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
                    />
                    <button 
                      type="button" 
                      onClick={searchLocation}
                      disabled={isSearchingLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-[14px] transition-all disabled:opacity-50 hover:bg-blue-700 shadow-md"
                    >
                      {isSearchingLocation ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </button>

                    {locationResults.length > 0 && (
                      <div className="absolute z-10 top-full left-0 right-0 mt-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[24px] shadow-2xl overflow-hidden animate-in slide-in-from-top-2 border-t-0">
                        {locationResults.map((res, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setSelectedLocation(res); setLocationResults([]); }}
                            className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-50 dark:border-slate-700 last:border-0 flex items-center gap-4 group transition-colors"
                          >
                            <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <MapPin size={16} />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">{res.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">{res.address}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{language === 'fr' ? 'Date' : 'Date'}</label>
                  <input required type="date" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-bold" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{language === 'fr' ? 'Horaires' : 'Time'}</label>
                  <input required type="text" placeholder="Ex: 10:00 - 12:00" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-bold" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[20px] mb-4">
                <button type="button" onClick={() => { setFinanceMode('template'); }} className={`flex-1 py-2.5 px-3 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${financeMode === 'template' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Zap size={14} /> Templates</button>
                <button type="button" onClick={() => { setFinanceMode('manual'); setSelectedTemplateId(null); setSelectedPlanName(null); }} className={`flex-1 py-2.5 px-3 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${financeMode === 'manual' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{language === 'fr' ? 'Libre' : 'Manual'}</button>
              </div>

              {financeMode === 'template' ? (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  {!selectedTemplateId ? (
                    <div className="space-y-5">
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          placeholder={language === 'fr' ? "Rechercher un service..." : "Search a service..."}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {filteredTemplates.map((tmpl) => (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => handleTemplateClick(tmpl)}
                            className="bg-white dark:bg-slate-900 p-4 rounded-[28px] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 transition-all group hover:border-blue-500 hover:ring-2 hover:ring-blue-500/10 shadow-sm active:scale-95 min-h-[110px]"
                          >
                            <div className="w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <img src={tmpl.logo} alt={tmpl.name} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-tight text-center truncate w-full">{tmpl.name}</span>
                          </button>
                        ))}
                        
                        {!showAllTemplates && searchQuery === '' && (
                          <button
                            type="button"
                            onClick={() => setShowAllTemplates(true)}
                            className="bg-white dark:bg-slate-900 p-4 rounded-[28px] border border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center gap-3 transition-all group hover:bg-blue-50/50 dark:hover:bg-blue-900/20 shadow-sm active:scale-95 min-h-[110px]"
                          >
                            <div className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center text-blue-600">
                              <Plus size={24} strokeWidth={3} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-tighter text-blue-600">{language === 'fr' ? 'ENCORE PLUS' : 'EVEN MORE'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in slide-in-from-right-2 duration-300">
                      <div className="flex items-center gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700">
                        <button type="button" onClick={() => setSelectedTemplateId(null)} className="p-2 bg-white dark:bg-slate-700 shadow-sm rounded-xl text-slate-500 hover:text-blue-600 transition-all"><ChevronLeft size={18} /></button>
                        <div className="w-10 h-10 flex items-center justify-center">
                          <img src={currentTemplate?.logo} className="w-full h-full object-contain" alt={currentTemplate?.name} />
                        </div>
                        <h4 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">{currentTemplate?.name}</h4>
                      </div>
                      {currentTemplate?.plans.map((plan) => (
                        <button 
                          key={plan.name} 
                          type="button" 
                          onClick={() => handlePlanSelect(plan)} 
                          className={`w-full p-5 rounded-[22px] border-2 flex items-center justify-between transition-all group ${selectedPlanName === plan.name ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200'}`}
                        >
                          <span className={`text-sm font-black tracking-tight ${selectedPlanName === plan.name ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{plan.name}</span>
                          <span className={`text-sm font-black ${selectedPlanName === plan.name ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'}`}>{plan.amount} €</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{language === 'fr' ? 'Libellé' : 'Label'}</label>
                    <input required type="text" placeholder={language === 'fr' ? "Ex: Abonnement Salle" : "Ex: Gym Subscription"} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-bold" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{language === 'fr' ? 'Montant (€)' : 'Amount (€)'}</label>
                  <input required type="number" step="0.01" placeholder="0.00" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-black" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{language === 'fr' ? 'Échéance' : 'Due Date'}</label>
                  <input required type="date" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-bold" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>
            </>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Bell size={12} className="text-blue-600" /> {language === 'fr' ? 'Rappel Automatique' : 'Auto Reminder'}</label>
            <div className="relative">
              <select className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 font-bold appearance-none" value={formData.reminder} onChange={(e) => setFormData({...formData, reminder: e.target.value})}>
                <option>{language === 'fr' ? 'Aucun' : 'None'}</option>
                <option>{language === 'fr' ? '15 minutes avant' : '15 minutes before'}</option>
                <option>{language === 'fr' ? '1 heure avant' : '1 hour before'}</option>
                <option>{language === 'fr' ? '1 jour avant' : '1 day before'}</option>
                <option>{language === 'fr' ? '1 semaine avant' : '1 week before'}</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4.5 px-6 border-2 border-slate-100 dark:border-slate-800 rounded-[22px] text-sm font-black text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
            <button type="submit" className="flex-1 py-4.5 px-6 bg-blue-600 text-white rounded-[22px] text-sm font-black shadow-2xl shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 active:scale-[0.98] transition-all">{language === 'fr' ? 'Ajouter' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
