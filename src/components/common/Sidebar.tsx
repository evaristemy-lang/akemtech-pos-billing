import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Package,
  ShoppingBag,
  Users,
  Building,
  DollarSign,
  Wallet,
  UserCheck,
  Calculator,
  BarChart3,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  FolderArchive,
  GitFork,
  ShieldCheck,
  CreditCard,
  Printer,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: number | string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    language,
    currentShift,
    products,
    invoices,
    theme,
    printerConfig,
    setIsPrinterModalOpen,
    setIsAndroidModalOpen,
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = translations[language];

  // Badge counts
  const lowStockCount = products.filter(p => p.stockQuantity <= p.minStock).length;
  const overdueInvoiceCount = invoices.filter(i => i.status === 'overdue').length;

  const navSections: NavSection[] = [
    {
      title: language === 'fr' ? 'PRINCIPAL' : 'CORE OPERATIONS',
      items: [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'pos', label: t.pos, icon: Receipt, highlight: true },
        { id: 'invoices', label: t.invoices, icon: FileText, badge: overdueInvoiceCount > 0 ? overdueInvoiceCount : undefined },
        { id: 'inventory', label: t.inventory, icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
      ],
    },
    {
      title: language === 'fr' ? 'RELATIONS & TRÉSORERIE' : 'RELATIONS & FINANCE',
      items: [
        { id: 'customers', label: t.customers, icon: Users },
        { id: 'suppliers', label: t.suppliers, icon: Building },
        { id: 'expenses', label: t.expenses, icon: DollarSign },
        { id: 'payments', label: t.payments, icon: Wallet },
        { id: 'deliveries', label: t.deliveries, icon: Truck },
      ],
    },
    {
      title: language === 'fr' ? 'ENTREPRISE & GESTION' : 'ENTERPRISE & STRATEGY',
      items: [
        { id: 'employees', label: t.employees, icon: UserCheck },
        { id: 'accounting', label: t.accounting, icon: Calculator },
        { id: 'reports', label: t.reports, icon: BarChart3 },
        { id: 'documents', label: t.documents, icon: FolderArchive },
      ],
    },
    {
      title: language === 'fr' ? 'INTELLIGENCE & CONFIG' : 'INTELLIGENCE & CONFIG',
      items: [
        { id: 'ai', label: t.aiAssistant, icon: Sparkles, badgeColor: 'bg-teal-500' },
        { id: 'branches', label: t.branches, icon: GitFork },
        { id: 'settings', label: t.settings, icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`relative hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-teal-700 text-white font-extrabold shadow-sm">
            <span className="text-lg tracking-tight">Ak</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Akem<span className="text-teal-600 dark:text-teal-400">Tech</span>
                </span>
                <span className="rounded bg-teal-100 px-1 py-0.2 text-[9px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  POS
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[140px]">
                POS & Billing
              </span>
            </div>
          )}
        </div>

        {/* Toggle Collapse */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-5 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300`}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* POS Cash Drawer Banner */}
      {!isCollapsed && (
        <div className="mx-3 mt-3 rounded-lg border border-teal-200/60 bg-teal-50/60 p-2.5 text-xs dark:border-teal-900/60 dark:bg-teal-950/40">
          <div className="flex items-center justify-between font-semibold text-teal-900 dark:text-teal-200">
            <span className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-teal-600" />
              {currentShift?.status === 'open' ? (language === 'fr' ? 'Caisse Ouverte' : 'Shift Open') : (language === 'fr' ? 'Caisse Fermée' : 'Shift Closed')}
            </span>
            <span className={`h-2 w-2 rounded-full ${currentShift?.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-teal-700 dark:text-teal-400">
            <span>{currentShift?.cashierName.split(' ')[0] || 'Caissier'}</span>
            <button
              onClick={() => setActiveTab('pos')}
              className="font-bold underline hover:text-teal-900 dark:hover:text-teal-200"
            >
              {language === 'fr' ? 'Terminal' : 'Terminal'} &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {navSections.map(section => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </p>
            )}
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs dark:bg-teal-600'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
                  }`}
                >
                  <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <Icon
                      className={`h-4 w-4 shrink-0 transition ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
                      }`}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        item.badgeColor || 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info & Hardware Shortcut */}
      {!isCollapsed ? (
        <div className="border-t border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 space-y-2">
          <button
            type="button"
            onClick={() => setIsAndroidModalOpen(true)}
            className="w-full flex items-center justify-between rounded-xl bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 transition dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800"
          >
            <div className="flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Application Android</span>
            </div>
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-black">
              APK
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrinterModalOpen(true)}
            className="w-full flex items-center justify-between rounded-xl bg-slate-100 hover:bg-teal-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:text-teal-800 transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <div className="flex items-center gap-1.5">
              <Printer className="h-3.5 w-3.5 text-teal-600" />
              <span>Imprimantes & Caisse</span>
            </div>
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              {printerConfig.mode}
            </span>
          </button>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="font-semibold">OHADA Compliant</span>
            <span className="font-mono text-[10px]">v2.6 CMR</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">XAF / FCFA • CEMAC Zone</p>
        </div>
      ) : (
        <div className="border-t border-slate-200 p-2 flex flex-col items-center gap-1.5 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsAndroidModalOpen(true)}
            className="p-2 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            title="Application Android (APK)"
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPrinterModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Gérer Imprimante"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
