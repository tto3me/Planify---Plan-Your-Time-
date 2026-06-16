
import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  LayoutGrid, 
  Columns, 
  Rows, 
  CalendarDays,
  Check,
  X as CloseIcon,
  AlertTriangle,
  MapPin,
  ExternalLink,
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Globe,
  Link2,
  Trash2
} from 'lucide-react';

interface CalendarPageProps {
  tasks: Task[];
  onOpenModal: () => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onViewTask: (task: Task) => void;
  timeFormat: '24h' | '12h';
  language: 'fr' | 'en';
  userName: string;
  onSubscribeCalendar?: (url: string, type: 'Task' | 'Meeting' | 'Course' | 'Finance') => Promise<void>;
  onRemoveCalendar?: (url: string) => Promise<void>;
  currentIcalUrls?: string[];
}

type ViewType = 'day' | 'week' | 'month' | '3months';

const CalendarPage: React.FC<CalendarPageProps> = ({ tasks, userName, onOpenModal, onUpdateTask, onViewTask, timeFormat, language, onSubscribeCalendar, onRemoveCalendar, currentIcalUrls = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [icalInput, setIcalInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [icalType, setIcalType] = useState<'Task' | 'Meeting' | 'Course' | 'Finance'>('Course');
  
  const [pendingMove, setPendingMove] = useState<{ 
    taskId: string, 
    newDate: string, 
    startTime: string,
    endTime: string 
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const formatTimeDisplay = (timeRange: string) => {
    if (timeFormat === '24h') return timeRange;
    return timeRange.split(' - ').map(t => {
      const [h, m] = t.split(':').map(Number);
      if (isNaN(h)) return t;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    }).join(' - ');
  };

  const parseTaskTime = (timeStr: string) => {
    const parts = timeStr.split(' - ');
    return {
      start: parts[0] || "09:00",
      end: parts[1] || "10:00"
    };
  };

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    else if (view === 'week') newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    else if (view === 'month') newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    else if (view === '3months') newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 3 : -3));
    setCurrentDate(newDate);
  };

  const resetToToday = () => setCurrentDate(new Date());

  const exportToExcel = () => {
    const headers = ["Title", "Date", "Time", "Type", "Status", "Location"];
    const csvContent = [
      headers.join(","),
      ...tasks.map(t => [
        `"${t.title}"`,
        t.date,
        `"${t.time}"`,
        t.type,
        t.status,
        `"${t.location?.name || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `planify_export_${formatDate(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  const exportToPDF = () => {
    // Instantly hide any non-essential UI that might blink during screenshot
    setIsExportMenuOpen(false);
    
    // Give time for state updates to apply before printing
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, date: string, slotTime?: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setDragOverDate(null);
    setDraggedTaskId(null);

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const originalTime = parseTaskTime(task.time);
      let newStartTime = originalTime.start;
      let newEndTime = originalTime.end;

      if (slotTime) {
        const slotStart = slotTime.split(' - ')[0];
        const slotHour = slotStart.split(':')[0];
        const originalMinutes = originalTime.start.split(':')[1];
        newStartTime = `${slotHour}:${originalMinutes}`;
        
        const [hStart, mStart] = originalTime.start.split(':').map(Number);
        const [hEnd, mEnd] = originalTime.end.split(':').map(Number);
        const durationMinutes = (hEnd * 60 + mEnd) - (hStart * 60 + mStart);
        
        const [nHStart, nMStart] = newStartTime.split(':').map(Number);
        const totalEndMinutes = (nHStart * 60 + nMStart) + durationMinutes;
        const nHEnd = Math.floor(totalEndMinutes / 60) % 24;
        const nMEnd = totalEndMinutes % 60;
        newEndTime = `${nHEnd.toString().padStart(2, '0')}:${nMEnd.toString().padStart(2, '0')}`;
      }

      setPendingMove({ 
        taskId, 
        newDate: date, 
        startTime: newStartTime,
        endTime: newEndTime
      });
    }
  };

  const confirmMove = () => {
    if (pendingMove) {
      onUpdateTask(pendingMove.taskId, { 
        date: pendingMove.newDate,
        time: `${pendingMove.startTime} - ${pendingMove.endTime}`
      });
      setPendingMove(null);
    }
  };

  const renderMonth = (date: Date, showHeader = true) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];
    
    for (let i = 0; i < offset; i++) {
      days.push(<div key={`pad-${i}`} className="h-24 md:h-32 bg-slate-50/30 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800 border" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const fullDateString = formatDate(new Date(year, month, d));
      const dayTasks = tasks.filter(t => t.date === fullDateString);
      const isToday = formatDate(new Date()) === fullDateString;
      const isDragOver = dragOverDate === fullDateString;

      days.push(
        <div 
          key={d} 
          onDragOver={(e) => handleDragOver(e, fullDateString)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, fullDateString)}
          className={`h-24 md:h-32 p-2 border border-slate-100 dark:border-slate-800 relative group transition-all duration-200 ${
            isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'bg-white dark:bg-slate-900'
          } ${isDragOver ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
        >
          <span className={`text-xs font-bold ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-500 dark:text-slate-400'}`}>
            {d}
          </span>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-1.5rem)] scrollbar-hide">
            {dayTasks.map(task => (
              <div 
                key={task.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={(e) => { e.stopPropagation(); onViewTask(task); }}
                className={`text-[9px] px-1.5 py-0.5 rounded-md truncate font-semibold border cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                  task.status === 'completed' 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through border-slate-200 dark:border-slate-700' 
                  : `bg-${task.color}-50 dark:bg-${task.color}-900/20 text-${task.color}-700 dark:text-${task.color}-400 border-${task.color}-100 dark:border-${task.color}-900/30`
                } ${draggedTaskId === task.id ? 'opacity-30' : ''} flex items-center gap-1`}
              >
                {task.location && <MapPin size={8} />}
                {task.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {showHeader && (
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize">
            {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' }).format(date)}
          </h4>
        )}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="grid grid-cols-7 min-w-[600px] md:min-w-0 border-t border-l border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {(language === 'fr' ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map(day => (
            <div key={day} className="py-2 bg-slate-50 dark:bg-slate-800 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-r border-b border-slate-100 dark:border-slate-800">
              {day}
            </div>
          ))}
          {days}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const todayStr = formatDate(currentDate);
    const dayTasks = tasks.filter(t => t.date === todayStr);
    const hours = Array.from({ length: 15 }, (_, i) => i + 8);

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
            {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(currentDate)}
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {hours.map(hour => {
            const hourString = `${hour}:00`;
            const slotStart = `${hour.toString().padStart(2, '0')}:00`;
            const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;
            const slotLabel = `${slotStart} - ${slotEnd}`;
            const tasksAtHour = dayTasks.filter(t => t.time.startsWith(hour.toString().padStart(2, '0')));
            const isDragOver = dragOverDate === `${todayStr}-${hour}`;
            
            return (
              <div 
                key={hour} 
                className="flex min-h-[100px] group"
                onDragOver={(e) => handleDragOver(e, `${todayStr}-${hour}`)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, todayStr, slotLabel)}
              >
                <div className="w-20 py-4 px-4 text-xs font-bold text-slate-400 border-r border-slate-100 dark:border-slate-800 text-right">
                  {hourString}
                </div>
                <div className={`flex-1 p-2 space-y-2 transition-colors ${isDragOver ? 'bg-blue-100/50 dark:bg-blue-900/30' : 'bg-slate-50/20 dark:bg-slate-900/20 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50'}`}>
                  {tasksAtHour.map(task => (
                    <div 
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={(e) => { e.stopPropagation(); onViewTask(task); }}
                      className={`p-3 rounded-2xl border-l-4 shadow-sm animate-in slide-in-from-left-2 cursor-pointer transition-all hover:scale-[1.01] ${
                        task.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300' :
                        task.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300' :
                        task.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300' :
                        'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-700 dark:text-orange-300'
                      } ${task.status === 'completed' ? 'opacity-50 grayscale' : ''} ${draggedTaskId === task.id ? 'opacity-30' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm">{task.title}</span>
                        <span className="text-[10px] font-bold opacity-70">{formatTimeDisplay(task.time)}</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">{task.type}</span>
                          {task.reminder && <span className="text-[10px] flex items-center gap-1 font-bold"><Clock size={10}/> {task.reminder}</span>}
                        </div>
                        {task.location && (
                          <div className="flex items-center gap-1.5 p-1 px-2 mt-1 rounded-lg bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 w-fit group/loc">
                            <MapPin size={10} className="text-red-500" />
                            <span className="text-[10px] font-bold truncate max-w-[200px]">{task.location.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 print:p-0 print:space-y-4">
      {/* Print-only professional header */}
      <div className="print-only hidden">
        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Planify</h1>
            <p className="text-sm font-bold text-slate-500">{language === 'fr' ? 'Exportation de Calendrier Professionnel' : 'Professional Calendar Export'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{language === 'fr' ? 'Généré le' : 'Generated on'}</p>
            <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-blue-600" size={32} /> {language === 'fr' ? `Calendrier de ${userName}` : `${userName}'s Calendar`}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{language === 'fr' ? 'Gérez votre emploi du temps visuellement.' : 'Manage your schedule visually.'}</p>
        </div>
        
        <div className="flex items-center gap-1 md:gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto w-full md:w-auto scrollbar-hide">
          <button onClick={() => setView('day')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${view === 'day' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Rows size={16} /> {language === 'fr' ? 'Jour' : 'Day'}</button>
          <button onClick={() => setView('week')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${view === 'week' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Columns size={16} /> {language === 'fr' ? 'Semaine' : 'Week'}</button>
          <button onClick={() => setView('month')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${view === 'month' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><LayoutGrid size={16} /> {language === 'fr' ? 'Mois' : 'Month'}</button>
          <button onClick={() => setView('3months')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${view === '3months' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><CalendarDays size={16} /> {language === 'fr' ? '3 Mois' : '3 Months'}</button>
        </div>
      </header>

      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button onClick={() => navigate('prev')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 dark:text-slate-400"><ChevronLeft size={24} /></button>
            <button onClick={() => navigate('next')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 dark:text-slate-400"><ChevronRight size={24} /></button>
          </div>
          <button onClick={resetToToday} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">{language === 'fr' ? "Aujourd'hui" : "Today"}</button>
          <button onClick={() => setIsSyncModalOpen(true)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"><Globe size={20} /></button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={exportMenuRef}>
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              <Download size={18} className="text-blue-500" />
              <span>{language === 'fr' ? 'Exporter' : 'Export'}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200">
                <button 
                  onClick={exportToPDF}
                  className="w-full px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                >
                  <FileText size={16} className="text-red-500" />
                  {language === 'fr' ? 'Export PDF' : 'Export as PDF'}
                </button>
                <button 
                  onClick={exportToExcel}
                  className="w-full px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                >
                  <FileSpreadsheet size={16} className="text-green-500" />
                  {language === 'fr' ? 'Export Excel (CSV)' : 'Export as Excel'}
                </button>
              </div>
            )}
          </div>
          
          <button onClick={onOpenModal} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/30 active:scale-95"><Plus size={20} /> {language === 'fr' ? 'Programmer' : 'Schedule'}</button>
        </div>
      </div>

      <div className="space-y-12">
        {view === 'month' && renderMonth(currentDate)}
        {view === 'day' && renderDayView()}
        {view === 'week' && (
          <div className="space-y-4">
             <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
               {language === 'fr' ? 'Semaine du' : 'Week of'} {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long' }).format(new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)))}
             </h4>
             <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
               <div className="grid grid-cols-7 min-w-[700px] md:min-w-0 border-t border-l border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                 {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date(currentDate);
                  d.setDate(currentDate.getDate() - currentDate.getDay() + i + 1);
                  const fullDateStr = formatDate(d);
                  const dayTasks = tasks.filter(t => t.date === fullDateStr);
                  const isToday = formatDate(new Date()) === fullDateStr;
                  const isDragOver = dragOverDate === fullDateStr;

                  return (
                    <div 
                      key={i} 
                      onDragOver={(e) => handleDragOver(e, fullDateStr)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, fullDateStr)}
                      className={`min-h-[400px] border-r border-b border-slate-100 dark:border-slate-800 transition-colors duration-200 ${isToday ? 'bg-blue-50/20 dark:bg-blue-900/5' : 'bg-white dark:bg-slate-900'} ${isDragOver ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className={`p-4 text-center border-b border-slate-50 dark:border-slate-800 ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' }).format(d)}</div>
                        <div className={`text-xl font-black ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{d.getDate()}</div>
                      </div>
                      <div className="p-2 space-y-2">
                        {dayTasks.map(task => (
                          <div 
                            key={task.id} 
                            draggable 
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={(e) => { e.stopPropagation(); onViewTask(task); }}
                            className={`p-3 rounded-2xl border flex flex-col gap-2 cursor-pointer transition-all hover:scale-[1.05] active:scale-95 shadow-sm hover:shadow-md ${task.status === 'completed' ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 line-through border-slate-100 dark:border-slate-700' : `bg-${task.color}-50 dark:bg-${task.color}-900/20 text-${task.color}-700 dark:text-${task.color}-300 border-${task.color}-100 dark:border-${task.color}-900/30`} ${draggedTaskId === task.id ? 'opacity-30' : ''}`}
                          >
                            <div className="font-bold text-[11px] leading-tight flex items-start gap-1">
                              {task.location && <MapPin size={10} className="shrink-0 mt-0.5 text-red-500" />}
                              <span className="truncate">{task.title}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-70 text-[9px] font-medium"><Clock size={10}/> {formatTimeDisplay(task.time)}</div>
                            {task.location && <div className="text-[8px] opacity-60 font-bold truncate">{task.location.name}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
             </div>
             </div>
          </div>
        )}
        {view === '3months' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {renderMonth(currentDate)}
            {renderMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            {renderMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1))}
          </div>
        )}
      </div>

      {pendingMove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">{language === 'fr' ? "Ajuster l'horaire" : "Adjust time"}</h3>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium text-center">
                {language === 'fr' ? 'Date' : 'Date'} : <span className="font-bold text-blue-600 dark:text-blue-400">{pendingMove.newDate}</span>
              </p>

              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{language === 'fr' ? 'Début' : 'Start'} ({timeFormat})</label>
                    <input 
                      type="time" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-bold"
                      value={pendingMove.startTime}
                      onChange={(e) => setPendingMove({...pendingMove, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{language === 'fr' ? 'Fin' : 'End'} ({timeFormat})</label>
                    <input 
                      type="time" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-bold"
                      value={pendingMove.endTime}
                      onChange={(e) => setPendingMove({...pendingMove, endTime: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setPendingMove(null)}
                  className="flex-1 py-3 px-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <CloseIcon size={18} /> {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button 
                  onClick={confirmMove}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Check size={18} /> {language === 'fr' ? 'Valider' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync iCal Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSyncModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg p-6 md:p-8 relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Globe className="text-blue-500" /> {language === 'fr' ? 'Abonnements iCal' : 'iCal Subscriptions'}</h2>
              <button onClick={() => setIsSyncModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><CloseIcon size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">{language === 'fr' ? 'Ajouter un lien (.ics)' : 'Add Link (.ics)'}</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={icalInput}
                    onChange={(e) => { setIcalInput(e.target.value); setSyncError(''); }}
                    placeholder="https://calendar.google.com/calendar/ical/...basic.ics"
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium dark:text-white"
                  />
                  <div className="flex flex-col gap-3">
                    <select
                      value={icalType}
                      onChange={(e) => setIcalType(e.target.value as any)}
                      className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium dark:text-white"
                    >
                      <option value="Course">{language === 'fr' ? '📚 Cours' : '📚 Course'}</option>
                      <option value="Meeting">{language === 'fr' ? '👥 Réunion' : '👥 Meeting'}</option>
                      <option value="Task">{language === 'fr' ? '✅ Tâche' : '✅ Task'}</option>
                      <option value="Finance">{language === 'fr' ? '💶 Finance' : '💶 Finance'}</option>
                    </select>
                    <button 
                      onClick={async () => {
                        if (!icalInput || !onSubscribeCalendar) return;
                        setSyncError('');
                        setIsSyncing(true);
                        try {
                          await onSubscribeCalendar(icalInput, icalType);
                          setIcalInput('');
                      } catch (err: any) {
                        setSyncError(language === 'fr' 
                          ? 'Impossible de récupérer ce calendrier. Vérifiez que le lien est un fichier .ics valide et accessible publiquement.' 
                          : 'Could not fetch this calendar. Make sure the link is a valid, publicly accessible .ics file.');
                      } finally {
                        setIsSyncing(false);
                      }
                    }}
                    disabled={isSyncing || !icalInput}
                    className="px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-50 transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    {isSyncing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Link2 size={16} />}
                    {language === 'fr' ? 'Ajouter' : 'Add'}
                    </button>
                  </div>
                </div>
                {syncError && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl mt-2">
                    ⚠️ {syncError}
                  </p>
                )}
              </div>

              {currentIcalUrls && currentIcalUrls.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{language === 'fr' ? 'Abonnements actifs' : 'Active Subscriptions'}</h3>
                  <div className="space-y-2">
                    {currentIcalUrls.map(url => (
                      <div key={url} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate flex-1 mr-4">{url}</span>
                        <button 
                          onClick={() => onRemoveCalendar && onRemoveCalendar(url)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
