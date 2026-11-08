import { MEDICAL_CENTERS, MedicalCenter } from '../data/centers';
import { norm } from './persian';

export const STORAGE_CUSTOM_KEY = 'krf_custom_centers';
export const STORAGE_OVERRIDES_KEY = 'krf_center_overrides';

// Common streets in Urmia with approximate center coordinates
export const URMIA_STREETS_MAP: Record<string, { lat: number; lng: number }> = {
  حسنی: { lat: 37.5365, lng: 45.0642 },
  مولوی: { lat: 37.5284, lng: 45.0612 },
  خیام: { lat: 37.5482, lng: 45.0712 },
  امام: { lat: 37.5492, lng: 45.0725 },
  کاشانی: { lat: 37.5385, lng: 45.069 },
  بهشتی: { lat: 37.5348, lng: 45.0682 },
  استادان: { lat: 37.5348, lng: 45.0682 },
  فرهنگیان: { lat: 37.5618, lng: 45.0453 },
  باکری: { lat: 37.5456, lng: 45.0792 },
  مدرس: { lat: 37.5315, lng: 45.073 },
  سرداران: { lat: 37.543, lng: 45.0745 },
  دانشکده: { lat: 37.525, lng: 45.058 },
  برق: { lat: 37.538, lng: 45.062 },
  آپادانا: { lat: 37.536, lng: 45.059 },
  ارتش: { lat: 37.541, lng: 45.078 },
  مدنی: { lat: 37.552, lng: 45.068 },
  بعثت: { lat: 37.546, lng: 45.076 },
  'خان‌باباخان': { lat: 37.5475, lng: 45.067 },
  'خان باباخان': { lat: 37.5475, lng: 45.067 },
  ورزش: { lat: 37.5388, lng: 45.0439 },
};

/**
 * Extracts and validates latitude & longitude from text (supports Persian numerals, comma, space, slash)
 */
export function parseCoordinates(raw: string): { lat: number; lng: number } | null {
  if (!raw) return null;
  // Convert Persian/Arabic digits to English
  const normalized = raw
    .trim()
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));

  // Match pattern: 37.xxxx, 45.xxxx or 37.xxxx 45.xxxx
  const match = normalized.match(/(\d{2}\.\d+)[,\s/]+(\d{2}\.\d+)/);
  if (match) {
    const p1 = parseFloat(match[1]);
    const p2 = parseFloat(match[2]);
    // Urmia is around Lat 37.5, Lng 45.0
    let lat = p1;
    let lng = p2;
    if (p1 > 40 && p2 < 40) {
      // Swapped
      lat = p2;
      lng = p1;
    }
    if (lat >= 30 && lat <= 40 && lng >= 40 && lng <= 55) {
      return { lat, lng };
    }
  }
  return null;
}

/**
 * Generate accurate map routing URLs for Google Maps, Neshan, and Balad
 */
export function generateMapUrls(
  lat?: number,
  lng?: number,
  centerName?: string,
  address?: string
): { neshanUrl: string; baladUrl: string; googleMapUrl: string } {
  if (lat && lng && lat > 30 && lng > 40) {
    const cleanLat = Number(lat.toFixed(6));
    const cleanLng = Number(lng.toFixed(6));
    return {
      googleMapUrl: `https://www.google.com/maps/search/?api=1&query=${cleanLat},${cleanLng}`,
      neshanUrl: `https://nshn.ir/?lat=${cleanLat}&lng=${cleanLng}`,
      baladUrl: `https://balad.ir/location?latitude=${cleanLat}&longitude=${cleanLng}`,
    };
  }

  const queryText = `ارومیه ${centerName || ''} ${address || ''}`.trim();
  const cleanQuery = encodeURIComponent(queryText);
  return {
    googleMapUrl: `https://www.google.com/maps/search/?api=1&query=${cleanQuery}`,
    neshanUrl: `https://nshn.ir/search/${cleanQuery}`,
    baladUrl: `https://balad.ir/search?q=${cleanQuery}`,
  };
}

/**
 * Extract street names from an address
 */
export function extractStreetsFromAddress(address: string): string[] {
  const found: string[] = [];
  for (const street of Object.keys(URMIA_STREETS_MAP)) {
    if (address.includes(street) && !found.includes(street)) {
      found.push(street);
    }
  }
  return found.length > 0 ? found : ['سایر'];
}

/**
 * Load overrides stored for existing centers
 */
export function getCenterOverrides(): Record<number, Partial<MedicalCenter>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Load custom centers added via CMS
 */
export function getCustomCenters(): MedicalCenter[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Returns merged full list of medical centers (Official base + Overrides + Custom centers)
 */
export function getMergedCenters(): MedicalCenter[] {
  const overrides = getCenterOverrides();
  const custom = getCustomCenters();

  const base = MEDICAL_CENTERS.map((c) => {
    if (overrides[c.k]) {
      return {
        ...c,
        ...overrides[c.k],
      };
    }
    return c;
  });

  const baseKeys = new Set(base.map((c) => c.k));
  const baseNames = new Set(base.map((c) => norm(c.name)));

  const validCustom = custom.filter(
    (c) => !baseKeys.has(c.k) && !baseNames.has(norm(c.name))
  );

  return [...base, ...validCustom];
}

/**
 * Save an edited or overridden center
 */
export function saveCenterRecord(center: MedicalCenter): void {
  if (typeof window === 'undefined') return;

  const officialKeys = new Set(MEDICAL_CENTERS.map((c) => c.k));
  if (officialKeys.has(center.k)) {
    // Save in overrides
    const overrides = getCenterOverrides();
    overrides[center.k] = { ...center };
    localStorage.setItem(STORAGE_OVERRIDES_KEY, JSON.stringify(overrides));
  } else {
    // Save in custom centers
    const custom = getCustomCenters();
    const idx = custom.findIndex((c) => c.k === center.k);
    if (idx >= 0) {
      custom[idx] = { ...center };
    } else {
      custom.push({ ...center });
    }
    localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(custom));
  }

  // Dispatch change event to notify all components
  window.dispatchEvent(new Event('krf_centers_updated'));
}

/**
 * Delete a custom center or revert an official center override
 */
export function deleteCenterRecord(k: number): void {
  if (typeof window === 'undefined') return;

  const overrides = getCenterOverrides();
  if (overrides[k]) {
    delete overrides[k];
    localStorage.setItem(STORAGE_OVERRIDES_KEY, JSON.stringify(overrides));
  }

  const custom = getCustomCenters().filter((c) => c.k !== k);
  localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(custom));

  window.dispatchEvent(new Event('krf_centers_updated'));
}
