// service worker registration
if('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('/sw.js')
           .then(function() { console.log("Service Worker Registered"); });
}

// service worker listeners
self.addEventListener('install', event => {
    const urlsToCache = [
        '/',
        '/favicon.ico',
        '/css/styles.css',
        '/js/dbhelper.js',
        '/js/main.js'
    ];
    event.waitUntil(
        caches.open('restaurants-reviews-app-cache')
              .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    // event.waitUntil();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open('restaurants-reviews-app-cache').then(cache =>
            cache.match(event.request)
            .then(response => {
                return response ||
                       fetch(event.request)
                       .then(response => {
                           cache.put(event.request, response.clone());
                           return response;
                       })
            })
        )
    )
});
