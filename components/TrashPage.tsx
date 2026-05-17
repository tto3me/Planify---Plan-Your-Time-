
import React from 'react';
import { Task, Bill } from '../types';
import { Trash2, RefreshCcw, Wallet } from 'lucide-react';

interface TrashPageProps {
  deletedTasks: Task[];
  deletedBills: Bill[];
  onRestoreTask: (id: string) => void;
  onPermanentDeleteTask: (id: string) => void;
  onRestoreBill: (id: string) => void;
  onPermanentDeleteBill: (id: string) => void;
  onEmptyTrash: () => void;
  onGoHome: () => void;
  // Added missing language prop
  language: 'fr' | 'en';
}

const TrashPage: React.FC<TrashPageProps> = ({ 
  deletedTasks, 
  deletedBills, 
  onRestoreTask, 
  onPermanentDeleteTask, 
  onRestoreBill, 
  onPermanentDeleteBill, 
  onEmptyTrash,
  onGoHome,
  language
}) => {
  const totalDeleted = deletedTasks.length + deletedBills.length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3 transition-colors">
            <Trash2 className="text-slate-400 dark:text-slate-600" size={32} /> {language === 'fr' ? 'Corbeille' : 'Trash'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{language === 'fr' ? 'Éléments supprimés récemment. Vous pouvez les restaurer ou les supprimer à jamais.' : 'Recently deleted items. You can restore them or delete them forever.'}</p>
        </div>
        {totalDeleted > 0 && (
          <button 
            onClick={onEmptyTrash}
            className="px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Trash2 size={20} /> {language === 'fr' ? 'Vider la corbeille' : 'Empty Trash'}
          </button>
        )}
      </header>

      {totalDeleted === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed transition-all">
           <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
              <Trash2 size={40} />
           </div>
           <h3 className="text-xl font-bold text-slate-400 dark:text-slate-600">{language === 'fr' ? 'La corbeille est vide' : 'The trash is empty'}</h3>
           <p className="text-slate-400 dark:text-slate-600 text-sm mb-6">{language === 'fr' ? 'Tout est en ordre !' : 'Everything is in order!'}</p>
           <button 
              onClick={onGoHome}
              className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
           >
              {language === 'fr' ? 'Retour au Dashboard' : 'Back to Dashboard'}
           </button>
        </div>
      ) : (
        <div className="space-y-8">
          {deletedTasks.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{language === 'fr' ? `Tâches (${deletedTasks.length})` : `Tasks (${deletedTasks.length})`}</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {deletedTasks.map((task) => (
                  <div key={task.id} className="p-6 flex items-center justify-between group opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-4">
                       <div className="w-1 h-10 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                       <div>
                         <h4 className="font-bold text-slate-600 dark:text-slate-400 line-through">{task.title}</h4>
                         <p className="text-xs text-slate-400 dark:text-slate-500">{task.date} • {task.time}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => onRestoreTask(task.id)}
                         className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                         title={language === 'fr' ? "Restaurer" : "Restore"}
                       >
                         <RefreshCcw size={18} />
                       </button>
                       <button 
                         onClick={() => onPermanentDeleteTask(task.id)}
                         className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                         title={language === 'fr' ? "Supprimer définitivement" : "Delete permanently"}
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {deletedBills.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{language === 'fr' ? `Finances (${deletedBills.length})` : `Finances (${deletedBills.length})`}</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {deletedBills.map((bill) => (
                  <div key={bill.id} className="p-6 flex items-center justify-between group opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl">
                          <Wallet size={18} />
                       </div>
                       <div>
                         <h4 className="font-bold text-slate-600 dark:text-slate-400 line-through">{bill.name}</h4>
                         <p className="text-xs text-slate-400 dark:text-slate-500">{bill.amount.toFixed(2)} € • {bill.dueDate}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => onRestoreBill(bill.id)}
                         className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                         title={language === 'fr' ? "Restaurer" : "Restore"}
                       >
                         <RefreshCcw size={18} />
                       </button>
                       <button 
                         onClick={() => onPermanentDeleteBill(bill.id)}
                         className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                         title={language === 'fr' ? "Supprimer définitivement" : "Delete permanently"}
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default TrashPage;
