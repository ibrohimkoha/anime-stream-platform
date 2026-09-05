'use client';

import React, { useEffect, useState } from 'react';
import { Crown, Check, ShieldCheck, Zap, Star } from 'lucide-react';
import { VIPPlan, PaymentSetting, fetchAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function VIPPage() {
  const { openVIPModal, user } = useAuth();
  const { t } = useLanguage();
  const [plans, setPlans] = useState<VIPPlan[]>([]);
  const [paymentSetting, setPaymentSetting] = useState<PaymentSetting | null>(null);

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const data = await fetchAPI('/vip/info');
        setPlans(data.plans || []);
        setPaymentSetting(data.payment_setting || null);
      } catch (err) {
        console.error('VIP page error:', err);
      }
    };
    loadInfo();
  }, []);

  return (
    <div className="flex flex-col items-center gap-12 max-w-4xl mx-auto text-center py-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <div className="p-4 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xl shadow-amber-500/20">
          <Crown className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-amber-400">
          {t('vip_modal_title')}
        </h1>
        <p className="text-slate-300 text-sm max-w-xl">
          Eksklyuziv premyera animelarni eng birinchilardan bo‘lib, 1080p FHD formatda va hech qanday reklamasiz tomosha qiling!
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {plans.map((p) => (
          <div
            key={p.id}
            className="p-6 rounded-3xl glass-card flex flex-col justify-between items-center text-center gap-4 border border-white/10 hover:border-amber-500/50 transition-all"
          >
            {p.badge && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-bold shadow">
                {p.badge}
              </span>
            )}
            <h3 className="text-lg font-bold text-white font-heading">{p.name}</h3>
            <div>
              <p className="text-2xl font-black text-amber-400">{p.price_uzs.toLocaleString()}</p>
              <p className="text-xs text-slate-400">UZS / {p.days} kun</p>
            </div>

            <ul className="text-xs text-slate-300 flex flex-col gap-2 text-left w-full my-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Barcha VIP premyeralar
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                1080p Full HD Sifat
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                0 ta reklama
              </li>
            </ul>

            <button
              onClick={openVIPModal}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Ulanish
            </button>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full mt-4">
        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-2">
          <Zap className="w-8 h-8 text-amber-400 mb-1" />
          <h4 className="font-bold text-sm text-white">Tezkor Faollashuv</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Chekingiz yuklangach 5-15 daqiqa ichida administrator tomonidan tekshirilib profilga biriktiriladi.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-2">
          <ShieldCheck className="w-8 h-8 text-purple-400 mb-1" />
          <h4 className="font-bold text-sm text-white">100% Xavfsiz To‘lov</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            O‘zbekistonning istalgan bank kartasi (Uzcard, Humo, Visa) orqali to‘lovni amalga oshirishingiz mumkin.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-2">
          <Star className="w-8 h-8 text-pink-400 mb-1" />
          <h4 className="font-bold text-sm text-white">Doimiy Bepulga O‘tish</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            VIP animelar belgilangan sana hisoblagichi tugagach avtomatik barcha uchun bepul bo‘ladi.
          </p>
        </div>
      </div>
    </div>
  );
}
