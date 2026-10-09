import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Truck,
  CheckCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA, formatCameroonPhone } from '../../utils/formatters';
import { Supplier } from '../../types';

export const SuppliersManager: React.FC = () => {
  const { suppliers, language, addNotification } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(s => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.suppliers} & Fournisseurs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'fr'
              ? 'Grands comptes fournisseurs (SOSUCAM, CIMENCAM, SABC), encours et règlements'
              : 'Supplier accounts, procurement terms, and trade payables'}
          </p>
        </div>

        <button
          onClick={() =>
            addNotification({
              title: language === 'fr' ? 'Nouveau Fournisseur' : 'New Supplier',
              message: language === 'fr'
                ? 'Module d’enregistrement des comptes fournisseurs prêt.'
                : 'Supplier registration ready.',
              type: 'info',
            })
          }
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>{language === 'fr' ? 'Nouveau Fournisseur' : 'Add Supplier'}</span>
        </button>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">{language === 'fr' ? 'Fournisseurs Enregistrés' : 'Registered Suppliers'}</span>
          <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{suppliers.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{language === 'fr' ? 'Partenaires nationaux agréés' : 'Certified distributors'}</p>
        </div>

        <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
          <span className="text-xs font-bold text-red-900 dark:text-red-300">{t.payables}</span>
          <p className="mt-1 text-xl font-black text-red-950 dark:text-red-200">
            {formatFCFA(totalSupplierDebt, language)}
          </p>
          <p className="text-[11px] text-red-800 dark:text-red-300 mt-0.5">
            {suppliers.filter(s => s.outstandingBalance > 0).length} {language === 'fr' ? 'fournisseurs avec factures dues' : 'suppliers awaiting payment'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'fr' ? 'Rechercher fournisseur, contact, catégorie...' : 'Search supplier, contact, category...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {filteredSuppliers.length} {language === 'fr' ? 'fournisseurs' : 'suppliers'}
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map(sup => (
          <div
            key={sup.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{sup.name}</h4>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">{sup.category}</p>
                </div>
                <span className="rounded bg-slate-100 p-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Building className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <p>Contact : <strong className="text-slate-800 dark:text-slate-200">{sup.contactPerson}</strong></p>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <span>{formatCameroonPhone(sup.phone)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>{sup.address}, {sup.city}</span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'fr' ? 'Solde Dû Fournisseur :' : 'Balance Due :'}</span>
                  <span className={`font-black ${sup.outstandingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {formatFCFA(sup.outstandingBalance, language)}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">Conditions : {sup.paymentTerms}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
              <button
                onClick={() =>
                  addNotification({
                    title: language === 'fr' ? 'Règlement Fournisseur' : 'Supplier Payment',
                    message: language === 'fr'
                      ? `Règlement pour le fournisseur ${sup.name} enregistré.`
                      : `Payment recorded for ${sup.name}.`,
                    type: 'success',
                  })
                }
                className="rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300"
              >
                {language === 'fr' ? 'Régler Facture' : 'Pay Supplier'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
