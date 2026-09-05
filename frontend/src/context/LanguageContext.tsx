'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'uz' | 'en' | 'ru';

export const translations = {
  uz: {
    brand_name: 'NOKORI STREAM',
    nav_home: 'Bosh sahifa',
    nav_top: 'Top Animelar',
    nav_genres: 'Janrlar',
    nav_bookmarks: 'Saqlanganlar',
    nav_rated: 'Reytingi Yuqori',
    nav_discussions: 'Mulohazalar',
    nav_vip: 'VIP Obuna',
    nav_admin: 'Admin Panel',
    search_placeholder: 'Anime qidirish...',
    login: 'Kirish',
    logout: 'Chiqish',
    register: 'Ro‘yxatdan o‘tish',
    trending_title: '🔥 Eng Ko‘p Ko‘rilgan Animelar',
    free_animes_title: '🎬 Bepul Animelar',
    vip_animes_title: '👑 Eksklyuziv VIP Animelar',
    free_countdown_badge: 'so‘ng bepulga o‘tadi',
    watch_now: 'Tomosha qilish',
    episodes: 'Qismlar',
    episode: 'Qism',
    bookmark_added: 'Saqlanganlarga qo‘shildi',
    bookmark_removed: 'Saqlanganlardan olib tashlandi',
    rating: 'Reyting',
    views: 'ko‘rildi',
    trailer_preview: 'Qisqa Edit / Treyler',
    discussion_forum: 'Anime Muhokamalari & Hamjamiyat',
    new_topic: 'Yangi Mulohaza Qoldirish',
    leave_comment: 'Fikringizni qoldiring...',
    send: 'Yuborish',
    spoiler_warning: 'Spoyler mavjud',
    vip_modal_title: '💎 VIP Obuna Xarid Qilish',
    vip_card_instruction: 'Quyidagi bank kartasiga pul o‘tkazib, to‘lov chekini yuklang:',
    card_number: 'Karta raqami',
    card_holder: 'Karta egasi',
    copy_card: 'Nusxa olish',
    copied: 'Nusxa olindi!',
    upload_receipt: 'Chek Skrinshotini Yuklash',
    submit_receipt: 'Chekni Tasdiqlashga Yuborish',
    vip_status_pending: '⏳ To‘lov chekingiz qabul qilindi va administrator tomonidan ko‘rib chiqilmoqda.',
    vip_status_active: '👑 VIP Obunangiz Faol',
    days_left: 'kun qoldi',
    no_animes_found: 'Animelar topilmadi',
    save_button: 'Saqlab olish',
    saved_button: 'Saqlangan',
    rate_anime: 'Baholash',
  },
  en: {
    brand_name: 'NOKORI STREAM',
    nav_home: 'Home',
    nav_top: 'Top Animes',
    nav_genres: 'Genres',
    nav_bookmarks: 'Bookmarks',
    nav_rated: 'Top Rated',
    nav_discussions: 'Community',
    nav_vip: 'VIP Pass',
    nav_admin: 'Admin Panel',
    search_placeholder: 'Search anime...',
    login: 'Sign In',
    logout: 'Log Out',
    register: 'Sign Up',
    trending_title: '🔥 Trending & Most Viewed',
    free_animes_title: '🎬 Free Animes',
    vip_animes_title: '👑 Exclusive VIP Releases',
    free_countdown_badge: 'free release in',
    watch_now: 'Watch Now',
    episodes: 'Episodes',
    episode: 'Episode',
    bookmark_added: 'Added to Bookmarks',
    bookmark_removed: 'Removed from Bookmarks',
    rating: 'Rating',
    views: 'views',
    trailer_preview: 'Teaser Edit / Trailer',
    discussion_forum: 'Anime Discussions & Community',
    new_topic: 'New Discussion Topic',
    leave_comment: 'Leave a comment...',
    send: 'Send',
    spoiler_warning: 'Contains Spoiler',
    vip_modal_title: '💎 Upgrade to VIP Pass',
    vip_card_instruction: 'Transfer payment to the bank card below and upload the receipt screenshot:',
    card_number: 'Card Number',
    card_holder: 'Card Holder',
    copy_card: 'Copy Card',
    copied: 'Copied!',
    upload_receipt: 'Upload Payment Receipt',
    submit_receipt: 'Submit Receipt for Verification',
    vip_status_pending: '⏳ Your receipt has been submitted and is currently pending administrator review.',
    vip_status_active: '👑 VIP Pass Active',
    days_left: 'days left',
    no_animes_found: 'No animes found',
    save_button: 'Bookmark',
    saved_button: 'Bookmarked',
    rate_anime: 'Rate Anime',
  },
  ru: {
    brand_name: 'NOKORI STREAM',
    nav_home: 'Главная',
    nav_top: 'Топ Аниме',
    nav_genres: 'Жанры',
    nav_bookmarks: 'Закладки',
    nav_rated: 'Высокий Рейтинг',
    nav_discussions: 'Обсуждения',
    nav_vip: 'VIP Подписка',
    nav_admin: 'Админ Панель',
    search_placeholder: 'Поиск аниме...',
    login: 'Войти',
    logout: 'Выйти',
    register: 'Регистрация',
    trending_title: '🔥 Самые Просматриваемые Аниме',
    free_animes_title: '🎬 Бесплатные Аниме',
    vip_animes_title: '👑 Эксклюзивные VIP Аниме',
    free_countdown_badge: 'станет бесплатным через',
    watch_now: 'Смотреть',
    episodes: 'Серии',
    episode: 'Серия',
    bookmark_added: 'Добавлено в закладки',
    bookmark_removed: 'Удалено из закладок',
    rating: 'Рейтинг',
    views: 'просмотров',
    trailer_preview: 'Трейлер / Эдит',
    discussion_forum: 'Обсуждения и Сообщество',
    new_topic: 'Создать тему',
    leave_comment: 'Оставить комментарий...',
    send: 'Отправить',
    spoiler_warning: 'Содержит спойлер',
    vip_modal_title: '💎 Оформить VIP Подписку',
    vip_card_instruction: 'Переведите оплату на карту и загрузите скриншот чека:',
    card_number: 'Номер карты',
    card_holder: 'Владелец карты',
    copy_card: 'Скопировать',
    copied: 'Скопировано!',
    upload_receipt: 'Загрузить чек оплаты',
    submit_receipt: 'Отправить чек на проверку',
    vip_status_pending: '⏳ Чек отправлен и находится на проверке администратором.',
    vip_status_active: '👑 VIP Подписка Активна',
    days_left: 'дней осталось',
    no_animes_found: 'Аниме не найдено',
    save_button: 'В закладки',
    saved_button: 'В закладках',
    rate_anime: 'Оценить',
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations.uz) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'uz',
  setLang: () => {},
  t: (key) => translations.uz[key] || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('uz');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved && (saved === 'uz' || saved === 'en' || saved === 'ru')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (key: keyof typeof translations.uz): string => {
    return translations[lang]?.[key] || translations.uz[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
