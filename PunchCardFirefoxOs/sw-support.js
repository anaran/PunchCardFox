'use strict';

import { infojs } from './js/app/info.js';

let TIME = false;
let DEBUG = false;
let times = [];
let cachedVersion = undefined;

if ('serviceWorker' in navigator) {
  document.addEventListener('readystatechange', function (event) {
    if (document.readyState == 'complete') {
      let infoNode = document.getElementById('replication_info');
      // DEBUG && console.log('Document Ready navigator.serviceWorker.controller: ', navigator.serviceWorker.controller);
      // navigator.serviceWorker.ready.then(res => {
      //   DEBUG && console.log('SERVICEWORKER READY', res);
      // }).catch(err => {
      //   DEBUG && console.log('ready should never fail');
      // });
      TIME && times.push([(new Error).stack.match(/(@|at\s+)(.+:\d+:\d+)/)[2], Date.now()]);
      let sw = '../service-worker.js';
      navigator.serviceWorker.register(sw, {
        scope: '../'
      }).then(function(registration) {
        DEBUG && console.log('ServiceWorker registration successful: ', registration);
        if(registration.installing) {
          DEBUG && console.log('Service worker installing', registration.installing);
        } else if(registration.waiting) {
          DEBUG && console.log('Service worker (installed and) waiting', registration.waiting);
        } else if(registration.active) {
          DEBUG && console.log('Service worker active', registration.active);
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
          // if (navigator.serviceWorker.controller) {
          // }
          // else {
          //   // DEBUG && console.log('NO CONTROLLER', registration);
          // }
        }
        // DEBUG && console.log('Register navigator.serviceWorker.controller: ', navigator.serviceWorker.controller);
      }).catch(err => {
        DEBUG && console.log('registration failed with error: ', err);
      });
      // navigator.serviceWorker.addEventListener('controllerchange', function(e) {
      //   DEBUG && console.log(`[ServiceWorker] : controllerchange`, e);
      //   navigator.serviceWorker.controller.addEventListener('statechange', function(e) {
      //     DEBUG && console.log(`[ServiceWorker] statechange ${e.target.state}`, e);
      //   });
      // });
      navigator.serviceWorker.addEventListener('message', function(e) {
        let infoNode = document.getElementById('replication_info');
        TIME && times.reduce((prevValue, currValue, currIndex, object) => {
          infojs(
            `${(currValue[1] - prevValue[1])/1000} seconds spent from ${prevValue[0]} to ${currValue[0]}`,
            infoNode);
          return currValue;
        });
        DEBUG && console.log(`ServiceWorker message received: `, e);
        DEBUG && infojs(e.data, infoNode);
        switch (e.data.request) {
        case 'caches': {
          JSON.parse(e.data.message).forEach((value, index, object) => {
            let checkbox = document.createElement('input');
            checkbox.className = 'cacheName';
            checkbox.type = 'checkbox';
            checkbox.id = value;
            checkbox.checked = localStorage.getItem('cachedVersion') == value;
            let label = document.createElement('label');
            label.for = checkbox.id;
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
            checkbox.addEventListener('contextmenu', (event) => {
              event.preventDefault();
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
            document.getElementById('view-punchcard-list').appendChild(checkbox);
            document.getElementById('view-punchcard-list').appendChild(label);
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
                document.getElementById('view-punchcard-list').removeChild(value.nextSibling);
                document.getElementById('view-punchcard-list').removeChild(value);
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
          document.getElementById('view-punchcard-list').appendChild(deleteButton);
          document.getElementById('view-punchcard-list').appendChild(useCacheButton);
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
