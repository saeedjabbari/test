import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Send,
  Sparkles,
} from 'lucide-react';
import { recordInsurerRequestToSheets } from '../lib/sheets';

interface InsurerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInsurer: string;
  onSelectInsurer: (insurer: string) => void;
  onShowToast: (msg: string) => void;
}

interface InsurerItem {
  id: string;
  name: string;
  status: 'active' | 'upcoming';
  badge: string;
  description: string;
}

export const INSURERS: InsurerItem[] = [
  {
    id: 'karafarin',
    name: 'بیمه کارآفرین',
    status: 'active',
    badge: 'فعال و تایید شده',
    description: '۴۲ مرکز درمانی طرف قرارداد در ارومیه',
  },
  {
    id: 'dana',
    name: 'بیمه دانا',
    status: 'upcoming',
    badge: 'به‌زودی',
    description: 'در حال دریافت و تایید فهرست مراکز',
  },
  {
    id: 'dey',
    name: 'بیمه دی',
    status: 'upcoming',
    badge: 'به‌زودی',
    description: 'در حال تطبیق مراکز درمانی',
  },
  {
    id: 'asia',
    name: 'بیمه آسیا',
    status: 'upcoming',
    badge: 'به‌زودی',
    description: 'در حال آماده‌سازی فهرست طرف قرارداد',
  },
  {
    id: 'alborz',
    name: 'بیمه البرز',
    status: 'upcoming',
    badge: 'به‌زودی',
    description: 'در نوبت اضافه شدن به سامانه',
  },
  {
    id: 'iran',
    name: 'بیمه ایران',
    status: 'upcoming',
    badge: 'به‌زودی',
    description: 'پوشش گسترده بیمارستان‌ها و درمانگاه‌ها',
  },
  {
    id: 'saman',
    name: 'بیمه سامان',
    status: 'upcoming',
    badge: 'به‌زودی',
    description: 'در حال ارزیابی مراکز',
  },
  {
    id: 'pasargad',
    name: 'بیمه پاسارگاد',
    status: 'upcoming',
    badge: 'به‌زودی',
    description: 'به‌زودی در دسترس قرار می‌گیرد',
  },
];

export const InsurerModal: React.FC<InsurerModalProps> = ({
  isOpen,
  onClose,
  selectedInsurer,
  onSelectInsurer,
  onShowToast,
}) => {
  const [requestedPhone, setRequestedPhone] = useState('');
  const [requestedInsurerName, setRequestedInsurerName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedPhone.trim()) {
      onShowToast('لطفاً شماره موبایل خود را وارد فرمایید');
      return;
    }
    const requestData = {
      insurer: requestedInsurerName || 'نامشخص',
      phone: requestedPhone,
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem('krf_insurer_requests') || '[]');
      stored.unshift(requestData);
      localStorage.setItem('krf_insurer_requests', JSON.stringify(stored));
    } catch {}

    recordInsurerRequestToSheets(requestData).catch(() => {});

    setIsSubmitted(true);
    onShowToast('درخواست شما ثبت شد. به محض فعال‌سازی با پیامک باخبر خواهید شد.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Compact, Clear Header with Prominent Back Button */}
        <div className="bg-[#0a4c9a] text-white px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base leading-tight truncate">
                انتخاب شرکت بیمه تکمیلی
              </h3>
              <p className="text-[11px] text-blue-100/90 truncate mt-0.5">
                تکمیلی آنلاین · ارومیه
              </p>
            </div>
          </div>

          {/* Explicit, Unmistakable Back Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold transition shrink-0 border border-white/20"
            title="بازگشت به برنامه"
          >
            <span>بازگشت</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Compact Body */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1">
          {/* Active Insurer Notice - Clean and Compact */}
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-3 text-xs text-emerald-950 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-black text-emerald-900">پوشش فعال: </span>
              مراکز درمانی موجود در سامانه مربوط به{' '}
              <strong className="text-emerald-800">بیمه کارآفرین (ارومیه)</strong> است. سایر بیمه‌ها به‌زودی فعال می‌شوند.
            </div>
          </div>

          {/* Insurer Items List */}
          <div className="space-y-1.5">
            <div className="text-[11.5px] font-black text-slate-800 px-0.5">
              شرکت‌های بیمه تکمیلی:
            </div>

            <div className="space-y-1.5">
              {INSURERS.map((ins) => {
                const isActive = ins.status === 'active';
                return (
                  <div
                    key={ins.id}
                    onClick={() => {
                      if (isActive) {
                        onSelectInsurer(ins.id);
                        onClose();
                        onShowToast('بیمه کارآفرین انتخاب شد');
                      } else {
                        setRequestedInsurerName(ins.name);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-400 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                          isActive
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        <Building2 className="w-4.5 h-4.5" />
                      </div>

                      {/* Full Insurance Name - Never Truncated */}
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                          {ins.name}
                        </div>
                        <div className="text-[10.5px] text-slate-500 truncate mt-0.5">
                          {ins.description}
                        </div>
                      </div>
                    </div>

                    {/* Rectangular, Crisp Badges (Never Oval or Circular!) */}
                    <div className="shrink-0 flex items-center gap-1">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-lg">
                          <span>✓ فعال و تایید شده</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10.5px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                          <span>به‌زودی</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Demand Registration Box - Compact */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>اطلاع‌رسانی اضافه شدن سایر بیمه‌ها</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              شماره خود را ثبت کنید تا به محض فعال‌سازی مراکز بیمه مورد نظرتان با پیامک باخبر شوید.
            </p>

            {isSubmitted ? (
              <div className="bg-white p-2.5 rounded-lg border border-emerald-300 text-emerald-800 text-[11.5px] font-bold text-center">
                ✓ تقاضای شما ثبت شد؛ اطلاع‌رسانی از طریق پیامک ارسال خواهد شد.
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="flex gap-1.5 pt-0.5">
                <input
                  type="text"
                  value={requestedInsurerName}
                  onChange={(e) => setRequestedInsurerName(e.target.value)}
                  placeholder="نام بیمه (دانا، دی...)"
                  className="w-1/2 bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="tel"
                  dir="ltr"
                  value={requestedPhone}
                  onChange={(e) => setRequestedPhone(e.target.value)}
                  placeholder="0914xxxxxxx"
                  className="w-1/2 bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-400 text-right"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#F15A31] hover:bg-[#d94821] text-white rounded-lg text-xs font-bold shrink-0 transition flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>ثبت</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition active:scale-98 shadow-2xs"
          >
            بستن و بازگشت به فهرست مراکز
          </button>
        </div>
      </div>
    </div>
  );
};
