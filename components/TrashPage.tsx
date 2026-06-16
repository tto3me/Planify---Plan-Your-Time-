
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
          <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight flex items-center gap-3 transition-colors">
            <Trash2 className="text-[#6c5ce7]" size={32} /> {language === 'fr' ? 'Corbeille' : 'Trash'}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] font-medium">{language === 'fr' ? 'Éléments supprimés récemment. Vous pouvez les restaurer ou les supprimer à jamais.' : 'Recently deleted items. You can restore them or delete them forever.'}</p>
        </div>
        {totalDeleted > 0 && (
          <button 
            onClick={onEmptyTrash}
            className="px-6 py-3 bg-[var(--color-subtle-bg)] hover:bg-red-500/10 text-red-400 border border-[var(--color-subtle-border)] rounded-2xl font-bold transition-all flex items-center gap-2 active:scale-95"
          >
            <Trash2 size={20} /> {language === 'fr' ? 'Vider la corbeille' : 'Empty Trash'}
          </button>
        )}
      </header>

      {totalDeleted === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-card)]/85 border border-[var(--color-border)] rounded-3xl border-dashed transition-all">
           <div className="w-20 h-20 bg-[var(--color-subtle-bg)] border border-[var(--color-subtle-border)] rounded-full flex items-center justify-center text-[var(--color-text-muted)] mb-4 animate-pulse">
              <Trash2 size={40} />
           </div>
           <h3 className="text-xl font-bold text-[var(--color-text-muted)] mb-2">{language === 'fr' ? 'La corbeille est vide' : 'The trash is empty'}</h3>
           <p className="text-[var(--color-text-muted)] text-sm mb-6">{language === 'fr' ? 'Tout est en ordre !' : 'Everything is in order!'}</p>
           <button 
              onClick={onGoHome}
              className="px-6 py-3 bg-[#6c5ce7] hover:bg-[#5b4bd5] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#6c5ce7]/20 active:scale-95"
           >
              {language === 'fr' ? 'Retour au Dashboard' : 'Back to Dashboard'}
           </button>
        </div>
      ) : (
        <div className="space-y-8">
          {deletedTasks.length > 0 && (
            <section className="bg-[var(--color-card)] backdrop-blur-md rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm transition-all">
              <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-subtle-bg)]">
                <h3 className="font-extrabold text-[var(--color-text)]">{language === 'fr' ? `Tâches (${deletedTasks.length})` : `Tasks (${deletedTasks.length})`}</h3>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {deletedTasks.map((task) => (
                  <div key={task.id} className="p-6 flex items-center justify-between group opacity-75 hover:opacity-100 hover:bg-[var(--color-hover-bg)] transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-1 h-10 rounded-full bg-[var(--color-subtle-bg)]"></div>
                       <div>
                         <h4 className="font-bold text-[var(--color-text-muted)] line-through">{task.title}</h4>
                         <p className="text-xs text-[var(--color-text-muted)]">{task.date} • {task.time}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => onRestoreTask(task.id)}
                         className="p-2.5 bg-[var(--color-subtle-bg)] hover:bg-[var(--color-hover-bg)] text-[var(--color-text-secondary)] rounded-xl border border-[var(--color-subtle-border)] transition-colors"
                         title={language === 'fr' ? "Restaurer" : "Restore"}
                       >
                         <RefreshCcw size={18} />
                       </button>
                       <button 
                         onClick={() => onPermanentDeleteTask(task.id)}
                         className="p-2.5 bg-[var(--color-subtle-bg)] hover:bg-red-500/10 text-slate-350 hover:text-red-400 rounded-xl border border-[var(--color-subtle-border)] transition-colors"
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
            <section className="bg-[var(--color-card)] backdrop-blur-md rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm transition-all">
              <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-subtle-bg)]">
                <h3 className="font-extrabold text-[var(--color-text)]">{language === 'fr' ? `Finances (${deletedBills.length})` : `Finances (${deletedBills.length})`}</h3>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {deletedBills.map((bill) => (
                  <div key={bill.id} className="p-6 flex items-center justify-between group opacity-75 hover:opacity-100 hover:bg-[var(--color-hover-bg)] transition-all">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-[var(--color-subtle-bg)] text-[var(--color-text-muted)] rounded-xl border border-[var(--color-subtle-border)]">
                          <Wallet size={18} />
                       </div>
                       <div>
                         <h4 className="font-bold text-[var(--color-text-muted)] line-through">{bill.name}</h4>
                         <p className="text-xs text-[var(--color-text-muted)]">{bill.amount.toFixed(2)} € • {bill.dueDate}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => onRestoreBill(bill.id)}
                         className="p-2.5 bg-[var(--color-subtle-bg)] hover:bg-[var(--color-hover-bg)] text-[var(--color-text-secondary)] rounded-xl border border-[var(--color-subtle-border)] transition-colors"
                         title={language === 'fr' ? "Restaurer" : "Restore"}
                       >
                         <RefreshCcw size={18} />
                       </button>
                       <button 
                         onClick={() => onPermanentDeleteBill(bill.id)}
                         className="p-2.5 bg-[var(--color-subtle-bg)] hover:bg-red-500/10 text-slate-350 hover:text-red-400 rounded-xl border border-[var(--color-subtle-border)] transition-colors"
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
