export type Language = 'en' | 'fr';
export type Theme = 'light' | 'dark';

export type UserRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'accountant'
  | 'cashier'
  | 'sales'
  | 'inventory_manager'
  | 'hr_manager';

export type BusinessType =
  | 'Retail'
  | 'Wholesale'
  | 'Restaurant'
  | 'Pharmacy'
  | 'Services'
  | 'Distribution'
  | 'Construction'
  | 'School'
  | 'Manufacturing'
  | 'Other';

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  isMain: boolean;
  managerName?: string;
}

export interface Organization {
  id: string;
  name: string;
  tradeName: string;
  businessType: BusinessType;
  rccm: string; // Registre du Commerce et du Crédit Mobilier (e.g. RC/DLA/2022/B/1842)
  niu: string;  // Numéro d'Identifiant Unique (e.g. M042215392819X)
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  country: string;
  currency: string; // 'XAF'
  taxRate: number; // e.g. 19.25% TVA Cameroon
  momoMerchantCode?: string;
  omMerchantCode?: string;
  bankRib?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branchId: string;
  avatar?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameFr: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  description?: string;
  costPrice: number;       // in FCFA
  sellingPrice: number;    // in FCFA
  wholesalePrice: number;  // in FCFA
  stockQuantity: number;
  minStock: number;
  maxStock: number;
  unit: string;            // 'Sac 50kg', 'Carton', 'Bouteille', 'Unité', 'Casier'
  supplierId?: string;
  warehouse: string;
  expiryDate?: string;
  batchNumber?: string;
  image?: string;
  branchStocks?: Record<string, number>; // branchId -> stock
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  type: 'regular' | 'vip' | 'debtor' | 'new';
  creditLimit: number;
  currentBalance: number; // Positive = owes us money
  loyaltyPoints: number;
  totalPurchases: number;
  lastPurchaseDate?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  category: string;
  outstandingBalance: number; // What we owe them
  paymentTerms: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage or fixed
  total: number;
}

export type PaymentMethod = 'cash' | 'momo' | 'om' | 'bank' | 'card' | 'credit';

export interface Sale {
  id: string;
  saleNumber: string;
  date: string;
  branchId: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paidAmount: number;
  changeAmount: number;
  notes?: string;
  deliveryNeeded?: boolean;
}

export interface CashierShift {
  id: string;
  cashierId: string;
  cashierName: string;
  branchId: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  salesCash: number;
  salesMomo: number;
  salesOm: number;
  salesBank: number;
  withdrawals: number;
  actualCash?: number;
  expectedCash?: number;
  difference?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export type InvoiceType =
  | 'quote'
  | 'proforma'
  | 'invoice'
  | 'receipt'
  | 'delivery_note'
  | 'credit_note';

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  date: string;
  dueDate: string;
  branchId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discountAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentTerms: string;
  notes?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  orderNumber: string;
  date: string;
  branchId: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  status: 'draft' | 'ordered' | 'received' | 'paid';
  deliveryDate?: string;
}

export type ExpenseCategory =
  | 'rent'
  | 'electricity'
  | 'water'
  | 'internet'
  | 'transport'
  | 'salaries'
  | 'marketing'
  | 'equipment'
  | 'maintenance'
  | 'taxes'
  | 'purchases'
  | 'other';

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  accountId: string;
  branchId: string;
  approvedBy?: string;
  status: 'approved' | 'pending' | 'rejected';
  receiptUrl?: string;
  beneficiary?: string;
}

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'momo' | 'om';
  accountNumber: string;
  institution: string; // e.g. "MTN Cameroon", "Orange Cameroun", "Afriland First Bank", "Caisse Locale"
  balance: number;
  currency: string;
}

export interface Employee {
  id: string;
  name: string;
  photo?: string;
  phone: string;
  email: string;
  position: string;
  department: string;
  branchId: string;
  salary: number; // base monthly salary FCFA
  hireDate: string;
  status: 'active' | 'on_leave' | 'terminated';
  cnpsNumber?: string; // Caisse Nationale de Prévoyance Sociale
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  saleId?: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  deliveryFee: number;
  driverName?: string;
  driverPhone?: string;
  status: 'pending' | 'assigned' | 'out_for_delivery' | 'delivered' | 'cancelled';
  notes?: string;
  date: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  category: 'invoices' | 'receipts' | 'contracts' | 'supplier' | 'employee' | 'tax_compliance';
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  reference?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category?: 'sales' | 'inventory' | 'payments' | 'customers' | 'employees' | 'system' | 'ai';
  timestamp: string;
  read: boolean;
  urgency?: 'low' | 'medium' | 'high';
  type?: 'success' | 'warning' | 'error' | 'info';
}

export interface SyncQueueItem {
  id: string;
  entity: 'sale' | 'expense' | 'product' | 'customer' | 'payment';
  action: 'create' | 'update' | 'delete';
  payload: any;
  timestamp: string;
  status: 'pending' | 'synced' | 'failed';
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
}

export type PrintMode = 'system' | 'bluetooth' | 'usb' | 'network' | 'serial';
export type PaperWidth = '80mm' | '58mm';
export type ReceiptFormat = '80mm' | '58mm' | 'a4';

export interface PrinterConfig {
  id: string;
  name: string;
  mode: PrintMode;
  paperWidth: PaperWidth;
  isDefault: boolean;
  autoCut: boolean;
  kickCashDrawer: boolean;
  autoPrintOnCheckout: boolean;
  status: 'connected' | 'ready' | 'disconnected' | 'error';
  ipAddress?: string;
  port?: number;
  bluetoothDeviceId?: string;
  bluetoothDeviceName?: string;
  usbVendorId?: string;
  usbProductName?: string;
}

export interface HardwareEnvironment {
  platform: 'android' | 'ios' | 'windows' | 'mac' | 'linux' | 'other';
  isMobile: boolean;
  bluetoothSupported: boolean;
  usbSupported: boolean;
  serialSupported: boolean;
  recommendedMode: PrintMode;
}
