'use strict';

import * as infojs from './js/app/info.js';

let cachedVersion = undefined;

if ('serviceWorker' in navigator) {
  document.addEventListener('readystatechange', function (event) {
    infojs.time('readystatechange');
    if (document.readyState == 'complete') {
      let infoNode = document.getElementById('replication_info');
      infojs.time('complete');
      let sw = '../service-worker.js';
      navigator.serviceWorker.register(sw, {
        scope: '../',
        type: 'module'
      }).then(function(registration) {
        infojs.info('ServiceWorker registration successful', infoNode);
        infojs.info(registration, infoNode);
        localStorage.setItem('serviceworker-scope', registration.scope);
        if(registration.installing) {
          infojs.info('ServiceWorker installing', infoNode);
          infojs.info(registration.installing, infoNode);
        } else if(registration.waiting) {
          infojs.info('ServiceWorker (installed and) waiting', infoNode);
          infojs.info(registration.waiting, infoNode);
        } else if(registration.active) {
          infojs.info('ServiceWorker active', infoNode);
          infojs.info(registration.active, infoNode);
          registration.active.postMessage({
            request: 'caches'
          });
          cachedVersion = localStorage.getItem('cachedVersion');
          if (cachedVersion) {
            navigator.serviceWorker.controller.postMessage({
              request: 'use cache',
              cache: cachedVersion
            });
          }
          else {
            registration.active.postMessage({
              request: 'version'
            });
          }
        }
      }).catch(err => {
        infojs.infojs('Service-Worker registration failed with error', infoNode);
        infojs.error(err, infoNode);
      });
      // navigator.serviceWorker.addEventListener('controllerchange', function(e) {
      //   console.log(`[ServiceWorker] : controllerchange`, e);
      //   navigator.serviceWorker.controller.addEventListener('statechange', function(e) {
      //     console.log(`[ServiceWorker] statechange ${e.target.state}`, e);
      //   });
      // });
      navigator.serviceWorker.addEventListener('message', function(e) {
        let infoNode = document.getElementById('replication_info');
        infojs.timeEnd('readystatechange');
        infojs.timeEnd('complete');
        infojs.info(e.data, infoNode);
        switch (e.data.request) {
        case 'caches': {
          let cacheVersions = document.getElementById('cache_versions');
          JSON.parse(e.data.message).forEach((value, index, object) => {
            let cacheContainer = document.createElement('div');
            let checkbox = document.createElement('input');
            checkbox.className = 'cacheName';
            checkbox.type = 'checkbox';
            checkbox.id = value;
            checkbox.checked = localStorage.getItem('cachedVersion') == value;
            let label = document.createElement('label');
            label.setAttribute('for', checkbox.id);
            label.textContent = value;
            checkbox.addEventListener('click', (event) => {
              if (event.target.checked) {
                event.target.setAttribute('checked', true);
                event.target.checked = true;
              }
              else {
                event.target.removeAttribute('checked');
                event.target.checked = false;
              }
            });
            cacheVersions.addEventListener('contextmenu', (event) => {
              // event.preventDefault();
              Array.prototype.forEach.call(document.querySelectorAll('input.cacheName[type=checkbox]'), (value) => {
                value.checked = !value.checked;
                if (value.checked) {
                  value.setAttribute('checked', true);
                }
                else {
                  value.removeAttribute('checked');
                }
              });
            });
            cacheContainer.appendChild(checkbox);
            cacheContainer.appendChild(label);
            cacheVersions.appendChild(cacheContainer);
          });
          let deleteButton = document.createElement('input');
          deleteButton.className = 'cacheName';
          deleteButton.type = 'button';
          deleteButton.value = 'Delete selected caches';
          deleteButton.addEventListener('click', (event) => {
            event.preventDefault();
            Array.prototype.forEach.call(document.querySelectorAll('input.cacheName[type=checkbox]'), (value) => {
              if (value.checked) {
                navigator.serviceWorker.controller.postMessage({
                  request: 'delete cache',
                  cache: value.id
                });
                cacheVersions.removeChild(value.parentElement);
              }
            });
          });
          let useCacheButton = document.createElement('input');
          useCacheButton.className = 'cacheName';
          useCacheButton.type = 'button';
          useCacheButton.value = 'Use selected cache';
          useCacheButton.addEventListener('click', (event) => {
            event.preventDefault();
            let cacheCheckbox = document.querySelectorAll('input.cacheName[type=checkbox][checked]');
            switch (cacheCheckbox.length) {
            case 0: {
              navigator.serviceWorker.controller.postMessage({
                request: 'use cache',
                cache: undefined
              });
              localStorage.removeItem('cachedVersion');
              break;
            }
            case 1: {
              navigator.serviceWorker.controller.postMessage({
                request: 'use cache',
                cache: cacheCheckbox[0].id
              });
              localStorage.setItem('cachedVersion', cacheCheckbox[0].id);
              break;
            }
            default: {
              alert('cannot use multiple caches!');
              break;
            }
            }
          });
          cacheVersions.appendChild(deleteButton);
          cacheVersions.appendChild(useCacheButton);
          break;
        }
        case 'claim': {
          // Offer user to refresh to cache newly claimed version of ServiceWorker.
          document.querySelector('span.app_title').textContent = e.data.message;
          let reload = window.confirm(`Press OK to reload app to fetch and cache new version ${e.data.message}.\n\nPress Cancel, pick a cache and press (Use selected cache) to stay with your preferred version after the next reload`);
          if (reload) {
            document.location.reload();
          }
          else {
            let bottom = document.getElementById('bottom');
            bottom.scrollIntoView({block: "center", inline: "center"});
          }
          break;
        }
        case 'error': {
          // Nothing to be done here since infojs is already called before switch statement.
          // let infoNode = document.getElementById('replication_info');
          // infojs(e.data.message, infoNode);
          break;
        }
        case 'version': {
          document.querySelector('span.app_title').textContent = e.data.message;
          break;
        }
        }
      });
    }
  });
}
