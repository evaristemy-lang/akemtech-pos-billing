import React, { useState } from 'react';
import { Truck, CheckCircle2, Clock, MapPin, Phone, User, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA, formatCameroonPhone } from '../../utils/formatters';
import { DeliveryOrder } from '../../types';

export const DeliveryManager: React.FC = () => {
  const { deliveries, language, addNotification } = useApp();
  const t = translations[language];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t.deliveries} & Expéditions
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {language === 'fr'
            ? 'Dispatching des livraisons par camions et moto-taxis (Douala / Yaoundé)'
            : 'Delivery fleet dispatching and proof of delivery tracking'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deliveries.map(del => (
          <div
            key={del.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{del.orderNumber}</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white mt-0.5">{del.customerName}</h4>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    del.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : del.status === 'out_for_delivery'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {del.status}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{del.address}, {del.city}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatCameroonPhone(del.customerPhone)}</span>
                </div>
                {del.driverName && (
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                    <Truck className="h-3.5 w-3.5 text-teal-600" />
                    <span>Livreur : {del.driverName}</span>
                  </div>
                )}
                {del.notes && <p className="text-[11px] text-slate-400 italic">"{del.notes}"</p>}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Frais : {formatFCFA(del.deliveryFee, language)}
              </span>
              <button
                onClick={() =>
                  addNotification({
                    title: language === 'fr' ? 'Livraison confirmée' : 'Delivery Confirmed',
                    message: language === 'fr'
                      ? `Livraison ${del.orderNumber} marquée comme livrée avec succès.`
                      : `Delivery ${del.orderNumber} marked as delivered.`,
                    type: 'success',
                  })
                }
                className="rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300"
              >
                {language === 'fr' ? 'Confirmer Réception' : 'Mark Delivered'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
