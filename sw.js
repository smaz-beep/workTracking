const CACHE = 'sarah-work-v03-pwa-8';
const ASSETS = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
const url = path => new URL(path, self.registration.scope).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(url))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('sarah-work-v03-pwa-') && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const requested = new URL(request.url);
  if (!request.url.startsWith(self.registration.scope)) return;
  const navigation = request.mode === 'navigate';
  if (!navigation && !ASSETS.some(asset => requested.href === url(asset))) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = navigation ? url('index.html') : request;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') await cache.put(key, response.clone());
      return response;
    } catch {
      return await cache.match(key) || new Response('Offline nicht verfügbar. Bitte einmal online öffnen.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
