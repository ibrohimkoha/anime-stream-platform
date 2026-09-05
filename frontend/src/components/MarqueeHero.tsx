'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Star, Eye, Flame, Crown, Info, Sparkles } from 'lucide-react';
import { Anime } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface MarqueeHeroProps {
  trendingAnimes: Anime[];
}

export const MarqueeHero: React.FC<MarqueeHeroProps> = ({ trendingAnimes }) => {
  const { t } = useLanguage();
  const { user, openVIPModal } = useAuth();
  const [activeAnime, setActiveAnime] = useState<Anime>(trendingAnimes[0] || null);

  if (!trendingAnimes || trendingAnimes.length === 0) return null;
  const current = activeAnime || trendingAnimes[0];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl mb-8 sm:mb-12 glass-panel border border-purple-500/20 shadow-2xl shadow-purple-950/20">
      {/* Dynamic Ambient Hero Spotlight */}
      <div className="relative min-h-[360px] sm:min-h-[460px] flex flex-col justify-end p-5 sm:p-10 z-10">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={current.poster_url}
            alt={current.title}
            className="w-full h-full object-cover object-center filter blur-md scale-105 opacity-50 dark:opacity-40 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        {/* Featured Anime Content Details */}
        <div className="relative z-10 max-w-2xl flex flex-col gap-3 sm:gap-4 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/25 text-red-400 border border-red-500/40 font-black text-[11px] shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-red-400" />
              #1 TRENDING
            </span>

            {current.is_vip ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[11px] shadow-md shadow-amber-500/30">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                VIP EKSKLYUZIV
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-[11px] shadow-md shadow-emerald-500/30">
                BEPUL TOMOSHA
              </span>
            )}

            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-400 text-[11px] font-black border border-white/15">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {Number(current.rating || 0).toFixed(1)}
            </span>

            <span className="flex items-center gap-1 text-slate-300 text-xs font-medium">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              {Number(current.views_count || 0).toLocaleString()} ko'rishlar
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-heading text-white drop-shadow-md">
            {current.title}
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
            {current.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {current.is_vip && (!user || !user.is_vip) ? (
              <button
                onClick={openVIPModal}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 active:scale-95 transition-all"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                VIP Obuna Bilan Ko'rish
              </button>
            ) : (
              <Link
                href={`/anime/${current.slug}`}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-600/40 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Tomosha Qilish</span>
              </Link>
            )}

            <Link
              href={`/anime/${current.slug}`}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all"
            >
              <Info className="w-4 h-4" />
              <span>Batafsil</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Infinite Smooth Marquee moving to the left */}
      <div className="w-full bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-900 border-t border-white/10 py-3 marquee-container overflow-hidden">
        <div className="flex items-center gap-3 animate-marquee whitespace-nowrap will-change-transform">
          {[...trendingAnimes, ...trendingAnimes].map((anime, idx) => {
            const isSelected = current.id === anime.id;
            return (
              <div
                key={`${anime.id}-${idx}`}
                onClick={() => setActiveAnime(anime)}
                className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 scale-105 font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                }`}
              >
                <img
                  src={anime.poster_url}
                  alt={anime.title}
                  className="w-6 h-6 rounded-lg object-cover ring-1 ring-white/20"
                />
                <span className="text-xs font-bold max-w-[150px] truncate">{anime.title}</span>
                <span className="flex items-center gap-0.5 text-[11px] font-black text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {Number(anime.rating || 0).toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
