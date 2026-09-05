'use client';

import React, { useEffect, useState } from 'react';
import { Crown, Check, ShieldCheck, Zap, Star, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col items-center gap-10 max-w-5xl mx-auto py-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="p-4 rounded-3xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-xl shadow-amber-500/20">
          <Crown className="w-10 h-10 fill-amber-500" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CHEKSIZ IMKONIYATLAR</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-slate-900 dark:text-white">
          VIP Premium Obuna
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
          Eksklyuziv premyera animelarni eng birinchilardan bo‘lib, 1080p / 4K formatda va reklamasiz tomosha qiling!
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {plans.map((p, idx) => {
          const isFeatured = idx === 1; // e.g. 3 oylik
          return (
            <div
              key={p.id}
              className={`relative p-6 rounded-3xl glass-card flex flex-col justify-between items-center text-center gap-5 border transition-all ${
                isFeatured
                  ? 'border-amber-500 shadow-xl shadow-amber-500/15 bg-amber-500/5 dark:bg-amber-500/10 scale-105'
                  : 'border-slate-200 dark:border-white/10 hover:border-amber-500/40'
              }`}
            >
              {isFeatured && (
                <span className="absolute -top-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                  Eng Mashhur
                </span>
              )}

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {p.days} kunlik to'liq kirish
                </p>
              </div>

              <div>
                <p className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {p.price_uzs.toLocaleString()}
                </p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">UZS</p>
              </div>

              <ul className="space-y-2 text-left w-full text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200/80 dark:border-white/10 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>Barcha VIP animelar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>1080p FHD & 4K pleyer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>Reklamasiz tomosha</span>
                </li>
              </ul>

              <button
                onClick={openVIPModal}
                className={`w-full py-3 rounded-2xl font-black text-xs transition-all active:scale-95 ${
                  isFeatured
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : 'bg-slate-100 dark:bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10'
                }`}
              >
                Tanlash & Xarid Qilish
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
