'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Crown, Film, ChevronRight } from 'lucide-react';
import { Anime, fetchAPI } from '@/lib/api';
import { MarqueeHero } from '@/components/MarqueeHero';
import { AnimeCard } from '@/components/AnimeCard';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();
  const [trending, setTrending] = useState<Anime[]>([]);
  const [freeAnimes, setFreeAnimes] = useState<Anime[]>([]);
  const [vipAnimes, setVipAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendData, freeData, vipData] = await Promise.all([
          fetchAPI('/animes/trending'),
          fetchAPI('/animes/free?limit=12'),
          fetchAPI('/animes/vip'),
        ]);
        setTrending(trendData.animes || []);
        setFreeAnimes(freeData.animes || []);
        setVipAnimes(vipData.animes || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Marquee Slider (Most viewed moving to the left) */}
      <MarqueeHero trendingAnimes={trending} />

      {/* 1. Free Animes Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading">
                {t('free_animes_title')}
              </h2>
              <p className="text-xs text-slate-400">
                Barcha foydalanuvchilar uchun 100% tekin tomosha
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {freeAnimes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </section>

      {/* 2. Paid / VIP Animes Section with Free-Release Countdown */}
      <section className="flex flex-col gap-6 p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-amber-300">
                {t('vip_animes_title')}
              </h2>
              <p className="text-xs text-slate-300">
                Eksklyuziv premyeralar. Belgilangan sana yetgach hammaga bepul ochiladi!
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {vipAnimes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
