import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  MapPin,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  ShieldCheck,
  CheckCircle,
  Moon,
} from 'lucide-react';
import { toFa } from '../utils/persian';

interface QuickOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSearch?: () => void;
}

interface SlideItem {
  id: number;
  badge: string;
  badgeColor: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  tip?: string;
}

const ONBOARDING_SLIDES: SlideItem[] = [
  {
    id: 1,
    badge: 'گام ۱ از ۵',
    badgeColor: 'bg-blue-100 text-[#0a4c9a] border-blue-200',
    icon: Search,
    iconBg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-[#0a4c9a]',
    title: 'جستجوی مستقیم و سریع',
    description:
      'نام پزشک، درمانگاه، آزمایشگاه یا تخصص را در کادر بالای صفحه بنویسید. حتی با نوشتن ۲ حرف (مثل «دندا»)، مراکز منطبق فوراً پیش روی شما ظاهر می‌شوند.',
    tip: '💡 نیاز به فشردن کلید اینتر نیست؛ سیستم خودکار جستجو می‌کند.',
  },
  {
    id: 2,
    badge: 'گام ۲ از ۵',
    badgeColor: 'bg-orange-100 text-[#F15A31] border-orange-200',
    icon: MapPin,
    iconBg: 'bg-orange-50 border-orange-200',
    iconColor: 'text-[#F15A31]',
    title: 'مراکز نزدیک شما بر اساس خیابان',
    description:
      'با زدن دکمه «خیابان‌ها»، مراکز درمانی واقع در خیابان‌های حسنی، مولوی، کاشانی، خیام و... را به تفکیک مشاهده کرده و نزدیک‌ترین مرکز را بیابید.',
    tip: '📍 امکان مشاهده لوکیشن و تماس فوری در هر کارت وجود دارد.',
  },
  {
    id: 3,
    badge: 'گام ۳ از ۵ (اورژانسی)',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    icon: Moon,
    iconBg: 'bg-indigo-50 border-indigo-200',
    iconColor: 'text-indigo-600',
    title: 'مراکز شبانه‌روزی با یک لمس (آیکون ماه)',
    description:
      'در ساعات شب، ایام تعطیل یا موارد اورژانسی، کافیست روی آیکون ماه در بالای صفحه کلیک کنید تا تمام بیمارستان‌ها، درمانگاه‌ها و داروخانه‌های فعال و ۲۴ ساعته ارومیه یکجا فیلتر شوند.',
    tip: '🌙 مناسب برای دسترسی برق‌آسا در مواقع اضطراری بدون اتلاف وقت.',
  },
  {
    id: 4,
    badge: 'گام ۴ از ۵ (مهم)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: AlertTriangle,
    iconBg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    title: 'ثبت مغایرت یا عدم پذیرش بیمه تکمیلی',
    description:
      'اگر مرکزی با بیمه تکمیلی همکاری نکرد یا شماره تماس و نشانی آن تغییر کرده بود، کافیست روی «جزئیات» مرکز کلیک کرده و دکمه «گزارش مغایرت» را بزنید.',
    tip: '🛡️ کارشناسان گزارش شما را بررسی کرده و اطلاعات را به‌سرعت اصلاح و پیگیری می‌کنند.',
  },
  {
    id: 5,
    badge: 'گام ۵ از ۵',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: Smartphone,
    iconBg: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    title: 'ثبت خسارت و دسترسی دائمی بدون اینترنت',
    description:
      'اگر به مرکزی مراجعه کردید که آنلاین نبود، فاکتور را در تب «ثبت خسارت» (از طریق وب یا اپلیکیشن سیناد) بارگذاری نمایید. این نرم‌افزار به صورت آفلاین نیز در گوشی کار می‌کند.',
    tip: '📱 در تب ثبت خسارت می‌توانید اپلیکیشن اندروید سیناد را دانلود کنید.',
  },
];

export const QuickOnboardingModal: React.FC<QuickOnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartSearch,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentSlide(0);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handleNext();
      if (e.key === 'ArrowRight') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, currentSlide]);

  if (!isOpen) return null;

  const handleFinish = (action?: 'search' | 'close') => {
    try {
      localStorage.setItem('krf_onboarding_seen', 'true');
    } catch {}
    onClose();
    if (action === 'search' && onStartSearch) {
      setTimeout(() => {
        onStartSearch();
      }, 150);
    }
  };

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish('search');
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const slide = ONBOARDING_SLIDES[currentSlide];
  const IconComponent = slide.icon;
  const isLast = currentSlide === ONBOARDING_SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => handleFinish('close')}
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-[calc(100%-1rem)] sm:w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 mx-auto my-auto">
        {/* Top Header Graphic */}
        <div
          className="bg-[#0a4c9a] p-5 text-white relative"
          style={{
            backgroundColor: '#0a4c9a',
            background: 'linear-gradient(135deg, #0a4c9a 0%, #1864c2 100%)',
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>راهنمای کاربری سامانه</span>
            </span>

            <button
              onClick={() => handleFinish('close')}
              className="text-xs font-bold px-2.5 py-1 rounded-lg transition"
              style={{
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              }}
              title="رد کردن راهنما"
            >
              رد کردن
            </button>
          </div>

          <h2
            className="text-base sm:text-lg font-extrabold leading-tight mt-3"
            style={{ color: '#ffffff' }}
          >
            تکمیلی آنلاین · مراکز طرف قرارداد بیمه تکمیلی
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: '#dbeafe' }}
          >
            سامانه هوشمند سلامت و مراکز درمانی · ارومیه
          </p>
        </div>

        {/* Current Slide Content */}
        <div className="p-5 sm:p-6 space-y-4 min-h-[250px] flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${slide.badgeColor}`}
              >
                {slide.badge}
              </span>

              <span className="text-[11px] font-bold text-slate-400">
                {toFa(currentSlide + 1)} از {toFa(ONBOARDING_SLIDES.length)}
              </span>
            </div>

            <div className="flex items-start gap-3.5 pt-1">
              <div
                className={`w-12 h-12 rounded-2xl ${slide.iconBg} ${slide.iconColor} flex items-center justify-center shrink-0 border shadow-2xs`}
              >
                <IconComponent className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  {slide.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {slide.description}
                </p>
              </div>
            </div>

            {slide.tip && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed font-medium">
                {slide.tip}
              </div>
            )}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {ONBOARDING_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? 'w-7 bg-[#0a4c9a]'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`اسلاید ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation Buttons: Next (Large, prominent under right thumb), Previous (Smaller, compact on left) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2.5">
          {/* Right side in RTL: Large Primary Next / Start button (Thumb-friendly & dominant) */}
          <button
            type="button"
            onClick={handleNext}
            className={`flex-[3] min-h-[50px] py-3.5 px-5 rounded-2xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 transition active:scale-98 shadow-md hover:shadow-lg ${
              isLast
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-[#0a4c9a] hover:bg-blue-900'
            }`}
            style={{
              backgroundColor: isLast ? '#059669' : '#0a4c9a',
              background: isLast
                ? 'linear-gradient(135deg, #059669 0%, #0f766e 100%)'
                : 'linear-gradient(135deg, #0a4c9a 0%, #1864c2 100%)',
              color: '#ffffff',
            }}
          >
            <span style={{ color: '#ffffff' }}>{isLast ? 'شروع و ورود به برنامه' : 'گام بعدی'}</span>
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>

          {/* Left side in RTL: Smaller, compact Previous / Skip button */}
          {currentSlide > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="min-h-[38px] h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold text-[11.5px] flex items-center justify-center gap-1 transition active:scale-95 shrink-0"
              title="بازگشت به گام قبلی"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>قبلی</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleFinish('close')}
              className="min-h-[38px] h-10 px-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 font-bold text-[11.5px] flex items-center justify-center gap-1 transition active:scale-95 shrink-0"
              title="رد کردن راهنما"
            >
              <span>رد کردن</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
