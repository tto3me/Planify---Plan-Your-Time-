
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Loader2, Minus, MessageSquare, Globe, MapPin, Eraser } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from '@google/genai';
import { Task, Bill } from '../types';

interface AIChatBotProps {
  userName: string;
  tasks: Task[];
  bills: Bill[];
  onAddTask: (task: any) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskStatus: (id: string) => void;
  onAddBill: (bill: any) => void;
  onDeleteBill: (id: string) => void;
  onToggleBillStatus: (id: string) => void;
  onUpdateBillAmount: (id: string, newAmount: number) => void;
  userLocation: { latitude: number; longitude: number } | null;
}

export default function AIChatBot({ 
  userName, tasks, bills, onAddTask, onDeleteTask, onUpdateTaskStatus, 
  onAddBill, onDeleteBill, onToggleBillStatus, onUpdateBillAmount,
  userLocation
}: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string, sources?: any[]}[]>([
    { role: 'bot', text: `Bonjour ${userName} ! Je suis votre assistant Planify. Comment puis-je vous aider avec votre planning ou vos finances aujourd'hui ?` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const functions: FunctionDeclaration[] = [
    {
      name: 'addTask',
      description: 'Ajouter une nouvelle tâche, réunion ou cours au planning.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Le titre de la tâche.' },
          date: { type: Type.STRING, description: 'La date au format YYYY-MM-DD.' },
          time: { type: Type.STRING, description: 'L\'horaire (ex: 14:00 - 15:00).' },
          type: { type: Type.STRING, enum: ['Task', 'Meeting', 'Course'], description: 'Le type d\'élément.' },
        },
        required: ['title', 'date', 'time', 'type']
      }
    },
    {
      name: 'addBill',
      description: 'Ajouter une facture ponctuelle ou un abonnement récurrent.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Nom du service ou de la facture.' },
          amount: { type: Type.NUMBER, description: 'Montant en euros.' },
          dueDate: { type: Type.STRING, description: 'Date d\'échéance (YYYY-MM-DD).' },
          category: { type: Type.STRING, enum: ['invoice', 'subscription'], description: 'Catégorie de finance.' },
        },
        required: ['name', 'amount', 'dueDate', 'category']
      }
    },
    {
      name: 'deleteItem',
      description: 'Supprimer un élément spécifique (tâche ou finance) en utilisant son ID.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'L\'identifiant unique de l\'élément.' },
          itemType: { type: Type.STRING, enum: ['task', 'bill'], description: 'Le type d\'élément à supprimer.' }
        },
        required: ['id', 'itemType']
      }
    }
  ];

  const clearChat = () => {
    setMessages([
      { role: 'bot', text: `Conversation réinitialisée. Comment puis-je vous aider, ${userName} ?` }
    ]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    // Placeholder for bot response
    setMessages(prev => [...prev, { role: 'bot', text: '' }]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      const contextString = `
        DATE : ${today}
        HEURE : ${timeStr}
        UTILISATEUR : ${userName}
        LOCATION : ${userLocation ? `Lat ${userLocation.latitude}, Lng ${userLocation.longitude}` : 'Inconnue'}
        
        TÂCHES :
        ${tasks.map(t => `- [${t.status}] ${t.title} (ID: ${t.id}, Date: ${t.date}, Heure: ${t.time})`).join('\n')}
        
        FINANCES :
        ${bills.map(b => `- [${b.status}] ${b.name} (ID: ${b.id}, Montant: ${b.amount}€, Échéance: ${b.dueDate})`).join('\n')}
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: `CONTEXTE PLANIFY:\n${contextString}\n\nREQUÊTE UTILISATEUR: ${userMessage}` }] }
        ],
        config: {
          systemInstruction: `Tu es Planify AI. Ta priorité absolue est de répondre DIRECTEMENT et PRÉCISÉMENT à la question de l'utilisateur.
          
          RÈGLES STRICTES :
          1. Ne fais pas de résumé automatique de la journée ou des finances SAUF si l'utilisateur le demande explicitement (ex: "Qu'est-ce que j'ai aujourd'hui ?").
          2. Si l'utilisateur demande une action (ajouter/supprimer), utilise les outils fournis et confirme l'action.
          3. Ne parle pas de dates passées comme si elles étaient futures. Utilise la DATE (${today}) fournie pour situer les événements.
          4. Ton ton doit être utile, bref et sans fioritures.
          5. ÉVITE ABSOLUMENT l'utilisation excessive de texte en gras (ne mets pas d'étoiles ** partout). Reste sobre sur la mise en forme.
          6. Réponds en français.`,
          tools: [
            { functionDeclarations: functions },
            { googleSearch: {} }
          ]
        }
      });

      let responseText = result.text || '';
      let toolConfirmations: string[] = [];

      if (result.functionCalls) {
        for (const call of result.functionCalls) {
          if (call.name === 'addTask') {
            const args = call.args as any;
            onAddTask({ 
              id: Math.random().toString(36).substr(2, 9), 
              ...args, 
              status: 'todo',
              color: args.type === 'Meeting' ? 'blue' : args.type === 'Course' ? 'purple' : 'green' 
            });
            toolConfirmations.push(`✅ Tâche "${args.title}" ajoutée pour le ${args.date}.`);
          } else if (call.name === 'addBill') {
            const args = call.args as any;
            onAddBill({ 
              id: Math.random().toString(36).substr(2, 9), 
              ...args,
              status: 'pending'
            });
            toolConfirmations.push(`💸 Finance "${args.name}" (${args.amount}€) enregistrée.`);
          } else if (call.name === 'deleteItem') {
            const args = call.args as any;
            if (args.itemType === 'task') onDeleteTask(args.id);
            else onDeleteBill(args.id);
            toolConfirmations.push(`🗑️ Élément supprimé.`);
          }
        }
      }

      // Combine text and tool confirmations if both exist
      const finalResponse = toolConfirmations.length > 0 
        ? (responseText ? `${responseText}\n\n${toolConfirmations.join('\n')}` : toolConfirmations.join('\n'))
        : responseText;

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: 'bot', 
          text: finalResponse || "J'ai effectué l'action demandée.",
          sources: result.candidates?.[0]?.groundingMetadata?.groundingChunks
        };
        return newMessages;
      });

    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: 'bot', 
          text: "Désolé, je rencontre une difficulté technique. Pouvez-vous répéter votre demande ?" 
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className={`bg-white dark:bg-slate-900 shadow-2xl rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 transition-all duration-300 mb-4 flex flex-col ${isMinimized ? 'h-16 w-64' : 'h-[600px] w-[350px] sm:w-[420px]'}`}>
          <div className="bg-slate-900 dark:bg-slate-800 p-5 flex items-center justify-between text-white shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-blue-600 p-2 rounded-2xl">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest uppercase">Planify AI</h3>
                <span className="text-[8px] font-bold opacity-60 flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div> RÉACTIF
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-xl transition-all" title="Effacer la conversation"><Eraser size={16} /></button>
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><Minus size={16} /></button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={16} /></button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white dark:bg-slate-800 text-blue-600 border-slate-200 dark:border-slate-700'}`}>
                        {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className="space-y-2">
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none shadow-sm'}`}>
                          {m.text || (isLoading && i === messages.length - 1 ? <Loader2 size={16} className="animate-spin opacity-50" /> : '')}
                        </div>
                        {m.sources && (
                          <div className="flex flex-wrap gap-2">
                            {m.sources.map((s: any, idx) => (
                              <a key={idx} href={s.web?.uri || s.maps?.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold bg-white dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center gap-1">
                                <Globe size={10} /> {s.web?.title || 'Lien'}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <input 
                    type="text" 
                    placeholder="Posez votre question..." 
                    className="flex-1 bg-transparent px-3 py-1.5 text-xs font-medium focus:outline-none text-slate-800 dark:text-slate-100"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <button 
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-90 ${isOpen ? 'bg-slate-900 dark:bg-slate-800 text-white rotate-90' : 'bg-blue-600 text-white hover:scale-105'}`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
}
