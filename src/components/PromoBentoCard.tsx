import React from 'react';
import { ArrowLeft, Sparkles, FileText, ShieldCheck } from 'lucide-react';

interface PromoBentoCardProps {
  onOpenGuide: () => void;
}

export const PromoBentoCard: React.FC<PromoBentoCardProps> = ({ onOpenGuide }) => {
  return (
    <aside
      onClick={onOpenGuide}
      className="bg-[#0a4c9a] text-white rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden group border border-blue-900/40"
      style={{ background: 'linear-gradient(90deg, #0a4c9a 0%, #105db8 50%, #1e40af 100%)' }}
    >
      {/* Decorative ambient background rings */}
      <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full pointer-events-none opacity-10" style={{ backgroundColor: '#ffffff' }} />
      <div className="absolute right-12 -top-6 w-20 h-20 rounded-full pointer-events-none opacity-10" style={{ backgroundColor: '#ffffff' }} />

      <div className="flex items-center gap-3 min-w-0 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 text-amber-300 shadow-2xs">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] bg-[#F15A31] text-white font-black px-2 py-0.5 rounded-lg shrink-0 shadow-2xs">
              راهنمای آنلاین
            </span>
            <span className="text-[11px] text-white font-bold bg-white/15 px-2 py-0.5 rounded-md border border-white/20">
              بدون مراجعه حضوری
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-white truncate">
            نحوه دریافت آنلاین خسارت درمان تکمیلی
          </h4>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1 text-xs font-bold bg-white text-[#0a4c9a] group-hover:bg-blue-50 py-1.5 px-3 rounded-xl shadow-xs transition active:scale-95 relative z-10 border border-white">
        <span>مشاهده</span>
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
      </div>
    </aside>
  );
};
