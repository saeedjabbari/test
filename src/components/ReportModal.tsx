import React, { useState, useMemo } from 'react';
import { X, AlertCircle, Send, CheckCircle2, Loader2, Phone, FileText, ShieldAlert, ShieldCheck } from 'lucide-react';
import { MedicalCenter } from '../data/centers';
import { ReportReason } from '../types';
import { getReportRateLimitStatus } from '../utils/rateLimit';
import { toFa } from '../utils/persian';

interface ReportModalProps {
  center: MedicalCenter | null;
  onClose: () => void;
  onSubmitReport: (
    center: MedicalCenter,
    reason: ReportReason,
    reasonLabel: string,
    details: string,
    reporterContact: string
  ) => Promise<boolean>;
}

const REASONS: { id: ReportReason; label: string }[] = [
  { id: 'phone', label: 'شماره تلفن اشتباه، خاموش یا تغییر یافته است' },
  { id: 'address', label: 'مرکز به نشانی دیگری نقل مکان کرده است' },
  { id: 'contract', label: 'قرارداد با بیمه کارآفرین لغو یا تمدید نشده است' },
  { id: 'timing', label: 'ساعات کاری، شیفت یا وضعیت شبانه‌روزی تغییر کرده' },
  { id: 'other', label: 'سایر مغایرت‌ها یا توضیحات تکمیلی' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  center,
  onClose,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<ReportReason>('phone');
  const [details, setDetails] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Rate limiting check: Max 3 reports per hour to block abusive bots
  const rateStatus = useMemo(() => getReportRateLimitStatus(), [center, isSubmitting]);

  if (!center) return null;

  const currentReasonObj = REASONS.find((r) => r.id === reason) || REASONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !rateStatus.allowed) return;
    setIsSubmitting(true);

    try {
      const ok = await onSubmitReport(
        center,
        reason,
        currentReasonObj.label,
        details.trim(),
        reporterContact.trim()
      );

      if (ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setIsSubmitting(false);
          onClose();
        }, 850);
      } else {
        setIsSubmitting(false);
      }
    } catch (err) {
      console.warn('Report submission completed with notice:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 border border-slate-200 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              گزارش مغایرت یا تغییر مشخصات مرکز
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-slate-900">گزارش شما با موفقیت ثبت شد</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              با تشکر از همکاری شما، اطلاعات پس از بررسی اعمال خواهد شد.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 space-y-3.5 text-xs">
            {/* Anti-Bot Rate Limit Warning Banner (only shown if limit is actually reached) */}
            {!rateStatus.allowed && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5 shadow-2xs">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-800 text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>سقف مجاز ثبت گزارش تکمیل شده است</span>
                </div>
                <p className="leading-relaxed text-[11.5px] text-amber-700 font-medium">
                  به منظور جلوگیری از هرزنامه، هر کاربر حداکثر مجاز به ثبت ۳ گزارش در هر ساعت می‌باشد. لطفاً پس از <strong>{toFa(rateStatus.retryAfterMinutes)} دقیقه</strong> مجدداً تلاش فرمایید.
                </p>
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">مرکز درمانی انتخابی:</span>
                <strong className="text-slate-900 font-bold block mt-0.5 text-sm">
                  {center.name}
                </strong>
                <span className="text-slate-500 text-[11px]">دسته‌بندی: {center.type}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                موضوع گزارش یا مغایرت:
              </label>
              <select
                value={reason}
                disabled={!rateStatus.allowed}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#0a4c9a] focus:ring-1 focus:ring-[#0a4c9a] disabled:bg-slate-100 disabled:opacity-60"
              >
                {REASONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>توضیحات یا اطلاعات صحیح جدید (اختیاری):</span>
              </label>
              <textarea
                value={details}
                disabled={!rateStatus.allowed}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="مثلاً: شماره جدید مرکز 04433... است یا به خیابان حسنی، مجتمع پاستور منتقل شده..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#0a4c9a] focus:ring-1 focus:ring-[#0a4c9a] resize-none disabled:bg-slate-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>شماره تماس شما جهت هماهنگی (اختیاری):</span>
              </label>
              <input
                type="tel"
                value={reporterContact}
                disabled={!rateStatus.allowed}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="۰۹۱۲... یا ۰۴۴..."
                dir="ltr"
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#0a4c9a] text-right disabled:bg-slate-100 disabled:opacity-60"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !rateStatus.allowed}
                className="flex-1 py-2.5 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-bold flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال ثبت...</span>
                  </>
                ) : !rateStatus.allowed ? (
                  <span>سقف ساعتی تکمیل شده</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>ثبت گزارش</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
