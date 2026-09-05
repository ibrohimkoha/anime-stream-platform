'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Play, Eye, Crown, Lock } from 'lucide-react';
import { Anime } from '@/lib/api';
import { FreeCountdown } from '@/components/FreeCountdown';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface AnimeCardProps {
  anime: Anime;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const { user, openVIPModal } = useAuth();
  const { t, lang } = useLanguage();

  const isLocked = anime.is_vip && (!user || !user.is_vip);

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden glass-card">
      {/* Poster Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
        <img
          src={anime.poster_url}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {anime.is_vip ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30">
              <Crown className="w-3 h-3 fill-slate-950" />
              VIP
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white font-bold text-xs shadow-md">
              FREE
            </span>
          )}
        </div>

        {/* Rating & Views */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/75 text-amber-400 font-bold text-xs border border-white/10 backdrop-blur-md">
            <Star className="w-3 h-3 fill-amber-400" />
            {Number(anime.rating || 0).toFixed(1)}
          </span>
        </div>

        {/* Free Release Countdown if VIP */}
        {anime.is_vip && anime.free_at && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <FreeCountdown freeAt={anime.free_at} />
          </div>
        )}

        {/* Quick Play Hover Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
          {isLocked ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                openVIPModal();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/50 hover:bg-amber-400 transition-transform active:scale-95"
            >
              <Lock className="w-4 h-4" />
              VIP Olish
            </button>
          ) : (
            <Link
              href={`/anime/${anime.slug}`}
              className="w-13 h-13 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-xl shadow-purple-600/50 backdrop-blur-md transition-transform transform group-hover:scale-110 active:scale-95 p-3.5"
            >
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <Link href={`/anime/${anime.slug}`}>
            <h3 className="font-bold text-sm sm:text-base line-clamp-1 hover:text-purple-400 transition-colors">
              {anime.title}
            </h3>
          </Link>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {anime.genres?.slice(0, 2).map((g) => (
              <span
                key={g.id}
                className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 dark:bg-white/5 light:bg-slate-200 text-slate-400 light:text-slate-600 border border-white/5"
              >
                {lang === 'en' ? g.name_en : lang === 'ru' ? g.name_ru : g.name_uz}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 light:text-slate-500 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            {Number(anime.views_count || 0).toLocaleString()}
          </span>
          <span className="font-medium text-slate-500">{anime.release_year}</span>
        </div>
      </div>
    </div>
  );
};
