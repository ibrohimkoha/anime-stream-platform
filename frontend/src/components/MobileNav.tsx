'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Flame, Grid, Bookmark, Crown, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const items = [
    { href: '/', label: t('nav_home') || 'Asosiy', icon: Sparkles },
    { href: '/top', label: t('nav_top') || 'Top', icon: Flame },
    { href: '/genres', label: t('nav_genres') || 'Janrlar', icon: Grid },
    { href: '/bookmarks', label: t('nav_bookmarks') || 'Saqlangan', icon: Bookmark },
    { href: '/vip', label: 'VIP', icon: Crown, isVip: true },
  ];

  // Don't show in admin paths
  if (pathname.startsWith('/admin')) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pointer-events-none">
      <nav className="pointer-events-auto max-w-md mx-auto rounded-3xl glass-panel bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/95 border border-slate-700/50 dark:border-white/10 light:border-slate-200/90 shadow-2xl p-1.5 flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isVip) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl group transition-transform active:scale-95"
              >
                <div className="w-10 h-10 -mt-5 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/40 ring-4 ring-slate-900 dark:ring-slate-900 light:ring-white">
                  <Crown className="w-5 h-5 fill-slate-950" />
                </div>
                <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 mt-1">
                  VIP
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all active:scale-95 ${
                isActive
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-purple-600/15 dark:bg-purple-500/20' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
