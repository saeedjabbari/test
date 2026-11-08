import React from 'react';
import {
  Sparkles,
  Pill,
  Activity,
  Building2,
  ShieldCheck,
  Search,
  FileText,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { toFa } from '../utils/persian';

interface WelcomeHeroProps {
  onSelectType: (type: string) => void;
  onOpenGuide: () => void;
  onFocusSearch: () => void;
  onOpenStreetFilter: () => void;
  totalCentersCount: number;
  onOpenInsurerModal?: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  onSelectType,
  onOpenGuide,
  onFocusSearch,
  onOpenStreetFilter,
  totalCentersCount,
  onOpenInsurerModal,
}) => {
  return (
    <section className="space-y-4 pt-1 pb-1">
      {/* 1. Warm, Friendly Welcome Banner (Snapp Doctor Style Hero) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a4c9a] text-white p-5 sm:p-7 shadow-lg shadow-blue-950/10 border border-white/10" style={{ background: 'linear-gradient(135deg, #0a4c9a 0%, #0d5cb8 50%, #1e40af 100%)' }}>
        {/* Soft background ambient glow with standard hex alpha */}
        <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full pointer-events-none opacity-20" style={{ backgroundColor: '#60a5fa', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full pointer-events-none opacity-25" style={{ backgroundColor: '#F15A31', filter: 'blur(40px)' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>سامانه هوشمند سلامت و بیمه تکمیلی</span>
              <span className="text-white/40">|</span>
              <span className="text-amber-300">مراکز فعال: ارومیه</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
              مراکز درمانی طرف قرارداد بیمه تکمیلی
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/95 leading-relaxed font-medium">
              مرجع جامع جستجو، مسیریابی و دسترسی سریع به بیمارستان‌ها، درمانگاه‌ها، داروخانه‌ها و دندانپزشکی‌های طرف قرارداد بیمه تکمیلی با امکان ثبت آنلاین اسناد خسارت درمان.
            </p>

            {/* Quick Accurate Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] sm:text-xs">
              <button
                type="button"
                onClick={onOpenInsurerModal}
                className="flex items-center gap-1.5 bg-emerald-500/30 hover:bg-emerald-500/40 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-emerald-400/50 text-emerald-100 font-bold transition active:scale-95 cursor-pointer"
                title="مشاهده اطلاعات و سایر شرکت‌های بیمه"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>پوشش فعال: بیمه کارآفرین (سایر بیمه‌ها ▾)</span>
              </button>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>مراکز شبانه‌روزی</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                <FileText className="w-3.5 h-3.5 text-sky-300" />
                <span>راهنمای خسارت</span>
              </div>
            </div>
          </div>

          {/* Quick Action CTA buttons */}
          <div className="flex flex-row md:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onFocusSearch}
              className="flex-1 md:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white text-[#0a4c9a] hover:bg-blue-50 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-[#0a4c9a]" />
              <span>جستجوی سریع</span>
            </button>

            <button
              type="button"
              onClick={onOpenGuide}
              className="flex-1 md:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#F15A31] hover:bg-[#d94821] text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border border-orange-400/40"
            >
              <FileText className="w-4 h-4" />
              <span>راهنمای خسارت</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Major Pillars (Snapp Doctor "چه خدماتی به شما ارائه می‌دهیم؟") */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0a4c9a]" />
            <span>خدمات پرکاربرد بیمه تکمیلی</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            دسترسی مستقیم و فوری
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Card 1: Dental */}
          <button
            type="button"
            onClick={() => onSelectType('دندانپزشکی')}
            className="group bg-white hover:bg-teal-50/50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 hover:border-teal-300 shadow-2xs hover:shadow-md transition-all duration-200 text-right flex items-center gap-3 relative overflow-hidden active:scale-98"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)' }}
            >
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-teal-700 transition">
                مراکز دندانپزشکی
              </h4>
              <p className="text-[10.5px] sm:text-xs text-slate-500 truncate mt-0.5">
                عصب‌کشی، ترمیم و جراحی
              </p>
            </div>
          </button>

          {/* Card 2: Pharmacy */}
          <button
            type="button"
            onClick={() => onSelectType('داروخانه')}
            className="group bg-white hover:bg-emerald-50/50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all duration-200 text-right flex items-center gap-3 relative overflow-hidden active:scale-98"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' }}
            >
              <Pill className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                داروخانه‌ها
              </h4>
              <p className="text-[10.5px] sm:text-xs text-slate-500 truncate mt-0.5">
                شبانه‌روزی و مراکز منتخب
              </p>
            </div>
          </button>

          {/* Card 3: Lab & Imaging */}
          <button
            type="button"
            onClick={() => onSelectType('آزمایشگاه')}
            className="group bg-white hover:bg-indigo-50/50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all duration-200 text-right flex items-center gap-3 relative overflow-hidden active:scale-98"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)' }}
            >
              <Activity className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-700 transition">
                آزمایشگاه و پاتولوژی
              </h4>
              <p className="text-[10.5px] sm:text-xs text-slate-500 truncate mt-0.5">
                چکاپ، خون و نمونه‌گیری
              </p>
            </div>
          </button>

          {/* Card 4: Hospitals & Surgery */}
          <button
            type="button"
            onClick={() => onSelectType('بیمارستان')}
            className="group bg-white hover:bg-blue-50/50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all duration-200 text-right flex items-center gap-3 relative overflow-hidden active:scale-98"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #0a4c9a 100%)' }}
            >
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#0a4c9a] transition">
                بیمارستان و جراحی
              </h4>
              <p className="text-[10.5px] sm:text-xs text-slate-500 truncate mt-0.5">
                بستری و اورژانس شبانه‌روزی
              </p>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
