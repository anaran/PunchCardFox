// Taken from https://railrouter.sg/
self.addEventListener('install', function(event){
  // console.log('Install');
  console.log(`Installing ${version}`);
});

// self.addEventListener('activate', function(event){
//   // console.log('Activate', event, JSON.stringify(self, Object.getOwnPropertyNames(self), 2));
//   console.log('Activate');
//   // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
//   event.waitUntil(self.clients.claim());
// });

// NOTE: activate listener taken from
// https://serviceworke.rs/immediate-claim_service-worker_doc.html
// `onactivate` is usually called after a worker was installed and the page
// got refreshed. Since we call `skipWaiting()` in `oninstall`, `onactivate` is
// called immediately.
self.addEventListener('activate', function(event) {
  // Just for debugging, list all controlled clients.
  self.clients.matchAll({
    includeUncontrolled: true
  }).then(function(clientList) {
    var urls = clientList.map(function(client) {
      return client.url;
    });
    console.log('[ServiceWorker] Matching clients:', urls.join(', '));
  });

  event.waitUntil(
    // Delete old cache entries that don't match the current version.
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== version) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      // `claim()` sets this worker as the active worker for all clients that
      // match the workers scope and triggers an `oncontrollerchange` event for
      // the clients.
      console.log('[ServiceWorker] Claiming clients for version', version);
      return self.clients.claim();
    })
  );
});

var version = 'punchcard-v18';
// var newCacheName = 'punchcard-cache-v14';
// var oldCacheName = 'punchcard-cache-v13';
// caches.delete(oldCacheName); // Delete the old one
// console.log('caches.delete('+oldCacheName+')');
var successResponses = /^0|([123]\d\d)|(40[14567])|410$/;

function fetchAndCache(request){
  return fetch(request.clone()).then(function(response){
    if (request.method == 'GET' && response && successResponses.test(response.status) &&
        request.url.match(this.registration.scope) &&
        (response.type == 'basic' || /\.(js|png|ttf|woff|woff2)/i.test(request.url) ||
         /fonts\.googleapis\.com/i.test(request.url))){
      console.log('Cache', request.url);
      caches.open(version).then(function(cache){
        cache.put(request, response);
      });
    }
    return response;
  });
};

function cacheOnly(request){
  return caches.open(version).then(function(cache){
    return cache.match(request);
  });
};

// Fastest strategy from https://github.com/GoogleChrome/sw-toolbox
self.addEventListener('fetch', function(event){
  var request = event.request;
  var url = request.url;
  event.respondWith(new Promise(function(resolve, reject){
    var rejected = false;
    var reasons = [];

    var maybeReject = function(reason){
      reasons.push(reason.toString());
      if (rejected){
        reject(new Error('Both cache and network failed: "' + reasons.join('", "') + '"'));
      } else {
        rejected = true;
      }
    };

    var maybeResolve = function(result){
      if (result instanceof Response){
        resolve(result);
      } else {
        maybeReject('No result returned');
      }
    };

    fetchAndCache(request.clone()).then(maybeResolve, maybeReject);
    cacheOnly(request).then(maybeResolve, maybeReject);
  }));
});
