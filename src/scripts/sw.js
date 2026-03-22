import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { openDB } from 'idb';

precacheAndRoute(self.__WB_MANIFEST);

// Pastikan SW baru langsung aktif
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Cache Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 30 }),
    ],
  })
);

// Cache API Stories (StaleWhileRevalidate untuk Offline)
registerRoute(
  ({ url }) => url.href.includes('story-api.dicoding.dev/v1/stories'),
  new StaleWhileRevalidate({
    cacheName: 'dicoding-stories-api',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24, maxEntries: 100 }),
    ],
  })
);

// Cache Images
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

// Push Notification
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Ada Cerita Baru!';
  const options = {
    body: data.message || 'Cek aplikasi untuk melihat cerita terbaru.',
    icon: '/public/icon-192.svg',
    badge: '/public/icon-192.svg',
    data: { url: data.url || '/#/home' },
    actions: [{ action: 'view', title: 'Buka Cerita' }]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

// Background Sync (Offline Queue)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-story') {
    event.waitUntil(syncStories());
  }
});

async function syncStories() {
  const db = await openDB('story-map-db', 1);
  const stories = await db.getAll('sync-queue');
  for (const story of stories) {
    try {
      const formData = new FormData();
      formData.append('description', `${story.name}: ${story.description}`);
      const photoRes = await fetch(story.photo);
      formData.append('photo', await photoRes.blob());
      if (story.lat) formData.append('lat', story.lat);
      if (story.lon) formData.append('lon', story.lon);

      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (response.ok) await db.delete('sync-queue', story.id);
    } catch (err) { console.error('Sync failed:', err); }
  }
}
