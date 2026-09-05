'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Flame, Grid, Bookmark, Crown } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Asosiy', icon: Sparkles },
    { href: '/top', label: 'Top', icon: Flame },
    { href: '/genres', label: 'Janrlar', icon: Grid },
    { href: '/bookmarks', label: 'Saqlangan', icon: Bookmark },
    { href: '/vip', label: 'VIP', icon: Crown, isVip: true },
  ];

  if (pathname.startsWith('/admin')) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-2.5 pointer-events-none">
      <nav className="pointer-events-auto max-w-sm mx-auto rounded-3xl glass-panel bg-slate-950/90 dark:bg-slate-950/90 light:bg-white/95 border border-slate-700/60 dark:border-white/10 light:border-slate-200 shadow-2xl p-1.5 flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isVip) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center py-1 px-2.5 group transition-transform active:scale-95"
              >
                <div className="w-11 h-11 -mt-6 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/40 ring-4 ring-slate-950 dark:ring-slate-950 light:ring-white">
                  <Crown className="w-5 h-5 fill-slate-950" />
                </div>
                <span className="text-[10px] font-black text-amber-500 dark:text-amber-400 mt-0.5">
                  VIP
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all active:scale-95 ${
                isActive
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-purple-600/15 dark:bg-purple-500/20' : ''}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${isActive ? 'font-black' : 'font-semibold'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 shadow-sm shadow-purple-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
