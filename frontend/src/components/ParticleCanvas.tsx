'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export const ParticleCanvas: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {theme === 'dark' ? (
        <>
          {/* Deep Cyberpunk Aurora Blurs for Dark Mode */}
          <div className="absolute -top-40 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-pink-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 -left-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        </>
      ) : (
        <>
          {/* Subtle Warm Pearl & Sakura Glow for Light Mode */}
          <div className="absolute -top-32 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-96 h-96 bg-pink-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
        </>
      )}
    </div>
  );
};
