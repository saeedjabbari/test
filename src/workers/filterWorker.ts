import { MEDICAL_CENTERS, MedicalCenter } from '../data/centers';
import { norm, squash } from '../utils/persian';

export interface FilterWorkerRequest {
  id: number;
  query: string;
  selectedType: string;
  selectedStreet: string;
  onlyNightShift: boolean;
  savedIds: number[];
  activeTab: 'centers' | 'saved' | 'guide';
}

export interface FilterWorkerResponse {
  id: number;
  results: MedicalCenter[];
}

// Fisher-Yates shuffle
function shuffleCenters(centers: MedicalCenter[]): MedicalCenter[] {
  const shuffled = [...centers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Pre-index items once inside the worker thread
const initialRandomized = shuffleCenters(MEDICAL_CENTERS);

const indexedItems = initialRandomized.map((r) => {
  const nameNorm = norm(r.name);
  const typeNorm = norm(r.type);
  const specNorm = norm(r.specialty || '');
  const addrNorm = norm(r.address || '');
  const streetsNorm = (r.streets || []).map((s) => norm(s));
  const altNorm = (r.alt || []).map((a) => norm(a));
  const phones = [r.phone, r.id, ...(r.alt || [])].filter(Boolean).join(' ');

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

  // Compound fields: strictly within name, specialty, type, and streets (NEVER across entire multi-word address!)
  const compoundFields = [nameNorm, typeNorm, specNorm, ...streetsNorm].map((f) => squash(f));

  return {
    r,
    fullText,
    words: fullText.split(' '),
    ph: phones,
    nameNorm,
    specNorm,
    streetsNorm,
    compoundFields,
  };
});

self.onmessage = (event: MessageEvent<FilterWorkerRequest>) => {
  const { id, query, selectedType, selectedStreet, onlyNightShift, savedIds = [], activeTab } = event.data;

  const savedSet = new Set(savedIds);
  const nq = norm(query);
  const tokens = nq ? nq.split(' ').filter(Boolean) : [];
  const results: { center: MedicalCenter; score: number }[] = [];

  for (const item of indexedItems) {
    const { r, fullText, words, ph, nameNorm, specNorm, streetsNorm, compoundFields } = item;

    // Tab filter: Saved
    if (activeTab === 'saved' && !savedSet.has(r.k)) continue;

    // Category filter
    if (selectedType) {
      const isTypeMatch =
        r.type === selectedType ||
        (selectedType === 'بیمارستان' && r.type.includes('بیمارستان')) ||
        (selectedType.includes('عینک') && r.type.includes('عینک')) ||
        (selectedType.includes('کودک') && (r.type.includes('کودک') || (r.specialty && r.specialty.includes('کودک'))));
      if (!isTypeMatch) continue;
    }

    // Street filter
    if (selectedStreet && !r.streets.includes(selectedStreet)) continue;

    // Night shift filter
    if (onlyNightShift && !r.isNightShift) continue;

    // Search token matching (strictly word-boundary safe)
    let score = 0;
    let matched = true;

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

    if (matched) {
      results.push({ center: r, score });
    }
  }

  if (tokens.length > 0) {
    results.sort(
      (a, b) => b.score - a.score || a.center.name.localeCompare(b.center.name, 'fa')
    );
  }

  const response: FilterWorkerResponse = {
    id,
    results: results.map((x) => x.center),
  };

  self.postMessage(response);
};
