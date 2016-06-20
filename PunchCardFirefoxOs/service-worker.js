// Taken from https://railrouter.sg/
self.addEventListener('install', function(event){
  console.log('Install');
});

self.addEventListener('activate', function(event){
  console.log('Activate');
  // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
  event.waitUntil(self.clients.claim());
});

var newCacheName = 'punchcard-cache-v9';
var oldCacheName = 'punchcard-cache-v8';
caches.delete(oldCacheName); // Delete the old one
console.log('caches.delete('+oldCacheName+')');
var successResponses = /^0|([123]\d\d)|(40[14567])|410$/;

function fetchAndCache(request){
  return fetch(request.clone()).then(function(response){
    if (request.method == 'GET' && response && successResponses.test(response.status) &&
        request.url.match(this.registration.scope) &&
        (response.type == 'basic' || /\.(js|png|ttf|woff|woff2)/i.test(request.url) ||
         /fonts\.googleapis\.com/i.test(request.url))){
      console.log('Cache', request.url);
      caches.open(newCacheName).then(function(cache){
        cache.put(request, response);
      });
    }
    return response;
  });
};

function cacheOnly(request){
  return caches.open(newCacheName).then(function(cache){
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
