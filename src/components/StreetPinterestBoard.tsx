import React, { useMemo } from 'react';
import { MapPin, Check, Building2, Sparkles, Stethoscope, Activity } from 'lucide-react';
import { toFa } from '../utils/persian';

export interface StreetMetaInfo {
  name: string;
  count: number;
  tier: 'mega' | 'major' | 'mid' | 'standard';
  badge?: string;
  desc?: string;
}

const STREET_DETAILS: Record<string, { badge?: string; desc?: string }> = {
  'حسنی': {
    badge: 'قطب اصلی پزشکی ارومیه',
    desc: 'ساختمان‌های لقمان حکیم، اورشاد، نوبل، کالین، باریش',
  },
  'خیام شمالی': {
    badge: 'محور تخصصی و آزمایشگاه',
    desc: 'مطب‌های تخصصی و آزمایشگاه‌های مجهز',
  },
  'خان‌باباخان': {
    badge: 'مراکز پرسابقه تشخیصی',
    desc: 'آزمایشگاه مهر، شمس و رادیولوژی',
  },
  'مولوی': {
    badge: 'بیمارستان و جراحی',
    desc: 'بیمارستان میلاد و مراکز جراحی',
  },
  'کاشانی': {
    badge: 'محور درمانی مرکزی',
    desc: 'بیمارستان مطهری، طالقانی و درمانگاه‌ها',
  },
  'ورزش': {
    badge: 'بلوار ورزش و خیرین',
    desc: 'آزمایشگاه بنیان و مراکز تخصصی',
  },
  'شورا': {
    badge: 'بلوار شورا و دسترسی سریع',
    desc: 'مراکز درمانی و دسترسی شرقی',
  },
  'امام': {
    badge: 'خیابان مرکزی شهر',
    desc: 'بیمارستان شفا و دکتر صولتی',
  },
  'فرهنگیان': {
    badge: 'شهرک فرهنگیان و کوثر',
    desc: 'بیمارستان امید و درمانگاه شبانه‌روزی',
  },
  'سرداران': {
    badge: 'خیابان سرداران',
    desc: 'مراکز پزشکی و درمانگاه‌های تخصصی',
  },
  'استادان': {
    badge: 'استادان و دانشکده',
    desc: 'مطب‌ها و کلینیک‌های دندانپزشکی',
  },
  'برق': {
    badge: 'خیابان برق و عمار',
    desc: 'مرکز جراحی تیزرو و درمانگاه فارابی',
  },
  'رودکی': {
    badge: 'رودکی و آزادگان',
    desc: 'کلینیک‌های دندانپزشکی و درمانگاه',
  },
  'بهشتی': {
    badge: 'خیابان دانشکده',
    desc: 'بیمارستان آذربایجان، داروخانه جوانبخت و شمس',
  },
  'باکری': {
    badge: 'خیابان شهید باکری',
    desc: 'درمانگاه شبانه‌روزی شهر و دسترسی به مرکز شهر',
  },
  'جاده سلماس': {
    badge: 'محور ورودی شمال ارومیه',
    desc: 'بیمارستان تخصصی روانپزشکی رازی و مراکز تخصصی',
  },
};

interface StreetPinterestBoardProps {
  selectedStreet: string;
  onSelectStreet: (street: string) => void;
  streetCounts: Record<string, number>;
  totalCenters: number;
  searchQuery?: string;
  onClose?: () => void;
}

