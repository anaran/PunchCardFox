'use strict';

let version = 'Punchcard v48';
let cachedVersion = undefined;

// NOTE: Originally following strategy of
// https://pouchdb.com/serviceWorker.js
// which is cache.match or fetch.
// Now devtools shows URLs in Storage inspector!
self.addEventListener('fetch', function(event) {
  const successResponses = /^0|([123]\d\d)|(40[14567])|410$/;
  let request = event.request;
  let url = request.url;
  event.respondWith(
    caches.open(cachedVersion || version).then(function(cache) {
      return cache.match(request).then(resp => {
        if (resp) {
          return resp;
        }
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchTimeout = 5000;
        const timeout = setTimeout(() => {
          controller.abort();
          const msg = `fetch request timed out after ${fetchTimeout} ms for ${event.request.url}`;
          self.clients.get(event.clientId).then((client) => {
            client.postMessage({
              request: 'error',
              message: msg,
              scope: self.registration.scope,
              where: (new Error).stack.match(/(@|at\s+)(.+:\d+:\d+)/)[2]
            });
          });
        }, fetchTimeout);
        // if (event.request.url.match(self.registration.scope)) {
        //   event.request.url += `?t=${Date.now()}`;
        // }
        self.clients.get(event.clientId).then((client) => {
          client.postMessage({
            request: 'info',
            message: `event.request ${event.request.url} ${event.request.url.match(self.registration.scope) ? 'matches' : 'does not match'} scope`,
            scope: self.registration.scope
          });
        }).catch(err => {
          self.clients.get(event.clientId).then((client) => {
            client && client.postMessage({
              request: 'error',
              message: `${err.message} ${event.request.url}`,
              scope: self.registration.scope,
              where: (new Error).stack.match(/(@|at\s+)(.+:\d+:\d+)/)[2]
            });
          });
        });
        return fetch(event.request, {
          signal: signal,
          cache: 'no-cache',
        }).then(response => {
          clearTimeout(timeout);
          if (request.method == 'GET' && response && successResponses.test(response.status) &&
              request.url.match(self.registration.scope) &&
              (response.type == 'basic' || /\.(js|png|ttf|woff|woff2)/i.test(request.url) ||
               /fonts\.googleapis\.com/i.test(request.url))) {
            // More recent spec versions have newer language stating that the browser can
            // resolve the promise as soon as the entry is recorded in the database even
            // if the response body is still streaming in.
            self.clients.get(event.clientId).then((client) => {
              client && client.postMessage({
                request: 'info',
                message: `cache.put ${event.request.url}`,
                scope: self.registration.scope
              });
            });
            cache.put(event.request, response.clone());
          }
          else {
          }
          if (!response) {
          }
          else {
            return response;
          }
        }).catch(err => {
          self.clients.get(event.clientId).then((client) => {
            client.postMessage({
              request: 'error',
              message: `${err.message} ${event.request.url}`,
              scope: self.registration.scope,
              where: (new Error).stack.match(/(@|at\s+)(.+:\d+:\d+)/)[2]
            });
          });
        });
      }).catch(err => {
        self.clients.get(event.clientId).then((client) => {
          client.postMessage({
            request: 'error',
            message: `${err.message} for ${event.request.url}`,
            scope: self.registration.scope,
            where: (new Error).stack.match(/(@|at\s+)(.+:\d+:\d+)/)[2]
          });
        });
      });
    }).catch(err => {
      self.clients.get(event.clientId).then((client) => {
        client.postMessage({
          request: 'error',
          message: `${err.message} for ${event.request.url}`,
          scope: self.registration.scope,
          where: (new Error).stack.match(/(@|at\s+)(.+:\d+:\d+)/)[2]
        });
      });
    }));
});

self.addEventListener("message", function(e) {
  // e.source is a client object
  switch (e.data.request) {
  case 'SKIP_WAITING': {
    self.skipWaiting();
    break;
  }
  case 'caches': {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return cacheName;
        })
      )}).then((names) => {
        e.source.postMessage({
          request: 'caches',
          message: JSON.stringify(names)
        });
      });
    break;
  }
  case 'delete cache': {
    self.caches.delete(e.data.cache);
    break;
  }
  case 'version': {
    e.source.postMessage({
      request: 'version',
      message: cachedVersion || version
    });
    break;
  }
  case 'use cache': {
    cachedVersion = e.data.cache;
    if (cachedVersion) {
    }
    else {
    }
    e.source.postMessage({
      request: 'version',
      message: cachedVersion || version
    });
    break;
  }
  }
});
