'use strict';

// Using 'let' I got Uncaught SyntaxError: Identifier 'version' has already been declared
var version = 'TBD';
// import { version } from './sw-version.js';

console.log('begin', version, (new Error()).stack.match(/(@|at\s+)(.+:\d+:\d+)/)[2]);

let update_app = false;

self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Skip waiting on install');
  self.skipWaiting();
});

// NOTE: activate listener taken from
// https://serviceworke.rs/immediate-claim_service-worker_doc.html
// `onactivate` is usually called after a worker was installed and the page
// got refreshed. Since we call `skipWaiting()` in `oninstall`, `onactivate` is
// called immediately.
self.addEventListener('activate', function(event) {
  // Just for debugging, list all controlled clients.
  console.log ('activate');
  event.waitUntil(
    self.caches.keys().then(key => {
      console.log(key, key.length, key[key.length-1]);
      version = key[key.length-1];
      self.clients.matchAll({
        includeUncontrolled: true
      }).then(function(clientList) {
        var urls = clientList.map(function(client) {
          client.postMessage({
            request: 'version',
            message: version
          });
          return client.url;
        });
        console.log('[ServiceWorker] Matching clients:', urls.join(', '));
      }).catch(err => console.log(JSON.stringify(err, Object.getOwnPropertyNames(Error.prototype), 2)));
      console.log(`[ServiceWorker] just setting version to last cache key ${version}`);
    }));
});

// caches.delete(oldCacheName); // Delete the old one
// console.log('caches.delete('+oldCacheName+')');
var successResponses = /^0|([123]\d\d)|(40[14567])|410$/;

// Basically following strategy of
// https://pouchdb.com/serviceWorker.js
// which is cache.match or fetch.
// Now devtools shows URLs in Storage inspector!
self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = request.url;
  event.respondWith(
    caches.open(version).then(function(cache) {
      return cache.match(request).then(resp => {
        if (resp) {
          // console.log(`prefer cache.match(${url}) for ${version}`);
          return resp;
        }
        return fetch(event.request).then(response => {
          if (request.method == 'GET' && response && successResponses.test(response.status) &&
              request.url.match(self.registration.scope) &&
              (response.type == 'basic' || /\.(js|png|ttf|woff|woff2)/i.test(request.url) ||
               /fonts\.googleapis\.com/i.test(request.url))) {
            // console.log(`put fetched ${event.request.url} response in ${version}`);
            // More recent spec versions have newer language stating that the browser can
            // resolve the promise as soon as the entry is recorded in the database even
            // if the response body is still streaming in.
            cache.put(event.request, response.clone());
          }
          if (!response) {
            // console.log(`fetch response for ${url} is ${response}`);
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

self.addEventListener("message", function(e) {
  // e.source is a client object
  console.log('[ServiceWorker] message for ${version}', e.data);
  switch (e.data.request) {
  case 'version': {
    e.source.postMessage({
      request: 'version',
      message: version
    });
    break;
  }
  }
});

console.log('end', (new Error()).stack.match(/(@|at\s+)(.+:\d+:\d+)/)[2]);
