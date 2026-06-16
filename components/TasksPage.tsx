
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">{translations.title}</h2>
          <p className="text-[var(--color-text-muted)] font-medium">{translations.subTitle}</p>
        </div>
        <button onClick={onOpenModal} className="px-6 py-3 bg-[#6c5ce7] text-white rounded-xl font-bold hover:bg-[#5b4bd5] transition-all shadow-lg shadow-[#6c5ce7]/20 flex items-center gap-2 active:scale-95">
          <ListTodo size={20} /> {translations.newTask}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl flex items-center gap-4 transition-all">
          <div className="w-12 h-12 bg-[var(--color-border)] rounded-xl flex items-center justify-center text-[var(--color-text-muted)]"><CircleDashed size={24} /></div>
          <div><p className="text-2xl font-bold text-[var(--color-text)]">{todo.length}</p><p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{translations.todo}</p></div>
        </div>
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl flex items-center gap-4 transition-all">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400"><Clock size={24} /></div>
          <div><p className="text-2xl font-bold text-[var(--color-text)]">{inProgress.length}</p><p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{translations.inProgress}</p></div>
        </div>
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl flex items-center gap-4 transition-all">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400"><CheckCircle2 size={24} /></div>
          <div><p className="text-2xl font-bold text-[var(--color-text)]">{completed.length}</p><p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{translations.completed}</p></div>
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-400 px-2"><AlertCircle size={20} /><h3 className="text-lg font-bold tracking-tight">{translations.overdue}</h3></div>
          <div className="bg-red-500/5 rounded-2xl border border-red-500/20 overflow-hidden transition-all">
            <div className="divide-y divide-red-500/10">
              {overdueTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => onViewTask(task)}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-red-500/5 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-center justify-center w-24 text-center"><span className="text-[10px] font-bold text-red-500/60 uppercase tracking-tighter">{translations.overdueDate}</span><span className="text-xs font-bold text-red-400">{task.date}</span></div>
                    <div className="w-1.5 h-12 rounded-full bg-red-500 transition-all group-hover:w-2"></div>
                    <div>
                      <h4 className="font-bold text-lg text-red-300 group-hover:underline">{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider">{translations.attention}</span>
                        <span className="text-red-900">•</span>
                        <span className="text-xs font-medium text-red-400 flex items-center gap-1"><Clock size={12} /> {formatTimeDisplay(task.time)}</span>
                        {task.location && <span className="text-xs font-medium text-red-400 flex items-center gap-1"><MapPin size={12} /> {task.location.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onToggleTaskStatus(task.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest bg-[var(--color-card)] text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all active:scale-95"><RotateCcw size={14} />{translations.finishNow}</button>
                    <button onClick={() => onDeleteTask(task.id)} className="p-2 text-red-900 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--color-text)] px-2">{translations.taskList}</h3>
        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden transition-all">
          <div className="divide-y divide-[var(--color-border)]">
            {regularTasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => onViewTask(task)}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--color-card-hover)] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-center justify-center w-24 text-center"><span className="text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-tighter">{translations.date}</span><span className="text-xs font-bold text-[var(--color-text-secondary)]">{task.date}</span></div>
                  <div className={`w-1 h-12 rounded-full transition-all group-hover:w-2 ${task.color === 'blue' ? 'bg-blue-500' : task.color === 'green' ? 'bg-emerald-500' : task.color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
                  <div>
                    <h4 className={`font-bold text-lg group-hover:text-[#6c5ce7] transition-colors ${task.status === 'completed' ? 'text-[var(--color-text-dim)] line-through' : 'text-[var(--color-text)]'}`}>{task.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1">{task.type === 'Meeting' ? <Users size={12} /> : task.type === 'Course' ? <BookOpen size={12} /> : <Clock size={12} />}{task.type}</span>
                      <span className="text-[var(--color-text-dim)]">•</span>
                      <span className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1"><Clock size={12} /> {formatTimeDisplay(task.time)}</span>
                      {task.location && <><span className="text-[var(--color-text-dim)]">•</span><span className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1"><MapPin size={12} /> {task.location.name}</span></>}
                      {task.reminder && <><span className="text-[var(--color-text-dim)]">•</span><span className="text-[10px] font-bold text-[#6c5ce7] flex items-center gap-1 uppercase tracking-tight"><Bell size={10} /> {task.reminder}</span></>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => onToggleTaskStatus(task.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all active:scale-95 border ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' : 'bg-[var(--color-border)] text-[var(--color-text-muted)] border-[var(--color-border-light)] hover:bg-[var(--color-border-light)]'}`}>{task.status === 'completed' ? <CheckCircle2 size={14} /> : task.status === 'in-progress' ? <RotateCcw size={14} /> : <CircleDashed size={14} />}{task.status === 'completed' ? 'Fini' : task.status === 'in-progress' ? 'En cours' : 'À faire'}</button>
                  <button onClick={() => onDeleteTask(task.id)} className="p-2 text-[var(--color-text-dim)] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-90" title="Supprimer la tâche"><Trash2 size={20} /></button>
                </div>
              </div>
            ))}
            {regularTasks.length === 0 && overdueTasks.length === 0 && <div className="py-20 text-center space-y-4"><div className="w-16 h-16 bg-[var(--color-border)] rounded-full flex items-center justify-center mx-auto text-[var(--color-text-dim)]"><ListTodo size={32} /></div><p className="text-[var(--color-text-muted)] font-medium">{translations.empty}</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
