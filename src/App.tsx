import React, { useState, useMemo, useEffect, useCallback, useRef, useDeferredValue, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { CenterList } from './components/CenterList';
import { BottomNav } from './components/BottomNav';
import { PWAInstallBottomBanner } from './components/PWAInstallBottomBanner';
import { Toast } from './components/Toast';
import { OfflineBanner } from './components/OfflineBanner';
import { MEDICAL_CENTERS, MedicalCenter } from './data/centers';
import { TabType, ReportReason } from './types';
import { norm, squash, toFa } from './utils/persian';
import { usePWAInstall } from './hooks/usePWAInstall';
import { ExternalLink, X, RotateCcw, Bookmark, Info, Sparkles, Search, MapPin, Mail, ChevronDown, Globe } from 'lucide-react';
import { submitReportToSheets, recordSearchToSheets, flushOfflineSearchQueue } from './lib/sheets';
import { submitReportToApi } from './services/api';
import { useCenterWorkerFilter } from './hooks/useCenterWorkerFilter';
import { getReportRateLimitStatus, recordReportRateLimit } from './utils/rateLimit';
import { trackUserVisit } from './utils/analytics';
import { getMergedCenters } from './utils/centerStore';

import { CenterDetailModal } from './components/CenterDetailModal';
import { StreetFilterModal } from './components/StreetFilterModal';
import { CategoryFilterModal } from './components/CategoryFilterModal';
import { ReportModal } from './components/ReportModal';
import { QuickOnboardingModal } from './components/QuickOnboardingModal';
import { GuideTab } from './components/GuideTab';
import { SpecialtyGrid } from './components/SpecialtyGrid';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { PromoBentoCard } from './components/PromoBentoCard';
import { WelcomeHero } from './components/WelcomeHero';
import { InsurerModal } from './components/InsurerModal';
import { AppInstallGuideModal } from './components/AppInstallGuideModal';

// Heavy secondary screens loaded on demand
const AdminPanel = lazy(() => import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel })));

const STORAGE_KEY = 'krf_saved';
const PORTAL_URL = 'https://sinad.karafarin-insurance.ir/DarmanAfzar.Customer/index.html';

