import React, { useEffect, useState, useMemo } from 'react';
import {
  X,
  Phone,
  Copy,
  Share2,
  MapPin,
  AlertCircle,
  Hash,
  Moon,
  Navigation,
  Star,
  MessageSquare,
  Send,
  CheckCircle2,
  User,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { MedicalCenter } from '../data/centers';
import { fmtPhone, toFa, formatCenterName, formatPersianDate } from '../utils/persian';
import { getCategoryMeta } from '../constants/categories';
import {
  getCenterReviews,
  getCenterRatingSummary,
  submitCenterReview,
  CenterReview,
} from '../lib/reviews';

interface CenterDetailModalProps {
  center: MedicalCenter | null;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (k: number) => void;
  onCopyText: (text: string, label?: string) => void;
  onOpenReport: (center: MedicalCenter) => void;
}

export const CenterDetailModal: React.FC<CenterDetailModalProps> = ({
  center,
  onClose,
  onCopyText,
  onOpenReport,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  const [reviews, setReviews] = useState<CenterReview[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Review Form States
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [phone, setPhone] = useState('');
  const [directDeduction, setDirectDeduction] = useState<'yes' | 'no' | 'unknown'>('yes');
  const [waitingTime, setWaitingTime] = useState<'short' | 'medium' | 'long'>('short');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reload reviews when center changes
  useEffect(() => {
    if (!center) return;
    setReviews(getCenterReviews(center.k));
    setIsFormOpen(false);
    setSubmitSuccess(false);
    setActiveTab('info');
  }, [center]);

  useEffect(() => {
    if (!center) return;

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

    // Support browser/hardware back button to close modal
    const stateObj = { modal: 'center-detail' };
    window.history.pushState(stateObj, '');

    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = '';
    };
  }, [center, onClose]);

  if (!center) return null;

  const meta = getCategoryMeta(center.type);
  const Icon = meta.icon;
  const ratingSummary = getCenterRatingSummary(center.k);

  // Clean, validate, and deduplicate phone numbers
  const allPhones = useMemo(() => {
    const rawList = [center.phone, ...(center.alt || [])];
    const cleaned: string[] = [];
    const seen = new Set<string>();

    for (const item of rawList) {
      if (!item) continue;
      const digits = item.replace(/\D/g, '');
      if (center.id && digits === center.id.replace(/\D/g, '')) continue;
      if (digits === String(center.k)) continue;
      if (digits.length < 7 || digits.length > 12) continue;

      if (!seen.has(digits)) {
        seen.add(digits);
        cleaned.push(item);
      }
    }
    return cleaned;
  }, [center.phone, center.alt, center.id, center.k]);

  const handleShare = async () => {
    const text = `${center.name}\n${center.address}\n${
      center.phone ? 'تلفن: ' + fmtPhone(center.phone) : ''
    }\nطرف قرارداد بیمه تکمیلی (ارومیه)`;
    if (navigator.share) {
      try {
        await navigator.share({ title: center.name, text });
      } catch {
        // User cancelled
      }
    } else {
      onCopyText(text, 'اطلاعات مرکز کپی شد');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await submitCenterReview({
        centerId: center.k,
        centerName: center.name,
        rating,
        comment,
        authorName,
        phone,
        serviceCategory: center.specialty || center.type,
        directDeduction,
        waitingTime,
      });

      // Update state
      setReviews(getCenterReviews(center.k));
      setSubmitSuccess(true);
      setComment('');
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Scrim Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-label="بستن پنجره"
      />

      {/* Modal Panel */}
      <div className="relative w-[calc(100%-1rem)] max-w-md bg-white rounded-2xl shadow-2xl z-10 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center shrink-0 border ${meta.borderColor} shadow-2xs`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm font-extrabold text-slate-900 truncate">
                  {formatCenterName(center.name)}
                </h2>
                {center.isNightShift && (
                  <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black px-1.5 py-0.2 rounded-md shadow-2xs">
                    <Moon className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                    شبانه‌روزی
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                <span className="font-semibold text-slate-700">
                  {center.specialty || center.type}
                </span>
                {center.ownership && (
                  <>
                    <span className="mx-1 text-slate-300">·</span>
                    <span>{center.ownership}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition border border-slate-200/80 shrink-0"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation: Details vs Reviews */}
        <div className="flex border-b border-slate-200/80 bg-slate-100/50 p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'info'
                ? 'bg-white text-[#0a4c9a] shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>اطلاعات و تماس</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'bg-white text-[#0a4c9a] shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>نظرات مراجعین</span>
            {reviews.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 font-extrabold text-[10px] rounded-full">
                {toFa(reviews.length)}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 text-xs flex-1">
          {/* TAB 1: DETAILS & CONTACT */}
          {activeTab === 'info' && (
            <div className="space-y-2.5">
              {/* Address */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100/90 flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#0a4c9a] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-slate-700 leading-relaxed text-[11.5px] font-medium">
                    {center.address}
                  </p>
                  {center.streets && center.streets.length > 0 && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      محدوده: <span className="font-bold text-slate-600">{center.streets.join('، ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Numbers with Copy */}
              {allPhones.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100/90 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      شماره‌های تماس مرکز
                    </span>
                    {center.phone && (
                      <button
                        onClick={() => onCopyText(center.phone, 'شماره تماس کپی شد')}
                        className="text-[10.5px] text-[#0a4c9a] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        کپی
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allPhones.map((ph, idx) => (
                      <a
                        key={idx}
                        href={`tel:${ph}`}
                        className="inline-flex items-center gap-1 bg-white border border-slate-200 hover:border-emerald-500 px-2.5 py-1 rounded-lg text-slate-800 font-bold tabular-nums text-xs transition shadow-2xs hover:text-emerald-700"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{fmtPhone(ph)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical ID / System Code if available */}
              {center.id && (
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-slate-400" />
                    شناسه نظام پزشکی / کد مرکز:
                  </span>
                  <span className="font-extrabold text-slate-800 tabular-nums">
                    {toFa(center.id)}
                  </span>
                </div>
              )}

              {/* Dedicated Map Routing Button */}
              <a
                href={
                  (center.googleMapUrl && (center.googleMapUrl.includes('goo.gl') || center.googleMapUrl.includes('/place/')))
                    ? center.googleMapUrl
                    : center.lat && center.lng && center.lat > 30 && center.lng > 40
                    ? `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`
                    : center.googleMapUrl && (center.googleMapUrl.includes('query=') || center.googleMapUrl.includes('@'))
                    ? center.googleMapUrl
                    : center.pid && center.pid.trim().length > 10
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ارومیه')}&query_place_id=${encodeURIComponent(center.pid)}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ارومیه ' + center.address)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0a4c9a] border border-blue-200/90 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-2xs"
              >
                <Navigation className="w-4 h-4 text-[#0a4c9a]" />
                <span>مسیریابی روی نقشه و مکان‌یاب</span>
              </a>

              {/* Review Prompt Banner in Info tab */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('reviews');
                  setIsFormOpen(true);
                }}
                className="w-full p-2.5 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/90 text-right flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs">
                    ★
                  </div>
                  <div>
                    <div className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                      <span>تجربه مراجعه به این مرکز را دارید؟</span>
                      <span className="text-[10px] text-amber-800 font-bold">({toFa(reviews.length)} نظر)</span>
                    </div>
                    <div className="text-[10px] text-amber-800/80">برای کمک به سایر بیمه‌شدگان نظر خود را ثبت کنید</div>
                  </div>
                </div>
                <span className="text-amber-800 text-[11px] font-black group-hover:translate-x-[-2px] transition-transform">
                  ثبت نظر ←
                </span>
              </button>

              {/* Action Row: Report Error & Share */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReport(center);
                  }}
                  className="h-9 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#9a3412] border border-orange-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>گزارش خطا</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>اشتراک‌گذاری</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REVIEWS & VISIT EXPERIENCE */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {/* Review Success Alert */}
              {submitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>نظر و تجربه شما با موفقیت ثبت شد!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    با تشکر از مشارکت شما، نظر پس از تایید توسط ادمین در صفحه این مرکز منتشر خواهد شد.
                  </p>
                </div>
              )}

              {/* Review Score Summary Banner */}
              <div className="bg-gradient-to-l from-amber-500/10 via-amber-50/50 to-orange-50/50 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(ratingSummary.average)
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-black text-sm text-slate-900">
                      {toFa(ratingSummary.average.toFixed(1))}
                    </span>
                    <span className="text-[11px] text-slate-500">از ۵</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    بر اساس {toFa(reviews.length)} تجربه ثبت‌شده مراجعین
                  </div>
                </div>

                {!isFormOpen && (
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-bold text-xs transition shadow-2xs flex items-center gap-1"
                  >
                    <span>+ ثبت تجربه</span>
                  </button>
                )}
              </div>

              {/* Review Submission Form */}
              {isFormOpen && (
                <form
                  onSubmit={handleFormSubmit}
                  className="bg-white rounded-2xl border border-blue-200 p-3.5 space-y-3 shadow-sm animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#0a4c9a]" />
                      <span>ثبت تجربه مراجعه</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      انصراف
                    </button>
                  </div>

                  {/* Star Rating Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      امتیاز شما به این مرکز درمانی:
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110 active:scale-95"
                          title={`${star} ستاره`}
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              star <= (hoverRating || rating)
                                ? 'text-amber-500 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-700 mr-2">
                        {rating === 5
                          ? 'عالی'
                          : rating === 4
                          ? 'خیلی خوب'
                          : rating === 3
                          ? 'متوسط'
                          : rating === 2
                          ? 'ضعیف'
                          : 'خیلی ضعیف'}
                      </span>
                    </div>
                  </div>

                  {/* Insurance Experience Options */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-600 block">کسر آنلاین بیمه:</span>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => setDirectDeduction('yes')}
                          className={`px-2 py-1 rounded-lg border text-right transition ${
                            directDeduction === 'yes'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          ✓ آنلاین کسر شد
                        </button>
                        <button
                          type="button"
                          onClick={() => setDirectDeduction('no')}
                          className={`px-2 py-1 rounded-lg border text-right transition ${
                            directDeduction === 'no'
                              ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          فاکتور دستی دادند
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-600 block">زمان معطلی و نوبت:</span>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => setWaitingTime('short')}
                          className={`px-2 py-1 rounded-lg border text-right transition ${
                            waitingTime === 'short'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          کم و سریع
                        </button>
                        <button
                          type="button"
                          onClick={() => setWaitingTime('medium')}
                          className={`px-2 py-1 rounded-lg border text-right transition ${
                            waitingTime === 'medium'
                              ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          متوسط / معمولی
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      توضیح تجربه مراجعه و نحوه ویزیت:
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="درباره نحوه برخورد پرسنل، هماهنگی با بیمه تکمیلی، پاکیزگی و کیفیت خدمات توضیح دهید..."
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-[#0a4c9a] focus:ring-1 focus:ring-[#0a4c9a] outline-none"
                    />
                  </div>

                  {/* Author Name and Phone (Optional) */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="نام شما (اختیاری)"
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-[11px] outline-none focus:border-[#0a4c9a]"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="شماره تماس (اختیاری)"
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-[11px] outline-none focus:border-[#0a4c9a] text-right"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="w-full py-2 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'در حال ثبت...' : 'ارسال تجربه برای تایید'}</span>
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-2.5">
                {reviews.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 space-y-1.5 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                    <Star className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
                    <div className="font-bold text-xs text-slate-600">هنوز نظری برای این مرکز ثبت نشده است</div>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      شما اولین نفری باشید که تجربه مراجعه و پذیرش بیمه خود را به اشتراک می‌گذارد.
                    </p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 space-y-2 hover:bg-slate-50 transition"
                    >
                      {/* Review Top Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 text-xs">
                              {rev.authorName || 'بیمه‌شده محترم'}
                            </span>
                            {rev.status === 'pending' && (
                              <span className="mr-1.5 px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[9px] font-black">
                                در انتظار تایید ادمین
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-slate-700 text-xs leading-relaxed font-normal">
                        {rev.comment}
                      </p>

                      {/* Badges & Date */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {rev.directDeduction === 'yes' && (
                            <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded-md border border-emerald-200 font-bold">
                              ✓ کسر آنلاین بیمه
                            </span>
                          )}
                          {rev.waitingTime === 'short' && (
                            <span className="bg-blue-50 text-blue-800 px-1.5 py-0.2 rounded-md border border-blue-200 font-bold">
                              معطلی کم
                            </span>
                          )}
                        </div>

                        <span className="dir-ltr text-right">
                          {rev.createdAt ? formatPersianDate(rev.createdAt) : ''}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
