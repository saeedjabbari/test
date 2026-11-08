const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toFa(s: number | string | undefined | null): string {
  if (s == null) return '';
  return String(s).replace(/\d/g, (d) => FA_DIGITS[parseInt(d, 10)] || d);
}

export function norm(s: string | undefined | null): string {
  if (!s) return '';
  return String(s)
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[‌‏‎]/g, ' ')
    .replace(/ـ/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function squash(s: string): string {
  return s.replace(/\s+/g, '');
}

export function fmtPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const clean = phone.trim();
  if (clean.startsWith('09')) {
    return toFa(clean.slice(0, 4) + '-' + clean.slice(4));
  }
  if (clean.startsWith('044')) {
    return toFa(clean.slice(0, 3) + '-' + clean.slice(3));
  }
  return toFa(clean);
}

export function getGoogleMapUrl(name: string, address: string, pid?: string, lat?: number, lng?: number): string {
  if (lat && lng && lat > 30 && lng > 40) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  if (pid && pid.trim().length > 10) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ارومیه')}&query_place_id=${encodeURIComponent(pid)}`;
  }
  return '';
}

export function getNeshanMapUrl(name: string, address: string, lat?: number, lng?: number): string {
  if (lat && lng) {
    return `https://neshan.org/maps/@${lat},${lng},17z/search/${encodeURIComponent(name + ' ارومیه')}`;
  }
  return `https://neshan.org/maps/search/${encodeURIComponent(name + ' ارومیه')}`;
}

export function getBaladMapUrl(name: string, address: string, lat?: number, lng?: number): string {
  if (lat && lng) {
    return `https://balad.ir/location?latitude=${lat}&longitude=${lng}`;
  }
  return `https://balad.ir/search?query=${encodeURIComponent(name + ' ارومیه')}`;
}

export function getSearchPhoneUrl(name: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent('شماره تلفن ' + name + ' ارومیه')}`;
}

export function formatPersianDate(isoString: string | undefined | null): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(isoString);
  }
}

/**
 * Strips out specialty in parentheses from the main center name
 * because specialty is cleanly displayed in the secondary line right below.
 */
export function formatCenterName(name: string | undefined | null): string {
  if (!name) return '';
  return name
    .replace(/\s*\([^)]*(?:متخصص|فوق\s*تخصص|دکترای|بیماری|جراح|پزشک|دندانپزشک|داخلی)[^)]*\)/g, '')
    .trim();
}

