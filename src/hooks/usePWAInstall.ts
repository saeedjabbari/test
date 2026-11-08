import { useEffect, useState, useCallback, useMemo } from 'react';
import { getDeviceInfo, DeviceInfo } from '../utils/device';
import { trackPWAInstallationForce } from '../utils/analytics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPrompt?: BeforeInstallPromptEvent | null;
    __isPWAInstalled?: boolean;
  }
}

const DISMISS_STORAGE_KEY = 'krf_pwa_banner_dismissed_until';
const DISMISS_DURATION_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

export function usePWAInstall() {
  const deviceInfo: DeviceInfo = useMemo(() => getDeviceInfo(), []);

  // Initialize immediately from window global captured early in <head>
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__deferredPrompt) {
      return window.__deferredPrompt;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://') ||
      window.__isPWAInstalled === true ||
      localStorage.getItem('krf_pwa_installed') === 'true';
    return Boolean(isStandalone);
  });

  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Comprehensive standalone & installation checks across PC & Mobile
    const checkInstallation = async () => {
      if (localStorage.getItem('krf_pwa_installed') === 'true') {
        setIsInstalled(true);
        return;
      }

      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://') ||
        window.__isPWAInstalled === true;

      if (isStandalone) {
        setIsInstalled(true);
        try {
          localStorage.setItem('krf_pwa_installed', 'true');
        } catch {}
        if (localStorage.getItem('krf_pwa_install_reported') !== 'true') {
          trackPWAInstallationForce().catch(() => {});
        }
        return;
      }

      // Check getInstalledRelatedApps in modern Chromium (Windows/Mac/Android)
      if ('getInstalledRelatedApps' in navigator) {
        try {
          const apps = await (navigator as unknown as { getInstalledRelatedApps: () => Promise<unknown[]> }).getInstalledRelatedApps();
          if (apps && apps.length > 0) {
            setIsInstalled(true);
            return;
          }
        } catch {}
      }
    };

    checkInstallation();

    // 2. Check dismissal cache
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        setIsBannerDismissed(true);
      } else {
        setIsBannerDismissed(false);
      }
    } catch {
      setIsBannerDismissed(false);
    }

    // 3. Sync if prompt already exists on window
    if (window.__deferredPrompt) {
      setDeferredPrompt(window.__deferredPrompt);
    }

    // 4. Listeners for prompt and installation events
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstalled(false); // If Chrome offers install prompt, app is installable!
    };

    const handleCustomPromptAvailable = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent>;
      const promptEvent = customEvent.detail || window.__deferredPrompt;
      if (promptEvent) {
        setDeferredPrompt(promptEvent);
        setIsInstalled(false);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__deferredPrompt = null;
      window.__isPWAInstalled = true;
      try {
        localStorage.setItem('krf_pwa_installed', 'true');
      } catch {}
      trackPWAInstallationForce().catch(() => {});
      setIsBannerDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', handleCustomPromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-installed', handleAppInstalled);

    // Give a short 500ms delay for smooth initial layout
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-available', handleCustomPromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-installed', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    const promptEvent =
      deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPrompt : null);

    if (!promptEvent) {
      console.warn('PWA prompt event is not currently available');
      return false;
    }

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          window.__deferredPrompt = null;
          window.__isPWAInstalled = true;
          try {
            localStorage.setItem('krf_pwa_installed', 'true');
          } catch {}
        }
        trackPWAInstallationForce().catch(() => {});
        return true;
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
    return false;
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now() + DISMISS_DURATION_MS));
    } catch {}
  }, []);

  // Show banner as long as user is in a regular browser tab (not standalone) and not dismissed
  const shouldShowBanner = isReady && !isInstalled && !isBannerDismissed;

  const isInstallable = Boolean(
    deferredPrompt || (typeof window !== 'undefined' && window.__deferredPrompt)
  );

  return {
    isInstallable,
    isInstalled,
    isIOS: deviceInfo.isIOS,
    isDesktop: deviceInfo.isDesktop,
    isMobile: deviceInfo.isMobile,
    deviceInfo,
    install,
    dismissBanner,
    shouldShowBanner,
  };
}
