'use client';

import React, { useState, useEffect } from 'react';
import { X, Crown, Copy, Check, UploadCloud, ShieldCheck, AlertCircle } from 'lucide-react';
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
      formData.append('type', 'receipts');

      const token = localStorage.getItem('auth_token');
      const uploadRes = await fetch('http://localhost:8090/api/v1/vip/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Rasmni yuklashda xatolik');
      }

      // 2. Submit purchase request
      await fetchAPI('/vip/submit-receipt', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          receipt_image_url: uploadData.url,
        }),
      });

      setSubmittedStatus('pending');
    } catch (err: any) {
      setError(err.message || 'Chekni yuborishda xatolik');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl border border-amber-500/30 my-8">
        <button
          onClick={closeVIPModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submittedStatus === 'pending' ? (
          <div className="text-center py-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center animate-bounce">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-amber-400 font-heading">
              Chekingiz Qabul Qilindi!
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              {t('vip_status_pending')}
            </p>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 text-left w-full mt-2">
              <p className="font-semibold text-white mb-1">⚡ Tekshirish muddati:</p>
              <p>Odatda 5-15 daqiqa ichida administrator tomonidan tasdiqlanadi va VIP profilingiz avtomatik faollashadi.</p>
            </div>
            <button
              onClick={closeVIPModal}
              className="mt-4 px-8 py-3 rounded-full bg-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/30 hover:bg-amber-400 transition-all"
            >
              Tushundim
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 mb-2 border border-amber-500/40">
                <Crown className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold font-heading text-amber-400">
                {t('vip_modal_title')}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Barcha eksklyuziv animelarni 1080p sifatda reklamasiz tomosha qiling
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {plans.map((p) => {
                const isSelected = selectedPlan?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className={`relative p-3.5 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {p.badge && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-extrabold shadow">
                        {p.badge}
                      </span>
                    )}
                    <h4 className="font-bold text-xs sm:text-sm text-white">{p.name}</h4>
                    <p className="text-amber-400 font-extrabold text-sm sm:text-base mt-1">
                      {p.price_uzs.toLocaleString()} <span className="text-[11px] font-normal text-slate-400">UZS</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{p.days} kunlik to‘liq ruxsat</p>
                  </div>
                );
              })}
            </div>

            {/* Payment Details */}
            {paymentSetting && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 mb-5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t('card_number')}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm sm:text-base text-amber-300">
                      {paymentSetting.card_number}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCard}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Nusxa olish"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-slate-400">{t('card_holder')}:</span>
                  <span className="font-semibold text-slate-200">{paymentSetting.card_holder}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Bank:</span>
                  <span className="font-semibold text-slate-200">{paymentSetting.bank_name}</span>
                </div>
              </div>
            )}

            {/* Receipt Upload Box */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                📸 {t('upload_receipt')}
              </label>

              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/15 hover:border-amber-500/50 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all">
                {receiptPreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={receiptPreview}
                      alt="Chek"
                      className="w-16 h-16 object-cover rounded-xl border border-white/20"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-emerald-400">Chek tanlandi!</p>
                      <p className="text-[11px] text-slate-400">Boshqa rasm tanlash uchun bosing</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-amber-400 mb-1" />
                    <span className="text-xs font-bold text-slate-300">Skrinshotni tanlang</span>
                    <span className="text-[10px] text-slate-500">PNG, JPG, JPEG</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={handleSubmitReceipt}
              disabled={uploading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/30 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
            >
              {uploading ? 'Yuborilmoqda...' : t('submit_receipt')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
