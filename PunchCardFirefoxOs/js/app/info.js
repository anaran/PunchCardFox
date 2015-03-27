'use strict';
try {
  define(function(require) {
    return function (info, element) {
      var pre = document.createElement('pre');
      pre.classList.add('info');
      pre.contentEditable = true;
      // Does not work, set attribute instead.
      // pre.readOnly = true;
      pre.setAttribute('readonly', true);
      pre.textContent = JSON.stringify(info, null, 2);
      element.insertBefore(pre, element.firstElementChild);
    };
  });
}
catch (e) {
  window.alert(e.message + '\n' + e.stack);
}
