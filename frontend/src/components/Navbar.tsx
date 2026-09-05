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
    { href: '/', label: t('nav_home'), icon: Sparkles },
    { href: '/top', label: t('nav_top'), icon: Flame },
    { href: '/genres', label: t('nav_genres'), icon: Grid },
    { href: '/bookmarks', label: t('nav_bookmarks'), icon: Bookmark },
    { href: '/top#rating', label: t('nav_rated'), icon: Star },
    { href: '/discussions', label: t('nav_discussions'), icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-xl font-heading">⛩️</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              {t('brand_name')}
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              Anime & VIP Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Theme, Lang, VIP, User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors"
            title="Mavzuni almashtirish (Qora / Oq fon)"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 text-xs font-bold transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase">{lang}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-2xl glass-panel p-1.5 shadow-2xl border border-white/10 z-50 animate-fade-in">
                {(['uz', 'en', 'ru'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      lang === l ? 'bg-purple-600 text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{l === 'uz' ? 'O‘zbekcha 🇺🇿' : l === 'en' ? 'English 🇬🇧' : 'Русский 🇷🇺'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VIP Pass Button */}
          <button
            onClick={openVIPModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 hover:opacity-90 transition-all active:scale-95"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>{t('nav_vip')}</span>
          </button>

          {/* User Profile / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <img
                  src={user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                  alt={user.name}
                  className="w-7 h-7 rounded-xl object-cover border border-purple-500/40"
                />
                <span className="hidden md:inline text-xs font-bold text-slate-200 max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel p-2 shadow-2xl border border-white/10 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email || user.phone}</p>
                    <div className="mt-1.5">
                      {user.is_vip ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          <Crown className="w-3 h-3 fill-amber-300" />
                          VIP Obunachi
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Oddiy Foydalanuvchi</span>
                      )}
                    </div>
                  </div>

                  {(user.role === 'admin' || user.role === 'superadmin') && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-purple-400 hover:bg-purple-600/20 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {t('nav_admin')}
                    </Link>
                  )}

                  <Link
                    href="/bookmarks"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {t('nav_bookmarks')}
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{t('login')}</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 border border-white/5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-white/10 px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                <Icon className="w-4 h-4 text-purple-400" />
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openVIPModal();
            }}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-sm mt-2"
          >
            <Crown className="w-4 h-4 fill-slate-950" />
            {t('nav_vip')}
          </button>
        </div>
      )}
    </header>
  );
};
