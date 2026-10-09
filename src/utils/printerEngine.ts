import { PrinterConfig, HardwareEnvironment, PrintMode, PaperWidth, Sale, Invoice, Organization } from '../types';
import { formatFCFA, formatDateTime, formatDate, formatCameroonPhone } from './formatters';

/**
 * Detect the current host device platform and available hardware peripheral APIs
 */
export function detectHardwareEnvironment(): HardwareEnvironment {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isWindows = /windows/i.test(ua);
  const isMac = /macintosh|mac os x/i.test(ua);
  const isLinux = /linux/i.test(ua) && !isAndroid;

  let platform: HardwareEnvironment['platform'] = 'other';
  if (isAndroid) platform = 'android';
  else if (isIOS) platform = 'ios';
  else if (isWindows) platform = 'windows';
  else if (isMac) platform = 'mac';
  else if (isLinux) platform = 'linux';

  const isMobile = isAndroid || isIOS || /mobile|tablet/i.test(ua);

  // Check hardware API support in current browser/webview
  const bluetoothSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  const usbSupported = typeof navigator !== 'undefined' && 'usb' in navigator;
  const serialSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

  // Determine optimal recommended mode based on detected hardware
  let recommendedMode: PrintMode = 'system';
  if (isMobile) {
    // On phones (Android/iOS), Bluetooth thermal belt printers are the industry standard in Cameroon
    recommendedMode = bluetoothSupported ? 'bluetooth' : 'system';
  } else {
    // On desktop computers (Windows/Mac/Linux), USB and system spooler are best
    recommendedMode = usbSupported ? 'usb' : 'system';
  }

  return {
    platform,
    isMobile,
    bluetoothSupported,
    usbSupported,
    serialSupported,
    recommendedMode,
  };
}

/**
 * Format string to fixed length with spaces
 */
function padLine(left: string, right: string, width: number): string {
  const maxLeft = width - right.length - 1;
  const truncatedLeft = left.length > maxLeft ? left.slice(0, maxLeft) : left;
  const spaces = Math.max(1, width - truncatedLeft.length - right.length);
  return truncatedLeft + ' '.repeat(spaces) + right;
}

/**
 * Generate standard ESC/POS bytecode for thermal printers
 */
