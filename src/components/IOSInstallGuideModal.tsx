import React from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

interface IOSInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuideModal: React.FC<IOSInstallGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl z-10 p-5 space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            راهنمای نصب بر روی آیفون / آیپد
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50">
            <span className="w-6 h-6 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center font-bold text-xs shrink-0">
              ۱
            </span>
            <div className="flex-1">
              <span className="block font-bold text-slate-900">
                در نوار پایین مرورگر سافاری روی دکمه اشتراک‌گذاری (Share) بزنید:
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-slate-500 font-medium">
                <Share className="w-4 h-4 text-blue-600" />
                <span>آیکون مربع با فلش رو به بالا</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50">
            <span className="w-6 h-6 rounded-full bg-[#0a4c9a] text-white flex items-center justify-center font-bold text-xs shrink-0">
              ۲
            </span>
            <div className="flex-1">
              <span className="block font-bold text-slate-900">
                منو را به پایین اسکرول کرده و گزینه زیر را انتخاب کنید:
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-slate-800 font-bold">
                <PlusSquare className="w-4 h-4 text-slate-900" />
                <span>Add to Home Screen (افزودن به صفحه اصلی)</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-bold text-xs transition"
        >
          متوجه شدم
        </button>
      </div>
    </div>
  );
};
