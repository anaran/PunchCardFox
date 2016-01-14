'use strict';
try {
  define(function(require) {
    return function (info, element) {
      try {
        var pre = document.createElement('pre');
        pre.classList.add('info');
        pre.contentEditable = true;
        // Does not work, set attribute instead.
        // pre.readOnly = true;
        pre.setAttribute('readonly', true);
        pre.textContent = JSON.stringify(info, Object.getOwnPropertyNames(info), 2);
        element.insertBefore(pre, element.firstElementChild);
      }
      catch (e) {
        window.alert(JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
      }
    };
  });
}
catch (e) {
  window.alert(JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
}
