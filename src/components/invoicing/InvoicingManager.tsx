import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Share2,
  Printer,
  Eye,
  DollarSign,
  Send,
  X,
  CreditCard,
  Building2,
  User,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA, formatDate, generateOrderNumber } from '../../utils/formatters';
import { Invoice, InvoiceItem, InvoiceType, InvoiceStatus, PaymentMethod } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';

export const InvoicingManager: React.FC = () => {
  const {
    invoices,
    customers,
    products,
    createInvoice,
    recordInvoicePayment,
    updateInvoiceStatus,
    organization,
    selectedBranchId,
    language,
  } = useApp();

  const t = translations[language];

  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeInvoiceForPayment, setActiveInvoiceForPayment] = useState<Invoice | null>(null);
  const [activeInvoiceForView, setActiveInvoiceForView] = useState<Invoice | null>(null);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('om');

  // New Invoice Form state
  const [docType, setDocType] = useState<InvoiceType>('invoice');
  const [docCustomerId, setDocCustomerId] = useState<string>(customers[0]?.id || '');
  const [docDueDate, setDocDueDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [docTaxRate, setDocTaxRate] = useState<number>(19.25);
  const [docDiscount, setDocDiscount] = useState<number>(0);
  const [docItems, setDocItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: products[0]?.name || 'Article Commercial',
      quantity: 5,
      unitPrice: products[0]?.sellingPrice || 10000,
      taxRate: 0,
      discount: 0,
      total: 5 * (products[0]?.sellingPrice || 10000),
    },
  ]);
  const [docNotes, setDocNotes] = useState<string>('');

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesBranch = selectedBranchId === 'all' || inv.branchId === selectedBranchId;
    const matchesType = selectedType === 'all' || inv.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus;
    const matchesQuery =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesType && matchesStatus && matchesQuery;
  });

  // Calculate New Invoice Totals
  const rawSubtotal = docItems.reduce((sum, item) => sum + item.total, 0);
  const netBeforeTax = Math.max(0, rawSubtotal - docDiscount);
  const taxAmount = docTaxRate > 0 ? Math.round((netBeforeTax * docTaxRate) / 100) : 0;
  const grandTotal = netBeforeTax + taxAmount;

  const handleAddItem = (presetProductId?: string) => {
    const prod = presetProductId ? products.find(p => p.id === presetProductId) : null;
    setDocItems(prev => [
      ...prev,
      {
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productId: prod?.id,
        description: prod ? prod.name : '',
        quantity: 1,
        unitPrice: prod ? prod.sellingPrice : 0,
        taxRate: 0,
        discount: 0,
        total: prod ? prod.sellingPrice : 0,
      },
    ]);
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setDocItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          updated.total = updated.quantity * updated.unitPrice;
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (docItems.length <= 1) return;
    setDocItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === docCustomerId);
    if (!cust) return;

    createInvoice({
      type: docType,
      date: new Date().toISOString().split('T')[0],
      dueDate: docDueDate,
      branchId: selectedBranchId === 'all' ? 'branch-dla' : selectedBranchId,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerEmail: cust.email,
      customerAddress: cust.address,
      items: docItems,
      subtotal: rawSubtotal,
      taxRate: docTaxRate,
      taxAmount,
      discountAmount: docDiscount,
      grandTotal,
      paidAmount: 0,
      balanceDue: grandTotal,
      status: 'sent',
      paymentTerms: 'Règlement à réception par MTN MoMo, Orange Money ou virement Afriland First Bank.',
      notes: docNotes,
    });

    setIsCreateModalOpen(false);
  };

  const handleRecordPaymentSubmit = () => {
    if (!activeInvoiceForPayment || paymentAmount <= 0) return;
    recordInvoicePayment(activeInvoiceForPayment.id, paymentAmount, paymentMethod);
    setIsPaymentModalOpen(false);
    setActiveInvoiceForPayment(null);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle className="h-3 w-3" />
            {t.paid}
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Clock className="h-3 w-3" />
            {t.partiallyPaid}
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
            <AlertCircle className="h-3 w-3" />
            {t.overdue}
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            <Send className="h-3 w-3" />
            {t.sent}
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.invoiceTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'fr'
              ? 'Devis, factures proforma, factures définitives et bordereaux légaux (OHADA)'
              : 'Quotations, proforma invoices, official tax invoices and credit notes'}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>{t.createDoc}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher facture, client...' : 'Search invoice, client...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">{language === 'fr' ? 'Tous les types' : 'All Types'}</option>
            <option value="invoice">{t.invoice}</option>
            <option value="quote">{t.quote}</option>
            <option value="proforma">{t.proforma}</option>
            <option value="delivery_note">{t.deliveryNote}</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">{language === 'fr' ? 'Tous les statuts' : 'All Statuses'}</option>
            <option value="paid">{t.paid}</option>
            <option value="partially_paid">{t.partiallyPaid}</option>
            <option value="overdue">{t.overdue}</option>
            <option value="sent">{t.sent}</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {filteredInvoices.length} {language === 'fr' ? 'documents trouvés' : 'documents found'}
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <th className="px-4 py-3">{t.invoiceNumber}</th>
                <th className="px-4 py-3">{t.client}</th>
                <th className="px-4 py-3">{t.issueDate}</th>
                <th className="px-4 py-3">{t.dueDate}</th>
                <th className="px-4 py-3">{t.amount}</th>
                <th className="px-4 py-3">{t.balance}</th>
                <th className="px-4 py-3">{t.status}</th>
                <th className="px-4 py-3 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    {language === 'fr' ? 'Aucune pièce commerciale trouvée.' : 'No invoices or quotes found.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {inv.invoiceNumber}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {inv.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {inv.customerName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">{inv.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(inv.date, language)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(inv.dueDate, language)}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                      {formatFCFA(inv.grandTotal, language)}
                    </td>
                    <td className="px-4 py-3">
                      {inv.balanceDue > 0 ? (
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {formatFCFA(inv.balanceDue, language)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">0 FCFA</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => {
                              setActiveInvoiceForPayment(inv);
                              setPaymentAmount(inv.balanceDue);
                              setIsPaymentModalOpen(true);
                            }}
                            className="rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300"
                            title="Record Payment"
                          >
                            <DollarSign className="inline-block h-3 w-3 mr-0.5" />
                            {language === 'fr' ? 'Règlement' : 'Pay'}
                          </button>
                        )}
                        <button
                          onClick={() => setActiveInvoiceForView(inv)}
                          className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                          title="View Official Invoice / Print"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Document Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.createDoc} • {organization.name}
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Type, Customer, Due Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Type de Pièce' : 'Doc Type'}</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value as InvoiceType)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="invoice">{t.invoice}</option>
                    <option value="quote">{t.quote}</option>
                    <option value="proforma">{t.proforma}</option>
                    <option value="delivery_note">{t.deliveryNote}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.client}</label>
                  <select
                    value={docCustomerId}
                    onChange={e => setDocCustomerId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.dueDate}</label>
                  <input
                    type="date"
                    value={docDueDate}
                    onChange={e => setDocDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold uppercase tracking-wider text-slate-500">{language === 'fr' ? 'Lignes de Facturation' : 'Line Items'}</span>
                  <div className="flex items-center gap-2">
                    <select
                      onChange={e => {
                        if (e.target.value) {
                          handleAddItem(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="rounded-lg border border-teal-200 bg-teal-50/50 px-2.5 py-1 text-xs font-semibold text-teal-800 outline-none hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300"
                    >
                      <option value="" disabled>+ {language === 'fr' ? 'Sélectionner un produit du stock...' : 'Select product from stock...'}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatFCFA(p.sellingPrice, language)})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAddItem()}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      + {language === 'fr' ? 'Ligne personnalisée' : 'Custom Line'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {docItems.map((item, idx) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
                      {/* Product quick dropdown / description */}
                      <div className="flex-1 flex items-center gap-1.5">
                        <select
                          value={item.productId || ''}
                          onChange={e => {
                            const selectedId = e.target.value;
                            if (selectedId) {
                              const prod = products.find(p => p.id === selectedId);
                              if (prod) {
                                handleUpdateItem(item.id, {
                                  productId: prod.id,
                                  description: prod.name,
                                  unitPrice: prod.sellingPrice,
                                });
                              }
                            }
                          }}
                          className="w-32 sm:w-40 rounded-lg border border-slate-200 bg-white p-1.5 text-[11px] font-medium outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="">{language === 'fr' ? '(Article personnalisé)' : '(Custom Item)'}</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder={language === 'fr' ? 'Description de la prestation / article...' : 'Description...'}
                          value={item.description}
                          onChange={e => handleUpdateItem(item.id, { description: e.target.value })}
                          className="flex-1 rounded-lg border border-slate-200 bg-white p-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="flex items-center gap-2 justify-between sm:justify-end">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">Qté:</span>
                          <input
                            type="number"
                            min="1"
                            placeholder="Qté"
                            value={item.quantity}
                            onChange={e => handleUpdateItem(item.id, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                            className="w-14 rounded-lg border border-slate-200 bg-white p-1.5 text-right text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">P.U:</span>
                          <input
                            type="number"
                            placeholder="Prix Unit"
                            value={item.unitPrice}
                            onChange={e => handleUpdateItem(item.id, { unitPrice: Number(e.target.value) })}
                            className="w-24 rounded-lg border border-slate-200 bg-white p-1.5 text-right text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <span className="w-24 text-right font-bold text-slate-800 dark:text-slate-100">
                          {formatFCFA(item.total, language)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-red-400 hover:text-red-600 transition"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Discount & Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 border-t border-slate-100 pt-2 text-right dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.subtotal}:</span>
                    <span className="font-semibold">{formatFCFA(rawSubtotal, language)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">TVA (%):</span>
                    <input
                      type="number"
                      value={docTaxRate}
                      onChange={e => setDocTaxRate(Number(e.target.value))}
                      className="w-16 rounded border border-slate-200 p-1 text-right text-xs dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-teal-600 dark:text-teal-400 border-t border-slate-200 pt-1">
                    <span>{t.grandTotal}:</span>
                    <span>{formatFCFA(grandTotal, language)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-600 py-2 font-bold text-white shadow-md hover:bg-teal-700"
                >
                  {language === 'fr' ? 'Émettre le Document' : 'Issue Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && activeInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'fr' ? 'Encaisser un Règlement' : 'Record Invoice Settlement'}
            </h3>
            <p className="text-slate-500 mt-1">
              {activeInvoiceForPayment.invoiceNumber} • {activeInvoiceForPayment.customerName}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'fr' ? 'Montant Encaissé (FCFA)' : 'Amount (FCFA)'}
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{t.paymentMethod}</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  <option value="om">Orange Money Marchand (699 33 21 55)</option>
                  <option value="momo">MTN Mobile Money (677 82 14 00)</option>
                  <option value="cash">Espèces (Caisse Centrale)</option>
                  <option value="bank">Virement Bancaire (Afriland First Bank)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleRecordPaymentSubmit}
                  className="flex-1 rounded-xl bg-teal-600 py-2 font-bold text-white shadow-md hover:bg-teal-700"
                >
                  {language === 'fr' ? 'Valider Encaiss.' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Invoice Preview Receipt Modal */}
      {activeInvoiceForView && (
        <ReceiptModal
          isOpen={!!activeInvoiceForView}
          onClose={() => setActiveInvoiceForView(null)}
          invoice={activeInvoiceForView}
        />
      )}
    </div>
  );
};
