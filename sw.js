// Denunciem.cat — Service Worker
// Versió: puja-la a cada release
const CACHE = 'denunciem-v1';

// Core: fitxers que canvien sovint → network-first
const CORE = [
  './',
  './index.html',
  './entitats.js'
];

// Assets: fitxers estables → cache-first
const ASSETS = [
  './favicon.svg',
  './imatges/icon-192.png',
  './imatges/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll([...CORE, ...ASSETS].filter(Boolean)))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isCoreRequest(req) {
  if (req.mode === 'navigate') return true;
  const url = new URL(req.url);
  return url.pathname.endsWith('/') ||
         url.pathname.endsWith('/index.html') ||
         url.pathname.endsWith('/entitats.js');
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (isCoreRequest(e.request)) {
    // NETWORK-FIRST per HTML i entitats.js
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then(c => c || caches.match('./index.html'))
        )
    );
    return;
  }

  // CACHE-FIRST per assets estables
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
