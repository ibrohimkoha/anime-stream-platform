'use client';

import React, { useEffect, useState } from 'react';
import { Grid, Filter } from 'lucide-react';
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white flex items-center gap-3">
          <Grid className="w-7 h-7 text-purple-400" />
          {t('nav_genres')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          O‘zingiz yoqtirgan janr bo‘yicha eng yaxshi animelarni tanlang
        </p>
      </div>

      {/* Genre Pills list */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGenre('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedGenre === 'all'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
          }`}
        >
          Barchasi (All)
        </button>

        {genres.map((g) => {
          const isSelected = selectedGenre === g.slug;
          return (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {lang === 'en' ? g.name_en : lang === 'ru' ? g.name_ru : g.name_uz}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : animes.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Ushbu janr bo‘yicha hozircha animelar mavjud emas.
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
