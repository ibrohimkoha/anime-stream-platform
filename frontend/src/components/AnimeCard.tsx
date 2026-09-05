'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Crown, Play, Clock, Bookmark } from 'lucide-react';
import { FreeCountdown } from '@/components/FreeCountdown';

export interface AnimeCardProps {
  anime: {
    id: number;
    title: string;
    original_title?: string;
    slug: string;
    poster_url: string;
    rating: number;
    views_count: number;
    is_vip: boolean;
    free_at?: string | null;
    status: string;
    release_year?: number;
    genres?: Array<{ id: number; name_uz: string; name_en: string; name_ru: string; slug: string }>;
  };
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  return (
    <div className="group relative flex flex-col rounded-3xl glass-card overflow-hidden transition-all duration-300">
      {/* Poster Media Box */}
      <Link href={`/anime/${anime.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-slate-800">
        <img
          src={anime.poster_url}
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Status or Year Pill */}
          <span className="px-2 py-0.5 rounded-lg bg-slate-950/70 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-white/10 uppercase tracking-wider">
            {anime.release_year || '2024'}
          </span>

          {/* Rating Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-black text-amber-400 border border-amber-500/30 shadow-md">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{anime.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl shadow-purple-600/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Poster VIP & Countdown Badges */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-col gap-1 pointer-events-none">
          {anime.is_vip ? (
            <div className="flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black shadow-md shadow-amber-500/30">
                <Crown className="w-3 h-3 fill-slate-950" /> VIP
              </span>

              {anime.free_at && (
                <div className="px-2 py-0.5 rounded-xl bg-cyan-950/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[10px] font-bold font-mono">
                  <FreeCountdown targetDate={anime.free_at} />
                </div>
              )}
            </div>
          ) : (
            <span className="self-start px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              Bepul
            </span>
          )}
        </div>
      </Link>

      {/* Info Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <Link href={`/anime/${anime.slug}`}>
            <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {anime.title}
            </h3>
          </Link>
          {anime.original_title && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
              {anime.original_title}
            </p>
          )}
        </div>

        {/* Genres */}
        {anime.genres && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {anime.genres.slice(0, 2).map((g) => (
              <span
                key={g.id}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/5"
              >
                {g.name_uz || g.name_en}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
