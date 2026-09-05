'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, Mail, Lock, User as UserIcon, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { fetchAPI } from '@/lib/api';

const GOOGLE_CLIENT_ID = '531444252311-gg723l1e6ihi1ddls9jvtlbttuusu7f9.apps.googleusercontent.com';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const initGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
          });

          if (googleBtnRef.current) {
            (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'filled_blue',
              size: 'large',
              shape: 'pill',
              width: '100%',
              text: 'continue_with',
            });
          }
        } catch (e) {
          console.warn('Google One Tap Init error:', e);
        }
      }
    };

    const timer = setTimeout(initGoogle, 300);
    return () => clearTimeout(timer);
  }, [isAuthModalOpen, mode]);

  const handleGoogleCallback = async (response: any) => {
    if (!response.credential) return;
    setLoading(true);
    setError('');

    try {
      // Decode JWT token payload
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const res = await fetchAPI('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          avatar_url: payload.picture || '',
        }),
      });

      login(res.token, res.user);
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Google orqali kirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

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
        closeAuthModal();
      } else {
        const identifier = authMethod === 'phone' ? phone : email;
        const res = await fetchAPI('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password }),
        });
        login(res.token, res.user);
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-purple-600/15 text-purple-600 dark:text-purple-400 mb-3 border border-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black font-heading text-slate-900 dark:text-white">
            {mode === 'login' ? t('login') || 'Tizimga Kirish' : t('register') || "Ro'yxatdan O'tish"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Nokori Stream Anime Platformasiga xush kelibsiz!
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-5 flex flex-col items-center justify-center">
          <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
          <div className="flex items-center w-full gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Yoki
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
          </div>
        </div>

        {/* Method Toggle: Phone or Email */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-white/5 p-1 mb-5 border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              authMethod === 'phone'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Telefon Raqam</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              authMethod === 'email'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Gmail / Email</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ismingiz / Nikneym
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Tanjiro"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          {authMethod === 'phone' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Telefon raqam
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono font-medium focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Gmail / Email manzilingiz
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nomingiz@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Parol
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            {loading ? 'Tekshirilmoqda...' : mode === 'login' ? 'Tizimga Kirish' : "Ro'yxatdan O'tish"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            {mode === 'login'
              ? "Akkauntingiz yo'qmi? Ro'yxatdan o'ting"
              : "Akkauntingiz bormi? Tizimga kiring"}
          </button>
        </div>
      </div>
    </div>
  );
};
