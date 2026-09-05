'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Star, Award, TrendingUp } from 'lucide-react';
import { Anime, fetchAPI } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { useLanguage } from '@/context/LanguageContext';

export default function TopPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'views' | 'rating'>('views');
  const [trending, setTrending] = useState<Anime[]>([]);
  const [topRated, setTopRated] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendData, ratedData] = await Promise.all([
          fetchAPI('/animes/trending'),
          fetchAPI('/animes/top-rated'),
        ]);
        setTrending(trendData.animes || []);
        setTopRated(ratedData.animes || []);
      } catch (err) {
        console.error('Failed to load top animes:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const displayList = tab === 'views' ? trending : topRated;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>TOP CHARTLAR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
            {tab === 'views' ? '🔥 Eng Ko‘p Ko‘rilgan Animelar' : '⭐ Eng Yuqori Reytingli Animelar'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Tomoshabinlar e‘tirofiga sazovor bo‘lgan eng sara animelar reytingi
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-white/5 p-1 border border-slate-200 dark:border-white/10 w-fit">
          <button
            onClick={() => setTab('views')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'views'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Eng Ko‘p Ko‘rilgan</span>
          </button>
          <button
            onClick={() => setTab('rating')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'rating'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Reytingi Yuqori</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="aspect-[3/4] rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
          {displayList.map((anime, index) => (
            <div key={anime.id} className="relative">
              {/* Rank Pill */}
              <div className="absolute -top-2 -left-2 z-20 w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-purple-600/40 ring-2 ring-white dark:ring-slate-900">
                #{index + 1}
              </div>
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
