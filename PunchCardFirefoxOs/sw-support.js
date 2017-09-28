'use strict';

import './bower_components/pouchdb/dist/pouchdb.min.js';
import './bower_components/marked/lib/marked.js';
import { infojs } from './js/app/info-module.js';

if ('serviceWorker' in navigator) {
  document.addEventListener('readystatechange', function (event) {
    if (document.readyState == 'complete') {
      let infoNode = document.getElementById('replication_info');
      console.log('Document Ready navigator.serviceWorker.controller: ', navigator.serviceWorker.controller);
      navigator.serviceWorker.ready.then(res => {
        console.log('SERVICEWORKER READY', res);
      }).catch(err => {
        console.log('ready should never fail');
      });
      let optionsDB = new PouchDB('options');
      optionsDB.get('update_app').then(doc => {
        let sw = doc.value ? '../service-worker.js' : '../service-worker-no-install.js';
        navigator.serviceWorker.register(sw, {
          scope: '../'
        }).then(function(registration){
          console.log('ServiceWorker registration successful: ', registration);
          if(registration.installing) {
            console.log('Service worker installing');
          } else if(registration.waiting) {
            console.log('Service worker (installed and) waiting');
          } else if(registration.active) {
            console.log('Service worker active');
          }
          console.log('Register navigator.serviceWorker.controller: ', navigator.serviceWorker.controller);
        }).catch(err => {
          console.log('registration failed with error: ', err);
        });
      }).catch(err => {
          console.log('optionsDB.get error: ', err);
        });
      navigator.serviceWorker.addEventListener('controllerchange', function(e) {
        // let optionsDB = new PouchDB('options');
        // optionsDB.get('update_app').then(doc => {
        //   navigator.serviceWorker.controller.postMessage({
        //     request: 'update',
        //     message: doc.value,
        //     where: 'controllerchange'
        //   });
        // });
        console.log(`[ServiceWorker] : controllerchange`, e);
        navigator.serviceWorker.controller.addEventListener('statechange', function(e) {
          // let optionsDB = new PouchDB('options');
          // optionsDB.get('update_app').then(doc => {
          //   navigator.serviceWorker.controller.postMessage({
          //     request: 'update',
          //     message: doc.value,
          //     where: 'statechange'
          //   });
          console.log(`[ServiceWorker] statechange`, e);

        });
      });
      navigator.serviceWorker.addEventListener('message', function(e) {
        console.log(`ServiceWorker message received: `, e);
        infojs(e.data, infoNode);
        switch (e.data.request) {
        case 'version': {
          document.querySelector('gaia-header>h1').textContent = e.data.message;
          break;
        }
        case 'update': {
          let optionsDB = new PouchDB('options');
          optionsDB.get('update_app').then(doc => {
            e.source.postMessage({
              request: 'update',
              message: doc.value
            });
          });
          break;
        }
        }
      });
      // .catch(err => {
      //   console.log('ServiceWorker ready setup failed: ', err);
      // });
      // return navigator.serviceWorker.ready;
      // window.serviceWorker.onMessage = function(e) {
      //   if (e.data.reply && e.data.reply == 'version') {
      //     document.querySelector('gaia-header>h1').textContent = e.data.message;
      //   }
      // };
      // See https://github.com/mozilla/serviceworker-cookbook/blob/master/message-relay/index.js
      // Listen for any messages from the service worker.
    }
  });
}
