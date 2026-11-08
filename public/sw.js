// Cache Version 16 - Instant cache delivery with background refresh
const CACHE_NAME = 'krf-app-v16';

// 1. Critical assets to pre-cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/screenshots/screenshot-mobile.png',
  '/screenshots/screenshot-desktop.png',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap'
];

/**
  Helper to fetch and extract compiled CSS, JS, and font links from HTML and CSS
 */
async function discoverAndCacheDynamicAssets(cache) {
  try {
    // 1. Fetch index.html and extract script/css bundles
    const htmlRes = await fetch('/index.html', { cache: 'no-cache' });
    if (htmlRes.ok) {
      const htmlText = await htmlRes.clone().text();
      await cache.put('/index.html', htmlRes);

      // Extract stylesheets: <link ... href="...">
      const cssRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi;
      let match;
      const discoveredUrls = new Set();

      while ((match = cssRegex.exec(htmlText)) !== null) {
        const u = match[1];
        if (u && !u.includes('node_modules') && !u.includes('/src/')) {
          discoveredUrls.add(u);
        }
      }

      // Extract scripts: <script ... src="...">
      const jsRegex = /<script[^>]+src=["']([^"']+\.(?:js)[^"']*)["']/gi;
      while ((match = jsRegex.exec(htmlText)) !== null) {
        const u = match[1];
        // Only precache built production assets, never dev source files
        if (u && u.startsWith('/assets/')) {
          discoveredUrls.add(u);
        }
      }

      // Fetch and cache discovered scripts and CSS files
      for (const url of discoveredUrls) {
        try {
          const req = new Request(url, { cache: 'no-cache' });
          const res = await fetch(req);
          if (res.ok) {
            await cache.put(req, res);
          }
        } catch (_) {}
      }
    }

    // 2. Precache Google Font WOFF2 files by fetching and inspecting CSS
    const fontCssRes = await fetch('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap');
    if (fontCssRes.ok) {
      const cssText = await fontCssRes.clone().text();
      await cache.put('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap', fontCssRes);

      const fontFileRegex = /url\(["']?(https:\/\/[^"')]+)[\"']?\)/gi;
      let fontMatch;
      const fontUrls = [];
      while ((fontMatch = fontFileRegex.exec(cssText)) !== null) {
        if (fontMatch[1]) fontUrls.push(fontMatch[1]);
      }

      await Promise.allSettled(
        fontUrls.map(async (fUrl) => {
          try {
            const fRes = await fetch(fUrl, { mode: 'cors' });
            if (fRes.ok || fRes.type === 'opaque') {
              await cache.put(fUrl, fRes);
            }
          } catch (_) {}
        })
      );
    }
  } catch (err) {
    console.warn('[SW] Dynamic discovery warning:', err);
  }
}

// Install Event: Precaches all essential app shell files, CSS, fonts, and icons
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Cache hardcoded critical assets in parallel
      await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          fetch(url, { cache: 'no-cache' })
            .then((res) => {
              if (res.ok || res.type === 'opaque') {
                return cache.put(url, res);
              }
            })
            .catch(() => {})
        )
      );

      // 2. Discover and cache dynamic production CSS, JS chunks, and web fonts
      await discoverAndCacheDynamicAssets(cache);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear all outdated caches and take control of all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch Event: High-performance caching strategies
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // CRITICAL FIX: Bypass Service Worker completely for Vite dev server, HMR, hot modules, and dynamic imports
  // Never intercept dev dependencies, node_modules, or query-versioned files
  if (
    url.pathname.includes('/node_modules/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.searchParams.has('v') ||
    url.searchParams.has('t') ||
    url.searchParams.has('import')
  ) {
    return; // Pass through to network directly without caching
  }

  // Strategy 1: Navigation Requests (HTML) -> Instant cache delivery with background refresh (Stale-While-Revalidate)
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedHtml = (await cache.match('/index.html')) || (await cache.match('/'));

        // Background fetch to silently update cached HTML
        const networkUpdatePromise = fetch(req)
          .then((response) => {
            if (response && response.ok) {
              cache.put('/index.html', response.clone());
            }
            return response;
          })
          .catch(() => null);

        // If app shell is already in cache, serve it INSTANTLY (0-10ms)!
        if (cachedHtml) {
          return cachedHtml;
        }

        // First visit: wait for network
        const netRes = await networkUpdatePromise;
        if (netRes) return netRes;
        return fetch(req);
      })()
    );
    return;
  }

  // Strategy 2: Critical Static Assets (CSS, JS, Fonts, Images, Icons, Manifest)
  // Only handle production assets, icons, fonts, and images
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/screenshots/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.json') ||
    url.host.endsWith('fonts.googleapis.com') ||
    url.host.endsWith('fonts.gstatic.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        // Background fetch to refresh cache
        const fetchPromise = fetch(req)
          .then(async (networkResponse) => {
            if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
              const cache = await caches.open(CACHE_NAME);
              cache.put(req, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        // If in cache, return immediately for instant UI display
        return cachedResponse || fetchPromise;
      })
    );
  }
});

// Immediate activation message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
