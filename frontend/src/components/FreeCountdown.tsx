'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface FreeCountdownProps {
  freeAt?: string | null;
  targetDate?: string | null;
}

export const FreeCountdown: React.FC<FreeCountdownProps> = ({ freeAt, targetDate }) => {
  const { t } = useLanguage();
  const dateStr = freeAt || targetDate;
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    if (!dateStr) return;

    const calculateTime = () => {
      const difference = new Date(dateStr).getTime() - new Date().getTime();
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
  }, [dateStr]);

  if (!timeLeft) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-black font-mono backdrop-blur-md">
      <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
      <span>
        {timeLeft.days > 0 ? `${timeLeft.days}k ${timeLeft.hours}s` : `${timeLeft.hours}s ${timeLeft.minutes}d`}
      </span>
      <span className="text-[9px] uppercase tracking-wider opacity-70">tekin</span>
    </div>
  );
};
