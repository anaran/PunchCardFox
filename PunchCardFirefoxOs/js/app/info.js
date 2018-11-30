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
  let pre;
  try {
    pre = new InfoUI();
    if (pre instanceof InfoUI && 'textContent' in pre) {
      pre.textContent = `"${(new Date).toJSON()}": ${JSON.stringify(info, getAllPropertyNames(info), 2)}`;
      if (append) {
        element.appendChild(pre);
      }
      else {
        element.insertBefore(pre, element.firstElementChild);
      }
    }
    else {
      window.alert(`"${(new Date).toJSON()}": ${JSON.stringify(info, getAllPropertyNames(info), 2)}`);
    }
  }
  catch (e) {
    // window.alert(pre && pre.textContent);
    window.alert(JSON.stringify(e, getAllPropertyNames(e), 2));
  }
};
