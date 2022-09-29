'use strict';

import { InfoUI } from './info-ui.js';

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

export function infojs(info, element, append) {
  let niu;
  try {
    niu = new InfoUI();
    if (niu instanceof InfoUI && 'textContent' in niu && element) {
      niu.textContent = `"${(new Date).toJSON()}": ${JSON.stringify(info, getAllPropertyNames(info), 2)}`;
      if (append) {
        element.appendChild(niu);
      }
      else {
        element.insertBefore(niu, element.firstElementChild);
      }
    }
    else {
      window.alert(`"${(new Date).toJSON()}": ${JSON.stringify(info, getAllPropertyNames(info), 2)}`);
    }
  }
  catch (e) {
    // window.alert(niu && niu.textContent);
    window.alert(JSON.stringify(e, getAllPropertyNames(e), 2));
  }
};