export function generateEscPosBuffer(params: {
  organization: Organization;
  sale?: Sale;
  invoice?: Invoice;
  paperWidth: PaperWidth;
  autoCut: boolean;
  kickCashDrawer: boolean;
  language?: 'en' | 'fr';
}): Uint8Array {
  const { organization, sale, invoice, paperWidth, autoCut, kickCashDrawer, language = 'fr' } = params;
  const colWidth = paperWidth === '58mm' ? 32 : 48;
  const encoder = new TextEncoder();
  const bufferParts: number[] = [];

  const addBytes = (...bytes: number[]) => {
    bufferParts.push(...bytes);
  };

  const addText = (text: string) => {
    const encoded = encoder.encode(text);
    for (let i = 0; i < encoded.length; i++) {
      bufferParts.push(encoded[i]);
    }
  };

  const addLine = (text: string = '') => {
    addText(text + '\n');
  };

  // 1. Initialize Printer: ESC @ (0x1B 0x40)
  addBytes(0x1b, 0x40);

  // Optional: Kick Cash Drawer before printing if cash sale
  if (kickCashDrawer) {
    // ESC p 0 25 250 (pulse 50ms to pin 2)
    addBytes(0x1b, 0x70, 0x00, 0x19, 0xfa);
  }

  // 2. Center Alignment: ESC a 1
  addBytes(0x1b, 0x61, 0x01);

  // Double-height & Double-width for Business Name: GS ! 0x11
  addBytes(0x1d, 0x21, 0x11);
  addLine(organization.name);

  // Reset text size: GS ! 0x00
  addBytes(0x1d, 0x21, 0x00);
  if (organization.tradeName && organization.tradeName !== organization.name) {
    addLine(organization.tradeName);
  }
  addLine(organization.address);
  addLine(`${organization.city}, ${organization.country}`);
  addLine(`RCCM: ${organization.rccm} | NIU: ${organization.niu}`);
  addLine(`Tel: ${formatCameroonPhone(organization.phone)}`);
  addLine('-'.repeat(colWidth));

  // 3. Receipt Details (Left align: ESC a 0)
  addBytes(0x1b, 0x61, 0x00);
  const docNum = sale ? sale.saleNumber : invoice?.invoiceNumber || 'VTE-000';
  const docDate = formatDateTime(sale ? sale.date : invoice?.date, language);
  const customer = sale ? sale.customerName : invoice?.customerName || 'Client Comptant';

  addLine(padLine(language === 'fr' ? 'Piece N°:' : 'Doc #:', docNum, colWidth));
  addLine(padLine(language === 'fr' ? 'Date:' : 'Date:', docDate, colWidth));
  if (sale?.cashierName) {
    addLine(padLine(language === 'fr' ? 'Caissier:' : 'Cashier:', sale.cashierName, colWidth));
  }
  addLine(padLine(language === 'fr' ? 'Client:' : 'Customer:', customer, colWidth));
  addLine('='.repeat(colWidth));

  // 4. Line Items Table
  addBytes(0x1b, 0x45, 0x01); // Bold ON
  addLine(padLine(language === 'fr' ? 'DESIGNATION' : 'ITEM', language === 'fr' ? 'TOTAL' : 'TOTAL', colWidth));
  addBytes(0x1b, 0x45, 0x00); // Bold OFF
  addLine('-'.repeat(colWidth));

  const items = sale?.items.map(i => ({ name: i.productName, qty: i.quantity, price: i.unitPrice, total: i.total })) ||
    invoice?.items.map(i => ({ name: i.description, qty: i.quantity, price: i.unitPrice, total: i.total })) || [];

  for (const item of items) {
    addLine(item.name);
    const subLine = `  ${item.qty} x ${formatFCFA(item.price, language)}`;
    const totalFormatted = formatFCFA(item.total, language);
    addLine(padLine(subLine, totalFormatted, colWidth));
  }
  addLine('-'.repeat(colWidth));

  // 5. Totals
  const subtotal = sale ? sale.subtotal : invoice?.subtotal || 0;
  const tax = sale ? sale.taxAmount : invoice?.taxAmount || 0;
  const discount = (sale?.discountAmount || invoice?.discountAmount) || 0;
  const grandTotal = sale ? sale.grandTotal : invoice?.grandTotal || 0;
  const paid = sale ? sale.paidAmount : invoice?.paidAmount || 0;
  const change = sale?.changeAmount || 0;
  const balance = invoice?.balanceDue || 0;

  addLine(padLine(language === 'fr' ? 'Sous-total HT:' : 'Subtotal:', formatFCFA(subtotal, language), colWidth));
  if (discount > 0) {
    addLine(padLine(language === 'fr' ? 'Remise:' : 'Discount:', `-${formatFCFA(discount, language)}`, colWidth));
  }
  if (tax > 0) {
    addLine(padLine('TVA (19.25%):', formatFCFA(tax, language), colWidth));
  }

  addLine('='.repeat(colWidth));
  // Double-size for Grand Total
  addBytes(0x1d, 0x21, 0x10); // Double height
  addBytes(0x1b, 0x45, 0x01); // Bold
  addLine(padLine(language === 'fr' ? 'TOTAL NET TTC:' : 'TOTAL DUE:', formatFCFA(grandTotal, language), Math.floor(colWidth / 1.5)));
  addBytes(0x1d, 0x21, 0x00); // Reset size
  addBytes(0x1b, 0x45, 0x00); // Reset bold
  addLine('-'.repeat(colWidth));

  // Payment details
  addLine(padLine(language === 'fr' ? 'Montant Paye:' : 'Paid:', formatFCFA(paid, language), colWidth));
  if (change > 0) {
    addLine(padLine(language === 'fr' ? 'Monnaie Rendue:' : 'Change:', formatFCFA(change, language), colWidth));
  }
  if (balance > 0) {
    addLine(padLine(language === 'fr' ? 'Reste a Payer:' : 'Balance Due:', formatFCFA(balance, language), colWidth));
  }

  const method = sale ? sale.paymentMethod.toUpperCase() : (invoice?.status === 'paid' ? 'PAYE' : 'A TERME');
  addLine(padLine(language === 'fr' ? 'Mode de Reglement:' : 'Payment Mode:', method, colWidth));
  addLine('-'.repeat(colWidth));

  // 6. Mobile Money Merchant Info & Footer (Center alignment: ESC a 1)
  addBytes(0x1b, 0x61, 0x01);
  addLine(language === 'fr' ? 'PAIEMENTS MOBILES ACCEPTES' : 'ACCEPTED MOBILE PAYMENTS');
  if (organization.momoMerchantCode) {
    addLine(`MTN MoMo: ${organization.momoMerchantCode}`);
  }
  if (organization.omMerchantCode) {
    addLine(`Orange Money: ${organization.omMerchantCode}`);
  }
  addLine('');
  addLine(language === 'fr' ? 'Merci pour votre confiance !' : 'Thank you for your business!');
  addLine('AkemTech POS & Billing');
  addLine('www.akemtech.cm');

  // Feed lines: 4 line feeds
  addBytes(0x0a, 0x0a, 0x0a, 0x0a);

  // 7. Auto-cut Paper: GS V 0 (0x1D 0x56 0x00)
  if (autoCut) {
    addBytes(0x1d, 0x56, 0x00);
  }

  return new Uint8Array(bufferParts);
}

