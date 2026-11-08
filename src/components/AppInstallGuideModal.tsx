import React, { useState, useEffect } from 'react';
import {
  X,
  Share,
  PlusSquare,
  Smartphone,
  Download,
  Apple,
  Monitor,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface AppInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable?: boolean;
  onInstall?: () => Promise<boolean | void>;
}

export const AppInstallGuideModal: React.FC<AppInstallGuideModalProps> = ({
  isOpen,
  onClose,
  isInstallable = false,
  onInstall,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');

  useEffect(() => {
    // Detect OS
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setActiveTab('ios');
      } else if (/android/.test(ua)) {
        setActiveTab('android');
      } else {
        setActiveTab('desktop');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    if (onInstall) {
      await onInstall();
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-label="بستن"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 p-5 space-y-4 border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0a4c9a] flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                نصب برنامه مراکز درمانی کارآفرین
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                دسترسی سریع، اطلاع از آخرین تغییرات و جستجوی آفلاین
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits Box */}
        <div
          className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-3.5 space-y-2 text-xs"
          style={{
            backgroundColor: '#eff6ff',
            background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)',
          }}
        >
          <div className="flex items-center gap-1.5 text-[#0a4c9a] font-extrabold text-[12px]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>مزایای نصب برنامه:</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-700 pr-1">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>دسترسی فوری:</strong> باز شدن با یک لمس، بدون نیاز به باز کردن مرورگر و تایپ آدرس.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>جستجوی آفلاین:</strong> مشاهده تلفن و آدرس مراکز حتی در زمان قطعی اینترنت.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>به‌روزرسانی خودکار:</strong> دریافت آخرین تغییرات و مراکز جدید به صورت لحظه‌ای.</span>
            </div>
          </div>
        </div>

        {/* OS Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`py-2 px-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'android'
                ? 'bg-white text-[#0a4c9a] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>اندروید</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'ios'
                ? 'bg-white text-[#0a4c9a] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Apple className="w-3.5 h-3.5 shrink-0" />
            <span>آیفون / آیپد</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`py-2 px-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'desktop'
                ? 'bg-white text-[#0a4c9a] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 shrink-0" />
            <span>کامپیوتر / لپ‌تاپ</span>
          </button>
        </div>

        {/* Direct Install Button if browser triggered it */}
        {isInstallable && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#0a4c9a] block">نصب خودکار آماده است</span>
              <span className="text-[11px] text-slate-500 block">با یک کلیک برنامه را نصب کنید</span>
            </div>
            <button
              onClick={handleDirectInstall}
              className="py-1.5 px-3.5 bg-[#0a4c9a] hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>نصب فوری</span>
            </button>
          </div>
        )}

        {/* Tab 1: Android Guide */}
        {activeTab === 'android' && (
          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                ۱
              </span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 block text-[12px]">
                  لمس منوی سه نقطه مرورگر:
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  در بالای صفحه گوشه راست مرورگر کروم، دکمه ۳ نقطه <strong className="text-slate-800">⋮</strong> را لمس کنید.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                ۲
              </span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 block text-[12px]">
                  انتخاب گزینه «افزودن به صفحه اصلی» یا «نصب برنامه»:
                </span>
                <p className="text-[11px] text-slate-600 mt-1 font-semibold flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#0a4c9a]" />
                  <span>Install app یا Add to Home screen</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                ۳
              </span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 block text-[12px]">
                  تایید و ذخیره آیکون در صفحه اصلی:
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  روی گزینه <strong>Install</strong> یا <strong>افزودن</strong> بزنید. آیکون برنامه در منوی دستگاه قرار می‌گیرد و با یک لمس باز می‌شود.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: iOS Guide */}
        {activeTab === 'ios' && (
          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                ۱
              </span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 block text-[12px]">
                  لمس دکمه Share در نوار سافاری:
                </span>
                <div className="flex items-center gap-1.5 mt-1 text-blue-600 font-bold text-[11px]">
                  <Share className="w-4 h-4" />
                  <span>آیکون مربع همراه با فلش رو به بالا</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                ۲
              </span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 block text-[12px]">
                  انتخاب گزینه Add to Home Screen:
                </span>
                <div className="flex items-center gap-1.5 mt-1 text-slate-800 font-bold text-[11px]">
                  <PlusSquare className="w-4 h-4 text-slate-700" />
                  <span>افزودن به صفحه اصلی (Add to Home Screen)</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                ۳
              </span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 block text-[12px]">
                  لمس دکمه Add در بالای صفحه:
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  برنامه روی صفحه اصلی آیفون ذخیره می‌شود و همیشه به آسانی در دسترس شما خواهد بود.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Desktop Guide */}
        {activeTab === 'desktop' && (
          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                ۱
              </span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 block text-[12px]">
                  کلیک روی آیکون نصب در نوار آدرس:
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  در مرورگر Chrome یا Edge کامپیوتر، در انتهای سمت راست نوار آدرس آیکون <strong className="text-slate-800">نصب (Install)</strong> یا منوی سه‌نقطه را باز کنید.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                ۲
              </span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 block text-[12px]">
                  انتخاب گزینه Install:
                </span>
                <p className="text-[11px] text-slate-600 mt-1 font-semibold flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#0a4c9a]" />
                  <span>گزینه Install یا نصب برنامه را انتخاب کنید</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                ۳
              </span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 block text-[12px]">
                  اجرا در قالب برنامه مستقل دسکتاپ:
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  آیکون برنامه در دسکتاپ و تسک‌بار سیستم ویندوز یا مک قرار می‌گیرد و با نهایت سرعت باز می‌شود.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white text-xs font-bold transition active:scale-98 text-center shadow-xs"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppInstallGuideModal;
