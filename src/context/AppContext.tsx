import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Organization,
  Branch,
  User,
  ProductCategory,
  Product,
  Customer,
  Supplier,
  Sale,
  CashierShift,
  Invoice,
  Expense,
  FinancialAccount,
  Employee,
  DeliveryOrder,
  DocumentRecord,
  NotificationItem,
  SyncQueueItem,
  AuditLog,
  Language,
  Theme,
  PaymentMethod,
  PrinterConfig,
  HardwareEnvironment,
} from '../types';
import {
  initialOrganization,
  initialBranches,
  initialUser,
  initialCategories,
  initialProducts,
  initialCustomers,
  initialSuppliers,
  initialSales,
  initialActiveShift,
  initialInvoices,
  initialExpenses,
  initialAccounts,
  initialEmployees,
  initialDeliveries,
  initialDocuments,
  initialNotifications,
} from '../data/sampleData';
import { generateOrderNumber } from '../utils/formatters';
import {
  detectHardwareEnvironment,
  generateEscPosBuffer,
  generateTestPrintBuffer,
  sendRawPrintJob,
  kickCashDrawerHardware,
} from '../utils/printerEngine';

interface AppContextType {
  // State
  organization: Organization;
  branches: Branch[];
  selectedBranchId: string;
  currentUser: User;
  products: Product[];
  categories: ProductCategory[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  invoices: Invoice[];
  expenses: Expense[];
  accounts: FinancialAccount[];
  employees: Employee[];
  currentShift: CashierShift | null;
  deliveries: DeliveryOrder[];
  documents: DocumentRecord[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  syncQueue: SyncQueueItem[];
  isOnline: boolean;
  language: Language;
  theme: Theme;
  activeTab: string;
  showOnboarding: boolean;

  // Hardware & Peripheral Management
  printerConfig: PrinterConfig;
  updatePrinterConfig: (updates: Partial<PrinterConfig>) => void;
  hardwareEnv: HardwareEnvironment;
  isPrinterModalOpen: boolean;
  setIsPrinterModalOpen: (open: boolean) => void;
  isCustomerDisplayOpen: boolean;
  setIsCustomerDisplayOpen: (open: boolean) => void;
  isAndroidModalOpen: boolean;
  setIsAndroidModalOpen: (open: boolean) => void;
  isGitHubModalOpen: boolean;
  setIsGitHubModalOpen: (open: boolean) => void;
  lastScannedBarcode: string | null;
  setLastScannedBarcode: (barcode: string | null) => void;
  printJob: (params: { sale?: Sale; invoice?: Invoice }) => Promise<boolean>;
  testPrinter: () => Promise<boolean>;
  kickCashDrawer: () => Promise<boolean>;

  // Setters & Actions
  setActiveTab: (tab: string) => void;
  setSelectedBranchId: (branchId: string) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  setShowOnboarding: (show: boolean) => void;
  updateOrganization: (org: Partial<Organization>) => void;

  // Interconnected business methods
  createSale: (saleInput: Omit<Sale, 'id' | 'saleNumber' | 'date'>) => Sale;
  createInvoice: (invoiceInput: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  recordInvoicePayment: (invoiceId: string, amount: number, method: PaymentMethod, accountId?: string) => void;
  createExpense: (expenseInput: Omit<Expense, 'id' | 'expenseNumber' | 'date'>) => Expense;
  adjustStock: (productId: string, branchId: string, newQty: number, reason: string) => void;
  transferStock: (productId: string, fromBranchId: string, toBranchId: string, qty: number) => boolean;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalPurchases' | 'currentBalance'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  openShift: (openingCash: number) => void;
  closeShift: (actualCash: number, notes?: string) => CashierShift | null;
  addEmployee: (employee: Omit<Employee, 'id'>) => Employee;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  syncNow: () => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'akemtech_pos_billing_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage
  const loadInitialState = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('akembiz_enterprise_state_v1');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }
    return null;
  };

  const saved = loadInitialState();

  const [organization, setOrganization] = useState<Organization>(saved?.organization || initialOrganization);
  const [branches, setBranches] = useState<Branch[]>(saved?.branches || initialBranches);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(saved?.selectedBranchId || 'all');
  const [currentUser, setCurrentUser] = useState<User>(saved?.currentUser || initialUser);
  const [products, setProducts] = useState<Product[]>(saved?.products || initialProducts);
  const [categories, setCategories] = useState<ProductCategory[]>(saved?.categories || initialCategories);
  const [customers, setCustomers] = useState<Customer[]>(saved?.customers || initialCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(saved?.suppliers || initialSuppliers);
  const [sales, setSales] = useState<Sale[]>(saved?.sales || initialSales);
  const [invoices, setInvoices] = useState<Invoice[]>(saved?.invoices || initialInvoices);
  const [expenses, setExpenses] = useState<Expense[]>(saved?.expenses || initialExpenses);
  const [accounts, setAccounts] = useState<FinancialAccount[]>(saved?.accounts || initialAccounts);
  const [employees, setEmployees] = useState<Employee[]>(saved?.employees || initialEmployees);
  const [currentShift, setCurrentShift] = useState<CashierShift | null>(saved?.currentShift || initialActiveShift);
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(saved?.deliveries || initialDeliveries);
  const [documents, setDocuments] = useState<DocumentRecord[]>(saved?.documents || initialDocuments);
  const [notifications, setNotifications] = useState<NotificationItem[]>(saved?.notifications || initialNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(saved?.auditLogs || [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      userId: initialUser.id,
      userName: initialUser.name,
      action: 'SYSTEM_BOOT',
      module: 'Security',
      details: 'Session started for AkemTech POS & Billing (Douala Siège)',
    },
  ]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(saved?.syncQueue || []);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [language, setLanguageState] = useState<Language>(saved?.language || 'fr');
  const [theme, setTheme] = useState<Theme>(saved?.theme || 'light');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Hardware & Peripheral Management
  const hardwareEnv = detectHardwareEnvironment();
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(
    saved?.printerConfig || {
      id: 'printer-primary',
      name: hardwareEnv.isMobile
        ? (hardwareEnv.bluetoothSupported ? 'Imprimante Mobile Bluetooth (58mm)' : 'Spooler Système Mobile (AirPrint / Mopria)')
        : 'Spooler Système OS Universel (80mm)',
      mode: hardwareEnv.recommendedMode,
      paperWidth: hardwareEnv.isMobile ? '58mm' : '80mm',
      isDefault: true,
      autoCut: !hardwareEnv.isMobile,
      kickCashDrawer: !hardwareEnv.isMobile,
      autoPrintOnCheckout: false,
      status: 'ready',
    }
  );
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isCustomerDisplayOpen, setIsCustomerDisplayOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);

  const updatePrinterConfig = (updates: Partial<PrinterConfig>) => {
    setPrinterConfig(prev => ({ ...prev, ...updates }));
    addAuditLog('PRINTER_CONFIG_UPDATED', 'Hardware', `Printer settings updated (${updates.mode || printerConfig.mode}, ${updates.paperWidth || printerConfig.paperWidth})`);
  };

  const kickCashDrawer = async (): Promise<boolean> => {
    const success = await kickCashDrawerHardware(printerConfig);
    addAuditLog('CASH_DRAWER_PULSE', 'Hardware', 'Hardware pulse sent to open cash drawer');
    return success;
  };

  const printJob = async (params: { sale?: Sale; invoice?: Invoice }): Promise<boolean> => {
    const buffer = generateEscPosBuffer({
      organization,
      sale: params.sale,
      invoice: params.invoice,
      paperWidth: printerConfig.paperWidth,
      autoCut: printerConfig.autoCut,
      kickCashDrawer: params.sale?.paymentMethod === 'cash' && printerConfig.kickCashDrawer,
      language,
    });
    return await sendRawPrintJob(buffer, printerConfig);
  };

  const testPrinter = async (): Promise<boolean> => {
    const buffer = generateTestPrintBuffer(printerConfig.paperWidth, printerConfig.mode);
    const success = await sendRawPrintJob(buffer, printerConfig);
    addNotification({
      title: 'Test d\'impression envoyé',
      message: `Ticket de test envoyé via le mode ${printerConfig.mode.toUpperCase()} (${printerConfig.paperWidth}).`,
      category: 'system',
      urgency: 'low',
    });
    return success;
  };

  // Global physical USB/Bluetooth handheld barcode scanner listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 120) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          const barcodeScanned = buffer.trim();
          setLastScannedBarcode(barcodeScanned);
          const found = products.find(p => p.barcode === barcodeScanned || p.sku.toLowerCase() === barcodeScanned.toLowerCase());
          if (found) {
            addNotification({
              title: 'Code-barres scanné',
              message: `${found.name} (${found.sku}) identifié via le lecteur physique.`,
              category: 'inventory',
              urgency: 'low',
            });
          }
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync when coming back online
      if (syncQueue.length > 0) {
        setTimeout(syncNow, 1200);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue]);

  // Persist to localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        organization,
        branches,
        selectedBranchId,
        currentUser,
        products,
        categories,
        customers,
        suppliers,
        sales,
        invoices,
        expenses,
        accounts,
        employees,
        currentShift,
        deliveries,
        documents,
        notifications,
        auditLogs,
        syncQueue,
        language,
        theme,
        printerConfig,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [
    organization,
    branches,
    selectedBranchId,
    currentUser,
    products,
    categories,
    customers,
    suppliers,
    sales,
    invoices,
    expenses,
    accounts,
    employees,
    currentShift,
    deliveries,
    documents,
    notifications,
    auditLogs,
    syncQueue,
    language,
    theme,
    printerConfig,
  ]);

