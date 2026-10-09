import React, { useState } from 'react';
import {
  Wallet,
  ArrowRightLeft,
  Smartphone,
  CreditCard,
  Building2,
  DollarSign,
  TrendingUp,
  Plus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA, formatCameroonPhone } from '../../utils/formatters';

export const TreasuryManager: React.FC = () => {
  const { accounts, transferFunds, language, addNotification } = useApp();
  const t = translations[language];

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState<number>(200000);
  const [transferNotes, setTransferNotes] = useState('');

  const totalLiquidity = accounts.reduce((sum, a) => sum + a.balance, 0);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'momo':
      case 'om':
        return <Smartphone className="h-5 w-5 text-amber-500" />;
      case 'bank':
        return <Building2 className="h-5 w-5 text-blue-500" />;
      default:
        return <Wallet className="h-5 w-5 text-emerald-500" />;
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || fromAccountId === toAccountId) {
      addNotification({
        title: language === 'fr' ? 'Sélection de comptes invalide' : 'Invalid accounts',
        message: language === 'fr'
          ? 'Veuillez sélectionner des comptes différents pour le virement.'
          : 'Please select different source and destination accounts.',
        type: 'warning',
      });
      return;
    }

    const success = transferFunds(fromAccountId, toAccountId, transferAmount, transferNotes);
    if (!success) {
      addNotification({
        title: language === 'fr' ? 'Solde insuffisant' : 'Insufficient funds',
        message: language === 'fr'
          ? 'Solde insuffisant sur le compte source !'
          : 'Insufficient funds in source account!',
        type: 'error',
      });
      return;
    }

    addNotification({
      title: language === 'fr' ? 'Virement effectué' : 'Transfer completed',
      message: language === 'fr'
        ? `Virement de ${formatFCFA(transferAmount, language)} exécuté avec succès.`
        : `Transfer of ${formatFCFA(transferAmount, language)} completed successfully.`,
      type: 'success',
    });

    setIsTransferModalOpen(false);
    setTransferNotes('');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.accountsTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'fr'
              ? 'Comptes bancaires (Afriland, BICEC), portefeuilles Mobile Money (MTN, Orange) et caisses'
              : 'Bank accounts, Mobile Money merchant wallets, and physical cash registers'}
          </p>
        </div>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition"
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>{t.transferFunds}</span>
        </button>
      </div>

      {/* Total Liquidity Banner */}
      <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-md dark:border-teal-900/50">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
          {t.totalLiquidity}
        </span>
        <div className="mt-2 flex items-baseline gap-3">
          <h3 className="text-3xl font-black tracking-tight text-white">
            {formatFCFA(totalLiquidity, language)}
          </h3>
          <span className="text-xs font-bold text-emerald-400">
            Disponibilités immédiates en FCFA
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-300">
          {language === 'fr'
            ? 'Total consolidé entre caisses physiques, portefeuilles marchands MTN / Orange Money et comptes bancaires.'
            : 'Consolidated balances across cash drawers, MTN/Orange merchant wallets, and commercial banks.'}
        </p>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map(acc => (
          <div
            key={acc.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {acc.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{acc.institution}</p>
                  </div>
                </div>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {acc.type}
                </span>
              </div>

              <div className="mt-5">
                <span className="text-[11px] text-slate-500">{language === 'fr' ? 'Solde Disponible' : 'Available Balance'}</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formatFCFA(acc.balance, language)}
                </p>
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-2 font-mono text-[10px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <span>{acc.accountNumber}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
              <span className="text-slate-400 font-medium">Devise: XAF</span>
              <button
                onClick={() => {
                  setFromAccountId(acc.id);
                  setIsTransferModalOpen(true);
                }}
                className="font-bold text-teal-600 hover:underline dark:text-teal-400"
              >
                {language === 'fr' ? 'Transférer' : 'Transfer'} &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Internal Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.transferFunds}</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Compte Source (À Débiter)' : 'From Account'}</label>
                <select
                  value={fromAccountId}
                  onChange={e => setFromAccountId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatFCFA(a.balance, language)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Compte Destination (À Créditer)' : 'To Account'}</label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatFCFA(a.balance, language)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Montant du Virement (FCFA)' : 'Transfer Amount'}</label>
                <input
                  type="number"
                  required
                  value={transferAmount}
                  onChange={e => setTransferAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Motif / Référence</label>
                <input
                  type="text"
                  placeholder="Ex: Nivellement hebdomadaire MoMo vers Afriland"
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-600 py-2.5 font-bold text-white shadow-md hover:bg-teal-700"
                >
                  {language === 'fr' ? 'Exécuter le Virement' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
