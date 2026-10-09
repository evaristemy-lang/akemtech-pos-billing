import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA } from '../../utils/formatters';
import { AiChatMessage } from '../../types';

export const AkemAiAssistant: React.FC = () => {
  const {
    organization,
    sales,
    expenses,
    invoices,
    products,
    customers,
    suppliers,
    accounts,
    language,
    setActiveTab,
  } = useApp();

  const t = translations[language];

  // Pre-aggregate current real metrics for real-time AI grounding
  const totalSales = sales.reduce((s, item) => s + item.grandTotal, 0);
  const totalExpenses = expenses.reduce((s, item) => s + item.amount, 0);
  const totalReceivables = customers.reduce((s, item) => s + item.currentBalance, 0);
  const totalPayables = suppliers.reduce((s, item) => s + item.outstandingBalance, 0);
  const lowStockList = products.filter(p => p.stockQuantity <= p.minStock).map(p => `${p.name} (${p.stockQuantity} ${p.unit})`);
  const owingCustomers = customers.filter(c => c.currentBalance > 0).map(c => `${c.name}: ${c.currentBalance.toLocaleString()} FCFA`);
  const topProduct = products.sort((a, b) => b.stockQuantity - a.stockQuantity)[0]?.name || 'Riz Parfumé Dinor 50kg';

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        language === 'fr'
          ? `Bonjour ! Je suis **Akem AI**, votre directeur financier et conseiller stratégique d’entreprise chez **${organization.name}**.\n\nJ'ai analysé en temps réel vos données commerciales :\n• **Chiffre d’affaires total :** ${formatFCFA(totalSales, 'fr')}\n• **Créances clients à recouvrer :** ${formatFCFA(totalReceivables, 'fr')}\n• **Articles en alerte stock :** ${lowStockList.length} produit(s)\n\nQue souhaitez-vous examiner ou optimiser aujourd'hui ?`
          : `Hello! I am **Akem AI**, your executive CFO and business analyst for **${organization.name}**.\n\nI have loaded your real-time ledger data:\n• **Total Sales :** ${formatFCFA(totalSales, 'en')}\n• **Pending Receivables :** ${formatFCFA(totalReceivables, 'en')}\n• **Low Stock Items :** ${lowStockList.length} product(s)\n\nHow can I help grow your business and increase your margins today?`,
      timestamp: new Date().toISOString(),
      suggestedActions:
        language === 'fr'
          ? ['Quels sont nos produits les plus rentables ?', 'Qui nous doit de l’argent et combien ?', 'Que devons-nous réapprovisionner en urgence ?']
          : ['Which products have highest margins?', 'Who owes us money and when is it due?', 'What products should we reorder right now?'],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const suggestedQueries =
    language === 'fr'
      ? [
          'Combien avons-nous vendu ce mois ?',
          'Quels produits ont la meilleure marge bénéficiaire ?',
          'Qui nous doit de l’argent ?',
          'Quelles sont nos plus grosses dépenses ?',
          'Que faut-il commander aujourd’hui ?',
          'Rédige une relance aimable pour nos clients débiteurs',
        ]
      : [
          'How much did we sell this month?',
          'Which products are most profitable?',
          'Who owes us money and how much?',
          'What were our biggest expenses?',
          'What should I reorder right now?',
          'Draft a polite payment reminder for debtors',
        ];

  const handleSendMessage = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: AiChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          language,
          businessContext: {
            organizationName: organization.name,
            totalSalesFormatted: formatFCFA(totalSales, language),
            totalExpensesFormatted: formatFCFA(totalExpenses, language),
            netProfitFormatted: formatFCFA(totalSales - totalExpenses, language),
            totalReceivablesFormatted: formatFCFA(totalReceivables, language),
            totalPayablesFormatted: formatFCFA(totalPayables, language),
            topProduct,
            lowStockItems: lowStockList,
            debtorList: owingCustomers,
            unpaidCount: invoices.filter(i => i.status === 'overdue' || i.status === 'partially_paid').length,
          },
        }),
      });

      const data = await response.json();
      const aiMsg: AiChatMessage = {
        id: 'msg-ai-' + Date.now(),
        role: 'assistant',
        content: data.text || 'Analyse effectuée.',
        timestamp: new Date().toISOString(),
        suggestedActions: data.suggestedActions,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error invoking Akem AI:', err);
      const fallbackMsg: AiChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content:
          language === 'fr'
            ? `D'après vos comptes : Vos ventes s'élèvent à ${formatFCFA(totalSales, 'fr')}. Les créances clients en cours s'élèvent à ${formatFCFA(totalReceivables, 'fr')}. Le produit le plus vendu est "${topProduct}".`
            : `Based on your records: Current sales stand at ${formatFCFA(totalSales, 'en')}. Client receivables stand at ${formatFCFA(totalReceivables, 'en')}. Leading product is "${topProduct}".`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-slate-900 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Akem AI
              </h2>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.aiSubtitle}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {language === 'fr' ? 'Connecté aux registres comptables' : 'Connected to ledger'}
          </span>
        </div>
      </div>

      {/* Suggested Query Chips */}
      <div className="border-b border-slate-200/80 bg-white/60 px-4 py-2.5 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/60 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {language === 'fr' ? 'Suggestions :' : 'Quick Prompts :'}
          </span>
          {suggestedQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:bg-slate-700 transition"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-teal-600'
                    : 'bg-teal-600 text-white dark:bg-slate-800'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs shadow-xs leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-teal-700'
                    : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Suggested follow up buttons */}
                {msg.suggestedActions && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2 dark:border-slate-800">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(action)}
                        className="rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700 hover:bg-teal-100 dark:bg-slate-800 dark:text-teal-300"
                      >
                        &rarr; {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-500 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-600" />
              <span>{language === 'fr' ? 'Analyse des données en cours...' : 'Analyzing live enterprise data...'}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mx-auto flex max-w-4xl items-center gap-2"
        >
          <input
            type="text"
            placeholder={t.askAiPlaceholder}
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm hover:bg-teal-700 disabled:opacity-40 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
