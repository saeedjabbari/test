import React, { useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Clock,
  MapPin,
  Building2,
  X,
  ArrowUpLeft,
  Sparkles,
} from 'lucide-react';
import { MedicalCenter } from '../data/centers';
import { toFa, norm, squash } from '../utils/persian';

export const RECENT_SEARCHES_KEY = 'krf_recent_user_searches';

interface SearchSuggestionsProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (term: string, center?: MedicalCenter) => void;
  onFillQuery: (term: string) => void;
  allCenters: MedicalCenter[];
  onSelectCategory?: (category: string) => void;
  onSelectStreet?: (street: string) => void;
}

interface SuggestionItem {
  id: string;
  term: string;
  subtitle?: string;
  tag?: string;
  center?: MedicalCenter;
  category?: string;
  street?: string;
  kind: 'center' | 'category' | 'street' | 'recent' | 'popular';
}

// Helper to highlight matching substring safely
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim()) {
    return <span>{text}</span>;
  }

  const q = norm(query.trim());
  const normalizedText = norm(text);
  const index = normalizedText.indexOf(q);

  if (index === -1) {
    return <span>{text}</span>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const after = text.slice(index + q.length);

  return (
    <span>
      {before}
      <strong className="text-[#0a4c9a] font-black underline decoration-blue-300 decoration-2 underline-offset-2">
        {match}
      </strong>
      {after}
    </span>
  );
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  isOpen,
  onClose,
  onSelectSuggestion,
  onFillQuery,
  allCenters,
  onSelectCategory,
  onSelectStreet,
}) => {
  // Counter to automatically rotate suggestions on each keystroke
  const cycleCountRef = useRef(0);
  const prevQueryRef = useRef(query);

  useEffect(() => {
    if (query !== prevQueryRef.current) {
      cycleCountRef.current = (cycleCountRef.current + 1) % 50;
      prevQueryRef.current = query;
    }
  }, [query]);

  // Recent searches from localStorage
  const recentSearches = useMemo<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [isOpen]);

  const normalizedQuery = useMemo(() => norm(query.trim()), [query]);

  // Dynamically extract genuine popular categories and streets strictly from database
  const dynamicPopularPool = useMemo<SuggestionItem[]>(() => {
    if (!allCenters || allCenters.length === 0) return [];

    const items: SuggestionItem[] = [];
    const typeCountMap: Record<string, number> = {};
    const streetCountMap: Record<string, number> = {};

    allCenters.forEach((c) => {
      if (c.type) {
        typeCountMap[c.type] = (typeCountMap[c.type] || 0) + 1;
      }
      c.streets?.forEach((s) => {
        if (s) {
          streetCountMap[s] = (streetCountMap[s] || 0) + 1;
        }
      });
    });

    // Real categories sorted by count
    const sortedTypes = Object.entries(typeCountMap)
      .sort((a, b) => b[1] - a[1]);

    sortedTypes.forEach(([type, count]) => {
      items.push({
        id: `pop-type-${type}`,
        term: type,
        subtitle: `${toFa(count)} مرکز طرف قرارداد در ارومیه`,
        tag: 'دسته‌بندی',
        category: type,
        kind: 'category',
      });
    });

    // Real streets with highest center density
    const sortedStreets = Object.entries(streetCountMap)
      .sort((a, b) => b[1] - a[1]);

    sortedStreets.forEach(([st, count]) => {
      items.push({
        id: `pop-st-${st}`,
        term: `خیابان ${st}`,
        subtitle: `${toFa(count)} مرکز در این خیابان`,
        tag: 'محدوده شهری',
        street: st,
        kind: 'street',
      });
    });

    return items;
  }, [allCenters]);

  // Matching results pool when query is typed (searching across all center fields)
  const queryMatchesPool = useMemo<SuggestionItem[]>(() => {
    if (!normalizedQuery) return [];
    const qSquashed = squash(normalizedQuery);
    const results: SuggestionItem[] = [];
    const seenNames = new Set<string>();

    // 1. Matching categories (strictly real)
    dynamicPopularPool
      .filter((item) => item.kind === 'category' && norm(item.term).includes(normalizedQuery))
      .forEach((item) => {
        if (!seenNames.has(item.term)) {
          seenNames.add(item.term);
          results.push(item);
        }
      });

    // 2. Matching streets (strictly real)
    const matchingStreetNames = new Set<string>();
    allCenters.forEach((c) => {
      c.streets?.forEach((s) => {
        if (norm(s).includes(normalizedQuery)) {
          matchingStreetNames.add(s);
        }
      });
    });
    matchingStreetNames.forEach((s) => {
      const label = `خیابان ${s}`;
      if (!seenNames.has(label)) {
        seenNames.add(label);
        results.push({
          id: `match-st-${s}`,
          term: label,
          subtitle: 'محدوده و آدرس مراکز',
          tag: 'خیابان',
          street: s,
          kind: 'street',
        });
      }
    });

    // 3. Matching centers (name, specialty, address, phone, alt) - strictly unique centers!
    for (const center of allCenters) {
      // Avoid duplicate centers
      const normalizedCenterName = norm(center.name);
      if (seenNames.has(normalizedCenterName)) continue;

      const nameNorm = norm(center.name);
      const nameSquashed = squash(center.name);
      const specNorm = norm(center.specialty || '');
      const addrNorm = norm(center.address || '');
      const streetNorm = norm((center.streets || []).join(' '));
      const phoneClean = (center.phone || '').replace(/[- \s]/g, '');

      if (
        nameNorm.includes(normalizedQuery) ||
        nameSquashed.includes(qSquashed) ||
        specNorm.includes(normalizedQuery) ||
        addrNorm.includes(normalizedQuery) ||
        streetNorm.includes(normalizedQuery) ||
        phoneClean.includes(normalizedQuery)
      ) {
        seenNames.add(normalizedCenterName);
        results.push({
          id: `match-center-${center.k}`,
          term: center.name,
          subtitle: `${center.type} ${center.streets?.[0] ? '• ' + center.streets[0] : ''}`,
          tag: center.type,
          center,
          kind: 'center',
        });
      }
    }

    return results;
  }, [allCenters, dynamicPopularPool, normalizedQuery]);

  if (!isOpen) return null;

  const hasQuery = Boolean(normalizedQuery);

  // Pool of candidate items
  let candidatePool: SuggestionItem[] = [];
  if (hasQuery) {
    candidatePool = queryMatchesPool;
  } else if (recentSearches.length > 0) {
    candidatePool = recentSearches.map((term, idx) => ({
      id: `recent-${idx}-${term}`,
      term,
      subtitle: 'جستجوی اخیر شما',
      tag: 'تاریخچه',
      kind: 'recent',
    }));
  } else {
    candidatePool = dynamicPopularPool;
  }

  // Pick exactly up to 3 non-repeating items cyclically based on keystroke counter
  const MAX_DISPLAY = 3;
  const poolLen = candidatePool.length;
  const displayedItems: SuggestionItem[] = [];

  if (poolLen > 0) {
    // Offset shifts automatically on each keystroke
    const startOffset = poolLen > MAX_DISPLAY ? cycleCountRef.current % poolLen : 0;
    const pickedIds = new Set<string>();

    for (let i = 0; i < poolLen && displayedItems.length < MAX_DISPLAY; i++) {
      const idx = (startOffset + i) % poolLen;
      const candidate = candidatePool[idx];
      if (!pickedIds.has(candidate.term)) {
        pickedIds.add(candidate.term);
        displayedItems.push(candidate);
      }
    }
  }

  const handleClickItem = (item: SuggestionItem) => {
    if (item.kind === 'category' && item.category && onSelectCategory) {
      onSelectCategory(item.category);
      onClose();
      return;
    }
    if (item.kind === 'street' && item.street && onSelectStreet) {
      onSelectStreet(item.street);
      onClose();
      return;
    }
    // Filter list to show card below, do NOT open modal
    onSelectSuggestion(item.term, item.center);
    onClose();
  };

  return (
    <div
      onMouseDown={(e) => e.preventDefault()} // Keeps input focus
      className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden text-slate-800 text-xs animate-in fade-in slide-in-from-top-1 duration-100"
    >
      {/* Suggestions List - Strictly NO scrollbar */}
      <div className="divide-y divide-slate-100 overflow-hidden">
        {displayedItems.length > 0 ? (
          displayedItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => handleClickItem(item)}
              className="flex items-center justify-between px-3.5 py-2.5 hover:bg-blue-50/70 cursor-pointer transition active:bg-blue-100/60 group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#0a4c9a] text-slate-600 group-hover:text-white flex items-center justify-center shrink-0 transition">
                  {item.kind === 'street' ? (
                    <MapPin className="w-3.5 h-3.5" />
                  ) : item.kind === 'category' ? (
                    <Sparkles className="w-3.5 h-3.5" />
                  ) : item.kind === 'recent' ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    <HighlightedText text={item.term} query={query} />
                  </div>
                  {item.subtitle && (
                    <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Pill / Tag */}
              <div className="flex items-center gap-1 shrink-0 mr-2">
                {item.tag && (
                  <span className="text-[9.5px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                    {item.tag}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFillQuery(item.term);
                  }}
                  className="p-1 text-slate-400 hover:text-[#0a4c9a] hover:bg-blue-50 rounded-md transition"
                  title="درج در کادر جستجو"
                >
                  <ArrowUpLeft className="w-3.5 h-3.5 rotate-90" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-center text-slate-500 text-xs font-medium">
            موردی مطابق با «{query}» در مراکز یافت نشد
          </div>
        )}
      </div>
    </div>
  );
};
