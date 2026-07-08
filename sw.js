/* Service worker mínimo de Brújula — habilita "instalar app" (PWA) y un arranque offline básico.
   Cachea el caparazón estático; los datos en vivo (fotos de Wikipedia, etc.) van siempre a la red. */
const CACHE = 'brujula-v1';
const SHELL = ['./', './index.html', './datos.js', './icono.svg', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // deja pasar POST (recogida de datos) y terceros (fotos)
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copia = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
