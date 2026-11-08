import React from 'react';
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react';
import { DeviceInfo } from '../utils/device';

interface PWAInstallBottomBannerProps {
  isOpen: boolean;
  deviceInfo?: DeviceInfo;
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallBottomBanner: React.FC<PWAInstallBottomBannerProps> = ({
  isOpen,
  deviceInfo,
  onInstall,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const isDesktop = deviceInfo?.isDesktop ?? false;
  const isTablet = deviceInfo?.isTablet ?? false;

  const title = isDesktop
    ? 'نصب اپلیکیشن روی کامپیوتر'
    : isTablet
      ? 'نصب اپلیکیشن روی تبلت'
      : 'نصب اپلیکیشن روی گوشی';

  const badgeText = deviceInfo?.badgeLabel || (isDesktop ? 'نسخه ویندوز / کامپیوتر' : 'نسخه موبایل');
  const buttonText = deviceInfo?.actionButtonLabel || (isDesktop ? 'نصب روی کامپیوتر' : 'نصب روی گوشی');
  const descriptionText = deviceInfo?.description || 'اجرای تمام‌صفحه و سریع، کارکرد آفلاین و بدون نوار آدرس مرورگر';

  return (
    <aside
      aria-label="نصب اپلیکیشن"
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-45 animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="bg-white/98 backdrop-blur-md border-2 border-blue-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-slate-900/15 flex items-center gap-3 relative ring-1 ring-blue-500/20">
        {/* App Icon with Device Badge */}
        <div className="relative shrink-0">
          <img
            src="/icons/icon-192.png"
            alt="لوگوی مراکز درمانی کارآفرین"
            className="w-12 h-12 rounded-xl shadow-xs object-cover border border-slate-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/icon.svg';
            }}
          />
          <div
            className={`absolute -bottom-1 -left-1 text-white rounded-full p-0.5 shadow-xs ${
              isDesktop ? 'bg-[#0a4c9a]' : isTablet ? 'bg-indigo-600' : 'bg-emerald-600'
            }`}
            title={badgeText}
          >
            {isDesktop ? (
              <Monitor className="w-2.5 h-2.5" />
            ) : isTablet ? (
              <Tablet className="w-2.5 h-2.5" />
            ) : (
              <Smartphone className="w-2.5 h-2.5" />
            )}
          </div>
        </div>

        {/* Content Text */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-xs sm:text-[13px] font-extrabold text-slate-900 leading-snug">
              {title}
            </h3>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                isDesktop
                  ? 'bg-blue-100 text-blue-800'
                  : isTablet
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {badgeText}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
            {descriptionText}
          </p>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={onInstall}
              className="inline-flex items-center gap-1.5 bg-[#0a4c9a] hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-2xs transition active:scale-95 cursor-pointer"
            >
              {isDesktop ? (
                <Monitor className="w-3.5 h-3.5" />
              ) : isTablet ? (
                <Tablet className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{buttonText}</span>
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="text-[11px] text-slate-400 hover:text-slate-600 px-2 py-1.5 font-medium transition mr-auto cursor-pointer"
            >
              بعداً
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0 self-start transition active:scale-90 cursor-pointer"
          title="بستن بنر"
          aria-label="بستن اعلان نصب"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default PWAInstallBottomBanner;
