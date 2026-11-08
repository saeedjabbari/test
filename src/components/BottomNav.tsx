import React from 'react';
import { Stethoscope, MapPin, Moon, FileText, Bookmark } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  selectedStreet: string;
  onOpenStreetFilter: () => void;
  onlyNightShift: boolean;
  onToggleNightShift: () => void;
  savedCount?: number;
  isSavedTab?: boolean;
  onToggleSavedTab?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  selectedStreet,
  onOpenStreetFilter,
  onlyNightShift,
  onToggleNightShift,
  savedCount = 0,
  isSavedTab = false,
  onToggleSavedTab,
}) => {
  return (
    <nav
      className="fixed bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] sm:max-w-[460px] z-40 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_10px_35px_rgb(0,0,0,0.14)] rounded-3xl p-1.5 transition-all"
      aria-label="منوی ناوبری اصلی"
    >
      <div className="grid grid-cols-4 items-center h-14">
        {/* 1. خانه و مراکز (Home / Centers) */}
        <button
          type="button"
          onClick={() => {
            if (isSavedTab && onToggleSavedTab) onToggleSavedTab();
            onTabChange('centers');
          }}
          className={`flex flex-col items-center justify-center h-full rounded-2xl transition-all duration-200 active:scale-90 ${
            activeTab === 'centers' && !isSavedTab
              ? 'bg-[#0a4c9a] text-white shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Stethoscope className="w-4.5 h-4.5" />
          <span className="text-[10.5px] mt-0.5 tracking-tight">مراکز</span>
        </button>

        {/* 2. قطب‌های خیابانی (Street Filter) */}
        <button
          type="button"
          onClick={onOpenStreetFilter}
          className={`flex flex-col items-center justify-center h-full rounded-2xl transition-all duration-200 active:scale-90 relative ${
            selectedStreet
              ? 'bg-orange-50 text-[#F15A31] font-bold border border-orange-200/80'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
          title="فیلتر خیابان‌های ارومیه"
        >
          <div className="relative">
            <MapPin className={`w-4.5 h-4.5 ${selectedStreet ? 'text-[#F15A31]' : ''}`} />
            {selectedStreet && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F15A31] animate-ping" />
            )}
          </div>
          <span className="text-[10.5px] mt-0.5 max-w-[70px] truncate tracking-tight">
            {selectedStreet ? selectedStreet : 'خیابان‌ها'}
          </span>
        </button>

        {/* 3. شبانه‌روزی (Moon Toggle) */}
        <button
          type="button"
          onClick={onToggleNightShift}
          className={`flex flex-col items-center justify-center h-full rounded-2xl transition-all duration-200 active:scale-90 ${
            onlyNightShift
              ? 'bg-amber-500 text-white shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
          title="فقط مراکز شبانه‌روزی"
        >
          <Moon
            className={`w-4.5 h-4.5 transition-transform ${
              onlyNightShift ? 'fill-white text-white scale-110' : ''
            }`}
          />
          <span className="text-[10.5px] mt-0.5 tracking-tight">شبانه‌روزی</span>
        </button>

        {/* 4. راهنما و خسارت (Guide / Claims) */}
        <button
          type="button"
          onClick={() => onTabChange('guide')}
          className={`flex flex-col items-center justify-center h-full rounded-2xl transition-all duration-200 active:scale-90 ${
            activeTab === 'guide'
              ? 'bg-[#0a4c9a] text-white shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <FileText className="w-4.5 h-4.5" />
          <span className="text-[10.5px] mt-0.5 tracking-tight">راهنما</span>
        </button>
      </div>
    </nav>
  );
};
