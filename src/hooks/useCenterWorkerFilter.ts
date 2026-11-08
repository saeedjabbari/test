import { useState, useEffect, useRef, useMemo } from 'react';
import { MEDICAL_CENTERS, MedicalCenter } from '../data/centers';
import { FilterWorkerRequest, FilterWorkerResponse } from '../workers/filterWorker';
import { norm, squash } from '../utils/persian';

interface UseCenterWorkerFilterOptions {
  centers?: MedicalCenter[];
  query: string;
  selectedType: string;
  selectedStreet: string;
  onlyNightShift: boolean;
  saved: Set<number>;
  activeTab: 'centers' | 'saved' | 'guide';
}

// Synchronous fallback filter if Web Workers are unavailable or while initializing
function fallbackFilter(
  centers: MedicalCenter[],
  query: string,
  selectedType: string,
  selectedStreet: string,
  onlyNightShift: boolean,
  saved: Set<number>,
  activeTab: string
): MedicalCenter[] {
  const nq = norm(query);
  const tokens = nq ? nq.split(' ').filter(Boolean) : [];
  const results: { center: MedicalCenter; score: number }[] = [];

  for (const r of centers) {
    if (activeTab === 'saved' && !saved.has(r.k)) continue;
    if (selectedType) {
      const isTypeMatch =
        r.type === selectedType ||
        (selectedType === 'بیمارستان' && r.type.includes('بیمارستان')) ||
        (selectedType.includes('عینک') && r.type.includes('عینک')) ||
        (selectedType.includes('کودک') && (r.type.includes('کودک') || (r.specialty && r.specialty.includes('کودک'))));
      if (!isTypeMatch) continue;
    }
    if (selectedStreet && !r.streets.includes(selectedStreet)) continue;
    if (onlyNightShift && !r.isNightShift) continue;

    let score = 0;
    let matched = true;

    if (tokens.length > 0) {
      const nameNorm = norm(r.name);
      const typeNorm = norm(r.type);
      const specNorm = norm(r.specialty || '');
      const addrNorm = norm(r.address || '');
      const streetsNorm = (r.streets || []).map((s) => norm(s));
      const altNorm = (r.alt || []).map((a) => norm(a));
      const ph = [r.phone, r.id, ...(r.alt || [])].filter(Boolean).join(' ');

      const fullText = [
        nameNorm,
        typeNorm,
        specNorm,
        addrNorm,
        ...streetsNorm,
        ...altNorm,
      ]
        .filter(Boolean)
        .join(' ');

      const compoundFields = [nameNorm, typeNorm, specNorm, ...streetsNorm].map((f) => squash(f));
      const words = fullText.split(' ');

      for (const token of tokens) {
        if (/^\d{3,}$/.test(token)) {
          if (ph.includes(token)) {
            score += 4;
          } else {
            matched = false;
            break;
          }
        } else {
          const inFull = fullText.includes(token);
          const inCompound = token.length >= 3 && compoundFields.some((cf) => cf.includes(squash(token)));

          if (inFull || inCompound) {
            if (nameNorm.includes(token)) {
              score += 8;
            } else if (specNorm.includes(token)) {
              score += 5;
            } else if (streetsNorm.some((s) => s.includes(token))) {
              score += 4;
            } else if (words.some((w) => w.startsWith(token))) {
              score += 3;
            } else {
              score += 2;
            }
          } else {
            matched = false;
            break;
          }
        }
      }
    }

    if (matched) {
      results.push({ center: r, score });
    }
  }

  if (tokens.length > 0) {
    results.sort(
      (a, b) => b.score - a.score || a.center.name.localeCompare(b.center.name, 'fa')
    );
  }

  return results.map((x) => x.center);
}

export function useCenterWorkerFilter({
  centers = MEDICAL_CENTERS,
  query,
  selectedType,
  selectedStreet,
  onlyNightShift,
  saved,
  activeTab,
}: UseCenterWorkerFilterOptions) {
  // Initial state calculated once synchronously for instantaneous zero-delay first paint
  const [filteredCenters, setFilteredCenters] = useState<MedicalCenter[]>(() =>
    fallbackFilter(
      centers,
      query,
      selectedType,
      selectedStreet,
      onlyNightShift,
      saved,
      activeTab
    )
  );

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  // Initialize Web Worker once
  useEffect(() => {
    // Only use worker if no extra custom centers were dynamically added
    if (typeof Worker !== 'undefined' && centers === MEDICAL_CENTERS) {
      try {
        const worker = new Worker(
          new URL('../workers/filterWorker.ts', import.meta.url),
          { type: 'module' }
        );

        worker.onmessage = (event: MessageEvent<FilterWorkerResponse>) => {
          const { id, results } = event.data;
          // Discard out-of-order or stale worker responses
          if (id === requestIdRef.current) {
            setFilteredCenters(results);
          }
        };

        workerRef.current = worker;

        return () => {
          worker.terminate();
          workerRef.current = null;
        };
      } catch (err) {
        console.warn('Worker initialization note, using main thread fallback:', err);
      }
    }
  }, [centers]);

  const savedArray = useMemo(() => Array.from(saved), [saved]);

  // Dispatch filter request to worker on every parameter change
  useEffect(() => {
    const nextId = ++requestIdRef.current;

    if (workerRef.current && centers === MEDICAL_CENTERS) {
      const message: FilterWorkerRequest = {
        id: nextId,
        query,
        selectedType,
        selectedStreet,
        onlyNightShift,
        savedIds: savedArray,
        activeTab,
      };
      workerRef.current.postMessage(message);
    } else {
      // Main-thread fallback for fast synchronous filtering (under 0.2ms)
      const syncResults = fallbackFilter(
        centers,
        query,
        selectedType,
        selectedStreet,
        onlyNightShift,
        saved,
        activeTab
      );
      setFilteredCenters(syncResults);
    }
  }, [centers, query, selectedType, selectedStreet, onlyNightShift, savedArray, activeTab, saved]);

  return filteredCenters;
}
