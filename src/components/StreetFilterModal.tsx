import React from 'react';
import { X, MapPin } from 'lucide-react';
import { StreetPinterestBoard } from './StreetPinterestBoard';
import { toFa } from '../utils/persian';

interface StreetFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStreet: string;
  onSelectStreet: (street: string) => void;
  streetCounts: Record<string, number>;
  totalCenters: number;
}

export const StreetFilterModal: React.FC<StreetFilterModalProps> = ({
  isOpen,
  onClose,
  selectedStreet,
  onSelectStreet,
  streetCounts,
  totalCenters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-label="بستن پنجره با لمس پس‌زمینه"
      />

      {/* Modal Dialog (Harmonized with CategoryFilterModal) */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl z-10 border border-slate-200 overflow-hidden mx-auto my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header - Identical gradient & typography to Category modal */}
        <div
          className="px-4 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#f8fafc' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl bg-[#F15A31] text-white flex items-center justify-center shrink-0 shadow-xs"
              style={{ backgroundColor: '#F15A31' }}
            >
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                خیابان‌ها و قطب‌های درمانی
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                انتخاب خیابان یا محدوده برای مشاهده مراکز همان منطقه
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 font-black text-xs flex items-center gap-1 transition active:scale-95"
            aria-label="بستن"
          >
            <span>بستن</span>
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-3 sm:p-4 bg-[#f8fafc] overflow-y-auto flex-1">
          <StreetPinterestBoard
            selectedStreet={selectedStreet}
            onSelectStreet={onSelectStreet}
            streetCounts={streetCounts}
            totalCenters={totalCenters}
            searchQuery=""
            onClose={onClose}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-200/80 flex items-center justify-between gap-2.5 shrink-0">
          <div className="min-w-0 flex items-center gap-1.5 text-xs">
            {selectedStreet ? (
              <span className="text-slate-600 truncate text-[11.5px]">
                فیلتر فعال: <strong className="text-[#0a4c9a]">خیابان {selectedStreet}</strong>{' '}
                <span className="tabular-nums">({toFa(streetCounts[selectedStreet] || 0)} مرکز)</span>
              </span>
            ) : (
              <span className="text-slate-500 text-[11.5px]">تمام خیابان‌ها در حال نمایش هستند</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedStreet && (
              <button
                type="button"
                onClick={() => {
                  onSelectStreet('');
                  onClose();
                }}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition active:scale-95"
              >
                حذف فیلتر
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3.5 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white text-xs font-bold transition shadow-xs active:scale-95"
            >
              مشاهده مراکز
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreetFilterModal;
