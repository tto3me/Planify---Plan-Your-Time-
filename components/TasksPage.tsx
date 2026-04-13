
import React from 'react';
import { Task } from '../types';
import { 
  ListTodo, 
  CircleDashed, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Trash2, 
  Users, 
  BookOpen, 
  Bell,
  MapPin
} from 'lucide-react';

interface TasksPageProps {
  tasks: Task[];
  onOpenModal: () => void;
  onToggleTaskStatus: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onViewTask: (task: Task) => void;
  timeFormat: '24h' | '12h';
  language: 'fr' | 'en';
}

const TasksPage: React.FC<TasksPageProps> = ({ tasks, onOpenModal, onToggleTaskStatus, onDeleteTask, onViewTask, timeFormat, language }) => {
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.date < today && t.status !== 'completed');
  const regularTasks = tasks.filter(t => !overdueTasks.includes(t));

  const todo = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const completed = tasks.filter(t => t.status === 'completed');

  const translations = language === 'fr' ? {
    title: "Planning Complet",
    subTitle: "Visionnez et organisez toutes vos tâches.",
    newTask: "Nouvelle tâche",
    todo: "À faire",
    inProgress: "En cours",
    completed: "Terminées",
    overdue: "Tâches en retard",
    overdueDate: "Date dépassée",
    finishNow: "Terminer maintenant",
    taskList: "Liste des tâches",
    empty: "Votre planning est vide pour le moment.",
    date: "Date",
    attention: "Attention"
  } : {
    title: "Full Schedule",
    subTitle: "View and organize all your tasks.",
    newTask: "New Task",
    todo: "To Do",
    inProgress: "In Progress",
    completed: "Completed",
    overdue: "Overdue Tasks",
    overdueDate: "Date expired",
    finishNow: "Finish now",
    taskList: "Task list",
    empty: "Your schedule is currently empty.",
    date: "Date",
    attention: "Attention"
  };

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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">{translations.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">{translations.subTitle}</p>
        </div>
        <button onClick={onOpenModal} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/30 flex items-center gap-2 active:scale-95">
          <ListTodo size={20} /> {translations.newTask}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4 transition-all">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400"><CircleDashed size={24} /></div>
          <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{todo.length}</p><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{translations.todo}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4 transition-all">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400"><Clock size={24} /></div>
          <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{inProgress.length}</p><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{translations.inProgress}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4 transition-all">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400"><CheckCircle2 size={24} /></div>
          <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{completed.length}</p><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{translations.completed}</p></div>
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 px-2"><AlertCircle size={20} /><h3 className="text-lg font-bold tracking-tight">{translations.overdue}</h3></div>
          <div className="bg-red-50/50 dark:bg-red-900/10 rounded-3xl border-2 border-red-200 dark:border-red-900/30 shadow-sm overflow-hidden transition-all">
            <div className="divide-y divide-red-100 dark:divide-red-900/20">
              {overdueTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => onViewTask(task)}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-red-100/30 dark:hover:bg-red-900/20 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-center justify-center w-24 text-center"><span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">{translations.overdueDate}</span><span className="text-xs font-bold text-red-700 dark:text-red-400">{task.date}</span></div>
                    <div className="w-1.5 h-12 rounded-full bg-red-500 transition-all group-hover:w-2"></div>
                    <div>
                      <h4 className="font-bold text-lg text-red-900 dark:text-red-200 group-hover:underline">{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider">{translations.attention}</span>
                        <span className="text-red-200 dark:text-red-900/40">•</span>
                        <span className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1"><Clock size={12} /> {formatTimeDisplay(task.time)}</span>
                        {task.location && <span className="text-xs font-medium text-red-600 flex items-center gap-1"><MapPin size={12} /> {task.location.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onToggleTaskStatus(task.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/40 transition-all active:scale-95"><RotateCcw size={14} />{translations.finishNow}</button>
                    <button onClick={() => onDeleteTask(task.id)} className="p-2 text-red-300 dark:text-red-900/40 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all active:scale-90"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 px-2 transition-colors">{translations.taskList}</h3>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {regularTasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => onViewTask(task)}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-center justify-center w-24 text-center"><span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{translations.date}</span><span className="text-xs font-bold text-slate-800 dark:text-slate-200">{task.date}</span></div>
                  <div className={`w-1 h-12 rounded-full transition-all group-hover:w-2 ${task.color === 'blue' ? 'bg-blue-500' : task.color === 'green' ? 'bg-green-500' : task.color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
                  <div>
                    <h4 className={`font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${task.status === 'completed' ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">{task.type === 'Meeting' ? <Users size={12} /> : task.type === 'Course' ? <BookOpen size={12} /> : <Clock size={12} />}{task.type}</span>
                      <span className="text-slate-200 dark:text-slate-800">•</span>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1"><Clock size={12} /> {formatTimeDisplay(task.time)}</span>
                      {task.location && <><span className="text-slate-200 dark:text-slate-800">•</span><span className="text-xs font-medium text-slate-400 flex items-center gap-1"><MapPin size={12} /> {task.location.name}</span></>}
                      {task.reminder && <><span className="text-slate-200 dark:text-slate-800">•</span><span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 flex items-center gap-1 uppercase tracking-tight"><Bell size={10} /> {task.reminder}</span></>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => onToggleTaskStatus(task.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${task.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30 hover:bg-green-100' : task.status === 'in-progress' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 hover:bg-blue-100' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100'}`}>{task.status === 'completed' ? <CheckCircle2 size={14} /> : task.status === 'in-progress' ? <RotateCcw size={14} /> : <CircleDashed size={14} />}{task.status === 'completed' ? 'Fini' : task.status === 'in-progress' ? 'En cours' : 'À faire'}</button>
                  <button onClick={() => onDeleteTask(task.id)} className="p-2 text-slate-300 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all active:scale-90" title="Supprimer la tâche"><Trash2 size={20} /></button>
                </div>
              </div>
            ))}
            {regularTasks.length === 0 && overdueTasks.length === 0 && <div className="py-20 text-center space-y-4"><div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300 dark:text-slate-700"><ListTodo size={32} /></div><p className="text-slate-400 dark:text-slate-500 font-medium">{translations.empty}</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
