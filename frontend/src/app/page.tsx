'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Crown, Film, ChevronRight, Grid, Flame, Star, ArrowRight } from 'lucide-react';
import { Anime, fetchAPI } from '@/lib/api';
import { MarqueeHero } from '@/components/MarqueeHero';
import { AnimeCard } from '@/components/AnimeCard';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();
  const [trending, setTrending] = useState<Anime[]>([]);
  const [freeAnimes, setFreeAnimes] = useState<Anime[]>([]);
  const [vipAnimes, setVipAnimes] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendData, freeData, vipData, genresData] = await Promise.all([
          fetchAPI('/animes/trending'),
          fetchAPI('/animes/free?limit=12'),
          fetchAPI('/animes/vip'),
          fetchAPI('/animes/genres').catch(() => ({ genres: [] })),
        ]);
        setTrending(trendData.animes || []);
        setFreeAnimes(freeData.animes || []);
        setVipAnimes(vipData.animes || []);
        setGenres(genresData.genres || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-10 sm:gap-14 animate-fade-in">
      {/* 1. Hero Marquee Slider */}
      <MarqueeHero trendingAnimes={trending} />

      {/* 2. Quick Genre Chips Bar */}
      {genres.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href="/genres"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-purple-600 text-white text-xs font-bold shrink-0 shadow-md shadow-purple-600/20"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Barcha Janrlar</span>
          </Link>
          {genres.slice(0, 8).map((g) => (
            <Link
              key={g.id}
              href={`/genres?genre=${g.slug}`}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-purple-600/15 hover:text-purple-600 dark:hover:text-purple-400 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/80 dark:border-white/10 shrink-0 transition-colors"
            >
              {g.name_uz || g.name_en}
            </Link>
          ))}
        </div>
      )}

      {/* 3. Paid / VIP Animes Section with Free-Release Countdown */}
      <section className="flex flex-col gap-6 p-5 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-b from-amber-500/10 dark:from-amber-500/5 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40">
              <Crown className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white">
                  {t('vip_animes_title') || '👑 VIP & Eksklyuziv Premyeralar'}
                </h2>
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black border border-amber-500/30">
                  PREMIUM
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Eksklyuziv premyeralar. Belgilangan sana yetgach hammaga bepul ochiladi!
              </p>
            </div>
          </div>

          <Link
            href="/vip"
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <span>VIP Tariflar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="aspect-[3/4] rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
            {vipAnimes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Free Animes Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-600/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white">
                  {t('free_animes_title') || '🎬 Tekin Animelar Katalogi'}
                </h2>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  BEPUL
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Barcha foydalanuvchilar uchun 100% cheklovlarsiz yuqori sifatda tomosha
              </p>
            </div>
          </div>

          <Link
            href="/genres"
            className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            <span>Barchasi</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="aspect-[3/4] rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
            {freeAnimes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
