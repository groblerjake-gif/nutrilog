// Network-first for the app's own files (so updates arrive), cache fallback so it works offline.
const C = 'nutrilog-v2';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(C).then(c => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
