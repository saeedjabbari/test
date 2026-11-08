/**
 * Device & User Analytics Tracker for Karafarin Medical Centers App
 * Tracks unique devices, OS, browser, PWA installation status, and sessions.
 * Respects user privacy (no phone numbers or intrusive GPS without permission).
 */

import { getDeviceInfo } from './device';
import { recordVisitToSheets, VisitRecord } from '../lib/sheets';

const DEVICE_ID_KEY = 'krf_device_uuid';
const VISIT_COUNT_KEY = 'krf_device_visit_count';
const LAST_LOGGED_KEY = 'krf_device_last_logged_time';
const SESSION_LOGGED_KEY = 'krf_session_logged';

/**
 * Returns or creates a persistent unique anonymous ID for this device/browser
 */
export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      const rand = Math.random().toString(36).substring(2, 9);
      const time = Date.now().toString(36).substring(4);
      id = `krf-${rand}-${time}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'krf-guest-client';
  }
}

/**
 * Detect specific detailed phone model and browser from User-Agent
 */
export function getDetailedDeviceInfo() {
  const baseDevice = getDeviceInfo();
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      deviceId: 'server-pc',
      deviceType: 'کامپیوتر',
      model: 'ویندوز (PC)',
      os: 'ویندوز',
      browser: 'نامشخص',
      isPWA: 'مرورگر وب',
      screenResolution: '1920 × 1080',
      visitCount: 1,
    };
  }

  const ua = navigator.userAgent || '';
  const deviceId = getOrCreateDeviceId();

  // Detect specific Android brands & models
  let modelName = baseDevice.osName;
  if (baseDevice.isAndroid) {
    if (/samsung/i.test(ua) || /sm-[a-z0-9]+/i.test(ua)) {
      const match = ua.match(/sm-[a-z0-9]+/i);
      modelName = match ? `سامسونگ (${match[0].toUpperCase()})` : 'سامسونگ (Samsung)';
    } else if (/xiaomi|redmi|poco/i.test(ua)) {
      modelName = 'شیائومی (Xiaomi/Redmi)';
    } else if (/huawei|honor/i.test(ua)) {
      modelName = 'هواوی (Huawei)';
    } else {
      modelName = 'گوشی اندروید (Android)';
    }
  } else if (baseDevice.isIOS) {
    if (/ipad/i.test(ua)) modelName = 'آیپد (iPad)';
    else modelName = 'آیفون (iPhone)';
  } else if (baseDevice.isWindows) {
    modelName = 'رایانه ویندوز (Windows PC)';
  } else if (baseDevice.isMac) {
    modelName = 'کامپیوتر اپل (Mac)';
  }

  // Detect browser
  let browser = 'کروم (Chrome)';
  if (/samsungbrowser/i.test(ua)) {
    browser = 'سامسونگ اینترنت (Samsung Browser)';
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'سافاری (Safari)';
  } else if (/firefox/i.test(ua)) {
    browser = 'فایرفاکس (Firefox)';
  } else if (/edg/i.test(ua)) {
    browser = 'مایکروسافت اج (Edge)';
  } else if (/opera|opr/i.test(ua)) {
    browser = 'اپرا (Opera)';
  }

  // Is PWA (running in standalone app mode)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    localStorage.getItem('krf_pwa_installed') === 'true';

  const isPWA = isStandalone ? 'نصب‌شده (PWA)' : 'مرورگر وب';

  // Screen resolution
  const width = window.screen?.width || window.innerWidth || 0;
  const height = window.screen?.height || window.innerHeight || 0;
  const screenResolution = `${width} × ${height}`;

  // Visit count
  let visitCount = 1;
  try {
    const rawCount = localStorage.getItem(VISIT_COUNT_KEY);
    visitCount = rawCount ? parseInt(rawCount, 10) + 1 : 1;
  } catch {}

  const deviceTypeLabel = baseDevice.isMobile
    ? 'موبایل'
    : baseDevice.isTablet
    ? 'تبلت'
    : 'کامپیوتر';

  return {
    deviceId,
    deviceType: deviceTypeLabel,
    model: modelName,
    os: baseDevice.osName,
    browser,
    isPWA,
    screenResolution,
    visitCount,
  };
}

export const PWA_REPORTED_KEY = 'krf_pwa_install_reported';

/**
 * Tracks and logs this user session to Google Sheets.
 * If force is true or if newly running in standalone PWA mode, bypasses throttle.
 */
export async function trackUserVisit(force = false): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      (typeof document !== 'undefined' && document.referrer.includes('android-app://')) ||
      localStorage.getItem('krf_pwa_installed') === 'true' ||
      (typeof window !== 'undefined' && (window as any).__isPWAInstalled === true);

    const hasReportedPWA = localStorage.getItem(PWA_REPORTED_KEY) === 'true';
    const isNewlyInstalledPWA = isStandalone && !hasReportedPWA;

    const shouldBypassThrottle = force || isNewlyInstalledPWA;

    if (!shouldBypassThrottle) {
      // Avoid multiple triggers in the same tab session
      const sessionLogged = sessionStorage.getItem(SESSION_LOGGED_KEY);
      if (sessionLogged) return;

      // Check throttle: max 1 log per 45 minutes per device
      const lastLogged = localStorage.getItem(LAST_LOGGED_KEY);
      const now = Date.now();
      const FORTY_FIVE_MINUTES_MS = 45 * 60 * 1000;

      if (lastLogged && now - Number(lastLogged) < FORTY_FIVE_MINUTES_MS) {
        sessionStorage.setItem(SESSION_LOGGED_KEY, 'true');
        return;
      }
    }

    const info = getDetailedDeviceInfo();

    // If standalone detected, ensure info.isPWA reflects it
    if (isStandalone) {
      info.isPWA = 'نصب‌شده (PWA)';
    }

    const now = Date.now();
    // Increment and save visit count
    localStorage.setItem(VISIT_COUNT_KEY, String(info.visitCount));
    localStorage.setItem(LAST_LOGGED_KEY, String(now));
    sessionStorage.setItem(SESSION_LOGGED_KEY, 'true');

    if (isStandalone) {
      localStorage.setItem('krf_pwa_installed', 'true');
      localStorage.setItem(PWA_REPORTED_KEY, 'true');
    }

    const record: VisitRecord = {
      deviceId: info.deviceId,
      deviceType: info.deviceType,
      model: info.model,
      os: info.os,
      browser: info.browser,
      isPWA: info.isPWA,
      screenResolution: info.screenResolution,
      visitCount: info.visitCount,
      timestamp: new Date().toISOString(),
    };

    // Save locally into admin cache as well
    try {
      const cached = JSON.parse(localStorage.getItem('krf_cached_visits') || '[]');
      cached.unshift(record);
      // Keep bounded to last 200 items locally
      if (cached.length > 200) cached.length = 200;
      localStorage.setItem('krf_cached_visits', JSON.stringify(cached));
    } catch {}

    // Send to Google Sheets in background
    await recordVisitToSheets(record);
  } catch (err) {
    console.warn('Analytics tracking notice:', err);
  }
}

/**
 * Explicitly forces immediate tracking of PWA installation
 */
export async function trackPWAInstallationForce(): Promise<void> {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('krf_pwa_installed', 'true');
    }
    await trackUserVisit(true);
  } catch (err) {
    console.warn('Error in trackPWAInstallationForce:', err);
  }
}

