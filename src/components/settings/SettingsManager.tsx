import React, { useState } from 'react';
import {
  Settings,
  Building,
  Shield,
  CreditCard,
  Globe,
  Database,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Users,
  Save,
  Printer,
  Smartphone,
  Laptop,
  Play,
  Cpu,
  Github,
  GitBranch,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA } from '../../utils/formatters';
import { GitHubPublishModal } from '../common/GitHubPublishModal';

export const SettingsManager: React.FC = () => {
  const {
    organization,
    updateOrganization,
    language,
    setLanguage,
    theme,
    toggleTheme,
    resetToDemoData,
    setShowOnboarding,
    printerConfig,
    updatePrinterConfig,
    setIsPrinterModalOpen,
    hardwareEnv,
    testPrinter,
    kickCashDrawer,
  } = useApp();

  const t = translations[language];

  const [activeSection, setActiveSection] = useState<'business' | 'tax' | 'hardware' | 'roles' | 'subscription' | 'data' | 'github'>('business');
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState(organization.name);
  const [tradeName, setTradeName] = useState(organization.tradeName);
  const [rccm, setRccm] = useState(organization.rccm);
  const [niu, setNiu] = useState(organization.niu);
  const [phone, setPhone] = useState(organization.phone);
  const [email, setEmail] = useState(organization.email);
  const [address, setAddress] = useState(organization.address);
  const [city, setCity] = useState(organization.city);
  const [taxRate, setTaxRate] = useState(organization.taxRate);
  const [momoCode, setMomoCode] = useState(organization.momoMerchantCode || '');
  const [omCode, setOmCode] = useState(organization.omMerchantCode || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({
      name,
      tradeName,
      rccm,
      niu,
      phone,
      email,
      address,
      city,
      taxRate,
      momoMerchantCode: momoCode,
      omMerchantCode: omCode,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t.settings} & Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {language === 'fr'
            ? 'Paramètres de l’entreprise, identifiants fiscaux (RCCM/NIU), rôles d’utilisateurs et données'
            : 'Company identifiers, tax parameters, permissions matrix, and subscription plans'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {[
          { id: 'business', label: language === 'fr' ? 'Entreprise & RCCM' : 'Business Profile' },
          { id: 'tax', label: language === 'fr' ? 'TVA & Paiements Marchands' : 'Taxes & Merchant Pay' },
          { id: 'hardware', label: language === 'fr' ? 'Matériel & Imprimantes' : 'Hardware & Printers' },
          { id: 'roles', label: language === 'fr' ? 'Rôles & Permissions' : 'Roles & Permissions' },
          { id: 'subscription', label: language === 'fr' ? 'Forfaits & Abonnement' : 'Subscription Plans' },
          { id: 'data', label: language === 'fr' ? 'Sauvegarde & Données' : 'Backup & Data' },
          { id: 'github', label: 'GitHub & Dépôt Git' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeSection === tab.id
                ? 'bg-slate-900 text-white dark:bg-teal-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Business Form */}
      {activeSection === 'business' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs">
          <form onSubmit={handleSaveBusiness} className="max-w-2xl space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Raison Sociale Légale</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nom Commercial / Enseigne</label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={e => setTradeName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">N° RCCM (Registre du Commerce)</label>
                <input
                  type="text"
                  value={rccm}
                  onChange={e => setRccm(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">N° Identifiant Unique (NIU DGI)</label>
                <input
                  type="text"
                  value={niu}
                  onChange={e => setNiu(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Téléphone Principal</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Email Officiel</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Adresse Siège Social</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Ville & Pays</label>
                <input
                  type="text"
                  value={`${city}, Cameroun`}
                  readOnly
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 font-bold text-white shadow-md hover:bg-teal-700"
              >
                <Save className="h-4 w-4" />
                <span>{isSaved ? 'Modifications Enregistrées !' : 'Enregistrer les Modifications'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tax & Payment Settings */}
      {activeSection === 'tax' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs max-w-2xl space-y-4">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Taux de TVA Normal Cameroun (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={e => setTaxRate(Number(e.target.value))}
              className="mt-1 w-32 rounded-xl border border-slate-200 bg-white p-2.5 font-bold outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
            <p className="mt-1 text-[11px] text-slate-400">Taux officiel en vigueur : 19.25% (17.5% TVA + 10% CAC)</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Code Marchand MTN Mobile Money</label>
              <input
                type="text"
                value={momoCode}
                onChange={e => setMomoCode(e.target.value)}
                placeholder="677 82 14 00"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Code Marchand Orange Money</label>
              <input
                type="text"
                value={omCode}
                onChange={e => setOmCode(e.target.value)}
                placeholder="699 33 21 55"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hardware & Universal Printer Auto-Detection */}
      {activeSection === 'hardware' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Printer className="h-4 w-4 text-teal-600" />
                <span>Gestionnaire Matériel & Imprimantes Thermiques</span>
              </h4>
              <p className="text-slate-400 mt-0.5">
                Identification automatique multi-périphériques : Ordinateur PC, Smartphone Android, iPhone, Tablette
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPrinterModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 font-bold text-white shadow-md hover:bg-teal-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>Ouvrir Panneau Périphériques</span>
            </button>
          </div>

          {/* Diagnostic Card */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/60 dark:bg-teal-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider text-[11px]">
                Diagnostic Matériel Actif
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Périphérique : {hardwareEnv.platform.toUpperCase()} ({hardwareEnv.isMobile ? 'Mobile' : 'PC'})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="rounded-xl bg-white p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 block">Mode de Liaison</span>
                <span className="font-mono font-black text-slate-900 dark:text-white uppercase mt-0.5 block">
                  {printerConfig.mode}
                </span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 block">Rouleau Papier</span>
                <span className="font-mono font-black text-slate-900 dark:text-white mt-0.5 block">
                  {printerConfig.paperWidth} (ESC/POS)
                </span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 block">Massicot Papier</span>
                <span className="font-mono font-black text-slate-900 dark:text-white mt-0.5 block">
                  {printerConfig.autoCut ? 'Auto-Cut Actif' : 'Manuel'}
                </span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 block">Tiroir Caisse RJ11</span>
                <span className="font-mono font-black text-slate-900 dark:text-white mt-0.5 block">
                  {printerConfig.kickCashDrawer ? 'Impulsion 24V' : 'Désactivé'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={async () => {
                await testPrinter();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Play className="h-3.5 w-3.5 text-teal-600" />
              <span>Tester Impression Directe</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await kickCashDrawer();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span>Tester Ouverture Tiroir Caisse</span>
            </button>
          </div>
        </div>
      )}

      {/* Roles & Permissions Matrix */}
      {activeSection === 'roles' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
            Matrice des Rôles & Sécurité Granulaire
          </h4>
          <p className="text-slate-400 mb-4">
            Contrôle d'accès basé sur les responsabilités en entreprise (RBAC)
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-2">Rôle</th>
                  <th className="py-2">Créer Ventes Caisse</th>
                  <th className="py-2">Supprimer Ventes</th>
                  <th className="py-2">Valider Dépenses</th>
                  <th className="py-2">Rapports Financiers</th>
                  <th className="py-2">Modifier Paramètres</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { role: 'Propriétaire (Owner)', sales: true, del: true, exp: true, rep: true, set: true },
                  { role: 'Administrateur', sales: true, del: true, exp: true, rep: true, set: true },
                  { role: 'Responsable Agence (Manager)', sales: true, del: false, exp: true, rep: true, set: false },
                  { role: 'Comptable (Accountant)', sales: false, del: false, exp: true, rep: true, set: false },
                  { role: 'Caissière (Cashier)', sales: true, del: false, exp: false, rep: false, set: false },
                  { role: 'Gestionnaire Stock', sales: false, del: false, exp: false, rep: false, set: false },
                ].map(r => (
                  <tr key={r.role}>
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">{r.role}</td>
                    <td className="py-2.5 text-center">{r.sales ? '✅' : '❌'}</td>
                    <td className="py-2.5 text-center">{r.del ? '✅' : '❌'}</td>
                    <td className="py-2.5 text-center">{r.exp ? '✅' : '❌'}</td>
                    <td className="py-2.5 text-center">{r.rep ? '✅' : '❌'}</td>
                    <td className="py-2.5 text-center">{r.set ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      {activeSection === 'subscription' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          {[
            {
              name: 'STARTER',
              price: '15 000 FCFA / mois',
              features: ['1 Agence', 'Caisse POS basique', 'Jusqu’à 2 utilisateurs', 'Support WhatsApp'],
              current: false,
            },
            {
              name: 'BUSINESS PRO',
              price: '35 000 FCFA / mois',
              features: ['Multi-agences (jusqu’à 4)', 'OHADA Comptabilité', 'Akem AI Assistant illimité', 'Rapports fiscaux DGI'],
              current: true,
            },
            {
              name: 'ENTERPRISE',
              price: '75 000 FCFA / mois',
              features: ['Agences illimitées', 'API personnalisée & ERP', 'Comptable dédié', 'SLA 99.9%'],
              current: false,
            },
          ].map(plan => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xs ${
                plan.current
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">{plan.name}</h4>
                  {plan.current && (
                    <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[9px] font-bold text-white">
                      Actif
                    </span>
                  )}
                </div>
                <p className="mt-2 text-base font-black text-teal-700 dark:text-teal-400">{plan.price}</p>
                <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-300">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-teal-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Management & Demo Reset */}
      {activeSection === 'data' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs space-y-5 max-w-xl">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Gestion des Données & Démonstration</h4>
            <p className="text-slate-400 mt-0.5">
              Réinitialisez ou rechargez les données fictives officielles Akem Distribution SARL.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={resetToDemoData}
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 py-2.5 font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Restaurer Données Démo (Akem Distribution SARL)</span>
            </button>

            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 font-bold text-white hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700"
            >
              <Sparkles className="h-4 w-4" />
              <span>Lancer l’Assistant Onboarding (7 étapes)</span>
            </button>
          </div>
        </div>
      )}

      {/* GitHub & Source Code Management */}
      {activeSection === 'github' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs space-y-5 max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-teal-600">
                <Github className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Dépôt GitHub & Déploiement
                </h4>
                <p className="text-slate-400 mt-0.5">
                  Publiez AkemTech POS & Billing sur votre profil GitHub personnel ou d'organisation.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 font-bold text-white hover:bg-teal-700 shadow-xs transition"
            >
              <Github className="h-4 w-4" />
              <span>Assistant de Publication</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <GitBranch className="h-4 w-4 text-teal-600" />
                Branche Principale
              </span>
              <p className="font-mono text-teal-700 dark:text-teal-400 font-bold">main</p>
              <p className="text-[11px] text-slate-500">Prêt pour synchronisation et push automatique.</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-teal-600" />
                Dépôt Git Local
              </span>
              <p className="font-mono text-emerald-600 font-bold">Initialisé & Validé</p>
              <p className="text-[11px] text-slate-500">Tous les fichiers sources et README.md sont prêts.</p>
            </div>
          </div>

          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/60 dark:bg-teal-950/20 space-y-2">
            <p className="font-bold text-teal-900 dark:text-teal-300">
              Procédure en 1 clic pour envoyer sur GitHub :
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
              <li>Créez un dépôt vide sur <a href="https://github.com/new" target="_blank" rel="noreferrer" className="font-bold text-teal-600 underline">github.com/new</a> (ex: <code>akemtech-pos-billing</code>).</li>
              <li>Ouvrez l'assistant de publication ci-dessous ou cliquez sur le bouton GitHub dans la barre supérieure.</li>
              <li>Copiez les commandes <code>git remote add origin ...</code> et <code>git push -u origin main</code>.</li>
            </ol>
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 font-bold text-white hover:bg-slate-800 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5 text-teal-400" />
              <span>Ouvrir l'Assistant de Synchronisation GitHub</span>
            </button>
          </div>
        </div>
      )}

      {/* GitHub Publish Modal */}
      <GitHubPublishModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />
    </div>
  );
};
