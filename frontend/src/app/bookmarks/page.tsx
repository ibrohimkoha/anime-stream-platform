'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Sparkles, Flame, Play, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { AnimeCard } from '@/components/AnimeCard';
import { fetchAPI } from '@/lib/api';

export default function BookmarksPage() {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'free' | 'vip'>('all');

  useEffect(() => {
    // Load trending recommendations always
    fetchAPI('/animes/trending')
      .then((data) => setTrending(data.animes || []))
      .catch((e) => console.error(e));

    if (user) {
      setLoading(true);
      fetchAPI('/bookmarks')
        .then((data) => setBookmarks(data.bookmarks || []))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredBookmarks = bookmarks.filter((b) => {
    if (filter === 'free') return !b.anime?.is_vip;
    if (filter === 'vip') return b.anime?.is_vip;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-10 border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20 mb-3">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Kolleksiya</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-slate-900 dark:text-white">
            {t('nav_bookmarks') || 'Saqlangan Animelar'}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Sevimli animelaringiz to'plami. Istalgan vaqtda to'xtagan joyingizdan davom ettiring yoki yangi qismlarni tomosha qiling.
          </p>
        </div>
      </div>

      {/* When User is Logged In and Has Bookmarks */}
      {user && bookmarks.length > 0 ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Barchasi ({bookmarks.length})
            </button>
            <button
              onClick={() => setFilter('free')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'free'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tekin Animelar
            </button>
            <button
              onClick={() => setFilter('vip')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'vip'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              👑 VIP Animelar
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredBookmarks.map((b) => (
              <AnimeCard key={b.id} anime={b.anime} />
            ))}
          </div>
        </div>
      ) : (
        /* Empty / Guest State */
        <div className="space-y-12">
          <div className="rounded-3xl glass-card p-8 sm:p-12 text-center max-w-xl mx-auto border border-purple-500/20 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-purple-600/30 mb-4 animate-pulse-subtle">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-black font-heading text-slate-900 dark:text-white">
              {user ? "Hozircha saqlangan animelar yo'q" : "Kolleksiyangizni ko'rish uchun tizimga kiring"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
              {user
                ? "Katalogdagi animelarga o'ting va sevimli animelaringizni 'Saqlab olish' tugmasi orqali kolleksiyangizga qo'shing."
                : "Bir zumda hisobingizga kiring va saqlab qo'yilgan barcha animelaringizdan har qanday qurilmada foydalaning."}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {!user ? (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Tizimga Kirish</span>
                </button>
              ) : null}
              <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-xs sm:text-sm border border-slate-200 dark:border-white/10 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Katalogga O'tish</span>
              </Link>
            </div>
          </div>

          {/* Trending Recommendations Section */}
          {trending.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black font-heading text-slate-900 dark:text-white">
                    Sizga Yoqishi Mumkin (Trend Animelar)
                  </h2>
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <span>Barchasini ko'rish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
                {trending.slice(0, 6).map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
