import React from 'react';
import { Phone, Navigation, Bookmark, MapPin, Moon, ShieldCheck, ChevronLeft, Star } from 'lucide-react';
import { MedicalCenter } from '../data/centers';
import { fmtPhone, formatCenterName } from '../utils/persian';
import { getCategoryMeta } from '../constants/categories';

interface CenterCardProps {
  center: MedicalCenter;
  isSaved: boolean;
  onToggleSave: (k: number) => void;
  onOpenDetail: (center: MedicalCenter) => void;
  onCopyPhone: (phone: string, e: React.MouseEvent) => void;
}

export const CenterCard: React.FC<CenterCardProps> = React.memo(({
  center,
  isSaved,
  onToggleSave,
  onOpenDetail,
}) => {
  const meta = getCategoryMeta(center.type);
  const Icon = meta.icon;
  const mapUrl =
    (center.googleMapUrl && (center.googleMapUrl.includes('goo.gl') || center.googleMapUrl.includes('/place/')))
      ? center.googleMapUrl
      : (center.lat && center.lng && center.lat > 30 && center.lng > 40)
        ? `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`
        : center.googleMapUrl && (center.googleMapUrl.includes('query=') || center.googleMapUrl.includes('@'))
          ? center.googleMapUrl
          : (center.pid && center.pid.trim().length > 10)
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ارومیه')}&query_place_id=${encodeURIComponent(center.pid)}`
            : '';

  const hasValidLocation = Boolean(mapUrl && mapUrl.length > 0);

  return (
    <article
      onClick={() => onOpenDetail(center)}
      className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col gap-2.5 group relative"
    >
      {/* Top Header Row: Icon, Name, Specialty, and Bookmark */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Category Icon with energetic personality */}
          <div
            className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center shrink-0 border ${meta.borderColor} shadow-2xs`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-sm sm:text-[15px] font-black text-slate-900 group-hover:text-[#0a4c9a] transition leading-snug">
                {formatCenterName(center.name)}
              </h3>

              {center.isNightShift && (
                <span
                  className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black px-1.5 py-0.2 rounded-md shrink-0 select-none shadow-2xs"
                  title="مرکز درمانی شبانه‌روزی (۲۴ ساعته فعال)"
                >
                  <Moon className="w-2.5 h-2.5 text-amber-500 fill-amber-400 shrink-0" />
                  <span>شبانه‌روزی</span>
                </span>
              )}
            </div>

            {/* Zero-Pill Clean Metadata */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{center.specialty || center.type}</span>
              {center.ownership && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{center.ownership}</span>
                </>
              )}
              {center.phone && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="tabular-nums font-medium text-slate-600 dir-ltr text-right">
                    {fmtPhone(center.phone)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bookmark Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(center.k);
          }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition ${
            isSaved
              ? 'bg-amber-100 text-amber-500 hover:bg-amber-200 border border-amber-300/80 shadow-2xs'
              : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-transparent'
          }`}
          title={isSaved ? 'حذف از نشان‌شده‌ها' : 'نشان کردن'}
          aria-label="نشان کردن"
        >
          {isSaved ? (
            <Bookmark className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
          ) : (
            <Bookmark className="w-4.5 h-4.5" />
          )}
        </button>
      </div>

      {/* Address line */}
      <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50/70 rounded-xl px-2.5 py-2 border border-slate-100/90">
        <MapPin className="w-3.5 h-3.5 text-[#0a4c9a] shrink-0 mt-0.5" />
        <span className="leading-relaxed line-clamp-1">{center.address}</span>
      </div>

      {/* Sleek Action Row: Call & Map + Compact "ثبت نظر" + Detail Indicator */}
      <div
        className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {center.phone ? (
            <a
              href={`tel:${center.phone}`}
              className="h-8.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs shrink-0"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>تماس</span>
            </a>
          ) : (
            <span className="text-[11px] text-slate-400 italic">بدون تلفن مستقیم</span>
          )}

          {hasValidLocation && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8.5 px-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <Navigation className="w-3.5 h-3.5 text-[#0a4c9a] shrink-0" />
              <span>مسیریابی</span>
            </a>
          )}
        </div>

        {/* Action Group: "ثبت نظر / امتیاز" on the right of "جزئیات" */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onOpenDetail(center)}
            className="text-[11px] font-bold text-amber-800 bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/80 px-2 py-1 rounded-lg transition flex items-center gap-1"
            title="ثبت نظر و تجربه مراجعه به این مرکز"
          >
            <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
            <span>ثبت نظر</span>
          </button>

          <span className="text-slate-200 select-none text-[11px]">|</span>

          <button
            type="button"
            onClick={() => onOpenDetail(center)}
            className="text-[11px] font-bold text-slate-500 hover:text-[#0a4c9a] flex items-center gap-0.5 transition py-1 px-1.5 rounded-lg hover:bg-slate-50"
          >
            <span>جزئیات</span>
            <ChevronLeft className="w-3 h-3 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
});
