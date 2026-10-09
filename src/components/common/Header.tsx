import React, { useState } from 'react';
import {
  Bell,
  Search,
  Globe,
  Sun,
  Moon,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
  Building2,
  CheckCircle2,
  ChevronDown,
  AlertTriangle,
  Receipt,
  FileText,
  DollarSign,
  Package,
  UserPlus,
  Printer,
  Github,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatDateTime } from '../../utils/formatters';
import { GitHubPublishModal } from './GitHubPublishModal';
import { AndroidApkModal } from './AndroidApkModal';

export const Header: React.FC = () => {
  const {
    organization,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    currentUser,
    isOnline,
    syncQueue,
    syncNow,
    language,
    setLanguage,
    theme,
    toggleTheme,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
    printerConfig,
    setIsPrinterModalOpen,
    isGitHubModalOpen,
    setIsGitHubModalOpen,
    isAndroidModalOpen,
    setIsAndroidModalOpen,
  } = useApp();

  const t = translations[language];
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning;
    if (hour < 18) return t.goodAfternoon;
    return t.goodEvening;
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left: Greeting & Branch Selector */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              {organization.name}
            </span>
          </div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-base">
            {getGreeting()},{' '}
            <span className="text-slate-700 dark:text-slate-300">
              {currentUser.name.split(' ')[0]}
            </span>
          </h1>
        </div>

        {/* Branch Selector Dropdown */}
        <div className="relative hidden md:block">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
            <Building2 className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(e.target.value)}
              className="bg-transparent pr-4 font-medium outline-none cursor-pointer"
            >
              <option value="all">{t.allBranches}</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right: Actions, Sync, Language, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline / Online Sync Indicator */}
        <div className="flex items-center">
          {isOnline ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">{t.online}</span>
            </div>
          ) : (
            <button
              onClick={syncNow}
              className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
              title="Click to sync local offline queue"
            >
              <WifiOff className="h-3 w-3" />
              <span>
                {t.offline} {syncQueue.length > 0 && `(${syncQueue.length})`}
              </span>
            </button>
          )}

          {syncQueue.length > 0 && isOnline && (
            <button
              onClick={syncNow}
              className="ml-1.5 flex items-center gap-1 rounded-md bg-teal-600 px-2 py-1 text-xs font-medium text-white shadow-xs hover:bg-teal-700"
            >
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">{t.syncNow}</span>
            </button>
          )}
        </div>

        {/* Universal Hardware / Printer Indicator */}
        <button
          onClick={() => setIsPrinterModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/80 px-2.5 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300 shadow-xs"
          title="Imprimante Connectée - Cliquez pour tester ou changer de mode"
        >
          <Printer className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span className="hidden lg:inline font-mono text-[11px] font-bold">
            {printerConfig.mode.toUpperCase()} ({printerConfig.paperWidth})
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        {/* GitHub Repository / Publish Button */}
        <button
          onClick={() => setIsGitHubModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 shadow-xs"
          title="Publier ou synchroniser le code sur votre GitHub"
        >
          <Github className="h-3.5 w-3.5 text-teal-400" />
          <span className="font-semibold text-[11px]">GitHub</span>
        </button>

        {/* Android APK Download & WebAPK Install Button */}
        <button
          onClick={() => setIsAndroidModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs"
          title="Installer sur Android ou télécharger l'APK"
        >
          <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-[11px]">Android APK</span>
        </button>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAction(!showQuickAction)}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.quickAction}</span>
          </button>

          {showQuickAction && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
              onClick={() => setShowQuickAction(false)}
            >
              <button
                onClick={() => setActiveTab('pos')}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Receipt className="h-4 w-4 text-teal-600" />
                {t.newSale}
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <FileText className="h-4 w-4 text-blue-600" />
                {t.createInvoice}
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <DollarSign className="h-4 w-4 text-amber-600" />
                {t.addExpense}
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Package className="h-4 w-4 text-purple-600" />
                {t.addProduct}
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <UserPlus className="h-4 w-4 text-emerald-600" />
                {t.addCustomer}
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-900 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:text-white"
              >
                <Github className="h-4 w-4 text-slate-900 dark:text-teal-400" />
                <span>{language === 'fr' ? 'Publier sur GitHub' : 'Publish to GitHub'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Switch language (FR/EN)"
        >
          {language === 'fr' ? 'EN' : 'FR'}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Toggle light/dark theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.notifications} ({unreadCount})
                </span>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] font-semibold text-teal-600 hover:underline dark:text-teal-400"
                >
                  {t.markAllRead}
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No notifications.</p>
                ) : (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      onClick={() => markNotificationRead(item.id)}
                      className={`cursor-pointer rounded-lg p-2.5 transition text-left text-xs ${
                        item.read
                          ? 'bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400'
                          : 'bg-teal-50/70 border-l-3 border-teal-500 font-medium text-slate-800 dark:bg-slate-800/90 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{item.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(item.timestamp, language)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                        {item.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 font-bold text-[11px] text-white dark:bg-teal-600">
              {currentUser.name
                .split(' ')
                .map(n => n[0])
                .join('')}
            </div>
            <div className="hidden text-left sm:block pr-1">
              <p className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">{currentUser.role}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
              onClick={() => setShowProfileMenu(false)}
            >
              <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{organization.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">NIU: {organization.niu}</p>
                <p className="text-[11px] text-slate-500 font-mono">RCCM: {organization.rccm}</p>
              </div>
              <button
                onClick={() => setActiveTab('settings')}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t.settings}
              </button>
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-slate-800"
              >
                {language === 'fr' ? 'Relancer l’Assistant Onboarding' : 'Replay Onboarding Wizard'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* GitHub Publish Modal */}
      <GitHubPublishModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Android APK Download / Install Modal */}
      <AndroidApkModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </header>
  );
};
