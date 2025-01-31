const CACHE_NAME = 'my-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  'https://turkifyy.blogspot.com/2025/01/test59.html',
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgt-kMZ7aJXyctrVtUyomjDP_LZxTc0Xd2EP-pthpW80y6TW1SiwyOiJfA-ae0xxhlcRdTyGHaE_nrT6b5TOzek-zx39-fqjXqLLNn8mm8-aWXdalya7xlEJ2EQZ7kam7zntIr3eRDKoAY7Y3qRpe6lazr5vSkNAR59CUgxzU8cvzHOX24lCGNSMyINP6E/s192/logo-192%C3%97192.png',
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgIi5EvZy5tdpJGdNj2wve_6RJrv0rQWtwIeITvq-9NmO08KteLhV8gJFIZhZ18dKiRuu80CmQYQN6R1pu9YC8DU1pw6jeXxWrh2DdjzEFg0Ug5MkIiwRg6z7xpY5P6MDkm8uibtTnnV2cw9zFH_vpACFcbyNbXOcka_4N_rp1DwQvF3Z2UufP2cbtiKpM/s512/logo-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Caching assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cache) {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('Serving from cache:', event.request.url);
        return response;
      }

      console.log('Fetching from network:', event.request.url);
      return fetch(event.request).then(function(networkResponse) {
        return caches.open(CACHE_NAME).then(function(cache) {
          if (event.request.method === 'GET') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      }).catch(() => {
        return new Response("لا يوجد اتصال بالإنترنت، حاول مرة أخرى لاحقًا.", {
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});
