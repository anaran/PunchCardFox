'use strict';
export function infojs(info, element) {
  try {
    var pre = document.createElement('pre');
    pre.classList.add('info');
    pre.contentEditable = true;
    // Does not work, set attribute instead.
    // pre.readOnly = true;
    pre.setAttribute('readonly', true);
    pre.textContent = JSON.stringify(info, info instanceof Error ? Object.getOwnPropertyNames(info) : null, 2);
    element.insertBefore(pre, element.firstElementChild);
  }
  catch (e) {
    window.alert(JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
  }
};
