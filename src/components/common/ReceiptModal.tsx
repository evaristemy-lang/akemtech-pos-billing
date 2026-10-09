import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Download,
  CheckCircle2,
  Phone,
  Building2,
  Sliders,
  Bluetooth,
  Usb,
  Wifi,
  Monitor,
  Copy,
  Check,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { Sale, Invoice, ReceiptFormat } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatFCFA, formatDateTime, formatDate, formatCameroonPhone } from '../../utils/formatters';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale?: Sale;
  invoice?: Invoice;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  invoice,
}) => {
  const {
    organization,
    language,
    printerConfig,
    setIsPrinterModalOpen,
    hardwareEnv,
    printJob,
  } = useApp();

  const [activeFormat, setActiveFormat] = useState<ReceiptFormat>(
    printerConfig.paperWidth === '58mm' ? '58mm' : '80mm'
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  if (!isOpen || (!sale && !invoice)) return null;

  const docNumber = sale ? sale.saleNumber : invoice?.invoiceNumber || 'VTE-000';
  const docDate = sale ? sale.date : invoice?.date;
  const customerName = sale ? sale.customerName : invoice?.customerName || 'Client Comptant';

  const handleCopyText = () => {
    const lines = [
      `==============================`,
      `  ${organization.name.toUpperCase()}`,
      organization.tradeName ? `  ${organization.tradeName}` : '',
      `  ${organization.address}`,
      `  ${organization.city}, ${organization.country}`,
      `  RCCM: ${organization.rccm} | NIU: ${organization.niu}`,
      `  Tel: ${formatCameroonPhone(organization.phone)}`,
      `==============================`,
      `Document: ${docNumber}`,
      `Date: ${formatDateTime(docDate, language)}`,
      sale?.cashierName ? `Caissier: ${sale.cashierName}` : '',
      `Client: ${customerName}`,
      `------------------------------`,
      ...(sale?.items.map(i => `${i.productName}\n  ${i.quantity} x ${formatFCFA(i.unitPrice, language)} = ${formatFCFA(i.total, language)}`) || []),
      `------------------------------`,
      `Sous-total: ${formatFCFA(sale ? sale.subtotal : invoice?.subtotal, language)}`,
      sale?.discountAmount ? `Remise: -${formatFCFA(sale.discountAmount, language)}` : '',
      sale?.taxAmount ? `TVA (19.25%): ${formatFCFA(sale.taxAmount, language)}` : '',
      `TOTAL: ${formatFCFA(sale ? sale.grandTotal : invoice?.grandTotal, language)}`,
      `Regle: ${formatFCFA(sale ? sale.paidAmount : invoice?.paidAmount, language)}`,
      sale?.changeAmount ? `Monnaie: ${formatFCFA(sale.changeAmount, language)}` : '',
      `Mode: ${sale ? sale.paymentMethod.toUpperCase() : 'FACTURE'}`,
      `------------------------------`,
      `Merci pour votre confiance !`,
      `AkemTech POS & Billing`,
      `==============================`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleFastPrint = async () => {
    setIsPrinting(true);
    try {
      await printJob({ sale, invoice });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleWhatsAppShare = () => {
    let text = '';
    if (sale) {
      text =
        language === 'fr'
          ? `Bonjour *${sale.customerName || 'Cher Client'}*,\n\nMerci pour votre achat chez *${organization.name}* !\n\n*Ticket N°* : ${sale.saleNumber}\n*Date* : ${formatDateTime(sale.date, 'fr')}\n*Montant Total* : ${formatFCFA(sale.grandTotal, 'fr')}\n*Mode de règlement* : ${sale.paymentMethod.toUpperCase()}\n\nPaiement Mobile Marchand :\n• MTN MoMo : ${organization.momoMerchantCode || organization.phone}\n• Orange Money : ${organization.omMerchantCode || organization.phone}\n\nSupport : ${organization.phone}\nRCCM : ${organization.rccm}`
          : `Hello *${sale.customerName || 'Valued Customer'}*,\n\nThank you for shopping at *${organization.name}* !\n\n*Receipt #* : ${sale.saleNumber}\n*Date* : ${formatDateTime(sale.date, 'en')}\n*Total Amount* : ${formatFCFA(sale.grandTotal, 'en')}\n*Payment Method* : ${sale.paymentMethod.toUpperCase()}\n\nMerchant Mobile Pay :\n• MTN MoMo : ${organization.momoMerchantCode || organization.phone}\n• Orange Money : ${organization.omMerchantCode || organization.phone}\n\nSupport phone : ${organization.phone}\nRCCM : ${organization.rccm}`;
    } else if (invoice) {
      text =
        language === 'fr'
          ? `Bonjour *${invoice.customerName}*,\n\nVeuillez trouver le récapitulatif de votre pièce *${invoice.invoiceNumber}* émise par *${organization.name}*.\n\n*Montant Total* : ${formatFCFA(invoice.grandTotal, 'fr')}\n*Montant Réglé* : ${formatFCFA(invoice.paidAmount, 'fr')}\n*Reste Dû* : ${formatFCFA(invoice.balanceDue, 'fr')}\n*Échéance* : ${formatDate(invoice.dueDate, 'fr')}\n\nRèglement par MTN MoMo : ${organization.momoMerchantCode || organization.phone}\nOrange Money : ${organization.omMerchantCode || organization.phone}\n\nMerci pour votre confiance.`
          : `Hello *${invoice.customerName}*,\n\nHere is the summary of document *${invoice.invoiceNumber}* from *${organization.name}*.\n\n*Total Amount* : ${formatFCFA(invoice.grandTotal, 'en')}\n*Paid* : ${formatFCFA(invoice.paidAmount, 'en')}\n*Balance Due* : ${formatFCFA(invoice.balanceDue, 'en')}\n*Due Date* : ${formatDate(invoice.dueDate, 'en')}\n\nPayment via MTN MoMo : ${organization.momoMerchantCode || organization.phone}\nOrange Money : ${organization.omMerchantCode || organization.phone}\n\nThank you for your business.`;
    }

    const encoded = encodeURIComponent(text);
    const phone = (sale?.customerPhone || invoice?.customerPhone || '').replace(/[^\d]/g, '');
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const getModeIcon = () => {
    switch (printerConfig.mode) {
      case 'bluetooth':
        return <Bluetooth className="h-3.5 w-3.5 text-blue-500" />;
      case 'usb':
        return <Usb className="h-3.5 w-3.5 text-purple-500" />;
      case 'network':
        return <Wifi className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <Monitor className="h-3.5 w-3.5 text-teal-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs no-print text-xs">
      <div className="relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Top Header Actions */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500 text-white font-extrabold text-xs">
              <Printer className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                {sale ? (language === 'fr' ? 'Ticket de Caisse' : 'POS Sales Receipt') : (language === 'fr' ? 'Facture Commerciale' : 'Invoice Preview')}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span>{docNumber}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-sans font-bold">
                  {getModeIcon()}
                  <span className="uppercase">{printerConfig.mode}</span> ({printerConfig.paperWidth})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Hardware Print Button */}
            <button
              onClick={handleFastPrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
              title="Print via active printer mode"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{isPrinting ? 'Impression...' : 'Imprimer'}</span>
            </button>

            {/* Printer Setup Quick Launcher */}
            <button
              onClick={() => setIsPrinterModalOpen(true)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              title="Configure printers (Bluetooth, USB, Network, Paper width)"
            >
              <Sliders className="h-3.5 w-3.5 text-teal-600" />
              <span className="hidden sm:inline">Options Imprimante</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              title="Send to client WhatsApp"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Copy Text Summary */}
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              title="Copy receipt text to clipboard"
            >
              {copiedRaw ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copiedRaw ? 'Copié !' : 'Copier'}</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Paper Format Selector Tabs & Auto-detection hardware badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-2.5 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Format Papier :
            </span>
            <div className="flex gap-1.5">
              {[
                { id: '80mm', label: '80 mm Standard POS' },
                { id: '58mm', label: '58 mm Mini Ceinturon' },
                { id: 'a4', label: 'A4 Facture Officielle' },
              ].map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => setActiveFormat(fmt.id as ReceiptFormat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    activeFormat === fmt.id
                      ? 'bg-slate-900 text-white dark:bg-teal-600 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className="rounded-full bg-teal-50 px-2 py-0.5 font-bold text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span>Auto-identifié :</span>
              <span className="font-extrabold uppercase">{hardwareEnv.isMobile ? 'Mobile' : 'PC'} ({printerConfig.mode})</span>
            </span>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200/70 dark:bg-slate-950/80 flex flex-col items-center">
          {/* Top Perforated Tear Edge (Visible on screen only) */}
          {activeFormat !== 'a4' && (
            <div
              style={{
                width: activeFormat === '58mm' ? '280px' : '360px',
              }}
              className="tear-edge-top no-print opacity-70"
            />
          )}

          {/* Printable Ticket Container */}
          <div
            id="printable-area"
            style={{
              width: activeFormat === '58mm' ? '280px' : activeFormat === '80mm' ? '360px' : '100%',
              maxWidth: activeFormat === 'a4' ? '650px' : undefined,
            }}
            className="receipt-paper border border-slate-300/80 bg-white p-5 font-mono text-xs text-slate-900 shadow-md transition-all dark:border-slate-800 dark:bg-white dark:text-slate-900"
          >
            {/* Header / Logo */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-800 space-y-1">
              <h2 className="text-sm font-black uppercase tracking-tight text-slate-950 dark:text-white">
                {organization.name}
              </h2>
              {organization.tradeName && organization.tradeName !== organization.name && (
                <p className="text-xs font-bold text-teal-700 dark:text-teal-400 font-sans">
                  {organization.tradeName}
                </p>
              )}
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                {organization.address}
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                {organization.city}, {organization.country}
              </p>
              <div className="text-[10px] text-slate-600 font-mono font-bold pt-0.5">
                <span>RCCM: {organization.rccm}</span> • <span>NIU: {organization.niu}</span>
              </div>
              <p className="text-[10px] text-slate-600 font-sans">
                Tél: {formatCameroonPhone(organization.phone)}
              </p>
            </div>

            {/* Document Details */}
            <div className="py-2.5 text-[11px] border-b border-dashed border-slate-300 dark:border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">N° Pièce :</span>
                <span className="font-extrabold">{docNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Heure :</span>
                <span>{formatDateTime(docDate, language)}</span>
              </div>
              {sale && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Caissier :</span>
                  <span>{sale.cashierName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Client :</span>
                <span className="font-bold truncate max-w-[200px]">{customerName}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-300 dark:border-slate-800">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                <span>Désignation</span>
                <span>Total</span>
              </div>

              <div className="space-y-1.5">
                {sale &&
                  sale.items.map((item, idx) => (
                    <div key={idx} className="text-[11px]">
                      <div className="flex justify-between">
                        <span className="font-semibold truncate max-w-[220px]">{item.productName}</span>
                        <span className="font-bold">{formatFCFA(item.total, language)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.quantity} x {formatFCFA(item.unitPrice, language)}
                      </div>
                    </div>
                  ))}

                {invoice &&
                  invoice.items.map((item, idx) => (
                    <div key={idx} className="text-[11px]">
                      <div className="flex justify-between">
                        <span className="font-semibold truncate max-w-[220px]">{item.description}</span>
                        <span className="font-bold">{formatFCFA(item.total, language)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.quantity} x {formatFCFA(item.unitPrice, language)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Financial Totals */}
            <div className="py-2.5 border-b border-dashed border-slate-300 dark:border-slate-800 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Sous-total HT :</span>
                <span>{formatFCFA(sale ? sale.subtotal : invoice?.subtotal, language)}</span>
              </div>

              {(sale?.discountAmount || invoice?.discountAmount) ? (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Remise accordée :</span>
                  <span>-{formatFCFA((sale?.discountAmount || invoice?.discountAmount) || 0, language)}</span>
                </div>
              ) : null}

              {(sale?.taxAmount || invoice?.taxAmount) ? (
                <div className="flex justify-between text-slate-500">
                  <span>TVA Cameroun (19.25%) :</span>
                  <span>{formatFCFA(sale ? sale.taxAmount : invoice?.taxAmount, language)}</span>
                </div>
              ) : null}

              <div className="flex justify-between text-xs font-black pt-1.5 border-t border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white">
                <span className="uppercase">TOTAL NET TTC :</span>
                <span className="text-sm font-black text-teal-600 dark:text-teal-400">
                  {formatFCFA(sale ? sale.grandTotal : invoice?.grandTotal, language)}
                </span>
              </div>
            </div>

            {/* Payment Status & Change */}
            <div className="py-2.5 border-b border-dashed border-slate-300 dark:border-slate-800 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Montant Réglé :</span>
                <span className="font-bold">
                  {formatFCFA(sale ? sale.paidAmount : invoice?.paidAmount, language)}
                </span>
              </div>

              {sale && sale.changeAmount > 0 && (
                <div className="flex justify-between font-black text-amber-600">
                  <span>Monnaie Rendue :</span>
                  <span>{formatFCFA(sale.changeAmount, language)}</span>
                </div>
              )}

              {invoice && invoice.balanceDue > 0 && (
                <div className="flex justify-between font-black text-red-600">
                  <span>Reste à Payer :</span>
                  <span>{formatFCFA(invoice.balanceDue, language)}</span>
                </div>
              )}

              <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Mode de Paiement :</span>
                <span className="uppercase font-bold text-slate-800 dark:text-slate-200">
                  {sale ? sale.paymentMethod : (invoice?.status === 'paid' ? 'Payé' : 'À terme')}
                </span>
              </div>
            </div>

            {/* High-Resolution Thermal QR Code for Customer Scan */}
            <div className="py-3 flex flex-col items-center justify-center border-b border-dashed border-slate-300 dark:border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-white border border-slate-200 inline-block shadow-xs">
                <svg viewBox="0 0 100 100" className="h-24 w-24 text-slate-900 fill-current">
                  {/* Outer corner markers */}
                  <rect x="5" y="5" width="25" height="25" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="11" y="11" width="13" height="13" />
                  <rect x="70" y="5" width="25" height="25" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="76" y="11" width="13" height="13" />
                  <rect x="5" y="70" width="25" height="25" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="11" y="76" width="13" height="13" />
                  {/* Interior payload data */}
                  <rect x="36" y="10" width="6" height="6" />
                  <rect x="46" y="16" width="8" height="6" />
                  <rect x="40" y="28" width="12" height="6" />
                  <rect x="10" y="40" width="8" height="8" />
                  <rect x="24" y="46" width="6" height="12" />
                  <rect x="38" y="40" width="16" height="16" />
                  <rect x="60" y="40" width="8" height="8" />
                  <rect x="72" y="46" width="14" height="6" />
                  <rect x="80" y="58" width="8" height="14" />
                  <rect x="40" y="62" width="8" height="18" />
                  <rect x="56" y="68" width="12" height="6" />
                  <rect x="74" y="78" width="16" height="12" />
                </svg>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Scanner pour vérifier le ticket ou payer
              </p>
            </div>

            {/* Mobile Money Official Merchant Notice */}
            <div className="mt-2 rounded-xl bg-slate-50 p-2 text-center text-[10px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <p className="font-extrabold uppercase text-[9px] text-slate-400 mb-0.5">
                Comptes Marchands Officiels
              </p>
              <p className="font-mono">MTN MoMo : {organization.momoMerchantCode || '677 82 14 00'}</p>
              <p className="font-mono">Orange Money : {organization.omMerchantCode || '699 33 21 55'}</p>
            </div>

            {/* Barcode Line */}
            <div className="mt-3 text-center">
              <div className="font-mono text-[9px] text-slate-400 tracking-widest">
                ||||| | |||| || |||||| | ||||| |||||||
              </div>
              <p className="text-[9px] font-mono text-slate-500 mt-0.5">{docNumber}</p>
            </div>

            {/* Thermal Footer */}
            <div className="pt-2 text-center text-[10px] text-slate-400 mt-1">
              <p className="font-bold text-slate-700 dark:text-slate-700">
                Merci pour votre visite !
              </p>
              <p className="text-[9px] mt-0.5">AkemTech POS & Billing • Cameroun</p>
            </div>
          </div>

          {/* Bottom Perforated Tear Edge (Screen Only) */}
          {activeFormat !== 'a4' && (
            <div
              style={{
                width: activeFormat === '58mm' ? '280px' : '360px',
              }}
              className="tear-edge-bottom no-print opacity-70 mb-4"
            />
          )}
        </div>
      </div>
    </div>
  );
};
