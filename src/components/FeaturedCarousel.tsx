import React, { useRef, useMemo, useState, useEffect } from 'react';
import { MedicalCenter } from '../data/centers';
import { MapPin, Phone, Navigation, Moon, ShieldCheck, ArrowLeft } from 'lucide-react';
import { formatCenterName } from '../utils/persian';
import { getCategoryMeta } from '../constants/categories';

interface FeaturedCarouselProps {
  centers: MedicalCenter[];
  onOpenDetail: (center: MedicalCenter) => void;
  onCallCenter: (phone: string, e: React.MouseEvent) => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  centers,
  onOpenDetail,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);
  const [isGrabbing, setIsGrabbing] = useState<boolean>(false);

  // Dynamic selection of 10 diverse centers across categories for rich browsing
  const featured = useMemo(() => {
    if (!centers || centers.length === 0) return [];

    const categoryMap = new Map<string, MedicalCenter[]>();
    for (const c of centers) {
      const type = c.type || 'سایر';
      if (!categoryMap.has(type)) categoryMap.set(type, []);
      categoryMap.get(type)!.push(c);
    }

    const selected: MedicalCenter[] = [];
    const addedKeys = new Set<number>();

    // Pass 1: Pick 1 from each major category
    const categories = Array.from(categoryMap.keys()).sort(() => Math.random() - 0.5);
    for (const cat of categories) {
      const list = categoryMap.get(cat)!.filter((c) => !addedKeys.has(c.k));
      if (list.length > 0) {
        const picked = list[Math.floor(Math.random() * list.length)];
        selected.push(picked);
        addedKeys.add(picked.k);
      }
    }

    // Pass 2: Fill up to 10 centers
    if (selected.length < 10) {
      const remaining = centers
        .filter((c) => !addedKeys.has(c.k))
        .sort(() => Math.random() - 0.5);

      for (const c of remaining) {
        selected.push(c);
        addedKeys.add(c.k);
        if (selected.length >= 10) break;
      }
    }

    return selected.slice(0, 10);
  }, [centers]);

  // Desktop Mouse Drag / Pan to Scroll with persistent grabbing hand cursor
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !containerRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX;
    scrollLeftRef.current = containerRef.current.scrollLeft;
    setIsGrabbing(true);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const walk = e.pageX - startXRef.current;
      if (Math.abs(walk) > 4) {
        hasMovedRef.current = true;
      }
      containerRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsGrabbing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  if (featured.length === 0) return null;

  return (
    <section className="space-y-2 pt-1 select-none">
      {/* Header Row: Strict 3-color styling (Navy, Orange, Slate) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0a4c9a]" />
          <h3 className="text-xs font-black text-slate-900">
            گزیده مراکز درمانی ارومیه
          </h3>
          <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.2 rounded-md">
            ۱۰ مرکز برگزیده
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Swipe / Drag hint */}
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <span className="sm:hidden">ورق بزنید</span>
            <span className="hidden sm:inline">برای مشاهده با ماوس بکشید</span>
            <ArrowLeft className="w-3 h-3 text-slate-400" />
          </span>
        </div>
      </div>

      {/* Horizontal Carousel: Manual drag/pan browsing with grab cursor */}
      <div className="relative">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          style={{
            touchAction: 'pan-x pan-y',
            overscrollBehaviorX: 'contain',
            overscrollBehaviorY: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: isGrabbing ? 'grabbing' : 'grab',
            userSelect: isGrabbing ? 'none' : 'auto',
          }}
          className={`flex gap-2.5 overflow-x-auto pb-2 pt-0.5 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 ${
            isGrabbing ? 'cursor-grabbing [&_*]:cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {featured.map((center) => {
            const mapUrl =
              (center.googleMapUrl && (center.googleMapUrl.includes('goo.gl') || center.googleMapUrl.includes('/place/')))
                ? center.googleMapUrl
                : center.lat && center.lng && center.lat > 30 && center.lng > 40
                ? `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`
                : center.googleMapUrl || '';

            const streetSummary =
              center.streets && center.streets.length > 0
                ? `خیابان ${center.streets.join(' · ')}`
                : center.address.length > 30
                ? center.address.substring(0, 28) + '...'
                : center.address;

            const meta = getCategoryMeta(center.type);

            return (
              <article
                key={center.k}
                onClick={() => {
                  if (hasMovedRef.current) return;
                  onOpenDetail(center);
                }}
                className="shrink-0 w-[235px] sm:w-[245px] bg-white rounded-2xl border border-slate-200/90 hover:border-[#0a4c9a]/60 p-3 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className={`font-bold ${meta.bg} ${meta.text} border ${meta.borderColor} px-2 py-0.5 rounded-lg shadow-2xs`}>
                      {center.type}
                    </span>

                    {center.isNightShift ? (
                      <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-50 border border-amber-200/90 font-bold px-1.5 py-0.2 rounded-md shadow-2xs">
                        <Moon className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                        <span>۲۴ ساعته</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-slate-500 font-medium">
                        <ShieldCheck className="w-3 h-3 text-[#0a4c9a]" />
                        <span>طرف قرارداد</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-black text-slate-900 group-hover:text-[#0a4c9a] transition leading-snug line-clamp-2 min-h-[32px]">
                    {formatCenterName(center.name)}
                  </h4>

                  <div className="flex items-center gap-1 text-[10.5px] text-slate-600 bg-slate-50 rounded-lg px-2 py-1 border border-slate-100">
                    <MapPin className="w-3 h-3 text-[#0a4c9a] shrink-0" />
                    <span className="font-medium truncate">{streetSummary}</span>
                  </div>
                </div>

                <div
                  className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {center.phone && (
                    <a
                      href={`tel:${center.phone}`}
                      className="flex-1 h-7.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] flex items-center justify-center gap-1 transition active:scale-95 shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>تماس</span>
                    </a>
                  )}

                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px] flex items-center justify-center gap-1 transition active:scale-95"
                      title="مسیریابی روی نقشه"
                    >
                      <Navigation className="w-3 h-3 text-[#0a4c9a]" />
                      <span>نقشه</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
