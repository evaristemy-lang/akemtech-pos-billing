import React, { useState, useEffect } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Smartphone,
  Wallet,
  CreditCard,
  User,
  PauseCircle,
  PlayCircle,
  Percent,
  Receipt,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  Printer,
  Share2,
  Camera,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA } from '../../utils/formatters';
import { Product, CartItem, PaymentMethod, Sale } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';
import { CameraBarcodeScannerModal } from '../common/CameraBarcodeScannerModal';
import { playHardwareBeep } from '../../utils/printerEngine';

export const PosTerminal: React.FC = () => {
  const {
    products,
    categories,
    customers,
    currentUser,
    selectedBranchId,
    currentShift,
    openShift,
    closeShift,
    createSale,
    organization,
    language,
    printerConfig,
    setIsPrinterModalOpen,
    printJob,
    kickCashDrawer,
    addNotification,
  } = useApp();

  const t = translations[language];

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);
  const [applyTax, setApplyTax] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [suspendedSales, setSuspendedSales] = useState<{ id: string; name: string; cart: CartItem[]; customerId: string }[]>([]);

  // Shift Management State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [shiftOpeningFloat, setShiftOpeningFloat] = useState<number>(50000);
  const [shiftActualCash, setShiftActualCash] = useState<number>(0);
  const [shiftCloseNotes, setShiftCloseNotes] = useState<string>('');

  // Completed Sale Receipt Modal
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  // Barcode quick input modal/state & camera scanner state
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState<boolean>(false);

  // Global Hardware Barcode Laser Gun Detection (rapid character keystrokes ending in Enter)
  useEffect(() => {
    let keyBuffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        return;
      }

      const now = Date.now();
      const interval = now - lastKeyTime;
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (keyBuffer.length >= 2 && interval < 120) {
          e.preventDefault();
          const scanned = keyBuffer.trim().toLowerCase();
          const matched = products.find(
            p => p.barcode.toLowerCase() === scanned || p.sku.toLowerCase() === scanned
          );
          if (matched) {
            playHardwareBeep('scan');
            addToCart(matched);
          } else {
            playHardwareBeep('error');
          }
        }
        keyBuffer = '';
      } else if (e.key.length === 1) {
        if (interval < 80 || keyBuffer.length === 0) {
          keyBuffer += e.key;
        } else {
          keyBuffer = e.key;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [products]);

  // Filter products by branch, category and query
  const filteredProducts = products.filter(prod => {
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      (prod.name || '').toLowerCase().includes(q) ||
      (prod.sku || '').toLowerCase().includes(q) ||
      (prod.barcode || '').toLowerCase().includes(q) ||
      (prod.brand || '').toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  // Cart Operations
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.sellingPrice, discount: 0, total: product.sellingPrice }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty, total: newQty * item.unitPrice } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomerId('');
    setOverallDiscountPercent(0);
    setAmountTendered(0);
  };

  // Barcode / SKU Scan or Lookup
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;
    const clean = query.toLowerCase();
    const found = products.find(
      p =>
        (p.barcode || '').toLowerCase() === clean ||
        (p.sku || '').toLowerCase() === clean ||
        (p.name || '').toLowerCase().includes(clean)
    );
    if (found) {
      playHardwareBeep('scan');
      addToCart(found);
      setBarcodeInput('');
    } else {
      playHardwareBeep('error');
      addNotification({
        title: language === 'fr' ? 'Article introuvable' : 'Item not found',
        message: language === 'fr'
          ? `Aucun produit correspondant au code ou nom "${query}".`
          : `No product matched code or name "${query}".`,
        type: 'error',
      });
    }
  };

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = Math.round((rawSubtotal * overallDiscountPercent) / 100);
  const afterDiscount = Math.max(0, rawSubtotal - discountAmount);
  const taxAmount = applyTax ? Math.round(afterDiscount * 0.1925) : 0; // Cameroon TVA 19.25%
  const grandTotal = afterDiscount + taxAmount;
  const changeDue = Math.max(0, amountTendered - grandTotal);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Park / Suspend Sale
  const handleSuspendSale = () => {
    if (cart.length === 0) return;
    const newSuspended = {
      id: 'park-' + Date.now(),
      name: selectedCustomer ? selectedCustomer.name : `Panier ${suspendedSales.length + 1}`,
      cart,
      customerId: selectedCustomerId,
    };
    setSuspendedSales(prev => [...prev, newSuspended]);
    clearCart();
  };

  const handleResumeSale = (id: string) => {
    const item = suspendedSales.find(s => s.id === id);
    if (!item) return;
    setCart(item.cart);
    setSelectedCustomerId(item.customerId);
    setSuspendedSales(prev => prev.filter(s => s.id !== id));
  };

  // Process Checkout
  const handleConfirmPayment = () => {
    if (cart.length === 0) return;

    const branchId = selectedBranchId === 'all' ? 'branch-dla' : selectedBranchId;
    const paidAmount = paymentMethod === 'credit' ? 0 : paymentMethod === 'cash' ? Math.min(amountTendered || grandTotal, grandTotal) : grandTotal;
    const paymentStatus = paymentMethod === 'credit' ? 'pending' : 'paid';

    const newSale = createSale({
      branchId,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? selectedCustomer.name : (language === 'fr' ? 'Client Comptant' : 'Walk-in Customer'),
      customerPhone: selectedCustomer?.phone,
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        costPrice: i.product.costPrice,
        total: i.total,
      })),
      subtotal: rawSubtotal,
      taxAmount,
      discountAmount,
      grandTotal,
      paymentMethod,
      paymentStatus,
      paidAmount,
      changeAmount: paymentMethod === 'cash' ? changeDue : 0,
      notes,
    });

    // POS Hardware Automations on Sale Finalization
    if (paymentMethod === 'cash') {
      playHardwareBeep('cash');
      if (printerConfig.kickCashDrawer) {
        kickCashDrawer();
      }
    } else {
      playHardwareBeep('scan');
    }

    if (printerConfig.autoPrintOnCheckout) {
      printJob({ sale: newSale });
    }

    setIsCheckoutModalOpen(false);
    clearCart();
    setLastCompletedSale(newSale);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Left Column: Product Catalog & Search (60%) */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5 border-r border-slate-200 dark:border-slate-800">
        {/* Top Controls: Search & Barcode & Camera Scanner & Shift & Hardware Printer Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchProducts}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && filteredProducts.length > 0) {
                    e.preventDefault();
                    playHardwareBeep('beep');
                    addToCart(filteredProducts[0]);
                    setSearchQuery('');
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Quick Barcode Scanner Input */}
            <form onSubmit={handleBarcodeSubmit} className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Barcode..."
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-teal-500 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 text-slate-400 hover:text-teal-600"
                title="Scan barcode gun"
              >
                <Barcode className="h-4 w-4" />
              </button>
            </form>

            {/* Optical Camera Barcode / QR Scanner Button (Phone & PC) */}
            <button
              type="button"
              onClick={() => setIsCameraScannerOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-slate-800 transition dark:bg-teal-600 dark:hover:bg-teal-700 shrink-0"
              title="Scanner un code avec la caméra du téléphone ou webcam"
            >
              <Camera className="h-3.5 w-3.5 text-teal-300 dark:text-white" />
              <span className="hidden md:inline">Scanner Caméra</span>
            </button>
          </div>

          {/* Cashier Shift Status Pill & Auto-Detected Printer Hardware Badge */}
          <div className="flex items-center gap-2">
            {/* Auto-Identified Printer Status Badge */}
            <button
              type="button"
              onClick={() => setIsPrinterModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/90 px-3 py-1.5 text-xs font-bold text-teal-900 shadow-xs hover:bg-teal-100 transition dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-200"
              title="Gérer les imprimantes (Bluetooth, USB, Réseau, Série, Système)"
            >
              <Printer className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden xl:inline font-mono text-[11px]">
                {printerConfig.mode.toUpperCase()} ({printerConfig.paperWidth})
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              onClick={() => setIsShiftModalOpen(true)}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs transition ${
                currentShift?.status === 'open'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
              }`}
            >
              {currentShift?.status === 'open' ? (
                <>
                  <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{language === 'fr' ? 'Caisse Ouverte' : 'Shift Active'}</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-red-600" />
                  <span>{language === 'fr' ? 'Ouvrir Caisse' : 'Open Shift'}</span>
                </>
              )}
            </button>

            {suspendedSales.length > 0 && (
              <div className="relative">
                <span className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                  <PauseCircle className="h-3.5 w-3.5" />
                  <span>{suspendedSales.length} {language === 'fr' ? 'en attente' : 'parked'}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-teal-600'
                : 'bg-white text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {t.allCategories}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-teal-600'
                  : 'bg-white text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {language === 'fr' ? cat.nameFr : cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl dark:border-slate-800">
              <Search className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {language === 'fr' ? 'Aucun produit correspondant' : 'No matching products found'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {language === 'fr'
                  ? 'Vérifiez l’orthographe ou essayez une autre catégorie.'
                  : 'Check spelling or try selecting another category.'}
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-3 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition"
                >
                  {language === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map(product => {
                const branchStock =
                  selectedBranchId !== 'all' && product.branchStocks && product.branchStocks[selectedBranchId] !== undefined
                    ? product.branchStocks[selectedBranchId]
                    : product.stockQuantity;
                const inStock = branchStock > 0;
                const isLow = inStock && branchStock <= product.minStock;

                const handleSelectProduct = () => {
                  playHardwareBeep('beep');
                  addToCart(product);
                  if (!inStock) {
                    addNotification({
                      title: language === 'fr' ? 'Stock théorique à 0' : 'Zero theoretical stock',
                      message: language === 'fr'
                        ? `${product.name} ajouté au panier (stock physique à vérifier).`
                        : `${product.name} added to cart (check physical stock).`,
                      type: 'warning',
                    });
                  }
                };

                return (
                  <div
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    onClick={handleSelectProduct}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectProduct();
                      }
                    }}
                    className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition active:scale-[0.98] cursor-pointer select-none ${
                      inStock
                        ? 'border-slate-200 bg-white hover:border-teal-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-400'
                        : 'border-amber-200 bg-amber-50/30 hover:border-amber-400 hover:shadow-md dark:border-amber-900/40 dark:bg-slate-900/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span>{product.sku}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 font-bold ${
                            !inStock
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : isLow
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {branchStock} {product.unit.split(' ')[0]}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{product.brand}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-extrabold text-teal-700 dark:text-teal-400">
                          {formatFCFA(product.sellingPrice, language)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleSelectProduct();
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700 transition hover:bg-teal-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-teal-600"
                        title={language === 'fr' ? 'Ajouter au panier' : 'Add to cart'}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Active Cart & Fast Checkout Panel (40%) */}
      <div className="w-full lg:w-[420px] flex flex-col bg-white border-t lg:border-t-0 border-slate-200 shadow-xl dark:bg-slate-900 dark:border-slate-800">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.cart} ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <>
                <button
                  onClick={handleSuspendSale}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Park sale"
                >
                  <PauseCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={clearCart}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  title="Clear cart"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Customer Selector */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 dark:bg-slate-950/60 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">{t.walkInCustomer}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.currentBalance > 0 ? `(Dette: ${formatFCFA(c.currentBalance, language)})` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && selectedCustomer.currentBalance > 0 && (
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              <span>
                {language === 'fr' ? 'Client avec solde débiteur :' : 'Owing client balance :'} {formatFCFA(selectedCustomer.currentBalance, language)}
              </span>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-400">
              <Receipt className="h-10 w-10 stroke-[1.5] mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-medium max-w-[220px]">
                {t.emptyCart}
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.product.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex-1 pr-2">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {item.product.name}
                  </h5>
                  <p className="text-[11px] font-mono text-slate-500">
                    {formatFCFA(item.unitPrice, language)} / {item.product.unit.split(' ')[0]}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="w-24 text-right pl-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatFCFA(item.total, language)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals & Fast Actions */}
        <div className="border-t border-slate-200 bg-slate-50/80 p-4 space-y-2 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>{t.subtotal}</span>
            <span className="font-semibold">{formatFCFA(rawSubtotal, language)}</span>
          </div>

          {/* Quick Discount Controls */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">{t.discount}</span>
            <div className="flex items-center gap-1">
              {[0, 2, 5, 10].map(pct => (
                <button
                  key={pct}
                  onClick={() => setOverallDiscountPercent(pct)}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    overallDiscountPercent === pct
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {pct}%
                </button>
              ))}
              {discountAmount > 0 && (
                <span className="font-semibold text-emerald-600 ml-1">
                  -{formatFCFA(discountAmount, language)}
                </span>
              )}
            </div>
          </div>

          {/* Tax Toggle */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={applyTax}
                onChange={e => setApplyTax(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>{t.tax}</span>
            </label>
            <span className="font-semibold">{formatFCFA(taxAmount, language)}</span>
          </div>

          {/* Grand Total */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-slate-900 dark:border-slate-800 dark:text-white">
            <span className="text-sm font-extrabold">{t.grandTotal}</span>
            <span className="text-xl font-black text-teal-600 dark:text-teal-400">
              {formatFCFA(grandTotal, language)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            disabled={cart.length === 0}
            onClick={() => {
              setAmountTendered(grandTotal);
              setIsCheckoutModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-extrabold text-white shadow-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <CreditCard className="h-4 w-4" />
            <span>
              {t.payButton} • {formatFCFA(grandTotal, language)}
            </span>
          </button>
        </div>
      </div>

      {/* Checkout Payment Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.posTitle} • {formatFCFA(grandTotal, language)}
              </h3>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-4">
              <label className="text-xs font-bold uppercase text-slate-500">{t.paymentMethod}</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { id: 'cash', label: t.cash, icon: Wallet, color: 'hover:border-emerald-500' },
                  { id: 'momo', label: t.momo, icon: Smartphone, color: 'hover:border-amber-500' },
                  { id: 'om', label: t.om, icon: Smartphone, color: 'hover:border-orange-500' },
                  { id: 'bank', label: t.bank, icon: CreditCard, color: 'hover:border-blue-500' },
                  { id: 'credit', label: t.credit, icon: User, color: 'hover:border-purple-500' },
                ].map(opt => {
                  const Icon = opt.icon;
                  const isSelected = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id as PaymentMethod)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center text-xs font-semibold transition ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px] leading-tight line-clamp-1">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Tendered Input & Quick Cameroon Denominations */}
            {paymentMethod === 'cash' && (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{t.amountTendered}</span>
                  <input
                    type="number"
                    value={amountTendered || ''}
                    onChange={e => setAmountTendered(Number(e.target.value))}
                    className="w-36 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-xs font-bold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                {/* Quick Denomination Chips in Cameroon (10k, 5k, 2k, 1k, Exact) */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[grandTotal, 10000, 20000, 50000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmountTendered(val)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {formatFCFA(val, language)}
                    </button>
                  ))}
                </div>

                {amountTendered > grandTotal && (
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 pt-2 text-xs font-bold text-emerald-600 dark:border-slate-700">
                    <span>{t.changeDue}</span>
                    <span className="text-sm">{formatFCFA(changeDue, language)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Money Notice */}
            {(paymentMethod === 'momo' || paymentMethod === 'om') && (
              <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs text-teal-900 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300">
                <p className="font-bold">
                  {paymentMethod === 'momo' ? 'Compte MTN MoMo Marchand' : 'Compte Orange Money Marchand'}
                </p>
                <p className="mt-1 font-mono text-[11px]">
                  {paymentMethod === 'momo'
                    ? `Numéro : ${organization.momoMerchantCode || organization.phone} (Akem Distribution)`
                    : `Numéro : ${organization.omMerchantCode || organization.phone} (Akem Distribution)`}
                </p>
                <p className="mt-1 text-[10px] text-teal-700 dark:text-teal-400">
                  {language === 'fr'
                    ? 'Le client compose le code USSD sur son téléphone pour valider.'
                    : 'Customer dials the USSD push confirmation on their device.'}
                </p>
              </div>
            )}

            {/* Notes / Order Remark */}
            <div className="mt-3">
              <input
                type="text"
                placeholder={language === 'fr' ? 'Remarque ou N° de bordereau...' : 'Notes or delivery reference...'}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Confirm Actions */}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition"
              >
                {language === 'fr' ? 'Valider la Vente' : 'Confirm Sale'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cashier Shift Management Modal (Open / Close) */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.shiftStatus} • {currentUser.name}
              </h3>
              <button onClick={() => setIsShiftModalOpen(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            {currentShift?.status === 'open' ? (
              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">{t.openingFloat}:</span>
                    <span className="font-bold">{formatFCFA(currentShift.openingCash, language)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">{language === 'fr' ? 'Ventes Espèces :' : 'Cash Sales :'}:</span>
                    <span className="font-bold text-emerald-600">+{formatFCFA(currentShift.salesCash, language)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">{language === 'fr' ? 'Décaissements / Dépenses :' : 'Cash Outflows :'}:</span>
                    <span className="font-bold text-red-600">-{formatFCFA(currentShift.withdrawals, language)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-extrabold text-slate-900 dark:border-slate-700 dark:text-white">
                    <span>{language === 'fr' ? 'Solde Théorique Caisse :' : 'Expected Cash :'}</span>
                    <span>
                      {formatFCFA(
                        currentShift.openingCash + currentShift.salesCash - currentShift.withdrawals,
                        language
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'fr' ? 'Espèces Réelles Comptées (Physique) :' : 'Physical Cash Counted :'}
                  </label>
                  <input
                    type="number"
                    value={shiftActualCash || ''}
                    onChange={e => setShiftActualCash(Number(e.target.value))}
                    placeholder="Montant compté en caisse..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeShift(shiftActualCash, shiftCloseNotes);
                    setIsShiftModalOpen(false);
                  }}
                  className="w-full rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700"
                >
                  {t.closeShift}
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-400">
                  {language === 'fr'
                    ? 'La caisse est actuellement fermée. Indiquez le fond de caisse initial pour démarrer la session.'
                    : 'The cash drawer is currently closed. Enter opening cash float to begin selling.'}
                </p>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t.openingFloat}</label>
                  <input
                    type="number"
                    value={shiftOpeningFloat}
                    onChange={e => setShiftOpeningFloat(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    openShift(shiftOpeningFloat);
                    setIsShiftModalOpen(false);
                  }}
                  className="w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700"
                >
                  {t.openShift}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed Sale Receipt Modal */}
      {lastCompletedSale && (
        <ReceiptModal
          isOpen={!!lastCompletedSale}
          onClose={() => setLastCompletedSale(null)}
          sale={lastCompletedSale}
        />
      )}

      {/* Optical Camera Barcode / QR Scanner Modal */}
      <CameraBarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onProductScanned={prod => {
          addToCart(prod);
        }}
      />
    </div>
  );
};
