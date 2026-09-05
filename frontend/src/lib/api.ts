export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api/v1';

export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'moderator' | 'admin' | 'superadmin';
  avatar_url: string;
  is_vip: boolean;
  vip_expires_at?: string;
  created_at: string;
}

export interface Genre {
  id: number;
  name_uz: string;
  name_en: string;
  name_ru: string;
  slug: string;
}

export interface Episode {
  id: number;
  anime_id: number;
  episode_number: number;
  title: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
}

export interface Anime {
  id: number;
  title: string;
  original_title?: string;
  slug: string;
  description: string;
  poster_url: string;
  trailer_video_url?: string;
  rating: number;
  views_count: number;
  is_vip: boolean;
  free_at?: string;
  status: 'ongoing' | 'completed';
  release_year: number;
  genres?: Genre[];
  episodes?: Episode[];
}

export interface VIPPlan {
  id: number;
  name: string;
  days: number;
  price_uzs: number;
  badge: string;
  is_active: boolean;
}

export interface PaymentSetting {
  id: number;
  card_number: string;
  card_holder: string;
  bank_name: string;
  instruction_uz: string;
}

export interface VIPPurchase {
  id: number;
  user_id: number;
  user?: User;
  plan_id: number;
  plan?: VIPPlan;
  amount_uzs: number;
  receipt_image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
}

export interface ForumTopic {
  id: number;
  user_id: number;
  user?: User;
  anime_id?: number;
  anime?: Anime;
  title: string;
  content: string;
  image_url?: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface Comment {
  id: number;
  user_id: number;
  user?: User;
  anime_id?: number;
  topic_id?: number;
  parent_id?: number;
  content: string;
  is_spoiler: boolean;
  created_at: string;
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Serverda xatolik yuz berdi');
  }

  return data;
}
