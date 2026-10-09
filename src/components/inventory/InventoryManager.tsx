import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowRightLeft,
  SlidersHorizontal,
  Barcode,
  Layers,
  Building,
  CheckCircle,
  X,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA, formatDate } from '../../utils/formatters';
import { Product } from '../../types';

export const InventoryManager: React.FC = () => {
  const {
    products,
    categories,
    suppliers,
    branches,
    selectedBranchId,
    adjustStock,
    transferStock,
    addProduct,
    updateProduct,
    language,
    addNotification,
  } = useApp();

  const t = translations[language];

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Adjust Form
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Inventaire de contrôle');

  // Transfer Form
  const [transferFromBranch, setTransferFromBranch] = useState<string>('branch-dla');
  const [transferToBranch, setTransferToBranch] = useState<string>('branch-yde');
  const [transferQty, setTransferQty] = useState<number>(5);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdCat, setNewProdCat] = useState('cat-food');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCost, setNewProdCost] = useState(10000);
  const [newProdSell, setNewProdSell] = useState(13000);
  const [newProdWholesale, setNewProdWholesale] = useState(12000);
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdMin, setNewProdMin] = useState(10);
  const [newProdUnit, setNewProdUnit] = useState('Carton');
  const [newProdWarehouse, setNewProdWarehouse] = useState('Dépôt Central Akwa');

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesAlert = !filterAlertOnly || p.stockQuantity <= p.minStock;
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesAlert && matchesQuery;
  });

  const totalValuation = products.reduce((acc, p) => acc + p.costPrice * p.stockQuantity, 0);
  const lowStockCount = products.filter(p => p.stockQuantity <= p.minStock).length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const sku = newProdSku || `ART-${Date.now().toString().slice(-4)}`;
    const barcode = newProdBarcode || `600${Math.floor(100000000 + Math.random() * 900000000)}`;

    addProduct({
      name: newProdName,
      sku,
      barcode,
      category: newProdCat,
      brand: newProdBrand || 'Générique',
      costPrice: newProdCost,
      sellingPrice: newProdSell,
      wholesalePrice: newProdWholesale,
      stockQuantity: newProdStock,
      minStock: newProdMin,
      maxStock: newProdStock * 5,
      unit: newProdUnit,
      warehouse: newProdWarehouse,
      branchStocks: {
        'branch-dla': Math.round(newProdStock * 0.7),
        'branch-yde': Math.round(newProdStock * 0.3),
      },
    });

    setIsAddModalOpen(false);
    setNewProdName('');
  };

  const handleAdjustSubmit = () => {
    if (!selectedProduct) return;
    const branchId = selectedBranchId === 'all' ? 'branch-dla' : selectedBranchId;
    adjustStock(selectedProduct.id, branchId, adjustQty, adjustReason);
    addNotification({
      title: language === 'fr' ? 'Stock ajusté' : 'Stock adjusted',
      message: language === 'fr'
        ? `Le stock de ${selectedProduct.name} a été ajusté à ${adjustQty}.`
        : `Stock for ${selectedProduct.name} updated to ${adjustQty}.`,
      type: 'info',
    });
    setIsAdjustModalOpen(false);
    setSelectedProduct(null);
  };

  const handleTransferSubmit = () => {
    if (!selectedProduct) return;
    const success = transferStock(selectedProduct.id, transferFromBranch, transferToBranch, transferQty);
    if (!success) {
      addNotification({
        title: language === 'fr' ? 'Transfert impossible' : 'Transfer failed',
        message: language === 'fr'
          ? 'Quantité insuffisante dans l’agence de départ !'
          : 'Insufficient stock in source branch!',
        type: 'error',
      });
      return;
    }
    addNotification({
      title: language === 'fr' ? 'Transfert réussi' : 'Transfer successful',
      message: language === 'fr'
        ? `${transferQty} ${selectedProduct.unit} de ${selectedProduct.name} transférés avec succès.`
        : `Successfully transferred ${transferQty} ${selectedProduct.unit} of ${selectedProduct.name}.`,
      type: 'success',
    });
    setIsTransferModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.inventoryTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'fr'
              ? 'Valorisation, gestion multi-dépôts (Douala / Yaoundé) et seuils d’alerte'
              : 'Valuation, multi-warehouse stock tracking, and reorder levels'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>{t.addProduct}</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">{t.totalItems}</span>
          <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{products.length} SKUs</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{language === 'fr' ? 'Distribués sur 4 agences' : 'Across 4 branches'}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">{t.inventoryValue}</span>
          <p className="mt-1 text-xl font-black text-teal-600 dark:text-teal-400">
            {formatFCFA(totalValuation, language)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{language === 'fr' ? 'Au coût de revient HT' : 'At purchase cost'}</p>
        </div>

        <div
          onClick={() => setFilterAlertOnly(!filterAlertOnly)}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            filterAlertOnly
              ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.lowStockAlerts}</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1 text-xl font-black text-amber-600 dark:text-amber-400">
            {lowStockCount} {language === 'fr' ? 'articles critiques' : 'critical items'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {filterAlertOnly ? (language === 'fr' ? 'Filtre actif (Cliquez pour désactiver)' : 'Filtered active') : (language === 'fr' ? 'Cliquez pour filtrer' : 'Click to filter')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher article, SKU, code-barres...' : 'Search product, SKU, barcode...'}
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
            <option value="all">{t.allCategories}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {language === 'fr' ? c.nameFr : c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {filteredProducts.length} {language === 'fr' ? 'articles affichés' : 'products'}
        </div>
      </div>

      {/* Product Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <th className="px-4 py-3">{language === 'fr' ? 'Désignation & SKU' : 'Product & SKU'}</th>
                <th className="px-4 py-3">{language === 'fr' ? 'Code-barres' : 'Barcode'}</th>
                <th className="px-4 py-3">{t.costPrice}</th>
                <th className="px-4 py-3">{t.sellingPrice}</th>
                <th className="px-4 py-3">{t.margin}</th>
                <th className="px-4 py-3">{t.availableStock}</th>
                <th className="px-4 py-3">{t.warehouse}</th>
                <th className="px-4 py-3 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map(prod => {
                const margin = prod.sellingPrice - prod.costPrice;
                const marginPct = Math.round((margin / prod.sellingPrice) * 100);
                const isLow = prod.stockQuantity <= prod.minStock;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 dark:text-white">{prod.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>SKU: {prod.sku}</span>
                        <span>•</span>
                        <span>{prod.brand}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {prod.barcode}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {formatFCFA(prod.costPrice, language)}
                    </td>
                    <td className="px-4 py-3 font-bold text-teal-700 dark:text-teal-400">
                      {formatFCFA(prod.sellingPrice, language)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-600">
                        {formatFCFA(margin, language)} ({marginPct}%)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isLow
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {isLow && <AlertTriangle className="h-3 w-3" />}
                        {prod.stockQuantity} {prod.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {prod.warehouse}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedProduct(prod);
                            setAdjustQty(prod.stockQuantity);
                            setIsAdjustModalOpen(true);
                          }}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                        >
                          {language === 'fr' ? 'Ajuster' : 'Adjust'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(prod);
                            setIsTransferModalOpen(true);
                          }}
                          className="rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300"
                          title="Transfer between branches"
                        >
                          <ArrowRightLeft className="inline-block h-3 w-3 mr-0.5" />
                          {language === 'fr' ? 'Transférer' : 'Transfer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.addProduct}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Nom du Produit / Article' : 'Product Name'}</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Riz Parfumé Dinor 25kg"
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Catégorie</label>
                  <select
                    value={newProdCat}
                    onChange={e => setNewProdCat(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {language === 'fr' ? c.nameFr : c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Marque' : 'Brand'}</label>
                  <input
                    type="text"
                    placeholder="Ex: SOSUCAM, Mayor, Dinor..."
                    value={newProdBrand}
                    onChange={e => setNewProdBrand(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.costPrice} (FCFA)</label>
                  <input
                    type="number"
                    value={newProdCost}
                    onChange={e => setNewProdCost(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.sellingPrice} (FCFA)</label>
                  <input
                    type="number"
                    value={newProdSell}
                    onChange={e => setNewProdSell(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Prix Grossiste</label>
                  <input
                    type="number"
                    value={newProdWholesale}
                    onChange={e => setNewProdWholesale(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Stock Initial' : 'Initial Qty'}</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={e => setNewProdStock(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Seuil Min Alerte' : 'Min Alert'}</label>
                  <input
                    type="number"
                    value={newProdMin}
                    onChange={e => setNewProdMin(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Conditionnement' : 'Unit'}</label>
                  <input
                    type="text"
                    value={newProdUnit}
                    onChange={e => setNewProdUnit(e.target.value)}
                    placeholder="Sac 50kg, Carton..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
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

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.adjustStock}</h3>
            <p className="text-slate-500 mt-0.5">{selectedProduct.name}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Nouvelle Quantité en Stock' : 'New Quantity'}</label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={e => setAdjustQty(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Motif de l’Ajustement' : 'Reason'}</label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Inventaire périodique de contrôle">Inventaire périodique de contrôle</option>
                  <option value="Arrivage livraison fournisseur">Arrivage livraison fournisseur</option>
                  <option value="Marchandise avariée / cassée">Marchandise avariée / cassée</option>
                  <option value="Perte ou vol constaté">Perte ou vol constaté</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleAdjustSubmit}
                  className="flex-1 rounded-xl bg-teal-600 py-2 font-bold text-white shadow-md hover:bg-teal-700"
                >
                  {t.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Stock Modal */}
      {isTransferModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.transferStock}</h3>
            <p className="text-slate-500 mt-0.5">{selectedProduct.name}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Agence Source (Départ)' : 'Source Branch'}</label>
                <select
                  value={transferFromBranch}
                  onChange={e => setTransferFromBranch(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Agence Destination (Arrivée)' : 'Destination Branch'}</label>
                <select
                  value={transferToBranch}
                  onChange={e => setTransferToBranch(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  {branches.filter(b => b.id !== transferFromBranch).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Quantité à Transférer' : 'Transfer Qty'}</label>
                <input
                  type="number"
                  value={transferQty}
                  onChange={e => setTransferQty(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleTransferSubmit}
                  className="flex-1 rounded-xl bg-teal-600 py-2 font-bold text-white shadow-md hover:bg-teal-700"
                >
                  {language === 'fr' ? 'Transférer' : 'Transfer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
