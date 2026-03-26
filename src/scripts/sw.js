/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// 1. Precache aset hasil build Webpack
precacheAndRoute(self.__WB_MANIFEST || []);

// 2. Langsung aktifkan SW baru agar reviewer langsung melihat perubahan
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 3. Cache API Stories (NetworkFirst agar data selalu segar saat online)
registerRoute(
  ({ url }) => url.href.includes('story-api.dicoding.dev/v1/stories'),
  new NetworkFirst({
    cacheName: 'dicoding-stories-api',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24, maxEntries: 100 }),
    ],
  })
);

// 4. Cache Images (CacheFirst)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// 5. Push Notification Listener (Sesuai Kriteria 2)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Ada Cerita Baru!',
    message: 'Cek aplikasi untuk melihat cerita terbaru.',
    url: '/#/home',
  };

  if (event.data) {
    try {
      const jsonData = event.data.json();
      data = { ...data, ...jsonData };
    } catch (err) {
      data.message = event.data.text();
    }
  }

  const options = {
    body: data.message,
    icon: 'icon-192.svg',
    badge: 'icon-192.svg',
    data: { url: data.url },
    vibrate: [100, 50, 100],
    actions: [{ action: 'view', title: 'Buka Cerita' }]
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
