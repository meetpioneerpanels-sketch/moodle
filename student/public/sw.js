/* EduHub Student service worker.
 *
 * Strategy:
 *   - install: precache the app shell so the app opens with no network at all.
 *   - navigations: network first, falling back to the cached shell when offline.
 *   - same-origin assets (JS/CSS/images built by Vite): stale-while-revalidate.
 *   - Firebase/Google traffic: never cached - Firestore has its own offline layer.
 */

const VERSION = 'eduhub-student-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;

const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

/**
 * The bundler hashes asset filenames, so the shell list cannot name them.
 * Read index.html at install time and precache whatever it references - that
 * way the very first offline start already has the JS and CSS it needs.
 */
async function precacheShell() {
  const cache = await caches.open(SHELL_CACHE);
  await cache.addAll(SHELL_URLS);

  try {
    const response = await fetch('/index.html', { cache: 'reload' });
    if (!response.ok) return;
    await cache.put('/index.html', response.clone());
    const html = await response.text();
    const assets = new Set();
    const pattern = /(?:src|href)="(\/assets\/[^"]+)"/g;
    let match;
    while ((match = pattern.exec(html)) !== null) assets.add(match[1]);
    await Promise.all(
      [...assets].map((url) => cache.add(url).catch(() => undefined)),
    );
  } catch {
    // Offline during install: the runtime cache below fills in later.
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

function isFirebaseRequest(url) {
  return (
    url.hostname.endsWith('googleapis.com') ||
    url.hostname.endsWith('firebaseio.com') ||
    url.hostname.endsWith('firebaseapp.com') ||
    url.hostname.endsWith('google.com')
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (isFirebaseRequest(url)) return;

  // App shell for every navigation, so a cold offline start still boots React.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() =>
          caches
            .match('/index.html', { ignoreVary: true })
            .then((cached) => cached || caches.match('/', { ignoreVary: true })),
        ),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // ignoreVary: the bundle is requested with crossorigin (so it carries an
  // Origin header) while the precache entry was stored without one - without
  // this, a "Vary: Origin" response would never match and offline start fails.
  event.respondWith(
    caches.match(request, { ignoreVary: true }).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
