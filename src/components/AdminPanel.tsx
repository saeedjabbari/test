import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MedicalCenterReport, ReportStatus, ReportReason } from '../types';
import { formatPersianDate, toFa, norm, squash } from '../utils/persian';
import { MEDICAL_CENTERS, MedicalCenter } from '../data/centers';
import {
  getSheetsWebhookUrl,
  setSheetsWebhookUrl,
  fetchReportsFromSheets,
  fetchSearchesFromSheets,
  fetchVisitsFromSheets,
  recordSearchToSheets,
  recordVisitToSheets,
  SearchRecord,
  VisitRecord,
  GOOGLE_APPS_SCRIPT_CODE,
} from '../lib/sheets';
import { AdminCMS } from './AdminCMS';
import { getMergedCenters } from '../utils/centerStore';
import { trackPWAInstallationForce } from '../utils/analytics';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  LogOut,
  ArrowRight,
  Download,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Search,
  Phone,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Layers,
  List,
  Building2,
  AlertCircle,
  Settings,
  Link,
  ExternalLink,
  Code2,
  TrendingUp,
  BarChart3,
  AlertOctagon,
  Target,
  Sparkles,
  MousePointerClick,
  Filter,
  Eye,
  EyeOff,
  Mail,
  ArrowLeft,
  Send,
  ShieldAlert,
  CheckCircle2,
  Users,
  Smartphone,
  Laptop,
  Monitor,
  X,
  Star,
} from 'lucide-react';
import {
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  CenterReview,
} from '../lib/reviews';

const ADMIN_STORAGE_KEY = 'krf_admin_logged_in';
const ADMIN_PASS_KEY = 'krf_admin_pass';
const DEFAULT_PASSWORD = 'A$m@#73';
const DEFAULT_USERNAME = 'admin';
export const ALLOWED_ADMIN_EMAILS = [
  'saeedjabbari21@gmail.com',
  'saeedjababri21@gmail.com',
];

// Constant Decoy Secret 2FA Codes derived from saeed & asma (Phone Keypad Cipher)
// S(7)A(2) + A(2)S(7) + M(6)A(2) = 722762
// S(7)A(2)E(3) + A(2)S(7)M(6) = 723276
export const SECRET_2FA_CODES = ['722762', '723276', '140321'];

interface AdminPanelProps {
  onBackToApp: () => void;
  showToast: (msg: string) => void;
}

const REASON_LABELS: Record<ReportReason, string> = {
  phone: 'تلفن تماس',
  address: 'نشانی و آدرس',
  contract: 'قرارداد بیمه',
  timing: 'ساعات کاری / شبانه‌روزی',
  other: 'سایر موارد',
};

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; bg: string; border: string; icon: any }
> = {
  pending: {
    label: 'در انتظار بررسی',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: Clock,
  },
  verified: {
    label: 'تأیید شده',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: CheckCircle,
  },
  applied: {
    label: 'اصلاح شد در برنامه',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle,
  },
  rejected: {
    label: 'رد شده / نامعتبر',
    color: 'text-slate-500',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    icon: XCircle,
  },
};

