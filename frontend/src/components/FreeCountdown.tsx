'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface FreeCountdownProps {
  freeAt?: string;
}

export const FreeCountdown: React.FC<FreeCountdownProps> = ({ freeAt }) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    if (!freeAt) return;

    const calculateTime = () => {
      const difference = new Date(freeAt).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [freeAt]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold backdrop-blur-md animate-pulse">
      <Clock className="w-3.5 h-3.5 text-amber-400" />
      <span>
        {timeLeft.days > 0 ? `${timeLeft.days}k ` : ''}
        {timeLeft.hours}s {timeLeft.minutes}d {t('free_countdown_badge')}
      </span>
    </div>
  );
};
