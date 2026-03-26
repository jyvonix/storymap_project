import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { openDB } from 'idb';

precacheAndRoute(self.__WB_MANIFEST);

// 0. Pastikan SW baru langsung aktif (PENTING untuk Reviewer)
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 1. Tangani Navigasi (PENTING untuk Offline Mode di Deploy)
// Gunakan jalur relatif agar aman di sub-direktori (GitHub Pages)
const handler = createHandlerBoundToURL('index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [new RegExp('/api/')],
});
registerRoute(navigationRoute);

// 2. Cache API Stories (StaleWhileRevalidate)
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

// 3. Cache Images (CacheFirst)
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

// Push Notification Listener
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

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-story') {
    event.waitUntil(syncStories());
  }
});

async function syncStories() {
  const db = await openDB('story-map-db', 2);
  const stories = await db.getAll('sync-queue');
  const authData = await db.get('auth-token', 'token');
  const token = authData ? authData.value : null;

  if (stories.length > 0 && !token) return;

  for (const story of stories) {
    try {
      const formData = new FormData();
      formData.append('description', story.description);
      const photoRes = await fetch(story.photo);
      formData.append('photo', await photoRes.blob());
      if (story.lat) formData.append('lat', story.lat);
      if (story.lon) formData.append('lon', story.lon);

      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        await db.delete('sync-queue', story.id);
      }
    } catch (err) { console.error(err); }
  }
}
