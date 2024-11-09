'use strict';

import { InfoUI } from './info-ui.js';

// This only works as long as infojs is always called via one level of indirection,
// .info, .warn, .error, .timeEnd
let ERROR_STACK_INDEX = navigator.userAgent.match(/Firefox/i) ? 2 : 3;

let times = {};

function getAllPropertyNames(obj, props = []) {
  if (typeof obj == 'undefined'
      || obj.constructor.name == 'Object') {
    return props;
  } else {
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
      _infojs(`${label}: ${Date.now() - (times[label])[1]}ms`, undefined, undefined, 'perf');
    }
    else {
      _infojs(`Timer '${label}' does not exist`, undefined, undefined, 'perf');
    }
  }
}

export let error = (error, element, append) => {
  _infojs(error, element, append, 'error');
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
  let stringified = info;
  try {
    niu = new InfoUI();
    if (type) {
      niu.classList.add(type);
    }
    if (!element) {
      place = document.getElementById('info');
    }
  }
  catch (e) {
    window.prompt('copy/paste info', `"${where}@${(new Date).toJSON()}": ${e}`);
  }
  try {
    let props = getAllPropertyNames(info);
    if (typeof info != 'string') {
      if (props.length) {
        stringified = `in ${info.constructor.name} `+ JSON.stringify(info, props, 2);
      }
      else {
        stringified = `in ${info.constructor.name} `+ JSON.stringify(info, null, 2);
      }
      // When using a regular expression search value, it must be global.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll#non-global_regex_throws
      stringified = stringified.replaceAll(
        new RegExp(localStorage.getItem('serviceworker-scope') + '([^"])', 'g'),
        '$1');
      stringified = stringified.replaceAll('\\n', '\n');
    }
  }
  catch (e) {
    if (niu instanceof InfoUI && 'textContent' in niu) {
      niu.textContent = `"${where}@${(new Date).toJSON()}": ${e}`;
      niu.classList.replace(type, 'error');
      if (append) {
        place.insertAdjacentElement('beforerend', niu);
      }
      else {
        place.insertAdjacentElement('afterbegin', niu);
      }
      if (!element && niu.classList.contains('error')
          && !document.getElementById('cb2').checked) {
        document.getElementById('cb2').checked = true;
        place.parentElement.style.zIndex = '1';
        niu.scrollIntoView();
      }
    }
    return;
  }
  if (niu instanceof InfoUI && 'textContent' in niu) {
    niu.textContent = `"${where}@${(new Date).toJSON()}": ${stringified}`;
    if (append) {
      place.insertAdjacentElement('beforerend', niu);
    }
    else {
      place.insertAdjacentElement('afterbegin', niu);
    }
    if (!element && niu.classList.contains('error')
          && !document.getElementById('cb2').checked) {
      document.getElementById('cb2').checked = true;
      place.parentElement.style.zIndex = '1';
      niu.scrollIntoView();
    }
  }
}
