
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Loader2, Minus, MessageSquare, Eraser } from 'lucide-react';
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
  language: 'fr' | 'en';
}

const TOOL_DECLARATIONS = [
  {
    name: 'addTask',
    description: 'Add a new task, meeting, or course to the calendar/planning. Use this when the user asks to create, add, or schedule something.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the task.' },
        date: { type: 'string', description: 'The date in YYYY-MM-DD format.' },
        time: { type: 'string', description: 'The time slot (e.g. "14:00 - 15:00"). If only a start time is given, add 1 hour for the end.' },
        type: { type: 'string', enum: ['Task', 'Meeting', 'Course', 'Finance'], description: 'The type of item.' },
      },
      required: ['title', 'date', 'time', 'type']
    }
  },
  {
    name: 'addBill',
    description: 'Add a bill or subscription to the finances tracker.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the service or bill.' },
        amount: { type: 'number', description: 'Amount in euros.' },
        dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format.' },
        category: { type: 'string', enum: ['invoice', 'subscription'], description: 'Category.' },
      },
      required: ['name', 'amount', 'dueDate', 'category']
    }
  },
  {
    name: 'deleteItem',
    description: 'Delete a specific task or bill by its ID. Find the ID from the context provided.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The unique ID of the item.' },
        itemType: { type: 'string', enum: ['task', 'bill'], description: 'Whether it is a task or a bill.' }
      },
      required: ['id', 'itemType']
    }
  },
  {
    name: 'toggleStatus',
    description: 'Toggle the status of a task (mark as completed or mark as todo) or toggle a bill payment status.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The unique ID of the item.' },
        itemType: { type: 'string', enum: ['task', 'bill'], description: 'Whether it is a task or a bill.' }
      },
      required: ['id', 'itemType']
    }
  }
];

