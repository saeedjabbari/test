import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { toFa } from '../utils/persian';
import { CATEGORY_ITEMS } from '../constants/categories';

interface CategoryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: string;
  onSelectType: (type: string) => void;
  typeCounts: Record<string, number>;
  totalCenters: number;
}

export const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  isOpen,
  onClose,
  selectedType,
  onSelectType,
  typeCounts,
  totalCenters,
}) => {
  if (!isOpen) return null;

  const handleSelect = (categoryKey: string) => {
    if (selectedType === categoryKey && categoryKey !== '') {
      onSelectType('');
    } else {
      onSelectType(categoryKey);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-label="بستن پنجره با لمس پس‌زمینه"
      />

      {/* Modal Dialog (Fits completely on screen without scrolling) */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl z-10 border border-slate-200 overflow-hidden mx-auto my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className="px-4 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#f8fafc' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl bg-[#0a4c9a] text-white flex items-center justify-center shrink-0 shadow-xs"
              style={{ backgroundColor: '#0a4c9a' }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                نوع مرکز درمانی
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                انتخاب نوع مرکز درمانی طرف قرارداد (بیمارستان، درمانگاه، داروخانه و...)
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

        {/* Pinterest/Bento Grid without scrolling */}
        <div className="p-3 sm:p-4 bg-[#f8fafc]">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5">
            {CATEGORY_ITEMS.map((item) => {
              const isSelected = item.key === '' ? selectedType === '' : selectedType === item.key;
              const count = item.key === '' ? totalCenters : typeCounts[item.key] || 0;
              const IconComp = item.icon;

              return (
                <button
                  key={item.key || 'all'}
                  type="button"
                  onClick={() => handleSelect(item.key)}
                  className={`p-2 sm:p-2.5 rounded-2xl flex flex-col justify-between transition-all duration-150 active:scale-95 select-none text-right border ${
                    isSelected
                      ? `bg-gradient-to-br ${item.gradient} text-white shadow-md ring-2 ring-black/20 border-transparent`
                      : `${item.bgLight} border ${item.borderLight} ${item.textCol} hover:shadow-2xs`
                  }`}
                >
                  {/* Top Bar: Icon + Count */}
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : item.iconBg
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-[10px] tabular-nums font-black px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-white/25 text-white' : item.badgeBg
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{toFa(count)}
                    </span>
                  </div>

                  {/* Category Title Only */}
                  <span className="text-[11px] sm:text-xs font-black truncate w-full tracking-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
