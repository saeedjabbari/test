export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface DeviceInfo {
  deviceType: DeviceType;
  isDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isMac: boolean;
  osName: string;
  installTargetLabel: string;
  actionButtonLabel: string;
  badgeLabel: string;
  description: string;
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      deviceType: 'desktop',
      isDesktop: true,
      isMobile: false,
      isTablet: false,
      isIOS: false,
      isAndroid: false,
      isWindows: true,
      isMac: false,
      osName: 'ویندوز (PC)',
      installTargetLabel: 'کامپیوتر / ویندوز',
      actionButtonLabel: 'نصب روی کامپیوتر',
      badgeLabel: 'نسخه کامپیوتر',
      description: 'اجرای تمام‌صفحه و مستقل بدون نیاز به مرورگر با آیکون روی دسکتاپ',
    };
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // OS detection
  const isIOS =
    /iphone|ipod/.test(ua) ||
    /ipad/.test(ua) ||
    (maxTouchPoints > 1 && /macintosh/.test(ua));

  const isAndroid = /android/.test(ua);
  const isWindows = /windows/i.test(ua);
  const isMac = /macintosh|mac os x/i.test(ua) && !isIOS;
  const isLinux = /linux/i.test(ua) && !isAndroid;

  let osName = 'سیستم شما';
  if (isWindows) osName = 'ویندوز (PC)';
  else if (isMac) osName = 'مک (macOS)';
  else if (isLinux) osName = 'لینوکس';
  else if (isAndroid) osName = 'اندروید';
  else if (isIOS) osName = 'آیفون / آیپد';

  // Device Form Factor detection
  const isTablet =
    /ipad|tablet|(android(?!.*mobile))/.test(ua) ||
    (maxTouchPoints > 1 && /macintosh/.test(ua) && window.innerWidth <= 1024);

  const isMobile =
    !isTablet &&
    (/mobile|iphone|ipod|android.*mobile/.test(ua) ||
      (maxTouchPoints > 0 && window.innerWidth < 768));

  const isDesktop = !isMobile && !isTablet;

  const deviceType: DeviceType = isDesktop
    ? 'desktop'
    : isTablet
      ? 'tablet'
      : 'mobile';

  if (isDesktop) {
    return {
      deviceType: 'desktop',
      isDesktop: true,
      isMobile: false,
      isTablet: false,
      isIOS: false,
      isAndroid: false,
      isWindows,
      isMac,
      osName,
      installTargetLabel: `کامپیوتر (${osName})`,
      actionButtonLabel: 'نصب روی کامپیوتر',
      badgeLabel: `نسخه کامپیوتر (${osName})`,
      description:
        'اجرای مستقیم و تمام‌صفحه، آیکون روی دسکتاپ و تسک‌بار و کارکرد سریع آفلاین',
    };
  }

  if (isTablet) {
    return {
      deviceType: 'tablet',
      isDesktop: false,
      isMobile: false,
      isTablet: true,
      isIOS,
      isAndroid,
      isWindows,
      isMac,
      osName,
      installTargetLabel: 'تبلت',
      actionButtonLabel: 'نصب روی تبلت',
      badgeLabel: 'نسخه تبلت',
      description:
        'نمای بهینه و عریض تبلت بدون نوار مرورگر، کارکرد آفلاین و دسترسی با یک لمس',
    };
  }

  return {
    deviceType: 'mobile',
    isDesktop: false,
    isMobile: true,
    isTablet: false,
    isIOS,
    isAndroid,
    isWindows: false,
    isMac: false,
    osName,
    installTargetLabel: 'گوشی موبایل',
    actionButtonLabel: 'نصب روی گوشی',
    badgeLabel: 'نسخه موبایل',
    description:
      'دسترسی آسان با یک لمس از صفحه اصلی گوشی، سریع و بدون نوار آدرس مرورگر',
  };
}
