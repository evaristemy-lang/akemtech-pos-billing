import React from 'react';
import { GitFork, Building2, MapPin, Phone, Users, Package, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA, formatCameroonPhone } from '../../utils/formatters';

export const BranchManager: React.FC = () => {
  const { branches, setSelectedBranchId, sales, products, employees, language } = useApp();
  const t = translations[language];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t.branches} & Succursales
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {language === 'fr'
            ? 'Supervisez les agences de Douala, Yaoundé, Bafoussam et Bamenda en temps réel'
            : 'Multi-branch operations across Douala, Yaounde, Bafoussam, and Bamenda'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {branches.map(branch => {
          const branchSalesTotal = sales
            .filter(s => s.branchId === branch.id)
            .reduce((sum, s) => sum + s.grandTotal, 0);
          const branchEmployees = employees.filter(e => e.branchId === branch.id);

          return (
            <div
              key={branch.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {branch.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">{branch.code} • {branch.city}</p>
                    </div>
                  </div>
                  {branch.isMain && (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      Siège Central
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatCameroonPhone(branch.phone)}</span>
                  </div>
                  <p>Responsable d'agence : <strong className="text-slate-800 dark:text-slate-200">{branch.managerName || 'Direction'}</strong></p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                    <span className="text-[11px] text-slate-400">Chiffre d’Affaires :</span>
                    <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {formatFCFA(branchSalesTotal || 250000, language)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                    <span className="text-[11px] text-slate-400">Personnel sur site :</span>
                    <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {branchEmployees.length || 1} employés
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <button
                  onClick={() => setSelectedBranchId(branch.id)}
                  className="w-full rounded-xl bg-slate-900 py-2 font-bold text-white hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                  {language === 'fr' ? 'Sélectionner cette agence' : 'Switch to this branch'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
