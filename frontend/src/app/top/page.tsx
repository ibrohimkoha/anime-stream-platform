'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Star } from 'lucide-react';
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            {tab === 'views' ? '🔥 Eng Ko‘p Ko‘rilgan Animelar' : '⭐ Eng Yuqori Reytingli Animelar'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tomoshabinlar e‘tirofiga sazovor bo‘lgan eng sara anime to‘plami
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10 w-fit">
          <button
            onClick={() => setTab('views')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'views' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Eng Ko‘p Ko‘rilgan
          </button>
          <button
            onClick={() => setTab('rating')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'rating' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Top Reyting
          </button>
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
          {displayList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </div>
  );
}
