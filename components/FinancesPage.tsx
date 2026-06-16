
import React, { useState, useRef } from 'react';
import { Bill } from '../types';
import { 
  CreditCard, ArrowRight, Receipt, Repeat, Clock, Bell, Check, Pencil, CheckCircle2, Trash2, AlertCircle, TrendingUp, PieChart as PieChartIcon
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface FinancesPageProps {
  bills: Bill[];
  onOpenModal: () => void;
  onToggleBillStatus: (id: string) => void;
  onDeleteBill: (id: string) => void;
  onUpdateBillAmount: (id: string, newAmount: number) => void;
  language: 'fr' | 'en';
}

const COLORS = ['#6c5ce7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const FinancesPage: React.FC<FinancesPageProps> = ({ bills, onOpenModal, onToggleBillStatus, onDeleteBill, onUpdateBillAmount, language }) => {
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [highlightPending, setHighlightPending] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const invoices = bills.filter(b => b.category === 'invoice');
  const subscriptions = bills.filter(b => b.category === 'subscription');
  const totalMonthlySubscriptions = subscriptions.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalPendingInvoices = invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const pendingCount = bills.filter(b => b.status === 'pending').length;
  const totalDueThisMonth = totalMonthlySubscriptions + totalPendingInvoices;
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((acc, b) => acc + Number(b.amount), 0);
  const totalPending = bills.filter(b => b.status === 'pending').reduce((acc, b) => acc + Number(b.amount), 0);

  const categoryData = [
    { name: language === 'fr' ? 'Factures' : 'Invoices', value: invoices.reduce((a, b) => a + b.amount, 0) },
    { name: language === 'fr' ? 'Abonnements' : 'Subscriptions', value: subscriptions.reduce((a, b) => a + b.amount, 0) },
  ].filter(d => d.value > 0);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' }) };
  });

  const monthlyData = last6Months.map(({ key, label }) => {
    const monthBills = bills.filter(b => b.dueDate?.startsWith(key));
    return {
      month: label,
      [language === 'fr' ? 'Payé' : 'Paid']: monthBills.filter(b => b.status === 'paid').reduce((a, b) => a + b.amount, 0),
      [language === 'fr' ? 'En attente' : 'Pending']: monthBills.filter(b => b.status === 'pending').reduce((a, b) => a + b.amount, 0),
    };
  });

  const scrollToPending = () => {
    setHighlightPending(true);
    mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => setHighlightPending(false), 2000);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-3 shadow-xl text-xs font-bold">
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center gap-2">
              <span style={{ color: p.color || p.fill }}>●</span>
              <span className="text-[var(--color-text-muted)]">{p.name}:</span>
              <span className="text-[var(--color-text)]">{Number(p.value).toFixed(2)} €</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const LOGO = (domain: string) => `https://logo.clearbit.com/${domain}`;
  const SERVICE_LOGOS: Record<string, string> = {
    'netflix': 'netflix.com', 'spotify': 'spotify.com', 'basic-fit': 'basic-fit.com',
    'fitness park': 'fitnesspark.fr', 'disney+': 'disneyplus.com', 'disney': 'disneyplus.com',
    'amazon': 'amazon.com', 'prime': 'amazon.com', 'youtube': 'youtube.com',
    'icloud': 'apple.com', 'apple': 'apple.com', 'chatgpt': 'openai.com', 'openai': 'openai.com',
    'canal+': 'canalplus.com', 'canal': 'canalplus.com', 'free': 'free.fr',
    'apple tv': 'tv.apple.com', 'paramount': 'paramountplus.com', 'max': 'max.com', 'hbo': 'max.com',
    'nintendo': 'nintendo.com', 'switch': 'nintendo.com', 'ps plus': 'playstation.com',
    'playstation': 'playstation.com', 'xbox': 'xbox.com', 'game pass': 'xbox.com',
    'deezer': 'deezer.com', 'adobe': 'adobe.com', 'creative cloud': 'adobe.com',
    'dropbox': 'dropbox.com', 'orange': 'orange.fr', 'sfr': 'sfr.fr', 'bouygues': 'bouyguestelecom.fr',
    'sosh': 'sosh.fr', 'red by sfr': 'red-by-sfr.fr', 'midjourney': 'midjourney.com',
    'github': 'github.com', 'copilot': 'github.com',
  };

  const getBillLogo = (name: string): string | null => {
    const lower = name.toLowerCase();
    for (const [key, domain] of Object.entries(SERVICE_LOGOS)) {
      if (lower.includes(key)) return LOGO(domain);
    }
    return null;
  };

  const FinanceTable = ({ title, items, icon: Icon, colorClass }: { title: string, items: Bill[], icon: any, colorClass: string }) => (
    <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden flex-1 transition-all duration-500">
      <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${colorClass} rounded-xl`}><Icon size={20} /></div>
          <h3 className="font-bold text-[var(--color-text)] text-lg">{title}</h3>
        </div>
        <span className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-border)] px-2.5 py-1 rounded-lg">{items.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[var(--color-card-hover)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-6 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{language === 'fr' ? 'Élément' : 'Item'}</th>
              <th className="px-6 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{language === 'fr' ? 'Montant' : 'Amount'}</th>
              <th className="px-6 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {items.map((bill) => {
              const logo = getBillLogo(bill.name);
              return (
              <tr key={bill.id} className={`hover:bg-[var(--color-card-hover)] transition-colors ${highlightPending && bill.status === 'pending' ? 'bg-orange-500/5' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {logo && (<img src={logo} alt="" className="w-8 h-8 rounded-lg object-contain shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />)}
                    <div>
                      <div className={`font-semibold text-sm mb-0.5 ${bill.status === 'paid' ? 'text-[var(--color-text-dim)] line-through' : 'text-[var(--color-text)]'}`}>{bill.name}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 font-medium"><Clock size={10} /> {bill.dueDate}</div>
                        {bill.reminder && (<div className="text-[10px] text-[#6c5ce7] flex items-center gap-0.5 font-bold uppercase tracking-tight"><Bell size={10} /> {bill.reminder}</div>)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingBillId === bill.id ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                      <input autoFocus type="number" className="w-20 px-2 py-1 text-sm font-bold border border-[#6c5ce7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/20 bg-[var(--color-card-hover)] text-[var(--color-text)]" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { onUpdateBillAmount(bill.id, parseFloat(editValue)); setEditingBillId(null); } if (e.key === 'Escape') setEditingBillId(null); }} />
                      <button onClick={() => { onUpdateBillAmount(bill.id, parseFloat(editValue)); setEditingBillId(null); }} className="p-1 text-[#6c5ce7] hover:bg-[#6c5ce7]/10 rounded-md"><Check size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <span className={`text-sm font-bold ${bill.status === 'paid' ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text-secondary)]'}`}>{Number(bill.amount).toFixed(2)} €</span>
                      <button onClick={() => { setEditingBillId(bill.id); setEditValue(bill.amount.toString()); }} className="p-1 text-[var(--color-text-dim)] hover:text-[#6c5ce7] hover:bg-[#6c5ce7]/10 rounded-md transition-all" title={language === 'fr' ? "Modifier le montant" : "Edit amount"}><Pencil size={12} /></button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onToggleBillStatus(bill.id)} className={`p-2 rounded-xl transition-all active:scale-90 ${bill.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[#6c5ce7]/10 hover:text-[#6c5ce7]'}`} title={bill.status === 'paid' ? (language === 'fr' ? "Marquer comme non payé" : "Mark as unpaid") : (language === 'fr' ? "Marquer comme payé" : "Mark as paid")}>{bill.status === 'paid' ? <CheckCircle2 size={18} /> : <Check size={18} />}</button>
                    <button onClick={() => onDeleteBill(bill.id)} className="p-2 rounded-xl text-[var(--color-text-dim)] hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90" title={language === 'fr' ? "Mettre à la corbeille" : "Move to trash"}><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
              );
            })}
            {items.length === 0 && (<tr><td colSpan={3} className="px-6 py-8 text-center text-[var(--color-text-dim)] text-xs italic">{language === 'fr' ? 'Aucun élément enregistré' : 'No items recorded'}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div ref={mainRef} className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">{language === 'fr' ? 'Gestion des Finances' : 'Financial Management'}</h2>
          <p className="text-[var(--color-text-muted)] font-medium">{language === 'fr' ? 'Factures ponctuelles et abonnements récurrents au même endroit.' : 'One-time bills and recurring subscriptions in one place.'}</p>
        </div>
        <button onClick={onOpenModal} className="px-6 py-3 bg-[#6c5ce7] text-white rounded-xl font-bold hover:bg-[#5b4bd5] transition-all shadow-lg shadow-[#6c5ce7]/20 flex items-center gap-2 active:scale-95"><CreditCard size={20} /> {language === 'fr' ? 'Ajouter une dépense' : 'Add an expense'}</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#6c5ce7] to-[#3b82f6] rounded-2xl p-6 text-white flex flex-col justify-between h-40 shadow-xl shadow-[#6c5ce7]/15 overflow-hidden relative group">
           <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[var(--color-subtle-bg)] rounded-full group-hover:scale-150 transition-all duration-700"></div>
           <div className="relative"><p className="text-[var(--color-text)]/60 text-[10px] font-bold uppercase tracking-widest mb-1">{language === 'fr' ? 'Abonnements / mois' : 'Subscriptions / month'}</p><h4 className="text-3xl font-extrabold">{Number(totalMonthlySubscriptions).toFixed(2)} €</h4></div>
           <div className="flex items-center gap-2 text-[10px] text-[var(--color-text)]/60 font-bold uppercase tracking-widest relative"><span>{language === 'fr' ? 'Projection mensuelle récurrente' : 'Monthly recurring projection'}</span><ArrowRight size={12} /></div>
        </div>
        
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 h-40 flex flex-col justify-between transition-all group">
           <div><p className="text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1">{language === 'fr' ? 'Éléments en attente' : 'Pending items'}</p><h4 className="text-3xl font-extrabold text-[var(--color-text)]">{pendingCount}</h4></div>
           <button onClick={scrollToPending} className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wider bg-orange-500/10 px-3 py-1.5 rounded-lg self-start italic flex items-center gap-1.5 hover:bg-orange-500/20 hover:scale-105 transition-all active:scale-95 border border-orange-500/20"><AlertCircle size={12} className="animate-pulse" />{language === 'fr' ? 'Actions requises' : 'Actions required'}</button>
        </div>

        <div className="bg-[var(--color-card)] border border-[#6c5ce7]/20 rounded-2xl p-6 h-40 flex flex-col justify-between transition-all">
           <div><p className="text-[#a78bfa] text-[10px] font-bold uppercase tracking-widest mb-1">{language === 'fr' ? 'Total dû ce mois' : 'Total due this month'}</p><h4 className="text-3xl font-extrabold text-[var(--color-text)]">{Number(totalDueThisMonth).toFixed(2)} €</h4></div>
           <p className="text-[10px] text-[#6c5ce7] font-bold uppercase tracking-widest">{language === 'fr' ? 'Inclus taxes et frais' : 'Including taxes and fees'}</p>
        </div>
      </div>

      {bills.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-6">
            <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-[#6c5ce7]/10 text-[#6c5ce7] rounded-xl"><TrendingUp size={20} /></div><div><h3 className="font-bold text-white">{language === 'fr' ? 'Dépenses par mois' : 'Monthly Spending'}</h3><p className="text-xs text-[var(--color-text-muted)] font-medium">{language === 'fr' ? '6 derniers mois' : 'Last 6 months'}</p></div></div>
            <div className="h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData} barCategoryGap="30%"><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} /><Tooltip content={<CustomTooltip />} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} /><Bar dataKey={language === 'fr' ? 'Payé' : 'Paid'} fill="#10b981" radius={[6, 6, 0, 0]} /><Bar dataKey={language === 'fr' ? 'En attente' : 'Pending'} fill="#f59e0b" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </div>
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-6">
            <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl"><PieChartIcon size={20} /></div><div><h3 className="font-bold text-white">{language === 'fr' ? 'Répartition par catégorie' : 'Spending by Category'}</h3><p className="text-xs text-[var(--color-text-muted)] font-medium">{language === 'fr' ? 'Total toutes dépenses' : 'All time breakdown'}</p></div></div>
            <div className="flex items-center gap-6">
              <div className="h-44 flex-1"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value" animationDuration={800}>{categoryData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}</Pie><Tooltip content={<CustomTooltip />} /></PieChart></ResponsiveContainer></div>
              <div className="space-y-4 min-w-[130px]">
                {categoryData.map((entry, i) => (<div key={entry.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} /><div><p className="text-xs font-bold text-[var(--color-text-secondary)]">{entry.name}</p><p className="text-sm font-extrabold text-[var(--color-text)]">{Number(entry.value).toFixed(2)} €</p></div></div>))}
                <div className="pt-2 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shrink-0 bg-emerald-500" /><div><p className="text-xs font-bold text-[var(--color-text-secondary)]">{language === 'fr' ? 'Payé' : 'Paid'}</p><p className="text-sm font-extrabold text-emerald-400">{Number(totalPaid).toFixed(2)} €</p></div></div>
                  <div className="flex items-center gap-2 mt-2"><div className="w-3 h-3 rounded-full shrink-0 bg-orange-400" /><div><p className="text-xs font-bold text-[var(--color-text-secondary)]">{language === 'fr' ? 'En attente' : 'Pending'}</p><p className="text-sm font-extrabold text-orange-400">{Number(totalPending).toFixed(2)} €</p></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1"><FinanceTable title={language === 'fr' ? 'Mes Factures' : 'My Invoices'} items={invoices} icon={Receipt} colorClass="bg-purple-500/10 text-purple-400" /></div>
        <div className="flex-1"><FinanceTable title={language === 'fr' ? 'Mes Abonnements' : 'My Subscriptions'} items={subscriptions} icon={Repeat} colorClass="bg-blue-500/10 text-blue-400" /></div>
      </div>
    </div>
  );
};

export default FinancesPage;
