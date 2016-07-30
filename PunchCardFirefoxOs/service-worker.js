self.addEventListener('install', function(event){
  // console.log('Install');
  console.log(`Installing ${version}`);
  console.log('[ServiceWorker] Skip waiting on install');
  self.clients.matchAll({
    includeUncontrolled: true
  }).then(function(clientList) {
    clientList.map(function(client) {
      client.postMessage({
        message: `Installing ${version}\nSkip waiting on install`
      });
    });
  });
  self.skipWaiting();
});

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
      client.postMessage({
        message: `${version} matches client ${client.url}`
      });
      return client.url;
    });
    console.log('[ServiceWorker] Matching clients:', urls.join(', '));
  }).catch(err => console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2)));

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
      self.clients.matchAll({
        includeUncontrolled: true
      }).then(function(clientList) {
        clientList.map(function(client) {
          client.postMessage({
            message: `Claiming clients for version ${version}`
          });
        });
      });
      return self.clients.claim();
    }).catch(err => {
      console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
    }));
});

var version = 'punchcard-v36';
// var newCacheName = 'punchcard-cache-v14';
// var oldCacheName = 'punchcard-cache-v13';
// caches.delete(oldCacheName); // Delete the old one
// console.log('caches.delete('+oldCacheName+')');
var successResponses = /^0|([123]\d\d)|(40[14567])|410$/;

// Basically following strategy os
// https://pouchdb.com/serviceWorker.js
// which is cache.match or fetch.
// Now devtools shows URLs in Storage inspector!
this.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = request.url;
  event.respondWith(
    caches.open(version).then(function(cache) {
      return cache.match(request).then(resp => {
        if (resp) {
          console.log(`prefer cache.match(${url}) for ${version}`);
          return resp;
        }
        return fetch(event.request).then(response => {
          if (request.method == 'GET' && response && successResponses.test(response.status) &&
              request.url.match(this.registration.scope) &&
              (response.type == 'basic' || /\.(js|png|ttf|woff|woff2)/i.test(request.url) ||
               /fonts\.googleapis\.com/i.test(request.url))) {
            console.log(`put fetched ${event.request.url} response in ${version}`);
            // More recent spec versions have newer language stating that the browser can
            // resolve the promise as soon as the entry is recorded in the database even
            // if the response body is still streaming in.
            cache.put(event.request, response.clone());
          }
          if (!response) {
            console.log(`fetch response for ${url} is ${response}`);
            return response;
          }
          else {
            return response;
          }
        }).catch(err => {
          console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
        });
      }).catch(err => {
        console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
      });
    })
  );
});
