'use strict';

import { InfoUI } from './info-ui.js';

// This only works as long as infojs is always called via one level of indirection,
// .info, .warn, .error, .timeEnd
let ERROR_STACK_INDEX = navigator.userAgent.match(/Firefox/i) ? 2 : 3;

let times = {};

function getAllPropertyNames(obj, props = []) {
  if (typeof obj == 'undefined') {
    return obj;
  } else if (obj.constructor.name == 'Object') {
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

export let error = (error, element, append) => {
  if (error instanceof Error) {
    _infojs(`\nname: ${error.name}\nmessage: ${error.message}\nstack: ${error.stack}\n`, element, append, 'error');
  }
  else {
    _infojs(error, element, append, 'error');
  }
}

export let info = (info, element, append, type) => {
  if (localStorage.getItem('info-information')) {
    _infojs(info, element, append, type);
  }
}

export let infojs = (info, element, append) => {
  _infojs(info, element, append);
}

export let warn = (info, element, append) => {
  if (localStorage.getItem('info-warning')) {
    _infojs(info, element, append, 'warning');
  }
}

function _infojs(info, element, append, type) {
  let niu;
  let where = (new Error).stack.split('\n')[ERROR_STACK_INDEX].replace(/\s+at\s+/, '');
  let place = element;
  where = where.replace(localStorage.getItem('serviceworker-scope'), '');
  try {
    niu = new InfoUI();
    if (type) {
      niu.classList.add(type);
    }
    if (!element) {
      place = document.getElementById('info');
    }
    if (niu instanceof InfoUI && 'textContent' in niu) {
      if (typeof info == 'string') {
        niu.textContent = `"${where}@${(new Date).toJSON()}": ${info}`;
      }
      else {
        niu.textContent = `"${where}@${(new Date).toJSON()}": ${JSON.stringify(info, getAllPropertyNames(info), 2)}`;
      }
      if (append) {
        place.insertAdjacentElement('beforerend', niu);
      }
      else {
        place.insertAdjacentElement('afterbegin', niu);
      }
      if (!element && type) {
        document.getElementById('cb2').checked = true;
        place.parentElement.style.zIndex = '2';
        niu.scrollIntoView();
      }
    }
    else {
      window.prompt('debug info', `"${where}@${(new Date).toJSON()}": ${JSON.stringify(info, getAllPropertyNames(info), 2)}`);
    }
  }
  catch (e) {
    // window.alert(niu && niu.textContent);
    window.prompt('catch debug info', JSON.stringify(e, getAllPropertyNames(e), 2));
  }
};