// Fisher-Yates shuffle to randomize centers on each refresh / session
function shuffleCenters(centers: MedicalCenter[]): MedicalCenter[] {
  const shuffled = [...centers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function App() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<TabType>('centers');

  // Filters
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [selectedType, setSelectedType] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');
  const [onlyNightShift, setOnlyNightShift] = useState(false);

  // Modals & Sheets
  const [selectedCenter, setSelectedCenter] = useState<MedicalCenter | null>(null);
  const [isStreetFilterOpen, setIsStreetFilterOpen] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [centerForReport, setCenterForReport] = useState<MedicalCenter | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isInsurerModalOpen, setIsInsurerModalOpen] = useState(false);
  const [selectedInsurer, setSelectedInsurer] = useState('karafarin');
  const [hasScrolled, setHasScrolled] = useState(false);

  // Show install suggestion only after user scrolls down a bit
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setHasScrolled(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track device analytics and flush offline searches (Deferred to never block initial render)
  useEffect(() => {
    const timer = setTimeout(() => {
      trackUserVisit().catch(() => {});
      flushOfflineSearchQueue().catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Whenever activeTab changes (e.g. going to guide or centers), scroll to the top of the new tab
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PWA install
  const {
    isInstallable,
    isInstalled,
    isIOS,
    deviceInfo,
    install,
    dismissBanner,
    shouldShowBanner,
  } = usePWAInstall();

  // Scroll & Display Limit (encouraging search)
  const [visibleLimit, setVisibleLimit] = useState(10);

  const handleFocusSearch = useCallback(() => {
    setActiveTab('centers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const input = document.getElementById('main-search-input') as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select?.();
      }
    }, 200);
  }, []);



  // Bookmarks (Saved)
  const [saved, setSaved] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const t = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  // Hidden /admin route check (no visible UI button)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path === '/admin' ||
      path.endsWith('/admin') ||
      hash === '#admin' ||
      search.includes('admin')
    );
  });

  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      setIsAdminRoute(
        path === '/admin' ||
        path.endsWith('/admin') ||
        hash === '#admin' ||
        search.includes('admin')
      );
    };

    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);
    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);



  // Submit report optimistically to Google Sheets and cloud storage
  const handleSubmitReport = useCallback(
    async (
      center: MedicalCenter,
      reason: ReportReason,
      reasonLabel: string,
      details: string,
      reporterContact: string
    ): Promise<boolean> => {
      // 0. Anti-bot rate limit check: Max 3 reports per hour per client device
      const rateStatus = getReportRateLimitStatus();
      if (!rateStatus.allowed) {
        showToast(
          `سقف مجاز ثبت گزارش (۳ مورد در ساعت) تکمیل شده است. لطفاً ${toFa(rateStatus.retryAfterMinutes)} دقیقه بعد مجدداً تلاش فرمایید.`
        );
        return false;
      }

      // Record this submission timestamp
      recordReportRateLimit();

      const reportData = {
        centerId: center.k,
        centerName: center.name,
        centerType: center.type || 'مرکز درمانی',
        reason,
        reasonLabel,
        details: details || '',
        reporterContact: reporterContact || '',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      // 1. Instant optimistic local save
      try {
        const stored = JSON.parse(localStorage.getItem('krf_reports') || '[]');
        stored.unshift({
          ...reportData,
          timestamp: reportData.createdAt,
          syncedToCloud: true,
        });
        localStorage.setItem('krf_reports', JSON.stringify(stored));

        // Also update admin cache if exists
        const adminCache = JSON.parse(localStorage.getItem('krf_admin_cached_reports') || '[]');
        adminCache.unshift({
          ...reportData,
          id: `local-${Date.now()}`,
        });
        localStorage.setItem('krf_admin_cached_reports', JSON.stringify(adminCache));
      } catch (e) {
        console.warn('LocalStorage save notice:', e);
      }

      // 2. Fire dual background submit (Express API Backend + Google Sheets Fallback)
      submitReportToApi(reportData).catch((err) => {
        console.warn('Background API submit note:', err);
      });
      submitReportToSheets(reportData).catch((err) => {
        console.warn('Background sheets submit note:', err);
      });


      // Short 300ms pause for natural tactile feedback
      await new Promise((r) => setTimeout(r, 300));
      showToast('گزارش با موفقیت ثبت شد');
      return true;
    },
    [showToast]
  );

  const handleToggleSave = useCallback((k: number) => {
    setSaved((prev) => {
      const next = new Set(prev);
      const isRemoving = next.has(k);
      if (isRemoving) {
        next.delete(k);
        showToast('از نشان‌شده‌ها حذف شد');
      } else {
        next.add(k);
        showToast('به نشان‌شده‌ها اضافه شد · دسترسی آفلاین');
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, [showToast]);

  const handleCopyText = useCallback((text: string, label: string = 'کپی شد') => {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(label),
        () => fallbackCopy(text, label)
      );
    } else {
      fallbackCopy(text, label);
    }

    function fallbackCopy(txt: string, msg: string) {
      const ta = document.createElement('textarea');
      ta.value = txt;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        showToast(msg);
      } catch {
        showToast('کپی انجام نشد');
      }
      document.body.removeChild(ta);
    }
  }, [showToast]);

  // Dynamic centers loaded with overrides and custom CMS centers
  const [centersVersion, setCentersVersion] = useState(0);

  useEffect(() => {
    const handleCustomUpdate = () => {
      setCentersVersion((v) => v + 1);
    };
    window.addEventListener('krf_centers_updated', handleCustomUpdate);
    window.addEventListener('storage', handleCustomUpdate);
    return () => {
      window.removeEventListener('krf_centers_updated', handleCustomUpdate);
      window.removeEventListener('storage', handleCustomUpdate);
    };
  }, []);

  const allCenters = useMemo(() => {
    return shuffleCenters(getMergedCenters());
  }, [centersVersion]);

  // Compute category and street counts dynamically
  const { typeCounts, streetCounts } = useMemo(() => {
    const tCounts: Record<string, number> = {};
    const sCounts: Record<string, number> = {};

    allCenters.forEach((c) => {
      tCounts[c.type] = (tCounts[c.type] || 0) + 1;
      c.streets.forEach((s) => {
        sCounts[s] = (sCounts[s] || 0) + 1;
      });
    });

    return { typeCounts: tCounts, streetCounts: sCounts };
  }, [allCenters]);

  // Filtering and sorting with support for CMS additions
  const filteredCenters = useCenterWorkerFilter({
    centers: allCenters,
    query: deferredQuery,
    selectedType,
    selectedStreet,
    onlyNightShift,
    saved,
    activeTab,
  });

  const isSearching = deferredQuery.trim().length > 0;

  // Capped cards to encourage search (limit to ~10 on browsing, full list on search or saved)
  const displayedCenters = useMemo(() => {
    if (isSearching || activeTab === 'saved') {
      return filteredCenters;
    }
    return filteredCenters.slice(0, visibleLimit);
  }, [filteredCenters, isSearching, activeTab, visibleLimit]);

  const hasMoreToSearch =
    !isSearching &&
    activeTab !== 'saved' &&
    filteredCenters.length > displayedCenters.length;

  const lastRecordedQueryRef = useRef<string>('');

  const searchFilterStateRef = useRef({
    query,
    resultCount: filteredCenters.length,
    selectedStreet,
    selectedType,
    topMatch: filteredCenters[0] as MedicalCenter | undefined,
  });

  useEffect(() => {
    searchFilterStateRef.current = {
      query,
      resultCount: filteredCenters.length,
      selectedStreet,
      selectedType,
      topMatch: filteredCenters[0],
    };
  });

  // Handle opening center detail + logging partial/completed search intent with clicked center
  const handleOpenCenterDetail = useCallback((center: MedicalCenter) => {
    setSelectedCenter(center);
    const { query: currentQuery, resultCount, selectedStreet: currentStreet, selectedType: currentType } = searchFilterStateRef.current;
    const q = currentQuery.trim();
    if (q.length >= 2 && lastRecordedQueryRef.current !== q) {
      lastRecordedQueryRef.current = q;
      recordSearchToSheets({
        term: q,
        resultCount,
        selectedStreet: currentStreet || undefined,
        selectedType: currentType || undefined,
        clickedCenter: `${center.name} (${center.type})`,
      }).catch(() => {});
    }
  }, []);

  // Immediate search logging (e.g. when pressing Enter or tapping Search)
  const handleImmediateSearchLog = useCallback(() => {
    const { query: currentQuery, resultCount, selectedStreet: currentStreet, selectedType: currentType, topMatch } = searchFilterStateRef.current;
    const q = currentQuery.trim().toLowerCase();
    if (q === 'admin' || q === '/admin' || q === '#admin') {
      setIsAdminRoute(true);
      window.location.hash = '#admin';
      return;
    }
    if (q.length < 2) return;
    if (lastRecordedQueryRef.current !== q) {
      lastRecordedQueryRef.current = q;
      recordSearchToSheets({
        term: q,
        resultCount,
        selectedStreet: currentStreet || undefined,
        selectedType: currentType || undefined,
        clickedCenter: topMatch ? `مشاهده نتایج (نزدیک‌ترین: ${topMatch.name})` : undefined,
      }).catch(() => {});
    }
  }, []);

  // Intelligent Debounced Search Logging to Google Sheets for Marketing & Demand Analytics
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      if (!q) lastRecordedQueryRef.current = '';
      return;
    }

    const timer = setTimeout(() => {
      handleImmediateSearchLog();
    }, 1400);

    return () => clearTimeout(timer);
  }, [query, handleImmediateSearchLog]);

  const handleQueryChange = useCallback((newQuery: string) => {
    const trimmed = newQuery.trim().toLowerCase();
    if (trimmed === '/admin' || trimmed === '#admin') {
      setIsAdminRoute(true);
      window.location.hash = '#admin';
      return;
    }
    setQuery(newQuery);
    setVisibleLimit(10);
    if (newQuery.trim().length > 0) {
      setActiveTab((prev) => (prev !== 'centers' ? 'centers' : prev));
      // Automatically switch to "همه مراکز" so search spans all categories
      setSelectedType('');
    }
  }, []);

  const handleSelectSuggestion = useCallback(
    (term: string, center?: MedicalCenter) => {
      // 1. Set query to the clicked suggestion term
      setQuery(term);
      setVisibleLimit(10);
      setActiveTab((prev) => (prev !== 'centers' ? 'centers' : prev));
      setSelectedType('');

      // 2. Explicitly do NOT open detail modal: let the center card display below in the main list
      // 3. Immediately log the EXACT chosen suggestion term to Google Sheets and Admin Panel
      const qClean = term.trim();
      lastRecordedQueryRef.current = qClean.toLowerCase();
      recordSearchToSheets({
        term: qClean,
        resultCount: 1,
        selectedStreet: selectedStreet || undefined,
        selectedType: selectedType || undefined,
        clickedCenter: center ? `${center.name} (${center.type})` : undefined,
      }).catch(() => {});
    },
    [selectedStreet, selectedType]
  );

  const handleSearchFocus = useCallback(() => {
    setActiveTab((prev) => (prev !== 'centers' ? 'centers' : prev));
    if (query.trim().length > 0) {
      setSelectedType('');
    }
  }, [query]);

  const handleSelectType = useCallback((t: string) => {
    React.startTransition(() => {
      setSelectedType(t);
      setVisibleLimit(10);
      setActiveTab((prev) => (prev !== 'centers' ? 'centers' : prev));
    });
  }, []);

  const handleOpenStreetFilter = useCallback(() => {
    setIsStreetFilterOpen(true);
    setActiveTab((prev) => (prev !== 'centers' ? 'centers' : prev));
  }, []);

  const handleOpenCategoryFilter = useCallback(() => {
    setIsCategoryFilterOpen(true);
    setActiveTab((prev) => (prev !== 'centers' ? 'centers' : prev));
  }, []);

  const handleToggleNightShift = useCallback(() => {
    React.startTransition(() => {
      setOnlyNightShift((prev) => !prev);
      setVisibleLimit(10);
      setActiveTab((prev) => (prev !== 'centers' ? 'centers' : prev));
    });
  }, []);

  // Preload AdminPanel bundle in background idle so clicking orange logo opens INSTANTLY in 0ms
  useEffect(() => {
    const timer = setTimeout(() => {
      import('./components/AdminPanel');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSecretAdminTap = useCallback(() => {
    setIsAdminRoute(true);
    window.location.hash = '#admin';
  }, []);

  const handleCopyPhone = useCallback((phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleCopyText(phone, 'شماره تلفن کپی شد');
  }, [handleCopyText]);

  const handleResetFilters = useCallback(() => {
    setQuery('');
    setSelectedType('');
    setSelectedStreet('');
    setOnlyNightShift(false);
    setVisibleLimit(10);
    setActiveTab('centers');
  }, []);

  const hasSelectionFilter = Boolean(selectedType || selectedStreet || onlyNightShift);
  const hasActiveFilters = Boolean(
    query || selectedType || selectedStreet || onlyNightShift
  );

  // Mobile Physical Back Button & Swipe Navigation Handling
  const overlayStateRef = useRef({
    selectedCenter,
    isStreetFilterOpen,
    isCategoryFilterOpen,
    centerForReport,
    isOnboardingOpen,
    isInsurerModalOpen,
    hasActiveFilters,
    activeTab,
  });

  useEffect(() => {
    overlayStateRef.current = {
      selectedCenter,
      isStreetFilterOpen,
      isCategoryFilterOpen,
      centerForReport,
      isOnboardingOpen,
      isInsurerModalOpen,
      hasActiveFilters,
      activeTab,
    };
  });

  const isAnyOverlayActive = Boolean(
    selectedCenter ||
    isStreetFilterOpen ||
    isCategoryFilterOpen ||
    centerForReport ||
    isOnboardingOpen ||
    isInsurerModalOpen ||
    hasActiveFilters ||
    activeTab !== 'centers'
  );

  const historyPushedRef = useRef(false);

  useEffect(() => {
    if (isAnyOverlayActive && !historyPushedRef.current) {
      if (typeof window !== 'undefined') {
        window.history.pushState({ appNavOverlay: true }, '');
        historyPushedRef.current = true;
      }
    } else if (!isAnyOverlayActive) {
      historyPushedRef.current = false;
    }
  }, [isAnyOverlayActive]);

  useEffect(() => {
    const handlePopState = () => {
      const s = overlayStateRef.current;
      if (s.selectedCenter) {
        setSelectedCenter(null);
        historyPushedRef.current = false;
        return;
      }
      if (s.isStreetFilterOpen) {
        setIsStreetFilterOpen(false);
        historyPushedRef.current = false;
        return;
      }
      if (s.isCategoryFilterOpen) {
        setIsCategoryFilterOpen(false);
        historyPushedRef.current = false;
        return;
      }
      if (s.centerForReport) {
        setCenterForReport(null);
        historyPushedRef.current = false;
        return;
      }
      if (s.isInsurerModalOpen) {
        setIsInsurerModalOpen(false);
        historyPushedRef.current = false;
        return;
      }
      if (s.isOnboardingOpen) {
        setIsOnboardingOpen(false);
        historyPushedRef.current = false;
        return;
      }
      if (s.hasActiveFilters) {
        handleResetFilters();
        historyPushedRef.current = false;
        return;
      }
      if (s.activeTab !== 'centers') {
        setActiveTab('centers');
        historyPushedRef.current = false;
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleResetFilters]);

  const handleInstallClick = useCallback(async () => {
    // 1. Direct native installation trigger on PC / Android / Tablet
    const hasPrompt =
      isInstallable ||
      (typeof window !== 'undefined' && Boolean(window.__deferredPrompt));

    if (hasPrompt) {
      const success = await install();
      if (success) {
        showToast('برنامه با موفقیت نصب شد');
      }
      return;
    }

    // 2. Check if already installed on device
    if (isInstalled) {
      showToast('برنامه قبلاً روی این دستگاه نصب شده است');
      return;
    }

    // 3. Open visual step-by-step guide
    setIsInstallGuideOpen(true);
  }, [isInstallable, isInstalled, install, showToast]);


  if (isAdminRoute) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#f2f5fa] flex flex-col items-center justify-center p-4">
            <div className="w-9 h-9 border-3 border-[#0a4c9a] border-t-transparent rounded-full animate-spin mb-3" />
            <div className="text-xs font-bold text-slate-600">در حال بارگذاری پنل مدیریت...</div>
          </div>
        }
      >
        <AdminPanel
          onBackToApp={() => {
            if (window.location.hash === '#admin') {
              window.location.hash = '';
            } else if (
              window.location.pathname === '/admin' ||
              window.location.pathname.endsWith('/admin')
            ) {
              window.history.pushState(
                {},
                '',
                window.location.pathname.replace(/\/admin\/?$/, '') || '/'
              );
            }
            setIsAdminRoute(false);
          }}
          showToast={showToast}
        />
        <Toast message={toastMessage} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f5fa] text-[#0f1b33] flex flex-col pb-24">
      {/* Offline Status */}
      <OfflineBanner />

      {/* Main Sticky Header */}
      <Header
        query={query}
        onQueryChange={handleQueryChange}
        onSearchFocus={handleSearchFocus}
        selectedType={selectedType}
        onSelectType={handleSelectType}
        typeCounts={typeCounts}
        selectedStreet={selectedStreet}
        onOpenStreetFilter={handleOpenStreetFilter}
        onOpenCategoryFilter={handleOpenCategoryFilter}
        onlyNightShift={onlyNightShift}
        onToggleNightShift={handleToggleNightShift}
        savedCount={saved.size}
        isSavedTab={activeTab === 'saved'}
        onToggleSavedTab={() => {
          setActiveTab((prev) => (prev === 'saved' ? 'centers' : 'saved'));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        resultCount={filteredCenters.length}
        onSecretAdminTap={handleSecretAdminTap}
        onSubmitSearch={handleImmediateSearchLog}
        allCenters={allCenters}
        onSelectSuggestion={handleSelectSuggestion}
        onSelectCenter={(center) => {
          setSelectedCenter(center);
          handleImmediateSearchLog();
        }}
        onOpenInsurerModal={() => setIsInsurerModalOpen(true)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstall={handleInstallClick}
      />

      {/* Main Body */}
      <main className="flex-1 w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-8">
        {/* Tab 1: Centers / Saved */}
        {(activeTab === 'centers' || activeTab === 'saved') && (
          <div className="space-y-3">
            {/* Active Filter Badges Bar: Highly visible with prominent reset button */}
            {hasActiveFilters && (
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 text-xs shadow-xs space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 font-black text-slate-800 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#F15A31] animate-ping" />
                    <span>فیلترهای اعمال‌شده:</span>
                  </div>

                  {/* Prominent, High-Contrast Reset Button */}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 shadow-2xs transition active:scale-95 cursor-pointer"
                    title="حذف تمام فیلترها و مشاهده همه مراکز"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>حذف تمام فیلترها (نمایش همه)</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {selectedType && (
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0a4c9a] font-bold px-2.5 py-1 rounded-xl border border-blue-200">
                      <span>دسته‌بندی: {selectedType}</span>
                      <button
                        onClick={() => handleSelectType('')}
                        className="hover:text-red-500 p-0.5"
                        title="حذف این فیلتر"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}

                  {selectedStreet && (
                    <span className="inline-flex items-center gap-1.5 bg-orange-50 text-[#F15A31] font-bold px-2.5 py-1 rounded-xl border border-orange-200">
                      <span>خیابان: {selectedStreet}</span>
                      <button
                        onClick={() => {
                          setSelectedStreet('');
                          setVisibleLimit(10);
                        }}
                        className="hover:text-red-500 p-0.5"
                        title="حذف این فیلتر"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}

                  {onlyNightShift && (
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 font-bold px-2.5 py-1 rounded-xl border border-amber-200">
                      <span>فقط شبانه‌روزی</span>
                      <button
                        onClick={() => {
                          setOnlyNightShift(false);
                          setVisibleLimit(10);
                        }}
                        className="hover:text-red-500 p-0.5"
                        title="حذف این فیلتر"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}

                  {query && (
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-xl border border-slate-200">
                      <span>جستجو: «{query}»</span>
                      <button
                        onClick={() => handleQueryChange('')}
                        className="hover:text-red-500 p-0.5"
                        title="حذف این فیلتر"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Snapp Doctor Style Dashboard Section (shown on initial browsing) */}
            {activeTab === 'centers' && !hasActiveFilters && (
              <div className="space-y-4">
                {/* 1. Welcome Hero Banner & 4 Major Service Pillars (خدمات پرکاربر بیمه تکمیلی) */}
                <WelcomeHero
                  onSelectType={handleSelectType}
                  onOpenGuide={() => setActiveTab('guide')}
                  onFocusSearch={handleFocusSearch}
                  onOpenStreetFilter={() => setIsStreetFilterOpen(true)}
                  totalCentersCount={allCenters.length}
                  onOpenInsurerModal={() => setIsInsurerModalOpen(true)}
                />

                {/* 2. Curated / Sponsored Premier Centers Carousel (گزیده مراکز برتر ارومیه) */}
                <FeaturedCarousel
                  centers={allCenters}
                  onOpenDetail={handleOpenCenterDetail}
                  onCallCenter={handleCopyPhone}
                />

                {/* 3. Visual Specialty Tiles Grid with Large Desktop Cards (دسته‌بندی و تخصص‌ها) */}
                <SpecialtyGrid
                  selectedType={selectedType}
                  onSelectType={handleSelectType}
                  typeCounts={typeCounts}
                  onOpenAllCategories={() => setIsCategoryFilterOpen(true)}
                />

                {/* 4. Minimal Corporate Promo Bento Card */}
                <PromoBentoCard onOpenGuide={() => setActiveTab('guide')} />
              </div>
            )}

            {/* List Header Count */}
            <div className="flex items-center justify-between text-xs text-slate-600 px-1 pt-1">
              <h2 className="font-extrabold text-slate-800 text-sm">
                {activeTab === 'saved'
                  ? 'مراکز نشان‌شده شما'
                  : selectedStreet
                  ? `مراکز خیابان ${selectedStreet}`
                  : selectedType
                  ? `مراکز دسته ${selectedType}`
                  : 'مراکز درمانی طرف قرارداد'}
              </h2>
              {(hasActiveFilters || activeTab === 'saved') && (
                <span className="tabular-nums font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                  {toFa(filteredCenters.length)} مرکز
                </span>
              )}
            </div>

            {/* Centers Grid / List */}
            {filteredCenters.length > 0 ? (
              <div className="space-y-4">
                <CenterList
                  centers={displayedCenters}
                  saved={saved}
                  onToggleSave={handleToggleSave}
                  onOpenDetail={handleOpenCenterDetail}
                  onCopyPhone={handleCopyPhone}
                />

                {/* Search Encouragement & Limit Box */}
                {hasMoreToSearch && (
                  <div className="bg-gradient-to-b from-white to-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200/90 p-5 sm:p-6 text-center space-y-3.5 shadow-2xs">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-[#0a4c9a] flex items-center justify-center mx-auto border border-blue-200 shadow-2xs">
                      <Search className="w-6 h-6 text-[#0a4c9a]" />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                        مرکز یا پزشک خاصی مد نظرتان است؟
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                        برای دسترسی سریع به نشانی و شماره تماس هر مرکز، نام مرکز، پزشک یا تخصص مورد نظر را در کادر بالا جستجو کنید.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                      {/* Show continue results button when any filter is active */}
                      {hasSelectionFilter && (
                        <button
                          type="button"
                          onClick={() => setVisibleLimit((prev) => prev + 10)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
                        >
                          <ChevronDown className="w-4 h-4" />
                          <span>نمایش ادامه نتایج ({toFa(filteredCenters.length - displayedCenters.length)} مرکز دیگر)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleFocusSearch}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
                      >
                        <Search className="w-4 h-4" />
                        <span>جستجوی نام مرکز یا پزشک</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsStreetFilterOpen(true)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-orange-50 text-[#F15A31] text-xs font-bold transition flex items-center justify-center gap-2 border border-orange-200 active:scale-95 shadow-2xs"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>فیلتر خیابان‌ها</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {activeTab === 'saved'
                    ? 'هنوز هیچ مرکزی را نشان نکرده‌اید'
                    : 'مرکزی با این مشخصات یافت نشد'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {activeTab === 'saved'
                    ? 'روی آیکون نشان در کارت مراکز بزنید تا همیشه در دسترس شما باشند.'
                    : 'املای کلمه را بررسی کنید یا ۲ حرف از تخصص یا پزشک را بنویسید.'}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2.5 rounded-xl bg-[#0a4c9a] text-white text-xs font-bold hover:bg-blue-900 transition"
                    >
                      بازنشانی همه فیلترها
                    </button>
                  )}
                  {activeTab === 'saved' && (
                    <button
                      onClick={() => setActiveTab('centers')}
                      className="px-4 py-2.5 rounded-xl bg-[#0a4c9a] text-white text-xs font-bold hover:bg-blue-900 transition"
                    >
                      مشاهده همه مراکز
                    </button>
                  )}
                  <a
                    href={PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    <span>ورود به پورتال سیناد</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Guide & Sinad Claim Portal */}
        {activeTab === 'guide' && (
          <GuideTab
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenInstall={handleInstallClick}
          />
        )}

        {/* Official TakmiliOnline Footer (Clean, elegant, desktop-friendly, no Inamade placeholders) */}
        <footer className="pt-8 pb-4 text-xs text-slate-500 border-t border-slate-200/80 mt-8 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-right">
            <div>
              <div className="font-extrabold text-slate-800 text-sm flex items-center justify-center md:justify-start gap-1.5">
                <span>تکمیلی آنلاین</span>
                <span className="text-[11px] font-mono text-[#0a4c9a] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  takmilionline.com
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 mt-1 max-w-lg">
                سامانه هوشمند جستجو و مسیریابی مراکز درمانی طرف قرارداد بیمه تکمیلی در ارومیه
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11.5px]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('guide');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 shadow-2xs transition"
              >
                راهنمای خسارت
              </button>
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 shadow-2xs transition"
              >
                راهنمای سریع
              </button>
              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#0a4c9a] font-bold border border-slate-200 shadow-2xs transition inline-flex items-center gap-1"
              >
                <span>پورتال سیناد</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/50 space-y-2 text-[11px] text-slate-400">
            <p className="text-slate-500 leading-relaxed">
              ⚖️ <strong>سلب مسئولیت قانونی و شفافیت:</strong> «تکمیلی آنلاین» یک سامانه دانش‌بنیان و مستقل اطلاع‌رسانی و مسیریابی خدمات درمانی است و وابسته مستقیم، انحصاری یا نمایندگی هیچ شرکت بیمه خاصی نمی‌باشد. اطلاعات مراکز بر اساس آخرین استعلامات رسمی در <strong>آبان ۱۴۰۵</strong> به‌روزرسانی شده است.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <span>کلیه حقوق برای سامانه تکمیلی آنلاین محفوظ است © ۱۴۰۵</span>
              <div className="flex items-center gap-1.5">
                <span>طراح و توسعه‌دهنده نرم‌افزار:</span>
                <a
                  href="https://saeed-jabbari.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#0a4c9a] hover:underline"
                  title="وب‌سایت سعید جباری"
                >
                  سعید جباری
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(newTab) => {
          setActiveTab(newTab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedStreet={selectedStreet}
        onOpenStreetFilter={handleOpenStreetFilter}
        onlyNightShift={onlyNightShift}
        onToggleNightShift={handleToggleNightShift}
      />

      {/* PWA Install Bottom Banner (Auto-popup disabled to avoid blocking screen) */}
      <PWAInstallBottomBanner
        isOpen={false}
        deviceInfo={deviceInfo}
        onInstall={handleInstallClick}
        onDismiss={dismissBanner}
      />

      {/* Modals & Dialogs */}
      {selectedCenter && (
        <CenterDetailModal
          center={selectedCenter}
          onClose={() => setSelectedCenter(null)}
          isSaved={saved.has(selectedCenter.k)}
          onToggleSave={handleToggleSave}
          onCopyText={handleCopyText}
          onOpenReport={setCenterForReport}
        />
      )}

      {isStreetFilterOpen && (
        <StreetFilterModal
          isOpen={isStreetFilterOpen}
          onClose={() => setIsStreetFilterOpen(false)}
          selectedStreet={selectedStreet}
          onSelectStreet={(s) => {
            setSelectedStreet(s);
            setVisibleLimit(10);
            if (activeTab !== 'centers') {
              setActiveTab('centers');
            }
          }}
          streetCounts={streetCounts}
          totalCenters={MEDICAL_CENTERS.length}
        />
      )}

      {isCategoryFilterOpen && (
        <CategoryFilterModal
          isOpen={isCategoryFilterOpen}
          onClose={() => setIsCategoryFilterOpen(false)}
          selectedType={selectedType}
          onSelectType={handleSelectType}
          typeCounts={typeCounts}
          totalCenters={MEDICAL_CENTERS.length}
        />
      )}

      {centerForReport && (
        <ReportModal
          center={centerForReport}
          onClose={() => setCenterForReport(null)}
          onSubmitReport={handleSubmitReport}
        />
      )}

      {isOnboardingOpen && (
        <QuickOnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onStartSearch={handleFocusSearch}
        />
      )}

      {/* Multi-Insurer Selector & Request Modal */}
      <InsurerModal
        isOpen={isInsurerModalOpen}
        onClose={() => setIsInsurerModalOpen(false)}
        selectedInsurer={selectedInsurer}
        onSelectInsurer={setSelectedInsurer}
        onShowToast={showToast}
      />

      {/* Visual Step-by-Step App Install Modal */}
      {isInstallGuideOpen && (
        <AppInstallGuideModal
          isOpen={isInstallGuideOpen}
          onClose={() => setIsInstallGuideOpen(false)}
          isInstallable={isInstallable}
          onInstall={install}
        />
      )}

      {/* Global Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