export interface GroupedCenterReports {
  centerId: number;
  centerName: string;
  centerType: string;
  reportCount: number;
  reasonsSummary: Record<string, number>;
  latestReportDate: string;
  pendingCount: number;
  reports: MedicalCenterReport[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToApp,
  showToast,
}) => {
  // Authentication & Fast-Login State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true' ||
        localStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
      );
    } catch {
      return false;
    }
  });
  const [loginStep, setLoginStep] = useState<'credentials' | 'email_prompt' | 'otp_verify'>('credentials');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');

  // 2FA Email & OTP states
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<{
    code: string;
    expiry: number;
    email: string;
  } | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');

  // Search details preview modal
  const [previewSearchItem, setPreviewSearchItem] = useState<SearchRecord | null>(null);

  const [centersVersion, setCentersVersion] = useState(0);

  useEffect(() => {
    const handleCentersUpdated = () => {
      setCentersVersion((v) => v + 1);
    };
    window.addEventListener('krf_centers_updated', handleCentersUpdated);
    return () => window.removeEventListener('krf_centers_updated', handleCentersUpdated);
  }, []);

  const allCenters = useMemo(() => {
    return getMergedCenters();
  }, [centersVersion]);

  // Countdown timer for 2FA OTP expiration
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Password & Settings Modals (3-field password change)
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [oldPassInput, setOldPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [passChangeError, setPassChangeError] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [sheetsUrlInput, setSheetsUrlInput] = useState<string>(() => getSheetsWebhookUrl());
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTestingSheets, setIsTestingSheets] = useState(false);

  // Main Dashboard Tab: 'reports' | 'searches' | 'visits' | 'cms' | 'insurers' | 'reviews'
  const [activeTab, setActiveTab] = useState<'reports' | 'searches' | 'visits' | 'cms' | 'insurers' | 'reviews'>('reports');

  // Center Reviews states
  const [reviewsList, setReviewsList] = useState<CenterReview[]>(() => getAllReviews());
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const reloadReviews = useCallback(() => {
    setReviewsList(getAllReviews());
  }, []);

  // Insurer Demands states
  const [insurerRequests, setInsurerRequests] = useState<
    Array<{ insurer: string; phone: string; createdAt?: string; date?: string }>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem('krf_insurer_requests') || '[]');
    } catch {
      return [];
    }
  });

  const reloadInsurerRequests = useCallback(() => {
    try {
      setInsurerRequests(JSON.parse(localStorage.getItem('krf_insurer_requests') || '[]'));
    } catch {}
  }, []);

  // Search Marketing states
  const [searches, setSearches] = useState<SearchRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('krf_cached_searches') || '[]');
    } catch {
      return [];
    }
  });
  const [isSearchesLoading, setIsSearchesLoading] = useState(false);
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [onlyZeroResults, setOnlyZeroResults] = useState(false);
  const [isSendingTestSearch, setIsSendingTestSearch] = useState(false);

  // User & Device Analytics states
  const [visits, setVisits] = useState<VisitRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('krf_cached_visits') || '[]');
    } catch {
      return [];
    }
  });
  const [isVisitsLoading, setIsVisitsLoading] = useState(false);
  const [visitTableQuery, setVisitTableQuery] = useState('');
  const [visitOsFilter, setVisitOsFilter] = useState('all');
  const [visitPwaFilter, setVisitPwaFilter] = useState('all');
  const [copiedForVisits, setCopiedForVisits] = useState(false);
  const [isSendingTestVisit, setIsSendingTestVisit] = useState(false);

  // Data states (Instant Local-First Initialization - 0ms delay on entry)
  const [reports, setReports] = useState<MedicalCenterReport[]>(() => {
    try {
      const cached = localStorage.getItem('krf_admin_cached_reports');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (r) =>
              (r.centerName && r.centerName !== 'مرکز درمانی') ||
              r.centerId > 1 ||
              (r.details && String(r.details).trim().length > 0)
          );
        }
      }
      const localStored = JSON.parse(localStorage.getItem('krf_reports') || '[]');
      return localStored
        .filter((r: any) => r.centerName || r.k || r.centerId)
        .map((r: any, idx: number) => {
          const cId = Number(r.k || r.centerId || 1);
          let cName = r.centerName;
          let cType = r.centerType;
          if (!cName || cName === 'مرکز درمانی') {
            const found = MEDICAL_CENTERS.find((c) => c.k === cId);
            if (found) {
              cName = found.name;
              cType = found.type;
            } else {
              cName = `مرکز کد ${cId}`;
            }
          }
          return {
            id: `local-${idx}`,
            centerId: cId,
            centerName: cName,
            centerType: cType || 'مرکز درمانی',
            reason: r.reason || 'other',
            reasonLabel: r.reasonLabel || REASON_LABELS[r.reason as ReportReason] || 'سایر',
            details: r.details || '',
            reporterContact: r.reporterContact || '',
            status: r.status || 'pending',
            createdAt: r.timestamp || r.createdAt || new Date().toISOString(),
          };
        });
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSyncSource, setActiveSyncSource] = useState<'sheets' | 'firestore' | 'local'>('local');

  // View modes: 'grouped' (تجمیع بر اساس مرکز) or 'detailed' (تک‌تک سطرها)
  const [viewMode, setViewMode] = useState<'grouped' | 'detailed'>('grouped');
  const [expandedCenterId, setExpandedCenterId] = useState<number | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [copiedForSheets, setCopiedForSheets] = useState(false);

  // Universal fetch combining Google Sheets + Local Cache (Non-blocking & Instant)
  const fetchAllReports = useCallback(
    async (showFeedback = false) => {
      // 1. Immediately read local cache (0ms instant display)
      try {
        const localStored = JSON.parse(localStorage.getItem('krf_reports') || '[]');
        if (localStored.length > 0) {
          const cached = localStored.map((r: any, idx: number) => ({
            id: `local-${idx}`,
            centerId: Number(r.k || r.centerId || 1),
            centerName: r.centerName || `مرکز کد ${r.k || r.centerId}`,
            centerType: r.centerType || 'مرکز درمانی',
            reason: r.reason || 'other',
            reasonLabel: r.reasonLabel || REASON_LABELS[r.reason as ReportReason] || 'سایر',
            details: r.details || '',
            reporterContact: r.reporterContact || '',
            status: r.status || 'pending',
            createdAt: r.timestamp || r.createdAt || new Date().toISOString(),
          }));
          setReports(cached);
          setIsLoading(false);
        }
      } catch {}

      // 2. Background sync with Google Sheets without freezing UI
      const webhookUrl = getSheetsWebhookUrl();
      if (webhookUrl) {
        setIsRefreshing(true);
        try {
          const sheetsReports = await fetchReportsFromSheets();
          if (sheetsReports && sheetsReports.length > 0) {
            sheetsReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setReports(sheetsReports);
            setActiveSyncSource('sheets');
            if (showFeedback) {
              showToast(`همگام‌سازی از گوگل شیت انجام شد (${toFa(sheetsReports.length)} گزارش)`);
            }
          }
        } catch (e) {
          console.warn('Sheets fetch warning:', e);
        } finally {
          setIsRefreshing(false);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  // Fetch all searches from Google Sheets
  const fetchAllSearches = useCallback(
    async (showFeedback = false) => {
      setIsSearchesLoading(true);
      try {
        const fetched = await fetchSearchesFromSheets();
        if (fetched && fetched.length > 0) {
          const reversed = [...fetched].reverse();
          setSearches(reversed);
          try {
            localStorage.setItem('krf_cached_searches', JSON.stringify(reversed));
          } catch {}
          if (showFeedback) {
            showToast(`آمار دریافت شد: ${toFa(reversed.length)} جستجو در گوگل شیت`);
          }
        } else if (showFeedback) {
          showToast('هنوز جستجویی در شیت ثبت نشده است');
        }
      } catch (err) {
        console.warn('Error fetching searches:', err);
        if (showFeedback) {
          showToast('خطا در دریافت آمار جستجوها از شیت');
        }
      } finally {
        setIsSearchesLoading(false);
      }
    },
    [showToast]
  );

  // Send a test search to Google Sheets to verify and auto-create the sheet tab
  const handleSendTestSearch = async () => {
    setIsSendingTestSearch(true);
    const testCases = [
      { term: 'دندانپزشکی ارومیه', resCount: 3, street: 'خیابان حسنی', type: 'داروخانه و دندانپزشکی' },
      { term: 'ام آر آی کوثر (تقاضای ناموجود)', resCount: 0, street: 'خیابان کاشانی', type: 'تصویربرداری و MRI' },
      { term: 'داروخانه شبانه روزی', resCount: 2, street: 'خیابان خیام', type: 'داروخانه‌ها' },
    ];
    const picked = testCases[Math.floor(Math.random() * testCases.length)];
    const ok = await recordSearchToSheets({
      term: picked.term,
      resultCount: picked.resCount,
      selectedStreet: picked.street,
      selectedType: picked.type,
      clickedCenter: 'تست ادمین (بررسی اتصال شیت)',
    });
    if (ok) {
      showToast(`جستجوی آزمایشی «${picked.term}» ارسال شد. دریافت از شیت...`);
      setTimeout(() => fetchAllSearches(true), 1500);
    } else {
      showToast('خطا در ارسال. لطفاً آدرس وب‌هوک را بررسی کنید');
    }
    setIsSendingTestSearch(false);
  };

  // Copy searches data for Excel / Google Sheets
  const handleCopySearchesForExcel = () => {
    if (searches.length === 0) {
      showToast('جستجویی برای کپی وجود ندارد');
      return;
    }
    const headers = [
      'ردیف',
      'عبارت جستجو شده',
      'تعداد نتایج یافت‌شده',
      'مرکز انتخاب‌شده / اقدام کاربر',
      'فیلتر خیابان',
      'فیلتر دسته‌بندی',
      'تاریخ و زمان',
      'وضعیت تقاضا',
    ];
    const rows = searches.map((s, i) => [
      i + 1,
      s.term,
      s.resultCount,
      s.clickedCenter || '—',
      s.selectedStreet || 'همه',
      s.selectedType || 'همه',
      s.createdAt || '—',
      s.resultCount === 0 ? '❌ ناموجود (فرصت قرارداد)' : '✅ یافت شد',
    ]);
    const tsvText = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvText).then(() => {
      showToast('داده‌های جستجوها کپی شد! می‌توانید در اکسل یا شیت پیست کنید');
    });
  };

  // Fetch all user & device visits from Google Sheets
  const fetchAllVisits = useCallback(
    async (showFeedback = false) => {
      setIsVisitsLoading(true);
      try {
        const fetched = await fetchVisitsFromSheets();
        let combined = [...(fetched || [])];

        // Merge locally cached visits (handles recent installs on this or nearby devices before sheet sync)
        try {
          const cached: VisitRecord[] = JSON.parse(localStorage.getItem('krf_cached_visits') || '[]');
          if (cached && cached.length > 0) {
            const seen = new Set(combined.map((v) => `${v.deviceId}-${v.timestamp}`));
            for (const item of cached) {
              const key = `${item.deviceId}-${item.timestamp}`;
              if (!seen.has(key)) {
                combined.push(item);
                seen.add(key);
              }
            }
          }
        } catch {}

        if (combined.length > 0) {
          const reversed = [...combined].reverse();
          setVisits(reversed);
          try {
            localStorage.setItem('krf_cached_visits', JSON.stringify(combined));
          } catch {}
          if (showFeedback) {
            showToast(`آمار دریافت شد: ${toFa(reversed.length)} نشست دستگاه‌ها`);
          }
        } else if (showFeedback) {
          showToast('هنوز دستگاهی در شیت ثبت نشده است');
        }
      } catch (err) {
        console.warn('Error fetching visits from sheets; falling back to local cache:', err);
        try {
          const cached = JSON.parse(localStorage.getItem('krf_cached_visits') || '[]');
          if (cached && cached.length > 0) {
            setVisits([...cached].reverse());
          }
        } catch {}
        if (showFeedback) {
          showToast('دریافت از شیت با کندی مواجه شد؛ داده‌های محلی نمایش داده شدند');
        }
      } finally {
        setIsVisitsLoading(false);
      }
    },
    [showToast]
  );

  // Force register current device as installed PWA
  const handleRegisterCurrentDevicePWA = async () => {
    setIsSendingTestVisit(true);
    try {
      await trackPWAInstallationForce();
      showToast('وضعیت نصب همین دستگاه بلافاصله در آمار ثبت گردید!');
      setTimeout(() => fetchAllVisits(true), 1200);
    } catch {
      showToast('خطا در ثبت وضعیت نصب');
    } finally {
      setIsSendingTestVisit(false);
    }
  };

  // Send a test device visit to Google Sheets
  const handleSendTestVisit = async () => {
    setIsSendingTestVisit(true);
    const testModels = [
      { model: 'سامسونگ (Galaxy A54)', os: 'اندروید', browser: 'کروم (Chrome)', isPWA: 'نصب‌شده (PWA)' },
      { model: 'شیائومی (Redmi Note 12)', os: 'اندروید', browser: 'کروم (Chrome)', isPWA: 'مرورگر وب' },
      { model: 'آیفون (iPhone 13)', os: 'آیفون / آیپد', browser: 'سافاری (Safari)', isPWA: 'نصب‌شده (PWA)' },
      { model: 'رایانه ویندوز (PC)', os: 'ویندوز (PC)', browser: 'مایکروسافت اج (Edge)', isPWA: 'مرورگر وب' },
    ];
    const picked = testModels[Math.floor(Math.random() * testModels.length)];
    const ok = await recordVisitToSheets({
      deviceId: `krf-usr-${Math.random().toString(36).substring(2, 7)}`,
      deviceType: picked.os.includes('ویندوز') ? 'کامپیوتر' : 'موبایل',
      model: picked.model,
      os: picked.os,
      browser: picked.browser,
      isPWA: picked.isPWA,
      screenResolution: picked.os.includes('ویندوز') ? '1920 × 1080' : '390 × 844',
      visitCount: Math.floor(Math.random() * 5) + 1,
      timestamp: new Date().toISOString(),
    });
    if (ok) {
      showToast('دستگاه آزمایشی ارسال شد. دریافت از شیت...');
      setTimeout(() => fetchAllVisits(true), 1500);
    } else {
      showToast('خطا در ارسال. لطفاً آدرس وب‌هوک را بررسی کنید');
    }
    setIsSendingTestVisit(false);
  };

  // Copy visits data for Excel / Google Sheets
  const handleCopyVisitsForExcel = () => {
    if (visits.length === 0) {
      showToast('داده‌ای برای کپی وجود ندارد');
      return;
    }
    const headers = [
      'ردیف',
      'شناسه دستگاه',
      'نوع دستگاه',
      'مدل گوشی و دستگاه',
      'سیستم عامل',
      'مرورگر',
      'وضعیت نصب PWA',
      'رزولوشن صفحه',
      'دفعات بازدید',
      'تاریخ و زمان',
    ];
    const rows = visits.map((v, i) => [
      i + 1,
      v.deviceId,
      v.deviceType,
      v.model,
      v.os,
      v.browser,
      v.isPWA,
      v.screenResolution,
      v.visitCount,
      v.timestamp || '—',
    ]);
    const tsvText = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvText).then(() => {
      setCopiedForVisits(true);
      showToast('داده‌های دستگاه‌های کاربران کپی شد!');
      setTimeout(() => setCopiedForVisits(false), 2500);
    });
  };

  // Search marketing analytics
  const searchAnalytics = useMemo(() => {
    const total = searches.length;
    const zeroResults = searches.filter((s) => s.resultCount === 0);
    const successful = searches.filter((s) => s.resultCount > 0);
    const clickedCount = searches.filter(
      (s) => s.clickedCenter && s.clickedCenter !== '—' && !s.clickedCenter.includes('مشاهده نتایج')
    ).length;

    // Group terms
    const termMap: Record<
      string,
      { count: number; zeroCount: number; lastDate: string; sampleClicks: string[] }
    > = {};

    searches.forEach((s) => {
      const t = (s.term || '').trim();
      if (!t) return;
      if (!termMap[t]) {
        termMap[t] = { count: 0, zeroCount: 0, lastDate: s.createdAt || '', sampleClicks: [] };
      }
      termMap[t].count += 1;
      if (s.resultCount === 0) {
        termMap[t].zeroCount += 1;
      }
      if (s.clickedCenter && !termMap[t].sampleClicks.includes(s.clickedCenter)) {
        termMap[t].sampleClicks.push(s.clickedCenter);
      }
    });

    const topKeywords = Object.entries(termMap)
      .map(([term, data]) => ({ term, ...data }))
      .sort((a, b) => b.count - a.count);

    const unmetDemands = topKeywords
      .filter((k) => k.zeroCount > 0)
      .sort((a, b) => b.zeroCount - a.zeroCount || b.count - a.count);

    return {
      total,
      zeroCount: zeroResults.length,
      successfulCount: successful.length,
      clickedCount,
      uniqueKeywordsCount: topKeywords.length,
      topKeywords: topKeywords.slice(0, 10),
      unmetDemands: unmetDemands.slice(0, 10),
    };
  }, [searches]);

  // Visits & Device analytics
  const visitAnalytics = useMemo(() => {
    const totalSessions = visits.length;
    const uniqueDevices = new Set(visits.map((v) => v.deviceId)).size;

    // Unique devices that have installed the app
    const installedDeviceIds = new Set(
      visits
        .filter((v) => {
          const s = (v.isPWA || '').toLowerCase();
          return s.includes('pwa') || s.includes('نصب');
        })
        .map((v) => v.deviceId)
    );
    const installedDevicesCount = installedDeviceIds.size;
    const pwaSessionsCount = visits.filter((v) => {
      const s = (v.isPWA || '').toLowerCase();
      return s.includes('pwa') || s.includes('نصب');
    }).length;

    const pwaPercentage = uniqueDevices > 0 ? Math.round((installedDevicesCount / uniqueDevices) * 100) : 0;

    const osCounts: Record<string, number> = {};
    const modelCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};

    visits.forEach((v) => {
      const os = v.os || 'نامشخص';
      osCounts[os] = (osCounts[os] || 0) + 1;

      const mod = v.model || 'نامشخص';
      modelCounts[mod] = (modelCounts[mod] || 0) + 1;

      const br = v.browser || 'نامشخص';
      browserCounts[br] = (browserCounts[br] || 0) + 1;
    });

    const topOs = Object.entries(osCounts).sort((a, b) => b[1] - a[1]);
    const topModels = Object.entries(modelCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topBrowsers = Object.entries(browserCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

    return {
      totalSessions,
      uniqueDevices,
      installedDevicesCount,
      installedDeviceIds,
      pwaSessionsCount,
      pwaPercentage,
      topOs,
      topModels,
      topBrowsers,
    };
  }, [visits]);

  // Filtered searches for the table
  const filteredSearches = useMemo(() => {
    const q = searchTableQuery.trim().toLowerCase();
    return searches.filter((s) => {
      if (onlyZeroResults && s.resultCount > 0) return false;
      if (!q) return true;
      const termMatch = s.term.toLowerCase().includes(q);
      const centerMatch = (s.clickedCenter || '').toLowerCase().includes(q);
      const streetMatch = (s.selectedStreet || '').toLowerCase().includes(q);
      const typeMatch = (s.selectedType || '').toLowerCase().includes(q);
      return termMatch || centerMatch || streetMatch || typeMatch;
    });
  }, [searches, searchTableQuery, onlyZeroResults]);

  // Filtered visits for the table
  const filteredVisits = useMemo(() => {
    const q = visitTableQuery.trim().toLowerCase();
    return visits.filter((v) => {
      if (visitOsFilter !== 'all' && !v.os.toLowerCase().includes(visitOsFilter.toLowerCase())) {
        return false;
      }
      if (visitPwaFilter !== 'all') {
        const isPWA = v.isPWA.includes('PWA') || v.isPWA.includes('نصب');
        if (visitPwaFilter === 'pwa' && !isPWA) return false;
        if (visitPwaFilter === 'browser' && isPWA) return false;
      }
      if (!q) return true;
      return (
        v.deviceId.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.os.toLowerCase().includes(q) ||
        v.browser.toLowerCase().includes(q)
      );
    });
  }, [visits, visitTableQuery, visitOsFilter, visitPwaFilter]);

  // Initial load
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAllReports(false);
    fetchAllSearches(false);
    fetchAllVisits(false);
  }, [isAuthenticated, fetchAllReports, fetchAllSearches, fetchAllVisits]);

  // Step 1: Handle Username/Password Login -> Advances to Step 2 (Email prompt)
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const rawPass = localStorage.getItem(ADMIN_PASS_KEY);
    const savedPass = rawPass && rawPass !== 'karafarin1403' ? rawPass : DEFAULT_PASSWORD;

    const user = usernameInput.trim().toLowerCase();
    const isValidUser = user === DEFAULT_USERNAME || user === 'saeed' || user === '';

    if (isValidUser && passwordInput === savedPass) {
      setLoginStep('email_prompt');
      setEmailError('');
      showToast('گذرواژه تایید شد. لطفاً ایمیل اختصاصی مدیر را وارد فرمایید.');
    } else {
      setLoginError('نام کاربری یا رمز عبور اشتباه است');
    }
  };

  // Step 2: Request 2FA OTP to Email
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const normalized = emailInput.trim().toLowerCase();
    if (!normalized) {
      setEmailError('لطفاً آدرس ایمیل مدیریت را وارد فرمایید.');
      return;
    }

    setIsSendingOtp(true);

    setTimeout(() => {
      setIsSendingOtp(false);

      // Strict validation: Reject ANY email not in the approved admin list
      if (!ALLOWED_ADMIN_EMAILS.includes(normalized)) {
        setEmailError('ایمیل وارد شده معتبر نمی‌باشد. دسترسی به این بخش فقط برای مدیر سیستم مجاز است.');
        return;
      }

      setGeneratedOtp({ code: '722762', expiry: Date.now() + 10 * 60 * 1000, email: normalized });
      setCountdown(300); // 5 minutes countdown
      setLoginStep('otp_verify');
      setOtpInput('');
      setOtpError('');
      showToast('کد تایید ۶ رقمی ارسال گردید');
    }, 350);
  };

  // Step 3: Verify 6-digit OTP (Matches fixed secret codes)
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    const cleanOtp = otpInput.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setOtpError('لطفاً کد ۶ رقمی را به صورت کامل وارد فرمایید.');
      return;
    }

    // Validate against fixed secret codes
    if (SECRET_2FA_CODES.includes(cleanOtp)) {
      if (rememberMe) {
        localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      }
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      showToast('احراز هویت دو مرحله‌ای تایید شد. خوش آمدید.');
    } else {
      setOtpError('کد تایید وارد شده نادرست است. لطفاً مجدداً بررسی فرمایید.');
    }
  };

  // Resend OTP (Simulated convincing decoy delay of 1.25s)
  const handleResendOtp = () => {
    if (isSendingOtp) return;
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setCountdown(300);
      setOtpError('');
      showToast('کد تایید ۶ رقمی مجدداً ارسال گردید');
    }, 1250);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setLoginStep('credentials');
    setUsernameInput('');
    setPasswordInput('');
    setEmailInput('');
    setOtpInput('');
    setGeneratedOtp(null);
    setLoginError('');
    setEmailError('');
    setOtpError('');
    showToast('از پنل مدیریت خارج شدید');
  };

  const handleChangePassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPassChangeError('');

    const rawPass = localStorage.getItem(ADMIN_PASS_KEY);
    const currentSavedPass = rawPass && rawPass !== 'karafarin1403' ? rawPass : DEFAULT_PASSWORD;

    if (!oldPassInput) {
      setPassChangeError('لطفاً رمز عبور فعلی (قبلی) را وارد فرمایید.');
      return;
    }

    if (oldPassInput !== currentSavedPass) {
      setPassChangeError('رمز عبور قبلی نادرست است.');
      return;
    }

    if (!newPassInput || newPassInput.length < 4) {
      setPassChangeError('رمز عبور جدید باید حداقل ۴ نویسه باشد.');
      return;
    }

    if (newPassInput === currentSavedPass) {
      setPassChangeError('رمز عبور جدید نباید با رمز فعلی یکسان باشد.');
      return;
    }

    if (!confirmPassInput) {
      setPassChangeError('لطفاً تکرار رمز عبور جدید را وارد فرمایید.');
      return;
    }

    if (newPassInput !== confirmPassInput) {
      setPassChangeError('تکرار رمز عبور جدید با رمز جدید مطابقت ندارد.');
      return;
    }

    localStorage.setItem(ADMIN_PASS_KEY, newPassInput);
    setIsChangePassOpen(false);
    setOldPassInput('');
    setNewPassInput('');
    setConfirmPassInput('');
    setPassChangeError('');
    showToast('رمز عبور ادمین با موفقیت تغییر کرد');
  };

  const handleSaveSheetsUrl = () => {
    setSheetsWebhookUrl(sheetsUrlInput.trim());
    showToast('آدرس وب‌هوک گوگل شیت ذخیره شد');
    fetchAllReports(true);
    setIsSheetsModalOpen(false);
  };

  const handleTestSheetsConnection = async () => {
    if (!sheetsUrlInput.trim()) {
      showToast('لطفاً ابتدا لینک وب‌هوک را وارد فرمایید');
      return;
    }
    setIsTestingSheets(true);
    setSheetsWebhookUrl(sheetsUrlInput.trim());
    try {
      const res = await fetchReportsFromSheets();
      showToast(`اتصال برقرار شد! ${toFa(res.length)} گزارش از Google Sheets دریافت شد.`);
      fetchAllReports(false);
    } catch (err: any) {
      showToast('خطا در اتصال به وب‌هوک گوگل شیت. بررسی فرمایید که دسترسی روی Anyone باشد.');
    } finally {
      setIsTestingSheets(false);
    }
  };

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE).then(() => {
      setCopiedCode(true);
      showToast('کد اسکریپت گوگل شیت با موفقیت کپی شد');
      setTimeout(() => setCopiedCode(false), 2500);
    });
  };

  // Status changer for individual report
  const handleUpdateStatus = (reportId: string | undefined, newStatus: ReportStatus) => {
    if (!reportId) return;

    setReports((prev) => {
      const updated = prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r));
      try {
        localStorage.setItem('krf_admin_cached_reports', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`وضعیت به «${STATUS_CONFIG[newStatus].label}» تغییر یافت`);
  };

  // Delete report
  const handleDeleteReport = (reportId: string | undefined) => {
    if (!reportId) return;
    if (!window.confirm('آیا از حذف این گزارش مطمئن هستید؟')) return;

    setReports((prev) => {
      const updated = prev.filter((r) => r.id !== reportId);
      try {
        localStorage.setItem('krf_admin_cached_reports', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('گزارش حذف شد');
  };

  // Clear all test reports
  const handleClearAllReports = () => {
    if (!window.confirm('آیا مایلید تمام گزارش‌های آزمایشی موجود پاک شوند تا جدول صفر و آماده گزارش‌های واقعی شود؟')) {
      return;
    }
    setReports([]);
    try {
      localStorage.removeItem('krf_admin_cached_reports');
      localStorage.removeItem('krf_reports');
    } catch {}
    showToast('تمامی گزارش‌های آزمایشی پاک شدند');
  };

  // Filtered raw reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (reasonFilter !== 'all' && r.reason !== reasonFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.centerName?.toLowerCase().includes(q);
        const matchDetails = r.details?.toLowerCase().includes(q);
        const matchContact = r.reporterContact?.toLowerCase().includes(q);
        const matchType = r.centerType?.toLowerCase().includes(q);
        if (!matchName && !matchDetails && !matchContact && !matchType) return false;
      }
      return true;
    });
  }, [reports, statusFilter, reasonFilter, searchQuery]);

  // Grouped by Center (جلوگیری از تکرار نام مراکز در سطرها)
  const groupedCenters = useMemo(() => {
    const map = new Map<number, GroupedCenterReports>();

    for (const r of filteredReports) {
      // Skip empty ghost rows if any leak through
      if ((!r.centerName || r.centerName === 'مرکز درمانی') && (!r.reason || r.reason === 'other') && !r.details) {
        continue;
      }

      const cId = r.centerId || 0;
      let centerTitle = r.centerName;
      let centerTypeTitle = r.centerType || 'مرکز درمانی';

      if (!centerTitle || centerTitle === 'مرکز درمانی') {
        const found = MEDICAL_CENTERS.find((c) => c.k === cId);
        if (found) {
          centerTitle = found.name;
          centerTypeTitle = found.type;
        }
      }

      if (!map.has(cId)) {
        map.set(cId, {
          centerId: cId,
          centerName: centerTitle || `مرکز کد ${cId}`,
          centerType: centerTypeTitle,
          reportCount: 0,
          reasonsSummary: {},
          latestReportDate: r.createdAt,
          pendingCount: 0,
          reports: [],
        });
      } else {
        const item = map.get(cId)!;
        if (item.centerName === 'مرکز درمانی' && centerTitle && centerTitle !== 'مرکز درمانی') {
          item.centerName = centerTitle;
          item.centerType = centerTypeTitle;
        }
      }

      const item = map.get(cId)!;
      item.reportCount += 1;
      item.reports.push(r);

      const rLabel = r.reasonLabel || REASON_LABELS[r.reason] || r.reason;
      item.reasonsSummary[rLabel] = (item.reasonsSummary[rLabel] || 0) + 1;

      if (r.status === 'pending') {
        item.pendingCount += 1;
      }

      if (new Date(r.createdAt).getTime() > new Date(item.latestReportDate).getTime()) {
        item.latestReportDate = r.createdAt;
      }
    }

    // Sort by reportCount desc (مراکزی که بیشترین گزارش دارند در صدر لیست)
    return Array.from(map.values()).sort(
      (a, b) => b.reportCount - a.reportCount || b.pendingCount - a.pendingCount
    );
  }, [filteredReports]);

  // Status counts
  const counts = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((r) => r.status === 'pending').length,
      verified: reports.filter((r) => r.status === 'verified').length,
      applied: reports.filter((r) => r.status === 'applied').length,
      uniqueCenters: new Set(reports.map((r) => r.centerId)).size,
    };
  }, [reports]);

  // Export Grouped Centers to CSV (یک سطر برای هر مرکز با ستون تعداد گزارش)
  const handleExportGroupedCSV = () => {
    if (groupedCenters.length === 0) {
      showToast('گزارشی برای خروجی وجود ندارد');
      return;
    }

    const headers = [
      'ردیف',
      'کد مرکز',
      'نام مرکز درمانی',
      'دسته‌بندی',
      'تعداد کل گزارش‌های ثبت‌شده',
      'گزارش‌های در انتظار بررسی',
      'خلاصه موضوعات گزارش',
      'تاریخ آخرین گزارش',
    ];

    const rows = groupedCenters.map((g, index) => {
      const reasonsStr = Object.entries(g.reasonsSummary)
        .map(([k, v]) => `${k} (${v} مورد)`)
        .join(' - ');

      return [
        String(index + 1),
        String(g.centerId || ''),
        `"${(g.centerName || '').replace(/"/g, '""')}"`,
        `"${(g.centerType || '').replace(/"/g, '""')}"`,
        String(g.reportCount),
        String(g.pendingCount),
        `"${reasonsStr.replace(/"/g, '""')}"`,
        `"${formatPersianDate(g.latestReportDate)}"`,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `marakez_por_gozaresh_karafarin_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('فایل اکسل تجمیعی مراکز دانلود شد');
  };

  // Copy structured TSV for Google Sheets
  const handleCopyForGoogleSheets = () => {
    if (groupedCenters.length === 0) {
      showToast('گزارشی برای کپی وجود ندارد');
      return;
    }

    const headers = [
      'ردیف',
      'کد مرکز',
      'نام مرکز درمانی',
      'دسته‌بندی',
      'تعداد گزارش',
      'در انتظار',
      'موضوعات',
      'تاریخ آخرین گزارش',
    ];

    const rows = groupedCenters.map((g, i) => [
      i + 1,
      g.centerId,
      g.centerName,
      g.centerType,
      g.reportCount,
      g.pendingCount,
      Object.entries(g.reasonsSummary).map(([k, v]) => `${k}: ${v}`).join(' | '),
      formatPersianDate(g.latestReportDate),
    ]);

    const tsvText = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');

    navigator.clipboard.writeText(tsvText).then(() => {
      setCopiedForSheets(true);
      showToast('جدول تجمیعی کپی شد! می‌توانید مستقیماً در Google Sheets پیست کنید');
      setTimeout(() => setCopiedForSheets(false), 2500);
    });
  };

  // LOGIN SCREEN (WITH STRICT TWO-FACTOR AUTHENTICATION - 2FA)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0a4c9a] to-[#1e61b7] p-6 text-white text-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
              <ShieldCheck className="w-8 h-8 text-amber-300" />
            </div>
            <h1 className="text-base font-extrabold">پنل مدیریت تکمیلی آنلاین</h1>
            <p className="text-xs text-blue-100/90 mt-1">
              سامانه هوشمند مراکز درمانی و خدمات بیمه تکمیلی
            </p>
          </div>

          <div className="p-6">
            {/* STEP 1: USERNAME & PASSWORD */}
            {loginStep === 'credentials' && (
              <div>
                {loginError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1">
                      نام کاربری ادمین:
                    </label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="نام کاربری (admin)..."
                      dir="ltr"
                      autoFocus
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1">
                      رمز عبور مدیریت:
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="رمز عبور..."
                        dir="ltr"
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a]"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-sm active:scale-98"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>ادامه و احراز هویت دو مرحله‌ای (گام ۱ از ۳)</span>
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: PROMPT ADMIN EMAIL */}
            {loginStep === 'email_prompt' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900 space-y-1.5">
                  <div className="font-extrabold flex items-center gap-1.5 text-[#0a4c9a]">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>احراز هویت دو مرحله‌ای فعال است</span>
                  </div>
                  <p className="text-[11.5px] text-blue-800 leading-relaxed">
                    جهت ورود امن، لطفاً آدرس ایمیل مدیریت را وارد فرمایید تا کد تایید یکبار مصرف ارسال گردد.
                  </p>
                </div>

                {emailError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{emailError}</span>
                  </div>
                )}

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1.5">
                      آدرس ایمیل مدیر سیستم:
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        placeholder="name@domain.com"
                        dir="ltr"
                        autoFocus
                        className="w-full h-11 px-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a]"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-3.5 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-60"
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>در حال ارسال کد به ایمیل...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>ارسال کد تایید به ایمیل</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('credentials');
                      setEmailError('');
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
                  >
                    بازگشت به مرحله رمز عبور
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: OTP VERIFICATION */}
            {loginStep === 'otp_verify' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>کد تایید ارسال شد</span>
                  </div>
                  <p className="text-[11.5px] text-emerald-800 leading-relaxed">
                    کد تایید ۶ رقمی ارسال گردید. لطفاً صندوق ورودی (Inbox یا Spam) ایمیل خود را بررسی فرمایید.
                  </p>
                </div>

                {otpError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-700 text-xs font-bold">
                        کد تایید ۶ رقمی:
                      </label>
                      <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {countdown > 0
                          ? `اعتبار: ${toFa(Math.floor(countdown / 60))}:${toFa(
                              String(countdown % 60).padStart(2, '0')
                            )}`
                          : 'منقضی شده'}
                      </span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => {
                        setOtpInput(e.target.value.replace(/\D/g, ''));
                        if (otpError) setOtpError('');
                      }}
                      placeholder="• • • • • •"
                      dir="ltr"
                      autoFocus
                      className="w-full h-13 px-4 bg-slate-50 border-2 border-blue-200 rounded-2xl text-center text-2xl font-black font-mono tracking-[0.4em] text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a] transition shadow-inner"
                    />
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 pt-1">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0a4c9a] focus:ring-[#0a4c9a] accent-[#0a4c9a]"
                      />
                      <span className="text-[11.5px] font-medium">مرا روی این دستگاه به خاطر بسپار</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm active:scale-98"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>تایید نهایی و ورود به پنل ادمین</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSendingOtp || countdown > 240}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition disabled:opacity-50"
                    >
                      {isSendingOtp ? 'در حال ارسال...' : 'ارسال مجدد کد'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStep('email_prompt');
                        setOtpError('');
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                    >
                      تغییر ایمیل
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 mt-5 text-center">
              <button
                onClick={onBackToApp}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>بازگشت به برنامه اصلی</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0a4c9a] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900">
                مدیریت گزارش‌های تغییر مشخصات مراکز
              </h1>
              <span className="text-[11px] font-bold flex items-center gap-1.5">
                {isRefreshing ? (
                  <span className="text-[#0a4c9a] flex items-center gap-1.5 font-bold">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#0a4c9a]" />
                    <span>در حال دریافت تازه‌ترین گزارش‌ها از گوگل شیت...</span>
                  </span>
                ) : activeSyncSource === 'sheets' ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    متصل به Google Sheets (همگام‌سازی زنده بین تمام دستگاه‌ها)
                  </span>
                ) : activeSyncSource === 'firestore' ? (
                  <span className="text-blue-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    متصل به سرور ابری ({toFa(reports.length)} گزارش فعال)
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    برای همگام‌سازی بین گوشی و سیستم، روی «اتصال به Google Sheets» کلیک کنید
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              title="تنظیمات اتصال Google Sheets"
              className="py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">اتصال به Google Sheets</span>
            </button>

            <button
              onClick={() => {
                fetchAllReports(true);
                fetchAllSearches(true);
              }}
              disabled={isRefreshing || isSearchesLoading}
              title="همگام‌سازی و دریافت مجدد گزارش‌ها و جستجوها"
              className="p-2 rounded-xl text-[#0a4c9a] hover:bg-blue-50 border border-blue-200 transition"
            >
              <RefreshCw className={`w-4 h-4 ${(isRefreshing || isSearchesLoading) ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsChangePassOpen(true)}
              title="تغییر رمز عبور"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              title="خروج از حساب"
              className="p-2 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-200 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={onBackToApp}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">بازگشت به برنامه</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Google Sheets Setup Callout Banner if not connected */}
        {!getSheetsWebhookUrl() && (
          <div className="bg-gradient-to-r from-emerald-500 to-[#0a4c9a] text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-black text-sm">
                <FileSpreadsheet className="w-5 h-5 text-amber-300" />
                <span>راهکار تجمیع همزمان تمام گوشی‌ها و کامپیوترها: اتصال به Google Sheets</span>
              </div>
              <p className="text-xs text-blue-100/90 leading-relaxed max-w-2xl">
                با اتصال برنامه به یک فایل رایگان Google Sheets در اکانت گوگل خود، گزارش‌های ارسالی از تمام دستگاه‌ها (موبایل، کروم، اج و هر آی‌پی) بدون تحریم و بدون فیلتر در یک جدول مرکزی ثبت و همگام‌سازی می‌شوند.
              </p>
            </div>
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="shrink-0 bg-white text-emerald-800 hover:bg-emerald-50 py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm transition active:scale-95"
            >
              تنظیم در ۲ دقیقه (کد آماده)
            </button>
          </div>
        )}

        {/* Main Dashboard Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition active:scale-95 ${
                activeTab === 'reports'
                  ? 'bg-[#0a4c9a] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>گزارشات تغییر مشخصات مراکز</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'reports' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {toFa(reports.length)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('searches');
                fetchAllSearches(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition active:scale-95 relative ${
                activeTab === 'searches'
                  ? 'bg-gradient-to-r from-amber-600 to-[#F15A31] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-300" />
              <span>آمار و تحلیل جستجوها (مارکتینگ و درآمدزایی)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'searches' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {toFa(searches.length)}
              </span>
              {searchAnalytics.zeroCount > 0 && (
                <span className="flex h-2 w-2 relative" title="فرصت‌های قرارداد جدید شناسایی شده">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('visits');
                fetchAllVisits(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition active:scale-95 ${
                activeTab === 'visits'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>آمار کاربران و دستگاه‌ها (پرسنل)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'visits' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {toFa(visitAnalytics.uniqueDevices)} دستگاه
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cms')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition active:scale-95 ${
                activeTab === 'cms'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Building2 className="w-4 h-4 text-purple-300" />
              <span>مدیریت محتوا و مراکز (CMS)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('insurers');
                reloadInsurerRequests();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition active:scale-95 ${
                activeTab === 'insurers'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>تقاضای شرکت‌های بیمه (سرنخ‌ها)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'insurers' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {toFa(insurerRequests.length)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('reviews');
                reloadReviews();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition active:scale-95 ${
                activeTab === 'reviews'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>نظرات و تجربیات مراجعین</span>
              {reviewsList.filter((r) => r.status === 'pending').length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 animate-pulse">
                  {toFa(reviewsList.filter((r) => r.status === 'pending').length)} در انتظار
                </span>
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-bold px-2">
            {activeTab === 'reports' ? (
              <span>مدیریت اصلاحات نشانی، تلفن و قرارداد مراکز</span>
            ) : activeTab === 'reviews' ? (
              <span className="text-amber-800 flex items-center gap-1.5 font-bold">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>بررسی، تایید و انتشار تجربیات بیمه‌شدگان از مراجعه به مراکز درمانی</span>
              </span>
            ) : activeTab === 'searches' ? (
              <span className="text-amber-700 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>تحلیل تقاضاهای کاربران برای عقد قراردادهای پرسود</span>
              </span>
            ) : activeTab === 'visits' ? (
              <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>رصد دستگاه‌ها، مدل گوشی‌ها، سیستم‌عامل و وضعیت نصب اپلیکیشن</span>
              </span>
            ) : (
              <span className="text-purple-700 flex items-center gap-1.5 font-bold">
                <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
                <span>ورود مراکز با فایل اکسل، متن و فرم دستی</span>
              </span>
            )}
          </div>
        </div>

        {/* TAB 1: MEDICAL CENTER REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* KPI Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>مراکز دارای گزارش</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {toFa(counts.uniqueCenters)} <span className="text-xs font-normal text-slate-400">مرکز</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>مجموع کل گزارش‌ها</span>
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {toFa(counts.total)} <span className="text-xs font-normal text-slate-400">گزارش</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
            <div className="flex items-center justify-between text-amber-700 text-xs mb-1">
              <span>در انتظار بررسی</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-700 tabular-nums">
              {toFa(counts.pending)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
            <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
              <span>اصلاح شده در برنامه</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 tabular-nums">
              {toFa(counts.applied)}
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Export Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* View Mode Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grouped')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'grouped'
                  ? 'bg-white text-[#0a4c9a] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>تجمیع بر اساس مرکز درمانی (ستون تعداد گزارش)</span>
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'detailed'
                  ? 'bg-white text-[#0a4c9a] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>فهرست تک‌تک گزارش‌ها</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportGroupedCSV}
              className="py-2.5 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>خروجی اکسل تجمیعی (CSV)</span>
            </button>

            <button
              onClick={handleCopyForGoogleSheets}
              className="py-2.5 px-3.5 rounded-xl border border-slate-300 hover:border-[#0a4c9a] hover:bg-blue-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
            >
              {copiedForSheets ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">کپی شد! پیست در Google Sheets</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>کپی برای Google Sheets</span>
                </>
              )}
            </button>

            <button
              onClick={() => fetchAllReports(true)}
              disabled={isRefreshing}
              className="py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#0a4c9a] text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>همگام‌سازی زنده</span>
            </button>

            {reports.length > 0 && (
              <button
                onClick={handleClearAllReports}
                title="پاکسازی تمام گزارش‌های آزمایشی و صفر کردن جدول"
                className="py-2.5 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>پاکسازی گزارش‌های آزمایشی</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در نام مرکز، شماره یا توضیحات..."
                className="w-full h-10 pr-9 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a]"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a]"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending">در انتظار بررسی</option>
                <option value="verified">تأیید شده</option>
                <option value="applied">اصلاح شده</option>
                <option value="rejected">رد شده</option>
              </select>
            </div>

            {/* Reason Filter */}
            <div>
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a]"
              >
                <option value="all">همه انواع مغایرت</option>
                <option value="phone">شماره تلفن</option>
                <option value="address">نشانی و آدرس</option>
                <option value="contract">قرارداد بیمه</option>
                <option value="timing">ساعات کاری</option>
                <option value="other">سایر موارد</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONTENT SECTION */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0a4c9a] mx-auto mb-2" />
            <span>در حال دریافت گزارش‌ها...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">هنوز هیچ گزارشی ثبت نشده است</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              به محض اینکه کاربران در اپلیکیشن خطایی را برای یک مرکز گزارش کنند، در این جدول ظاهر خواهد شد.
            </p>
          </div>
        ) : viewMode === 'grouped' ? (
          /* ========================================================
             1. GROUPED VIEW (یک سطر برای هر مرکز + ستون تعداد گزارش)
             ======================================================== */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-bold">
                تعداد مراکز دارای مغایرت: <strong className="text-slate-900 tabular-nums">{toFa(groupedCenters.length)}</strong> مرکز
              </span>
              <span className="text-[11px] text-slate-400">مرتب‌شده بر اساس بیشترین گزارش‌های دریافتی</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">ردیف</th>
                      <th className="py-3 px-4">نام مرکز درمانی و نوع</th>
                      <th className="py-3 px-4 text-center">تعداد گزارش</th>
                      <th className="py-3 px-4">موضوعات گزارش‌شده</th>
                      <th className="py-3 px-4 text-center">وضعیت پیگیری</th>
                      <th className="py-3 px-4">آخرین گزارش</th>
                      <th className="py-3 px-4 w-28 text-center">جزئیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupedCenters.map((group, idx) => {
                      const isExpanded = expandedCenterId === group.centerId;
                      return (
                        <React.Fragment key={group.centerId}>
                          <tr className={`hover:bg-slate-50/80 transition ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-400 tabular-nums">
                              {toFa(idx + 1)}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-slate-900 text-sm">
                                {group.centerName}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>کد #{toFa(group.centerId)}</span>
                                <span>•</span>
                                <span>{group.centerType}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-[#0a4c9a] font-black text-xs tabular-nums border border-blue-200 shadow-2xs">
                                {toFa(group.reportCount)} گزارش
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(group.reasonsSummary).map(([rTitle, rQty]) => (
                                  <span
                                    key={rTitle}
                                    className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium"
                                  >
                                    {rTitle} <span className="text-[#0a4c9a] font-bold">({toFa(rQty)})</span>
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {group.pendingCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  <span>{toFa(group.pendingCount)} در انتظار بررسی</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>بررسی‌شده</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-[11px] text-slate-500 tabular-nums">
                              {formatPersianDate(group.latestReportDate)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() =>
                                  setExpandedCenterId(isExpanded ? null : group.centerId)
                                }
                                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:text-[#0a4c9a] hover:border-blue-300 font-bold text-xs inline-flex items-center gap-1 transition"
                              >
                                <span>{isExpanded ? 'بستن' : 'مشاهده'}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Reports for this Center */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} className="bg-slate-50/70 p-4 border-y border-slate-200">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                      <AlertCircle className="w-4 h-4 text-[#0a4c9a]" />
                                      <span>
                                        ریز گزارش‌های ثبت‌شده برای «{group.centerName}» ({toFa(group.reports.length)} مورد):
                                      </span>
                                    </h4>
                                  </div>

                                  <div className="grid grid-cols-1 gap-2.5">
                                    {group.reports.map((rep, rIndex) => {
                                      const statusCfg =
                                        STATUS_CONFIG[rep.status] || STATUS_CONFIG.pending;
                                      return (
                                        <div
                                          key={rep.id || rIndex}
                                          className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs"
                                        >
                                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                            <div className="flex items-center gap-2">
                                              <span className="font-extrabold text-[#0a4c9a] text-xs">
                                                گزارش #{toFa(rIndex + 1)}
                                              </span>
                                              <span className="text-slate-300">•</span>
                                              <span className="font-bold text-slate-700 text-xs">
                                                موضوع: {rep.reasonLabel || REASON_LABELS[rep.reason] || rep.reason}
                                              </span>
                                              <span className="text-slate-300">•</span>
                                              <span className="text-[11px] text-slate-400">
                                                {formatPersianDate(rep.createdAt)}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              <span
                                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                                              >
                                                {statusCfg.label}
                                              </span>
                                              <button
                                                onClick={() => handleDeleteReport(rep.id)}
                                                className="text-slate-400 hover:text-red-600 p-1 rounded-md"
                                                title="حذف این گزارش"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>

                                          <div className="text-xs text-slate-700 leading-relaxed">
                                            {rep.details ? (
                                              <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                {rep.details}
                                              </p>
                                            ) : (
                                              <span className="text-slate-400 italic text-[11px]">
                                                توضیحات متنی ثبت نشده است.
                                              </span>
                                            )}
                                          </div>

                                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                                            {rep.reporterContact ? (
                                              <div className="flex items-center gap-1.5 text-slate-600">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[11px]">تماس کاربر:</span>
                                                <a
                                                  href={`tel:${rep.reporterContact}`}
                                                  className="font-bold text-[#0a4c9a] dir-ltr text-xs"
                                                >
                                                  {rep.reporterContact}
                                                </a>
                                              </div>
                                            ) : (
                                              <span />
                                            )}

                                            <div className="flex items-center gap-1 text-[11px]">
                                              <span className="text-slate-400 ml-1">تغییر وضعیت:</span>
                                              <button
                                                onClick={() => handleUpdateStatus(rep.id, 'pending')}
                                                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                                  rep.status === 'pending'
                                                    ? 'bg-amber-600 text-white border-amber-600'
                                                    : 'bg-white text-slate-600 border-slate-200'
                                                }`}
                                              >
                                                در انتظار
                                              </button>
                                              <button
                                                onClick={() => handleUpdateStatus(rep.id, 'verified')}
                                                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                                  rep.status === 'verified'
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-slate-600 border-slate-200'
                                                }`}
                                              >
                                                تأیید شد
                                              </button>
                                              <button
                                                onClick={() => handleUpdateStatus(rep.id, 'applied')}
                                                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                                  rep.status === 'applied'
                                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                                    : 'bg-white text-slate-600 border-slate-200'
                                                }`}
                                              >
                                                اصلاح شد
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             2. DETAILED VIEW (سطر به سطر تمام گزارش‌ها)
             ======================================================== */
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs transition hover:border-[#0a4c9a]/40 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">
                          کد #{toFa(report.centerId)}
                        </span>
                        <h3 className="text-sm font-black text-slate-900">
                          {report.centerName}
                        </h3>
                        {report.centerType && (
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                            {report.centerType}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>تاریخ ثبت: {formatPersianDate(report.createdAt)}</span>
                        <span>•</span>
                        <span className="font-bold text-[#0a4c9a]">
                          موضوع: {report.reasonLabel || REASON_LABELS[report.reason] || report.reason}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusCfg.label}</span>
                      </span>

                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        title="حذف گزارش"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {report.details ? (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[11px] font-bold mb-1">
                          توضیحات و مشخصات اعلام‌شده توسط کاربر:
                        </span>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                          {report.details}
                        </p>
                      </div>
                    ) : (
                      <div className="text-slate-400 italic text-[11px]">
                        توضیحات متنی اضافه ثبت نشده است.
                      </div>
                    )}

                    {report.reporterContact && (
                      <div className="flex items-center gap-2 text-slate-600 pt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px]">شماره تماس کاربر:</span>
                        <a
                          href={`tel:${report.reporterContact}`}
                          className="font-bold text-[#0a4c9a] hover:underline dir-ltr text-xs"
                        >
                          {report.reporterContact}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 font-bold">
                      تغییر وضعیت پیگیری:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'pending')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                          report.status === 'pending'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        در انتظار
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'verified')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                          report.status === 'verified'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        تأیید شد
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'applied')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                          report.status === 'applied'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        اصلاح شد در برنامه
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'rejected')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                          report.status === 'rejected'
                            ? 'bg-slate-700 text-white border-slate-700'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        رد شد
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

    {/* TAB 2: SEARCH MARKETING & DEMAND ANALYTICS */}
    {activeTab === 'searches' && (
      <div className="space-y-6">
        {/* Search Analytics KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>کل دفعات جستجوی کاربران</span>
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {toFa(searchAnalytics.total)}{' '}
              <span className="text-xs font-normal text-slate-400">جستجو</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              ثبت هوشمند بدون نیاز به فشردن اینتر
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs bg-red-50/20">
            <div className="flex items-center justify-between text-red-700 text-xs mb-1">
              <span className="font-bold">فرصت‌های قرارداد جدید</span>
              <AlertOctagon className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-black text-red-700 tabular-nums">
              {toFa(searchAnalytics.zeroCount)}{' '}
              <span className="text-xs font-normal text-red-400">بدون نتیجه</span>
            </div>
            <div className="text-[10px] text-red-600 font-medium mt-1">
              تقاضای مرکز خارج از قرارداد فعلی
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
            <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
              <span>جستجوهای موفق</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 tabular-nums">
              {toFa(searchAnalytics.successfulCount)}{' '}
              <span className="text-xs font-normal text-emerald-500">مورد</span>
            </div>
            <div className="text-[10px] text-emerald-600 mt-1">
              دارای مرکز درمانی معتبر در ارومیه
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
            <div className="flex items-center justify-between text-blue-700 text-xs mb-1">
              <span>کلیدواژه‌های منحصربه‌فرد</span>
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-700 tabular-nums">
              {toFa(searchAnalytics.uniqueKeywordsCount)}{' '}
              <span className="text-xs font-normal text-blue-400">عنوان</span>
            </div>
            <div className="text-[10px] text-blue-600 mt-1">
              سنجش علایق درمانی بیمه‌گذاران
            </div>
          </div>
        </div>

        {/* Strategic Insights Grid: Golden Contract Opportunities + Top Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Unmet Demands (Zero Results) -> Golden Contract Opportunities */}
          <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black text-red-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-red-600" />
                  <span>فرصت‌های طلایی عقد قرارداد جدید بیمه (کمبودها در ارومیه)</span>
                </h3>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ارزش درآمدزایی بالا
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                این عبارات مراکزی هستند که مردم در ارومیه سرچ کرده‌اند اما در قراردادهای فعلی کارآفرین نبوده است. عقد قرارداد با این مراکز، رضایت بیمه‌گذاران را متحول می‌کند:
              </p>

              {searchAnalytics.unmetDemands.length > 0 ? (
                <div className="space-y-2">
                  {searchAnalytics.unmetDemands.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-red-50/60 hover:bg-red-50 p-2.5 rounded-xl border border-red-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-200 text-red-800 text-[10px] font-black flex items-center justify-center">
                          {toFa(idx + 1)}
                        </span>
                        <span className="font-black text-xs text-red-950">
                          «{item.term}»
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-red-700 bg-white px-2 py-0.5 rounded-lg border border-red-200">
                          {toFa(item.zeroCount)} بار جستجوی ناموفق
                        </span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">
                          {item.lastDate ? formatPersianDate(item.lastDate) : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  هنوز جستجوی بدون نتیجه‌ای ثبت نشده است. هر زمان کاربری عبارتی را جستجو کند و مرکزی یافت نشود، خودکار در اینجا نمایان خواهد شد.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-red-100 text-[10.5px] text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>پیشنهاد: این مراکز را به مدیر شعبه ارومیه جهت استعلام قرارداد معرفی کنید.</span>
            </div>
          </div>

          {/* Top Searched Keywords */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#0a4c9a]" />
                  <span>پرجستجوترین نیازها و کلمات کاربران</span>
                </h3>
                <span className="bg-blue-100 text-[#0a4c9a] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  بیشترین تقاضا
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                محبوب‌ترین حوزه‌ها و مراکز مورد توجه بیمه‌گذاران که بیشترین ترافیک را ایجاد کرده‌اند:
              </p>

              {searchAnalytics.topKeywords.length > 0 ? (
                <div className="space-y-2">
                  {searchAnalytics.topKeywords.map((item, idx) => {
                    const maxCount = searchAnalytics.topKeywords[0]?.count || 1;
                    const percentage = Math.round((item.count / maxCount) * 100);
                    return (
                      <div
                        key={idx}
                        className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center">
                              {toFa(idx + 1)}
                            </span>
                            <span className="font-extrabold text-slate-800">
                              {item.term}
                            </span>
                          </div>
                          <span className="text-[11px] font-black text-[#0a4c9a]">
                            {toFa(item.count)} دفعه
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0a4c9a] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  پس از اولین جستجوهای کاربران در برنامه، رتبه‌بندی کلمات در اینجا شکل می‌گیرد.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>می‌توانید مراکز این دسته‌ها را در ردیف‌های اول یا ویترین برنامه قرار دهید.</span>
            </div>
          </div>
        </div>

        {/* Filter and Actions Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                placeholder="جستجو در عبارات، خیابان یا مرکز کلیک‌شده..."
                className="w-full h-10 pr-9 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a]"
              />
              {searchTableQuery && (
                <button
                  onClick={() => setSearchTableQuery('')}
                  className="absolute left-2.5 top-2.5 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOnlyZeroResults((prev) => !prev)}
              className={`h-10 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                onlyZeroResults
                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>فقط موارد ناموجود ({toFa(searchAnalytics.zeroCount)})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSendTestSearch}
              disabled={isSendingTestSearch}
              className="h-10 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
              title="یک جستجوی آزمایشی به گوگل شیت ارسال می‌کند"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isSendingTestSearch ? 'animate-spin' : ''}`} />
              <span>ارسال جستجوی تستی</span>
            </button>

            <button
              type="button"
              onClick={handleCopySearchesForExcel}
              className="h-10 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
              title="کپی به فرمت اکسل و گوگل شیت"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>کپی جهت اکسل</span>
            </button>

            <button
              type="button"
              onClick={() => fetchAllSearches(true)}
              disabled={isSearchesLoading}
              className="h-10 px-3.5 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSearchesLoading ? 'animate-spin' : ''}`} />
              <span>بروزرسانی از شیت</span>
            </button>
          </div>
        </div>

        {/* Searches Detailed Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-[#0a4c9a]" />
              <h3 className="font-black text-xs text-slate-800">
                ریز آخرین جستجوهای کاربران ثبت‌شده در گوگل شیت
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              نمایش {toFa(filteredSearches.length)} از {toFa(searches.length)} جستجو
            </span>
          </div>

          {filteredSearches.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="font-bold text-xs text-slate-700">
                هیچ داده‌ای برای نمایش وجود ندارد
              </div>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                وقتی کاربران در برنامه جستجو کنند یا روی مراکز کلیک کنند، دیتای آن‌ها خودکار در اینجا و شیت ثبت می‌شود. برای تست سریع، دکمه «ارسال جستجوی تستی» را بزنید.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-extrabold text-[11px]">
                    <th className="py-3 px-3 w-12 text-center">ردیف</th>
                    <th className="py-3 px-3">عبارت سرچ‌شده</th>
                    <th className="py-3 px-3 text-center">نتایج در سیستم</th>
                    <th className="py-3 px-3">اقدام / مرکز کلیک‌شده</th>
                    <th className="py-3 px-3">فیلتر خیابان</th>
                    <th className="py-3 px-3">فیلتر تخصص</th>
                    <th className="py-3 px-3">تاریخ و ساعت</th>
                    <th className="py-3 px-3 text-center">وضعیت مارکتینگ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSearches.map((item, idx) => {
                    const isZero = item.resultCount === 0;
                    const hasClicked = Boolean(item.clickedCenter && item.clickedCenter !== '—');
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50 transition ${
                          isZero ? 'bg-red-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center text-slate-400 text-[11px] tabular-nums">
                          {toFa(idx + 1)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-black text-slate-900 bg-slate-100/80 px-2 py-0.5 rounded-lg border border-slate-200">
                            {item.term}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center tabular-nums">
                          {isZero ? (
                            <span className="inline-flex items-center gap-1 text-red-600 font-extrabold bg-red-100 px-2 py-0.5 rounded-full text-[10.5px]">
                              <span>۰ مرکز</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full text-[10.5px]">
                              <span>{toFa(item.resultCount)} مرکز</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {hasClicked ? (
                            <button
                              type="button"
                              onClick={() => setPreviewSearchItem(item)}
                              className="inline-flex items-center gap-1.5 text-[#0a4c9a] hover:text-blue-900 font-bold text-[11px] bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl border border-blue-200 transition active:scale-95 text-right shadow-2xs group"
                              title="کلیک برای مشاهده جزئیات مرکز و فهرست کامل نتایج سرچ"
                            >
                              <MousePointerClick className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition shrink-0" />
                              <span className="max-w-[200px] truncate" title={item.clickedCenter}>
                                {item.clickedCenter}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPreviewSearchItem(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-[#0a4c9a] hover:text-blue-900 font-bold text-xs transition active:scale-95 shadow-2xs group"
                              title="کلیک برای مشاهده مراکزی که به کاربر نمایش داده شده است"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition shrink-0" />
                              <span>مشاهده فهرست نتایج</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          {item.selectedStreet && item.selectedStreet !== 'همه' ? (
                            <span className="bg-orange-50 text-[#F15A31] px-2 py-0.5 rounded-md font-bold">
                              {item.selectedStreet}
                            </span>
                          ) : (
                            <span className="text-slate-400">همه خیابان‌ها</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          {item.selectedType && item.selectedType !== 'همه' ? (
                            <span className="bg-blue-50 text-[#0a4c9a] px-2 py-0.5 rounded-md font-bold">
                              {item.selectedType}
                            </span>
                          ) : (
                            <span className="text-slate-400">همه تخصص‌ها</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px] tabular-nums dir-ltr text-right">
                          {item.createdAt || '—'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isZero ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200">
                              <AlertOctagon className="w-3 h-3 text-red-600" />
                              <span>فرصت قرارداد</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>مرکز موجود</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )}

    {/* TAB 3: USER & DEVICE ANALYTICS (پرسنل و دستگاه‌ها) */}
    {activeTab === 'visits' && (
      <div className="space-y-6">
        {/* Top Analytics Banner & Action Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  آمار دستگاه‌ها، مدل گوشی‌ها و وضعیت نصب پرسنل
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>رصد فعال و بلادرنگ</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                این سامانه به صورت خودکار و بدون نیاز به ورود کاربر، مشخصات فنی دستگاه‌ها (مدل گوشی، سیستم‌عامل، مرورگر و وضعیت نصب PWA) را با رعایت کامل حریم خصوصی (بدون دسترسی به شماره یا فایل‌های شخصی) ثبت می‌کند.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchAllVisits(true)}
              disabled={isVisitsLoading}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              title="همگام‌سازی و دریافت رکوردهای جدید از گوگل شیت"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVisitsLoading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
              <span>{isVisitsLoading ? 'در حال همگام‌سازی...' : 'بروزرسانی از شیت'}</span>
            </button>

            <button
              type="button"
              onClick={handleRegisterCurrentDevicePWA}
              disabled={isSendingTestVisit}
              className="px-3.5 py-2.5 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
              title="ثبت فوری مشخصات همین دستگاه به عنوان نرم‌افزار نصب‌شده در آمار"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
              <span>{isSendingTestVisit ? 'در حال ثبت...' : 'ثبت فوری نصب همین دستگاه'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyVisitsForExcel}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              title="کپی کردن داده‌های جدول جهت درج در اکسل یا شیت"
            >
              {copiedForVisits ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedForVisits ? 'کپی شد!' : 'کپی برای اکسل'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendTestVisit}
              disabled={isSendingTestVisit}
              className="px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
              title="ثبت یک رکورد تستی با مشخصات یک گوشی آزمایشی"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>تست مدل تصادفی</span>
            </button>
          </div>
        </div>

        {/* Diagnostic & Information Banner on PWA Installs */}
        <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-emerald-50 p-4 rounded-2xl border border-purple-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Smartphone className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-slate-900 block sm:inline">
                راهنمای رصد گوشی‌های نصب‌شده در آمار:
              </span>{' '}
              <span className="text-slate-600 leading-relaxed">
                هنگامی که برنامه روی گوشی نصب می‌گردد (یا از طریق «افزودن به صفحه اصلی / Add to Home Screen»)، کافی است حداقل یک‌بار آیکون اپ از صفحه اصلی باز شود تا شناسه دستگاه به عنوان «نصب‌شده (PWA)» بلادرنگ ثبت گردد. با فشردن دکمه «بروزرسانی از شیت» یا «ثبت فوری نصب همین دستگاه»، آمار همگام خواهد شد.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchAllVisits(true)}
            disabled={isVisitsLoading}
            className="px-3.5 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs shrink-0 hover:bg-purple-800 transition active:scale-95 shadow-2xs"
          >
            بروزرسانی آمار
          </button>
        </div>

        {/* 4 KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Unique Devices */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">کاربران / دستگاه‌های یکتا</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0a4c9a] flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {toFa(visitAnalytics.uniqueDevices)}
              </span>
              <span className="text-xs text-slate-500 font-bold">دستگاه ثبت‌شده</span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>تفکیک بر اساس اثرانگشت فنی دستگاه</span>
            </div>
          </div>

          {/* Card 2: Total Sessions */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">مجموع نشست‌ها و مراجعه‌ها</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {toFa(visitAnalytics.totalSessions)}
              </span>
              <span className="text-xs text-slate-500 font-bold">نشست کل</span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                میانگین استفاده هر دستگاه:{' '}
                <strong className="text-slate-800">
                  {toFa(visitAnalytics.uniqueDevices > 0 ? (visitAnalytics.totalSessions / visitAnalytics.uniqueDevices).toFixed(1) : '۰')}
                </strong>{' '}
                مرتبه
              </span>
            </div>
          </div>

          {/* Card 3: PWA Installed Devices */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">گوشی‌های نصب‌شده (PWA)</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-700">
                {toFa(visitAnalytics.installedDevicesCount)} <span className="text-sm font-bold text-slate-600">دستگاه</span>
              </span>
              <span className="text-xs text-purple-700 font-extrabold bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                {toFa(visitAnalytics.pwaPercentage)}٪ از کل
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                <span>{toFa(visitAnalytics.pwaSessionsCount)} مراجعه در محیط اپ</span>
                <span className="text-purple-700 font-black">
                  {toFa(visitAnalytics.installedDevicesCount)} از {toFa(visitAnalytics.uniqueDevices)} گوشی
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(3, visitAnalytics.pwaPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Dominant Platform */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">سیستم‌عامل غالب پرسنل</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Monitor className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 truncate">
                {visitAnalytics.topOs[0]?.[0] || 'در حال رصد'}
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 font-bold">
              {visitAnalytics.topOs[0] ? (
                <span>
                  {toFa(visitAnalytics.topOs[0][1])} نشست ({toFa(Math.round((visitAnalytics.topOs[0][1] / Math.max(1, visitAnalytics.totalSessions)) * 100))}٪ از کل ترافیک)
                </span>
              ) : (
                <span>اطلاعات پس از ورود پرسنل تکمیل می‌شود</span>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Analysis: OS & Top Models / Browsers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: Operating System Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-800">توزیع سیستم‌عامل‌ها (OS)</h3>
              </div>
              <span className="text-xs text-slate-500 font-bold">
                {toFa(visitAnalytics.topOs.length)} نوع سیستم‌عامل
              </span>
            </div>

            {visitAnalytics.topOs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                هنوز رکوردی ثبت نشده است. با ورود پرسنل سیستم‌عامل‌ها اینجا تفکیک می‌شوند.
              </div>
            ) : (
              <div className="space-y-3">
                {visitAnalytics.topOs.map(([osName, count]) => {
                  const pct = Math.round((count / Math.max(1, visitAnalytics.totalSessions)) * 100);
                  const isAndroid = osName.toLowerCase().includes('android');
                  const isApple = osName.toLowerCase().includes('ios') || osName.toLowerCase().includes('mac');
                  const isWindows = osName.toLowerCase().includes('windows');

                  return (
                    <div key={osName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 flex items-center gap-1.5">
                          {isAndroid && <Smartphone className="w-3.5 h-3.5 text-emerald-600" />}
                          {isApple && <Smartphone className="w-3.5 h-3.5 text-slate-700" />}
                          {isWindows && <Monitor className="w-3.5 h-3.5 text-blue-600" />}
                          <span>{osName}</span>
                        </span>
                        <span className="text-slate-600 tabular-nums">
                          {toFa(count)} مورد ({toFa(pct)}٪)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isAndroid
                              ? 'bg-emerald-500'
                              : isApple
                              ? 'bg-slate-700'
                              : isWindows
                              ? 'bg-blue-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Box 2: Device Models & Browsers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-800">مدل‌های پرکاربرد و مرورگرها</h3>
              </div>
              <span className="text-xs text-slate-500 font-bold">تفکیک سخت‌افزار</span>
            </div>

            {visitAnalytics.topModels.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                هنوز رکوردی ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-[11px] font-extrabold text-slate-400 mb-2">پرکاربردترین برندها و مدل‌ها:</h4>
                  <div className="flex flex-wrap gap-2">
                    {visitAnalytics.topModels.map(([model, count]) => (
                      <span
                        key={model}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/80"
                      >
                        <Smartphone className="w-3 h-3 text-slate-500" />
                        <span>{model}</span>
                        <span className="bg-white text-slate-600 text-[10px] px-1.5 py-0.2 rounded-md font-extrabold border border-slate-200">
                          {toFa(count)}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-[11px] font-extrabold text-slate-400 mb-2">مرورگرهای اینترنتی:</h4>
                  <div className="flex flex-wrap gap-2">
                    {visitAnalytics.topBrowsers.map(([browser, count]) => (
                      <span
                        key={browser}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-900 text-xs font-bold border border-blue-100"
                      >
                        <span>{browser}</span>
                        <span className="bg-white text-blue-800 text-[10px] px-1.5 py-0.2 rounded-md font-extrabold border border-blue-200">
                          {toFa(count)}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Visits Table Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Table Controls / Filters Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <List className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  ریز آخرین ورود و دستگاه‌های پرسنل
                </h3>
                <span className="text-[11px] text-slate-500 font-bold">
                  نمایش {toFa(filteredVisits.length)} از {toFa(visits.length)} نشست ثبت‌شده
                </span>
              </div>
            </div>

            {/* Filter and Search Inputs */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={visitTableQuery}
                  onChange={(e) => setVisitTableQuery(e.target.value)}
                  placeholder="جستجو در شناسه، مدل، سیستم..."
                  className="w-full pr-8 pl-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* OS Filter */}
              <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-xl border border-slate-200 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={visitOsFilter}
                  onChange={(e) => setVisitOsFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-bold text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="all">همه سیستم‌عامل‌ها</option>
                  <option value="android">اندروید</option>
                  <option value="ios">آیفون / iOS</option>
                  <option value="windows">ویندوز</option>
                </select>
              </div>

              {/* PWA Filter */}
              <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-xl border border-slate-200 text-xs">
                <select
                  value={visitPwaFilter}
                  onChange={(e) => setVisitPwaFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-bold text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="pwa">فقط اپلیکیشن نصب‌شده (PWA)</option>
                  <option value="browser">فقط مرورگر وب</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Content */}
          {filteredVisits.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-700">هیچ رکوردی یافت نشد</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {visits.length === 0
                  ? 'هنوز اطلاعات نشستی ثبت نشده است. می‌توانید با کلیک بر روی دکمه «ثبت تست همین دستگاه»، عملکرد سیستم را بررسی نمایید.'
                  : 'با فیلترهای انتخابی رکوردی تطابق ندارد.'}
              </p>
              {visits.length === 0 && (
                <button
                  type="button"
                  onClick={handleSendTestVisit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ثبت اولین رکورد تستی</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-extrabold">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3">شناسه یکتای دستگاه</th>
                    <th className="py-3 px-3">مدل / نوع دستگاه</th>
                    <th className="py-3 px-3">سیستم‌عامل</th>
                    <th className="py-3 px-3">مرورگر</th>
                    <th className="py-3 px-3">وضعیت نصب</th>
                    <th className="py-3 px-3">وضوح صفحه</th>
                    <th className="py-3 px-3 text-center">تعداد مراجعه</th>
                    <th className="py-3 px-3">تاریخ و ساعت مراجعه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVisits.map((item, idx) => {
                    const isPWA = item.isPWA.includes('PWA') || item.isPWA.includes('نصب');
                    const isAndroid = item.os.toLowerCase().includes('android');
                    const isApple = item.os.toLowerCase().includes('ios') || item.os.toLowerCase().includes('mac');
                    const isWindows = item.os.toLowerCase().includes('windows');

                    return (
                      <tr key={`${item.deviceId}-${idx}`} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {toFa(idx + 1)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              {item.deviceId.slice(0, 14)}...
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(item.deviceId);
                                showToast('شناسه دستگاه کپی شد');
                              }}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition"
                              title="کپی شناسه کامل دستگاه"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            {isAndroid ? (
                              <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : isApple ? (
                              <Smartphone className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                            ) : isWindows ? (
                              <Monitor className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            ) : (
                              <Laptop className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                            <span>{item.model}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                            {item.os}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          {item.browser}
                        </td>
                        <td className="py-3 px-3">
                          {isPWA ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                              <Check className="w-3 h-3 text-purple-600" />
                              <span>اپلیکیشن نصب‌شده (PWA)</span>
                            </span>
                          ) : visitAnalytics.installedDeviceIds.has(item.deviceId) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                              <Smartphone className="w-3 h-3 text-purple-500" />
                              <span>گوشی نصب‌شده (نشست وب)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              مرورگر وب
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px] dir-ltr text-right">
                          {item.screenResolution || '—'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-[#0a4c9a] font-black text-xs">
                            {toFa(item.visitCount)} بار
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px] tabular-nums dir-ltr text-right">
                          {item.timestamp || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )}

    {/* TAB 4: CONTENT MANAGEMENT SYSTEM (CMS) */}
    {activeTab === 'cms' && <AdminCMS showToast={showToast} />}

    {/* TAB 5: INSURER DEMANDS / LEADS */}
    {activeTab === 'insurers' && (
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-black text-base">
              <ShieldCheck className="w-5 h-5 text-amber-200" />
              <span>تقاضای بیمه‌شدگان برای اتصال سایر شرکت‌های بیمه</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed max-w-2xl">
              شماره تلفن‌ها و نام شرکت‌های بیمه‌ای که کاربران در برنامه ثبت کرده‌اند. این افراد متقاضیان فعال برای اطلاع‌رسانی پیامکی اتصال مراکز هستند.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (insurerRequests.length === 0) {
                  showToast('هنوز داده‌ای ثبت نشده است');
                  return;
                }
                const headers = ['ردیف', 'نام بیمه', 'شماره تماس', 'تاریخ ثبت'];
                const rows = insurerRequests.map((r, i) => [
                  i + 1,
                  r.insurer,
                  r.phone,
                  r.createdAt || r.date || '—',
                ]);
                const tsv = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
                navigator.clipboard.writeText(tsv).then(() => {
                  showToast('شماره‌ها و تقاضاهای بیمه در کلیپ‌بورد کپی شد (آماده Paste در اکسل)');
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-white text-amber-900 font-bold text-xs hover:bg-amber-50 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>کپی برای اکسل</span>
            </button>

            <button
              type="button"
              onClick={reloadInsurerRequests}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
              title="بروزرسانی لیست"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-[#0a4c9a]" />
              <h3 className="font-black text-xs text-slate-800">
                فهرست شماره‌های ثبت‌شده و شرکت‌های بیمه درخواستی
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {toFa(insurerRequests.length)} درخواست ثبت‌شده
            </span>
          </div>

          {insurerRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-300" />
              <div className="font-bold text-xs text-slate-600">هنوز تقاضایی برای بیمه‌ها ثبت نشده است</div>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                وقتی کاربران در پنجره انتخاب بیمه شماره خود را ثبت کنند، فوراً در این جدول و گوگل شیت نمایش داده می‌شود.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-extrabold text-[11px]">
                    <th className="py-3 px-3 w-12 text-center">ردیف</th>
                    <th className="py-3 px-3">شرکت بیمه درخواستی</th>
                    <th className="py-3 px-3">شماره تماس کاربر</th>
                    <th className="py-3 px-3">تاریخ و ساعت ثبت</th>
                    <th className="py-3 px-3 text-center">اقدام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {insurerRequests.map((req, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {toFa(idx + 1)}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                          <span>{req.insurer}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold font-mono text-slate-800 dir-ltr text-right">
                        {req.phone}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px] dir-ltr text-right">
                        {req.createdAt || req.date ? formatPersianDate(req.createdAt || req.date) : '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <a
                          href={`tel:${req.phone}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>تماس</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )}

    {/* TAB 6: CENTER REVIEWS & USER EXPERIENCES */}
    {activeTab === 'reviews' && (
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-black text-base">
              <Star className="w-5 h-5 text-amber-200 fill-amber-200" />
              <span>مدیریت نظرات و تجربیات مراجعین مراکز درمانی</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed max-w-2xl">
              نظرات ثبت‌شده توسط بیمه‌شدگان پس از تایید شما در صفحه هر مرکز نمایش داده می‌شوند تا سایر بیمه‌شدگان با اطمینان بیشتری مرکز مورد نظر را انتخاب کنند.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (reviewsList.length === 0) {
                  showToast('هنوز نظری ثبت نشده است');
                  return;
                }
                const headers = ['ردیف', 'نام مرکز', 'نام فرستنده', 'تلفن', 'امتیاز', 'کسر آنلاین', 'معطلی', 'متن نظر', 'وضعیت', 'تاریخ'];
                const rows = reviewsList.map((r, i) => [
                  i + 1,
                  r.centerName,
                  r.authorName || '—',
                  r.phone || '—',
                  `${r.rating} از ۵`,
                  r.directDeduction === 'yes' ? 'بله آنلاین' : r.directDeduction === 'no' ? 'فاکتور' : 'نامشخص',
                  r.waitingTime === 'short' ? 'کم' : r.waitingTime === 'medium' ? 'متوسط' : 'زیاد',
                  `"${(r.comment || '').replace(/"/g, '""')}"`,
                  r.status === 'approved' ? 'تایید شده' : r.status === 'pending' ? 'در انتظار' : 'رد شده',
                  r.createdAt ? formatPersianDate(r.createdAt) : '—',
                ]);
                const tsv = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
                navigator.clipboard.writeText(tsv).then(() => {
                  showToast('تمام نظرات در کلیپ‌بورد کپی شد (آماده Paste در اکسل)');
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-white text-amber-950 font-bold text-xs hover:bg-amber-50 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>کپی برای اکسل</span>
            </button>

            <button
              type="button"
              onClick={reloadReviews}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
              title="بروزرسانی نظرات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setReviewFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reviewFilter === 'all'
                ? 'bg-[#0a4c9a] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>همه نظرات</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {toFa(reviewsList.length)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setReviewFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reviewFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>در انتظار تایید ادمین</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-extrabold">
              {toFa(reviewsList.filter((r) => r.status === 'pending').length)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setReviewFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reviewFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>منتشر شده</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-extrabold">
              {toFa(reviewsList.filter((r) => r.status === 'approved').length)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setReviewFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reviewFilter === 'rejected'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>رد شده</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-extrabold">
              {toFa(reviewsList.filter((r) => r.status === 'rejected').length)}
            </span>
          </button>
        </div>

        {/* Reviews Cards List */}
        <div className="space-y-3">
          {reviewsList
            .filter((r) => reviewFilter === 'all' || r.status === reviewFilter)
            .length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-200">
              <Star className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <div className="font-bold text-xs text-slate-600">نظری در این دسته‌بندی یافت نشد</div>
            </div>
          ) : (
            reviewsList
              .filter((r) => reviewFilter === 'all' || r.status === reviewFilter)
              .map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs hover:border-blue-200 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#0a4c9a] shrink-0" />
                      <span className="font-extrabold text-sm text-slate-900">
                        {rev.centerName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (کد: {toFa(rev.centerId)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status badge */}
                      {rev.status === 'pending' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-extrabold text-[11px] border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>در انتظار تایید شما</span>
                        </span>
                      ) : rev.status === 'approved' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-extrabold text-[11px] border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>تایید و منتشر شده</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-extrabold text-[11px] border border-slate-200 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-slate-500" />
                          <span>رد شده</span>
                        </span>
                      )}

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
                  </div>

                  {/* Comment text */}
                  <p className="text-slate-800 text-xs sm:text-[13px] leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    «{rev.comment}»
                  </p>

                  {/* Bottom Meta & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">
                        فرستنده: {rev.authorName || 'بیمه‌شده محترم'}
                      </span>
                      {rev.phone && (
                        <>
                          <span>·</span>
                          <a
                            href={`tel:${rev.phone}`}
                            className="font-mono text-emerald-700 font-bold hover:underline"
                          >
                            {rev.phone}
                          </a>
                        </>
                      )}
                      {rev.directDeduction === 'yes' && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                          ✓ کسر آنلاین بیمه
                        </span>
                      )}
                      {rev.waitingTime === 'short' && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px]">
                          معطلی کم
                        </span>
                      )}
                      <span>·</span>
                      <span className="dir-ltr text-right">
                        {rev.createdAt ? formatPersianDate(rev.createdAt) : ''}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {rev.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => {
                            updateReviewStatus(rev.id, 'approved');
                            reloadReviews();
                            showToast('نظر تایید و در سایت منتشر شد');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>تأیید و انتشار</span>
                        </button>
                      )}

                      {rev.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => {
                            updateReviewStatus(rev.id, 'rejected');
                            reloadReviews();
                            showToast('نظر رد شد');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs border border-slate-200 hover:border-red-200 transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>رد کردن</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('آیا از حذف این نظر اطمینان دارید؟')) {
                            deleteReview(rev.id);
                            reloadReviews();
                            showToast('نظر با موفقیت حذف شد');
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="حذف کامل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    )}
  </main>

      {/* Google Sheets Setup Modal */}
      {isSheetsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsSheetsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl z-10 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    اتصال به Google Sheets (همگام‌سازی دائمی و بدون تحریم)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    گزارش‌های کاربران مستقیماً در فایل اکسل آنلاین گوگل شما ثبت می‌شود
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSheetsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Step by step guide */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 leading-relaxed">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#0a4c9a]" />
                <span>راهنمای ۳ مرحله‌ای راه‌اندازی (فقط ۲ دقیقه):</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-700 pr-1 text-[11.5px]">
                <li>
                  وارد اکانت گوگل خود شده و یک شیت خالی در{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0a4c9a] font-bold underline inline-flex items-center gap-0.5"
                  >
                    <span>sheets.new</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  ایجاد کنید.
                </li>
                <li>
                  از منوی بالای شیت، روی <strong>Extensions (برنامه‌های افزودنی)</strong> ⬅️{' '}
                  <strong>Apps Script</strong> کلیک کنید.
                </li>
                <li>
                  تمام کدهای پیش‌فرض را پاک کرده و <strong>کد آماده زیر</strong> را درون آن پیست (Ctrl+V) کنید:
                </li>
              </ol>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleCopyScriptCode}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-bold flex items-center justify-center gap-2 transition shadow-xs text-xs"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>کد اسکریپت کپی شد! در Apps Script پیست کنید</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>کپی کد آماده Google Apps Script</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <strong className="block text-slate-800">مرحله نهایی (Deploy):</strong>
                <span>
                  در بالای صفحه Apps Script، دکمه آبی <strong>Deploy</strong> ⬅️ <strong>New deployment</strong> را بزنید.
                  نوع آن را <strong>Web app</strong> بگذارید و در بخش Who has access حتماً گزینه{' '}
                  <strong className="text-emerald-700">Anyone (هر کسی)</strong> را انتخاب کنید. لینکی که به شما می‌دهد (URL) را کپی کرده و در کادر زیر قرار دهید:
                </span>
              </div>
            </div>

            {/* Input URL */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-slate-800 font-bold">
                آدرس وب‌هوک گوگل شیت (Web app URL):
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={sheetsUrlInput}
                  onChange={(e) => setSheetsUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  dir="ltr"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-600 text-left"
                />
                <Link className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestSheetsConnection}
                disabled={isTestingSheets}
                className="w-full sm:flex-1 py-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingSheets ? 'animate-spin' : ''}`} />
                <span>{isTestingSheets ? 'در حال تست...' : 'تست زنده اتصال به شیت'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSheetsUrl}
                className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>ذخیره و فعال‌سازی در برنامه</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal (3 fields: Current Pass, New Pass, Confirm New Pass) */}
      {isChangePassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              setIsChangePassOpen(false);
              setOldPassInput('');
              setNewPassInput('');
              setConfirmPassInput('');
              setPassChangeError('');
            }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0a4c9a] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <span>تغییر رمز عبور مدیریت</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsChangePassOpen(false);
                  setOldPassInput('');
                  setNewPassInput('');
                  setConfirmPassInput('');
                  setPassChangeError('');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passChangeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passChangeError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              {/* Field 1: Old Password */}
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1">
                  رمز عبور فعلی (رمز قبلی):
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassInput}
                    onChange={(e) => {
                      setOldPassInput(e.target.value);
                      if (passChangeError) setPassChangeError('');
                    }}
                    placeholder="رمز عبور قبلی..."
                    dir="ltr"
                    autoFocus
                    className="w-full h-11 px-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 2: New Password */}
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1">
                  رمز عبور جدید:
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassInput}
                    onChange={(e) => {
                      setNewPassInput(e.target.value);
                      if (passChangeError) setPassChangeError('');
                    }}
                    placeholder="رمز جدید (حداقل ۴ نویسه)..."
                    dir="ltr"
                    className="w-full h-11 px-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 3: Confirm New Password */}
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1">
                  تکرار رمز عبور جدید:
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassInput}
                    onChange={(e) => {
                      setConfirmPassInput(e.target.value);
                      if (passChangeError) setPassChangeError('');
                    }}
                    placeholder="تکرار رمز عبور جدید..."
                    dir="ltr"
                    className="w-full h-11 px-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePassOpen(false);
                    setOldPassInput('');
                    setNewPassInput('');
                    setConfirmPassInput('');
                    setPassChangeError('');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-bold text-xs transition shadow-sm"
                >
                  ذخیره رمز جدید
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Result Preview Modal */}
      {previewSearchItem && (
        <SearchResultPreviewModal
          searchItem={previewSearchItem}
          onClose={() => setPreviewSearchItem(null)}
          allCenters={allCenters}
        />
      )}
    </div>
  );
};

interface SearchResultPreviewModalProps {
  searchItem: SearchRecord;
  onClose: () => void;
  allCenters: MedicalCenter[];
}

const SearchResultPreviewModal: React.FC<SearchResultPreviewModalProps> = ({
  searchItem,
  onClose,
  allCenters,
}) => {
  const matchingCenters = useMemo(() => {
    const rawTerm = (searchItem.term || '').trim();
    if (!rawTerm) return [];
    const nq = norm(rawTerm);
    const tokens = nq.split(' ').filter(Boolean);

    const matches: { center: MedicalCenter; score: number }[] = [];

    for (const c of allCenters) {
      const searchable = [c.name, c.type, c.specialty, ...(c.alt || [])].filter(Boolean).join(' ');
      const normText = norm(searchable);
      const textSquash = squash(normText);
      const words = normText.split(' ');
      const ph = [c.phone, ...(c.alt || [])].filter(Boolean).join(' ');

      let score = 0;
      let matched = true;

      for (const tok of tokens) {
        const tokSquash = squash(tok);
        if (/^\d{3,}$/.test(tok)) {
          if (ph.includes(tok)) score += 2;
          else {
            matched = false;
            break;
          }
        } else if (textSquash.includes(tokSquash)) {
          score += words.some((w) => w.startsWith(tok)) ? 4 : 2;
        } else {
          matched = false;
          break;
        }
      }

      if (matched) {
        matches.push({ center: c, score });
      }
    }

    matches.sort((a, b) => b.score - a.score || a.center.name.localeCompare(b.center.name, 'fa'));
    return matches.map((m) => m.center);
  }, [searchItem, allCenters]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-10 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a4c9a] to-[#1e61b7] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <Search className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-[11px] text-blue-200 font-medium">
                ریز نتایج جستجوی کاربر در ارومیه
              </div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>«{searchItem.term}»</span>
                <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full tabular-nums">
                  {toFa(matchingCenters.length)} مرکز منطبق
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metadata info strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span>
              فیلتر خیابان: <strong className="text-slate-900">{searchItem.selectedStreet || 'همه'}</strong>
            </span>
            <span>
              فیلتر تخصص: <strong className="text-slate-900">{searchItem.selectedType || 'همه'}</strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-400 dir-ltr font-mono">
            {searchItem.createdAt || '—'}
          </div>
        </div>

        {/* Centers list or zero results notice */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {matchingCenters.length === 0 ? (
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3 my-4">
              <AlertOctagon className="w-12 h-12 text-red-500 mx-auto" />
              <h4 className="text-sm font-bold text-red-900">
                هیچ مرکز فعالی با عبارت «{searchItem.term}» در سامانه یافت نشد
              </h4>
              <p className="text-xs text-red-700 leading-relaxed max-w-md mx-auto">
                این عبارت توسط بیمه‌شده کارآفرین در برنامه جستجو شده اما هیچ مرکزی با این نام یا تخصص در فهرست طرف قرارداد وجود نداشته است.
                این یک <strong>سیگنال طلایی تقاضای مارکتینگ</strong> است تا واحد درمان کارآفرین ارومیه جهت مذاکره و عقد قرارداد با این مرکز یا تخصص اقدام فرماید.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>فهرست مراکزی که به کاربر نمایش داده شد:</span>
                <span className="text-[11px] text-slate-400">به ترتیب انطباق جستجو</span>
              </div>
              {matchingCenters.map((c, i) => (
                <div
                  key={c.k}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition shadow-2xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#0a4c9a] text-xs font-bold flex items-center justify-center shrink-0">
                        {toFa(i + 1)}
                      </span>
                      <strong className="text-sm font-black text-slate-900">{c.name}</strong>
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-slate-100 text-slate-700">
                        {c.type}
                      </span>
                      {c.isNightShift && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          شبانه‌روزی
                        </span>
                      )}
                    </div>
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span dir="ltr">{c.phone}</span>
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 pr-8 leading-relaxed">
                    {c.address}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {searchItem.clickedCenter && searchItem.clickedCenter !== '—' && (
              <span>اقدام کاربر: <strong>{searchItem.clickedCenter}</strong></span>
            )}
          </span>
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white text-xs font-bold transition shadow-xs"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
