'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Plus, Heart, MessageCircle, Send, Sparkles, X, User } from 'lucide-react';
import { ForumTopic, fetchAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function DiscussionsPage() {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Muhokama');

  const categories = ['all', 'Muhokama', 'Tahlil', 'Yangiliklar', 'Nazariyalar', 'Umumiy'];

  const loadTopics = async () => {
    setLoading(true);
    try {
      const catQuery = selectedCategory === 'all' ? '' : `?category=${selectedCategory}`;
      const data = await fetchAPI(`/forum/topics${catQuery}`);
      setTopics(data.topics || []);
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, [selectedCategory]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    try {
      const res = await fetchAPI('/forum/topics', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
        }),
      });
      setTopics([res.topic, ...topics]);
      setIsNewModalOpen(false);
      setNewTitle('');
      setNewContent('');
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20 mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>HAMJAMIYAT FORUMI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
            {t('nav_discussions') || 'Mulohazalar & Hamjamiyat'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Anime muxlislari bilan yangi qismlar, nazariyalar va qahramonlar haqida erkin fikr almashing
          </p>
        </div>

        <button
          onClick={() => (user ? setIsNewModalOpen(true) : openAuthModal())}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Mavzu Ochish</span>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-black'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10'
            }`}
          >
            {cat === 'all' ? '✨ Barchasi' : cat}
          </button>
        ))}
      </div>

      {/* Topics List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 rounded-3xl bg-slate-200 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 rounded-3xl glass-card border border-slate-200 dark:border-white/10 p-8">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
          <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">
            Hozircha hech qanday mavzu ochilmagan.
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Birinchi bo'lib qiziqarli mavzu boshlang!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="p-5 sm:p-6 rounded-3xl glass-card border border-slate-200 dark:border-white/10 flex flex-col gap-3 transition-all hover:border-purple-500/40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={topic.user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${topic.user?.name || 'User'}`}
                    alt={topic.user?.name || 'User'}
                    className="w-8 h-8 rounded-xl object-cover ring-1 ring-purple-500/30"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {topic.user?.name || 'Anime Muxlisi'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      {new Date(topic.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 text-[11px] font-bold border border-purple-500/20">
                  {topic.category}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black font-heading text-slate-900 dark:text-white">
                  {topic.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
                  {topic.content}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-slate-200/60 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                  {topic.comments_count || 0} ta izoh
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-pink-500" />
                  {topic.likes_count || 0} ta layk
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Topic Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-black font-heading text-slate-900 dark:text-white mb-4">
              ✨ Yangi Muhokama Ochish
            </h2>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kategoriya
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-purple-500"
                >
                  {categories.filter((c) => c !== 'all').map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Sarlavha
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Masalan: Solo Leveling 2-mavsum qachon chiqadi?"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Fikringiz / Matn
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Mavzu haqidagi to'liq fikringizni yozing..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
              >
                Mavzuni Chop Etish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
