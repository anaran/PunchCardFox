// Taken from https://railrouter.sg/
self.addEventListener('install', function(event){
  // console.log('Install');
  console.log(`Installing ${version}`);
  console.log('[ServiceWorker] Skip waiting on install');
  self.skipWaiting();
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
      // client.postMessage({
      //   message: `Claiming clients for version ${version}`
      // });
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
    }).catch(err => {
      console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
    }));
  // `claim()` sets this worker as the active worker for all clients that
  // match the workers scope and triggers an `oncontrollerchange` event for
  // the clients.
  console.log('[ServiceWorker] Claiming clients for version', version);

  self.clients.claim();
});

var version = 'punchcard-v21';
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
  }).catch(err => {
    console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
    return caches.open(version).then(function(cache){
      return cache.match(request);
    }).catch(err => {
      console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
    });
  });
};

function cacheOnly(request){
  return caches.open(version).then(function(cache){
    return cache.match(request);
  }).catch(err => {
    console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
  });
};

// Taken from
// https://serviceworke.rs/offline-fallback_service-worker_doc.html
// with caching carried over from previous fetchAndCache
// since
// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#Recovering_failed_requests
// did not seem to work either, but perhaps only because I had devtools open.
this.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = request.url;
  event.respondWith(
    fetch(event.request).then(function(response) {
      if (request.method == 'GET' && response && successResponses.test(response.status) &&
          request.url.match(this.registration.scope) &&
          (response.type == 'basic' || /\.(js|png|ttf|woff|woff2)/i.test(request.url) ||
           /fonts\.googleapis\.com/i.test(request.url))){
        caches.open(version).then(function(cache) {
          console.log(`put ${event.request.url} in ${version}`);
          cache.put(event.request, response.clone());
        });
      }
      return response;
    }).catch(err => {
      console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
      return caches.open(version).then(function(cache){
        console.log(`return cache.match(${url}) since fetch fails`);
        return cache.match(url);
        // return cache.match(request);
        // cache.match('./build/index.html').then(response => {
        //   resolve(response);
        // });
      }).catch(err => {
        console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
      });
    })
    // new Promise(function (resolve, reject) {
    //   caches.match(event.request).then(function(resp) {
    //     console.log(`caches.match(${event.request.url})`);
    //     if (resp) resolve(resp);
    //     fetch(event.request).then(function(response) {
    //       if (request.method == 'GET' && response && successResponses.test(response.status) &&
    //           request.url.match(this.registration.scope) &&
    //           (response.type == 'basic' || /\.(js|png|ttf|woff|woff2)/i.test(request.url) ||
    //            /fonts\.googleapis\.com/i.test(request.url))){
    //         caches.open(version).then(function(cache) {
    //           console.log(`put ${event.request.url}) in ${cache}`);
    //           cache.put(event.request, response.clone());
    //         });
    //       }
    //       resolve(response);
    //     }).catch(err => {
    //       console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
    //       return caches.open(version).then(function(cache){
    //         // return cache.match(request);
    //         cache.match('./build/index.html').then(response => {
    //           resolve(response);
    //         });
    //       }).catch(err => {
    //         console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
    //       });
    //     });
    //   }).catch(err => {
    //     console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2));
    //   })
    // })
  );
});

// // Fastest strategy from https://github.com/GoogleChrome/sw-toolbox
// self.addEventListener('fetch', function(event){
//   var request = event.request;
//   var url = request.url;
//   event.respondWith(new Promise(function(resolve, reject){
//     var rejected = false;
//     var reasons = [];
// 
//     var maybeReject = function(reason){
//       reasons.push(reason.toString());
//       if (rejected){
//         console.trace();
//         reject(new Error('Both cache and network failed: "' + reasons.join('", "') + '"'));
//       } else {
//         // rejected = true;
//       }
//     };
// 
//     var maybeResolve = function(result){
//       if (result instanceof Response){
//         resolve(result);
//       } else {
//         console.log("// maybeReject('No result returned');");
//         maybeReject('No result returned');
//       }
//     };  
// 
//     fetchAndCache(request.clone()).then(maybeResolve, maybeReject);
//     // rejected = false;
//     // cacheOnly(request).then(maybeResolve, maybeReject);
//   }));
// });
