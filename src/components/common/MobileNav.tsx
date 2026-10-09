import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  Menu,
  X,
  FileText,
  DollarSign,
  Wallet,
  Calculator,
  BarChart3,
  Sparkles,
  Settings,
  Truck,
  FolderArchive,
  GitFork,
  UserCheck,
  Building,
  Printer,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, language, printerConfig, setIsPrinterModalOpen } = useApp();
  const [showDrawer, setShowDrawer] = useState(false);
  const t = translations[language];

  const primaryItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'pos', label: t.sales, icon: Receipt },
    { id: 'inventory', label: t.inventory, icon: Package },
    { id: 'customers', label: t.customers, icon: Users },
  ];

  const moreItems = [
    { id: 'invoices', label: t.invoices, icon: FileText },
    { id: 'expenses', label: t.expenses, icon: DollarSign },
    { id: 'payments', label: t.payments, icon: Wallet },
    { id: 'suppliers', label: t.suppliers, icon: Building },
    { id: 'employees', label: t.employees, icon: UserCheck },
    { id: 'accounting', label: t.accounting, icon: Calculator },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'deliveries', label: t.deliveries, icon: Truck },
    { id: 'documents', label: t.documents, icon: FolderArchive },
    { id: 'ai', label: t.aiAssistant, icon: Sparkles },
    { id: 'branches', label: t.branches, icon: GitFork },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <>
      {/* Bottom Bar */}
      <nav className="fixed bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        {primaryItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setShowDrawer(false);
              }}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2 text-[10px] font-semibold transition ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'scale-110 text-teal-600 dark:text-teal-400' : ''}`} />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowDrawer(!showDrawer)}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2 text-[10px] font-semibold transition ${
            showDrawer
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Menu className="h-5 w-5" />
          <span>{t.more}</span>
        </button>
      </nav>

      {/* More Drawer Overlay */}
      {showDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setShowDrawer(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'fr' ? 'Tous les Modules' : 'All Enterprise Modules'}
              </span>
              <button
                onClick={() => setShowDrawer(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Hardware Quick Card */}
            <div className="mb-3">
              <button
                type="button"
                onClick={() => {
                  setShowDrawer(false);
                  setIsPrinterModalOpen(true);
                }}
                className="w-full flex items-center justify-between rounded-xl bg-teal-50 border border-teal-200 p-2.5 text-teal-900 dark:bg-teal-950/60 dark:border-teal-900 dark:text-teal-200"
              >
                <div className="flex items-center gap-2">
                  <Printer className="h-4 w-4 text-teal-600" />
                  <span className="font-extrabold text-xs">Imprimante & Caisse</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                  {printerConfig.mode.toUpperCase()}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowDrawer(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-center transition ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-teal-600'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