  // Sync dark class on document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const updateOrganization = (orgUpdates: Partial<Organization>) => {
    setOrganization(prev => ({ ...prev, ...orgUpdates }));
  };

  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      module,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 100)]);
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif-' + Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  /**
   * CREATE SALE:
   * 1. Decreases product stock
   * 2. Adds to sales
   * 3. Increases treasury account if paid (Cash, MoMo, Orange Money, Bank)
   * 4. Updates shift metrics
   * 5. If credit, increases customer balance
   * 6. Awards loyalty points
   * 7. Audit log & offline queue
   */
  const createSale = (saleInput: Omit<Sale, 'id' | 'saleNumber' | 'date'>): Sale => {
    const saleNumber = generateOrderNumber('VTE');
    const newSale: Sale = {
      ...saleInput,
      id: 'sale-' + Date.now(),
      saleNumber,
      date: new Date().toISOString(),
    };

    // 1. Decrement products inventory
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const itemSold = newSale.items.find(i => i.productId === prod.id);
        if (itemSold) {
          const newTotalStock = Math.max(0, prod.stockQuantity - itemSold.quantity);
          const currentBranchStock = prod.branchStocks?.[newSale.branchId] ?? prod.stockQuantity;
          const updatedBranchStock = Math.max(0, currentBranchStock - itemSold.quantity);
          return {
            ...prod,
            stockQuantity: newTotalStock,
            branchStocks: {
              ...(prod.branchStocks || {}),
              [newSale.branchId]: updatedBranchStock,
            },
          };
        }
        return prod;
      })
    );

    // 2. Add to sales list
    setSales(prev => [newSale, ...prev]);

    // 3. Update Treasury account if paid
    if (newSale.paymentStatus === 'paid' || newSale.paidAmount > 0) {
      const amountToAdd = newSale.paidAmount;
      setAccounts(prevAccounts =>
        prevAccounts.map(acc => {
          let matches = false;
          if (newSale.paymentMethod === 'cash' && acc.type === 'cash') matches = true;
          if (newSale.paymentMethod === 'momo' && acc.type === 'momo') matches = true;
          if (newSale.paymentMethod === 'om' && acc.type === 'om') matches = true;
          if (newSale.paymentMethod === 'bank' && acc.type === 'bank' && acc.id === 'acc-bank-1') matches = true;

          if (matches) {
            return { ...acc, balance: acc.balance + amountToAdd };
          }
          return acc;
        })
      );
    }

    // 4. Update Shift if open
    if (currentShift && currentShift.status === 'open') {
      setCurrentShift(prev => {
        if (!prev) return null;
        return {
          ...prev,
          salesCash: newSale.paymentMethod === 'cash' ? prev.salesCash + newSale.paidAmount : prev.salesCash,
          salesMomo: newSale.paymentMethod === 'momo' ? prev.salesMomo + newSale.paidAmount : prev.salesMomo,
          salesOm: newSale.paymentMethod === 'om' ? prev.salesOm + newSale.paidAmount : prev.salesOm,
          salesBank: newSale.paymentMethod === 'bank' ? prev.salesBank + newSale.paidAmount : prev.salesBank,
        };
      });
    }

    // 5. Update Customer (credit balance & loyalty points)
    if (newSale.customerId) {
      const unpaidPortion = Math.max(0, newSale.grandTotal - newSale.paidAmount);
      const pointsEarned = Math.floor(newSale.grandTotal / 1000); // 1 point per 1,000 FCFA

      setCustomers(prevCusts =>
        prevCusts.map(cust => {
          if (cust.id === newSale.customerId) {
            return {
              ...cust,
              currentBalance: cust.currentBalance + unpaidPortion,
              loyaltyPoints: (cust.loyaltyPoints || 0) + pointsEarned,
              totalPurchases: cust.totalPurchases + newSale.grandTotal,
              lastPurchaseDate: new Date().toISOString().split('T')[0],
            };
          }
          return cust;
        })
      );
    }

    // 6. If delivery requested, generate delivery ticket
    if (newSale.deliveryNeeded) {
      const newDelivery: DeliveryOrder = {
        id: 'del-' + Date.now(),
        orderNumber: generateOrderNumber('LIV'),
        saleId: newSale.id,
        customerName: newSale.customerName,
        customerPhone: newSale.customerPhone || '+237 600 00 00 00',
        address: 'Livraison Client (Douala / Yaoundé)',
        city: 'Douala',
        deliveryFee: 3000,
        status: 'pending',
        date: new Date().toISOString(),
      };
      setDeliveries(prev => [newDelivery, ...prev]);
    }

    // 7. Audit log & Sync Queue
    addAuditLog(
      'SALE_CREATED',
      'Sales',
      `Sale ${saleNumber} for ${newSale.grandTotal.toLocaleString()} FCFA via ${newSale.paymentMethod.toUpperCase()}`
    );

    if (!isOnline) {
      setSyncQueue(prev => [
        ...prev,
        {
          id: 'sq-' + Date.now(),
          entity: 'sale',
          action: 'create',
          payload: newSale,
          timestamp: new Date().toISOString(),
          status: 'pending',
        },
      ]);
    }

    // 8. Auto kick cash drawer if cash sale
    if (newSale.paymentMethod === 'cash' && printerConfig.kickCashDrawer) {
      kickCashDrawer();
    }

    // 9. Auto-print receipt if enabled
    if (printerConfig.autoPrintOnCheckout) {
      setTimeout(() => {
        printJob({ sale: newSale });
      }, 300);
    }

    return newSale;
  };

  /**
   * CREATE INVOICE
   */
  const createInvoice = (invoiceInput: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const prefix = invoiceInput.type === 'quote' ? 'DEV' : invoiceInput.type === 'proforma' ? 'PRO' : 'FAC';
    const invoiceNumber = generateOrderNumber(prefix);
    const newInvoice: Invoice = {
      ...invoiceInput,
      id: 'inv-' + Date.now(),
      invoiceNumber,
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // If unpaid and of type invoice, increment customer debt
    if (newInvoice.type === 'invoice' && newInvoice.balanceDue > 0 && newInvoice.customerId) {
      setCustomers(prevCusts =>
        prevCusts.map(cust => {
          if (cust.id === newInvoice.customerId) {
            return {
              ...cust,
              currentBalance: cust.currentBalance + newInvoice.balanceDue,
            };
          }
          return cust;
        })
      );
    }

    addAuditLog('INVOICE_CREATED', 'Invoices', `${newInvoice.type.toUpperCase()} ${invoiceNumber} created for ${newInvoice.customerName}`);
    return newInvoice;
  };

  const updateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices(prev =>
      prev.map(inv => (inv.id === invoiceId ? { ...inv, status } : inv))
    );
  };

  const recordInvoicePayment = (
    invoiceId: string,
    amount: number,
    method: PaymentMethod,
    accountId?: string
  ) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + amount;
          const newBalance = Math.max(0, inv.grandTotal - newPaid);
          const newStatus = newBalance === 0 ? 'paid' : 'partially_paid';

          // Decrement customer debt
          if (inv.customerId) {
            setCustomers(prevCusts =>
              prevCusts.map(cust =>
                cust.id === inv.customerId
                  ? { ...cust, currentBalance: Math.max(0, cust.currentBalance - amount) }
                  : cust
              )
            );
          }

          return {
            ...inv,
            paidAmount: newPaid,
            balanceDue: newBalance,
            status: newStatus,
          };
        }
        return inv;
      })
    );

    // Increase selected account balance
    setAccounts(prevAccounts =>
      prevAccounts.map(acc => {
        if (accountId ? acc.id === accountId : (method === 'momo' && acc.type === 'momo') || (method === 'om' && acc.type === 'om') || (method === 'cash' && acc.type === 'cash')) {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      })
    );

    addAuditLog('INVOICE_PAYMENT', 'Invoices', `Payment of ${amount.toLocaleString()} FCFA recorded for invoice ID ${invoiceId}`);
    addNotification({
      title: 'Paiement de Facture Encaissé',
      message: `Envoi de ${amount.toLocaleString()} FCFA enregistré via ${method.toUpperCase()}.`,
      category: 'payments',
      urgency: 'low',
    });
  };

  /**
   * CREATE EXPENSE
   */
  const createExpense = (expenseInput: Omit<Expense, 'id' | 'expenseNumber' | 'date'>): Expense => {
    const expenseNumber = generateOrderNumber('DEP');
    const newExpense: Expense = {
      ...expenseInput,
      id: 'exp-' + Date.now(),
      expenseNumber,
      date: new Date().toISOString().split('T')[0],
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Deduct from Treasury account
    setAccounts(prevAccounts =>
      prevAccounts.map(acc => {
        if (acc.id === newExpense.accountId) {
          return { ...acc, balance: Math.max(0, acc.balance - newExpense.amount) };
        }
        return acc;
      })
    );

    // If paid with cash during current active shift, record as withdrawal
    if (newExpense.paymentMethod === 'cash' && currentShift && currentShift.status === 'open') {
      setCurrentShift(prev => (prev ? { ...prev, withdrawals: prev.withdrawals + newExpense.amount } : null));
    }

    addAuditLog('EXPENSE_CREATED', 'Expenses', `Expense ${expenseNumber} (${newExpense.category}) of ${newExpense.amount.toLocaleString()} FCFA recorded.`);
    return newExpense;
  };

  /**
   * STOCK ADJUSTMENTS & TRANSFERS
   */
  const adjustStock = (productId: string, branchId: string, newQty: number, reason: string) => {
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === productId) {
          const currentBranchStock = p.branchStocks?.[branchId] ?? p.stockQuantity;
          const diff = newQty - currentBranchStock;
          const newTotal = Math.max(0, p.stockQuantity + diff);
          return {
            ...p,
            stockQuantity: newTotal,
            branchStocks: {
              ...(p.branchStocks || {}),
              [branchId]: newQty,
            },
          };
        }
        return p;
      })
    );
    addAuditLog('STOCK_ADJUSTMENT', 'Inventory', `Adjusted product ${productId} in branch ${branchId} to ${newQty}. Reason: ${reason}`);
  };

  const transferStock = (productId: string, fromBranchId: string, toBranchId: string, qty: number): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;
    const fromStock = product.branchStocks?.[fromBranchId] ?? product.stockQuantity;
    if (fromStock < qty) return false;

    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === productId) {
          const currentFrom = p.branchStocks?.[fromBranchId] ?? p.stockQuantity;
          const currentTo = p.branchStocks?.[toBranchId] ?? 0;
          return {
            ...p,
            branchStocks: {
              ...(p.branchStocks || {}),
              [fromBranchId]: Math.max(0, currentFrom - qty),
              [toBranchId]: currentTo + qty,
            },
          };
        }
        return p;
      })
    );

    addAuditLog('STOCK_TRANSFER', 'Inventory', `Transferred ${qty} units of ${product.name} from ${fromBranchId} to ${toBranchId}`);
    return true;
  };

  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
    };
    setProducts(prev => [newProd, ...prev]);
    addAuditLog('PRODUCT_ADDED', 'Inventory', `Added new product ${newProd.name} (SKU: ${newProd.sku})`);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    addAuditLog('PRODUCT_UPDATED', 'Inventory', `Updated product ID ${id}`);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalPurchases' | 'currentBalance'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: 'cust-' + Date.now(),
      loyaltyPoints: 0,
      totalPurchases: 0,
      currentBalance: 0,
    };
    setCustomers(prev => [newCust, ...prev]);
    addAuditLog('CUSTOMER_ADDED', 'CRM', `Added customer ${newCust.name} (${newCust.phone})`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  /**
   * CASHIER SHIFTS
   */
  const openShift = (openingCash: number) => {
    const newShift: CashierShift = {
      id: 'shift-' + Date.now(),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      branchId: selectedBranchId === 'all' ? 'branch-dla' : selectedBranchId,
      openedAt: new Date().toISOString(),
      openingCash,
      salesCash: 0,
      salesMomo: 0,
      salesOm: 0,
      salesBank: 0,
      withdrawals: 0,
      status: 'open',
    };
    setCurrentShift(newShift);
    addAuditLog('SHIFT_OPENED', 'POS', `Cashier shift opened by ${currentUser.name} with float ${openingCash.toLocaleString()} FCFA`);
  };

  const closeShift = (actualCash: number, notes?: string): CashierShift | null => {
    if (!currentShift) return null;
    const expectedCash = currentShift.openingCash + currentShift.salesCash - currentShift.withdrawals;
    const difference = actualCash - expectedCash;

    const closed: CashierShift = {
      ...currentShift,
      closedAt: new Date().toISOString(),
      actualCash,
      expectedCash,
      difference,
      status: 'closed',
      notes,
    };

    setCurrentShift(closed);
    addAuditLog(
      'SHIFT_CLOSED',
      'POS',
      `Shift closed. Expected: ${expectedCash.toLocaleString()} FCFA, Actual: ${actualCash.toLocaleString()} FCFA, Diff: ${difference.toLocaleString()} FCFA`
    );

    if (Math.abs(difference) > 1000) {
      addNotification({
        title: 'Écart de Caisse Constaté',
        message: `Écart de ${difference.toLocaleString()} FCFA lors de la clôture de caisse par ${currentShift.cashierName}.`,
        category: 'payments',
        urgency: 'high',
      });
    }

    return closed;
  };

  const addEmployee = (empData: Omit<Employee, 'id'>): Employee => {
    const newEmp: Employee = {
      ...empData,
      id: 'emp-' + Date.now(),
    };
    setEmployees(prev => [newEmp, ...prev]);
    addAuditLog('EMPLOYEE_ADDED', 'HR', `Added employee ${newEmp.name} (${newEmp.position})`);
    return newEmp;
  };

  const transferFunds = (fromAccountId: string, toAccountId: string, amount: number, notes?: string): boolean => {
    const fromAcc = accounts.find(a => a.id === fromAccountId);
    if (!fromAcc || fromAcc.balance < amount) return false;

    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: acc.balance - amount };
        }
        if (acc.id === toAccountId) {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      })
    );

    addAuditLog('TREASURY_TRANSFER', 'Treasury', `Internal transfer of ${amount.toLocaleString()} FCFA from ${fromAccountId} to ${toAccountId}. Note: ${notes || 'N/A'}`);
    return true;
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const syncNow = () => {
    if (syncQueue.length === 0) return;
    setSyncQueue([]);
    addAuditLog('SYNC_COMPLETED', 'System', 'Synchronized pending local transactions with server.');
    addNotification({
      title: 'Synchronisation Réussie',
      message: 'Toutes les opérations locales ont été synchronisées avec succès.',
      category: 'system',
      urgency: 'low',
    });
  };

  const resetToDemoData = () => {
    setOrganization(initialOrganization);
    setBranches(initialBranches);
    setSelectedBranchId('all');
    setCurrentUser(initialUser);
    setProducts(initialProducts);
    setCategories(initialCategories);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setSales(initialSales);
    setInvoices(initialInvoices);
    setExpenses(initialExpenses);
    setAccounts(initialAccounts);
    setEmployees(initialEmployees);
    setCurrentShift(initialActiveShift);
    setDeliveries(initialDeliveries);
    setDocuments(initialDocuments);
    setNotifications(initialNotifications);
    setSyncQueue([]);
    localStorage.removeItem(STORAGE_KEY);
    addNotification({
      title: 'Données Démo Réinitialisées',
      message: 'Le jeu de données officiel Akem Distribution SARL a été restauré.',
      category: 'system',
      urgency: 'low',
    });
  };

  return (
    <AppContext.Provider
      value={{
        organization,
        branches,
        selectedBranchId,
        currentUser,
        products,
        categories,
        customers,
        suppliers,
        sales,
        invoices,
        expenses,
        accounts,
        employees,
        currentShift,
        deliveries,
        documents,
        notifications,
        auditLogs,
        syncQueue,
        isOnline,
        language,
        theme,
        activeTab,
        showOnboarding,
        setActiveTab,
        setSelectedBranchId,
        setLanguage,
        toggleTheme,
        setShowOnboarding,
        updateOrganization,
        createSale,
        createInvoice,
        updateInvoiceStatus,
        recordInvoicePayment,
        createExpense,
        adjustStock,
        transferStock,
        addProduct,
        updateProduct,
        addCustomer,
        updateCustomer,
        openShift,
        closeShift,
        addEmployee,
        transferFunds,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        syncNow,
        resetToDemoData,
        printerConfig,
        updatePrinterConfig,
        hardwareEnv,
        isPrinterModalOpen,
        setIsPrinterModalOpen,
        isCustomerDisplayOpen,
        setIsCustomerDisplayOpen,
        isAndroidModalOpen,
        setIsAndroidModalOpen,
        isGitHubModalOpen,
        setIsGitHubModalOpen,
        lastScannedBarcode,
        setLastScannedBarcode,
        printJob,
        testPrinter,
        kickCashDrawer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
