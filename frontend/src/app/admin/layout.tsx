'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Film, Users, CreditCard, Receipt, Home } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, openAuthModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'admin' && user.role !== 'superadmin'))) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-4">
        <Shield className="w-12 h-12 text-red-400" />
        <h2 className="text-2xl font-bold text-white">Ruxsat Berilmagan</h2>
        <p className="text-slate-400 text-xs">Ushbu bo‘lim faqat administratorlar uchun mo‘ljallangan.</p>
        <Link href="/" className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold">
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Admin Top Banner */}
      <div className="flex items-center justify-between p-4 sm:p-6 rounded-3xl glass-panel border border-purple-500/30 bg-purple-950/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
              Boshqaruv Paneli (Admin Portal)
            </h1>
            <p className="text-xs text-purple-300">
              Xush kelibsiz, <span className="font-bold text-white">{user.name}</span> ({user.role.toUpperCase()})
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10"
        >
          <Home className="w-3.5 h-3.5" />
          Saytga o‘tish
        </Link>
      </div>

      {children}
    </div>
  );
}
