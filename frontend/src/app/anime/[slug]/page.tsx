'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Star,
  Eye,
  Bookmark,
  Crown,
  Play,
  Share2,
  Clock,
  MessageSquare,
  Send,
  Lock,
  Film,
  Check,
  Sparkles,
} from 'lucide-react';
import { Anime, Episode, Comment, fetchAPI } from '@/lib/api';
import { VideoPlayer } from '@/components/VideoPlayer';
import { FreeCountdown } from '@/components/FreeCountdown';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AnimeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user, openVIPModal, openAuthModal } = useAuth();
  const { t, lang } = useLanguage();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const loadAnime = async () => {
      try {
        const data = await fetchAPI(`/animes/${slug}`);
        setAnime(data.anime);
        setIsBookmarked(data.is_bookmarked);
        setUserRating(data.user_rating || 0);

        if (data.anime?.episodes && data.anime.episodes.length > 0) {
          setSelectedEpisode(data.anime.episodes[0]);
        }

        // Load comments
        if (data.anime?.id) {
          const comRes = await fetchAPI(`/forum/comments?anime_id=${data.anime.id}`);
          setComments(comRes.comments || []);
        }
      } catch (err) {
        console.error('Failed to load anime details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnime();
  }, [slug]);

  const handleToggleBookmark = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!anime) return;
    try {
      const res = await fetchAPI('/bookmarks/toggle', {
        method: 'POST',
        body: JSON.stringify({ anime_id: anime.id }),
      });
      setIsBookmarked(res.is_bookmarked);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleRate = async (score: number) => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!anime) return;
    try {
      const res = await fetchAPI('/ratings', {
        method: 'POST',
        body: JSON.stringify({ anime_id: anime.id, score }),
      });
      setUserRating(res.new_score);
      setAnime({ ...anime, rating: res.avg_score });
    } catch (err) {
      console.error('Rating error:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!commentText.trim() || !anime) return;

    try {
      const res = await fetchAPI('/forum/comments', {
        method: 'POST',
        body: JSON.stringify({
          anime_id: anime.id,
          content: commentText,
          is_spoiler: isSpoiler,
        }),
      });
      setComments([...comments, res.comment]);
      setCommentText('');
      setIsSpoiler(false);
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">Anime ma‘lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="py-24 text-center rounded-3xl glass-card border border-slate-200 dark:border-white/10 p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-black font-heading text-slate-900 dark:text-white">Anime topilmadi</h2>
        <p className="text-slate-500 text-xs mt-1">Ushbu anime mavjud emas yoki o'chirilgan.</p>
      </div>
    );
  }

  const isLocked = anime.is_vip && (!user || !user.is_vip);
  const activeVideoUrl =
    selectedEpisode?.video_url ||
    anime.trailer_video_url ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {/* 1. Video Player Section */}
      <div className="flex flex-col gap-4">
        {isLocked ? (
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass-panel border border-amber-500/40 flex flex-col items-center justify-center p-6 text-center gap-4 bg-gradient-to-b from-amber-500/15 via-slate-950/90 to-slate-950">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-xl shadow-amber-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <div className="max-w-md text-white">
              <h3 className="text-xl sm:text-2xl font-black text-amber-300 font-heading">
                VIP Premyera Qismi
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Ushbu epizodni tomosha qilish uchun VIP a‘zolik talab etiladi.
              </p>
              {anime.free_at && (
                <div className="mt-3 flex justify-center">
                  <FreeCountdown targetDate={anime.free_at} />
                </div>
              )}
            </div>
            <button
              onClick={openVIPModal}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/40 hover:opacity-95 active:scale-95 transition-all"
            >
              VIP Obuna Olish
            </button>
          </div>
        ) : (
          <VideoPlayer
            videoUrl={activeVideoUrl}
            posterUrl={selectedEpisode?.thumbnail_url || anime.poster_url}
            title={`${anime.title} - ${selectedEpisode ? `${selectedEpisode.episode_number}-qism` : 'Treyler'}`}
          />
        )}
      </div>

      {/* 2. Anime Meta & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {anime.is_vip ? (
                <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20">
                  <Crown className="w-3.5 h-3.5 fill-slate-950" />
                  VIP EKSKLYUZIV
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-black text-xs shadow-md">
                  BEPUL
                </span>
              )}

              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-amber-500 dark:text-amber-400 text-xs font-black border border-slate-200 dark:border-white/10">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {Number(anime.rating || 0).toFixed(1)} / 10
              </span>

              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <Eye className="w-3.5 h-3.5 text-purple-500" />
                {Number(anime.views_count || 0).toLocaleString()} ko'rishlar
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white">
              {anime.title}
            </h1>
            {anime.original_title && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {anime.original_title}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 my-2">
              {anime.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-purple-600 dark:text-purple-300 font-bold"
                >
                  {lang === 'en' ? g.name_en : lang === 'ru' ? g.name_ru : g.name_uz}
                </span>
              ))}
            </div>

            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {anime.description}
            </p>
          </div>

          {/* Action Buttons: Bookmark, Rating, Share */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              onClick={handleToggleBookmark}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isBookmarked
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
              <span>{isBookmarked ? 'Saqlangan' : 'Saqlab olish'}</span>
            </button>

            {/* 1-10 Rating Stars */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mr-1">
                Baholash:
              </span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className={`p-0.5 hover:scale-125 transition-transform ${
                    userRating >= star ? 'text-amber-400' : 'text-slate-400 dark:text-slate-600'
                  }`}
                  title={`${star} ball`}
                >
                  <Star className={`w-3.5 h-3.5 ${userRating >= star ? 'fill-amber-400' : ''}`} />
                </button>
              ))}
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-bold ml-auto transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Nusxalandi' : 'Ulashish'}</span>
            </button>
          </div>

          {/* Episode List Selector */}
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-500" />
              <h3 className="text-base sm:text-lg font-black font-heading text-slate-900 dark:text-white">
                Epizodlar & Qismlar
              </h3>
              <span className="text-xs text-slate-500 font-medium">({anime.episodes?.length || 0} ta qism)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {anime.episodes?.map((ep) => {
                const isActive = selectedEpisode?.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => setSelectedEpisode(ep)}
                    className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-102 font-black'
                        : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{ep.episode_number}-qism</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Poster & Info Card */}
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl overflow-hidden glass-panel p-4 border border-slate-200 dark:border-white/10 shadow-xl">
            <img
              src={anime.poster_url}
              alt={anime.title}
              className="w-full aspect-[3/4] object-cover rounded-2xl"
            />
            <div className="mt-4 flex flex-col gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex justify-between py-1.5 border-b border-slate-200/80 dark:border-white/5">
                <span className="text-slate-500">Holati:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{anime.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/80 dark:border-white/5">
                <span className="text-slate-500">Chiqarilgan yili:</span>
                <span className="font-bold text-slate-900 dark:text-white">{anime.release_year}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/80 dark:border-white/5">
                <span className="text-slate-500">Qismlar:</span>
                <span className="font-bold text-slate-900 dark:text-white">{anime.episodes?.length || 0} ta</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Comments & Discussion Section */}
      <section className="flex flex-col gap-6 p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          <h3 className="text-xl font-black font-heading text-slate-900 dark:text-white">Fikr va Izohlar</h3>
          <span className="text-xs text-slate-500 font-bold">({comments.length})</span>
        </div>

        {/* Comment input form */}
        <form onSubmit={handleAddComment} className="flex flex-col gap-3">
          <textarea
            required
            rows={3}
            placeholder="Anime haqidagi fikringizni yozing..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white placeholder-slate-400"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 font-medium">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="rounded accent-purple-600"
              />
              <span>⚠️ Spoyler (Spoiler) ogohlantirishi</span>
            </label>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/30 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Yuborish</span>
            </button>
          </div>
        </form>

        {/* Comment List */}
        <div className="flex flex-col gap-3 mt-2">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Hozircha hech kim izoh qoldirmagan. Birinchi bo‘ling!
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={c.user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.user?.name || 'User'}`}
                      alt={c.user?.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-purple-500/30"
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{c.user?.name || 'Foydalanuvchi'}</span>
                    {c.user?.is_vip && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black border border-amber-500/30">
                        VIP
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p
                  className={`text-xs text-slate-700 dark:text-slate-300 leading-relaxed ${
                    c.is_spoiler ? 'filter blur-sm hover:blur-none transition-all cursor-pointer' : ''
                  }`}
                >
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
