import React, { useState } from 'react';
import {
  CheckCircle,
  Building2,
  DollarSign,
  Package,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BusinessType } from '../../types';

export const OnboardingWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { organization, updateOrganization, language, resetToDemoData } = useApp();

  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Onboarding Form State
  const [bizName, setBizName] = useState(organization.name);
  const [bizCity, setBizCity] = useState(organization.city);
  const [bizPhone, setBizPhone] = useState(organization.phone);
  const [bizType, setBizType] = useState<BusinessType>(organization.businessType);
  const [bizCurrency, setBizCurrency] = useState('XAF');
  const [bizTaxRate, setBizTaxRate] = useState(19.25);

  const businessTypes: BusinessType[] = [
    'Retail',
    'Wholesale',
    'Distribution',
    'Restaurant',
    'Pharmacy',
    'Services',
    'Construction',
    'School',
    'Manufacturing',
    'Other',
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      updateOrganization({
        name: bizName,
        city: bizCity,
        phone: bizPhone,
        businessType: bizType,
        taxRate: bizTaxRate,
      });
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs text-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Top Header with Progress */}
        <div className="border-b border-slate-100 p-6 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-600 font-extrabold text-white text-xs">
                Ak
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                AkemTech POS & Billing Setup
              </span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
              <span>Étape {step} sur {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-1.5 rounded-full bg-teal-500 transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {step === 1 && (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Bienvenue sur AkemTech POS & Billing
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                “Gérez votre entreprise. Maîtrisez vos chiffres. Développez-vous plus vite.”
                <br /><br />
                Configurons ensemble votre système de gestion commerciale spécialement adapté aux entreprises camerounaises.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Informations sur l'entreprise
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nom de votre établissement</label>
                  <input
                    type="text"
                    value={bizName}
                    onChange={e => setBizName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Ville principale</label>
                  <select
                    value={bizCity}
                    onChange={e => setBizCity(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Douala">Douala (Littoral)</option>
                    <option value="Yaoundé">Yaoundé (Centre)</option>
                    <option value="Bafoussam">Bafoussam (Ouest)</option>
                    <option value="Bamenda">Bamenda (Nord-Ouest)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Téléphone (+237)</label>
                  <input
                    type="text"
                    value={bizPhone}
                    onChange={e => setBizPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Choisissez votre secteur d’activité
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {businessTypes.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBizType(t)}
                    className={`rounded-xl border p-3 text-left font-bold transition ${
                      bizType === t
                        ? 'border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Devise & Paramètres Fiscaux
              </h3>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Devise Principale :</span>
                  <p className="font-black text-slate-900 dark:text-white mt-1">Franc CFA (XAF / FCFA)</p>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Taux de TVA Normal (%)</label>
                  <input
                    type="number"
                    value={bizTaxRate}
                    onChange={e => setBizTaxRate(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Taux standard Cameroun : 19.25%</p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3 text-center py-4">
              <Package className="h-12 w-12 text-teal-600 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Catalogue & Stocks Pré-configurés
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                Vos premiers articles (Riz Dinor, Sucre SOSUCAM, Huile Diamaor, Ciment CIMENCAM) sont déjà importés et prêts à être vendus en caisse.
              </p>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3 text-center py-4">
              <Users className="h-12 w-12 text-teal-600 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Collaborateurs & Équipe
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                Vos caissiers, magasiniers et comptables peuvent être ajoutés dans la section Personnel avec leurs identifiants CNPS.
              </p>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Votre entreprise est prête !
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                AkemTech POS & Billing est maintenant configuré. Vous pouvez dès à présent encaisser vos premières ventes, imprimer des tickets thermiques et solliciter l'assistant Akem AI.
              </p>
            </div>
          )}
        </div>

        {/* Wizard Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Précédent</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="font-bold text-slate-400 hover:text-slate-600"
            >
              Passer la démo
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 font-extrabold text-white shadow-md hover:bg-teal-700 transition"
          >
            <span>{step === totalSteps ? 'Accéder au Tableau de Bord' : 'Continuer'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
