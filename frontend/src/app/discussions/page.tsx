'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Plus, Heart, MessageCircle, Send, Sparkles, X } from 'lucide-react';
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
    } catch (err) {
      console.error('Failed to create topic:', err);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-purple-400" />
            {t('nav_discussions')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sayt ichidagi barcha anime muxlislari bilan yangi qismlar va nazariyalarni muhokama qiling
          </p>
        </div>

        <button
          onClick={() => (user ? setIsNewModalOpen(true) : openAuthModal())}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          {t('new_topic')}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
              selectedCategory === c
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            {c === 'all' ? 'Barchasi' : c}
          </button>
        ))}
      </div>

      {/* Topics Feed */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          Hozircha mulohazalar mavjud emas. Birinchi bo‘lib mavzu oching!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="p-5 sm:p-6 rounded-3xl glass-card flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={topic.user?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=forum'}
                    alt={topic.user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-purple-500/30"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{topic.user?.name || 'Anime Fan'}</h4>
                    <span className="text-[10px] text-slate-500">
                      {new Date(topic.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-purple-600/20 text-purple-300 text-[11px] font-semibold border border-purple-500/30">
                  {topic.category}
                </span>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-white font-heading">
                {topic.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                {topic.content}
              </p>

              <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-pink-400 font-semibold">
                  <Heart className="w-4 h-4 fill-pink-400/20" />
                  {topic.likes_count} ta layk
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <MessageCircle className="w-4 h-4" />
                  {topic.comments_count} ta javob
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Topic Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl border border-purple-500/20">
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold font-heading text-white mb-4">
              {t('new_topic')}
            </h3>

            <form onSubmit={handleCreateTopic} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mavzu Sarlavhasi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Solo Leveling 2-mavsum qachon chiqadi?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bo‘lim</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12151F] border border-white/10 text-sm focus:outline-none focus:border-purple-500 text-white"
                >
                  <option value="Muhokama">Muhokama</option>
                  <option value="Tahlil">Tahlil</option>
                  <option value="Yangiliklar">Yangiliklar</option>
                  <option value="Nazariyalar">Nazariyalar</option>
                  <option value="Umumiy">Umumiy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fikringiz matni</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Mulohazangizni batafsil bayon eting..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500 text-white placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:opacity-90 active:scale-98 transition-all"
              >
                Chop etish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