/**
 * Generate a Test Print ESC/POS buffer
 */
export function generateTestPrintBuffer(paperWidth: PaperWidth, mode: PrintMode): Uint8Array {
  const encoder = new TextEncoder();
  const buffer: number[] = [];
  const colWidth = paperWidth === '58mm' ? 32 : 48;

  const addBytes = (...bytes: number[]) => buffer.push(...bytes);
  const addLine = (text: string = '') => {
    const encoded = encoder.encode(text + '\n');
    for (let i = 0; i < encoded.length; i++) buffer.push(encoded[i]);
  };

  // Init
  addBytes(0x1b, 0x40);

  // Center
  addBytes(0x1b, 0x61, 0x01);
  addBytes(0x1d, 0x21, 0x11);
  addLine('AkemTech POS');
  addBytes(0x1d, 0x21, 0x00);
  addLine('TEST D\'IMPRESSION THERMIQUE');
  addLine('-'.repeat(colWidth));

  // Left
  addBytes(0x1b, 0x61, 0x00);
  addLine(padLine('Mode de liaison:', mode.toUpperCase(), colWidth));
  addLine(padLine('Largeur rouleau:', paperWidth, colWidth));
  addLine(padLine('Date du test:', new Date().toLocaleString(), colWidth));
  addLine(padLine('Statut imprimante:', 'CONNECTE OK', colWidth));
  addLine('-'.repeat(colWidth));

  // Center
  addBytes(0x1b, 0x61, 0x01);
  addLine('ALIGNEMENT ET CARACTERES OK');
  addLine('1234567890 ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  addLine('★ ☆ ☕ 📦 ⚡ 💰 🖨️');
  addLine('-'.repeat(colWidth));
  addLine('Pret pour encaissement et facturation.');
  addLine('AkemTech POS & Billing • Cameroun');

  // Feed & Cut
  addBytes(0x0a, 0x0a, 0x0a, 0x0a);
  addBytes(0x1d, 0x56, 0x00);

  return new Uint8Array(buffer);
}

// Active connection handles for Bluetooth, USB and Serial
let activeBluetoothDevice: any = null;
let activeBluetoothCharacteristic: any = null;
let activeUsbDevice: any = null;
let activeUsbInterfaceNumber: number = 0;
let activeUsbEndpointNumber: number = 1;
let activeSerialPort: any = null;
let activeSerialWriter: any = null;

// Audio context singleton for hardware beeps (Web Audio API)
let audioCtx: AudioContext | null = null;

/**
 * Play authentic POS hardware audio beeps using Web Audio API synthesis
 */
export function playHardwareBeep(type: 'scan' | 'error' | 'cash' | 'print' | 'beep' = 'scan'): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    if (type === 'beep') {
      // Soft touch feedback chirp (1200Hz, 35ms)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'scan') {
      // Crisp 1800Hz POS barcode beep (60ms)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'error') {
      // Double low-frequency buzz (350Hz)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(320, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(260, now + 0.14);
      gain2.gain.setValueAtTime(0.15, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.26);
    } else if (type === 'cash') {
      // Metallic cash drawer opening chime (dual tone 1200Hz + 2400Hz)
      [1200, 2400].forEach((freq, idx) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.2, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.25);
      });
    } else if (type === 'print') {
      // Gentle print acknowledgment chirp
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(1450, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  } catch {
    // Audio synthesis is non-blocking
  }
}

