'use strict';

import * as infojs from './js/app/info.js';
import { HeaderUI } from './js/app/header-ui.js';

let cachedVersion = undefined;

if ('serviceWorker' in navigator) {

    // (async () => {
    //   const registration = await navigator.serviceWorker.getRegistration();
    //   if (registration) {
    //     registration.addEventListener("updatefound", () => {
    //       infojs.info("Service Worker update found!");
    //       // console.log("Service Worker update found!");
    //     });
    //   }
    // })();

  function invokeServiceWorkerUpdateFlow(registration) {
    // TODO implement your own UI notification element
    // if (window.confirm("New version of the app is available. Refresh now?")) {
      if (registration.waiting) {
        // let waiting Service Worker know it should became active
        registration.waiting.postMessage({
          request: 'SKIP_WAITING'
        });
      // }
    }
  }

  infojs.time('sw-support.js load');
  window.addEventListener('load', async (event) => {
    infojs.timeEnd('sw-support.js load');
    let infoNode = document.getElementById('replication_info');
    let sw = 'service-worker.js';
    const registration = await navigator.serviceWorker.register(sw, {
      scope: '.',
      type: 'module'
    });
    infojs.info('ServiceWorker registration successful', infoNode);
    infojs.info(registration, infoNode);
    localStorage.setItem('serviceworker-scope', registration.scope);
    if (registration.active) {
      registration.active.postMessage({
        request: 'caches'
      });
      cachedVersion = localStorage.getItem('cachedVersion');
      if (cachedVersion) {
        registration.active.postMessage({
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
    // ensure the case when the updatefound event was missed is also handled
    // by re-invoking the prompt when there's a waiting Service Worker
    if (registration.waiting) {
      invokeServiceWorkerUpdateFlow(registration)
    }

    // detect Service Worker update available and wait for it to become installed
    registration.addEventListener('updatefound', () => {
      if (registration.installing) {
        // wait until the new Service worker is actually installed (ready to take over)
        registration.installing.addEventListener('statechange', () => {
          if (registration.waiting) {
            // if there's an existing controller (previous Service Worker), show the prompt
            if (navigator.serviceWorker.controller) {
              invokeServiceWorkerUpdateFlow(registration)
            } else {
              // otherwise it's the first install, nothing to do
              console.log('Service Worker initialized for the first time')
            }
          }
        })
      }
    });

    // if(registration.installing) {
    //   infojs.info('ServiceWorker installing', infoNode);
    //   infojs.info(registration.installing, infoNode);
    // } else if(registration.waiting) {
    //   infojs.info('ServiceWorker (installed and) waiting', infoNode);
    //   infojs.info(registration.waiting, infoNode);
    //   invokeServiceWorkerUpdateFlow(registration);
    // } else if(registration.active) {
    //   infojs.info('ServiceWorker active', infoNode);
    //   infojs.info(registration.active, infoNode);
    //   registration.active.postMessage({
    //     request: 'caches'
    //   });
    //   cachedVersion = localStorage.getItem('cachedVersion');
    //   if (cachedVersion) {
    //     navigator.serviceWorker.controller.postMessage({
    //       request: 'use cache',
    //       cache: cachedVersion
    //     });
    //   }
    //   else {
    //     registration.active.postMessage({
    //       request: 'version'
    //     });
    //   }
    // }
    // }).catch(err => {
    //   infojs.infojs('Service-Worker registration failed with error', infoNode);
    //   infojs.error(err, infoNode);
    // });
    navigator.serviceWorker.addEventListener('controllerchange', function(e) {
      // Offer user to refresh to cache newly claimed version of ServiceWorker.
      // document.querySelector('span.app_title').textContent = e.data.message;
      // let reload = window.confirm(`Press OK to reload app to fetch and cache new version ${e.data.message}.\n\nPress Cancel, pick a cache and press (Use selected cache) to stay with your preferred version after the next reload`);
      // if (reload) {
      let refreshed = false;
      if (!refreshed) {
        window.location.reload();
        refreshed = true;
      }
      // else {
      //   let bottom = document.getElementById('bottom');
      //   bottom.scrollIntoView({block: "center", inline: "center"});
      // }
      //   infojs.info(`[ServiceWorker] : controllerchange`);
      //   infojs.info(e);
      //   navigator.serviceWorker.controller.addEventListener('statechange', function(e) {
      //     infojs.info(`[ServiceWorker] statechange ${e.target.state}`)
      //     infojs.info(e);
      //   });
    });
    navigator.serviceWorker.addEventListener('message', function(e) {
      let infoNode = document.getElementById('replication_info');
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
          cacheContainer.appendChild(checkbox);
          cacheContainer.appendChild(label);
          cacheVersions.appendChild(cacheContainer);
        });
        cacheVersions.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          event.stopPropagation();
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
        let deleteButton = document.createElement('input');
        deleteButton.className = 'cacheName';
        deleteButton.type = 'button';
        deleteButton.value = 'Delete selected caches';
        deleteButton.addEventListener('click', (event) => {
          event.preventDefault();
          Array.prototype.forEach.call(document.querySelectorAll('input.cacheName[type=checkbox]'), (value) => {
            if (value.checked) {
              infojs.info(navigator.serviceWorker.controller);
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
        // case 'claim': {
        //   // Offer user to refresh to cache newly claimed version of ServiceWorker.
        //   document.querySelector('span.app_title').textContent = e.data.message;
        //   let reload = window.confirm(`Press OK to reload app to fetch and cache new version ${e.data.message}.\n\nPress Cancel, pick a cache and press (Use selected cache) to stay with your preferred version after the next reload`);
        //   if (reload) {
        //     document.location.reload();
        //   }
        //   else {
        //     let bottom = document.getElementById('bottom');
        //     bottom.scrollIntoView({block: "center", inline: "center"});
        //   }
        //   break;
        // }
      case 'error': {
        infojs.error(e.data, infoNode);
        break;
      }
      case 'info': {
        infojs.info(e.data, infoNode);
        break;
      }
      case 'version': {
        document.querySelector('header-ui').title = e.data.message;
        break;
      }
      }
    });
    // }
  });
}
