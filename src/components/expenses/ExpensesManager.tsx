import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Zap,
  Droplet,
  Wifi,
  Truck,
  Users,
  Briefcase,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA, formatDate } from '../../utils/formatters';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';

export const ExpensesManager: React.FC = () => {
  const { expenses, accounts, createExpense, selectedBranchId, language } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [amount, setAmount] = useState<number>(25000);
  const [category, setCategory] = useState<ExpenseCategory>('electricity');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [beneficiary, setBeneficiary] = useState('');

  const filteredExpenses = expenses.filter(e => {
    const matchesBranch = selectedBranchId === 'all' || e.branchId === selectedBranchId;
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesQuery =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.beneficiary && e.beneficiary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBranch && matchesCat && matchesQuery;
  });

  const totalThisMonth = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'electricity':
        return <Zap className="h-4 w-4 text-amber-500" />;
      case 'water':
        return <Droplet className="h-4 w-4 text-blue-500" />;
      case 'internet':
        return <Wifi className="h-4 w-4 text-indigo-500" />;
      case 'transport':
        return <Truck className="h-4 w-4 text-orange-500" />;
      case 'salaries':
        return <Users className="h-4 w-4 text-emerald-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-slate-500" />;
    }
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    createExpense({
      category,
      description,
      amount,
      paymentMethod,
      accountId,
      branchId: selectedBranchId === 'all' ? 'branch-dla' : selectedBranchId,
      status: 'approved',
      beneficiary: beneficiary || 'Prestataire Local',
    });

    setIsAddModalOpen(false);
    setDescription('');
    setBeneficiary('');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.expensesTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'fr'
              ? 'Charges d’exploitation, factures courantes (ENEO, CAMWATER, Camtel) et décaissements'
              : 'Operational expenditure, utility bills, transport, and petty cash'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>{t.recordExpense}</span>
        </button>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">{t.totalExpensesThisMonth}</span>
          <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
            {formatFCFA(totalThisMonth, language)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{filteredExpenses.length} {language === 'fr' ? 'pièces comptables' : 'items'}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">{language === 'fr' ? 'Plus Gros Poste' : 'Largest Category'}</span>
          <p className="mt-1 text-xl font-black text-amber-600 dark:text-amber-400">
            {language === 'fr' ? 'Électricité ENEO' : 'Electricity (ENEO)'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">145 000 FCFA</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">{language === 'fr' ? 'Validation' : 'Approval Flow'}</span>
          <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
            100% {language === 'fr' ? 'Approuvé' : 'Approved'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{language === 'fr' ? 'Conforme règles de gestion' : 'Compliant'}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher dépense, bénéficiaire...' : 'Search expense, vendor...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">{language === 'fr' ? 'Toutes les catégories' : 'All Categories'}</option>
            <option value="electricity">Électricité (ENEO)</option>
            <option value="water">Eau (CAMWATER)</option>
            <option value="internet">Internet (Camtel)</option>
            <option value="transport">Transport & Carburant</option>
            <option value="salaries">Salaires & Personnel</option>
            <option value="maintenance">Maintenance</option>
            <option value="rent">Loyer</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {filteredExpenses.length} {language === 'fr' ? 'dépenses' : 'records'}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <th className="px-4 py-3">{language === 'fr' ? 'N° Pièce' : 'Reference'}</th>
                <th className="px-4 py-3">{language === 'fr' ? 'Description' : 'Description'}</th>
                <th className="px-4 py-3">{t.category}</th>
                <th className="px-4 py-3">{t.beneficiary}</th>
                <th className="px-4 py-3">{language === 'fr' ? 'Date' : 'Date'}</th>
                <th className="px-4 py-3">{t.paymentMethod}</th>
                <th className="px-4 py-3 text-right">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {exp.expenseNumber}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {exp.description}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 capitalize text-slate-700 dark:text-slate-300">
                      {getCategoryIcon(exp.category)}
                      <span>{exp.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {exp.beneficiary || '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {formatDate(exp.date, language)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {exp.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-red-600 dark:text-red-400">
                    -{formatFCFA(exp.amount, language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.recordExpense}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Montant de la Dépense (FCFA)' : 'Expense Amount'}</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{t.category}</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ExpenseCategory)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  <option value="electricity">Électricité (ENEO Cameroun)</option>
                  <option value="water">Eau (CAMWATER)</option>
                  <option value="internet">Internet / Téléphone (Camtel, MTN, OM)</option>
                  <option value="transport">Carburant / Transport / Livraison</option>
                  <option value="salaries">Salaires / Avances Personnel</option>
                  <option value="rent">Loyer Local / Entrepôt</option>
                  <option value="maintenance">Maintenance / Entretien / Réparation</option>
                  <option value="marketing">Publicité / Marketing</option>
                  <option value="taxes">Impôts / Taxes Communales</option>
                  <option value="other">Autre charge</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Description / Objet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Facture électricité agence Bastos"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{t.beneficiary}</label>
                <input
                  type="text"
                  placeholder="Ex: ENEO Cameroun, Station Total..."
                  value={beneficiary}
                  onChange={e => setBeneficiary(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.paymentMethod}</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="cash">Espèces (Caisse)</option>
                    <option value="momo">MTN Mobile Money</option>
                    <option value="om">Orange Money</option>
                    <option value="bank">Virement Bancaire</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Compte Débité' : 'Debit Account'}</label>
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-600 py-2.5 font-bold text-white shadow-md hover:bg-teal-700"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
