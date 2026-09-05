'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-sm font-heading">
            ⛩️
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white">{t('brand_name')}</h4>
            <p className="text-[11px] text-slate-500">Eng so‘nggi va yuqori sifatli anime striming platformasi</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">{t('nav_home')}</Link>
          <Link href="/top" className="hover:text-white transition-colors">{t('nav_top')}</Link>
          <Link href="/genres" className="hover:text-white transition-colors">{t('nav_genres')}</Link>
          <Link href="/discussions" className="hover:text-white transition-colors">{t('nav_discussions')}</Link>
          <Link href="/vip" className="hover:text-amber-400 transition-colors font-semibold">VIP Obuna</Link>
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Nokori Stream. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
};
