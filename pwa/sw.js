const CACHE_NAME = 'meddash-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(err => console.warn('Cache addAll failed', err)))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request)
        .then(resp => {
          if (resp && resp.status === 200) {
            caches.open(CACHE_NAME).then(c => c.put(e.request, resp.clone()));
          }
          return resp.clone();
        })
        .catch(() => null);
      return cached || network;
    })
  );
});
