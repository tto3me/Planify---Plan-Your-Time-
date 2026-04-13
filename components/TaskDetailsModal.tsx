
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Navigation, Trash2, CheckCircle2, Circle, ExternalLink, Tag, Pencil, Save, BookOpen, Users, ListTodo } from 'lucide-react';
import { Task } from '../types';

interface TaskDetailsModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onToggleStatus: () => void;
  language: 'fr' | 'en';
  timeFormat: '24h' | '12h';
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
  onDelete,
  onUpdate,
  onToggleStatus,
  language,
  timeFormat
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    date: task.date,
    startTime: task.time.split(' - ')[0],
    endTime: task.time.split(' - ')[1],
    type: task.type as 'Task' | 'Meeting' | 'Course'
  });

  useEffect(() => {
    setEditData({
      title: task.title,
      date: task.date,
      startTime: task.time.split(' - ')[0],
      endTime: task.time.split(' - ')[1],
      type: task.type
    });
  }, [task]);

  if (!isOpen) return null;

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

  const statusConfig = {
    todo: {
      label: language === 'fr' ? 'À faire' : 'To do',
      color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      icon: <Circle size={14} />
    },
    'in-progress': {
      label: language === 'fr' ? 'En cours' : 'In progress',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      icon: <Clock size={14} />
    },
    completed: {
      label: language === 'fr' ? 'Terminé' : 'Completed',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      icon: <CheckCircle2 size={14} />
    }
  };

  const currentStatus = statusConfig[task.status];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    onClose();
  };

  const handleSave = () => {
    const typeToColor = { Task: 'green', Meeting: 'blue', Course: 'purple' };
    onUpdate({
      title: editData.title,
      date: editData.date,
      time: `${editData.startTime} - ${editData.endTime}`,
      type: editData.type,
      color: typeToColor[editData.type] || 'orange'
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
        {/* Header Color Strip */}
        <div className={`h-2 w-full transition-colors duration-500 ${
          (isEditing ? (editData.type === 'Meeting' ? 'bg-blue-500' : editData.type === 'Course' ? 'bg-purple-500' : 'bg-green-500') : 
          (task.color === 'blue' ? 'bg-blue-500' : 
          task.color === 'green' ? 'bg-green-500' : 
          task.color === 'purple' ? 'bg-purple-500' : 
          'bg-orange-500'))
        }`} />
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${currentStatus.color}`}>
              {currentStatus.icon} {currentStatus.label}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
                title={isEditing ? (language === 'fr' ? 'Annuler' : 'Cancel') : (language === 'fr' ? 'Modifier' : 'Edit')}
              >
                {isEditing ? <X size={20} /> : <Pencil size={20} />}
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {isEditing ? (
            <input 
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({...editData, title: e.target.value})}
              className="w-full text-3xl font-black text-slate-800 dark:text-slate-100 mb-8 leading-tight bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-2 border-blue-500/30 focus:outline-none focus:border-blue-500 shadow-inner"
            />
          ) : (
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-8 leading-tight">
              {task.title}
            </h2>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100/50 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{language === 'fr' ? 'DATE' : 'DATE'}</p>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                  <Calendar size={18} className="text-blue-500" />
                  {isEditing ? (
                    <input 
                      type="date"
                      value={editData.date}
                      onChange={(e) => setEditData({...editData, date: e.target.value})}
                      className="bg-transparent border-none focus:ring-0 text-sm w-full font-bold"
                    />
                  ) : (
                    <span>{task.date}</span>
                  )}
                </div>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100/50 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{language === 'fr' ? 'HORAIRE' : 'SCHEDULE'}</p>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                  <Clock size={18} className="text-blue-500" />
                  {isEditing ? (
                    <div className="flex flex-col gap-1 w-full">
                      <input 
                        type="time"
                        value={editData.startTime}
                        onChange={(e) => setEditData({...editData, startTime: e.target.value})}
                        className="bg-transparent border-none focus:ring-0 text-[10px] font-bold"
                      />
                      <input 
                        type="time"
                        value={editData.endTime}
                        onChange={(e) => setEditData({...editData, endTime: e.target.value})}
                        className="bg-transparent border-none focus:ring-0 text-[10px] font-bold"
                      />
                    </div>
                  ) : (
                    <span className="text-xs">{formatTimeDisplay(task.time)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border transition-all ${isEditing ? 'border-blue-500/30 ring-4 ring-blue-500/5' : 'border-slate-100/50 dark:border-slate-800'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                  <Tag size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{language === 'fr' ? 'CATÉGORIE' : 'CATEGORY'}</p>
                  {!isEditing && <p className="text-sm font-black text-slate-700 dark:text-slate-200">{task.type}</p>}
                </div>
              </div>

              {isEditing && (
                <div className="grid grid-cols-3 gap-2 mt-4 animate-in fade-in slide-in-from-top-1">
                  {(['Task', 'Meeting', 'Course'] as const).map((t) => {
                    const Icon = t === 'Meeting' ? Users : t === 'Course' ? BookOpen : ListTodo;
                    const isActive = editData.type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEditData({ ...editData, type: t })}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                          isActive 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                            : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <Icon size={18} className="mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{t}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {task.location && (
              <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-red-500" />
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{language === 'fr' ? 'LIEU' : 'LOCATION'}</p>
                  </div>
                  {task.location.url && (
                    <a 
                      href={task.location.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[11px] font-black text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      {language === 'fr' ? 'Maps' : 'Open Maps'} <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{task.location.name}</h4>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{task.location.address}</p>
              </div>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
            {isEditing ? (
              <button 
                onClick={handleSave}
                className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 dark:shadow-blue-900/40 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {language === 'fr' ? 'Enregistrer' : 'Save Changes'}
              </button>
            ) : (
              <button 
                onClick={() => { onToggleStatus(); }}
                className={`flex-1 h-14 rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  task.status === 'completed' 
                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' 
                    : 'bg-blue-600 text-white shadow-blue-200 dark:shadow-blue-900/40 hover:bg-blue-700'
                }`}
              >
                <CheckCircle2 size={18} />
                {task.status === 'completed' 
                  ? (language === 'fr' ? 'Rouvrir' : 'Reopen') 
                  : (language === 'fr' ? 'Terminer' : 'Mark done')
                }
              </button>
            )}
            <button 
              onClick={handleDelete}
              className="w-14 h-14 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-all active:scale-95 border-2 border-red-100 dark:border-red-900/30"
              title={language === 'fr' ? 'Mettre à la corbeille' : 'Move to trash'}
            >
              <Trash2 size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
