import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, Moon, ShieldCheck, MapPin, LayoutGrid, Sparkles, Bookmark, Download } from 'lucide-react';
import { toFa } from '../utils/persian';
import { getCategoryItem } from '../constants/categories';
import { MedicalCenter } from '../data/centers';
import { SearchSuggestions, RECENT_SEARCHES_KEY } from './SearchSuggestions';

interface HeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
  typeCounts: Record<string, number>;
  selectedStreet?: string;
  onOpenStreetFilter?: () => void;
  onOpenCategoryFilter?: () => void;
  onlyNightShift?: boolean;
  onToggleNightShift?: () => void;
  savedCount?: number;
  isSavedTab?: boolean;
  onToggleSavedTab?: () => void;
  resultCount: number;
  isInstallable?: boolean;
  isInstalled?: boolean;
  onInstall?: () => void;
  onOpenInstallGuide?: () => void;
  onSecretAdminTap?: () => void;
  onSubmitSearch?: () => void;
  onSearchFocus?: () => void;
  allCenters?: MedicalCenter[];
  onSelectCenter?: (center: MedicalCenter) => void;
  onSelectSuggestion?: (term: string, center?: MedicalCenter) => void;
  onOpenInsurerModal?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  query,
  onQueryChange,
  selectedType,
  onSelectType,
  typeCounts,
  selectedStreet,
  onOpenStreetFilter,
  onOpenCategoryFilter,
  onlyNightShift,
  onToggleNightShift,
  savedCount = 0,
  isSavedTab = false,
  onToggleSavedTab,
  resultCount,
  isInstallable,
  isInstalled = false,
  onInstall,
  onOpenInstallGuide,
  onSecretAdminTap,
  onSubmitSearch,
  onSearchFocus,
  allCenters = [],
  onSelectCenter,
  onSelectSuggestion,
  onOpenInsurerModal,
}) => {
  const [taps, setTaps] = React.useState(0);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelectSuggestion = (term: string, center?: MedicalCenter) => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      const list: string[] = stored ? JSON.parse(stored) : [];
      const updated = [term, ...list.filter((s) => s !== term)].slice(0, 6);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}

    onQueryChange(term);
    setIsSuggestionsOpen(false);

    if (onSelectSuggestion) {
      onSelectSuggestion(term, center);
    } else if (center && onSelectCenter) {
      onSelectCenter(center);
    } else {
      onSubmitSearch?.();
    }
  };

  const handleFillQuery = (term: string) => {
    onQueryChange(term);
    const input = document.getElementById('main-search-input') as HTMLInputElement | null;
    if (input) {
      input.focus();
    }
  };

  const handleLogoTap = () => {
    // Prefetch AdminPanel chunk immediately on first tap
    import('./AdminPanel').catch(() => {});

    setTaps((prev) => {
      const next = prev + 1;
      // 4 taps to trigger admin entry on both mobile and desktop
      if (next >= 4) {
        onSecretAdminTap?.();
        return 0;
      }
      return next;
    });
    setTimeout(() => setTaps(0), 2500);
  };

  const totalCount = useMemo(() => {
    return Object.values(typeCounts).reduce((a, b) => a + b, 0);
  }, [typeCounts]);

  const activeCategoryItem = useMemo(() => {
    return selectedType ? getCategoryItem(selectedType) : null;
  }, [selectedType]);

  const ActiveCategoryIcon = activeCategoryItem?.icon || Sparkles;

  return (
    <header className="sticky top-0 z-30 bg-[#0a4c9a] text-white shadow-md">
      {/* Brand Top Bar */}
      <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-3">
        {/* Brand Top Row */}
        <div className="flex items-center justify-between gap-2.5 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={handleLogoTap}
              onMouseEnter={() => import('./AdminPanel').catch(() => {})}
              onTouchStart={() => import('./AdminPanel').catch(() => {})}
              title="تکمیلی آنلاین"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#F15A31] flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-xs cursor-default active:scale-95 transition"
            >
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight flex items-center gap-2">
                <span>تکمیلی آنلاین</span>
                <span className="hidden sm:inline-flex items-center text-[10.5px] font-semibold text-blue-200 bg-white/10 px-2 py-0.5 rounded-md font-mono tracking-wide border border-white/10">
                  takmilionline.com
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenInsurerModal}
              className="bg-emerald-500/25 hover:bg-emerald-500/35 text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/40 flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs"
              title="تغییر یا مشاهده شرکت‌های بیمه طرف قرارداد"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>کارآفرین ▾</span>
            </button>

            <span className="bg-white/20 text-white text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full tabular-nums border border-white/10">
              {toFa(resultCount)} مرکز
            </span>
          </div>
        </div>

        {/* Full Official Subtitle - 100% visible on mobile and desktop without truncation */}
        <div className="text-[11px] sm:text-xs text-blue-100/95 font-medium flex items-center gap-1.5 mb-2.5 px-0.5 leading-relaxed">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>سامانه هوشمند مراکز درمانی طرف قرارداد بیمه تکمیلی · ارومیه</span>
        </div>

        {/* Search & Filter Row */}
        <div className="flex items-center gap-2">
          <div ref={searchContainerRef} className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="main-search-input"
              type="text"
              value={query}
              onChange={(e) => {
                onQueryChange(e.target.value);
                setIsSuggestionsOpen(true);
              }}
              onFocus={() => {
                setIsSuggestionsOpen(true);
                onSearchFocus?.();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsSuggestionsOpen(false);
                  onSubmitSearch?.();
                } else if (e.key === 'Escape') {
                  setIsSuggestionsOpen(false);
                }
              }}
              placeholder="جستجوی پزشک، کلینیک، داروخانه یا خیابان..."
              className="w-full h-10 sm:h-11 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-full pr-9 pl-9 outline-none shadow-sm focus:ring-2 focus:ring-blue-300 transition"
              autoComplete="off"
            />
            {query && (
              <button
                onClick={() => {
                  onQueryChange('');
                  setIsSuggestionsOpen(true);
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                aria-label="پاک کردن جستجو"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Google Style Autocomplete & Smart Suggestions */}
            <SearchSuggestions
              query={query}
              isOpen={isSuggestionsOpen}
              onClose={() => setIsSuggestionsOpen(false)}
              onSelectSuggestion={handleSelectSuggestion}
              onFillQuery={handleFillQuery}
              allCenters={allCenters}
              onSelectCategory={(cat) => {
                onSelectType(cat);
                setIsSuggestionsOpen(false);
              }}
            />
          </div>

          {/* Saved / Bookmarks Button (Yellow highlight when active or centers saved, no number badge) */}
          <button
            type="button"
            onClick={onToggleSavedTab}
            className={`h-10 sm:h-11 px-3 sm:px-3.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition shadow-sm shrink-0 active:scale-95 cursor-pointer ${
              isSavedTab
                ? 'bg-amber-400 text-slate-950 ring-2 ring-white/80 shadow-md font-black'
                : savedCount > 0
                ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-300/50'
                : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
            }`}
            title="مراکز نشان‌شده (علاقه‌مندی‌ها)"
            aria-label="مراکز نشان‌شده"
          >
            <Bookmark
              className={`w-4 h-4 shrink-0 transition-colors ${
                isSavedTab
                  ? 'fill-slate-950 text-slate-950'
                  : savedCount > 0
                  ? 'fill-amber-300 text-amber-300'
                  : 'text-white'
              }`}
            />
            <span className="hidden xs:inline">نشان‌شده‌ها</span>
          </button>
        </div>

        {/* Micro-hint and clean install link - perfectly fits mobile screens */}
        <div className="flex items-center justify-between text-[11px] text-blue-100/90 mt-2 px-1">
          <span className="truncate">💡 جستجوی خودکار و آنی حین تایپ</span>
          {(onInstall || onOpenInstallGuide) && !isInstalled && (
            <button
              type="button"
              onClick={onInstall || onOpenInstallGuide}
              className="inline-flex items-center gap-1 text-amber-300 hover:text-white font-bold transition shrink-0 pr-2 active:scale-95 cursor-pointer"
              title="نصب برنامه روی گوشی یا کامپیوتر"
            >
              <Download className="w-3.5 h-3.5" />
              <span>نصب برنامه</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
});
