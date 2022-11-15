'use strict';

import { InfoUI } from './info-ui.js';

// This only works as long as infojs is always called via one level of indirection,
// .info, .warn, .error, .timeEnd
let ERROR_STACK_INDEX = navigator.userAgent.match(/Firefox/i) ? 2 : 3;

let times = {};

function getAllPropertyNames(obj, props = []) {
  // console.log(obj.constructor.name, props);
  if (obj.constructor.name == 'Object') {
    // console.log(obj.constructor.name, props);
    return props.length ? props : null;
    // return props;
  } else {
    // console.log(obj, props);
    return getAllPropertyNames(Object.getPrototypeOf(obj), props.concat(Object.getOwnPropertyNames(obj)));
  }
}

export let time = (label) => {
  if (localStorage.getItem('info-performance')) {
    times[label] = [
      (new Error).stack.match(/(@|at\s+)(.+:\d+:\d+)/)[2],
      Date.now()
    ];
  }
}

export let timeEnd = (label) => {
  if (localStorage.getItem('info-performance')) {
    if (times[label]) {
      _infojs(`${label}: ${Date.now() - (times[label])[1]}ms`);
    }
    else {
      _infojs(`Timer '${label}' does not exist`);
    }
  }
}

export let error = (info, element, append) => {
  _infojs(info, element, append);
}

export let info = (info, element, append) => {
  if (localStorage.getItem('info-information')) {
    _infojs(info, element, append);
  }
}

export let infojs = (info, element, append) => {
  _infojs(info, element, append);
}

export let warn = (info, element, append) => {
  if (localStorage.getItem('info-warning')) {
    _infojs(info, element, append);
  }
}

function _infojs(info, element, append) {
  let niu;
  let where = (new Error).stack.split('\n')[ERROR_STACK_INDEX].replace(/\s+at\s+/, '');
  where = where.replace(localStorage.getItem('serviceworker-scope'), '');
  try {
    niu = new InfoUI();
    if (!element) {
      element = document.getElementById('info');
      element.parentElement.style.left = '0';
      element.parentElement.style.right = '0';
      element.parentElement.style.top = '10%';
      element.parentElement.style.position = 'absolute';
      element.parentElement.firstElementChild.addEventListener('click', function(event) {
        event.preventDefault();
        element.parentElement.style.transition = 'top 0.5s';
        element.parentElement.style.top = '100%';
        window.setTimeout(() => {
          event.target.parentElement.style.position = null;
          element.parentElement.style.transition = null;
        }, 1000);
      });
    }
    if (niu instanceof InfoUI && 'textContent' in niu) {
      if (typeof info == 'string') {
        niu.textContent = `"${where}@${(new Date).toJSON()}": ${info}`;
      }
      else {
        niu.textContent = `"${where}@${(new Date).toJSON()}": ${JSON.stringify(info, getAllPropertyNames(info), 2)}`;
      }
      if (append) {
        element.appendChild(niu);
      }
      else {
        element.insertBefore(niu, element.firstElementChild);
      }
    }
    else {
      window.alert(`"${where}@${(new Date).toJSON()}": ${JSON.stringify(info, getAllPropertyNames(info), 2)}`);
    }
  }
  catch (e) {
    // window.alert(niu && niu.textContent);
    window.alert(JSON.stringify(e, getAllPropertyNames(e), 2));
  }
};
