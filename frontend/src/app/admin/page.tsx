'use client';

import React, { useEffect, useState } from 'react';
import {
  Film,
  Plus,
  Crown,
  Users,
  CreditCard,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit,
  UploadCloud,
  Check,
  Search,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import {
  Anime,
  Episode,
  Genre,
  VIPPurchase,
  VIPPlan,
  PaymentSetting,
  User,
  fetchAPI,
} from '@/lib/api';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'animes' | 'episodes' | 'vip_requests' | 'pricing' | 'users'>('animes');

  // Stats
  const [stats, setStats] = useState<any>(null);

  // Animes state
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isAnimeModalOpen, setIsAnimeModalOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);

  // Anime Form
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [rating, setRating] = useState('9.0');
  const [isVIP, setIsVIP] = useState(false);
  const [freeAt, setFreeAt] = useState('');
  const [releaseYear, setReleaseYear] = useState('2024');
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

  // Episodes Form
  const [selectedAnimeForEp, setSelectedAnimeForEp] = useState<number>(0);
  const [epNumber, setEpNumber] = useState(1);
  const [epTitle, setEpTitle] = useState('');
  const [epVideoUrl, setEpVideoUrl] = useState('');
  const [epThumbnailUrl, setEpThumbnailUrl] = useState('');

  // VIP Requests state
  const [vipRequests, setVipRequests] = useState<VIPPurchase[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Pricing & Settings state
  const [plans, setPlans] = useState<VIPPlan[]>([]);
  const [paymentSetting, setPaymentSetting] = useState<PaymentSetting | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [bankName, setBankName] = useState('');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const [message, setMessage] = useState('');

  const loadAllData = async () => {
    try {
      const [statsData, animesData, genresData, vipData, vipReqData, usersData] = await Promise.all([
        fetchAPI('/admin/stats'),
        fetchAPI('/animes/free?limit=100'),
        fetchAPI('/animes/genres'),
        fetchAPI('/vip/info'),
        fetchAPI('/admin/vip-requests'),
        fetchAPI('/admin/users'),
      ]);

      setStats(statsData);
      // Combine free and vip animes
      const vipAnimes = await fetchAPI('/animes/vip');
      const allAnimes = [...(animesData.animes || []), ...(vipAnimes.animes || [])];
      setAnimes(allAnimes);
      if (allAnimes.length > 0 && selectedAnimeForEp === 0) {
        setSelectedAnimeForEp(allAnimes[0].id);
      }

      setGenres(genresData.genres || []);
      setPlans(vipData.plans || []);
      if (vipData.payment_setting) {
        setPaymentSetting(vipData.payment_setting);
        setCardNumber(vipData.payment_setting.card_number);
        setCardHolder(vipData.payment_setting.card_holder);
        setBankName(vipData.payment_setting.bank_name);
      }
      setVipRequests(vipReqData.requests || []);
      setUsers(usersData.users || []);
    } catch (err) {
      console.error('Admin load error:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 1. ANIME SAVE
  const handleSaveAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title,
        original_title: originalTitle,
        description,
        poster_url: posterUrl,
        trailer_video_url: trailerUrl,
        rating: parseFloat(rating),
        is_vip: isVIP,
        release_year: parseInt(releaseYear),
        genre_ids: selectedGenreIds,
      };
      if (isVIP && freeAt) {
        payload.free_at = new Date(freeAt).toISOString();
      }

      if (editingAnime) {
        await fetchAPI(`/admin/animes/${editingAnime.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setMessage('Anime ma‘lumotlari yangilandi!');
      } else {
        await fetchAPI('/admin/animes', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage('Yangi anime qo‘shildi!');
      }

      setIsAnimeModalOpen(false);
      resetAnimeForm();
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetAnimeForm = () => {
    setEditingAnime(null);
    setTitle('');
    setOriginalTitle('');
    setDescription('');
    setPosterUrl('');
    setTrailerUrl('');
    setRating('9.0');
    setIsVIP(false);
    setFreeAt('');
    setSelectedGenreIds([]);
  };

  const handleEditAnime = (anime: Anime) => {
    setEditingAnime(anime);
    setTitle(anime.title);
    setOriginalTitle(anime.original_title || '');
    setDescription(anime.description || '');
    setPosterUrl(anime.poster_url);
    setTrailerUrl(anime.trailer_video_url || '');
    setRating(String(anime.rating || 9.0));
    setIsVIP(anime.is_vip);
    setFreeAt(anime.free_at ? anime.free_at.slice(0, 16) : '');
    setReleaseYear(String(anime.release_year || 2024));
    setSelectedGenreIds(anime.genres?.map((g) => g.id) || []);
    setIsAnimeModalOpen(true);
  };

  const handleDeleteAnime = async (id: number) => {
    if (!confirm('Ushbu animeni o‘chirishni tasdiqlaysizmi?')) return;
    try {
      await fetchAPI(`/admin/animes/${id}`, { method: 'DELETE' });
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 2. EPISODE SAVE
  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimeForEp) return;
    try {
      await fetchAPI('/admin/episodes', {
        method: 'POST',
        body: JSON.stringify({
          anime_id: selectedAnimeForEp,
          episode_number: Number(epNumber),
          title: epTitle || `${epNumber}-Qism`,
          video_url: epVideoUrl,
          thumbnail_url: epThumbnailUrl,
        }),
      });
      setMessage(`${epNumber}-qism muvaffaqiyatli yuklandi!`);
      setEpNumber(epNumber + 1);
      setEpTitle('');
      setEpVideoUrl('');
      setEpThumbnailUrl('');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 3. VIP REQUESTS APPROVAL / REJECTION
  const handleApproveVIP = async (id: number) => {
    try {
      const res = await fetchAPI(`/admin/vip-requests/${id}/approve`, { method: 'POST' });
      alert(res.message);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectVIP = async (id: number) => {
    const reason = prompt('Rad etish sababini kiriting:') || 'To‘lov cheki tasdiqlanmadi';
    try {
      await fetchAPI(`/admin/vip-requests/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 4. PAYMENT SETTINGS & VIP PLANS
  const handleUpdatePaymentCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/admin/payment-setting', {
        method: 'PUT',
        body: JSON.stringify({
          card_number: cardNumber,
          card_holder: cardHolder,
          bank_name: bankName,
        }),
      });
      alert('Karta ma‘lumotlari muvaffaqiyatli saqlandi!');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePlanPrice = async (planId: number, price: number) => {
    try {
      await fetchAPI(`/admin/vip-plans/${planId}`, {
        method: 'PUT',
        body: JSON.stringify({ price_uzs: price }),
      });
      alert('Tarif narxi yangilandi!');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 5. USER ROLE MANAGEMENT
  const handleSetRole = async (userId: number, role: string) => {
    try {
      await fetchAPI(`/admin/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      alert(`Foydalanuvchi roli ${role.toUpperCase()} ga o‘zgartirildi!`);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl glass-panel flex flex-col gap-1">
            <span className="text-xs text-slate-400">Jami Animelar</span>
            <span className="text-2xl font-black text-white">{stats.total_animes}</span>
          </div>
          <div className="p-5 rounded-3xl glass-panel flex flex-col gap-1">
            <span className="text-xs text-slate-400">Jami Qismlar</span>
            <span className="text-2xl font-black text-purple-400">{stats.total_episodes}</span>
          </div>
          <div className="p-5 rounded-3xl glass-panel flex flex-col gap-1">
            <span className="text-xs text-slate-400">VIP Obunachilar</span>
            <span className="text-2xl font-black text-amber-400">{stats.total_vip_users}</span>
          </div>
          <div className="p-5 rounded-3xl glass-panel flex flex-col gap-1 border-amber-500/40">
            <span className="text-xs text-amber-300 font-bold">Kutilayotgan Cheklar</span>
            <span className="text-2xl font-black text-amber-400 animate-pulse">{stats.pending_receipts}</span>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('animes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'animes' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          1. Animelar & Qismlar
        </button>

        <button
          onClick={() => setActiveTab('vip_requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'vip_requests' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          2. To‘lov Cheklari Navbati {stats?.pending_receipts > 0 && `(${stats.pending_receipts})`}
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pricing' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          3. VIP Narxlar & Karta
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          4. Adminlar & Rollar
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}>✕</button>
        </div>
      )}

      {/* ================= TAB 1: ANIMELAR & QISMLAR ================= */}
      {activeTab === 'animes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Anime List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-heading">Barcha Animelar ({animes.length})</h3>
              <button
                onClick={() => {
                  resetAnimeForm();
                  setIsAnimeModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                Yangi Anime Qo‘shish
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {animes.map((anime) => (
                <div
                  key={anime.id}
                  className="p-4 rounded-2xl glass-card flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={anime.poster_url}
                      alt={anime.title}
                      className="w-12 h-16 object-cover rounded-xl border border-white/10"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{anime.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {anime.is_vip ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                            VIP
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            BEPUL
                          </span>
                        )}
                        <span className="text-xs text-slate-400">★ {anime.rating}</span>
                        <span className="text-xs text-slate-400">{anime.release_year}</span>
                      </div>
                      {anime.is_vip && anime.free_at && (
                        <p className="text-[10px] text-amber-400/80 mt-1">
                          Bepulga o‘tadi: {new Date(anime.free_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditAnime(anime)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnime(anime.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Add Episode Module */}
          <div className="p-6 rounded-3xl glass-panel flex flex-col gap-4 h-fit">
            <h3 className="text-lg font-bold text-white font-heading">🎬 Aniq Qism Qo‘shish</h3>
            <form onSubmit={handleAddEpisode} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Anime Tanlang</label>
                <select
                  value={selectedAnimeForEp}
                  onChange={(e) => setSelectedAnimeForEp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-white/10 text-xs text-white"
                >
                  {animes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} {a.is_vip ? '(VIP)' : '(Free)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Aniq Nechanchi Qism</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={epNumber}
                  onChange={(e) => setEpNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Qism Sarlavhasi (Ixtiyoriy)</label>
                <input
                  type="text"
                  placeholder="Masalan: 1-Qism: Uyg‘onish"
                  value={epTitle}
                  onChange={(e) => setEpTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Video Fayl / CDN URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://cdn.../video.mp4"
                  value={epVideoUrl}
                  onChange={(e) => setEpVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prevyu Rasmi URL (Thumbnail)</label>
                <input
                  type="url"
                  placeholder="https://.../thumb.jpg"
                  value={epThumbnailUrl}
                  onChange={(e) => setEpThumbnailUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 mt-2"
              >
                Qismni Saqlash (Yuklash)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 2: VIP REQUESTS (CHEKLAR NAVBATI) ================= */}
      {activeTab === 'vip_requests' && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white font-heading">
            Tushgan To‘lov Cheklari ({vipRequests.length})
          </h3>

          {vipRequests.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs glass-panel rounded-3xl">
              Hozircha tekshirilmagan to‘lov cheklari yo‘q.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vipRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-5 rounded-3xl glass-card flex flex-col gap-3 border ${
                    req.status === 'pending'
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : req.status === 'approved'
                      ? 'border-emerald-500/30'
                      : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">ID: {req.user_id} - {req.user?.name}</h4>
                      <p className="text-[11px] text-slate-400">{req.user?.email || req.user?.phone}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                        req.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : req.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-t border-b border-white/5">
                    <span className="text-slate-400">Tarif: {req.plan?.name}</span>
                    <span className="font-bold text-amber-400">{req.amount_uzs.toLocaleString()} UZS</span>
                  </div>

                  {/* Receipt Image */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/10 group">
                    <img
                      src={req.receipt_image_url}
                      alt="Chek"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedReceipt(req.receipt_image_url)}
                    />
                    <div
                      onClick={() => setSelectedReceipt(req.receipt_image_url)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold text-white"
                    >
                      Kattalashtirish
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleApproveVIP(req.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Tasdiqlash (VIP Berish)
                      </button>
                      <button
                        onClick={() => handleRejectVIP(req.id)}
                        className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: VIP PRICING & PAYMENT SETTINGS ================= */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Settings */}
          <div className="p-6 rounded-3xl glass-panel flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white font-heading">💳 To‘lov Karta Sozlamalari</h3>
            <p className="text-xs text-slate-400">
              Foydalanuvchilar VIP sotib olayotganda qaysi bank kartasiga pul o‘tkazishlari kerakligini kiriting.
            </p>

            <form onSubmit={handleUpdatePaymentCard} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Karta Raqami</label>
                <input
                  type="text"
                  required
                  placeholder="8600 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-amber-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Karta Egasi (F.I.SH)</label>
                <input
                  type="text"
                  required
                  placeholder="IBROHIM G‘OFUROV"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Kapitalbank / Uzcard"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition-all mt-2"
              >
                Karta Ma‘lumotlarini Saqlash
              </button>
            </form>
          </div>

          {/* Pricing Plans */}
          <div className="p-6 rounded-3xl glass-panel flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white font-heading">💰 VIP Tarif Narxlari</h3>
            <p className="text-xs text-slate-400">
              Har bir VIP obuna muddatining narxini so‘mda tahrirlashingiz mumkin.
            </p>

            <div className="flex flex-col gap-3">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-sm text-white">{p.name}</h4>
                    <span className="text-xs text-slate-400">{p.days} kunlik</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={p.price_uzs}
                      onBlur={(e) => handleUpdatePlanPrice(p.id, Number(e.target.value))}
                      className="w-28 px-3 py-1.5 rounded-xl bg-[#12151F] border border-white/20 text-xs font-bold text-amber-300 text-right"
                    />
                    <span className="text-xs text-slate-400">UZS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: USERS & ADMIN ROLE MANAGEMENT ================= */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white font-heading">
              Foydalanuvchilar & Admin Huquqlari ({users.length})
            </h3>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Qidirish (Ism, Tel, Email)..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {users
              .filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()))
              .map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar_url}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover border border-purple-500/30"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">ID: {u.id} - {u.name}</h4>
                      <p className="text-[11px] text-slate-400">{u.email || u.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {u.is_vip && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                        👑 VIP Active
                      </span>
                    )}

                    <select
                      value={u.role}
                      onChange={(e) => handleSetRole(u.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold bg-[#12151F] ${
                        u.role === 'superadmin'
                          ? 'border-red-500 text-red-400'
                          : u.role === 'admin'
                          ? 'border-purple-500 text-purple-400'
                          : 'border-white/10 text-slate-300'
                      }`}
                    >
                      <option value="user">User (Oddiy)</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT ANIME ================= */}
      {isAnimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl border border-purple-500/20 my-8">
            <h3 className="text-xl font-bold font-heading text-white mb-4">
              {editingAnime ? 'Animeni Tahrirlash' : 'Yangi Anime Qo‘shish'}
            </h3>

            <form onSubmit={handleSaveAnime} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Anime Nomi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Solo Leveling"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Asl Nomi (Yaponcha/Inglizcha)</label>
                  <input
                    type="text"
                    placeholder="Ore dake Level Up na Ken"
                    value={originalTitle}
                    onChange={(e) => setOriginalTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tavsif (Sinopsis)</label>
                <textarea
                  rows={3}
                  placeholder="Anime mazmuni haqida..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Poster Rasm URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://.../poster.jpg"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Qisqa Video / Treyler URL</label>
                  <input
                    type="url"
                    placeholder="https://.../trailer.mp4"
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reyting</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Chiqarilgan Yili</label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Turi</label>
                  <select
                    value={isVIP ? 'vip' : 'free'}
                    onChange={(e) => setIsVIP(e.target.value === 'vip')}
                    className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-white/10 text-xs text-white"
                  >
                    <option value="free">Bepul (Free)</option>
                    <option value="vip">Pullik (VIP)</option>
                  </select>
                </div>
              </div>

              {isVIP && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    ⏳ Qachon Bepulga O‘tish Sanasi (Free Release Timer)
                  </label>
                  <input
                    type="datetime-local"
                    value={freeAt}
                    onChange={(e) => setFreeAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-amber-500/30 text-xs text-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ushbu sana yetgach, tizim animeni avtomatik ravishda barcha uchun bepul holatga o‘tkazadi.
                  </p>
                </div>
              )}

              {/* Genres Checkbox Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Janrlar</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => {
                    const isChecked = selectedGenreIds.includes(g.id);
                    return (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedGenreIds(selectedGenreIds.filter((id) => id !== g.id));
                          } else {
                            setSelectedGenreIds([...selectedGenreIds, g.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isChecked
                            ? 'bg-purple-600 text-white shadow'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {g.name_uz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
                >
                  {editingAnime ? 'Saqlash' : 'Anime Yaratish'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnimeModalOpen(false)}
                  className="px-6 py-3 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Size Receipt Viewer Modal */}
      {selectedReceipt && (
        <div
          onClick={() => setSelectedReceipt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-fade-in"
        >
          <img
            src={selectedReceipt}
            alt="Chek Katta"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
