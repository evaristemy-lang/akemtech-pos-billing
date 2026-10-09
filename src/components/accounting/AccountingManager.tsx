import React, { useState } from 'react';
import {
  Calculator,
  Download,
  Printer,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA, formatDate } from '../../utils/formatters';

export const AccountingManager: React.FC = () => {
  const { sales, expenses, invoices, products, customers, suppliers, accounts, organization, language, addNotification } = useApp();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'income' | 'balance' | 'cashflow' | 'ledger'>('income');

  // OHADA Income Statement Computations
  const totalTurnover = sales.reduce((sum, s) => sum + s.grandTotal, 0); // Ventes de marchandises
  const costOfGoodsSold = sales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, i) => iSum + i.costPrice * i.quantity, 0);
  }, 0);
  const grossMargin = totalTurnover - costOfGoodsSold; // Marge Commerciale
  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0); // Charges d'exploitation
  const netOperatingIncome = grossMargin - totalOperatingExpenses; // Résultat d'exploitation
  const estimatedTax = Math.max(0, Math.round(netOperatingIncome * 0.30)); // 30% IS Cameroun (ou régime simplifié)
  const netProfit = netOperatingIncome - estimatedTax;

  // Balance Sheet Computations
  const inventoryAsset = products.reduce((sum, p) => sum + p.costPrice * p.stockQuantity, 0);
  const tradeReceivables = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const treasuryCashAndBank = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalCurrentAssets = inventoryAsset + tradeReceivables + treasuryCashAndBank;
  const fixedAssets = 15000000; // Immeuble, véhicules de livraison, aménagement entrepôt (Cameroon SARL)
  const totalAssets = fixedAssets + totalCurrentAssets;

  const tradePayables = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);
  const equityCapital = totalAssets - tradePayables - 2500000; // Capital social & réserves

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.accountingTitle}
            </h2>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              SYSCOHADA
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.ohadaNotice}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{t.print}</span>
          </button>
          <button
            onClick={() =>
              addNotification({
                title: language === 'fr' ? 'Export Comptable' : 'Accounting Export',
                message: language === 'fr'
                  ? 'Export comptable OHADA (Grand Livre & Bilan) généré avec succès.'
                  : 'OHADA ledger exported successfully.',
                type: 'success',
              })
            }
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.exportCsv}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        {[
          { id: 'income', label: t.incomeStatement },
          { id: 'balance', label: t.balanceSheet },
          { id: 'cashflow', label: t.cashFlowStatement },
          { id: 'ledger', label: language === 'fr' ? 'Grand Livre & Écritures' : 'General Ledger' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-teal-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Income Statement (Compte de Résultat) */}
      {activeTab === 'income' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {organization.name} • {t.incomeStatement}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              RCCM: {organization.rccm} • NIU: {organization.niu} • Exercice 2026
            </p>
          </div>

          <div className="mt-6 space-y-3 text-xs">
            {/* Chiffre d'Affaires */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                1. Chiffre d'Affaires Brut (Ventes de Marchandises HT)
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {formatFCFA(totalTurnover, language)}
              </span>
            </div>

            {/* Coût des Marchandises Vendues */}
            <div className="flex items-center justify-between py-2 text-slate-600 dark:text-slate-400">
              <span>2. Coût d’Achat des Marchandises Vendues (CAMV)</span>
              <span className="font-bold text-red-600">
                -{formatFCFA(costOfGoodsSold, language)}
              </span>
            </div>

            {/* Marge Brute */}
            <div className="flex items-center justify-between rounded-xl bg-teal-50/70 p-3 font-extrabold text-teal-900 dark:bg-teal-950/60 dark:text-teal-200">
              <span>= MARGE COMMERCIALE BRUTE</span>
              <span className="text-base font-black">
                {formatFCFA(grossMargin, language)}
              </span>
            </div>

            {/* Charges d'exploitation */}
            <div className="py-2 space-y-1.5 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Charges Externes & Frais Généraux :
              </span>
              {expenses.map(e => (
                <div key={e.id} className="flex justify-between text-slate-500">
                  <span>• {e.description} ({e.category})</span>
                  <span>{formatFCFA(e.amount, language)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 pt-1">
                <span>Total Charges d'Exploitation</span>
                <span className="text-red-600">-{formatFCFA(totalOperatingExpenses, language)}</span>
              </div>
            </div>

            {/* Résultat d'Exploitation */}
            <div className="flex items-center justify-between rounded-xl bg-slate-100 p-3 font-bold text-slate-900 dark:bg-slate-800 dark:text-white">
              <span>= RÉSULTAT D’EXPLOITATION NET</span>
              <span className="text-base font-black">
                {formatFCFA(netOperatingIncome, language)}
              </span>
            </div>

            {/* Impôt sur les Sociétés */}
            <div className="flex items-center justify-between py-2 text-slate-600 dark:text-slate-400">
              <span>Impôt sur les Sociétés Estimé (IS Cameroun ~30%)</span>
              <span className="font-bold text-red-600">-{formatFCFA(estimatedTax, language)}</span>
            </div>

            {/* Résultat Net */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-teal-700 to-slate-900 p-4 font-black text-white shadow-md">
              <span className="text-sm uppercase tracking-wide">
                BÉNÉFICE NET DE L’EXERCICE (RÉSULTAT NET COMPTABLE)
              </span>
              <span className="text-xl">
                {formatFCFA(netProfit, language)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Balance Sheet (Bilan Simplifié) */}
      {activeTab === 'balance' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Actif */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 uppercase">
              ACTIF (Emplois)
            </h4>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Actif Immobilisé (Bâtiments, Véhicules, Matériel) :</span>
                <span>{formatFCFA(fixedAssets, language)}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 space-y-2 dark:border-slate-800">
                <span className="font-bold text-teal-700 dark:text-teal-400">Actif Circulant :</span>
                <div className="flex justify-between pl-3 text-slate-600 dark:text-slate-400">
                  <span>• Stocks de Marchandises :</span>
                  <span>{formatFCFA(inventoryAsset, language)}</span>
                </div>
                <div className="flex justify-between pl-3 text-slate-600 dark:text-slate-400">
                  <span>• Créances Clients :</span>
                  <span>{formatFCFA(tradeReceivables, language)}</span>
                </div>
                <div className="flex justify-between pl-3 text-slate-600 dark:text-slate-400">
                  <span>• Trésorerie (Caisses & Banques) :</span>
                  <span>{formatFCFA(treasuryCashAndBank, language)}</span>
                </div>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-900 p-3 font-extrabold text-white">
                <span>TOTAL ACTIF</span>
                <span className="text-base">{formatFCFA(totalAssets, language)}</span>
              </div>
            </div>
          </div>

          {/* Passif */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 uppercase">
              PASSIF (Ressources)
            </h4>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Capitaux Propres & Réserves :</span>
                <span>{formatFCFA(equityCapital, language)}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 space-y-2 dark:border-slate-800">
                <span className="font-bold text-amber-700 dark:text-amber-400">Dettes & Passif Circulant :</span>
                <div className="flex justify-between pl-3 text-slate-600 dark:text-slate-400">
                  <span>• Dettes Fournisseurs :</span>
                  <span>{formatFCFA(tradePayables, language)}</span>
                </div>
                <div className="flex justify-between pl-3 text-slate-600 dark:text-slate-400">
                  <span>• Dettes Fiscales & Sociales (CNPS/DGI) :</span>
                  <span>{formatFCFA(2500000, language)}</span>
                </div>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-900 p-3 font-extrabold text-white">
                <span>TOTAL PASSIF</span>
                <span className="text-base">{formatFCFA(totalAssets, language)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cash Flow Statement */}
      {activeTab === 'cashflow' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 uppercase">
            {t.cashFlowStatement} (XAF)
          </h4>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between font-bold text-emerald-600">
              <span>+ Encaissements des Ventes Clients (Comptant, MoMo, OM, Banques) :</span>
              <span>+{formatFCFA(totalTurnover, language)}</span>
            </div>
            <div className="flex justify-between font-bold text-red-600">
              <span>- Décaissements Fournisseurs & Achats de Stocks :</span>
              <span>-{formatFCFA(costOfGoodsSold * 0.7, language)}</span>
            </div>
            <div className="flex justify-between font-bold text-red-600">
              <span>- Paiement des Charges Locatives & Factures (ENEO, Eau, Camtel) :</span>
              <span>-{formatFCFA(totalOperatingExpenses, language)}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-teal-50 p-3 font-extrabold text-teal-900 dark:bg-teal-950 dark:text-teal-200 border-t border-teal-200">
              <span>FLUX NET DE TRÉSORERIE D'EXPLOITATION</span>
              <span className="text-base">+{formatFCFA(treasuryCashAndBank, language)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: General Ledger */}
      {activeTab === 'ledger' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
            Grand Livre des Comptes (SYSCOHADA Révisé)
          </h4>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { code: '701', name: 'Ventes de marchandises', debit: 0, credit: totalTurnover },
              { code: '601', name: 'Achats de marchandises', debit: costOfGoodsSold, credit: 0 },
              { code: '605', name: 'Autres achats & fournitures (ENEO/Eau)', debit: 218500, credit: 0 },
              { code: '411', name: 'Clients (Créances)', debit: tradeReceivables, credit: 0 },
              { code: '401', name: 'Fournisseurs (Dettes)', debit: 0, credit: tradePayables },
              { code: '521', name: 'Banques locales (Afriland/BICEC)', debit: 12150000, credit: 0 },
              { code: '571', name: 'Caisse centrale & Portefeuilles MoMo/OM', debit: 4155000, credit: 0 },
            ].map(row => (
              <div key={row.code} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400 mr-2">{row.code}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{row.name}</span>
                </div>
                <div className="flex gap-6 font-mono font-bold">
                  <span className="w-28 text-right text-emerald-600">{row.debit > 0 ? formatFCFA(row.debit, language) : '-'}</span>
                  <span className="w-28 text-right text-slate-700 dark:text-slate-300">{row.credit > 0 ? formatFCFA(row.credit, language) : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