/**
 * Connect to a Serial RS-232 / COM Port Thermal Printer
 */
export async function connectSerialPrinter(): Promise<{ name: string; baudRate: number }> {
  if (typeof navigator === 'undefined' || !('serial' in navigator)) {
    throw new Error('Web Serial is not supported on this browser. Supported in Chrome, Edge, and Opera desktop.');
  }

  const port = await (navigator as any).serial.requestPort();
  await port.open({ baudRate: 9600 });
  activeSerialPort = port;
  activeSerialWriter = port.writable.getWriter();

  return {
    name: 'Serial POS Printer (COM/RS232)',
    baudRate: 9600,
  };
}

/**
 * Auto-detect and initialize the optimal printer profile for current host device
 */
export function autoDetectDefaultPrinter(): PrinterConfig {
  const env = detectHardwareEnvironment();
  const isMobile = env.isMobile;

  if (isMobile) {
    // On phones (Android/iOS), 58mm or 80mm mobile receipt profile
    return {
      id: 'printer-auto-mobile',
      name: env.bluetoothSupported ? 'Imprimante Mobile Bluetooth' : 'Spooler Système Mobile (AirPrint / Mopria)',
      mode: env.bluetoothSupported ? 'bluetooth' : 'system',
      paperWidth: '58mm',
      isDefault: true,
      autoCut: false,
      kickCashDrawer: false,
      autoPrintOnCheckout: false,
      status: 'ready',
    };
  }

  // On Desktop computers / POS stations
  return {
    id: 'printer-auto-desktop',
    name: 'Spooler Système OS Universel',
    mode: 'system',
    paperWidth: '80mm',
    isDefault: true,
    autoCut: true,
    kickCashDrawer: true,
    autoPrintOnCheckout: true,
    status: 'ready',
  };
}

/**
 * Connect to a Bluetooth ESC/POS Thermal Printer
 */
export async function connectBluetoothPrinter(): Promise<{ name: string; id: string }> {
  if (typeof navigator === 'undefined' || !('bluetooth' in navigator)) {
    throw new Error('Web Bluetooth is not supported on this browser. Use Chrome on Android, Windows, or Mac.');
  }

  // Request any Bluetooth device advertising standard printer service or with printer in name
  const device = await (navigator as any).bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: [
      '000018f0-0000-1000-8000-00805f9b34fb', // Standard printer service
      'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Serial/Printer profile
      '0000ff00-0000-1000-8000-00805f9b34fb', // Custom thermal ESC/POS
      '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC
    ],
  });

  const server = await device.gatt.connect();
  activeBluetoothDevice = device;

  // Search for writable characteristic
  const services = await server.getPrimaryServices();
  for (const service of services) {
    try {
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          activeBluetoothCharacteristic = char;
          break;
        }
      }
      if (activeBluetoothCharacteristic) break;
    } catch {
      // Continue search
    }
  }

  return {
    name: device.name || 'Bluetooth Thermal Printer',
    id: device.id,
  };
}

/**
 * Connect to a USB ESC/POS Thermal Printer
 */
