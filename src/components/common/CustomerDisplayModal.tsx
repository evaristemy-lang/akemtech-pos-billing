import React from 'react';
import { Monitor, X, Smartphone, CheckCircle, ShoppingBag, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFCFA } from '../../utils/formatters';

interface CustomerDisplayModalProps {
  cartItems?: { name: string; qty: number; price: number; total: number }[];
  totalAmount?: number;
}

export const CustomerDisplayModal: React.FC<CustomerDisplayModalProps> = ({
  cartItems = [],
  totalAmount = 0,
}) => {
  const { isCustomerDisplayOpen, setIsCustomerDisplayOpen, organization, language } = useApp();

  if (!isCustomerDisplayOpen) return null;

  const total = totalAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md no-print text-xs">
      <div className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 py-4 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-500 font-black text-slate-950 text-sm">
              Ak
            </span>
            <div>
              <h2 className="text-base font-black tracking-tight">{organization.name}</h2>
              <p className="text-[11px] text-teal-400 font-mono">
                Écran Client • Point de Vente Caisse
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomerDisplayOpen(false)}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white"
            title="Close customer pole display"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Display Center: Split between Cart Summary and Mobile Payment QR Code */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 p-6 gap-6 overflow-hidden">
          {/* Left: Current Cart Items */}
          <div className="flex flex-col overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800/60 p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="font-extrabold text-sm uppercase tracking-wider text-slate-300">
                Articles en Cours ({cartItems.reduce((s, i) => s + i.qty, 0)})
              </span>
              <span className="text-[11px] text-teal-400 font-bold">Caisse Active</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12">
                  <ShoppingBag className="h-12 w-12 text-slate-700 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-bold">Bienvenue !</p>
                  <p className="text-xs text-slate-400">Présentez vos articles à la caisse.</p>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-slate-800/40 p-3 border border-slate-800"
                  >
                    <div>
                      <p className="font-bold text-slate-200 text-xs">{item.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {item.qty} x {formatFCFA(item.price, language)}
                      </p>
                    </div>
                    <span className="font-extrabold text-teal-400 text-sm">
                      {formatFCFA(item.total, language)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Total Footer */}
            <div className="border-t border-slate-800 pt-4 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-400">TOTAL À RÉGLER :</span>
                <span className="text-3xl font-black text-teal-400">
                  {formatFCFA(total, language)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Instant Mobile Payment Panel with QR & Codes */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-teal-500/20 p-6 text-center">
            <span className="rounded-full bg-teal-500/10 px-3 py-1 text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
              Paiement Sans Contact • Cameroun
            </span>
            <h3 className="text-lg font-black text-white">Scannez pour régler</h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xs">
              Validez directement sur votre téléphone via MTN Mobile Money ou Orange Money.
            </p>

            {/* High-Contrast Thermal / Screen QR Code Simulation */}
            <div className="my-5 rounded-2xl bg-white p-4 shadow-xl shadow-teal-500/5">
              <div className="h-44 w-44 bg-white flex flex-col items-center justify-center">
                {/* Visual SVG QR representation */}
                <svg viewBox="0 0 100 100" className="h-40 w-40 text-slate-900 fill-current">
                  {/* Outer corner markers */}
                  <rect x="5" y="5" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="11" y="11" width="13" height="13" />
                  <rect x="70" y="5" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="76" y="11" width="13" height="13" />
                  <rect x="5" y="70" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="11" y="76" width="13" height="13" />
                  {/* Interior data matrix pattern */}
                  <rect x="36" y="8" width="6" height="6" />
                  <rect x="48" y="14" width="8" height="6" />
                  <rect x="40" y="26" width="12" height="6" />
                  <rect x="10" y="38" width="8" height="8" />
                  <rect x="24" y="44" width="6" height="12" />
                  <rect x="36" y="38" width="16" height="16" />
                  <rect x="58" y="38" width="8" height="8" />
                  <rect x="72" y="44" width="14" height="6" />
                  <rect x="80" y="56" width="8" height="14" />
                  <rect x="38" y="60" width="8" height="18" />
                  <rect x="54" y="66" width="12" height="6" />
                  <rect x="72" y="76" width="16" height="12" />
                </svg>
              </div>
            </div>

            {/* Merchant Payment numbers */}
            <div className="w-full max-w-xs space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-amber-300">
                <span className="font-bold">MTN MoMo Marchand :</span>
                <span className="font-mono font-black">{organization.momoMerchantCode || '677 82 14 00'}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-orange-300">
                <span className="font-bold">Orange Money Marchand :</span>
                <span className="font-mono font-black">{organization.omMerchantCode || '699 33 21 55'}</span>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-500">
              Merci pour votre fidélité chez {organization.name} !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
