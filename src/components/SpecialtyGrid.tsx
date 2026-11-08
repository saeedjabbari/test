import React from 'react';
import {
  Stethoscope,
  Activity,
  Pill,
  Baby,
  Scan,
  Building2,
  HeartPulse,
  Sparkles,
  Eye,
  ChevronLeft,
} from 'lucide-react';

interface SpecialtyGridProps {
  selectedType: string;
  onSelectType: (type: string) => void;
  typeCounts?: Record<string, number>;
  onOpenAllCategories?: () => void;
}

interface SpecialtyItem {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  iconGradient: string;
  iconShadow: string;
  iconColor: string;
  badgeBg: string;
  hoverBorder: string;
}

export const SPECIALTIES: SpecialtyItem[] = [
  {
    id: 'دندانپزشکی',
    name: 'دندانپزشکی',
    shortName: 'دندانپزشکی',
    icon: Sparkles,
    iconGradient: 'from-teal-400 to-teal-600',
    iconShadow: 'shadow-teal-500/25',
    iconColor: 'text-teal-600',
    badgeBg: 'bg-teal-50/80',
    hoverBorder: 'hover:border-teal-300',
  },
  {
    id: 'داروخانه',
    name: 'داروخانه‌ها',
    shortName: 'داروخانه',
    icon: Pill,
    iconGradient: 'from-emerald-400 to-emerald-600',
    iconShadow: 'shadow-emerald-500/25',
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50/80',
    hoverBorder: 'hover:border-emerald-300',
  },
  {
    id: 'آزمایشگاه',
    name: 'آزمایشگاه و پاتولوژی',
    shortName: 'آزمایشگاه',
    icon: Activity,
    iconGradient: 'from-indigo-400 to-indigo-600',
    iconShadow: 'shadow-indigo-500/25',
    iconColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50/80',
    hoverBorder: 'hover:border-indigo-300',
  },
  {
    id: 'تصویربرداری',
    name: 'تصویربرداری و MRI',
    shortName: 'تصویربرداری',
    icon: Scan,
    iconGradient: 'from-sky-400 to-blue-600',
    iconShadow: 'shadow-sky-500/25',
    iconColor: 'text-sky-600',
    badgeBg: 'bg-sky-50/80',
    hoverBorder: 'hover:border-sky-300',
  },
  {
    id: 'متخصص کودکان و اطفال',
    name: 'کودکان و نوزادان',
    shortName: 'کودکان',
    icon: Baby,
    iconGradient: 'from-rose-400 to-rose-600',
    iconShadow: 'shadow-rose-500/25',
    iconColor: 'text-rose-500',
    badgeBg: 'bg-rose-50/80',
    hoverBorder: 'hover:border-rose-300',
  },
  {
    id: 'چشم پزشکی',
    name: 'چشم‌پزشکی و بینایی‌سنجی',
    shortName: 'چشم‌پزشکی',
    icon: Eye,
    iconGradient: 'from-amber-400 to-orange-500',
    iconShadow: 'shadow-amber-500/25',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-50/80',
    hoverBorder: 'hover:border-amber-300',
  },
  {
    id: 'فیزیوتراپی',
    name: 'فیزیوتراپی و توانبخشی',
    shortName: 'فیزیوتراپی',
    icon: HeartPulse,
    iconGradient: 'from-purple-400 to-purple-600',
    iconShadow: 'shadow-purple-500/25',
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-50/80',
    hoverBorder: 'hover:border-purple-300',
  },
  {
    id: 'درمانگاه',
    name: 'کلینیک و درمانگاه',
    shortName: 'درمانگاه',
    icon: Stethoscope,
    iconGradient: 'from-blue-500 to-[#0a4c9a]',
    iconShadow: 'shadow-blue-500/25',
    iconColor: 'text-blue-700',
    badgeBg: 'bg-blue-50/80',
    hoverBorder: 'hover:border-blue-300',
  },
];

export const SpecialtyGrid: React.FC<SpecialtyGridProps> = ({
  selectedType,
  onSelectType,
  onOpenAllCategories,
}) => {
  return (
    <section className="space-y-3 pt-2">
      {/* Header matching Snapp Doctor section headers */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F15A31] shadow-xs" />
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            دسته‌بندی و تخصص‌های پزشکی
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {selectedType && (
            <button
              type="button"
              onClick={() => onSelectType('')}
              className="text-xs font-bold text-[#F15A31] hover:underline px-2 py-1"
            >
              پاک کردن فیلتر
            </button>
          )}
          {onOpenAllCategories && (
            <button
              type="button"
              onClick={onOpenAllCategories}
              className="text-xs font-bold text-[#0a4c9a] hover:text-blue-900 flex items-center gap-1 group bg-blue-50/90 hover:bg-blue-100/90 px-3 py-1.5 rounded-xl border border-blue-200/80 transition shadow-2xs"
            >
              <span>مشاهده همه تخصص‌ها</span>
              <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid: Enlarged, spacious cards on desktop (Snapp Doctor Style) */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3.5 md:gap-4">
        {SPECIALTIES.map((spec) => {
          const isSelected = selectedType === spec.id;
          const Icon = spec.icon;
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => onSelectType(isSelected ? '' : spec.id)}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 md:p-4.5 rounded-2xl sm:rounded-3xl border transition-all duration-200 group active:scale-95 ${
                isSelected
                  ? 'bg-[#0a4c9a] text-white border-[#0a4c9a] shadow-md shadow-blue-950/20 scale-[1.03] ring-2 ring-blue-300'
                  : `bg-white hover:bg-slate-50/90 border-slate-200/90 ${spec.hoverBorder} text-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-1`
              }`}
              style={isSelected ? { backgroundColor: '#0a4c9a', color: '#ffffff' } : undefined}
            >
              {/* Large Circular 3D Icon Badge */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-2 sm:mb-2.5 transition-all duration-200 group-hover:scale-108 ${
                  isSelected
                    ? 'bg-white/20 text-white shadow-inner'
                    : `bg-[#0a4c9a] text-white shadow-md ${spec.iconShadow}`
                }`}
                style={
                  !isSelected
                    ? {
                        background:
                          spec.id === 'دندانپزشکی'
                            ? 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)'
                            : spec.id === 'داروخانه'
                            ? 'linear-gradient(135deg, #34d399 0%, #059669 100%)'
                            : spec.id === 'آزمایشگاه'
                            ? 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)'
                            : spec.id === 'تصویربرداری'
                            ? 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)'
                            : spec.id === 'متخصص کودکان و اطفال'
                            ? 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)'
                            : spec.id === 'چشم پزشکی'
                            ? 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)'
                            : spec.id === 'فیزیوتراپی'
                            ? 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #0a4c9a 100%)',
                      }
                    : undefined
                }
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              </div>

              {/* Title & Label */}
              <span
                className={`text-[11px] sm:text-xs md:text-sm font-extrabold tracking-tight text-center leading-tight line-clamp-1 transition-colors ${
                  isSelected ? 'text-white' : 'text-slate-800 group-hover:text-[#0a4c9a]'
                }`}
              >
                {spec.shortName}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
