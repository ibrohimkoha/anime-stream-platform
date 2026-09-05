'use client';

import React, { useState } from 'react';
import { X, Phone, Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { fetchAPI } from '@/lib/api';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const payload: any = { name, password };
        if (authMethod === 'phone') payload.phone = phone;
        else payload.email = email;

        const res = await fetchAPI('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        login(res.token, res.user);
      } else {
        const identifier = authMethod === 'phone' ? phone : email;
        const res = await fetchAPI('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password }),
        });
        login(res.token, res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAPI('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user.google@gmail.com',
          name: 'Google Anime Fan',
          avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=GoogleUser',
        }),
      });
      login(res.token, res.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl border border-purple-500/20">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-purple-600/20 text-purple-400 mb-3 border border-purple-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-heading">
            {mode === 'login' ? t('login') : t('register')}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Nokori Anime Platformasiga xush kelibsiz!
          </p>
        </div>

        {/* Method Toggle: Phone or Email */}
        <div className="flex rounded-xl bg-white/5 p-1 mb-5 border border-white/10">
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              authMethod === 'phone'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Telefon Raqam
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              authMethod === 'email'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Gmail / Email
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Ism va familiya</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Ismingiz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500 text-white placeholder-slate-500"
                />
              </div>
            </div>
          )}

          {authMethod === 'phone' ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Telefon Raqami</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500 text-white placeholder-slate-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Gmail / Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="misol@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500 text-white placeholder-slate-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Parol</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500 text-white placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:opacity-90 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? 'Yuklanmoqda...' : mode === 'login' ? t('login') : t('register')}
          </button>
        </form>

        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="absolute bg-[#12151F] px-3 text-[11px] text-slate-500 font-medium">YOKI</span>
        </div>

        {/* Google OAuth button */}
        <button
          onClick={handleGoogleDemoLogin}
          type="button"
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
          Google Orqali Kirish
        </button>

        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Akkauntingiz yo‘qmi?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-purple-400 font-bold hover:underline"
              >
                Ro‘yxatdan o‘tish
              </button>
            </p>
          ) : (
            <p>
              Akkauntingiz bormi?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-purple-400 font-bold hover:underline"
              >
                Kirish
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
