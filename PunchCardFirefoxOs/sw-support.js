'use strict';

import './bower_components/pouchdb/dist/pouchdb.min.js';
// import './bower_components/pouchdb/dist/pouchdb.js';
import { infojs } from './js/app/info.js';

let TIME = true;
let times = [];

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
      // TODO: This is responsible for reload slowness in Brave browser on Android (fast in fennec).
      TIME && times.push([(new Error).stack.match(/(@|at\s+)(.+:\d+:\d+)/)[2], Date.now()]);
      console.time("new PouchDB('options').info();");
      let optionsDB = new PouchDB('options', { skip_setup: true });
      optionsDB.info().then(function (info) {
        console.timeEnd("new PouchDB('options').info();");
        TIME && times.push([(new Error).stack.match(/(@|at\s+)(.+:\d+:\d+)/)[2], Date.now()]);
      }).catch(function (err) {
        // infojs(err, infoNode);
        console.log(err);
        // handle err
      });
      // optionsDB.allDocs({include_docs:true}).then(function (info) {
      //   console.timeEnd("new PouchDB('options');");
      //   console.log(info);
      // }).catch(function (err) {
      //   console.log(err);
      //   // handle err
      // });
      optionsDB.get('update_app').then(doc => {
        // console.timeEnd("new PouchDB('options');");
        // let doc = { value: true };
        let sw = doc.value ? '../service-worker.js' : '../service-worker-no-install.js';
        navigator.serviceWorker.register(sw, {
          scope: '../'
        }).then(function(registration) {
          console.log('ServiceWorker registration successful: ', registration);
          if(registration.installing) {
            console.log('Service worker installing');
          } else if(registration.waiting) {
            console.log('Service worker (installed and) waiting');
          } else if(registration.active) {
            console.log('Service worker active');
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                request: 'version'
              });
            }
            else {
              console.log('NO CONTROLLER', registration);
            }
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
        let infoNode = document.getElementById('replication_info');
        TIME && times.reduce((prevValue, currValue, currIndex, object) => {
          infojs(
            `${(currValue[1] - prevValue[1])/1000} seconds spent between ${prevValue[0]} and ${currValue[0]}`,
            infoNode);
          return currValue;
        });
        console.log(`ServiceWorker message received: `, e);
        infojs(e.data, infoNode);
        switch (e.data.request) {
        case 'version': {
          document.getElementById('app_header').firstChild.textContent = e.data.message;
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
    }
  });
}