export default function AIChatBot({
  userName, tasks, bills, onAddTask, onDeleteTask, onUpdateTaskStatus,
  onAddBill, onDeleteBill, onToggleBillStatus, onUpdateBillAmount,
  userLocation, language
}: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Set initial greeting based on language
  useEffect(() => {
    setMessages([{
      role: 'bot',
      text: language === 'fr'
        ? `Bonjour ${userName} ! 👋 Je suis votre assistant Planify. Je peux ajouter des tâches, gérer vos finances, et répondre à vos questions. Que puis-je faire pour vous ?`
        : `Hello ${userName}! 👋 I'm your Planify assistant. I can add tasks, manage your finances, and answer your questions. How can I help you?`
    }]);
  }, [userName, language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([{
      role: 'bot',
      text: language === 'fr'
        ? `Conversation réinitialisée. Comment puis-je vous aider, ${userName} ?`
        : `Conversation reset. How can I help you, ${userName}?`
    }]);
  };

  const executeFunctionCall = (name: string, args: any): string => {
    try {
      if (name === 'addTask') {
        const typeToColor: Record<string, string> = { Task: 'green', Meeting: 'blue', Course: 'purple', Finance: 'orange' };
        onAddTask({
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: args.title,
          date: args.date,
          time: args.time,
          type: args.type || 'Task',
          status: 'todo',
          color: typeToColor[args.type] || 'green'
        });
        return language === 'fr'
          ? `Tâche "${args.title}" ajoutée pour le ${args.date} à ${args.time}.`
          : `Task "${args.title}" added for ${args.date} at ${args.time}.`;
      }

      if (name === 'addBill') {
        onAddBill({
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: args.name,
          amount: args.amount,
          dueDate: args.dueDate,
          category: args.category || 'invoice',
          status: 'pending'
        });
        return language === 'fr'
          ? `Finance "${args.name}" (${args.amount}€) enregistrée pour le ${args.dueDate}.`
          : `Bill "${args.name}" (${args.amount}€) recorded for ${args.dueDate}.`;
      }

      if (name === 'deleteItem') {
        if (args.itemType === 'task') onDeleteTask(args.id);
        else onDeleteBill(args.id);
        return language === 'fr' ? 'Élément supprimé.' : 'Item deleted.';
      }

      if (name === 'toggleStatus') {
        if (args.itemType === 'task') onUpdateTaskStatus(args.id);
        else onToggleBillStatus(args.id);
        return language === 'fr' ? 'Statut mis à jour.' : 'Status updated.';
      }

      return language === 'fr' ? 'Action effectuée.' : 'Action completed.';
    } catch (e: any) {
      console.error('Function call error:', e);
      return language === 'fr' ? `Erreur: ${e.message}` : `Error: ${e.message}`;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    // Add a placeholder for the bot response
    setMessages(prev => [...prev, { role: 'bot', text: '' }]);

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });

      const tasksSummary = tasks.length > 0
        ? tasks.map(t => `- [${t.status}] "${t.title}" (ID: ${t.id}, Date: ${t.date}, Time: ${t.time}, Type: ${t.type})`).join('\n')
        : (language === 'fr' ? 'Aucune tâche.' : 'No tasks.');

      const billsSummary = bills.length > 0
        ? bills.map(b => `- [${b.status}] "${b.name}" (ID: ${b.id}, Amount: ${b.amount}€, Due: ${b.dueDate}, Category: ${b.category})`).join('\n')
        : (language === 'fr' ? 'Aucune finance.' : 'No bills.');

      const systemPrompt = language === 'fr'
        ? `Tu es Planify AI, l'assistant intelligent de l'app Planify. Tu aides ${userName} à gérer son planning et ses finances.

CONTEXTE ACTUEL :
- Date : ${today}
- Heure : ${timeStr}
- Localisation : ${userLocation ? `Lat ${userLocation.latitude}, Lng ${userLocation.longitude}` : 'Inconnue'}

TÂCHES DE L'UTILISATEUR :
${tasksSummary}

FINANCES DE L'UTILISATEUR :
${billsSummary}

RÈGLES :
1. Réponds TOUJOURS en français.
2. Sois concis, utile et amical.
3. Si l'utilisateur demande d'ajouter une tâche/réunion/cours, utilise la fonction addTask.
4. Si l'utilisateur demande d'ajouter une facture/abonnement, utilise la fonction addBill.
5. Si l'utilisateur demande de supprimer quelque chose, trouve l'ID dans le contexte et utilise deleteItem.
6. Si l'utilisateur demande de marquer comme fait/terminé, utilise toggleStatus.
7. Pour les dates relatives ("demain", "lundi prochain"), calcule la date exacte à partir de ${today}.
8. N'utilise PAS excessivement le gras ou la mise en forme. Reste sobre.
9. Ne fais pas de résumé automatique sauf si demandé.`
        : `You are Planify AI, the smart assistant for the Planify app. You help ${userName} manage their schedule and finances.

CURRENT CONTEXT:
- Date: ${today}
- Time: ${timeStr}
- Location: ${userLocation ? `Lat ${userLocation.latitude}, Lng ${userLocation.longitude}` : 'Unknown'}

USER'S TASKS:
${tasksSummary}

USER'S FINANCES:
${billsSummary}

RULES:
1. Always respond in English.
2. Be concise, helpful, and friendly.
3. If the user asks to add a task/meeting/course, use the addTask function.
4. If the user asks to add a bill/subscription, use the addBill function.
5. If the user asks to delete something, find the ID from context and use deleteItem.
6. If the user asks to mark something as done/completed, use toggleStatus.
7. For relative dates ("tomorrow", "next Monday"), calculate the exact date from ${today}.
8. Don't overuse bold or formatting. Keep it clean.
9. Don't auto-summarize unless asked.`;

      // Build conversation history for context
      const historyParts = messages
        .filter(m => m.text) // skip empty placeholder messages
        .slice(-10) // keep last 10 messages for context
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      // Format declarations to Mistral tool format
      const mistralTools = TOOL_DECLARATIONS.map(decl => ({
        type: 'function',
        function: {
          name: decl.name,
          description: decl.description,
          parameters: decl.parameters
        }
      }));

      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemPrompt: systemPrompt,
          messages: [...historyParts, { role: 'user', content: userMessage }],
          tools: mistralTools
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = typeof errorData.error === 'string' 
          ? errorData.error 
          : errorData.error?.message || errorData.message;
        throw new Error(errorMsg || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      let responseText = '';
      const toolResults: string[] = [];

      const choice = responseData.choices?.[0];
      const message = choice?.message;
      const toolCalls = message?.tool_calls;

      if (toolCalls && toolCalls.length > 0) {
        for (const tc of toolCalls) {
          const name = tc.function.name;
          const args = typeof tc.function.arguments === 'string'
            ? JSON.parse(tc.function.arguments)
            : tc.function.arguments;
          const result = executeFunctionCall(name, args);
          toolResults.push(`✅ ${result}`);
        }

        if (message.content) {
          responseText = message.content;
        }
      } else {
        responseText = message?.content || (language === 'fr' ? "Je n'ai pas compris. Pouvez-vous reformuler ?" : "I didn't understand. Could you rephrase?");
      }

      // Combine text and tool results
      const finalResponse = toolResults.length > 0
        ? (responseText ? `${responseText}\n\n${toolResults.join('\n')}` : toolResults.join('\n'))
        : responseText;

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'bot',
          text: finalResponse
        };
        return newMessages;
      });

    } catch (error: any) {
      console.error('AI Error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'bot',
          text: language === 'fr'
            ? `Désolé, une erreur est survenue : ${error.message || 'Erreur inconnue'}. Réessayez.`
            : `Sorry, an error occurred: ${error.message || 'Unknown error'}. Please try again.`
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 lg:bottom-10 right-4 lg:right-10 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className={`bg-white dark:bg-slate-900 shadow-2xl rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 transition-all duration-300 mb-4 flex flex-col ${isMinimized ? 'h-16 w-64' : 'h-[500px] sm:h-[600px] w-[calc(100vw-2rem)] sm:w-[420px]'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 p-4 sm:p-5 flex items-center justify-between text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-600/30">
                <Sparkles size={18} className="text-[var(--color-text)]" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest uppercase">Planify AI</h3>
                <span className="text-[8px] font-bold opacity-60 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                  Mistral Large
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <button onClick={clearChat} className="p-2 hover:bg-[var(--color-hover-bg)] rounded-xl transition-all" title={language === 'fr' ? 'Effacer' : 'Clear'}>
                <Eraser size={16} />
              </button>
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-[var(--color-hover-bg)] rounded-xl transition-all">
                <Minus size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-[var(--color-hover-bg)] rounded-xl transition-all">
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/30">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`flex gap-2.5 max-w-[88%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-slate-800 border-slate-700 text-[var(--color-text)]' : 'bg-white dark:bg-slate-800 text-blue-600 border-slate-200 dark:border-slate-700 shadow-sm'}`}>
                        {m.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                      </div>
                      <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-lg shadow-blue-600/20'
                        : 'bg-white dark:bg-slate-800/80 text-[var(--color-text-dim)] dark:text-[var(--color-text)] border border-slate-100 dark:border-slate-700 rounded-tl-sm shadow-sm'
                        }`}>
                        {m.text || (isLoading && i === messages.length - 1 ? (
                          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-[11px] font-medium">{language === 'fr' ? 'Réflexion...' : 'Thinking...'}</span>
                          </div>
                        ) : '')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    placeholder={language === 'fr' ? "Ajoute un cours demain à 14h..." : "Add a class tomorrow at 2pm..."}
                    className="flex-1 bg-transparent px-3 py-2 text-[13px] font-medium focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-[var(--color-text-muted)]"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-95 disabled:opacity-40 transition-all"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-90 ${isOpen
          ? 'bg-slate-900 dark:bg-slate-800 text-[var(--color-text)] rotate-90'
          : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:scale-105 hover:shadow-blue-300/40 dark:hover:shadow-blue-900/40'
          }`}
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>
    </div>
  );
}
