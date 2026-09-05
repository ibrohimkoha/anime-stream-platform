'use client';

import React, { useState, useEffect } from 'react';
import { X, Crown, Copy, Check, UploadCloud, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { fetchAPI, VIPPlan, PaymentSetting } from '@/lib/api';

export const VIPModal: React.FC = () => {
  const { isVIPModalOpen, closeVIPModal, user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [plans, setPlans] = useState<VIPPlan[]>([]);
  const [paymentSetting, setPaymentSetting] = useState<PaymentSetting | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<VIPPlan | null>(null);

  const [copied, setCopied] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isVIPModalOpen) return;
    const loadVIPInfo = async () => {
      try {
        const data = await fetchAPI('/vip/info');
        setPlans(data.plans || []);
        setPaymentSetting(data.payment_setting || null);
        if (data.plans && data.plans.length > 0) {
          setSelectedPlan(data.plans[1] || data.plans[0]);
        }
      } catch (err) {
        console.error('Failed to load VIP info:', err);
      }
    };
    loadVIPInfo();
  }, [isVIPModalOpen]);

  if (!isVIPModalOpen) return null;

  const handleCopyCard = () => {
    if (paymentSetting?.card_number) {
      navigator.clipboard.writeText(paymentSetting.card_number.replace(/\s+/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitReceipt = async () => {
    if (!user) {
      closeVIPModal();
      openAuthModal();
      return;
    }

    if (!selectedPlan) {
      setError('Iltimos, VIP tarifini tanlang');
      return;
    }

    if (!receiptFile) {
      setError('Iltimos, to‘lov cheki skrinshotini yuklang');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 1. Upload receipt image
      const formData = new FormData();
      formData.append('file', receiptFile);

      const uploadRes = await fetch('/api/v1/vip/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('anime_token')}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Rasm yuklashda xatolik');

      // 2. Submit purchase
      await fetchAPI('/vip/submit-receipt', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          receipt_url: uploadData.url,
        }),
      });

      setSubmittedStatus('success');
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl my-8">
        <button
          onClick={closeVIPModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submittedStatus === 'success' ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black font-heading text-slate-900 dark:text-white">
              To'lov Cheki Qabul Qilindi! 🎉
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Chekingiz adminga yuborildi. 5-15 daqiqa ichida tekshirilib, hisobingizga VIP obuna faollashtiriladi.
            </p>
            <button
              onClick={() => {
                setSubmittedStatus(null);
                closeVIPModal();
              }}
              className="px-6 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-600/30"
            >
              Tushundim
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 mb-3 shadow-lg shadow-amber-500/10">
                <Crown className="w-7 h-7 fill-amber-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
                VIP Premium Obuna
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1">
                Eksklyuziv yangi animelar, reklamasiz 4K/FullHD streaming va erta tomosha imkoniyati!
              </p>
            </div>

            {/* Plan Selection Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {plans.map((p) => {
                const isSelected = selectedPlan?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-amber-500/40'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {p.days} kunlik
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className="text-sm sm:text-base font-black font-mono text-amber-600 dark:text-amber-400">
                        {p.price_uzs.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 block">UZS</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Details Card */}
            {paymentSetting && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">To'lov usuli:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {paymentSetting.bank_name} (Humo / Uzcard)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Karta Raqami
                    </span>
                    <span className="text-sm sm:text-base font-mono font-black text-slate-900 dark:text-amber-400 tracking-wider">
                      {paymentSetting.card_number}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                      {paymentSetting.card_holder}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyCard}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Nusxalandi' : 'Nusxalash'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Receipt Upload Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                To'lov cheki skrinshoti (Rasm):
              </label>
              <div className="relative border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-purple-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-white/5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {receiptPreview ? (
                  <div className="flex items-center justify-center gap-3">
                    <img
                      src={receiptPreview}
                      alt="Chek"
                      className="w-16 h-16 object-cover rounded-xl border border-purple-500/40"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {receiptFile?.name}
                      </p>
                      <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                        ✓ Rasm tanlandi. O'zgartirish uchun bosing.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <UploadCloud className="w-8 h-8 text-purple-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Chek rasmini bu yerga tashlang yoki tanlang
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, JPEG (Maksimal 10MB)</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmitReceipt}
              disabled={uploading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {uploading ? 'Yuborilmoqda...' : `Chekni Tasdiqlashga Yuborish (${selectedPlan?.price_uzs.toLocaleString()} UZS)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
