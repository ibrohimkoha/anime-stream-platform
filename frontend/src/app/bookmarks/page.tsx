'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { Anime, fetchAPI } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function BookmarksPage() {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const loadBookmarks = async () => {
      try {
        const data = await fetchAPI('/bookmarks');
        setAnimes(data.animes || []);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, [user]);

  if (!user) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
        <div className="p-4 rounded-3xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
          <Bookmark className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-white">Saqlangan Animelarni Ko‘rish</h2>
        <p className="text-slate-400 text-xs max-w-sm">
          Sevimli animelaringizni saqlab qo‘yish va keyinroq tomosha qilish uchun tizimga kiring.
        </p>
        <button
          onClick={openAuthModal}
          className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
        >
          {t('login')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white flex items-center gap-3">
          <Bookmark className="w-7 h-7 text-purple-400" />
          {t('nav_bookmarks')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Siz tomosha qilish uchun saqlab olgan shaxsiy to‘plamingiz ({animes.length} ta anime)
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : animes.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl p-8 flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-slate-500" />
          <p className="text-slate-300 font-semibold text-sm">Hozircha hech qanday anime saqlanmagan</p>
          <p className="text-slate-500 text-xs">Anime sahifasidagi "Saqlab olish" tugmasini bosing</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </div>
  );
}
