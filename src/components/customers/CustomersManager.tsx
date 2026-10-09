import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Award,
  Send,
  AlertTriangle,
  History,
  X,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA, formatDate, formatCameroonPhone } from '../../utils/formatters';
import { Customer } from '../../types';

export const CustomersManager: React.FC = () => {
  const { customers, invoices, sales, addCustomer, organization, language } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'vip' | 'regular' | 'debtor'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);

  // New Customer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+237 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Douala');
  const [type, setType] = useState<Customer['type']>('regular');
  const [creditLimit, setCreditLimit] = useState(1000000);
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(c => {
    const matchesSegment = selectedSegment === 'all' || c.type === selectedSegment;
    const matchesQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSegment && matchesQuery;
  });

  const totalOutstandingCredit = customers.reduce((sum, c) => sum + c.currentBalance, 0);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addCustomer({
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: address || 'Douala, Cameroun',
      city: city || 'Douala',
      type,
      creditLimit,
      notes,
    });

    setIsAddModalOpen(false);
    setName('');
    setPhone('+237 ');
    setEmail('');
    setAddress('');
    setNotes('');
  };

  const handleSendWhatsAppReminder = (customer: Customer) => {
    const text =
      language === 'fr'
        ? `Bonjour *${customer.name}*,\n\nSauf erreur de notre part, votre compte auprès de *${organization.name}* présente un solde restant dû de *${formatFCFA(customer.currentBalance, 'fr')}*.\n\nVous pouvez effectuer votre règlement par :\n• *MTN Mobile Money* : ${organization.momoMerchantCode || organization.phone}\n• *Orange Money* : ${organization.omMerchantCode || organization.phone}\n• *Virement bancaire* : Afriland First Bank (Akwa)\n\nMerci de nous transmettre le reçu de confirmation. Excellente journée à vous !`
        : `Hello *${customer.name}*,\n\nKindly note that your account with *${organization.name}* has a pending balance of *${formatFCFA(customer.currentBalance, 'en')}*.\n\nYou can settle via:\n• *MTN MoMo* : ${organization.momoMerchantCode || organization.phone}\n• *Orange Money* : ${organization.omMerchantCode || organization.phone}\n• *Bank Transfer* : Afriland First Bank\n\nThank you for your prompt payment. Have a great day!`;

    const encoded = encodeURIComponent(text);
    const cleanPhone = customer.phone.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.customerTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'fr'
              ? 'Répertoire clients, gestion des crédits accordés et relances WhatsApp'
              : 'Customer relationship management, credit limits, and WhatsApp recovery'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>{t.newCustomer}</span>
        </button>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">{t.totalCustomers}</span>
          <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{customers.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{language === 'fr' ? 'Clients actifs enregistrés' : 'Active customer profiles'}</p>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300">{t.totalCredit}</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-1 text-xl font-black text-amber-950 dark:text-amber-200">
            {formatFCFA(totalOutstandingCredit, language)}
          </p>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
            {customers.filter(c => c.currentBalance > 0).length} {language === 'fr' ? 'clients ont un solde débiteur' : 'clients with active balance'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">{t.loyaltyPointsLabel}</span>
          <p className="mt-1 text-xl font-black text-teal-600 dark:text-teal-400">
            {customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0)} pts
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{language === 'fr' ? '1 point par 1 000 FCFA acheté' : '1 point per 1,000 FCFA spent'}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher client, téléphone, ville...' : 'Search customer, phone, city...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex gap-1.5">
            {[
              { id: 'all', label: language === 'fr' ? 'Tous' : 'All' },
              { id: 'vip', label: 'VIP' },
              { id: 'regular', label: language === 'fr' ? 'Réguliers' : 'Regular' },
              { id: 'debtor', label: language === 'fr' ? 'Débiteurs' : 'Debtors' },
            ].map(seg => (
              <button
                key={seg.id}
                onClick={() => setSelectedSegment(seg.id as any)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  selectedSegment === seg.id
                    ? 'bg-slate-900 text-white dark:bg-teal-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {filteredCustomers.length} {language === 'fr' ? 'clients trouvés' : 'customers'}
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map(customer => {
          const hasDebt = customer.currentBalance > 0;
          return (
            <div
              key={customer.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {customer.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {formatCameroonPhone(customer.phone)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      customer.type === 'vip'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : customer.type === 'debtor'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {customer.type}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{customer.address}, {customer.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-teal-600" />
                    <span>{customer.loyaltyPoints} {language === 'fr' ? 'points fidélité' : 'loyalty pts'}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.currentDebt}:</span>
                    <span className={`font-bold ${hasDebt ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {formatFCFA(customer.currentBalance, language)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>{t.creditLimit}:</span>
                    <span>{formatFCFA(customer.creditLimit, language)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  onClick={() => setSelectedCustomerForHistory(customer)}
                  className="text-xs font-bold text-slate-700 hover:text-teal-600 dark:text-slate-300"
                >
                  <History className="inline-block h-3.5 w-3.5 mr-1" />
                  {language === 'fr' ? 'Historique' : 'History'}
                </button>

                {hasDebt && (
                  <button
                    onClick={() => handleSendWhatsAppReminder(customer)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700"
                    title="Send WhatsApp debt reminder"
                  >
                    <Send className="h-3 w-3" />
                    <span>Relance WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.newCustomer}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Nom ou Raison Sociale' : 'Customer Name'}</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ets Tchapnga & Fils"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{t.phone} (Cameroun +237)</label>
                <input
                  type="text"
                  required
                  placeholder="+237 6XX XX XX XX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Catégorie</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="regular">{language === 'fr' ? 'Régulier' : 'Regular'}</option>
                    <option value="vip">VIP</option>
                    <option value="debtor">{language === 'fr' ? 'Débiteur' : 'Debtor'}</option>
                    <option value="new">{language === 'fr' ? 'Nouveau' : 'New'}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Ville</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Douala">Douala</option>
                    <option value="Yaoundé">Yaoundé</option>
                    <option value="Bafoussam">Bafoussam</option>
                    <option value="Bamenda">Bamenda</option>
                    <option value="Garoua">Garoua</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{t.creditLimit} (FCFA)</label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={e => setCreditLimit(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Adresse / Quartier</label>
                <input
                  type="text"
                  placeholder="Ex: Marché Central, Allée Grossistes"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
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

      {/* Customer Account History Drawer */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="h-full w-full max-w-md bg-white p-6 shadow-2xl dark:bg-slate-900 overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedCustomerForHistory.name}
                </h3>
                <p className="text-slate-500">{formatCameroonPhone(selectedCustomerForHistory.phone)}</p>
              </div>
              <button onClick={() => setSelectedCustomerForHistory(null)} className="text-slate-400">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">{language === 'fr' ? 'Total Achats Cumulés :' : 'Total Purchases :'}</span>
                  <span className="font-bold">{formatFCFA(selectedCustomerForHistory.totalPurchases, language)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">{language === 'fr' ? 'Solde Débiteur Actuel :' : 'Current Balance :'}</span>
                  <span className="font-bold text-red-600">{formatFCFA(selectedCustomerForHistory.currentBalance, language)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {language === 'fr' ? 'Factures Associées' : 'Invoices & Orders'}
                </h4>
                <div className="space-y-2">
                  {invoices.filter(i => i.customerId === selectedCustomerForHistory.id).map(inv => (
                    <div key={inv.id} className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                      <div className="flex justify-between font-bold">
                        <span>{inv.invoiceNumber}</span>
                        <span>{formatFCFA(inv.grandTotal, language)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                        <span>{formatDate(inv.date, language)}</span>
                        <span className="capitalize">{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
