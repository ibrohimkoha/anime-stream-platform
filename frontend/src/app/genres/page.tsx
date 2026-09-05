'use client';

import React, { useEffect, useState } from 'react';
import { Grid, Filter, Sparkles } from 'lucide-react';
import { Anime, Genre, fetchAPI } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { useLanguage } from '@/context/LanguageContext';

export default function GenresPage() {
  const { lang, t } = useLanguage();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await fetchAPI('/animes/genres');
        setGenres(data.genres || []);
      } catch (err) {
        console.error('Error loading genres:', err);
      }
    };
    loadGenres();
  }, []);

  useEffect(() => {
    const loadAnimes = async () => {
      setLoading(true);
      try {
        const query = selectedGenre === 'all' ? '' : `?genre=${selectedGenre}`;
        const data = await fetchAPI(`/animes/free${query}`);
        setAnimes(data.animes || []);
      } catch (err) {
        console.error('Error loading animes by genre:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnimes();
  }, [selectedGenre]);

  const getGenreName = (g: Genre) => {
    if (lang === 'uz') return g.name_uz;
    if (lang === 'ru') return g.name_ru;
    return g.name_en;
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20 mb-2">
          <Grid className="w-3.5 h-3.5" />
          <span>KATALOG & KATEGORIYALAR</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
          {t('nav_genres') || 'Anime Janrlari'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
          O‘zingiz yoqtirgan janr bo‘yicha eng yaxshi animelarni tanlang va saralang
        </p>
      </div>

      {/* Genre Pills list */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGenre('all')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            selectedGenre === 'all'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-black'
              : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10'
          }`}
        >
          ✨ Barchasi
        </button>
        {genres.map((g) => {
          const isSelected = selectedGenre === g.slug;
          return (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.slug)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-black'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10'
              }`}
            >
              {getGenreName(g)}
            </button>
          );
        })}
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="aspect-[3/4] rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : animes.length === 0 ? (
        <div className="text-center py-16 rounded-3xl glass-card border border-slate-200 dark:border-white/10 p-8">
          <p className="text-slate-600 dark:text-slate-400 font-bold text-sm">
            Ushbu janrda hozircha animelar topilmadi
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
          {animes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </div>
  );
}
