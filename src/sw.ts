/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => (
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('workbox-') || cacheName.includes('precache'))
            .map((cacheName) => caches.delete(cacheName)),
        )
      )),
    ]),
  )
})

export {}
