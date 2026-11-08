import React, { useMemo } from 'react';
import {
  ExternalLink,
  FileText,
  CheckCircle,
  HelpCircle,
  Building,
  Shield,
  PhoneCall,
  Clock,
  CreditCard,
  FileCheck,
  Code2,
  Mail,
  Sparkles,
  Smartphone,
  Layers,
  HeartHandshake,
  Globe,
  Download
} from 'lucide-react';
import { toFa } from '../utils/persian';
import { getMergedCenters } from '../utils/centerStore';

const PORTAL_URL = 'https://sinad.karafarin-insurance.ir/DarmanAfzar.Customer/index.html';
const APP_DOWNLOAD_URL = 'https://sinad.karafarin-insurance.ir/app';

interface GuideTabProps {
  onOpenOnboarding?: () => void;
  onOpenInstall?: () => void;
}

export const GuideTab: React.FC<GuideTabProps> = ({ onOpenOnboarding, onOpenInstall }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Hero Portal Card with CSS linear-gradient fallback for older browsers */}
      <div
        className="bg-[#0a4c9a] rounded-2xl p-5 text-white shadow-md space-y-3.5"
        style={{ background: 'linear-gradient(135deg, #0a4c9a 0%, #1d6fd1 100%)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-extrabold leading-tight">
              پورتال و اپلیکیشن ثبت خسارت بیمه درمان تکمیلی
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">
              سامانه جامع ثبت خسارت و دریافت هزینه درمان (سیناد)
            </p>
          </div>
        </div>

        <p className="text-xs text-blue-100/90 leading-relaxed">
          اگر مرکز درمانی مورد نظر شما طرف قرارداد آنلاین نیست، می‌توانید هزینه‌ها را شخصاً پرداخت کرده و با بارگذاری مدارک در سامانه یا اپلیکیشن، خسارت درمان را مستقیماً در حساب بانکی خود دریافت کنید.
        </p>

        {/* Dual Actions: Web Portal + Android App Download */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <a
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#0a4c9a] hover:bg-blue-50 font-extrabold text-xs py-3 px-3.5 rounded-xl shadow-xs transition active:scale-98"
          >
            <ExternalLink className="w-4 h-4 text-[#0a4c9a]" />
            <span>ورود به سامانه تحت وب سیناد</span>
          </a>

          <a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 px-3.5 rounded-xl shadow-xs transition active:scale-98"
          >
            <Smartphone className="w-4 h-4 text-white" />
            <span>دانلود اپلیکیشن اندروید سیناد</span>
          </a>
        </div>
      </div>

      {/* PWA Benefits & Install Card - Clean, Concise & Mobile-Optimized */}
      <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0a4c9a] flex items-center justify-center font-bold shrink-0">
              <Smartphone className="w-5 h-5 text-[#0a4c9a]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                نصب اپلیکیشن تکمیلی آنلاین
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                دسترسی سریع و جستجوی آفلاین بدون نیاز به اینترنت
              </p>
            </div>
          </div>

          {onOpenInstall && (
            <button
              type="button"
              onClick={onOpenInstall}
              className="px-3 py-1.5 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs shrink-0 cursor-pointer"
              title="نصب اپلیکیشن روی دستگاه"
            >
              <Download className="w-3.5 h-3.5" />
              <span>نصب</span>
            </button>
          )}
        </div>

        <p className="text-[11.5px] leading-relaxed text-slate-600">
          با افزودن این برنامه به صفحه اصلی گوشی، همیشه با یک لمس به همه مراکز دسترسی دارید و در مواقع قطعی اینترنت نیز بدون مشکل کار می‌کند.
        </p>
      </div>

      {/* Steps to Claim */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0a4c9a]" />
          <span>مراحل دریافت خسارت از پذیرش تا پرداخت</span>
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center font-bold text-xs shrink-0">
              ۱
            </span>
            <div>
              <strong className="text-slate-900 block font-bold">مراجعه و دریافت فاکتور معتبر:</strong>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                هنگام مراجعه به مرکز غیر طرف قرارداد، صورتحساب ممهور به مهر مرکز و دستور پزشک را دریافت فرمایید.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center font-bold text-xs shrink-0">
              ۲
            </span>
            <div>
              <strong className="text-slate-900 block font-bold">ورود به پورتال سیناد:</strong>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                با کدملی بیمه‌شده اصلی وارد سامانه شوید و گزینه «ثبت پرونده خسارت جدید» را انتخاب کنید.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center font-bold text-xs shrink-0">
              ۳
            </span>
            <div>
              <strong className="text-slate-900 block font-bold">بارگذاری تصاویر و شماره شبا:</strong>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                عکس‌های واضح و خوانا از مدارک را بارگذاری نموده و شماره شبای بانکی را تأیید کنید.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              ۴
            </span>
            <div>
              <strong className="text-slate-900 block font-bold">رسیدگی و واریز وجه:</strong>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                کارشناسان بیمه کارآفرین پرونده را بررسی کرده و مبلغ خسارت طبق سقف قرارداد به حسابتان واریز می‌شود.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist of Required Documents */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>مدارک لازم برای بارگذاری در سامانه</span>
        </h3>

        <ul className="space-y-2 text-xs text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>اصل دستور پزشک معالج با ذکر نام بیمار، تاریخ و مهر پزشک</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>اصل صورتحساب رسمی یا قبض صندوق با مهر و امضای مرکز درمانی</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>برای خدمات پاراکلینیکی (آزمایش، سونوگرافی، MRI، سی‌تی اسکن): برگه گزارش یا جواب نتیجه</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>برای خدمات دندانپزشکی: برگه معاینه دندانپزشک همراه با گرافی قبل و بعد درمان (در صورت درخواست بیمه)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>کارت ملی بیمار و شماره شبای بانکی به نام بیمه‌شده اصلی</span>
          </li>
        </ul>
      </div>

      {/* About Application & Developer Info */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a4c9a] flex items-center justify-center shrink-0 border border-blue-100">
              <Shield className="w-5 h-5 text-[#0a4c9a]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                درباره نرم‌افزار و مشخصات توسعه‌دهنده
              </h3>
              <p className="text-[11px] text-slate-500">
                سامانه هوشمند مراکز درمانی طرف قرارداد بیمه تکمیلی · ارومیه
              </p>
            </div>
          </div>

          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="text-xs font-bold text-[#0a4c9a] hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition active:scale-95 flex items-center gap-1 shrink-0"
              title="مشاهده راهنمای تصویری"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>راهنمای سریع</span>
            </button>
          )}
        </div>

        {/* App Purpose Description */}
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
          <p>
            تکمیلی آنلاین یک <strong>سامانه هوشمند و جامع</strong> برای دسترسی سریع، آسان و بدون معطلی به فهرست کامل بیش از {toFa(getMergedCenters().length)} مرکز درمانی طرف قرارداد بیمه تکمیلی در شهر ارومیه (شامل بیمارستان‌ها، درمانگاه‌های شبانه‌روزی، آزمایشگاه‌ها، مراکز تصویربرداری، دندانپزشکی‌ها، داروخانه‌ها و فیزیوتراپی‌ها) است.
          </p>
          <p className="text-[11.5px] text-slate-500 pt-1 border-t border-slate-200/60">
            🎯 <strong>هدف سامانه:</strong> خدمت‌رسانی و تسهیل دسترسی عموم بیمه‌شدگان و شهروندان محترم جهت تسریع در یافتن نزدیک‌ترین مراکز درمانی، شماره‌های تماس معتبر، مسیریابی دقیق و ثبت آسان اسناد خسارت درمان.
          </p>
        </div>

        {/* Developer Contact Card */}
        <div
          className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
          style={{
            backgroundColor: '#eff6ff',
            background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center shrink-0 font-extrabold shadow-2xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 text-[11px] block">طراح و توسعه‌دهنده نرم‌افزار:</span>
              <strong className="text-slate-900 font-extrabold text-xs block mt-0.5">سعید جباری</strong>
            </div>
          </div>

          <a
            href="https://saeed-jabbari.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-[#0a4c9a] font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-95 shrink-0"
            title="مشاهده وب‌سایت توسعه‌دهنده"
          >
            <Globe className="w-4 h-4 text-[#0a4c9a]" />
            <span>مشاهده وب‌سایت</span>
          </a>
        </div>
      </div>

      {/* Official Links Footer */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Building className="w-4 h-4 text-[#0a4c9a]" />
          <span>سامانه تکمیلی آنلاین · ارومیه</span>
        </div>
        <p className="text-[11.5px] leading-relaxed text-slate-500">
          این راهنما برای تسهیل امور درمانی و دریافت اسناد خسارت درمان تکمیلی در شهر ارومیه تهیه و به‌صورت مستمر به‌روزرسانی می‌شود.
        </p>
        <div className="flex flex-wrap gap-3 pt-1 text-xs">
          <a
            href="https://takmilionline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0a4c9a] hover:underline font-bold inline-flex items-center gap-1"
          >
            <span>وب‌سایت تکمیلی آنلاین (takmilionline.com)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-300">·</span>
          <a
            href="https://www.karafarin-insurance.ir/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0a4c9a] hover:underline font-bold inline-flex items-center gap-1"
          >
            <span>پرتال رسمی بیمه کارآفرین</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
