import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  CreditCard,
  AlertCircle,
  Package,
  Users,
  Building,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Plus,
  Receipt,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wallet,
  Smartphone,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA, formatDate, formatDateTime } from '../../utils/formatters';
import { ReceiptModal } from '../common/ReceiptModal';
import { Sale } from '../../types';

export const Dashboard: React.FC = () => {
  const {
    organization,
    branches,
    selectedBranchId,
    sales,
    invoices,
    expenses,
    products,
    customers,
    suppliers,
    accounts,
    setActiveTab,
    language,
  } = useApp();

  const t = translations[language];
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  // Filter sales, expenses, invoices by branch if branch selected
  const branchSales = selectedBranchId === 'all' ? sales : sales.filter(s => s.branchId === selectedBranchId);
  const branchExpenses = selectedBranchId === 'all' ? expenses : expenses.filter(e => e.branchId === selectedBranchId);
  const branchInvoices = selectedBranchId === 'all' ? invoices : invoices.filter(i => i.branchId === selectedBranchId);

  // Financial Calculations
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaysSalesTotal = branchSales
    .filter(s => s.date.startsWith(todayDateStr))
    .reduce((sum, s) => sum + s.grandTotal, 0);

  const thisMonthSalesTotal = branchSales.reduce((sum, s) => sum + s.grandTotal, 0);

  const todaysExpensesTotal = branchExpenses
    .filter(e => e.date.startsWith(todayDateStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const thisMonthExpensesTotal = branchExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalCostOfGoodsSold = branchSales.reduce((sum, s) => {
    const saleCost = s.items.reduce((iSum, item) => iSum + (item.costPrice * item.quantity), 0);
    return sum + saleCost;
  }, 0);

  const netProfit = thisMonthSalesTotal - totalCostOfGoodsSold - thisMonthExpensesTotal;

  // Receivables & Payables
  const totalReceivables = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const totalPayables = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

  // Inventory Valuation
  const totalInventoryValue = products.reduce((sum, p) => {
    const qty = selectedBranchId === 'all' ? p.stockQuantity : (p.branchStocks?.[selectedBranchId] ?? p.stockQuantity);
    return sum + (p.costPrice * qty);
  }, 0);

  // Payment Breakdown
  const paymentMethodSums = branchSales.reduce(
    (acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.grandTotal;
      return acc;
    },
    {} as Record<string, number>
  );

  // Top Products
  const productSalesCount = branchSales.reduce((acc, s) => {
    s.items.forEach(item => {
      acc[item.productName] = (acc[item.productName] || 0) + (item.quantity * item.unitPrice);
    });
    return acc;
  }, {} as Record<string, number>);

  const topProductsList = Object.entries(productSalesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Low Stock Items
  const lowStockItems = products.filter(p => p.stockQuantity <= p.minStock);
  const overdueInvoices = branchInvoices.filter(i => i.status === 'overdue');

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* AI Business Insight Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 p-5 text-white shadow-lg dark:border-teal-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                {t.aiInsightTitle}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {language === 'fr'
                ? `Les ventes du mois s'élèvent à ${formatFCFA(thisMonthSalesTotal, 'fr')}. Le Riz Dinor 50kg et le Sucre SOSUCAM mènent la croissance avec un taux de rotation élevé. Attention : ${lowStockItems.length} article(s) approchent du seuil critique de réapprovisionnement et ${formatFCFA(totalReceivables, 'fr')} de créances restent à recouvrer.`
                : `Total monthly sales reached ${formatFCFA(thisMonthSalesTotal, 'en')}. Dinor Rice 50kg and SOSUCAM Sugar lead margin contributions. Note: ${lowStockItems.length} product(s) require replenishment and ${formatFCFA(totalReceivables, 'en')} in client receivables require collection.`}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => setActiveTab('ai')}
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-teal-400 transition"
            >
              <span>{language === 'fr' ? 'Consulter Akem AI' : 'Consult Akem AI'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Financial KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Sales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.todaysSales}
            </span>
            <span className="rounded-xl bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <ShoppingBag className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {formatFCFA(todaysSalesTotal, language)}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center font-bold">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                +14.2%
              </span>
              <span className="text-slate-400">
                {language === 'fr' ? 'vs hier' : 'vs yesterday'}
              </span>
            </div>
          </div>
        </div>

        {/* This Month's Sales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.monthSales}
            </span>
            <span className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {formatFCFA(thisMonthSalesTotal, language)}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center font-bold">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                +18.4%
              </span>
              <span className="text-slate-400">
                {language === 'fr' ? 'vs mois dernier' : 'vs last month'}
              </span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.netProfit}
            </span>
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {formatFCFA(netProfit, language)}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center font-bold">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                +21.0%
              </span>
              <span className="text-slate-400">
                {language === 'fr' ? 'Marge nette ~28%' : 'Net margin ~28%'}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Valuation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.inventoryValue}
            </span>
            <span className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {formatFCFA(totalInventoryValue, language)}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {products.length} {language === 'fr' ? 'articles en stock' : 'active SKUs'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPIs: Receivables vs Payables vs Today's Expenses */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Receivables */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
              {t.receivables}
            </span>
            <Users className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-amber-950 dark:text-amber-200">
            {formatFCFA(totalReceivables, language)}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-amber-800 dark:text-amber-400">
            <span>{customers.filter(c => c.currentBalance > 0).length} {language === 'fr' ? 'clients débiteurs' : 'owing clients'}</span>
            <button
              onClick={() => setActiveTab('customers')}
              className="font-bold underline hover:text-amber-950"
            >
              {language === 'fr' ? 'Relancer' : 'Remind'} &rarr;
            </button>
          </div>
        </div>

        {/* Payables */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {t.payables}
            </span>
            <Building className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
            {formatFCFA(totalPayables, language)}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>{suppliers.filter(s => s.outstandingBalance > 0).length} {language === 'fr' ? 'fournisseurs à régler' : 'suppliers due'}</span>
            <button
              onClick={() => setActiveTab('suppliers')}
              className="font-bold text-teal-600 hover:underline dark:text-teal-400"
            >
              {language === 'fr' ? 'Détails' : 'View'} &rarr;
            </button>
          </div>
        </div>

        {/* Today's Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {t.todaysExpenses}
            </span>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
            {formatFCFA(todaysExpensesTotal, language)}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>{branchExpenses.filter(e => e.date.startsWith(todayDateStr)).length} {language === 'fr' ? 'dépenses enregistrées' : 'recorded items'}</span>
            <button
              onClick={() => setActiveTab('expenses')}
              className="font-bold text-teal-600 hover:underline dark:text-teal-400"
            >
              {language === 'fr' ? 'Gérer' : 'Manage'} &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Visual Charts & Breakdown Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend Visual Representation */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t.salesOverTime}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'fr' ? 'Activité des 7 derniers jours' : 'Last 7 days revenue velocity'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400">
                <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                {language === 'fr' ? 'Ventes' : 'Sales'}
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mt-6 flex h-48 items-end gap-3 sm:gap-6 pt-4">
            {[
              { day: '01 Oct', sales: 420000, height: '45%' },
              { day: '02 Oct', sales: 610000, height: '65%' },
              { day: '03 Oct', sales: 540000, height: '55%' },
              { day: '04 Oct', sales: 780000, height: '80%' },
              { day: '05 Oct', sales: 320000, height: '35%' },
              { day: '06 Oct', sales: 890000, height: '90%' },
              { day: 'Aujourd\'hui', sales: todaysSalesTotal, height: '100%', active: true },
            ].map(col => (
              <div key={col.day} className="group relative flex flex-1 flex-col items-center gap-2">
                <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-20">
                  {formatFCFA(col.sales, language)}
                </div>
                <div className="w-full flex-1 flex items-end">
                  <div
                    style={{ height: col.height }}
                    className={`w-full rounded-t-lg transition-all duration-300 group-hover:opacity-90 ${
                      col.active
                        ? 'bg-gradient-to-t from-teal-700 to-teal-500 shadow-md shadow-teal-500/20'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500 truncate max-w-[48px]">
                  {col.day}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Summary Footnote */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
            <span>
              {language === 'fr' ? 'Moyenne quotidienne :' : 'Daily Average :'} <strong>{formatFCFA(thisMonthSalesTotal / 7, language)}</strong>
            </span>
            <span className="text-emerald-600 font-semibold">
              +19% vs Sep 2026
            </span>
          </div>
        </div>

        {/* Payment Methods Distribution (Mobile Money Focus) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.paymentBreakdown}
            </h4>
            <p className="text-xs text-slate-400">
              {language === 'fr' ? 'Encaissements par canal au Cameroun' : 'Collections by channel'}
            </p>
          </div>

          <div className="mt-4 space-y-3.5">
            {[
              {
                method: 'Orange Money (OM)',
                amount: paymentMethodSums['om'] || 315000,
                color: 'bg-orange-500',
                icon: Smartphone,
              },
              {
                method: 'MTN Mobile Money (MoMo)',
                amount: paymentMethodSums['momo'] || 250000,
                color: 'bg-amber-400',
                icon: Smartphone,
              },
              {
                method: 'Espèces (Cash)',
                amount: paymentMethodSums['cash'] || 125000,
                color: 'bg-emerald-500',
                icon: Wallet,
              },
              {
                method: 'Virement Bancaire (Afriland/BICEC)',
                amount: paymentMethodSums['bank'] || 180000,
                color: 'bg-blue-600',
                icon: CreditCard,
              },
            ].map(item => {
              const totalCollections = Math.max(1, Object.values(paymentMethodSums).reduce((a, b) => a + b, 0) || 870000);
              const percentage = Math.round((item.amount / totalCollections) * 100);
              const Icon = item.icon;

              return (
                <div key={item.method} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className={`h-2 w-2 rounded-full ${item.color}`}></span>
                      {item.method}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatFCFA(item.amount, language)} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-1.5 rounded-full ${item.color}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50/50 p-3 text-xs text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-300">
            <p className="font-semibold">{language === 'fr' ? '💡 Recommandation MoMo/OM' : '💡 MoMo/OM Takeaway'}</p>
            <p className="mt-0.5 text-[11px] leading-tight">
              {language === 'fr'
                ? '65% des encaissements sont mobiles. Pensez à faire un nivellement hebdomadaire vers Afriland First Bank pour limiter les frais.'
                : '65% of collections are mobile. Schedule weekly sweep transfers to Afriland First Bank to minimize wallet exposure.'}
            </p>
          </div>
        </div>
      </div>

      {/* Top Products & Smart Alerts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Selling Products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t.topProducts}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'fr' ? 'Articles générant le plus de chiffre d’affaires' : 'Highest revenue generating products'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-bold text-teal-600 hover:underline dark:text-teal-400"
            >
              {language === 'fr' ? 'Inventaire' : 'Inventory'} &rarr;
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {topProductsList.map(([name, amount], index) => (
              <div key={name} className="flex items-center justify-between py-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{name}</p>
                    <p className="text-[11px] text-slate-400">
                      {language === 'fr' ? 'Forte demande marché' : 'High market turnover'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatFCFA(amount, language)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Alerts & Action Items */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t.smartAlerts}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'fr' ? 'Anomalies et échéances prioritaires' : 'Priority anomalies and stock alerts'}
              </p>
            </div>
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-950 dark:text-red-300">
              {lowStockItems.length + overdueInvoices.length} {language === 'fr' ? 'urgents' : 'urgent'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {lowStockItems.slice(0, 2).map(prod => (
              <div
                key={prod.id}
                className="flex items-start justify-between rounded-xl border border-amber-200/70 bg-amber-50/60 p-3 text-xs dark:border-amber-900/50 dark:bg-amber-950/20"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950 dark:text-amber-200">
                      {language === 'fr' ? 'Stock Faible :' : 'Low Stock :'} {prod.name}
                    </p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      {language === 'fr'
                        ? `Restant : ${prod.stockQuantity} ${prod.unit} (Seuil d'alerte : ${prod.minStock})`
                        : `Remaining: ${prod.stockQuantity} ${prod.unit} (Min: ${prod.minStock})`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-amber-700"
                >
                  {language === 'fr' ? 'Commander' : 'Reorder'}
                </button>
              </div>
            ))}

            {overdueInvoices.slice(0, 2).map(inv => (
              <div
                key={inv.id}
                className="flex items-start justify-between rounded-xl border border-red-200/70 bg-red-50/60 p-3 text-xs dark:border-red-900/50 dark:bg-red-950/20"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-950 dark:text-red-200">
                      {language === 'fr' ? 'Facture Échue :' : 'Overdue Invoice :'} {inv.invoiceNumber}
                    </p>
                    <p className="text-[11px] text-red-800 dark:text-red-300">
                      {inv.customerName} • {formatFCFA(inv.balanceDue, language)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-red-700"
                >
                  {language === 'fr' ? 'Relancer' : 'Remind'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.recentTransactions}
            </h4>
            <p className="text-xs text-slate-400">
              {language === 'fr' ? 'Dernières ventes caisse et règlements' : 'Latest POS receipts and sales'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('pos')}
            className="text-xs font-bold text-teal-600 hover:underline dark:text-teal-400"
          >
            {t.viewAll} &rarr;
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider dark:border-slate-800">
                <th className="pb-2.5">{language === 'fr' ? 'N° Vente' : 'Order #'}</th>
                <th className="pb-2.5">{language === 'fr' ? 'Client' : 'Customer'}</th>
                <th className="pb-2.5">{language === 'fr' ? 'Agence' : 'Branch'}</th>
                <th className="pb-2.5">{language === 'fr' ? 'Règlement' : 'Method'}</th>
                <th className="pb-2.5">{language === 'fr' ? 'Montant Total' : 'Total'}</th>
                <th className="pb-2.5">{language === 'fr' ? 'Statut' : 'Status'}</th>
                <th className="pb-2.5 text-right">{language === 'fr' ? 'Ticket' : 'Receipt'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {branchSales.slice(0, 5).map(sale => {
                const branch = branches.find(b => b.id === sale.branchId);
                return (
                  <tr key={sale.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {sale.saleNumber}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{sale.customerName}</p>
                      <p className="text-[10px] text-slate-400">{formatDateTime(sale.date, language)}</p>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {branch ? branch.city : 'Douala'}
                    </td>
                    <td className="py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 font-extrabold text-slate-900 dark:text-white">
                      {formatFCFA(sale.grandTotal, language)}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle className="h-3 w-3" />
                        {language === 'fr' ? 'Payé' : 'Paid'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedSaleForReceipt(sale)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Receipt className="inline-block h-3 w-3 mr-1" />
                        {language === 'fr' ? 'Reçu' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal Trigger */}
      {selectedSaleForReceipt && (
        <ReceiptModal
          isOpen={!!selectedSaleForReceipt}
          onClose={() => setSelectedSaleForReceipt(null)}
          sale={selectedSaleForReceipt}
        />
      )}
    </div>
  );
};
