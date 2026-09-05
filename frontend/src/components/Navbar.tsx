'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Flame,
  Grid,
  Bookmark,
  Star,
  MessageSquare,
  Crown,
  Sun,
  Moon,
  Globe,
  User as UserIcon,
  LogOut,
  Shield,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, Language } from '@/context/LanguageContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, openAuthModal, openVIPModal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('nav_home') || 'Bosh sahifa', icon: Sparkles },
    { href: '/top', label: t('nav_top') || 'Top Animelar', icon: Flame },
    { href: '/genres', label: t('nav_genres') || 'Janrlar', icon: Grid },
    { href: '/bookmarks', label: t('nav_bookmarks') || 'Saqlanganlar', icon: Bookmark },
    { href: '/top#rating', label: t('nav_rated') || 'Reytingi Yuqori', icon: Star },
    { href: '/discussions', label: t('nav_discussions') || 'Mulohazalar', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <span className="font-black text-lg">⛩️</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 dark:from-purple-400 dark:via-pink-400 dark:to-amber-300 bg-clip-text text-transparent">
                {t('brand_name') || 'NOKORI STREAM'}
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-[9px] font-bold text-purple-700 dark:text-purple-300 border border-purple-300/40 dark:border-purple-500/30">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">
              Anime & VIP Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-white/5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons: Theme, Lang, VIP, User Profile */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 transition-colors"
            title="Mavzuni almashtirish (Qora / Oq fon)"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-purple-600" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-2 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 text-xs font-bold transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span className="uppercase">{lang}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-2xl glass-panel p-1.5 shadow-2xl border border-slate-200 dark:border-white/10 z-50 animate-fade-in">
                {(['uz', 'en', 'ru'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      lang === l
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{l === 'uz' ? "O'zbekcha" : l === 'en' ? 'English' : 'Русский'}</span>
                    <span className="uppercase text-[10px] opacity-70 font-mono">{l}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VIP Upgrade Button */}
          <button
            onClick={openVIPModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>VIP Obuna</span>
          </button>

          {/* Auth Button or User Avatar Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 transition-colors"
              >
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-purple-500/40"
                />
                <span className="hidden md:block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                  {user.name}
                </span>
                {user.is_vip && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black border border-amber-500/30">
                    VIP
                  </span>
                )}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel p-2 shadow-2xl border border-slate-200 dark:border-white/10 z-50 animate-fade-in">
                  <div className="p-3 border-b border-slate-200 dark:border-white/10 mb-1.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {user.email || user.phone}
                    </p>
                    {user.is_vip ? (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        <Crown className="w-3 h-3" /> VIP Faol
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          openVIPModal();
                        }}
                        className="mt-2 w-full text-center text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded-lg transition-colors"
                      >
                        ⚡ VIP ga o'tish
                      </button>
                    )}
                  </div>

                  {(user.role === 'admin' || user.role === 'superadmin') && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <Link
                    href="/bookmarks"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saqlanganlar</span>
                  </Link>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Chiqish</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 active:scale-95 transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{t('login') || 'Kirish'}</span>
            </button>
          )}

          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 dark:border-white/10 glass-panel p-4 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-white/5 hover:bg-purple-600/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openVIPModal();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
          >
            <Crown className="w-4 h-4 fill-slate-950" />
            <span>VIP Tariflarni Ko'rish</span>
          </button>
        </div>
      )}
    </header>
  );
};
