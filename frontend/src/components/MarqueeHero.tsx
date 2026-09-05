'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Star, Eye, Flame, Crown, Info } from 'lucide-react';
import { Anime } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface MarqueeHeroProps {
  trendingAnimes: Anime[];
}

export const MarqueeHero: React.FC<MarqueeHeroProps> = ({ trendingAnimes }) => {
  const { t, lang } = useLanguage();
  const { user, openVIPModal } = useAuth();
  const [activeAnime, setActiveAnime] = useState<Anime>(trendingAnimes[0] || null);

  if (!trendingAnimes || trendingAnimes.length === 0) return null;
  const current = activeAnime || trendingAnimes[0];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl mb-12 glass-panel border border-purple-500/20 shadow-2xl shadow-purple-950/20">
      {/* Dynamic Ambient Hero Backdrop */}
      <div className="relative min-h-[380px] sm:min-h-[440px] flex flex-col justify-end p-6 sm:p-10 z-10">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={current.poster_url}
            alt={current.title}
            className="w-full h-full object-cover object-center filter blur-md scale-105 opacity-40 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090A0F] via-[#090A0F]/60 to-transparent" />
        </div>

        {/* Featured Content Details */}
        <div className="relative z-10 max-w-2xl flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs">
              <Flame className="w-3.5 h-3.5 fill-red-400" />
              #1 TRENDING
            </span>

            {current.is_vip ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                VIP EXCLUSIVE
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white font-bold text-xs shadow-md">
                FREE STREAM
              </span>
            )}

            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 text-amber-400 text-xs font-bold border border-white/10">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {Number(current.rating || 0).toFixed(1)}
            </span>

            <span className="flex items-center gap-1 text-slate-300 text-xs font-medium">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              {Number(current.views_count || 0).toLocaleString()} {t('views')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-white">
            {current.title}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed max-w-xl">
            {current.description}
          </p>

          <div className="flex items-center gap-3 pt-2">
            {current.is_vip && (!user || !user.is_vip) ? (
              <button
                onClick={openVIPModal}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/30 hover:opacity-90 active:scale-95 transition-all"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                VIP Obuna Bilan Ko‘rish
              </button>
            ) : (
              <Link
                href={`/anime/${current.slug}`}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold text-sm shadow-xl shadow-purple-600/40 hover:opacity-95 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                {t('watch_now')}
              </Link>
            )}

            <Link
              href={`/anime/${current.slug}`}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all"
            >
              <Info className="w-4 h-4" />
              Batafsil
            </Link>
          </div>
        </div>
      </div>

      {/* Marquee Ticker moving smoothly to the left */}
      <div className="w-full bg-slate-950/60 border-t border-white/10 py-3 marquee-container overflow-hidden">
        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap will-change-transform">
          {/* Double list to create seamless infinite loop */}
          {[...trendingAnimes, ...trendingAnimes].map((anime, idx) => (
            <div
              key={`${anime.id}-${idx}`}
              onClick={() => setActiveAnime(anime)}
              className={`inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${
                current.id === anime.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              <img
                src={anime.poster_url}
                alt={anime.title}
                className="w-6 h-6 rounded-full object-cover border border-white/20"
              />
              <span className="text-xs font-bold max-w-[140px] truncate">{anime.title}</span>
              <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-400">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                {Number(anime.rating || 0).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