export async function connectUsbPrinter(): Promise<{ name: string; vendorId: string }> {
  if (typeof navigator === 'undefined' || !('usb' in navigator)) {
    throw new Error('WebUSB is not supported on this browser. Supported in Chrome, Edge, and Opera.');
  }

  const device = await (navigator as any).usb.requestDevice({
    filters: [
      // Standard POS thermal printer vendor IDs: Epson (0x04b8), Xprinter (0x1fc9), Star (0x0519), etc.
      { vendorId: 0x04b8 },
      { vendorId: 0x1fc9 },
      { vendorId: 0x0519 },
      { vendorId: 0x0416 },
      { vendorId: 0x0483 },
      { vendorId: 0x0fe6 },
      { vendorId: 0x20d1 },
    ],
  });

  await device.open();
  await device.selectConfiguration(1);

  // Claim interface
  const iface = device.configuration.interfaces[0];
  activeUsbInterfaceNumber = iface.interfaceNumber;
  await device.claimInterface(activeUsbInterfaceNumber);

  // Find OUT endpoint for bulk transfer
  const endpoint = iface.alternate.endpoints.find((e: any) => e.direction === 'out');
  if (endpoint) {
    activeUsbEndpointNumber = endpoint.endpointNumber;
  }

  activeUsbDevice = device;

  return {
    name: device.productName || 'USB Thermal POS Printer',
    vendorId: `0x${device.vendorId.toString(16)}`,
  };
}

/**
 * Send raw byte buffer to configured printer
 */
export async function sendRawPrintJob(buffer: Uint8Array, config: PrinterConfig): Promise<boolean> {
  switch (config.mode) {
    case 'bluetooth': {
      if (!activeBluetoothCharacteristic) {
        // Try auto-reconnecting or prompt
        await connectBluetoothPrinter();
      }
      if (activeBluetoothCharacteristic) {
        // Send in chunks of 100 bytes to avoid BLE MTU overflow
        const chunkSize = 100;
        for (let i = 0; i < buffer.length; i += chunkSize) {
          const chunk = buffer.slice(i, i + chunkSize);
          await activeBluetoothCharacteristic.writeValue(chunk);
        }
        return true;
      }
      throw new Error('No writable Bluetooth printer characteristic found.');
    }

    case 'usb': {
      if (!activeUsbDevice) {
        await connectUsbPrinter();
      }
      if (activeUsbDevice) {
        await activeUsbDevice.transferOut(activeUsbEndpointNumber, buffer);
        return true;
      }
      throw new Error('No USB thermal printer connected.');
    }

    case 'network': {
      // Send to network thermal printer via backend proxy or raw socket
      const ip = config.ipAddress || '192.168.1.200';
      const port = config.port || 9100;
      try {
        const base64Data = btoa(String.fromCharCode(...buffer));
        const res = await fetch('/api/printer/raw-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip, port, data: base64Data }),
        });
        if (res.ok) return true;
      } catch {
        // Fallback to system spooler if network printer is offline
      }
      // If direct network fails, trigger system spooler
      window.print();
      return true;
    }

    case 'serial': {
      if (!activeSerialWriter) {
        await connectSerialPrinter();
      }
      if (activeSerialWriter) {
        await activeSerialWriter.write(buffer);
        return true;
      }
      throw new Error('No serial thermal printer connected.');
    }

    case 'system':
    default: {
      // Trigger native OS print dialog (Works on Windows Spooler, Mac CUPS, Android Print Service, iOS AirPrint)
      window.print();
      return true;
    }
  }
}

/**
 * Hardware pulse to open Cash Drawer
 */
export async function kickCashDrawerHardware(config: PrinterConfig): Promise<boolean> {
  // ESC p 0 25 250 (pulse 50ms)
  const pulseCommand = new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa]);
  try {
    if (config.mode === 'bluetooth' && activeBluetoothCharacteristic) {
      await activeBluetoothCharacteristic.writeValue(pulseCommand);
      return true;
    } else if (config.mode === 'usb' && activeUsbDevice) {
      await activeUsbDevice.transferOut(activeUsbEndpointNumber, pulseCommand);
      return true;
    } else if (config.mode === 'serial' && activeSerialWriter) {
      await activeSerialWriter.write(pulseCommand);
      return true;
    }
  } catch {
    // Silent fail
  }
  return false;
}