export const StreetPinterestBoard: React.FC<StreetPinterestBoardProps> = ({
  selectedStreet,
  onSelectStreet,
  streetCounts,
  totalCenters,
  searchQuery = '',
  onClose,
}) => {
  // Sort streets by count descending
  const sortedStreets: StreetMetaInfo[] = useMemo(() => {
    return Object.entries(streetCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => {
        let tier: 'mega' | 'major' | 'mid' | 'standard' = 'standard';
        if (count >= 25) tier = 'mega'; // حسنی (41)
        else if (count >= 10) tier = 'major'; // خیام شمالی (12), خان‌باباخان (11)
        else if (count >= 7) tier = 'mid'; // مولوی (9), ورزش (8), کاشانی (8)
        else tier = 'standard';

        const extra = STREET_DETAILS[name] || {};
        return {
          name,
          count,
          tier,
          badge: extra.badge,
          desc: extra.desc,
        };
      });
  }, [streetCounts]);

  // Filter if searchQuery is provided
  const visibleStreets = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return sortedStreets;
    return sortedStreets.filter((st) => st.name.includes(q) || (st.desc && st.desc.includes(q)));
  }, [sortedStreets, searchQuery]);

  const handleSelect = (streetName: string) => {
    if (selectedStreet === streetName) {
      onSelectStreet('');
    } else {
      onSelectStreet(streetName);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Top Banner: All Streets / Reset Filter */}
      <button
        type="button"
        onClick={() => handleSelect('')}
        className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-all active:scale-98 ${
          selectedStreet === ''
            ? 'bg-[#0a4c9a] text-white shadow-sm ring-2 ring-[#0a4c9a]/30'
            : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              selectedStreet === '' ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0a4c9a]'
            }`}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-right">
            <span className="text-xs font-extrabold block">همه مناطق و خیابان‌های ارومیه</span>
            <span className={`text-[11px] block mt-0.5 ${selectedStreet === '' ? 'text-blue-100' : 'text-slate-500'}`}>
              نمایش تمام مراکز درمانی طرف قرارداد
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-full ${
              selectedStreet === ''
                ? 'bg-white text-[#0a4c9a]'
                : 'bg-blue-50 text-[#0a4c9a] border border-blue-100'
            }`}
          >
            {toFa(totalCenters)} مرکز
          </span>
          {selectedStreet === '' && <Check className="w-4 h-4 text-white" />}
        </div>
      </button>

      {/* Pinterest Masonry Grid of Streets */}
      <div className="columns-2 sm:columns-3 md:columns-4 gap-2.5 [column-fill:_balance] w-full">
        {visibleStreets.map((st) => {
          const isSelected = selectedStreet === st.name;

          if (st.tier === 'mega') {
            // Mega Tier (e.g. خیابان حسنی with 41 centers)
            return (
              <div key={st.name} className="break-inside-avoid mb-2.5">
                <button
                  type="button"
                  onClick={() => handleSelect(st.name)}
                  className={`w-full text-right p-3.5 rounded-2xl flex flex-col justify-between transition-all duration-150 active:scale-98 ${
                    isSelected
                      ? 'bg-[#0a4c9a] text-white border-2 border-[#0a4c9a] shadow-md ring-2 ring-[#0a4c9a]/40'
                      : 'bg-gradient-to-b from-blue-50/60 to-white hover:from-blue-50 hover:to-blue-50/40 text-slate-800 border-2 border-blue-200/90 hover:border-[#0a4c9a] shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-amber-300' : 'text-[#F15A31]'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-orange-100 text-[#F15A31]'
                          }`}
                        >
                          {st.badge || 'قطب اصلی'}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                    </div>

                    <h3 className="text-sm font-extrabold tracking-tight mb-1">
                      خیابان {st.name}
                    </h3>

                    {st.desc && (
                      <p
                        className={`text-[11px] leading-relaxed mb-2.5 line-clamp-2 ${
                          isSelected ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {st.desc}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                    <span
                      className={`text-[11px] ${
                        isSelected ? 'text-blue-100' : 'text-slate-500 font-medium'
                      }`}
                    >
                      تراکم بسیار بالا
                    </span>
                    <span
                      className={`text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-lg ${
                        isSelected
                          ? 'bg-white text-[#0a4c9a]'
                          : 'bg-[#0a4c9a] text-white shadow-xs'
                      }`}
                    >
                      {toFa(st.count)} مرکز
                    </span>
                  </div>
                </button>
              </div>
            );
          }

          if (st.tier === 'major') {
            // Major Tier (e.g. خیام شمالی, خان‌باباخان)
            return (
              <div key={st.name} className="break-inside-avoid mb-2.5">
                <button
                  type="button"
                  onClick={() => handleSelect(st.name)}
                  className={`w-full text-right p-3 rounded-2xl flex flex-col justify-between transition-all duration-150 active:scale-98 ${
                    isSelected
                      ? 'bg-[#0a4c9a] text-white border-2 border-[#0a4c9a] shadow-md ring-2 ring-[#0a4c9a]/40'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-blue-400 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1">
                        <Building2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-white' : 'text-[#0a4c9a]'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold ${
                            isSelected ? 'text-blue-100' : 'text-slate-500'
                          }`}
                        >
                          {st.badge}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                    </div>

                    <h3 className="text-xs font-extrabold mb-1">خیابان {st.name}</h3>

                    {st.desc && (
                      <p
                        className={`text-[10.5px] leading-tight mb-2 line-clamp-2 ${
                          isSelected ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {st.desc}
                      </p>
                    )}
                  </div>

                  <div className="pt-1.5 flex items-center justify-end">
                    <span
                      className={`text-[11px] font-extrabold tabular-nums px-2 py-0.5 rounded-lg ${
                        isSelected
                          ? 'bg-white text-[#0a4c9a]'
                          : 'bg-blue-50 text-[#0a4c9a] border border-blue-100'
                      }`}
                    >
                      {toFa(st.count)} مرکز
                    </span>
                  </div>
                </button>
              </div>
            );
          }

          if (st.tier === 'mid') {
            // Mid Tier (e.g. مولوی, ورزش, کاشانی)
            return (
              <div key={st.name} className="break-inside-avoid mb-2.5">
                <button
                  type="button"
                  onClick={() => handleSelect(st.name)}
                  className={`w-full text-right p-2.5 rounded-2xl flex flex-col justify-between transition-all duration-150 active:scale-98 ${
                    isSelected
                      ? 'bg-[#0a4c9a] text-white border-2 border-[#0a4c9a] shadow-md ring-2 ring-[#0a4c9a]/40'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-blue-400 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <h3 className="text-xs font-bold truncate">خیابان {st.name}</h3>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </div>

                  {st.badge && (
                    <span
                      className={`text-[10px] block truncate mb-1.5 ${
                        isSelected ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {st.badge}
                    </span>
                  )}

                  <div className="flex justify-end">
                    <span
                      className={`text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-white text-[#0a4c9a]'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {toFa(st.count)} مرکز
                    </span>
                  </div>
                </button>
              </div>
            );
          }

          // Standard Tier (e.g. شورا, امام, فرهنگیان, سرداران, استادان, برق, رودکی, بهشتی)
          return (
            <div key={st.name} className="break-inside-avoid mb-2.5">
              <button
                type="button"
                onClick={() => handleSelect(st.name)}
                className={`w-full text-right min-h-[54px] p-2.5 rounded-2xl flex items-center justify-between gap-1.5 transition-all duration-150 active:scale-98 ${
                  isSelected
                    ? 'bg-[#0a4c9a] text-white border-2 border-[#0a4c9a] shadow-md ring-2 ring-[#0a4c9a]/40'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-blue-400 shadow-2xs'
                }`}
              >
                <div className="min-w-0 flex items-center gap-1.5">
                  <MapPin
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">{st.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`text-[10.5px] font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-white text-[#0a4c9a]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {toFa(st.count)}
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {visibleStreets.length === 0 && (
        <div className="py-8 text-center text-slate-400 text-xs">
          خیابانی با این نام یافت نشد.
        </div>
      )}
    </div>
  );
};
